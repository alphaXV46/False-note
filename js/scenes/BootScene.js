class BootScene extends BaseScene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Minimal texture untuk loading
        const graphics = this.add.graphics();
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(0, 0, 1, 1);
        graphics.generateTexture('white_pixel', 1, 1);
    }

    create() {
        console.log('BootScene: Sistem dasar diinisialisasi.');
        this.scene.start('PreloadScene');
    }
}
