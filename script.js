// ===============================
// FALSE NOTE - Vanilla JS Version
// DESKRIPSI:
// Mengatur flow visual novel, prolog, case,
// puzzle investigasi, debat, save/load, dan ending.
// ===============================

let integrity = 100;
let suspicion = 0;
let evidence = [];
let unlockedCase = 1;
let currentCase = 1;

let volumeOn = true;
let textSpeed = 'normal';

const SAVE_KEY = 'false_note_vanilla_save';

const speedMap = {
  slow: 48,
  normal: 26,
  fast: 10
};

const evidenceDatabase = {
  email_potongan: {
    id: 'email_potongan',
    name: 'Email Potongan',
    desc: 'Email yang menyebut potongan 10 persen sebagai biaya administrasi.',
    hint: 'Bantah klaim biaya administrasi biasa.'
  },
  selisih_anggaran: {
    id: 'selisih_anggaran',
    name: 'Selisih Anggaran',
    desc: 'Laporan resmi 500 juta, realisasi hanya 300 juta.',
    hint: 'Bantah klaim revisi teknis.'
  },
  log_server: {
    id: 'log_server',
    name: 'Log Server',
    desc: 'Log akses malam hari ke folder audit.',
    hint: 'Bantah klaim tidak ada akses ilegal.'
  },
  false_note_sys: {
    id: 'false_note_sys',
    name: 'FALSE_NOTE.sys',
    desc: 'File utama berisi rangkaian transaksi dan revisi palsu.',
    hint: 'Bukti utama di sidang internal.'
  }
};

const characterAssets = {
  Raka: {
    idle: 'assets/characters/clean/raka_idle.png',
    talk: 'assets/characters/clean/raka_talk.png'
  },
  Bella: {
    idle: 'assets/characters/clean/bella_idle.png',
    talk: 'assets/characters/clean/bella_talk.png'
  },
  Jeki: {
    idle: 'assets/characters/clean/jeki_idle.png',
    talk: 'assets/characters/clean/jeki_talk.png'
  },
  'Dr. Adrian': {
    idle: 'assets/characters/clean/adrian_idle.png',
    talk: 'assets/characters/clean/adrian_talk.png'
  }
};

