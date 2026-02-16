import Topic from "../models/Topic.js";
import User from "../models/User.js";
import { generateInitialRevisions } from "../utils/revisionScheduler.js";
import { generateNextRevision } from "../utils/revisionScheduler.js";
import { generateQuestions } from "../services/aiService.js";

export const createTopic = async (req, res) => {
  try {
    // 🔑 ALWAYS fetch full user from DB
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const { title, description, endDate } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title required" });
    }

    // ✅ This will now work correctly
    if (!user.memoryProfile || user.memoryScore === null) {
      return res.status(400).json({
        message: "Complete memory assessment first",
      });
    }

    const { revisions, nextRevisionAt } = generateInitialRevisions(
      user.memoryProfile,
      endDate,
    );

    const topic = await Topic.create({
      user: user._id,
      title,
      description,
      endDate,
      initialMemoryProfile: user.memoryProfile,
      revisions,
      nextRevisionAt,
    });

    res.status(201).json({
      message: "Topic created & first revision scheduled",
      topic,
    });
  } catch (err) {
    console.error("🔥 TOPIC CREATE ERROR:", err);
    res.status(500).json({ message: "Topic creation failed" });
  }
};

export const getUserTopics = async (req, res) => {
  try {
    const topics = await Topic.find({ user: req.user.id });
    res.json({ topics });
  } catch (err) {
    res.status(500).json({ message: "Failed to load topics" });
  }
};

export const completeRevision = async (req, res) => {
  try {
    const { topicId, revisionNumber, score } = req.body;

    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    const revision = topic.revisions.find(
      (r) => r.revisionNumber === revisionNumber,
    );

    if (!revision) {
      return res.status(404).json({ message: "Revision not found" });
    }

    // Mark current revision completed
    revision.status = "completed";
    revision.completedAt = new Date();
    revision.scoreAfterRevision = score;

    // Generate next revision dynamically
    const newRevision = generateNextRevision(revision.scheduledAt, score);

    topic.revisions.push({
      revisionNumber: topic.revisions.length + 1,
      ...newRevision,
    });

    topic.nextRevisionAt = newRevision.scheduledAt;

    await topic.save();

    res.json({ message: "Revision completed & next scheduled", topic });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to complete revision" });
  }
};

export const startRevisionTest = async (req, res) => {
  try {
    const { topicId, revisionNumber } = req.body;

    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    const revision = topic.revisions.find(
      (r) => r.revisionNumber === revisionNumber,
    );

    if (!revision) {
      return res.status(404).json({ message: "Revision not found" });
    }

    // 🔥 Prevent regeneration
    if (Array.isArray(revision.questions) && revision.questions.length > 0) {
      return res.json({
        message: "Questions already generated",
        questions: revision.questions,
      });
    }
    // 🔥 Convert score to memoryLevel (safe version)
    let memoryLevel = 0.5;

    if (
      typeof revision.scoreAfterRevision === "number" &&
      !isNaN(revision.scoreAfterRevision)
    ) {
      memoryLevel = revision.scoreAfterRevision / 100;
    }

    console.log("FINAL memoryLevel:", memoryLevel);
    console.log("TOPIC DESCRIPTION:", topic.description);

    // 🔥 Call AI
    const aiResponse = await generateQuestions(
      topic.notesContent || "",
      memoryLevel,
    );

    console.log("AI RESPONSE:", aiResponse);

    if (!aiResponse || !aiResponse.success) {
      throw new Error("AI generation failed");
    }

    // 🔥 Save structured questions
    revision.questions = aiResponse.questions;

    await topic.save();

    res.json({
      message: "Revision test generated",
      questions: aiResponse.questions,
    });

    if (!aiResponse.success) {
      throw new Error("AI generation failed");
    }

    // 🔥 Save structured questions
    revision.questions = aiResponse.questions;

    await topic.save();

    res.json({
      message: "Revision test generated",
      difficulty,
      questions: aiResponse.questions,
    });
  } catch (err) {
    console.error("START REVISION FULL ERROR:", err);
    res.status(500).json({
      message: "Failed to start revision test",
      error: err.message,
    });
  }
};
