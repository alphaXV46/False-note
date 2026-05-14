class SaveLoadManager {
  static key = 'false_note_save';

  static save() {
    localStorage.setItem(this.key, JSON.stringify(GameState.snapshot()));
  }

  static load() {
    const raw = localStorage.getItem(this.key);
    if (!raw) return false;

    try {
      const data = JSON.parse(raw);
      const dayOk = Number.isInteger(data.currentDay) && data.currentDay >= 1 && data.currentDay <= 7;
      const inventoryOk = Array.isArray(data.inventory) && data.inventory.every((id) => EvidenceManager.get(id));
      const collectedOk = !data.collectedEvidence || (Array.isArray(data.collectedEvidence) && data.collectedEvidence.every((id) => EvidenceManager.get(id)));
      const statOk = [data.integrity, data.suspicion].every((v) => Number.isFinite(v));

      if (!dayOk || !inventoryOk || !collectedOk || !statOk) throw new Error('Invalid save');

      GameState.applySave(data);
      return true;
    } catch (error) {
      console.warn('Save rusak. Mulai dari awal?', error);
      alert('Save rusak. Mulai dari awal?');
      localStorage.removeItem(this.key);
      GameState.reset();
      return false;
    }
  }
}
