/* ══════════════════════════════════════════════
   METIN2 WIKI FR — particles.js
   Braises canvas en fond
   ══════════════════════════════════════════════ */

export function initParticles() {
  const canvas = document.getElementById('ptc');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, pts = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function makeParticle() {
    return {
      x:     Math.random() * W,
      y:     H + 8,
      vx:    (Math.random() - .5) * .3,
      vy:    -(Math.random() * .48 + .2),
      r:     Math.random() * 1.5 + .28,
      life:  1,
      decay: Math.random() * .0025 + .0015,
      hue:   Math.random() * 25 + 8,
    };
  }

  resize();
  window.addEventListener('resize', resize);

  // Pre-populate particles
  for (let i = 0; i < 45; i++) {
    const p = makeParticle();
    p.y = Math.random() * H;
    pts.push(p);
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);

    if (Math.random() < .32) pts.push(makeParticle());
    pts = pts.filter(p => p.life > 0);

    for (const p of pts) {
      p.x  += p.vx;
      p.y  += p.vy;
      p.life -= p.decay;
      p.vx += (Math.random() - .5) * .035;

      ctx.save();
      ctx.globalAlpha = p.life * .45;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${p.hue}, 86%, 62%)`;
      ctx.fill();
      ctx.restore();
    }

    requestAnimationFrame(frame);
  }

  frame();
}
