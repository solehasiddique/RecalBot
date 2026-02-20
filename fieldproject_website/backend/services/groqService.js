import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const generateQuestionsWithGroq = async (
  notes,
  memoryLevel, // 0 → 1
) => {
  try {
    if (!notes || notes.length < 50) {
      return { success: false, error: "Insufficient notes content" };
    }

    if (typeof memoryLevel !== "number") {
      return { success: false, error: "Invalid memory level" };
    }

    const prompt = `
You are an adaptive exam generator.

MemoryLevel: ${memoryLevel}

Generate EXACTLY 10 questions from the notes.

Distribution Rules:

If MemoryLevel < 0.4:
- 10 MCQ

If 0.4 <= MemoryLevel < 0.7:
- 7 MCQ
- 2 Short Answer
- 1 Long Answer

If MemoryLevel >= 0.7:
- 4 MCQ
- 3 Short Answer
- 3 Long Answer

Strict Rules:
- Total questions must be exactly 10.
- Follow distribution exactly.
- MCQ must have exactly 4 options and 1 correct answer.
- Short answer: 2–3 line explanation.
- Long answer: detailed conceptual explanation.
- Cover different concepts from the notes.
- Avoid repetition.

Return ONLY valid JSON in this exact format:

{
  "questions": [
    {
      "type": "mcq" | "short" | "long",
      "question": "Question text",
      "options": ["A","B","C","D"], 
      "answer": "Correct answer text"
    }
  ]
}

IMPORTANT:
- Include "options" field ONLY for mcq.
- Do NOT include options for short or long.

Notes:
${notes}
`;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You generate structured exam questions." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    const raw = response?.choices?.[0]?.message?.content;

    if (!raw) {
      return { success: false, error: "Empty AI response" };
    }

    // Extract JSON block safely
    const jsonMatch = raw.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return { success: false, error: "AI did not return valid JSON" };
    }

    let parsed;

    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      return { success: false, error: "JSON parsing failed" };
    }

    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      return { success: false, error: "Invalid question format" };
    }

    // Ensure exactly 10 questions
    let questions = parsed.questions.slice(0, 10);

    // If less than 10, duplicate some (rare fallback)
    while (questions.length < 10 && parsed.questions.length > 0) {
      questions.push(
        parsed.questions[questions.length % parsed.questions.length],
      );
    }

    return {
      success: true,
      questions: parsed.questions,
    };
  } catch (err) {
    console.error("Groq Error:", err.message);
    return { success: false, error: err.message };
  }
};
