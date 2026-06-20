// checkUser.js
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import User from "./models/User.js";

await mongoose.connect(process.env.MONGO_URI);
const user = await User.findOne({ email: "your-test-email@example.com" });
console.log({
  memoryScore: user.memoryScore,
  memoryPercentage: user.memoryPercentage,
  memoryLabel: user.memoryLabel,
  memoryProfile: user.memoryProfile,
  hasCompletedAssessment: user.hasCompletedAssessment,
  learningProfile: user.learningProfile,
});
process.exit(0);