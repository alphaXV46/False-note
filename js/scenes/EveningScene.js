// ===============================
// FILE: js/scenes/EveningScene.js
// DESKRIPSI: Template scene untuk periode SORE.
// Menampilkan dialog + debat fallacy + tombol SANGGAH!
// State diubah lewat gameState, bukan lokal.
// ===============================
import gameState from '../managers/GameState.js';
import FallacyManager from '../managers/FallacyManager.js';
import evidenceManager from '../managers/EvidenceManager.js';
import { typewriterText } from '../utils/typewriter.js';

export default class EveningScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EveningScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    const currentDay = gameState.get('currentDay');
    const dayData = this.cache.json.get(`day${currentDay}`);

    if (!dayData || !dayData.evening) {
      console.error(`[EveningScene] Data sore hari ke-${currentDay} tidak ditemukan.`);
      this.scene.start('ResultScene');
      return;
    }

    const evening = dayData.evening;
    gameState.set('currentPeriod', 'evening');

    // Background placeholder
    this.cameras.main.setBackgroundColor('#0f0f23');
    this.add.rectangle(480, 270, 960, 540, 0x1a1a2e); // warna per lokasi

    // Sprite placeholders
    this.add.rectangle(200, 350, 128, 256, 0x0000ff); // Raka idle (biru)
    this.add.rectangle(760, 350, 128, 256, 0xff0000); // Dr. Adrian (merah)

    // ===============================
    // HEADLINE SORE (flash singkat)
    // ===============================
    this._showEveningHeadline(dayData, () => {
      this._startEveningContent(evening, dayData);
    });
  }

  // ===============================
  // FUNGSI: _showEveningHeadline()
  // DESKRIPSI: Flash headline sore selama 1.5 detik.
  // PARAMETER: dayData (object), onComplete (function)
  // ===============================
  _showEveningHeadline(dayData, onComplete) {
    const { width, height } = this.cameras.main;

    const headlineLabel = this.add.text(width / 2, height / 2 - 20, '📰 BERITA SORE', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '12px',
      color: '#f97316',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const headlineText = this.add.text(width / 2, height / 2 + 10, `"${dayData.headlineEvening}"`, {
      fontFamily: 'Georgia, serif',
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'italic',
      align: 'center',
      wordWrap: { width: width - 100 }
    }).setOrigin(0.5);

    this.time.delayedCall(1500, () => {
      headlineLabel.destroy();
      headlineText.destroy();
      onComplete();
    });
  }

  // ===============================
  // FUNGSI: _startEveningContent()
  // DESKRIPSI: Mulai dialog sore lalu debat.
  // ===============================
  _startEveningContent(evening, dayData) {
    const { width, height } = this.cameras.main;

    // Label periode
    this.add.text(width / 2, 110, '🌙 SORE', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      color: '#f97316',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Dialog system
    this._dialogQueue = [];
    this._buildDialogQueue(evening.dialog);

    this.dialogBox = this.add.rectangle(width / 2, height - 80, width - 40, 120, 0x000000, 0.85)
      .setStrokeStyle(1, 0x444444);

    this.speakerText = this.add.text(30, height - 135, '', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      color: '#f97316',
      fontStyle: 'bold'
    });

    this.continueHint = this.add.text(width - 30, height - 30, '▶ Klik untuk lanjut', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '11px',
      color: '#888888'
    }).setOrigin(1, 1);
    this.continueHint.setVisible(false);

    this._currentDialogIndex = 0;
    this._isTyping = false;
    this._currentTypewriter = null;
    this._showNextDialog();

    this.input.on('pointerdown', () => {
      if (!this._isTyping) {
        this._advanceDialog(evening, dayData);
      }
    });
  }

  _buildDialogQueue(dialogArray) {
    this._dialogQueue = [];
    for (const entry of dialogArray) {
      for (const line of entry.text) {
        this._dialogQueue.push({ speaker: entry.speaker, text: line });
      }
    }
  }

  _showNextDialog() {
    if (this._currentDialogIndex >= this._dialogQueue.length) return;
    const entry = this._dialogQueue[this._currentDialogIndex];
    this.speakerText.setText(entry.speaker);
    
    if (this._currentTypewriter && this._currentTypewriter.textObj) {
      this._currentTypewriter.textObj.destroy();
    }

    this.continueHint.setVisible(false);
    this._isTyping = true;

    this._currentTypewriter = typewriterText(
      this,
      30,
      this.cameras.main.height - 110,
      entry.text,
      30,
      {},
      () => {
        this._isTyping = false;
        this.continueHint.setVisible(true);
      }
    );
  }

  _advanceDialog(evening, dayData) {
    this._currentDialogIndex++;
    if (this._currentDialogIndex < this._dialogQueue.length) {
      this._showNextDialog();
    } else {
      this.input.removeAllListeners('pointerdown');

      if (evening.debate) {
        this._startDebate(evening.debate);
      } else if (evening.climaxChoice) {
        this._showClimaxChoice(evening.climaxChoice);
      } else {
        this._checkGameOverAndProceed();
      }
    }
  }

  // ===============================
  // FUNGSI: _startDebate()
  // DESKRIPSI: Mulai debat fallacy. Tampilkan pernyataan
  // lawan dan tombol SANGGAH!
  // PARAMETER: debateConfig (object)
  // ===============================
  _startDebate(debateConfig) {
    const { width, height } = this.cameras.main;
    this._fallacyManager = new FallacyManager(debateConfig);

    // Bersihkan dialog box
    this.dialogBox.setVisible(false);
    this.speakerText.setVisible(false);
    if (this._currentTypewriter && this._currentTypewriter.textObj) {
      this._currentTypewriter.textObj.destroy();
    }
    this.continueHint.setVisible(false);

    // Label debat
    this.add.text(width / 2, 130, `⚔️ DEBAT vs ${debateConfig.opponent}`, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      color: '#ef4444',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Pernyataan lawan
    const statements = this._fallacyManager.getStatements();
    let yPos = 160;
    for (const stmt of statements) {
      this.add.text(width / 2, yPos, `"${stmt.text}"`, {
        fontFamily: 'Georgia, serif',
        fontSize: '14px',
        color: '#fca5a5',
        fontStyle: 'italic',
        align: 'center',
        wordWrap: { width: width - 80 }
      }).setOrigin(0.5);
      yPos += 40;
    }

    // Fallacy hint
    this.add.text(width / 2, yPos + 10, `Fallacy: ${debateConfig.fallacyType}`, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '12px',
      color: '#fbbf24'
    }).setOrigin(0.5);

    // ===============================
    // TOMBOL SANGGAH!
    // ===============================
    const sanggahBtn = this.add.rectangle(width / 2, yPos + 60, 200, 50, 0xdc2626)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0xff6666);

    this.add.text(width / 2, yPos + 60, '⚡ SANGGAH!', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    sanggahBtn.on('pointerdown', () => {
      this._showEvidenceSelector(debateConfig);
    });
  }

  // ===============================
  // FUNGSI: _showEvidenceSelector()
  // DESKRIPSI: Tampilkan pilihan bukti dari inventory.
  // PARAMETER: debateConfig (object)
  // ===============================
  _showEvidenceSelector(debateConfig) {
    const { width, height } = this.cameras.main;
    const inventory = gameState.get('inventory');

    if (inventory.length === 0) {
      // Tidak punya bukti — auto-gagal
      const result = this._fallacyManager.handleSanggah('__no_evidence__');
      this._showDebateFeedback(result);
      return;
    }

    // Overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);

    this.add.text(width / 2, height / 2 - 100, 'Pilih bukti untuk sanggahan:', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    inventory.forEach((evidenceId, index) => {
      const evidence = evidenceManager.getEvidence(evidenceId);
      const btnY = height / 2 - 50 + (index * 55);
      const btn = this.add.rectangle(width / 2, btnY, width - 120, 42, 0x1e293b)
        .setInteractive({ useHandCursor: true })
        .setStrokeStyle(1, 0x555555);

      const displayName = evidence ? evidence.name : evidenceId;
      this.add.text(width / 2, btnY, `📄 ${displayName}`, {
        fontFamily: 'Inter, sans-serif',
        fontSize: '13px',
        color: '#ffffff'
      }).setOrigin(0.5);

      btn.on('pointerover', () => btn.setStrokeStyle(2, 0xfbbf24));
      btn.on('pointerout', () => btn.setStrokeStyle(1, 0x555555));

      btn.on('pointerdown', () => {
        const result = this._fallacyManager.handleSanggah(evidenceId);
        this._showDebateFeedback(result);
      });
    });
  }

  // ===============================
  // FUNGSI: _showDebateFeedback()
  // DESKRIPSI: Tampilkan hasil debat.
  // PARAMETER: result (object) — { success, feedback }
  // ===============================
  _showDebateFeedback(result) {
    const { width, height } = this.cameras.main;
    const color = result.success ? '#00cc44' : '#ff4444';
    const icon = result.success ? '✅' : '❌';

    // Clear scene dan tampilkan feedback
    this.children.removeAll();
    this.cameras.main.setBackgroundColor('#0f0f23');

    this.add.text(width / 2, height / 2 - 30, `${icon} ${result.feedback}`, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '16px',
      color: color,
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: width - 80 }
    }).setOrigin(0.5);

    const continueBtn = this.add.text(width / 2, height / 2 + 30, '▶ Lihat hasil hari ini', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      color: '#fbbf24',
      fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    continueBtn.on('pointerdown', () => {
      this._checkGameOverAndProceed();
    });
  }

  // ===============================
  // FUNGSI: _showClimaxChoice()
  // DESKRIPSI: Tampilkan pilihan klimaks di hari ke-7.
  // PARAMETER: climaxConfig (object)
  // ===============================
  _showClimaxChoice(climaxConfig) {
    const { width, height } = this.cameras.main;

    this.dialogBox.setVisible(false);
    this.speakerText.setVisible(false);
    if (this._currentTypewriter && this._currentTypewriter.textObj) {
      this._currentTypewriter.textObj.destroy();
    }
    this.continueHint.setVisible(false);

    this.add.text(width / 2, 160, climaxConfig.question, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: width - 80 }
    }).setOrigin(0.5);

    climaxConfig.options.forEach((opt, index) => {
      const btnY = 240 + (index * 70);
      const btnColor = opt.isCorrect ? 0x166534 : 0x7f1d1d;
      const btn = this.add.rectangle(width / 2, btnY, width - 100, 50, btnColor)
        .setInteractive({ useHandCursor: true })
        .setStrokeStyle(1, 0x555555);

      this.add.text(width / 2, btnY, opt.text, {
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      btn.on('pointerdown', () => {
        if (!opt.isCorrect) {
          gameState.modify('integrity', -30);
        }

        this.children.removeAll();
        this.cameras.main.setBackgroundColor('#0f0f23');
        const feedback = opt.isCorrect ? opt.feedbackRight : opt.feedbackWrong;
        const color = opt.isCorrect ? '#00cc44' : '#ff4444';

        this.add.text(width / 2, height / 2 - 20, feedback, {
          fontFamily: 'Inter, sans-serif',
          fontSize: '16px',
          color: color,
          fontStyle: 'bold',
          align: 'center',
          wordWrap: { width: width - 80 }
        }).setOrigin(0.5);

        const cont = this.add.text(width / 2, height / 2 + 30, '▶ Lihat hasil akhir', {
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          color: '#fbbf24',
          fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        cont.on('pointerdown', () => {
          this._checkGameOverAndProceed();
        });
      });
    });
  }

  // ===============================
  // FUNGSI: _checkGameOverAndProceed()
  // DESKRIPSI: Cek kondisi game over, lalu lanjut ke ResultScene.
  // Selalu baca langsung dari gameState.
  // ===============================
  _checkGameOverAndProceed() {
    if (gameState.get('integrity') <= 0) {
      this.scene.start('EndingScene', { type: 'bad', reason: 'integrity' });
      return;
    }
    if (gameState.get('suspicion') >= 100) {
      this.scene.start('EndingScene', { type: 'bad', reason: 'suspicion' });
      return;
    }
    if (gameState.get('reputation') <= 0) {
      this.scene.start('EndingScene', { type: 'bad', reason: 'reputation' });
      return;
    }

    this.scene.start('ResultScene');
  }

  shutdown() {
    this.input.removeAllListeners('pointerdown');
  }
}
