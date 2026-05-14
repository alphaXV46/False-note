class EveningScene extends BaseScene {
  constructor() {
    super('EveningScene');
  }

  create() {
    GameState.period = 'evening';
    const day = this.dayData();
    const data = day.evening;
    this.updateHud();
    this.paintBackground(data.background);
    this.characterSprites = [];
    this.characterByRole = {};
    this.addCharacter('Raka', GameState.integrity >= 40);
    this.addCharacter(data.debate.opponent, true);

    const headline = this.add.text(640, 44, day.headlineEvening, {
      fontFamily: 'Courier Prime',
      fontSize: '25px',
      color: '#facc15',
      backgroundColor: '#020617',
      padding: { x: 18, y: 8 }
    }).setOrigin(0.5).setDepth(20);

    this.time.delayedCall(1200, () => headline.destroy());
    this.showDialogueSequence(data.dialog, () => this.startDebate(data.debate));
  }

  startDebate(debate) {
    const statement = debate.statements[0];
    const panel = this.createPanel(640, 350, 820, 430, debate.opponent);
    const quote = this.add.text(0, -112, `"${statement.text}"`, {
      fontFamily: 'Inter',
      fontSize: '25px',
      color: '#f8fafc',
      align: 'center',
      wordWrap: { width: 710 }
    }).setOrigin(0.5);
    const hint = this.add.text(0, -22, `Fallacy: ${debate.fallacyType}`, {
      fontFamily: 'Courier Prime',
      fontSize: '18px',
      color: '#facc15'
    }).setOrigin(0.5);
    panel.add([quote, hint]);

    const eitssss = this.createChoice(0, 84, 'EITSSS!', () => {
      eitssss.disableInteractive();
      this.cameras.main.shake(120, 0.003);
      this.time.delayedCall(260, () => this.showEvidenceChoices(panel, debate));
    }, 280);
    panel.add(eitssss);
  }

  showEvidenceChoices(panel, debate) {
    panel.removeAll(true);
    const title = this.add.text(0, -166, 'Pilih bukti dari inventaris', {
      fontFamily: 'Inter',
      fontSize: '24px',
      color: '#f8fafc',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    panel.add(title);

    const evidenceChoices = (GameState.collectedEvidence && GameState.collectedEvidence.length > 0)
      ? GameState.collectedEvidence
      : GameState.inventory;

    if (evidenceChoices.length === 0) {
      panel.add(this.add.text(0, -30, 'Inventarismu kosong.', {
        fontSize: '22px',
        color: '#fecaca'
      }).setOrigin(0.5));
      panel.add(this.createChoice(0, 86, 'Terima konsekuensi', () => this.resolveDebate(panel, debate, null), 360));
      return;
    }

    evidenceChoices.forEach((id, index) => {
      const ev = EvidenceManager.get(id);
      panel.add(this.createChoice(0, -128 + index * 54, ev.name, () => this.resolveDebate(panel, debate, id), 620));
    });
  }

  resolveDebate(panel, debate, evidenceId) {
    panel.destroy();
    if (evidenceId === debate.correctEvidence) {
      GameState.publicTrust = Phaser.Math.Clamp(GameState.publicTrust + debate.publicTrustChange, 0, 100);
      GameState.reputation = Phaser.Math.Clamp(GameState.reputation + 8, 0, 100);
      this.playEitssssEffect(() => this.toast('Bukti kuat. Lawan terdiam.'));
    } else {
      GameState.fallacyCounter += 1;
      GameState.fallacyLog.push(debate.fallacyType);
      this.changeIntegrity(-10);
      GameState.reputation = Phaser.Math.Clamp(GameState.reputation - 8, 0, 100);
      this.toast(debate.wrongFeedback, 'bad');
    }

    GameState.lastFallacy = {
      type: debate.fallacyType,
      explanation: debate.fallacyExplanation,
      tip: debate.fallacyCounterTip,
      example: debate.statements[0].text
    };

    if (!this.checkGameOver()) {
      this.time.delayedCall(evidenceId === debate.correctEvidence ? 1700 : 900, () => this.transitionTo('ResultScene'));
    }
  }
}
