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

  static validateLoreData(scene) {
    const warnMissing = (id, source) => {
      if (id && !this.get(id)) {
        console.warn(`[WARNING] Evidence ID tidak ditemukan di ${source}: ${id}`);
      }
    };

    scene.cache.json.get('suspects')?.forEach((suspect) => {
      suspect.requiredEvidence?.forEach((id) => warnMissing(id, `suspects/${suspect.id}`));
    });

    scene.cache.json.get('minigame_documents')?.forEach((documentData) => {
      warnMissing(documentData.evidenceId, `minigame_documents/${documentData.id}`);
    });

    scene.cache.json.get('minigame_stamps')?.forEach((stamp) => {
      warnMissing(stamp.evidenceId, `minigame_stamps/${stamp.id}`);
    });

    scene.cache.json.get('minigame_chat')?.questions?.forEach((question) => {
      warnMissing(question.evidenceId, 'minigame_chat');
    });

    scene.cache.json.get('twist_system')?.twistTriggers?.forEach((trigger) => {
      warnMissing(trigger.evidenceId, 'twist_system');
    });
  }

  static allIds() {
    return this.mainIds();
  }

  static mainIds() {
    return [
      'bukti_potongan',
      'bukti_selisih',
      'rekam_bicara_bella',
      'screenshot_chat_admin',
      'kuitansi_fiktif',
      'false_note_decrypted'
    ];
  }
}
