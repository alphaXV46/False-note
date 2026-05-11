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
    // Referensi DOM elemen HUD
    this.hudOverlay = document.getElementById('hud-overlay');
    this.nyaliBar = document.getElementById('nyali-bar');
    this.ancamanBar = document.getElementById('ancaman-bar');
    this.invSlots = [
      document.getElementById('inv-slot-0'),
      document.getElementById('inv-slot-1'),
      document.getElementById('inv-slot-2')
    ];

    // Tampilkan HUD
    if (this.hudOverlay) {
      this.hudOverlay.classList.remove('hidden');
    }

    // ===============================
    // LISTENERS — reactive updates
    // ===============================
    this._onIntegrityChange = (newVal) => this._updateIntegrityBar(newVal);
    this._onSuspicionChange = (newVal) => this._updateSuspicionBar(newVal);
    this._onInventoryChange = (newVal) => this._updateInventory(newVal);
    // currentDay can update an element if we add it to the DOM HUD later, 
    // for now we don't have a specific DOM element for Day in the new design.

    gameState.on('integrity', this._onIntegrityChange);
    gameState.on('suspicion', this._onSuspicionChange);
    gameState.on('inventory', this._onInventoryChange);

    // Inisialisasi tampilan dari nilai awal
    this._updateIntegrityBar(gameState.get('integrity'));
    this._updateSuspicionBar(gameState.get('suspicion'));
    this._updateInventory(gameState.get('inventory'));
  }

  // ===============================
  // FUNGSI: _updateIntegrityBar()
  // ===============================
  _updateIntegrityBar(value) {
    if (!this.nyaliBar) return;
    // Update width (0% - 100%)
    this.nyaliBar.style.width = `${Math.max(0, Math.min(100, value))}%`;
    
    // Optional: Ganti warna jika kritis (misal < 30)
    if (value < 30) {
      this.nyaliBar.classList.replace('from-orange-400', 'from-red-600');
      this.nyaliBar.classList.replace('to-red-600', 'to-red-800');
    } else {
      this.nyaliBar.classList.replace('from-red-600', 'from-orange-400');
      this.nyaliBar.classList.replace('to-red-800', 'to-red-600');
    }
  }

  // ===============================
  // FUNGSI: _updateSuspicionBar()
  // ===============================
  _updateSuspicionBar(value) {
    if (!this.ancamanBar) return;
    // Update width (0% - 100%)
    this.ancamanBar.style.width = `${Math.max(0, Math.min(100, value))}%`;
    
    // Optional: Ganti warna jika bahaya (> 70)
    if (value > 70) {
      this.ancamanBar.classList.replace('from-slate-700', 'from-red-700');
      this.ancamanBar.classList.replace('to-black', 'to-red-900');
    } else {
      this.ancamanBar.classList.replace('from-red-700', 'from-slate-700');
      this.ancamanBar.classList.replace('to-red-900', 'to-black');
    }
  }

  // ===============================
  // FUNGSI: _updateInventory()
  // ===============================
  _updateInventory(inventory) {
    for (let i = 0; i < 3; i++) {
      const slot = this.invSlots[i];
      if (!slot) continue;

      if (inventory && inventory[i]) {
        const evidence = evidenceManager.getEvidence(inventory[i]);
        const displayName = evidence ? evidence.name : inventory[i];
        slot.textContent = displayName;
        slot.classList.replace('text-slate-500', 'text-amber-400');
        slot.classList.replace('border-slate-700', 'border-amber-500');
      } else {
        slot.textContent = 'Kosong';
        slot.classList.replace('text-amber-400', 'text-slate-500');
        slot.classList.replace('border-amber-500', 'border-slate-700');
      }
    }
  }

  // ===============================
  // WAJIB: Bersihkan listener saat scene mati.
  // ===============================
  shutdown() {
    gameState.off('integrity', this._onIntegrityChange);
    gameState.off('suspicion', this._onSuspicionChange);
    gameState.off('inventory', this._onInventoryChange);
    
    if (this.hudOverlay) {
      this.hudOverlay.classList.add('hidden');
    }
  }
}
