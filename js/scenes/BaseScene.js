/**
 * Base Scene - False Note
 * Berisi fungsi bantuan (helpers) yang digunakan oleh semua scene lainnya.
 */
class BaseScene extends Phaser.Scene {
    constructor(key) {
        super(key);
    }

    /**
     * Transisi antar scene dengan efek fade out
     * @param {string} targetScene - Key scene tujuan
     * @param {object} data - Data opsional untuk dikirim ke scene baru
     */
    transitionTo(targetScene, data = {}) {
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start(targetScene, data);
        });
    }

    /**
     * Membuat tombol standar (200x60 px) dengan 3 state
     * @param {number} x 
     * @param {number} y 
     * @param {string} text 
     * @param {function} callback 
     */
    createButton(x, y, text, callback) {
        const width = 200;
        const height = 60;
        const btn = this.add.container(x, y);

        const bg = this.add.graphics();
        const drawBg = (color, strokeColor, strokeWidth) => {
            bg.clear();
            bg.fillStyle(color, 1);
            bg.fillRoundedRect(-width/2, -height/2, width, height, 10);
            bg.lineStyle(strokeWidth, strokeColor, 1);
            bg.strokeRoundedRect(-width/2, -height/2, width, height, 10);
        };

        drawBg(0x1a233a, 0x3498db, 2); // Normal state

        const txt = this.add.text(0, 0, text, {
            fontSize: '16px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 180 }
        }).setOrigin(0.5);

        btn.add([bg, txt]);
        bg.setInteractive(new Phaser.Geom.Rectangle(-width/2, -height/2, width, height), Phaser.Geom.Rectangle.Contains);

        bg.on('pointerover', () => {
            drawBg(0x2c3e50, 0xf1c40f, 3); // Hover state
            btn.setScale(1.05);
        });

        bg.on('pointerout', () => {
            drawBg(0x1a233a, 0x3498db, 2); // Kembali normal
            btn.setScale(1);
        });

        bg.on('pointerdown', () => {
            drawBg(0x3498db, 0xffffff, 2); // Click state
            // TODO: Tambahkan suara klik
            callback();
        });

        bg.on('pointerup', () => drawBg(0x2c3e50, 0xf1c40f, 3));

        return btn;
    }

    /**
     * Menampilkan notifikasi Achievement di pojok kanan atas
     */
    showAchievement(name, bonusText) {
        const container = this.add.container(1100, -100).setDepth(1000);
        const bg = this.add.graphics().fillStyle(0x1a233a, 0.9).lineStyle(2, 0xf1c40f).fillRoundedRect(-150, 0, 300, 60, 10).strokeRoundedRect(-150, 0, 300, 60, 10);
        const title = this.add.text(0, 12, `ACHIEVEMENT: ${name}`, { fontSize: '14px', color: '#f1c40f', fontStyle: 'bold' }).setOrigin(0.5);
        const bonus = this.add.text(0, 35, bonusText, { fontSize: '12px', color: '#ffffff' }).setOrigin(0.5);
        container.add([bg, title, bonus]);

        this.tweens.add({
            targets: container, y: 80, duration: 500, ease: 'Back.easeOut',
            completeDelay: 3000,
            onComplete: () => {
                this.tweens.add({ targets: container, y: -100, duration: 500, ease: 'Back.easeIn', onComplete: () => container.destroy() });
            }
        });
        // TODO: Tambahkan suara notifikasi
    }

    /**
     * Bantuan untuk menampilkan pesan teks singkat di tengah
     */
    showMessage(msg, color = '#ffffff') {
        const txt = this.add.text(640, 100, msg, { fontSize: '18px', color: color, backgroundColor: '#000', padding: 5 }).setOrigin(0.5).setDepth(400);
        this.time.delayedCall(2000, () => txt.destroy());
    }
}
