// All the motion choreography, built on GSAP + ScrollTrigger + SplitText.
// Headlines rise line by line from behind a mask, labels decode from scrambled letters,
// photos open behind curtains, and the long scenes (reel, finale) are pinned and scrubbed.
// If GSAP didn't load, initChoreo returns null and the page simply stays still.

const SCRAMBLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function initChoreo() {
  const { gsap, ScrollTrigger, SplitText } = window;
  if (!gsap || !ScrollTrigger || !SplitText) return null;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  document.documentElement.classList.add('has-gsap');
  const motion = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ease = 'expo.out';

  // ---------- helpers ----------

  // Lines slide up from behind their own mask. autoSplit re-splits when the width changes.
  function linesReveal(el, { start = 'top 86%', delay = 0, play = 'scroll' } = {}) {
    let tween;
    SplitText.create(el, {
      type: 'lines', mask: 'lines', autoSplit: true,
      onSplit(self) {
        tween = gsap.from(self.lines, {
          yPercent: 115, duration: 1.25, ease, stagger: 0.1, delay,
          paused: play !== 'scroll',
          scrollTrigger: play === 'scroll' ? { trigger: el, start, once: true } : undefined,
        });
        return tween;
      },
    });
    return () => tween?.play();
  }

  // Letters flick through random characters before settling: a "decoding" label.
  function scramble(el, { start = 'top 90%', immediate = false } = {}) {
    const final = el.textContent;
    const run = () => {
      const state = { p: 0 };
      gsap.to(state, {
        p: 1, duration: Math.min(1.4, 0.5 + final.length * 0.018), ease: 'power2.out',
        onStart: () => gsap.set(el, { opacity: 1 }),
        onUpdate: () => {
          const fixed = Math.floor(state.p * final.length);
          el.textContent = [...final].map((ch, i) => (i < fixed || ch === ' ' || ch === '·' ? ch : SCRAMBLE[(Math.random() * SCRAMBLE.length) | 0])).join('');
        },
        onComplete: () => { el.textContent = final; },
      });
    };
    gsap.set(el, { opacity: 0 });
    if (immediate) return run;
    ScrollTrigger.create({ trigger: el, start, once: true, onEnter: run });
    return run;
  }

  // Photo behind a curtain: the frame opens upward while the photo settles from a zoom.
  function curtain(wrapper, { start = 'top 85%', delay = 0 } = {}) {
    const img = wrapper.querySelector('img');
    const tl = gsap.timeline({ scrollTrigger: { trigger: wrapper, start, once: true }, delay });
    tl.fromTo(wrapper, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' });
    if (img) tl.fromTo(img, { scale: 1.35 }, { scale: 1, duration: 1.8, ease }, 0);
    return tl;
  }

  // ---------- page-wide pieces ----------

  gsap.to('#progress-fill', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

  const watchActs = watchActsFactory(gsap, ScrollTrigger, motion);
  if (!motion) watchActs();

  if (!motion) return { heroIn() {}, dossierCard() {}, galleryIn() {}, galleryOut: async () => {}, refresh() {} };

  // ---------- I · hero ----------
  const heroTitle = document.getElementById('hero-title');
  // gold "shimmer" words use background-clip:text, which breaks if split into letters,
  // so the gold line rises as one piece behind a clip instead
  const heroChars = SplitText.create(heroTitle.querySelectorAll('.ht-line:not(.shimmer)'), { type: 'chars', mask: 'chars' }).chars;
  const heroGold = heroTitle.querySelector('.ht-line.shimmer');
  const heroKicker = scramble(document.querySelector('.hero-kicker'), { immediate: true });
  const heroSub = linesReveal(document.getElementById('hero-sub'), { play: 'manual' });
  const heroFg = document.querySelector('#hero-media .media-fg');
  const heroIntro = gsap.timeline({ paused: true })
    .from(heroFg, { scale: 1.3, filter: 'brightness(0.2)', duration: 2.4, ease: 'expo.out' }, 0)
    .from(heroChars, { yPercent: 120, rotateX: -70, transformOrigin: '50% 100%', duration: 1.4, ease, stagger: 0.032 }, 0.15)
    .fromTo(heroGold, { clipPath: 'inset(0% 0% 100% 0%)', yPercent: 60 }, { clipPath: 'inset(0% 0% -10% 0%)', yPercent: 0, duration: 1.4, ease }, 0.55)
    .add(heroKicker, 0.1)
    .add(heroSub, 0.7);

  // scrolling away: the words spread apart and lift, the portrait drifts down
  // (containers are animated here, so these never fight the intro tweens on the same elements)
  gsap.timeline({ scrollTrigger: { trigger: '#top', start: 'top top', end: 'bottom top', scrub: true } })
    .to(heroTitle, { letterSpacing: '0.06em', ease: 'none' }, 0)
    .to('#hero-copy', { yPercent: -25, opacity: 0, ease: 'none' }, 0)
    .to('#hero-media', { yPercent: 12, scale: 1.12, ease: 'none' }, 0);

  // ---------- marquee: always moving, faster (and backwards) with the scroll ----------
  const marquee = gsap.to('#marquee-track', { xPercent: -50, duration: 38, ease: 'none', repeat: -1 });
  ScrollTrigger.create({
    trigger: '.marquee', start: 'top bottom', end: 'bottom top',
    onUpdate(self) {
      const v = self.getVelocity() / 260;
      gsap.to(marquee, { timeScale: Math.max(-6, Math.min(6, 1 + v)), duration: 0.25, overwrite: true });
      gsap.to(marquee, { timeScale: 1, duration: 1.2, delay: 0.25, overwrite: false });
    },
  });

  // ---------- act headers ----------
  document.querySelectorAll('.act-num').forEach((num) => {
    gsap.fromTo(num, { yPercent: 35, opacity: 0 }, { yPercent: -25, opacity: 1, ease: 'none', scrollTrigger: { trigger: num.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  document.querySelectorAll('.act-rule').forEach((rule) => {
    gsap.from(rule, { scaleX: 0, duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: rule, start: 'top 90%', once: true } });
  });
  document.querySelectorAll('[data-scramble]:not(.hero-kicker)').forEach((el) => scramble(el));
  document.querySelectorAll('[data-lines]').forEach((el) => linesReveal(el));

  // ---------- II · dossier ----------
  // the strip slides in as a whole (the cards' own opacity is CSS-driven by which one is active)
  gsap.from('#dossier-track', { x: 220, opacity: 0, duration: 1.6, ease, scrollTrigger: { trigger: '#dossier', start: 'top 80%', once: true } });
  gsap.from('.dossier-ui > *', { y: 20, opacity: 0, duration: 1, ease, stagger: 0.06, scrollTrigger: { trigger: '.dossier-ui', start: 'top 95%', once: true } });
  const cardChars = new Map();
  function dossierCard(card) {
    if (!cardChars.has(card)) cardChars.set(card, SplitText.create(card.querySelector('.dcard-word'), { type: 'chars', mask: 'chars' }).chars);
    gsap.fromTo(cardChars.get(card), { yPercent: 110 }, { yPercent: 0, duration: 1, ease, stagger: 0.035, overwrite: true });
    gsap.fromTo(card.querySelector('.dcard-line'), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 0.25, ease, overwrite: true });
    gsap.fromTo(card.querySelector('.dcard-num'), { opacity: 0 }, { opacity: 1, duration: 0.8, ease, overwrite: true });
  }

  // ---------- III · the reel: pinned, vertical scroll drives it sideways ----------
  const reelTrack = document.getElementById('reel-track');
  const distance = () => Math.max(0, reelTrack.scrollWidth - innerWidth);
  const reel = gsap.to(reelTrack, {
    x: () => -distance(), ease: 'none',
    scrollTrigger: { trigger: '#brother', start: 'top top', end: () => `+=${distance()}`, pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 },
  });
  gsap.to('#reel-fill', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '#brother', start: 'top top', end: () => `+=${distance()}`, scrub: true, invalidateOnRefresh: true } });
  reelTrack.querySelectorAll('.rframe--text').forEach((frame) => {
    const words = SplitText.create(frame.querySelector('.rframe-title'), { type: 'words', mask: 'words' }).words;
    gsap.timeline({ scrollTrigger: { trigger: frame, containerAnimation: reel, start: 'left 82%', once: true } })
      .from(frame.querySelector('.label'), { opacity: 0, x: -20, duration: 0.8, ease })
      .from(words, { yPercent: 110, duration: 1.1, ease, stagger: 0.07 }, 0.05)
      .from(frame.querySelector('.rframe-body'), { opacity: 0, y: 24, duration: 1, ease }, 0.35);
  });
  reelTrack.querySelectorAll('.rframe--photo').forEach((fig) => {
    gsap.fromTo(fig.querySelector('img'), { xPercent: -14 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: fig, containerAnimation: reel, start: 'left right', end: 'right left', scrub: true } });
    gsap.from(fig, { clipPath: 'inset(0% 0% 0% 100%)', duration: 1.3, ease: 'expo.inOut', scrollTrigger: { trigger: fig, containerAnimation: reel, start: 'left 90%', once: true } });
  });

  // ---------- IV · moments: each line fills with ink as you pass it ----------
  document.querySelectorAll('.mrow').forEach((row) => {
    gsap.fromTo(row.querySelector('.mrow-text'), { backgroundPosition: '100% 0' }, { backgroundPosition: '0% 0', ease: 'none', scrollTrigger: { trigger: row, start: 'top 82%', end: 'top 42%', scrub: true } });
    const fig = row.querySelector('.mrow-photo');
    gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 72%', once: true } })
      .fromTo(fig, { clipPath: 'inset(100% 0% 0% 0%)', y: 50 }, { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 1.3, ease: 'expo.inOut' })
      .fromTo(fig.querySelector('img'), { scale: 1.4 }, { scale: 1, duration: 1.6, ease }, 0);
    gsap.from(row.querySelector('.label'), { opacity: 0, x: -16, duration: 0.8, ease, scrollTrigger: { trigger: row, start: 'top 85%', once: true } });
  });

  // ---------- V · respect + beyond ----------
  document.querySelectorAll('.reveal-img').forEach((w, i) => curtain(w, { delay: (i % 4) * 0.08 }));
  document.querySelectorAll('[data-speed]').forEach((el) => {
    gsap.to(el, { y: () => parseFloat(el.dataset.speed) * innerHeight, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
  });
  const roles = document.querySelectorAll('#beyond-roles span, #beyond-roles i');
  gsap.from(roles, { yPercent: 80, opacity: 0, duration: 1.2, ease, stagger: 0.08, scrollTrigger: { trigger: '#beyond-roles', start: 'top 85%', once: true } });

  const mm = gsap.matchMedia();
  mm.add('(min-width: 761px)', () => {
    // the photos fly in from a scattered pile and settle into the collage as you scroll
    const spread = [[-60, 160, -18], [-260, -40, -24], [260, -60, 22], [-180, 260, 16], [200, 240, -20]];
    document.querySelectorAll('.bfig').forEach((fig, i) => {
      const [x, y, r] = spread[i];
      gsap.from(fig, { x, y, rotation: r, opacity: 0, ease: 'power2.out', scrollTrigger: { trigger: '#beyond-stack', start: 'top 95%', end: 'top 35%', scrub: 1 } });
    });
  });
  mm.add('(max-width: 760px)', () => {
    gsap.from('.bfig', { y: 60, opacity: 0, duration: 1.2, ease, stagger: 0.1, scrollTrigger: { trigger: '#beyond-stack', start: 'top 85%', once: true } });
  });

  // ---------- VI · gallery ----------
  function galleryIn(items, { onScroll = false } = {}) {
    const reveal = (batch) => gsap.timeline()
      .fromTo(batch, { clipPath: 'inset(100% 0% 0% 0%)', opacity: 1, y: 40 }, { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 1.3, ease: 'expo.inOut', stagger: 0.08 })
      .fromTo(batch.map((b) => b.querySelector('img')), { scale: 1.35 }, { scale: 1, duration: 1.7, ease, stagger: 0.08 }, 0);
    if (!onScroll) { reveal(items); ScrollTrigger.refresh(); return; }
    gsap.set(items, { clipPath: 'inset(100% 0% 0% 0%)' });
    ScrollTrigger.batch(items, { start: 'top 92%', once: true, onEnter: reveal });
  }
  function galleryOut(items) {
    return new Promise((resolve) => {
      if (!items.length) { resolve(); return; }
      gsap.to(items, { opacity: 0, y: -24, scale: 0.97, duration: 0.4, ease: 'power2.in', stagger: 0.025, onComplete: resolve });
    });
  }
  mm.add('(min-width: 1100px)', () => {
    // the inner columns drift against the others: a slow, layered parallax
    document.querySelectorAll('.gcol').forEach((col, i) => {
      const odd = i % 2 === 1;
      gsap.fromTo(col, { y: odd ? 100 : 0 }, { y: odd ? -100 : 30, ease: 'none', scrollTrigger: { trigger: '#gallery-grid', start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  });
  gsap.from('#gallery-filters button', { y: 20, opacity: 0, duration: 0.9, ease, stagger: 0.06, scrollTrigger: { trigger: '#gallery-filters', start: 'top 92%', once: true } });

  // ---------- VIII · wishes: cards swing open like doors ----------
  gsap.set('.wish-item', { transformPerspective: 900 });
  ScrollTrigger.batch('.wish-item', {
    start: 'top 92%', once: true,
    onEnter: (batch) => gsap.from(batch, { rotationY: -75, opacity: 0, y: 40, transformOrigin: 'left center', duration: 1.3, ease, stagger: 0.08 }),
  });

  // ---------- IX · finale: a small frame opens to full screen, then the words land ----------
  const finaleChars = SplitText.create(document.getElementById('finale-title'), { type: 'chars', mask: 'chars' }).chars;
  const sideInset = () => (innerWidth < 760 ? 12 : 32);
  gsap.timeline({ scrollTrigger: { trigger: '#finale', start: 'top top', end: '+=120%', pin: true, scrub: 0.8, invalidateOnRefresh: true } })
    .fromTo('#finale-media', { clipPath: () => `inset(22% ${sideInset()}% 22% ${sideInset()}% round 6px)` }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'power2.inOut', duration: 1 }, 0)
    .fromTo('#finale-media .media-fg', { scale: 1.25 }, { scale: 1, ease: 'power2.out', duration: 1 }, 0)
    .fromTo('#finale-shade', { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.45)
    .from('#finale-toast', { y: 30, opacity: 0, duration: 0.4 }, 0.65)
    .from(finaleChars, { yPercent: 115, duration: 0.5, stagger: 0.012, ease: 'power3.out' }, 0.8);

  // ---------- credits ----------
  gsap.from('.credit-row', { y: 30, opacity: 0, duration: 1.1, ease, stagger: 0.12, scrollTrigger: { trigger: '#credits-list', start: 'top 85%', once: true } });
  gsap.from('.credits-actions > *', { y: 20, opacity: 0, duration: 1, ease, stagger: 0.1, scrollTrigger: { trigger: '.credits-actions', start: 'top 95%', once: true } });

  // Triggers were created by feature, not in page order. Sorting makes each one account for
  // the pinned scenes above it (otherwise everything after the reel fires too early).
  watchActs(); // after the pins exist, so it can find their spacers
  ScrollTrigger.sort();
  ScrollTrigger.refresh();
  // photos load lazily and change heights; re-measure once everything has arrived
  addEventListener('load', () => ScrollTrigger.refresh());

  return {
    heroIn: () => heroIntro.play(0),
    dossierCard,
    galleryIn,
    galleryOut,
    refresh: () => ScrollTrigger.refresh(),
  };
}

// The act slate (bottom-left) and the current nav link follow whichever act fills the middle of the screen.
// Pinned acts are measured by their pin-spacer, which includes all the extra scroll distance.
function watchActsFactory(gsap, ScrollTrigger, motion) {
  return function watchActs() {
    const tag = document.getElementById('act-tag');
    const links = new Map([...document.querySelectorAll('.nav-acts a')].map((a) => [a.getAttribute('href').slice(1), a]));
    document.querySelectorAll('[data-act]').forEach((sec) => {
      ScrollTrigger.create({
        trigger: sec.parentElement.classList.contains('pin-spacer') ? sec.parentElement : sec,
        start: 'top 55%', end: 'bottom 55%',
        onToggle: (self) => {
          if (!self.isActive) return;
          tag.textContent = `Act ${sec.dataset.act}`;
          links.forEach((a, id) => a.classList.toggle('is-current', id === sec.id));
          if (motion) gsap.fromTo(tag, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: 'expo.out' });
        },
      });
    });
  };
}
