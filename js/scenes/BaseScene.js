class BaseScene extends Phaser.Scene {
  constructor(key) {
    super(key);
  }

  dayData() {
    return this.cache.json.get(`day${GameState.currentDay}`);
  }

  periodData(period) {
    return this.dayData()[period];
  }

  transitionTo(scene, data = {}) {
    this.cameras.main.fadeOut(260, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(scene, data);
    });
  }

  paintBackground(key) {
    const bg = this.add.image(640, 360, key);
    const source = this.textures.get(key)?.getSourceImage();
    if (source?.width && source?.height) {
      const scale = Math.max(1280 / source.width, 720 / source.height);
      bg.setDisplaySize(source.width * scale, source.height * scale);
    } else {
      bg.setDisplaySize(1280, 720);
    }
    this.add.rectangle(640, 360, 1280, 720, 0x020617, 0.26);
  }

  addCharacter(role, speaking = false) {
    const key = this.characterTexture(role, speaking);
    const x = role === 'Raka' ? 345 : 925;
    const img = this.add.image(x, 725, key).setOrigin(0.5, 1);
    this.normalizeCharacterSize(img, key);
    img.characterRole = role;
    this.characterSprites ??= [];
    this.characterByRole ??= {};
    this.characterSprites.push(img);
    this.characterByRole[role] = img;
    return img;
  }

  normalizeCharacterSize(sprite, textureKey = sprite.texture.key) {
    const source = this.textures.get(textureKey)?.getSourceImage();
    const targetHeight = 535;
    if (!source?.width || !source?.height) {
      sprite.setDisplaySize(360, targetHeight);
      return;
    }
    const scale = targetHeight / source.height;
    sprite.setDisplaySize(source.width * scale, targetHeight);
  }

  addDialogCharacters(dialog) {
    this.characterSprites = [];
    this.characterByRole = {};
    const speakers = new Set(['Raka']);
    dialog.forEach((entry) => {
      if (entry.speaker && entry.speaker !== 'Sistem') speakers.add(entry.speaker);
    });
    speakers.forEach((speaker) => this.addCharacter(speaker, speaker === 'Raka'));
  }

  characterTexture(role, speaking = false) {
    const map = {
      Raka: speaking ? 'raka_talking' : (GameState.integrity < 40 ? 'raka_panic' : 'raka_idle'),
      'Dr. Adrian': speaking ? 'adrian_talking' : 'adrian_idle',
      Bella: speaking ? 'bella_talking' : 'bella_idle',
      Dimas: speaking ? 'dimas_talking' : 'dimas_idle'
    };
    return map[role] || 'raka_idle';
  }

  setSpeakingCharacter(activeSpeaker) {
    Object.entries(this.characterByRole || {}).forEach(([role, sprite]) => {
      const textureKey = this.characterTexture(role, role === activeSpeaker);
      sprite.setTexture(textureKey);
      this.normalizeCharacterSize(sprite, textureKey);
      sprite.setAlpha(activeSpeaker === 'Sistem' || role === activeSpeaker ? 1 : 0.68);
    });
  }

  hideCharacters(onDone) {
    const sprites = this.characterSprites || [];
    if (sprites.length === 0) {
      onDone?.();
      return;
    }

    this.tweens.add({
      targets: sprites,
      alpha: 0,
      y: '+=26',
      duration: 180,
      ease: 'Sine.easeIn',
      onComplete: () => {
        sprites.forEach((sprite) => sprite.destroy());
        this.characterSprites = [];
        this.characterByRole = {};
        onDone?.();
      }
    });
  }

  updateHud() {
    const integrity = Phaser.Math.Clamp(GameState.integrity, 0, 100);
    const suspicion = Phaser.Math.Clamp(GameState.suspicion, 0, 100);
    document.getElementById('integrity-fill').style.width = `${integrity}%`;
    document.getElementById('suspicion-fill').style.width = `${suspicion}%`;
    document.getElementById('integrity-value').textContent = integrity;
    document.getElementById('suspicion-value').textContent = suspicion;

    const integrityFill = document.getElementById('integrity-fill');
    integrityFill.style.background = integrity < 30
      ? 'linear-gradient(90deg, #dc2626, #f97316)'
      : 'linear-gradient(90deg, #22c55e, #86efac)';

    const warning = document.getElementById('watch-warning');
    warning.className = '';
    if (suspicion >= 80) {
      warning.textContent = 'AWAS: DIAWASI';
      warning.classList.add('critical-watch');
    } else if (suspicion >= 50) {
      warning.textContent = 'DIAWASI';
    } else {
      warning.textContent = '';
    }

    this.renderInventory();
  }

  renderInventory() {
    const slots = document.getElementById('inventory-slots');
    const tooltip = document.getElementById('tooltip');
    slots.innerHTML = '';

    for (let i = 0; i < 3; i += 1) {
      const id = GameState.inventory[i];
      const slot = document.createElement('div');
      slot.className = `slot ${id ? '' : 'empty'}`;
      if (id) {
        const data = EvidenceManager.get(id);
        slot.textContent = data?.name || id;
        slot.addEventListener('mouseenter', () => this.showTooltip(id));
        slot.addEventListener('mouseleave', () => tooltip.style.display = 'none');
        slot.addEventListener('touchstart', () => this.showTooltip(id), { passive: true });
      } else {
        slot.textContent = 'Kosong';
      }
      slots.appendChild(slot);
    }
  }

  showTooltip(evidenceId) {
    const data = EvidenceManager.get(evidenceId);
    const tooltip = document.getElementById('tooltip');
    if (!data || !tooltip) return;
    tooltip.innerHTML = `<strong>${data.name}</strong><p>${data.desc}</p><small>Gunakan untuk: ${data.hint}</small>`;
    tooltip.style.display = 'block';
  }

  toast(message, kind = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.borderColor = kind === 'bad' ? 'rgba(239, 68, 68, 0.72)' : 'rgba(250, 204, 21, 0.72)';
    toast.classList.add('show');
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2100);
  }

  changeIntegrity(amount) {
    GameState.integrity = Phaser.Math.Clamp(GameState.integrity + amount, 0, 100);
    this.updateHud();
    if (amount < 0) document.getElementById('integrity-block').classList.add('shake');
    window.setTimeout(() => document.getElementById('integrity-block').classList.remove('shake'), 320);
  }

  changeSuspicion(amount) {
    GameState.suspicion = Phaser.Math.Clamp(GameState.suspicion + amount, 0, 100);
    this.updateHud();
  }

  checkGameOver() {
    if (GameState.integrity <= 0) {
      GameState.endingReason = 'Kamu gagal. Korupsi menang lagi.';
      this.transitionTo('EndingScene', { forced: 'bad' });
      return true;
    }
    if (GameState.suspicion >= 100) {
      GameState.endingReason = 'Raka dipecat sebelum bukti terkumpul.';
      this.transitionTo('EndingScene', { forced: 'bad' });
      return true;
    }
    if (GameState.reputation <= 0) {
      GameState.endingReason = 'Beasiswa Raka dicabut setelah tekanan publik.';
      this.transitionTo('EndingScene', { forced: 'bad' });
      return true;
    }
    return false;
  }

  showDialogueSequence(lines, onDone) {
    const box = document.getElementById('dialogue-box');
    const speaker = document.getElementById('speaker-name');
    const text = document.getElementById('dialogue-text');
    const queue = [];

    lines.forEach((entry) => {
      entry.text.forEach((line) => queue.push({ speaker: entry.speaker, line }));
    });

    let index = -1;
    let currentLine = '';
    let isTyping = false;

    const stopTyping = () => {
      if (this.dialogTypeEvent) {
        this.dialogTypeEvent.remove(false);
        this.dialogTypeEvent = null;
      }
      text.textContent = currentLine;
      text.classList.remove('typing');
      isTyping = false;
    };

    const typeLine = (line) => {
      currentLine = line;
      text.textContent = '';
      text.classList.add('typing');
      isTyping = true;
      let charIndex = 0;
      if (this.dialogTypeEvent) this.dialogTypeEvent.remove(false);
      this.dialogTypeEvent = this.time.addEvent({
        delay: 26,
        loop: true,
        callback: () => {
          charIndex += 1;
          text.textContent = currentLine.slice(0, charIndex);
          if (charIndex >= currentLine.length) stopTyping();
        }
      });
    };

    const advance = () => {
      if (isTyping) {
        stopTyping();
        return;
      }

      index += 1;
      if (index >= queue.length) {
        stopTyping();
        box.style.display = 'none';
        box.removeEventListener('click', advance);
        this.hideCharacters(onDone);
        return;
      }
      speaker.textContent = queue[index].speaker;
      this.setSpeakingCharacter(queue[index].speaker);
      typeLine(queue[index].line);
    };

    box.style.display = 'block';
    box.addEventListener('click', advance);
    advance();
  }

  createPanel(x, y, width, height, title) {
    const container = this.add.container(x, y).setDepth(10);
    const bg = this.add.rectangle(0, 0, width, height, 0x020617, 0.88).setStrokeStyle(2, 0x334155);
    const label = this.add.text(0, -height / 2 + 26, title, {
      fontFamily: 'Inter',
      fontSize: '24px',
      color: '#f8fafc',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: width - 48 }
    }).setOrigin(0.5);
    container.add([bg, label]);
    return container;
  }

  createChoice(x, y, label, callback, width = 560) {
    const button = this.add.container(x, y).setSize(width, 58).setInteractive({ useHandCursor: true });
    const bg = this.add.rectangle(0, 0, width, 58, 0x1e293b, 0.96).setStrokeStyle(2, 0x475569);
    const text = this.add.text(0, 0, label, {
      fontFamily: 'Inter',
      fontSize: '18px',
      color: '#f8fafc',
      align: 'center',
      wordWrap: { width: width - 28 }
    }).setOrigin(0.5);
    button.add([bg, text]);
    button.on('pointerover', () => bg.setFillStyle(0x334155, 1));
    button.on('pointerout', () => bg.setFillStyle(0x1e293b, 0.96));
    button.on('pointerdown', callback);
    return button;
  }

  playEitssssEffect(onDone) {
    const flash = this.add.rectangle(640, 360, 1280, 720, 0xffffff, 0.86).setDepth(900);
    const redWash = this.add.rectangle(640, 360, 1280, 720, 0x7f1d1d, 0).setDepth(901);
    const logo = this.add.image(640, 360, 'eitssss').setDepth(902).setAlpha(0).setScale(0.35);
    const source = this.textures.get('eitssss')?.getSourceImage();
    if (source?.width && source?.height) {
      const scale = Math.min(1120 / source.width, 520 / source.height);
      logo.setScale(scale * 0.82);
    }

    this.cameras.main.shake(260, 0.009);
    this.tweens.add({ targets: flash, alpha: 0, duration: 120, ease: 'Quad.easeOut' });
    this.tweens.add({ targets: redWash, alpha: 0.34, duration: 110, yoyo: true, hold: 120 });
    this.tweens.add({
      targets: logo,
      alpha: 1,
      scaleX: logo.scaleX * 1.12,
      scaleY: logo.scaleY * 1.12,
      duration: 180,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: logo,
          alpha: 0,
          scaleX: logo.scaleX * 1.08,
          scaleY: logo.scaleY * 1.08,
          delay: 620,
          duration: 220,
          ease: 'Quad.easeIn',
          onComplete: () => {
            flash.destroy();
            redWash.destroy();
            logo.destroy();
            onDone?.();
          }
        });
      }
    });
  }

  createMiniGame(period, onDone) {
    const data = this.periodData(period);
    const panel = this.createPanel(640, 354, 760, 390, data.miniGame.question);
    const manager = new MiniGameManager(data.miniGame, {
      onCorrect: (evidenceId, feedback) => {
        if (evidenceId && EvidenceManager.add(evidenceId)) this.toast(`Bukti didapat: ${EvidenceManager.get(evidenceId).name}`);
        this.changeSuspicion(data.suspicionGain || 0);
        if (period === 'morning') GameState.morningFailStreak = 0;
        panel.destroy();
        this.toast(feedback);
        this.time.delayedCall(700, onDone);
      },
      onWrong: (feedback) => {
        this.changeIntegrity(-(data.integrityCostIfWrong || 10));
        this.changeSuspicion(data.suspicionGain || 0);
        if (period === 'morning') GameState.morningFailStreak += 1;
        if (GameState.morningFailStreak >= 3) {
          this.changeSuspicion(30);
          GameState.morningFailStreak = 0;
          this.toast('Gagal pagi 3 hari berturut. Ancaman +30.', 'bad');
        } else {
          this.toast(feedback, 'bad');
        }
        panel.destroy();
        if (!this.checkGameOver()) this.time.delayedCall(850, onDone);
      }
    });

    data.miniGame.options.forEach((opt, index) => {
      panel.add(this.createChoice(0, -60 + index * 82, opt.text, () => manager.checkAnswer(index), 620));
    });
  }

  runPeriod(period, nextScene) {
    GameState.period = period;
    const data = this.periodData(period);
    this.updateHud();
    this.paintBackground(data.background);
    this.addDialogCharacters(data.dialog);

    this.showDialogueSequence(data.dialog, () => {
      this.createMiniGame(period, () => {
        if (!this.checkGameOver()) this.transitionTo(nextScene);
      });
    });
  }
}
