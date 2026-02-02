/***********************
 * GLOBAL STATE
 ***********************/
const topics = [];
const upcomingTests = [];

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

/***********************
 * SAMPLE CALENDAR DATA
 ***********************/
const calendarData = {
  "2025-12-1": [{ name: "Arrays", type: "studied" }],
  "2025-12-3": [{ name: "Linked Lists", type: "studied" }],
  "2025-12-5": [{ name: "Arrays", type: "completed" }],
  "2025-12-8": [{ name: "Stacks", type: "studied" }],
  "2025-12-10": [{ name: "Linked Lists", type: "missed" }],
  "2025-12-12": [{ name: "Queues", type: "studied" }],
  "2025-12-15": [{ name: "Stacks", type: "completed" }],
  "2025-12-17": [{ name: "Trees", type: "studied" }],
  "2025-12-18": [{ name: "Arrays", type: "failed" }],
  "2025-12-20": [{ name: "Graphs", type: "studied" }],
  "2025-12-22": [{ name: "Queues", type: "reschedule" }],
  "2025-12-24": [{ name: "Hashing", type: "studied" }],
  "2025-12-26": [{ name: "Trees", type: "completed" }],
  "2025-12-28": [{ name: "DP", type: "studied" }],
};

const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

/***********************
 * CALENDAR
 ***********************/
function initCalendar() {
  const calendar = document.getElementById("calendar");
  const calendarHeader = document.querySelector(".calendar-header h3");

  calendarHeader.innerHTML = `
    <div style="display:flex;align-items:center;gap:15px;">
      <button onclick="changeMonth(-1)">←</button>
      <span>📅 ${monthNames[currentMonth]} ${currentYear}</span>
      <button onclick="changeMonth(1)">→</button>
    </div>
  `;

  calendar.innerHTML = "";

  ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach(day => {
    const h = document.createElement("div");
    h.className = "day-header";
    h.textContent = day;
    calendar.appendChild(h);
  });

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) calendar.appendChild(document.createElement("div"));

  const today = new Date();
  const isCurrentMonth =
    today.getMonth() === currentMonth &&
    today.getFullYear() === currentYear;

  for (let day = 1; day <= daysInMonth; day++) {
    const dayDiv = document.createElement("div");
    dayDiv.className = "day";

    if (isCurrentMonth && day === today.getDate()) {
      dayDiv.style.border = "2px solid #6B9071";
    }

    const num = document.createElement("div");
    num.className = "day-number";
    num.textContent = day;
    dayDiv.appendChild(num);

    const key = `${currentYear}-${currentMonth + 1}-${day}`;
    if (calendarData[key]) {
      calendarData[key].forEach(t => {
        const tag = document.createElement("div");
        tag.className = "topic-tag";
        tag.style.background = getColorForType(t.type);
        tag.textContent = t.name;
        dayDiv.appendChild(tag);
      });
    }

    calendar.appendChild(dayDiv);
  }
}

function changeMonth(dir) {
  currentMonth += dir;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  initCalendar();
}

function getColorForType(type) {
  return {
    studied: "#4C9F70",
    completed: "#3A7F7A",
    missed: "#b2a63bff",
    failed: "#D9534F",
    reschedule: "#F0AD4E",
  }[type] || "#375534";
}

/***********************
 * UPCOMING TESTS
 ***********************/
function initUpcomingTests() {
  const list = document.getElementById("testList");
  list.innerHTML = "";

  upcomingTests.forEach(test => {
    const div = document.createElement("div");
    div.className = "test-item";
    div.innerHTML = `
      <div class="test-info">
        <div class="test-name">${test.name}</div>
        <div class="test-date">${test.subject} • ${test.date}</div>
      </div>
      <button class="start-test-btn"
        onclick="openModal('${test.name}','${test.subject}')">
        Start Test
      </button>
    `;
    list.appendChild(div);
  });
}

/***********************
 * ADD TOPIC
 ***********************/
document.getElementById("topicForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const topic = {
    name: topicName.value,
    subject: subject.value,
    description: description.value,
    endDate: endDate.value,
    confidence: confidence.value,
  };

  topics.push(topic);

  upcomingTests.push({
    name: topic.name,
    subject: topic.subject,
    date: new Date(topic.endDate).toDateString(),
  });

  initUpcomingTests(); // ✅ IMPORTANT

  const today = new Date();
  const key = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

  if (!calendarData[key]) calendarData[key] = [];
  calendarData[key].push({ name: topic.name, type: "studied" });

  initCalendar();
  alert(`Topic "${topic.name}" added successfully!`);
  this.reset();
});

/***********************
 * TEST MODAL
 ***********************/
function openModal(topicName, subject) {
  modalTopicName.textContent = topicName;
  modalSubject.textContent = subject;
  testModal.classList.add("active");
}

function closeModal() {
  testModal.classList.remove("active");
}

function submitTest() {
  fetch("http://localhost:8000/api/memory/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      "Age_18 - 21": 1,
      "Gender_Male": 1,
    }),
  })
    .then(res => res.json())
    .then(data => {
      alert(`Memory Strength: ${data.label} (${data.percentage}%)`);
      generateRevisionDates(data.label);
    });

  closeModal();
}

/***********************
 * REVISION SCHEDULING
 ***********************/
function generateRevisionDates(label) {
  const today = new Date();
  const gaps =
    label === "WEAK" ? [1,3,7,14] :
    label === "MEDIUM" ? [3,7,14,30] :
    [7,21,45];

  gaps.forEach(d => {
    const date = new Date(today);
    date.setDate(date.getDate() + d);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

    if (!calendarData[key]) calendarData[key] = [];
    calendarData[key].push({ name: "Revision", type: "reschedule" });
  });

  initCalendar();
}

/***********************
 * INIT
 ***********************/
initCalendar();
initUpcomingTests();

const endDateInput = document.getElementById("endDate");
const t = new Date();
endDateInput.min = `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`;
