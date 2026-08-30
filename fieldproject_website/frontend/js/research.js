// ============================================
// research.js
// Connects the Research Hub page to real backend data.
// Handles: summary cards, flagged session review queue,
// consent tracking, data quality score, CSV exports.
// Depends on admin.js being loaded first.
// ============================================


// ── HELPER ──
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function setWidth(id, val) {
  const el = document.getElementById(id);
  if (el) el.style.width = val;
}

// ── LOAD SUMMARY CARDS ──
// Fetches from /api/admin/research/summary
// Populates the four header cards and consent bars
async function loadResearchSummary() {
  try {
    const res  = await fetch(`${API}/api/admin/research/summary`, { credentials: "include" });
    const data = await res.json();

    setText("res-total-students", data.totalStudents?.toLocaleString() ?? "—");
    setText("res-total-sessions", data.totalSessions?.toLocaleString() ?? "—");
    setText("res-flagged",        data.flaggedSessions?.toLocaleString() ?? "0");
    setText("res-excluded",       data.excludedSessions?.toLocaleString() ?? "0");

    // Consent bars
    const total      = data.totalStudents || 1;
    const consented  = data.consented || 0;
    const notConsented = data.notConsented || 0;

    setText("res-consented",     consented);
    setText("res-not-consented", notConsented);

    setTimeout(() => {
      setWidth("res-consented-bar",     ((consented / total) * 100).toFixed(1) + "%");
      setWidth("res-not-consented-bar", ((notConsented / total) * 100).toFixed(1) + "%");
    }, 200);

    // Data quality score
    // Formula: (1 - flagged/total) * 100
    // Higher flagged rate = lower quality score
    // This gives you a number to cite in your paper
    const flagRate    = data.totalSessions > 0
      ? data.flaggedSessions / data.totalSessions
      : 0;
    const qualityScore = Math.round((1 - flagRate) * 100);

    setText("res-quality-score", qualityScore + "%");

    const noteEl = document.getElementById("res-quality-note");
    if (noteEl) {
      if (qualityScore >= 95) {
        noteEl.textContent = "Excellent data quality. Low flag rate indicates consistent user behaviour.";
        noteEl.style.color = "#2a7a4e";
      } else if (qualityScore >= 80) {
        noteEl.textContent = "Good data quality. Review flagged sessions before training.";
        noteEl.style.color = "#b07d10";
      } else {
        noteEl.textContent = "Review required. High flag rate may indicate data quality issues.";
        noteEl.style.color = "#D9534F";
      }
    }

  } catch (err) {
    console.error("Research summary failed:", err);
  }
}

// ── LOAD FLAGGED SESSIONS ──
// Fetches all flagged revisions and renders them in the review queue table
// Why a review queue: for research integrity, exclusions should be
// deliberate decisions you can explain in your paper, not silent auto-removals
async function loadFlaggedSessions() {
  const tbody = document.getElementById("flagged-tbody");
  if (!tbody) return;

  try {
    const res  = await fetch(`${API}/api/admin/research/flagged`, { credentials: "include" });
    const data = await res.json();
    const sessions = data.flaggedSessions || [];

    if (!sessions.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="py-xl text-center text-on-surface-variant">
            No flagged sessions yet. Sessions will appear here when flagging rules are triggered.
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = sessions.map(s => {
      const date  = s.completedAt
        ? new Date(s.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
        : "—";
      const score = s.score != null ? s.score + "%" : "—";
      const excluded = s.excludedFromTraining;

      return `
        <tr class="hover:bg-background transition-colors">
          <td class="py-md pr-md">
            <p class="font-semibold text-primary text-body-sm">${s.userName || "—"}</p>
            <p class="text-[11px] text-on-surface-variant">${s.userEmail || ""}</p>
          </td>
          <td class="py-md pr-md text-body-sm text-on-surface">${s.topicTitle || "—"}</td>
          <td class="py-md pr-md text-body-sm font-semibold ${s.score < 30 ? "text-error" : "text-primary"}">${score}</td>
          <td class="py-md pr-md text-body-sm text-on-surface-variant">${s.flagReason || "Manual review"}</td>
          <td class="py-md pr-md">
            ${excluded
              ? `<span class="px-2 py-1 bg-error-container/20 text-error text-[10px] font-bold rounded-full border border-error/20">EXCLUDED</span>`
              : `<span class="px-2 py-1 bg-secondary-container/20 text-secondary text-[10px] font-bold rounded-full border border-secondary/20">KEPT</span>`
            }
          </td>
          <td class="py-md">
            <button onclick="toggleExclude('${s.topicId}', ${s.revisionNumber}, ${!excluded}, this)"
              class="px-md py-1 text-label-md rounded-lg border transition-all ${
                excluded
                  ? "border-primary text-primary hover:bg-primary/10"
                  : "border-error text-error hover:bg-error/10"
              }">
              ${excluded ? "Keep" : "Exclude"}
            </button>
          </td>
        </tr>`;
    }).join("");

  } catch (err) {
    console.error("Flagged sessions failed:", err);
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="py-xl text-center text-error">
          Failed to load flagged sessions.
        </td>
      </tr>`;
  }
}

// ── TOGGLE EXCLUDE ──
// Called when admin clicks Keep or Exclude on a flagged session
// Sends PATCH request to backend to update excludedFromTraining
// Why PATCH: we're only updating one field on a nested subdocument
async function toggleExclude(topicId, revisionNumber, exclude, btn) {
  try {
    btn.textContent = "Saving...";
    btn.disabled    = true;

    const res = await fetch(
      `${API}/api/admin/research/exclude/${topicId}/${revisionNumber}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ exclude })
      }
    );

    if (!res.ok) throw new Error("Failed to update");

    // Reload the table to reflect the change
    // Why reload instead of just updating the button:
    // the status badge and button label both need to change,
    // and the summary cards need to update too
    await loadFlaggedSessions();
    await loadResearchSummary();

  } catch (err) {
    console.error("Toggle exclude failed:", err);
    btn.textContent = "Error";
    btn.disabled    = false;
  }
}

