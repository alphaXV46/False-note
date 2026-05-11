// ===============================
// FILE: js/managers/FallacyManager.js
// DESKRIPSI: Mengelola sistem debat fallacy di EveningScene.
// Menangani logika SANGGAH!, pengecekan bukti,
// dan update state lewat gameState.
// ===============================
import gameState from './GameState.js';

class FallacyManager {
  // ===============================
  // CONSTRUCTOR
  // PARAMETER: debateConfig (object) — konfigurasi debat dari JSON harian
  //   debateConfig.opponent (string) — nama lawan debat
  //   debateConfig.fallacyType (string) — jenis fallacy hari ini
  //   debateConfig.fallacyExplanation (string) — penjelasan fallacy
  //   debateConfig.fallacyCounterTip (string) — tip melawan fallacy
  //   debateConfig.statements (array) — pernyataan lawan
  //   debateConfig.correctEvidence (string) — ID bukti yang benar
  //   debateConfig.publicTrustChange (number) — perubahan trust jika benar
  //   debateConfig.wrongFeedback (string) — feedback jika salah
  // ===============================
  constructor(debateConfig) {
    this.opponent = debateConfig.opponent || 'Lawan';
    this.fallacyType = debateConfig.fallacyType || 'Unknown';
    this.fallacyExplanation = debateConfig.fallacyExplanation || '';
    this.fallacyCounterTip = debateConfig.fallacyCounterTip || '';
    this.statements = debateConfig.statements || [];
    this.correctEvidence = debateConfig.correctEvidence || '';
    this.publicTrustChange = debateConfig.publicTrustChange || 10;
    this.wrongFeedback = debateConfig.wrongFeedback || 'Sanggahan gagal.';

    // Cooldown tracking
    this._cooldownActive = false;

    // Callback
    this.onFeedback = null;
    this.onSanggahResult = null;
  }

  // ===============================
  // FUNGSI: getStatements()
  // DESKRIPSI: Ambil daftar pernyataan lawan untuk ditampilkan.
  // RETURN: array
  // ===============================
  getStatements() {
    return this.statements;
  }

  // ===============================
  // FUNGSI: getAvailableEvidence()
  // DESKRIPSI: Ambil daftar bukti yang dimiliki player
  // dari gameState inventory.
  // RETURN: array of string (evidence IDs)
  // ===============================
  getAvailableEvidence() {
    return gameState.get('inventory') || [];
  }

  // ===============================
  // FUNGSI: handleSanggah()
  // DESKRIPSI: Mengecek bukti yang dipilih saat debat.
  // State diupdate lewat gameState.
  // PARAMETER: evidenceId (string)
  // RETURN: object — { success: boolean, feedback: string }
  // ===============================
  handleSanggah(evidenceId) {
    if (this._cooldownActive) {
      return { success: false, feedback: 'Cooldown aktif. Tunggu sebentar.' };
    }

    // Aktifkan cooldown 0.5 detik
    this._cooldownActive = true;
    setTimeout(() => { this._cooldownActive = false; }, 500);

    if (evidenceId === this.correctEvidence) {
      return this._onSanggahSuccess();
    } else {
      return this._onSanggahFail();
    }
  }

  // ===============================
  // FUNGSI: _onSanggahSuccess()
  // DESKRIPSI: Handle sanggahan berhasil.
  // Suspicion naik = ancaman lawan melemah.
  // RETURN: object
  // ===============================
  _onSanggahSuccess() {
    gameState.modify('suspicion', this.publicTrustChange);
    const feedback = 'Bukti kuat. Lawan terdiam.';

    if (this.onFeedback) this.onFeedback(feedback, true);
    if (this.onSanggahResult) this.onSanggahResult(true);

    return { success: true, feedback };
  }

  // ===============================
  // FUNGSI: _onSanggahFail()
  // DESKRIPSI: Handle sanggahan gagal.
  // Integrity berkurang, fallacy counter naik.
  // RETURN: object
  // ===============================
  _onSanggahFail() {
    gameState.modify('integrity', -10);
    gameState.set('fallacyCounter', gameState.get('fallacyCounter') + 1);

    const log = gameState.get('fallacyLog');
    log.push(this.fallacyType);
    gameState.set('fallacyLog', log);

    const feedback = this.wrongFeedback;

    if (this.onFeedback) this.onFeedback(feedback, false);
    if (this.onSanggahResult) this.onSanggahResult(false);

    return { success: false, feedback };
  }

  // ===============================
  // FUNGSI: isCooldownActive()
  // DESKRIPSI: Cek apakah tombol SANGGAH! dalam cooldown.
  // RETURN: boolean
  // ===============================
  isCooldownActive() {
    return this._cooldownActive;
  }

  // ===============================
  // FUNGSI: getFallacyCard()
  // DESKRIPSI: Generate data untuk Daily Fallacy Card di ResultScene.
  // RETURN: object — { type, explanation, counterTip }
  // ===============================
  getFallacyCard() {
    return {
      type: this.fallacyType,
      explanation: this.fallacyExplanation,
      counterTip: this.fallacyCounterTip
    };
  }
}

export default FallacyManager;
