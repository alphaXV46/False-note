class AfternoonScene extends BaseScene {
  constructor() {
    super('AfternoonScene');
  }

  create() {
    this.runPeriod('afternoon', 'InvestigationScene');
  }
}
