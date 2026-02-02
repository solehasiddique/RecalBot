const form = document.getElementById('signupForm');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirm-password');
const passwordStrength = document.getElementById('password-strength');
const successMessage = document.getElementById('success-message');

// ========================
// Password strength
// ========================
password.addEventListener('input', function () {
  const val = this.value;
  let strength = '';
  let color = '';

  if (val.length === 0) {
    strength = '';
  } else if (val.length < 6) {
    strength = 'Weak';
    color = '#ff6b6b';
  } else if (val.length < 10) {
    strength = 'Medium';
    color = '#ffd93d';
  } else {
    strength = 'Strong';
    color = '#6B9704';
  }

  passwordStrength.textContent = strength
    ? `Password strength: ${strength}`
    : '';
  passwordStrength.style.color = color;
});

// ========================
// Signup submit
// ========================
form.addEventListener('submit', async function (e) {
  e.preventDefault();

  let isValid = true;
  document.querySelectorAll('.error-message').forEach(msg => {
    msg.style.display = 'none';
  });

  const fullname = document.getElementById('fullname').value.trim();
  const email = document.getElementById('email').value.trim();
  const pwd = password.value;

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

  if (pwd !== confirmPassword.value) {
    document.getElementById('confirm-error').style.display = 'block';
    isValid = false;
  }

  if (!isValid) return;

  try {
    const res = await fetch("http://localhost:8000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // 🔴 REQUIRED
      body: JSON.stringify({
        name: fullname,
        email,
        password: pwd
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Signup failed");
      return;
    }

    successMessage.style.display = 'block';

    setTimeout(() => {
      window.location.href = data.redirect || "fieldproject_website/frontend/questionary.html";
    }, 1000);

  } catch (err) {
    console.error("Signup error:", err);
    alert("Server error during signup");
  }
});
