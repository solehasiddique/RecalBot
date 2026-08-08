// adminShell.js
// ONE source of truth for the admin sidebar + the auth gate.
// Every admin page loads this file and calls initAdminShell("<page-key>").
// It depends on admin.js being loaded first (uses requireAdmin() and logout()).

const ADMIN_NAV_ITEMS = [
  { key: "dashboard",           label: "Dashboard",          icon: "dashboard",  href: "admin.html" },
  { key: "learners",            label: "Learners",           icon: "groups",     href: "learners.html" },
  // NOTE: these two still use your CURRENT (mismatched-case) filenames on purpose.
  // Once you rename the files, this is the ONLY place you update — that's the
  // whole point of centralizing it. Before, that bug lived in 5 files.
  { key: "memory-analytics",    label: "Memory Analytics",   icon: "neurology",  href: "Memory_analytics.html" },
  { key: "research",            label: "Research",           icon: "science",    href: "research.html" },
];

function buildSidebarHTML(activeKey, user) {
  const activeClasses = "border-l-4 border-secondary text-primary font-bold bg-secondary-container/10";
  const idleClasses   = "text-on-surface-variant hover:text-primary hover:bg-secondary-container/10";

  const navLinks = ADMIN_NAV_ITEMS.map(item => `
    <a class="flex items-center gap-md px-lg py-md transition-colors ${item.key === activeKey ? activeClasses : idleClasses}"
       href="${item.href}">
      <span class="material-symbols-outlined">${item.icon}</span>
      <span class="font-body-md">${item.label}</span>
    </a>`).join("");

  const initial = (user?.name || "A").trim().charAt(0).toUpperCase();

  return `
    <div class="px-lg py-xl">
      <div class="flex items-center gap-md mb-xxxl">
        <div class="w-10 h-10 bg-primary flex items-center justify-center rounded-lg">
          <span class="material-symbols-outlined text-white">neurology</span>
        </div>
        <div>
          <h1 class="font-display-lg text-headline-sm font-bold text-primary">RecallBot</h1>
          <p class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Admin Console</p>
        </div>
      </div>
      <nav class="flex flex-col gap-xs">
        ${navLinks}
        <a class="flex items-center gap-md px-lg py-md text-on-surface-variant hover:text-primary hover:bg-secondary-container/10 transition-colors mt-xxl" href="#">
          <span class="material-symbols-outlined">settings</span>
          <span class="font-body-md">Settings</span>
        </a>
      </nav>
    </div>
    <div class="mt-auto p-lg">
      <div class="bg-surface-container-high rounded-xl p-md flex items-center gap-md mb-md">
        <div class="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">${initial}</div>
        <div class="overflow-hidden">
          <p class="font-label-md text-on-surface truncate">${user?.name || "Admin"}</p>
          <p class="text-[10px] text-on-surface-variant">Administrator</p>
        </div>
      </div>
      <button data-logout class="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors">
        Logout
      </button>
    </div>`;
}

// This is the ONLY function each page calls.
// activeKey must match one of the "key" values above.
async function initAdminShell(activeKey) {
  // 1. Gate FIRST. If this returns null, requireAdmin() already redirected —
  //    we stop here and never touch the DOM. Nothing below leaks to non-admins.
  const user = await requireAdmin();
  if (!user) return null;

  // 2. Every admin page must have a single empty mount point:
  //    <aside id="admin-sidebar">...</aside>
  const mount = document.getElementById("admin-sidebar");
  if (!mount) {
    console.error(`adminShell: page is missing <aside id="admin-sidebar">`);
    return user;
  }

  mount.innerHTML = buildSidebarHTML(activeKey, user);

  mount.querySelectorAll("[data-logout]").forEach(btn => {
    btn.addEventListener("click", logout);
  });

  return user;
}