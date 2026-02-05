import express from "express";
import {
  createTopic,
  getUserTopics
} from "../controllers/topicController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔒 Protected
router.post("/create", authMiddleware, createTopic);
router.get("/", authMiddleware, getUserTopics);

export default router;
