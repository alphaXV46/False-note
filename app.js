const characters = {
  kirana: {
    name: "Kirana Maharani",
    role: "Mahasiswi FH UI 2025",
    bio: "Teliti, gampang overthinking, tapi paling tidak tahan melihat data beasiswa dipermainkan.",
    className: "kirana",
    portrait: { face: "#c98f64", hair: "#141313", color: "#d8c4a1" },
  },
  adrian: {
    name: "Dr. Adrian Wibisono",
    role: "Ketua Program Bantuan Pendidikan",
    bio: "Ramah di depan forum, tajam saat akses data mulai disentuh.",
    className: "adrian",
    portrait: { face: "#bd8460", hair: "#202020", color: "#efefef" },
  },
  bella: {
    name: "Bella Permata",
    role: "Ketua BEM FH UI",
    bio: "Berpengaruh di media sosial kampus. Bisa jadi sekutu, bisa jadi tekanan publik.",
    className: "bella",
    portrait: { face: "#c78362", hair: "#151515", color: "#315fb8" },
  },
  dimas: {
    name: "Dimas Pradana",
    role: "Sahabat Kirana / Forensik Digital",
    bio: "Mahasiswa teknik komputer yang bicara pelan, bercanda seadanya, dan sangat susah dibohongi metadata.",
    className: "dimas",
    portrait: { face: "#b9825c", hair: "#242424", color: "#45515d" },
  },
  staff: {
    name: "Mbak Rani",
    role: "Staf Tata Usaha",
    bio: "Saksi yang takut ikut terseret, tapi tahu memo mana yang asli dan mana yang diedit.",
    className: "staff",
    portrait: { face: "#c28b67", hair: "#2d2521", color: "#6a7d69" },
  },
  dekan: {
    name: "Dekan FH",
    role: "Pimpinan Forum Fakultas",
    bio: "Butuh bukti kuat sebelum membuka audit yang bisa mengguncang nama kampus.",
    className: "dekan",
    portrait: { face: "#b98768", hair: "#2c2c2c", color: "#1d2228" },
  },
};

const evidenceCatalog = {
  falseNote: {
    name: "False Note Operasional",
    detail: "Memo mencatat Rp200.000.000 sebagai biaya operasional dan studi banding fiktif.",
    strength: 18,
  },
  realSheet: {
    name: "Foto REAL_NOTE_BPM.xlsx",
    detail: "Spreadsheet internal menunjukkan dana riil hanya Rp300.000.000.",
    strength: 16,
  },
  metadata: {
    name: "Metadata Edit 19 Oktober",
    detail: "File diubah setelah laporan resmi disetujui rektorat.",
    strength: 16,
  },
  signature: {
    name: "Tanda Tangan Tidak Sah",
    detail: "Scan memo edit memakai tanda tangan yang tidak cocok dengan arsip legal.",
    strength: 18,
  },
  witness: {
    name: "Kesaksian Mbak Rani",
    detail: "Staf TU melihat instruksi pengubahan nominal setelah jam kerja.",
    strength: 22,
  },
  transfer: {
    name: "Jejak Transfer Vendor",
    detail: "Transfer kecil berulang masuk ke rekening perantara senior kampus.",
    strength: 26,
  },
};

