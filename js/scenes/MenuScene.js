// ===============================
// FILE: js/scenes/MenuScene.js
// DESKRIPSI: Menu utama game
// ===============================
import gameState from '../managers/GameState.js';
import saveLoadManager from '../managers/SaveLoadManager.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    // Referensi elemen DOM
    const menuOverlay = document.getElementById('main-menu');
    const btnStart = document.getElementById('btn-start');
    const btnContinue = document.getElementById('btn-continue');
    const saveError = document.getElementById('save-error');

    // Tampilkan menu DOM
    if (menuOverlay) {
      menuOverlay.classList.remove('hidden');
    }

    // --- Listener: MULAI BARU ---
    if (btnStart) {
      btnStart.onclick = () => {
        gameState.reset();
        this._transitionOut();
      };
    }

    // --- Listener: LANJUTKAN ---
    if (btnContinue) {
      btnContinue.onclick = () => {
        const success = saveLoadManager.load();
        if (success) {
          this._transitionOut();
        } else {
          if (saveError) {
            saveError.classList.remove('hidden');
            setTimeout(() => saveError.classList.add('hidden'), 2000);
          }
        }
      };
    }

    // Pastikan canvas tetap hitam di belakang DOM
    this.cameras.main.setBackgroundColor('#000000');
  }

  /**
   * Sembunyikan menu DOM dan pindah ke BootScene
   */
  _transitionOut() {
    const menuOverlay = document.getElementById('main-menu');
    if (menuOverlay) {
      menuOverlay.classList.add('hidden');
    }
    this.scene.start('BootScene');
  }
}
