export function createAmbientSoundscape() {
  if (typeof window === 'undefined') return () => {};
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return () => {};
    const ctx = new AudioContext();
    const master = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    master.gain.value = 0.022;
    filter.type = 'lowpass';
    filter.frequency.value = 720;
    filter.Q.value = 0.7;
    filter.connect(master).connect(ctx.destination);

    const voices = [
      { frequency: 110, gain: 0.50, type: 'sine' },
      { frequency: 164.81, gain: 0.24, type: 'sine' },
      { frequency: 220, gain: 0.12, type: 'triangle' }
    ].map(({frequency,gain,type}, index) => {
      const osc = ctx.createOscillator();
      const voiceGain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = frequency;
      osc.detune.value = index === 1 ? -7 : index === 2 ? 5 : 0;
      voiceGain.gain.value = gain;
      osc.connect(voiceGain).connect(filter);
      osc.start();
      return {osc,voiceGain};
    });

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.055;
    lfoGain.gain.value = 0.006;
    lfo.connect(lfoGain).connect(master.gain);
    lfo.start();

    let chimeTimer = null;
    function scheduleChime() {
      chimeTimer = window.setTimeout(() => {
        if (ctx.state === 'closed') return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const notes = [329.63, 392, 493.88, 587.33];
        osc.type = 'sine';
        osc.frequency.value = notes[Math.floor(Math.random() * notes.length)];
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.025, ctx.currentTime + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.9);
        scheduleChime();
      }, 6500 + Math.random() * 4500);
    }
    scheduleChime();
    ctx.resume?.();

    return () => {
      if (chimeTimer) window.clearTimeout(chimeTimer);
      try { lfo.stop(); } catch {}
      for (const {osc} of voices) { try { osc.stop(); } catch {} }
      ctx.close?.();
    };
  } catch {
    return () => {};
  }
}
