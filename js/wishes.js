// Ten wish cards. They swing in as you scroll (see choreo.js); tap (or Enter) turns one over.

import { audio } from './audio.js';

const pad = (n) => String(n).padStart(2, '0');

export function initWishes(wishes) {
  const grid = document.getElementById('wish-grid');
  grid.replaceChildren(...wishes.map((w, i) => {
    const li = document.createElement('li');
    li.className = 'wish-item';
    li.innerHTML = `
      <button class="wish" type="button" aria-pressed="false">
        <span class="wish-inner">
          <span class="wish-face wish-front">
            <span class="wish-num">${pad(i + 1)}</span>
            <span><span class="wish-word"></span><span class="wish-rule"></span></span>
          </span>
          <span class="wish-face wish-back"><span class="wish-num">${pad(i + 1)}</span><span class="wish-text"></span></span>
        </span>
      </button>`;
    li.querySelector('.wish-word').textContent = w.word;
    li.querySelector('.wish-text').textContent = w.text;
    li.querySelector('.wish').setAttribute('aria-label', `Wish ${i + 1}: ${w.word}. ${w.text}`);
    return li;
  }));

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.wish');
    if (!btn) return;
    btn.setAttribute('aria-pressed', String(btn.getAttribute('aria-pressed') !== 'true'));
    audio.flip();
  });
}
