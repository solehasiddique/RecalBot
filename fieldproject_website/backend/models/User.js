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
  { _id: false },
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

    hasCompletedAssessment: {
      type: Boolean,
      default: false,
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },

    memoryScore: {
      type: Number,
      default: null,
    },
    memoryLabel: {
      type: String,
      default: null,
    },
    memoryPercentage: {
      type: Number,
      default: null,
    },

    studyStats: {
      totalMinutes: { type: Number, default: 0 },
      sessions: { type: Number, default: 0 },
      streak: { type: Number, default: 0 },
    },
    sessionsLog: [
      {
        date: { type: Date, default: Date.now },
        minutes: Number,
        focusType: String,
      },
    ],

    learningProfile: learningProfileSchema,

    profile: {
      bio: { type: String, default: "" },
      avatarUrl: { type: String, default: "" },
      academic: {
        class: { type: String, default: "" },
        section: { type: String, default: "" },
        roll: { type: String, default: "" },
        board: { type: String, default: "" },
        school: { type: String, default: "" },
        stream: { type: String, default: "" },
        batch: { type: String, default: "" },
      },
    },

    memoryProfile: {
      type: String,
      enum: ["WEAK", "MEDIUM", "STRONG"],
      default: null,
    },


    memoryInitializedAt: {
      type: Date,
    },

    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true },
);
// 🔍 Indexes for performance

userSchema.index({ resetPasswordToken: 1 });

export default mongoose.model("User", userSchema);
