/**
 * Achievement System - False Note
 * Mengelola pemicu dan daftar nilai #BERJUMPADIKERTAS.
 */
const AchievementSystem = {
    // Definisi Nilai & Trigger
    values: {
        "Berani": "Sanggah saat dukungan rendah (<30%)",
        "Jujur": "Menolak manipulasi bukti di siang hari",
        "Mandiri": "Menyelesaikan dekripsi tanpa hint",
        "Peduli": "Membela mahasiswa di kolom komentar",
        "Adil": "Menyanggah senior (Bella) jika bersalah",
        "Disiplin": "Menyelesaikan tugas magang tepat waktu",
        "Kerja Keras": "Investigasi tambahan setelah tugas selesai",
        "Tanggung Jawab": "Melakukan klarifikasi publik setelah salah tuduh",
        "Sederhana": "Menolak tawaran upgrade barang mewah"
    },

    /**
     * Tambahkan achievement ke dalam state jika belum ada
     * @param {string} name - Nama nilai yang dicapai
     */
    unlock(name) {
        if (this.values[name] && !GameState.achievements.includes(name)) {
            GameState.achievements.push(name);
            console.log(`Achievement Unlocked: ${name} - ${this.values[name]}`);
            return true;
        }
        return false;
    }
};