const cases = [
  {
    title: "Memo yang Salah Diam",
    location: "Ruang Magang FH UI",
    note: "Cari asal mula false note tanpa membuat Dr. Adrian curiga terlalu cepat.",
    left: "kirana",
    right: "adrian",
    lines: [
      { speaker: "adrian", mood: "ramah", text: "Kirana, hari ini kamu cukup verifikasi berkas beasiswa. Jangan buka folder yang bukan tugasmu." },
      { speaker: "kirana", mood: "menahan gugup", text: "Baik, Pak. Tapi folder Dana_BPM_2025 muncul di akses terakhir laptop magang." },
      { speaker: "adrian", mood: "menekan halus", text: "Itu arsip lama. Kalau kamu ingin beasiswamu aman, fokus pada pekerjaan resmi." },
      {
        speaker: "kirana",
        mood: "berpikir",
        text: "Di layar ada memo bertuliskan biaya operasional Rp200 juta. Angka itu tidak muncul di laporan publik.",
        evidence: "falseNote",
      },
      {
        type: "choice",
        speaker: "kirana",
        mood: "dilema",
        text: "Apa yang Kirana lakukan dengan memo itu?",
        choices: [
          { label: "Foto memo diam-diam pakai HP", next: "good", effects: { integrity: 4, reputation: 2 } },
          { label: "Lapor langsung ke Dr. Adrian", next: "bad", effects: { integrity: -4, reputation: -6 } },
          { label: "Abaikan dulu demi aman", next: "bad", effects: { integrity: -8 } },
        ],
      },
      { id: "good", endCase: true, speaker: "kirana", mood: "tegas", text: "Kirana memotret memo itu. Bukan untuk viral, tapi untuk dibandingkan dengan dokumen resmi." },
      { id: "bad", endCase: true, speaker: "adrian", mood: "dingin", text: "Dr. Adrian segera menutup folder itu. Akses Kirana mulai dibatasi." },
    ],
  },
  {
    title: "Screenshot Setengah-Setengah",
    location: "WA Dimas / Perpustakaan Pusat",
    note: "Dimas membantu membuktikan bahwa selisih Rp200 juta bukan typo.",
    left: "kirana",
    right: "dimas",
    lines: [
      { speaker: "dimas", mood: "pelan tapi kritis", text: "Kana, lo punya memo. Sekarang butuh pembanding. Ada file real note?" },
      { speaker: "kirana", mood: "fokus", text: "Ada REAL_NOTE_BPM.xlsx. Anggarannya Rp300 juta, bukan Rp500 juta." },
      { speaker: "dimas", mood: "waspada", text: "Nah. Kalau klaim mereka semua transparan, screenshot ini bisa jadi awal." },
      { speaker: "kirana", mood: "mencatat", text: "Kirana menyimpan foto spreadsheet ke folder terenkripsi Dimas.", evidence: "realSheet" },
      {
        type: "objection",
        speaker: "dimas",
        mood: "uji bukti",
        text: "Dr. Adrian nanti pasti bilang: 'Perbedaan angka cuma draft internal yang belum final.' Bukti mana yang paling pas buat menyanggah?",
        correct: "realSheet",
        success: "Kirana menunjukkan file real note yang justru dibuat setelah laporan resmi. Klaim draft mulai goyah.",
        fail: "Buktinya belum tepat. Dimas mengingatkan Kirana untuk tidak asal menuduh.",
      },
    ],
  },
  {
    title: "Tanggal yang Berbohong",
    location: "Perpustakaan Pusat UI",
    note: "Cek metadata dan tanda tangan. Dua detail kecil bisa membuka pola edit.",
    left: "kirana",
    right: "dimas",
    lines: [
      { speaker: "dimas", mood: "serius", text: "Metadata file ini aneh. Laporan resmi tanggal 12 Oktober, tapi memo diedit tanggal 19 Oktober." },
      { speaker: "kirana", mood: "kaget", text: "Berarti biaya operasional Rp200 juta ditambahkan setelah persetujuan?" },
      { speaker: "dimas", mood: "mengangguk", text: "Itu hipotesis yang kuat. Simpan metadata-nya.", evidence: "metadata" },
      { speaker: "kirana", mood: "teliti", text: "Scan tanda tangan Dr. Adrian juga beda ketebalan dan jarak dari arsip legal.", evidence: "signature" },
      {
        type: "choice",
        speaker: "dimas",
        mood: "menggoda",
        text: "Kalau mau cepat, gue bisa edit screenshot biar tanda tangannya kelihatan lebih palsu. Mau?",
        choices: [
          { label: "Tolak. Bukti palsu bikin kasus hancur.", next: "honest", effects: { integrity: 12, reputation: 2 } },
          { label: "Minta Dimas mempertebal bukti.", next: "fake", effects: { integrity: -35, reputation: -15 } },
        ],
      },
      { id: "honest", endCase: true, speaker: "kirana", mood: "tegas", text: "Nggak. Kalau kita manipulasi, kita sama aja kayak mereka." },
      { id: "fake", endCase: true, speaker: "dimas", mood: "kecewa", text: "Kana, itu bukan investigasi. Itu bikin jebakan buat diri sendiri." },
    ],
  },
  {
    title: "Legal Kopi",
    location: "Kedai Legal Kopi",
    note: "Mbak Rani tahu siapa yang menyuruh perubahan memo, tapi reputasinya juga dipertaruhkan.",
    left: "kirana",
    right: "staff",
    lines: [
      { speaker: "staff", mood: "cemas", text: "Saya cuma staf, Dek. Kalau nama saya muncul, saya bisa dipindah." },
      { speaker: "kirana", mood: "empati", text: "Saya nggak akan pakai nama Mbak tanpa izin. Saya butuh tahu apakah memo itu memang diedit." },
      { speaker: "staff", mood: "pelan", text: "Ada instruksi setelah jam kerja. Nominal Rp300 juta diminta jadi Rp500 juta. Sisanya ditulis operasional." },
      { speaker: "kirana", mood: "mencatat", text: "Kirana mencatat kesaksian Mbak Rani tanpa membuka identitasnya.", evidence: "witness" },
      {
        type: "objection",
        speaker: "staff",
        mood: "takut",
        text: "Kalau mereka bilang saya cuma salah dengar, bukti pendukung apa yang cocok?",
        correct: "metadata",
        success: "Metadata edit memperkuat kesaksian Mbak Rani. Waktu perubahan dan cerita saksi saling mengunci.",
        fail: "Mbak Rani makin ragu karena bukti yang dipilih belum menguatkan waktu kejadian.",
      },
    ],
  },
  {
    title: "BEM Mulai Panas",
    location: "Aplikasi Kampus Kita",
    note: "Bella bisa membantu dukungan mahasiswa, tapi ia tidak mau membawa isu yang terlihat lemah.",
    left: "kirana",
    right: "bella",
    lines: [
      { speaker: "bella", mood: "tajam", text: "Kirana, lo tahu kan kalau salah langkah, FH UI diseret jadi bahan gorengan?" },
      { speaker: "kirana", mood: "lelah tapi siap", text: "Aku tahu. Makanya aku nggak akan upload tuduhan tanpa bukti." },
      { speaker: "bella", mood: "menantang", text: "Dr. Adrian posting semua dana transparan. Kalau mau SANGGAH!, kasih yang paling meyakinkan." },
      {
        type: "objection",
        speaker: "bella",
        mood: "uji publik",
        text: "Pilih bukti buat membantah klaim 'semua transparan dan tidak ada mark-up'.",
        correct: "falseNote",
        success: "False Note Operasional membuat publik melihat istilah operasional sebagai pintu selisih Rp200 juta.",
        fail: "Bella menahan unggahan. Bukti itu belum cukup jelas untuk publik.",
      },
      { speaker: "bella", mood: "mulai percaya", text: "Oke. Gue bantu dorong forum terbuka, tapi jangan ada bukti palsu satu pun." },
    ],
  },
  {
    title: "Forum Fakultas",
    location: "Balairung Mini FH UI",
    note: "Bongkar semua pihak dengan bukti yang tepat. Ini titik menang atau kalah.",
    left: "kirana",
    right: "adrian",
    lines: [
      { speaker: "dekan", mood: "formal", text: "Forum ini dibuka untuk klarifikasi Program Prestasi Muda Nusantara." },
      { speaker: "adrian", mood: "tenang palsu", text: "Tidak ada mark-up. Yang disebut false note hanya catatan operasional biasa." },
      {
        type: "objection",
        speaker: "kirana",
        mood: "momentum",
        text: "SANGGAH klaim Dr. Adrian dengan bukti paling langsung.",
        correct: "falseNote",
        success: "Kirana membuka memo operasional Rp200 juta dan menunjukkan istilah fiktif yang tidak ada di laporan publik.",
        fail: "Forum mulai kehilangan fokus. Dr. Adrian memanfaatkan celah itu untuk menyebut Kirana spekulatif.",
      },
      { speaker: "adrian", mood: "menekan", text: "Memo itu tidak membuktikan dana mengalir ke pihak mana pun." },
      { speaker: "kirana", mood: "membalikkan tekanan", text: "Dimas menemukan transfer kecil berulang dari vendor ke rekening perantara.", evidence: "transfer" },
      {
        type: "objection",
        speaker: "adrian",
        mood: "terpojok",
        text: "Pilih bukti terakhir untuk mengunci aliran dana.",
        correct: "transfer",
        success: "Jejak transfer vendor menghubungkan memo, nominal, dan penerima manfaat. Forum berubah hening.",
        fail: "Aliran dana belum terkunci. Kasus tetap masuk audit, tapi tidak langsung terbuka.",
      },
      { speaker: "dekan", mood: "putusan", text: "Dengan bukti ini, fakultas membuka audit independen dan melindungi status beasiswa Kirana sampai proses selesai." },
    ],
  },
];

