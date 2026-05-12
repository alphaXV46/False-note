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
    // FASE 1: Title Card (5 detik - diperlama)
    // ===============================
    const titleText = this.add.text(width / 2, height / 2, dayData.titleCard, {
      fontFamily: 'Crimson Text, serif',
      fontSize: '42px',
      color: '#ffffff',
      fontStyle: '600',
      align: 'center',
      wordWrap: { width: width - 80 }
    }).setOrigin(0.5).setAlpha(0).setScale(0.95);

    // Fade in + subtle scale title
    this.tweens.add({
      targets: titleText,
      alpha: 1,
      scale: 1,
      duration: 1500,
      ease: 'Cubic.easeOut'
    });

    // Setelah 5 detik, ganti ke headline
    this.time.delayedCall(5000, () => {
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
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        previousText.destroy();

        // Label koran
        const headerLabel = this.add.text(width / 2, height / 2 - 60, '📰 BERITA PAGI', {
          fontFamily: 'Inter, sans-serif',
          fontSize: '16px',
          color: '#fbbf24',
          fontStyle: 'bold',
          letterSpacing: 4
        }).setOrigin(0.5).setAlpha(0);

        // Headline text
        const headlineText = this.add.text(width / 2, height / 2, `"${dayData.headlineMorning}"`, {
          fontFamily: 'Crimson Text, serif',
          fontSize: '28px',
          color: '#ffffff',
          fontStyle: 'italic',
          align: 'center',
          wordWrap: { width: width - 120 }
        }).setOrigin(0.5).setAlpha(0).setScale(1.05);

        // Fade in headline + subtle scale down
        this.tweens.add({
          targets: [headerLabel, headlineText],
          alpha: 1,
          duration: 1000,
          ease: 'Power2'
        });
        
        this.tweens.add({
            targets: headlineText,
            scale: 1,
            duration: 5000,
            ease: 'Linear'
        });

        // Setelah 5 detik, tampilkan placeholder baru lanjut ke MorningScene
        this.time.delayedCall(5000, () => {
          if (window.showPlaceholder) {
            window.showPlaceholder(() => {
              this.scene.start('MorningScene');
            });
          } else {
            this.scene.start('MorningScene');
          }
        });
      }
    });
  }

  shutdown() {
    // Cleanup tweens
    this.tweens.killAll();
  }
}
