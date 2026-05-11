// ===============================
// FILE: js/main.js
// DESKRIPSI: Entry point utama game FALSE NOTE.
// Mengonfigurasi Phaser 3 dan mendaftarkan semua scene.
// ===============================

import MenuScene from './scenes/MenuScene.js';
import BootScene from './scenes/BootScene.js';
import UIScene from './scenes/UIScene.js';
import TitleCardScene from './scenes/TitleCardScene.js';
import MorningScene from './scenes/MorningScene.js';
import AfternoonScene from './scenes/AfternoonScene.js';
import EveningScene from './scenes/EveningScene.js';
import ResultScene from './scenes/ResultScene.js';
import EndingScene from './scenes/EndingScene.js';

// ===============================
// KONFIGURASI PHASER
// ===============================
const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 960,
  height: 540,
  backgroundColor: '#000000',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [
    MenuScene,
    BootScene,
    UIScene,
    TitleCardScene,
    MorningScene,
    AfternoonScene,
    EveningScene,
    ResultScene,
    EndingScene,
  ],
};

// ===============================
// INISIALISASI GAME
// ===============================
const game = new Phaser.Game(config);

console.log('[FALSE NOTE] Game initialized. v1.0.0');
