// ===============================
// FILE: js/scenes/TitleCardScene.js
// DESKRIPSI: Menampilkan title card + headline harian.
// Layar hitam, teks putih besar, 3 detik per layar.
// Setelah selesai, lanjut ke MorningScene.
// ===============================
import gameState from '../managers/GameState.js';

export default class TitleCardScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleCardScene' });
  }

  // ===============================
  // FUNGSI: create()
  // DESKRIPSI: Tampilkan title card lalu headline secara berurutan.
  // ===============================
  create() {
    const { width, height } = this.cameras.main;
    const currentDay = gameState.get('currentDay');
    const dayData = this.cache.json.get(`day${currentDay}`);

    if (!dayData) {
      console.error(`[TitleCardScene] Data hari ke-${currentDay} tidak ditemukan.`);
      this.scene.start('MorningScene');
      return;
    }

    // Background hitam
    this.cameras.main.setBackgroundColor('#000000');

    // ===============================
    // FASE 1: Title Card (3 detik)
    // ===============================
    const titleText = this.add.text(width / 2, height / 2, dayData.titleCard, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: width - 80 }
    }).setOrigin(0.5).setAlpha(0);

    // Fade in title
    this.tweens.add({
      targets: titleText,
      alpha: 1,
      duration: 500,
      ease: 'Power2'
    });

    // Setelah 3 detik, ganti ke headline
    this.time.delayedCall(3000, () => {
      this._showHeadline(dayData, titleText);
    });
  }

  // ===============================
  // FUNGSI: _showHeadline()
  // DESKRIPSI: Tampilkan headline berita pagi setelah title card.
  // PARAMETER: dayData (object), previousText (Phaser.Text)
  // ===============================
  _showHeadline(dayData, previousText) {
    const { width, height } = this.cameras.main;

    // Fade out title
    this.tweens.add({
      targets: previousText,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        previousText.destroy();

        // Label koran
        const headerLabel = this.add.text(width / 2, height / 2 - 40, '📰 BERITA PAGI', {
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          color: '#fbbf24',
          fontStyle: 'bold'
        }).setOrigin(0.5).setAlpha(0);

        // Headline text
        const headlineText = this.add.text(width / 2, height / 2, `"${dayData.headlineMorning}"`, {
          fontFamily: 'Georgia, serif',
          fontSize: '22px',
          color: '#ffffff',
          fontStyle: 'italic',
          align: 'center',
          wordWrap: { width: width - 100 }
        }).setOrigin(0.5).setAlpha(0);

        // Fade in headline
        this.tweens.add({
          targets: [headerLabel, headlineText],
          alpha: 1,
          duration: 500,
          ease: 'Power2'
        });

        // Setelah 3 detik, lanjut ke MorningScene
        this.time.delayedCall(3000, () => {
          this.scene.start('MorningScene');
        });
      }
    });
  }

  shutdown() {
    // Cleanup tweens
    this.tweens.killAll();
  }
}
