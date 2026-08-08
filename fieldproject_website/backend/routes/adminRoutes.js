import express from "express";
import {
  getStats,
  getAllUsers,
  getUserDetail,
  getMemoryAnalytics,
  makeAdmin,
  getMemoryAnalytics 
} from "../controllers/adminController.js";
import { protectAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// All routes below are protected — only admin role can access
router.use(protectAdmin);

router.get("/stats",            getStats);
router.get("/users",            getAllUsers);
router.get("/user/:id",         getUserDetail);
router.get("/memory-analytics", getMemoryAnalytics);
router.post("/make-admin",      makeAdmin);

export default router;