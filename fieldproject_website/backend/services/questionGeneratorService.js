// services/questionGeneratorService.js
import { generateExamQuestions } from "./geminiService.js";
import { chunkTextByWords } from "../utils/textChunker.js";

const WORDS_PER_CHUNK = 2000;

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function getDistribution(memoryLevel) {
  if (memoryLevel < 0.4) return { mcq: 10, short: 0, long: 0 };
  if (memoryLevel < 0.7) return { mcq: 7, short: 2, long: 1 };
  return { mcq: 4, short: 3, long: 3 };
}

/* ============================================================
   SINGLE-SHOT PATH (notes small enough to fit in one prompt)
============================================================ */
function buildSingleShotPrompt(notes, memoryLevel, difficultyLevel, topicName) {
  return `
You are an adaptive exam generator.

MemoryLevel: ${memoryLevel}
DifficultyLevel: ${difficultyLevel}
TopicName: ${topicName}

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
- Short answer: 2-3 line explanation.
- Long answer: detailed conceptual explanation.
- Cover different concepts from the notes.
- Avoid repetition.
- Keep depth aligned with DifficultyLevel:
  - easy: direct recall, basic understanding
  - medium: applied understanding
  - hard: analytical and conceptual depth
- Generate questions strictly from TopicName context.
- If unrelated content exists in notes, ignore it.

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
}

async function generateSingleShot(notes, memoryLevel, difficultyLevel, topicName) {
  const prompt = buildSingleShotPrompt(notes, memoryLevel, difficultyLevel, topicName);
  const parsed = await generateExamQuestions(prompt);

  if (!parsed?.questions || !Array.isArray(parsed.questions)) {
    return { success: false, error: "Invalid question format" };
  }

  let questions = parsed.questions.slice(0, 10);
  while (questions.length < 10 && parsed.questions.length > 0) {
    questions.push(parsed.questions[questions.length % parsed.questions.length]);
  }

  return { success: true, questions };
}

/* ============================================================
   CHUNKED PATH (large notes — split, generate per chunk, merge)
============================================================ */
function buildChunkPrompt({ chunkText, chunkIndex, totalChunks, askCount, difficultyLevel, topicName }) {
  return `
You are an adaptive exam generator.

This is segment ${chunkIndex + 1} of ${totalChunks} from a larger set of notes on "${topicName}".

DifficultyLevel: ${difficultyLevel}

Generate UP TO ${askCount} questions strictly from THIS TEXT SEGMENT ONLY.
Label each with "type": "mcq" | "short" | "long" — use a mix, don't make them all the same type.

Strict Rules:
- MCQ must have exactly 4 options and 1 correct answer.
- Short answer: 2-3 line explanation.
- Long answer: detailed conceptual explanation.
- Cover different concepts; never repeat the same concept twice.
- Keep depth aligned with DifficultyLevel.
- If this segment doesn't have enough distinct concepts, return fewer questions rather than repeating.
- If unrelated content exists, ignore it.

Return ONLY valid JSON:
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

IMPORTANT: Include "options" ONLY for mcq.

Text segment:
${chunkText}
`;
}

function mergeToDistribution(pool, distribution) {
  const byType = { mcq: [], short: [], long: [] };

  pool.forEach((q) => {
    if (byType[q?.type]) byType[q.type].push(q);
  });

  const picked = [
    ...byType.mcq.slice(0, distribution.mcq),
    ...byType.short.slice(0, distribution.short),
    ...byType.long.slice(0, distribution.long),
  ];

  const totalNeeded = distribution.mcq + distribution.short + distribution.long;

  // Backfill with leftovers (any type) if a chunk under-delivered on a category
  if (picked.length < totalNeeded) {
    const usedSet = new Set(picked);
    const leftovers = pool.filter((q) => !usedSet.has(q));
    for (const q of leftovers) {
      if (picked.length >= totalNeeded) break;
      picked.push(q);
    }
  }

  return picked.slice(0, totalNeeded);
}

async function generateChunked(notes, memoryLevel, difficultyLevel, topicName) {
  const chunks = chunkTextByWords(notes, WORDS_PER_CHUNK);
  if (!chunks.length) {
    return { success: false, error: "Could not chunk notes" };
  }

  console.log(`📄 Split notes into ${chunks.length} chunk(s) (~${WORDS_PER_CHUNK} words each)`);

  const distribution = getDistribution(memoryLevel);
  const totalNeeded = distribution.mcq + distribution.short + distribution.long;

  // Ask each chunk for a bit more than its even share, so the merge step has
  // enough of each type to pick from even if some chunks underperform.
  const perChunkAsk = Math.max(2, Math.ceil((totalNeeded * 1.5) / chunks.length));

  const chunkResults = await Promise.all(
    chunks.map(async (chunkText, i) => {
      try {
        const prompt = buildChunkPrompt({
          chunkText,
          chunkIndex: i,
          totalChunks: chunks.length,
          askCount: perChunkAsk,
          difficultyLevel,
          topicName,
        });

        const parsed = await generateExamQuestions(prompt);
        return Array.isArray(parsed?.questions) ? parsed.questions : [];
      } catch (err) {
        console.error(`Chunk ${i + 1} generation failed:`, err.message);
        return [];
      }
    })
  );

  const allQuestions = chunkResults.flat();

  if (!allQuestions.length) {
    return { success: false, error: "No questions could be generated from notes" };
  }

  const finalQuestions = mergeToDistribution(allQuestions, distribution);

  if (finalQuestions.length < totalNeeded) {
    console.warn(
      `⚠️ Only got ${finalQuestions.length}/${totalNeeded} questions after merging chunks`
    );
  }

  return { success: true, questions: finalQuestions };
}

/* ============================================================
   PUBLIC ENTRY POINT (same signature as before)
============================================================ */
export const generateQuestions = async (
  notes,
  memoryLevel,
  difficultyLevel = "medium",
  topicName = ""
) => {
  try {
    if (!notes || notes.trim().length < 50) {
      return { success: false, error: "Insufficient notes content" };
    }

    if (typeof memoryLevel !== "number") {
      return { success: false, error: "Invalid memory level" };
    }

    const wordCount = countWords(notes);

    if (wordCount <= WORDS_PER_CHUNK) {
      return await generateSingleShot(notes, memoryLevel, difficultyLevel, topicName);
    }

    return await generateChunked(notes, memoryLevel, difficultyLevel, topicName);
  } catch (err) {
    console.error("Question Generation Error:", err.message);
    return { success: false, error: err.message };
  }
};