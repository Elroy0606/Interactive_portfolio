// Sector 02: PROJECTS (components/dev/DevDistrict.jsx)
//
// HOW TO ADD A PROJECT
// --------------------
// Copy the object below, paste it into PROJECTS and fill it in. That is the
// whole step: the card, the counters and the layout update by themselves.
//
//   {
//     id: 'my-app',                // required. Unique, lowercase, no spaces.
//     kind: 'tool',                // required. The category it is listed under on the
//                                  //   page: 'tool' = Tools, 'game' = Games (see KINDS).
//     name: 'My App',              // required. Shown as the card title.
//     url: 'https://example.com',  // the "Visit" link (opens in a new tab).
//                                  //   Use null if there is nothing to visit yet.
//     cta: 'LAUNCH_TOOL',          // optional. Button label (default: the kind's cta).
//     status: 'Live',              // required. 'Live' or 'In progress'
//                                  //   (add more to STATUS below if needed).
//     description: 'One or two sentences about what it is.',
//                                  // Leave '' to hide the line.
//     tags: ['Tool one', 'Tool two'],
//                                  // Tech / tools I actually used. [] hides the row.
//     thumbnail: 'my-app.png',     // optional. File name of an image saved in
//                                  //   src/content/projects/ (png, jpg, webp, avif, gif).
//                                  //   Use null for the themed placeholder.
//     thumbnailAlt: 'What the screenshot shows',
//                                  // alt text, needed when thumbnail is set.
//     repo: 'https://github.com/...', // optional. Adds a VIEW_SOURCE button.
//     category: 'Security Tools',  // optional. Small label above the card title.
//     spotlight: true,             // optional. Shown first in its folder.
//     tagline: 'One sentence.',    // optional. Shown under the title of the case study.
//     caseStudy: {                 // optional. Adds a CASE_STUDY button that opens
//       problem: '...',            //   a detailed panel (components/dev/CaseStudy.jsx).
//       solution: '...',
//       modules: [                 // feature grid: one card per module
//         { title: '...', icon: SomeLucideIcon, points: ['...', '...'] },
//       ],
//     },
//   },
//
// To feature a project in the Highlights section of the home page, add:
//     featured: true,
//     highlightOrder: 2,           // optional. Lowest number is shown first.
//     highlightReason: 'Why this project matters, in one or two sentences.',
//     highlightTags: ['A', 'B'],   // optional, two or three. Default: first three of `tags`
// Remove `featured` to take it off the home page again.
//
// To link a project to a write-up, set `related: { kind: 'project', id: '<id>' ... }`
// on the write-up in data/writeups.js. The card then shows a link to it.
//
// RULES: only real projects and tools I really used. Before adding a
// screenshot, check it shows no addresses, email, phone number or names.

import { Binary, Gamepad2, MailCheck, ScanSearch, Wrench } from 'lucide-react';

const thumbs = import.meta.glob('../content/projects/*.{png,jpg,jpeg,webp,avif,gif}', {
  eager: true,
  query: '?url',
  import: 'default',
});

export const STATUS = {
  Live: { color: 'var(--color-matrix)', led: true },
  'In progress': { color: 'var(--color-warn)', led: false },
};

// The categories of Sector 02. Each one is a folder on the Projects shelf, in
// this order; a category with no project is left out. To add one (e.g. 'site'),
// add an object here and use its id as a project's `kind`.
//   cta  = default button label, item = card counter ([TOOL 01], [GAME 01]),
//   icon = lucide icon, accent = identity colour token of the folder,
//   blurb = one line on the folder and in the open folder's header.
export const KINDS = [
  { id: 'tool', label: 'Tools', code: 'TOOLS', icon: Wrench, accent: 'var(--color-id-amber)', cta: 'LAUNCH_TOOL', item: 'TOOL', blurb: 'Web tools I built: a SOC triage workstation and a subnet calculator.' },
  { id: 'game', label: 'Games', code: 'GAMES', icon: Gamepad2, accent: 'var(--color-id-cyan)', cta: 'PLAY', item: 'GAME', blurb: 'Browser games I built.' },
];

