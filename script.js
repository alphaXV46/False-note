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
    trialSelection: [],
    isBribed: false,
    isJekiSaved: false
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

const audioFiles = {
  menu: 'assets/audio/backsound_misterius.mp3',
  prologue: 'assets/audio/backsound_opening_game.mp3',
  scene1: 'assets/audio/bgm_scene.mpeg',
  scene2: 'assets/audio/bgm_scene_2.mp3',
  analysis: 'assets/audio/the_hidden_diamonds.mp3',
  click: 'assets/audio/click.mp3',
  paperBurn: 'assets/audio/transisi_kertas_kebakar.mp3',
  explosion: 'assets/audio/ledakan.mpeg'
};

const audioState = {
  music: {},
  sfx: {},
  currentMusic: null,
  masterVolume: 0.7,
  fadeTimers: new Map()
};

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
    hint: 'Bandingkan angka utama dengan lampiran pendukung.'
  },
  kontrak_vendor_fiktif: {
    id: 'kontrak_vendor_fiktif',
    name: 'Kontrak Vendor Fiktif',
    desc: 'Kontrak memakai vendor yang tidak terdaftar di basis data pengadaan.',
    linkedSuspect: 'sinta',
    hint: 'Periksa jejak vendor dan alur persetujuannya.'
  },
  stempel_jeki_palsu: {
    id: 'stempel_jeki_palsu',
    name: 'Stempel Jeki Palsu',
    desc: 'Stempel atas nama Jeki tidak cocok dengan blueprint resmi.',
    linkedSuspect: 'twist_jeki_framed',
    hint: 'Ada perbedaan kecil pada otentikasi dokumen.'
  },
  chat_instruksi_hendra: {
    id: 'chat_instruksi_hendra',
    name: 'Instruksi Hendra',
    desc: 'Pesan Hendra ke Sinta meminta angka laporan disesuaikan.',
    linkedSuspect: 'hendra',
    hint: 'Urutan pesan lebih penting daripada nada bicara.'
  },
  chat_jeki_dipaksa: {
    id: 'chat_jeki_dipaksa',
    name: 'Jeki Dipaksa Tanda Tangan',
    desc: 'Pesan Hendra menunjukkan Jeki dipaksa menandatangani laporan.',
    linkedSuspect: 'twist_jeki_framed',
    hint: 'Perhatikan siapa yang menekan dan siapa yang ragu.'
  },
  otoritas_sinta_janggal: {
    id: 'otoritas_sinta_janggal',
    name: 'Otoritas Sinta Janggal',
    desc: 'Stempel otorisasi finansial tingkat direksi berada dalam akses sekretaris.',
    linkedSuspect: 'sinta',
    hint: 'Fisiknya rapi, tetapi rantai wewenangnya tidak wajar.'
  }
};

const finalEvidenceIds = [
  'doc_anggaran_manipulasi',
  'kontrak_vendor_fiktif',
  'stempel_jeki_palsu',
  'chat_instruksi_hendra',
  'chat_jeki_dipaksa',
  'otoritas_sinta_janggal'
];

const analysisTargets = {
  hendra: ['doc_anggaran_manipulasi', 'chat_instruksi_hendra', 'chat_jeki_dipaksa'],
  sinta: ['kontrak_vendor_fiktif', 'stempel_jeki_palsu', 'otoritas_sinta_janggal']
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
      'Mengalihkan tanggung jawab dokumen'
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
      'stempel_jeki_palsu',
      'otoritas_sinta_janggal'
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
    label: 'Stempel Direksi',
    owner: 'Hendra Kusuma',
    isAuthentic: true,
    hierarchyIssue: false,
    visualHint: 'Nomor registrasi DK-019 terlihat lengkap.',
    linkedSuspect: 'hendra',
    evidenceId: null,
    revealsTwist: false
  },
  {
    id: 'stamp_keuangan_asli',
    label: 'Stempel Keuangan',
    owner: 'Jeki Saputra',
    isAuthentic: true,
    hierarchyIssue: false,
    visualHint: 'Tertulis Kepala Keuangan, bukan Direktur.',
    linkedSuspect: 'jeki',
    evidenceId: null,
    revealsTwist: false
  },
  {
    id: 'stamp_jeki_palsu',
    label: 'Stempel Jeki',
    owner: 'Jeki Saputra',
    isAuthentic: false,
    hierarchyIssue: false,
    visualHint: 'Nomor registrasi hilang dan font miring.',
    linkedSuspect: 'jeki',
    evidenceId: 'stempel_jeki_palsu',
    revealsTwist: true
  },
  {
    id: 'stamp_sekretaris_asli',
    label: 'Stempel Otorisasi',
    owner: 'Sinta Marlina',
    isAuthentic: true,
    hierarchyIssue: true,
    visualHint: 'Lingkar luar rapi dan cap terbaca. Secara fisik cocok dengan blueprint.',
    linkedSuspect: 'sinta',
    evidenceId: 'otoritas_sinta_janggal',
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
      message: 'Jeki, ini dokumen Q3. Segera otorisasi.',
      timestamp: '2026-09-29 15:04'
    },
    {
      sender: 'Jeki Saputra',
      message: 'Dokumennya ada 120 halaman, Pak. Saya butuh waktu untuk validasi angkanya.',
      timestamp: '2026-09-29 15:05'
    },
    {
      sender: 'Hendra Kusuma',
      message: 'Tidak perlu. Ini formalitas. Cepat stempel.',
      timestamp: '2026-09-29 15:06'
    },
    {
      sender: 'Jeki Saputra',
      message: 'Baik, sudah saya stempel.',
      timestamp: '2026-09-29 15:07'
    }
  ],
  questions: [
    {
      question: 'Siapa yang memberi instruksi mengubah angka?',
      options: ['Hendra Kusuma', 'Jeki Saputra', 'Sinta Marlina'],
      correctAnswer: 'Hendra Kusuma',
      correctIndex: 0,
      evidenceId: 'chat_instruksi_hendra',
      feedbackRight: 'Instruksi manipulasi datang dari Hendra.',
      feedbackWrong: 'Perhatikan pesan pertama dari Hendra.'
    },
    {
      question: 'Pesan mana yang membuat validasi 120 halaman menjadi tidak masuk akal?',
      options: ['Jeki Saputra', 'Sinta Marlina', 'Hendra Kusuma'],
      correctAnswer: 'Jeki Saputra',
      correctIndex: 5,
      evidenceId: 'chat_jeki_dipaksa',
      feedbackRight: 'Rentang waktunya terlalu pendek untuk validasi sungguhan.',
      feedbackWrong: 'Cari pesan yang menyebut jumlah halaman dan kebutuhan validasi.'
    },
  ],
  revealsMoment: 'jeki_framed'
};

const twistSystem = {
  twistTriggers: ['stempel_jeki_palsu', 'chat_jeki_dipaksa'],
  twistDialogue: [
    ['Bella', [
      'Raka, lihat timestamp percakapan ini.'
    ]],
    ['Raka', [
      'Jaraknya hanya dua menit dari dokumen diterima sampai disetujui.'
    ]],
    ['Bella', [
      'Bisakah seseorang membaca, menghitung, dan memvalidasi 120 halaman laporan keuangan dalam waktu dua menit?'
    ]],
    ['Raka', [
      'Itu mustahil. Dia bahkan tidak tahu apa isinya.'
    ]],
    ['Bella', [
      'Tepat. Dia hanya menjalankan perintah buta. Simpan log ini.'
    ]]
  ],
  twistAffectsEnding: true
};

const prologueSlides = [
  {
    text: 'Kasus ini bukan yang pertama... Tapi mungkin... yang paling rumit.',
    image: 'assets/backgrounds/adrian_silhouette.png',
    fit: 'contain'
  },
  {
    text: 'Tiga nama. Satu institusi. Dan seseorang di antaranya... tidak bersalah.',
    image: 'assets/backgrounds/adrian_silhouette.png',
    fit: 'contain'
  },
  {
    text: 'Raka, investigator baru yang baru saja masuk ke kasus pertamanya.',
    image: 'assets/images/prologue/raka_bella_intro.png'
  },
  {
    text: 'Bella, asisten investigasi yang akan membantunya membaca celah di balik setiap dokumen.',
    image: 'assets/images/prologue/raka_bella_intro.png'
  },
  {
    text: 'Dr. Adrian, mentor Raka, menyerahkan kasus PT. Nusantara Energi dengan satu peringatan: jangan percaya kesan pertama.',
    image: 'assets/images/prologue/dr_adrian_intro.png'
  },
  {
    text: 'Tiga nama muncul di meja kasus: Hendra, Jeki, dan Sinta.',
    image: 'assets/images/prologue/suspects_intro.png'
  },
  {
    text: 'Satu terlihat bersalah. Dua bersembunyi rapi.',
    image: 'assets/images/prologue/suspects_intro.png'
  }
];

