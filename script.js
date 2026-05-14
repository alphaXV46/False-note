let GameState = {
    currentScene: "Briefing", 
    inventory: [],            
    checklist: {
        mg1_complete: false,
        mg2_complete: false,
        mg3_complete: false
    },
    isUIOpen: false,
    integrity: 5,
    trialSelection: []
};

// ===============================
// FALSE NOTE - Lore Baru
// Flow: Orientasi -> Investigasi -> Analisis -> Sidang
// ===============================

// Variabel legacy yang masih dibutuhkan atau bisa disinkronisasi
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
  slow: 65,
  normal: 35,
  fast: 15
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
    image: 'assets/images/suspect_hendra.png',
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
    image: 'assets/images/suspect_jeki.png',
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
    image: 'assets/images/suspect_sinta.png',
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

const documentPool = [
  {
    id: 'doc_anggaran_q3',
    title: 'Laporan Anggaran Q3',
    content: 'PT. NUSANTARA ENERGI - LAPORAN KEUANGAN Q3<br><br>Pemasukan Bersih: Rp 2.500.000.000<br>Pengeluaran Operasional: Rp 1.800.000.000<br>Dana Cadangan: Rp 700.000.000<br><br>Catatan Pengalihan Dana:<br>Berdasarkan instruksi manajerial, terdapat pengalihan dana darurat sebesar 15% dari total Dana Cadangan untuk pembayaran Vendor X.<br><br>Perhitungan:<br>Total Selisih = Dana Cadangan x 15%<br>Total Selisih = 700.000.000 x 15% = 105.000.000<br>(Namun dalam tabel hanya tercatat Rp 10.500.000 — SELISIH 10X LIPAT)',
    isManipulated: true,
    linkedSuspect: 'hendra',
    evidenceId: 'doc_anggaran_manipulasi',
    hint: 'Perhatikan perhitungan pengalihan dana.'
  },
  {
    id: 'redherring_it',
    title: 'Laporan Audit Keamanan IT',
    content: 'LOG SERVER PT. NUSANTARA ENERGI<br><br>18:00 - Backup harian selesai.<br>19:45 - Login gagal dari IP 192.168.1.15<br>21:00 - Update patch keamanan OS berjalan lancar.<br>23:15 - Port scan dari eksternal diblokir oleh firewall.<br><br><span style="color:red; font-weight:bold;">02:00 - Unauthorized Access Detected pada port 22 (SSH).</span><br>02:05 - IP Address penyerang otomatis diblokir.<br>08:00 - Sistem kembali normal tanpa kebocoran data.',
    isManipulated: false,
    linkedSuspect: 'none',
    evidenceId: null,
    hint: 'Hanya log rutin, peretasan ini sudah diblokir.'
  },
  {
    id: 'redherring_contract',
    title: 'Adendum Kontrak Karyawan - Jeki',
    content: 'ADENDUM KONTRAK KERJA KARYAWAN<br><br>Pihak Pertama: PT. Nusantara Energi<br>Pihak Kedua: Jeki Saputra (Kepala Keuangan)<br><br>Pasal 3: Kebijakan Lembur<br>Segala bentuk lembur di atas jam 20:00 wajib disetujui secara tertulis oleh Direktur.<br><br>Pasal 4.2:<br>Perusahaan berhak memotong tunjangan jika target Q3 tidak tercapai.<br><br>Ditandatangani oleh kedua belah pihak secara sah di atas materai.',
    isManipulated: false,
    linkedSuspect: 'jeki',
    evidenceId: null,
    hint: 'Kontrak ini sah, bukan bukti penggelapan dana.'
  }
];

