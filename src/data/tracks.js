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
//   (Sector 02 does: its write-up categories are split by track).
// - A write-up category joins a track through its `track` field in
//   data/writeups.js. Sector 02 only lists the categories of the open track.
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
      'Things I have built, configured and tested hands-on: my home lab, vulnerability reports from practice labs, build reports, and the websites and apps I made.',
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
    { label: 'VULN REPORTS', value: REPORT_COUNT },
    { label: 'BUILD REPORTS', value: published(writeupsFor(TRACK.PRACTICAL)) },
    { label: 'PROJECTS', value: PROJECTS.length },
  ],
};

if (import.meta.env.DEV) {
  for (const c of CATEGORIES) {
    if (!getTrack(c.track)) console.warn(`[tracks] write-up category "${c.id}" has no valid track, so Sector 02 never lists it.`);
  }
}
