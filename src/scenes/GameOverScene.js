class GameOverScene extends BaseScene {
    constructor() {
        super('GameOverScene');
    }

    create(data) {
        this.cameras.main.setBackgroundColor('#2c0000');
        
        const title = this.add.text(640, 200, 'PERMAINAN BERAKHIR', { fontSize: '64px', color: '#ff0000', fontStyle: 'bold' }).setOrigin(0.5);
        
        const reason = data.reason || 'Anda gagal menjalankan tugas magang.';
        this.add.text(640, 300, reason, { fontSize: '24px', color: '#ffffff', align: 'center' }).setOrigin(0.5);

        this.createButton(640, 500, 'Coba Lagi', () => {
            GameState.reset();
            this.transitionTo('MorningScene');
        });
    }
}
