// The loader and title sequence.
// 1. A big counter runs 000 → 100 while the photos actually load (it never fakes being done).
// 2. Letterbox bars slide in, the two lines write themselves in, Paul's portrait rises out of the dark.
// 3. "Begin" appears. "Skip intro" (or Esc) jumps straight there, so nobody is made to wait.

import { reducedMotion } from './motion.js';
import { lock, unlock, scrollTop } from './scroll.js';

// When each step starts after loading, in ms. Each step adds a class; the CSS animates it.
const STEPS = [
  ['is-bars', 150],
  ['is-l1', 900],
  ['is-l2', 2500],
  ['is-portrait', 3700],
  ['is-cta', 5400],
];
const ALL = STEPS.map(([cls]) => cls);
const MIN_LOAD_MS = 1400; // long enough to read as a deliberate opening, not a glitch

function writeLine(el, text) {
  let i = 0;
  const sr = document.createElement('span');
  sr.className = 'sr-only';
  sr.textContent = text;
  const visual = document.createElement('span');
  visual.setAttribute('aria-hidden', 'true');
  text.split(' ').forEach((word, w) => {
    if (w) visual.append(' ');
    const ws = document.createElement('span');
    ws.className = 'iw';
    for (const ch of word) {
      const c = document.createElement('span');
      c.className = 'ic';
      c.textContent = ch;
      c.style.setProperty('--i', i++);
      ws.append(c);
    }
    visual.append(ws);
  });
  el.replaceChildren(sr, visual);
}

// Resolves once every image has loaded (or failed), reporting progress 0 → 1 along the way.
function preload(srcs, onProgress) {
  let done = 0;
  return Promise.all(srcs.map((src) => new Promise((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => { onProgress(++done / srcs.length); resolve(); };
    img.src = src;
  })));
}

export function initIntro({ lines, images, onBegin, onDone }) {
  const intro = document.getElementById('intro');
  const enter = document.getElementById('intro-enter');
  const skip = document.getElementById('intro-skip');
  const count = document.getElementById('loader-count');
  const fill = document.getElementById('loader-fill');
  let timers = [];
  let playing = false;

  writeLine(document.getElementById('intro-line-1'), lines[0]);
  writeLine(document.getElementById('intro-line-2'), lines[1] || '');

  function sequence() {
    if (reducedMotion) { finish(); return; }
    timers = STEPS.map(([cls, ms]) => setTimeout(() => {
      intro.classList.add(cls);
      if (cls === 'is-cta') enter.focus({ preventScroll: true });
    }, ms));
  }

  function play({ load = false } = {}) {
    playing = true;
    lock();
    intro.classList.remove('is-gone', 'is-leaving', 'is-instant', ...ALL);
    if (!load) { sequence(); return; }

    // the counter eases toward real progress, so it glides instead of jumping
    let target = 0;
    let shown = 0;
    const started = performance.now();
    const loaded = preload(images, (p) => { target = p; });
    const tick = () => {
      const timeCap = Math.min(1, (performance.now() - started) / MIN_LOAD_MS);
      shown += (Math.min(target, timeCap) - shown) * 0.12;
      if (target >= 1 && timeCap >= 1 && shown > 0.995) shown = 1;
      count.textContent = String(Math.round(shown * 100)).padStart(3, '0');
      fill.style.transform = `scaleX(${shown})`;
      if (shown < 1) { requestAnimationFrame(tick); return; }
      intro.classList.add('is-loaded');
      setTimeout(sequence, reducedMotion ? 0 : 500);
    };
    loaded.then(() => { target = 1; });
    setTimeout(() => { target = 1; }, 8000); // on a very slow connection, don't hold the film hostage
    requestAnimationFrame(tick);
  }

  // jump to the end state of the titles
  function finish() {
    timers.forEach(clearTimeout);
    intro.classList.add('is-loaded', 'is-instant', ...ALL);
    enter.focus({ preventScroll: true });
  }

  function leave() {
    if (!playing) return;
    playing = false;
    timers.forEach(clearTimeout);
    intro.classList.remove('is-instant');
    intro.classList.add(...ALL, 'is-leaving');
    unlock();
    onBegin();
    setTimeout(() => {
      intro.classList.add('is-gone');
      onDone();
    }, reducedMotion ? 0 : 1300);
  }

  skip.addEventListener('click', finish);
  enter.addEventListener('click', leave);
  addEventListener('keydown', (e) => {
    if (playing && e.key === 'Escape') finish();
  });

  history.scrollRestoration = 'manual';
  scrollTo(0, 0);
  play({ load: true });

  return {
    // "Watch it again" at the end of the film
    replay() {
      scrollTop();
      play();
    },
  };
}
