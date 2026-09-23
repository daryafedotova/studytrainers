const PAD_NOTES = [196, 246.94, 293.66, 392];
const ARPEGGIO = [392, 493.88, 587.33, 659.25, 783.99, 659.25, 587.33, 493.88];

export function createAmbientSoundscape() {
  if (typeof window === 'undefined') return () => {};
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return () => {};

    const ctx = new AudioContext();
    const master = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Intentionally quiet and bright: accompaniment, not a dramatic sci-fi drone.
    master.gain.value = 0.014;
    filter.type = 'lowpass';
    filter.frequency.value = 2350;
    filter.Q.value = 0.35;
    filter.connect(master).connect(ctx.destination);

    const voices = PAD_NOTES.map((frequency, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = index < 3 ? 'sine' : 'triangle';
      osc.frequency.value = frequency;
      osc.detune.value = [-4, 3, -2, 5][index];
      gain.gain.value = [0.12, 0.075, 0.055, 0.025][index];
      osc.connect(gain).connect(filter);
      osc.start();
      return { osc, gain };
    });

    // A very slow filter drift gives motion without the "breathing" pressure
    // of modulating overall volume.
    const filterLfo = ctx.createOscillator();
    const filterLfoGain = ctx.createGain();
    filterLfo.frequency.value = 0.025;
    filterLfoGain.gain.value = 170;
    filterLfo.connect(filterLfoGain).connect(filter.frequency);
    filterLfo.start();

    let arpeggioIndex = 0;
    let noteTimer = null;

    function playSparkle() {
      if (ctx.state === 'closed') return;

      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      const note = ARPEGGIO[arpeggioIndex % ARPEGGIO.length];
      arpeggioIndex += 1;

      oscillator.type = 'sine';
      oscillator.frequency.value = note;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.018, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.25);

      oscillator.connect(gain).connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 1.3);

      noteTimer = window.setTimeout(playSparkle, 2300);
    }

    noteTimer = window.setTimeout(playSparkle, 900);
    ctx.resume?.();

    return () => {
      if (noteTimer) window.clearTimeout(noteTimer);
      try { filterLfo.stop(); } catch {}
      for (const { osc } of voices) {
        try { osc.stop(); } catch {}
      }
      ctx.close?.();
    };
  } catch {
    return () => {};
  }
}
