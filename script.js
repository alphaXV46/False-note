// ===============================
// FALSE NOTE - Lore Baru
// Flow: Orientasi -> Investigasi -> Analisis -> Sidang
// ===============================

let integrity = 100;
let suspicion = 0;
let evidence = [];
let currentPhase = 1;
let investigationStep = 0;
let twistUnlocked = false;
let reportedSuspects = [];

let volumeOn = true;
let textSpeed = 'normal';
let isPaused = false;
let flowToken = 0;
let pauseCallbacks = [];

const SAVE_KEY = 'false_note_vanilla_save';

const speedMap = {
  slow: 48,
  normal: 26,
  fast: 10
};

const evidenceDatabase = {
  doc_anggaran_manipulasi: {
    id: 'doc_anggaran_manipulasi',
    name: 'Dokumen Anggaran Q3',
    desc: 'Dokumen anggaran Q3 menunjukkan angka yang diubah dari lampiran audit.',
    linkedSuspect: 'hendra',
    hint: 'Sanggah klaim anggaran sudah sesuai prosedur.'
  },
  kontrak_vendor_fiktif: {
    id: 'kontrak_vendor_fiktif',
    name: 'Kontrak Vendor Fiktif',
    desc: 'Kontrak memakai vendor yang tidak terdaftar di basis data pengadaan.',
    linkedSuspect: 'sinta',
    hint: 'Sanggah klaim semua vendor sudah diverifikasi.'
  },
  stempel_jeki_palsu: {
    id: 'stempel_jeki_palsu',
    name: 'Stempel Jeki Palsu',
    desc: 'Stempel atas nama Jeki ternyata dipalsukan untuk menjebaknya.',
    linkedSuspect: 'twist_jeki_framed',
    hint: 'Buktikan Jeki tidak menandatangani dokumen korup secara sadar.'
  },
  chat_instruksi_hendra: {
    id: 'chat_instruksi_hendra',
    name: 'Instruksi Hendra',
    desc: 'Pesan Hendra ke Sinta meminta angka laporan disesuaikan.',
    linkedSuspect: 'hendra',
    hint: 'Buktikan instruksi korup datang dari atas.'
  },
  chat_jeki_dipaksa: {
    id: 'chat_jeki_dipaksa',
    name: 'Jeki Dipaksa Tanda Tangan',
    desc: 'Pesan Hendra menunjukkan Jeki dipaksa menandatangani laporan.',
    linkedSuspect: 'twist_jeki_framed',
    hint: 'Buktikan Jeki korban, bukan pelaku.'
  },
  rekening_sinta: {
    id: 'rekening_sinta',
    name: 'Rekening Sinta',
    desc: 'Data transfer mencurigakan mengarah ke rekening pribadi Sinta.',
    linkedSuspect: 'sinta',
    hint: 'Sanggah klaim tidak ada aliran dana ilegal.'
  }
};

const suspects = [
  {
    id: 'hendra',
    name: 'Hendra Kusuma',
    title: 'Direktur Utama',
    appearance: 'ramah dan kooperatif',
    actualRole: 'koruptor',
    crimes: [
      'Memanipulasi angka anggaran Q3',
      'Memberi instruksi perubahan laporan',
      'Menjebak Jeki sebagai pelaku'
    ],
    requiredEvidence: [
      'doc_anggaran_manipulasi',
      'chat_instruksi_hendra',
      'chat_jeki_dipaksa'
    ],
    dialogue: {
      first_meet: [
        'Silakan periksa semuanya, Raka.',
        'Saya ingin kasus ini jelas.'
      ],
      under_pressure: [
        'Itu hanya penyesuaian administrasi.',
        'Jangan salah membaca konteks.'
      ],
      final: [
        'Kalian terlalu percaya kertas.',
        'Perusahaan ini butuh keputusan cepat.'
      ]
    }
  },
  {
    id: 'jeki',
    name: 'Jeki Saputra',
    title: 'Kepala Bagian Keuangan',
    appearance: 'defensif dan mudah marah',
    actualRole: 'innocent',
    crimes: [
      'Menandatangani laporan korup',
      'Memakai stempel direktur tanpa wewenang',
      'Menyembunyikan perubahan anggaran'
    ],
    requiredEvidence: [
      'stempel_jeki_palsu',
      'chat_jeki_dipaksa'
    ],
    dialogue: {
      first_meet: [
        'Saya tidak mau disudutkan.',
        'Tanya saja atasan saya.'
      ],
      under_pressure: [
        'Saya memang tanda tangan.',
        'Tapi saya tidak tahu isinya.'
      ],
      final: [
        'Saya kasar, bukan koruptor.',
        'Nama saya harus dibersihkan.'
      ]
    }
  },
  {
    id: 'sinta',
    name: 'Sinta Marlina',
    title: 'Sekretaris Eksekutif',
    appearance: 'pendiam dan tidak mencolok',
    actualRole: 'koruptor',
    crimes: [
      'Membuat kontrak vendor fiktif',
      'Menerima transfer dana ilegal',
      'Menyamarkan instruksi Hendra'
    ],
    requiredEvidence: [
      'kontrak_vendor_fiktif',
      'rekening_sinta',
      'chat_instruksi_hendra'
    ],
    dialogue: {
      first_meet: [
        'Saya hanya mengurus jadwal.',
        'Dokumen itu bukan keputusan saya.'
      ],
      under_pressure: [
        'Rekening itu salah paham.',
        'Saya hanya mengikuti arahan.'
      ],
      final: [
        'Saya tidak bekerja sendirian.',
        'Hendra yang mengatur semuanya.'
      ]
    }
  }
];

