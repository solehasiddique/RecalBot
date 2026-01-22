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
        number: 10,
        text: "Which subjects or topics trouble you the most?",
        type: "text",
        name: "q10",
        placeholder: "E.g., Mathematics, Physics, History..."
    }
];

let currentQuestion = 0;
const answers = {};

function renderQuestion() {
    const q = questions[currentQuestion];
    const display = document.getElementById('questionDisplay');

    let html = `
                <div class="question-block">
                    <div class="question-number">QUESTION ${q.number}</div>
                    <div class="question-text">${q.text}</div>
            `;

    if (q.type === 'radio') {
        html += '<div class="options-container">';
        q.options.forEach((option, index) => {
            const isChecked = answers[q.name] === option ? 'checked' : '';
            html += `
                        <label class="option-label">
                            <input type="radio" name="${q.name}" value="${option}" ${isChecked} onchange="saveAnswer('${q.name}', this.value)">
                            <span class="option-text">${option}</span>
                        </label>
                    `;
        });
        html += '</div>';
    } else if (q.type === 'text') {
        const value = answers[q.name] || '';
        html += `
                    <input type="text" class="text-input" id="textInput_${q.name}" name="${q.name}" value="${value}" placeholder="${q.placeholder}" oninput="handleTextInput('${q.name}', this.value)">
                    <div class="text-input-helper">
                        <button class="submit-text-btn" onclick="submitTextAnswer('${q.name}')">Continue</button>
                    </div>
                `;
    }

    html += '</div>';
    display.innerHTML = html;

    updateProgress();
    updateButtons();
}

function saveAnswer(name, value) {
    answers[name] = value; //ans save
    autoAdvance();//move automatiaaly to next quest
}

function handleTextInput(name, value) {
    answers[name] = value; //text input ans save
}

function submitTextAnswer(name) {   //prevent empty submission 
    const input = document.getElementById('textInput_' + name);
    if (!input.value.trim()) {
        alert('Please enter your answer before continuing.');
        return;
    }
    answers[name] = input.value;
    autoAdvance();
}

function autoAdvance() {
    const q = questions[currentQuestion];

    // Only auto-advance if answer is provided
    if (answers[q.name] && answers[q.name].trim() !== '') {
        setTimeout(() => {
            if (currentQuestion === questions.length - 1) {
                submitAssessment();
            } else {
                currentQuestion++;
                renderQuestion();
            }
        }, 600); // Small delay for smooth transition
    }
}

function updateProgress() {  //progressbar
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
    document.getElementById('currentQ').textContent = currentQuestion + 1;
    document.getElementById('progressPercent').textContent = Math.round(progress) + '%';
}

function updateButtons() {  //disable prvs btn on first quest
    const prevBtn = document.getElementById('prevBtn');
    prevBtn.disabled = currentQuestion === 0;
}

function previousQuestion() {  
    if (currentQuestion > 0) {
        currentQuestion--;
        renderQuestion();
    }
}

async function submitAssessment() {
  try {
    const res = await fetch("http://localhost:8000/api/auth/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(answers)
    });

    if (!res.ok) {
      alert("Session expired. Please sign in again.");
      window.location.href = "signin.html";
      return;
    }

    alert("Assessment submitted successfully! Your personalized learning plan is being generated.");
    window.location.href = "../html/study.html";
  } catch (err) {
    alert("Failed to submit assessment.");
    console.error(err);
  }
}


// Initialize
renderQuestion();