/* terminal.js: interactive command widget. Output is generated from API data and written as text (no HTML injection). */
(() => {
  const out = document.getElementById('term-out');
  const input = document.getElementById('term-input');
  if (!out || !input) return;

  const history = [];
  let hIdx = 0;

  // Appends a line; returns the element so async output can replace it.
  const write = (text, cls = '') => {
    const line = document.createElement('div');
    line.className = cls;
    line.textContent = text;
    out.appendChild(line);
    out.scrollTop = out.scrollHeight;
    return line;
  };

  const commands = {
    help: () => [
      'Available commands:',
      '  help         show this list',
      '  courses      list training modules',
      '  labs         list sandbox challenges',
      '  resources    tools, downloads and references',
      '  leaderboard  top operators by XP',
      '  about        about this platform',
      '  clear        clear the terminal',
    ].join('\n'),
    about: () => 'CyberSec Command Center v1.0. Learn by doing, inside sandboxed labs.',
    courses: async () => (await API.getCourses()).map((c) => `  ${c.title.padEnd(28)} ${c.level.padEnd(13)} ${c.progress}%`).join('\n'),
    labs: async () => (await API.getLabs()).map((l) => `  ${l.title.padEnd(28)} ${l.difficulty}`).join('\n'),
    resources: async () => (await API.getResources()).map((r) => `  [${r.type}] ${r.title}`).join('\n'),
    leaderboard: async () => (await API.getLeaderboard())
      .sort((a, b) => b.xp - a.xp).slice(0, 5)
      .map((u, i) => `  #${i + 1} ${u.name.padEnd(16)} ${u.xp.toLocaleString()} XP`).join('\n'),
  };

  async function run(raw) {
    const cmd = raw.trim().toLowerCase();
    write(`visitor@cmdcenter:~$ ${raw}`, 'prompt-line');
    if (!cmd) return;
    if (cmd === 'clear') { out.textContent = ''; return; }
    if (!Object.hasOwn(commands, cmd)) {
      write(`command not found: ${cmd}. Type 'help' for options.`, 'err');
      return;
    }
    const loading = write('loading...', 'dim');
    try {
      const result = await commands[cmd]();
      loading.textContent = result;
    } catch {
      loading.textContent = 'Error: could not load data.';
      loading.className = 'err';
    }
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const value = input.value;
      if (value.trim()) history.push(value);
      hIdx = history.length;
      input.value = '';
      run(value);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      hIdx = Math.max(0, hIdx - 1);
      input.value = history[hIdx] ?? '';
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      hIdx = Math.min(history.length, hIdx + 1);
      input.value = history[hIdx] ?? '';
    }
  });

  // Clicking anywhere in the terminal focuses the input.
  out.parentElement.addEventListener('click', () => input.focus());
  write("CyberSec Command Center ready. Type 'help' to begin.", 'dim');
})();

