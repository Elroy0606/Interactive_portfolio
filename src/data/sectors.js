import { Server, Code2, ShieldAlert, NotebookPen } from 'lucide-react';

// The districts shown on the Mainframe hub. To unlock a new sector:
//  1. set `locked: false`, 2. add a VIEWS entry + world component,
//  3. map it in SECTOR_VIEWS (state/AppContext.jsx) and VIEW_COMPONENTS (App.jsx).
//
// `cta` overrides the card's call-to-action (default INITIATE_CONNECTION).
// `accent` is an identity colour token (src/index.css): each sector has its own
// colour in the cyberpunk theme, and they all resolve to the one accent in the
// professional theme.
export const SECTORS = [
  {
    id: '01',
    code: 'HOME LAB',
    label: 'Proxmox Home Server',
    blurb:
      'A physical home lab built by repurposing an old laptop into a Proxmox hypervisor, accessible securely from anywhere via Tailscale.',
    status: 'ACTIVE',
    locked: false,
    icon: Server,
    accent: 'var(--color-id-cyan)',
    tags: ['PROXMOX', 'DOCKER', 'HAOS', 'KALI', 'OLLAMA'],
  },
  {
    id: '02',
    code: 'PROJECTS',
    label: 'Websites and Apps',
    blurb: 'Websites and apps I have made. Each card links to the live version so you can try it.',
    status: 'ACTIVE',
    locked: false,
    icon: Code2,
    accent: 'var(--color-id-amber)',
    tags: ['WEBSITES', 'APPS', 'LIVE DEMOS'],
  },
  {
    id: '03',
    code: 'REPORTS',
    label: 'Vulnerability Reports',
    blurb:
      'Penetration test reports from security practice labs, filed as encrypted dossiers. Open a folder to read the reports.',
    status: 'ACTIVE',
    locked: false,
    icon: ShieldAlert,
    accent: 'var(--color-id-green)',
    cta: 'SECURE_ACCESS',
    tags: ['PENTEST REPORTS', 'PRACTICE LABS', 'SQL INJECTION'],
  },
  {
    id: '04',
    code: 'WRITE-UPS',
    label: 'Build Reports and Write-ups',
    blurb: 'Reports that explain how I built my labs and projects. Open one to read it on the site.',
    status: 'ACTIVE',
    locked: false,
    icon: NotebookPen,
    accent: 'var(--color-id-violet)',
    cta: 'OPEN_ARCHIVE',
    tags: ['HOME LAB', 'ARTICLES', 'PDF'],
  },
];
