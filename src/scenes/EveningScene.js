class EveningScene extends BaseScene {
    constructor() {
        super('EveningScene');
    }

    create() {
        // TODO: Replace with background - Ruang Magang FH UI
        this.add.image(640, 360, 'bg_magang').setTint(0x444466); // Darker for evening
        
        this.add.text(50, 50, `Day ${GameState.currentDay} - Evening`, { fontSize: '24px', color: '#ffffff' });

        this.add.text(640, 200, 'Evening Scene Placeholder', { fontSize: '40px', color: '#ffffff' }).setOrigin(0.5);

        // Character Bella & Dimas
        // TODO: Replace with character sprite - Bella
        this.add.image(300, 450, 'char_bella').setOrigin(0.5, 1);
        this.add.text(300, 470, 'BELLA', { fontSize: '20px', color: '#9b59b6' }).setOrigin(0.5);

        // TODO: Replace with character sprite - Dimas
        this.add.image(980, 450, 'char_dimas').setOrigin(0.5, 1);
        this.add.text(980, 470, 'DIMAS', { fontSize: '20px', color: '#f1c40f' }).setOrigin(0.5);

        this.createButton(640, 500, 'See Results', () => {
            this.transitionTo('ResultScene');
        });
    }
}
