// Sound. The song from config plays through the Web Audio API so it can fade in and be muted
// smoothly. If the file is missing or can't play, a calm code-made piano-and-pad track
// takes over, so the site is never silent by accident. Nothing plays until the visitor taps.

const BPM = 68;
const BEAT = 60 / BPM;

// Cmaj9 – Am9 – Fmaj7 – Gsus: warm, steady, a little reflective. MIDI note numbers.
const CHORDS = [
  [48, 55, 59, 62, 64],
  [45, 52, 55, 59, 60],
  [41, 48, 52, 55, 57],
  [43, 50, 53, 55, 62],
];

const midiToHz = (m) => 440 * Math.pow(2, (m - 69) / 12);

let ctx = null;
let master, musicBus, sfxBus, reverb;
let nextBarTime = 0;
let bar = 0;
let schedulerId = null;
let muted = readMuted();
const listeners = new Set();

function readMuted() {
  try { return localStorage.getItem('baami-muted') === '1'; } catch { return false; }
}
function saveMuted() {
  try { localStorage.setItem('baami-muted', muted ? '1' : '0'); } catch { /* storage blocked: the choice just isn't remembered */ }
}

// A reverb "room" made from decaying noise, so nothing extra needs downloading.
function makeImpulse(seconds = 3.6) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.8);
  }
  return buf;
}

function voice(type, freq, time, { attack = 0.01, decay = 1, gain = 0.2, dest = musicBus, wet = 0.4 } = {}) {
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  env.gain.setValueAtTime(0.0001, time);
  env.gain.exponentialRampToValueAtTime(gain, time + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, time + attack + decay);
  osc.connect(env);
  env.connect(dest);
  if (wet) {
    const send = ctx.createGain();
    send.gain.value = wet;
    env.connect(send);
    send.connect(reverb);
  }
  osc.start(time);
  osc.stop(time + attack + decay + 0.05);
}

function pad(chord, time, length) {
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 700;
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, time);
  env.gain.exponentialRampToValueAtTime(0.04, time + 1.8);
  env.gain.setValueAtTime(0.04, time + length - 1.4);
  env.gain.exponentialRampToValueAtTime(0.0001, time + length + 1);
  filter.connect(env);
  env.connect(musicBus);
  const send = ctx.createGain();
  send.gain.value = 0.7;
  env.connect(send);
  send.connect(reverb);
  for (const note of chord.slice(0, 4)) {
    for (const cents of [-6, 6]) {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = midiToHz(note);
      osc.detune.value = cents;
      osc.connect(filter);
      osc.start(time);
      osc.stop(time + length + 1.2);
    }
  }
}

// One bar: a long pad, a low root, and a few slow piano-ish notes on top.
function scheduleBar(i, time) {
  const chord = CHORDS[i % CHORDS.length];
  pad(chord, time, BEAT * 4);
  voice('sine', midiToHz(chord[0] - 12), time, { attack: 0.05, decay: BEAT * 4, gain: 0.07, wet: 0.3 });
  [[0, 2], [1.5, 3], [2, 4], [3, 1]].forEach(([beat, tone]) => {
    const t = time + beat * BEAT;
    voice('triangle', midiToHz(chord[tone] + 12), t, { decay: 2.4, gain: 0.035, wet: 0.7 });
    voice('sine', midiToHz(chord[tone] + 24), t, { decay: 1.2, gain: 0.01, wet: 0.8 });
  });
}

function scheduler() {
  while (nextBarTime < ctx.currentTime + 0.3) {
    scheduleBar(bar++, nextBarTime);
    nextBarTime += BEAT * 4;
  }
}

function startSynth() {
  if (schedulerId) return;
  nextBarTime = ctx.currentTime + 0.1;
  schedulerId = setInterval(scheduler, 100);
}

function startMusic(src) {
  if (!src) return startSynth();
  let fellBack = false;
  const fallback = (reason) => {
    if (fellBack) return;
    fellBack = true;
    console.warn('The song could not play, so the built-in music is playing instead.', reason || '');
    startSynth();
  };
  const song = new Audio(src);
  song.loop = true;
  song.preload = 'auto';
  song.addEventListener('error', () => fallback(song.error), { once: true });
  ctx.createMediaElementSource(song).connect(musicBus);
  song.play().catch((err) => {
    // Blocked by the browser's autoplay rules (not a broken file): try again on the next tap or key.
    if (err?.name === 'NotAllowedError') {
      const retry = () => {
        ctx.resume();
        song.play().catch(fallback);
      };
      addEventListener('pointerdown', retry, { once: true });
      addEventListener('keydown', retry, { once: true });
      return;
    }
    fallback(err);
  });
}

const ready = () => ctx && !muted;
const notify = () => listeners.forEach((fn) => fn(muted));

export const audio = {
  get muted() { return muted; },
  get started() { return Boolean(ctx); },

  // Runs fn(muted) whenever the sound starts, mutes or unmutes (keeps the button in sync).
  onChange(fn) { listeners.add(fn); },

  // Must be called from a tap or click: browsers block sound until then.
  start(src) {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.9;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp);
    comp.connect(ctx.destination);
    musicBus = ctx.createGain();
    // fade the music in slowly, like a film opening
    musicBus.gain.setValueAtTime(0.0001, ctx.currentTime);
    musicBus.gain.exponentialRampToValueAtTime(0.85, ctx.currentTime + 4);
    sfxBus = ctx.createGain();
    reverb = ctx.createConvolver();
    reverb.buffer = makeImpulse();
    const reverbOut = ctx.createGain();
    reverbOut.gain.value = 0.45;
    reverb.connect(reverbOut);
    [musicBus, sfxBus, reverbOut].forEach((n) => n.connect(master));
    startMusic(src);

    // pause when the tab is hidden, carry on when it comes back
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) ctx.suspend();
      else if (!muted) ctx.resume();
    });
    notify();
  },

  toggle() {
    muted = !muted;
    saveMuted();
    if (ctx) {
      if (!muted) ctx.resume();
      master.gain.setTargetAtTime(muted ? 0 : 0.9, ctx.currentTime, 0.2);
    }
    notify();
    return muted;
  },

  // a soft rising bell, for opening things
  chime(soft = false) {
    if (!ready()) return;
    const t = ctx.currentTime;
    [72, 76, 79, 84].forEach((m, i) => {
      voice('sine', midiToHz(m), t + i * 0.09, { decay: 1.8, gain: soft ? 0.02 : 0.04, dest: sfxBus, wet: 0.8 });
    });
  },

  // a short paper/card turn
  flip() {
    if (!ready()) return;
    const t = ctx.currentTime;
    const len = 0.18;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * len), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 3);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = 2200;
    const env = ctx.createGain();
    env.gain.value = 0.12;
    src.connect(band);
    band.connect(env);
    env.connect(sfxBus);
    src.start(t);
  },
};
