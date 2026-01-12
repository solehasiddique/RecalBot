import express from "express";
import { signup, signin, profile } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/profile", profile);

export default router;
