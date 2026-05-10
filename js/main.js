/**
 * Main Configuration - False Note
 * Inisialisasi Phaser Game dan pendaftaran semua scene.
 */
const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#0a0f1e',
    scene: [
        BootScene,
        PreloadScene,
        MorningScene,
        AfternoonScene,
        EveningScene,
        ResultScene,
        GameOverScene
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// Start Game
const game = new Phaser.Game(config);