const prologueBgClasses = ['bg-intro', 'bg-office', 'bg-corridor', 'bg-library', 'bg-court', 'bg-black'];

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
    idle: 'assets/characters/Jeki Saputra - Keungan/Idle.png',
    talk: 'assets/characters/Jeki Saputra - Keungan/Talk.png'
  },
  'Jeki Saputra': {
    idle: 'assets/characters/Jeki Saputra - Keungan/Idle.png',
    talk: 'assets/characters/Jeki Saputra - Keungan/Talk.png'
  },
  Hendra: {
    idle: 'assets/characters/Hendra - Direktur/Idle.png',
    talk: 'assets/characters/Hendra - Direktur/Talk.png',
    nyanggah: 'assets/characters/Hendra - Direktur/Nyanggah.png'
  },
  'Hendra Kusuma': {
    idle: 'assets/characters/Hendra - Direktur/Idle.png',
    talk: 'assets/characters/Hendra - Direktur/Talk.png',
    nyanggah: 'assets/characters/Hendra - Direktur/Nyanggah.png'
  },
  Sinta: {
    idle: 'assets/characters/Sinta Marlina - Sekre/Idle.png',
    talk: 'assets/characters/Sinta Marlina - Sekre/Talk.png',
    thinking: 'assets/characters/Sinta Marlina - Sekre/Thinking.png',
    nyanggah: 'assets/characters/Sinta Marlina - Sekre/Nyanggah.png'
  },
  'Sinta Marlina': {
    idle: 'assets/characters/Sinta Marlina - Sekre/Idle.png',
    talk: 'assets/characters/Sinta Marlina - Sekre/Talk.png',
    thinking: 'assets/characters/Sinta Marlina - Sekre/Thinking.png',
    nyanggah: 'assets/characters/Sinta Marlina - Sekre/Nyanggah.png'
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

function setupAudio() {
  Object.entries(audioFiles).forEach(([key, src]) => {
    const audio = new Audio(src);
    audio.preload = 'auto';
    if (['menu', 'prologue', 'scene1', 'scene2', 'analysis'].includes(key)) {
      audio.loop = true;
      audio.volume = 0;
      audioState.music[key] = audio;
    } else {
      audio.volume = audioState.masterVolume;
      audioState.sfx[key] = audio;
    }
  });

  const unlock = () => {
    playMusic('menu', { fadeMs: 1200, volume: 0.42 });
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
  };

  window.addEventListener('pointerdown', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });
  window.addEventListener('load', () => {
    playMusic('menu', { fadeMs: 1200, volume: 0.42 });
  }, { once: true });
}

function setMasterVolume(value) {
  audioState.masterVolume = Math.max(0, Math.min(1, value));
  Object.values(audioState.sfx).forEach((audio) => {
    audio.volume = audioState.masterVolume;
  });
  Object.entries(audioState.music).forEach(([key, audio]) => {
    if (key === audioState.currentMusic) {
      audio.volume = Math.min(audio.volume, audioState.masterVolume);
    }
  });
}

function fadeAudio(audio, targetVolume, duration = 1000, onComplete) {
  if (!audio) return;
  const existingTimer = audioState.fadeTimers.get(audio);
  if (existingTimer) window.clearInterval(existingTimer);

  const startVolume = Number.isFinite(audio.volume) ? audio.volume : 0;
  const safeTarget = Math.max(0, Math.min(audioState.masterVolume, targetVolume));
  const steps = Math.max(1, Math.round(duration / 40));
  let step = 0;

  const timer = window.setInterval(() => {
    step += 1;
    const progress = Math.min(1, step / steps);
    audio.volume = startVolume + (safeTarget - startVolume) * progress;
    if (progress >= 1) {
      window.clearInterval(timer);
      audioState.fadeTimers.delete(audio);
      onComplete?.();
    }
  }, 40);

  audioState.fadeTimers.set(audio, timer);
}

function playMusic(key, options = {}) {
  const next = audioState.music[key];
  if (!next || !volumeOn) return;

  const { fadeMs = 1200, volume = 0.5, restart = false } = options;
  if (audioState.currentMusic && audioState.currentMusic !== key) {
    stopMusic(audioState.currentMusic, fadeMs);
  }

  audioState.currentMusic = key;
  if (restart) next.currentTime = 0;
  next.play().catch(() => {});
  fadeAudio(next, volume, fadeMs);
}

function stopMusic(key = audioState.currentMusic, fadeMs = 1000) {
  const audio = audioState.music[key];
  if (!audio) return;
  fadeAudio(audio, 0, fadeMs, () => {
    audio.pause();
    audio.currentTime = 0;
    if (audioState.currentMusic === key) audioState.currentMusic = null;
  });
}

function stopAllMusic(fadeMs = 600) {
  Object.keys(audioState.music).forEach((key) => stopMusic(key, fadeMs));
  audioState.currentMusic = null;
}

function playSfx(key) {
  const audio = audioState.sfx[key];
  if (!audio || !volumeOn) return;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

function playClick() {
  playSfx('click');
}

function fadeToBlack(duration = 900, hold = 200) {
  const transition = document.createElement('div');
  transition.className = 'screen-fade';
  document.body.appendChild(transition);

  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      transition.classList.add('show');
      window.setTimeout(() => {
        resolve(transition);
        if (hold >= 0) {
          window.setTimeout(() => {
            transition.classList.remove('show');
            window.setTimeout(() => transition.remove(), duration);
          }, hold);
        }
      }, duration);
    });
  });
}

function fadeFromBlack(transition, duration = 900) {
  if (!transition) return;
  transition.classList.remove('show');
  window.setTimeout(() => transition.remove(), duration);
}

function init() {
  setupAudio();
  playMusic('menu', { fadeMs: 1200, volume: 0.42 });
  const btnStart = document.getElementById('btn-start');
  const btnLoad = document.getElementById('btn-load');
  const btnExit = document.getElementById('btn-exit');

  if (btnStart) btnStart.addEventListener('click', () => { playClick(); startGame(); });
  if (btnLoad) btnLoad.addEventListener('click', () => { playClick(); loadGame(); });
  if (btnExit) btnExit.addEventListener('click', () => {
    playClick();
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
    if (volumeOn) playMusic('menu', { fadeMs: 600, volume: 0.42 });
    else stopAllMusic(500);
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
  GameState.isBribed = false;
  GameState.isJekiSaved = false;
  GameState.currentScene = 'Briefing';
  window.mg1State = { index: 0, searchActive: false, isDragging: false, startY: 0 };
  window.mg2State = { zoomActive: false };
  window.mg3State = { qIndex: 0 };
  window.trialState = { suspectId: null, lineIndex: 0, lines: [], speaker: '' };
  saveGame();

  stopMusic('menu', 1100);
  fadeToBlack(1000, -1).then((transition) => {
    hideMainMenu();
    playMusic('prologue', { fadeMs: 1600, volume: 0.5, restart: true });
    playIntroSequence();
    window.setTimeout(() => fadeFromBlack(transition, 1200), 250);
  });
}

function playIntroSequence() {
  GameState.isUIOpen = false;
  hideCharacterStage();
  el.dialogueBox.classList.add('hidden');
  el.status.classList.add('hidden');
  el.inventory.classList.add('hidden');

  setContent(`
    <div class="prologue-slideshow cursor-pointer" id="intro-container">
      <img id="intro-image" class="prologue-image" alt="Prolog FALSE NOTE">
      <div class="prologue-vignette"></div>
      <div class="intro-text-layer" id="intro-layer"></div>
      <div id="click-prompt" class="absolute bottom-10 left-0 right-0 text-center animate-pulse text-stone-500 text-xs tracking-[0.4em] uppercase z-20">
        Klik untuk Lanjut
      </div>
    </div>
  `);

  const container = document.getElementById('intro-container');
  const layer = document.getElementById('intro-layer');
  const image = document.getElementById('intro-image');
  const prompt = document.getElementById('click-prompt');
  
  let currentBlock = 0;
  let isTyping = false;
  let typeTimer = null;
  let currentSlideImage = '';
  let currentSlideBg = '';

  function applySlide(index) {
    const slide = prologueSlides[index];
    if (!slide) return;
    const nextImage = slide.image || '';
    const sameImage = nextImage && nextImage === currentSlideImage;
    const sameBg = slide.bgClass && slide.bgClass === currentSlideBg;

    image.classList.toggle('contain', slide.fit === 'contain');

    if (slide.bgClass) {
      if (!sameBg) {
        container.classList.remove(...prologueBgClasses);
        image.classList.remove('show');
        image.removeAttribute('src');
        currentSlideImage = '';
        setBackground(slide.bgClass);
        container.classList.add(slide.bgClass);
        currentSlideBg = slide.bgClass;
      }
      return;
    }

    if (!sameImage) {
      container.classList.remove(...prologueBgClasses);
      setBackground('bg-black');
      container.classList.add('bg-black');
      currentSlideBg = 'bg-black';
    }
    if (sameImage) return;

    image.classList.remove('show');
    window.setTimeout(() => {
      image.src = slide.image;
      currentSlideImage = slide.image;
      image.classList.add('show');
    }, 120);
  }

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
    fadeToBlack(1100, -1).then((transition) => {
      showTitleCard(() => {
        playSfx('explosion');
        stopMusic('prologue', 1000);
        fadeToBlack(900, -1).then((titleTransition) => {
          startPhase(1);
          window.setTimeout(() => fadeFromBlack(titleTransition, 1200), 250);
        });
      });
      window.setTimeout(() => fadeFromBlack(transition, 900), 150);
    });
  }

  function handleNext() {
    playClick();
    if (isTyping) {
      clearInterval(typeTimer);
      layer.querySelector('p').textContent = prologueSlides[currentBlock].text;
      isTyping = false;
      return;
    }

    currentBlock++;
    if (currentBlock < prologueSlides.length) {
      applySlide(currentBlock);
      typeText(prologueSlides[currentBlock].text);
    } else {
      finishIntro();
    }
  }

  container.onclick = handleNext;
  applySlide(0);
  typeText(prologueSlides[0].text);
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
    playClick();
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
    GameState.isBribed = Boolean(data.isBribed);
    GameState.isJekiSaved = Boolean(data.isJekiSaved);
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
    reportedSuspects,
    isBribed: GameState.isBribed,
    isJekiSaved: GameState.isJekiSaved
  }));
}

