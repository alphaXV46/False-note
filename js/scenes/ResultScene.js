class ResultScene extends BaseScene {
  constructor() {
    super('ResultScene');
  }

  create() {
    this.updateHud();
    this.paintBackground('bg_black');

    const day = this.dayData();
    const fallacy = GameState.lastFallacy || {
      type: 'Tidak ada',
      explanation: 'Kamu tidak terjebak fallacy hari ini.',
      tip: 'Pertahankan cara baca data.',
      example: '-'
    };

    this.add.text(640, 70, day.headlineEveningResult, {
      fontFamily: 'Courier Prime',
      fontSize: '26px',
      color: '#facc15',
      align: 'center',
      wordWrap: { width: 980 }
    }).setOrigin(0.5);

    const summary = [
      `Hari ke-${GameState.currentDay} selesai`,
      `NYALI: ${GameState.integrity}`,
      `ANCAMAN: ${GameState.suspicion}`,
      `Reputasi: ${GameState.reputation}`,
      `Bukti: ${EvidenceManager.collectedCount()}/6`
    ].join('\n');

    this.add.text(245, 220, summary, {
      fontFamily: 'Inter',
      fontSize: '24px',
      color: '#f8fafc',
      lineSpacing: 13
    }).setOrigin(0.5, 0);

    const card = this.createPanel(800, 375, 560, 380, 'FALLACY HARI INI');
    card.add(this.add.text(0, -110, `Kamu menghadapi: ${fallacy.type}`, {
      fontSize: '22px',
      color: '#facc15',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5));
    card.add(this.add.text(0, -42, `${fallacy.explanation}\n\nContoh:\n"${fallacy.example}"\n\nCara melawan:\n${fallacy.tip}`, {
      fontSize: '18px',
      color: '#e2e8f0',
      align: 'center',
      wordWrap: { width: 480 },
      lineSpacing: 6
    }).setOrigin(0.5, 0));

    SaveLoadManager.save();

    if (GameState.currentDay >= 7) {
      this.createChoice(640, 650, 'Lihat keputusan sidang', () => this.transitionTo('EndingScene'), 340);
    } else {
      this.createChoice(640, 650, 'Simpan di sini? Besok lebih berat.', () => {
        GameState.currentDay += 1;
        GameState.period = 'morning';
        SaveLoadManager.save();
        this.transitionTo('TitleCardScene');
      }, 430);
    }
  }
}