const state = {
  caseIndex: 0,
  lineIndex: 0,
  integrity: 75,
  reputation: 60,
  evidence: [],
  completeCases: [],
  ended: false,
};

const els = {
  intro: document.querySelector("#intro-screen"),
  game: document.querySelector("#game-screen"),
  ending: document.querySelector("#ending-screen"),
  start: document.querySelector("#start-game"),
  continue: document.querySelector("#continue-game"),
  restart: document.querySelector("#restart-game"),
  save: document.querySelector("#save-game"),
  caseLabel: document.querySelector("#case-label"),
  caseTitle: document.querySelector("#case-title"),
  caseList: document.querySelector("#case-list"),
  evidenceList: document.querySelector("#evidence-list"),
  evidenceCount: document.querySelector("#evidence-count"),
  sceneName: document.querySelector("#scene-name"),
  leftSprite: document.querySelector("#left-sprite"),
  rightSprite: document.querySelector("#right-sprite"),
  leftName: document.querySelector("#left-name"),
  rightName: document.querySelector("#right-name"),
  speaker: document.querySelector("#speaker-name"),
  mood: document.querySelector("#mood-label"),
  text: document.querySelector("#dialogue-text"),
  actions: document.querySelector("#action-area"),
  profile: document.querySelector("#active-profile"),
  note: document.querySelector("#case-note"),
  impact: document.querySelector("#impact-word"),
  integrity: document.querySelector("#integrity-score"),
  reputation: document.querySelector("#reputation-score"),
  evidenceScore: document.querySelector("#evidence-score"),
  endingTitle: document.querySelector("#ending-title"),
  endingBody: document.querySelector("#ending-body"),
  finalScore: document.querySelector("#final-score"),
};

