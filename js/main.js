// Boot: put the content from config.js into the page, then start every part of the film.

import { config } from './config.js';
import { reducedMotion } from './motion.js';
import { audio } from './audio.js';
import { initReveal, release } from './reveal.js';
import { initFx } from './fx.js';
import { initIntro } from './intro.js';
import { initScenes } from './scenes.js';
import { initViewer } from './viewer.js';
import { initLetter } from './letter.js';
import { initWishes } from './wishes.js';

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

  $('#credits-list').replaceChildren(...config.credits.map(([role, name], i) => {
    const row = document.createElement('div');
    row.dataset.reveal = '';
    row.style.setProperty('--d', `${i * 120}ms`);
    const dt = document.createElement('dt');
    dt.className = 'label';
    dt.textContent = role;
    const dd = document.createElement('dd');
    dd.textContent = name;
    row.append(dt, dd);
    return row;
  }));
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
      // first tap: if they'd muted it before, this tap means "I want sound now"
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
initScenes(config);
initLetter(config.letter);
initWishes(config.wishes);
initReveal();
initViewer(config.photos);
initFx($('#fx'));
initSoundButton();

const hero = $('#top');
const intro = initIntro({
  lines: config.intro,
  onBegin: () => audio.start(config.song.src), // the Begin tap counts as permission to play sound
  onDone: () => release(hero),
});
// if motion is reduced, the hero shouldn't wait for anything
if (reducedMotion) release(hero);

$('#replay').addEventListener('click', () => intro.replay());

// skip link: focus the content without jumping the scroll
$('#skip').addEventListener('click', (e) => {
  e.preventDefault();
  $('#main').focus();
});
