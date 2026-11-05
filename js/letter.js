// The letter. It starts sealed; opening it unfolds the paper and each paragraph
// arrives one after another, like it's being read aloud.

import { reducedMotion } from './motion.js';
import { audio } from './audio.js';

export function initLetter(paragraphs) {
  const seal = document.getElementById('letter-open');
  const paper = document.getElementById('letter-paper');
  const text = document.getElementById('letter-text');
  const sign = paper.querySelector('.letter-sign');

  text.replaceChildren(...paragraphs.map((para, i) => {
    const p = document.createElement('p');
    p.textContent = para;
    p.style.setProperty('--d', `${500 + i * 650}ms`);
    if (i === paragraphs.length - 1) p.classList.add('is-close');
    return p;
  }));
  sign.style.setProperty('--d', `${500 + paragraphs.length * 650}ms`);

  seal.addEventListener('click', () => {
    seal.setAttribute('aria-expanded', 'true');
    seal.classList.add('is-gone');
    paper.hidden = false;
    paper.classList.add('is-opening');
    audio.flip();
    audio.chime(true);
    // let the paper exist for a frame, then start the paragraph cascade
    requestAnimationFrame(() => requestAnimationFrame(() => paper.classList.add('is-read')));
    paper.setAttribute('tabindex', '-1');
    paper.focus({ preventScroll: true });
    if (!reducedMotion) paper.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, { once: true });
}
