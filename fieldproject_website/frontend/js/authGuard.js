(async function () {
    try {
        const res = await fetch("http://localhost:8000/api/auth/profile", {
            credentials: "include"
        });

        if (!res.ok) {
            window.location.href = "signin.html";
        }
    } catch (err) {
        window.location.href = "signin.html";
    }
})();
