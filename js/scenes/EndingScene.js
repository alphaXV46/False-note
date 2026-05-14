class EndingScene extends BaseScene {
  constructor() {
    super('EndingScene');
  }

  create(data = {}) {
    this.updateHud();
    this.paintBackground('bg_black');

    const ending = this.resolveEnding(data.forced);
    this.add.text(640, 80, ending.title, {
      fontFamily: 'Playfair Display',
      fontSize: '54px',
      color: ending.color
    }).setOrigin(0.5);

    ending.lines.forEach((line, index) => {
      this.add.text(640, 160 + index * 42, line, {
        fontSize: '24px',
        color: '#f8fafc',
        align: 'center',
        wordWrap: { width: 920 }
      }).setOrigin(0.5).setAlpha(0);
    });

    this.children.list.forEach((child, index) => {
      if (child.type === 'Text' && index > 1) {
        this.tweens.add({ targets: child, alpha: 1, delay: 260 * index, duration: 420 });
      }
    });

    this.drawEvidenceChecklist();
    const summary = FallacyManager.summary();
    this.add.text(640, 610, `Sepanjang game, kamu terjebak fallacy sebanyak ${summary.total} kali. Yang paling sering: ${summary.mostCommon}.`, {
      fontSize: '18px',
      color: '#cbd5e1',
      align: 'center'
    }).setOrigin(0.5);

    this.createChoice(520, 670, 'Mulai Lagi', () => {
      GameState.reset();
      SaveLoadManager.save();
      this.transitionTo('TitleCardScene');
    }, 220);
    this.createChoice(770, 670, 'Lihat Bukti yang Terlewat', () => this.toast('Checklist bukti ada di kanan layar.'), 300);
  }

  resolveEnding(forced) {
    if (forced === 'bad') {
      return {
        title: 'BAD ENDING',
        color: '#ef4444',
        lines: [
          GameState.endingReason || 'Raka memilih diam.',
          'Tapi kampus tetap sibuk.',
          'Korupsi terus berjalan.',
          'Seolah perjuanganmu tidak pernah ada.'
        ]
      };
    }

    const trueEnding = GameState.integrity > 70 && EvidenceManager.collectedCount() >= 4 && GameState.fallacyCounter < 4;
    if (trueEnding) {
      return {
        title: 'TRUE ENDING',
        color: '#22c55e',
        lines: [
          'Adrian ditangkap.',
          'Laporan Raka jadi bukti utama.',
          'Kampus berubah. Pelan-pelan.',
          'Tapi berubah.'
        ]
      };
    }

    if (GameState.integrity >= 50) {
      return {
        title: 'NEUTRAL ENDING',
        color: '#facc15',
        lines: [
          'Raka bicara. Tapi tidak cukup keras.',
          'Beberapa pejabat diperiksa.',
          'Tapi Adrian masih di kursinya.',
          'Perjuangan belum selesai.'
        ]
      };
    }

    return {
      title: 'BAD ENDING',
      color: '#ef4444',
      lines: [
        'Raka bicara dengan nyali tersisa.',
        'Tapi tekanan terlalu besar.',
        'Korupsi menang lagi.',
        'Coba kumpulkan bukti lebih kuat.'
      ]
    };
  }

  drawEvidenceChecklist() {
    const all = EvidenceManager.allIds();
    const owned = new Set(GameState.collectedEvidence || GameState.inventory);
    const box = this.add.container(1030, 225).setDepth(30);
    box.add(this.add.rectangle(0, 0, 360, 360, 0x020617, 0.9).setStrokeStyle(2, 0x475569));
    box.add(this.add.text(0, -150, `EVIDENCE CHECKLIST (${EvidenceManager.collectedCount()}/6)`, {
      fontFamily: 'Courier Prime',
      fontSize: '18px',
      color: '#facc15'
    }).setOrigin(0.5));

    all.forEach((id, index) => {
      const ev = EvidenceManager.get(id);
      const mark = owned.has(id) ? 'OK' : 'NO';
      const suffix = owned.has(id) ? '' : ' - belum ditemukan';
      box.add(this.add.text(-155, -105 + index * 38, `${mark} ${ev.name}${suffix}`, {
        fontSize: '16px',
        color: owned.has(id) ? '#bbf7d0' : '#fecaca',
        wordWrap: { width: 310 }
      }));
    });
  }
}
