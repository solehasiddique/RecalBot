import Topic from "../models/Topic.js";
import User from "../models/User.js";
import { generateInitialRevisions } from "../utils/revisionScheduler.js";
import { generateNextRevision } from "../utils/revisionScheduler.js";

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
      (r) => r.revisionNumber === revisionNumber
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
      ...newRevision
    });

    topic.nextRevisionAt = newRevision.scheduledAt;

    await topic.save();

    res.json({ message: "Revision completed & next scheduled", topic });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to complete revision" });
  }
};