const cases = [
  {
    id: 1,
    title: 'Email Potongan',
    bg: 'bg-office',
    requiredEvidence: 'email_potongan',
    opponent: 'Lawan',
    opponentLine: 'Itu hanya biaya administrasi biasa.',
    success: 'Bukti cocok. Klaim biaya administrasi berhasil dibantah.',
    fail: 'Bukti lemah. Lawan membalikkan argumen.',
    dialogue: [
      ['Raka', ['Email ini terlihat biasa.', 'Tapi bagian bawahnya aneh.']],
      ['Bella', ['Jangan buka itu terlalu lama.']],
      ['Raka', ['Kenapa?']],
      ['Bella', ['Karena semua akses dicatat.']]
    ],
    clues: [
      ['Laptop', 'Inbox admin masih terbuka. Ada email dengan subjek potongan dana.', 'email_potongan', 12, 26],
      ['Dokumen', 'Dokumen penerima beasiswa terlihat bersih, tetapi lampirannya hilang.', null, 44, 40],
      ['Sticky Note', 'Catatan: "10 persen jangan ditulis di laporan".', null, 70, 24],
      ['Map Arsip', 'Map arsip kosong, seperti baru saja dipindahkan.', null, 22, 58],
      ['Flashdisk', 'Flashdisk terkunci. Labelnya: ADMIN-FEE.', null, 64, 62]
    ]
  },
  {
    id: 2,
    title: 'Selisih Anggaran',
    bg: 'bg-library',
    requiredEvidence: 'selisih_anggaran',
    opponent: 'Lawan',
    opponentLine: 'Angka itu hanya revisi teknis.',
    success: 'Bukti cocok. Selisih anggaran tidak bisa disebut revisi teknis.',
    fail: 'Bukti lemah. Selisih itu dianggap kesalahan input.',
    dialogue: [
      ['Raka', ['Laporan resmi tertulis lima ratus juta.']],
      ['Jeki', ['Tapi catatan realisasinya cuma tiga ratus juta.']],
      ['Raka', ['Selisih dua ratus juta.']],
      ['Jeki', ['Itu bukan salah ketik, Rak.']]
    ],
    clues: [
      ['Laptop', 'Sheet audit menampilkan formula yang diganti manual.', null, 18, 28],
      ['Dokumen', 'Dokumen realisasi menunjukkan angka Rp 300.000.000.', 'selisih_anggaran', 48, 42],
      ['Sticky Note', 'Catatan kecil: "samakan nominal sebelum rapat".', null, 72, 30],
      ['Map Arsip', 'Map arsip memuat laporan lama yang berbeda dari laporan final.', 'selisih_anggaran', 26, 62],
      ['Flashdisk', 'Tidak ada file baru di flashdisk ini.', null, 66, 62]
    ]
  },
  {
    id: 3,
    title: 'Ruang Server',
    bg: 'bg-server',
    requiredEvidence: 'log_server',
    opponent: 'Lawan',
    opponentLine: 'Tidak ada akses ilegal dalam sistem.',
    success: 'Bukti cocok. Log server membuktikan akses malam hari.',
    fail: 'Bukti lemah. Akses ilegal belum terbukti.',
    dialogue: [
      ['Raka', ['File ini tidak seharusnya ada di sini.']],
      ['Bella', ['Raka, keluar sekarang.']],
      ['Raka', ['Tunggu. Ada log akses malam hari.']],
      ['Bella', ['Kalau mereka tahu kamu melihat ini, selesai.']]
    ],
    clues: [
      ['Laptop', 'Terminal server mencatat login pukul 02.13.', 'log_server', 18, 30],
      ['Dokumen', 'Print out backup terlihat baru dikeluarkan.', null, 48, 48],
      ['Sticky Note', 'Catatan sandi sementara tertempel di rak server.', null, 70, 26],
      ['Map Arsip', 'Map ini hanya berisi daftar perangkat.', null, 24, 62],
      ['Flashdisk', 'Flashdisk menyimpan backup log akses malam hari.', 'log_server', 66, 64]
    ]
  },
  {
    id: 4,
    title: 'Sidang Internal',
    bg: 'bg-court',
    requiredEvidence: 'false_note_sys',
    opponent: 'Dr. Adrian',
    opponentLine: 'Tanpa bukti lengkap, ini hanya tuduhan.',
    success: 'Bukti cocok. FALSE_NOTE.sys membuka seluruh rangkaian manipulasi.',
    fail: 'Bukti lemah. Sidang mulai meragukan Raka.',
    dialogue: [
      ['Dr. Adrian', ['Kamu hanya mahasiswa magang.', 'Kamu tidak paham cara institusi bekerja.']],
      ['Raka', ['Justru karena saya mahasiswa, saya tahu siapa yang dirugikan.']],
      ['Dr. Adrian', ['Tanpa bukti lengkap, ini hanya tuduhan.']]
    ],
    clues: [
      ['Laptop', 'Layar sidang menerima file dari akun anonim.', null, 20, 32],
      ['Dokumen', 'Lampiran audit final tidak punya jejak verifikasi independen.', null, 48, 48],
      ['Sticky Note', 'Catatan: "jika terdesak, serang kredibilitas Raka".', null, 72, 30],
      ['Map Arsip', 'Map sidang berisi daftar saksi yang dicoret.', null, 26, 62],
      ['Flashdisk', 'Flashdisk memuat file FALSE_NOTE.sys.', 'false_note_sys', 66, 64]
    ]
  }
];