function startGame() {
  Object.assign(state, {
    caseIndex: 0,
    lineIndex: 0,
    integrity: 75,
    reputation: 60,
    evidence: [],
    completeCases: [],
    ended: false,
  });
  localStorage.removeItem("false-note-dialogue-save");
  showGame();
}

function showGame() {
  els.intro.classList.add("is-hidden");
  els.ending.classList.add("is-hidden");
  els.game.classList.remove("is-hidden");
  render();
}

function continueGame() {
  const saved = localStorage.getItem("false-note-dialogue-save");
  if (!saved) {
    els.continue.textContent = "Belum Ada Save";
    window.setTimeout(() => (els.continue.textContent = "Lanjutkan Save"), 900);
    return;
  }

  Object.assign(state, JSON.parse(saved));
  showGame();
}

function saveGame() {
  localStorage.setItem("false-note-dialogue-save", JSON.stringify(state));
  els.note.textContent = "Save aman. Nota saku Kirana: jangan lupa pilih bukti yang cocok, bukan yang paling dramatis.";
}

function render() {
  if (state.ended) return;

  const activeCase = cases[state.caseIndex];
  const line = getCurrentLine();
  const speaker = characters[line.speaker] || characters.kirana;
  const left = characters[activeCase.left] || characters.kirana;
  const right = characters[activeCase.right] || characters.adrian;

  els.caseLabel.textContent = `Episode ${state.caseIndex + 1} / ${cases.length}`;
  els.caseTitle.textContent = activeCase.title;
  els.sceneName.textContent = activeCase.location;
  els.note.textContent = activeCase.note;
  els.integrity.textContent = clamp(state.integrity);
  els.reputation.textContent = clamp(state.reputation);
  els.evidenceScore.textContent = evidenceStrength();
  els.evidenceCount.textContent = `${state.evidence.length}/5`;
  els.speaker.textContent = speaker.name;
  els.mood.textContent = line.mood || "tenang";
  els.text.textContent = line.text;

  renderStage(left, right, speaker);
  renderCaseList();
  renderEvidence();
  renderProfile(speaker);
  renderActions(line);
  gainEvidence(line.evidence);
  checkFailure();
}