const list = [
  {
    id: 'soc-triage-workstation',
    kind: 'tool',
    category: 'Security Tools / SOC Operations',
    spotlight: true,
    name: 'SOC Triage Workstation',
    url: 'https://triage.elcybersec.com',
    repo: 'https://github.com/Elroy0606/soc-triage-workstation',
    cta: 'LAUNCH_LIVE_APP',
    status: 'Live',
    tagline:
      'A client-side Tier 1 Security Operations Center (SOC) utility for rapid IOC extraction, payload deobfuscation, and phishing header analysis.',
    description:
      'A client-side Tier 1 SOC utility for rapid IOC extraction, payload deobfuscation and phishing header analysis. All parsing runs in the browser, so incident artifacts never leave the analyst’s machine.',
    tags: ['React', 'Tailwind CSS', 'Framer Motion', 'Regex Heuristics', 'MITRE ATT&CK', 'Client-Side Security'],
    thumbnail: 'soc-triage-thumb.jpg',
    thumbnailAlt: 'Illustrated preview of the SOC Triage Workstation: IOC defanger, payload deobfuscator with MITRE ATT&CK tags, and a threat telemetry ring',
    caseStudy: {
      problem:
        'Tier 1 SOC analysts lose valuable triage time switching between browser tabs to defang malicious links, decode multi-layered PowerShell / Base64 payloads, inspect email authentication headers and pivot across threat intelligence platforms.',
      solution:
        'I built a unified, zero-backend "Cyber-Zen" glassmorphic workstation that runs all parsing locally in the browser, so sensitive incident artifacts never leave the analyst’s machine.',
      modules: [
        {
          title: 'IOC Extractor & Enrichment Matrix',
          icon: ScanSearch,
          points: [
            'Automated regex extraction and defanging (`hxxp://`, `[.]`)',
            'RFC1918 private IP filtering',
            'Shannon entropy DGA detection',
            'One-click OSINT pivots: VirusTotal, AbuseIPDB, Shodan, URLhaus, MalwareBazaar',
            'Automated Tier 2 Markdown escalation ticket generation',
          ],
        },
        {
          title: 'Recursive Payload Deobfuscator',
          icon: Binary,
          points: [
            'Multi-stage auto-unwrapping of Base64, Hex and URL encodings',
            'Live MITRE ATT&CK technique tagging (e.g. `T1059.001`, `T1105`)',
          ],
        },
        {
          title: 'Phishing Header & Auth Visualizer',
          icon: MailCheck,
          points: [
            'Parses raw `.eml` headers to verify SPF, DKIM and DMARC status',
            'Flags `From` / `Return-Path` spoofing mismatches',
            'Maps the server `Received:` hops',
          ],
        },
      ],
    },
  },
  {
    id: 'subnet-calculator',
    kind: 'tool',
    name: 'SubnetZen Subnet Calculator',
    url: 'https://subnet.elcybersec.com',
    status: 'Live',
    description:
      'A fast, responsive IPv4 subnet calculator for network engineers and security analysts. It works out CIDR notation, subnet masks, usable IP ranges and broadcast addresses, with a live 32-bit visualizer.',
    tags: ['React', 'Framer Motion', 'Vite', 'JavaScript'],
    thumbnail: 'subnet-calc-thumb.jpg',
    thumbnailAlt: 'Illustrated preview of the subnet calculator: network IP and CIDR inputs beside usable hosts, subnet mask, broadcast address and IP range',
  },
  {
    id: 'tetris',
    kind: 'game',
    name: 'Tetris',
    url: 'https://tetris.elcybersec.com',
    status: 'Live',
    description: '', // TODO: one or two sentences about the project
    tags: [], // TODO: the tech / tools used to build it
    thumbnail: null, // TODO: optional screenshot, e.g. 'tetris.png' in src/content/projects/
    thumbnailAlt: '',
  },
];

// `thumbnailUrl` is null when no image is set or the file is missing: the card
// then draws its placeholder.
export const PROJECTS = list.map((p) => ({
  ...p,
  thumbnailUrl: (p.thumbnail && thumbs[`../content/projects/${p.thumbnail}`]) || null,
}));
