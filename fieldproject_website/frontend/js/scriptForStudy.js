(function () {
    'use strict';

    let aiData = null;
    let timer = null;
    let time = 0;
    let paused = false;


    let total = 0;     // total minutes (from backend)
    let sessions = 0;  // total full sessions (from backend)

    // =============================
    // GET AI RECOMMENDATION
    // =============================
    async function getAIRecommendations() {
        try {
            const response = await fetch("http://localhost:8000/api/auth/recommendations", {
                credentials: "include"
            });

            if (!response.ok) throw new Error("Failed to fetch AI data");

            return await response.json();

        } catch (err) {
            console.error("AI fetch failed, using fallback", err);

            return {
                personality: "Deep Focus",
                duration: 25,
                music: "Lo-fi Beats",
                background: "linear-gradient(135deg, #e0ecde, #cde0cd)"
            };
        }
    }

    // =============================
    // LOAD TODAY STATS (PERSIST AFTER REFRESH)
    // =============================
    async function loadStats() {
        try {
            const res = await fetch("http://localhost:8000/api/dashboard", {
                credentials: "include"
            });

            if (!res.ok) return;

            const data = await res.json();

            total = data.stats.totalMinutes || 0;
            sessions = data.stats.totalSessions || 0;

        } catch (err) {
            console.error("Failed to load stats", err);
        }
    }

    // =============================
    // SAVE SESSION TO BACKEND
    // =============================
    async function saveSessionToBackend(minutes) {
        try {
            const response = await fetch("http://localhost:8000/api/auth/session", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    minutes: minutes,
                    focusType: "focus"
                })
            });

            if (!response.ok) throw new Error("Session save failed");

            const data = await response.json();

            total = data.totalMinutes;
            sessions = data.sessions;

        } catch (err) {
            console.error("Error saving session:", err);
        }
    }

    // =============================
    // START STUDY SESSION
    // =============================
    function start() {
        paused = false;

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
        const m = Math.floor(time / 60);
        const s = time % 60;

        document.getElementById('timer').textContent =
            `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

        document.getElementById('progress').style.width =
            ((aiData.duration * 60 - time) / (aiData.duration * 60) * 100) + '%';
    }

    // =============================
    // SESSION COMPLETE
    // =============================
    async function done() {

        clearInterval(timer);

        const totalSeconds = aiData.duration * 60;
const studiedSeconds = totalSeconds - time;
const studiedMinutes = Math.floor(studiedSeconds / 60);

        if (studiedMinutes <= 0) {
            alert("Study at least 1 minute to save progress.");
            return;
        }

        await saveSessionToBackend(studiedMinutes);

        document.getElementById('title').textContent = 'Session Complete! 👍';
        document.getElementById('subtitle').textContent =
            `${sessions} sessions • ${total} minutes`;

        document.getElementById('timerSection').classList.add('hidden');

        show([
            { text: 'New Session', class: 'btn-primary', action: () => location.reload() }
        ]);
    }

    // =============================
    // BUTTON RENDER
    // =============================
    function show(btns) {
        const container = document.getElementById('buttons');
        container.innerHTML = '';

        btns.forEach(btn => {
            const button = document.createElement('button');
            button.className = `btn ${btn.class}`;
            button.textContent = btn.text;
            button.addEventListener('click', function () {
                btn.action(this);
            });
            container.appendChild(button);
        });
    }

    // =============================
    // INIT
    // =============================
    async function init() {

        aiData = await getAIRecommendations();
        await loadStats();

        document.getElementById('badge').textContent = aiData.personality;
        document.getElementById('subtitle').textContent =
            `${sessions} sessions • ${total} minutes`;

        show([
            { text: 'Start Studying', class: 'btn-primary', action: start }
        ]);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
