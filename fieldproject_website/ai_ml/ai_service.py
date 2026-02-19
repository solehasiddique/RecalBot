from fastapi import FastAPI
from pydantic import BaseModel
import random
import re

app = FastAPI()


class QuestionRequest(BaseModel):
    notes: str
    memoryLevel: float  # 0 to 1


# ---------------------------
# TEXT PROCESSING
# ---------------------------

def extract_sentences(text):
    sentences = re.split(r'(?<=[.!?])\s+', text)
    return [s.strip() for s in sentences if len(s.strip()) > 40]


def extract_keywords(text):
    words = re.findall(r'\b[a-zA-Z]{6,}\b', text)
    words = list(set(words))
    return words


# ---------------------------
# MCQ GENERATION
# ---------------------------

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


# ---------------------------
# SHORT ANSWER
# ---------------------------

def generate_short(sentence):
    return {
        "type": "short",
        "question": f"In 2-3 lines, explain: {sentence}",
        "answer": sentence
    }


# ---------------------------
# LONG ANSWER
# ---------------------------

def generate_long(sentence):
    return {
        "type": "long",
        "question": f"Describe in detail: {sentence}",
        "answer": sentence
    }


# ---------------------------
# MAIN ENDPOINT
# ---------------------------

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

        selected_sentences = sentences[:3]

        for sentence in selected_sentences:

            # 🔥 MEMORY-BASED LOGIC
            if data.memoryLevel < 0.4:
                q = generate_mcq(sentence, keywords)

            elif data.memoryLevel < 0.7:
                if random.random() < 0.5:
                    q = generate_mcq(sentence, keywords)
                else:
                    q = generate_short(sentence)

            else:
                if random.random() < 0.5:
                    q = generate_short(sentence)
                else:
                    q = generate_long(sentence)

            if q:
                questions.append(q)

        if not questions:
            return {"success": False, "error": "Question generation failed"}

        return {
            "success": True,
            "questions": questions
        }

    except Exception as e:
        return {"success": False, "error": str(e)}
