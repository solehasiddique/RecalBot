const form = document.getElementById('signinForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const successMessage = document.getElementById('success-message');
const rememberMeCheckbox = document.getElementById('remember');
const togglePassword = document.getElementById("togglePassword");
const eyeOpen = document.getElementById("eyeOpen");
const eyeClosed = document.getElementById("eyeClosed");

// Form validation and submission
form.addEventListener('submit', function (e) {
  e.preventDefault();

  let isValid = true;

  // Reset error messages
  document.querySelectorAll('.error-message').forEach(msg => {
    msg.style.display = 'none';
  });

  // Validate email
  const email = emailInput.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    document.getElementById('email-error').style.display = 'block';
    isValid = false;
  }

  // Validate password
  const password = passwordInput.value;
  if (password.length === 0) {
    document.getElementById('password-error').style.display = 'block';
    isValid = false;
  }

  if (isValid) {
    successMessage.style.display = 'block';

    setTimeout(() => {
      window.location.href = '../html/study.html';
    }, 2000);
  }
});

// Real-time email validation (on blur)
emailInput.addEventListener('blur', function () {
  const email = this.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const errorMsg = document.getElementById('email-error');

  if (email && !emailRegex.test(email)) {
    errorMsg.style.display = 'block';
  } else {
    errorMsg.style.display = 'none';
  }
});

// Password eye toggle
togglePassword.addEventListener("click", () => {
  const isHidden = passwordInput.type === "password";

  passwordInput.type = isHidden ? "text" : "password";
  eyeOpen.style.display = isHidden ? "none" : "block";
  eyeClosed.style.display = isHidden ? "block" : "none";
});

// Clear error while typing email
emailInput.addEventListener('input', function () {
  document.getElementById('email-error').style.display = 'none';
});

// Clear error while typing password
passwordInput.addEventListener('input', function () {
  document.getElementById('password-error').style.display = 'none';
});
