class TitleCardScene extends BaseScene {
  constructor() {
    super('TitleCardScene');
  }

  create(data = {}) {
    this.updateHud();
    const day = this.dayData();

    if (data.skipCards) {
      this.transitionTo(GameState.period === 'afternoon' ? 'AfternoonScene' : GameState.period === 'evening' ? 'EveningScene' : 'MorningScene');
      return;
    }

    this.cameras.main.setBackgroundColor('#000000');
    const title = this.add.text(640, 330, day.titleCard, {
      fontFamily: 'Playfair Display',
      fontSize: '48px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    this.time.delayedCall(3000, () => {
      title.setText(day.headlineMorning);
      title.setStyle({
        fontFamily: 'Courier Prime',
        fontSize: '34px',
        color: '#f8fafc',
        backgroundColor: '#111827',
        padding: { x: 24, y: 16 }
      });
    });

    this.time.delayedCall(6000, () => this.transitionTo('MorningScene'));
  }
}
