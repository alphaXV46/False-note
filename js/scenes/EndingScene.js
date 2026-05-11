// ===============================
// FILE: js/scenes/EndingScene.js
// DESKRIPSI: Menampilkan ending game (True, Neutral, Bad).
// Termasuk evidence checklist dan fallacy summary.
// Data dibaca langsung dari gameState.
// ===============================
import gameState from '../managers/GameState.js';
import evidenceManager from '../managers/EvidenceManager.js';

export default class EndingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EndingScene' });
  }

  // ===============================
  // FUNGSI: init()
  // DESKRIPSI: Terima data ending type dari scene sebelumnya.
  // PARAMETER: data (object) — { type: 'true'|'neutral'|'bad', reason?: string }
  // ===============================
  init(data) {
    this.endingType = data.type || 'bad';
    this.endingReason = data.reason || '';
  }

  create() {
    const { width, height } = this.cameras.main;

    this.cameras.main.setBackgroundColor('#000000');

    // Tampilkan ending sesuai tipe
    switch (this.endingType) {
      case 'true':
        this._showTrueEnding(width, height);
        break;
      case 'neutral':
        this._showNeutralEnding(width, height);
        break;
      case 'bad':
      default:
        this._showBadEnding(width, height);
        break;
    }
  }

  // ===============================
  // TRUE ENDING
  // ===============================
  _showTrueEnding(width, height) {
    const lines = [
      'Adrian ditangkap.',
      'Laporan Raka jadi bukti utama.',
      'Kampus berubah. Pelan-pelan.',
      'Tapi berubah.'
    ];

    this._displayEndingLines(lines, '#00cc44', width, height);
    this._showEndingLabel('TRUE ENDING', '#00cc44', width);
    this._showEvidenceChecklist(width, height);
    this._showFallacySummary(width, height);
    this._showEndButtons(width, height);
  }

  // ===============================
  // NEUTRAL ENDING
  // ===============================
  _showNeutralEnding(width, height) {
    const lines = [
      'Raka bicara. Tapi tidak cukup keras.',
      'Beberapa pejabat diperiksa.',
      'Tapi Adrian masih di kursinya.',
      'Perjuangan belum selesai.'
    ];

    this._displayEndingLines(lines, '#fbbf24', width, height);
    this._showEndingLabel('NEUTRAL ENDING', '#fbbf24', width);
    this._showEvidenceChecklist(width, height);
    this._showFallacySummary(width, height);
    this._showEndButtons(width, height);
  }

  // ===============================
  // BAD ENDING
  // ===============================
  _showBadEnding(width, height) {
    let lines = [];

    switch (this.endingReason) {
      case 'integrity':
        lines = [
          'Raka memilih diam.',
          'Atau lebih buruk... menerima suap.',
          'Korupsi menang lagi.'
        ];
        break;
      case 'suspicion':
        lines = [
          'Raka dipecat dari magang.',
          'Sebelum sempat mengumpulkan cukup bukti.',
          'Ancaman terlalu besar.'
        ];
        break;
      case 'reputation':
        lines = [
          'Netizen mem-bully habis.',
          'Dosen wali mencabut beasiswa.',
          'Raka kehilangan segalanya.'
        ];
        break;
      case 'moral':
      default:
        lines = [
          'Raka memilih diam.',
          'Beasiswanya dicabut.',
          'Tapi kampus tetap sibuk.',
          'Mahasiswa lain tetap kuliah.',
          'Korupsi terus berjalan.',
          'Seolah… perjuanganmu tidak pernah ada.'
        ];
        break;
    }

    this._displayEndingLines(lines, '#ff4444', width, height);
    this._showEndingLabel('BAD ENDING', '#ff4444', width);

    // Tombol lihat bukti terlewat
    const missedBtn = this.add.text(width / 2, height - 80, '🔍 Lihat Bukti yang Terlewat', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '13px',
      color: '#a78bfa',
      fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    missedBtn.on('pointerdown', () => {
      missedBtn.destroy();
      this._showEvidenceChecklist(width, height);
    });

    this._showEndButtons(width, height);
  }

  // ===============================
  // HELPER: Tampilkan baris ending satu per satu
  // ===============================
  _displayEndingLines(lines, color, width, height) {
    const startY = 100;
    lines.forEach((line, index) => {
      const text = this.add.text(width / 2, startY + (index * 30), line, {
        fontFamily: 'Inter, sans-serif',
        fontSize: '15px',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: width - 80 }
      }).setOrigin(0.5).setAlpha(0);

      // Fade in berurutan
      this.tweens.add({
        targets: text,
        alpha: 1,
        duration: 600,
        delay: index * 800,
        ease: 'Power2'
      });
    });
  }

  // ===============================
  // HELPER: Label ending type
  // ===============================
  _showEndingLabel(label, color, width) {
    this.add.text(width / 2, 60, label, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '24px',
      color: color,
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }

  // ===============================
  // FUNGSI: _showEvidenceChecklist()
  // DESKRIPSI: Tampilkan evidence checklist dari EvidenceManager.
  // ===============================
  _showEvidenceChecklist(width, height) {
    const checklist = evidenceManager.getEvidenceChecklist();
    const { collected, total } = evidenceManager.getCollectedCount();

    const startY = height - 220;

    this.add.text(width / 2, startY, `📋 EVIDENCE CHECKLIST (${collected}/${total})`, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '12px',
      color: '#fbbf24',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    checklist.forEach((item, i) => {
      const icon = item.found ? '✅' : '❌';
      const suffix = item.found ? '' : ' — belum ditemukan';
      const color = item.found ? '#00cc44' : '#666666';

      this.add.text(50, startY + 22 + (i * 18), `${icon} ${item.name}${suffix}`, {
        fontFamily: 'Inter, sans-serif',
        fontSize: '11px',
        color: color
      });
    });
  }

  // ===============================
  // FUNGSI: _showFallacySummary()
  // DESKRIPSI: Tampilkan fallacy counter summary.
  // ===============================
  _showFallacySummary(width, height) {
    const fallacyLog = gameState.get('fallacyLog');
    const fallacyCounter = gameState.get('fallacyCounter');

    if (fallacyCounter === 0) return;

    // Hitung fallacy paling sering
    const freq = {};
    for (const f of fallacyLog) {
      freq[f] = (freq[f] || 0) + 1;
    }
    const mostCommon = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];

    const summaryText = `Sepanjang game, kamu terjebak fallacy sebanyak ${fallacyCounter} kali.` +
      (mostCommon ? ` Yang paling sering: ${mostCommon[0]}. Pelajari lagi ya!` : '');

    this.add.text(width / 2, height - 110, summaryText, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '11px',
      color: '#cccccc',
      fontStyle: 'italic',
      align: 'center',
      wordWrap: { width: width - 60 }
    }).setOrigin(0.5);
  }

  // ===============================
  // HELPER: Tombol akhir
  // ===============================
  _showEndButtons(width, height) {
    // Mulai Lagi
    const restartBtn = this.add.text(width / 2 - 80, height - 30, '🔄 Mulai dari awal', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '13px',
      color: '#fbbf24',
      fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    restartBtn.on('pointerdown', () => {
      gameState.reset();
      this.scene.stop('UIScene');
      this.scene.start('BootScene');
    });

    // Kembali ke menu (jika ada)
    const menuBtn = this.add.text(width / 2 + 80, height - 30, '🏠 Menu Utama', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '13px',
      color: '#888888'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    menuBtn.on('pointerdown', () => {
      gameState.reset();
      this.scene.stop('UIScene');
      this.scene.start('BootScene');
    });
  }

  shutdown() {
    this.tweens.killAll();
  }
}
