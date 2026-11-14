import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FileCheck2, Folder } from 'lucide-react';
import { useApp, ZOOM } from '../../state/AppContext';
import { CATEGORY_TABS, getWriteup } from '../../data/writeups';
import { TRACKS, backLabel, getTrack, trackOfWriteup, writeupsFor } from '../../data/tracks';
import TrackSwitch, { trackTabId } from '../ui/TrackSwitch';
import SectorHeader from '../ui/SectorHeader';
import Tip from '../ui/Tip';
import DossierGrid from '../vulns/DossierGrid';
import WriteupDetail from './WriteupDetail';
import FolderExplorer, { folderPath } from './FolderExplorer';
import { cn } from '../../lib/cn';
import { sfx } from '../../lib/sound';
import { useMotion } from '../../theme/motion';

const ACCENT = 'var(--color-id-violet)';
const TRACK_PANEL_ID = 'wu-track-panel';
// Per track: { all: n, published: n } (counts for the path switch and the header chips).
const COUNTS = Object.fromEntries(
  TRACKS.map((t) => {
    const list = writeupsFor(t.id);
    return [t.id, { all: list.length, published: list.filter((w) => w.published).length }];
  }),
);
// A write-up category drawn as a folder on the shared shelf (vulns/DossierGrid).
const asFolder = (c, i) => ({ ...c, code: `DIR_${String(i + 1).padStart(2, '0')}`, title: c.label, reports: c.writeups });
const latest = (f) => f.reports.map((w) => w.date).filter(Boolean).sort().at(-1);

