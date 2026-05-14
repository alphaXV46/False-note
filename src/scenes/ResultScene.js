class ResultScene extends BaseScene {
    constructor() {
        super('ResultScene');
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');
        
        this.add.text(640, 150, 'DAY COMPLETE', { fontSize: '48px', color: '#ffffff' }).setOrigin(0.5);

        const statsText = `
            Integrity: ${GameState.integritasScore}
            Reputation: ${GameState.reputasiScore}
            Evidence: ${GameState.buktiStrength}
            Suspicion: ${GameState.suspicionMeter}
        `;

        this.add.text(640, 300, statsText, { 
            fontSize: '24px', 
            color: '#ffffff', 
            align: 'center',
            lineSpacing: 10 
        }).setOrigin(0.5);

        this.createButton(640, 500, 'Next Day', () => {
            GameState.currentDay++;
            GameState.save();
            this.transitionTo('MorningScene');
        });

        this.createButton(640, 570, 'Reset Game', () => {
            GameState.reset();
            GameState.save();
            this.transitionTo('MorningScene');
        });
    }
}