// ── EXPORT ALL REVISION DATA ──
// Downloads complete revision dataset as CSV
// This is the primary data export for your research paper
// The CSV includes profileAtTest so you can validate predictions offline
async function exportAllData() {
  try {
    const res  = await fetch(`${API}/api/admin/research/export`, { credentials: "include" });
    const data = await res.json();
    const rows = data.data || [];

    const headers = [
      "User Name", "Email", "Memory Profile", "Memory Score (%)",
      "Topic", "Revision Number", "Status", "Score (%)",
      "Profile At Test", "Confidence At Test",
      "Completed At", "Flagged", "Flag Reason", "Excluded From Training"
    ];

    const csvRows = [
      headers.join(","),
      ...rows.map(r => [
        `"${r.userName || ""}"`,
        `"${r.userEmail || ""}"`,
        r.memoryProfile || "",
        r.memoryPercentage ?? "",
        `"${r.topicTitle || ""}"`,
        r.revisionNumber ?? "",
        r.status || "",
        r.score ?? "",
        r.profileAtTest || "",
        r.confidenceAtTest ?? "",
        r.completedAt ? new Date(r.completedAt).toLocaleDateString() : "",
        r.flagged ? "Yes" : "No",
        `"${r.flagReason || ""}"`,
        r.excludedFromTraining ? "Yes" : "No"
      ].join(","))
    ];

    downloadCSV(csvRows.join("\n"), `recallbot_research_data_${today()}.csv`);

  } catch (err) {
    console.error("Export failed:", err);
    alert("Export failed. Try again.");
  }
}

// ── EXPORT MEMORY PROFILES ONLY ──
// Lighter export — just user profiles for quick analysis
async function exportProfiles() {
  try {
    const data  = await fetchUsers();
    const users = data.users || [];

    const headers = ["Name", "Email", "Memory Profile", "Memory Score (%)", "Assessment Done", "Joined"];

    const csvRows = [
      headers.join(","),
      ...users.map(u => [
        `"${u.name || ""}"`,
        `"${u.email || ""}"`,
        u.memoryProfile || "",
        u.memoryPercentage ?? "",
        u.hasCompletedAssessment ? "Yes" : "No",
        u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ""
      ].join(","))
    ];

    downloadCSV(csvRows.join("\n"), `recallbot_profiles_${today()}.csv`);

  } catch (err) {
    console.error("Profile export failed:", err);
    alert("Export failed. Try again.");
  }
}

// ── CSV DOWNLOAD HELPER ──
function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function today() {
  return new Date().toISOString().split("T")[0];
}

// ── INIT ──
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(async () => {
    await loadResearchSummary();
    await loadFlaggedSessions();
  }, 300);
});