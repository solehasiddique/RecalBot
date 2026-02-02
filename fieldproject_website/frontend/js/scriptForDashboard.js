// ============================
// FETCH DASHBOARD DATA
// ============================
fetch("http://localhost:8000/api/dashboard", {
  credentials: "include"
})
  .then(res => res.json())
  .then(data => {
    // Welcome
    document.getElementById("welcomeUser").textContent =
      `Welcome back, ${data.name}! 👋`;

    // Memory strength
    if (data.memory) {
      document.getElementById("memoryValue").textContent =
        `🧠 ${data.memory.percentage}%`;

      document.getElementById("memoryLabel").textContent =
        `Profile: ${data.memory.label}`;
    }

    // Stats
    document.getElementById("streakValue").textContent =
      `🔥 ${data.stats.streak}`;

    document.getElementById("topicsValue").textContent =
      `📃 ${data.stats.totalTopics}`;

    document.getElementById("testsValue").textContent =
      `🎯 ${data.stats.totalSessions}`;
  })
  .catch(err => {
    console.error("Dashboard load failed", err);
  });

// ============================
// CHARTS (STATIC FOR NOW)
// ============================

new Chart(document.getElementById('performanceLineChart'), {
  type: 'line',
  data: {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'Score %',
      data: [65, 72, 80, 88],
      borderColor: '#4C9F70',
      fill: false,
      tension: 0.4
    }]
  }
});

new Chart(document.getElementById('consistencyBarChart'), {
  type: 'bar',
  data: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Study Sessions',
      data: [2, 1, 3, 2, 2, 4, 3],
      backgroundColor: '#6B9071'
    }]
  }
});

new Chart(document.getElementById('subjectPieChart'), {
  type: 'pie',
  data: {
    labels: ['DSA', 'OS', 'DBMS', 'CN'],
    datasets: [{
      data: [40, 25, 20, 15],
      backgroundColor: ['#4C9F70', '#3A7F7A', '#F0AD4E', '#D9534F']
    }]
  }
});

new Chart(document.getElementById('resultPieChart'), {
  type: 'pie',
  data: {
    labels: ['Passed', 'Failed', 'Missed'],
    datasets: [{
      data: [132, 18, 6],
      backgroundColor: ['#4C9F70', '#D9534F', '#F0AD4E']
    }]
  }
});
