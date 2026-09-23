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
    kind: 'AI MODEL',
    status: '[ONLINE]',
    tone: 'ok',
    role: 'Initial Natural Language Processing Core',
    icon: Bot,
    accent: '#00f0ff',
    side: 'left',
    row: 1,
    load: 21,
    mission:
      'The original home-lab assistant core. It turns plain-English requests into structured intents and replies, entirely inside the lab, and is the baseline the 2.0 engine is compared against.',
    architecture: [
      'Runs in its own container so it can be rebuilt or rolled back without touching its neighbours.',
      'Accepts text requests over a small local HTTP API and returns the parsed intent plus a response.',
      'Model inference is served by a local backend, so prompts never leave the network.',
      'Stays online alongside 2.0 as a lightweight fallback.',
    ],
    config: [
      ['RUNTIME', 'Docker container'],
      ['RESTART', 'unless-stopped'],
      ['NETWORK', 'docker bridge'],
      ['STATE', 'persistent volume'],
    ],
    ports: [['8001/tcp', 'HTTP API (LAN only)']],
    stack: ['Python', 'NLP', 'Local LLM Backend', 'REST API', 'Docker'],
  },
  {
    id: 'jarvis2',
    name: 'J.A.R.V.I.S 2.0',
    kind: 'AI MODEL',
    status: '[ONLINE]',
    tone: 'ok',
    role: 'Advanced Context-Aware Interaction Engine',
    icon: Sparkles,
    accent: '#ff2e97',
    side: 'right',
    row: 1,
    load: 46,
    mission:
      'The second-generation assistant. It keeps conversational context across turns and reasons over it, giving far more natural back-and-forth than the 1.0 core.',
    architecture: [
      'Separate container from 1.0, so both generations can run side by side.',
      'Maintains session context (conversation memory) between requests.',
      'Calls the same kind of local model backend used across the lab; nothing leaves the LAN.',
      'Exposes a local API that scripts and front-ends can talk to.',
    ],
    config: [
      ['RUNTIME', 'Docker container'],
      ['RESTART', 'unless-stopped'],
      ['NETWORK', 'docker bridge'],
      ['STATE', 'persistent volume (context)'],
    ],
    ports: [['8002/tcp', 'HTTP API (LAN only)']],
    stack: ['Python', 'Context Memory', 'Local LLM Backend', 'REST API', 'Docker'],
  },
  {
    id: 'juice',
    name: 'OWASP Juice Shop',
    kind: 'PENTEST RANGE',
    status: '[VULN_TEST_ACTIVE]',
    tone: 'warn',
    role: 'Controlled penetration testing & bug bounty practice range',
    icon: Bug,
    accent: '#ffb700',
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
    accent: '#00ff66',
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
