import authRoutes from "./routes/authRoutes.js";
import memoryRoutes from "./routes/memoryRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import topicRoutes from "./routes/topicRoutes.js"; 
import profileRoutes from "./routes/profileRoutes.js";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";


dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("ENV CHECK ⛳");
console.log("EMAIL_USER:", process.env.MAIL_USER);
console.log("EMAIL_PASS EXISTS:", !!process.env.MAIL_PASS);
console.log("MongoDB connected ✔");
console.log("JWT_SECRET EXISTS:", !!process.env.JWT_SECRET);
console.log("--------------------");


const app = express();

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));


const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));


app.use("/api/auth", authRoutes);
// app.use(express.static(path.join(__dirname, "../frontend")));

app.use("/api/memory", memoryRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/topics", topicRoutes);
app.use("/api/profile", profileRoutes);

app.get("/", (req, res) => {
  res.send("Server is running");
});


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");

    const PORT = process.env.PORT || 8000;

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

const PORT = process.env.PORT || 8000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("Using Mongo URI:", process.env.MONGO_URI)
});
