import fs from "fs/promises";
import path from "path";
import User from "../models/User.js";
import Note from "../models/Note.js";
import { extractPdfText } from "../services/aiService.js";

const normalize = (value) => (typeof value === "string" ? value.trim() : "");

const mapProfileResponse = (user) => ({
  personal: {
    name: user.name || "",
    email: user.email || "",
    bio: user.profile?.bio || "",
    avatarUrl: user.profile?.avatarUrl || "",
  },
  academic: {
    class: user.profile?.academic?.class || "",
    section: user.profile?.academic?.section || "",
    roll: user.profile?.academic?.roll || "",
    board: user.profile?.academic?.board || "",
    school: user.profile?.academic?.school || "",
    stream: user.profile?.academic?.stream || "",
    batch: user.profile?.academic?.batch || "",
  },
  memory: {
    percentage:
      typeof user.memoryPercentage === "number" ? user.memoryPercentage : null,
    label: user.memoryLabel || user.memoryProfile || null,
  },
});

export const getProfileData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "name email profile memoryPercentage memoryLabel memoryProfile",
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const notesCount = await Note.countDocuments({ user: req.user.id });

    return res.json({
      ok: true,
      profile: mapProfileResponse(user),
      notesCount,
    });
  } catch (error) {
    console.error("GET PROFILE DATA ERROR:", error);
    return res.status(500).json({ message: "Failed to load profile data" });
  }
};

export const updateProfileData = async (req, res) => {
  try {
    const { personal = {}, academic = {} } = req.body || {};
    const avatarUrl = normalize(req.body?.avatarUrl);

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.profile) {
      user.profile = { bio: "", avatarUrl: "", academic: {} };
    }
    if (!user.profile.academic) {
      user.profile.academic = {};
    }

    const nextName = normalize(personal.name);
    const nextEmail = normalize(personal.email).toLowerCase();
    const nextBio = normalize(personal.bio);

    if (nextName) user.name = nextName;
    if (nextBio || nextBio === "") user.profile.bio = nextBio;

    if (avatarUrl || avatarUrl === "") {
      user.profile.avatarUrl = avatarUrl;
    }

    if (nextEmail && nextEmail !== user.email) {
      const emailExists = await User.findOne({
        email: nextEmail,
        _id: { $ne: user._id },
      });
      if (emailExists) {
        return res.status(409).json({ message: "Email already in use" });
      }
      user.email = nextEmail;
    }

    user.profile.academic.class = normalize(academic.class);
    user.profile.academic.section = normalize(academic.section);
    user.profile.academic.roll = normalize(academic.roll);
    user.profile.academic.board = normalize(academic.board);
    user.profile.academic.school = normalize(academic.school);
    user.profile.academic.stream = normalize(academic.stream);
    user.profile.academic.batch = normalize(academic.batch);

    const requiredPersonal = [user.name, user.email, user.profile.bio];
    const requiredAcademic = [
      user.profile.academic.class,
      user.profile.academic.section,
      user.profile.academic.roll,
      user.profile.academic.board,
      user.profile.academic.school,
      user.profile.academic.stream,
      user.profile.academic.batch,
    ];
    user.profileCompleted = [...requiredPersonal, ...requiredAcademic].every(
      (value) => typeof value === "string" && value.trim().length > 0,
    );

    await user.save();

    return res.json({
      ok: true,
      message: "Profile updated",
      profile: mapProfileResponse(user),
      profileCompleted: user.profileCompleted,
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    return res.status(500).json({ message: "Failed to update profile" });
  }
};

export const getUserNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.json({ ok: true, notes });
  } catch (error) {
    console.error("GET NOTES ERROR:", error);
    return res.status(500).json({ message: "Failed to load notes" });
  }
};

export const createNote = async (req, res) => {
  try {
    const title = normalize(req.body?.title);
    const subject = normalize(req.body?.subject);
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }
    if (!subject) {
      return res.status(400).json({ message: "Subject name is required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Please attach a note file" });
    }

    const ext = path.extname(req.file.originalname || "").replace(".", "").toLowerCase();

   // Extract text content from the file before saving
// Why: Render's filesystem is ephemeral — files get wiped on restart
// Storing content in MongoDB means we never need the file again after upload
let content = "";

if (req.file.mimetype === "application/pdf") {
  try {
    content = await extractPdfText(req.file.buffer);
  } catch (err) {
    console.error("PDF extraction error:", err);
    content = "";
  }
} else if (["txt", "md", "csv", "json", "xml", "html"].includes(ext)) {
  content = req.file.buffer.toString("utf8");
}

const note = await Note.create({
  user: req.user.id,
  title,
  subject,
  description: normalize(req.body?.description),
  chapter: normalize(req.body?.chapter),
  fileName: req.file.originalname || "",
  filePath: "",        // no longer needed — content stored in MongoDB
  fileMime: req.file.mimetype || "",
  fileExt: ext,
  fileSize: req.file.size || 0,
  content,             // extracted text saved here
});

    return res.status(201).json({ ok: true, note, message: "Note uploaded" });
  } catch (error) {
    console.error("CREATE NOTE ERROR:", error);
    return res.status(500).json({ message: "Failed to upload note" });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const note = await Note.findOne({ _id: noteId, user: req.user.id });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (note.filePath) {
      await fs.unlink(note.filePath).catch(() => {});
    }

    await Note.deleteOne({ _id: note._id });
    return res.json({ ok: true, message: "Note deleted" });
  } catch (error) {
    console.error("DELETE NOTE ERROR:", error);
    return res.status(500).json({ message: "Failed to delete note" });
  }
};
