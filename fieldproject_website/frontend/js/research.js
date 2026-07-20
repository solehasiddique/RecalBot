// Hover interactions
document.querySelectorAll(".group").forEach(item => {
    item.addEventListener("mouseenter", () => {
        // Future animations
    });
});

// Search input
const searchInput = document.querySelector('input[type="text"]');
const searchContainer = searchInput.closest("div");

searchInput.addEventListener("focus", () => {
    searchContainer.classList.add("border-primary");
    searchContainer.classList.remove("border-outline-variant/30");
});

searchInput.addEventListener("blur", () => {
    searchContainer.classList.remove("border-primary");
    searchContainer.classList.add("border-outline-variant/30");
});