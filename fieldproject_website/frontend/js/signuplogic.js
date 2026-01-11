const form = document.getElementById('signupForm');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirm-password');
const passwordStrength = document.getElementById('password-strength');
const successMessage = document.getElementById('success-message');

// Password strength indicator
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

    passwordStrength.textContent = strength ? `Password strength: ${strength}` : '';
    passwordStrength.style.color = color;
});

// Form validation + fetch to backend
form.addEventListener('submit', async function (e) {
    e.preventDefault();

    let isValid = true;

    // Reset error messages
    document.querySelectorAll('.error-message').forEach(msg => {
        msg.style.display = 'none';
    });

    // Validate full name
    const fullname = document.getElementById('fullname').value.trim();
    if (fullname.length < 2) {
        document.getElementById('fullname-error').style.display = 'block';
        isValid = false;
    }

    // Validate email
    const email = document.getElementById('email').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        document.getElementById('email-error').style.display = 'block';
        isValid = false;
    }

    // Validate password
    const pwd = password.value;
    if (pwd.length < 3) {
        document.getElementById('password-error').style.display = 'block';
        isValid = false;
    }

    // Validate password match
    if (pwd !== confirmPassword.value) {
        document.getElementById('confirm-error').style.display = 'block';
        isValid = false;
    }

    if (isValid) {
        try {
            // Send data to backend
            const res = await fetch("http://127.0.0.1:8000/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: fullname,
                    email: email,
                    password: pwd
                })
            });

            const data = await res.json();

            if (res.ok) {
                successMessage.textContent = "Signup successful! Redirecting...";
                successMessage.style.display = 'block';

                // wait, then redirect
                setTimeout(() => {
                    form.reset();
                    passwordStrength.textContent = '';
                    window.location.href = '../html/questionary.html';
                }, 1500);
            } else {
                alert("Signup failed: " + data.message);
            }

        } catch (err) {
            console.error("Signup error:", err);
            alert("Signup failed. Check console.");
        }
    }
});
