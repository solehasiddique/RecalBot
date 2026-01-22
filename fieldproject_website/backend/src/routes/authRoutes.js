import express from "express";
import {
  signup,
  signin,
  profile,
  forgotPassword,
  resetPassword,
  submitQuestionnaire,
  logout
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/profile", profile);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// 🛡️ Protected
router.post("/submit", authMiddleware, submitQuestionnaire);
router.post("/logout", logout);

export default router;
