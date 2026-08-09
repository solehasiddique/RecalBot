// ============================================
// admin.js — shared across all admin pages
// ============================================

const API = window.BASE_URL;

// ── AUTH GUARD ──
// Call this at top of every admin page
async function requireAdmin() {
  try {
    const res = await fetch(`${API}/api/auth/profile`, { credentials: "include" });
    if (!res.ok) { redirect(); return null; }
    const data = await res.json();
    const user = data.user || data;
    if (user.role !== "admin") { redirect(); return null; }
    return user;
  } catch {
    redirect();
    return null;
  }
}

function redirect() {
  window.location.href = "../html/signin.html";
}

// ── LOGOUT ──
async function logout() {
  await fetch(`${API}/api/auth/logout`, { method: "POST", credentials: "include" });
  window.location.href = "../html/signin.html";
}


// ── FETCH HELPERS ──
async function fetchStats() {
  const res = await fetch(`${API}/api/admin/stats`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load stats");
  return res.json();
}

async function fetchUsers() {
  const res = await fetch(`${API}/api/admin/users`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load users");
  return res.json();
}

async function fetchUserDetail(id) {
  const res = await fetch(`${API}/api/admin/user/${id}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load user");
  return res.json();
}

async function fetchMemoryAnalytics() {
  const res = await fetch(`${API}/api/admin/memory-analytics`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load memory analytics");
  return res.json();
}

// ── BADGE HELPER ──
function profileBadge(profile) {
  if (!profile) return '<span style="color:#999">—</span>';
  const p = profile.toUpperCase();
  const styles = {
    WEAK:   "background:#fde8e8;color:#D9534F",
    MEDIUM: "background:#fef6e0;color:#b07d10",
    STRONG: "background:#e0f5ea;color:#2a7a4e"
  };
  const style = styles[p] || "background:#eee;color:#555";
  return `<span style="${style};padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700">${p}</span>`;
}

// ── DATE HELPER ──
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// ── MODAL ──
function openModal(html, title = "User Detail") {
  let overlay = document.getElementById("adminModal");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "adminModal";
    overlay.style.cssText = `
      position:fixed;inset:0;background:rgba(55,85,52,0.4);
      z-index:999;display:flex;align-items:center;justify-content:center;
    `;
    overlay.innerHTML = `
      <div style="background:#fff;border-radius:16px;padding:28px;width:90%;max-width:580px;
                  max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.15);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <h3 id="modalTitle" style="font-size:17px;font-weight:700;color:#375534">${title}</h3>
          <button onclick="document.getElementById('adminModal').remove()"
            style="background:none;border:none;font-size:24px;cursor:pointer;color:#6B9071">×</button>
        </div>
        <div id="modalContent">${html}</div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });
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

// ── RUN ON PAGE LOAD ──
// We wait for DOMContentLoaded so the HTML elements exist before we try to fill them
// initAdminShell() runs the auth check — only after that passes do we load data
document.addEventListener("DOMContentLoaded", async () => {
  // Small delay to let adminShell finish auth before we start fetching
  setTimeout(async () => {
    await loadObservatoryStats();
    await loadRecentActivity();
  }, 300);
});
