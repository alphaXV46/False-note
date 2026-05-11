// ===============================
// FILE: js/scenes/AfternoonScene.js
// DESKRIPSI: Template scene untuk periode SIANG.
// Menampilkan dialog + mini-game false note compare.
// Data diambil dari dayX.json berdasarkan currentDay.
// State diubah lewat gameState, bukan lokal.
// ===============================
import gameState from '../managers/GameState.js';
import MiniGameManager from '../managers/MiniGameManager.js';

export default class AfternoonScene extends Phaser.Scene {
  constructor() {
    super({ key: 'AfternoonScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    const currentDay = gameState.get('currentDay');
    const dayData = this.cache.json.get(`day${currentDay}`);

    if (!dayData || !dayData.afternoon) {
      console.error(`[AfternoonScene] Data siang hari ke-${currentDay} tidak ditemukan.`);
      this.scene.start('EveningScene');
      return;
    }

    const afternoon = dayData.afternoon;
    gameState.set('currentPeriod', 'afternoon');

    // Background placeholder (warna solid)
    this.cameras.main.setBackgroundColor('#16213e');

    // Label periode
    this.add.text(width / 2, 110, '🌤️ SIANG', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      color: '#38bdf8',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // ===============================
    // DIALOG SYSTEM (sama seperti MorningScene)
    // ===============================
    this._dialogQueue = [];
    this._buildDialogQueue(afternoon.dialog);

    this.dialogBox = this.add.rectangle(width / 2, height - 80, width - 40, 120, 0x000000, 0.85)
      .setStrokeStyle(1, 0x444444);

    this.speakerText = this.add.text(30, height - 135, '', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      color: '#38bdf8',
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

    this._currentDialogIndex = 0;
    this._showNextDialog();

    this.input.on('pointerdown', () => {
      this._advanceDialog(afternoon);
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
    this.dialogText.setText(entry.text);
  }

  _advanceDialog(afternoonData) {
    this._currentDialogIndex++;
    if (this._currentDialogIndex < this._dialogQueue.length) {
      this._showNextDialog();
    } else {
      this.input.removeAllListeners('pointerdown');
      this._startMiniGame(afternoonData);
    }
  }

  // ===============================
  // FUNGSI: _startMiniGame()
  // DESKRIPSI: Tampilkan mini-game false note compare.
  // PARAMETER: afternoonData (object)
  // ===============================
  _startMiniGame(afternoonData) {
    const { width, height } = this.cameras.main;
    const miniGameConfig = afternoonData.miniGame;

    if (!miniGameConfig) {
      this.scene.start('EveningScene');
      return;
    }

    // Bersihkan dialog
    this.dialogBox.setVisible(false);
    this.speakerText.setVisible(false);
    this.dialogText.setVisible(false);
    this.continueHint.setVisible(false);

    const mgm = new MiniGameManager({
      ...miniGameConfig,
      integrityCostIfWrong: afternoonData.integrityCostIfWrong || 10,
      suspicionGain: afternoonData.suspicionGain || 5
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

    this.add.text(width / 2, 165, '📄 DOKUMEN COMPARE', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '11px',
      color: '#888888'
    }).setOrigin(0.5);

    // Options
    miniGameConfig.options.forEach((opt, index) => {
      const btnY = 220 + (index * 70);
      const btn = this.add.rectangle(width / 2, btnY, width - 100, 50, 0x1e293b)
        .setInteractive({ useHandCursor: true })
        .setStrokeStyle(1, 0x555555);

      this.add.text(width / 2, btnY, opt.text, {
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: width - 140 }
      }).setOrigin(0.5);

      btn.on('pointerover', () => btn.setStrokeStyle(2, 0x38bdf8));
      btn.on('pointerout', () => btn.setStrokeStyle(1, 0x555555));

      btn.on('pointerdown', () => {
        const result = mgm.checkAnswer(index);
        if (result) this._showMiniGameFeedback(result);
      });
    });
  }

  _showMiniGameFeedback(result) {
    const { width, height } = this.cameras.main;
    const feedbackColor = result.correct ? '#00cc44' : '#ff4444';
    const feedbackIcon = result.correct ? '✅' : '❌';

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);

    this.add.text(width / 2, height / 2 - 20, `${feedbackIcon} ${result.feedback}`, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '16px',
      color: feedbackColor,
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: width - 80 }
    }).setOrigin(0.5);

    const continueBtn = this.add.text(width / 2, height / 2 + 40, '▶ Lanjut ke Sore', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      color: '#f97316',
      fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    continueBtn.on('pointerdown', () => {
      this.scene.start('EveningScene');
    });
  }

  shutdown() {
    this.input.removeAllListeners('pointerdown');
  }
}
