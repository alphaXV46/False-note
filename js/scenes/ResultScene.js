class ResultScene extends BaseScene {
    constructor() {
        super('ResultScene');
    }

    create() {
        const finalScore = (GameState.integritasScore * 0.5) + (GameState.reputasiScore * 0.3) + (GameState.buktiStrength * 0.2);
        
        let title = "BAD ENDING";
        let message = "Anda menjadi bagian dari sistem korupsi.";
        let color = '#4d0000';

        if (GameState.integritasScore > 70 && GameState.dukunganScore > 70) {
            title = "TRUE ENDING";
            message = "Skandal terbongkar! Keadilan ditegakkan.";
            color = '#004d00';
        } else if (GameState.integritasScore > 50) {
            title = "NEUTRAL ENDING";
            message = "Perubahan kecil terjadi, namun sistem tetap sama.";
            color = '#00264d';
        }

        this.cameras.main.setBackgroundColor(color);
        this.add.text(640, 150, title, { fontSize: '64px', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(640, 300, message, { fontSize: '24px', align: 'center' }).setOrigin(0.5);
        this.add.text(640, 450, `Skor Akhir: ${Math.floor(finalScore)}`, { fontSize: '32px' }).setOrigin(0.5);

        this.createButton(640, 600, 'Main Lagi', () => {
            SaveLoad.clear();
            this.scene.start('BootScene');
        });
    }
}
