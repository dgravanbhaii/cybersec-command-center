/* matrix.js: Matrix rain on a full-screen canvas. Throttled to ~22fps, pauses when hidden, static for reduced motion. */
(() => {
  const canvas = document.getElementById('matrix');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const glyphs = 'ｱｲｳｴｵｶｷｸｹｺ0123456789ABCDEF<>{}[]#$%';
  const size = 16;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let cols = 0, drops = [], last = 0, frame = 0;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(innerWidth / size);
    drops = Array.from({ length: cols }, () => Math.random() * -40);
    ctx.fillStyle = '#05080a';
    ctx.fillRect(0, 0, innerWidth, innerHeight);
  }

  function draw() {
    ctx.fillStyle = 'rgba(5,8,10,0.09)';
    ctx.fillRect(0, 0, innerWidth, innerHeight);
    ctx.font = `${size}px monospace`;
    for (let i = 0; i < cols; i++) {
      const ch = glyphs[(Math.random() * glyphs.length) | 0];
      ctx.fillStyle = Math.random() > 0.975 ? '#eafff4' : '#00ff88';
      ctx.fillText(ch, i * size, drops[i] * size);
      if (drops[i] * size > innerHeight && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }

  function loop(t) {
    frame = requestAnimationFrame(loop);
    if (t - last < 45) return; // ~22fps keeps the effect cheap on mobile
    last = t;
    draw();
  }

  resize();
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => {
    if (reduced) return;
    if (document.hidden) cancelAnimationFrame(frame);
    else frame = requestAnimationFrame(loop);
  });
  if (reduced) draw(); else frame = requestAnimationFrame(loop);
})();