function getCurrentLine() {
  const activeCase = cases[state.caseIndex];
  return activeCase.lines[state.lineIndex] || activeCase.lines[activeCase.lines.length - 1];
}

function renderStage(left, right, speaker) {
  els.leftSprite.className = `sprite ${left.className}`;
  els.rightSprite.className = `sprite ${right.className}`;
  els.leftName.textContent = left.name.split(" ")[0];
  els.rightName.textContent = right.name.split(" ")[0];

  const leftSlot = els.leftSprite.parentElement;
  const rightSlot = els.rightSprite.parentElement;
  leftSlot.classList.toggle("is-speaking", speaker.name === left.name);
  rightSlot.classList.toggle("is-speaking", speaker.name === right.name);
  leftSlot.classList.toggle("is-dim", speaker.name !== left.name);
  rightSlot.classList.toggle("is-dim", speaker.name !== right.name);
}

function renderCaseList() {
  els.caseList.innerHTML = cases
    .map((item, index) => {
      const done = state.completeCases.includes(index);
      const active = index === state.caseIndex;
      const locked = index > state.caseIndex && !done;
      return `
        <button class="case-item ${active ? "is-active" : ""}" data-case="${index}" ${locked ? "disabled" : ""}>
          <strong>${index + 1}. ${item.title}</strong>
          <i>${done ? "selesai" : active ? "berjalan" : locked ? "terkunci" : "terbuka"}</i>
        </button>
      `;
    })
    .join("");

  document.querySelectorAll("[data-case]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = Number(button.dataset.case);
      if (target <= state.caseIndex || state.completeCases.includes(target)) {
        state.caseIndex = target;
        state.lineIndex = 0;
        render();
      }
    });
  });
}

function renderEvidence() {
  if (!state.evidence.length) {
    els.evidenceList.innerHTML = `<div class="evidence-chip"><strong>Belum ada bukti</strong><span>Dialog akan membuka bukti baru.</span></div>`;
    return;
  }

  els.evidenceList.innerHTML = state.evidence
    .map((id) => {
      const item = evidenceCatalog[id];
      return `
        <div class="evidence-chip">
          <strong>${item.name}</strong>
          <span>${item.detail}</span>
        </div>
      `;
    })
    .join("");
}

function renderProfile(character) {
  const vars = `--face:${character.portrait.face};--hair:${character.portrait.hair};--color:${character.portrait.color}`;
  els.profile.innerHTML = `
    <div class="profile-portrait" style="${vars}"></div>
    <span>${character.role}</span>
    <h3>${character.name}</h3>
    <p>${character.bio}</p>
  `;
}

function renderActions(line) {
  if (line.type === "choice") {
    els.actions.innerHTML = line.choices
      .map((choice, index) => `<button class="choice-btn" data-choice="${index}">${choice.label}</button>`)
      .join("");

    document.querySelectorAll("[data-choice]").forEach((button) => {
      button.addEventListener("click", () => chooseLine(line, Number(button.dataset.choice)));
    });
    return;
  }

  if (line.type === "objection") {
    const buttons = state.evidence
      .map((id) => {
        const item = evidenceCatalog[id];
        return `<button class="evidence-btn" data-evidence="${id}">${item.name}</button>`;
      })
      .join("");
    els.actions.innerHTML = `
      <button class="objection-btn" id="objection-btn" ${state.evidence.length ? "" : "disabled"}>SANGGAH!</button>
      <div id="evidence-picker" class="is-hidden">${buttons}</div>
    `;

    document.querySelector("#objection-btn").addEventListener("click", showEvidencePicker);
    document.querySelectorAll("[data-evidence]").forEach((button) => {
      button.addEventListener("click", () => objectWithEvidence(line, button.dataset.evidence));
    });
    return;
  }

  els.actions.innerHTML = `<button class="next-btn" id="next-line">Lanjut</button>`;
  document.querySelector("#next-line").addEventListener("click", nextLine);
}

function showEvidencePicker() {
  els.impact.classList.remove("is-hidden");
  window.setTimeout(() => els.impact.classList.add("is-hidden"), 700);
  document.querySelector("#evidence-picker").classList.remove("is-hidden");
}

