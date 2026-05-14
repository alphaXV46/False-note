const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'game-container',
  backgroundColor: '#05070d',
  scene: [
    BootScene,
    PreloadScene,
    TitleCardScene,
    MorningScene,
    AfternoonScene,
    InvestigationScene,
    EveningScene,
    ResultScene,
    EndingScene
  ],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

window.gameInstance = new Phaser.Game(config);

function enterGame(loadSave = false) {
  document.getElementById('main-menu').style.display = 'none';
  document.getElementById('game-wrapper').style.display = 'block';
  document.getElementById('hud').classList.remove('hidden');

  const boot = () => {
    const scene = window.gameInstance.scene;
    if (loadSave) SaveLoadManager.load();
    else GameState.reset();
    scene.stop('PreloadScene');
    scene.start('TitleCardScene', { skipCards: GameState.loadedFromSave });
  };

  if (window.falseNoteReady) boot();
  else window.falseNoteStartPending = boot;
}

document.getElementById('btn-start').addEventListener('click', () => enterGame(false));
document.getElementById('btn-load').addEventListener('click', () => enterGame(true));