const prolog = [
  ['Sistem', ['Hari pertama magang Raka dimulai seperti biasa.']],
  ['Sistem', ['Ruang administrasi terlihat rapi, tapi ada sesuatu yang terasa janggal.']],
  ['Raka', ['Kenapa folder audit ini dikunci?']],
  ['Raka', ['Dan kenapa namaku ada di daftar penerima akses?']],
  ['Sistem', ['Sebuah file muncul di layar.']],
  ['Sistem', ['Namanya: FALSE_NOTE.sys']],
  ['Raka', ['Kalau ini cuma kesalahan sistem... kenapa aku merasa sedang diawasi?']]
];

const preEndingDialogue = [
  ['Sistem', ['Ruang sidang mendadak sunyi.']],
  ['Sistem', ['Semua layar menampilkan data yang sama.']],
  ['Raka', ['Ini bukan soal menang debat.', 'Ini soal berapa lama kita membiarkan kebohongan terlihat normal.']],
  ['Dr. Adrian', ['Kamu tidak tahu dampaknya.']],
  ['Raka', ['Saya tahu.', 'Yang saya tidak tahu adalah kenapa semua orang memilih diam.']]
];

const endingText = {
  true: [
    'Raka menyerahkan seluruh bukti.',
    'Sidang internal berubah menjadi investigasi resmi.',
    'Beberapa nama diperiksa.',
    'Kampus tidak langsung bersih.',
    'Tapi hari itu, satu kebohongan berhenti terlihat normal.'
  ],
  neutral: [
    'Raka berhasil bicara.',
    'Tapi bukti yang ia bawa belum cukup kuat.',
    'Beberapa orang mulai percaya.',
    'Namun sistem belum sepenuhnya berubah.',
    'Perjuangan belum selesai.'
  ],
  bad: [
    'Raka terlalu lama ragu.',
    'Bukti hilang sebelum sempat diserahkan.',
    'Nama Raka berubah menjadi bahan rumor.',
    'Dan kampus kembali berjalan seperti biasa.',
    'Seolah tidak pernah terjadi apa-apa.'
  ]
};

const el = {
  screen: document.getElementById('game-screen'),
  mainMenu: document.getElementById('main-menu'),
  content: document.getElementById('content-layer'),
  characterStage: document.getElementById('character-stage'),
  status: document.getElementById('status-panel'),
  inventory: document.getElementById('inventory'),
  inventorySlots: document.getElementById('inventory-slots'),
  integrityBar: document.getElementById('integrity-bar'),
  suspicionBar: document.getElementById('suspicion-bar'),
  integrityText: document.getElementById('integrity-text'),
  suspicionText: document.getElementById('suspicion-text'),
  dialogueBox: document.getElementById('dialogue-box'),
  speaker: document.getElementById('speaker-name'),
  dialogueText: document.getElementById('dialogue-text'),
  dialogueNext: document.getElementById('dialogue-next'),
  settingPanel: document.getElementById('setting-panel'),
  volumeToggle: document.getElementById('volume-toggle'),
  textSpeed: document.getElementById('text-speed'),
  settingClose: document.getElementById('setting-close'),
  eitssssLayer: document.getElementById('eitssss-layer'),
  toast: document.getElementById('toast')
};

// ===============================
// FUNGSI: init()
// DESKRIPSI: Memasang event awal game.
// ===============================
function init() {
  document.querySelector('[data-action="start"]').addEventListener('click', startGame);
  document.querySelector('[data-action="load"]').addEventListener('click', loadGame);
  document.querySelector('[data-action="setting"]').addEventListener('click', openSetting);
  document.querySelector('[data-action="exit"]').addEventListener('click', () => showToast('Game ditutup.'));

  el.volumeToggle.addEventListener('click', () => {
    volumeOn = !volumeOn;
    el.volumeToggle.textContent = volumeOn ? 'ON' : 'OFF';
  });
  el.textSpeed.addEventListener('change', (event) => {
    textSpeed = event.target.value;
  });
  el.settingClose.addEventListener('click', closeSetting);

  updateHud();
}

