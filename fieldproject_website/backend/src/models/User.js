import mongoose from "mongoose";

const learningProfileSchema = new mongoose.Schema(
  {
    q1: String,
    q2: String,
    q3: String,
    q4: String,
    q5: String,
    q6: String,
    q7: String,
    q8: String,
    q9: String,
    q10: String,
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },

    // 🧠 NEW FIELDS
    hasCompletedAssessment: {
      type: Boolean,
      default: false,
    },

    learningProfile: learningProfileSchema,

    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
