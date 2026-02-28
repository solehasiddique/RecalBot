/***********************
 * QUESTIONS
 ***********************/
const questions = [
  {
    number: 1,
    text: "How long can you study before losing focus?",
    type: "radio",
    name: "q1",
    options: [
      "Less than 15 minutes",
      "15–25 minutes",
      "25–40 minutes",
      "More than 40 minutes"
    ]
  },
  {
    number: 2,
    text: "You remember things best when you:",
    type: "radio",
    name: "q2",
    options: [
      "Reread / rewrite",
      "Solve questions",
      "Explain in your words",
      "Revise many times"
    ]
  },
  {
    number: 3,
    text: "Which environment helps you focus best?",
    type: "radio",
    name: "q3",
    options: [
      "Silence",
      "Soft music",
      "Nature sounds",
      "No preference"
    ]
  },
  {
    number: 4,
    text: "After studying once, how long do you remember without revision?",
    type: "radio",
    name: "q4",
    options: [
      "Few hours",
      "1 day",
      "2–3 days",
      "A week or more"
    ]
  },
  {
    number: 5,
    text: "If you revise once, memory becomes:",
    type: "radio",
    name: "q5",
    options: [
      "Still forget fast",
      "Slightly better",
      "Very strong",
      "Remember till exams"
    ]
  },
  {
    number: 6,
    text: "When revision is delayed, what happens?",
    type: "radio",
    name: "q6",
    options: [
      "Forget almost everything",
      "Remember some parts",
      "Remember most"
    ]
  },
  {
    number: 7,
    text: "If you miss a session, what do you prefer?",
    type: "radio",
    name: "q7",
    options: [
      "Immediate reschedule",
      "Adjust later",
      "Ignore & move on"
    ]
  },
  {
    number: 8,
    text: "What type of revision helps you most?",
    type: "radio",
    name: "q8",
    options: [
      "Self-testing",
      "Rereading",
      "Writing / Explaining",
      "Mixed"
    ]
  },
  {
    number: 9,
    text: "In which area do you feel weak the most?",
    type: "radio",
    name: "q9",
    options: [
      "Remembering concepts",
      "Applying concepts",
      "Writing answers",
      "Time management"
    ]
  },
  {
    number: 10, // Open-ended question which won't be used in ML
    text: "Which subjects or topics trouble you the most?",
    type: "text",
    name: "q10",
    placeholder: "E.g., Mathematics, Physics, History..."
  }
];

/***********************
 * STATE
 ***********************/
let currentQuestion = 0;
const answers = {};

/***********************
 * ML MAPPING
 ***********************/
const QUESTION_TO_ML_MAP = {
  q1: {
    "Less than 15 minutes":
      "How long can you study before losing focus?_Less than 15 minute",
    "15–25 minutes":
      "How long can you study before losing focus?_15 to 25 minutes",
    "25–40 minutes":
      "How long can you study before losing focus?_25 to 40 minutes",
    "More than 40 minutes":
      "How long can you study before losing focus?_More than 40 minutes"
  },

  q2: {
    "Reread / rewrite":
      "You remember things best when you:_Reread or rewrite",
    "Solve questions":
      "You remember things best when you:_Solve questions",
    "Explain in your words":
      "You remember things best when you:_Explain in your own words",
    "Revise many times":
      "You remember things best when you:_Revise multiple times"
  },

  q3: {
    "Silence":
      "Which environment helps you focus best?_Complete silence",
    "Soft music":
      "Which environment helps you focus best?_Soft music",
    "Nature sounds":
      "Which environment helps you focus best?_Nature sounds",
    "No preference":
      "Which environment helps you focus best?_No preference"
  },

  q4: {
    "Few hours":
      "After studying once, how long do you remember the content without revision?_A few hours",
    "1 day":
      "After studying once, how long do you remember the content without revision?_One day",
    "2–3 days":
      "After studying once, how long do you remember the content without revision?_Two to three days",
    "A week or more":
      "After studying once, how long do you remember the content without revision?_A week or more"
  },

  q5: {
    "Still forget fast":
      "If you revise once, memory becomes:_Still forget fast",
    "Slightly better":
      "If you revise once, memory becomes:_Slightly better",
    "Very strong":
      "If you revise once, memory becomes:_Very strong",
    "Remember till exams":
      "If you revise once, memory becomes:_Remember till exams"
  },

  q6: {
    "Forget almost everything":
      "When revision is delayed, what usually happens?_I forget almost everything",
    "Remember some parts":
      "When revision is delayed, what usually happens?_I remember some parts",
    "Remember most":
      "When revision is delayed, what usually happens?_I remember most of it"
  },

  q7: {
    "Immediate reschedule":
      "If you miss a study session, what do you prefer to do?_Reschedule immediately",
    "Adjust later":
      "If you miss a study session, what do you prefer to do?_Adjust later",
    "Ignore & move on":
      "If you miss a study session, what do you prefer to do?_Ignore it and move on"
  },

  q8: {
    "Self-testing":
      "What type of revision helps you the most?_Self testing",
    "Rereading":
      "What type of revision helps you the most?_Rereading",
    "Writing / Explaining":
      "What type of revision helps you the most?_Writing or explaining",
    "Mixed":
      "What type of revision helps you the most?_A mix of methods"
  },

  q9: {
    "Remembering concepts":
      "In which area do you feel the weakest?_Remembering concepts",
    "Applying concepts":
      "In which area do you feel the weakest?_Applying concepts",
    "Writing answers":
      "In which area do you feel the weakest?_Writing answers",
    "Time management":
      "In which area do you feel the weakest?_Time management"
  }
};


