/**
 * Afternoon Scene - Forensik Dokumen
 * Mengimplementasikan audit dokumen dan SQL Injection.
 */
class AfternoonScene extends BaseScene {
    constructor() {
        super('AfternoonScene');
        this.evidenceFound = 0;
        this.evidenceStatus = [false, false, false, false];
    }

    create() {
        this.evidenceFound = 0;
        this.evidenceStatus = [false, false, false, false];
        this.manipulated = false;
        this.hintUsed = false;

        // Background
        this.add.image(640, 360, 'bg_desktop');
        
        // Header & Splitter
        this.add.text(640, 40, 'AUDIT DOKUMEN & INTEGRITAS DATA', { fontSize: '28px', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.graphics().lineStyle(2, 0x3498db).strokeLineShape(new Phaser.Geom.Line(640, 100, 640, 600));

        // Dokumen Layout
        this.createDocuments();
        
        // Toolbar
        this.createToolbar();

        // SQL Injection (Hidden)
        this.createSQLGame();
    }

    createDocuments() {
        // Publik
        const pub = this.add.container(80, 120);
        pub.add(this.add.graphics().fillStyle(0xffffff).fillRect(0, 0, 480, 400));
        pub.add(this.add.text(20, 20, "LAPORAN PUBLIK\n------------------\nDana: Rp 500.000.000\nTanggal: 15 Des 2024\n\nStatus: SELESAI\nTTD: Bendahara, Rektor", { color: '#000', fontSize: '18px' }));

        // Internal
        const int = this.add.container(720, 120);
        int.add(this.add.graphics().fillStyle(0xfff9c4).fillRect(0, 0, 480, 400));
        int.add(this.add.text(20, 20, "MEMO INTERNAL\n------------------\nDana: Rp 300.000.000\nTanggal: 10 Des 2024\n\nCatatan: fee admin 40%\nTTD: Bendahara", { color: '#000', fontSize: '18px' }));

        // Interactive Highlight Areas on Memo Internal
        this.addHighlight(850, 175, 150, 30, 0, "Nominal Berbeda");
        this.addHighlight(820, 205, 150, 30, 1, "Tanggal Berbeda");
        this.addHighlight(740, 290, 200, 30, 2, "TTD Tidak Lengkap");
    }

    addHighlight(x, y, w, h, index, desc) {
        const zone = this.add.zone(x, y, w, h).setOrigin(0, 0).setInteractive();
        zone.on('pointerdown', () => {
            if (this.evidenceStatus[index]) return;
            this.evidenceStatus[index] = true;
            this.evidenceFound++;
            this.add.graphics().fillStyle(0xffff00, 0.4).fillRect(x, y, w, h);
            this.showMessage(`BUKTI: ${desc}`, "#00ff00");
            if (this.evidenceFound === 3) this.sqlContainer.setVisible(true);
        });
    }

    createToolbar() {
        const bar = this.add.container(640, 660);
        
        // Tombol Manipulasi (#Jujur test)
        const btnManip = this.createButton(-300, 0, 'Manipulasi Data', () => {
            this.manipulated = true;
            GameState.integritasScore -= 10;
            GameState.reputasiScore += 5;
            this.showMessage("Data Dimanipulasi! (Integritas -10)", "#ff0000");
        });

        // Tombol Hint (#Mandiri test)
        const btnHint = this.createButton(-100, 0, 'Petunjuk', () => {
            this.hintUsed = true;
            this.showMessage("Cari perbedaan angka dan tanggal di memo kuning.", "#f1c40f");
        });

        const btnSave = this.createButton(200, 0, 'Simpan & Selesai', () => this.finishAfternoon());
        
        bar.add([btnManip, btnHint, btnSave]);
    }

    createSQLGame() {
        this.sqlContainer = this.add.container(640, 360).setVisible(false).setDepth(200);
        this.sqlContainer.add(this.add.graphics().fillStyle(0x000000, 0.95).fillRect(-300, -150, 600, 300));
        this.sqlContainer.add(this.add.text(0, -100, 'SQL INJECTION REQUIRED\nEnter bypass query:', { color: '#00ff00' }).setOrigin(0.5));
        
        const inputDisp = this.add.text(0, 0, "Klik & Ketik: ' OR '1'='1", { fontSize: '24px', backgroundColor: '#222', padding: 10 }).setOrigin(0.5);
        this.sqlContainer.add(inputDisp);

        let typed = "";
        this.input.keyboard.on('keydown', (e) => {
            if (!this.sqlContainer.visible) return;
            if (e.keyCode === 13 && typed === "' OR '1'='1") {
                this.evidenceStatus[3] = true;
                this.evidenceFound++;
                GameState.inventoryEvidence.push("Database Log Anomali");
                this.showMessage("Bypass Berhasil!", "#00ff00");
                this.time.delayedCall(1500, () => this.sqlContainer.setVisible(false));
            } else if (e.keyCode === 8) {
                typed = typed.slice(0, -1);
            } else if (e.key.length === 1) {
                typed += e.key;
            }
            inputDisp.setText(typed + "_");
        });
    }

    finishAfternoon() {
        if (this.evidenceFound < 1) {
            this.showMessage("Cari bukti terlebih dahulu!", "#ff0000");
            return;
        }

        // Achievements
        if (!this.manipulated) {
            GameState.integritasScore += 15;
            AchievementSystem.unlock("Jujur");
            this.showAchievement("Jujur", "+15 Integritas");
        }
        if (!this.hintUsed && this.evidenceStatus[3]) {
            GameState.integritasScore += 5;
            AchievementSystem.unlock("Mandiri");
            this.showAchievement("Mandiri", "+5 Integritas");
        }

        // Push findings to inventory
        if (this.evidenceStatus[0]) GameState.inventoryEvidence.push("Bukti Selisih Anggaran");
        if (this.evidenceStatus[2]) GameState.inventoryEvidence.push("Bukti Pelanggaran Prosedur TTD");

        SaveLoad.save();
        this.transitionTo('EveningScene');
    }
}
