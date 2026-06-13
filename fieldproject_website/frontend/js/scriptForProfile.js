import { BASE_URL } from "./config.js";

const personalCfg = {
  name: { id: "fv-name", type: "text" },
  email: { id: "fv-email", type: "email" },
  bio: { id: "fv-bio", type: "text" },
};

const academicCfg = {
  class: { id: "fa-class", type: "text" },
  section: { id: "fa-section", type: "text" },
  roll: { id: "fa-roll", type: "text" },
  board: { id: "fa-board", type: "text" },
  school: { id: "fa-school", type: "text" },
  stream: { id: "fa-stream", type: "text" },
  batch: { id: "fa-batch", type: "text" },
};

const iconMap = {
  pdf: "PDF",
  pptx: "PPT",
  ppt: "PPT",
  docx: "DOC",
  doc: "DOC",
  png: "IMG",
  jpg: "IMG",
  jpeg: "IMG",
};

const extClass = {
  pdf: "e-pdf",
  pptx: "e-pptx",
  ppt: "e-pptx",
  docx: "e-docx",
  doc: "e-docx",
  png: "e-img",
  jpg: "e-img",
  jpeg: "e-img",
};

const nfiClass = {
  pdf: "ni-pdf",
  pptx: "ni-pptx",
  ppt: "ni-pptx",
  docx: "ni-docx",
  doc: "ni-docx",
  png: "ni-img",
  jpg: "ni-img",
  jpeg: "ni-img",
};

let editingPersonal = false;
let editingAcademic = false;
let droppedFile = null;

function ensureToastElement() {
  let toastEl = document.getElementById("toast");
  if (!toastEl) {
    toastEl = document.createElement("div");
    toastEl.id = "toast";
    toastEl.className = "toast";
    document.body.appendChild(toastEl);
  }
}

