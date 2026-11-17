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

import { Gamepad2, Wrench } from 'lucide-react';

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
  { id: 'tool', label: 'Tools', code: 'TOOLS', icon: Wrench, accent: 'var(--color-id-amber)', cta: 'LAUNCH_TOOL', item: 'TOOL', blurb: 'Web tools I built, such as a subnet calculator.' },
  { id: 'game', label: 'Games', code: 'GAMES', icon: Gamepad2, accent: 'var(--color-id-cyan)', cta: 'PLAY', item: 'GAME', blurb: 'Browser games I built.' },
];

const list = [
  {
    id: 'subnet-calculator',
    kind: 'tool',
    name: 'SubnetZen Subnet Calculator',
    url: 'https://subnet.elcybersec.com',
    status: 'Live',
    description:
      'A fast, responsive IPv4 subnet calculator for network engineers and security analysts. It works out CIDR notation, subnet masks, usable IP ranges and broadcast addresses, with a live 32-bit visualizer.',
    tags: ['React', 'Framer Motion', 'Vite', 'JavaScript'],
    thumbnail: null, // TODO: optional screenshot, e.g. 'subnet-calculator.png' in src/content/projects/
    thumbnailAlt: '',
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
