// Full-screen photos. Any <img data-viewer data-photo="key"> opens here.
// Arrows, swipe or the buttons move between photos; Esc or Close goes back.
// Each new photo wipes in from the side you're heading to.

import { reducedMotion } from './motion.js';
import { audio } from './audio.js';
import { lock, unlock } from './scroll.js';

const pad = (n) => String(n).padStart(2, '0');

export function initViewer(photos) {
  const viewer = document.getElementById('viewer');
  const frame = document.getElementById('viewer-frame');
  const count = document.getElementById('viewer-count');
  const cap = document.getElementById('viewer-cap');
  const closeBtn = document.getElementById('viewer-close');

  // every viewable photo, in page order, each one once
  const keys = [...new Set([...document.querySelectorAll('img[data-viewer]')].map((img) => img.dataset.photo))]
    .filter((k) => photos[k]);
  let index = 0;
  let open = false;
  let returnFocus = null;

  function addPhoto(from) {
    const p = photos[keys[index]];
    const layer = document.createElement('div');
    layer.className = 'viewer-photo';
    layer.innerHTML = '<img class="vp-bg" alt="" draggable="false"><img class="vp-fg" draggable="false">';
    layer.firstChild.src = p.src;
    layer.lastChild.src = p.src;
    layer.lastChild.alt = p.alt;
    if (from && !reducedMotion) {
      layer.style.clipPath = from > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)';
      frame.append(layer);
      layer.getBoundingClientRect();
      layer.style.clipPath = 'inset(0 0 0 0)';
      // drop the old photo once the new one covers it
      setTimeout(() => { while (frame.children.length > 1) frame.firstElementChild.remove(); }, 950);
    } else {
      frame.replaceChildren(layer);
    }
    count.textContent = `${pad(index + 1)} / ${pad(keys.length)}`;
    cap.textContent = p.caption;
  }

  function show(i, from) {
    index = (i + keys.length) % keys.length;
    addPhoto(from);
    audio.flip();
  }

  function openAt(key) {
    const i = keys.indexOf(key);
    if (i < 0) return;
    index = i;
    open = true;
    returnFocus = document.activeElement;
    viewer.hidden = false;
    lock();
    addPhoto(0);
    audio.chime(true);
    requestAnimationFrame(() => viewer.classList.add('is-open'));
    closeBtn.focus({ preventScroll: true });
  }

  function close() {
    if (!open) return;
    open = false;
    viewer.classList.remove('is-open');
    setTimeout(() => {
      viewer.hidden = true;
      unlock();
      returnFocus?.focus({ preventScroll: true });
    }, reducedMotion ? 0 : 450);
  }

  // make every viewable photo reachable by keyboard too
  document.querySelectorAll('img[data-viewer]').forEach((img) => {
    const p = photos[img.dataset.photo];
    if (!p) return;
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', `View full screen: ${p.alt}`);
  });
  document.addEventListener('click', (e) => {
    const img = e.target.closest('img[data-viewer]');
    if (img) openAt(img.dataset.photo);
  });
  document.addEventListener('keydown', (e) => {
    if (open) {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') show(index + 1, 1);
      if (e.key === 'ArrowLeft') show(index - 1, -1);
      // keep Tab inside the dialog
      if (e.key === 'Tab') {
        const items = [...viewer.querySelectorAll('button')];
        const at = items.indexOf(document.activeElement);
        const next = e.shiftKey ? at - 1 : at + 1;
        e.preventDefault();
        items[(next + items.length) % items.length].focus();
      }
      return;
    }
    const img = e.target.closest?.('img[data-viewer]');
    if (img && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      openAt(img.dataset.photo);
    }
  });

  document.getElementById('viewer-next').addEventListener('click', () => show(index + 1, 1));
  document.getElementById('viewer-prev').addEventListener('click', () => show(index - 1, -1));
  closeBtn.addEventListener('click', close);

  let swipe = null;
  frame.addEventListener('pointerdown', (e) => { swipe = e.clientX; });
  frame.addEventListener('pointerup', (e) => {
    if (swipe === null) return;
    const dx = e.clientX - swipe;
    swipe = null;
    if (Math.abs(dx) > 60) show(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  });
}
