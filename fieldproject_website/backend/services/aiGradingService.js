import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const gradeAnswerWithAI = async (
  question,
  correctAnswer,
  userAnswer
) => {
  try {
    const prompt = `
You are grading a student's answer.

Question:
${question}

Correct Answer:
${correctAnswer}

Student Answer:
${userAnswer}

Return JSON:
{
  "score": number between 0 and 1,
  "feedback": "Short explanation"
}
`;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are a strict academic grader." },
        { role: "user", content: prompt },
      ],
      temperature: 0,
    });

    const raw = response.choices[0].message.content;
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch[0]);

    return {
      score: Math.max(0, Math.min(1, parsed.score)),
      feedback: parsed.feedback
    };

  } catch (err) {
    console.error("AI Grading Error:", err.message);
    return { score: 0, feedback: "Evaluation failed." };
  }
};
