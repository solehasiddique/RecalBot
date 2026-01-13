const form = document.getElementById('signinForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const successMessage = document.getElementById('success-message');
const rememberMeCheckbox = document.getElementById('remember');
const togglePassword = document.getElementById("togglePassword");
const passwordField = document.getElementById("password");

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  let isValid = true;

  document.querySelectorAll('.error-message').forEach(msg => {
    msg.style.display = 'none';
  });

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const rememberMe = rememberMeCheckbox.checked;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    document.getElementById('email-error').style.display = 'block';
    isValid = false;
  }

  if (!password) {
    document.getElementById('password-error').style.display = 'block';
    isValid = false;
  }

  if (!isValid) return;

  try {
    const res = await fetch("http://localhost:8000/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password, rememberMe }),
    });

    const data = await res.json();

    console.log("SIGNIN STATUS:", res.status);
    console.log("SIGNIN RESPONSE:", data);

    // ❌ Error handling (SMART PART)
    if (!res.ok) {
      if (data.code === "USER_NOT_FOUND") {
        alert("Account not found. Please sign up first.");
      } else if (data.code === "INVALID_PASSWORD") {
        alert("Incorrect password. Please try again.");
      } else {
        alert(data.message || "Signin failed");
      }
      return;
    }

    // ✅ Success
    successMessage.style.display = "block";

    setTimeout(() => {
      window.location.href = "study.html";
    }, 1500);

  } catch (err) {
    console.error(err);
    alert("Server error. Please try again later.");
  }
});
togglePassword.addEventListener("click", () => {
  const isHidden = passwordField.type === "password";

  passwordField.type = isHidden ? "text" : "password";
  togglePassword.textContent = isHidden ? "Hide" : "Show";
});
