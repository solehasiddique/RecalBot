import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
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
    subject: {
      type: String,
      default: "General",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    chapter: {
      type: String,
      default: "",
      trim: true,
    },
    fileName: {
      type: String,
      default: "",
    },
    filePath: {
      type: String,
      default: "",
    },
    fileMime: {
      type: String,
      default: "",
    },
    fileExt: {
      type: String,
      default: "",
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    content: {
  type: String,
  default: "",
},
  },
  { timestamps: true },
);

export default mongoose.model("Note", noteSchema);
