import User from "../models/User.js";
import Topic from "../models/Topic.js";

export const getDashboardData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const topics = await Topic.find({ user: req.user.id });

    let completedTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let missedTests = 0;
    let testsLeft = 0;

    let performanceScores = [];
    let weeklySessions = [0, 0, 0, 0, 0, 0, 0];
    let subjectDistribution = {};

    const today = new Date();

    topics.forEach(topic => {
      subjectDistribution[topic.title] =
        (subjectDistribution[topic.title] || 0) + 1;

      topic.revisions.forEach(rev => {
        if (rev.status === "completed") {
          completedTests++;
          performanceScores.push(rev.scoreAfterRevision);
          const day = new Date(rev.completedAt).getDay();
          weeklySessions[day]++;
          if (rev.scoreAfterRevision >= 50) passedTests++;
          else failedTests++;
        }
        if (rev.status === "scheduled") {
          testsLeft++;
          if (new Date(rev.scheduledAt) < today) missedTests++;
        }
      });
    });

    if (user.sessionsLog && user.sessionsLog.length > 0) {
      user.sessionsLog.forEach(session => {
        const day = new Date(session.date).getDay();
        weeklySessions[day]++;
      });
    }

    // ✅ ADD THIS BLOCK — today's stats
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todaySessions = (user.sessionsLog || []).filter(
      s => new Date(s.date) >= todayStart
    );
    const todayMinutes = todaySessions.reduce((sum, s) => sum + s.minutes, 0);

    res.json({
      name: user.name,

      memory: {
        label: user.memoryLabel || "Not initialized",
        percentage: user.memoryPercentage ?? 0,
        initializedAt: user.memoryInitializedAt
      },

      stats: {
        totalTopics: topics.length,
        completedTests,
        passedTests,
        failedTests,
        missedTests,
        testsLeft,
        streak: user.studyStats?.streak || 0,
        todayMinutes,                        // ✅ ADD THIS
        todaySessions: todaySessions.length  // ✅ ADD THIS
      },

      charts: {
        performance: performanceScores.slice(-6),
        weeklySessions,
        subjectLabels: Object.keys(subjectDistribution),
        subjectData: Object.values(subjectDistribution),
        resultPie: [passedTests, failedTests, missedTests]
      }
    });

  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
};