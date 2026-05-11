// ===============================
// FILE: js/scenes/UIScene.js
// DESKRIPSI: Scene paralel yang menampilkan UI overlay.
// Hanya menampilkan state. Tidak pernah mengubahnya.
// Update terjadi secara reaktif lewat listener, bukan polling.
// ===============================
import gameState from '../managers/GameState.js';
import evidenceManager from '../managers/EvidenceManager.js';

export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // ===============================
    // INTEGRITY BAR (NYALI)
    // ===============================
    this.add.text(10, 10, '🔥 NYALI', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '12px',
      color: '#fbbf24',
      fontStyle: 'bold'
    });

    this.integrityBarBg = this.add.rectangle(10, 28, 200, 12, 0x333333).setOrigin(0, 0);
    this.integrityBar = this.add.rectangle(10, 28, 200, 12, 0x00cc44).setOrigin(0, 0);

    this.integrityText = this.add.text(215, 26, '100', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '12px',
      color: '#ffffff'
    });

    // ===============================
    // SUSPICION BAR (ANCAMAN)
    // ===============================
    this.add.text(10, 48, '👁 ANCAMAN', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '12px',
      color: '#f97316',
      fontStyle: 'bold'
    });

    this.suspicionBarBg = this.add.rectangle(10, 66, 200, 12, 0x333333).setOrigin(0, 0);
    this.suspicionBar = this.add.rectangle(10, 66, 0, 12, 0x666666).setOrigin(0, 0);

    this.suspicionText = this.add.text(215, 64, '0', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '12px',
      color: '#ffffff'
    });

    // ===============================
    // INVENTORY SLOTS (3 slot)
    // ===============================
    this.add.text(width - 210, 10, '📦 BUKTI', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '12px',
      color: '#a78bfa',
      fontStyle: 'bold'
    });

    this.inventorySlots = [];
    this.inventoryTexts = [];
    for (let i = 0; i < 3; i++) {
      const slotX = width - 200 + (i * 65);
      const slotY = 30;
      const slot = this.add.rectangle(slotX, slotY, 56, 56, 0x1f1f1f)
        .setOrigin(0, 0)
        .setStrokeStyle(1, 0x555555);
      this.inventorySlots.push(slot);

      const slotText = this.add.text(slotX + 28, slotY + 28, '', {
        fontFamily: 'Inter, sans-serif',
        fontSize: '10px',
        color: '#999999',
        align: 'center',
        wordWrap: { width: 52 }
      }).setOrigin(0.5);
      this.inventoryTexts.push(slotText);
    }

    // ===============================
    // DAY INDICATOR
    // ===============================
    this.dayText = this.add.text(width / 2, 10, 'HARI KE-1', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0);

    // ===============================
    // LISTENERS — reactive updates
    // ===============================
    this._onIntegrityChange = (newVal) => this._updateIntegrityBar(newVal);
    this._onSuspicionChange = (newVal) => this._updateSuspicionBar(newVal);
    this._onInventoryChange = (newVal) => this._updateInventory(newVal);
    this._onDayChange = (newVal) => this._updateDay(newVal);

    gameState.on('integrity', this._onIntegrityChange);
    gameState.on('suspicion', this._onSuspicionChange);
    gameState.on('inventory', this._onInventoryChange);
    gameState.on('currentDay', this._onDayChange);

    // Inisialisasi tampilan dari nilai awal
    this._updateIntegrityBar(gameState.get('integrity'));
    this._updateSuspicionBar(gameState.get('suspicion'));
    this._updateInventory(gameState.get('inventory'));
    this._updateDay(gameState.get('currentDay'));
  }

  // ===============================
  // FUNGSI: _updateIntegrityBar()
  // DESKRIPSI: Update tampilan bar NYALI.
  // Warna berubah hijau → merah jika < 30.
  // PARAMETER: value (number)
  // ===============================
  _updateIntegrityBar(value) {
    const maxWidth = 200;
    this.integrityBar.width = (value / 100) * maxWidth;
    const color = value < 30 ? 0xff0000 : 0x00cc44;
    this.integrityBar.fillColor = color;
    this.integrityText.setText(Math.round(value).toString());
  }

  // ===============================
  // FUNGSI: _updateSuspicionBar()
  // DESKRIPSI: Update tampilan bar ANCAMAN.
  // Warna berubah abu → orange → merah berdasarkan threshold.
  // PARAMETER: value (number)
  // ===============================
  _updateSuspicionBar(value) {
    const maxWidth = 200;
    this.suspicionBar.width = (value / 100) * maxWidth;

    let color = 0x666666; // Normal
    if (value >= 80) color = 0xff0000;       // Kritis
    else if (value >= 50) color = 0xf97316;  // Waspada

    this.suspicionBar.fillColor = color;
    this.suspicionText.setText(Math.round(value).toString());
  }

  // ===============================
  // FUNGSI: _updateInventory()
  // DESKRIPSI: Update slot inventaris dari gameState.
  // Maksimal 3 slot ditampilkan.
  // PARAMETER: inventory (array)
  // ===============================
  _updateInventory(inventory) {
    for (let i = 0; i < 3; i++) {
      if (inventory && inventory[i]) {
        const evidence = evidenceManager.getEvidence(inventory[i]);
        const displayName = evidence ? evidence.name : inventory[i];
        this.inventoryTexts[i].setText(displayName);
        this.inventorySlots[i].setStrokeStyle(1, 0xfbbf24);
      } else {
        this.inventoryTexts[i].setText('Kosong');
        this.inventorySlots[i].setStrokeStyle(1, 0x555555);
      }
    }
  }

  // ===============================
  // FUNGSI: _updateDay()
  // DESKRIPSI: Update indikator hari.
  // PARAMETER: day (number)
  // ===============================
  _updateDay(day) {
    this.dayText.setText(`HARI KE-${day}`);
  }

  // ===============================
  // WAJIB: Bersihkan listener saat scene mati.
  // ===============================
  shutdown() {
    gameState.off('integrity', this._onIntegrityChange);
    gameState.off('suspicion', this._onSuspicionChange);
    gameState.off('inventory', this._onInventoryChange);
    gameState.off('currentDay', this._onDayChange);
  }
}
