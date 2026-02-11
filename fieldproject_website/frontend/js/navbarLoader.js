async function loadNavbar() {
  const container = document.getElementById("navbar-container");

  const response = await fetch("../components/navbar.html");
  const html = await response.text();

  container.innerHTML = html;

  checkAuth(); // run auth after navbar loads
}

async function checkAuth() {
  const navAuth = document.getElementById("nav-auth");

  try {
    const res = await fetch("http://localhost:8000/api/auth/profile", {
      credentials: "include"
    });

    if (!res.ok) {
      showSignedOut();
      return;
    }

    showSignedIn();

  } catch (err) {
    showSignedOut();
  }

  function showSignedIn() {
    navAuth.innerHTML = `
      <a href="../html/dashboard.html" class="signin">Dashboard</a> 
      <a href="../html/study.html" class="signin">Study</a>
      <a href="../html/test.html" class="signin">Test</a>
      <a href="#" id="logoutBtn" class="signin">Logout</a>
    `;

    document.getElementById("logoutBtn").addEventListener("click", async (e) => {
      e.preventDefault();

      await fetch("http://localhost:8000/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });

      window.location.href = "../html/index.html";
    });
  }

  function showSignedOut() {
    navAuth.innerHTML = `
      <a href="../html/signin.html" class="signin">Sign In</a>
    `;
  }
}

document.addEventListener("DOMContentLoaded", loadNavbar);
