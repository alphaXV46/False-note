class GameOverScene extends BaseScene {
    constructor() {
        super('GameOverScene');
    }

    create(data) {
        this.cameras.main.setBackgroundColor('#2c0000');
        this.add.text(640, 200, 'PERMAINAN BERAKHIR', { fontSize: '48px', color: '#ff0000' }).setOrigin(0.5);
        this.add.text(640, 300, data.reason || 'Anda gagal.', { fontSize: '24px' }).setOrigin(0.5);

        this.createButton(640, 500, 'Ulangi Hari', () => {
            GameState.integritasScore = Math.max(30, GameState.integritasScore);
            this.transitionTo('MorningScene');
        });
    }
}
