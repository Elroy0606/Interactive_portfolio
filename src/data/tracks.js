import { BookOpen, Wrench } from 'lucide-react';
import { SECTORS } from './sectors';
import { CATEGORIES, WRITEUPS, getWriteup } from './writeups';
import { SERVICES } from './services';
import { REPORT_COUNT } from './dossiers';
import { PROJECTS } from './projects';

// The two paths a visitor picks on the home page (components/Hub.jsx -> TrackWorld.jsx).
//
//   theory    = what I have studied, learned and analysed (study notes, concepts)
//   practical = what I have built, configured and tested hands-on
//
// WHAT GOES IN A TRACK
// --------------------
// - A sector joins a track through its `tracks` field in data/sectors.js. The
//   value is an object of per-track overrides for the card (label, blurb, tags,
//   cta); `{}` = show the card as it is. A sector can sit in both tracks
//   (Sector 03 does: its write-up categories are split by track).
// - A write-up category joins a track through its `track` field in
//   data/writeups.js. Sector 03 only lists the categories of the open track.
// - The order of TRACKS is the order of the cards on the home page.
//
// Ids are stored in the app state (`state.track`) and shown in the breadcrumb.

export const TRACK = { THEORY: 'theory', PRACTICAL: 'practical' };

export const TRACKS = [
  {
    id: TRACK.THEORY,
    letter: 'A',
    code: 'THEORY_KNOWLEDGE',
    label: 'Theory',
    title: 'What I have studied',
    icon: BookOpen,
    accent: 'var(--color-id-blue)',
    blurb:
      'My study notes from security courses and training platforms: the concepts I have learned, how I understand them, and how they fit together.',
    notice: 'TRAINING // NOT ON-THE-JOB EXPERIENCE',
    cta: 'ENTER_THEORY_TRACK',
  },
  {
    id: TRACK.PRACTICAL,
    letter: 'B',
    code: 'PRACTICAL_EXPERIENCE',
    label: 'Practical',
    title: 'What I have built',
    icon: Wrench,
    accent: 'var(--color-id-magenta)',
    blurb:
      'Things I have built, configured and tested hands-on: my home lab, the tools and games I made, build reports, and vulnerability reports from practice labs.',
    notice: 'PERSONAL PROJECTS // NOT CLIENT WORK',
    cta: 'ENTER_PRACTICAL_TRACK',
  },
];

export const getTrack = (id) => TRACKS.find((t) => t.id === id);
// Label of a sector's return button: back to the track it was opened from, or the hub.
export const backLabel = (trackId) =>
  getTrack(trackId) ? `[RETURN_TO_${getTrack(trackId).label.toUpperCase()}_TRACK]` : '[RETURN_TO_SECTOR_HUB]';
export const otherTrack = (id) => TRACKS.find((t) => t.id !== id);

// The sector cards of a track, with that track's overrides applied.
export const sectorsFor = (trackId) =>
  SECTORS.filter((s) => s.tracks?.[trackId]).map(({ tracks, ...s }) => ({ ...s, ...tracks[trackId] }));

const pad2 = (n) => String(n).padStart(2, '0');
// The number a sector shows: its position among the open path's sectors, so
// numbering always starts at 01 on each path. Outside a path (or if the sector
// is not on it), its position on the first path it belongs to.
export const sectorNumber = (sectorId, trackId) => {
  const on = (t) => sectorsFor(t).findIndex((s) => s.id === sectorId);
  const i = on(trackId);
  if (i >= 0) return pad2(i + 1);
  const t = TRACKS.find((tr) => on(tr.id) >= 0);
  return t ? pad2(on(t.id) + 1) : sectorId;
};
// Same, for the sector that renders a given view ('writeups', 'dev', ...).
export const sectorNumberOfView = (view, trackId) => {
  const s = SECTORS.find((x) => x.view === view);
  return s ? sectorNumber(s.id, trackId) : '';
};
export const sectorOfView = (view) => SECTORS.find((x) => x.view === view);

// The only track a sector belongs to (null if it is in both, or none).
export const soleTrackOf = (sectorId) => {
  const ids = Object.keys(SECTORS.find((s) => s.id === sectorId)?.tracks ?? {});
  return ids.length === 1 ? ids[0] : null;
};

export const categoriesFor = (trackId) => CATEGORIES.filter((c) => c.track === trackId).map((c) => c.id);
export const writeupsFor = (trackId) => {
  const cats = categoriesFor(trackId);
  return WRITEUPS.filter((w) => cats.includes(w.category));
};
export const trackOfWriteup = (id) => CATEGORIES.find((c) => c.id === getWriteup(id)?.category)?.track ?? null;

// Readouts shown on the home page cards and the track header. Counts only,
// taken from the data files, so they never drift from what the site shows.
const published = (list) => list.filter((w) => w.published).length;
export const TRACK_STATS = {
  [TRACK.THEORY]: [{ label: 'STUDY NOTES', value: published(writeupsFor(TRACK.THEORY)) }],
  [TRACK.PRACTICAL]: [
    { label: 'LAB NODES', value: SERVICES.length },
    { label: 'PROJECTS', value: PROJECTS.length },
    { label: 'WRITE-UPS', value: published(writeupsFor(TRACK.PRACTICAL)) },
    { label: 'VULN REPORTS', value: REPORT_COUNT },
  ],
};

if (import.meta.env.DEV) {
  for (const c of CATEGORIES) {
    if (!getTrack(c.track)) console.warn(`[tracks] write-up category "${c.id}" has no valid track, so Sector 03 never lists it.`);
  }
}
