import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

// 🔐 Helper to set cookie
const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/", // 🔥 ADD THIS
  });
};

// ==========================
// SIGNUP
// ==========================
export const signup = async (req, res) => {
  try {
    console.log("🔥 SIGNUP HIT:", req.body);

    const { name, email, password } = req.body;
    // Full name validation (backend safety)
    const nameRegex = /^[A-Za-z ]+$/;

    if (!nameRegex.test(name)) {
      return res.status(400).json({
        message: "Please enter your full name (first and last name)",
      });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      hasCompletedAssessment: false,
      profileCompleted: false,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    setTokenCookie(res, token);

    res.status(201).json({
      message: "Signup successful",
      redirect: "/html/questionary.html",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hasCompletedAssessment: user.hasCompletedAssessment,
      },
    });
  } catch (err) {
    console.error("🔥 SIGNUP ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// SIGNIN
// ==========================
export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        code: "USER_NOT_FOUND",
        message: "Account not found. Please sign up first.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        code: "INVALID_PASSWORD",
        message: "Incorrect password.",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    setTokenCookie(res, token);

    // 🎯 Decide where to send user
    let redirect = "/html/questionary.html";
    if (user.hasCompletedAssessment && !user.profileCompleted) {
      redirect = "/html/profile.html";
    } else if (user.hasCompletedAssessment && user.profileCompleted) {
      redirect = "/html/dashboard.html";
    }

    res.json({
      message: "Signin successful",
      redirect,
      token,
    });
  } catch (err) {
    console.error("🔥 SIGNIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// PROFILE CHECK
// ==========================
export const profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "name email role hasCompletedAssessment profileCompleted studyStats memoryProfile memoryScore memoryPercentage memoryInitializedAt",
    );

    res.json({
      ok: true,
      user,
    });
  } catch (err) {
    console.error("PROFILE ERROR:", err);
    res.status(401).json({ message: "Invalid token" });
  }
};

// ==========================
// SUBMIT QUESTIONNAIRE
// ==========================
export const submitQuestionnaire = async (req, res) => {
  try {
    const userId = req.user.id; // from authMiddleware

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.hasCompletedAssessment) {
      const redirect = user.profileCompleted
        ? "/html/dashboard.html"
        : "/html/profile.html";
      return res.status(400).json({
        message: "Questionnaire already submitted",
        redirect,
      });
    }

    user.learningProfile = req.body;
    user.hasCompletedAssessment = true;

    await user.save();

    res.json({
      message: "Assessment saved successfully",
      redirect: "/html/profile.html",
    });
  } catch (err) {
    console.error("🔥 QUESTIONNAIRE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// LOGOUT
// ==========================
export const logout = async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      expires: new Date(0),
      path: "/", // 🔥 MUST MATCH LOGIN
    });

    return res.status(200).json({ message: "Logged out" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: "Logout failed" });
  }
};

// ==========================
// FORGOT PASSWORD
// ==========================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("👉 FORGOT PASSWORD HIT:", email);

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "If user exists, email sent" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    // const resetUrl = `http://localhost:5500/fieldproject_website/frontend/html/reset-password.html?token=${resetToken}`;
    const resetUrl = `http://localhost:8000/api/auth/redirect-reset?token=${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Password Reset",
      html: `
        <p>You requested a password reset</p>
        <p>Click below to reset your password:</p>
       <a href="${resetUrl}" target="_blank" rel="noopener noreferrer">Reset Password</a>

      `,
    });

    res.json({ message: "Reset email sent" });
  } catch (error) {
    console.error("🔥 FORGOT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// RESET PASSWORD
// ==========================
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("🔥 RESET PASSWORD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// ==========================
// study recomend
// ==========================
export const getStudyRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    let duration = 25; // default
    let personality = "Deep Focus";
    let music = "Lo-fi Beats";

    const focusAnswer = user?.learningProfile?.q1;

    // 🔥 Map questionnaire answer → duration
    if (focusAnswer === "Less than 15 minutes") {
      duration = 10;
      personality = "Quick Sprint";
    } else if (focusAnswer === "15–25 minutes") {
      duration = 20;
    } else if (focusAnswer === "25–40 minutes") {
      duration = 30;
    } else if (focusAnswer === "More than 40 minutes") {
      duration = 45;
      personality = "Deep Work Mode";
    }

    

    // Optional: Music mapping (q3)
    const envAnswer = user?.learningProfile?.q3;

    if (envAnswer === "Silence") music = "No Music";
    if (envAnswer === "Soft music") music = "Lo-fi Beats";
    if (envAnswer === "Nature sounds") music = "Nature Ambient";

   res.json({
  personality,
  duration,
  music,
 musicType: music.toLowerCase().replace(/\s+/g, "-"),
  background: "linear-gradient(135deg, #e0ecde, #cde0cd)",
});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "AI engine offline" });
  }
};

// ==========================
// SAVE STUDY SESSION (FIXED)
// ==========================
export const saveStudySession = async (req, res) => {
  try {
    const { minutes } = req.body;

    if (!minutes || minutes <= 0) {
      return res.status(400).json({ message: "Invalid session time" });
    }

    const user = await User.findById(req.user.id);

    if (!user.studyStats) {
      user.studyStats = {
        totalMinutes: 0,
        sessions: 0,
        streak: 0,
      };
    }

    if (!user.sessionsLog) {
      user.sessionsLog = [];
    }

    // Add minutes
    user.studyStats.totalMinutes += minutes;

    // Add exactly ONE session
    const previousSessions = user.studyStats.sessions;
    user.studyStats.sessions += 1;

    // STREAK LOGIC
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastSession = user.sessionsLog.at(-1);
    let lastDate = null;

    if (lastSession) {
      lastDate = new Date(lastSession.date);
      lastDate.setHours(0, 0, 0, 0);
    }

    if (user.studyStats.sessions > previousSessions) {
      if (!lastDate) {
        user.studyStats.streak = 1;
      } else {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (lastDate.getTime() === yesterday.getTime()) {
          user.studyStats.streak += 1;
        } else if (lastDate.getTime() !== today.getTime()) {
          user.studyStats.streak = 1;
        }
      }
    }

    user.sessionsLog.push({
      date: new Date(),
      minutes,
    });

    if (!user.weeklySessions) user.weeklySessions = [0,0,0,0,0,0,0];
const todayIndex = new Date().getDay();
user.weeklySessions[todayIndex] += 1;

await user.save();  


    res.json({
      totalMinutes: user.studyStats.totalMinutes,
      sessions: user.studyStats.sessions,
      streak: user.studyStats.streak,
    });

  } catch (err) {
    console.error("Save session error:", err);
    res.status(500).json({ message: "Could not save session" });
  }
};
