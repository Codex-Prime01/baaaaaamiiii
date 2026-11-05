// Everything that moves with the scroll: hero push-in, the word swap, the horizontal reel,
// the little-moments list, the finale zoom, the progress line and the act slate.
// All of it runs in the one shared frame loop from motion.js.

import { onFrame, clamp, lerp, stickyProgress, easeInOutCubic, reducedMotion } from './motion.js';

const pad = (n) => String(n).padStart(2, '0');

// <img> for a photo key, filled from config.photos
export function photoImg(photos, key, { lazy = true, viewer = true } = {}) {
  const p = photos[key];
  const img = document.createElement('img');
  if (!p) { console.warn(`Missing photo "${key}" in config.photos`); return img; }
  img.src = p.src;
  img.alt = p.alt;
  img.dataset.photo = key;
  img.decoding = 'async';
  if (lazy) img.loading = 'lazy';
  if (viewer) img.dataset.viewer = '';
  return img;
}

// ---------- I · hero: the portrait slowly pushes in, the words lift away ----------
function initHero() {
  const hero = document.getElementById('top');
  const media = hero.querySelector('.media-fg');
  const copy = document.getElementById('hero-copy');
  if (reducedMotion) return;
  onFrame(() => {
    const r = hero.getBoundingClientRect();
    if (r.bottom < 0) return;
    const p = clamp(-r.top / r.height);
    media.style.setProperty('--s', (1 + p * 0.12).toFixed(4));
    copy.style.setProperty('--y', `${(-p * 120).toFixed(1)}px`);
    copy.style.setProperty('--o', (1 - p * 1.4).toFixed(3));
  });
}

// ---------- II · the word swap ----------
function initWords(qualities, photos) {
  const root = document.getElementById('words');
  const list = document.getElementById('words-list');
  const stack = document.getElementById('words-photos');
  const line = document.getElementById('words-line');
  const count = document.getElementById('words-count');
  root.style.setProperty('--n', qualities.length);

  const words = qualities.map((q) => {
    const s = document.createElement('span');
    s.textContent = q.word;
    list.append(s);
    return s;
  });
  const imgs = qualities.map((q) => {
    const img = photoImg(photos, q.photo);
    stack.append(img);
    return img;
  });

  let current = -1;
  function set(i) {
    if (i === current) return;
    current = i;
    words.forEach((w, k) => w.classList.toggle('is-active', k === i));
    // photos below the active one stay open, so the next wipes in over them
    imgs.forEach((img, k) => {
      img.classList.toggle('is-active', k === i);
      img.classList.toggle('is-past', k < i);
    });
    line.textContent = qualities[i].line;
    line.classList.remove('is-swapping');
    void line.offsetWidth; // restart the little entrance animation
    line.classList.add('is-swapping');
    count.textContent = `${pad(i + 1)} / ${pad(qualities.length)}`;
  }
  set(0);
  onFrame(() => {
    const p = stickyProgress(root);
    set(Math.min(qualities.length - 1, Math.floor(p * qualities.length)));
  });
}

// ---------- III · the horizontal reel ----------
function initReel(frames, photos) {
  const section = document.getElementById('brother');
  const track = document.getElementById('reel-track');
  const fill = document.getElementById('reel-fill');

  for (const f of frames) {
    if (f.kind === 'photo') {
      const fig = document.createElement('figure');
      fig.className = 'rframe rframe--photo';
      const img = photoImg(photos, f.photo);
      // keep each photo's own shape once it has loaded
      img.addEventListener('load', () => fig.style.setProperty('--ar', `${img.naturalWidth} / ${img.naturalHeight}`), { once: true });
      const cap = document.createElement('figcaption');
      cap.textContent = photos[f.photo]?.caption ?? '';
      fig.append(img, cap);
      track.append(fig);
    } else {
      const div = document.createElement('div');
      div.className = `rframe rframe--text${f.big ? ' rframe--big' : ''}`;
      div.innerHTML = '<p class="label"></p><h3 class="rframe-title"></h3><p class="rframe-body"></p>';
      div.querySelector('.label').textContent = f.kicker;
      div.querySelector('.rframe-title').textContent = f.title;
      div.querySelector('.rframe-body').textContent = f.body;
      track.append(div);
    }
  }
  if (reducedMotion) return;

  // the section is as tall as the track is wide, so vertical scroll maps 1:1 to sideways travel
  let distance = 0;
  const measure = () => {
    distance = Math.max(0, track.scrollWidth - innerWidth);
    section.style.height = `${distance + innerHeight}px`;
  };
  measure();
  addEventListener('resize', measure);
  addEventListener('load', measure);
  track.querySelectorAll('img').forEach((img) => img.addEventListener('load', measure, { once: true }));

  let x = 0;
  const photosInReel = [...track.querySelectorAll('.rframe--photo')];
  onFrame(() => {
    const r = section.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const p = stickyProgress(section);
    x = lerp(x, p * distance, 0.14); // a little lag makes it feel like a camera dolly
    track.style.transform = `translate3d(${-x.toFixed(1)}px, 0, 0)`;
    fill.style.transform = `scaleX(${p.toFixed(4)})`;
    // photos slide a little inside their frames: parallax
    for (const fig of photosInReel) {
      const fr = fig.getBoundingClientRect();
      const c = (fr.left + fr.width / 2) / innerWidth - 0.5;
      fig.style.setProperty('--px', `${(-7 - c * 8).toFixed(2)}%`);
    }
  });
}

