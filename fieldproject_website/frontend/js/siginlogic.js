const form = document.getElementById('signinForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const successMessage = document.getElementById('success-message');

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
        }, 2000); // 2 seconds
    }

});

// Real-time email validation(check email error when outside)

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

//Clear error on input(check email error while typing)
emailInput.addEventListener('input', function () {
    document.getElementById('email-error').style.display = 'none';
});
//check password
passwordInput.addEventListener('input', function () {
    document.getElementById('password-error').style.display = 'none';
});