const documents = [
  {
    id: 'doc_anggaran_q3',
    title: 'Laporan Anggaran Q3',
    content: 'Laporan menyebut realisasi Q3 sebesar Rp 8,4 miliar. Lampiran audit internal mencatat Rp 6,1 miliar. Tanggal pengesahan tertulis 31 September 2026.',
    isManipulated: true,
    linkedSuspect: 'hendra',
    evidenceId: 'doc_anggaran_manipulasi',
    hint: 'Perhatikan tanggal pengesahan laporan.'
  },
  {
    id: 'doc_kontrak_vendor',
    title: 'Kontrak Vendor Pengadaan',
    content: 'Kontrak mencatat PT Surya Abadi Energi sebagai vendor cadangan. Nomor registrasinya tidak muncul di daftar pengadaan. Persetujuan akhir memakai paraf Sinta.',
    isManipulated: true,
    linkedSuspect: 'sinta',
    evidenceId: 'kontrak_vendor_fiktif',
    hint: 'Perhatikan nama vendor di baris kedua.'
  },
  {
    id: 'doc_laporan_jeki',
    title: 'Memo Keuangan Jeki',
    content: 'Memo Jeki meminta verifikasi ulang sebelum laporan ditandatangani. Nomor dokumen cocok dengan arsip resmi. Catatan waktunya konsisten dengan log kantor.',
    isManipulated: false,
    linkedSuspect: 'jeki',
    evidenceId: null,
    hint: 'Catatan waktunya justru konsisten.'
  }
];

const stamps = [
  {
    id: 'stamp_direktur_asli',
    owner: 'Hendra Kusuma',
    isAuthentic: true,
    visualHint: 'Nomor registrasi DK-019 terlihat lengkap.',
    linkedSuspect: 'hendra',
    evidenceId: null,
    revealsTwist: false
  },
  {
    id: 'stamp_keuangan_asli',
    owner: 'Jeki Saputra',
    isAuthentic: true,
    visualHint: 'Tertulis Kepala Keuangan, bukan Direktur.',
    linkedSuspect: 'jeki',
    evidenceId: null,
    revealsTwist: false
  },
  {
    id: 'stamp_jeki_palsu',
    owner: 'Jeki Saputra',
    isAuthentic: false,
    visualHint: 'Nomor registrasi hilang dan font miring.',
    linkedSuspect: 'jeki',
    evidenceId: 'stempel_jeki_palsu',
    revealsTwist: true
  },
  {
    id: 'stamp_sekretaris_asli',
    owner: 'Sinta Marlina',
    isAuthentic: true,
    visualHint: 'Lingkar luar rapi dan cap terbaca.',
    linkedSuspect: 'sinta',
    evidenceId: null,
    revealsTwist: false
  }
];

