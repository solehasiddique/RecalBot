
// ── LOAD RECENT ACTIVITY ──
async function loadRecentActivity() {
  try {
    // fetchUsers() already exists in admin.js
    // We take the 4 most recently signed up users as "recent activity"
    const data = await fetchUsers();
    const users = (data.users || []).slice(0, 4);

    const container = document.getElementById("recent-activity-list");
    if (!container || !users.length) return;

    // Clear the hardcoded fake activity items
    // Keep only the timeline line div (first child)
    const timelineLine = container.querySelector(".absolute");
    container.innerHTML = "";
    if (timelineLine) container.appendChild(timelineLine);

    // Icons and colors per memory profile
    const iconMap = {
      WEAK:   { icon: "warning",      bg: "bg-error-container",     color: "text-error"     },
      MEDIUM: { icon: "update",        bg: "bg-tertiary-container",  color: "text-tertiary"  },
      STRONG: { icon: "check_circle",  bg: "bg-secondary-container", color: "text-secondary" },
    };

    users.forEach(user => {
      const profile = (user.memoryProfile || "MEDIUM").toUpperCase();
      const { icon, bg, color } = iconMap[profile] || iconMap.MEDIUM;
      const joined = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
        : "Recently";

      const item = document.createElement("div");
      item.className = "relative flex gap-md group";
      item.innerHTML = `
        <div class="w-10 h-10 rounded-full ${bg} flex items-center justify-center z-10 shrink-0">
          <span class="material-symbols-outlined ${color} text-lg">${icon}</span>
        </div>
        <div>
          <p class="font-body-md text-on-surface">
            <span class="font-semibold">${user.name || "New User"}</span> joined RecallBot
          </p>
          <p class="text-label-md text-on-surface-variant">${joined} · Profile: ${profile}</p>
        </div>`;
      container.appendChild(item);
    });

  } catch (err) {
    console.error("Recent activity failed:", err);
  }
}

// ── CONNECT REAL BACKEND DATA ──
async function loadObservatoryStats() {
  try {
    // fetchStats() already exists in admin.js which loads before this file
    // It calls GET /api/admin/stats and returns the data
    const data = await fetchStats();

    // Populate the four stat cards with real numbers
    // We use toLocaleString() so 1204 displays as "1,204" automatically
    document.getElementById("stat-learners").textContent
      = (data.totalUsers ?? 0).toLocaleString();

    document.getElementById("stat-assessments").textContent
      = (data.assessmentDone ?? 0).toLocaleString();

    document.getElementById("stat-topics").textContent
      = (data.totalTopics ?? 0).toLocaleString();

    document.getElementById("stat-revisions").textContent
      = (data.totalRevisions ?? 0).toLocaleString();

  } catch (err) {
    console.error("Observatory stats failed:", err);
    // Leave the dashes in place — don't crash the page
  }
}


// ── RUN ON PAGE LOAD ──
// We wait for DOMContentLoaded so the HTML elements exist before we try to fill them
// initAdminShell() runs the auth check — only after that passes do we load data
document.addEventListener("DOMContentLoaded", async () => {
  // Search redirect
  document.getElementById("observatory-search")?.addEventListener("input", function() {
    const query = this.value.trim();
    if (query.length > 2) {
      window.location.href = `learners.html?search=${encodeURIComponent(query)}`;
    }
  });

  setTimeout(async () => {
    await loadObservatoryStats();
    await loadRecentActivity();
  }, 300);
});