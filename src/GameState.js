/**
 * Global Game State for False Note
 */
const GameState = {
    // Core Scores
    integritasScore: 100,
    reputasiScore: 50,
    buktiStrength: 0,
    suspicionMeter: 30,
    
    // Progress
    currentDay: 1,
    
    // Inventory
    inventoryEvidence: [],

    /**
     * Reset state to defaults
     */
    reset() {
        this.integritasScore = 100;
        this.reputasiScore = 50;
        this.buktiStrength = 0;
        this.suspicionMeter = 30;
        this.currentDay = 1;
        this.inventoryEvidence = [];
    },

    /**
     * Save current state to localStorage
     */
    save() {
        const data = {
            integritasScore: this.integritasScore,
            reputasiScore: this.reputasiScore,
            buktiStrength: this.buktiStrength,
            suspicionMeter: this.suspicionMeter,
            currentDay: this.currentDay,
            inventoryEvidence: this.inventoryEvidence
        };
        localStorage.setItem('false_note_save', JSON.stringify(data));
        console.log('Game Saved:', data);
    },

    /**
     * Load state from localStorage
     */
    load() {
        const savedData = localStorage.getItem('false_note_save');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.integritasScore = data.integritasScore;
            this.reputasiScore = data.reputasiScore;
            this.buktiStrength = data.buktiStrength;
            this.suspicionMeter = data.suspicionMeter;
            this.currentDay = data.currentDay;
            this.inventoryEvidence = data.inventoryEvidence;
            console.log('Game Loaded:', data);
            return true;
        }
        return false;
    }
};