function shuffleDocuments(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

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
    ['Bella', [
      'Hai, Raka. Kenalkan, namaku Bella. Aku asisten investigasi yang akan menemanimu di lapangan.',
      'Dr. Adrian baru saja selesai melakukan interogasi awal terhadap ketiga tersangka utama dari PT. Nusantara Energi.',
      'Tugasmu di sini adalah menyusun kembali kepingan misteri ini dan menemukan kebenaran yang terkubur.'
    ]],
    ['Raka', [
      'Senang bertemu denganmu, Bella. Aku sudah mendengar selintas tentang kasus ini. Jadi, Adrian sudah mendapatkan keterangan awal?'
    ]],
    ['Bella', [
      'Benar. Dia sedang menunggumu untuk secara resmi menyerahkan kendali investigasi ini.'
    ]],
    ['Adrian', [
      'Bella, pastikan Raka mendapatkan akses penuh ke semua log interogasi. Kasus Nusantara Energi ini sangat sensitif.'
    ]],
    ['Bella', [
      'Siap, Dok. Semuanya sudah saya siapkan untuk dipelajari Raka.'
    ]],
    ['Adrian', [
      'Raka... Mungkin bagi agensi ini, kamu adalah wajah baru. Tapi kita sudah saling mengenal cukup lama.',
      'Aku tidak akan menyerahkan kasus sebesar ini kepada sembarang orang jika aku tidak percaya pada kemampuanmu.'
    ], 'Raka'],
    ['Raka', [
      'Terima kasih atas kepercayaannya, Dok. Saya akan memastikan kasus ini selesai dengan tuntas.'
    ]],
    ['Adrian', [
      'Buktikan dengan hasil. Sekarang, biarkan Bella membimbingmu ke papan terdakwa untuk melihat siapa saja yang masuk dalam daftar kita.'
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
    idle: 'assets/characters/raka_idle.png',
    talk: 'assets/characters/raka_talk.png'
  },
  Bella: {
    idle: 'assets/characters/bella_idle.png',
    talk: 'assets/characters/bella_talk.png'
  },
  Jeki: {
    idle: 'assets/characters/jeki_idle.png',
    talk: 'assets/characters/jeki_talk.png'
  },
  Adrian: {
    idle: 'assets/characters/adrian_idle.png',
    talk: 'assets/characters/adrian_talk.png'
  },
  'Dr. Adrian': {
    idle: 'assets/characters/adrian_idle.png',
    talk: 'assets/characters/adrian_talk.png'
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

  // Reset GameState fully
  GameState.inventory = [];
  GameState.checklist = { mg1_complete: false, mg2_complete: false, mg3_complete: false };
  GameState.isUIOpen = false;
  GameState.integrity = 5;
  GameState.trialSelection = [];
  GameState.currentScene = 'Briefing';
  window.mg1State = { index: 0, searchActive: false, isDragging: false, startY: 0 };
  window.mg2State = { zoomActive: false };
  window.mg3State = { qIndex: 0 };
  window.trialState = { suspectId: null, lineIndex: 0, lines: [], speaker: '' };
  saveGame();

  // Transisi Layar Hitam
  const transition = document.createElement('div');
  transition.className = 'fixed inset-0 bg-black z-[9999]';
  transition.style.opacity = '0';
  transition.style.transition = 'opacity 1s ease-in-out';
  document.body.appendChild(transition);

  // Fade In ke Hitam
  setTimeout(() => {
    transition.style.opacity = '1';
  }, 50);

  // Tunggu 2 detik, lalu masuk ke Intro
  setTimeout(() => {
    hideMainMenu();
    playIntroSequence();
    
    // Fade Out dari Hitam
    transition.style.opacity = '0';
    setTimeout(() => transition.remove(), 1000);
  }, 2000);
}

function playIntroSequence() {
  GameState.isUIOpen = false;
  const introLines = [
    "Kasus ini bukan yang pertama... Tapi mungkin... yang paling rumit.",
    "Tiga nama. Satu institusi. Dan seseorang di antaranya... tidak bersalah."
  ];

  setBackground('bg-intro');
  setContent(`
    <div class="fixed inset-0 z-[150] cursor-pointer" id="intro-container">
      <div class="intro-text-layer" id="intro-layer" style="pointer-events: none;"></div>
      <div class="fade-overlay" id="intro-fade"></div>
      <div id="click-prompt" class="absolute bottom-10 left-0 right-0 text-center animate-pulse text-stone-500 text-xs tracking-[0.4em] uppercase z-20">
        Klik untuk Lanjut
      </div>
    </div>
  `);

  const container = document.getElementById('intro-container');
  const layer = document.getElementById('intro-layer');
  const fade = document.getElementById('intro-fade');
  const prompt = document.getElementById('click-prompt');
  
  let currentBlock = 0;
  let isTyping = false;
  let typeTimer = null;

  function typeText(text) {
    layer.innerHTML = '';
    const p = document.createElement('p');
    p.className = 'intro-typewriter';
    layer.appendChild(p);
    
    let charIndex = 0;
    isTyping = true;
    p.textContent = '';
    
    clearInterval(typeTimer);
    typeTimer = setInterval(() => {
      if (isPaused) return;
      p.textContent += text[charIndex];
      charIndex++;
      if (charIndex >= text.length) {
        clearInterval(typeTimer);
        isTyping = false;
      }
    }, speedMap[textSpeed] || 55);
  }

  function finishIntro() {
    container.onclick = null;
    prompt.classList.add('hidden');
    
    fade.classList.add('show');
    setTimeout(() => {
      showTitleCard(() => startPhase(1));
    }, 2000);
  }

  function handleNext() {
    if (isTyping) {
      clearInterval(typeTimer);
      layer.querySelector('p').textContent = introLines[currentBlock];
      isTyping = false;
      return;
    }

    currentBlock++;
    if (currentBlock < introLines.length) {
      typeText(introLines[currentBlock]);
    } else {
      finishIntro();
    }
  }

  container.onclick = handleNext;
  typeText(introLines[0]);
}

function showTitleCard(onComplete) {
  setContent(`
    <div class="fixed inset-0 bg-black flex flex-col items-center justify-center z-[500] cursor-pointer" id="title-card-container">
      <div class="text-center">
        <h1 class="font-serif text-8xl font-bold tracking-tighter text-white mb-2">
            FALSE <span class="text-red-600 animate-pulse">NOTE</span>
        </h1>
        <div class="h-1 w-32 bg-yellow-500 mx-auto"></div>
        <p class="mt-4 font-mono text-sm tracking-[0.3em] text-slate-400 uppercase">
            The Silent Witness
        </p>
        <p class="mt-12 text-stone-600 text-[10px] tracking-[0.5em] animate-pulse uppercase">
            Klik untuk Mulai
        </p>
      </div>
    </div>
  `);
  
  const container = document.getElementById('title-card-container');
  container.onclick = () => {
    container.onclick = null;
    onComplete();
  };
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
    GameState.inventory = evidence.slice(); // Sync GameState with loaded evidence
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
  // Ensure evidence array stays in sync with GameState.inventory
  evidence = GameState.inventory.slice();
  localStorage.setItem(SAVE_KEY, JSON.stringify({
    integrity,
    suspicion,
    evidence: GameState.inventory,
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
  if (typeof GameState !== 'undefined' && GameState.isUIOpen) return;
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
  el.dialogueBox.onclick = null;
  el.content.classList.add('hidden');
  el.status.classList.add('hidden');
  el.inventory.classList.add('hidden');
  el.mainMenu.classList.remove('hidden');
  setBackground('bg-office');
  GameState.isUIOpen = false;

  // Cleanup orphaned DOM elements from minigames/trial
  ['mg1-audit-container', 'mg2-zoom-container', 'mg2-audit-container', 'trial-inventory-container', 'btn-eitsss-action'].forEach(id => {
    const node = document.getElementById(id);
    if (node) node.remove();
  });
  window.clearInterval(window.trialTypeTimer);
  window.clearInterval(window._bellaTypeTimer);

  if (message) showToast(message);
}

function openSetting() {
  el.settingPanel.classList.remove('hidden');
}

function closeSetting() {
  el.settingPanel.classList.add('hidden');
}

function setBackground(className) {
  el.screen.className = `screen ${className} animate-scene-enter`;
  
  // Force reflow to restart animation on scene change
  el.screen.style.animation = 'none';
  void el.screen.offsetHeight;
  el.screen.style.animation = null;
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
  const latestEvidence = GameState.inventory.slice(-3);
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
  if (!id || GameState.inventory.includes(id) || !evidenceDatabase[id]) return false;
  GameState.inventory.push(id);
  evidence = GameState.inventory; // Sync legacy variable
  updateHud();
  saveGame();
  showToast(`Bukti didapat: ${evidenceDatabase[id].name}`);
  return true;
}

function evidenceCount() {
  return GameState.inventory.filter((id) => evidenceDatabase[id]).length;
}

function hasEvidence(id) {
  return GameState.inventory.includes(id);
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

function setActiveCharacter(speaker, partner) {
  const stageImages = Array.from(el.characterStage.querySelectorAll('.character-sprite'));
  const currentSpeakerOnStage = stageImages.find(img => img.dataset.speaker === speaker);

  const performSwap = (speakerName, side, isActive = true) => {
    const existing = stageImages.find(img => img.classList.contains(side));
    if (existing && existing.dataset.speaker === speakerName) {
      // Sudah ada, tinggal update status
      const assets = characterAssets[speakerName];
      existing.src = isActive ? assets.talk : assets.idle;
      existing.classList.toggle('active', isActive);
      existing.classList.toggle('inactive', !isActive);
      return;
    }

    if (existing) {
      existing.classList.add(`sprite-slide-out-${side}`);
      setTimeout(() => {
        existing.remove();
        addNewSprite(speakerName, side, isActive);
      }, 400);
    } else {
      addNewSprite(speakerName, side, isActive);
    }
  };

  const addNewSprite = (speakerName, side, isActive) => {
    const assets = characterAssets[speakerName];
    if (!assets) return;
    const newImage = document.createElement('img');
    newImage.src = isActive ? assets.talk : assets.idle;
    newImage.alt = speakerName;
    newImage.dataset.speaker = speakerName;
    newImage.className = `character-sprite ${side} ${isActive ? 'active' : 'inactive'} sprite-slide-in-${side}`;
    el.characterStage.appendChild(newImage);
  };

  // Jika ada partner yang ditentukan, pastikan dia ada di panggung (biasanya di sisi berlawanan)
  if (partner && characterAssets[partner]) {
    // Tentukan sisi: Speaker biasanya kiri jika Raka, atau kanan jika orang lain.
    // Kita buat konsisten: Speaker di sisi yang dia sudah ada, atau default.
    const speakerSide = currentSpeakerOnStage ? (currentSpeakerOnStage.classList.contains('left') ? 'left' : 'right') : (speaker === 'Raka' ? 'left' : 'right');
    const partnerSide = speakerSide === 'left' ? 'right' : 'left';

    performSwap(speaker, speakerSide, true);
    performSwap(partner, partnerSide, false);
  } else {
    // Logika standar jika tidak ada partner spesifik
    if (currentSpeakerOnStage) {
      stageImages.forEach((image) => {
        const isActive = image.dataset.speaker === speaker;
        const assets = characterAssets[image.dataset.speaker];
        image.src = isActive ? assets.talk : assets.idle;
        image.classList.toggle('active', isActive);
        image.classList.toggle('inactive', !isActive);
        image.classList.remove('sprite-slide-in-left', 'sprite-slide-in-right');
      });
    } else if (characterAssets[speaker]) {
      const imageToReplace = stageImages.find(img => img.classList.contains('inactive')) || stageImages[1] || stageImages[0];
      if (!imageToReplace) {
        addNewSprite(speaker, speaker === 'Raka' ? 'left' : 'right', true);
      } else {
        const side = imageToReplace.classList.contains('left') ? 'left' : 'right';
        performSwap(speaker, side, true);
      }
    }
  }
}

function hideCharacterStage() {
  el.characterStage.classList.add('hidden');
  el.characterStage.innerHTML = '';
}

function showDialogue(speaker, textArray, onComplete, partner) {
  let lineIndex = 0;
  let charIndex = 0;
  let currentLine = textArray[0] || '';
  let typeTimer = null;
  let typing = false;

  el.dialogueBox.classList.remove('hidden');
  el.speaker.textContent = speaker;
  setActiveCharacter(speaker, partner);

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
      el.dialogueBox.onclick = null;
      onComplete?.();
      return;
    }
    typeLine();
  };

  el.dialogueBox.onclick = next;
  typeLine();
}

function playDialogue(queue, onComplete, keepOpen = false) {
  let index = 0;
  prepareCharacterStage(queue);
  const playNext = () => {
    if (index >= queue.length) {
      if (!keepOpen) {
        hideCharacterStage();
        el.dialogueBox.classList.add('hidden');
      }
      onComplete?.();
      return;
    }
    const [speaker, lines, partner] = queue[index];
    index += 1;
    showDialogue(speaker, lines, playNext, partner);
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
    }, speedMap[textSpeed] || 35);
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
  
  // Clear any active content layer UI (like title cards)
  setContent('');
  
  // Clean up any overlays
  const fade = document.getElementById('intro-fade');
  if (fade) fade.classList.remove('show');

  const intro = phaseIntro[phase];
  if (intro) {
    const bg = phase === 4 ? 'bg-court' : phase === 3 ? 'bg-library' : 'bg-briefing';
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
  setBackground('bg-briefing');
  
  const suspectHtml = suspects.map(s => `
    <div class="suspect-frame" onclick="showSuspectProfile('${s.id}')">
      <img src="${s.image}" alt="${s.name}">
      <div class="label">${s.name}</div>
    </div>
  `).join('');

  setContent(`
    <section class="center-panel" style="background: transparent; border: none; width: 100%; height: 80vh; display: flex; flex-direction: column; justify-content: space-between;">
      <h2 style="text-align: center; background: rgba(0,0,0,0.7); padding: 10px; align-self: center;">PT. NUSANTARA ENERGI - DAFTAR TERDAKWA</h2>
      
      <div class="suspect-board">
        ${suspectHtml}
      </div>

      <div class="button-row" style="margin-top: 40px;">
        <button class="gold-button" id="start-investigation">Mulai Investigasi</button>
      </div>
    </section>
  `);

  window.showSuspectProfile = (id) => {
    const s = suspects.find(x => x.id === id);
    const overlay = document.createElement('div');
    overlay.className = 'profile-overlay';
    overlay.id = 'profile-overlay';
    overlay.innerHTML = `
      <div class="profile-card">
        <img src="${s.image}" alt="${s.name}">
        <div class="profile-info">
          <h2>${s.name}</h2>
          <p><strong>Jabatan:</strong> ${s.title}</p>
          <p><strong>Tuduhan:</strong> ${s.crimes.join(', ')}</p>
          <button class="gold-button" onclick="document.getElementById('profile-overlay').remove()">Tutup</button>
        </div>
      </div>
    `;
    overlay.onclick = (e) => { if(e.target === overlay) overlay.remove(); };
    document.body.appendChild(overlay);
  };

  document.getElementById('start-investigation').addEventListener('click', () => {
    const runOrientationFlow = () => {
      const steps = [
        {
          image: null,
          dialogue: [
            ['Bella', ['Sudah melihat profil mereka, Raka? Biar kujelaskan lebih detail tentang siapa mereka sebenarnya.']]
          ]
        },
        {
          image: 'hendra',
          dialogue: [
            ['Raka', ['Silakan. Mulai dari sang Direktur, Hendra Kusuma.']],
            ['Bella', [
              'Hendra adalah wajah dari PT. Nusantara Energi. Berwibawa dan sangat kooperatif.',
              'Tapi dalam pengalamanku, orang yang terlihat terlalu sempurna biasanya adalah yang paling lihai menyembunyikan retakan. Tuduhannya: manipulasi anggaran utama.'
            ]]
          ]
        },
        {
          image: 'jeki',
          dialogue: [
            ['Raka', ['Lalu bagaimana dengan Jeki? Dia terlihat... sulit diajak bicara.']],
            ['Bella', [
              'Jeki Saputra, Kepala Keuangan. Orangnya kasar dan meledak-ledak, sangat defensif sejak hari pertama investigasi.',
              'Tapi ingat, Raka... Gong yang pecah biasanya bersuara paling nyaring. Belum tentu dia adalah otaknya, meski dia yang dituduh memalsukan tanda tangan.'
            ]]
          ]
        },
        {
          image: 'sinta',
          dialogue: [
            ['Raka', ['Dan Sekretaris itu? Sinta?']],
            ['Bella', [
              'Sinta Marlina. Dia adalah bayangan di kantor ini. Sangat rajin, hampir tidak pernah bersuara.',
              'Namun, air yang tenang seringkali menghanyutkan. Dia dituduh mengelola aliran dana ke vendor fiktif.'
            ]]
          ]
        },
        {
          image: null,
          dialogue: [
            ['Raka', ['Tiga orang dengan kepribadian yang bertolak belakang. Kita punya banyak hal untuk diverifikasi.']],
            ['Bella', ['Tepat. Tugas kita adalah mencari bukti di balik kesan-kesan samar ini. Siap memulai?']]
          ]
        }
      ];

      let currentStep = 0;

      const nextStep = () => {
        if (currentStep >= steps.length) {
          currentPhase = 2;
          investigationStep = 0;
          saveGame();
          showInvestigationHub();
          return;
        }

        const step = steps[currentStep];
        currentStep++;

        if (step.image) {
          const s = suspects.find(x => x.id === step.image);
          setContent(`
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-[1] animate-fade-in">
              <img src="${s.image}" class="h-[50vh] max-h-[420px] object-contain" style="filter: drop-shadow(0 0 30px rgba(0,0,0,0.7));">
            </div>
          `);
        } else {
          setContent('');
        }

        const isLastStep = currentStep === steps.length;
        playDialogue(step.dialogue, nextStep, !isLastStep);
      };

      nextStep();
    };

    runOrientationFlow();
  });
}

function showInvestigationHub() {
  GameState.isUIOpen = false;
  setBackground('bg-director-room');
  el.dialogueBox.classList.add('hidden');
  el.dialogueBox.onclick = null;

  // Hotspot definitions — coordinates are % based for responsiveness
  // Adjusted to approximate desk objects in Ruangan direktur.png:
  //   Documents: paper stack on desk (left-center)
  //   Stamp:     drawer/desk surface near lamp (right-center)
  //   Laptop:    laptop at center of desk
  const hotspots = [
    { id: 'DOCUMENTS', label: 'Tumpukan Dokumen', top: '52%', left: '15%', width: '18%', height: '20%', step: 0 },
    { id: 'STAMP',     label: 'Laci Meja',        top: '55%', left: '62%', width: '16%', height: '18%', step: 1 },
    { id: 'LAPTOP',    label: 'Laptop',            top: '42%', left: '38%', width: '22%', height: '22%', step: 2 }
  ];

  const bellaWarnings = {
    'STAMP_EARLY': 'Jangan terbalik. Lihat dulu laporannya, baru kita cek stempelnya. Kita perlu tahu apa yang sedang dipalsukan di sini.',
    'LAPTOP_EARLY': 'Sabar, Raka. Kita tidak bisa menganalisis percakapan kalau kita belum tahu dokumen mana yang sedang mereka bahas. Periksa tumpukan kertas itu dulu.',
    'LAPTOP_NEED_STAMP': 'Kita sudah tahu dokumennya, tapi belum verifikasi stempelnya. Cek laci meja itu dulu.'
  };

  const hotspotHTML = hotspots.map(h => {
    let stateClass = '';
    if (h.step < investigationStep) {
      stateClass = 'done';
    } else if (h.step === investigationStep) {
      stateClass = 'active';
    } else {
      stateClass = 'locked';
    }
    return `
      <div class="room-hotspot ${stateClass}" 
           data-hotspot="${h.id}"
           style="top: ${h.top}; left: ${h.left}; width: ${h.width}; height: ${h.height};">
        <span class="room-hotspot-label">${h.label}</span>
      </div>
    `;
  }).join('');

  setContent(`
    <div class="room-hotspot-layer" id="investigation-room-layer">
      ${hotspotHTML}
    </div>
  `);
  el.content.classList.remove('hidden');

  // Bind click handlers
  document.querySelectorAll('[data-hotspot]').forEach(spot => {
    spot.addEventListener('click', () => {
      if (GameState.isUIOpen) return; // Block during MG
      const id = spot.dataset.hotspot;
      onRoomObjectClicked(id);
    });
  });
}

function onRoomObjectClicked(objectID) {
  const bellaWarnings = {
    'STAMP_EARLY': 'Jangan terbalik. Lihat dulu laporannya, baru kita cek stempelnya. Kita perlu tahu apa yang sedang dipalsukan di sini.',
    'LAPTOP_EARLY': 'Sabar, Raka. Kita tidak bisa menganalisis percakapan kalau kita belum tahu dokumen mana yang sedang mereka bahas. Periksa tumpukan kertas itu dulu.',
    'LAPTOP_NEED_STAMP': 'Kita sudah tahu dokumennya, tapi belum verifikasi stempelnya. Cek laci meja itu dulu.'
  };

  if (objectID === 'DOCUMENTS') {
    if (investigationStep >= 1) {
      showToast('Dokumen sudah diperiksa.');
      return;
    }
    showBellaInstruction('Kita harus tahu apa yang dia laporkan secara resmi sebelum memeriksa alat otentikasinya.', () => {
      runDocumentGame();
    });
  }
  else if (objectID === 'STAMP') {
    if (investigationStep >= 2) {
      showToast('Stempel sudah diverifikasi.');
      return;
    }
    if (investigationStep < 1) {
      showBellaInstruction(bellaWarnings['STAMP_EARLY']);
      return;
    }
    showBellaInstruction('Sekarang kita cari alat yang dipakai untuk melegalkan dokumen-dokumen tadi.', () => {
      runStampGame();
    });
  }
  else if (objectID === 'LAPTOP') {
    if (investigationStep >= 3) {
      showToast('Percakapan sudah dianalisis.');
      return;
    }
    if (investigationStep < 1) {
      showBellaInstruction(bellaWarnings['LAPTOP_EARLY']);
      return;
    }
    if (investigationStep < 2) {
      showBellaInstruction(bellaWarnings['LAPTOP_NEED_STAMP']);
      return;
    }
    showBellaInstruction('Bukti fisik sudah ada, sekarang kita cari bukti digital untuk mengunci alibinya.', () => {
      runChatGame();
    });
  }
}

function showBellaInstruction(text, onDismiss) {
  // Prepare stage with Bella
  el.characterStage.innerHTML = '';
  const bellaImg = document.createElement('img');
  bellaImg.src = characterAssets['Bella'].talk;
  bellaImg.alt = 'Bella';
  bellaImg.dataset.speaker = 'Bella';
  bellaImg.className = 'character-sprite right active sprite-slide-in-right';
  el.characterStage.appendChild(bellaImg);
  el.characterStage.classList.remove('hidden');

  el.dialogueBox.classList.remove('hidden');
  el.speaker.textContent = 'Bella';

  let charIdx = 0;
  let typing = true;
  el.dialogueText.textContent = '';
  el.dialogueText.classList.add('typing');

  const finishLine = () => {
    window.clearInterval(window._bellaTypeTimer);
    el.dialogueText.textContent = text;
    el.dialogueText.classList.remove('typing');
    typing = false;
  };

  window.clearInterval(window._bellaTypeTimer);
  window._bellaTypeTimer = window.setInterval(() => {
    if (isPaused) return;
    charIdx += 1;
    el.dialogueText.textContent = text.slice(0, charIdx);
    if (charIdx >= text.length) finishLine();
  }, speedMap[textSpeed]);

  el.dialogueBox.onclick = () => {
    if (typing) {
      finishLine();
      return;
    }
    el.dialogueBox.onclick = null;
    el.dialogueBox.classList.add('hidden');
    hideCharacterStage();
    if (onDismiss) onDismiss();
  };
}

window.mg1State = { index: 0, isDragging: false, startX: 0, startY: 0, hasHighlight: false, activeDocuments: [] };

function runDocumentGame() {
  window.mg1State.activeDocuments = shuffleDocuments([...documentPool]);

  if (GameState.isUIOpen) return;
  GameState.isUIOpen = true;
  GameState.currentScene = "MG1";
  // Reset state on each entry
  window.mg1State.index = 0;
  window.mg1State.isDragging = false;
  window.mg1State.hasHighlight = false;
  setBackground('bg-library');

  const renderDoc = () => {
    const doc = window.mg1State.activeDocuments[window.mg1State.index];
    const isDocQ3 = doc.id === 'doc_anggaran_q3';
    
    // Highlight Overlay and Verify Button
    let highlightHTML = '';
    let verifyBtn = '';
    
    // Adjusted highlight position down to match the new text
    if (isDocQ3 && window.mg1State.hasHighlight) {
      highlightHTML = `<div style="position: absolute; top: 290px; left: 40px; width: 500px; height: 50px; background: rgba(250, 204, 21, 0.4); z-index: 5; pointer-events: none;"></div>`;
      verifyBtn = `<button onclick="mg1ShowAudit()" style="position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%); padding: 12px 24px; background: #22c55e; color: white; font-weight: bold; font-size: 18px; border-radius: 8px; z-index: 200; box-shadow: 0 0 15px rgba(34, 197, 94, 0.6); cursor: pointer;">Verifikasi Temuan</button>`;
    }

    return `
      <div id="mg1-content" style="pointer-events: none; position: relative; z-index: 2;">
        <h2 style="font-family: inherit; border-bottom: 2px solid #ccc; padding-bottom: 10px;">${escapeHtml(doc.title)}</h2>
        <p style="font-family: inherit; font-size: 1.1rem; line-height: 1.6; margin-top: 20px;">${doc.content}</p>
      </div>
      ${highlightHTML}
      ${verifyBtn}
    `;
  };

  const html = `
    <div class="document-viewer-layer" id="mg1-layer">
      <button onclick="mg1ChangeDoc(-1)" style="z-index: 51; background: #222; color: white; padding: 10px 20px; font-size: 24px; border-radius: 50%; width: 60px; height: 60px; margin-right: 20px;">&lt;</button>
      
      <div class="mg-document-wrapper">
        <div id="mg1-doc-container" class="mg-document cursor-search" onmousedown="mg1MouseDown(event)" onmouseup="mg1MouseUp(event)" onmousemove="mg1MouseMove(event)" onmouseleave="mg1MouseLeave(event)">
          ${renderDoc()}
        </div>
      </div>

      <button onclick="mg1ChangeDoc(1)" style="z-index: 51; background: #222; color: white; padding: 10px 20px; font-size: 24px; border-radius: 50%; width: 60px; height: 60px; margin-left: 20px;">&gt;</button>
      
      <div style="position:absolute; bottom: 40px; display:flex; gap:20px; z-index: 51;">
         <button onclick="mg1Close()" style="padding:10px 20px; background: #ef4444; color: white; font-weight: bold; border-radius: 5px;">Tutup Dokumen</button>
      </div>
    </div>
  `;
  setContent(html);
  
  window.mg1ChangeDoc = (dir) => {
    window.mg1State.index += dir;
    if (window.mg1State.index < 0) window.mg1State.index = window.mg1State.activeDocuments.length - 1;
    if (window.mg1State.index >= window.mg1State.activeDocuments.length) window.mg1State.index = 0;
    window.mg1State.hasHighlight = false; // Reset highlight when changing docs
    document.getElementById('mg1-doc-container').innerHTML = renderDoc();
  };

  window.mg1MouseDown = (e) => {
    if (window.mg1State.hasHighlight) return;
    
    // Ignore clicks on buttons inside the document container
    if (e.target.tagName === 'BUTTON') return;

    window.mg1State.isDragging = true;
    const rect = e.currentTarget.getBoundingClientRect();
    window.mg1State.startX = e.clientX - rect.left + e.currentTarget.scrollLeft;
    window.mg1State.startY = e.clientY - rect.top + e.currentTarget.scrollTop;
    
    let dragBox = document.getElementById('mg1-drag-box');
    if (!dragBox) {
        dragBox = document.createElement('div');
        dragBox.id = 'mg1-drag-box';
        dragBox.style.cssText = 'position: absolute; background: rgba(250, 204, 21, 0.2); border: 1px dashed #facc15; pointer-events: none; z-index: 15;';
        e.currentTarget.appendChild(dragBox);
    }
    dragBox.style.left = window.mg1State.startX + 'px';
    dragBox.style.top = window.mg1State.startY + 'px';
    dragBox.style.width = '0px';
    dragBox.style.height = '0px';
    dragBox.style.display = 'block';
  };

  window.mg1MouseMove = (e) => {
    if (!window.mg1State.isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const currentX = e.clientX - rect.left + e.currentTarget.scrollLeft;
    const currentY = e.clientY - rect.top + e.currentTarget.scrollTop;
    
    const dragBox = document.getElementById('mg1-drag-box');
    if (dragBox) {
        dragBox.style.left = Math.min(window.mg1State.startX, currentX) + 'px';
        dragBox.style.top = Math.min(window.mg1State.startY, currentY) + 'px';
        dragBox.style.width = Math.abs(currentX - window.mg1State.startX) + 'px';
        dragBox.style.height = Math.abs(currentY - window.mg1State.startY) + 'px';
    }
  };

  const processMouseUp = (e) => {
    if (!window.mg1State.isDragging) return;
    window.mg1State.isDragging = false;
    
    const dragBox = document.getElementById('mg1-drag-box');
    if (dragBox) dragBox.style.display = 'none';

    if (window.mg1State.hasHighlight) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const endX = e.clientX - rect.left + e.currentTarget.scrollLeft;
    const endY = e.clientY - rect.top + e.currentTarget.scrollTop;
    
    const dragDist = Math.abs(endX - window.mg1State.startX) + Math.abs(endY - window.mg1State.startY);
    
    // Only process if it was an actual drag, not a simple click
    if (dragDist > 10) {
      const doc = window.mg1State.activeDocuments[window.mg1State.index];
      
      if (doc.id === 'doc_anggaran_q3') {
        const hTop = 270;
        const hLeft = 30;
        const hWidth = 540;
        const hHeight = 120;
        const hBottom = hTop + hHeight;
        const hRight = hLeft + hWidth;

        const dLeft = Math.min(window.mg1State.startX, endX);
        const dRight = Math.max(window.mg1State.startX, endX);
        const dTop = Math.min(window.mg1State.startY, endY);
        const dBottom = Math.max(window.mg1State.startY, endY);

        // Calculate intersection
        const intersectX = Math.max(0, Math.min(dRight, hRight) - Math.max(dLeft, hLeft));
        const intersectY = Math.max(0, Math.min(dBottom, hBottom) - Math.max(dTop, hTop));

        // If dragged area intersects hotspot sufficiently
        if (intersectX > 20 && intersectY > 10) {
            window.mg1State.hasHighlight = true;
            document.getElementById('mg1-doc-container').innerHTML = renderDoc();
            return;
        }
      }
      
      // If we reach here, drag was invalid
      showToast('Raka: Ini sepertinya informasi umum, tidak ada yang aneh.');
    }
  };

  window.mg1MouseUp = (e) => {
    processMouseUp(e);
  };

  window.mg1MouseLeave = (e) => {
    processMouseUp(e);
  };

  window.mg1Close = () => {
    GameState.isUIOpen = false;
    setContent('');
    showInvestigationHub();
  };

  window.mg1ShowAudit = () => {
    const auditHtml = `
      <div class="popup-layer" style="inset:0; display:flex; align-items:center; justify-content:center; background: rgba(0,0,0,0.6); z-index: 200;">
        <div class="popup-audit">
          <h3 style="color:#facc15; margin-bottom: 15px;">5-Question Audit</h3>
          <p id="mg1-q-text">Angka berapa yang tertera pada laporan Q3?</p>
          <div id="mg1-options" style="margin-top: 15px;"></div>
        </div>
      </div>
    `;
    const tempDiv = document.createElement('div');
    tempDiv.id = 'mg1-audit-container';
    tempDiv.innerHTML = auditHtml;
    document.body.appendChild(tempDiv);

    const questions = [
      { q: "Berapa total Dana Cadangan yang tertera?", options: ["Rp 700.000.000", "Rp 2.500.000.000", "Rp 1.800.000.000"], ans: "Rp 700.000.000" },
      { q: "Berapa persen pengalihan dana darurat?", options: ["15%", "10%", "20%"], ans: "15%" },
      { q: "Berapa seharusnya hasil perhitungan 15% dari Dana Cadangan?", options: ["Rp 105.000.000", "Rp 10.500.000", "Rp 70.000.000"], ans: "Rp 105.000.000" },
      { q: "Berapa angka yang sebenarnya tercatat di tabel?", options: ["Rp 10.500.000", "Rp 105.000.000", "Rp 1.500.000"], ans: "Rp 10.500.000" },
      { q: "Kesimpulan logis dari temuan ini?", options: ["Ada indikasi penggelapan 10x lipat", "Hanya salah ketik (typo) biasa", "Dana tersebut belum dicairkan"], ans: "Ada indikasi penggelapan 10x lipat" }
    ];

    let qIndex = 0;
    
    const renderQ = () => {
      if (qIndex >= questions.length) {
        document.getElementById('mg1-audit-container').remove();
        addEvidence('doc_anggaran_manipulasi');
        GameState.checklist.mg1_complete = true;
        investigationStep = Math.max(investigationStep, 1);
        saveGame();
        mg1Close();
        return;
      }
      const q = questions[qIndex];
      document.getElementById('mg1-q-text').textContent = q.q;
      const opts = document.getElementById('mg1-options');
      opts.innerHTML = '';
      q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'audit-option';
        btn.textContent = opt;
        btn.onclick = () => {
          if (opt === q.ans) {
            applyCorrectAnswer();
            qIndex++;
            renderQ();
          } else {
            applyWrongAnswer();
            showToast('Jawaban salah! Kembali ke dokumen.');
            document.getElementById('mg1-audit-container').remove();
            // Player stays on document, can try again
          }
        };
        opts.appendChild(btn);
      });
    };
    renderQ();
  };
}

window.mg2State = { zoomActive: false };

function runStampGame() {
  if (GameState.isUIOpen) return;
  GameState.isUIOpen = true;
  GameState.currentScene = "MG2";
  window.mg2State.zoomActive = false;
  setBackground('bg-office');

  const renderRack = () => {
    let html = `
      <div class="document-viewer-layer" id="mg2-layer">
        <div style="background: rgba(15,23,42,0.9); padding: 30px; border-radius: 10px; border: 2px solid #facc15; max-width: 800px; text-align: center;">
          <h2 style="color: #facc15; margin-bottom: 20px;">Rak Stempel Kantor</h2>
          <p style="color: white; margin-bottom: 20px;">Pilih stempel untuk diperiksa lebih dekat dengan kaca pembesar.</p>
          <div class="stamp-rack">
    `;
    stamps.forEach((stamp, idx) => {
      html += `<div class="stamp-item" onclick="mg2ZoomStamp(${idx})">${escapeHtml(stamp.owner)}</div>`;
    });
    html += `
          </div>
          <button onclick="mg2Close()" style="margin-top: 30px; padding:10px 20px; background: #ef4444; color: white; font-weight: bold; border-radius: 5px;">Tutup Rak</button>
        </div>
      </div>
    `;
    setContent(html);
  };

  renderRack();

  window.mg2ZoomStamp = (idx) => {
    const stamp = stamps[idx];
    const isFake = !stamp.isAuthentic;
    
    let html = `
      <div class="document-viewer-layer cursor-zoom" id="mg2-zoom-layer" onclick="mg2CheckStamp(${idx})" style="z-index: 60;">
        <div style="background: white; padding: 40px; border-radius: 10px; text-align: center; width: 400px; height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;">
          <h1 style="color: #b45309; font-size: 3rem; margin-bottom: 10px;">STEMPEL</h1>
          <h2 style="color: black; border-bottom: 2px dashed #000; padding-bottom: 10px;">${escapeHtml(stamp.owner)}</h2>
          <p style="color: black; margin-top: 20px; font-weight: bold;">${escapeHtml(stamp.visualHint)}</p>
          <div style="position: absolute; bottom: 20px; color: #888; font-size: 0.8rem;">Klik area stempel untuk verifikasi</div>
        </div>
        <button onclick="event.stopPropagation(); mg2BackToRack()" style="position: absolute; bottom: 40px; padding:10px 20px; background: #ef4444; color: white; font-weight: bold; border-radius: 5px; z-index: 61;">Kembali ke Rak</button>
      </div>
    `;
    
    const tempDiv = document.createElement('div');
    tempDiv.id = 'mg2-zoom-container';
    tempDiv.innerHTML = html;
    document.body.appendChild(tempDiv);
  };

  window.mg2BackToRack = () => {
    const zoom = document.getElementById('mg2-zoom-container');
    if (zoom) zoom.remove();
  };

  window.mg2CheckStamp = (idx) => {
    const stamp = stamps[idx];
    if (stamp.isAuthentic) {
      applyWrongAnswer();
      showToast('Stempel ini terlihat asli. Coba yang lain.');
      mg2BackToRack();
    } else {
      mg2ShowAudit(stamp);
    }
  };

  window.mg2Close = () => {
    GameState.isUIOpen = false;
    setContent('');
    showInvestigationHub();
  };

  window.mg2ShowAudit = (stamp) => {
    const auditHtml = `
      <div class="popup-layer" id="mg2-audit-container" style="inset:0; display:flex; align-items:center; justify-content:center; background: rgba(0,0,0,0.6); z-index: 200;">
        <div class="popup-audit">
          <h3 style="color:#facc15; margin-bottom: 15px;">5-Question Audit: Forensik</h3>
          <p id="mg2-q-text">Stempel siapa yang dipalsukan?</p>
          <div id="mg2-options" style="margin-top: 15px;"></div>
        </div>
      </div>
    `;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = auditHtml;
    document.body.appendChild(tempDiv.firstElementChild);

    const questions = [
      { q: "Stempel siapa yang dipalsukan?", options: ["Jeki", "Hendra", "Sinta"], ans: "Jeki" },
      { q: "Apa yang hilang dari stempel palsu ini?", options: ["Nomor registrasi", "Tinta", "Logo"], ans: "Nomor registrasi" },
      { q: "Bagaimana bentuk hurufnya?", options: ["Miring", "Tebal", "Kabur"], ans: "Miring" },
      { q: "Apakah stempel ini dibuat dengan izin?", options: ["Tidak", "Ya", "Mungkin"], ans: "Tidak" },
      { q: "Apa tujuannya?", options: ["Menjebak Jeki", "Bercanda", "Kesalahan cetak"], ans: "Menjebak Jeki" }
    ];

    let qIndex = 0;
    
    const renderQ = () => {
      if (qIndex >= questions.length) {
        document.getElementById('mg2-audit-container').remove();
        mg2BackToRack();
        addEvidence(stamp.evidenceId);
        GameState.checklist.mg2_complete = true;
        investigationStep = Math.max(investigationStep, 2);
        saveGame();
        mg2Close();
        checkTwist(() => showInvestigationHub());
        return;
      }
      const q = questions[qIndex];
      document.getElementById('mg2-q-text').textContent = q.q;
      const opts = document.getElementById('mg2-options');
      opts.innerHTML = '';
      q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'audit-option';
        btn.textContent = opt;
        btn.onclick = () => {
          if (opt === q.ans) {
            applyCorrectAnswer();
            qIndex++;
            renderQ();
          } else {
            applyWrongAnswer();
            showToast('Jawaban salah! Kembali ke rak stempel.');
            document.getElementById('mg2-audit-container').remove();
            mg2BackToRack();
            // Player can try another stamp or the same one again
          }
        };
        opts.appendChild(btn);
      });
    };
    renderQ();
  };
}

window.mg3State = { qIndex: 0 };

function runChatGame() {
  if (GameState.isUIOpen) return;
  GameState.isUIOpen = true;
  GameState.currentScene = "MG3";
  // Reset state on each entry
  window.mg3State.qIndex = 0;
  setBackground('bg-server');

  const renderChat = () => {
    let html = `
      <div class="document-viewer-layer" id="mg3-layer">
        <div style="display:flex; flex-direction:column; align-items:center;">
          <h2 style="color: #facc15; margin-bottom: 10px; background: rgba(0,0,0,0.8); padding: 10px;">Analisis Percakapan</h2>
          <p id="mg3-q-text" style="color: white; margin-bottom: 20px; background: rgba(0,0,0,0.8); padding: 10px; border: 1px solid #facc15; text-align: center; max-width: 400px;"></p>
          <div class="chat-container">
    `;
    chatGame.chatLog.forEach((entry, idx) => {
      html += `
        <div class="chat-msg" id="chat-msg-${idx}" onclick="mg3CheckAnswer(${idx})">
          <b style="color:#facc15;">${escapeHtml(entry.sender)}</b>
          <small style="float:right; color:#888;">${escapeHtml(entry.timestamp)}</small>
          <p style="margin-top: 5px;">${escapeHtml(entry.message)}</p>
        </div>
      `;
    });
    html += `
          </div>
          <button onclick="mg3Close()" style="margin-top: 20px; padding:10px 20px; background: #ef4444; color: white; font-weight: bold; border-radius: 5px;">Tutup Analisis</button>
        </div>
      </div>
    `;
    setContent(html);
    mg3ShowQuestion();
  };

  window.mg3ShowQuestion = () => {
    if (window.mg3State.qIndex >= chatGame.questions.length) {
      GameState.checklist.mg3_complete = true;
      investigationStep = Math.max(investigationStep, 3);
      currentPhase = 3;
      saveGame();
      GameState.isUIOpen = false;
      setContent('');
      checkTwist(() => startPhase(3));
      return;
    }
    const q = chatGame.questions[window.mg3State.qIndex];
    document.getElementById('mg3-q-text').textContent = "Pilih chat yang membuktikan: " + q.question;
  };

  window.mg3CheckAnswer = (msgIdx) => {
    const q = chatGame.questions[window.mg3State.qIndex];
    const msg = chatGame.chatLog[msgIdx];
    
    // We check if the clicked message sender matches the correct answer
    // For specific evidence, we can also check content keywords, but sender is enough based on legacy logic
    if (msg.sender === q.correctAnswer) {
      document.getElementById('chat-msg-' + msgIdx).classList.add('highlighted');
      applyCorrectAnswer();
      addEvidence(q.evidenceId);
      
      // Check Twist dependency immediately when evidence is found
      if (q.evidenceId === 'chat_jeki_dipaksa' && hasEvidence('stempel_jeki_palsu')) {
          checkTwist(() => {
              showToast(q.feedbackRight);
              window.mg3State.qIndex++;
              mg3ShowQuestion();
          });
      } else {
          showToast(q.feedbackRight);
          window.mg3State.qIndex++;
          mg3ShowQuestion();
      }
    } else {
      applyWrongAnswer();
      showToast(q.feedbackWrong);
    }
  };

  window.mg3Close = () => {
    GameState.isUIOpen = false;
    setContent('');
    showInvestigationHub();
  };

  renderChat();
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

window.trialState = {
  suspectId: null,
  lineIndex: 0,
  lines: [],
  speaker: ''
};

function playFinalSuspectDialogues(onComplete) {
  GameState.currentScene = "Trial";
  const selected = suspects.filter(s => reportedSuspects.includes(s.id));
  if (selected.length === 0) {
    onComplete?.();
    return;
  }
  
  let sIndex = 0;
  
  const nextSuspect = () => {
    if (sIndex >= selected.length) {
      onComplete?.();
      return;
    }
    const s = selected[sIndex];
    sIndex++;
    playTrialDialogue(s, nextSuspect);
  };
  
  nextSuspect();
}

function playTrialDialogue(suspect, onComplete) {
  window.trialState.suspectId = suspect.id;
  window.trialState.lines = suspect.dialogue.final;
  window.trialState.speaker = suspect.name.split(' ')[0];
  window.trialState.lineIndex = 0;
  
  prepareCharacterStage([[window.trialState.speaker]]);
  showTrialLine(onComplete);
}

function showTrialLine(onComplete) {
  if (window.trialState.lineIndex >= window.trialState.lines.length) {
    window.trialState.lineIndex = 0; 
  }
  
  let currentLine = window.trialState.lines[window.trialState.lineIndex];
  let speaker = window.trialState.speaker;
  
  el.dialogueBox.classList.remove('hidden');
  el.speaker.textContent = speaker;
  setActiveCharacter(speaker);
  
  let charIndex = 0;
  let typing = true;
  el.dialogueText.textContent = '';
  el.dialogueText.classList.add('typing');
  
  let btnEitsss = document.getElementById('btn-eitsss-action');
  if (!btnEitsss) {
    btnEitsss = document.createElement('button');
    btnEitsss.id = 'btn-eitsss-action';
    btnEitsss.innerHTML = '<img src="assets/ui/eitssss.png" style="height:40px; display:inline-block; vertical-align:middle;">';
    btnEitsss.style.cssText = 'position:absolute; top:-60px; right: 20px; background:transparent; border:none; display:none; z-index: 100; cursor:pointer; transform: scale(1.2); transition: transform 0.2s; filter: drop-shadow(0 0 10px rgba(255,0,0,0.8));';
    btnEitsss.onmouseenter = () => btnEitsss.style.transform = 'scale(1.4)';
    btnEitsss.onmouseleave = () => btnEitsss.style.transform = 'scale(1.2)';
    el.dialogueBox.appendChild(btnEitsss);
  }
  // Always update onclick with fresh onComplete reference to avoid stale closures
  btnEitsss.onclick = (e) => {
    e.stopPropagation();
    triggerTrialPresent(onComplete);
  };
  btnEitsss.style.display = 'none';

  const finishLine = () => {
    window.clearInterval(window.trialTypeTimer);
    el.dialogueText.textContent = currentLine;
    el.dialogueText.classList.remove('typing');
    typing = false;
    btnEitsss.style.display = 'block';
  };

  window.clearInterval(window.trialTypeTimer);
  window.trialTypeTimer = window.setInterval(() => {
    if (isPaused) return;
    charIndex += 1;
    el.dialogueText.textContent = currentLine.slice(0, charIndex);
    if (charIndex >= currentLine.length) finishLine();
  }, speedMap[textSpeed]);

  const next = () => {
    if (typing) {
      finishLine();
      return;
    }
    btnEitsss.style.display = 'none';
    window.trialState.lineIndex += 1;
    el.dialogueBox.onclick = null;
    showTrialLine(onComplete);
  };

  el.dialogueBox.onclick = next;
}

function triggerTrialPresent(onComplete) {
  const btnE = document.getElementById('btn-eitsss-action');
  if (btnE) btnE.style.display = 'none';
  el.dialogueBox.onclick = null; // Prevent clicking dialogue while presenting
  window.clearInterval(window.trialTypeTimer);
  playEitssssEffect(() => {
    GameState.trialSelection = [];
    renderTrialInventory(onComplete);
  });
}

function renderTrialInventory(onComplete) {
  GameState.isUIOpen = true;
  let html = `
    <div class="popup-layer" id="trial-inventory-layer" style="inset:0; display:flex; align-items:center; justify-content:center; background: rgba(0,0,0,0.8); z-index: 300;">
      <div style="background: rgba(15,23,42,0.95); padding: 30px; border-radius: 10px; border: 2px solid #facc15; width: 600px; max-height: 80vh; overflow-y: auto;">
        <h2 style="color: #facc15; margin-bottom: 20px;">Presentasikan Bukti</h2>
        ${window.trialState.suspectId === 'jeki' ? '<p style="color:white; margin-bottom: 10px; font-weight:bold;">(Pilih 2 bukti untuk Jeki)</p>' : ''}
        <div style="display:flex; flex-direction:column; gap:10px;">
  `;
  
  GameState.inventory.forEach(id => {
    const item = evidenceDatabase[id];
    if (!item) return;
    const isSelected = GameState.trialSelection.includes(id);
    html += `
      <div onclick="trialSelectEvidence('${id}')" style="padding:15px; background: ${isSelected ? 'rgba(250,204,21,0.3)' : 'rgba(255,255,255,0.1)'}; border: 1px solid ${isSelected ? '#facc15' : '#555'}; cursor:pointer; color:white;">
        <b>${escapeHtml(item.name)}</b><br>
        <small>${escapeHtml(item.desc)}</small>
      </div>
    `;
  });

  html += `
        </div>
        <div style="margin-top:20px; display:flex; justify-content:space-between;">
          <button onclick="trialCancelPresent()" style="padding:10px 20px; background: #ef4444; color:white; font-weight:bold; border-radius: 5px;">Batal</button>
          <button onclick="trialConfirmPresent()" style="padding:10px 20px; background: #22c55e; color:white; font-weight:bold; border-radius: 5px;">Presentasikan</button>
        </div>
      </div>
    </div>
  `;
  
  const existing = document.getElementById('trial-inventory-container');
  if (existing) existing.remove();
  const tempDiv = document.createElement('div');
  tempDiv.id = 'trial-inventory-container';
  tempDiv.innerHTML = html;
  document.body.appendChild(tempDiv);
  
  window.trialSelectEvidence = (id) => {
    const maxSelect = window.trialState.suspectId === 'jeki' ? 2 : 1;
    if (GameState.trialSelection.includes(id)) {
      GameState.trialSelection = GameState.trialSelection.filter(x => x !== id);
    } else {
      if (GameState.trialSelection.length < maxSelect) {
        GameState.trialSelection.push(id);
      } else {
        GameState.trialSelection[maxSelect - 1] = id;
      }
    }
    renderTrialInventory(onComplete);
  };
  
  window.trialCancelPresent = () => {
    GameState.isUIOpen = false;
    const inv = document.getElementById('trial-inventory-container');
    if (inv) inv.remove();
    const btnE = document.getElementById('btn-eitsss-action');
    if (btnE) btnE.style.display = 'block';
    // Resume showing trial line so player can interact again
    showTrialLine(onComplete);
  };
  
  window.trialConfirmPresent = () => {
    const req = suspects.find(s => s.id === window.trialState.suspectId).requiredEvidence;
    let isCorrect = false;
    if (window.trialState.suspectId === 'jeki') {
      if (GameState.trialSelection.includes('stempel_jeki_palsu') && GameState.trialSelection.includes('chat_jeki_dipaksa')) {
        isCorrect = true;
      }
    } else {
      isCorrect = GameState.trialSelection.some(id => req.includes(id));
    }
    
    const trialInv = document.getElementById('trial-inventory-container');
    if (trialInv) trialInv.remove();
    GameState.isUIOpen = false;
    
    if (isCorrect) {
      applyCorrectAnswer();
      showDialogue('Raka', ['Ini buktinya!', 'Tidak ada celah lagi bagi Anda.'], onComplete);
    } else {
      GameState.integrity = Math.max(0, GameState.integrity - 1);
      integrity = Math.max(0, integrity - 20);
      updateHud();
      
      if (integrity <= 0 || GameState.integrity <= 0) {
        showDialogue('Adrian', ['Cukup, Raka. Laporanmu terlalu banyak celah.'], () => {
           showEnding(); 
        });
      } else {
        showDialogue('Adrian', ['Bukti itu tidak relevan, Raka. Coba perhatikan lagi.'], () => {
          showTrialLine(onComplete);
        });
      }
    }
  };
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
  el.dialogueBox.classList.add('hidden');
  el.dialogueBox.onclick = null;
  window.clearInterval(window.trialTypeTimer);
  // Clean up EITSSS button
  const btnE = document.getElementById('btn-eitsss-action');
  if (btnE) btnE.remove();
  // Clean up trial inventory if still present
  const trialInv = document.getElementById('trial-inventory-container');
  if (trialInv) trialInv.remove();
  GameState.isUIOpen = false;

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