const chatGame = {
  chatLog: [
    {
      sender: 'Hendra Kusuma',
      message: 'Sinta, pastikan angkanya sudah disesuaikan ya.',
      timestamp: '2026-09-28 20:14'
    },
    {
      sender: 'Sinta Marlina',
      message: 'Sudah beres, Pak. Vendor cadangan juga aman.',
      timestamp: '2026-09-28 20:18'
    },
    {
      sender: 'Hendra Kusuma',
      message: 'Bagus. Transfer operasional jangan lewat rekening utama.',
      timestamp: '2026-09-28 20:21'
    },
    {
      sender: 'Sinta Marlina',
      message: 'Saya pakai rekening pribadi seperti arahan.',
      timestamp: '2026-09-28 20:25'
    },
    {
      sender: 'Hendra Kusuma',
      message: 'Jeki, kamu yang tanda tangan laporan ini.',
      timestamp: '2026-09-29 08:05'
    },
    {
      sender: 'Jeki Saputra',
      message: 'Saya belum melihat lampiran lengkapnya, Pak.',
      timestamp: '2026-09-29 08:07'
    },
    {
      sender: 'Hendra Kusuma',
      message: 'Tanda tangan saja. Ini perintah direktur.',
      timestamp: '2026-09-29 08:09'
    }
  ],
  questions: [
    {
      question: 'Siapa yang memberi instruksi mengubah angka?',
      options: ['Hendra Kusuma', 'Jeki Saputra', 'Sinta Marlina'],
      correctAnswer: 'Hendra Kusuma',
      evidenceId: 'chat_instruksi_hendra',
      feedbackRight: 'Instruksi manipulasi datang dari Hendra.',
      feedbackWrong: 'Perhatikan pesan pertama dari Hendra.'
    },
    {
      question: 'Siapa yang dipaksa tanda tangan?',
      options: ['Jeki Saputra', 'Sinta Marlina', 'Hendra Kusuma'],
      correctAnswer: 'Jeki Saputra',
      evidenceId: 'chat_jeki_dipaksa',
      feedbackRight: 'Jeki ditekan untuk menandatangani laporan.',
      feedbackWrong: 'Baca pesan Hendra kepada Jeki.'
    },
    {
      question: 'Rekening siapa menerima aliran mencurigakan?',
      options: ['Sinta Marlina', 'Jeki Saputra', 'Hendra Kusuma'],
      correctAnswer: 'Sinta Marlina',
      evidenceId: 'rekening_sinta',
      feedbackRight: 'Sinta memakai rekening pribadinya.',
      feedbackWrong: 'Cari pesan tentang rekening pribadi.'
    }
  ],
  revealsMoment: 'jeki_framed'
};

const twistSystem = {
  twistTriggers: ['stempel_jeki_palsu', 'chat_jeki_dipaksa'],
  twistDialogue: [
    ['Bella', [
      'Raka, tunggu.',
      'Stempel palsu, Jeki dipaksa.',
      'Dia tidak tahu apa-apa.'
    ]],
    ['Raka', [
      'Lalu siapa yang menjebaknya?'
    ]],
    ['Bella', [
      'Hendra menjebaknya.',
      'Jeki cuma tameng.'
    ]]
  ],
  twistAffectsEnding: true
};

const prologueLines = [
  'Raka baru bergabung dengan lembaga investigasi.',
  'Adrian memberi tugas pertamanya: PT. Nusantara Energi.',
  'Tiga nama muncul di meja kasus.',
  'Satu terlihat bersalah. Dua bersembunyi rapi.'
];

const prologueBackgrounds = [
  'bg-office',
  'bg-corridor',
  'bg-library',
  'bg-court'
];

const phaseIntro = {
  1: [
    ['Adrian', [
      'Raka, ini tugas pertamamu.',
      'Selidiki PT. Nusantara Energi.'
    ]],
    ['Bella', [
      'Ada tiga nama utama.',
      'Jangan nilai dari sikap saja.'
    ]]
  ],
  3: [
    ['Raka', [
      'Jeki terlihat paling mencurigakan.'
    ]],
    ['Bella', [
      'Sikap bukan bukti.',
      'Cocokkan semuanya lagi.'
    ]]
  ],
  4: [
    ['Adrian', [
      'Laporkan hanya yang terbukti.',
      'Sidang ini menentukan semuanya.'
    ]]
  ]
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
  Adrian: {
    idle: 'assets/characters/clean/adrian_idle.png',
    talk: 'assets/characters/clean/adrian_talk.png'
  },
  'Dr. Adrian': {
    idle: 'assets/characters/clean/adrian_idle.png',
    talk: 'assets/characters/clean/adrian_talk.png'
  }
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
  settingPanel: document.getElementById('settings-panel'),
  volumeToggle: document.getElementById('volume-toggle'),
  textSpeed: document.getElementById('text-speed'),
  settingClose: document.getElementById('setting-close'),
  eitssssLayer: document.getElementById('eitssss-layer'),
  pauseButton: document.getElementById('pause-button'),
  pausePanel: document.getElementById('pause-panel'),
  pauseResume: document.getElementById('pause-resume'),
  pauseExit: document.getElementById('pause-exit'),
  toast: document.getElementById('toast')
};