async function apiRequest(path, options = {}) {
  const config = {
    credentials: "include",
    ...options,
  };

  if (config.body && !(config.body instanceof FormData)) {
    config.headers = {
      "Content-Type": "application/json",
      ...(config.headers || {}),
    };
  }

  const response = await fetch(`${BASE_URL}${path}`, config);
  let data = {};
  try {
    data = await response.json();
  } catch (_err) {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = value || "";
}

function getInitials(name) {
  if (!name) return "RB";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "RB";
}

function populateProfile(profile, notesCount) {
  const personal = profile?.personal || {};
  const academic = profile?.academic || {};
  const memory = profile?.memory || {};

  setText("fv-name", personal.name || "User");
  setText("fv-email", personal.email || "");
  setText("fv-bio", personal.bio || "");

  setText("fa-class", academic.class || "");
  setText("fa-section", academic.section || "");
  setText("fa-roll", academic.roll || "");
  setText("fa-board", academic.board || "");
  setText("fa-school", academic.school || "");
  setText("fa-stream", academic.stream || "");
  setText("fa-batch", academic.batch || "");

  setText("heroName", personal.name || "User");
  setText("heroSub", personal.email || "");
  setText("avInit", getInitials(personal.name));
  if (typeof notesCount === "number") setText("hsNotes", String(notesCount));

  const pills = [];
  const classSection = [academic.class, academic.section].filter(Boolean).join(" - ");
  if (classSection) pills.push(classSection);
  if (academic.school) pills.push(academic.school);
  const boardStream = [academic.board, academic.stream].filter(Boolean).join(" - ");
  if (boardStream) pills.push(boardStream);

  const heroPills = document.getElementById("heroPills");
  if (heroPills) {
    heroPills.innerHTML = pills
      .map((pill) => `<span class="hero-pill">${pill}</span>`)
      .join("");
  }

  const memoryPercentage =
    typeof memory.percentage === "number" ? Math.round(memory.percentage) : null;
  setText("hsMemory", memoryPercentage === null ? "--" : `${memoryPercentage}%`);
  setText("hsMemoryLabel", memory.label ? `Profile: ${memory.label}` : "Memory Profile");

  const avImg = document.getElementById("avImg");
  const avInit = document.getElementById("avInit");
  if (personal.avatarUrl && avImg && avInit) {
    avImg.src = personal.avatarUrl;
    avImg.style.display = "block";
    avInit.style.display = "none";
  }
}

async function loadProfile() {
  const data = await apiRequest("/api/profile");
  populateProfile(data.profile, data.notesCount);
}

function formatDate(isoDate) {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function renderNotes(notes) {
  const list = document.getElementById("notesList");
  if (!list) return;
  list.innerHTML = "";

  notes.forEach((note) => {
    const ext = (note.fileExt || "pdf").toLowerCase();
    const icon = iconMap[ext] || "FILE";
    const extStyle = extClass[ext] || "e-def";
    const iconStyle = nfiClass[ext] || "ni-def";
    const subject = note.subject || "General";

    const card = document.createElement("div");
    card.className = "note-card";
    card.dataset.noteId = note._id;
    card.dataset.subject = subject.toLowerCase();
    const searchText = `${note.subject || ""} ${note.description || ""} ${note.title || ""}`.toLowerCase();
    card.dataset.title = searchText;
    card.innerHTML = `
      <div class="note-ico ${iconStyle}">${icon}</div>
      <div class="note-body">
        <div class="note-title">${subject} Notes</div>
        <div class="note-meta">
          <span>${formatDate(note.createdAt)}</span>
          <span class="n-ext ${extStyle}">${(ext || "file").toUpperCase()}</span>
          <span class="n-subj">${subject}</span>
          ${note.description ? `<span>${note.description}</span>` : ""}
        </div>
      </div>
      <button class="note-del" onclick="delNote(this)" title="Delete">x</button>
    `;
    list.appendChild(card);
  });

  updateCount();
}

async function loadNotes() {
  const data = await apiRequest("/api/profile/notes");
  renderNotes(data.notes || []);
}

/* Avatar */
function loadAv(inp) {
  const file = inp.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (event) => {
    const avImg = document.getElementById("avImg");
    const avInit = document.getElementById("avInit");
    if (avImg && avInit) {
      avImg.src = event.target.result;
      avImg.style.display = "block";
      avInit.style.display = "none";
    }
    try {
      await apiRequest("/api/profile", {
        method: "PUT",
        body: JSON.stringify({ avatarUrl: event.target.result }),
      });
    } catch (error) {
      toast(error.message || "Failed to save avatar");
    }
  };
  reader.readAsDataURL(file);
}

/* Edit sections */
function toggleEdit(section) {
  if (section === "personal") {
    editingPersonal = !editingPersonal;
    applyEdit(personalCfg, editingPersonal, "editBtnP", "saveBtnP");
  } else {
    editingAcademic = !editingAcademic;
    applyEdit(academicCfg, editingAcademic, "editBtnA", "saveBtnA");
  }
}

function applyEdit(cfg, isEditing, btnId, saveBtnId) {
  const btn = document.getElementById(btnId);
  const saveBtn = document.getElementById(saveBtnId);
  if (!btn || !saveBtn) return;

  btn.textContent = isEditing ? "Cancel" : "Edit";
  btn.className = isEditing ? "edit-btn cancel" : "edit-btn";
  saveBtn.style.display = isEditing ? "block" : "none";

  Object.values(cfg).forEach(({ id, type }) => {
    const el = document.getElementById(id);
    if (!el) return;

    if (isEditing) {
      const inp = document.createElement("input");
      inp.type = type;
      inp.className = "field-val editable";
      inp.id = id;
      inp.dataset.field = el.dataset.field;
      inp.value = el.textContent.trim();
      el.replaceWith(inp);
    } else {
      const inp = document.getElementById(id);
      if (!inp) return;
      const div = document.createElement("div");
      div.className = "field-val";
      div.id = id;
      div.dataset.field = inp.dataset.field;
      div.textContent = inp.value || inp.textContent || "";
      inp.replaceWith(div);
    }
  });
}

function readSectionValues(cfg) {
  const values = {};
  Object.entries(cfg).forEach(([key, { id }]) => {
    const el = document.getElementById(id);
    if (!el) return;
    values[key] = (el.value !== undefined ? el.value : el.textContent || "").trim();
  });
  return values;
}

async function saveSection(section) {
  const personal = readSectionValues(personalCfg);
  const academic = readSectionValues(academicCfg);

  try {
    await apiRequest("/api/profile", {
      method: "PUT",
      body: JSON.stringify({
        personal: {
          name: personal.name,
          email: personal.email,
          bio: personal.bio,
        },
        academic,
      }),
    });

    if (section === "personal") {
      setText("heroName", personal.name);
      setText("heroSub", personal.email);
      setText("avInit", getInitials(personal.name));
      editingPersonal = true;
      toggleEdit("personal");
      toast("Personal details saved");
    } else {
      editingAcademic = true;
      toggleEdit("academic");
      toast("Academic info saved");
    }
  } catch (error) {
    toast(error.message || "Failed to save changes");
  }
}

/* Drop zone */
function dzOver(e) {
  e.preventDefault();
  document.getElementById("dropZone").classList.add("over");
}

function dzLeave() {
  document.getElementById("dropZone").classList.remove("over");
}

function dzDrop(e) {
  e.preventDefault();
  dzLeave();
  const file = e.dataTransfer.files[0];
  if (!file) return;
  droppedFile = file;
  showChip(file);
  if (!document.getElementById("noteSubject").value) {
    document.getElementById("noteSubject").value = file.name.replace(/\.[^.]+$/, "");
  }
}

function fileChosen(inp) {
  const file = inp.files[0];
  if (!file) return;
  droppedFile = file;
  showChip(file);
  if (!document.getElementById("noteSubject").value) {
    document.getElementById("noteSubject").value = file.name.replace(/\.[^.]+$/, "");
  }
}

function showChip(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  document.getElementById("chipIcon").textContent = iconMap[ext] || "FILE";
  document.getElementById("chipName").textContent = file.name;
  document.getElementById("fileChip").style.display = "flex";
}

function clearFile() {
  droppedFile = null;
  const input = document.getElementById("noteFile");
  if (input) input.value = "";
  document.getElementById("fileChip").style.display = "none";
}

/* Upload */
function setUploadProgress(value, labelText) {
  const progWrap = document.getElementById("progWrap");
  const progBar = document.getElementById("progBar");
  const progPct = document.getElementById("progPct");
  const progLbl = document.getElementById("progLbl");
  progWrap.style.display = "flex";
  progBar.style.width = `${value}%`;
  progPct.textContent = `${Math.floor(value)}%`;
  if (labelText) progLbl.textContent = labelText;
}

function resetUploadProgress() {
  const progWrap = document.getElementById("progWrap");
  const progBar = document.getElementById("progBar");
  const progPct = document.getElementById("progPct");
  const progLbl = document.getElementById("progLbl");

  progWrap.style.display = "none";
  progBar.style.width = "0%";
  progPct.textContent = "0%";
  progLbl.textContent = "Uploading";
}

async function doUpload() {
  const description = document.getElementById("noteDescription").value.trim();
  const subject = document.getElementById("noteSubject").value.trim();
  const file = droppedFile || document.getElementById("noteFile").files[0];

  if (!subject) {
    toast("Please enter subject name");
    return;
  }

  if (!file) {
    toast("Please select a note file");
    return;
  }

  const formData = new FormData();
  formData.append("title", `${subject} Notes`);
  formData.append("subject", subject);
  formData.append("description", description);
  formData.append("noteFile", file);

  let progress = 0;
  setUploadProgress(progress, "Uploading and analyzing...");
  const timer = setInterval(() => {
    progress = Math.min(progress + Math.random() * 15 + 5, 90);
    setUploadProgress(progress, "Uploading and analyzing...");
  }, 140);

  try {
    const data = await apiRequest("/api/profile/notes", {
      method: "POST",
      body: formData,
    });

    clearInterval(timer);
    setUploadProgress(100, "Upload complete");

    setTimeout(() => {
      resetUploadProgress();
    }, 500);

    const list = document.getElementById("notesList");
    if (list.querySelector(".note-card")) {
      list.innerHTML = "";
      loadNotes();
    } else {
      renderNotes([data.note]);
    }

    document.getElementById("noteDescription").value = "";
    document.getElementById("noteSubject").value = "";
    clearFile();
    toast(`"${subject}" notes uploaded successfully`);
  } catch (error) {
    clearInterval(timer);
    resetUploadProgress();
    toast(error.message || "Upload failed");
  }
}

/* Delete */
async function delNote(btn) {
  const card = btn.closest(".note-card");
  if (!card) return;

  try {
    const noteId = card.dataset.noteId;
    if (noteId) {
      await apiRequest(`/api/profile/notes/${noteId}`, { method: "DELETE" });
    }
    card.style.transition = "all .2s ease";
    card.style.opacity = "0";
    card.style.transform = "translateX(12px)";
    setTimeout(() => {
      card.remove();
      updateCount();
      checkEmpty();
    }, 200);
  } catch (error) {
    toast(error.message || "Failed to delete note");
  }
}

/* Utils */
function updateCount() {
  const count = document.querySelectorAll(".note-card").length;
  setText("nCount", `${count} ${count === 1 ? "NOTE" : "NOTES"}`);
  setText("hsNotes", String(count));
  checkEmpty();
}

function checkEmpty() {
  const visible = [...document.querySelectorAll(".note-card")].filter(
    (card) => card.style.display !== "none",
  );
  const emptyState = document.getElementById("emptyState");
  if (emptyState) {
    emptyState.style.display = visible.length === 0 ? "block" : "none";
  }
}

function searchNotes(query) {
  const q = (query || "").toLowerCase();
  document.querySelectorAll(".note-card").forEach((card) => {
    card.style.display = card.dataset.title.includes(q) ? "flex" : "none";
  });
  checkEmpty();
}

function filterBySubject(query) {
  const q = (query || "").toLowerCase().trim();
  document.querySelectorAll(".note-card").forEach((card) => {
    card.style.display = !q || card.dataset.subject.includes(q) ? "flex" : "none";
  });
  checkEmpty();
}

function toast(message) {
  ensureToastElement();
  const toastEl = document.getElementById("toast");
  toastEl.textContent = message;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 2800);
}

async function initProfilePage() {
  ensureToastElement();
  try {
    await Promise.all([loadProfile(), loadNotes()]);
  } catch (error) {
    toast(error.message || "Failed to load profile page");
  }
}

document.addEventListener("DOMContentLoaded", initProfilePage);
