export function playTone(kind, enabled = true) {
  if (!enabled || typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const tones = {
      correct: [660, 0.12], wrong: [180, 0.16], star: [880, 0.18],
      unlock: [520, 0.22], critical: [980, 0.22], life: [130, 0.24], victory: [1040, 0.35]
    };
    const [frequency, duration] = tones[kind] ?? tones.correct;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
    oscillator.addEventListener?.('ended', () => ctx.close?.());
  } catch {
    // Audio is optional: unsupported or blocked sound must never stop the trainer.
  }
}
