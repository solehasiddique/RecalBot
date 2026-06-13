async function loadNavbar() {
  const container = document.getElementById("navbar-container");
  const response = await fetch("../components/navbar.html");
  const html = await response.text();
  container.innerHTML = html;

  await setupNavbar();
}

async function setupNavbar() {
  const navRight = document.getElementById("nav-right");

  try {
    const res = await fetch(`${window.BASE_URL}/api/auth/profile`, {
      credentials: "include"
    });

    if (!res.ok) throw new Error("Not logged in");

    const data = await res.json();
    const user = data.user;

    renderLoggedIn(navRight, user);

  } catch (err) {
    renderLoggedOut(navRight);
  }

  highlightActiveLink();
  setupHamburger();
}

function renderLoggedIn(container, user) {
  const roleLinks = user.role === "admin"
    ? `<a href="../html/admin.html" class="nav-link">Admin</a>`
    : "";

  container.innerHTML = `
    <a href="../html/index.html" class="nav-link">Home</a>
    <a href="../html/dashboard.html" class="nav-link">Dashboard</a>
    <a href="../html/study.html" class="nav-link">Study</a>
    <a href="../html/test.html" class="nav-link">Test</a>
    ${roleLinks}

    <div class="profile-menu">
      <span id="profileToggle">${user.name} ▾</span>
      <div class="dropdown" id="dropdown">
        <a href="../html/profile.html">Profile</a>
        <a href="#" id="logoutBtn">Logout</a>
      </div>
    </div>
  `;

  // Profile dropdown toggle
  document.getElementById("profileToggle").addEventListener("click", () => {
    document.getElementById("dropdown").classList.toggle("show");
  });

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", async (e) => {
    e.preventDefault();
    await fetch(`${window.BASE_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include"
    });
    window.location.href = "../html/index.html";
  });
}

function renderLoggedOut(container) {
  container.innerHTML = `
    <a href="../html/signin.html" class="nav-link">Sign In/Sign Up</a>
  `;
}

function highlightActiveLink() {
  const links = document.querySelectorAll(".nav-link");
  const currentPath = window.location.pathname.toLowerCase();
  const currentPage = currentPath.endsWith("/")
    ? "index.html"
    : currentPath.split("/").pop() || "index.html";

  links.forEach(link => {
    const linkPath = new URL(link.getAttribute("href"), window.location.href).pathname.toLowerCase();
    const linkPage = linkPath.split("/").pop() || "index.html";

    if (linkPage === currentPage) {
      link.classList.add("active");
    }
  });
}

function setupHamburger() {
  const hamburger = document.getElementById("hamburger");
  const navRight = document.getElementById("nav-right");

  hamburger.addEventListener("click", () => {
    navRight.classList.toggle("open");
  });
}

document.addEventListener("DOMContentLoaded", loadNavbar);
