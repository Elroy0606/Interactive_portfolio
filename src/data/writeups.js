import { Server, ShieldAlert } from 'lucide-react';

// Sector 02: REPORTS AND WRITE-UPS (components/writeups/)
//
// The index is grouped by CATEGORIES (one tab each). A category only shows a
// tab once at least one report points to it, so add a category when its first
// report is ready, not before.
//
// HOW TO ADD A CATEGORY
// ---------------------
// Add one object to CATEGORIES (the order here is the tab order):
//   {
//     id: 'network-security',      // what reports put in `category`
//     code: 'NETWORK_SECURITY',    // tab and panel label
//     label: 'Network Security',   // plain name (screen readers, breadcrumbs)
//     icon: Network,               // a lucide-react icon
//     accent: 'var(--color-id-blue)',  // an identity token (src/index.css)
//     blurb: 'One sentence on what this group holds.',
//     path: 'TRYHACKME // SOME PATH',  // optional. Reports with `part` are then
//                                  //   drawn as a numbered learning path.
//     notice: 'Training notes, not on-the-job experience.',  // optional badge text
//     track: 'theory',             // required. 'theory' (study notes, concepts) or
//                                  //   'practical' (hands-on builds and testing).
//                                  //   Sector 02 lists a category under this track
//                                  //   only (data/tracks.js).
//   },
//
// HOW TO ADD A REPORT
// -------------------
// 1. Check the file first: no addresses, subnets, hardware identifiers, email,
//    phone number, or names of companies or people. Strip its metadata.
//    Everything in src/content/writeups/ is deployed with the site, so only
//    put a file there once it is clean.
// 2. Drop the file into src/content/writeups/
//      .md  -> rendered as a styled article on the site
//      .pdf -> shown in an embedded viewer with a download button
// 3. Add one object to WRITEUPS below (or fill in the existing entry), then redeploy.
//
//   {
//     id: 'my-report',             // required. Unique, lowercase, no spaces.
//     title: 'My Report',          // required. Card title and page heading.
//     date: '2026-01-31',          // YYYY-MM-DD. Newest is listed first.
//                                  //   null shows DATE_PENDING and sorts last.
//     summary: 'One or two sentences on what the report covers.',
//                                  // '' hides the line.
//     tags: ['Topic one', 'Topic two'],
//                                  // [] hides the row.
//     file: 'my-report.md',        // File name in src/content/writeups/.
//                                  //   null (or a file that is not there yet)
//                                  //   shows the COMING_SOON state.
//     privacyChecked: true,        // Set to true only after step 1. While it is
//                                  //   false the report stays on COMING_SOON
//                                  //   even if the file exists.
//     category: 'soc-studies',     // required. id of a CATEGORIES entry.
//     part: 1,                     // optional. Position in the category's
//                                  //   learning path (lowest first).
//     related: {                   // optional. Links the report to a project,
//                                  //   and the project back to the report.
//       kind: 'lab',               // 'lab' = a home lab node, 'project' = a Sector 04 project
//       id: 'adlab',               // lab: node id in data/services.js
//                                  //   project: id in data/projects.js
//       label: 'Name of the project',  // text shown on the link
//     },
//   },
//
// To feature a report in the Highlights section of the home page, add:
//     featured: true,
//     highlightOrder: 3,           // optional. Lowest number is shown first.
//     highlightReason: 'Why this report matters, in one or two sentences.',
//     highlightTags: ['A', 'B'],   // optional, two or three. Default: first three of `tags`
// Remove `featured` to take it off the home page again.
//
// VISUAL BLOCKS (Markdown reports)
// --------------------------------
// A fenced code block named after a block is drawn as a diagram instead of
// code, e.g. ```flow ... ```. The blocks and their line format are listed in
// components/writeups/blocks/README.md. Each top-level `#` heading starts a
// numbered section with its own entry in the section rail.
//
// Markdown notes: the page already shows the title, so start the file with
// text or a `#` section heading (not the title again). Images: save them in the
// same folder and write ![what it shows](file-name.png), or in a sub-folder per
// report and write ![what it shows](my-report/file-name.png). Raw HTML is ignored.

