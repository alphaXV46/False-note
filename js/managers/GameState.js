// ===============================
// FILE: js/managers/GameState.js
// DESKRIPSI: Single source of truth untuk semua variabel game.
// Semua scene HANYA baca/tulis lewat sini.
// TIDAK BOLEH ada variabel state yang disimpan di dalam scene itu sendiri.
// ===============================

class GameState {
  constructor() {
    // Pastikan hanya satu instance yang ada (Singleton pattern)
    if (GameState.instance) {
      return GameState.instance;
    }

    this._state = {
      currentDay: 1,
      integrity: 100,
      suspicion: 0,
      reputation: 100,
      inventory: [],
      fallacyCounter: 0,
      fallacyLog: [],
      // Tracking streak gagal mini-game pagi
      morningFailStreak: 0,
      // Current period tracking
      currentPeriod: 'morning', // 'morning' | 'afternoon' | 'evening'
    };

    // Daftar callback listener per key
    this._listeners = {};

    GameState.instance = this;
  }

  // ===============================
  // FUNGSI: get()
  // DESKRIPSI: Baca nilai state. Scene tidak boleh
  // menyimpan salinan lokal dari nilai ini.
  // PARAMETER: key (string)
  // RETURN: nilai state saat ini
  // ===============================
  get(key) {
    return this._state[key];
  }

  // ===============================
  // FUNGSI: set()
  // DESKRIPSI: Satu-satunya cara mengubah state.
  // Otomatis memberitahu semua listener (UIScene, dll).
  // PARAMETER: key (string), value (any)
  // ===============================
  set(key, value) {
    const oldValue = this._state[key];
    this._state[key] = value;

    if (this._listeners[key]) {
      this._listeners[key].forEach(callback => callback(value, oldValue));
    }
  }

  // ===============================
  // FUNGSI: modify()
  // DESKRIPSI: Shortcut untuk menambah/mengurangi nilai numerik.
  // Nilai otomatis di-clamp antara 0 dan 100.
  // Contoh: gameState.modify('integrity', -10)
  // PARAMETER: key (string), delta (number)
  // ===============================
  modify(key, delta) {
    const current = this._state[key];
    if (typeof current !== 'number') return;
    const clamped = Math.max(0, Math.min(100, current + delta));
    this.set(key, clamped);
  }

  // ===============================
  // FUNGSI: on()
  // DESKRIPSI: Daftarkan listener untuk key tertentu.
  // UIScene menggunakan ini untuk update bar secara reaktif
  // tanpa perlu polling di setiap frame.
  // PARAMETER: key (string), callback (function)
  // ===============================
  on(key, callback) {
    if (!this._listeners[key]) {
      this._listeners[key] = [];
    }
    this._listeners[key].push(callback);
  }

  // ===============================
  // FUNGSI: off()
  // DESKRIPSI: Hapus listener. WAJIB dipanggil di shutdown()
  // setiap scene untuk mencegah memory leak dan ghost listener
  // yang update UI yang sudah tidak ada.
  // PARAMETER: key (string), callback (function)
  // ===============================
  off(key, callback) {
    if (!this._listeners[key]) return;
    this._listeners[key] = this._listeners[key].filter(cb => cb !== callback);
  }

  // ===============================
  // FUNGSI: snapshot()
  // DESKRIPSI: Ambil salinan state saat ini untuk disimpan
  // ke localStorage. Deep copy agar tidak ada referensi.
  // RETURN: object — salinan state
  // ===============================
  snapshot() {
    return JSON.parse(JSON.stringify(this._state));
  }

  // ===============================
  // FUNGSI: restore()
  // DESKRIPSI: Pulihkan state dari data yang dimuat
  // dari localStorage. Merge, bukan replace penuh,
  // agar key baru tidak hilang.
  // PARAMETER: savedData (object)
  // ===============================
  restore(savedData) {
    this._state = { ...this._state, ...savedData };
    // Notify semua listener setelah restore
    Object.keys(this._state).forEach(key => {
      if (this._listeners[key]) {
        this._listeners[key].forEach(cb => cb(this._state[key], undefined));
      }
    });
  }

  // ===============================
  // FUNGSI: reset()
  // DESKRIPSI: Reset state ke nilai awal untuk New Game.
  // ===============================
  reset() {
    this._state = {
      currentDay: 1,
      integrity: 100,
      suspicion: 0,
      reputation: 100,
      inventory: [],
      fallacyCounter: 0,
      fallacyLog: [],
      morningFailStreak: 0,
      currentPeriod: 'morning',
    };
    // Notify semua listener setelah reset
    Object.keys(this._state).forEach(key => {
      if (this._listeners[key]) {
        this._listeners[key].forEach(cb => cb(this._state[key], undefined));
      }
    });
  }
}

// Export instance tunggal — semua file import objek yang sama
const gameState = new GameState();
export default gameState;
