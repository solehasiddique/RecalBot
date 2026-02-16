/***********************
 * GLOBAL STATE
 ***********************/
let calendarData = {};
let upcomingTests = [];

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/***********************
 * LOAD CALENDAR FROM DB (SINGLE SOURCE)
 ***********************/
async function loadCalendarFromDB() {
  try {
    calendarData = {};
    upcomingTests = [];

    const res = await fetch("http://localhost:8000/api/topics", {
      credentials: "include",
    });

    const data = await res.json();
    const topics = data.topics || data;

    topics.forEach((topic) => {
      /* ===============================
         1️⃣ STUDIED DATE (GREEN TAG)
      =============================== */
      const studiedDate = new Date(topic.createdAt);
      const studiedKey = `${studiedDate.getFullYear()}-${studiedDate.getMonth() + 1}-${studiedDate.getDate()}`;

      if (!calendarData[studiedKey]) calendarData[studiedKey] = [];
      calendarData[studiedKey].push({
        name: topic.title,
        type: "studied",
      });

      /* ===============================
         2️⃣ REVISIONS
      =============================== */
      topic.revisions.forEach((rev) => {
        const d = new Date(rev.scheduledAt);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

        let type = "reschedule";

        if (rev.completed) type = "completed";
        else if (d < new Date()) type = "missed";

        if (!calendarData[key]) calendarData[key] = [];
        calendarData[key].push({
          name: topic.title,
          type,
        });

        // upcoming test = next incomplete revision
        if (!rev.completed && d >= new Date()) {
          upcomingTests.push({
            name: topic.title,
            date: d.toDateString(),
          });
        }
      });
    });

    initCalendar();
    initUpcomingTests();
  } catch (err) {
    console.error("Calendar load failed:", err);
  }
}

/***********************
 * CALENDAR
 ***********************/
function initCalendar() {
  const calendar = document.getElementById("calendar");
  const calendarHeader = document.querySelector(".calendar-header h3");

  calendarHeader.innerHTML = `
    <div style="display:flex;align-items:center;gap:15px;">
      <button onclick="changeMonth(-1)" style="background: #375534; border: none; color: #E3EED4; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 18px;">←</button>
      <span>📅 ${monthNames[currentMonth]} ${currentYear}</span>
      <button onclick="changeMonth(1)" style="background: #375534; border: none; color: #E3EED4; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 18px;">→</button>
    </div>
  `;

  calendar.innerHTML = "";

  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach((day) => {
    const h = document.createElement("div");
    h.className = "day-header";
    h.textContent = day;
    calendar.appendChild(h);
  });

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    calendar.appendChild(document.createElement("div"));
  }

  const today = new Date();
  const isCurrentMonth =
    today.getMonth() === currentMonth && today.getFullYear() === currentYear;

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
      calendarData[key].forEach((item) => {
        const tag = document.createElement("div");
        tag.className = "topic-tag";
        tag.style.background = getColorForType(item.type);
        tag.textContent = item.name;
        dayDiv.appendChild(tag);
      });
    }

    calendar.appendChild(dayDiv);
  }
}

function changeMonth(dir) {
  currentMonth += dir;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  initCalendar();
}

function getColorForType(type) {
  return (
    {
      studied: "#4C9F70",
      completed: "#3A7F7A",
      missed: "#b2a63bff",
      failed: "#D9534F",
      reschedule: "#F0AD4E",
    }[type] || "#F0AD4E"
  );
}

/***********************
 * UPCOMING TESTS
 ***********************/
function initUpcomingTests() {
  const list = document.getElementById("testList");
  list.innerHTML = "";

  upcomingTests.forEach((test) => {
    const div = document.createElement("div");
    div.className = "test-item";

    const info = document.createElement("div");
    info.className = "test-info";
    info.innerHTML = `
  <div class="test-name">${test.name}</div>
  <div class="test-date">${test.date}</div>
`;

    const btn = document.createElement("button");
    btn.className = "start-test-btn";
    btn.textContent = "Start Test";

    btn.addEventListener("click", async () => {
      await loadTestForTopic(test.name);
    });

    div.appendChild(info);
    div.appendChild(btn);
    list.appendChild(div);
  });
}

/***********************
 * DOM READY
 ***********************/
document.addEventListener("DOMContentLoaded", () => {
  const endDateInput = document.getElementById("endDate");

  const t = new Date();
  endDateInput.min = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;

  /***********************
   * ADD TOPIC
   ***********************/
  document
    .getElementById("topicForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const title = topicName.value;
      const description = document.getElementById("description").value;
      if (!description || description.trim().length < 20) {
        alert("Please enter proper study notes (at least 20 characters).");
        return;
      }

      const endDate = endDateInput.value;

      try {
        const res = await fetch("http://localhost:8000/api/topics/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ title, description, endDate }),
        });

        const data = await res.json();
        if (!res.ok) {
          alert(data.message || "Failed to create topic");
          return;
        }

        const topic = data.topic;

        const createdAt = new Date(topic.createdAt);
        const todayKey = `${createdAt.getFullYear()}-${createdAt.getMonth() + 1}-${createdAt.getDate()}`;

        if (!calendarData[todayKey]) calendarData[todayKey] = [];
        calendarData[todayKey].push({
          name: topic.title,
          type: "studied",
        });

        topic.revisions.forEach((r) => {
          const d = new Date(r.scheduledAt);
          const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

          if (!calendarData[key]) calendarData[key] = [];
          calendarData[key].push({
            name: topic.title,
            type: r.status || "reschedule",
          });

          upcomingTests.push({
            name: topic.title,
            date: d.toDateString(),
          });
        });

        initCalendar();
        initUpcomingTests();

        alert("Topic added & revisions scheduled!");
        this.reset();
      } catch (err) {
        console.error(err);
        alert("Something went wrong");
      }
    });

  initCalendar();
  initUpcomingTests();
  loadCalendarFromDB();
});
