
import authRoutes from "./routes/authRoutes.js";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();


const app = express();

app.use(express.json());
app.use(cookieParser());


app.use(cors({
  origin: "http://localhost:5500",
  credentials: true,
}));




app.use("/api/auth", authRoutes);


app.get("/", (req, res) => {
  res.send("Server is running");
});


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));

const PORT = process.env.PORT || 8000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