// ===============================
// FUNGSI: startGame()
// DESKRIPSI: Memulai game baru dari prolog.
// ===============================
function startGame() {
  integrity = 100;
  suspicion = 0;
  evidence = [];
  unlockedCase = 1;
  currentCase = 1;
  saveGame();
  hideMainMenu();
  setBackground('bg-office');
  playDialogue(prolog, showCaseSelect);
}

// ===============================
// FUNGSI: loadGame()
// DESKRIPSI: Mengambil progress dari localStorage.
// ===============================
function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) {
    showToast('Belum ada data tersimpan.');
    return;
  }

  try {
    const data = JSON.parse(raw);
    integrity = data.integrity ?? 100;
    suspicion = data.suspicion ?? 0;
    evidence = Array.isArray(data.evidence) ? data.evidence : [];
    unlockedCase = data.unlockedCase ?? 1;
    currentCase = data.currentCase ?? 1;
    hideMainMenu();
    showCaseSelect();
  } catch (error) {
    showToast('Data save rusak.');
  }
}

// ===============================
// FUNGSI: saveGame()
// DESKRIPSI: Menyimpan variabel utama game.
// ===============================
function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify({
    integrity,
    suspicion,
    evidence,
    unlockedCase,
    currentCase
  }));
}

function hideMainMenu() {
  el.mainMenu.classList.add('hidden');
  el.content.classList.remove('hidden');
  el.status.classList.remove('hidden');
  el.inventory.classList.remove('hidden');
  updateHud();
}

function openSetting() {
  el.settingPanel.classList.remove('hidden');
}

function closeSetting() {
  el.settingPanel.classList.add('hidden');
}

function setBackground(className) {
  el.screen.className = `screen ${className}`;
}

function setContent(html) {
  el.content.innerHTML = html;
}

function prepareCharacterStage(dialogueQueue) {
  const speakers = [];
  dialogueQueue.forEach(([speaker]) => {
    if (characterAssets[speaker] && !speakers.includes(speaker)) speakers.push(speaker);
  });

  if (speakers.length === 0) {
    hideCharacterStage();
    return;
  }

  const ordered = speakers.includes('Raka')
    ? ['Raka', ...speakers.filter((speaker) => speaker !== 'Raka')]
    : speakers;

  el.characterStage.innerHTML = '';
  ordered.slice(0, 2).forEach((speaker, index) => {
    const image = document.createElement('img');
    image.src = characterAssets[speaker].idle;
    image.alt = speaker;
    image.dataset.speaker = speaker;
    image.className = `character-sprite ${index === 0 ? 'left' : 'right'} inactive`;
    el.characterStage.appendChild(image);
  });
  el.characterStage.classList.remove('hidden');
}

function setActiveCharacter(speaker) {
  el.characterStage.querySelectorAll('.character-sprite').forEach((image) => {
    const isActive = image.dataset.speaker === speaker;
    const assets = characterAssets[image.dataset.speaker];
    image.src = isActive ? assets.talk : assets.idle;
    image.classList.toggle('active', isActive);
    image.classList.toggle('inactive', !isActive);
  });
}

function hideCharacterStage() {
  el.characterStage.classList.add('hidden');
  el.characterStage.innerHTML = '';
}

function showToast(message) {
  el.toast.textContent = message;
  el.toast.classList.remove('hidden');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => el.toast.classList.add('hidden'), 1800);
}

function updateHud() {
  const safeIntegrity = Math.max(0, Math.min(100, integrity));
  const safeSuspicion = Math.max(0, Math.min(100, suspicion));
  el.integrityBar.style.width = `${safeIntegrity}%`;
  el.suspicionBar.style.width = `${safeSuspicion}%`;
  el.integrityText.textContent = safeIntegrity;
  el.suspicionText.textContent = safeSuspicion;
  renderInventory();
}

