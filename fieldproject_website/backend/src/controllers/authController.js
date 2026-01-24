import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

// 🔐 Helper to set cookie
const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",   // works on localhost
    secure: false,    // true in production (https)
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// ==========================
// SIGNUP
// ==========================
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2. Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      hasCompletedAssessment: false,
    });

    // 5. Create token (MATCHES protect middleware)
    const token = jwt.sign(
      { id: user._id  },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 6. Set cookie
    setTokenCookie(res, token);

    // 7. Respond
    res.status(201).json({
      message: "Signup successful",
      redirect: "/questionary.html",
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

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    setTokenCookie(res, token);

    // 🎯 Decide where to send user
    const redirect = user.hasCompletedAssessment
      ? "/dashboard.html"
      : "/questionary.html";

    res.json({
      message: "Signin successful",
      redirect,
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
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select(
      "name email hasCompletedAssessment role"
    );

    res.json({ ok: true, user });
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
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

    user.learningProfile = req.body;
    user.hasCompletedAssessment = true;

    await user.save();

    res.json({
      message: "Assessment saved successfully",
      redirect: "/dashboard.html",
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
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("🔥 LOGOUT ERROR:", err);
    res.status(500).json({ message: "Logout failed" });
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

    const resetUrl = `http://localhost:5500/fieldproject_website/frontend/html/reset-password.html?token=${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Password Reset",
      html: `
        <p>You requested a password reset</p>
        <p>Click below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
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

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

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

    let duration = 25;
    let personality = "Deep Focus";
    let music = "Lo-fi Beats";

    if (user?.learningProfile?.focus === "short") {
      duration = 15;
      personality = "Quick Sprint";
      music = "Soft Piano";
    }

    res.json({
      personality,
      duration,
      music,
      background: "linear-gradient(135deg, #e0ecde, #cde0cd)"
    });
  } catch (err) {
    res.status(500).json({ message: "AI engine offline" });
  }
};
// ==========================
// save the sessions 
// ==========================
export const saveStudySession = async (req, res) => {
  try {
    const { minutes, focusType } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.studyStats) {
  user.studyStats = { totalMinutes: 0, sessions: 0 };
}

if (!user.sessionsLog) {
  user.sessionsLog = [];
}

user.studyStats.totalMinutes += minutes;
user.studyStats.sessions += 1;

user.sessionsLog.push({
  minutes,
  focusType
});


    await user.save();

    res.json({ message: "Session saved" });
  } catch (err) {
    res.status(500).json({ message: "Could not save session" });
  }
};
