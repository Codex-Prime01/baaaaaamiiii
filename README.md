# Happy Birthday, Baami

A short film in a web page, for Paul: a course mate who became an elder brother.

> Not every brother shares your blood. Some are found along the way.

Plain HTML, CSS and JavaScript (ES modules), no build step. Motion is choreographed with [GSAP](https://gsap.com) (ScrollTrigger + SplitText), and desktop scrolling is smoothed with [Lenis](https://lenis.darkroom.engineering). Both load from a CDN. If they fail to load, the page still shows everything, just without the motion.

## The film

| Act | What happens |
| --- | --- |
| **Loader + titles** | A big counter runs 000 → 100 while the photos really load. Then letterbox bars, the opening lines writing themselves in, and Paul's portrait rising out of the dark. "Begin" starts the music. "Skip intro" is there from the first second. |
| **I · The day** | "Happy birthday, Baami." Letters flip up one by one, the label decodes from scrambled characters, and the gold word shimmers. Scrolling away spreads the letters and drifts the portrait. |
| **Marquee** | BAAMI · OGA MI · BROTHER · 05·11 runs across the screen. It speeds up and even reverses with your scroll. |
| **II · The man** | Five word cards (Maturity, Responsibility …). Swipe on a phone, drag or use the arrows on desktop. Each word types itself in when its card arrives. |
| **III · Course mate → brother** | A pinned reel: vertical scroll drives it sideways. Titles rise word by word, photos wipe in with parallax. |
| **IV · Little moments** | "We read. We study. We talk. We sit." Each outlined line fills with ink as you pass it, and a tilted photo opens beside it. |
| **V · Respect** | Olive-toned field photos behind curtain reveals with parallax, then "Beyond the uniform": the wedding photos fly in from a scattered pile and settle into a collage. |
| **VI · Gallery** | All 18 photos in a masonry with drifting columns. Filter by Him, Brotherhood, Service or Family. Tap any photo for full screen. |
| **VII · The letter** | A sealed card. Open it and the paper unfolds, then the letter rises line by line. |
| **VIII · Wishes** | Ten cards swing in like doors. Tap one to turn it over. |
| **IX · Finale** | A small frame opens to full screen on the thumbs-up photo, then "Happy birthday, Oga mi." End credits, and "Watch it again". |

Extra touches: a custom cursor that says *View*, *Drag*, *Open* or *Turn* over things, magnetic buttons, drifting gold dust, film grain and an act slate in the corner.

## Run it

```bash
python -m http.server 5180
# then open http://localhost:5180
```

## Change things

- **Words, photos, gallery tags:** `js/config.js`
- **Colours and fonts:** `css/tokens.css`
- **Music:** `assets/audio/song.mp3`. If it can't load, a calm code-made piano track plays instead.

## Files

```
index.html        the page: loader, titles, nine acts, viewer
css/tokens.css    colours, fonts, easing
css/base.css      reset, type, cursor, nav, grain, viewer
css/sections.css  one block per act
js/config.js      all personal content  ← edit this
js/main.js        boot: fills the page and starts everything
js/build.js       builds marquee, word cards, reel, moments, credits from config
js/choreo.js      all GSAP motion: text reveals, scramble, curtains, pins, parallax
js/intro.js       loader + title sequence
js/dossier.js     Act II swipe/drag carousel
js/gallery.js     Act VI masonry and filters
js/letter.js      the sealed letter
js/wishes.js      the wish cards
js/viewer.js      full-screen photos
js/cursor.js      custom cursor and magnetic buttons
js/scroll.js      Lenis smooth scroll + scroll lock
js/fx.js          drifting gold dust (canvas)
js/audio.js       song with fade-in, fallback music, small sounds
js/motion.js      shared helpers (pointer, reduced motion)
```

## Accessibility

- Keyboard works everywhere: photos, word cards, filters, the letter, wishes and the viewer.
- Screen readers get plain text for every animated headline.
- With `prefers-reduced-motion` the film becomes still but stays fully readable.
- Sound never plays until the visitor taps.

## Credits

Written and built by Perey for his brother Paul, 5 November 2026. Music: "Odaju" (Live) by BisiManuel. Fonts: Big Shoulders Display, Cormorant Garamond, Manrope.
