// Builds the repeated parts of the page from config: marquee, word cards, reel, moments, credits.
// Only DOM here. Motion lives in choreo.js.

const pad = (n) => String(n).padStart(2, '0');

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

// <img> for a photo key from config.photos
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

export function buildMarquee(words) {
  const track = document.getElementById('marquee-track');
  // two identical halves, so the loop can reset invisibly at -50%
  const half = [];
  for (let r = 0; r < 3; r++) {
    for (const w of words) {
      const item = el('span', 'marquee-item');
      item.append(el('span', 'mq-word', w), el('span', 'mq-star', '✦'));
      half.push(item);
    }
  }
  track.replaceChildren(...half, ...half.map((n) => n.cloneNode(true)));
}

export function buildDossier(qualities, photos) {
  const track = document.getElementById('dossier-track');
  const dots = document.getElementById('dossier-dots');
  track.replaceChildren(...qualities.map((q, i) => {
    const card = el('article', 'dcard');
    card.setAttribute('aria-label', `${i + 1} of ${qualities.length}: ${q.word}`);
    const media = el('figure', 'dcard-media');
    media.append(photoImg(photos, q.photo, { viewer: false }));
    const copy = el('div', 'dcard-copy');
    copy.append(el('span', 'dcard-num', `${pad(i + 1)} / ${pad(qualities.length)}`), el('h3', 'dcard-word', q.word), el('p', 'dcard-line', q.line));
    card.append(media, copy);
    return card;
  }));
  dots.replaceChildren(...qualities.map((q, i) => {
    const b = el('button');
    b.type = 'button';
    b.setAttribute('aria-label', `Show ${q.word}`);
    b.dataset.index = i;
    return b;
  }));
}

export function buildReel(frames, photos) {
  const track = document.getElementById('reel-track');
  track.replaceChildren(...frames.map((f) => {
    if (f.kind === 'photo') {
      const fig = el('figure', 'rframe rframe--photo');
      const img = photoImg(photos, f.photo);
      // each frame keeps its photo's own shape
      const setRatio = () => fig.style.setProperty('--ar', `${img.naturalWidth} / ${img.naturalHeight}`);
      if (img.complete && img.naturalWidth) setRatio();
      else img.addEventListener('load', setRatio, { once: true });
      fig.append(img, el('figcaption', '', photos[f.photo]?.caption ?? ''));
      return fig;
    }
    const div = el('div', `rframe rframe--text${f.big ? ' rframe--big' : ''}`);
    div.append(el('p', 'label', f.kicker), el('h3', 'rframe-title', f.title), el('p', 'rframe-body', f.body));
    return div;
  }));
}

export function buildMoments(moments, photos) {
  const list = document.getElementById('moments-list');
  const tilts = [-4, 3, -2, 4, -3];
  list.replaceChildren(...moments.map((m, i) => {
    const li = el('li', `mrow${i === moments.length - 1 ? ' is-last' : ''}`);
    const fig = el('figure', 'mrow-photo');
    fig.style.setProperty('--rot', `${tilts[i % tilts.length]}deg`);
    fig.append(photoImg(photos, m.photo));
    li.append(el('span', 'label', pad(i + 1)), el('span', 'mrow-text', m.line), fig);
    return li;
  }));
}

export function buildCredits(credits) {
  document.getElementById('credits-list').replaceChildren(...credits.map(([role, name]) => {
    const row = el('div', 'credit-row');
    row.append(el('dt', 'label', role), el('dd', '', name));
    return row;
  }));
}
