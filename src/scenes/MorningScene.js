class MorningScene extends BaseScene {
    constructor() {
        super('MorningScene');
        this.tasksCompleted = 0;
        this.totalTasks = 3;
        this.timeRemaining = 90;
        this.isInvestigating = false;
        this.investigationDone = false;
        this.taskStatus = [false, false, false];
    }

    create() {
        // Reset local state
        this.tasksCompleted = 0;
        this.timeRemaining = 90;
        this.isInvestigating = false;
        this.investigationDone = false;
        this.taskStatus = [false, false, false];

        // Background
        this.add.tileSprite(640, 360, 1280, 720, 'grid_pattern').setAlpha(0.2);
        this.add.graphics().fillStyle(0x0a0f1e, 0.8).fillRect(0, 0, 1280, 720);

        this.createTopBar();
        this.createBottomBar();
        this.createLeftPanel();
        this.createRightPanel();
        this.createTimer();

        // Overlay for mini-games
        this.overlay = this.add.container(0, 0).setVisible(false).setDepth(100);
        this.overlayBg = this.add.graphics().fillStyle(0x000000, 0.9).fillRect(0, 0, 1280, 720);
        this.overlay.add(this.overlayBg);
    }

    createTopBar() {
        const topBar = this.add.graphics();
        topBar.fillStyle(0x1a233a, 1);
        topBar.fillRect(0, 0, 1280, 60);
        topBar.lineStyle(2, 0x3498db, 1);
        topBar.strokeLineShape(new Phaser.Geom.Line(0, 60, 1280, 60));

        this.statTexts = {
            integrity: this.add.text(20, 20, `INTEGRITAS: ${GameState.integritasScore}`, { fontSize: '18px', color: '#00ff00', fontStyle: 'bold' }),
            reputation: this.add.text(250, 20, `REPUTASI: ${GameState.reputasiScore}`, { fontSize: '18px', color: '#3498db' }),
            evidence: this.add.text(480, 20, `BUKTI: ${GameState.buktiStrength}`, { fontSize: '18px', color: '#f1c40f' }),
            day: this.add.text(1100, 20, `HARI KE-${GameState.currentDay} / 7`, { fontSize: '18px', color: '#ffffff' })
        };
    }

    createBottomBar() {
        const bottomBar = this.add.graphics();
        bottomBar.fillStyle(0x1a233a, 1);
        bottomBar.fillRect(0, 660, 1280, 60);

        this.add.text(20, 680, 'SUSPICION METER', { fontSize: '16px', color: '#e74c3c' });
        
        this.suspicionBar = this.add.graphics();
        this.updateSuspicionBar();
    }

    updateSuspicionBar() {
        this.suspicionBar.clear();
        this.suspicionBar.fillStyle(0x333333, 1);
        this.suspicionBar.fillRect(180, 680, 1000, 20);
        
        const color = GameState.suspicionMeter > 70 ? 0xff0000 : 0xe74c3c;
        this.suspicionBar.fillStyle(color, 1);
        this.suspicionBar.fillRect(180, 680, 10 * GameState.suspicionMeter, 20);
    }

    createLeftPanel() {
        this.add.text(50, 100, 'TUGAS MAGANG HARI INI', { fontSize: '24px', color: '#ffffff', fontStyle: 'bold' });
        
        this.taskButtons = [];
        const taskNames = [
            '1. Verifikasi Berkas Beasiswa',
            '2. Sortir Email Masuk',
            '3. Rekap Surat Menyurat'
        ];

        taskNames.forEach((name, i) => {
            const btn = this.createButton(250, 200 + (i * 80), name, () => this.handleTaskClick(i));
            this.taskButtons.push(btn);
        });
    }

    createRightPanel() {
        this.rightPanelContainer = this.add.container(800, 0);
        this.investigationTitle = this.add.text(50, 100, 'FOLDER TERSEMBUNYI', { fontSize: '24px', color: '#f1c40f', fontStyle: 'bold' });
        this.investigationBtn = this.createButton(250, 200, 'Akses Folder', () => this.startInvestigation());
        
        this.rightPanelContainer.add([this.investigationTitle, this.investigationBtn]);
        this.rightPanelContainer.setVisible(false);
    }

    createTimer() {
        this.timerText = this.add.text(640, 30, `WAKTU: ${this.timeRemaining}s`, { fontSize: '24px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        
        this.timeEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timeRemaining--;
                this.timerText.setText(`WAKTU: ${this.timeRemaining}s`);
                if (this.timeRemaining <= 0) {
                    this.handleTimeout();
                }
            },
            loop: true
        });
    }

    handleTaskClick(index) {
        if (this.taskStatus[index]) return;
        
        switch(index) {
            case 0: this.startTask1(); break;
            case 1: this.startTask2(); break;
            case 2: this.startTask3(); break;
        }
    }

    // --- MINI GAMES ---

    startTask1() {
        this.showOverlay();
        this.overlay.add(this.add.text(640, 150, 'VERIFIKASI BEASISWA\nCocokkan NIM dengan IPK > 3.0', { fontSize: '24px', align: 'center' }).setOrigin(0.5));
        
        const data = [
            { nim: '210601', ipk: 3.5, valid: true },
            { nim: '210602', ipk: 2.8, valid: false },
            { nim: '210603', ipk: 3.2, valid: true },
            { nim: '210604', ipk: 3.9, valid: true },
            { nim: '210605', ipk: 2.5, valid: false }
        ];

        let current = 0;
        const infoText = this.add.text(640, 300, `NIM: ${data[current].nim} | IPK: ${data[current].ipk}`, { fontSize: '32px' }).setOrigin(0.5);
        this.overlay.add(infoText);

        const approveBtn = this.createButton(540, 450, 'TERIMA', () => {
            if (data[current].valid) this.completeSubTask();
            else this.failSubTask();
            next();
        });
        
        const rejectBtn = this.createButton(740, 450, 'TOLAK', () => {
            if (!data[current].valid) this.completeSubTask();
            else this.failSubTask();
            next();
        });

        this.overlay.add([approveBtn, rejectBtn]);

        const next = () => {
            current++;
            if (current < data.length) {
                infoText.setText(`NIM: ${data[current].nim} | IPK: ${data[current].ipk}`);
            } else {
                this.finishTask(0);
            }
        };
    }

    startTask2() {
        this.showOverlay();
        this.overlay.add(this.add.text(640, 150, 'SORTIR EMAIL\nPilih email Legitimate vs Phishing', { fontSize: '24px', align: 'center' }).setOrigin(0.5));

        const emails = [
            { txt: 'From: it-support@univ.ac.id\nSubject: Ganti Password', type: 'legit' },
            { txt: 'From: admin-palsu@gmail.com\nSubject: DAPAT HADIAH 1M!', type: 'phish' },
            { txt: 'From: rektorat@univ.ac.id\nSubject: Undangan Rapat', type: 'legit' }
        ];

        let current = 0;
        const content = this.add.text(640, 300, emails[current].txt, { fontSize: '20px', backgroundColor: '#111', padding: 20 }).setOrigin(0.5);
        this.overlay.add(content);

        const legitBtn = this.createButton(540, 500, 'LEGITIMATE', () => {
            if (emails[current].type === 'legit') this.completeSubTask();
            else this.failSubTask();
            next();
        });

        const phishBtn = this.createButton(740, 500, 'PHISHING', () => {
            if (emails[current].type === 'phish') this.completeSubTask();
            else this.failSubTask();
            next();
        });

        this.overlay.add([legitBtn, phishBtn]);

        const next = () => {
            current++;
            if (current < emails.length) {
                content.setText(emails[current].txt);
            } else {
                this.finishTask(1);
            }
        };
    }

    startTask3() {
        this.showOverlay();
        this.overlay.add(this.add.text(640, 150, 'REKAP SURAT\nUrutkan tanggal (Klik berurutan dari terlama)', { fontSize: '24px', align: 'center' }).setOrigin(0.5));

        const dates = [
            { label: '10 Mei 2024', val: 10 },
            { label: '12 Mei 2024', val: 12 },
            { label: '15 Mei 2024', val: 15 },
            { label: '20 Mei 2024', val: 20 }
        ];

        const shuffled = [...dates].sort(() => Math.random() - 0.5);
        let expectedIdx = 0;

        shuffled.forEach((d, i) => {
            const btn = this.createButton(640, 250 + (i * 70), d.label, () => {
                if (d.val === dates[expectedIdx].val) {
                    btn.setVisible(false);
                    expectedIdx++;
                    if (expectedIdx === dates.length) this.finishTask(2);
                } else {
                    this.failSubTask();
                }
            });
            this.overlay.add(btn);
        });
    }

    startInvestigation() {
        this.isInvestigating = true;
        this.showOverlay();
        this.overlay.add(this.add.text(640, 150, 'DECRYPT NOTE\n6-1-12-19-5 = ?', { fontSize: '32px', color: '#f1c40f' }).setOrigin(0.5));
        
        const input = this.add.text(640, 300, '_ _ _ _ _', { fontSize: '48px', letterSpacing: 10 }).setOrigin(0.5);
        this.overlay.add(input);

        let typed = "";
        this.input.keyboard.on('keydown', (event) => {
            if (!this.overlay.visible || !this.isInvestigating) return;
            
            if (event.keyCode >= 65 && event.keyCode <= 90) {
                if (typed.length < 5) {
                    typed += event.key.toUpperCase();
                    input.setText(typed.padEnd(5, '_').split('').join(' '));
                }
            } else if (event.keyCode === 8) {
                typed = typed.slice(0, -1);
                input.setText(typed.padEnd(5, '_').split('').join(' '));
            } else if (event.keyCode === 13) {
                if (typed === "FALSE") {
                    this.investigationSuccess();
                } else {
                    this.investigationFail();
                }
                this.input.keyboard.off('keydown');
            }
        });

        this.overlay.add(this.add.text(640, 500, 'Ketik jawaban lalu tekan ENTER', { fontSize: '18px' }).setOrigin(0.5));
    }

    investigationSuccess() {
        GameState.buktiStrength += 10;
        GameState.inventoryEvidence.push("False Note Fragment");
        this.investigationDone = true;
        
        if (this.tasksCompleted === 3) {
            GameState.integritasScore += 3; // Kerja Keras bonus
            this.add.text(640, 400, 'BONUS KERJA KERAS: +3', { color: '#00ff00' }).setOrigin(0.5);
        }
        
        this.add.text(640, 450, 'DECRYPT BERHASIL!\nItem: False Note Fragment didapat', { color: '#00ff00', align: 'center' }).setOrigin(0.5);
        this.time.delayedCall(2000, () => this.hideOverlay());
    }

    investigationFail() {
        GameState.suspicionMeter += 5;
        this.updateSuspicionBar();
        this.add.text(640, 450, 'DECRYPT GAGAL!\nSuspicion naik', { color: '#ff0000', align: 'center' }).setOrigin(0.5);
        this.time.delayedCall(2000, () => this.hideOverlay());
    }

    // --- LOGIC HELPERS ---

    showOverlay() {
        this.overlay.setVisible(true);
        this.overlay.list.forEach(item => {
            if (item !== this.overlayBg) item.destroy();
        });
        this.overlay.add(this.overlayBg);
    }

    hideOverlay() {
        this.overlay.setVisible(false);
        this.isInvestigating = false;
        this.updateStats();
    }

    completeSubTask() {
        GameState.integritasScore += 2;
        GameState.suspicionMeter = Math.max(0, GameState.suspicionMeter - 2);
    }

    failSubTask() {
        GameState.integritasScore -= 3;
        GameState.suspicionMeter += 5;
    }

    finishTask(index) {
        this.taskStatus[index] = true;
        this.tasksCompleted++;
        
        GameState.suspicionMeter = Math.max(0, GameState.suspicionMeter - 10);
        GameState.integritasScore += 2;
        
        // Task 1 unlocks investigation
        if (index === 0) {
            this.rightPanelContainer.setVisible(true);
        }

        this.add.text(640, 400, 'TUGAS SELESAI!', { color: '#00ff00', fontSize: '32px' }).setOrigin(0.5);
        this.time.delayedCall(1500, () => {
            this.hideOverlay();
            if (this.tasksCompleted === 3) {
                this.finishMorning();
            }
        });
    }

    updateStats() {
        this.statTexts.integrity.setText(`INTEGRITAS: ${GameState.integritasScore}`);
        this.statTexts.reputation.setText(`REPUTASI: ${GameState.reputasiScore}`);
        this.statTexts.evidence.setText(`BUKTI: ${GameState.buktiStrength}`);
        this.updateSuspicionBar();
    }

    handleTimeout() {
        if (this.tasksCompleted < 2) {
            this.transitionTo('GameOverScene', { reason: 'Gagal menyelesaikan minimal 2 tugas.\nAnda dianggap tidak kompeten dan dipecat.' });
        } else {
            this.finishMorning();
        }
    }

    finishMorning() {
        this.timeEvent.remove();
        
        // Disiplin bonus
        if (this.tasksCompleted === 3) {
            GameState.integritasScore += 5;
            this.add.text(640, 360, 'DISIPLIN: SEMUA TUGAS SELESAI! (+5)', { fontSize: '32px', color: '#00ff00', backgroundColor: '#000' }).setOrigin(0.5);
        }

        GameState.save();
        this.time.delayedCall(3000, () => {
            this.transitionTo('AfternoonScene');
        });
    }
}
