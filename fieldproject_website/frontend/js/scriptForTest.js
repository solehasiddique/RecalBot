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

// Get today's date
const today = new Date().getDate();

// Month names
const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Initialize calendar
function initCalendar() {
    const calendar = document.getElementById('calendar');
    const calendarHeader = document.querySelector('.calendar-header h3');

    // Update header with current month and year
    calendarHeader.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px;">
            <button onclick="changeMonth(-1)" style="background: #375534; border: none; color: #E3EED4; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 18px;">←</button>
            <span>📅 ${monthNames[currentMonth]} ${currentYear}</span>
            <button onclick="changeMonth(1)" style="background: #375534; border: none; color: #E3EED4; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 18px;">→</button>
        </div>
    `;

    calendar.innerHTML = '';

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Add day headers
    daysOfWeek.forEach(day => {
        const header = document.createElement('div');
        header.className = 'day-header';
        header.textContent = day;
        calendar.appendChild(header);
    });

    // Get first day of month and number of days
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Add empty cells for befer days 
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        calendar.appendChild(emptyDay);
    }

    // Get today for highlighting
    const todayDate = new Date();
    const isCurrentMonth = currentMonth === todayDate.getMonth() && currentYear === todayDate.getFullYear();

    // Add days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day';

        // Highlight today
        if (isCurrentMonth && day === todayDate.getDate()) {
            dayDiv.style.border = '2px solid #6B9071';
        }

        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        dayDiv.appendChild(dayNumber);

        // Add topics for this day (only for December 2025 with sample data)
        const dateKey = `${currentYear}-${currentMonth + 1}-${day}`; // month +1 because JS months start at 0

        
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

    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    } else if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }

    initCalendar();
}

function getColorForType(type) {
    const colors = {
        'studied': '#4C9F70', 
        'completed': '#3A7F7A', 
        'missed': '#b2a63bff', 
        'failed': '#D9534F', 
        'reschedule': '#F0AD4E'  

    };
    return colors[type] || '#375534';

}

// Initialize upcoming tests
function initUpcomingTests() {
    const testList = document.getElementById('testList');
    testList.innerHTML = '';
    upcomingTests.forEach(test => {
        const testItem = document.createElement('div');
        testItem.className = 'test-item';
        testItem.innerHTML = `
            <div class="test-info">
                <div class="test-name">${test.name}</div>
                <div class="test-date">${test.subject} • ${test.date}</div>
            </div>
            <button class="start-test-btn" onclick="openModal('${test.name}', '${test.subject}')">Start Test</button>
        `;
        testList.appendChild(testItem);
    });
}

// Form submission
document.getElementById('topicForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const selectedDate = new Date(document.getElementById('endDate').value);
const todayCheck = new Date();
todayCheck.setHours(0, 0, 0, 0);

if (selectedDate < todayCheck) {
    alert("You cannot select a past end date.");
    return;
}

    
    const topic = {
        name: document.getElementById('topicName').value,
        subject: document.getElementById('subject').value,
        description: document.getElementById('description').value,
        endDate: document.getElementById('endDate').value,
        confidence: document.getElementById('confidence').value
    };
    topics.push(topic);

    // Add topic to calendar as "studied" on today's date
    const today = new Date();
const dateKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

if (!calendarData[dateKey]) {
    calendarData[dateKey] = [];
}

calendarData[dateKey].push({
    name: topic.name,
    type: 'studied'
});

    // Re-render calendar
    initCalendar();

    alert(`Topic "${topic.name}" added successfully! AI will schedule revision tests.`);
    this.reset();
});

// Modal functions
function openModal(topicName, subject) {
    document.getElementById('modalTopicName').textContent = topicName;
    document.getElementById('modalSubject').textContent = subject;
    document.getElementById('testModal').classList.add('active');
}

function closeModal() {
    document.getElementById('testModal').classList.remove('active');
}

function submitTest() {
    const selected = document.querySelector('input[name="answer"]:checked');
    if (!selected) {
        alert('Please select an answer!');
        return;
    }
    alert('Test submitted! Your score: 90%');
    closeModal();
}


// Initialize everything
initCalendar();
initUpcomingTests();
//Disable calendar date selection
const endDateInput = document.getElementById("endDate");

const todayDate = new Date();
const yyyy = todayDate.getFullYear();
const mm = String(todayDate.getMonth() + 1).padStart(2, '0');
const dd = String(todayDate.getDate()).padStart(2, '0');

endDateInput.min = `${yyyy}-${mm}-${dd}`;

