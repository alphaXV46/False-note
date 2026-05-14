const GameState = {
  currentDay: 1,
  period: 'morning',
  integrity: 100,
  suspicion: 0,
  reputation: 60,
  publicTrust: 50,
  inventory: [],
  collectedEvidence: [],
  fallacyCounter: 0,
  fallacyLog: [],
  morningFailStreak: 0,
  lastFallacy: null,
  endingReason: null,
  loadedFromSave: false,
  reset() {
    this.currentDay = 1;
    this.period = 'morning';
    this.integrity = 100;
    this.suspicion = 0;
    this.reputation = 60;
    this.publicTrust = 50;
    this.inventory = [];
    this.collectedEvidence = [];
    this.fallacyCounter = 0;
    this.fallacyLog = [];
    this.morningFailStreak = 0;
    this.lastFallacy = null;
    this.endingReason = null;
    this.loadedFromSave = false;
  },
  snapshot() {
    return {
      currentDay: this.currentDay,
      period: this.period,
      integrity: this.integrity,
      suspicion: this.suspicion,
      reputation: this.reputation,
      publicTrust: this.publicTrust,
      inventory: [...this.inventory],
      collectedEvidence: [...this.collectedEvidence],
      fallacyCounter: this.fallacyCounter,
      fallacyLog: [...this.fallacyLog],
      morningFailStreak: this.morningFailStreak,
      date: new Date().toISOString()
    };
  },
  applySave(data) {
    this.currentDay = data.currentDay;
    this.period = data.period || 'morning';
    this.integrity = data.integrity;
    this.suspicion = data.suspicion;
    this.reputation = data.reputation ?? 60;
    this.publicTrust = data.publicTrust ?? 50;
    this.inventory = Array.isArray(data.inventory) ? [...data.inventory] : [];
    this.collectedEvidence = Array.isArray(data.collectedEvidence) ? [...data.collectedEvidence] : [...this.inventory];
    this.fallacyCounter = data.fallacyCounter ?? 0;
    this.fallacyLog = Array.isArray(data.fallacyLog) ? [...data.fallacyLog] : [];
    this.morningFailStreak = data.morningFailStreak ?? 0;
    this.loadedFromSave = true;
  }
};