// ---------- IV · little moments: the line nearest the middle lights up ----------
function initMoments(moments, photos) {
  const list = document.getElementById('moments-list');
  const stack = document.getElementById('moments-photos');
  const rows = moments.map((m, i) => {
    const li = document.createElement('li');
    const n = document.createElement('span');
    n.className = 'label';
    n.textContent = pad(i + 1);
    li.append(n, m.line);
    if (i === moments.length - 1) li.classList.add('is-last');
    list.append(li);
    return li;
  });
  const imgs = moments.map((m) => {
    const img = photoImg(photos, m.photo, { viewer: false });
    img.alt = '';
    stack.append(img);
    return img;
  });

  let current = -1;
  onFrame(() => {
    const first = rows[0].getBoundingClientRect();
    const last = rows[rows.length - 1].getBoundingClientRect();
    if (last.bottom < 0 || first.top > innerHeight) return;
    // on phones the photo sits on top, so aim lower down the screen
    const aim = innerHeight * (innerWidth < 760 ? 0.68 : 0.5);
    let best = 0;
    let bestD = Infinity;
    rows.forEach((row, i) => {
      const r = row.getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - aim);
      if (d < bestD) { bestD = d; best = i; }
    });
    if (best === current) return;
    current = best;
    rows.forEach((row, i) => row.classList.toggle('is-active', i === best));
    imgs.forEach((img, i) => img.classList.toggle('is-active', i === best));
  });
}

// ---------- VIII · finale: a small frame opens to full screen, then the words arrive ----------
function initFinale() {
  const section = document.getElementById('finale');
  const media = document.getElementById('finale-media');
  const copy = document.getElementById('finale-copy');
  const fg = media.querySelector('.media-fg');
  if (reducedMotion) return;
  onFrame(() => {
    const r = section.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const p = stickyProgress(section);
    const open = easeInOutCubic(clamp(p / 0.5));
    media.style.setProperty('--iy', `${((1 - open) * 22).toFixed(2)}%`);
    media.style.setProperty('--ix', `${((1 - open) * (innerWidth < 760 ? 14 : 32)).toFixed(2)}%`);
    fg.style.setProperty('--s', (1.15 - open * 0.15).toFixed(4));
    section.style.setProperty('--shade', clamp((p - 0.35) / 0.25).toFixed(3));
    copy.style.setProperty('--t1', clamp((p - 0.45) / 0.2).toFixed(3));
    copy.style.setProperty('--t2', clamp((p - 0.62) / 0.2).toFixed(3));
  });
}

// ---------- page-wide: progress line, act slate, current nav link ----------
function initChrome() {
  const fill = document.getElementById('progress-fill');
  const tag = document.getElementById('act-tag');
  const acts = [...document.querySelectorAll('[data-act]')];
  const links = new Map([...document.querySelectorAll('.nav-acts a')].map((a) => [a.getAttribute('href').slice(1), a]));
  let currentAct = null;

  onFrame(() => {
    const max = document.documentElement.scrollHeight - innerHeight;
    fill.style.transform = `scaleX(${clamp(scrollY / Math.max(1, max)).toFixed(4)})`;

    // the act whose top has passed the middle of the screen
    let act = acts[0];
    for (const el of acts) if (el.getBoundingClientRect().top < innerHeight * 0.5) act = el;
    if (act === currentAct) return;
    currentAct = act;
    tag.textContent = `Act ${act.dataset.act}`;
    links.forEach((a, id) => a.classList.toggle('is-current', id === act.id));
  });
}

export function initScenes(config) {
  initWords(config.qualities, config.photos);
  initReel(config.reel, config.photos);
  initMoments(config.moments, config.photos);
  initHero();
  initFinale();
  initChrome();
}
