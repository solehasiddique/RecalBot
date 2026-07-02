# RecallBot 🧠

### AI-Powered Adaptive Learning and Memory Retention Platform

**Live Demo:** https://recal-bot.vercel.app/

RecallBot helps students retain knowledge better by personalizing revision schedules based on their memory strength. Instead of generic study reminders, the platform predicts your memory retention profile using Machine Learning and adapts your revision schedule dynamically based on how you perform.

---

## The Problem

Learning new information is easy. Remembering it two weeks later is not.

Traditional study tools treat every student the same. RecallBot doesn't — it builds a memory profile for each user and adjusts revision frequency, question difficulty, and test type based on real performance data.

---

## Core Features

- **Memory Retention Prediction** — ML model (Logistic Regression) classifies users as Weak, Medium, or Strong based on a learning questionnaire
- **Adaptive Spaced Repetition** — revision intervals are generated from your memory profile and updated after every test
- **AI Question Generation** — upload your notes or PDFs, Gemini AI generates MCQ, short answer, and long answer questions from your actual study material
- **PDF Chunking Pipeline** — large PDFs are split into segments and processed independently to handle context limits reliably
- **AI Answer Evaluation** — subjective answers are graded by AI with feedback
- **Learning Analytics Dashboard** — track revision completion, test scores, study streaks, and weekly activity
- **Knowledge Management** — upload and organize notes by topic

---

## Tech Stack

**Frontend**

- HTML, CSS, JavaScript
- Hosted on Vercel

**Backend**

- Node.js, Express.js
- Hosted on Railway

**Database**

- MongoDB Atlas, Mongoose

**Authentication**

- JWT, Bcrypt, Secure Cookie Sessions

**AI / ML**

- Google Gemini API (question generation + answer evaluation)
- Python, Scikit-Learn, Pandas (memory retention ML model)
- FastAPI (ML service)

---

## Architecture

```
Frontend (Vercel)
       ↓
Backend API (Railway)
       ↓
  ┌────────────────┐
  │  MongoDB Atlas │
  │  Gemini API    │
  │  FastAPI + ML  │
  └────────────────┘
```

---

## ML Component

The memory prediction model is trained on student questionnaire data and classifies users into three retention categories:

| Class | Label  | Revision Interval |
| ----- | ------ | ----------------- |
| 0     | Weak   | Every 1 day       |
| 1     | Medium | Every 3 days      |
| 2     | Strong | Every 7 days      |

Models evaluated: Logistic Regression, Decision Tree, Random Forest.

After each revision test, the user's memory score is recalculated and intervals are updated dynamically.

---

## Project Status

This project began as a college team project. I built the backend fully and am currently extending it independently with:

- Rebuilt ML pipeline on real collected user data
- Gemini API integration with PDF chunking
- Admin analytics dashboard (in progress)
- Research paper on ML-driven adaptive spaced repetition (in progress)

---

## Research

A research paper is currently being written on the adaptive learning system — specifically the ML-driven spaced repetition model and its effectiveness on student memory retention.

Target: EdTech / ML conference submission (2025)

---

## Local Setup

**Backend**

```bash
cd backend
npm install
cp .env.example .env   # add your MongoDB URI, JWT secret, Gemini API key
npm start
```

**ML Service**

```bash
cd ai_ml
pip install -r requirements.txt
uvicorn ai_service:app --reload
```

**Frontend**

Open `frontend/html/index.html` in your browser or use Live Server.

---

## Contact

**Soleha Siddique**

https://www.linkedin.com/in/soleha-siddique-a2351b368/

solehasiddique07@gmail.com
