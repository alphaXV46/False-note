// ===============================
// FILE: js/scenes/MorningScene.js
// DESKRIPSI: Template scene untuk periode PAGI.
// Menampilkan dialog + mini-game email sorting.
// Data diambil dari dayX.json berdasarkan currentDay.
// State diubah lewat gameState, bukan lokal.
// ===============================
import gameState from '../managers/GameState.js';
import MiniGameManager from '../managers/MiniGameManager.js';
import { typewriterText } from '../utils/typewriter.js';

export default class MorningScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MorningScene' });
  }

  preload() {
    this.load.image('bg_morning', 'assets/backgrounds/bg_dorm_morning.jpg');
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

    // Background Image
    const bg = this.add.image(width / 2, height / 2, 'bg_morning');
    const scale = Math.max(width / bg.width, height / bg.height);
    bg.setScale(scale);

    // Label periode
    this.add.text(width / 2, 40, '☀️ PAGI', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '18px',
      color: '#fbbf24',
      fontStyle: 'bold',
      shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 4, fill: true }
    }).setOrigin(0.5);

    // ===============================
    // DIALOG SYSTEM
    // ===============================
    this._dialogQueue = [];
    this._buildDialogQueue(morning.dialog);

    // Start dialog
    this._currentDialogIndex = 0;
    this._isTyping = false;
    this._currentTypewriter = null;
    this._showNextDialog();

    // Referensi ke DOM box untuk klik
    const dialogBox = document.getElementById('dialog-box');
    if (dialogBox) {
      this._domClickListener = () => {
        if (!this._isTyping) {
          this._advanceDialog(morning);
        }
      };
      dialogBox.addEventListener('click', this._domClickListener);
    }
  }

  // ===============================
  // FUNGSI: _buildDialogQueue()
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
  // ===============================
  _showNextDialog() {
    if (this._currentDialogIndex >= this._dialogQueue.length) {
      return;
    }
    const entry = this._dialogQueue[this._currentDialogIndex];
    
    if (this._currentTypewriter && this._currentTypewriter.destroy) {
      this._currentTypewriter.destroy();
    }

    this._isTyping = true;
    const continueHint = document.getElementById('dialog-continue');
    if (continueHint) continueHint.classList.add('hidden');

    this._currentTypewriter = typewriterText(
      this,
      entry.speaker,
      entry.text,
      30,
      () => {
        this._isTyping = false;
        if (continueHint) continueHint.classList.remove('hidden');
      }
    );
  }

  // ===============================
  // FUNGSI: _advanceDialog()
  // ===============================
  _advanceDialog(morningData) {
    this._currentDialogIndex++;
    if (this._currentDialogIndex < this._dialogQueue.length) {
      this._showNextDialog();
    } else {
      // Dialog selesai → mulai mini-game
      const dialogBox = document.getElementById('dialog-box');
      if (dialogBox && this._domClickListener) {
        dialogBox.removeEventListener('click', this._domClickListener);
      }
      this._startMiniGame(morningData);
    }
  }

  // ===============================
  // FUNGSI: _startMiniGame()
  // ===============================
  _startMiniGame(morningData) {
    const { width, height } = this.cameras.main;
    const miniGameConfig = morningData.miniGame;

    if (!miniGameConfig) {
      this.scene.start('AfternoonScene');
      return;
    }

    // Bersihkan DOM dialog
    const dialogOverlay = document.getElementById('dialog-overlay');
    if (dialogOverlay) dialogOverlay.classList.add('hidden');
    if (this._currentTypewriter && this._currentTypewriter.destroy) {
      this._currentTypewriter.destroy();
    }

    // Setup MiniGameManager
    const mgm = new MiniGameManager({
      ...miniGameConfig,
      integrityCostIfWrong: morningData.integrityCostIfWrong,
      suspicionGain: morningData.suspicionGain
    });

    // Label Mini-Game
    this.add.rectangle(width / 2, 140, width, 80, 0x0f172a, 0.8);
    this.add.text(width / 2, 125, miniGameConfig.question, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: width - 80 }
    }).setOrigin(0.5);

    const typeLabels = {
      'email_sorting': '📧 EMAIL SORTING',
      'false_note_compare': '📄 DOKUMEN COMPARE',
    };
    this.add.text(width / 2, 155, typeLabels[miniGameConfig.type] || miniGameConfig.type, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '11px',
      color: '#fbbf24'
    }).setOrigin(0.5);

    // Options sebagai tombol
    miniGameConfig.options.forEach((opt, index) => {
      const btnY = 220 + (index * 70);
      const btn = this.add.rectangle(width / 2, btnY, width - 100, 50, 0x1e293b)
        .setInteractive({ useHandCursor: true })
        .setStrokeStyle(1, 0x334155);

      const btnText = this.add.text(width / 2, btnY, opt.text, {
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: width - 140 }
      }).setOrigin(0.5);

      btn.on('pointerover', () => btn.setStrokeStyle(2, 0xfbbf24));
      btn.on('pointerout', () => btn.setStrokeStyle(1, 0x334155));

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
  // ===============================
  _showMiniGameFeedback(result) {
    const { width, height } = this.cameras.main;

    const feedbackColor = result.correct ? '#00cc44' : '#ef4444';
    const feedbackIcon = result.correct ? '✅' : '❌';

    // Overlay feedback
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);

    this.add.text(width / 2, height / 2 - 20, `${feedbackIcon} ${result.feedback}`, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '18px',
      color: feedbackColor,
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: width - 80 }
    }).setOrigin(0.5);

    const continueBtn = this.add.text(width / 2, height / 2 + 50, '▶ LANJUT KE SIANG', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#fbbf24',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    continueBtn.setTint(0x000000); // Teks hitam di atas background amber

    continueBtn.on('pointerdown', () => {
      this.scene.start('AfternoonScene');
    });
  }

  shutdown() {
    const dialogBox = document.getElementById('dialog-box');
    if (dialogBox && this._domClickListener) {
      dialogBox.removeEventListener('click', this._domClickListener);
    }
  }
}
