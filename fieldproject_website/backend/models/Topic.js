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
