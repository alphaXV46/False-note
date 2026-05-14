class FallacyManager {
  static summary() {
    const counts = GameState.fallacyLog.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {});
    const most = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return {
      total: GameState.fallacyCounter,
      mostCommon: most ? most[0] : 'Tidak ada'
    };
  }
}
