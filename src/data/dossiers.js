// Sector 03: DOSSIER_ARCHIVE::BUNGE_OPS
//
// Real reports only. A folder (dossier) holds reports; a report is either a
// Markdown file or a PDF.
//
// HOW TO ADD A REPORT
// -------------------
// 1. Check the file and its screenshots first: no addresses, email, phone
//    number, tokens or session ids, and only reports I am allowed to publish
//    (practice labs, or findings the program has cleared for disclosure).
// 2. Markdown: save it as src/content/reports/<name>.md and its images in
//    src/content/reports/<name>/ . Write images as ![what it shows](<name>/file.webp).
//    The reader already shows the title and the details below, so start the file
//    with text or a `#` section heading. Raw HTML is ignored.
//    PDF: save it in public/reports/ and set `pdf: '/reports/<file>.pdf'` instead of `doc`.
// 3. Add one object to a folder's `reports` list:
//
//   {
//     id: 'rpt-003',               // required. Unique, lowercase.
//     file: 'RPT-003_my-report.md',// name shown in the reader toolbar and under the icon
//     doc: 'my-report.md',         // Markdown file in src/content/reports/ (or use `pdf`)
//     title: 'What was found',
//     severity: 'HIGH',            // CRITICAL | HIGH | MEDIUM | LOW | INFO
//     cwe: 'CWE-89',
//     date: '2026-01-31',
//     status: 'Proof of concept achieved',
//     target: 'What was tested',
//     environment: 'Where it was tested from',
//     kind: 'PRACTICE_LAB // PENETRATION_TEST_REPORT',  // line above the title
//     cvss: '7.5',                 // optional. Leave out if I did not score it.
//   },
//
// To add a folder, copy a whole folder object. The shelf fits up to 3 side by side.

const DIR = '../content/reports/';
const docs = import.meta.glob('../content/reports/*.md', { query: '?raw', import: 'default' }); // lazy: fetched when the report is opened
const images = import.meta.glob('../content/reports/**/*.{png,jpg,jpeg,webp,avif,gif,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
});

export const ARCHIVE = {
  code: 'DOSSIER_ARCHIVE::BUNGE_OPS',
  blurb:
    'Penetration test reports from security practice labs, filed as classified dossiers. Hover a folder to peek inside; click to open the archive.',
};

export const SEVERITY = {
  CRITICAL: { color: 'var(--color-magenta)' },
  HIGH: { color: 'var(--color-danger)' },
  MEDIUM: { color: 'var(--color-warn)' },
  LOW: { color: 'var(--color-matrix)' },
  INFO: { color: 'var(--color-cyber)' },
};

const LAB = 'PRACTICE_LAB // PENETRATION_TEST_REPORT';

const list = [
  {
    id: 'dossier_01',
    code: 'DOSSIER_01',
    title: 'SQL_INJECTION',
    blurb: 'SQL injection reports from PortSwigger Web Security Academy practice labs.',
    clearance: 'L3',
    accent: 'var(--color-id-cyan)',
    reports: [
      {
        id: 'rpt-001',
        file: 'RPT-001_sqli-login-bypass.md',
        doc: 'sqli-login-bypass.md',
        title: 'PortSwigger SQL injection vulnerability allowing login bypass',
        severity: 'HIGH',
        cwe: 'CWE-89',
        date: '2026-01-21',
        status: 'Proof of concept achieved',
        target: 'PortSwigger lab: SQL injection vulnerability allowing login bypass',
        environment: 'Kali Linux',
        kind: LAB,
      },
      {
        id: 'rpt-002',
        file: 'RPT-002_sqli-union-attack.md',
        doc: 'sqli-union-attack.md',
        title: 'PortSwigger SQL injection UNION attack',
        severity: 'HIGH',
        cwe: 'CWE-89',
        date: '2026-01-22',
        status: 'Proof of concept achieved',
        target: 'PortSwigger lab: SQL injection UNION attack',
        environment: 'Kali Linux',
        kind: LAB,
      },
    ],
  },
];

// `load` is null when the report has no Markdown file (PDF reports, or a file that is missing).
export const DOSSIERS = list.map((d) => ({
  ...d,
  reports: d.reports.map((r) => ({ pdf: null, ...r, load: (r.doc && docs[DIR + r.doc]) || null })),
}));

export const getDossier = (id) => DOSSIERS.find((d) => d.id === id);
export const getReport = (id) => DOSSIERS.flatMap((d) => d.reports).find((r) => r.id === id);
export const REPORT_COUNT = DOSSIERS.reduce((n, d) => n + d.reports.length, 0);
export const reportImage = (name) => images[DIR + name] ?? null;
