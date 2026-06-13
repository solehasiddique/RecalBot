document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("forgotForm");
  const emailInput = document.getElementById("email");

  console.log("FORM FOUND:", form);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    if (!email) return alert("Enter email");

    const res = await fetch(`${window.BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    alert(data.message);
  });
});
