import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

// SIGNUP
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({
      message: "Signup successful",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// SIGNIN
export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });

    // ❌ Email not found
    if (!user) {
      return res.status(404).json({
        code: "USER_NOT_FOUND",
        message: "Account not found. Please sign up first.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    // ❌ Password wrong
    if (!isMatch) {
      return res.status(401).json({
        code: "INVALID_PASSWORD",
        message: "Incorrect password.",
      });
    }

    // ✅ Success
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ message: "Signin successful" });
  } catch (err) {
    console.error("🔥 SIGNIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};




export const profile = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.json({ ok: true, userId: decoded.id });
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};


export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("👉 FORGOT PASSWORD HIT:", email);

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "If user exists, email sent" });
    }

    // 1️⃣ Generate RAW token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // 2️⃣ HASH the token
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // 3️⃣ Save HASHED token in DB
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins
    await user.save();

    console.log("RAW TOKEN:", resetToken);
    console.log("HASHED TOKEN:", hashedToken);

    // 4️⃣ Send RAW token via email
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


export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // hash the token coming from URL
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

    // ✅ HASH PASSWORD (THIS WAS MISSING)
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    // clear reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    console.log("✅ PASSWORD RESET & HASHED");

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("🔥 RESET PASSWORD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
