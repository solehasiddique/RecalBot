from fastapi import FastAPI
from pydantic import BaseModel
import random
import re

app = FastAPI()

class QuestionRequest(BaseModel):
    notes: str
    memoryLevel: float  # 0 to 1


def extract_sentences(text):
    sentences = re.split(r'(?<=[.!?]) +', text)
    return [s.strip() for s in sentences if len(s.strip()) > 20]


def extract_keywords(text):
    words = re.findall(r'\b[A-Z][a-zA-Z]+\b', text)
    return list(set(words))


def generate_mcq(sentence, keywords):
    words = sentence.split()
    if not keywords:
        return None

    correct = random.choice(keywords)
    question_text = sentence.replace(correct, "______")

    distractors = random.sample(
        [k for k in keywords if k != correct],
        min(3, len(keywords)-1)
    )

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
        "question": f"Explain briefly: {sentence}",
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
        sentences = extract_sentences(data.notes)
        keywords = extract_keywords(data.notes)

        if not sentences:
            return {"success": False, "error": "Not enough content"}

        questions = []

        for sentence in sentences[:3]:

            if True:
                q = generate_mcq(sentence, keywords)

            elif data.memoryLevel < 0.7:
                q = generate_short(sentence)

            else:
                q = generate_long(sentence)

            if q:
                questions.append(q)

        return {
            "success": True,
            "questions": questions
        }

    except Exception as e:
        return {"success": False, "error": str(e)}
