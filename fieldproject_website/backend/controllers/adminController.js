import User from "../models/User.js";
import Topic from "../models/Topic.js";

// ===============================
// GET /api/admin/stats
// Overview numbers for dashboard
// ===============================
export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "student" });

    const weak   = await User.countDocuments({ role: "student", memoryProfile: { $regex: /weak/i } });
    const medium = await User.countDocuments({ role: "student", memoryProfile: { $regex: /medium/i } });
    const strong = await User.countDocuments({ role: "student", memoryProfile: { $regex: /strong/i } });

    const assessmentDone  = await User.countDocuments({ role: "student", hasCompletedAssessment: true });
    const profileComplete = await User.countDocuments({ role: "student", profileCompleted: true });

    const totalTopics    = await Topic.countDocuments();
    const totalRevisions = await Topic.aggregate([
      { $unwind: "$revisions" },
      { $count: "total" }
    ]);
    const completedRevisions = await Topic.aggregate([
      { $unwind: "$revisions" },
      { $match: { "revisions.status": "completed" } },
      { $count: "total" }
    ]);

    // Signups per month for chart
    const signupsByMonth = await User.aggregate([
      { $match: { role: "student" } },
      {
        $group: {
          _id: {
            year:  { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    res.json({
      totalUsers,
      weak,
      medium,
      strong,
      assessmentDone,
      profileComplete,
      totalTopics,
      totalRevisions: totalRevisions[0]?.total || 0,
      completedRevisions: completedRevisions[0]?.total || 0,
      signupsByMonth
    });

  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// GET /api/admin/users
// All students with basic info
// ===============================
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "student" })
      .select("name email memoryProfile memoryPercentage hasCompletedAssessment profileCompleted createdAt studyStats")
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (err) {
    console.error("Admin users error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// GET /api/admin/user/:id
// Single user with full topic + revision detail
// ===============================
export const getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    const topics = await Topic.find({ user: req.params.id })
      .select("title createdAt difficultyLevel revisions")
      .sort({ createdAt: -1 });

    // Compute per-user stats
    let totalRevisions = 0;
    let completedRevisions = 0;
    let missedRevisions = 0;
    let totalScore = 0;
    let scoredRevisions = 0;

    topics.forEach(t => {
      t.revisions.forEach(r => {
        totalRevisions++;
        if (r.status === "completed") completedRevisions++;
        if (r.status === "missed") missedRevisions++;
        if (r.score != null) {
          totalScore += r.score;
          scoredRevisions++;
        }
      });
    });

    const avgScore = scoredRevisions > 0
      ? (totalScore / scoredRevisions).toFixed(1)
      : null;

    res.json({
      user: {
        ...user.toObject(),
        topics,
        stats: {
          totalRevisions,
          completedRevisions,
          missedRevisions,
          avgScore
        }
      }
    });

  } catch (err) {
    console.error("Admin user detail error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// GET /api/admin/memory-analytics
// Memory profile data for analytics page
// ===============================
export const getMemoryAnalytics = async (req, res) => {
  try {
    // Score distribution buckets
    const scoreBuckets = await User.aggregate([
      { $match: { role: "student", memoryPercentage: { $exists: true } } },
      {
        $bucket: {
          groupBy: "$memoryPercentage",
          boundaries: [0, 25, 50, 75, 100],
          default: "100+",
          output: { count: { $sum: 1 } }
        }
      }
    ]);

    // Average score per memory profile
    const avgByProfile = await User.aggregate([
      { $match: { role: "student", memoryProfile: { $exists: true } } },
      {
        $group: {
          _id: "$memoryProfile",
          avgScore: { $avg: "$memoryPercentage" },
          count: { $sum: 1 }
        }
      }
    ]);

    // Users with score over time (for line chart)
    const scoreOverTime = await User.find(
      { role: "student", memoryPercentage: { $exists: true } },
      { memoryPercentage: 1, createdAt: 1, memoryProfile: 1 }
    ).sort({ createdAt: 1 });

    res.json({ scoreBuckets, avgByProfile, scoreOverTime });

  } catch (err) {
    console.error("Memory analytics error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// POST /api/admin/make-admin
// Promote a user to admin (use carefully)
// ===============================
export const makeAdmin = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOneAndUpdate(
      { email },
      { role: "admin" },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: `${email} is now an admin`, user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// GET /api/admin/memory-analytics
// Everything needed for the Memory Analytics admin page
// ===============================
export const getMemoryAnalytics = async (req, res) => {
  try {

    // ── 1. Profile Distribution ──
    // How many users got each prediction
    const weak   = await User.countDocuments({ role: "student", memoryProfile: { $regex: /weak/i } });
    const medium = await User.countDocuments({ role: "student", memoryProfile: { $regex: /medium/i } });
    const strong = await User.countDocuments({ role: "student", memoryProfile: { $regex: /strong/i } });

    // ── 2. Average Test Score by Memory Profile ──
    // This is the core validation: does WEAK actually score lower than STRONG?
    const scoreByProfile = await Topic.aggregate([
      { $unwind: "$revisions" },
      { $match: { "revisions.score": { $exists: true, $ne: null } } },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      { $unwind: "$userInfo" },
      { $match: { "userInfo.role": "student" } },
      {
        $group: {
          _id: "$userInfo.memoryProfile",
          avgScore: { $avg: "$revisions.score" },
          totalRevisions: { $sum: 1 }
        }
      }
    ]);

    // ── 3. Revision Completion Rate by Profile ──
    // What % of scheduled revisions does each profile group actually complete?
    const completionByProfile = await Topic.aggregate([
      { $unwind: "$revisions" },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      { $unwind: "$userInfo" },
      { $match: { "userInfo.role": "student" } },
      {
        $group: {
          _id: {
            profile: "$userInfo.memoryProfile",
            status: "$revisions.status"
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Process completion data into a cleaner format
    const completionMap = {};
    completionByProfile.forEach(item => {
      const profile = (item._id.profile || "unknown").toUpperCase();
      const status  = item._id.status;
      if (!completionMap[profile]) completionMap[profile] = { completed: 0, total: 0 };
      completionMap[profile].total += item.count;
      if (status === "completed") completionMap[profile].completed += item.count;
    });

    const completionRates = Object.entries(completionMap).map(([profile, data]) => ({
      profile,
      completionRate: data.total > 0
        ? parseFloat(((data.completed / data.total) * 100).toFixed(1))
        : 0,
      completed: data.completed,
      total: data.total
    }));

    // ── 4. Memory Score Change Over Time ──
    // Per user: their starting memoryPercentage vs current
    // Since we store memoryPercentage as a single value (updated after each test),
    // we compare signup date vs latest revision date to show movement
    const scoreOverTime = await User.find(
      {
        role: "student",
        memoryPercentage: { $exists: true, $ne: null }
      },
      {
        name: 1,
        memoryPercentage: 1,
        memoryProfile: 1,
        createdAt: 1
      }
    ).sort({ createdAt: 1 }).limit(50);

    // ── 5. Model Confidence Check ──
    // Are users predicted with high confidence actually performing better?
    // Group users by memoryPercentage bands
    const confidenceBands = await User.aggregate([
      { $match: { role: "student", memoryPercentage: { $exists: true } } },
      {
        $bucket: {
          groupBy: "$memoryPercentage",
          boundaries: [0, 25, 50, 75, 101],
          default: "other",
          output: {
            count: { $sum: 1 },
            avgPercentage: { $avg: "$memoryPercentage" }
          }
        }
      }
    ]);

    // ── 6. Users With No Assessment ──
    // How many signed up but never completed the questionnaire?
    // These users have no ML prediction at all — important for data quality
    const noAssessment = await User.countDocuments({
      role: "student",
      hasCompletedAssessment: false
    });

    res.json({
      profileDistribution: { weak, medium, strong },
      scoreByProfile,
      completionRates,
      scoreOverTime,
      confidenceBands,
      noAssessment,
      totalStudents: weak + medium + strong
    });

  } catch (err) {
    console.error("Memory analytics error:", err);
    res.status(500).json({ message: "Server error" });
  }
};