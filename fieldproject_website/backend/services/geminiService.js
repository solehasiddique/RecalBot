import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function generateExamQuestions(prompt) {
  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  const text = res.text;

  try {
    return JSON.parse(text);
  } catch (e) {
    console.log("RAW MODEL OUTPUT:\n", text);
    throw new Error("Invalid JSON from Gemini");
  }
}