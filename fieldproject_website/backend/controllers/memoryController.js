import axios from "axios";
import fs from "fs";
import path from "path";
import User from "../models/User.js";

// Load ML columns once
const columnsPath = path.join(process.cwd(), "..", "ai_ml", "columns.json");
const ML_COLUMNS = JSON.parse(fs.readFileSync(columnsPath, "utf-8"));

export const predictMemory = async (req, res) => {
  try {
    const mlResponse = await axios.post("http://127.0.0.1:5000/predict", {
      answers: req.body,
    });

    const { score, label, percentage } = mlResponse.data;

    const user = await User.findById(req.user.id);
    user.memoryScore = score;
    user.memoryLabel = label;
    user.memoryPercentage = percentage;
    user.memoryProfile = label;
    user.memoryInitializedAt = new Date();

    await user.save();

    res.json({ score, label, percentage });
  } catch (err) {
    console.error("ML API error:", err.message);
    res.status(500).json({ message: "ML service error" });
  }
};
