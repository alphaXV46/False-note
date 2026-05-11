// ===============================
// FILE: js/scenes/MorningScene.js
// DESKRIPSI: Template scene untuk periode PAGI.
// Menampilkan dialog + mini-game email sorting.
// Data diambil dari dayX.json berdasarkan currentDay.
// State diubah lewat gameState, bukan lokal.
// ===============================
import gameState from '../managers/GameState.js';
import MiniGameManager from '../managers/MiniGameManager.js';

export default class MorningScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MorningScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    const currentDay = gameState.get('currentDay');
    const dayData = this.cache.json.get(`day${currentDay}`);

    if (!dayData || !dayData.morning) {
      console.error(`[MorningScene] Data pagi hari ke-${currentDay} tidak ditemukan.`);
      this.scene.start('AfternoonScene');
      return;
    }

    const morning = dayData.morning;
    gameState.set('currentPeriod', 'morning');

    // Background placeholder (warna solid)
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Label periode
    this.add.text(width / 2, 110, '☀️ PAGI', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      color: '#fbbf24',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // ===============================
    // DIALOG SYSTEM
    // ===============================
    this._dialogQueue = [];
    this._buildDialogQueue(morning.dialog);

    // Dialog box area
    this.dialogBox = this.add.rectangle(width / 2, height - 80, width - 40, 120, 0x000000, 0.85)
      .setStrokeStyle(1, 0x444444);

    this.speakerText = this.add.text(30, height - 135, '', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      color: '#fbbf24',
      fontStyle: 'bold'
    });

    this.dialogText = this.add.text(30, height - 110, '', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      color: '#ffffff',
      wordWrap: { width: width - 80 },
      lineSpacing: 6
    });

    this.continueHint = this.add.text(width - 30, height - 30, '▶ Klik untuk lanjut', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '11px',
      color: '#888888'
    }).setOrigin(1, 1);

    // Start dialog
    this._currentDialogIndex = 0;
    this._showNextDialog();

    // Click to advance dialog
    this.input.on('pointerdown', () => {
      this._advanceDialog(morning);
    });
  }

  // ===============================
  // FUNGSI: _buildDialogQueue()
  // DESKRIPSI: Flatten dialog entries menjadi antrian sederhana.
  // PARAMETER: dialogArray (array)
  // ===============================
  _buildDialogQueue(dialogArray) {
    this._dialogQueue = [];
    for (const entry of dialogArray) {
      for (const line of entry.text) {
        this._dialogQueue.push({
          speaker: entry.speaker,
          text: line
        });
      }
    }
  }

  // ===============================
  // FUNGSI: _showNextDialog()
  // DESKRIPSI: Tampilkan baris dialog berikutnya.
  // ===============================
  _showNextDialog() {
    if (this._currentDialogIndex >= this._dialogQueue.length) {
      return;
    }
    const entry = this._dialogQueue[this._currentDialogIndex];
    this.speakerText.setText(entry.speaker);
    this.dialogText.setText(entry.text);
  }

  // ===============================
  // FUNGSI: _advanceDialog()
  // DESKRIPSI: Maju ke dialog berikutnya atau mulai mini-game.
  // PARAMETER: morningData (object)
  // ===============================
  _advanceDialog(morningData) {
    this._currentDialogIndex++;
    if (this._currentDialogIndex < this._dialogQueue.length) {
      this._showNextDialog();
    } else {
      // Dialog selesai → mulai mini-game
      this.input.removeAllListeners('pointerdown');
      this._startMiniGame(morningData);
    }
  }

  // ===============================
  // FUNGSI: _startMiniGame()
  // DESKRIPSI: Tampilkan mini-game dari data JSON.
  // PARAMETER: morningData (object)
  // ===============================
  _startMiniGame(morningData) {
    const { width, height } = this.cameras.main;
    const miniGameConfig = morningData.miniGame;

    if (!miniGameConfig) {
      this.scene.start('AfternoonScene');
      return;
    }

    // Bersihkan dialog
    this.dialogBox.setVisible(false);
    this.speakerText.setVisible(false);
    this.dialogText.setVisible(false);
    this.continueHint.setVisible(false);

    // Setup MiniGameManager
    const mgm = new MiniGameManager({
      ...miniGameConfig,
      integrityCostIfWrong: morningData.integrityCostIfWrong,
      suspicionGain: morningData.suspicionGain
    });

    // Question
    this.add.text(width / 2, 140, miniGameConfig.question, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: width - 80 }
    }).setOrigin(0.5);

    // Label tipe mini-game
    const typeLabels = {
      'email_sorting': '📧 EMAIL SORTING',
      'false_note_compare': '📄 DOKUMEN COMPARE',
    };
    this.add.text(width / 2, 165, typeLabels[miniGameConfig.type] || miniGameConfig.type, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '11px',
      color: '#888888'
    }).setOrigin(0.5);

    // Options sebagai tombol
    miniGameConfig.options.forEach((opt, index) => {
      const btnY = 220 + (index * 70);
      const btn = this.add.rectangle(width / 2, btnY, width - 100, 50, 0x2a2a3e)
        .setInteractive({ useHandCursor: true })
        .setStrokeStyle(1, 0x555555);

      const btnText = this.add.text(width / 2, btnY, opt.text, {
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: width - 140 }
      }).setOrigin(0.5);

      btn.on('pointerover', () => {
        btn.setStrokeStyle(2, 0xfbbf24);
      });

      btn.on('pointerout', () => {
        btn.setStrokeStyle(1, 0x555555);
      });

      btn.on('pointerdown', () => {
        const result = mgm.checkAnswer(index);
        if (result) {
          this._showMiniGameFeedback(result);
        }
      });
    });
  }

  // ===============================
  // FUNGSI: _showMiniGameFeedback()
  // DESKRIPSI: Tampilkan feedback setelah mini-game dijawab.
  // PARAMETER: result (object) — { correct, feedback }
  // ===============================
  _showMiniGameFeedback(result) {
    const { width, height } = this.cameras.main;

    const feedbackColor = result.correct ? '#00cc44' : '#ff4444';
    const feedbackIcon = result.correct ? '✅' : '❌';

    // Overlay feedback
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);

    this.add.text(width / 2, height / 2 - 20, `${feedbackIcon} ${result.feedback}`, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '16px',
      color: feedbackColor,
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: width - 80 }
    }).setOrigin(0.5);

    const continueBtn = this.add.text(width / 2, height / 2 + 40, '▶ Lanjut ke Siang', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      color: '#fbbf24',
      fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    continueBtn.on('pointerdown', () => {
      this.scene.start('AfternoonScene');
    });
  }

  shutdown() {
    this.input.removeAllListeners('pointerdown');
  }
}
