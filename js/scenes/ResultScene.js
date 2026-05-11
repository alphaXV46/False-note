// ===============================
// FILE: js/scenes/ResultScene.js
// DESKRIPSI: Menampilkan ringkasan harian:
// - Skor (integrity, suspicion, bukti)
// - Daily Fallacy Card
// - Tombol save
// - Lanjut ke hari berikutnya atau EndingScene
// ===============================
import gameState from '../managers/GameState.js';
import evidenceManager from '../managers/EvidenceManager.js';
import saveLoadManager from '../managers/SaveLoadManager.js';

export default class ResultScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ResultScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    const currentDay = gameState.get('currentDay');
    const dayData = this.cache.json.get(`day${currentDay}`);
    const integrity = gameState.get('integrity');
    const suspicion = gameState.get('suspicion');
    const inventory = gameState.get('inventory');
    const fallacyCounter = gameState.get('fallacyCounter');

    this.cameras.main.setBackgroundColor('#0a0a0a');

    // ===============================
    // HEADLINE RESULT
    // ===============================
    if (dayData && dayData.headlineEveningResult) {
      this.add.text(width / 2, 20, '📰 HEADLINE MALAM', {
        fontFamily: 'Inter, sans-serif',
        fontSize: '11px',
        color: '#f97316'
      }).setOrigin(0.5);

      this.add.text(width / 2, 40, `"${dayData.headlineEveningResult}"`, {
        fontFamily: 'Georgia, serif',
        fontSize: '14px',
        color: '#ffffff',
        fontStyle: 'italic',
        align: 'center',
        wordWrap: { width: width - 80 }
      }).setOrigin(0.5);
    }

    // ===============================
    // SKOR HARIAN
    // ===============================
    this.add.text(width / 2, 80, `HASIL HARI KE-${currentDay}`, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '20px',
      color: '#fbbf24',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const { collected, total } = evidenceManager.getCollectedCount();

    const scoreLines = [
      `🔥 NYALI: ${Math.round(integrity)}`,
      `👁 ANCAMAN: ${Math.round(suspicion)}`,
      `📦 BUKTI: ${collected}/${total}`,
      `🧠 FALLACY TERJEBAK: ${fallacyCounter}`
    ];

    scoreLines.forEach((line, i) => {
      this.add.text(width / 2, 115 + (i * 25), line, {
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
        color: '#ffffff'
      }).setOrigin(0.5);
    });

    // ===============================
    // DAILY FALLACY CARD
    // ===============================
    this._showFallacyCard(dayData, width, 230);

    // ===============================
    // SAVE / CONTINUE
    // ===============================
    if (currentDay >= 7) {
      // Hari terakhir → resolusi ending
      const continueBtn = this.add.text(width / 2, height - 40, '▶ Lihat ending', {
        fontFamily: 'Inter, sans-serif',
        fontSize: '16px',
        color: '#fbbf24',
        fontStyle: 'bold'
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      continueBtn.on('pointerdown', () => {
        this._resolveEnding(integrity, inventory, fallacyCounter);
      });
    } else {
      // Tombol save
      if (dayData && dayData.checkpoint) {
        const saveBtn = this.add.rectangle(width / 2, height - 80, 300, 40, 0x1e293b)
          .setInteractive({ useHandCursor: true })
          .setStrokeStyle(1, 0x555555);

        this.saveText = this.add.text(width / 2, height - 80, '💾 Simpan di sini? Besok lebih berat.', {
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
          color: '#a78bfa',
          fontStyle: 'bold'
        }).setOrigin(0.5);

        saveBtn.on('pointerdown', () => {
          const success = saveLoadManager.save();
          this.saveText.setText(success ? '✅ Tersimpan!' : '❌ Gagal menyimpan.');
        });
      }

      // Tombol lanjut
      const nextBtn = this.add.text(width / 2, height - 35, '▶ Lanjut ke hari berikutnya', {
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
        color: '#fbbf24',
        fontStyle: 'bold'
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      nextBtn.on('pointerdown', () => {
        gameState.set('currentDay', currentDay + 1);
        this.scene.start('TitleCardScene');
      });
    }
  }

  // ===============================
  // FUNGSI: _showFallacyCard()
  // DESKRIPSI: Tampilkan Daily Fallacy Card edukasi.
  // PARAMETER: dayData (object), width (number), startY (number)
  // ===============================
  _showFallacyCard(dayData, width, startY) {
    if (!dayData || !dayData.evening || !dayData.evening.debate) return;

    const debate = dayData.evening.debate;

    // Card background
    this.add.rectangle(width / 2, startY + 70, width - 60, 140, 0x1a1a2e)
      .setStrokeStyle(1, 0xfbbf24);

    this.add.text(width / 2, startY + 15, '🧠 FALLACY HARI INI', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '12px',
      color: '#fbbf24',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, startY + 38, debate.fallacyType.toUpperCase(), {
      fontFamily: 'Inter, sans-serif',
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, startY + 65, debate.fallacyExplanation, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '11px',
      color: '#cccccc',
      align: 'center',
      wordWrap: { width: width - 100 },
      lineSpacing: 4
    }).setOrigin(0.5);

    this.add.text(width / 2, startY + 110, `💡 ${debate.fallacyCounterTip}`, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '11px',
      color: '#a78bfa',
      fontStyle: 'italic',
      align: 'center',
      wordWrap: { width: width - 100 }
    }).setOrigin(0.5);
  }

  // ===============================
  // FUNGSI: _resolveEnding()
  // DESKRIPSI: Tentukan ending berdasarkan state akhir.
  // PARAMETER: integrity (number), inventory (array), fallacyCounter (number)
  // ===============================
  _resolveEnding(integrity, inventory, fallacyCounter) {
    if (integrity > 70 && inventory.length >= 4 && fallacyCounter < 4) {
      this.scene.start('EndingScene', { type: 'true' });
    } else if (integrity >= 50) {
      this.scene.start('EndingScene', { type: 'neutral' });
    } else {
      this.scene.start('EndingScene', { type: 'bad', reason: 'moral' });
    }
  }

  shutdown() {
    // No listeners to clean
  }
}
