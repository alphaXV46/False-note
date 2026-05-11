// ===============================
// FILE: js/utils/typewriter.js
// DESKRIPSI: Fungsi utilitas untuk efek typewriter teks pada DOM
// ===============================

export function typewriterText(scene, speakerName, fullText, speed = 30, onComplete = null) {
  // Ambil referensi DOM
  const dialogOverlay = document.getElementById('dialog-overlay');
  const dialogName = document.getElementById('dialog-name');
  const dialogText = document.getElementById('dialog-text');
  const dialogContinue = document.getElementById('dialog-continue');
  const dialogBox = document.getElementById('dialog-box');

  if (!dialogOverlay || !dialogName || !dialogText) return null;

  // Tampilkan overlay
  dialogOverlay.classList.remove('hidden');
  
  // Set nama speaker
  dialogName.textContent = speakerName.toUpperCase();
  
  // Kosongkan teks dan sembunyikan hint
  dialogText.textContent = '';
  if (dialogContinue) dialogContinue.classList.add('hidden');

  let currentCharIndex = 0;
  let isFinished = false;

  // Fungsi untuk melompati efek langsung ke teks penuh
  const skipToFullText = () => {
    if (isFinished) return;
    
    isFinished = true;
    dialogText.innerHTML = fullText.replace(/\n/g, '<br>');
    
    // Hentikan event timer
    if (timerEvent) {
      timerEvent.remove();
    }
    
    // Hapus listener klik DOM
    dialogBox.removeEventListener('click', skipToFullText);
    
    // Panggil callback onComplete jika ada
    if (onComplete) {
      onComplete();
    }
  };

  // Event timer untuk mengetik satu per satu
  const timerEvent = scene.time.addEvent({
    delay: speed,
    callback: () => {
      currentCharIndex++;
      const currentString = fullText.substring(0, currentCharIndex);
      dialogText.innerHTML = currentString.replace(/\n/g, '<br>');

      // Jika teks sudah selesai diketik
      if (currentCharIndex >= fullText.length) {
        skipToFullText();
      }
    },
    callbackScope: scene,
    loop: true
  });

  // Klik/tap pada DOM dialog box akan skip efek typewriter
  dialogBox.addEventListener('click', skipToFullText);

  // Return objek fungsi pembantu
  return {
    skip: skipToFullText,
    destroy: () => {
      dialogOverlay.classList.add('hidden');
      if (timerEvent) timerEvent.remove();
      dialogBox.removeEventListener('click', skipToFullText);
    },
    onComplete: (cb) => {
      onComplete = cb;
      if (isFinished) onComplete();
    }
  };
}
