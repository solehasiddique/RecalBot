import dotenv from "dotenv";
dotenv.config();

import { generateQuestions } from "./services/questionGeneratorService.js";

const notes = `
Photosynthesis is the process by which plants convert sunlight into chemical energy.
It occurs in chloroplasts and involves light-dependent reactions and the Calvin cycle.
Chlorophyll absorbs light, water molecules split and release oxygen, and carbon dioxide
is fixed into glucose. This process is essential for plant growth and oxygen production.
`;

const result = await generateQuestions(notes, 0.3, "easy", "Photosynthesis");

console.log(JSON.stringify(result, null, 2));