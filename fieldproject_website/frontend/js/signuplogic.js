document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById('signupForm');
  const password = document.getElementById('password');
  const confirmPassword = document.getElementById('confirm-password');
  const passwordStrength = document.getElementById('password-strength');
  const successMessage = document.getElementById('success-message');

  // Password strength indicator
  password.addEventListener('input', () => {
    const val = password.value;
    let strength = '';
    let color = '';

    if (!val) strength = '';
    else if (val.length < 6) { strength = 'Weak'; color = '#ff6b6b'; }
    else if (val.length < 10) { strength = 'Medium'; color = '#ffd93d'; }
    else { strength = 'Strong'; color = '#6B9704'; }

    passwordStrength.textContent = strength ? `Password strength: ${strength}` : '';
    passwordStrength.style.color = color;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent page reload

    // Hide all previous errors
    document.querySelectorAll('.error-message').forEach(msg => msg.style.display = 'none');

    const fullname = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const pwd = password.value;
    const confirmPwd = confirmPassword.value;

    let isValid = true;

    if (fullname.length < 2) {
      document.getElementById('fullname-error').style.display = 'block';
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      document.getElementById('email-error').style.display = 'block';
      isValid = false;
    }

    if (pwd.length < 3) {
      document.getElementById('password-error').style.display = 'block';
      isValid = false;
    }

    if (pwd !== confirmPwd) {
      document.getElementById('confirm-error').style.display = 'block';
      isValid = false;
    }

    if (!isValid) return;

    try {
      const res = await fetch("http://localhost:8000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // cookie support
        body: JSON.stringify({ name: fullname, email, password: pwd })
      });

      const data = await res.json();

      if (res.ok) {
        successMessage.textContent = "Signup successful! Redirecting...";
        successMessage.style.display = 'block';

        // Wait a tick for cookie to be set
        setTimeout(() => {
          form.reset();
          passwordStrength.textContent = '';
          window.location.href = '../html/questionary.html';
        }, 500);

      } else {
        alert("Signup failed: " + data.message);
      }

    } catch (err) {
      console.error("Signup error:", err);
      alert("Signup failed. Check console.");
    }
  });
});
