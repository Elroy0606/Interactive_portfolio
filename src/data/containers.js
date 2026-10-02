import { Bot, Sparkles, Bug, Radar } from 'lucide-react';

// Services running INSIDE the Docker node (drill-down sub-view).
// The name / status / role of each entry come from the lab itself. Everything
// else (mission, architecture, config, ports, stack, load) is TEMPLATE content
// written from the general shape of each service; edit it to match the real
// setup (actual images, ports, backends) before publishing.
//
// `side` + `row` place the node around the Docker engine hub on desktop and
// decide which side of the hub its schematic trace leaves from.
// `tone` colours the status badge: ok = green, warn = amber.

export const CONTAINERS = [
 {
    id: 'jarvis1',
    name: 'J.A.R.V.I.S 1.0',
    kind: 'AI ASSISTANT // SMART HOME',
    status: '[ONLINE]',
    tone: 'ok',
    role: 'Home Automation & Conversational Core',
    icon: Bot,
    accent: 'var(--color-id-cyan)',
    side: 'left',
    row: 1,
    load: 21,
    mission:
      'The original home-lab assistant. It handles general conversation and commands to run smart home devices locally. While J.A.R.V.I.S primarily runs locally on the network for privacy, it features a smart hybrid fallback: if it encounters complex context limits or struggles with deep reasoning, it securely offloads assistance to a powerful closed model.',
    architecture: [
      'Runs in an isolated Docker container for easy maintenance and zero downtime.',
      'Manages smart-home device states and natural language conversation parsing locally.',
      'Implements a context-aware fallback mechanism that routes heavy prompts to a robust closed model when local context limits are reached.',
      'Keeps all standard operations entirely inside the LAN, ensuring fast and private local execution.',
    ],
    config: [
      ['RUNTIME', 'Docker container'],
      ['RESTART', 'unless-stopped'],
      ['NETWORK', 'docker bridge'],
      ['STATE', 'persistent volume'],
    ],
    ports: [['8001/tcp', 'HTTP API (LAN only)']],
    stack: ['Python', 'Smart Home Integration', 'Hybrid LLM Fallback', 'REST API', 'Docker'],
  },
 {
    id: 'jarvis2',
    name: 'J.A.R.V.I.S 2.0',
    kind: 'AI ASSISTANT // WIP',
    status: '[BETA_ACTIVE]',
    tone: 'aggressive',
    role: 'Autonomous Security & Hacking Automation Engine',
    icon: Sparkles,
    accent: 'var(--color-id-magenta)',
    side: 'right',
    row: 1,
    load: 78,
    mission:
      'The next-generation assistant. While J.A.R.V.I.S 1.0 was built strictly for Home Assistant automation and weather lookups, 2.0 is an active work-in-progress designed to automate penetration testing. It has direct access to my Kali Linux machine, featuring an upgraded HUD and a live terminal feed to monitor active attack sequences.',
    architecture: [
      'Isolated container architecture, running alongside legacy 1.0 services.',
      'Direct secure interface to the Kali Linux node for script execution and reconnaissance.',
      'Maintains context memory tailored for multi-step exploit chains and command sequencing.',
      'Local-only LLM backend ensuring all security data and operational targets stay entirely on the LAN.',
    ],
    config: [
      ['RUNTIME', 'Docker container'],
      ['RESTART', 'unless-stopped'],
      ['NETWORK', 'bridge + internal Kali route'],
      ['STATE', 'persistent volume (ops logs)'],
    ],
    ports: [['8002/tcp', 'Secure HUD & API (LAN only)']],
    stack: ['Python', 'Kali Integration', 'Exploit Automation', 'Local LLM', 'Docker'],
  },
  {
    id: 'juice',
    name: 'OWASP Juice Shop',
    kind: 'PENTEST RANGE',
    status: '[VULN_TEST_ACTIVE]',
    tone: 'warn',
    role: 'Controlled penetration testing & bug bounty practice range',
    icon: Bug,
    accent: 'var(--color-id-amber)',
    side: 'left',
    row: 2,
    load: 12,
    mission:
      'A deliberately insecure web shop used as a safe target for practising pentesting and bug-bounty techniques, so attacks are rehearsed on this range rather than on real systems.',
    architecture: [
      'Official Juice Shop image (Node.js, Express, Angular) running as a single container.',
      'Intentionally vulnerable by design: kept off the public internet and reachable only from the LAN / isolated network.',
      'The Kali node points its tooling at it for exercises.',
      'Recreating the container resets it to a clean state; the built-in scoreboard tracks solved challenges.',
    ],
    config: [
      ['IMAGE', 'bkimminich/juice-shop'],
      ['EXPOSURE', 'LAN / isolated only'],
      ['RESET', 'recreate container'],
      ['TRACKING', 'challenge scoreboard'],
    ],
    ports: [['3000/tcp', 'Web UI (Juice Shop default)']],
    stack: ['Node.js', 'Express', 'Angular', 'OWASP', 'Docker'],
  },
  {
    id: 'nmap',
    name: 'Network Mapper (Nmap Visualizer)',
    kind: 'NETWORK TOOL',
    status: '[OPERATIONAL]',
    tone: 'ok',
    role: 'Parses Nmap XML outputs to render interactive network topology graphs',
    icon: Radar,
    accent: 'var(--color-id-green)',
    side: 'right',
    row: 2,
    load: 8,
    mission:
      'Turns raw Nmap XML scan output into an interactive network topology graph, so hosts, open ports and services can be explored visually instead of read line by line.',
    architecture: [
      'Scans are run with Nmap and saved as XML (-oX).',
      'The container parses the XML into hosts, ports and detected services.',
      'A front-end renders the result as a clickable topology graph.',
      'Runs fully offline; scan data stays on a local volume.',
    ],
    config: [
      ['INPUT', 'Nmap XML (-oX)'],
      ['OUTPUT', 'interactive topology graph'],
      ['STORAGE', 'local volume'],
      ['RESTART', 'unless-stopped'],
    ],
    ports: [['8080/tcp', 'Web UI (LAN only)']],
    stack: ['Nmap', 'XML Parsing', 'Graph Rendering', 'JavaScript', 'Docker'],
  },
];

export const getContainer = (id) => CONTAINERS.find((c) => c.id === id);
