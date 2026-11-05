# Happy Birthday, Baami

A short film in a web page, for Paul: a course mate who became an elder brother.

> Not every brother shares your blood. Some are found along the way.

Plain HTML, CSS and JavaScript (ES modules). No framework, no build step, no dependencies besides Google Fonts.

## The film

| Act | What happens |
| --- | --- |
| **Title sequence** | Letterbox bars slide in, the opening lines write themselves in, and Paul's portrait rises out of the dark under a slow band of light. "Begin" starts the music. "Skip intro" (or Esc) is there from the first second. |
| **I · The day** | Full-height portrait and a giant "Happy birthday, Baami." The photo pushes in as you scroll. |
| **II · The man** | A pinned scene. Five words (Maturity, Responsibility, Respect, Dedication, Openness) light up one by one, each with its own photo wiping in. |
| **III · Course mate → brother** | A horizontal reel driven by vertical scroll: text cards and photos with parallax, plus a gold progress rail. |
| **IV · The little moments** | "We read. We study. We talk. We sit." The line nearest the middle fills in and a matching photo cross-fades beside it. |
| **V · Respect** | An olive-toned section with crop-marked field photos, then "Beyond the uniform": student, husband, friend, brother, with the wedding photos laid out as an overlapping collage. |
| **VI · The letter** | A sealed card. Open it and the paper unfolds, then the letter arrives paragraph by paragraph. |
| **VII · Wishes** | Ten cards that light up as they arrive. Tap one to turn it over. |
| **VIII · Finale** | A small frame opens to full screen on the thumbs-up photo, then the toast and "Happy birthday, Oga mi." End credits roll, and "Watch it again" replays the title sequence. |

Every photo opens full screen when tapped (arrows, swipe, Esc).

## Run it

ES modules need a local server, so opening the file directly won't work:

```bash
python -m http.server 5180
# then open http://localhost:5180
```

## Change things

- **Words and photos:** `js/config.js`. Name, nicknames, date, the letter, wishes, captions and credits all live there.
- **Colours and fonts:** `css/tokens.css`.
- **Music:** `assets/audio/song.mp3`. If it can't load, a calm code-made piano track plays instead.

## Files

```
index.html        the page: title sequence, eight acts, viewer
css/tokens.css    colours, fonts, easing
css/base.css      reset, type, buttons, nav, grain, reveals, viewer
css/sections.css  one block per act
js/config.js      all personal content  ← edit this
js/main.js        fills the page from config and starts everything
js/intro.js       the title sequence
js/scenes.js      scroll scenes: hero, word swap, reel, moments, finale, progress
js/letter.js      the sealed letter
js/wishes.js      the wish cards
js/viewer.js      full-screen photos
js/fx.js          drifting gold dust (canvas)
js/audio.js       song playback with fade-in, code-made fallback music, small sounds
js/motion.js      easing, springs, scroll progress, one shared animation loop
js/reveal.js      letter-by-letter and mask reveals
```

## Accessibility

- Keyboard works everywhere: photos, the letter, wish cards and the viewer.
- Screen readers get plain text for every animated headline.
- With `prefers-reduced-motion` the film becomes still but stays fully readable.
- Sound never plays until the visitor taps.

## Credits

Written and built by Perey for his brother Paul, 5 November 2026. Music: "Oluwa Ku'se" by Psalmos. Fonts: Big Shoulders Display, Cormorant Garamond, Manrope.
