class MiniGameManager {
  constructor(config, handlers) {
    this.question = config.question;
    this.options = config.options;
    this.type = config.type;
    this.handlers = handlers;
  }

  checkAnswer(selectedIndex) {
    const opt = this.options[selectedIndex];
    if (!opt) return;

    if (opt.isCorrect) {
      this.handlers.onCorrect(opt.evidenceGain, opt.feedbackRight || 'Bukti kuat. Lawan terdiam.');
    } else {
      this.handlers.onWrong(opt.feedbackWrong || 'Kamu terjebak. Integritas -10.');
    }
  }
}
