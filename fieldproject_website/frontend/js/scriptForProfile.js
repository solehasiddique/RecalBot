/* ── AVATAR ── */
function loadAv(inp) {
  const f = inp.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = e => {
    const img = document.getElementById('avImg');
    img.src = e.target.result; img.style.display = 'block';
    document.getElementById('avInit').style.display = 'none';
  };
  r.readAsDataURL(f);
}

/* ── EDIT SECTIONS ── */
const personalCfg = {
  name:  { id:'fv-name',    type:'text',  icon:'👤' },
  dob:   { id:'fv-dob',     type:'text',  icon:'🎂' },
  email: { id:'fv-email',   type:'email', icon:'✉️' },
  phone: { id:'fv-phone',   type:'tel',   icon:'📱' },
};
const academicCfg = {
  class:   { id:'fa-class',   type:'text', icon:'📖' },
  section: { id:'fa-section', type:'text', icon:'🚪' },
  roll:    { id:'fa-roll',    type:'text', icon:'🔢' },
  board:   { id:'fa-board',   type:'text', icon:'📋' },
  school:  { id:'fa-school',  type:'text', icon:'🏫' },
  stream:  { id:'fa-stream',  type:'text', icon:'🔬' },
  batch:   { id:'fa-batch',   type:'text', icon:'📅' },
};

let editingPersonal = false;
let editingAcademic = false;

function toggleEdit(section) {
  if (section === 'personal') {
    editingPersonal = !editingPersonal;
    applyEdit(personalCfg, editingPersonal, 'editBtnP', 'saveBtnP');
  } else {
    editingAcademic = !editingAcademic;
    applyEdit(academicCfg, editingAcademic, 'editBtnA', 'saveBtnA');
  }
}

function applyEdit(cfg, isEditing, btnId, saveBtnId) {
  const btn     = document.getElementById(btnId);
  const saveBtn = document.getElementById(saveBtnId);
  btn.textContent = isEditing ? 'Cancel' : 'Edit';
  btn.className   = isEditing ? 'edit-btn cancel' : 'edit-btn';
  saveBtn.style.display = isEditing ? 'block' : 'none';

  Object.values(cfg).forEach(({ id, type }) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (isEditing) {
      const inp = document.createElement('input');
      inp.type = type; inp.className = 'field-val editable';
      inp.id = id; inp.dataset.field = el.dataset.field;
      inp.value = el.textContent.trim();
      el.replaceWith(inp);
    } else {
      const inp = document.getElementById(id);
      const div = document.createElement('div');
      div.className = 'field-val'; div.id = id;
      div.dataset.field = inp.dataset.field;
      div.textContent = inp.value || inp.textContent;
      inp.replaceWith(div);
    }
  });
}

function saveSection(section) {
  const cfg = section === 'personal' ? personalCfg : academicCfg;
  const vals = {};
  Object.entries(cfg).forEach(([key, { id }]) => {
    const el = document.getElementById(id);
    if (el) vals[key] = el.value !== undefined ? el.value : el.textContent;
  });

  if (section === 'personal') {
    if (vals.name) {
      document.getElementById('heroName').textContent = vals.name;
      const p = vals.name.trim().split(' ');
      document.getElementById('avInit').textContent =
        ((p[0]?.[0]||'')+(p[1]?.[0]||'')).toUpperCase();
    }
    if (vals.email) document.getElementById('heroSub').textContent = vals.email;
    editingPersonal = true; toggleEdit('personal');
    toast('Personal details saved');
  } else {
    editingAcademic = true; toggleEdit('academic');
    toast('Academic info saved');
  }
}

/* ── DROP ZONE ── */
let droppedFile = null;
const iconMap  = { pdf:'📕',pptx:'📙',ppt:'📙',docx:'📘',doc:'📘',png:'📗',jpg:'📗',jpeg:'📗' };
const extClass = { pdf:'e-pdf',pptx:'e-pptx',ppt:'e-pptx',docx:'e-docx',doc:'e-docx',png:'e-img',jpg:'e-img',jpeg:'e-img' };
const nfiClass = { pdf:'ni-pdf',pptx:'ni-pptx',ppt:'ni-pptx',docx:'ni-docx',doc:'ni-docx',png:'ni-img',jpg:'ni-img',jpeg:'ni-img' };

function dzOver(e)  { e.preventDefault(); document.getElementById('dropZone').classList.add('over'); }
function dzLeave()  { document.getElementById('dropZone').classList.remove('over'); }
function dzDrop(e)  {
  e.preventDefault(); dzLeave();
  const f = e.dataTransfer.files[0]; if (!f) return;
  droppedFile = f; showChip(f);
  if (!document.getElementById('noteTitle').value)
    document.getElementById('noteTitle').value = f.name.replace(/\.[^.]+$/,'');
}
function fileChosen(inp) {
  const f = inp.files[0]; if (!f) return;
  droppedFile = f; showChip(f);
  if (!document.getElementById('noteTitle').value)
    document.getElementById('noteTitle').value = f.name.replace(/\.[^.]+$/,'');
}
function showChip(f) {
  const ext = f.name.split('.').pop().toLowerCase();
  document.getElementById('chipIcon').textContent = iconMap[ext] || '📄';
  document.getElementById('chipName').textContent = f.name;
  document.getElementById('fileChip').style.display = 'flex';
}
function clearFile() {
  droppedFile = null;
  document.getElementById('noteFile').value = '';
  document.getElementById('fileChip').style.display = 'none';
}

