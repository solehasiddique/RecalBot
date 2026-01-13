document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("resetForm");
  const passwordInput = document.getElementById("password");

  // Extract token from URL query param: ?token=xxxxx
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!token) return alert("No token provided in URL");

    try {
      const res = await fetch(`http://localhost:8000/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput.value }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.message || "Reset failed");

      alert("Password reset successful! You can now log in.");
      window.location.href = "signin.html";
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  });
});
