// ============================================
// learners.js
// Connects the Learners Directory page to real backend data.
// Depends on admin.js being loaded first (fetchUsers, fetchUserDetail).
// ============================================

let allUsers = [];  // store all users so search can filter without re-fetching

// ── PROFILE BADGE ──
// Returns styled HTML based on memory profile
// Why: every row and drawer needs this, so one function keeps it consistent
function profileBadge(profile) {
  const p = (profile || "").toUpperCase();
  const map = {
    WEAK: {
      bg: "bg-error-container/20",
      text: "text-on-error-container",
      border: "border-error-container/30",
      dot: "bg-error",
      label: "Weak"
    },
    MEDIUM: {
      bg: "bg-surface-container",
      text: "text-on-surface-variant",
      border: "border-outline-variant/30",
      dot: "bg-outline",
      label: "Medium"
    },
    STRONG: {
      bg: "bg-secondary-container/20",
      text: "text-on-secondary-container",
      border: "border-secondary-container/30",
      dot: "bg-secondary",
      label: "Strong"
    }
  };
  const style = map[p] || map.MEDIUM;
  return `
    <span class="px-3 py-1 ${style.bg} ${style.text} text-label-md rounded-full border ${style.border} inline-flex items-center gap-1.5">
      <span class="w-1.5 h-1.5 rounded-full ${style.dot}"></span>
      ${style.label}
    </span>`;
}

// ── MEMORY SCORE BAR ──
// Returns HTML for the score bar shown in each table row
// Why: visual representation is faster to scan than a raw number
function scoreBar(percentage) {
  const pct = percentage ?? 0;
  // Color changes based on score — red for low, green for high
  const color = pct >= 70 ? "bg-primary" : pct >= 40 ? "bg-tertiary" : "bg-error";
  return `
    <div class="flex items-center gap-2">
      <div class="w-16 h-2 bg-surface-container rounded-full overflow-hidden">
        <div class="h-full ${color} rounded-full" style="width:${pct}%"></div>
      </div>
      <span class="font-semibold ${pct >= 70 ? "text-primary" : pct >= 40 ? "text-tertiary" : "text-error"}">${pct}%</span>
    </div>`;
}

// ── INITIAL AVATAR ──
// Shows first letter of name as avatar since we don't have photos
function avatarHTML(name) {
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  return `
    <div class="w-10 h-10 rounded-full bg-secondary-container/40 flex-shrink-0 flex items-center justify-center border-2 border-white shadow-sm">
      <span class="font-bold text-primary text-sm">${initial}</span>
    </div>`;
}

