// One place that owns scrolling: Lenis smooth scroll on desktop (synced with GSAP's ScrollTrigger),
// normal native scrolling on touch screens, and lock()/unlock() for overlays like the intro and viewer.

import { reducedMotion } from './motion.js';

let lenis = null;
const html = document.documentElement;

export function initScroll() {
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (window.Lenis && window.gsap && window.ScrollTrigger && fine && !reducedMotion) {
    lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on('scroll', window.ScrollTrigger.update);
    window.gsap.ticker.add((time) => lenis.raf(time * 1000));
    window.gsap.ticker.lagSmoothing(0);
  }

  // in-page links (#gallery, #letter …) glide instead of jumping
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id === '#' || id === '#main') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    scrollToEl(target);
  });
}

export function scrollToEl(target, { immediate = false } = {}) {
  if (lenis) lenis.scrollTo(target, { immediate, offset: 0 });
  else target.scrollIntoView({ behavior: immediate || reducedMotion ? 'auto' : 'smooth' });
}

export function scrollTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true });
  else scrollTo({ top: 0, behavior: 'instant' });
}

export function lock() {
  html.classList.add('is-locked');
  lenis?.stop();
}

export function unlock() {
  html.classList.remove('is-locked');
  lenis?.start();
}
