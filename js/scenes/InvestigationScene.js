class InvestigationScene extends BaseScene {
  constructor() {
    super('InvestigationScene');
  }

  create() {
    GameState.period = 'investigation';
    this.foundClues = new Set();
    this.updateHud();
    this.paintBackground(this.investigationBackground());
    this.addInvestigationOverlay();
    this.createInvestigationObjects();
    this.createAuditButton();
  }

  investigationBackground() {
    const day = GameState.currentDay;
    if (day >= 7) return 'bg_sidang';
    if (day >= 5) return 'bg_sosmed_kampus';
    return 'bg_magang_fh';
  }

  addInvestigationOverlay() {
    this.add.rectangle(640, 360, 1280, 720, 0x020617, 0.34);
    this.add.text(640, 42, 'INVESTIGATION MODE', {
      fontFamily: 'Courier Prime',
      fontSize: '28px',
      color: '#facc15',
      backgroundColor: '#020617',
      padding: { x: 20, y: 8 }
    }).setOrigin(0.5).setDepth(20);
    this.add.text(640, 86, 'Klik objek di ruangan. Cari clue sebelum menilai dokumen audit.', {
      fontSize: '17px',
      color: '#e2e8f0'
    }).setOrigin(0.5).setDepth(20);
  }

  createInvestigationObjects() {
    const objects = [
      {
        id: 'laptop',
        label: 'Laptop',
        x: 520,
        y: 380,
        w: 150,
        h: 76,
        evidence: 'audit_metadata',
        desc: 'Metadata file audit menunjukkan revisi pukul 23.48, jauh setelah dokumen disahkan.'
      },
      {
        id: 'dokumen',
        label: 'Dokumen',
        x: 690,
        y: 438,
        w: 150,
        h: 70,
        desc: 'Dokumen audit terlihat rapi, tapi angka lampirannya terlalu bulat dan tidak punya paraf pemeriksa.'
      },
      {
        id: 'sticky',
        label: 'Sticky Note',
        x: 765,
        y: 310,
        w: 132,
        h: 58,
        desc: 'Catatan kecil: "samakan angka sebelum sidang". Ada inisial A di pojok bawah.'
      },
      {
        id: 'map',
        label: 'Map Arsip',
        x: 405,
        y: 468,
        w: 158,
        h: 78,
        evidence: 'arsip_pencairan',
        desc: 'Salinan arsip pencairan berbeda dengan nominal pada dokumen audit final.'
      },
      {
        id: 'flashdisk',
        label: 'Flashdisk',
        x: 835,
        y: 505,
        w: 136,
        h: 58,
        evidence: 'flashdisk_log',
        desc: 'Flashdisk berisi backup log transaksi dan jejak revisi dokumen.'
      }
    ];

    objects.forEach((obj) => this.createObjectHotspot(obj));
  }

  createObjectHotspot(obj) {
    const marker = this.add.container(obj.x, obj.y).setDepth(30);
    const hit = this.add.rectangle(0, 0, obj.w, obj.h, 0x111827, 0.3).setStrokeStyle(2, 0xf59e0b, 0.8);
    const label = this.add.text(0, 0, obj.label, {
      fontSize: '16px',
      color: '#f8fafc',
      backgroundColor: '#111827',
      padding: { x: 9, y: 4 }
    }).setOrigin(0.5);
    marker.add([hit, label]);
    marker.setSize(obj.w, obj.h).setInteractive({ useHandCursor: true });
    marker.on('pointerover', () => hit.setFillStyle(0x7f1d1d, 0.38));
    marker.on('pointerout', () => hit.setFillStyle(0x111827, 0.3));
    marker.on('pointerdown', () => this.showCluePopup(obj));
  }

  showCluePopup(obj) {
    this.activePopup?.destroy();
    const panel = this.createPanel(640, 350, 720, 330, obj.label);
    panel.setDepth(80);
    panel.add(this.add.text(0, -62, obj.desc, {
      fontSize: '21px',
      color: '#f8fafc',
      align: 'center',
      wordWrap: { width: 620 },
      lineSpacing: 6
    }).setOrigin(0.5));

    const actionText = obj.evidence && !EvidenceManager.has(obj.evidence) ? 'Amankan clue' : 'Tutup';
    panel.add(this.createChoice(-135, 105, actionText, () => {
      if (obj.evidence) {
        EvidenceManager.add(obj.evidence);
        this.foundClues.add(obj.evidence);
        this.toast(`Clue diamankan: ${EvidenceManager.get(obj.evidence).name}`);
        this.updateHud();
      }
      panel.destroy();
      this.activePopup = null;
      this.refreshAuditButton();
    }, 240));
    panel.add(this.createChoice(150, 105, 'Tutup', () => {
      panel.destroy();
      this.activePopup = null;
    }, 190));
    this.activePopup = panel;
  }

  createAuditButton() {
    this.auditButton = this.createChoice(640, 642, 'Analisis Dokumen Audit', () => this.openAuditPuzzle(), 360);
    this.auditButton.setDepth(40);
    this.refreshAuditButton();
  }

  refreshAuditButton() {
    const ready = this.hasAuditClue();
    this.auditButton.setAlpha(ready ? 1 : 0.55);
  }

  hasAuditClue() {
    return EvidenceManager.has('audit_metadata') || EvidenceManager.has('arsip_pencairan') || EvidenceManager.has('flashdisk_log');
  }

  openAuditPuzzle() {
    this.activePopup?.destroy();
    const panel = this.createPanel(640, 350, 820, 420, 'DOKUMEN AUDIT');
    panel.setDepth(90);
    panel.add(this.add.text(0, -104, [
      'Status: DISETUJUI',
      'Dana beasiswa: Rp 500.000.000',
      'Waktu pengesahan: 12 Mei, 09.00',
      'Jejak revisi: 12 Mei, 23.48'
    ].join('\n'), {
      fontFamily: 'Courier Prime',
      fontSize: '22px',
      color: '#f8fafc',
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5));
    panel.add(this.add.text(0, 18, 'Dokumen ini VALID atau PALSU?', {
      fontSize: '24px',
      color: '#facc15',
      fontStyle: 'bold'
    }).setOrigin(0.5));
    panel.add(this.createVerdictButton(-160, 118, 'VALID', 0x14532d, () => this.resolveAudit(panel, true)));
    panel.add(this.createVerdictButton(160, 118, 'PALSU', 0x7f1d1d, () => this.resolveAudit(panel, false)));
  }

  createVerdictButton(x, y, text, color, callback) {
    const button = this.add.container(x, y).setSize(240, 64).setInteractive({ useHandCursor: true });
    const bg = this.add.rectangle(0, 0, 240, 64, color, 0.96).setStrokeStyle(2, 0xfacc15, 0.55);
    const label = this.add.text(0, 0, text, {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    button.add([bg, label]);
    button.on('pointerover', () => bg.setAlpha(1));
    button.on('pointerout', () => bg.setAlpha(0.96));
    button.on('pointerdown', callback);
    return button;
  }

  resolveAudit(panel, saysValid) {
    const correct = !saysValid && this.hasAuditClue();
    if (correct) {
      panel.destroy();
      this.playEitssssEffect(() => {
        this.toast('Inkonsistensi ditemukan. Bukti berhasil diamankan.');
        this.time.delayedCall(900, () => this.transitionTo('EveningScene'));
      });
      return;
    }

    this.changeIntegrity(-10);
    this.changeSuspicion(15);
    this.toast(saysValid ? 'Dokumen palsu lolos. Nyali -10, Ancaman +15.' : 'Clue belum cukup. Nyali -10, Ancaman +15.', 'bad');
    if (this.checkGameOver()) return;
  }
}
