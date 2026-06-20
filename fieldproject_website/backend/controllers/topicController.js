import fs from "fs";
import { PDFParse } from "pdf-parse";

import Topic from "../models/Topic.js";
import User from "../models/User.js";
import Note from "../models/Note.js";
import { generateInitialRevisions } from "../utils/revisionScheduler.js";
import { generateQuestions } from "../services/questionGeneratorService.js";
import { gradeAnswerWithAI } from "../services/aiGradingService.js";

const extractPdfText = async (dataBuffer) => {
  const parser = new PDFParse({ data: dataBuffer });
  try {
    const result = await parser.getText();
    return result?.text || "";
  } finally {
    await parser.destroy().catch(() => {});
  }
};

const extractRelevantNotesByTopic = (notesText, topicName) => {
  if (!notesText) return { text: "", matched: false };
  if (!topicName || topicName.trim().length < 2) {
    return { text: notesText, matched: true };
  }

  const topic = topicName.trim().toLowerCase();
  const stopWords = new Set([
    "the", "and", "for", "with", "from", "that", "this", "into", "your",
    "have", "has", "are", "was", "were", "about", "chapter", "topic", "unit",
    "part", "day", "level", "exam", "date",
  ]);

  const topicWords = topic
    .split(/[^a-z0-9]+/i)
    .map((w) => w.trim().toLowerCase())
    .filter((w) => w.length > 2 && !stopWords.has(w));

  if (!topicWords.length) {
    return { text: notesText, matched: true };
  }

  const paragraphs = notesText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const sourceChunks = paragraphs.length
    ? paragraphs
    : notesText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const scored = sourceChunks
    .map((chunk) => {
      const normalized = chunk.toLowerCase();
      let score = 0;

      if (normalized.includes(topic)) score += 8;
      topicWords.forEach((word) => {
        if (normalized.includes(word)) score += 2;
      });

      return { chunk, score };
    })
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score);

  if (!scored.length) {
    return { text: "", matched: false };
  }

  const selected = scored
    .slice(0, 8)
    .map((c) => c.chunk)
    .join("\n\n")
    .trim();

  if (selected.length < 50) {
    return { text: "", matched: false };
  }

  return { text: selected, matched: true };
};

/* =====================================================
   CREATE TOPIC
===================================================== */
export const createTopic = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const { title, description, endDate, noteId, difficultyLevel } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title required" });
    }

    let notesContent = description || "";

    if (noteId) {
      const note = await Note.findOne({ _id: noteId, user: req.user.id });
      if (!note) {
        return res.status(404).json({ message: "Selected note not found" });
      }

      const notePath = note.filePath;
      const noteExt = (note.fileExt || "").toLowerCase();

      if (noteExt === "pdf") {
        const dataBuffer = fs.readFileSync(notePath);
        notesContent = await extractPdfText(dataBuffer);
      } else if (
        ["txt", "md", "csv", "json", "xml", "html"].includes(noteExt)
      ) {
        notesContent = fs.readFileSync(notePath, "utf8");
      } else {
        return res.status(400).json({
          message:
            "Selected note format is not supported for topic generation. Use PDF or TXT notes.",
        });
      }
    }

    if (req.file) {
      const filePath = req.file.path;

      if (req.file.mimetype === "application/pdf") {
        const dataBuffer = fs.readFileSync(filePath);
        notesContent = await extractPdfText(dataBuffer);
      } else {
        notesContent = fs.readFileSync(filePath, "utf8");
      }
    }

    if (!notesContent || notesContent.trim().length < 20) {
      return res.status(400).json({
        message: "Insufficient notes content",
      });
    }

    const { revisions, nextRevisionAt } = generateInitialRevisions(
      user.memoryProfile,
      endDate,
    );

    const relevant = extractRelevantNotesByTopic(notesContent, title);
    if (!relevant.matched) {
      return res.status(400).json({
        message:
          "Topic not found clearly in selected notes. Use the exact chapter/topic name from your notes.",
      });
    }

    const topic = await Topic.create({
      user: user._id,
      title,
      difficultyLevel: ["easy", "medium", "hard"].includes(
        String(difficultyLevel || "").toLowerCase(),
      )
        ? String(difficultyLevel).toLowerCase()
        : "medium",
      description,
      notesContent: relevant.text,
      sourceNote: noteId || null,
      endDate,
      initialMemoryProfile: user.memoryProfile,
      revisions,
      nextRevisionAt,
    });

    return res.status(201).json({
      message: "Topic created & first revision scheduled",
      topic,
    });
  } catch (err) {
    console.error("🔥 TOPIC CREATE ERROR:", err);
    return res.status(500).json({
      message: "Topic creation failed",
      error: err.message,
    });
  }
};

/* =====================================================
   GET USER TOPICS
===================================================== */
export const getUserTopics = async (req, res) => {
  try {
    const topics = await Topic.find({ user: req.user.id });
    return res.json({ topics });
  } catch (err) {
    return res.status(500).json({ message: "Failed to load topics" });
  }
};

