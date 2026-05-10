/**
 * Utility Timer - False Note
 * Helper sederhana untuk format waktu atau manajemen timer tambahan.
 */
const TimerUtils = {
    /**
     * Format detik menjadi string MM:SS
     * @param {number} seconds 
     * @returns {string}
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
};
