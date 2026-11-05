// The letter. It starts sealed; opening it unfolds the paper, then the letter arrives
// line by line from behind a mask, like it's being read aloud.

import { reducedMotion } from './motion.js';
import { audio } from './audio.js';
import { scrollToEl } from './scroll.js';

export function initLetter(paragraphs) {
  const seal = document.getElementById('letter-open');
  const paper = document.getElementById('letter-paper');
  const text = document.getElementById('letter-text');
  const sign = paper.querySelector('.letter-sign');

  text.replaceChildren(...paragraphs.map((para, i) => {
    const p = document.createElement('p');
    p.textContent = para;
    if (i === paragraphs.length - 1) p.classList.add('is-close');
    return p;
  }));

  seal.addEventListener('click', () => {
    seal.setAttribute('aria-expanded', 'true');
    seal.classList.add('is-gone');
    paper.hidden = false;
    audio.flip();
    audio.chime(true);
    paper.setAttribute('tabindex', '-1');
    paper.focus({ preventScroll: true });
    window.ScrollTrigger?.refresh(); // the page just got taller
    scrollToEl(paper);

    const { gsap, SplitText } = window;
    if (reducedMotion || !gsap || !SplitText) return;
    gsap.from(paper, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.3, ease: 'expo.inOut' });
    // every line of every paragraph rises in turn
    const split = SplitText.create(text.querySelectorAll('p'), { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.07, delay: 0.5 });
    gsap.from([paper.querySelector('.letter-date'), sign], { opacity: 0, y: 16, duration: 1, ease: 'expo.out', delay: 0.4, stagger: { each: split.lines.length * 0.07 + 0.2 } });
  }, { once: true });
}
