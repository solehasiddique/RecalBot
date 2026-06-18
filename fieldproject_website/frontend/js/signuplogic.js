const form = document.getElementById('signupForm');
const passwordInput = document.getElementById('password');
const confirmPassword = document.getElementById('confirm-password');
const passwordStrength = document.getElementById('password-strength');
const successMessage = document.getElementById('success-message');

const fullnameInput = document.getElementById("fullname");
const fullnameError = document.getElementById("fullname-error");
const emailInput = document.getElementById("email");
const emailError = document.getElementById("email-error");
const passwordError = document.getElementById("password-error");
const confirmError = document.getElementById("confirm-error");

// ========================
// HELPERS
// ========================
function showError(el, msg) {
  el.textContent = msg;
  el.style.display = "block";
}

function hideError(el) {
  el.style.display = "none";
}

function getPasswordScore(val) {
  let score = 0;
  if (/[a-z]/.test(val)) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(val)) score++;
  if (val.length >= 8) score++;
  return score;
}

// ========================
// NAME — real-time + block next field if invalid
// ========================
const nameRegex = /^[A-Za-z ]*$/;

fullnameInput.addEventListener("input", function () {
  if (!nameRegex.test(this.value)) {
    showError(fullnameError, "Only letters and spaces allowed");
  } else {
    hideError(fullnameError);
  }
});

// Block moving to email if name is invalid
fullnameInput.addEventListener("blur", function () {
  const val = this.value.trim();
  if (!val) {
    showError(fullnameError, "Name is required");
    emailInput.disabled = true;
    return;
  }
  if (val.length < 2) {
    showError(fullnameError, "Name must be at least 2 characters");
    emailInput.disabled = true;
    return;
  }
  if (!nameRegex.test(val)) {
    showError(fullnameError, "Only letters and spaces allowed");
    emailInput.disabled = true;
    return;
  }
  hideError(fullnameError);
  emailInput.disabled = false;
});

// ========================
// EMAIL — real-time on blur
// ========================
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

emailInput.addEventListener("input", function () {
  if (this.value && !emailRegex.test(this.value.trim())) {
    showError(emailError, "Please enter a valid email address");
  } else {
    hideError(emailError);
  }
});

emailInput.addEventListener("blur", function () {
  const val = this.value.trim();
  if (!val) {
    showError(emailError, "Email is required");
    passwordInput.disabled = true;
    return;
  }
  if (!emailRegex.test(val)) {
    showError(emailError, "Please enter a valid email address");
    passwordInput.disabled = true;
    return;
  }
  hideError(emailError);
  passwordInput.disabled = false;
});

// ========================
// PASSWORD — strength meter + block if weak
// ========================
passwordInput.addEventListener("input", function () {
  const val = this.value;
  const score = getPasswordScore(val);

  let strength = "";
  let color = "";

  if (val.length === 0) {
    strength = "";
  } else if (score <= 2) {
    strength = "Weak";
    color = "#ff6b6b";
  } else if (score <= 4) {
    strength = "Medium";
    color = "#ffd93d";
  } else {
    strength = "Strong";
    color = "#6B9704";
  }

  passwordStrength.textContent = strength ? `Password strength: ${strength}` : "";
  passwordStrength.style.color = color;

  // Show error inline if weak
  if (val.length > 0 && score <= 2) {
    showError(passwordError, "Password is too weak — add uppercase, numbers, or symbols");
    confirmPassword.disabled = true;
  } else {
    hideError(passwordError);
    if (val.length > 0) confirmPassword.disabled = false;
  }
});

passwordInput.addEventListener("blur", function () {
  const val = this.value;
  if (!val) {
    showError(passwordError, "Password is required");
    confirmPassword.disabled = true;
    return;
  }
  const score = getPasswordScore(val);
  if (score <= 2) {
    showError(passwordError, "Password is too weak — add uppercase, numbers, or symbols");
    confirmPassword.disabled = true;
    return;
  }
  hideError(passwordError);
  confirmPassword.disabled = false;
});

// ========================
// CONFIRM PASSWORD — real-time match check
// ========================
confirmPassword.addEventListener("input", function () {
  if (this.value && this.value !== passwordInput.value) {
    showError(confirmError, "Passwords do not match");
  } else {
    hideError(confirmError);
  }
});

confirmPassword.addEventListener("blur", function () {
  if (this.value !== passwordInput.value) {
    showError(confirmError, "Passwords do not match");
  } else {
    hideError(confirmError);
  }
});

// ========================
// PASSWORD EYE TOGGLE
// ========================
document.querySelectorAll(".toggle-password").forEach(button => {
  button.addEventListener("click", () => {
    const inputId = button.getAttribute("data-target");
    const input = document.getElementById(inputId);
    const eyeOpen = button.querySelector(".eyeOpen");
    const eyeClosed = button.querySelector(".eyeClosed");
    const isHidden = input.type === "password";
    input.type = isHidden ? "text" : "password";
    eyeOpen.style.display = isHidden ? "none" : "block";
    eyeClosed.style.display = isHidden ? "block" : "none";
  });
});

// ========================
// SUBMIT — final check before API call
// ========================
form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const fullname = fullnameInput.value.trim();
  const email = emailInput.value.trim();
  const pwd = passwordInput.value;
  const confirmPwd = confirmPassword.value;

  let isValid = true;

  // Name
  if (!fullname) {
    showError(fullnameError, "Name is required");
    isValid = false;
  } else if (fullname.length < 2) {
    showError(fullnameError, "Name must be at least 2 characters");
    isValid = false;
  } else if (!nameRegex.test(fullname)) {
    showError(fullnameError, "Only letters and spaces allowed");
    isValid = false;
  } else {
    hideError(fullnameError);
  }

  // Email
  if (!email) {
    showError(emailError, "Email is required");
    isValid = false;
  } else if (!emailRegex.test(email)) {
    showError(emailError, "Please enter a valid email address");
    isValid = false;
  } else {
    hideError(emailError);
  }

  // Password strength
  if (!pwd) {
    showError(passwordError, "Password is required");
    isValid = false;
  } else if (getPasswordScore(pwd) <= 2) {
    showError(passwordError, "Password is too weak — add uppercase, numbers, or symbols");
    isValid = false;
  } else {
    hideError(passwordError);
  }

  // Confirm password
  if (pwd !== confirmPwd) {
    showError(confirmError, "Passwords do not match");
    isValid = false;
  } else {
    hideError(confirmError);
  }

  if (!isValid) return;

  // API call
  try {
    const res = await fetch(`${window.BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: fullname, email, password: pwd }),
    });

    const data = await res.json();

    if (res.status === 409) {
      alert("User already exists. Please sign in.");
      setTimeout(() => { window.location.href = "signin.html"; }, 1000);
      return;
    }

    if (!res.ok) {
      alert(data.message || "Signup failed");
      return;
    }

    successMessage.style.display = "block";
    setTimeout(() => {
      window.location.href = data.redirect || "questionary.html";
    }, 1000);

  } catch (err) {
    console.error("Signup error:", err);
    alert("Server error during signup");
  }
});