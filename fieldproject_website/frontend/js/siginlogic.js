const form = document.getElementById('signinForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const successMessage = document.getElementById('success-message');
const rememberMeCheckbox = document.getElementById('remember');

// Form validation and submission
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

console.log("SIGNIN STATUS:", res.status);
console.log("SIGNIN HEADERS:", [...res.headers]);

const data = await res.json();
console.log("SIGNIN RESPONSE:", data);


    if (!res.ok) {
      alert(data.message || "Signin failed");
      return;
    }

    successMessage.style.display = "block";

    setTimeout(() => {
      window.location.href = "study.html"; // protected page
    }, 1500);

  } catch (err) {
    console.error(err);
    alert("Server error");
  }
});
// // Toggle password visibility
// const togglePassword = document.getElementById('togglePassword');
// togglePassword.addEventListener('click', function () {
//   const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
//   passwordInput.setAttribute('type', type);
//   this.textContent = type === 'password' ? 'Show' : 'Hide';
// });