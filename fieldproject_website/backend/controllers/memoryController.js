import axios from "axios";
import fs from "fs";
import path from "path";
import User from "../models/User.js";


export const predictMemory = async (req, res) => {
  try {
    const mlUrl = process.env.ML_SERVICE_URL;
     console.log("ML URL:", mlUrl);

    // 🟡 If ML not deployed yet
    if (!mlUrl) {
      return res.json({
        score: 0.5,
        label: "MEDIUM",
        percentage: 50,
        note: "ML service not connected yet"
      });
    }

    const mlResponse = await axios.post(
      `${mlUrl}/predict`,
      { answers: req.body }
    );
    console.log("ML RESPONSE:", mlResponse.data);

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
    console.error("ML API error:", err.response?.data || err.message);

    return res.json({
      score: 0.5,
      label: "MEDIUM",
      percentage: 50,
      note: "ML service temporarily unavailable"
    });
  }
};