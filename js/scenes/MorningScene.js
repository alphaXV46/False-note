class MorningScene extends BaseScene {
  constructor() {
    super('MorningScene');
  }

  create() {
    this.runPeriod('morning', 'AfternoonScene');
  }
}
