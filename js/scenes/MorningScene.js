/**
 * Morning Scene - Rutinitas Magang
 * Mengimplementasikan 3 tugas wajib dan 1 investigasi sampingan.
 */
class MorningScene extends BaseScene {
    constructor() {
        super('MorningScene');
        this.tasksCompleted = 0;
        this.timeRemaining = 90;
        this.taskStatus = [false, false, false];
        this.investigationDone = false;
        this.isOverlapping = false;
    }

    create() {
        // Reset State harian
        this.tasksCompleted = 0;
        this.timeRemaining = 90;
        this.taskStatus = [false, false, false];
        this.investigationDone = false;

        // 1. Background (Cinematic Asset) with Zoom-in Transition
        this.bg = this.add.image(640, 360, 'morning_bg').setDisplaySize(1350, 760); // Start slightly larger
        this.bg.setAlpha(0);
        
        this.tweens.add({
            targets: this.bg,
            alpha: 1,
            displayHeight: 720,
            displayWidth: 1280,
            duration: 2000,
            ease: 'Power2'
        });

        // 2. Character Sprite Group (Empty center initially)
        this.chars = this.add.group();

        this.createUI();
        this.createTimer();
        
        // Memicu animasi masuk karakter sebelum mini-game verifikasi berkas dimulai
        this.time.delayedCall(1000, () => {
            this.enterCharacter('char_raka', 'left');
            this.showDialogue('Raka', 'Hari ini adalah hari pertama magang di FH UI. Aku harus tetap fokus dan teliti dalam memproses berkas beasiswa ini.');
        });

        // Container untuk Overlay Mini-game
        this.overlay = this.add.container(0, 0).setVisible(false).setDepth(100);
        this.overlayBg = this.add.graphics().fillStyle(0x000000, 0.4).fillRect(0, 0, 1280, 720);
        this.overlay.add(this.overlayBg);
    }

    /**
     * Efek masuk karakter ala VN
     */
    enterCharacter(key, position) {
        const xPos = position === 'left' ? 300 : (position === 'right' ? 980 : 640);
        const char = this.add.image(xPos, 800, key).setOrigin(0.5, 1);
        char.setScale(0.8);
        char.setAlpha(0);

        this.tweens.add({
            targets: char,
            y: 720,
            alpha: 1,
            duration: 800,
            ease: 'Back.easeOut'
        });

        this.chars.add(char);
        return char;
    }

    createUI() {
        // Update CSS UI Initial State
        this.updateSuspicionMeter(GameState.suspicionMeter);
        
        // Update Task Panel list in DOM
        const taskList = document.getElementById('task-list');
        if (taskList) {
            taskList.innerHTML = '';
            const taskNames = ['Verifikasi Berkas', 'Sortir Email', 'Rekap Surat'];
            taskNames.forEach((name, i) => {
                const li = document.createElement('li');
                li.className = 'flex items-center space-x-2 cursor-pointer hover:text-white transition-colors';
                li.innerHTML = `<div class="h-2 w-2 rounded-full ${this.taskStatus[i] ? 'bg-green-500' : 'bg-slate-700'}"></div><span>${name}</span>`;
                li.onclick = () => this.openTask(i);
                taskList.appendChild(li);
            });

            // Tambahkan tugas investigasi jika tugas pertama selesai
            if (this.taskStatus[0] && !this.investigationDone) {
                const li = document.createElement('li');
                li.className = 'flex items-center space-x-2 cursor-pointer text-yellow-400 hover:text-yellow-300 transition-colors mt-4 border-t border-slate-700 pt-2';
                li.innerHTML = `<div class="h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></div><span>Akses Folder Tersembunyi</span>`;
                li.onclick = () => this.startInvestigation();
                taskList.appendChild(li);
            } else if (this.investigationDone) {
                const li = document.createElement('li');
                li.className = 'flex items-center space-x-2 text-slate-500 mt-4 border-t border-slate-700 pt-2';
                li.innerHTML = `<div class="h-2 w-2 rounded-full bg-green-500"></div><span>Investigasi Selesai</span>`;
                taskList.appendChild(li);
            }
        }
    }

