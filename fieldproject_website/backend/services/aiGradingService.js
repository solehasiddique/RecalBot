// services/aiGradingService.js
import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const gradeAnswerWithAI = async (
  question,
  correctAnswer,
  userAnswer
) => {
  try {
    const prompt = `
You are a strict academic grader.

Question:
${question}

Correct Answer:
${correctAnswer}

Student Answer:
${userAnswer}

Return ONLY valid JSON in this exact format:
{
  "score": number between 0 and 1,
  "feedback": "Short explanation"
}
`;

    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(res.text);

    return {
      score: Math.max(0, Math.min(1, parsed.score)),
      feedback: parsed.feedback,
    };
  } catch (err) {
    console.error("AI Grading Error:", err.message);
    return { score: 0, feedback: "Evaluation failed." };
  }
};