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

async function loadUserNotesDropdown() {
  const select = document.getElementById("notesSelect");
  if (!select) return;

  try {
    const res = await fetch(`${BASE_URL}/api/profile/notes`, {
      credentials: "include",
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to load notes");
    }

    const notes = data.notes || [];

    if (!notes.length) {
      select.innerHTML =
        '<option value="">No uploaded notes found. Upload in Profile page.</option>';
      return;
    }

    select.innerHTML = '<option value="">Select a note</option>';
    notes.forEach((note) => {
      const option = document.createElement("option");
      option.value = note._id;
      const subject = note.subject ? ` (${note.subject})` : "";
      option.textContent = `${note.subject || note.title || "Untitled"}${subject}`;
      select.appendChild(option);
    });
  } catch (err) {
    console.error("Failed loading notes:", err);
    select.innerHTML = '<option value="">Unable to load notes</option>';
  }
}

/***********************
 * LOAD CALENDAR FROM DB (SINGLE SOURCE)
 ***********************/
async function loadCalendarFromDB() {
  try {
    calendarData = {};
    upcomingTests = [];

    const res = await fetch(`${BASE_URL}/api/topics`, {
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
================================ */
      topic.revisions.forEach((rev) => {
        const d = new Date(rev.scheduledAt);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

        let type = "reschedule";

        // ✅ Correct status-based logic
        if (rev.status === "completed") {
          type = "completed";
        } else if (rev.status === "missed") {
          type = "missed";
        } else if (rev.status === "scheduled" && d < new Date()) {
          type = "missed";
        }

        if (!calendarData[key]) calendarData[key] = [];

        calendarData[key].push({
          name: topic.title,
          type,
        });

        // ✅ Upcoming tests should only show scheduled future revisions
        if (rev.status === "scheduled" && d >= new Date()) {
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
      const endDate = endDateInput.value;
      const selectedNoteId = document.getElementById("notesSelect").value;
      const difficultyLevel = document.getElementById("difficultyLevel").value;

      if (!selectedNoteId) {
        alert("Please select one uploaded note.");
        return;
      }

      try {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("endDate", endDate);
        formData.append("noteId", selectedNoteId);
        formData.append("difficultyLevel", difficultyLevel);

        const res = await fetch(`${BASE_URL}/api/topics/create`, {
          method: "POST",
          credentials: "include",
          body: formData,
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
        await loadUserNotesDropdown();
      } catch (err) {
        console.error(err);
        alert("Something went wrong");
      }
    });

  initCalendar();
  initUpcomingTests();
  loadCalendarFromDB();
  loadUserNotesDropdown();
});
