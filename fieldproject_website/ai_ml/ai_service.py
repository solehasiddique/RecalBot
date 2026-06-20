from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import json
import numpy as np
import random
import re

app = FastAPI()

# ===============================
# LOAD ML MODEL
# ===============================

model = joblib.load("model.pkl")

with open("columns.json", "r") as f:
    columns = json.load(f)
    print("MODEL COLUMNS:", columns, flush=True)
print(columns)


# ===============================
# MEMORY PREDICTION
# ===============================

class MemoryRequest(BaseModel):
    answers: dict


@app.post("/predict")
def predict_memory(data: MemoryRequest):
    input_vector = np.zeros(len(columns))

    matched = []
    unmatched = []
    for key, value in data.answers.items():
        if key in columns:
            input_vector[columns.index(key)] = value
            matched.append(key)
        else:
            unmatched.append(key)

    print("✅ MATCHED:", matched, flush=True)

    print("❌ UNMATCHED:", unmatched, flush=True)

    print("ACTIVE FEATURES:", active_features, flush=True)

    active_features = int(input_vector.sum())
    prediction = int(model.predict([input_vector])[0])

    # Smooth percentage logic
    if prediction == 0:
        percentage = random.randint(25, 45)
        label = "WEAK"
    elif prediction == 1:
        percentage = random.randint(50, 75)
        label = "MEDIUM"
    else:
        percentage = random.randint(80, 95)
        label = "STRONG"

    percentage += min(active_features, 5)
    percentage = min(percentage, 98)

    return {
        "score": prediction,
        "label": label,
        "percentage": percentage,
        "active_features": active_features
    }


# ===============================
# QUESTION GENERATION
# ===============================

class QuestionRequest(BaseModel):
    notes: str
    memoryLevel: float


def extract_sentences(text):
    sentences = re.split(r'(?<=[.!?])\s+', text)
    return [s.strip() for s in sentences if len(s.strip()) > 40]


def extract_keywords(text):
    words = re.findall(r'\b[a-zA-Z]{6,}\b', text)
    return list(set(words))


def generate_mcq(sentence, keywords):
    valid_keywords = [k for k in keywords if k in sentence]
    if not valid_keywords:
        return None

    correct = random.choice(valid_keywords)
    question_text = sentence.replace(correct, "______", 1)

    distractor_pool = [k for k in keywords if k != correct]
    distractors = random.sample(distractor_pool, min(3, len(distractor_pool)))

    while len(distractors) < 3:
        distractors.append("None of the above")

    options = distractors + [correct]
    random.shuffle(options)

    return {
        "type": "mcq",
        "question": question_text,
        "options": options,
        "answer": correct
    }


def generate_short(sentence):
    return {
        "type": "short",
        "question": f"In 2-3 lines, explain: {sentence}",
        "answer": sentence
    }


def generate_long(sentence):
    return {
        "type": "long",
        "question": f"Describe in detail: {sentence}",
        "answer": sentence
    }


@app.post("/generate")
def generate_questions(data: QuestionRequest):
    try:
        text = data.notes.strip()

        if len(text) < 80:
            return {"success": False, "error": "Not enough content"}

        sentences = extract_sentences(text)
        keywords = extract_keywords(text)

        if not sentences:
            return {"success": False, "error": "Could not extract sentences"}

        questions = []
        selected_sentences = sentences[:10]

        for sentence in selected_sentences:
            if data.memoryLevel < 0.4:
                q = generate_mcq(sentence, keywords)

            elif data.memoryLevel < 0.7:
                q = generate_mcq(sentence, keywords) if random.random() < 0.5 else generate_short(sentence)

            else:
                q = generate_short(sentence) if random.random() < 0.5 else generate_long(sentence)

            if q:
                questions.append(q)

        return {
            "success": True,
            "questions": questions[:10]
        }

    except Exception as e:
        return {"success": False, "error": str(e)}
    
@app.get("/columns")
def get_columns():
     return {"columns": columns}