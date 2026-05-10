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

        // Background
        this.add.tileSprite(640, 360, 1280, 720, 'grid_pattern').setAlpha(0.2);
        
        this.createUI();
        this.createTimer();
        
        // Container untuk Overlay Mini-game
        this.overlay = this.add.container(0, 0).setVisible(false).setDepth(100);
        this.overlayBg = this.add.graphics().fillStyle(0x000000, 0.9).fillRect(0, 0, 1280, 720);
        this.overlay.add(this.overlayBg);
    }

    createUI() {
        // Top Bar Statistik
        this.add.graphics().fillStyle(0x1a233a, 1).fillRect(0, 0, 1280, 60);
        this.statText = this.add.text(20, 20, `INTEGRITAS: ${GameState.integritasScore} | HARI: ${GameState.currentDay} / 7`, { fontSize: '18px', fontStyle: 'bold' });
        
        // Panel Tugas (Kiri)
        this.add.text(50, 100, 'TUGAS MAGANG (WAJIB)', { fontSize: '24px', fontStyle: 'bold', color: '#3498db' });
        const taskNames = [
            '1. Verifikasi Berkas Beasiswa',
            '2. Sortir Email Legitimate',
            '3. Rekap Surat Menyurat'
        ];
        taskNames.forEach((name, i) => {
            this.createButton(250, 200 + (i * 80), name, () => this.openTask(i));
        });

        // Panel Investigasi (Kanan) - Muncul setelah Tugas 1
        this.folderPanel = this.add.container(800, 0).setVisible(false);
        this.folderPanel.add(this.add.text(50, 100, 'FOLDER TERSEMBUNYI', { fontSize: '24px', color: '#f1c40f', fontStyle: 'bold' }));
        this.folderPanel.add(this.createButton(250, 200, 'Akses & Dekripsi', () => this.startInvestigation()));

        // Suspicion Meter (Bawah)
        this.add.text(20, 680, 'SUSPICION METER', { fontSize: '14px', color: '#e74c3c' });
        this.suspicionBar = this.add.graphics();
        this.updateSuspicion();
    }

    updateSuspicion() {
        this.suspicionBar.clear();
        this.suspicionBar.fillStyle(0x333333).fillRect(150, 680, 1080, 20);
        const color = GameState.suspicionMeter > 80 ? 0xff0000 : 0xe74c3c;
        this.suspicionBar.fillStyle(color).fillRect(150, 680, 10.8 * GameState.suspicionMeter, 20);
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
        if (index === 0) this.folderPanel.setVisible(true);
        this.updateSuspicion();
        this.overlay.setVisible(false);
        
        if (this.tasksCompleted === 3) {
            GameState.integritasScore += 5;
            GameState.suspicionMeter = Math.max(0, GameState.suspicionMeter - 5);
            AchievementSystem.unlock("Disiplin");
            this.showAchievement("Disiplin", "+5 Integritas, -5 Suspicion");
            this.showMessage("Semua Tugas Selesai!", "#00ff00");
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