function renderInventory() {
  const latestEvidence = evidence.slice(-3);
  el.inventorySlots.innerHTML = '';
  for (let index = 0; index < 3; index += 1) {
    const id = latestEvidence[index];
    const item = document.createElement('div');
    item.className = `slot ${id ? '' : 'empty'}`;
    item.textContent = id ? evidenceDatabase[id].name : 'Kosong';
    if (id) item.title = `${evidenceDatabase[id].desc}\nHint: ${evidenceDatabase[id].hint}`;
    el.inventorySlots.appendChild(item);
  }
}

function addEvidence(id) {
  if (!id || evidence.includes(id)) return;
  evidence.push(id);
  updateHud();
  saveGame();
}

function applyWrongAnswer() {
  integrity = Math.max(0, integrity - 10);
  suspicion = Math.min(100, suspicion + 15);
  updateHud();
  saveGame();
  if (suspicion >= 100) showEnding('bad');
}

function applyCorrectAnswer() {
  suspicion = Math.min(100, suspicion + 5);
  updateHud();
  saveGame();
  if (suspicion >= 100) showEnding('bad');
}

// ===============================
// FUNGSI: showDialogue()
// DESKRIPSI: Dialog reusable untuk prolog, case, dan ending.
// PARAMETER:
// speaker: nama pembicara
// textArray: daftar teks
// onComplete: callback saat selesai
// ===============================
function showDialogue(speaker, textArray, onComplete) {
  let lineIndex = 0;
  let charIndex = 0;
  let currentLine = textArray[0] || '';
  let typeTimer = null;
  let typing = false;

  el.dialogueBox.classList.remove('hidden');
  el.speaker.textContent = speaker;
  setActiveCharacter(speaker);

  const finishLine = () => {
    window.clearInterval(typeTimer);
    el.dialogueText.textContent = currentLine;
    el.dialogueText.classList.remove('typing');
    typing = false;
  };

  const typeLine = () => {
    currentLine = textArray[lineIndex];
    charIndex = 0;
    typing = true;
    el.dialogueText.textContent = '';
    el.dialogueText.classList.add('typing');
    window.clearInterval(typeTimer);
    typeTimer = window.setInterval(() => {
      charIndex += 1;
      el.dialogueText.textContent = currentLine.slice(0, charIndex);
      if (charIndex >= currentLine.length) finishLine();
    }, speedMap[textSpeed]);
  };

  const next = () => {
    if (typing) {
      finishLine();
      return;
    }
    lineIndex += 1;
    if (lineIndex >= textArray.length) {
      window.clearInterval(typeTimer);
      el.dialogueNext.removeEventListener('click', next);
      el.dialogueBox.classList.add('hidden');
      onComplete?.();
      return;
    }
    typeLine();
  };

  el.dialogueNext.addEventListener('click', next);
  typeLine();
}

function playDialogue(queue, onComplete) {
  let index = 0;
  prepareCharacterStage(queue);
  const playNext = () => {
    if (index >= queue.length) {
      hideCharacterStage();
      onComplete?.();
      return;
    }
    const [speaker, lines] = queue[index];
    index += 1;
    showDialogue(speaker, lines, playNext);
  };
  playNext();
}

function showCaseSelect() {
  setBackground('bg-corridor');
  updateHud();
  const cards = cases.map((caseData) => {
    const locked = caseData.id > unlockedCase;
    return `
      <button class="case-card ${locked ? 'locked' : ''}" data-case="${caseData.id}" ${locked ? 'disabled' : ''}>
        <b>Case ${caseData.id}</b>
        <span>${caseData.title}</span>
      </button>
    `;
  }).join('');

  setContent(`
    <section class="center-panel">
      <h2>PILIH CASE</h2>
      <p>Case yang belum terbuka akan terkunci sampai case sebelumnya selesai.</p>
      <div class="case-grid">${cards}</div>
    </section>
  `);

  document.querySelectorAll('[data-case]').forEach((button) => {
    button.addEventListener('click', () => startCase(Number(button.dataset.case)));
  });
}

