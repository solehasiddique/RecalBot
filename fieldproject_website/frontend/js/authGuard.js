(async function () {
    try {
        const res = await fetch(`${window.BASE_URL}/api/auth/profile`, {
            credentials: "include"
        });

        if (!res.ok) {
            window.location.href = "signin.html";
        }
    } catch (err) {
        window.location.href = "signin.html";
    }
})();