/* =====================================================
   COMPLETE REVISION
===================================================== */
export const completeRevision = async (req, res) => {
  try {
    const { topicId, revisionNumber, answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: "Answers missing" });
    }

    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    const user = await User.findById(topic.user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const revision = topic.revisions.find(
      (r) => r.revisionNumber === revisionNumber,
    );

    if (!revision) {
      return res.status(404).json({ message: "Revision not found" });
    }

    // ============================================
    // 🧠 AI-BASED GRADING (ONE BY ONE)
    // ============================================

    let totalWeight = 0;
    let weightedScore = 0;

    let feedbackResults = [];

    for (const item of answers) {
      let score = 0;
      let feedback = "";

      if (item.type === "mcq") {
        score = item.userAnswer === item.correctAnswer ? 1 : 0;
        feedback = score === 1 ? "Correct answer." : "Incorrect answer.";
      } else {
        const result = await gradeAnswerWithAI(
          item.question,
          item.correctAnswer,
          item.userAnswer,
        );

        score = result.score;
        feedback = result.feedback;
      }

      let weight = 1;
      if (item.type === "short") weight = 2;
      if (item.type === "long") weight = 3;

      totalWeight += weight;
      weightedScore += score * weight;

      feedbackResults.push({
        question: item.question,
        type: item.type,
        userAnswer: item.userAnswer,
        correctAnswer: item.correctAnswer,
        score: score,
        feedback: feedback,
      });
    }

    const finalPercentage = Math.round((weightedScore / totalWeight) * 100);

    // ============================================
    // ✅ MARK REVISION COMPLETED
    // ============================================

    revision.status = "completed";
    revision.completedAt = new Date();
    revision.scoreAfterRevision = finalPercentage;

    // ============================================
    // 🧠 ADAPTIVE MEMORY UPDATE
    // ============================================

    let memory = user.memoryPercentage ?? 50;

    // Adaptive proportional update
    memory = memory + (finalPercentage - 50) * 0.2;

    memory = Math.max(0, Math.min(100, memory));

    user.memoryPercentage = Math.round(memory);

    if (memory < 40) user.memoryLabel = "WEAK";
    else if (memory < 70) user.memoryLabel = "MEDIUM";
    else user.memoryLabel = "STRONG";

    await user.save();

    // ============================================
    // 📅 DYNAMIC REVISION SCHEDULING
    // ============================================

    if (finalPercentage < 40) {
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 3);

      topic.revisions.push({
        revisionNumber: topic.revisions.length + 1,
        scheduledAt: nextDate,
        status: "scheduled",
        completedAt: null,
        scoreAfterRevision: null,
        notesContent: topic.notesContent,
      });

      topic.nextRevisionAt = nextDate;
    } else {
      topic.nextRevisionAt = null;
    }

    await topic.save();

    // ============================================
    // RESPONSE
    // ============================================

    res.json({
      message: "Revision completed",
      finalScore: finalPercentage,
      memoryPercentage: user.memoryPercentage,
      memoryLabel: user.memoryLabel,
      feedback: feedbackResults,
    });
  } catch (err) {
    console.error("COMPLETE REVISION ERROR:", err);
    res.status(500).json({ message: "Failed to complete revision" });
  }
};

/* =====================================================
   START REVISION TEST
===================================================== */
export const startRevisionTest = async (req, res) => {
  try {
    const { topicId, revisionNumber } = req.body;

    // 🔹 Get topic
    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    // 🔹 Get revision
    const revision = topic.revisions.find(
      (r) => r.revisionNumber === revisionNumber,
    );

    if (!revision) {
      return res.status(404).json({ message: "Revision not found" });
    }

    // 🔹 Prevent regeneration
    if (Array.isArray(revision.questions) && revision.questions.length > 0) {
      return res.json({
        message: "Questions already generated",
        questions: revision.questions,
      });
    }

    // 🔹 Get user memory score
    const user = await User.findById(topic.user);

    let memoryLevel = 0.5;

    if (user && typeof user.memoryPercentage === "number") {
      memoryLevel = user.memoryPercentage / 100;
    }

    console.log("FINAL memoryLevel:", memoryLevel);

    // 🔹 Get notes content
    const notesToSend = topic.notesContent?.trim().substring(0, 6000) || "";

    console.log("SENDING EXACT NOTES LENGTH:", notesToSend.length);

    if (!notesToSend || notesToSend.length < 50) {
      return res.status(400).json({
        message: "No sufficient notes content found for this topic",
      });
    }

    // 🔹 Call AI
    const difficultyLevel = topic.difficultyLevel || "medium";
    const aiResponse = await generateQuestions(
      notesToSend,
      memoryLevel,
      difficultyLevel,
      topic.title,
    );

    console.log("AI RESPONSE:", JSON.stringify(aiResponse, null, 2));

    if (!aiResponse || !aiResponse.success) {
      throw new Error(aiResponse?.error || "AI generation failed");
    }

    // 🔹 Save questions
    await Topic.updateOne(
  {
    _id: topicId,
    "revisions.revisionNumber": revisionNumber
  },
  {
    $set: {
      "revisions.$.questions": aiResponse.questions,
      "revisions.$.status": "scheduled"
    }
  }
);
console.log("UPDATE RESULT:", updateResult);

return res.json({
  message: "Revision test generated",
  memoryLevel,
  questions: aiResponse.questions,
});
  } catch (err) {
    console.error("START REVISION FULL ERROR:", err);

    if (!res.headersSent) {
      return res.status(500).json({
        message: "Failed to start revision test",
        error: err.message,
      });
    }
  }
};
