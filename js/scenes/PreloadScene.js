class PreloadScene extends BaseScene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // UI Loading Bar
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0x3498db, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
        });

        // Generate Placeholders
        this.generatePlaceholders();
    }

    generatePlaceholders() {
        const g = this.add.graphics();

        // Background Pattern
        g.lineStyle(1, 0x1a233a, 1);
        for (let i = 0; i < 40; i++) {
            g.moveTo(i * 32, 0); g.lineTo(i * 32, 32);
            g.moveTo(0, i * 32); g.lineTo(32, i * 32);
        }
        g.strokePath(); g.generateTexture('grid_pattern', 32, 32); g.clear();

        // Karakter (Placeholder)
        const chars = [
            { name: 'char_raka', color: 0x3498db },
            { name: 'char_adrian', color: 0xe74c3c },
            { name: 'char_bella', color: 0x9b59b6 },
            { name: 'char_dimas', color: 0xf1c40f }
        ];
        chars.forEach(c => {
            g.fillStyle(c.color, 1); g.fillRect(0, 0, 200, 400);
            g.generateTexture(c.name, 200, 400); g.clear();
        });

        // Backgrounds
        g.fillStyle(0x2c3e50, 1); g.fillRect(0, 0, 1280, 720); g.generateTexture('bg_magang', 1280, 720); g.clear();
        g.fillStyle(0x1a1a1a, 1); g.fillRect(0, 0, 1280, 720); g.lineStyle(2, 0x00ff00, 0.5); g.strokeRect(50, 50, 1180, 620); g.generateTexture('bg_desktop', 1280, 720); g.clear();

        // Evidence Icon (64x64)
        g.fillStyle(0xf1c40f, 1); g.fillRect(0, 0, 64, 64); g.lineStyle(2, 0xffffff, 1); g.strokeRect(5, 5, 54, 54); g.generateTexture('icon_evidence', 64, 64); g.clear();
    }

    create() {
        // Load data jika ada
        const hasSave = SaveLoad.load();
        
        const txt = hasSave ? 'Tekan APAPUN untuk Lanjut' : 'Tekan APAPUN untuk Mulai Baru';
        this.add.text(640, 360, txt, { fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);

        this.input.keyboard.once('keydown', () => this.transitionTo('MorningScene'));
        this.input.once('pointerdown', () => this.transitionTo('MorningScene'));
    }
}
