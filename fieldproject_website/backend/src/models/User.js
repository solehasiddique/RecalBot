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


    hasCompletedAssessment: {
      type: Boolean,
      default: false,
    },
    studyStats: {
  totalMinutes: { type: Number, default: 0 },
  sessions: { type: Number, default: 0 },
  streak: { type: Number, default: 0 }
},
sessionsLog: [
  {
    date: { type: Date, default: Date.now },
    minutes: Number,
    focusType: String
  }
],

    learningProfile: learningProfileSchema,

    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);
// 🔍 Indexes for performance

userSchema.index({ resetPasswordToken: 1 });

export default mongoose.model("User", userSchema);
