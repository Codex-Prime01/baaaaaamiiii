// Boot: fill the page from config.js, build the repeated parts, then start the motion,
// the gallery, the viewer, the sound and finally the opening titles.

import { config } from './config.js';
import { audio } from './audio.js';
import { initFx } from './fx.js';
import { initScroll } from './scroll.js';
import { initIntro } from './intro.js';
import { buildMarquee, buildDossier, buildReel, buildMoments, buildCredits } from './build.js';
import { initChoreo } from './choreo.js';
import { initDossier } from './dossier.js';
import { initGallery } from './gallery.js';
import { initViewer } from './viewer.js';
import { initLetter } from './letter.js';
import { initWishes } from './wishes.js';
import { initCursor } from './cursor.js';

const $ = (s) => document.querySelector(s);

function renderContent() {
  // text: <span data-bind="nickname"> gets config.nickname
  document.querySelectorAll('[data-bind]').forEach((el) => {
    const value = config[el.dataset.bind];
    if (value === undefined) console.warn(`config.${el.dataset.bind} is missing`);
    else el.textContent = value;
  });

  // photos written straight into the HTML: <img data-photo="key">
  document.querySelectorAll('img[data-photo]').forEach((img) => {
    const p = config.photos[img.dataset.photo];
    if (!p) { console.warn(`Missing photo "${img.dataset.photo}" in config.photos`); return; }
    img.src = p.src;
    img.decoding = 'async';
    // decorative copies (blurred backgrounds, the intro) keep an empty alt
    if (img.getAttribute('aria-hidden') !== 'true' && !img.closest('[aria-hidden="true"]')) img.alt = p.alt;
  });
}

function initSoundButton() {
  const btn = $('#sound-btn');
  const text = $('#sound-text');
  const sync = () => {
    const on = audio.started && !audio.muted;
    btn.classList.toggle('is-on', on);
    btn.setAttribute('aria-pressed', String(on));
    btn.setAttribute('aria-label', on ? 'Turn music off' : 'Turn music on');
    text.textContent = on ? 'Music on' : 'Music off';
  };
  btn.addEventListener('click', () => {
    if (!audio.started) {
      // first tap: if they'd muted it on an earlier visit, this tap means "I want sound now"
      if (audio.muted) audio.toggle();
      audio.start(config.song.src);
    } else {
      audio.toggle();
    }
  });
  audio.onChange(sync);
  sync();
}

renderContent();
buildMarquee([config.nickname, config.nickname2, 'Brother', config.birthdayShort]);
buildDossier(config.qualities, config.photos);
buildReel(config.reel, config.photos);
buildMoments(config.moments, config.photos);
buildCredits(config.credits);
initWishes(config.wishes);
initLetter(config.letter);
initScroll();

// SplitText measures lines, so the real fonts must be in first (but never wait forever)
await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]);

const galleryItems = initGallery(config.photos, config.galleryTags, {
  animateIn: (items) => choreo?.galleryIn(items),
  animateOut: (items) => choreo?.galleryOut(items),
});
const choreo = initChoreo();
if (!choreo) console.warn('GSAP did not load, so the page is showing without its animations.');
choreo?.galleryIn(galleryItems, { onScroll: true });

initDossier({ onChange: (card) => choreo?.dossierCard(card) });
initViewer(config.photos);
initFx($('#fx'));
initCursor();
initSoundButton();

const intro = initIntro({
  lines: config.intro,
  // only wait for the photos seen first; the rest load lazily as you scroll
  images: ['grey-kaftan', 'grey-phone', 'white-tee', 'bench-tall', 'bench-seated'].map((k) => config.photos[k].src),
  onBegin: () => audio.start(config.song.src), // the Begin tap counts as permission to play sound
  onDone: () => { choreo?.heroIn(); choreo?.refresh(); },
});

$('#replay').addEventListener('click', () => intro.replay());

// skip link: focus the content without jumping the scroll
$('#skip').addEventListener('click', (e) => {
  e.preventDefault();
  $('#main').focus();
});