export const CATEGORIES = [
  {
    id: 'soc-studies',
    code: 'SOC_STUDIES',
    label: 'SOC Studies',
    icon: ShieldAlert,
    accent: 'var(--color-id-cyan)',
    blurb: 'My notes from the TryHackMe SOC Level 1 path, in the order I took the rooms.',
    path: 'TRYHACKME // SOC LEVEL 1 PATH',
    notice: 'TRAINING_NOTES // NOT ON-THE-JOB EXPERIENCE',
    track: 'theory',
  },
  {
    id: 'home-lab',
    code: 'HOME_LAB_BUILDS',
    label: 'Home Lab Builds',
    icon: Server,
    accent: 'var(--color-id-violet)',
    blurb: 'Reports on how I built, tested and documented projects in my home lab.',
    track: 'practical',
  },
];

const DIR = '../content/writeups/';
const articles = import.meta.glob(['../content/writeups/*.md', '!../content/writeups/README.md'], {
  query: '?raw',
  import: 'default',
}); // lazy: the text is fetched when the report is opened
const pdfs = import.meta.glob('../content/writeups/*.pdf', { eager: true, query: '?url', import: 'default' });
const images = import.meta.glob('../content/writeups/**/*.{png,jpg,jpeg,webp,avif,gif,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
});

const list = [
  {
    id: 'windows-ad-lab',
    title: 'Building a Windows Server and Active Directory Network from Scratch',
    date: '2026-10-02',
    summary:
      'How I designed and built a small-business Windows network in my home lab: Active Directory, Group Policy, file and print services, Remote Desktop, a firewall, and backups I proved I could restore.',
    tags: ['Active Directory', 'Windows Server 2025', 'Group Policy', 'Sophos Firewall', 'Remote Desktop Services', 'Veeam', 'Proxmox VE', 'PowerShell'],
    file: 'windows-ad-lab.md', // images are in src/content/writeups/windows-ad-lab/
    privacyChecked: true,
    category: 'home-lab',
    related: { kind: 'lab', id: 'adlab', label: 'Windows Server and Active Directory Lab' },
  },
  {
    id: 'soc-l1-alert-triage',
    title: 'SOC L1 Alert Triage: TryHackMe Notes',
    date: '2026-11-04',
    summary:
      'My notes from the TryHackMe SOC L1 Alert Triage room: how events become alerts, what each alert field means, how an L1 analyst picks the next alert, and how I worked a practice queue in a simulated SIEM.',
    tags: ['TryHackMe', 'SOC Level 1', 'Alert Triage', 'SIEM', 'True / False Positives'],
    file: 'soc-l1-alert-triage.md',
    privacyChecked: true,
    category: 'soc-studies',
    part: 1,
  },
  {
    id: 'soc-l1-alert-reporting',
    title: 'SOC L1 Alert Reporting: TryHackMe Notes',
    date: '2026-11-05',
    summary:
      'My notes from the TryHackMe SOC L1 Alert Reporting room: how to write an alert report with the five Ws, when and how to escalate to L2, and how to communicate when things go wrong.',
    tags: ['TryHackMe', 'SOC Level 1', 'Alert Reporting', 'Escalation', 'Five Ws'],
    file: 'soc-l1-alert-reporting.md',
    privacyChecked: true,
    category: 'soc-studies',
    part: 2,
  },
  {
    id: 'soc-workbooks-and-lookups',
    title: 'SOC Workbooks and Lookups: TryHackMe Notes',
    date: '2026-11-06',
    summary:
      'My notes from the TryHackMe SOC Workbooks and Lookups room: using identity and asset inventories and network diagrams to add context to alerts, and following workbooks to triage email, PowerShell and network alerts.',
    tags: ['TryHackMe', 'SOC Level 1', 'Workbooks', 'Asset Inventory', 'Network Diagrams'],
    file: 'soc-workbooks-and-lookups.md',
    privacyChecked: true,
    category: 'soc-studies',
    part: 3,
  },
  {
    id: 'soc-metrics-and-objectives',
    title: 'SOC Metrics and Objectives: TryHackMe Notes',
    date: '2026-11-07',
    summary:
      'My notes from the TryHackMe SOC Metrics and Objectives room: the core metrics a SOC is measured by, the MTTD, MTTA and MTTR targets in an SLA, and what an L1 analyst can do to improve them.',
    tags: ['TryHackMe', 'SOC Level 1', 'SOC Metrics', 'SLA', 'MTTD / MTTA / MTTR'],
    file: 'soc-metrics-and-objectives.md',
    privacyChecked: true,
    category: 'soc-studies',
    part: 4,
  },
  {
    id: 'intro-to-edr',
    title: 'Intro to EDR: TryHackMe Notes',
    date: '2026-11-08',
    summary:
      'My notes from the TryHackMe Intro to EDR room: the three pillars of EDR, why antivirus alone misses advanced attacks, the telemetry agents collect, and the detection techniques and response actions an analyst can use.',
    tags: ['TryHackMe', 'SOC Level 1', 'EDR', 'Endpoint Telemetry', 'MITRE ATT&CK'],
    file: 'intro-to-edr.md',
    privacyChecked: true,
    category: 'soc-studies',
    part: 5,
  },
  {
    id: 'intro-to-siem',
    title: 'Intro to SIEM: TryHackMe Notes',
    date: '2026-11-09',
    summary:
      'My notes from the TryHackMe Intro to SIEM room: host- and network-centric log sources, why scattered logs are hard to analyse, how a SIEM collects, normalizes and correlates them, what Windows, Linux and web server logs look like, and the common ways logs are ingested.',
    tags: ['TryHackMe', 'SOC Level 1', 'SIEM', 'Log Analysis', 'Correlation'],
    file: 'intro-to-siem.md',
    privacyChecked: true,
    category: 'soc-studies',
    part: 6,
  },
];

