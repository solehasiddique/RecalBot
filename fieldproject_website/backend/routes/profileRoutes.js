import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import {
  createNote,
  deleteNote,
  getProfileData,
  getUserNotes,
  updateProfileData,
} from "../controllers/profileController.js";

const router = express.Router();

router.get("/", authMiddleware, getProfileData);
router.put("/", authMiddleware, updateProfileData);

router.get("/notes", authMiddleware, getUserNotes);
router.post("/notes", authMiddleware, upload.single("noteFile"), createNote);
router.delete("/notes/:noteId", authMiddleware, deleteNote);

export default router;
