/* api.js: data layer. Mock data behind async calls. Replace the bodies with fetch() when a backend exists. */
const API = (() => {
  const wait = (data, ms = 450) => new Promise((resolve) => setTimeout(() => resolve(structuredClone(data)), ms));

  const COURSES = [
    { title: 'Linux Fundamentals', category: 'Systems', level: 'Beginner', progress: 80, desc: 'Shell, permissions, processes and filesystems.' },
    { title: 'Network Analysis', category: 'Networking', level: 'Intermediate', progress: 45, desc: 'Packet capture, protocols and traffic forensics.' },
    { title: 'Web Application Security', category: 'Web', level: 'Intermediate', progress: 20, desc: 'OWASP Top 10, injection and authentication flaws.' },
    { title: 'Threat Hunting', category: 'Defense', level: 'Advanced', progress: 5, desc: 'Hypothesis-driven hunts across endpoints and logs.' },
    { title: 'Reverse Engineering', category: 'Malware', level: 'Advanced', progress: 0, desc: 'Static and dynamic analysis of binaries.' },
  ];
  const LABS = [
    { title: 'Port Scanning Basics', category: 'Networking', difficulty: 'Easy', desc: 'Map open services on a sandboxed host.' },
    { title: 'SQL Injection Sandbox', category: 'Web', difficulty: 'Medium', desc: 'Find and fix injectable queries in a mock app.' },
    { title: 'Log Triage', category: 'Defense', difficulty: 'Medium', desc: 'Separate noise from real indicators in SIEM logs.' },
    { title: 'Stack Overflow Primer', category: 'Binary', difficulty: 'Hard', desc: 'Observe memory corruption in a controlled binary.' },
    { title: 'Privilege Review', category: 'Systems', difficulty: 'Hard', desc: 'Audit misconfigured SUID binaries and sudo rules.' },
  ];
  const RESOURCES = [
    { title: 'Linux Command Cheat Sheet', type: 'Download', desc: 'One-page reference for daily shell work.', url: 'assets/downloads/linux-cheatsheet.pdf' },
    { title: 'Wireshark', type: 'Tool', desc: 'Open-source packet analyzer for protocol inspection.', url: 'https://www.wireshark.org' },
    { title: 'Nmap', type: 'Tool', desc: 'Network discovery and port scanning utility.', url: 'https://nmap.org' },
    { title: 'OWASP Top 10', type: 'Reference', desc: 'The most critical web application security risks.', url: 'https://owasp.org/www-project-top-ten/' },
    { title: 'MITRE ATT&CK', type: 'Reference', desc: 'Knowledge base of adversary tactics and techniques.', url: 'https://attack.mitre.org' },
  ];
  const PATHS = [
    { title: 'Blue Team Foundations', desc: 'Logs, detection and incident response basics.', progress: 60, modules: 8 },
    { title: 'Web Pentest Track', desc: 'Authorized testing of modern web applications.', progress: 25, modules: 12 },
    { title: 'Malware Analysis', desc: 'Safe static and dynamic analysis workflows.', progress: 0, modules: 10 },
  ];
  const ACTIVITY = [
    { time: '08:42', text: 'Completed module: Linux Fundamentals' },
    { time: '09:15', text: 'Solved lab: Port Scanning Basics' },
    { time: '10:03', text: 'Earned badge: First Blood' },
    { time: '11:30', text: 'Downloaded: Linux Command Cheat Sheet' },
    { time: '13:08', text: 'Started course: Network Analysis' },
  ];
  const LEADERBOARD = [
    { name: 'packet_monk', xp: 14820, labs: 42, badges: ['First Blood', 'Packet Pro'] },
    { name: 'kernel_kitten', xp: 12410, labs: 37, badges: ['Root Ready'] },
    { name: 'ZeroDayZoe', xp: 9875, labs: 29, badges: ['Log Hawk'] },
    { name: 'root_ronin', xp: 7340, labs: 21, badges: ['First Blood'] },
    { name: 'guest_operator', xp: 1280, labs: 5, badges: ['First Blood'] },
  ];

  return {
    getCourses: () => wait(COURSES),
    getLabs: () => wait(LABS),
    getResources: () => wait(RESOURCES),
    getPaths: () => wait(PATHS),
    getActivity: () => wait(ACTIVITY),
    getLeaderboard: () => wait(LEADERBOARD),
  };
})();

