document.getElementById("logoutBtn").addEventListener("click", async (e) => {
  e.preventDefault();

  try {
    await fetch("http://localhost:8000/api/auth/logout", {
      method: "POST",
      credentials: "include"
    });
  } catch {}

  window.location.href = "signin.html";
});