function chooseLine(line, index) {
  const choice = line.choices[index];
  applyEffects(choice.effects || {});
  jumpTo(choice.next);
}

function objectWithEvidence(line, id) {
  els.impact.classList.remove("is-hidden");
  window.setTimeout(() => els.impact.classList.add("is-hidden"), 700);

  if (id === line.correct) {
    applyEffects({ integrity: 7, reputation: 8 });
    insertLine({
      speaker: "kirana",
      mood: "SANGGAH berhasil",
      text: line.success,
    });
  } else {
    applyEffects({ integrity: -6, reputation: -12 });
    insertLine({
      speaker: "adrian",
      mood: "membalas",
      text: line.fail,
    });
  }
}

function insertLine(line) {
  const activeCase = cases[state.caseIndex];
  activeCase.lines.splice(state.lineIndex + 1, 0, line);
  nextLine();
}

function jumpTo(id) {
  const activeCase = cases[state.caseIndex];
  const target = activeCase.lines.findIndex((item) => item.id === id);
  state.lineIndex = target >= 0 ? target : state.lineIndex + 1;
  render();
}

function nextLine() {
  const activeCase = cases[state.caseIndex];
  if (getCurrentLine().endCase) {
    completeCase();
    return;
  }

  if (state.lineIndex < activeCase.lines.length - 1) {
    state.lineIndex += 1;
    render();
    return;
  }

  completeCase();
}

function completeCase() {
  if (!state.completeCases.includes(state.caseIndex)) state.completeCases.push(state.caseIndex);

  if (state.caseIndex < cases.length - 1) {
    state.caseIndex += 1;
    state.lineIndex = 0;
    render();
  } else {
    showEnding();
  }
}

function gainEvidence(id) {
  if (!id || state.evidence.includes(id)) return;
  state.evidence.push(id);
  localStorage.setItem("false-note-dialogue-save", JSON.stringify(state));
  renderEvidence();
  els.evidenceScore.textContent = evidenceStrength();
  els.evidenceCount.textContent = `${state.evidence.length}/5`;
}

function applyEffects(effects) {
  state.integrity = clamp(state.integrity + (effects.integrity || 0));
  state.reputation = clamp(state.reputation + (effects.reputation || 0));
}

function evidenceStrength() {
  return clamp(state.evidence.reduce((total, id) => total + evidenceCatalog[id].strength, 0));
}

function finalScore() {
  return Math.round(state.integrity * 0.5 + state.reputation * 0.3 + evidenceStrength() * 0.2);
}

function checkFailure() {
  if (state.integrity <= 0 || state.reputation <= 0) showEnding();
}

function showEnding() {
  state.ended = true;
  const score = finalScore();
  let title = "Neutral Ending";
  let body =
    "Forum membuka audit internal, tapi sebagian bukti belum cukup mengunci semua pihak. Kirana tetap kuliah, namun kasus hanya berjalan pelan.";

  if (state.integrity < 30 || state.reputation < 25) {
    title = "Bad Ending";
    body =
      "Kirana kehilangan dukungan karena pilihan bukti dan etik yang buruk. Skandal tertutup, dan beasiswanya ikut dipertanyakan.";
  } else if (state.integrity > 80 && state.evidence.length >= 5 && evidenceStrength() >= 90) {
    title = "True Ending";
    body =
      "Kirana membongkar false note di forum fakultas tanpa memalsukan bukti. Skandal beasiswa terbuka, audit independen dimulai, dan beasiswanya dilindungi.";
  }

  els.game.classList.add("is-hidden");
  els.intro.classList.add("is-hidden");
  els.ending.classList.remove("is-hidden");
  els.endingTitle.textContent = title;
  els.endingBody.textContent = body;
  els.finalScore.innerHTML = `
    <div><span>Integritas</span><strong>${clamp(state.integrity)}</strong></div>
    <div><span>Reputasi</span><strong>${clamp(state.reputation)}</strong></div>
    <div><span>Skor Akhir</span><strong>${score}</strong></div>
  `;
  localStorage.setItem("false-note-dialogue-save", JSON.stringify(state));
}

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

els.start.addEventListener("click", startGame);
els.continue.addEventListener("click", continueGame);
els.restart.addEventListener("click", startGame);
els.save.addEventListener("click", saveGame);
