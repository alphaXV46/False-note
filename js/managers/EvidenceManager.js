// ===============================
// FILE: js/managers/EvidenceManager.js
// DESKRIPSI: Mengelola database bukti (evidence).
// Memuat evidence_data.json dan menyediakan
// fungsi lookup, validasi, dan tooltip data.
// ===============================
import gameState from './GameState.js';

class EvidenceManager {
  constructor() {
    // Database bukti — dimuat dari evidence_data.json
    this._database = {};
    this._loaded = false;
  }

  // ===============================
  // FUNGSI: load()
  // DESKRIPSI: Memuat evidence_data.json.
  // Dipanggil di BootScene saat preload.
  // PARAMETER: scene (Phaser.Scene) — scene untuk akses cache
  // ===============================
  load(data) {
    if (data && typeof data === 'object') {
      this._database = data;
      this._loaded = true;
      console.log(`[EvidenceManager] Loaded ${Object.keys(this._database).length} evidence entries.`);
    } else {
      console.error('[EvidenceManager] Invalid evidence data.');
    }
  }

  // ===============================
  // FUNGSI: getEvidence()
  // DESKRIPSI: Ambil data bukti berdasarkan ID.
  // PARAMETER: evidenceId (string)
  // RETURN: object|null — { name, desc, hint }
  // ===============================
  getEvidence(evidenceId) {
    if (!this._loaded) {
      console.warn('[EvidenceManager] Database belum dimuat.');
      return null;
    }
    const entry = this._database[evidenceId];
    if (!entry) {
      console.warn(`[WARNING] Evidence ID tidak ditemukan: ${evidenceId}`);
      return null;
    }
    return entry;
  }

  // ===============================
  // FUNGSI: validateEvidenceGain()
  // DESKRIPSI: Validasi apakah evidenceGain ID dari JSON harian
  // ada di database. Tampilkan warning jika tidak.
  // PARAMETER: evidenceId (string)
  // RETURN: boolean
  // ===============================
  validateEvidenceGain(evidenceId) {
    if (!evidenceId) return true; // Tidak ada evidence gain, OK
    const exists = this._database.hasOwnProperty(evidenceId);
    if (!exists) {
      console.warn(`[WARNING] Evidence ID tidak ditemukan: ${evidenceId}`);
    }
    return exists;
  }

  // ===============================
  // FUNGSI: validateDayData()
  // DESKRIPSI: Validasi semua evidenceGain di data harian.
  // PARAMETER: dayData (object) — data JSON harian
  // ===============================
  validateDayData(dayData) {
    const periods = ['morning', 'afternoon'];
    for (const period of periods) {
      if (dayData[period] && dayData[period].miniGame && dayData[period].miniGame.options) {
        for (const opt of dayData[period].miniGame.options) {
          if (opt.evidenceGain) {
            this.validateEvidenceGain(opt.evidenceGain);
          }
        }
      }
    }
    // Validasi evening debate evidence
    if (dayData.evening && dayData.evening.debate && dayData.evening.debate.correctEvidence) {
      this.validateEvidenceGain(dayData.evening.debate.correctEvidence);
    }
  }

  // ===============================
  // FUNGSI: getAllEvidenceIds()
  // DESKRIPSI: Ambil semua ID bukti yang terdaftar.
  // RETURN: array of string
  // ===============================
  getAllEvidenceIds() {
    return Object.keys(this._database);
  }

  // ===============================
  // FUNGSI: getEvidenceChecklist()
  // DESKRIPSI: Generate evidence checklist untuk EndingScene.
  // Bandingkan inventory player dengan database lengkap.
  // RETURN: array of object — { id, name, found: boolean }
  // ===============================
  getEvidenceChecklist() {
    const inventory = gameState.get('inventory') || [];
    const checklist = [];

    for (const [id, data] of Object.entries(this._database)) {
      checklist.push({
        id,
        name: data.name,
        desc: data.desc,
        found: inventory.includes(id)
      });
    }

    return checklist;
  }

  // ===============================
  // FUNGSI: getCollectedCount()
  // DESKRIPSI: Hitung jumlah bukti yang sudah dikumpulkan.
  // RETURN: object — { collected: number, total: number }
  // ===============================
  getCollectedCount() {
    const inventory = gameState.get('inventory') || [];
    return {
      collected: inventory.length,
      total: Object.keys(this._database).length
    };
  }
}

// Export singleton
const evidenceManager = new EvidenceManager();
export default evidenceManager;
