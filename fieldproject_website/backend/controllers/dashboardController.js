import User from "../models/User.js";

export const getDashboardData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      name: user.name,

      memory: {
      label: user.memoryLabel || "Not initialized",
      percentage: user.memoryPercentage ?? 0,
      initializedAt: user.memoryInitializedAt
    },

      stats: {
      totalTopics: user.studyStats?.totalTopics || 0,
      totalSessions: user.studyStats?.sessions || 0,
      streak: user.studyStats?.streak || 0
    }
    });

  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
};