function hideMainMenu() {
  el.mainMenu.classList.add('hidden');
  el.content.classList.remove('hidden');
  el.status.classList.remove('hidden');
  el.inventory.classList.add('hidden');
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
  stopAllMusic(700);
  setContent('');
  hideCharacterStage();
  el.dialogueBox.classList.add('hidden');
  el.dialogueBox.onclick = null;
  el.content.classList.add('hidden');
  el.status.classList.add('hidden');
  el.inventory.classList.add('hidden');
  el.settingPanel.classList.add('hidden');
  el.mainMenu.classList.remove('hidden');
  setBackground('bg-office');
  GameState.isUIOpen = false;
  playMusic('menu', { fadeMs: 1200, volume: 0.42, restart: true });

  // Cleanup orphaned DOM elements from minigames/trial
  ['mg1-audit-container', 'mg2-zoom-container', 'mg2-audit-container', 'trial-inventory-container', 'btn-eitsss-action', 'profile-overlay'].forEach(id => {
    const node = document.getElementById(id);
    if (node) node.remove();
  });
  document.querySelectorAll('.popup-layer, .document-viewer-layer, .destination-confirmation').forEach((node) => node.remove());
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
  return GameState.inventory.filter((id) => finalEvidenceIds.includes(id)).length;
}

