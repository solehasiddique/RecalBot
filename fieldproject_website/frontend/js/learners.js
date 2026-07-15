function toggleDrawer(id) {
    const drawer = document.getElementById("user-drawer");
    const overlay = document.getElementById("drawer-overlay");

    const isOpen = drawer.classList.contains("translate-x-0");

    if (isOpen) {
        drawer.classList.remove("translate-x-0");
        drawer.classList.add("translate-x-full");

        overlay.classList.add("opacity-0", "pointer-events-none");

        document.body.style.overflow = "auto";
    } else {

        drawer.classList.add("translate-x-0");
        drawer.classList.remove("translate-x-full");

        overlay.classList.remove("opacity-0", "pointer-events-none");

        document.body.style.overflow = "hidden";

        const nameDisplay = document.getElementById("drawer-name");

        if (id === "learner-2") {
            nameDisplay.innerText = "Marcus Chen";
        } else {
            nameDisplay.innerText = "Dr. Elena Rostova";
        }
    }
}

document.querySelectorAll(".bg-surface-container-lowest").forEach(card => {

    card.addEventListener("mouseenter", () => {

        card.classList.add("shadow-md");

        card.style.transform = "translateY(-2px)";
        card.style.transition = "all .3s ease";

    });

    card.addEventListener("mouseleave", () => {

        card.classList.remove("shadow-md");

        card.style.transform = "translateY(0px)";

    });

});