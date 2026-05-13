class EvidenceManager {
  static init(scene) {
    this.database = scene.cache.json.get('evidence_data') || {};
  }

  static get(id) {
    return this.database?.[id] || null;
  }

  static add(id) {
    if (!id) return false;
    if (!this.get(id)) {
      console.warn(`[WARNING] Evidence ID tidak ditemukan: ${id}`);
      return false;
    }
    GameState.collectedEvidence ??= [];
    if (!GameState.collectedEvidence.includes(id)) {
      GameState.collectedEvidence.push(id);
    }
    if (!GameState.inventory.includes(id)) {
      if (GameState.inventory.length >= 3) GameState.inventory.shift();
      GameState.inventory.push(id);
      return true;
    }
    return false;
  }

  static has(id) {
    return GameState.inventory.includes(id) || (GameState.collectedEvidence || []).includes(id);
  }

  static collectedCount() {
    return (GameState.collectedEvidence || []).filter((id) => this.mainIds().includes(id)).length;
  }

  static validateDay(dayData) {
    ['morning', 'afternoon'].forEach((period) => {
      dayData?.[period]?.miniGame?.options?.forEach((opt) => {
        if (opt.evidenceGain && !this.get(opt.evidenceGain)) {
          console.warn(`[WARNING] Evidence ID tidak ditemukan: ${opt.evidenceGain}`);
        }
      });
    });

    const eveningEvidence = dayData?.evening?.debate?.correctEvidence;
    if (eveningEvidence && !this.get(eveningEvidence)) {
      console.warn(`[WARNING] Evidence ID tidak ditemukan: ${eveningEvidence}`);
    }
  }

  static allIds() {
    return this.mainIds();
  }

  static mainIds() {
    return [
      'doc_anggaran_manipulasi',
      'kontrak_vendor_fiktif',
      'stempel_jeki_palsu',
      'chat_instruksi_hendra',
      'chat_jeki_dipaksa',
      'rekening_sinta'
    ];
  }
}
