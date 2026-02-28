import mongoose from "mongoose";

/**
 * Revision Schema
 * Each revision is ONE calendar event
 */
const revisionSchema = new mongoose.Schema(
  {
    revisionNumber: {
      type: Number,
      required: true,
    },

    scheduledAt: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["scheduled", "studied", "completed", "missed"],
      default: "scheduled",
    },

    completedAt: {
      type: Date,
      default: null,
    },

    scoreAfterRevision: {
      type: Number,
      default: null,
    },

    questions: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  { _id: false },
);

/**
 * Topic Schema
 */
const topicSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    difficultyLevel: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },

    description: {
      type: String,
      default: "",
    },

    initialMemoryProfile: {
      type: String,
      enum: ["WEAK", "MEDIUM", "STRONG"],
      required: true,
    },

    studiedAt: {
      type: Date,
      required: true,
      default: Date.now, // 🔥 THIS IS THE GREEN TAG
    },

    /**
     * All revisions for this topic
     * Calendar UI should be rendered ONLY from this
     */
    revisions: {
      type: [revisionSchema],
      default: [],
    },

    notesContent: {
      type: String,
      default: "",
    },

    sourceNote: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
      default: null,
    },
    
    /**
     * Quick access for dashboard / reminders
     */
    nextRevisionAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Topic", topicSchema);