// Sector 02 (WRITE-UPS): reports and study notes as a file explorer, split by path first.
//   folder shelf (one folder per category of the open path)
//     --click folder, camera zoom-->  directory (explorer tree + file list)
//     --click file-->                 detail page (article / PDF / coming soon)
// The path is `state.track` (data/tracks.js). The open folder, the zoom phase and
// the camera pose are local state: the folder follows the report that was open,
// so closing a report (even one opened from another sector) lands inside its folder.
// `activeWriteupId` lives in the app reducer so other sectors can link straight
// to a report (WRITEUP_OPEN). Esc pops one layer: detail -> folder -> shelf -> track / hub.
export default function WriteupsWorld() {
  const { state, dispatch } = useApp();
  const active = getWriteup(state.activeWriteupId);
  const { viewProps, dossier: FOLDER_MS } = useMotion();
  const track = getTrack(state.track) ?? getTrack(trackOfWriteup(state.activeWriteupId)) ?? TRACKS[0];
  const tabs = CATEGORY_TABS.filter((c) => c.track === track.id);
  const folders = tabs.map(asFolder);
  const counts = COUNTS[track.id];

  // Folder state. Arriving with a report open = already inside its folder (no pose,
  // so closing it is a plain fade back to the shelf).
  const [openId, setOpenId] = useState(() => active?.category ?? null);
  const [phase, setPhase] = useState(() => (active?.category ? ZOOM.INSIDE : ZOOM.NONE));
  const [pose, setPose] = useState(null);
  useEffect(() => {
    if (active?.category) {
      setOpenId(active.category);
      setPhase((p) => (p === ZOOM.NONE ? ZOOM.INSIDE : p));
    }
  }, [active]);
  const folder = tabs.find((c) => c.id === openId);
  const inside = phase === ZOOM.INSIDE && folder;
  // The open folder is not on this path (e.g. the path changed): back to the shelf at rest.
  useEffect(() => {
    if (!folder && phase !== ZOOM.NONE) {
      setPhase(ZOOM.NONE);
      setOpenId(null);
      setPose(null);
    }
  }, [folder, phase]);

  // Phase timers (same hand-off as Sector 03; the camera animation lives in DossierGrid).
  useEffect(() => {
    if (phase === ZOOM.ENTERING) {
      const t = setTimeout(() => setPhase(ZOOM.INSIDE), FOLDER_MS.entering);
      return () => clearTimeout(t);
    }
    if (phase === ZOOM.EXITING) {
      const t = setTimeout(() => {
        setPhase(ZOOM.NONE);
        setOpenId(null);
      }, FOLDER_MS.exiting);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [phase, FOLDER_MS]);

  const toHub = useCallback(() => dispatch({ type: 'LEAVE_SECTOR' }), [dispatch]);
  const setTrack = useCallback((id) => dispatch({ type: 'SET_TRACK', track: id }), [dispatch]);
  const open = useCallback((id) => dispatch({ type: 'WRITEUP_OPEN', id }), [dispatch]);
  const close = useCallback(() => dispatch({ type: 'WRITEUP_CLOSE' }), [dispatch]);
  const openRelated = useCallback(
    (related) => dispatch(related.kind === 'lab' ? { type: 'JUMP_TO_LAB', id: related.id } : { type: 'JUMP_TO_PROJECTS' }),
    [dispatch],
  );
  const openFolder = useCallback((id, nextPose) => {
    setPose(nextPose);
    setOpenId(id);
    setPhase(ZOOM.ENTERING);
  }, []);
  // Switching folder in the explorer tree: no camera pose for the new folder,
  // so a later close fades back instead of zooming out of the wrong folder.
  const switchFolder = useCallback((id) => {
    setPose(null);
    setOpenId(id);
  }, []);
  const closeFolder = useCallback(() => setPhase(ZOOM.EXITING), []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (active) {
        sfx.close();
        close();
      } else if (phase === ZOOM.INSIDE) {
        sfx.close();
        closeFolder();
      } else if (phase === ZOOM.NONE) {
        toHub();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, phase, close, closeFolder, toHub]);

  return (
    <motion.main
      key="writeups"
      style={{ '--accent': ACCENT }}
      // opacity/scale only, like Sector 03 (no filter / persistent transform on an ancestor of fixed overlays)
      className="mx-auto max-w-[1600px] px-4 pb-16 pt-6 sm:px-8 sm:pt-8"
      {...viewProps}
    >
      <AnimatePresence mode="wait" initial={false}>
        {active ? (
          <WriteupDetail key={active.id} writeup={active} onBack={close} onOpenRelated={openRelated} />
        ) : inside ? (
          <FolderExplorer
            key="folder"
            track={track}
            folders={tabs}
            folder={folder}
            onSelect={switchFolder}
            onClose={closeFolder}
            onOpen={open}
          />
        ) : (
          <motion.section
            key="shelf"
            aria-label="Write-up folders"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className={cn('transition-opacity duration-500', phase === ZOOM.ENTERING && 'pointer-events-none opacity-0')}>
              <SectorHeader
                backLabel={backLabel(state.track)}
                onBack={toHub}
                eyebrow={`[SECTOR 02] // KNOWLEDGE_BASE // ${track.label.toUpperCase()}`}
                title="REPORTS_AND_WRITE-UPS"
                chips={
                  <>
                    <Tip label="FOLDERS ON THIS PATH" side="bottom">
                      <span className="chip-stat accent-border accent-text accent-bg-soft flex items-center gap-2 border px-2.5 py-1.5">
                        <Folder size={13} aria-hidden /> FOLDERS: {folders.length} · FILES: {counts.all}
                      </span>
                    </Tip>
                    <Tip label="READY TO READ" side="bottom">
                      <span className="chip-stat flex items-center gap-2 border border-matrix/30 bg-matrix/5 px-2.5 py-1.5 text-matrix">
                        <FileCheck2 size={13} aria-hidden /> PUBLISHED: {counts.published}
                      </span>
                    </Tip>
                  </>
                }
              >
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/55">
                  My study notes (Theory) and reports on what I built and solved (Practical), filed by topic. These are personal projects and training, not client work.
                </p>
              </SectorHeader>

              <TrackSwitch
                scope="wu"
                active={track.id}
                onChange={setTrack}
                controls={TRACK_PANEL_ID}
                counts={Object.fromEntries(TRACKS.map((t) => [t.id, COUNTS[t.id].all]))}
                hint="THEORY OR PRACTICAL"
              />
            </div>

            <div id={TRACK_PANEL_ID} role="tabpanel" aria-labelledby={trackTabId('wu', track.id)}>
              {folders.length === 0 ? (
                <p className="border border-dashed border-white/20 p-6 text-center font-ui text-xs tracking-widest text-white/50">
                  NO {track.label.toUpperCase()} REPORTS YET // COMING_SOON
                </p>
              ) : (
                <DossierGrid
                  key={track.id}
                  phase={phase}
                  pose={pose}
                  activeId={openId}
                  onOpen={openFolder}
                  folders={folders}
                  frame={{
                    left: `FILESYSTEM // ~/write_ups/${track.id}`,
                    right: `${folders.length} ${folders.length === 1 ? 'FOLDER' : 'FOLDERS'} · ${counts.all} FILES`,
                    border: 'accent-border',
                    label: 'accent-text opacity-70',
                  }}
                  peek={(f) => `> ls ${folderPath(track.id, f)} :: ${f.reports.length} files :: latest ${latest(f) ?? 'n/a'}`}
                  labelsFor={(f) => ({
                    top: `${f.reports.filter((w) => w.published).length} PUBLISHED`,
                    status: 'INDEXED',
                    stamp: null,
                    aria: `Open folder ${f.title}, ${f.reports.length} files`,
                  })}
                />
              )}
            </div>

            {phase === ZOOM.NONE && (
              <p className="mt-4 text-center font-ui text-[11px] track-20 text-white/30">
                [ PICK A PATH · HOVER A FOLDER TO PEEK · CLICK TO OPEN · ESC TO RETURN ]
              </p>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