/* ── UPLOAD ── */
function doUpload() {
  const title   = document.getElementById('noteTitle').value.trim();
  const subjRaw = document.getElementById('noteSubject').value.trim();
  if (!title) { toast('Please enter a note title'); return; }

  const file  = droppedFile || document.getElementById('noteFile').files[0];
  const ext   = file ? file.name.split('.').pop().toLowerCase() : 'pdf';
  const icon  = iconMap[ext]  || '📄';
  const ec    = extClass[ext] || 'e-def';
  const nc    = nfiClass[ext] || 'ni-def';
  const sl    = subjRaw || 'General';
  const sk    = sl.toLowerCase();

  const pw  = document.getElementById('progWrap');
  const bar = document.getElementById('progBar');
  const lbl = document.getElementById('progLbl');
  const pct = document.getElementById('progPct');
  pw.style.display = 'flex'; bar.style.width = '0%';

  let w = 0;
  const iv = setInterval(() => {
    w += Math.random()*18 + 7;
    if (w >= 100) {
      w = 100; clearInterval(iv);
      bar.style.width = '100%'; pct.textContent = '100%';
      lbl.textContent = '✅ Analysis complete!';
      setTimeout(() => {
        pw.style.display = 'none'; bar.style.width = '0%';
        lbl.textContent = 'Uploading & analyzing with AI…'; pct.textContent = '0%';
        addNote(title, ext.toUpperCase(), icon, ec, nc, sk, sl);
        ['noteTitle','noteSubject','noteChapter','noteClass','noteType']
          .forEach(id => { document.getElementById(id).value = ''; });
        clearFile();
        document.getElementById('notesList').scrollIntoView({ behavior:'smooth', block:'start' });
      }, 600);
    }
    bar.style.width = w + '%'; pct.textContent = Math.floor(w) + '%';
  }, 130);
}

/* ── ADD NOTE ── */
function addNote(title, ext, icon, ec, nc, sv, sl) {
  const list = document.getElementById('notesList');
  const date = new Date().toLocaleDateString('en-GB',{ day:'numeric',month:'short',year:'numeric' });
  const card = document.createElement('div');
  card.className = 'note-card';
  card.dataset.subject = sv; card.dataset.title = title.toLowerCase();
  card.style.cssText = 'opacity:0;transform:translateY(7px);';
  card.innerHTML = `
    <div class="note-ico ${nc}">${icon}</div>
    <div class="note-body">
      <div class="note-title">${title}</div>
      <div class="note-meta">
        <span>${date}</span>
        <span class="n-ext ${ec}">${ext}</span>
        <span class="n-subj">${sl}</span>
      </div>
    </div>
    <button class="note-del" onclick="delNote(this)" title="Delete">✕</button>
  `;
  list.prepend(card);
  requestAnimationFrame(() => {
    card.style.transition = 'all .3s ease';
    card.style.opacity = '1'; card.style.transform = 'translateY(0)';
  });
  updateCount();
  toast(`"${title}" uploaded successfully`);
}

/* ── DELETE ── */
function delNote(btn) {
  const card = btn.closest('.note-card');
  card.style.transition = 'all .2s ease';
  card.style.opacity = '0'; card.style.transform = 'translateX(12px)';
  setTimeout(() => { card.remove(); updateCount(); checkEmpty(); }, 200);
}

/* ── UTILS ── */
function updateCount() {
  const n = document.querySelectorAll('.note-card').length;
  document.getElementById('nCount').textContent = n + (n === 1 ? ' NOTE' : ' NOTES');
  document.getElementById('hsNotes').textContent = n;
  checkEmpty();
}
function checkEmpty() {
  const vis = [...document.querySelectorAll('.note-card')].filter(c=>c.style.display!=='none');
  document.getElementById('emptyState').style.display = vis.length === 0 ? 'block' : 'none';
}
function searchNotes(q) {
  q = q.toLowerCase();
  document.querySelectorAll('.note-card').forEach(c=>{
    c.style.display = c.dataset.title.includes(q) ? 'flex' : 'none';
  });
  checkEmpty();
}
function filterBySubject(q) {
  q = q.toLowerCase().trim();
  document.querySelectorAll('.note-card').forEach(c=>{
    c.style.display = (!q || c.dataset.subject.includes(q)) ? 'flex' : 'none';
  });
  checkEmpty();
}
function toast(msg) {
  const t = document.getElementById('toast');
  t.innerHTML = '<span>✓</span> ' + msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}