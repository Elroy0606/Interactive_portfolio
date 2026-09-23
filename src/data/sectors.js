import { Server, Code2, ShieldAlert } from 'lucide-react';

// The districts shown on the Mainframe hub. To unlock a new sector:
//  1. set `locked: false`, 2. add a VIEWS entry + world component,
//  3. map it in SECTOR_VIEWS (state/AppContext.jsx) and VIEW_COMPONENTS (App.jsx).
//
// `host` is only flavour text for the handshake log; `cta` overrides the card's
// call-to-action (default INITIATE_CONNECTION).
export const SECTORS = [
  {
    id: '01',
    code: 'INFRASTRUCTURE_LAB',
    label: 'Proxmox Home Server',
    blurb:
      'A self-hosted hypervisor running smart-home automation, a security-testing node and local LLMs. Explore the live blueprint.',
    status: 'ACTIVE',
    locked: false,
    icon: Server,
    accent: '#00f0ff',
    target: 'proxmox_server',
    host: 'pve.local',
    tags: ['PROXMOX', 'DOCKER', 'HAOS', 'KALI', 'OLLAMA'],
  },
  {
    id: '02',
    code: 'DEV_DISTRICT',
    label: 'Full-Stack Applications',
    blurb: 'Web apps, APIs and tooling built end-to-end. Deployment in progress.',
    status: 'LOCKED',
    locked: true,
    icon: Code2,
    accent: '#ffb700',
    target: 'dev_district',
    tags: ['REACT', 'NODE', 'APIS'],
  },
  {
    id: '03',
    code: 'SEC_OPS_GRID',
    label: 'Vulnerability Reports',
    blurb:
      'Bug bounty and vulnerability disclosure write-ups, filed as encrypted dossiers. Open a folder to read the reports.',
    status: 'ACTIVE',
    locked: false,
    icon: ShieldAlert,
    accent: '#00ff66',
    target: 'sec_ops_grid',
    host: 'vault.local',
    cta: 'SECURE_ACCESS',
    tags: ['BUG BOUNTY', 'DISCLOSURE', 'OWASP'],
  },
];
