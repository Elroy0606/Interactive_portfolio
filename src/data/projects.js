// Sector 02: WEBSITES AND APPS (components/dev/DevDistrict.jsx)
//
// HOW TO ADD A PROJECT
// --------------------
// Copy the object below, paste it into PROJECTS and fill it in. That is the
// whole step: the card, the counters and the layout update by themselves.
//
//   {
//     id: 'my-app',                // required. Unique, lowercase, no spaces.
//     name: 'My App',              // required. Shown as the card title.
//     url: 'https://example.com',  // the "Visit" link (opens in a new tab).
//                                  //   Use null if there is nothing to visit yet.
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

const thumbs = import.meta.glob('../content/projects/*.{png,jpg,jpeg,webp,avif,gif}', {
  eager: true,
  query: '?url',
  import: 'default',
});

export const STATUS = {
  Live: { color: 'var(--color-matrix)', led: true },
  'In progress': { color: 'var(--color-warn)', led: false },
};

const list = [
  {
    id: 'tetris',
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