function startCase(caseId) {
  const caseData = cases.find((item) => item.id === caseId);
  if (!caseData || caseId > unlockedCase) return;

  currentCase = caseId;
  saveGame();
  setBackground(caseData.bg);
  setContent('');
  playDialogue(caseData.dialogue, () => showInvestigation(caseData));
}

function showInvestigation(caseData) {
  setBackground(caseData.bg);
  const hotspots = caseData.clues.map(([label, desc, evidenceId, x, y], index) => `
    <button class="hotspot" style="left:${x}%; top:${y}%;" data-clue="${index}">
      ${label}
    </button>
  `).join('');

  setContent(`
    <section class="center-panel">
      <h2>INVESTIGATION MODE</h2>
      <p>Klik objek di ruangan. Beberapa clue akan masuk ke inventory.</p>
      <div class="investigation-map">${hotspots}</div>
      <div class="button-row">
        <button class="gold-button" id="audit-button">Analisis Dokumen Audit</button>
      </div>
    </section>
  `);

  document.querySelectorAll('[data-clue]').forEach((button) => {
    button.addEventListener('click', () => {
      const [label, desc, evidenceId] = caseData.clues[Number(button.dataset.clue)];
      button.classList.add('done');
      if (evidenceId) addEvidence(evidenceId);
      showDialogue('Sistem', [`${label}: ${desc}`], () => {});
    });
  });

  document.getElementById('audit-button').addEventListener('click', () => showValidationGate(caseData));
}

function showValidationGate(caseData) {
  setContent(`
    <section class="center-panel">
      <h2>DOKUMEN AUDIT</h2>
      <p>Status dokumen terlihat valid, tetapi beberapa clue menunjukkan inkonsistensi.</p>
      <p>Tekan EITSSSS untuk menantang dokumen sebelum memilih validasi.</p>
      <div class="button-row">
        <button class="danger-button" id="eitssss-validation">EITSSSS!</button>
      </div>
    </section>
  `);

  document.getElementById('eitssss-validation').addEventListener('click', () => {
    playEitssssEffect(() => showValidationChoices(caseData));
  });
}

function showValidationChoices(caseData) {
  setContent(`
    <section class="center-panel">
      <h2>VALID / PALSU</h2>
      <p>Apakah dokumen audit ini valid?</p>
      <div class="button-row">
        <button class="valid-button" id="choose-valid">VALID</button>
        <button class="fake-button" id="choose-fake">PALSU</button>
      </div>
    </section>
  `);

  document.getElementById('choose-valid').addEventListener('click', () => resolveValidation(caseData, true));
  document.getElementById('choose-fake').addEventListener('click', () => resolveValidation(caseData, false));
}

function resolveValidation(caseData, choseValid) {
  const hasClue = evidence.includes(caseData.requiredEvidence);
  const correct = !choseValid && hasClue;

  if (correct) {
    applyCorrectAnswer();
    showDialogue('Sistem', ['Inkonsistensi ditemukan. Bukti berhasil diamankan.'], () => showDebate(caseData));
    return;
  }

  applyWrongAnswer();
  if (suspicion >= 100) return;
  showDialogue('Sistem', ['Analisis belum kuat. Integrity berkurang dan suspicion naik.'], () => showInvestigation(caseData));
}

function showDebate(caseData) {
  setBackground(caseData.bg);
  setContent(`
    <section class="center-panel">
      <h2>DEBAT</h2>
      <p><b>${caseData.opponent}:</b> "${caseData.opponentLine}"</p>
      <p>Tekan EITSSSS untuk membuka pilihan bukti.</p>
      <div class="button-row">
        <button class="danger-button" id="eitssss-debate">EITSSSS!</button>
      </div>
    </section>
  `);

  document.getElementById('eitssss-debate').addEventListener('click', () => {
    playEitssssEffect(() => showEvidenceChoices(caseData));
  });
}