    updateSuspicion() {
        // Override old updateSuspicion to use CSS method
        this.updateSuspicionMeter(GameState.suspicionMeter);
    }

    createTimer() {
        this.timerText = this.add.text(640, 30, `WAKTU: 01:30`, { fontSize: '24px', fontStyle: 'bold' }).setOrigin(0.5);
        this.timeEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timeRemaining--;
                this.timerText.setText(`WAKTU: ${TimerUtils.formatTime(this.timeRemaining)}`);
                if (this.timeRemaining <= 0) this.handleTimeout();
            },
            loop: true
        });
    }

    openTask(index) {
        if (this.taskStatus[index]) return;
        this.overlay.setVisible(true);
        this.overlay.list.forEach(item => { if (item !== this.overlayBg) item.destroy(); });

        if (index === 0) this.miniGameVerifikasi();
        else if (index === 1) this.miniGameEmail();
        else if (index === 2) this.miniGameRekap();
    }

    // --- MINI GAMES ---

    miniGameVerifikasi() {
        const title = this.add.text(640, 100, 'VERIFIKASI: NIM vs IPK > 3.0', { fontSize: '24px' }).setOrigin(0.5);
        const data = [
            { nim: '210601', ipk: 3.5, valid: true },
            { nim: '210602', ipk: 2.8, valid: false },
            { nim: '210603', ipk: 3.2, valid: true }
        ];
        let curr = 0;
        const info = this.add.text(640, 300, `NIM: ${data[curr].nim} | IPK: ${data[curr].ipk}`, { fontSize: '32px' }).setOrigin(0.5);
        
        const check = (choice) => {
            if (choice === data[curr].valid) {
                GameState.integritasScore += 2;
                this.showMessage("Benar!", "#00ff00");
            } else {
                GameState.integritasScore -= 3;
                GameState.suspicionMeter += 5;
                this.showMessage("Salah!", "#ff0000");
            }
            curr++;
            if (curr < data.length) info.setText(`NIM: ${data[curr].nim} | IPK: ${data[curr].ipk}`);
            else this.completeTask(0);
        };

        this.overlay.add([title, info, 
            this.createButton(500, 450, 'TERIMA', () => check(true)),
            this.createButton(780, 450, 'TOLAK', () => check(false))
        ]);
    }

    miniGameEmail() {
        const title = this.add.text(640, 100, 'SORTIR EMAIL: LEGIT vs PHISH', { fontSize: '24px' }).setOrigin(0.5);
        const emails = [
            { txt: 'From: rektorat@ui.ac.id\nSubj: Undangan Rapat', legit: true },
            { txt: 'From: hadiah-gratis@gmail.com\nSubj: KLIK DISINI!', legit: false }
        ];
        let curr = 0;
        const info = this.add.text(640, 300, emails[curr].txt, { fontSize: '20px', align: 'center' }).setOrigin(0.5);

        const check = (choice) => {
            if (choice === emails[curr].legit) GameState.integritasScore += 2;
            else { GameState.integritasScore -= 3; GameState.suspicionMeter += 5; }
            curr++;
            if (curr < emails.length) info.setText(emails[curr].txt);
            else this.completeTask(1);
        };

        this.overlay.add([title, info,
            this.createButton(500, 450, 'LEGIT', () => check(true)),
            this.createButton(780, 450, 'PHISH', () => check(false))
        ]);
    }

    miniGameRekap() {
        const title = this.add.text(640, 100, 'REKAP SURAT: URUTKAN TANGGAL', { fontSize: '24px' }).setOrigin(0.5);
        this.overlay.add(title);
        
        const dates = [
            { txt: '10 Mei', val: 10 },
            { txt: '12 Mei', val: 12 },
            { txt: '15 Mei', val: 15 }
        ];
        let expected = 0;
        dates.forEach((d, i) => {
            const btn = this.createButton(640, 200 + (i * 80), d.txt, () => {
                if (d.val === dates[expected].val) {
                    btn.setVisible(false);
                    expected++;
                    if (expected === dates.length) this.completeTask(2);
                } else {
                    GameState.suspicionMeter += 5;
                    this.showMessage("Urutan Salah!", "#ff0000");
                }
            });
            this.overlay.add(btn);
        });
    }

    startInvestigation() {
        if (this.investigationDone) return;
        this.overlay.setVisible(true);
        this.overlay.list.forEach(item => { if (item !== this.overlayBg) item.destroy(); });

        this.overlay.add(this.add.text(640, 150, 'DECRYPT NOTE: 6-1-12-19-5', { fontSize: '32px', color: '#f1c40f' }).setOrigin(0.5));
        const input = this.add.text(640, 300, '_ _ _ _ _', { fontSize: '48px', letterSpacing: 10 }).setOrigin(0.5);
        this.overlay.add(input);

        let typed = "";
        let hintUsed = false;

        const hintBtn = this.createButton(1100, 100, 'Hint', () => {
            hintUsed = true;
            this.showMessage("1=A, 2=B, 3=C...", "#f1c40f");
        });
        this.overlay.add(hintBtn);

        this.input.keyboard.on('keydown', (e) => {
            if (!this.overlay.visible) return;
            if (e.keyCode >= 65 && e.keyCode <= 90 && typed.length < 5) {
                typed += e.key.toUpperCase();
            } else if (e.keyCode === 8) {
                typed = typed.slice(0, -1);
            } else if (e.keyCode === 13 && typed === "FALSE") {
                this.finishInvestigation(hintUsed);
                this.input.keyboard.off('keydown');
            }
            input.setText(typed.padEnd(5, '_').split('').join(' '));
        });
    }

    finishInvestigation(hintUsed) {
        this.investigationDone = true;
        GameState.buktiStrength += 10;
        GameState.inventoryEvidence.push("False Note Fragment");
        
        // Refresh UI
        this.createUI();

        if (!hintUsed) {
            GameState.integritasScore += 5;
            AchievementSystem.unlock("Mandiri");
            this.showAchievement("Mandiri", "+5 Integritas");
        }

        // #Kerja Keras check: Investigasi setelah semua tugas wajib selesai
        if (this.tasksCompleted === 3) {
            GameState.integritasScore += 3;
            AchievementSystem.unlock("Kerja Keras");
            this.showAchievement("Kerja Keras", "+3 Integritas");
        }

        this.showMessage("Investigasi Berhasil!", "#00ff00");
        this.time.delayedCall(1500, () => this.overlay.setVisible(false));
    }

    completeTask(index) {
        this.taskStatus[index] = true;
        this.tasksCompleted++;
        GameState.suspicionMeter = Math.max(0, GameState.suspicionMeter - 10);
        
        // Refresh UI to show completed status in CSS Task Panel
        this.createUI();
        this.updateSuspicion();
        this.overlay.setVisible(false);
        
        // Jika tugas 1 selesai, tambahkan opsi investigasi ke panel tugas
        if (index === 0 && !this.investigationDone) {
            this.showDialogue('Raka', 'Tunggu, ada folder yang tidak biasa di desktop ini. Mungkin aku harus memeriksanya...');
        }

        if (this.tasksCompleted === 3) {
            GameState.integritasScore += 5;
            GameState.suspicionMeter = Math.max(0, GameState.suspicionMeter - 5);
            AchievementSystem.unlock("Disiplin");
            this.showAchievement("Disiplin", "+5 Integritas, -5 Suspicion");
            this.showMessage("Semua Tugas Selesai!", "#00ff00");
            this.showDialogue('Raka', 'Semua tugas hari ini sudah selesai. Sekarang tinggal menunggu instruksi selanjutnya dari Dr. Adrian.');
        }
    }

    handleTimeout() {
        if (this.tasksCompleted < 2) {
            this.transitionTo('GameOverScene', { reason: "Anda tidak menyelesaikan tugas minimum harian." });
        } else {
            this.transitionTo('AfternoonScene');
        }
    }
}
