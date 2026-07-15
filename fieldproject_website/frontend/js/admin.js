// Hover effect
document.querySelectorAll(".hover-lift").forEach((card) => {
    card.addEventListener("mouseenter", () => {
        // Future hover effects can go here
    });
});

// Chart loading animation
window.addEventListener("load", () => {
    const chartDiv = document.querySelector(".h-64");

    if (chartDiv) {
        chartDiv.classList.add("opacity-0");

        setTimeout(() => {
            chartDiv.classList.remove("opacity-0");
            chartDiv.classList.add(
                "transition-opacity",
                "duration-1000",
                "opacity-100"
            );
        }, 300);
    }
});