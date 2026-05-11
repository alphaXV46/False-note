// ===============================
// FILE: js/utils/typewriter.js
// DESKRIPSI: Fungsi utilitas untuk efek typewriter teks
// ===============================

export function typewriterText(scene, x, y, fullText, speed = 30, style = {}, onComplete = null) {
  // Buat objek teks kosong
  const textObj = scene.add.text(x, y, '', {
    fontFamily: 'Inter, sans-serif',
    fontSize: '14px',
    color: '#ffffff',
    wordWrap: { width: scene.cameras.main.width - 80 },
    lineSpacing: 6,
    ...style
  });

  let currentCharIndex = 0;
  let isFinished = false;

  // Fungsi untuk melompati efek langsung ke teks penuh
  const skipToFullText = () => {
    if (isFinished) return;
    
    isFinished = true;
    textObj.setText(fullText);
    
    // Hentikan event timer
    if (timerEvent) {
      timerEvent.remove();
    }
    
    // Hapus listener klik/tap (pointerdown)
    scene.input.off('pointerdown', skipToFullText);
    
    // Panggil callback onComplete jika ada
    if (onComplete) {
      onComplete();
    }
  };

  // Event timer untuk mengetik satu per satu
  // Menggunakan scene.time.addEvent() agar bisa otomatis pause jika scene di-pause
  const timerEvent = scene.time.addEvent({
    delay: speed,
    callback: () => {
      currentCharIndex++;
      textObj.setText(fullText.substring(0, currentCharIndex));

      // Jika teks sudah selesai diketik
      if (currentCharIndex >= fullText.length) {
        skipToFullText();
      }
    },
    callbackScope: scene,
    loop: true
  });

  // Klik/tap di mana saja pada layar akan skip efek typewriter
  scene.input.on('pointerdown', skipToFullText);

  // Return objek teks dan fungsi pembantu (jika dibutuhkan)
  return {
    textObj: textObj,
    skip: skipToFullText,
    onComplete: (cb) => {
      onComplete = cb;
      if (isFinished) onComplete();
    }
  };
}