function showEvidenceChoices(caseData) {
  const buttons = evidence.length === 0
    ? '<p>Belum ada bukti di inventory.</p>'
    : evidence.map((id) => `
      <button class="evidence-button" data-evidence="${id}">
        <b>${evidenceDatabase[id].name}</b><br>
        <small>${evidenceDatabase[id].hint}</small>
      </button>
    `).join('');

  setContent(`
    <section class="center-panel">
      <h2>PILIH BUKTI</h2>
      <p>Pilih bukti untuk membantah klaim lawan.</p>
      ${buttons}
    </section>
  `);

  document.querySelectorAll('[data-evidence]').forEach((button) => {
    button.addEventListener('click', () => resolveDebate(caseData, button.dataset.evidence));
  });
}

function resolveDebate(caseData, selectedEvidence) {
  if (selectedEvidence === caseData.requiredEvidence) {
    applyCorrectAnswer();
    unlockedCase = Math.max(unlockedCase, caseData.id + 1);
    saveGame();
    showDialogue('Sistem', [caseData.success], () => showCaseResult(caseData, true));
    return;
  }

  applyWrongAnswer();
  if (suspicion >= 100) return;
  showDialogue('Sistem', [caseData.fail], () => showCaseResult(caseData, false));
}

function showCaseResult(caseData, success) {
  if (success && caseData.id === 4) {
    playDialogue(preEndingDialogue, () => showEnding());
    return;
  }

  setContent(`
    <section class="center-panel">
      <h2>${success ? 'CASE SELESAI' : 'CASE GAGAL'}</h2>
      <p>${success ? 'Case berikutnya terbuka dan progress tersimpan.' : 'Bukti belum cukup. Ulangi case ini dari pilihan case.'}</p>
      <div class="button-row">
        <button class="gold-button" id="back-case">Kembali ke Pilih Case</button>
      </div>
    </section>
  `);

  document.getElementById('back-case').addEventListener('click', showCaseSelect);
}

// ===============================
// FUNGSI: playEitssssEffect()
// DESKRIPSI:
// Efek hanya dipanggil dari klik tombol EITSSSS.
// Tidak dipanggil otomatis saat jawaban benar.
// ===============================
function playEitssssEffect(onComplete) {
  el.eitssssLayer.classList.remove('hidden');
  el.screen.classList.add('shake');

  window.setTimeout(() => {
    el.screen.classList.remove('shake');
  }, 280);

  window.setTimeout(() => {
    el.eitssssLayer.classList.add('hidden');
    onComplete?.();
  }, 920);
}

function showEnding(forcedType) {
  let type = forcedType;
  if (!type) {
    if (integrity < 40 || suspicion >= 100) type = 'bad';
    else if (integrity >= 70 && evidence.length >= 3) type = 'true';
    else type = 'neutral';
  }

  setBackground(type === 'bad' ? 'bg-corridor' : 'bg-court');
  const title = type === 'true' ? 'TRUE ENDING' : type === 'neutral' ? 'NEUTRAL ENDING' : 'BAD ENDING';
  setContent(`
    <section class="center-panel">
      <h2>${title}</h2>
      ${endingText[type].map((line) => `<p>${line}</p>`).join('')}
      <div class="button-row">
        <button class="gold-button" id="ending-menu">Kembali ke Main Menu</button>
      </div>
    </section>
  `);

  saveGame();
  document.getElementById('ending-menu').addEventListener('click', () => {
    el.content.classList.add('hidden');
    el.status.classList.add('hidden');
    el.inventory.classList.add('hidden');
    el.mainMenu.classList.remove('hidden');
    setBackground('bg-office');
  });
}

init();
