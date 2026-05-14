class BootScene extends BaseScene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Load minimal placeholder assets
        const graphics = this.add.graphics();
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(0, 0, 1, 1);
        graphics.generateTexture('white_pixel', 1, 1);
        
        // Placeholder for loading bar text
        this.add.text(640, 360, 'Initializing...', { fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);
    }

    create() {
        console.log('BootScene: Core systems initialized');
        this.scene.start('PreloadScene');
    }
}
