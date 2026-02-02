import express from "express";
import { predictMemory } from "../controllers/memoryController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected route
router.post("/predict", authMiddleware, predictMemory);
// router.post("/predict", predictMemory);


export default router;
