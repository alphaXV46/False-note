class PreloadScene extends BaseScene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Progress bar UI
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading Assets...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0x3a4b7c, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });

        // Placeholder generation via Graphics for all required assets
        this.createPlaceholders();
    }

    createPlaceholders() {
        const g = this.add.graphics();

        // Characters
        // TODO: Replace with character sprite - Raka
        g.fillStyle(0x3498db, 1); g.fillRect(0, 0, 200, 400); g.generateTexture('char_raka', 200, 400); g.clear();
        
        // TODO: Replace with character sprite - Dr. Adrian
        g.fillStyle(0xe74c3c, 1); g.fillRect(0, 0, 200, 400); g.generateTexture('char_adrian', 200, 400); g.clear();
        
        // TODO: Replace with character sprite - Bella
        g.fillStyle(0x9b59b6, 1); g.fillRect(0, 0, 200, 400); g.generateTexture('char_bella', 200, 400); g.clear();
        
        // TODO: Replace with character sprite - Dimas
        g.fillStyle(0xf1c40f, 1); g.fillRect(0, 0, 200, 400); g.generateTexture('char_dimas', 200, 400); g.clear();

        // Backgrounds
        // TODO: Replace with background - Ruang Magang FH UI
        g.fillStyle(0x2c3e50, 1); g.fillRect(0, 0, 1280, 720); g.generateTexture('bg_magang', 1280, 720); g.clear();
        
        // TODO: Replace with background - Desktop UI (Nusa-OS)
        g.fillStyle(0x1a1a1a, 1); g.fillRect(0, 0, 1280, 720); 
        g.lineStyle(2, 0x00ff00, 0.5); g.strokeRect(50, 50, 1180, 620);
        g.generateTexture('bg_desktop', 1280, 720); g.clear();

        // UI Elements
        // TODO: Replace dengan UI button - Sanggah
        g.fillStyle(0xc0392b, 1); g.fillCircle(25, 25, 25); g.generateTexture('btn_sanggah', 50, 50); g.clear();

        // Audio Placeholders
        // TODO: Replace dengan suara klik, suara notifikasi
        console.log('Audio placeholders ready (TODO)');

        // Grid pattern for background
        const gridG = this.add.graphics();
        gridG.lineStyle(1, 0x1a233a, 1);
        for (let i = 0; i < 40; i++) {
            gridG.moveTo(i * 32, 0);
            gridG.lineTo(i * 32, 32);
            gridG.moveTo(0, i * 32);
            gridG.lineTo(32, i * 32);
        }
        gridG.strokePath();
        gridG.generateTexture('grid_pattern', 32, 32);
        gridG.destroy();

        console.log('Placeholders created');
    }

    create() {
        // Load save game if exists
        GameState.load();
        
        this.add.text(640, 360, 'Press Any Key to Start', { fontSize: '32px', color: '#ffffff' }).setOrigin(0.5);
        this.input.keyboard.once('keydown', () => {
            this.transitionTo('MorningScene');
        });
        
        // Click to start for mobile/mouse
        this.input.once('pointerdown', () => {
            this.transitionTo('MorningScene');
        });
    }
}
