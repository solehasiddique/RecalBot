// Intersection Observer for Scroll Animations
        const observerOptions = {
            threshold: 0.2
        };

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (entry.target.id === 'health-card') {
                        entry.target.classList.add('animate-ring');
                        startCountUp(entry.target);
                    }
                    if (entry.target.classList.contains('count-up') && !entry.target.closest('#health-card')) {
                        startCountUp(entry.target);
                    }
                    if (entry.target.id === 'distribution-chart') {
                        animateChartBars();
                    }
                    if (entry.target.id === 'activity-panel') {
                        animateRecentActivity();
                    }
                    revealObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Ring Drawing Logic
        // Handled via CSS Class 'animate-ring' and variable --dash-offset

        // Counting Animation Logic
        function startCountUp(element) {
            const counters = element.classList.contains('count-up') ? [element] : element.querySelectorAll('.count-up');
            counters.forEach(counter => {
                const target = +counter.getAttribute('data-target');
                const duration = 2000;
                const start = 0;
                let startTime = null;

                function step(timestamp) {
                    if (!startTime) startTime = timestamp;
                    const progress = Math.min((timestamp - startTime) / duration, 1);
                    // Easing function (outQuart)
                    const easeProgress = 1 - Math.pow(1 - progress, 4);
                    const currentVal = Math.floor(easeProgress * (target - start) + start);
                    
                    counter.innerText = currentVal.toLocaleString();
                    
                    if (progress < 1) {
                        window.requestAnimationFrame(step);
                    } else {
                        counter.innerText = target.toLocaleString();
                    }
                }
                window.requestAnimationFrame(step);
            });
        }

        // Activity Stagger Logic
        function animateRecentActivity() {
            const activityPanel = document.getElementById('activity-panel');
            activityPanel.classList.add('animate-stagger');
            const items = activityPanel.querySelectorAll('.stagger-item');
            items.forEach((item, index) => {
                item.style.animationDelay = `${index * 0.15}s`;
            });
        }

        // Chart Bars Logic
        function animateChartBars() {
            const bars = document.querySelectorAll('.chart-bar');
            const curve = document.getElementById('chart-curve');
            bars.forEach((bar, index) => {
                setTimeout(() => {
                    bar.style.height = bar.getAttribute('data-height');
                }, index * 50);
            });
            curve.classList.remove('opacity-0');
        }

        // Initialize Observers
        document.addEventListener('DOMContentLoaded', () => {
            // Health Card
            const healthCard = document.getElementById('health-card');
            if(healthCard) revealObserver.observe(healthCard);

            // Other Stat Cards
            document.querySelectorAll('.count-up').forEach(c => {
                if(!c.closest('#health-card')) revealObserver.observe(c);
            });

            // Distribution Chart
            const chart = document.getElementById('distribution-chart');
            if(chart) revealObserver.observe(chart);

            // Activity Panel
            const activity = document.getElementById('activity-panel');
            if(activity) revealObserver.observe(activity);
        });