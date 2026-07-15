// Animate rings on load
        window.addEventListener('load', () => {
            const rings = document.querySelectorAll('.memory-ring-animate');
            rings.forEach(ring => {
                const currentOffset = ring.getAttribute('stroke-dashoffset');
                ring.style.strokeDashoffset = '282.7'; // Reset
                setTimeout(() => {
                    ring.style.strokeDashoffset = currentOffset; // Trigger transition
                }, 100);
            });
        });

        // Search bar focus effect
        const searchInput = document.querySelector('input[type="text"]');
        searchInput.addEventListener('focus', () => {
            searchInput.parentElement.classList.add('ring-2', 'ring-secondary/20');
        });
        searchInput.addEventListener('blur', () => {
            searchInput.parentElement.classList.remove('ring-2', 'ring-secondary/20');
        });