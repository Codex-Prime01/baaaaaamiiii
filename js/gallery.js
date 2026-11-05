// Act VI: the archive. Every photo in a staggered masonry of columns, with filter chips.
// Filtering fades the current frames out, re-deals the matching ones into the columns,
// and brings them back in with a curtain reveal. Tapping a frame opens the full-screen viewer.

import { photoImg } from './build.js';

const pad = (n) => String(n).padStart(2, '0');

export function initGallery(photos, tags, { animateIn, animateOut, onLayout } = {}) {
  const grid = document.getElementById('gallery-grid');
  const filters = document.getElementById('gallery-filters');
  const count = document.getElementById('gallery-count');
  const keys = Object.keys(photos);
  const colCount = () => (innerWidth >= 1100 ? 4 : innerWidth >= 700 ? 3 : 2);
  // a rhythm of crop shapes keeps the masonry lively without letting tall photos run on forever
  const SHAPES = ['3 / 4', '1 / 1', '4 / 5', '3 / 4', '5 / 4', '4 / 5'];
  let cols = [];
  let active = 'all';
  let busy = false;

  // the columns stay put (they carry the parallax); only their contents change
  function makeColumns() {
    const n = colCount();
    if (cols.length === n) return;
    cols = Array.from({ length: n }, (_, i) => {
      const c = document.createElement('div');
      c.className = 'gcol';
      c.dataset.col = i;
      return c;
    });
    grid.replaceChildren(...cols);
  }

  function item(key, i) {
    const p = photos[key];
    const fig = document.createElement('figure');
    fig.className = 'gitem';
    const img = photoImg(photos, key);
    img.style.aspectRatio = SHAPES[i % SHAPES.length];
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', `View full screen: ${p.alt}`);
    const num = document.createElement('span');
    num.className = 'gitem-num';
    num.textContent = pad(i + 1);
    const cap = document.createElement('figcaption');
    const text = document.createElement('span');
    text.className = 'gitem-cap';
    text.textContent = p.caption;
    const tag = document.createElement('span');
    tag.className = 'label';
    tag.textContent = tags.find(([t]) => t === p.tag)?.[1] ?? '';
    cap.append(text, tag);
    fig.append(img, num, cap);
    return fig;
  }

  function layout() {
    makeColumns();
    const shown = keys.filter((k) => active === 'all' || photos[k].tag === active);
    cols.forEach((c) => c.replaceChildren());
    // deal the photos across the columns like cards, so each column gets a mix
    const items = shown.map((k, i) => {
      const fig = item(k, i);
      cols[i % cols.length].append(fig);
      return fig;
    });
    count.textContent = shown.length;
    onLayout?.(items, cols);
    return items;
  }

  filters.replaceChildren(...tags.map(([tag, label]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    b.dataset.tag = tag;
    b.setAttribute('aria-pressed', String(tag === active));
    return b;
  }));

  filters.addEventListener('click', async (e) => {
    const b = e.target.closest('button');
    if (!b || busy || b.dataset.tag === active) return;
    busy = true;
    active = b.dataset.tag;
    filters.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    if (animateOut) await animateOut([...grid.querySelectorAll('.gitem')]);
    const items = layout();
    if (animateIn) animateIn(items);
    busy = false;
  });

  // re-deal when the number of columns changes (phone ↔ desktop)
  let lastCols = colCount();
  addEventListener('resize', () => {
    if (colCount() === lastCols) return;
    lastCols = colCount();
    cols = [];
    layout();
  });

  return layout();
}
