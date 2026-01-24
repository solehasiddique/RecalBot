(function() {
    'use strict';
    
    let aiData = null; // This will come from  AI/backend
    let timer, time, total = 0, sessions = 0, paused = false;

    // Simulate AI API call - REPLACE THIS with your actual API
    async function getAIRecommendations() {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/study-recommendations');
        // return await response.json();
        
        // Demo data - shows how AI should return data
        return {
            personality: "Deep Focus",
            duration: 25, // minutes
            music: "Lo-fi Beats",
             background: "linear-gradient(135deg, #e0ecde, #cde0cd)"
            // background:"transparent"
           

        };
    }

    function animate() {
        if (typeof gsap !== 'undefined') {
            gsap.from('#screen', { opacity: 0, y: 30, duration: 0.6, ease: 'power2.out' });
            gsap.to('.bar', { height: '5px', duration: 0.4, stagger: 0.1, repeat: -1, yoyo: true, ease: 'power1.inOut' });
        }
    }

    function start() {
        document.body.style.background = aiData.background;
        document.getElementById('title').textContent = 'Focus Time 😊';
        document.getElementById('subtitle').textContent = "You're doing great!";
        document.getElementById('badge').textContent = aiData.personality;
        document.getElementById('music').textContent = aiData.music;
        document.getElementById('timerSection').classList.remove('hidden');
        
        time = aiData.duration * 60;
        updateTimer();
        timer = setInterval(() => {
            if (!paused) {
                time--;
                updateTimer();
                if (time <= 0) {
                    clearInterval(timer);
                    done();
                }
            }
        }, 1000);
        
        show([
            { text: '⏸ Pause', class: 'btn-secondary', action: pause },
            { text: '⏹ Stop', class: 'btn-secondary', action: stop }
        ]);
        
        if (typeof gsap !== 'undefined') {
            gsap.from('#timerSection', { opacity: 0, scale: 0.8, duration: 0.5 });
        }
    }

    function pause(btn) {
        paused = !paused;
        btn.textContent = paused ? '▶ Resume' : '⏸ Pause';
    }

    function stop() {
        clearInterval(timer);
        done();
    }

    function updateTimer() {
        const m = Math.floor(time / 60), s = time % 60;
        document.getElementById('timer').textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        document.getElementById('progress').style.width = ((aiData.duration * 60 - time) / (aiData.duration * 60) * 100) + '%';
    }

    function done() {
        sessions++;
        total += aiData.duration;
        document.getElementById('title').textContent = 'Great Work! 🎉';
        document.getElementById('subtitle').textContent = 'What next?';
        document.getElementById('timerSection').classList.add('hidden');
        show([
            { text: 'Take Break (5 min)', class: 'btn-primary', action: breakTime },
            { text: 'Continue Studying', class: 'btn-secondary', action: start },
            { text: 'Done Studying', class: 'btn-secondary', action: finish }
        ]);
    }

    function breakTime() {
        document.getElementById('title').textContent = 'Break Time 🫠';
        document.getElementById('subtitle').textContent = 'Relax and recharge';
        document.getElementById('timerSection').classList.remove('hidden');
        time = 300;
        updateTimer();
        timer = setInterval(() => {
            time--;
            updateTimer();
            if (time <= 0) {
                clearInterval(timer);
                done();
            }
        }, 1000);
        show([{ text: 'Skip Break', class: 'btn-secondary', action: done }]);
    }

    function finish() {
        document.getElementById('title').textContent = 'Session Complete!👍';
        document.getElementById('subtitle').textContent = `${sessions} sessions • ${total} minutes`;
        document.getElementById('timerSection').classList.add('hidden');
        show([{ text: 'New Session', class: 'btn-primary', action: () => location.reload() }]);
    }

    function show(btns) {
        const container = document.getElementById('buttons');
        container.innerHTML = '';
        
        btns.forEach(btn => {
            const button = document.createElement('button');
            button.className = `btn ${btn.class}`;
            button.textContent = btn.text;
            button.addEventListener('click', function() {
                btn.action(this);
            });
            container.appendChild(button);
        });
        
        if (typeof gsap !== 'undefined') {
            gsap.from('#buttons button', { opacity: 0, y: 20, duration: 0.5,ease: "power2.out",clearProps: "all" });
        }
    }

    async function init() {
        animate();
        
        // Get AI recommendations
        aiData = await getAIRecommendations();
        
        document.getElementById('badge').textContent = aiData.personality;
        document.getElementById('subtitle').textContent = 'Ready to start your personalized session!';
        show([{ text: 'Start Studying', class: 'btn-primary', action: start }]);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
