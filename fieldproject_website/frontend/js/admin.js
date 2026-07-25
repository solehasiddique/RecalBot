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
