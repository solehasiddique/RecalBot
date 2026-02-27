(function () {
    'use strict';

    let aiData = null;
    let timer = null;
    let time = 0;
    let paused = false;
    let musicPlayer = null;

    let total = 0;
    let sessions = 0;

    async function getAIRecommendations() {
        try {
            const res = await fetch("http://localhost:8000/api/auth/recommendations", { credentials: "include" });
            if (!res.ok) throw new Error("Failed to fetch AI data");
            return await res.json();
        } catch (err) {
            console.error("AI fetch failed:", err);
            return {
                personality: "Deep Focus",
                duration: 25,
                music: "Lo-fi Beats",
                musicType: "lo-fi-beats",
                background: "linear-gradient(135deg, #e0ecde, #cde0cd)"
            };
        }
    }

    async function loadStats() {
        try {
            const res = await fetch("http://localhost:8000/api/dashboard", { credentials: "include" });
            if (!res.ok) return;
            const data = await res.json();
            total = data.stats.totalMinutes || 0;
            sessions = data.stats.totalSessions || 0;
        } catch (err) {
            console.error("Failed to load stats:", err);
        }
    }

    async function saveSessionToBackend(minutes) {
        try {
            const res = await fetch("http://localhost:8000/api/auth/session", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ minutes, focusType: "focus" })
            });
            if (!res.ok) throw new Error("Session save failed");
            const data = await res.json();
            total = data.totalMinutes;
            sessions = data.sessions;
        } catch (err) {
            console.error("Error saving session:", err);
        }
    }

    function updateTimer() {
        const m = Math.floor(time / 60);
        const s = time % 60;
        document.getElementById('timer').textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        document.getElementById('progress').style.width = ((aiData.duration * 60 - time) / (aiData.duration * 60) * 100) + '%';
    }

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
                    completeSession();
                }
            }
        }, 1000);

        show([
            { text: '⏸ Pause', class: 'btn-secondary', action: pause },
            { text: '⏹ Stop', class: 'btn-secondary', action: stop }
        ]);

        if (musicPlayer && musicPlayer.src) {
            musicPlayer.volume = 0.4;
            musicPlayer.play().catch(() => {});
        }
    }

    function pause(btn) {
        paused = !paused;
        btn.textContent = paused ? '▶ Resume' : '⏸ Pause';
        if (musicPlayer) paused ? musicPlayer.pause() : musicPlayer.play().catch(() => {});
    }

    function stop() {
        clearInterval(timer);
        if (musicPlayer) { musicPlayer.pause(); musicPlayer.currentTime = 0; }

        const studiedMinutes = Math.floor((aiData.duration * 60 - time) / 60);

        if (studiedMinutes < 1) {
            alert("You need to study at least 1 minute to save progress.");
            // Reset UI to allow retry
            time = aiData.duration * 60;
            paused = false;
            updateTimer();
            show([{ text: 'Start Studying', class: 'btn-primary', action: start }]);
            return;
        }

        completeSession();
    }

    async function completeSession() {
        clearInterval(timer);
        const studiedMinutes = Math.floor((aiData.duration * 60 - time) / 60);
        if (studiedMinutes < 1) return;

        await saveSessionToBackend(studiedMinutes);

        document.getElementById('title').textContent = 'Session Complete! 👍';
        document.getElementById('subtitle').textContent = `${sessions} sessions • ${total} minutes`;
        document.getElementById('timerSection').classList.add('hidden');

        if (musicPlayer) { musicPlayer.pause(); musicPlayer.currentTime = 0; }

        show([{ text: 'New Session', class: 'btn-primary', action: () => location.reload() }]);
    }

    function show(btns) {
        const container = document.getElementById('buttons');
        container.innerHTML = '';
        btns.forEach(btn => {
            const button = document.createElement('button');
            button.className = `btn ${btn.class}`;
            button.textContent = btn.text;
            button.addEventListener('click', () => btn.action(button));
            container.appendChild(button);
        });
    }

    async function init() {
        aiData = await getAIRecommendations();
        await loadStats();

        musicPlayer = document.getElementById("bgMusic");
        const musicMap = {
            "lo-fi-beats": "http://localhost:8000/music/lofi.mp3",
            "nature-ambient": "http://localhost:8000/music/nature.mp3",
            "classical-focus": "http://localhost:8000/music/instrument.mp3",
            "no-music": null,
        };

        if (musicMap[aiData.musicType]) musicPlayer.src = musicMap[aiData.musicType];

        document.getElementById('badge').textContent = aiData.personality;
        document.getElementById('subtitle').textContent = `${sessions} sessions • ${total} minutes`;

        show([{ text: 'Start Studying', class: 'btn-primary', action: start }]);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

})();