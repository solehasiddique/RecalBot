export const generateInitialRevisions = (memoryProfile, endDate) => {
  const today = new Date();
  const finalDate = new Date(endDate);

  // Safety check
  if (isNaN(finalDate.getTime())) {
    throw new Error("Invalid endDate for revision scheduling");
  }

  // 📌 Spacing logic (days gap)
  const patterns = {
    WEAK: [1, 3, 7, 14],
    MEDIUM: [3, 7, 14],
    STRONG: [7, 21],
  };

  const gaps = patterns[memoryProfile] || patterns.MEDIUM;

  const revisions = [];
  let revisionNumber = 1;

  for (const gap of gaps) {
    const revisionDate = new Date(today);
    revisionDate.setDate(today.getDate() + gap);

    // ❌ stop if beyond endDate
    if (revisionDate > finalDate) break;

    revisions.push({
      revisionNumber,
      scheduledAt: revisionDate,
      status: "scheduled",
      completedAt: null,
      scoreAfterRevision: null,
    });

    revisionNumber++;
  }

  return {
    revisions,
    nextRevisionAt: revisions.length ? revisions[0].scheduledAt : null,
  };
};

export const calculateDynamicGap = (score) => {
  if (score >= 85) return 21;
  if (score >= 70) return 14;
  if (score >= 50) return 7;
  return 3;
};

export const generateNextRevision = (lastRevisionDate, score) => {
  const gap = calculateDynamicGap(score);

  const nextDate = new Date(lastRevisionDate);
  nextDate.setDate(nextDate.getDate() + gap);

  return {
    scheduledAt: nextDate,
    status: "scheduled",
    completedAt: null,
    scoreAfterRevision: null
  };
};
