// ===============================
// FILE: js/scenes/BootScene.js
// DESKRIPSI: Scene pertama yang dijalankan.
// Memuat semua aset dan data JSON.
// Setelah selesai, lanjut ke TitleCardScene.
// ===============================
import gameState from '../managers/GameState.js';
import evidenceManager from '../managers/EvidenceManager.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  // ===============================
  // FUNGSI: preload()
  // DESKRIPSI: Memuat semua data JSON dan aset.
  // Aset visual akan ditambahkan nanti (skeleton mode).
  // ===============================
  preload() {
    // --- Loading bar sederhana ---
    const { width, height } = this.cameras.main;
    const barWidth = 320;
    const barHeight = 20;
    const barX = (width - barWidth) / 2;
    const barY = height / 2;

    const progressBox = this.add.rectangle(width / 2, barY, barWidth + 4, barHeight + 4, 0x333333);
    const progressBar = this.add.rectangle(barX + 2, barY, 0, barHeight, 0xfbbf24).setOrigin(0, 0.5);

    const loadingText = this.add.text(width / 2, barY - 30, 'Memuat...', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.load.on('progress', (value) => {
      progressBar.width = barWidth * value;
    });

    this.load.on('complete', () => {
      progressBox.destroy();
      progressBar.destroy();
      loadingText.destroy();
    });

    // --- Muat data JSON harian ---
    for (let i = 1; i <= 7; i++) {
      this.load.json(`day${i}`, `js/data/day${i}.json`);
    }

    // --- Muat evidence database ---
    this.load.json('evidence_data', 'js/data/evidence_data.json');

    // --- Placeholder: Aset visual akan dimuat di sini nanti ---
    // this.load.image('bg_magang_fh', 'assets/backgrounds/bg_magang_fh.png');
    // dst.
  }

  // ===============================
  // FUNGSI: create()
  // DESKRIPSI: Setelah semua data dimuat, inisialisasi
  // EvidenceManager dan validasi data, lalu lanjut.
  // ===============================
  create() {
    // Muat evidence database ke EvidenceManager
    const evidenceData = this.cache.json.get('evidence_data');
    evidenceManager.load(evidenceData);

    // Validasi setiap day JSON terhadap evidence database
    for (let i = 1; i <= 7; i++) {
      const dayData = this.cache.json.get(`day${i}`);
      if (dayData) {
        evidenceManager.validateDayData(dayData);
      }
    }

    console.log('[BootScene] Semua data dimuat dan divalidasi.');

    // Launch UIScene secara paralel (berjalan di atas semua scene)
    this.scene.launch('UIScene');

    // Lanjut ke TitleCardScene hari pertama
    this.scene.start('TitleCardScene');
  }
}
