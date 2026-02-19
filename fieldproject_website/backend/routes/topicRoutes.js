import express from "express";
import {
  createTopic,
  getUserTopics,
  completeRevision,
} from "../controllers/topicController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { generateQuestions } from "../services/aiService.js";
import { startRevisionTest } from "../controllers/topicController.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

/* ===============================
   🔒 Protected Topic Routes
================================ */

// Mark revision complete
router.post("/complete", authMiddleware, completeRevision);

// Create new topic
router.post("/create", authMiddleware, upload.single("notesFile"), createTopic);

// Get logged-in user's topics
router.get("/", authMiddleware, getUserTopics);

// Start revision test
router.post("/start-revision", authMiddleware, startRevisionTest);

/* ===============================
   🤖 AI Test Route (Temporary)
   No auth for now (testing only)
================================ */

router.post("/ai-test", async (req, res) => {
  try {
    const { notes } = req.body;

    if (!notes) {
      return res.status(400).json({
        success: false,
        error: "Notes are required",
      });
    }

    const result = await generateQuestions(notes, 0.5);

    res.json(result);
  } catch (error) {
    console.error("AI Route Error:", error.message);

    res.status(500).json({
      success: false,
      error: "AI generation failed",
    });
  }
});

export default router;
