/**
 * False Note - Game Entry Point
 * Part 1: Basic Structure & Configuration
 */

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#0a0f1e', // dark theme
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
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};

// Initialize the game
const game = new Phaser.Game(config);

// Log initialization
console.log('False Note Game Started');
