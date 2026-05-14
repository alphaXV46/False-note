class AfternoonScene extends BaseScene {
    constructor() {
        super('AfternoonScene');
        this.evidenceFound = 0;
        this.timeRemaining = 120;
        this.highlighterMode = false;
        this.usedHint = false;
        this.usedManipulate = false;
        this.evidenceStatus = [false, false, false, false]; // 3 main + 1 SQL
    }

    create() {
        // Reset state
        this.evidenceFound = 0;
        this.timeRemaining = 120;
        this.usedHint = false;
        this.usedManipulate = false;
        this.evidenceStatus = [false, false, false, false];

        // Background
        this.add.image(640, 360, 'bg_desktop');
        
        // Split Screen Dividers
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0x3498db, 1);
        graphics.strokeLineShape(new Phaser.Geom.Line(640, 100, 640, 600));
        
        // Top Bar (Stats)
        this.createTopBar();
        
        // Documents
        this.createDocuments();
        
        // Toolbar
        this.createToolbar();
        
        // Timer
        this.createTimer();

        // SQL Injection Container (Hidden at start)
        this.createSQLGame();
        
        // Highlighter Tool
        this.highlighter = this.add.circle(0, 0, 15, 0xffff00, 0.5).setVisible(false);
        this.input.on('pointermove', (pointer) => {
            if (this.highlighterMode) {
                this.highlighter.setPosition(pointer.x, pointer.y);
            }
        });
    }

    createTopBar() {
        this.add.graphics().fillStyle(0x1a233a, 1).fillRect(0, 0, 1280, 60);
        this.statText = this.add.text(20, 20, `INTEGRITAS: ${GameState.integritasScore} | REPUTASI: ${GameState.reputasiScore}`, { fontSize: '18px', color: '#ffffff' });
        this.timerText = this.add.text(640, 20, `WAKTU: ${this.timeRemaining}s`, { fontSize: '20px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    }

    createDocuments() {
        // Left Panel: Public Document
        this.add.text(50, 80, 'DOKUMEN PUBLIK (LAPORAN BEASISWA)', { fontSize: '18px', color: '#3498db', fontStyle: 'bold' });
        const pubDoc = this.add.container(50, 120);
        const pubBg = this.add.graphics().fillStyle(0xffffff, 1).fillRect(0, 0, 540, 480);
        
        const pubText = this.add.text(20, 20, 
            "LAPORAN REALISASI DANA BEASISWA\n\n" +
            "Total Alokasi: Rp 500.000.000\n" +
            "Tanggal Pencairan: 15 Desember 2024\n\n" +
            "Keterangan: Dana telah disalurkan sepenuhnya\n" +
            "kepada 100 mahasiswa penerima.\n\n\n\n" +
            "Tanda Tangan Verifikasi:\n" +
            "( ) Rektor\n" +
            "( ) Bendahara\n" +
            "( ) Pengawas", 
            { fontSize: '16px', color: '#000000', lineSpacing: 10 }
        );
        pubDoc.add([pubBg, pubText]);

        // Right Panel: Internal Memo
        this.add.text(690, 80, 'MEMO INTERNAL (NUSA-OS ARCHIVE)', { fontSize: '18px', color: '#e67e22', fontStyle: 'bold' });
        const intDoc = this.add.container(690, 120);
        const intBg = this.add.graphics().fillStyle(0xfff9c4, 1).fillRect(0, 0, 540, 480);
        
        const intText = this.add.text(20, 20, 
            "MEMO INTERNAL - SANGAT RAHASIA\n\n" +
            "Realisasi Dana: Rp 300.000.000\n" +
            "Tanggal: 10 Desember 2024\n\n" +
            "Catatan: fee admin 40% dialokasikan ke\n" +
            "rekening vendor X.\n\n\n\n" +
            "Persetujuan:\n" +
            "(X) Rektor\n" +
            "(X) Bendahara", 
            { fontSize: '16px', color: '#000000', lineSpacing: 10 }
        );
        intDoc.add([intBg, intText]);

        // Define Highlightable Areas (Relative to screen)
        // a) Nominal (690 + 20, 120 + 40 approx)
        this.addHighlightArea(830, 165, 150, 25, 0, "Nominal Anggaran Berbeda");
        // b) Tanggal (690 + 20, 120 + 70 approx)
        this.addHighlightArea(780, 195, 180, 25, 1, "Tanggal Pencairan Mendahului Laporan");
        // c) Tanda tangan (690 + 20, 120 + 250 approx)
        this.addHighlightArea(690, 370, 200, 100, 2, "Kurang Tanda Tangan Pengawas");
    }

    addHighlightArea(x, y, w, h, index, description) {
        const zone = this.add.zone(x, y, w, h).setOrigin(0, 0).setInteractive();
        // Debug graphic (comment out in production)
        // this.add.graphics().lineStyle(1, 0xff0000).strokeRect(x, y, w, h);

        zone.on('pointerup', () => {
            if (this.highlighterMode && !this.evidenceStatus[index]) {
                this.evidenceStatus[index] = true;
                this.evidenceFound++;
                this.add.graphics().fillStyle(0xffff00, 0.4).fillRect(x, y, w, h);
                this.showMessage(`BUKTI DITEMUKAN: ${description}`, '#00ff00');
                
                if (this.evidenceFound === 3) {
                    this.sqlContainer.setVisible(true);
                }
            }
        });
    }

    createToolbar() {
        const toolbar = this.add.container(640, 650);
        
        const btnHighlighter = this.createButton(-300, 0, 'Highlighter', () => {
            this.highlighterMode = !this.highlighterMode;
            this.highlighter.setVisible(this.highlighterMode);
            this.showMessage(this.highlighterMode ? "Mode Highlighter AKTIF" : "Mode Highlighter MATI", '#ffffff');
        });

        const btnSave = this.createButton(-100, 0, 'Encrypt & Save', () => {
            this.saveEvidences();
        });

        const btnReset = this.createButton(100, 0, 'Reset', () => {
            this.scene.restart();
        });

        const btnHint = this.createButton(300, 0, 'Hint', () => {
            this.usedHint = true;
            this.showMessage("Cek nominal dan tanggal di memo internal!", "#f1c40f");
        });

        // "Manipulasi" button for #Jujur test
        const btnManipulate = this.createButton(500, 0, 'Manipulasi', () => {
            this.usedManipulate = true;
            this.showMessage("Data berhasil dimanipulasi (Reputasi +5, Integritas -10)", "#ff0000");
            GameState.reputasiScore += 5;
            GameState.integritasScore -= 10;
        });

        toolbar.add([btnHighlighter, btnSave, btnReset, btnHint, btnManipulate]);
    }

    createTimer() {
        this.timeEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timeRemaining--;
                this.timerText.setText(`WAKTU: ${this.timeRemaining}s`);
                if (this.timeRemaining <= 0) this.handleTimeout();
            },
            loop: true
        });
    }

    createSQLGame() {
        this.sqlContainer = this.add.container(640, 360).setVisible(false);
        const bg = this.add.graphics().fillStyle(0x000000, 0.95).fillRect(-300, -150, 600, 300);
        const title = this.add.text(0, -100, 'SQL INJECTION DETECTED\nEnter query to bypass security:', { fontSize: '20px', color: '#00ff00' }).setOrigin(0.5);
        
        const inputBg = this.add.graphics().fillStyle(0x222222, 1).fillRect(-250, -30, 500, 50);
        this.sqlInputText = this.add.text(-240, -15, 'CLICK TO TYPE...', { fontSize: '24px', color: '#888' });
        
        let typed = "";
        this.input.on('pointerdown', (pointer) => {
            if (!this.sqlContainer.visible) return;
            // Simple check if click is near input
            if (pointer.y > 330 && pointer.y < 380) {
                this.sqlInputText.setColor('#00ff00');
                this.sqlInputText.setText(typed + "_");
            }
        });

        this.input.keyboard.on('keydown', (event) => {
            if (!this.sqlContainer.visible) return;
            
            if (event.keyCode === 8) { // Backspace
                typed = typed.slice(0, -1);
            } else if (event.keyCode === 13) { // Enter
                if (typed === "' OR '1'='1") {
                    this.completeSQL();
                } else {
                    this.showMessage("Access Denied", "#ff0000");
                }
            } else if (event.key.length === 1) {
                typed += event.key;
            }
            this.sqlInputText.setText(typed + "_");
        });

        this.sqlContainer.add([bg, title, inputBg, this.sqlInputText]);
    }

    completeSQL() {
        this.evidenceStatus[3] = true;
        this.evidenceFound++;
        GameState.inventoryEvidence.push("Database Log Anomali");
        this.showMessage("BYPASS SUCCESS: Database Log Anomali Found!", "#00ff00");
        this.time.delayedCall(2000, () => this.sqlContainer.setVisible(false));
    }

    saveEvidences() {
        if (this.evidenceFound < 2) {
            this.showMessage("Butuh minimal 2 bukti untuk menyimpan!", "#ff0000");
            return;
        }

        // Add found evidences to global inventory
        if (this.evidenceStatus[0]) GameState.inventoryEvidence.push("Bukti Selisih Anggaran");
        if (this.evidenceStatus[1]) GameState.inventoryEvidence.push("Bukti Anomali Tanggal");
        if (this.evidenceStatus[2]) GameState.inventoryEvidence.push("Bukti Pelanggaran Prosedur TTD");

        // Bonus #Jujur
        if (!this.usedManipulate) {
            GameState.integritasScore += 5;
            this.showMessage("BONUS JUJUR: +5 Integritas", "#00ff00");
        }

        // Bonus #Mandiri
        if (!this.usedHint && this.evidenceStatus[3]) {
            GameState.integritasScore += 3;
            this.showMessage("BONUS MANDIRI: +3 Integritas", "#00ff00");
        }

        GameState.save();
        this.time.delayedCall(2000, () => {
            this.transitionTo('EveningScene');
        });
    }

    handleTimeout() {
        if (this.evidenceFound < 2) {
            GameState.reputasiScore -= 20;
            this.showMessage("WAKTU HABIS! Reputasi -20", "#ff0000");
        }
        this.time.delayedCall(2000, () => {
            this.transitionTo('EveningScene');
        });
    }

    showMessage(msg, color) {
        const txt = this.add.text(640, 600, msg, { fontSize: '20px', color: color, backgroundColor: '#000', padding: 5 }).setOrigin(0.5).setDepth(200);
        this.time.delayedCall(3000, () => txt.destroy());
    }
}
