/**
 * Data Game State - False Note
 * Berisi variabel statistik utama yang digunakan di seluruh scene.
 */
const GameState = {
    // Statistik Utama
    integritasScore: 100,
    reputasiScore: 50,
    buktiStrength: 0,
    suspicionMeter: 30,
    dukunganScore: 50,
    
    // Progres & Metadata
    currentDay: 1,
    completedTutorial: false,
    inventoryEvidence: [], // Berisi string nama bukti
    achievements: [],      // Berisi string nama achievement yang didapat
    
    // Tracking Internal (Kondisi Kalah)
    suspicionStrikes: 0,
    tookBribe: false,

    /**
     * Reset semua variabel ke kondisi awal (New Game)
     */
    reset() {
        this.integritasScore = 100;
        this.reputasiScore = 50;
        this.buktiStrength = 0;
        this.suspicionMeter = 30;
        this.dukunganScore = 50;
        this.currentDay = 1;
        this.completedTutorial = false;
        this.inventoryEvidence = [];
        this.achievements = [];
        this.suspicionStrikes = 0;
        this.tookBribe = false;
        console.log('GameState: Data direset ke awal.');
    }
};
