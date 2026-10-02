import { AppWindow, ScrollText } from 'lucide-react';
import { SERVICES } from './services';
import { PROJECTS } from './projects';
import { WRITEUPS, getWriteupFor } from './writeups';

// Home page HIGHLIGHTS (components/Highlights.jsx).
//
// Nothing is written here: this file only collects the entries that are flagged
// in the three project data files, so a highlight always shows the project's
// own title, description and links.
//
// HOW TO FEATURE (OR UNFEATURE) A PROJECT
// ---------------------------------------
// In data/services.js (home lab), data/projects.js (websites and apps) or
// data/writeups.js (reports), add to the project's entry:
//
//   featured: true,              // false, or no field at all = not on the home page
//   highlightOrder: 2,           // optional. Lowest number first; entries without one go last
//   highlightReason: 'Why this project matters, in my own words.',
//   highlightTags: ['A', 'B'],   // optional, two or three. Default: the entry's first three tags
//
// Only the first MAX_HIGHLIGHTS are shown. With none flagged the section is not rendered.

export const MAX_HIGHLIGHTS = 3;

const tagsOf = (entry, fallback) => (entry.highlightTags ?? fallback ?? []).slice(0, 3);

// One shape for all three project types. `open` is the reducer action that goes
// to the full project page; `report` is the linked write-up, when there is one.
const fromLab = (s) => ({
  key: `lab:${s.id}`,
  kindLabel: 'HOME LAB PROJECT',
  title: s.title ?? s.name,
  description: s.mission,
  tags: tagsOf(s, s.stack),
  icon: s.icon,
  accent: s.accent,
  open: { type: 'JUMP_TO_LAB', id: s.id },
  openLabel: 'OPEN_PROJECT',
  report: getWriteupFor('lab', s.id),
  entry: s,
});
const fromProject = (p) => ({
  key: `project:${p.id}`,
  kindLabel: 'WEBSITE / APP',
  title: p.name,
  description: p.description,
  tags: tagsOf(p, p.tags),
  icon: AppWindow,
  accent: 'var(--color-id-amber)',
  image: p.thumbnailUrl ? { src: p.thumbnailUrl, alt: p.thumbnailAlt || `Screenshot of ${p.name}` } : null,
  open: { type: 'JUMP_TO_PROJECTS' },
  openLabel: 'OPEN_PROJECT',
  report: getWriteupFor('project', p.id),
  entry: p,
});
const fromWriteup = (w) => ({
  key: `writeup:${w.id}`,
  kindLabel: 'REPORT',
  title: w.title,
  description: w.summary,
  tags: tagsOf(w, w.tags),
  icon: ScrollText,
  accent: 'var(--color-id-violet)',
  open: { type: 'WRITEUP_OPEN', id: w.id },
  openLabel: w.published ? 'READ_REPORT' : 'VIEW_REPORT_STATUS',
  report: null, // it is the report
  entry: w,
});

const order = (h) => h.entry.highlightOrder ?? Number.POSITIVE_INFINITY;

export const HIGHLIGHTS = [...SERVICES.map(fromLab), ...PROJECTS.map(fromProject), ...WRITEUPS.map(fromWriteup)]
  .filter((h) => h.entry.featured === true)
  .sort((a, b) => order(a) - order(b)) // stable: ties keep the order above
  .slice(0, MAX_HIGHLIGHTS)
  .map(({ entry, ...h }) => ({ ...h, reason: entry.highlightReason ?? '' }));