function init() {
  const btnStart = document.getElementById('btn-start');
  const btnLoad = document.getElementById('btn-load');
  const btnExit = document.getElementById('btn-exit');

  if (btnStart) btnStart.addEventListener('click', startGame);
  if (btnLoad) btnLoad.addEventListener('click', loadGame);
  if (btnExit) btnExit.addEventListener('click', () => {
    if (confirm('Keluar dari permainan?')) {
      showToast('Game ditutup.');
      window.close();
    }
  });

  const legacySetting = document.querySelector('[data-action="setting"]');
  if (legacySetting) legacySetting.addEventListener('click', openSetting);

  if (el.volumeToggle) el.volumeToggle.addEventListener('click', () => {
    volumeOn = !volumeOn;
    el.volumeToggle.textContent = volumeOn ? 'ON' : 'OFF';
  });
  if (el.textSpeed) el.textSpeed.addEventListener('change', (event) => {
    textSpeed = event.target.value;
  });
  if (el.settingClose) el.settingClose.addEventListener('click', closeSetting);
  if (el.pauseButton) el.pauseButton.addEventListener('click', openPauseMenu);
  if (el.pauseResume) el.pauseResume.addEventListener('click', resumeGame);
  if (el.pauseExit) el.pauseExit.addEventListener('click', () => returnToMainMenu('Game ditutup.'));

  updateHud();
}

function startGame() {
  flowToken += 1;
  resetPauseState();
  integrity = 100;
  suspicion = 0;
  evidence = [];
  currentPhase = 1;
  investigationStep = 0;
  twistUnlocked = false;
  reportedSuspects = [];
  saveGame();
  hideMainMenu();
  setBackground('bg-office');
  playAutoPrologue(prologueLines, prologueBackgrounds, () => startPhase(1));
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) {
    showToast('Belum ada data tersimpan.');
    return;
  }

  try {
    const data = JSON.parse(raw);
    flowToken += 1;
    resetPauseState();
    integrity = data.integrity ?? 100;
    suspicion = data.suspicion ?? 0;
    evidence = Array.isArray(data.evidence) ? data.evidence : [];
    currentPhase = data.currentPhase ?? 1;
    investigationStep = data.investigationStep ?? 0;
    twistUnlocked = Boolean(data.twistUnlocked);
    reportedSuspects = Array.isArray(data.reportedSuspects) ? data.reportedSuspects : [];
    hideMainMenu();
    showPhaseHub();
  } catch (error) {
    showToast('Data save rusak.');
  }
}

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify({
    integrity,
    suspicion,
    evidence,
    currentPhase,
    investigationStep,
    twistUnlocked,
    reportedSuspects
  }));
}

function hideMainMenu() {
  el.mainMenu.classList.add('hidden');
  el.content.classList.remove('hidden');
  el.status.classList.remove('hidden');
  el.inventory.classList.remove('hidden');
  if (el.pauseButton) el.pauseButton.classList.remove('hidden');
  updateHud();
}

function resetPauseState() {
  isPaused = false;
  pauseCallbacks = [];
  el.pausePanel.classList.add('hidden');
  if (el.pauseButton) el.pauseButton.classList.add('hidden');
}

function openPauseMenu() {
  if (!el.mainMenu.classList.contains('hidden')) return;
  isPaused = true;
  el.pausePanel.classList.remove('hidden');
  if (el.pauseButton) el.pauseButton.classList.add('hidden');
}

function resumeGame() {
  isPaused = false;
  el.pausePanel.classList.add('hidden');
  if (el.mainMenu.classList.contains('hidden') && el.pauseButton) {
    el.pauseButton.classList.remove('hidden');
  }

  const callbacks = pauseCallbacks.splice(0);
  callbacks.forEach((callback) => callback());
}

function returnToMainMenu(message) {
  flowToken += 1;
  saveGame();
  resetPauseState();
  setContent('');
  hideCharacterStage();
  el.dialogueBox.classList.add('hidden');
  el.content.classList.add('hidden');
  el.status.classList.add('hidden');
  el.inventory.classList.add('hidden');
  el.mainMenu.classList.remove('hidden');
  setBackground('bg-office');
  if (message) showToast(message);
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
    const data = evidenceDatabase[id];
    const item = document.createElement('div');
    item.className = `slot ${data ? '' : 'empty'}`;
    item.textContent = data ? data.name : 'Kosong';
    if (data) item.title = `${data.desc}\nHint: ${data.hint}`;
    el.inventorySlots.appendChild(item);
  }
}

function addEvidence(id) {
  if (!id || evidence.includes(id) || !evidenceDatabase[id]) return false;
  evidence.push(id);
  updateHud();
  saveGame();
  showToast(`Bukti didapat: ${evidenceDatabase[id].name}`);
  return true;
}

function evidenceCount() {
  return evidence.filter((id) => evidenceDatabase[id]).length;
}

function hasEvidence(id) {
  return evidence.includes(id);
}

function applyWrongAnswer() {
  integrity = Math.max(0, integrity - 10);
  suspicion = Math.min(100, suspicion + 12);
  updateHud();
  saveGame();
}