/***********************
 * RENDER QUESTION
 ***********************/
function renderQuestion() {
  const q = questions[currentQuestion];
  const display = document.getElementById("questionDisplay");

  let html = `
    <div class="question-block">
      <div class="question-number">QUESTION ${q.number}</div>
      <div class="question-text">${q.text}</div>
  `;

  if (q.type === "radio") {
    html += `<div class="options-container">`;
    q.options.forEach(option => {
      const checked = answers[q.name] === option ? "checked" : "";
      html += `
        <label class="option-label">
          <input type="radio" name="${q.name}" value="${option}" ${checked}
            onchange="saveAnswer('${q.name}', this.value)">
          <span>${option}</span>
        </label>
      `;
    });
    html += `</div>`;
  } else {
    html += `
      <div class="text-input-wrapper">
        <textarea
          class="text-input"
          rows="3"
          placeholder="${q.placeholder}"
          oninput="handleTextInput('${q.name}', this.value)"
        >${answers[q.name] || ""}</textarea>

        
      </div>
    `;
  }

  

  html += `</div>`;
  display.innerHTML = html;

  updateProgress();

  // After display.innerHTML = html;

const submitSlot = document.getElementById("submitPlaceholder");
if (q.type === "text") {
  submitSlot.innerHTML = `
   <button class="btn btn-continue submit-text-btn" onclick="submitTextAnswer('${q.name}')">
          Submit
        </button>
  `;
} else {
  submitSlot.innerHTML = "";
}
  
}

/***********************
 * ANSWER HANDLING
 ***********************/
function saveAnswer(name, value) {
  answers[name] = value;
  autoAdvance();
}

function handleTextInput(name, value) {
  answers[name] = value;
}

function submitTextAnswer(name) {
  if (!answers[name]?.trim()) {
    alert("Please enter your answer");
    return;
  }
  autoAdvance();
}

/***********************
 * NAVIGATION
 ***********************/
function autoAdvance() {
  if (currentQuestion === questions.length - 1) {
    submitAssessment();
  } else {
    currentQuestion++;
    renderQuestion();
  }
}

function previousQuestion() {
  if (currentQuestion > 0) {
    currentQuestion--;
    renderQuestion();
  }
}

/***********************
 * PROGRESS
 ***********************/
function updateProgress() {
  const current = currentQuestion + 1;
  const total = questions.length;
  const percent = Math.round((current / total) * 100);

  document.getElementById("currentQ").innerText = current;
  document.getElementById("progressPercent").innerText = percent + "%";
  document.getElementById("progressBar").style.width = percent + "%";

  document.getElementById("prevBtn").disabled = currentQuestion === 0;
}

/***********************
 * ML PAYLOAD (UNCHANGED)
 ***********************/
function convertAnswersToMLFeatures() {
  const features = {};
  Object.keys(QUESTION_TO_ML_MAP).forEach(q => {
    const ans = answers[q];
    const col = QUESTION_TO_ML_MAP[q]?.[ans];
    if (col) features[col] = 1;
  });
  return features;
}

/***********************
 * SUBMIT FINAL
 ***********************/
async function submitAssessment() {
  try {
    const submitRes = await fetch("http://localhost:8000/api/auth/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(answers)
    });
    const submitData = await submitRes.json();
    if (!submitRes.ok) {
      if (submitData?.redirect) {
        window.location.href = submitData.redirect;
        return;
      }
      throw new Error(submitData?.message || "Questionnaire submit failed");
    }

    const mlFeatures = convertAnswersToMLFeatures();

    const res = await fetch("http://localhost:8000/api/memory/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(mlFeatures)
    });

    const data = await res.json();
    alert(`Initial Memory Strength: ${data.label} (${data.percentage}%)`);

    window.location.href = submitData.redirect || "../html/profile.html";

  } catch (err) {
    console.error(err);
    alert("Submission failed");
  }
}

/***********************
 * INIT
 ***********************/
async function initQuestionaryPage() {
  try {
    const res = await fetch("http://localhost:8000/api/auth/profile", {
      credentials: "include",
    });

    if (!res.ok) {
      window.location.href = "../html/signin.html";
      return;
    }

    const data = await res.json();
    const user = data?.user || {};

    if (user.hasCompletedAssessment) {
      window.location.href = user.profileCompleted
        ? "../html/dashboard.html"
        : "../html/profile.html";
      return;
    }

    renderQuestion();
  } catch (_err) {
    window.location.href = "../html/signin.html";
  }
}

initQuestionaryPage();
