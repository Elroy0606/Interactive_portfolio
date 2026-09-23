// Tiny WebAudio synth for UI cues. Off by default; the AudioContext is only
// created after the user flips the toggle (browsers require a user gesture).
let ctx = null;
let enabled = false;

function ensureContext() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function setSoundEnabled(value) {
  enabled = value;
  if (value) ensureContext();
}

function tone(freq, dur, { type = 'square', vol = 0.025, slideTo, delay = 0 } = {}) {
  if (!enabled || !ctx) return;
  const t0 = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export const sfx = {
  hover: () => tone(1400, 0.03, { type: 'sine', vol: 0.015 }),
  click: () => tone(900, 0.06, { slideTo: 500 }),
  open: () => {
    tone(500, 0.08, { type: 'sawtooth', slideTo: 1000 });
    tone(1000, 0.1, { type: 'sine', delay: 0.07 });
  },
  close: () => tone(900, 0.1, { type: 'sawtooth', slideTo: 300 }),
  confirm: () => {
    tone(660, 0.08, { type: 'sine' });
    tone(880, 0.08, { type: 'sine', delay: 0.08 });
    tone(1320, 0.14, { type: 'sine', delay: 0.16 });
  },
  deny: () => {
    tone(160, 0.14, { type: 'sawtooth', vol: 0.04 });
    tone(120, 0.18, { type: 'sawtooth', vol: 0.04, delay: 0.12 });
  },
  key: () => tone(2000 + Math.random() * 600, 0.015, { type: 'square', vol: 0.008 }),
};
