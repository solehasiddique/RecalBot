let performanceChart, consistencyChart, subjectChart, resultChart;

function renderCharts(data) {
  // Destroy old charts if they exist
  if (performanceChart) performanceChart.destroy();
  if (consistencyChart) consistencyChart.destroy();
  if (subjectChart) subjectChart.destroy();
  if (resultChart) resultChart.destroy();

  performanceChart = new Chart(document.getElementById('performanceLineChart'), {
    type: 'line',
    data: {
      labels: data.charts.performance.map((_, i) => `Test ${i+1}`),
      datasets: [{
        label: 'Score %',
        data: data.charts.performance,
        borderColor: '#4C9F70',
        fill: false,
        tension: 0.4
      }]
    }
  });

  consistencyChart = new Chart(document.getElementById('consistencyBarChart'), {
    type: 'bar',
    data: {
      labels: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
      datasets: [{
        label: 'Study Sessions',
        data: data.charts.weeklySessions,
        backgroundColor: '#6B9071'
      }]
    }
  });

  subjectChart = new Chart(document.getElementById('subjectPieChart'), {
    type: 'pie',
    data: {
      labels: data.charts.subjectLabels,
      datasets: [{
        data: data.charts.subjectData,
        backgroundColor: ['#4C9F70','#3A7F7A','#F0AD4E','#D9534F','#6C5CE7']
      }]
    }
  });

  resultChart = new Chart(document.getElementById('resultPieChart'), {
    type: 'pie',
    data: {
      labels: ['Passed', 'Failed', 'Missed'],
      datasets: [{
        data: data.charts.resultPie,
        backgroundColor: ['#4C9F70', '#D9534F', '#F0AD4E']
      }]
    }
  });
}

// Fetch and render dashboard
async function loadDashboard() {
  try {
    const res = await fetch("http://localhost:8000/api/dashboard", { credentials: "include" });
    const data = await res.json();

    document.getElementById("welcomeUser").textContent = `Welcome back, ${data.name}! 👋`;
    if (data.memory) {
      document.getElementById("memoryValue").textContent = `🧠 ${data.memory.percentage}%`;
      document.getElementById("memoryLabel").textContent = `Profile: ${data.memory.label}`;
    }
    document.getElementById("streakValue").textContent = `🔥 ${data.stats.streak}`;
    document.getElementById("topicsValue").textContent = `📃 ${data.stats.totalTopics}`;
    document.getElementById("testsValue").textContent = `🎯 ${data.stats.completedTests}`;
    document.getElementById("passedValue").textContent = `✅ ${data.stats.passedTests}`;
    document.getElementById("failedValue").textContent = `❎ ${data.stats.failedTests}`;
    document.getElementById("missedValue").textContent = `⚠️ ${data.stats.missedTests}`;
    document.getElementById("remainingValue").textContent = `📌 ${data.stats.testsLeft}`;

    renderCharts(data);

  } catch (err) {
    console.error("Dashboard load failed", err);
  }
}

// Call this on page load
loadDashboard();