function resolve(w) {
  const isPdf = Boolean(w.file) && w.file.toLowerCase().endsWith('.pdf');
  const found = w.file ? (isPdf ? pdfs : articles)[DIR + w.file] : null;
  const published = Boolean(found) && w.privacyChecked === true;
  if (import.meta.env.DEV && found && !published) {
    console.warn(`[writeups] "${w.id}": ${w.file} is in the folder but privacyChecked is not true, so it shows as COMING_SOON.`);
  }
  return {
    ...w,
    format: w.file ? (isPdf ? 'PDF' : 'Article') : null,
    published,
    awaitingCheck: Boolean(found) && !published,
    pdfUrl: published && isPdf ? found : null,
    load: published && !isPdf ? found : null, // () => Promise<markdown text>
  };
}

// Newest first; undated entries (not published yet) go last.
export const WRITEUPS = list.map(resolve).sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));

// Categories that hold at least one report, in CATEGORIES order (the tabs).
export const getCategory = (id) => CATEGORIES.find((c) => c.id === id);
export const CATEGORY_TABS = CATEGORIES.map((c) => ({
  ...c,
  // Learning-path order (part) first, then newest first.
  writeups: WRITEUPS.filter((w) => w.category === c.id).sort(
    (a, b) => (a.part ?? Infinity) - (b.part ?? Infinity) || (b.date ?? '').localeCompare(a.date ?? ''),
  ),
})).filter((c) => c.writeups.length > 0);
if (import.meta.env.DEV) {
  for (const w of WRITEUPS) {
    if (!getCategory(w.category)) console.warn(`[writeups] "${w.id}" has no valid category, so it is not listed.`);
  }
}

export const getWriteup = (id) => WRITEUPS.find((w) => w.id === id);
// The report written about a project, if there is one (used for the link back).
export const getWriteupFor = (kind, id) => WRITEUPS.find((w) => w.related?.kind === kind && w.related.id === id);
export const writeupImage = (name) => images[DIR + name] ?? null;
