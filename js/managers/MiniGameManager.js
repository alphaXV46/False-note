// ===============================
// FILE: js/managers/MiniGameManager.js
// DESKRIPSI: Mengelola semua jenis mini-game
// dengan logika Object Selection yang seragam.
// State diubah lewat gameState, bukan disimpan lokal.
// ===============================
import gameState from './GameState.js';

class MiniGameManager {
  // ===============================
  // CONSTRUCTOR
  // PARAMETER: config (object) — konfigurasi mini-game dari JSON harian
  //   config.question (string) — pertanyaan mini-game
  //   config.options (array) — pilihan jawaban
  //   config.type (string) — tipe mini-game
  //   config.integrityCostIfWrong (number) — pengurangan integrity jika salah
  //   config.suspicionGain (number) — penambahan suspicion jika benar
  // ===============================
  constructor(config) {
    this.question = config.question || '';
    this.options = config.options || [];
    this.type = config.type || 'generic';
    this.integrityCostIfWrong = config.integrityCostIfWrong || 10;
    this.suspicionGain = config.suspicionGain || 5;

    // Callback untuk menampilkan feedback di scene
    this.onFeedback = null;

    // Callback saat mini-game selesai
    this.onComplete = null;

    // Track apakah sudah dijawab
    this._answered = false;
  }

  // ===============================
  // FUNGSI: checkAnswer()
  // DESKRIPSI: Evaluasi pilihan player dan update state
  // lewat gameState (bukan variabel lokal).
  // PARAMETER: selectedIndex (number)
  // RETURN: object — { correct: boolean, feedback: string }
  // ===============================
  checkAnswer(selectedIndex) {
    if (this._answered) return null;
    this._answered = true;

    const opt = this.options[selectedIndex];
    if (!opt) return null;

    if (opt.isCorrect) {
      return this._onCorrect(opt.evidenceGain, opt.feedbackRight);
    } else {
      return this._onWrong(opt.feedbackWrong);
    }
  }

  // ===============================
  // FUNGSI: _onCorrect()
  // DESKRIPSI: Handle jawaban benar — tambah evidence ke inventory,
  // naikkan suspicion, reset morning fail streak.
  // PARAMETER: evidenceId (string|undefined), feedback (string)
  // RETURN: object
  // ===============================
  _onCorrect(evidenceId, feedback) {
    // Tambah bukti ke inventory jika ada
    if (evidenceId) {
      const inv = gameState.get('inventory');
      if (!inv.includes(evidenceId)) {
        inv.push(evidenceId);
        gameState.set('inventory', inv);
      }
    }

    // Naikkan suspicion (bukti ditemukan = lawan curiga)
    gameState.modify('suspicion', this.suspicionGain);

    // Reset morning fail streak
    gameState.set('morningFailStreak', 0);

    if (this.onFeedback) this.onFeedback(feedback, true);
    if (this.onComplete) this.onComplete(true);

    return { correct: true, feedback };
  }

  // ===============================
  // FUNGSI: _onWrong()
  // DESKRIPSI: Handle jawaban salah — kurangi integrity,
  // tambah morning fail streak jika di MorningScene.
  // PARAMETER: feedback (string)
  // RETURN: object
  // ===============================
  _onWrong(feedback) {
    gameState.modify('integrity', -this.integrityCostIfWrong);

    // Track streak gagal untuk morning mini-game
    if (this.type === 'email_sorting') {
      const currentStreak = gameState.get('morningFailStreak') + 1;
      gameState.set('morningFailStreak', currentStreak);

      // 3 hari berturut-turut gagal → suspicion +30
      if (currentStreak >= 3) {
        gameState.modify('suspicion', 30);
        gameState.set('morningFailStreak', 0);
        console.log('[MiniGameManager] 3x gagal berturut. Suspicion +30.');
      }
    }

    if (this.onFeedback) this.onFeedback(feedback, false);
    if (this.onComplete) this.onComplete(false);

    return { correct: false, feedback };
  }

  // ===============================
  // FUNGSI: reset()
  // DESKRIPSI: Reset state mini-game untuk penggunaan ulang.
  // ===============================
  reset() {
    this._answered = false;
  }
}

export default MiniGameManager;
