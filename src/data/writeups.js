// Sector 04: REPORTS AND WRITE-UPS (components/writeups/)
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
//     related: {                   // optional. Links the report to a project,
//                                  //   and the project back to the report.
//       kind: 'lab',               // 'lab' = a home lab node, 'project' = a Sector 02 project
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
// Markdown notes: the page already shows the title, so start the file with
// text or a `#` section heading (not the title again). Images: save them in the
// same folder and write ![what it shows](file-name.png). Raw HTML is ignored.

const DIR = '../content/writeups/';
const articles = import.meta.glob(['../content/writeups/*.md', '!../content/writeups/README.md'], {
  query: '?raw',
  import: 'default',
}); // lazy: the text is fetched when the report is opened
const pdfs = import.meta.glob('../content/writeups/*.pdf', { eager: true, query: '?url', import: 'default' });
const images = import.meta.glob('../content/writeups/*.{png,jpg,jpeg,webp,avif,gif}', {
  eager: true,
  query: '?url',
  import: 'default',
});

const list = [
  {
    id: 'windows-ad-lab',
    title: 'Windows Server and Active Directory Lab Report',
    date: null, // TODO: publication date, YYYY-MM-DD
    summary: '', // TODO: one or two sentences
    tags: [], // TODO: tags
    file: null, // TODO: the web-safe report, e.g. 'windows-ad-lab.md' or 'windows-ad-lab.pdf'
    privacyChecked: false, // set to true once the file has been checked (step 1 above)
    related: { kind: 'lab', id: 'adlab', label: 'Windows Server and Active Directory Lab' },
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

export const getWriteup = (id) => WRITEUPS.find((w) => w.id === id);
// The report written about a project, if there is one (used for the link back).
export const getWriteupFor = (kind, id) => WRITEUPS.find((w) => w.related?.kind === kind && w.related.id === id);
export const writeupImage = (name) => images[DIR + name] ?? null;
