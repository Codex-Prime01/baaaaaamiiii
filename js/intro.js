// The title sequence. Letterbox bars slide in, the two lines write themselves in,
// Paul's portrait rises out of the dark, then "Begin" appears.
// "Skip intro" (or Esc) jumps straight to the end state, so nobody is ever made to wait.

import { reducedMotion } from './motion.js';

// When each step starts, in ms. Each step adds a class; the CSS does the animating.
const STEPS = [
  ['is-bars', 200],
  ['is-l1', 1000],
  ['is-l2', 2700],
  ['is-portrait', 4000],
  ['is-cta', 5900],
];
const ALL = STEPS.map(([cls]) => cls);

// Wrap each letter so it can fade in on its own delay. Words stay unbreakable.
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

export function initIntro({ lines, onBegin, onDone }) {
  const intro = document.getElementById('intro');
  const enter = document.getElementById('intro-enter');
  const skip = document.getElementById('intro-skip');
  const html = document.documentElement;
  let timers = [];
  let playing = false;

  writeLine(document.getElementById('intro-line-1'), lines[0]);
  writeLine(document.getElementById('intro-line-2'), lines[1] || '');

  function play() {
    playing = true;
    html.classList.add('is-locked');
    intro.classList.remove('is-gone', 'is-leaving', 'is-instant', ...ALL);
    intro.hidden = false;
    if (reducedMotion) { finish(); return; }
    intro.getBoundingClientRect(); // start from the bare state so every step animates
    timers = STEPS.map(([cls, ms]) => setTimeout(() => {
      intro.classList.add(cls);
      if (cls === 'is-cta') enter.focus({ preventScroll: true });
    }, ms));
  }

  // jump to the end state
  function finish() {
    timers.forEach(clearTimeout);
    intro.classList.add('is-instant', ...ALL);
    enter.focus({ preventScroll: true });
  }

  function leave() {
    if (!playing) return;
    playing = false;
    timers.forEach(clearTimeout);
    intro.classList.remove('is-instant');
    intro.classList.add(...ALL, 'is-leaving');
    html.classList.remove('is-locked');
    onBegin();
    setTimeout(() => {
      intro.classList.add('is-gone');
      onDone();
    }, reducedMotion ? 0 : 1500);
  }

  skip.addEventListener('click', finish);
  enter.addEventListener('click', leave);
  addEventListener('keydown', (e) => {
    if (playing && e.key === 'Escape') finish();
  });

  history.scrollRestoration = 'manual';
  scrollTo(0, 0);
  play();

  // "Watch it again" at the end of the film
  return {
    replay() {
      scrollTo({ top: 0, behavior: 'instant' });
      play();
    },
  };
}