function applyCorrectAnswer() {
  suspicion = Math.min(100, suspicion + 3);
  updateHud();
  saveGame();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
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
      if (isPaused) return;
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

function playAutoPrologue(lines, backgrounds, onComplete) {
  let index = 0;
  let charIndex = 0;
  let typing = false;
  let timer = null;
  const token = flowToken;

  hideCharacterStage();
  el.dialogueBox.classList.add('hidden');
  el.status.classList.add('hidden');
  el.inventory.classList.add('hidden');

  setContent(`
    <section class="prologue-cinematic cursor-pointer" id="prologue-container">
      <div class="shade"></div>
      <p id="auto-prologue-text" class="prologue-line show"></p>
      <div class="absolute bottom-12 text-stone-500 animate-pulse text-[10px] tracking-[0.3em] uppercase z-10">
        Klik untuk Lanjut
      </div>
    </section>
  `);

  const container = document.getElementById('prologue-container');
  const textElement = document.getElementById('auto-prologue-text');

  const finishLine = () => {
    window.clearInterval(timer);
    textElement.textContent = lines[index];
    textElement.classList.remove('typing');
    typing = false;
  };

  const typeLine = () => {
    if (token !== flowToken) return;
    const bgIndex = Math.min(index, backgrounds.length - 1);
    setBackground(backgrounds[bgIndex]);
    charIndex = 0;
    typing = true;
    textElement.textContent = '';
    textElement.classList.add('typing');
    window.clearInterval(timer);
    timer = window.setInterval(() => {
      if (isPaused) return;
      charIndex += 1;
      textElement.textContent = lines[index].slice(0, charIndex);
      if (charIndex >= lines[index].length) finishLine();
    }, speedMap[textSpeed] || 25);
  };

  const next = () => {
    if (token !== flowToken) return;
    if (typing) {
      finishLine();
      return;
    }

    index += 1;
    if (index >= lines.length) {
      window.clearInterval(timer);
      setContent('');
      el.status.classList.remove('hidden');
      el.inventory.classList.remove('hidden');
      onComplete?.();
      return;
    }
    typeLine();
  };

  container.addEventListener('click', next);
  typeLine();
}

function startPhase(phase) {
  currentPhase = phase;
  saveGame();
  const intro = phaseIntro[phase];
  if (intro) {
    const bg = phase === 4 ? 'bg-court' : phase === 3 ? 'bg-library' : 'bg-office';
    setBackground(bg);
    playDialogue(intro, showPhaseHub);
    return;
  }
  showPhaseHub();
}

function showPhaseHub() {
  updateHud();
  hideCharacterStage();

  if (currentPhase === 1) {
    showOrientation();
    return;
  }
  if (currentPhase === 2) {
    showInvestigationHub();
    return;
  }
  if (currentPhase === 3) {
    showAnalysis();
    return;
  }
  showTrial();
}

function showOrientation() {
  setBackground('bg-office');
  const suspectCards = suspects.map((suspect) => `
    <article style="padding:16px;border:1px solid rgba(250,204,21,.25);background:rgba(15,23,42,.72);">
      <h3 style="margin:0 0 6px;color:#facc15;">${escapeHtml(suspect.name)}</h3>
      <p style="margin:0 0 8px;"><b>${escapeHtml(suspect.title)}</b></p>
      <p style="margin:0 0 12px;">Kesan awal: ${escapeHtml(suspect.appearance)}</p>
      <p style="margin:0;color:#cbd5e1;">Tuduhan: ${escapeHtml(suspect.crimes.join(', '))}</p>
    </article>
  `).join('');

  setContent(`
    <section class="center-panel" style="max-height:72vh;overflow:auto;">
      <h2>FASE 1: ORIENTASI</h2>
      <p>Adrian menyerahkan daftar terdakwa. Bella mengingatkan Raka agar tidak menilai dari sikap luar.</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin:20px 0;">
        ${suspectCards}
      </div>
      <div class="button-row">
        <button class="gold-button" id="start-investigation">Mulai Investigasi</button>
      </div>
    </section>
  `);

  document.getElementById('start-investigation').addEventListener('click', () => {
    currentPhase = 2;
    investigationStep = 0;
    saveGame();
    showInvestigationHub();
  });
}

function showInvestigationHub() {
  setBackground('bg-corridor');
  const steps = [
    'Verifikasi Dokumen',
    'Verifikasi Stempel',
    'Analisis Percakapan'
  ];
  const cards = steps.map((title, index) => {
    const status = index < investigationStep ? 'Selesai' : index === investigationStep ? 'Aktif' : 'Terkunci';
    const locked = index > investigationStep;
    return `
      <button class="case-card ${locked ? 'locked' : ''}" data-step="${index}" ${locked ? 'disabled' : ''}>
        <b>${escapeHtml(title)}</b>
        <span>${status}</span>
      </button>
    `;
  }).join('');

  setContent(`
    <section class="center-panel">
      <h2>FASE 2: INVESTIGASI</h2>
      <p>Jalankan mini-game satu per satu. Jeki memang defensif, tetapi bukti harus bicara lebih keras.</p>
      <div class="case-grid">${cards}</div>
    </section>
  `);

  document.querySelectorAll('[data-step]').forEach((button) => {
    button.addEventListener('click', () => {
      const step = Number(button.dataset.step);
      if (step === 0) runDocumentGame(0);
      if (step === 1) runStampGame(0);
      if (step === 2) runChatGame(0);
    });
  });
}

function runDocumentGame(index) {
  setBackground('bg-library');
  if (index >= documents.length) {
    investigationStep = Math.max(investigationStep, 1);
    saveGame();
    showDialogue('Bella', ['Dokumen selesai diperiksa.', 'Jangan buru-buru menuduh Jeki.'], showInvestigationHub);
    return;
  }

  const doc = documents[index];
  setContent(`
    <section class="center-panel" style="max-height:72vh;overflow:auto;">
      <h2>VERIFIKASI DOKUMEN</h2>
      <p>Dokumen ${index + 1} dari ${documents.length}</p>
      <article style="margin:18px 0;padding:18px;background:#fff7ed;color:#111827;border:2px solid #b45309;">
        <h3 style="margin:0 0 10px;">${escapeHtml(doc.title)}</h3>
        <p style="line-height:1.6;">${escapeHtml(doc.content)}</p>
        <small>Hint: ${escapeHtml(doc.hint)}</small>
      </article>
      <p>Apakah dokumen ini dimanipulasi?</p>
      <div class="button-row">
        <button class="fake-button" data-manipulated="true">MANIPULASI</button>
        <button class="valid-button" data-manipulated="false">VALID</button>
      </div>
    </section>
  `);

  document.querySelectorAll('[data-manipulated]').forEach((button) => {
    button.addEventListener('click', () => {
      const choseManipulated = button.dataset.manipulated === 'true';
      const correct = choseManipulated === doc.isManipulated;
      if (correct) {
        applyCorrectAnswer();
        addEvidence(doc.evidenceId);
        const line = doc.evidenceId
          ? 'Detail janggal berhasil dibuktikan.'
          : 'Dokumen Jeki justru bersih.';
        showDialogue('Sistem', [line], () => runDocumentGame(index + 1));
        return;
      }
      applyWrongAnswer();
      showDialogue('Sistem', ['Analisis dokumen keliru.', 'Periksa detail kecilnya lagi.'], () => runDocumentGame(index + 1));
    });
  });
}

function runStampGame(index) {
  setBackground('bg-office');
  if (index >= stamps.length) {
    investigationStep = Math.max(investigationStep, 2);
    saveGame();
    showDialogue('Bella', ['Stempel selesai diperiksa.', 'Satu cap terasa terlalu rapi.'], showInvestigationHub);
    return;
  }

  const stamp = stamps[index];
  setContent(`
    <section class="center-panel">
      <h2>VERIFIKASI STEMPEL</h2>
      <p>Stempel ${index + 1} dari ${stamps.length}</p>
      <article style="margin:18px 0;padding:22px;border:2px dashed rgba(250,204,21,.55);background:rgba(15,23,42,.8);">
        <h3 style="margin:0 0 10px;color:#facc15;">${escapeHtml(stamp.owner)}</h3>
        <p>${escapeHtml(stamp.visualHint)}</p>
      </article>
      <p>Apakah stempel ini asli?</p>
      <div class="button-row">
        <button class="valid-button" data-authentic="true">ASLI</button>
        <button class="fake-button" data-authentic="false">PALSU</button>
      </div>
    </section>
  `);

  document.querySelectorAll('[data-authentic]').forEach((button) => {
    button.addEventListener('click', () => {
      const choseAuthentic = button.dataset.authentic === 'true';
      const correct = choseAuthentic === stamp.isAuthentic;
      if (correct) {
        applyCorrectAnswer();
        addEvidence(stamp.evidenceId);
        checkTwist(() => runStampGame(index + 1));
        return;
      }
      applyWrongAnswer();
      showDialogue('Sistem', ['Pembacaan stempel keliru.'], () => runStampGame(index + 1));
    });
  });
}

function runChatGame(questionIndex) {
  setBackground('bg-server');
  if (questionIndex >= chatGame.questions.length) {
    investigationStep = Math.max(investigationStep, 3);
    currentPhase = 3;
    saveGame();
    checkTwist(() => startPhase(3));
    return;
  }

  const question = chatGame.questions[questionIndex];
  const logHtml = chatGame.chatLog.map((entry) => `
    <div style="padding:10px 12px;margin:0 0 8px;background:rgba(15,23,42,.78);border-left:3px solid #facc15;">
      <b>${escapeHtml(entry.sender)}</b>
      <small style="float:right;color:#94a3b8;">${escapeHtml(entry.timestamp)}</small>
      <p style="margin:8px 0 0;">${escapeHtml(entry.message)}</p>
    </div>
  `).join('');

  const options = question.options.map((option) => `
    <button class="evidence-button" data-answer="${escapeHtml(option)}">${escapeHtml(option)}</button>
  `).join('');

  setContent(`
    <section class="center-panel" style="max-height:72vh;overflow:auto;">
      <h2>ANALISIS PERCAKAPAN</h2>
      <div style="margin:16px 0;">${logHtml}</div>
      <p><b>${escapeHtml(question.question)}</b></p>
      <div style="display:grid;gap:12px;">${options}</div>
    </section>
  `);

  document.querySelectorAll('[data-answer]').forEach((button) => {
    button.addEventListener('click', () => {
      const selected = button.dataset.answer;
      if (selected === question.correctAnswer) {
        applyCorrectAnswer();
        addEvidence(question.evidenceId);
        showDialogue('Sistem', [question.feedbackRight], () => {
          checkTwist(() => runChatGame(questionIndex + 1));
        });
        return;
      }
      applyWrongAnswer();
      showDialogue('Sistem', [question.feedbackWrong], () => runChatGame(questionIndex + 1));
    });
  });
}

function checkTwist(onComplete) {
  const shouldUnlock = twistSystem.twistTriggers.every((id) => hasEvidence(id));
  if (!twistUnlocked && shouldUnlock) {
    twistUnlocked = true;
    saveGame();
    playDialogue(twistSystem.twistDialogue, onComplete);
    return;
  }
  onComplete?.();
}

function showAnalysis() {
  setBackground('bg-library');
  const evidenceCards = Object.values(evidenceDatabase).map((item) => {
    const owned = hasEvidence(item.id);
    return `
      <article style="padding:14px;border:1px solid ${owned ? 'rgba(34,197,94,.6)' : 'rgba(248,113,113,.45)'};background:rgba(15,23,42,.72);">
        <h3 style="margin:0 0 8px;color:${owned ? '#bbf7d0' : '#fecaca'};">${owned ? 'OK' : 'NO'} ${escapeHtml(item.name)}</h3>
        <p style="margin:0 0 8px;">${escapeHtml(item.desc)}</p>
        <small>${escapeHtml(item.hint)}</small>
      </article>
    `;
  }).join('');

  const suspectRows = suspects.map((suspect) => {
    const matched = suspect.requiredEvidence.filter((id) => hasEvidence(id)).length;
    const total = suspect.requiredEvidence.length;
    const roleText = suspect.id === 'jeki' && twistUnlocked
      ? 'Terindikasi korban jebakan'
      : `${matched}/${total} bukti cocok`;
    return `
      <article style="padding:16px;border:1px solid rgba(250,204,21,.25);background:rgba(3,7,18,.58);">
        <h3 style="margin:0 0 8px;color:#facc15;">${escapeHtml(suspect.name)}</h3>
        <p style="margin:0 0 8px;">${escapeHtml(roleText)}</p>
        <p style="margin:0;color:#cbd5e1;">${escapeHtml(suspect.crimes.join(', '))}</p>
      </article>
    `;
  }).join('');

  setContent(`
    <section class="center-panel" style="max-height:72vh;overflow:auto;">
      <h2>FASE 3: ANALISIS</h2>
      <p>Bukti terkumpul: ${evidenceCount()}/6. Twist Jeki: ${twistUnlocked ? 'Terbuka' : 'Belum terbuka'}.</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin:18px 0;">
        ${suspectRows}
      </div>
      <h3 style="color:#facc15;">Checklist Bukti</h3>
      <div style="display:grid;gap:10px;margin:14px 0;">${evidenceCards}</div>
      <div class="button-row">
        <button class="gold-button" id="go-trial">Lanjut Sidang</button>
      </div>
    </section>
  `);

  document.getElementById('go-trial').addEventListener('click', () => {
    currentPhase = 4;
    saveGame();
    startPhase(4);
  });
}

function showTrial() {
  setBackground('bg-court');
  const suspectButtons = suspects.map((suspect) => {
    const checked = reportedSuspects.includes(suspect.id) ? 'checked' : '';
    return `
      <label style="display:block;margin:0 0 12px;padding:14px;border:1px solid rgba(250,204,21,.28);background:rgba(15,23,42,.72);">
        <input type="checkbox" data-report="${suspect.id}" ${checked} style="margin-right:10px;">
        <b>${escapeHtml(suspect.name)}</b> - ${escapeHtml(suspect.title)}
        <span style="display:block;margin-top:6px;color:#cbd5e1;">${escapeHtml(suspect.appearance)}</span>
      </label>
    `;
  }).join('');

  setContent(`
    <section class="center-panel" style="max-height:72vh;overflow:auto;">
      <h2>FASE 4: SIDANG</h2>
      <p>Pilih siapa yang dilaporkan. Pilihan ini menentukan ending.</p>
      <p>Bukti: ${evidenceCount()}/6. Twist Jeki: ${twistUnlocked ? 'Terbuka' : 'Belum terbuka'}.</p>
      <div style="margin:18px 0;">${suspectButtons}</div>
      <div class="button-row">
        <button class="danger-button" id="submit-report">Laporkan Pilihan</button>
      </div>
    </section>
  `);

  document.querySelectorAll('[data-report]').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const id = checkbox.dataset.report;
      if (checkbox.checked && !reportedSuspects.includes(id)) reportedSuspects.push(id);
      if (!checkbox.checked) reportedSuspects = reportedSuspects.filter((item) => item !== id);
      saveGame();
    });
  });

  document.getElementById('submit-report').addEventListener('click', () => {
    if (reportedSuspects.length === 0) {
      showToast('Pilih minimal satu terdakwa.');
      return;
    }
    playFinalSuspectDialogues(() => showEnding());
  });
}

