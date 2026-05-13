class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    const bar = this.add.rectangle(640, 384, 420, 12, 0x1e293b).setOrigin(0.5);
    const fill = this.add.rectangle(430, 384, 0, 12, 0x22c55e).setOrigin(0, 0.5);
    this.add.text(640, 340, 'Memuat FALSE NOTE...', {
      fontFamily: 'Courier Prime',
      fontSize: '22px',
      color: '#f8fafc'
    }).setOrigin(0.5);

    this.load.on('progress', (value) => fill.width = 420 * value);
    this.load.on('complete', () => {
      bar.destroy();
      fill.destroy();
    });

    this.load.image('menu_bg', 'assets/images/menu_bg.png');
    this.load.image('bg_magang_fh', 'assets/backgrounds/bg_magang_fh.png');
    this.load.image('bg_perpus_ui', 'assets/backgrounds/bg_perpus_ui.png');
    this.load.image('bg_balairung', 'assets/backgrounds/bg_balairung.png');
    this.load.image('bg_legal_kopi', 'assets/backgrounds/bg_legal_kopi.png');
    this.load.image('bg_sosmed_kampus', 'assets/backgrounds/bg_sosmed_kampus.png');
    this.load.image('bg_sidang', 'assets/backgrounds/bg_sidang.png');
    this.load.image('bg_rooftop_kampus', 'assets/backgrounds/bg_rooftop_kampus.png');
    this.load.image('eitssss', 'assets/ui/eitssss.png');
    this.load.image('raka_idle', 'assets/characters/raka/Raka Biasa.png');
    this.load.image('raka_talking', 'assets/characters/raka/Raka Ngobrol.png');
    this.load.image('raka_panic', 'assets/characters/raka/Raka Bingung atau Mikir.png');
    this.load.image('raka_sanggah', 'assets/characters/raka/Raka Menyanggah.png');
    this.load.image('adrian_idle', 'assets/characters/dr_adrian/Dr. Adrian Biasa.png');
    this.load.image('adrian_talking', 'assets/characters/dr_adrian/Dr. Adrian Ngobrol.png');
    this.load.image('adrian_sanggah', 'assets/characters/dr_adrian/Dr. Adrian Menyanggah.png');
    this.load.image('bella_idle', 'assets/characters/bella/Bella.png');
    this.load.image('bella_talking', 'assets/characters/bella/Bella Ngobrol.png');
    this.load.image('bella_sanggah', 'assets/characters/bella/Bella Menyanggah.png');
    this.load.image('dimas_idle', 'assets/characters/dimas/Jeki Biasa.png');
    this.load.image('dimas_talking', 'assets/characters/dimas/Jeki Ngobrol.png');
    this.load.image('dimas_sanggah', 'assets/characters/dimas/Jeki Nyanggah.png');

    this.load.json('evidence_data', 'js/data/evidence_data.json');
    [
      'suspects',
      'minigame_documents',
      'minigame_stamps',
      'minigame_chat',
      'twist_system',
      'ending_data',
      'phase_data'
    ].forEach((file) => {
      this.load.json(file, `js/data/${file}.json`);
    });
    for (let day = 1; day <= 7; day += 1) {
      this.load.json(`day${day}`, `js/data/day${day}.json`);
    }
  }

  create() {
    this.createGeneratedAssets();
    this.cleanCharacterEdges();
    EvidenceManager.init(this);
    EvidenceManager.validateLoreData(this);
    window.falseNoteReady = true;
    if (window.falseNoteStartPending) window.falseNoteStartPending();
  }

  cleanCharacterEdges() {
    [
      'raka_idle',
      'raka_talking',
      'raka_panic',
      'raka_sanggah',
      'adrian_idle',
      'adrian_talking',
      'adrian_sanggah',
      'bella_idle',
      'bella_talking',
      'bella_sanggah',
      'dimas_idle',
      'dimas_talking',
      'dimas_sanggah'
    ].forEach((key) => this.removeEdgeWhite(key));
  }

  removeEdgeWhite(key) {
    const texture = this.textures.get(key);
    const source = texture?.getSourceImage();
    if (!source?.width || !source?.height) return;

    const canvas = document.createElement('canvas');
    const width = source.width;
    const height = source.height;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(source, 0, 0);
    const image = ctx.getImageData(0, 0, width, height);
    const pixels = image.data;
    const visited = new Uint8Array(width * height);
    const queue = [];
    const isWhiteEdge = (idx) => {
      const offset = idx * 4;
      const r = pixels[offset];
      const g = pixels[offset + 1];
      const b = pixels[offset + 2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      return pixels[offset + 3] > 20 && min > 214 && max - min < 42;
    };
    const push = (idx) => {
      if (!visited[idx] && isWhiteEdge(idx)) {
        visited[idx] = 1;
        queue.push(idx);
      }
    };

    for (let x = 0; x < width; x += 1) {
      push(x);
      push((height - 1) * width + x);
    }
    for (let y = 0; y < height; y += 1) {
      push(y * width);
      push(y * width + width - 1);
    }

    for (let i = 0; i < queue.length; i += 1) {
      const idx = queue[i];
      const x = idx % width;
      const y = Math.floor(idx / width);
      const offset = idx * 4;
      pixels[offset + 3] = 0;
      if (x > 0) push(idx - 1);
      if (x < width - 1) push(idx + 1);
      if (y > 0) push(idx - width);
      if (y < height - 1) push(idx + width);
    }

    this.featherWhiteMatte(pixels, width, height);

    if (queue.length === 0) return;
    ctx.putImageData(image, 0, 0);
    this.textures.remove(key);
    this.textures.addCanvas(key, canvas);
  }

  featherWhiteMatte(pixels, width, height) {
    const isTransparent = (idx) => pixels[idx * 4 + 3] < 8;
    const hasTransparentNeighbor = (idx) => {
      const x = idx % width;
      const y = Math.floor(idx / width);
      return (x > 0 && isTransparent(idx - 1))
        || (x < width - 1 && isTransparent(idx + 1))
        || (y > 0 && isTransparent(idx - width))
        || (y < height - 1 && isTransparent(idx + width));
    };

    for (let pass = 0; pass < 3; pass += 1) {
      for (let idx = 0; idx < width * height; idx += 1) {
        const offset = idx * 4;
        if (pixels[offset + 3] < 8 || !hasTransparentNeighbor(idx)) continue;

        const r = pixels[offset];
        const g = pixels[offset + 1];
        const b = pixels[offset + 2];
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        if (min < 184 || max - min > 58) continue;

        const whiteness = min;
        const targetAlpha = Phaser.Math.Clamp((255 - whiteness) * 7, 28, 190);
        pixels[offset + 3] = Math.min(pixels[offset + 3], targetAlpha);
        const despill = Phaser.Math.Clamp((whiteness - 178) / 88, 0, 0.72);
        pixels[offset] = Math.round(r * (1 - despill) + 28 * despill);
        pixels[offset + 1] = Math.round(g * (1 - despill) + 32 * despill);
        pixels[offset + 2] = Math.round(b * (1 - despill) + 38 * despill);
      }
    }
  }

  createGeneratedAssets() {
    const g = this.add.graphics();
    const backgrounds = [
      ['bg_black', 0x000000, 0x000000]
    ];

    backgrounds.forEach(([key, base, accent]) => {
      if (this.textures.exists(key)) return;
      g.clear();
      g.fillStyle(base, 1).fillRect(0, 0, 1280, 720);
      g.lineStyle(3, accent, 0.25);
      for (let i = 0; i < 18; i += 1) {
        g.strokeLineShape(new Phaser.Geom.Line(0, i * 44, 1280, i * 44 + 160));
      }
      g.fillStyle(0x020617, 0.38).fillRect(0, 0, 1280, 720);
      g.generateTexture(key, 1280, 720);
    });

    g.clear();
    g.fillStyle(0xfacc15, 1).fillRoundedRect(0, 0, 72, 72, 6);
    g.lineStyle(4, 0x0f172a, 1).strokeRoundedRect(8, 8, 56, 56, 4);
    g.generateTexture('icon_evidence', 72, 72);
    g.destroy();
  }
}
