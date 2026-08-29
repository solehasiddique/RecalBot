import express from "express";
import {
  getStats,
  getAllUsers,
  getUserDetail,
  getMemoryAnalytics,
  makeAdmin,
  getResearchSummary,
  getFlaggedSessions,
  toggleExcludeSession,
  exportResearchData
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
router.get("/research/summary",                    getResearchSummary);
router.get("/research/flagged",                    getFlaggedSessions);
router.patch("/research/exclude/:topicId/:revisionNumber", toggleExcludeSession);
router.get("/research/export",                     exportResearchData);

export default router;