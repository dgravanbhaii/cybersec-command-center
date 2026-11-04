/* dashboard.js: shared chrome (nav), live clock, animated counters, and per-page rendering. */
(() => {
  const $ = (sel) => document.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const DIFF = { Beginner: 'diff-easy', Easy: 'diff-easy', Intermediate: 'diff-medium', Medium: 'diff-medium', Advanced: 'diff-hard', Hard: 'diff-hard' };
  const PAGES = [['index.html', 'Dashboard'], ['courses.html', 'Courses'], ['labs.html', 'Labs'], ['resources.html', 'Resources'], ['leaderboard.html', 'Leaderboard']];
  const here = location.pathname.split('/').pop() || 'index.html';

  // Replace the nav placeholder with the sticky header (a direct body child, so sticky works).
  const slot = $('#nav');
  if (slot) {
    slot.outerHTML = `<header class="nav"><div class="container"><a class="brand" href="index.html">CYBERSEC//COMMAND</a>
      <nav aria-label="Main"><ul>${PAGES.map(([href, label]) =>
        `<li><a href="${href}"${href === here ? ' aria-current="page"' : ''}>${label}</a></li>`).join('')}</ul></nav></div></header>`;
  }

  const fillBars = (root = document) => requestAnimationFrame(() =>
    root.querySelectorAll('[data-w]').forEach((el) => { el.style.width = `${el.dataset.w}%`; }));

  // Eased count-up for [data-count] elements.
  function animateCounters() {
    document.querySelectorAll('[data-count]').forEach((el) => {
      const end = Number(el.dataset.count), start = performance.now(), dur = 1400;
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))).toLocaleString();
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  function startClock() {
    const el = $('#clock');
    if (!el) return;
    const tick = () => { el.textContent = new Date().toLocaleTimeString([], { hour12: false }); };
    tick();
    setInterval(tick, 1000);
  }

  const cards = {
    course: (c) => `<article class="glass card fade-up"><span class="tag">${esc(c.category)}</span><h3>${esc(c.title)}</h3>
      <p>${esc(c.desc)}</p><span class="${DIFF[c.level]}">${esc(c.level)}</span>
      <div class="progress" role="progressbar" aria-label="${esc(c.title)} progress" aria-valuenow="${c.progress}" aria-valuemin="0" aria-valuemax="100"><span data-w="${c.progress}"></span></div>
      <small>${c.progress}% complete</small><button class="btn">${c.progress ? 'Continue' : 'Start'}</button></article>`,
    lab: (l) => `<article class="glass card fade-up"><span class="tag">${esc(l.category)}</span><h3>${esc(l.title)}</h3>
      <p>${esc(l.desc)}</p><span class="${DIFF[l.difficulty]}">${esc(l.difficulty)}</span>
      <button class="btn" data-launch>Launch</button></article>`,
    resource: (r) => `<article class="glass card fade-up"><span class="tag">${esc(r.type)}</span><h3>${esc(r.title)}</h3>
      <p>${esc(r.desc)}</p><a class="btn" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">Open</a></article>`,
  };

  // Generic search + category/difficulty chips, shared by courses, labs and resources.
  function filterGrid({ items, key, card }) {
    const grid = $('#grid'), search = $('#search'), chips = $('#chips');
    const groups = ['All', ...new Set(items.map((i) => i[key]))];
    chips.innerHTML = groups.map((g, i) =>
      `<button class="chip" aria-pressed="${i === 0}" data-value="${esc(g)}">${esc(g)}</button>`).join('');
    let active = 'All';

    const draw = () => {
      const q = search.value.trim().toLowerCase();
      const list = items.filter((i) => (active === 'All' || i[key] === active) &&
        `${i.title} ${i.desc}`.toLowerCase().includes(q));
      grid.innerHTML = list.length ? list.map(card).join('') : '<p class="empty">No results. Try another query.</p>';
      fillBars(grid);
    };

    chips.addEventListener('click', (e) => {
      const btn = e.target.closest('.chip');
      if (!btn) return;
      active = btn.dataset.value;
      chips.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c === btn)));
      draw();
    });
    search.addEventListener('input', draw);
    draw();
  }

  const pages = {
    async home() {
      const [paths, feed] = await Promise.all([API.getPaths(), API.getActivity()]);
      $('#paths').innerHTML = paths.map((p) => `<article class="glass card path fade-up"><h3>${esc(p.title)}</h3>
        <p>${esc(p.desc)}</p><div class="progress"><span data-w="${p.progress}"></span></div>
        <small>${p.progress}% · ${p.modules} modules</small></article>`).join('');
      $('#feed').innerHTML = feed.map((f) => `<li><time>${esc(f.time)}</time>${esc(f.text)}</li>`).join('');
      fillBars();
    },
    async courses() { filterGrid({ items: await API.getCourses(), key: 'category', card: cards.course }); },
    async labs() { filterGrid({ items: await API.getLabs(), key: 'difficulty', card: cards.lab }); },
    async resources() { filterGrid({ items: await API.getResources(), key: 'type', card: cards.resource }); },
    async leaderboard() {
      const rows = (await API.getLeaderboard()).sort((a, b) => b.xp - a.xp);
      const totalLabs = rows.reduce((s, u) => s + u.labs, 0);
      const avgXp = Math.round(rows.reduce((s, u) => s + u.xp, 0) / rows.length);
      $('#stats').textContent = `${rows.length} operators · ${totalLabs} labs solved · ${avgXp.toLocaleString()} avg XP`;
      $('#board').innerHTML = rows.map((u, i) => `<tr class="${i === 0 ? 'rank-1' : ''}"><td>${i + 1}</td>
        <td>${esc(u.name)}</td><td>${u.xp.toLocaleString()}</td><td>${u.labs}</td>
        <td>${u.badges.map((b) => `<span class="badge">${esc(b)}</span>`).join('')}</td></tr>`).join('');
    },
  };

  // Lab launch: simulated provisioning with a disabled state.
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-launch]');
    if (!btn || btn.disabled) return;
    btn.disabled = true;
    btn.textContent = 'Provisioning...';
    setTimeout(() => { btn.disabled = false; btn.textContent = 'Open shell'; }, 1400);
  });

  startClock();
  animateCounters();
  const run = pages[document.body.dataset.page];
  if (run) {
    run().catch(() => {
      document.querySelectorAll('.loader').forEach((l) => { l.outerHTML = '<p class="empty">Failed to load data.</p>'; });
    });
  }
})();

