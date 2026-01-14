const topics = [];
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

const calendarData = {
    "2025-12-1": [{ name: 'Arrays', type: 'studied' }],
    "2025-12-3": [{ name: 'Linked Lists', type: 'studied' }],
    "2025-12-5": [{ name: 'Arrays', type: 'completed' }],
    "2025-12-8": [{ name: 'Stacks', type: 'studied' }],
    "2025-12-10": [{ name: 'Linked Lists', type: 'missed' }],
    "2025-12-12": [{ name: 'Queues', type: 'studied' }],
    "2025-12-15": [{ name: 'Stacks', type: 'completed' }],
    "2025-12-17": [{ name: 'Trees', type: 'studied' }],
    "2025-12-18": [{ name: 'Arrays', type: 'failed' }],
    "2025-12-20": [{ name: 'Graphs', type: 'studied' }],
    "2025-12-22": [{ name: 'Queues', type: 'reschedule' }],
    "2025-12-24": [{ name: 'Hashing', type: 'studied' }],
    "2025-12-26": [{ name: 'Trees', type: 'completed' }],
    "2025-12-28": [{ name: 'DP', type: 'studied' }]
};

const upcomingTests = [
    { name: 'Data Structures', subject: 'Computer Science', date: 'Dec 26, 2025' },
    { name: 'Algorithms', subject: 'Computer Science', date: 'Dec 28, 2025' },
    { name: 'Operating Systems', subject: 'Computer Science', date: 'Dec 30, 2025' }
];

const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
];

function initCalendar() {
    const calendar = document.getElementById('calendar');
    const calendarHeader = document.querySelector('.calendar-header h3');

    calendarHeader.innerHTML = `
        <div style="display:flex;align-items:center;gap:15px;">
            <button onclick="changeMonth(-1)">←</button>
            <span>📅 ${monthNames[currentMonth]} ${currentYear}</span>
            <button onclick="changeMonth(1)">→</button>
        </div>
    `;

    calendar.innerHTML = '';

    const daysOfWeek = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    daysOfWeek.forEach(day => {
        const header = document.createElement('div');
        header.className = 'day-header';
        header.textContent = day;
        calendar.appendChild(header);
    });

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        calendar.appendChild(document.createElement('div'));
    }

    const todayDate = new Date();
    const isCurrentMonth =
        currentMonth === todayDate.getMonth() &&
        currentYear === todayDate.getFullYear();

    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day';

        if (isCurrentMonth && day === todayDate.getDate()) {
            dayDiv.style.border = '2px solid #6B9071';
        }

        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        dayDiv.appendChild(dayNumber);

        const dateKey = `${currentYear}-${currentMonth + 1}-${day}`;

        if (calendarData[dateKey]) {
            calendarData[dateKey].forEach(topic => {
                const tag = document.createElement('div');
                tag.className = 'topic-tag';
                tag.style.background = getColorForType(topic.type);
                tag.textContent = topic.name;
                dayDiv.appendChild(tag);
            });
        }

        calendar.appendChild(dayDiv);
    }
}

function changeMonth(direction) {
    currentMonth += direction;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    initCalendar();
}

function getColorForType(type) {
    return {
        studied: '#4C9F70',
        completed: '#3A7F7A',
        missed: '#b2a63b',
        failed: '#D9534F',
        reschedule: '#F0AD4E'
    }[type] || '#375534';
}

function initUpcomingTests() {
    const testList = document.getElementById('testList');
    testList.innerHTML = '';

    upcomingTests.forEach(test => {
        const div = document.createElement('div');
        div.className = 'test-item';
        div.innerHTML = `
            <div>
                <strong>${test.name}</strong>
                <div>${test.subject} • ${test.date}</div>
            </div>
            <button onclick="openModal('${test.name}','${test.subject}')">Start Test</button>
        `;
        testList.appendChild(div);
    });
}

document.getElementById('topicForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const selectedDate = new Date(endDate.value);
    const today = new Date();
    today.setHours(0,0,0,0);

    if (selectedDate < today) {
        alert("You cannot select a past end date.");
        return;
    }

    const topicName = topicNameInput.value;

    const key = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    calendarData[key] = calendarData[key] || [];
    calendarData[key].push({ name: topicName, type: 'studied' });

    initCalendar();
    alert(`Topic "${topicName}" added successfully!`);
    this.reset();
});

function openModal(topic, subject) {
    modalTopicName.textContent = topic;
    modalSubject.textContent = subject;
    testModal.classList.add('active');
}

function closeModal() {
    testModal.classList.remove('active');
}

function submitTest() {
    if (!document.querySelector('input[name="answer"]:checked')) {
        alert('Please select an answer!');
        return;
    }
    alert('Test submitted! Your score: 90%');
    closeModal();
}

initCalendar();
initUpcomingTests();

const todayDate = new Date();
endDate.min = `${todayDate.getFullYear()}-${String(todayDate.getMonth()+1).padStart(2,'0')}-${String(todayDate.getDate()).padStart(2,'0')}`;
