export const generateInitialRevisions = (memoryProfile, endDate) => {
  const today = new Date();
  const finalDate = new Date(endDate);

  // Safety check
  if (isNaN(finalDate.getTime())) {
    throw new Error("Invalid endDate for revision scheduling");
  }

  // 📌 Spacing logic (days gap)
  const patterns = {
    WEAK:   [1, 3, 7, 14],
    MEDIUM: [3, 7, 14],
    STRONG: [7, 21]
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
      scheduledAt: revisionDate, // ✅ MUST be Date object
      completed: false
    });

    revisionNumber++;
  }

  return {
    revisions,
    nextRevisionAt: revisions.length ? revisions[0].scheduledAt : null
  };
};
