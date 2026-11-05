// Atmosphere: slow gold dust drifting through the dark, like light in a projector beam.
// The cursor gently pushes nearby motes away. Glows are pre-rendered once so it stays smooth.

import { onFrame, pointer, reducedMotion } from './motion.js';

const COUNT_DESKTOP = 70;
const COUNT_PHONE = 34;

function makeSprite(size, rgb) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, `rgba(${rgb}, 1)`);
  grad.addColorStop(0.18, `rgba(${rgb}, 0.6)`);
  grad.addColorStop(1, `rgba(${rgb}, 0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

export function initFx(canvas) {
  if (reducedMotion) { canvas.remove(); return; }
  const g = canvas.getContext('2d');
  const sprites = [makeSprite(64, '226, 199, 147'), makeSprite(64, '201, 164, 106'), makeSprite(64, '238, 230, 214')];
  let w = 0;
  let h = 0;
  let dpr = 1;
  let motes = [];

  const spawn = (anywhere) => ({
    x: Math.random() * w,
    y: anywhere ? Math.random() * h : h + 20,
    vx: (Math.random() - 0.5) * 6,
    vy: -(4 + Math.random() * 12),
    size: 4 + Math.random() * 14,
    life: Math.random() * Math.PI * 2,
    sprite: sprites[Math.floor(Math.random() * sprites.length)],
  });

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth;
    h = innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = w < 700 ? COUNT_PHONE : COUNT_DESKTOP;
    motes = Array.from({ length: count }, () => spawn(true));
  }
  resize();
  addEventListener('resize', resize);

  onFrame((t, dt) => {
    if (document.hidden) return;
    g.clearRect(0, 0, w, h);
    g.globalCompositeOperation = 'lighter';
    for (const m of motes) {
      // push away from the cursor, softly
      if (pointer.active) {
        const dx = m.x - pointer.sx;
        const dy = m.y - pointer.sy;
        const d2 = dx * dx + dy * dy;
        if (d2 < 22000) {
          const f = (1 - d2 / 22000) * 60;
          const d = Math.sqrt(d2) || 1;
          m.vx += (dx / d) * f * dt;
          m.vy += (dy / d) * f * dt;
        }
      }
      m.vx *= 0.985;
      m.vy = m.vy * 0.985 + -(6 * 0.015);
      m.x += (m.vx + Math.sin(t * 0.4 + m.life) * 3) * dt;
      m.y += m.vy * dt;
      m.life += dt;
      if (m.y < -30 || m.x < -30 || m.x > w + 30) Object.assign(m, spawn(false));
      // twinkle: brightness rises and falls slowly
      const alpha = 0.12 + 0.28 * (0.5 + 0.5 * Math.sin(m.life * 0.9));
      g.globalAlpha = alpha;
      g.drawImage(m.sprite, m.x - m.size / 2, m.y - m.size / 2, m.size, m.size);
    }
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
  });
}
