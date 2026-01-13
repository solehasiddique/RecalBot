// ===== DUMMY DATA =====
const overallPerformanceData = [65, 70, 75, 80, 85, 90, 95];
const consistencyData = [5, 6, 7, 5, 8, 6, 7];
const subjectDistribution = {
    labels: ['Math', 'CS', 'Physics', 'Chemistry'],
    data: [10, 12, 5, 7]
};
const passFailData = {
    labels: ['Passed', 'Failed', 'Missed'],
    data: [132, 18, 6]
};

// ===== LINE CHART: Overall Performance =====
const ctxOverall = document.getElementById('overallPerformanceChart').getContext('2d');
new Chart(ctxOverall, {
    type: 'line',
    data: {
        labels: ['Week 1','Week 2','Week 3','Week 4','Week 5','Week 6','Week 7'],
        datasets: [{
            label: 'Performance %',
            data: overallPerformanceData,
            borderColor: '#4C9F70',
            backgroundColor: 'rgba(76,159,112,0.2)',
            tension: 0.4
        }]
    },
    options: {
        responsive: true,
        plugins: { legend: { display: true } },
        scales: { y: { beginAtZero: true, max: 100 } }
    }
});

// ===== BAR CHART: Consistency =====
const ctxConsistency = document.getElementById('consistencyChart').getContext('2d');
new Chart(ctxConsistency, {
    type: 'bar',
    data: {
        labels: ['Week 1','Week 2','Week 3','Week 4','Week 5','Week 6','Week 7'],
        datasets: [{
            label: 'Hours Studied',
            data: consistencyData,
            backgroundColor: '#3A7F7A'
        }]
    },
    options: {
        responsive: true,
        plugins: { legend: { display: true } },
        scales: { y: { beginAtZero: true } }
    }
});

// ===== PIE CHART: Subject Distribution =====
const ctxSubject = document.getElementById('subjectPieChart').getContext('2d');
new Chart(ctxSubject, {
    type: 'pie',
    data: {
        labels: subjectDistribution.labels,
        datasets: [{
            data: subjectDistribution.data,
            backgroundColor: ['#4C9F70','#3A7F7A','#b2a63bff','#F0AD4E']
        }]
    },
    options: { responsive: true }
});

// ===== PIE CHART: Pass/Fail/Miss =====
const ctxPassFail = document.getElementById('passFailPieChart').getContext('2d');
new Chart(ctxPassFail, {
    type: 'pie',
    data: {
        labels: passFailData.labels,
        datasets: [{
            data: passFailData.data,
            backgroundColor: ['#4C9F70','#D9534F','#b2a63bff']
        }]
    },
    options: { responsive: true }
});
