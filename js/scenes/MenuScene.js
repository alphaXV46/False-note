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
    const { width, height } = this.cameras.main;

    // Background: bg_black (rectangle hitam dulu, ganti aset nanti)
    this.cameras.main.setBackgroundColor('#000000');

    // Teks judul: "FALSE NOTE" — font besar, putih, center
    this.add.text(width / 2, height / 2 - 80, 'FALSE NOTE', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '64px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Subjudul: "The Silent Witness" — lebih kecil, abu-abu
    this.add.text(width / 2, height / 2 - 20, 'The Silent Witness', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '24px',
      color: '#888888',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // Tombol "Mulai dari awal."
    const startBtn = this.add.text(width / 2, height / 2 + 60, 'Mulai dari awal.', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    startBtn.on('pointerover', () => startBtn.setColor('#fbbf24'));
    startBtn.on('pointerout', () => startBtn.setColor('#ffffff'));
    startBtn.on('pointerdown', () => {
      // klik → reset GameState → start BootScene
      gameState.reset();
      this.scene.start('BootScene');
    });

    // Tombol "Lanjutkan perjuangan?"
    const continueBtn = this.add.text(width / 2, height / 2 + 100, 'Lanjutkan perjuangan?', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    continueBtn.on('pointerover', () => continueBtn.setColor('#fbbf24'));
    continueBtn.on('pointerout', () => continueBtn.setColor('#ffffff'));
    continueBtn.on('pointerdown', () => {
      // klik → SaveLoadManager.load() 
      const success = saveLoadManager.load();
      if (success) {
        // jika berhasil start BootScene
        this.scene.start('BootScene');
      } else {
        // jika gagal tampilkan "Save tidak ditemukan."
        const errorMsg = this.add.text(width / 2, height / 2 + 140, 'Save tidak ditemukan.', {
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          color: '#ef4444',
          fontStyle: 'italic'
        }).setOrigin(0.5);
        
        this.time.delayedCall(2000, () => {
            errorMsg.destroy();
        });
      }
    });
  }
}
