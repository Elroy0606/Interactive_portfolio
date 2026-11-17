import { Server, Code2, ShieldAlert, NotebookPen } from 'lucide-react';

// The sectors, in order. To add one: 1. add a VIEWS entry + world component,
//  2. add it here with that `view` and a breadcrumb `slug`, 3. map the view in
//  VIEW_COMPONENTS (App.jsx). SECTOR_VIEWS (state/AppContext.jsx) is built from this list.
//
// The number a visitor sees is the sector's position on the open path
// (`sectorNumber` in data/tracks.js), not its `id`: Write-ups is Sector 01 on
// Theory and Sector 03 on Practical. `id` is only the internal key.
//
// `cta` overrides the card's call-to-action (default INITIATE_CONNECTION).
// `accent` is an identity colour token (src/index.css): each sector has its own
// colour in the cyberpunk theme, and they all resolve to the one accent in the
// professional theme.
//
// `tracks` puts the sector on the Theory and/or Practical path (data/tracks.js).
// Each key is a track id; its value overrides card fields (label, blurb, tags,
// cta) on that track's page, `{}` = the card as written here. The home page
// shows the two tracks, not the sectors.
export const SECTORS = [
  {
    id: '01',
    code: 'HOME LAB',
    view: 'proxmox', // the page it opens (VIEWS in state/AppContext.jsx)
    slug: 'infrastructure_lab', // breadcrumb folder: ~/sectorNN/<slug>
    label: 'Proxmox Home Server',
    blurb:
      'A physical home lab built by repurposing an old laptop into a Proxmox hypervisor, accessible securely from anywhere via Tailscale.',
    status: 'ACTIVE',
    locked: false,
    icon: Server,
    accent: 'var(--color-id-cyan)',
    tags: ['PROXMOX', 'DOCKER', 'HAOS', 'KALI', 'OLLAMA'],
    tracks: { practical: {} },
  },
  {
    id: '02',
    code: 'PROJECTS',
    view: 'dev', // the page it opens (VIEWS in state/AppContext.jsx)
    slug: 'dev_district', // breadcrumb folder: ~/sectorNN/<slug>
    label: 'Tools and Games',
    blurb: 'Tools and games I have built, such as a subnet calculator. Each card links to the live version so you can try it.',
    status: 'ACTIVE',
    locked: false,
    icon: Code2,
    accent: 'var(--color-id-amber)',
    tags: ['TOOLS', 'GAMES', 'LIVE DEMOS'],
    tracks: { practical: {} },
  },
  {
    id: '03',
    code: 'WRITE-UPS',
    view: 'writeups', // the page it opens (VIEWS in state/AppContext.jsx)
    slug: 'write_ups', // breadcrumb folder: ~/sectorNN/<slug>
    label: 'Build Reports and Write-ups',
    blurb: 'Reports that explain how I built my labs and projects. Open one to read it on the site.',
    status: 'ACTIVE',
    locked: false,
    icon: NotebookPen,
    accent: 'var(--color-id-violet)',
    cta: 'OPEN_ARCHIVE',
    tags: ['HOME LAB', 'ARTICLES', 'PDF'],
    tracks: {
      theory: {
        label: 'Study Notes',
        blurb: 'My notes from security courses and training platforms, such as the TryHackMe SOC Level 1 path. Open one to read it on the site.',
        tags: ['TRYHACKME', 'SOC LEVEL 1', 'STUDY NOTES'],
        cta: 'OPEN_NOTES',
      },
      practical: {
        label: 'Build Reports and CTF Write-ups',
        blurb: 'Reports that explain how I built and tested my labs and projects, and how I solved CTF challenges. Open one to read it on the site.',
        tags: ['HOME LAB', 'BUILD REPORTS', 'CTF'],
      },
    },
  },
  {
    id: '04',
    code: 'REPORTS',
    view: 'vulns', // the page it opens (VIEWS in state/AppContext.jsx)
    slug: 'sec_ops_grid', // breadcrumb folder: ~/sectorNN/<slug>
    label: 'Vulnerability Reports',
    blurb:
      'Penetration test reports from security practice labs, filed as encrypted dossiers. Open a folder to read the reports.',
    status: 'ACTIVE',
    locked: false,
    icon: ShieldAlert,
    accent: 'var(--color-id-green)',
    cta: 'SECURE_ACCESS',
    tags: ['PENTEST REPORTS', 'PRACTICE LABS', 'SQL INJECTION'],
    tracks: { practical: {} },
  },
];
