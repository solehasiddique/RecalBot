document.getElementById("logoutBtn").addEventListener("click", async (e) => {
  e.preventDefault();

  try {
    await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include"
    });
  } catch {}

  window.location.href = "signin.html";
});
