import Topic from "../models/Topic.js";
import User from "../models/User.js";
import { generateInitialRevisions } from "../utils/revisionScheduler.js";

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
      user.memoryPercentage,
      req.body.endDate,
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
