/**
 * Base Scene class for common functionality like transitions
 */
class BaseScene extends Phaser.Scene {
    constructor(key) {
        super(key);
    }

    /**
     * Helper to transition between scenes with a fade effect
     * @param {string} targetScene - Key of the scene to transition to
     * @param {object} data - Optional data to pass to the next scene
     */
    transitionTo(targetScene, data = {}) {
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
            this.scene.start(targetScene, data);
        });
    }

    /**
     * Create a simple placeholder button
     */
    createButton(x, y, text, callback) {
        const btn = this.add.container(x, y);
        
        // TODO: Replace dengan UI button - Sanggah
        const bg = this.add.graphics();
        bg.fillStyle(0x3a4b7c, 1);
        bg.fillRoundedRect(-100, -25, 200, 50, 10);
        bg.lineStyle(2, 0xffffff, 0.8);
        bg.strokeRoundedRect(-100, -25, 200, 50, 10);

        const txt = this.add.text(0, 0, text, {
            fontSize: '20px',
            color: '#ffffff',
            // TODO: Replace dengan font custom
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        btn.add([bg, txt]);
        
        // Interactive
        bg.setInteractive(new Phaser.Geom.Rectangle(-100, -25, 200, 50), Phaser.Geom.Rectangle.Contains);
        
        bg.on('pointerdown', () => {
            // TODO: Replace dengan suara klik
            console.log('Click sound placeholder');
            bg.setAlpha(0.7);
            callback();
        });

        bg.on('pointerup', () => bg.setAlpha(1));
        bg.on('pointerover', () => bg.setScale(1.05));
        bg.on('pointerout', () => bg.setScale(1));

        return btn;
    }
}