function playFinalSuspectDialogues(onComplete) {
  const queue = suspects
    .filter((suspect) => reportedSuspects.includes(suspect.id))
    .map((suspect) => [suspect.name.split(' ')[0], suspect.dialogue.final]);

  if (queue.length === 0) {
    onComplete?.();
    return;
  }
  playDialogue(queue, onComplete);
}

function reportedOnly(ids) {
  return reportedSuspects.length === ids.length
    && ids.every((id) => reportedSuspects.includes(id));
}

function resolveEnding() {
  if (reportedSuspects.includes('jeki')) {
    return {
      id: 'bad_ending_salah_sasaran',
      title: 'BAD ENDING A: SALAH SASARAN',
      color: '#ef4444',
      lines: [
        'Jeki dihukum.',
        'Hendra dan Sinta bebas.',
        'Adrian kecewa pada Raka.',
        'Bella berkata:',
        'Ada yang salah, Raka.',
        'Kita salah orang.'
      ]
    };
  }

  if (reportedOnly(['hendra', 'sinta']) && evidenceCount() < 3) {
    return {
      id: 'bad_ending_bukti_lemah',
      title: 'BAD ENDING B: TIDAK CUKUP BUKTI',
      color: '#ef4444',
      lines: [
        'Kasus ditolak karena bukti lemah.',
        'Semua terdakwa bebas.',
        'Adrian berkata:',
        'Investigasi tanpa bukti bukan investigasi.',
        'Itu tuduhan.'
      ]
    };
  }

  if (reportedOnly(['hendra', 'sinta']) && twistUnlocked && evidenceCount() >= 5) {
    return {
      id: 'true_ending',
      title: 'TRUE ENDING',
      color: '#22c55e',
      lines: [
        'Hendra dan Sinta ditangkap.',
        'Nama Jeki dipulihkan.',
        'Adrian memuji kerja Raka.',
        'Bella berkata:',
        'Kamu sudah jadi detektif sungguhan.'
      ]
    };
  }

  if (reportedOnly(['hendra', 'sinta']) && (!twistUnlocked || evidenceCount() >= 3)) {
    return {
      id: 'neutral_ending',
      title: 'NEUTRAL ENDING',
      color: '#facc15',
      lines: [
        'Hendra dan Sinta ditangkap.',
        'Kasus Jeki masih menggantung.',
        'Bella berkata:',
        'Ada yang terlewat.'
      ]
    };
  }

  return {
    id: 'bad_ending_bukti_lemah',
    title: 'BAD ENDING B: TIDAK CUKUP BUKTI',
    color: '#ef4444',
    lines: [
      'Laporan Raka tidak utuh.',
      'Sidang menolak kesimpulannya.',
      'Semua terdakwa bebas.',
      'Bukti tidak cukup kuat.'
    ]
  };
}

function showEnding() {
  const ending = resolveEnding();
  setBackground(ending.id.includes('bad') ? 'bg-corridor' : 'bg-court');
  hideCharacterStage();
  setContent(`
    <section class="center-panel" style="max-height:72vh;overflow:auto;">
      <h2 style="color:${ending.color};">${escapeHtml(ending.title)}</h2>
      ${ending.lines.map((line) => `<p>${escapeHtml(line)}</p>`).join('')}
      <p style="margin-top:18px;color:#cbd5e1;">Bukti terkumpul: ${evidenceCount()}/6</p>
      <div class="button-row">
        <button class="gold-button" id="ending-menu">Kembali ke Main Menu</button>
      </div>
    </section>
  `);

  saveGame();
  document.getElementById('ending-menu').addEventListener('click', () => {
    returnToMainMenu();
  });
}

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

init();
