// ===============================
// FILE: js/managers/SaveLoadManager.js
// DESKRIPSI: Mengelola save/load game ke localStorage.
// Menggunakan gameState.snapshot() dan gameState.restore().
// ===============================
import gameState from './GameState.js';

class SaveLoadManager {
  constructor() {
    this.SAVE_KEY = 'false_note_save';
  }

  // ===============================
  // FUNGSI: save()
  // DESKRIPSI: Ambil snapshot dari GameState dan simpan
  // ke localStorage. Selalu sertakan timestamp.
  // RETURN: boolean — apakah save berhasil
  // ===============================
  save() {
    try {
      const saveData = {
        ...gameState.snapshot(),
        savedAt: new Date().toISOString(),
        version: '1.0.0'
      };
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
      console.log('[SaveLoad] Game berhasil disimpan.');
      return true;
    } catch (e) {
      console.error('[SaveLoad] Gagal menyimpan:', e);
      return false;
    }
  }

  // ===============================
  // FUNGSI: load()
  // DESKRIPSI: Muat data dari localStorage, validasi,
  // lalu restore ke GameState. Jika tidak valid, kembalikan false.
  // RETURN: boolean — apakah load berhasil
  // ===============================
  load() {
    const raw = localStorage.getItem(this.SAVE_KEY);
    if (!raw) {
      console.log('[SaveLoad] Tidak ada save data.');
      return false;
    }

    let saveData;
    try {
      saveData = JSON.parse(raw);
    } catch (e) {
      console.error('[SaveLoad] Data save rusak, tidak bisa di-parse.');
      return false;
    }

    if (!this._validate(saveData)) {
      console.warn('[SaveLoad] Validasi gagal. Save tidak dimuat.');
      return false;
    }

    gameState.restore(saveData);
    console.log('[SaveLoad] Game berhasil dimuat dari save.');
    return true;
  }

  // ===============================
  // FUNGSI: hasSave()
  // DESKRIPSI: Cek apakah ada save data di localStorage.
  // RETURN: boolean
  // ===============================
  hasSave() {
    return localStorage.getItem(this.SAVE_KEY) !== null;
  }

  // ===============================
  // FUNGSI: deleteSave()
  // DESKRIPSI: Hapus save data dari localStorage.
  // ===============================
  deleteSave() {
    localStorage.removeItem(this.SAVE_KEY);
    console.log('[SaveLoad] Save data dihapus.');
  }

  // ===============================
  // FUNGSI: getSaveInfo()
  // DESKRIPSI: Ambil info ringkas dari save tanpa memuat penuh.
  // RETURN: object|null — { currentDay, integrity, savedAt }
  // ===============================
  getSaveInfo() {
    const raw = localStorage.getItem(this.SAVE_KEY);
    if (!raw) return null;

    try {
      const data = JSON.parse(raw);
      return {
        currentDay: data.currentDay,
        integrity: data.integrity,
        suspicion: data.suspicion,
        inventoryCount: data.inventory ? data.inventory.length : 0,
        savedAt: data.savedAt
      };
    } catch (e) {
      return null;
    }
  }

  // ===============================
  // FUNGSI: _validate()
  // DESKRIPSI: Periksa integritas data save sebelum dimuat.
  // PARAMETER: data (object)
  // RETURN: boolean
  // ===============================
  _validate(data) {
    // Validasi currentDay
    if (typeof data.currentDay !== 'number' || data.currentDay < 1 || data.currentDay > 7) {
      console.warn('[SaveLoad] currentDay tidak valid:', data.currentDay);
      return false;
    }

    // Validasi inventory
    if (!Array.isArray(data.inventory)) {
      console.warn('[SaveLoad] inventory bukan array.');
      return false;
    }

    // Validasi integrity & suspicion range
    if (typeof data.integrity !== 'number' || data.integrity < 0 || data.integrity > 100) {
      console.warn('[SaveLoad] integrity tidak valid:', data.integrity);
      return false;
    }

    if (typeof data.suspicion !== 'number' || data.suspicion < 0 || data.suspicion > 100) {
      console.warn('[SaveLoad] suspicion tidak valid:', data.suspicion);
      return false;
    }

    return true;
  }
}

// Export singleton instance
const saveLoadManager = new SaveLoadManager();
export default saveLoadManager;
