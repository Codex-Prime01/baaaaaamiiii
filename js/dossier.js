// Act II: five word cards in a swipeable strip. Native scroll-snap does the swiping on phones;
// on desktop you can drag with the mouse or use the arrows. The card in view becomes "active".

export function initDossier({ onChange } = {}) {
  const track = document.getElementById('dossier-track');
  const cards = [...track.querySelectorAll('.dcard')];
  const dots = [...document.querySelectorAll('#dossier-dots button')];
  let current = -1;

  const padLeft = () => parseFloat(getComputedStyle(track).paddingLeft) || 0;

  function goTo(i) {
    const card = cards[Math.max(0, Math.min(cards.length - 1, i))];
    track.scrollTo({ left: card.offsetLeft - padLeft(), behavior: 'smooth' });
  }

  function setActive(i) {
    if (i === current) return;
    current = i;
    cards.forEach((c, k) => c.classList.toggle('is-active', k === i));
    dots.forEach((d, k) => d.setAttribute('aria-current', String(k === i)));
    onChange?.(cards[i], i);
  }

  // the active card is the one whose left edge is closest to where cards snap
  function measure() {
    const snapX = track.getBoundingClientRect().left + padLeft();
    let best = 0;
    let bestD = Infinity;
    cards.forEach((c, i) => {
      const d = Math.abs(c.getBoundingClientRect().left - snapX);
      if (d < bestD) { bestD = d; best = i; }
    });
    setActive(best);
  }
  let raf = 0;
  track.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(measure); }, { passive: true });
  addEventListener('resize', measure);
  measure();

  document.getElementById('dossier-prev').addEventListener('click', () => goTo(current - 1));
  document.getElementById('dossier-next').addEventListener('click', () => goTo(current + 1));
  dots.forEach((d) => d.addEventListener('click', () => goTo(Number(d.dataset.index))));
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(current - 1); }
  });

  // mouse drag (touch screens already swipe natively)
  let drag = null;
  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    drag = { x: e.clientX, left: track.scrollLeft, start: current, moved: false };
    track.classList.add('is-dragging');
  });
  addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (Math.abs(dx) > 4) drag.moved = true;
    track.scrollLeft = drag.left - dx;
  });
  addEventListener('pointerup', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    const { moved, start } = drag;
    drag = null;
    track.classList.remove('is-dragging');
    // a short flick moves one card; otherwise settle back
    if (moved) goTo(Math.abs(dx) > 60 ? start + (dx < 0 ? 1 : -1) : start);
  });
}
