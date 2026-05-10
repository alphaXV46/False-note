class EveningScene extends BaseScene {
    constructor() {
        super('EveningScene');
        this.supportMeter = 50;
    }

    create() {
        this.add.image(640, 360, 'bg_magang').setTint(0x222244);
        this.add.text(640, 50, 'KONFRONTASI PUBLIK', { fontSize: '32px', fontStyle: 'bold' }).setOrigin(0.5);

        // Barometer Dukungan
        this.add.text(200, 650, 'DUKUNGAN MAHASISWA');
        this.supportBar = this.add.graphics();
        this.updateSupport();

        // Feed Post
        const postBox = this.add.graphics().fillStyle(0xffffff).fillRoundedRect(440, 150, 400, 200, 10);
        this.add.text(460, 170, "Dr. Adrian:\nSemua dana sudah diaudit dan transparan.", { color: '#000' });

        this.createButton(640, 450, 'SANGGAH!', () => this.handleRebuttal());
    }

    updateSupport() {
        this.supportBar.clear();
        this.supportBar.fillStyle(0x333333).fillRect(400, 650, 480, 20);
        this.supportBar.fillStyle(0x3498db).fillRect(400, 650, 4.8 * this.supportMeter, 20);
    }

    handleRebuttal() {
        const hasEvidence = GameState.inventoryEvidence.includes("Bukti Selisih Anggaran");
        if (hasEvidence) {
            this.supportMeter += 20;
            this.showMessage("Sanggahan Diterima! Dukungan Naik.", "#00ff00");
            if (this.supportMeter < 50) {
                AchievementSystem.unlock("Berani");
                this.showAchievement("Berani", "+10 Integritas");
                GameState.integritasScore += 10;
            }
        } else {
            this.supportMeter -= 20;
            this.showMessage("Gagal Sanggah! (Butuh Bukti)", "#ff0000");
        }
        this.updateSupport();
        this.time.delayedCall(2000, () => this.finishDay());
    }

    finishDay() {
        GameState.dukunganScore = this.supportMeter;
        if (GameState.currentDay >= 7) {
            this.transitionTo('ResultScene');
        } else {
            GameState.currentDay++;
            SaveLoad.save();
            this.transitionTo('MorningScene');
        }
    }
}
