// A custom cursor for mouse users: a gold dot with a trailing ring. The ring grows over
// links and buttons, and turns into a label ("View", "Drag", "Open") over special things.
// Buttons marked data-magnetic lean toward the pointer.

import { reducedMotion } from './motion.js';

export function initCursor() {
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!fine || reducedMotion) return;
  const cursor = document.getElementById('cursor');
  const ring = cursor.querySelector('.cursor-ring');
  const dot = cursor.querySelector('.cursor-dot');
  const label = document.getElementById('cursor-label');
  let x = innerWidth / 2;
  let y = innerHeight / 2;
  let rx = x;
  let ry = y;

  addEventListener('pointermove', (e) => {
    x = e.clientX;
    y = e.clientY;
    dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }, { passive: true });

  (function loop() {
    rx += (x - rx) * 0.18;
    ry += (y - ry) * 0.18;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    requestAnimationFrame(loop);
  })();

  // what's under the pointer decides the cursor's look
  document.addEventListener('pointerover', (e) => {
    const t = e.target;
    let text = '';
    if (t.closest('[data-viewer]')) text = 'View';
    else if (t.closest('.dossier-track')) text = 'Drag';
    else if (t.closest('[data-cursor]')) text = t.closest('[data-cursor]').dataset.cursor;
    else if (t.closest('.wish')) text = 'Turn';
    label.textContent = text;
    cursor.classList.toggle('is-label', Boolean(text));
    cursor.classList.toggle('is-hover', !text && Boolean(t.closest('a, button')));
  });
  document.addEventListener('pointerleave', () => { cursor.style.opacity = '0'; });
  document.addEventListener('pointerenter', () => { cursor.style.opacity = '1'; });

  // magnetic buttons
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    el.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const mx = (e.clientX - (r.left + r.width / 2)) * 0.3;
      const my = (e.clientY - (r.top + r.height / 2)) * 0.4;
      el.style.transform = `translate(${mx}px, ${my}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}
