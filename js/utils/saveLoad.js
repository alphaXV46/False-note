/**
 * Utility Save & Load - False Note
 * Mengelola interaksi dengan localStorage.
 */
const SaveLoad = {
    STORAGE_KEY: "FalseNoteSave",

    /**
     * Simpan state GameState ke localStorage
     */
    save() {
        const data = JSON.stringify(GameState);
        localStorage.setItem(this.STORAGE_KEY, data);
        console.log('SaveLoad: Data berhasil disimpan.');
    },

    /**
     * Load data dari localStorage ke GameState
     * @returns {boolean} True jika berhasil load, False jika tidak ada data
     */
    load() {
        const savedData = localStorage.getItem(this.STORAGE_KEY);
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                // Assign data ke GameState tanpa merusak referensi objek jika memungkinkan
                Object.assign(GameState, data);
                console.log('SaveLoad: Data berhasil dimuat.');
                return true;
            } catch (e) {
                console.error('SaveLoad: Gagal memproses data simpanan.', e);
                return false;
            }
        }
        return false;
    },

    /**
     * Hapus data simpanan
     */
    clear() {
        localStorage.removeItem(this.STORAGE_KEY);
        GameState.reset();
        console.log('SaveLoad: Data dihapus.');
    }
};
