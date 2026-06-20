import dotenv from "dotenv";
dotenv.config();

import { gradeAnswerWithAI } from "./services/aiGradingService.js";

const result = await gradeAnswerWithAI(
  "What is photosynthesis?",
  "Plants convert sunlight into chemical energy.",
  "Photosynthesis happens in animals."
);

console.log(result);