// ── RENDER TABLE ROWS ──
// Takes an array of users and builds real table rows
// Why: separating render from fetch means search can call this
// with filtered data without hitting the backend again
function renderTableRows(users) {
  const tbody = document.getElementById("learners-tbody");
  if (!tbody) return;

  if (!users.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="px-lg py-xl text-center text-on-surface-variant">
          No learners found.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = users.map(user => {
    const joined = user.createdAt
      ? new Date(user.createdAt).toLocaleDateString("en-IN", {
          day: "numeric", month: "short", year: "numeric"
        })
      : "—";

    const topicsCount = user.topicsCount ?? 0;
    const topicsLabel = topicsCount
      ? `<span class="text-[10px] px-2 py-0.5 bg-surface-container rounded-md text-on-surface-variant">${topicsCount} topic${topicsCount !== 1 ? "s" : ""}</span>`
      : `<span class="text-[10px] text-on-surface-variant">No topics yet</span>`;

    return `
      <tr class="hover:bg-surface transition-colors cursor-pointer group"
          onclick="openDrawer('${user._id}')">
        <td class="px-lg py-md">
          <div class="flex items-center gap-md">
            ${avatarHTML(user.name)}
            <div>
              <p class="font-body-md font-semibold text-primary">${user.name || "—"}</p>
              <p class="text-body-sm text-on-surface-variant">${user.email}</p>
            </div>
          </div>
        </td>
        <td class="px-lg py-md">${scoreBar(user.memoryPercentage)}</td>
        <td class="px-lg py-md">${profileBadge(user.memoryProfile)}</td>
        <td class="px-lg py-md">
          <div class="flex flex-wrap gap-1">${topicsLabel}</div>
        </td>
        <td class="px-lg py-md text-body-sm text-on-surface-variant">${joined}</td>
        <td class="px-lg py-md">
          <button onclick="event.stopPropagation(); openDrawer('${user._id}')"
                  class="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-all">
            <span class="material-symbols-outlined">open_in_new</span>
          </button>
        </td>
      </tr>`;
  }).join("");
}

// ── LOAD ALL USERS ──
// Fetches from /api/admin/users and populates table + stat cards
async function loadLearners() {
  try {
    const data = await fetchUsers();
    allUsers = data.users || [];

    // Update count display
    const countEl = document.getElementById("learner-count");
    if (countEl) countEl.textContent = `Showing ${allUsers.length} learners`;

    // Update stat cards
    const totalEl = document.getElementById("stat-total-learners");
    if (totalEl) totalEl.textContent = allUsers.length.toLocaleString();

    // Calculate average memory score across all users who have one
    const usersWithScore = allUsers.filter(u => u.memoryPercentage != null);
    if (usersWithScore.length) {
      const avg = usersWithScore.reduce((sum, u) => sum + u.memoryPercentage, 0) / usersWithScore.length;
      const avgEl = document.getElementById("stat-avg-score");
      if (avgEl) avgEl.textContent = avg.toFixed(1) + "%";
    }

    renderTableRows(allUsers);

  } catch (err) {
    console.error("Failed to load learners:", err);
    const tbody = document.getElementById("learners-tbody");
    if (tbody) tbody.innerHTML = `
      <tr>
        <td colspan="6" class="px-lg py-xl text-center text-error">
          Failed to load learners. Check your connection.
        </td>
      </tr>`;
  }
}

// ── SEARCH ──
// Filters the already-loaded allUsers array — no backend call needed
// Why: searching locally is instant. Backend search would add latency
// for every keystroke which feels sluggish
function setupSearch() {
  const input = document.getElementById("learner-search");
  if (!input) return;

  input.addEventListener("input", function () {
    const query = this.value.trim().toLowerCase();

    if (!query) {
      renderTableRows(allUsers);
      document.getElementById("learner-count").textContent =
        `Showing ${allUsers.length} learners`;
      return;
    }

    const filtered = allUsers.filter(u =>
      (u.name || "").toLowerCase().includes(query) ||
      (u.email || "").toLowerCase().includes(query) ||
      (u.memoryProfile || "").toLowerCase().includes(query)
    );

    renderTableRows(filtered);
    document.getElementById("learner-count").textContent =
      `Showing ${filtered.length} of ${allUsers.length} learners`;
  });
}

// ── OPEN DRAWER ──
// Called when a row is clicked — fetches that user's full detail
// and populates the drawer with real data
// Why: we don't load full detail for every user upfront (too slow).
// We only fetch detail when someone actually clicks a user.
async function openDrawer(userId) {
  // Show drawer immediately with loading state
  const drawer  = document.getElementById("user-drawer");
  const overlay = document.getElementById("drawer-overlay");

  drawer.classList.remove("translate-x-full");
  drawer.classList.add("translate-x-0");
  overlay.classList.remove("opacity-0", "pointer-events-none");
  document.body.style.overflow = "hidden";

  // Set loading state while fetch happens
  document.getElementById("drawer-name").textContent = "Loading...";
  document.getElementById("drawer-stats").innerHTML = `
    <div class="text-on-surface-variant text-body-sm">Fetching profile...</div>`;
  document.getElementById("drawer-activity").innerHTML = `
    <div class="text-on-surface-variant text-body-sm px-2">Loading activity...</div>`;

  try {
    const data = await fetchUserDetail(userId);
    const user = data.user;

    // ── Name + email ──
    document.getElementById("drawer-name").textContent = user.name || "—";

    // ── Stats row: revisions, topics, profile ──
    const stats = user.stats || {};
    document.getElementById("drawer-stats").innerHTML = `
      <div class="px-4 py-2 bg-surface-container-low rounded-xl">
        <p class="text-label-sm text-on-surface-variant uppercase">Revisions</p>
        <p class="font-bold text-primary">${stats.totalRevisions ?? 0}</p>
      </div>
      <div class="px-4 py-2 bg-surface-container-low rounded-xl">
        <p class="text-label-sm text-on-surface-variant uppercase">Completed</p>
        <p class="font-bold text-primary">${stats.completedRevisions ?? 0}</p>
      </div>
      <div class="px-4 py-2 bg-surface-container-low rounded-xl">
        <p class="text-label-sm text-on-surface-variant uppercase">Avg Score</p>
        <p class="font-bold text-primary">${stats.avgScore != null ? stats.avgScore + "%" : "—"}</p>
      </div>`;

    // ── Memory score bar ──
    const pct = user.memoryPercentage ?? 0;
    const scoreEl   = document.getElementById("drawer-memory-score");
    const fillEl    = document.getElementById("drawer-memory-fill");
    const profileEl = document.getElementById("drawer-profile-label");

    if (scoreEl)   scoreEl.textContent   = pct + "%";
    if (profileEl) profileEl.textContent = user.memoryProfile || "Not assessed";
    if (fillEl) {
      setTimeout(() => { fillEl.style.width = pct + "%"; }, 100);
      // Color the bar based on profile
      fillEl.className = fillEl.className.replace(/bg-\w+/, "");
      const barColor = (user.memoryProfile || "").toUpperCase() === "STRONG" ? "bg-primary"
                     : (user.memoryProfile || "").toUpperCase() === "MEDIUM" ? "bg-tertiary"
                     : "bg-error";
      fillEl.classList.add(barColor);
    }

    // ── Revision history as activity timeline ──
    const activityEl = document.getElementById("drawer-activity");
    const topics = user.topics || [];

    // Flatten all revisions across all topics into one list
    // Sort by most recent first so latest activity shows at top
    const revisions = topics.flatMap(t =>
      (t.revisions || []).map(r => ({ ...r, topicTitle: t.title }))
    ).sort((a, b) => new Date(b.completedAt || b.scheduledAt) - new Date(a.completedAt || a.scheduledAt))
     .slice(0, 5); // show latest 5 only

    if (!revisions.length) {
      activityEl.innerHTML = `
        <div class="text-on-surface-variant text-body-sm px-2">No revision activity yet.</div>`;
    } else {
      const iconMap = {
        completed: { icon: "check_circle",  bg: "bg-secondary-container", color: "text-primary" },
        missed:    { icon: "cancel",         bg: "bg-error-container",     color: "text-error"   },
        scheduled: { icon: "schedule",       bg: "bg-surface-container",   color: "text-on-surface-variant" },
      };

      activityEl.innerHTML = revisions.map(r => {
        const { icon, bg, color } = iconMap[r.status] || iconMap.scheduled;
        const date = r.completedAt || r.scheduledAt
          ? new Date(r.completedAt || r.scheduledAt).toLocaleDateString("en-IN", {
              day: "numeric", month: "short", year: "numeric"
            })
          : "—";
        const score = r.scoreAfterRevision != null ? ` · Score: ${r.scoreAfterRevision}%` : "";

        return `
          <div class="relative pl-10">
            <div class="absolute left-0 top-1 w-6 h-6 rounded-full ${bg} flex items-center justify-center border-2 border-white shadow-sm">
              <span class="material-symbols-outlined text-[14px] ${color}">${icon}</span>
            </div>
            <div class="bg-surface-container/20 p-md rounded-xl">
              <p class="font-semibold text-primary text-body-sm">${r.topicTitle}</p>
              <p class="text-body-sm text-on-surface-variant capitalize">${r.status}${score}</p>
              <p class="text-label-sm text-outline mt-1">${date}</p>
            </div>
          </div>`;
      }).join("");
    }

  } catch (err) {
    console.error("Failed to load user detail:", err);
    document.getElementById("drawer-name").textContent = "Failed to load";
    document.getElementById("drawer-activity").innerHTML = `
      <div class="text-error text-body-sm px-2">Could not fetch user data.</div>`;
  }
}

// ── CLOSE DRAWER ──
// Called by the close button and overlay click
function toggleDrawer() {
  const drawer  = document.getElementById("user-drawer");
  const overlay = document.getElementById("drawer-overlay");

  drawer.classList.add("translate-x-full");
  drawer.classList.remove("translate-x-0");
  overlay.classList.add("opacity-0", "pointer-events-none");
  document.body.style.overflow = "auto";
}

// ── INIT ──
document.addEventListener("DOMContentLoaded", async () => {
  // Small delay to let adminShell finish auth check first
  setTimeout(async () => {
    await loadLearners();
    setupSearch();
  }, 300);
});