function hasAllFinalEvidence() {
  return finalEvidenceIds.every((id) => hasEvidence(id));
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
    playClick();
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

function showSceneOneColdOpen(onReady) {
  el.characterStage.innerHTML = '';
  const rakaImg = document.createElement('img');
  rakaImg.src = characterAssets.Raka.idle;
  rakaImg.alt = 'Raka';
  rakaImg.dataset.speaker = 'Raka';
  rakaImg.className = 'character-sprite left active sprite-slide-in-left';
  el.characterStage.appendChild(rakaImg);
  el.characterStage.classList.remove('hidden');

  el.dialogueBox.classList.remove('hidden');
  el.speaker.textContent = 'Raka';
  el.dialogueText.textContent = '';
  el.dialogueText.classList.remove('typing');
  el.dialogueBox.onclick = () => {
    playClick();
    el.dialogueBox.onclick = null;
    onReady?.();
  };
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
      el.inventory.classList.add('hidden');
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
  el.status.classList.remove('hidden');
  el.inventory.classList.add('hidden');
  
  // Clear any active content layer UI (like title cards)
  setContent('');
  
  // Clean up any overlays
  const fade = document.getElementById('intro-fade');
  if (fade) fade.classList.remove('show');

  const intro = phaseIntro[phase];
  if (intro) {
    const bg = phase === 4 ? 'bg-court' : phase === 3 ? 'bg-library' : 'bg-briefing';
    setBackground(bg);
    if (phase === 1) {
      playMusic('scene1', { fadeMs: 1400, volume: 0.46, restart: true });
      showSceneOneColdOpen(() => {
        playDialogue(intro, showPhaseHub);
      });
      return;
    }
    if (phase === 3) playMusic('analysis', { fadeMs: 1000, volume: 0.42, restart: true });
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
    playClick();
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
          showInvestigationConfirmation();
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

function showInvestigationConfirmation() {
  hideCharacterStage();
  el.dialogueBox.classList.add('hidden');
  el.dialogueBox.onclick = null;
  setContent(`
    <section class="destination-confirmation">
      <div class="destination-card">
        <p class="destination-kicker">TUJUAN BERIKUTNYA</p>
        <h2>Ruang Kerja Hendra Kusuma</h2>
        <p>Semua profil awal sudah dicatat. Investigasi fisik dimulai dari ruang direktur.</p>
        <button class="gold-button" id="continue-investigation">Lanjut Investigasi</button>
      </div>
    </section>
  `);

  document.getElementById('continue-investigation').addEventListener('click', () => {
    playSfx('explosion');
    stopMusic('scene1', 1000);
    fadeToBlack(900, -1).then((transition) => {
      showInvestigationHub();
      window.setTimeout(() => fadeFromBlack(transition, 1000), 260);
    });
  });
}

function showInvestigationHub() {
  GameState.isUIOpen = false;
  playMusic('scene2', { fadeMs: 1400, volume: 0.44 });
  setBackground('bg-director-room');
  el.dialogueBox.classList.add('hidden');
  el.dialogueBox.onclick = null;

  // Hotspot definitions — coordinates are % based for responsiveness
  // Adjusted to approximate desk objects in Ruangan direktur.png:
  //   Documents: paper stack on desk (left-center)
  //   Stamp:     drawer/desk surface near lamp (right-center)
  //   Laptop:    laptop at center of desk
  const hotspots = [
    { id: 'DOCUMENTS', label: 'Tumpukan Dokumen', top: '52%', left: '15%', width: '18%', height: '20%', step: 0, image: 'assets/images/investigation/dokumen.png' },
    { id: 'STAMP',     label: 'Laci Meja',        top: '55%', left: '62%', width: '16%', height: '18%', step: 1, image: 'assets/images/investigation/stamp_asli.png' },
    { id: 'LAPTOP',    label: 'Laptop',            top: '42%', left: '38%', width: '22%', height: '22%', step: 2, image: 'assets/images/investigation/laptop.png' }
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
        <img class="room-hotspot-object" src="${h.image}" alt="${escapeHtml(h.label)}">
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
    playClick();
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

function renderInvestigationNote(activeStep = investigationStep) {
  const rows = [
    { label: 'Dokumen Q3', done: GameState.checklist.mg1_complete || activeStep > 0 },
    { label: 'Blueprint stempel', done: GameState.checklist.mg2_complete || activeStep > 1 },
    { label: 'Log percakapan', done: GameState.checklist.mg3_complete || activeStep > 2 }
  ];

  return `
    <aside class="panel-kiri note-raka">
      <p class="triptych-kicker">NOTE RAKA</p>
      <h2>Checklist</h2>
      <div class="note-list">
        ${rows.map((row) => `
          <div class="note-row ${row.done ? 'done' : ''}">
            <span>${row.done ? 'OK' : '...'} </span>
            <b>${escapeHtml(row.label)}</b>
          </div>
        `).join('')}
      </div>
      <p class="note-small">Catat pola, bukan kesan. Yang terlalu jelas biasanya cuma pintu masuk.</p>
    </aside>
  `;
}

function clearRightPanel(message = 'Pilih objek di panel tengah untuk membuka deduksi.') {
  const panel = document.getElementById('triptych-right-panel');
  if (!panel) return;
  panel.innerHTML = `
    <p class="triptych-kicker">DEDUKSI</p>
    <h2>Panel Logika</h2>
    <p class="muted-copy">${escapeHtml(message)}</p>
  `;
}

function renderRightQuestion(title, question, options) {
  const panel = document.getElementById('triptych-right-panel');
  if (!panel) return;
  panel.innerHTML = `
    <p class="triptych-kicker">DEDUKSI</p>
    <h2>${escapeHtml(title)}</h2>
    <p>${escapeHtml(question)}</p>
    <div class="deduction-options">
      ${options.map((option, index) => `
        <button class="audit-option" data-deduction-option="${index}">${escapeHtml(option.label)}</button>
      `).join('')}
    </div>
  `;
  panel.querySelectorAll('[data-deduction-option]').forEach((button) => {
    button.addEventListener('click', () => {
      const option = options[Number(button.dataset.deductionOption)];
      option.onSelect?.();
    });
  });
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
    <div class="investigation-container" id="mg1-layer">
      ${renderInvestigationNote(0)}
      <main class="panel-tengah triptych-main">
        <div class="triptych-toolbar">
          <button onclick="mg1ChangeDoc(-1)" class="round-nav">&lt;</button>
          <h2>Laporan dan Lampiran</h2>
          <button onclick="mg1ChangeDoc(1)" class="round-nav">&gt;</button>
        </div>
        <div class="mg-document-wrapper">
          <img class="document-asset-preview" src="assets/images/investigation/dokumen.png" alt="Dokumen Nusantara Energi">
          <div id="mg1-doc-container" class="mg-document cursor-search" onmousedown="mg1MouseDown(event)" onmouseup="mg1MouseUp(event)" onmousemove="mg1MouseMove(event)" onmouseleave="mg1MouseLeave(event)">
            ${renderDoc()}
          </div>
        </div>
        <button onclick="mg1Close()" class="triptych-close">Tutup Dokumen</button>
      </main>
      <aside class="panel-kanan triptych-side" id="triptych-right-panel"></aside>
    </div>
  `;
  setContent(html);
  clearRightPanel('Seret area yang menurutmu janggal pada dokumen, lalu jawab audit di sini.');
  
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
        addEvidence('doc_anggaran_manipulasi');
        addEvidence('kontrak_vendor_fiktif');
        GameState.checklist.mg1_complete = true;
        investigationStep = Math.max(investigationStep, 1);
        saveGame();
        mg1Close();
        return;
      }
      const q = questions[qIndex];
      renderRightQuestion('5-Question Audit', q.q, q.options.map((opt) => ({
        label: opt,
        onSelect: () => {
          if (opt === q.ans) {
            applyCorrectAnswer();
            qIndex++;
            renderQ();
          } else {
            applyWrongAnswer();
            showToast('Jawaban salah! Kembali ke dokumen.');
            clearRightPanel('Temuan belum kuat. Cek lagi angka yang disorot di dokumen.');
          }
        }
      })));
    };
    renderQ();
  };
}

window.mg2State = { selectedStampId: null, reviewed: {} };

function renderStampMark(stamp, compact = false) {
  const bad = !stamp.isAuthentic;
  const imageSrc = stamp.image || (bad
    ? 'assets/images/investigation/stamp_palsu.png'
    : 'assets/images/investigation/stamp_asli.png');
  return `
    <div class="stamp-seal ${bad ? 'stamp-fake' : ''} ${compact ? 'compact' : ''}">
      <img class="stamp-asset" src="${imageSrc}" alt="${escapeHtml(stamp.label || 'Stempel')}">
      <b>${escapeHtml(stamp.label || 'STEMPEL')}</b>
      <span>${escapeHtml(stamp.owner)}</span>
    </div>
  `;
}

function runStampGame() {
  if (GameState.isUIOpen) return;
  GameState.isUIOpen = true;
  GameState.currentScene = "MG2";
  window.mg2State = { selectedStampId: null, reviewed: {} };
  setBackground('bg-director-room');

  const stampCards = stamps.map((stamp) => `
    <button class="stamp-desk-item" data-stamp-id="${stamp.id}">
      ${renderStampMark(stamp, true)}
      <span>${escapeHtml(stamp.label)}</span>
    </button>
  `).join('');

  setContent(`
    <div class="investigation-container" id="mg2-layer">
      ${renderInvestigationNote(1)}
      <main class="panel-tengah triptych-main">
        <div class="triptych-toolbar">
          <h2>The Blueprint Comparison</h2>
          <button onclick="mg2Close()" class="triptych-close inline">Tutup</button>
        </div>
        <section class="blueprint-comparison">
          <div class="blueprint-card">
            <p class="triptych-kicker">BLUEPRINT RESMI</p>
            ${renderStampMark({ label: 'Stempel Resmi', owner: 'PT. Nusantara Energi', isAuthentic: true, image: 'assets/images/investigation/stamp_asli.png' }, false)}
            <p>Patokan: lingkar simetris, nomor registrasi utuh, dan rantai otorisasi direksi.</p>
          </div>
          <div class="stamp-desk">
            ${stampCards}
          </div>
        </section>
      </main>
      <aside class="panel-kanan triptych-side" id="triptych-right-panel"></aside>
    </div>
  `);

  clearRightPanel('Pilih satu stempel di meja. Bandingkan fisiknya dengan blueprint, lalu tandai.');

  document.querySelectorAll('[data-stamp-id]').forEach((button) => {
    button.addEventListener('click', () => onStampSelected(button.dataset.stampId));
  });

  window.mg2Close = () => {
    GameState.isUIOpen = false;
    setContent('');
    showInvestigationHub();
  };
}

function onStampSelected(stampID) {
  clearRightPanel();
  const stamp = stamps.find((item) => item.id === stampID);
  if (!stamp) return;
  window.mg2State.selectedStampId = stampID;
  document.querySelectorAll('[data-stamp-id]').forEach((button) => {
    button.classList.toggle('selected', button.dataset.stampId === stampID);
  });

  const panel = document.getElementById('triptych-right-panel');
  panel.innerHTML = `
    <p class="triptych-kicker">PERBANDINGAN</p>
    <h2>${escapeHtml(stamp.owner)}</h2>
    ${renderStampMark(stamp)}
    <p>${escapeHtml(stamp.visualHint)}</p>
    <div class="button-row vertical">
      <button class="gold-button" id="mark-original">Tandai Asli</button>
      <button class="danger-button" id="mark-fake">Tandai Palsu</button>
    </div>
  `;
  document.getElementById('mark-original').addEventListener('click', () => onMarkAsOriginal(stampID));
  document.getElementById('mark-fake').addEventListener('click', () => onMarkAsFake(stampID));
}

function onMarkAsOriginal(stampID) {
  const stamp = stamps.find((item) => item.id === stampID);
  if (!stamp) return;

  if (!stamp.isAuthentic) {
    applyWrongAnswer();
    clearRightPanel('Fisik stempel ini tidak cocok dengan blueprint. Ada cacat yang kamu lewatkan.');
    return;
  }

  if (stamp.hierarchyIssue) {
    triggerDeductionQuestion(
      'Otoritas yang Tidak Wajar',
      'Identifikasi fisik: ASLI. Namun, ini adalah stempel otorisasi finansial tingkat Direksi yang dipegang oleh seorang Sekretaris. Kesimpulan?',
      [
        {
          label: 'Sinta sangat dipercaya oleh perusahaan untuk memegang stempel ini.',
          onSelect: () => {
            applyWrongAnswer();
            clearRightPanel('Kepercayaan personal bukan prosedur otorisasi. Cek lagi rantai wewenangnya.');
          }
        },
        {
          label: 'Tidak masuk akal. Staf tidak seharusnya memiliki akses langsung ke alat otorisasi tanpa pengawasan.',
          onSelect: () => {
            applyCorrectAnswer();
            addEvidence('otoritas_sinta_janggal');
            const bellaNote = 'Bella: "Raka... sejak kapan seorang sekretaris bisa mencairkan dana tanpa tanda tangan atasannya?"';
            clearRightPanel(bellaNote);
            window.setTimeout(() => completeStampReview(stampID, bellaNote), 900);
          }
        }
      ]
    );
    return;
  }

  applyCorrectAnswer();
  completeStampReview(stampID, 'Stempel ini cocok dengan blueprint dan rantai otoritasnya masih wajar.');
}

function onMarkAsFake(stampID) {
  const stamp = stamps.find((item) => item.id === stampID);
  if (!stamp) return;

  if (stamp.isAuthentic) {
    applyWrongAnswer();
    clearRightPanel('Secara fisik stempel ini cocok. Masalahnya mungkin bukan cacat bentuk.');
    return;
  }

  applyCorrectAnswer();
  addEvidence(stamp.evidenceId);
  completeStampReview(stampID, 'Nomor registrasi hilang dan bentuk hurufnya menyimpang dari blueprint.');
}

function triggerDeductionQuestion(title, question, options) {
  renderRightQuestion(title, question, options);
}

function completeStampReview(stampID, message = 'Catatan stempel tersimpan.') {
  window.mg2State.reviewed[stampID] = true;
  const button = document.querySelector(`[data-stamp-id="${stampID}"]`);
  if (button) button.classList.add('reviewed');
  clearRightPanel(message);

  const hasFakeStamp = hasEvidence('stempel_jeki_palsu');
  const hasSintaAuthority = hasEvidence('otoritas_sinta_janggal');
  if (hasFakeStamp && hasSintaAuthority) {
    GameState.checklist.mg2_complete = true;
    investigationStep = Math.max(investigationStep, 2);
    saveGame();
    window.setTimeout(() => {
      GameState.isUIOpen = false;
      setContent('');
      checkTwist(() => showInvestigationHub());
    }, 800);
  }
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
        <div class="laptop-investigation-shell">
          <div class="laptop-visual-panel">
            <img src="assets/images/investigation/laptop.png" alt="Laptop analisis digital">
          </div>
          <div class="chat-analysis-panel">
            <h2>Analisis Percakapan</h2>
            <p id="mg3-q-text"></p>
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
            <button onclick="mg3Close()" class="triptych-close chat-close">Tutup Analisis</button>
          </div>
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
      saveGame();
      GameState.isUIOpen = false;
      setContent('');
      checkTwist(() => tryEnterFase3());
      return;
    }
    const q = chatGame.questions[window.mg3State.qIndex];
    document.getElementById('mg3-q-text').textContent = "Pilih chat yang membuktikan: " + q.question;
  };

  window.mg3CheckAnswer = (msgIdx) => {
    const q = chatGame.questions[window.mg3State.qIndex];
    const msg = chatGame.chatLog[msgIdx];
    
    const isCorrectMessage = Number.isInteger(q.correctIndex)
      ? msgIdx === q.correctIndex
      : msg.sender === q.correctAnswer;

    if (isCorrectMessage) {
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

function tryEnterFase3() {
  if (hasAllFinalEvidence()) {
    currentPhase = 3;
    saveGame();
    startPhase(3);
    return;
  }

  const missing = finalEvidenceIds.length - evidenceCount();
  playDialogue([
    ['Bella', [
      `Tunggu, Raka. Bukti kita masih kurang ${missing}. Kita tidak bisa menuduh mereka tanpa dasar yang lengkap.`,
      'Periksa lagi ruangan ini. Pastikan dokumen, stempel, dan jejak digital sudah kita dapatkan semua.'
    ]]
  ], () => {
    GameState.isUIOpen = false;
    showInvestigationHub();
  });
}

function showAnalysis() {
  setBackground('bg-library');
  if (!hasAllFinalEvidence()) {
    tryEnterFase3();
    return;
  }

  window.analysisState = {
    selectedEvidence: null,
    assigned: { hendra: [], sinta: [] }
  };

  renderAnalysisMatching();
}

function renderAnalysisMatching() {
  const state = window.analysisState;
  const assignedIds = [...state.assigned.hendra, ...state.assigned.sinta];
  const pool = finalEvidenceIds.filter((id) => hasEvidence(id) && !assignedIds.includes(id));
  const hendraDone = state.assigned.hendra.length === analysisTargets.hendra.length;
  const sintaDone = state.assigned.sinta.length === analysisTargets.sinta.length;
  const complete = hendraDone && sintaDone;

  const evidenceButtons = pool.map((id) => {
    const item = evidenceDatabase[id];
    const selected = state.selectedEvidence === id ? 'selected' : '';
    return `
      <button class="analysis-evidence ${selected}" data-evidence-id="${id}">
        <b>${escapeHtml(item.name)}</b>
        <small>${escapeHtml(item.hint)}</small>
      </button>
    `;
  }).join('');

  const suspectPanel = (suspectId, title) => {
    const assigned = state.assigned[suspectId];
    const target = analysisTargets[suspectId];
    return `
      <article class="analysis-suspect ${assigned.length === target.length ? 'complete' : ''}" data-analysis-target="${suspectId}">
        <h3>${escapeHtml(title)}</h3>
        <p>${assigned.length}/${target.length} bukti cocok</p>
        <div class="analysis-slots">
          ${target.map((_, index) => {
            const id = assigned[index];
            const item = id ? evidenceDatabase[id] : null;
            return `<div class="analysis-slot ${item ? 'filled' : ''}">${item ? escapeHtml(item.name) : 'Kosong'}</div>`;
          }).join('')}
        </div>
      </article>
    `;
  };

  setContent(`
    <section class="analysis-board">
      <div class="analysis-header">
        <p class="triptych-kicker">FASE 3: ANALISIS</p>
        <h2>Susun Bukti Sebelum Sidang</h2>
        <p>Bukti terkumpul: ${evidenceCount()}/${finalEvidenceIds.length}. Cocokkan 3 bukti Hendra dan 3 bukti Sinta.</p>
      </div>
      <div class="analysis-layout">
        <div class="analysis-pool">
          <h3>Pool Bukti</h3>
          ${evidenceButtons || '<p class="muted-copy">Semua bukti sudah ditempatkan.</p>'}
        </div>
        <div class="analysis-targets">
          ${suspectPanel('hendra', 'Hendra Kusuma')}
          ${suspectPanel('sinta', 'Sinta Marlina')}
        </div>
      </div>
      <div class="button-row">
        <button class="gold-button" id="go-trial" ${complete ? '' : 'disabled'}>Lanjut Sidang</button>
      </div>
    </section>
  `);

  document.querySelectorAll('[data-evidence-id]').forEach((button) => {
    button.addEventListener('click', () => {
      playClick();
      state.selectedEvidence = button.dataset.evidenceId;
      renderAnalysisMatching();
    });
  });

  document.querySelectorAll('[data-analysis-target]').forEach((panel) => {
    panel.addEventListener('click', () => {
      if (!state.selectedEvidence) {
        showToast('Pilih bukti dulu.');
        return;
      }
      const targetId = panel.dataset.analysisTarget;
      const accepted = analysisTargets[targetId].includes(state.selectedEvidence);
      if (!accepted) {
        showBellaInstruction('Bukan itu buktinya, Raka. Coba ingat lagi.');
        state.selectedEvidence = null;
        renderAnalysisMatching();
        return;
      }
      if (!state.assigned[targetId].includes(state.selectedEvidence)) {
        state.assigned[targetId].push(state.selectedEvidence);
      }
      state.selectedEvidence = null;
      renderAnalysisMatching();
    });
  });

  document.getElementById('go-trial').addEventListener('click', () => {
    if (!complete) {
      showToast('Lengkapi 3/3 Hendra dan 3/3 Sinta dulu.');
      return;
    }
    currentPhase = 4;
    saveGame();
    startPhase(4);
  });
}

const TrialSystem = {
  integrity: 100,
  retryBaseIntegrity: 100,
  currentDefendant: 'Hendra',
  currentIndex: 0,
  isEitsssActive: false,
  bribeAccepted: false,
  pretrialDone: false,
  jekiRoute: null,
  jekiExonerated: false,
  selectedOption: null,
  defendants: ['Hendra', 'Sinta', 'Jeki'],
  reset(options = {}) {
    if (!options.keepBribe) this.bribeAccepted = false;
    if (!options.keepBribe) GameState.isBribed = false;
    GameState.isJekiSaved = false;
    this.integrity = options.keepBribe && this.bribeAccepted ? 50 : 100;
    this.retryBaseIntegrity = this.integrity;
    this.currentDefendant = 'Hendra';
    this.currentIndex = 0;
    this.isEitsssActive = false;
    this.pretrialDone = Boolean(options.skipPretrial);
    this.jekiRoute = null;
    this.jekiExonerated = false;
    this.selectedOption = null;
    reportedSuspects = [];
  },
  takeDamage(amount) {
    this.integrity = Math.max(0, this.integrity - amount);
    updateTrialIntegrity(true);
    if (this.integrity <= 0) {
      window.setTimeout(triggerTrialGameOver, 650);
      return false;
    }
    return true;
  }
};

const trialCases = {
  Hendra: {
    speaker: 'Hendra',
    intro: ['Hendra Kusuma dipanggil ke hadapan majelis.'],
    attackQuestion: 'Raka mendapat giliran bicara. Pilih serangan pembuka.',
    attackOptions: [
      { text: 'Anda terlihat terlalu tenang untuk orang yang sedang disidang.', correct: false, fail: 'Hakim: Fokus pada bukti, bukan pembawaan terdakwa.' },
      { text: 'Mengapa ada instruksi di luar SOP untuk merapikan angka laporan?', correct: true },
      { text: 'Jeki pasti menjalankan semua ini sendirian.', correct: false, fail: 'Hendra tersenyum. Tuduhan itu justru menguatkan alibinya.' }
    ],
    rebuttal: ['Saya tidak pernah memberikan instruksi tertulis untuk mengubah laporan!'],
    followQuestion: 'Ada celah dalam bantahan Hendra. Serang dengan tepat.',
    followOptions: [
      { text: 'Bohong, Anda pasti menyuruh secara lisan!', correct: false, fail: 'Hendra: Dugaan tanpa bukti bukan argumen.' },
      { text: 'Lalu pesan singkat "Pastikan angkanya rapi" ini dari siapa?', correct: true },
      { text: 'Auditor internal yang melakukannya!', correct: false, fail: 'Hakim: Itu mengalihkan tuduhan tanpa dasar.' }
    ],
    close: ['Hakim mengetuk palu. Keterangan Hendra dicatat sebagai kontradiktif.'],
    report: ['hendra']
  },
  Sinta: {
    speaker: 'Sinta',
    intro: ['Sinta Marlina maju dengan map dokumen yang masih tertutup rapat.'],
    attackQuestion: 'Pilih celah awal pada posisi Sinta.',
    attackOptions: [
      { text: 'Anda terlalu pendiam, berarti Anda menyembunyikan sesuatu.', correct: false, fail: 'Hakim: Kepribadian bukan bukti.' },
      { text: 'Bagaimana sekretaris bisa memegang alat otorisasi finansial tingkat direksi?', correct: true },
      { text: 'Semua kontrak fiktif pasti dibuat Jeki.', correct: false, fail: 'Sinta tidak perlu membantah. Argumen itu runtuh sendiri.' }
    ],
    rebuttal: ['Saya hanya membantu administrasi. Stempel itu asli dan berada di kantor resmi.'],
    followQuestion: 'Fisik stempel memang asli. Apa pukulan logisnya?',
    followOptions: [
      { text: 'Kalau asli, berarti Sinta pasti tidak bersalah.', correct: false, fail: 'Bella menatap Raka. Asli secara fisik belum tentu sah secara wewenang.' },
      { text: 'Justru karena asli, aksesnya menjadi masalah. Siapa yang memberi izin sekretaris memegang otorisasi direksi?', correct: true },
      { text: 'Stempel itu pasti palsu juga.', correct: false, fail: 'Hakim: Klaim itu bertentangan dengan pemeriksaan fisik.' }
    ],
    close: ['Hakim mengetuk palu. Akses Sinta terhadap otorisasi direksi masuk pertimbangan sidang.'],
    report: ['sinta']
  }
};

function showTrial() {
  preloadTrialAssets();
  TrialSystem.reset();
  renderTrialShell('Koridor pengadilan', 'Sidang belum dimulai.');
  runPreTrialBribe();
}

const trialImpactAssets = {
  raka: 'assets/debat/raka_eitsss.jpeg',
  hendra: 'assets/debat/hendra_panic.jpeg',
  sinta: 'assets/debat/sinta_panic.jpeg',
  jeki: 'assets/debat/jeki_panic.jpeg',
  bella: 'assets/debat/bella_eitsss.jpeg'
};

function preloadTrialAssets() {
  [
    'assets/ui/eitssss.png',
    ...Object.values(trialImpactAssets)
  ].forEach((src) => {
    const image = new Image();
    image.src = src;
  });
}

function renderTrialShell(title, subtitle = '') {
  setContent(`
    <button class="integrity-toggle" id="integrity-toggle" title="Integritas Raka">II</button>
    <aside class="trial-integrity-panel hidden" id="trial-integrity-panel">
      <p>INTEGRITAS</p>
      <div class="trial-integrity-track"><i id="trial-integrity-fill"></i></div>
      <b id="trial-integrity-text">${TrialSystem.integrity}</b>
    </aside>
    <section class="trial-stage-panel">
      <p class="triptych-kicker">FASE 4: SIDANG KONFRONTASI</p>
      <h2>${escapeHtml(title)}</h2>
      <p>${escapeHtml(subtitle)}</p>
      <div id="trial-options" class="trial-options"></div>
    </section>
  `);
  document.getElementById('integrity-toggle').addEventListener('click', () => {
    document.getElementById('trial-integrity-panel')?.classList.toggle('hidden');
  });
  updateTrialIntegrity(false);
}

function updateTrialIntegrity(autoShow = false) {
  const fill = document.getElementById('trial-integrity-fill');
  const text = document.getElementById('trial-integrity-text');
  const panel = document.getElementById('trial-integrity-panel');
  if (!fill || !text || !panel) return;

  fill.style.width = `${TrialSystem.integrity}%`;
  fill.classList.toggle('damage', autoShow);
  text.textContent = TrialSystem.integrity;

  if (autoShow) {
    panel.classList.remove('hidden');
    window.clearTimeout(updateTrialIntegrity.timer);
    updateTrialIntegrity.timer = window.setTimeout(() => {
      panel.classList.add('hidden');
      fill.classList.remove('damage');
    }, 3000);
  }
}

function runPreTrialBribe() {
  setBackground('bg-corridor');
  renderTrialShell('Koridor Pengadilan', 'Hendra mencegat Raka sebelum sidang dimulai.');
  prepareCharacterStage([['Raka'], ['Hendra']]);
  showDialogue('Hendra', ['Kita berdua orang pintar, Raka. Lupakan bukti itu. Ada 500 juta di rekeningmu hari ini kalau kau fokus menyerang Jeki saja.'], () => {
    renderTrialOptions('Tawaran Suap Hendra', [
      {
        text: 'TERIMA UANG',
        onSelect: () => {
          TrialSystem.bribeAccepted = true;
          GameState.isBribed = true;
          TrialSystem.takeDamage(50);
          showDialogue('Raka', ['Baik. Tapi pastikan transfernya masuk.'], startCourtOpening);
        }
      },
      {
        text: 'TOLAK MENTAH-MENTAH',
        onSelect: () => {
          showDialogue('Raka', ['Simpan uangmu untuk bayar pengacara, Hendra.'], startCourtOpening);
        }
      }
    ]);
  }, 'Raka');
}

function startCourtOpening() {
  TrialSystem.pretrialDone = true;
  TrialSystem.retryBaseIntegrity = TrialSystem.bribeAccepted ? 50 : 100;
  setBackground('bg-court');
  renderTrialShell('Ruang Sidang', 'Majelis membuka persidangan kasus PT. Nusantara Energi.');
  hideCharacterStage();
  showDialogue('Hakim', ['Sidang kasus penggelapan dana PT. Nusantara Energi dengan terdakwa Hendra, Sinta, dan Jeki secara resmi dibuka.'], () => {
    startDefendantCase('Hendra');
  });
}

function renderTrialOptions(title, options) {
  const target = document.getElementById('trial-options');
  if (!target) return;
  GameState.isUIOpen = true;
  target.innerHTML = `
    <div class="trial-option-backdrop"></div>
    <div class="trial-option-card">
      <h3>${escapeHtml(title)}</h3>
      ${options.map((option, index) => `<button data-trial-option="${index}">${escapeHtml(option.text)}</button>`).join('')}
    </div>
  `;
  target.querySelectorAll('[data-trial-option]').forEach((button) => {
    button.addEventListener('click', () => {
      GameState.isUIOpen = false;
      TrialSystem.selectedOption = null;
      target.innerHTML = '';
      options[Number(button.dataset.trialOption)]?.onSelect?.();
    });
  });
}

function startDefendantCase(name) {
  TrialSystem.currentDefendant = name;
  TrialSystem.selectedOption = null;
  setBackground('bg-court');
  renderTrialShell(`Kasus ${name}`, 'Adu argumen dimulai.');
  if (name === 'Jeki') {
    startJekiCase();
    return;
  }

  const data = trialCases[name];
  prepareCharacterStage([['Raka'], [data.speaker]]);
  showDialogue('Hakim', data.intro, () => {
    renderTrialOptions(data.attackQuestion, data.attackOptions.map((option) => ({
      text: option.text,
      onSelect: () => {
        if (!option.correct) {
          if (!TrialSystem.takeDamage(25)) return;
          showDialogue(data.speaker, [option.fail], () => startDefendantCase(name), 'Raka');
          return;
        }
        showDialogue(data.speaker, data.rebuttal, () => renderFollowupOptions(name), 'Raka');
      }
    })));
  });
}

function renderFollowupOptions(name) {
  const data = trialCases[name];
  renderTrialOptions(data.followQuestion, data.followOptions.map((option) => ({
    text: option.text,
    onSelect: () => {
      if (!option.correct) {
        if (!TrialSystem.takeDamage(25)) return;
        showDialogue(data.speaker, [option.fail], () => renderFollowupOptions(name), 'Raka');
        return;
      }
      showEitsssExecution(name, () => {
        data.report.forEach((id) => {
          if (!reportedSuspects.includes(id)) reportedSuspects.push(id);
        });
        showDialogue('Hakim', data.close, nextTrialDefendant);
      });
    }
  })));
}

function nextTrialDefendant() {
  const current = TrialSystem.defendants.indexOf(TrialSystem.currentDefendant);
  const next = TrialSystem.defendants[current + 1];
  TrialSystem.selectedOption = null;
  if (!next) {
    saveGame();
    showEnding();
    return;
  }
  startDefendantCase(next);
}

function startJekiCase() {
  prepareCharacterStage([['Raka'], ['Jeki'], ['Hendra']]);
  showDialogue('Hakim', ['Jeki Saputra dipanggil. Ruang sidang mendadak lebih sunyi.'], () => {
    renderTrialOptions('Pilihan Awal Raka', [
      {
        text: 'Apakah Anda sadar menandatangani dokumen fiktif itu?',
        onSelect: () => {
          TrialSystem.jekiRoute = 'safe';
          if (!reportedSuspects.includes('jeki')) reportedSuspects.push('jeki');
          showDialogue('Jeki', ['Saya... saya hanya menjalankan tugas...'], () => {
            showEitsssExecution('Jeki', () => {
              showDialogue('Hakim', ['Palu diketuk. Jeki ikut dinyatakan bertanggung jawab atas otorisasi dokumen.'], () => {
                saveGame();
                showEnding();
              });
            });
          }, 'Raka');
        }
      },
      {
        text: 'Ada anomali waktu. Kepala Bagian tidak mungkin membaca 120 halaman dalam dua menit.',
        onSelect: () => {
          TrialSystem.jekiRoute = 'truth';
          showDialogue('Hendra', ['Jangan mengarang cerita! Bukti tanda tangannya jelas!'], renderJekiTruthOptions, 'Raka');
        }
      }
    ]);
  });
}

function renderJekiTruthOptions() {
  renderTrialOptions('Hendra menekan balik. Pilih argumen yang tidak runtuh.', [
    {
      text: 'Jeki dipaksa!',
      onSelect: () => {
        if (!TrialSystem.takeDamage(25)) return;
        showDialogue('Hendra', ['Mana buktinya dia dipaksa fisik?!'], renderJekiTruthOptions, 'Raka');
      }
    },
    {
      text: 'Jeki tidak tahu apa-apa!',
      onSelect: () => {
        if (!TrialSystem.takeDamage(25)) return;
        showDialogue('Hendra', ['Tapi tanda tangannya ada. Jangan bermain perasaan di ruang sidang.'], renderJekiTruthOptions, 'Raka');
      }
    },
    {
      text: 'Tanda tangan itu asli, TAPI alat otorisasi yang mencapnya... ganda.',
      onSelect: () => {
        TrialSystem.jekiExonerated = true;
        twistUnlocked = true;
        GameState.isJekiSaved = true;
        showEitsssExecution('JekiTruth', () => {
          showDialogue('Hakim', ['Palu diketuk. Jeki Saputra dibebaskan dari tuduhan utama. Fokus sidang kembali pada Hendra dan Sinta.'], () => {
            if (!reportedSuspects.includes('hendra')) reportedSuspects.push('hendra');
            if (!reportedSuspects.includes('sinta')) reportedSuspects.push('sinta');
            saveGame();
            showEnding();
          });
        });
      }
    }
  ]);
}

function showEitsssExecution(caseName, onComplete) {
  TrialSystem.isEitsssActive = true;
  const target = document.getElementById('trial-options');
  if (target) {
    target.innerHTML = `
      <button class="eitsss-mega-button" id="trial-eitsss">
        <img src="assets/ui/eitssss.png" alt="EITSSS!">
      </button>
    `;
  }
  document.getElementById('trial-eitsss')?.addEventListener('click', () => {
    playSfx('explosion');
    TrialSystem.isEitsssActive = false;
    if (target) target.innerHTML = '';
    showTrialImpact(caseName, onComplete);
  });
}

function showTrialImpact(caseName, onComplete) {
  setBackground('bg-court-close');
  hideCharacterStage();
  el.dialogueBox.classList.add('hidden');
  GameState.isUIOpen = true;

  const panicImage = getTrialPanicImage(caseName);
  const steps = [
    {
      src: trialImpactAssets.raka,
      alt: 'Raka EITSSS',
      label: 'Raka menemukan celah.'
    },
    {
      src: panicImage,
      alt: `${caseName} terpojok`,
      label: 'Argumen lawan runtuh.'
    }
  ];

  let stepIndex = 0;
  let impactTimer = null;

  const finishImpact = () => {
    window.clearTimeout(impactTimer);
    el.screen.classList.remove('shake', 'red-alert');
    GameState.isUIOpen = false;
    setBackground('bg-court-close');
    renderTrialShell('Ruang Sidang', 'Hakim mengambil alih kembali jalannya persidangan.');
    onComplete?.();
  };

  const renderStep = () => {
    window.clearTimeout(impactTimer);
    if (stepIndex >= steps.length) {
      finishImpact();
      return;
    }

    const step = steps[stepIndex];
    const isFirst = stepIndex === 0;
    stepIndex += 1;
    el.screen.classList.add('shake');
    setContent(`
      <button class="integrity-toggle" id="integrity-toggle" title="Integritas Raka">II</button>
      <aside class="trial-integrity-panel hidden" id="trial-integrity-panel">
        <p>INTEGRITAS</p>
        <div class="trial-integrity-track"><i id="trial-integrity-fill"></i></div>
        <b id="trial-integrity-text">${TrialSystem.integrity}</b>
      </aside>
      <section class="trial-impact cinematic ${isFirst ? 'raka-cutin' : 'panic-cutin'}" id="trial-impact-cut">
        <img src="${step.src}" alt="${escapeHtml(step.alt)}">
        <div class="trial-impact-caption">
          <b>${isFirst ? 'EITSSS!' : 'TERPOJOK'}</b>
          <span>${escapeHtml(step.label)}</span>
          <small>Klik untuk lanjut</small>
        </div>
      </section>
    `);
    document.getElementById('integrity-toggle')?.addEventListener('click', () => {
      document.getElementById('trial-integrity-panel')?.classList.toggle('hidden');
    });
    document.getElementById('trial-impact-cut')?.addEventListener('click', renderStep);
    updateTrialIntegrity(false);
    impactTimer = window.setTimeout(renderStep, isFirst ? 1500 : 1700);
  };

  renderStep();
}

function getTrialPanicImage(caseName) {
  if (caseName === 'Hendra') return trialImpactAssets.hendra;
  if (caseName === 'Sinta') return trialImpactAssets.sinta;
  if (caseName === 'Jeki' || caseName === 'JekiTruth') return trialImpactAssets.jeki;
  return trialImpactAssets.hendra;
}

function triggerTrialGameOver() {
  hideCharacterStage();
  el.dialogueBox.classList.add('hidden');
  GameState.isUIOpen = false;
  setContent(`
    <section class="trial-game-over">
      <p class="triptych-kicker">INTEGRITAS RUNTUH</p>
      <h2>GAME OVER</h2>
      <p>Argumen Raka terlalu banyak celah. Majelis kehilangan kepercayaan.</p>
      <div class="button-row">
        <button class="gold-button" id="retry-trial">Ulang Dari Awal Sidang</button>
        <button class="danger-button" id="retry-game">Ulang Dari Awal Game</button>
      </div>
    </section>
  `);
  document.getElementById('retry-trial').addEventListener('click', () => {
    TrialSystem.integrity = TrialSystem.bribeAccepted ? 50 : 100;
    TrialSystem.retryBaseIntegrity = TrialSystem.integrity;
    TrialSystem.currentIndex = 0;
    TrialSystem.jekiRoute = null;
    TrialSystem.jekiExonerated = false;
    reportedSuspects = [];
    startCourtOpening();
  });
  document.getElementById('retry-game').addEventListener('click', () => {
    startGame();
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
  if (GameState.isBribed && !GameState.isJekiSaved) {
    return {
      id: 'absolute_fall',
      title: 'THE ABSOLUTE FALL',
      color: '#ef4444',
      bg: 'bg-briefing',
      bellaEitsss: true,
      lines: [
        ['Bella', 'Kamu menjual Jeki demi uang suap Hendra. Kamu mengorbankan orang jujur demi keserakahanmu sendiri.'],
        ['Raka', 'Hukum ini keras, Bel! Aku hanya bertahan hidup!'],
        ['Bella', 'Dan sekarang kamu akan membusuk bersama mereka. Kamu bukan detektif, Raka. Kamu adalah parasit.']
      ],
      closing: 'Tidak ada kehormatan bagi para pengkhianat. Korupsi adalah penyakit yang akan menelan siapa saja yang berani mencicipinya.'
    };
  }

  if (GameState.isBribed && GameState.isJekiSaved) {
    return {
      id: 'hypocrite',
      title: 'THE HYPOCRITE',
      color: '#ef4444',
      bg: 'bg-briefing',
      bellaEitsss: true,
      lines: [
        ['Raka', 'Bella? Ada apa ini? Kita menang! Jeki bebas, Hendra dipenjara!'],
        ['Bella', 'Kita? Sejak kapan "kita" menerima transfer 500 juta ke rekening luar negeri, Raka?'],
        ['Raka', 'Itu... aku bisa jelaskan. Itu uang tutup mulut, tapi aku tetap memenjarakan Hendra!'],
        ['Bella', 'Korupsi tidak diukur dari niat baikmu membebaskan Jeki! Menerima suap menjadikanmu sama kotornya dengan mereka.']
      ],
      closing: 'Tujuan yang baik tidak pernah membenarkan cara yang kotor. Pemberantasan korupsi mati di tangan penegak hukum yang bisa dibeli.'
    };
  }

  if (!GameState.isBribed && GameState.isJekiSaved) {
    return {
      id: 'true_justice',
      title: 'THE TRUE JUSTICE',
      color: '#22c55e',
      bg: 'bg-epilogue-cafe',
      lines: [
        ['Narator', 'Tiga tahun kemudian. Suasana kafe sore itu terlalu tenang untuk kasus yang pernah hampir menghancurkan semuanya.'],
        ['Bella', 'Hendra dan Sinta divonis 10 tahun. Tapi tahukah kamu bagian terburuknya, Raka?'],
        ['Raka', 'Karir mereka hancur?'],
        ['Bella', 'Keluarga mereka. Anak Hendra terpaksa putus sekolah dan pindah ke luar kota karena tidak tahan di-bully. Istrinya dikucilkan lingkungan.'],
        ['Bella', 'Uang korupsi itu mungkin memberi mereka kemewahan sementara, tapi pada akhirnya, yang membayar harganya adalah masa depan anak-anak mereka sendiri.']
      ],
      closing: 'Keadilan telah ditegakkan. Namun ingat, korupsi tidak hanya memenjarakan pelakunya, tapi juga menghukum keluarga yang ditinggalkan.'
    };
  }

  return {
    id: 'blind_eye',
    title: 'THE BLIND EYE',
    color: '#ef4444',
    bg: 'bg-epilogue-rain',
    lines: [
      ['Narator', 'Hujan turun di depan rutan. Raka berdiri terlalu lama di balik pagar besi.'],
      ['Bella', 'Jeki divonis bersalah. Hendra dan Sinta lepas tangan.'],
      ['Raka', 'Kita gagal, Bel. Hukum bisa dipermainkan.'],
      ['Bella', 'Tidak selamanya. Tiga tahun setelah sidang itu, Hendra tertangkap tangan oleh KPK dalam mega-proyek lain. Sinta menjadi buron.'],
      ['Bella', 'Koruptor tidak pernah puas, Raka. Keserakahan mereka sendiri yang akhirnya menghancurkan mereka. Tapi sayangnya... orang jujur seperti Jeki sudah terlanjur hancur menjadi korban.']
    ],
    closing: 'Kebenaran yang terlambat adalah ketidakadilan. Kejahatan akan selalu menemui ajalnya, tapi pastikan kamu tidak membiarkan orang tak bersalah menjadi tumbal.'
  };
}

function showEnding() {
  const ending = resolveEnding();
  disableAllGameplayUI();
  setBackground(ending.bg || 'bg-court');
  hideCharacterStage();
  el.dialogueBox.classList.add('hidden');
  el.dialogueBox.onclick = null;
  window.clearInterval(window.trialTypeTimer);
  const btnE = document.getElementById('btn-eitsss-action');
  if (btnE) btnE.remove();
  const trialInv = document.getElementById('trial-inventory-container');
  if (trialInv) trialInv.remove();
  saveGame();
  playEndingSequence(ending);
}

function disableAllGameplayUI() {
  GameState.isUIOpen = true;
  el.inventory.classList.add('hidden');
  el.status.classList.add('hidden');
  el.settingPanel.classList.add('hidden');
  if (el.pauseButton) el.pauseButton.classList.add('hidden');
  document.querySelectorAll('.integrity-toggle, .trial-integrity-panel, .inventory, .status-panel, .triptych-side, .note-raka').forEach((node) => {
    node.classList.add('hidden');
  });
}

function playEndingSequence(ending) {
  let index = 0;
  const lines = ending.lines || [];

  const renderLine = () => {
    const line = lines[index];
    if (!line) {
      renderTheEnd(ending);
      return;
    }

    const [speaker, text] = line;
    setContent(`
      <section class="ending-scene ${ending.id}">
        <p class="triptych-kicker">${escapeHtml(ending.title)}</p>
        <h2>${escapeHtml(speaker)}</h2>
        <p id="ending-line"></p>
        <small>Klik untuk lanjut</small>
      </section>
    `);

    typeEndingText(text, () => {
      const scene = document.querySelector('.ending-scene');
      if (!scene) return;
      scene.onclick = () => {
        playClick();
        scene.onclick = null;
        index += 1;
        if (ending.bellaEitsss && index === Math.max(1, lines.length - 1)) {
          triggerBellaEitsss(renderLine);
          return;
        }
        renderLine();
      };
    });
  };

  renderLine();
}

function typeEndingText(text, onComplete) {
  const target = document.getElementById('ending-line');
  if (!target) return;
  let charIndex = 0;
  target.textContent = '';
  target.classList.add('typing');
  window.clearInterval(window.endingTypeTimer);
  window.endingTypeTimer = window.setInterval(() => {
    charIndex += 1;
    target.textContent = text.slice(0, charIndex);
    if (charIndex >= text.length) {
      window.clearInterval(window.endingTypeTimer);
      target.classList.remove('typing');
      onComplete?.();
    }
  }, speedMap[textSpeed] || 35);
}

function triggerBellaEitsss(onComplete) {
  playSfx('explosion');
  el.screen.classList.add('shake', 'red-alert');
  setContent(`
    <section class="bella-eitsss-fullscreen">
      <img src="${trialImpactAssets.bella}" alt="Bella EITSSS">
      <img src="assets/ui/eitssss.png" alt="EITSSS!" class="bella-eitsss-logo">
    </section>
  `);
  window.setTimeout(() => {
    el.screen.classList.remove('shake', 'red-alert');
    onComplete?.();
  }, 2000);
}

function renderTheEnd(ending) {
  setContent(`
    <section class="ending-scene the-end ${ending.id}">
      <p class="triptych-kicker">${escapeHtml(ending.title)}</p>
      <h2>THE END</h2>
      <p>${escapeHtml(ending.closing)}</p>
      <div class="button-row">
        <button class="gold-button" id="ending-menu">Kembali ke Menu Utama</button>
      </div>
    </section>
  `);
  document.getElementById('ending-menu').addEventListener('click', resetSessionToMainMenu);
}

function resetSessionToMainMenu() {
  localStorage.removeItem(SAVE_KEY);
  integrity = 100;
  suspicion = 0;
  evidence = [];
  currentPhase = 1;
  investigationStep = 0;
  twistUnlocked = false;
  reportedSuspects = [];
  GameState.inventory = [];
  GameState.checklist = { mg1_complete: false, mg2_complete: false, mg3_complete: false };
  GameState.isBribed = false;
  GameState.isJekiSaved = false;
  GameState.isUIOpen = false;
  GameState.integrity = 5;
  GameState.trialSelection = [];
  window.mg1State = { index: 0, searchActive: false, isDragging: false, startY: 0 };
  window.mg2State = { selectedStampId: null, reviewed: {} };
  window.mg3State = { qIndex: 0 };
  window.trialState = { suspectId: null, lineIndex: 0, lines: [], speaker: '' };
  returnToMainMenu();
  localStorage.removeItem(SAVE_KEY);
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
