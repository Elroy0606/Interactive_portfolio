import { useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../state/AppContext';
import { useMotion } from '../theme/motion';
import { TRACKS, TRACK_STATS, getTrack, sectorsFor } from '../data/tracks';
import { CATEGORY_TABS } from '../data/writeups';
import SectorHeader from './ui/SectorHeader';
import CardStage from './ui/CardStage';
import Tip from './ui/Tip';
import TrackSwitch, { trackTabId } from './ui/TrackSwitch';
import SectorCard from './SectorCard';
import LearningPath from './writeups/LearningPath';

const PANEL_ID = 'track-panel';
// Two cards per row: a single sector sits centred, four make a 2 x 2 grid.
const STATION_WIDTH = 'w-full md:w-[calc(50%-0.75rem)]';

// The page behind a home page path card: the sectors on the Theory or the
// Practical path (data/tracks.js), plus any learning path of that track's
// write-up categories as a shortcut into the reports. The path switch at the
// top swaps to the other track in place. Esc / the return button -> hub.
export default function TrackWorld() {
  const { state, dispatch } = useApp();
  const { viewProps, fadeProps } = useMotion();
  const track = getTrack(state.track) ?? TRACKS[0];
  const stations = sectorsFor(track.id);
  const paths = CATEGORY_TABS.filter((c) => c.track === track.id && c.path);
  const stats = TRACK_STATS[track.id] ?? [];

  const toHub = useCallback(() => dispatch({ type: 'RETURN_TO_HUB' }), [dispatch]);
  const switchTo = useCallback((id) => dispatch({ type: 'ENTER_TRACK', track: id }), [dispatch]);
  const enterSector = useCallback((s) => dispatch({ type: 'ENTER_SECTOR', sectorId: s.id }), [dispatch]);
  const openWriteup = useCallback((id) => dispatch({ type: 'WRITEUP_OPEN', id }), [dispatch]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && toHub();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toHub]);

  return (
    <motion.main
      key="track"
      style={{ '--accent': track.accent }}
      className="mx-auto max-w-[1600px] px-4 pb-16 pt-6 sm:px-8 sm:pt-8"
      {...viewProps}
    >
      <SectorHeader
        backLabel="[RETURN_TO_MAINFRAME]"
        onBack={toHub}
        eyebrow={`[TRACK ${track.letter}] // ${track.code} // ACCESS_GRANTED`}
        title={track.code}
        chips={stats.map((st) => (
          <Tip key={st.label} label={`${st.label} ON THIS PATH`} side="bottom">
            <span className="chip-stat accent-border accent-text accent-bg-soft flex items-center gap-2 border px-2.5 py-1.5">
              {st.label}: {st.value}
            </span>
          </Tip>
        ))}
      >
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/60">{track.blurb}</p>
        <p className="mt-3 inline-block border border-warn/40 bg-warn/5 px-2 py-0.5 font-ui text-[10px] tracking-widest text-warn">
          {track.notice}
        </p>
      </SectorHeader>

      <TrackSwitch scope="page" active={track.id} onChange={switchTo} controls={PANEL_ID} hint="SWITCH PATH" />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={track.id}
          id={PANEL_ID}
          role="tabpanel"
          aria-labelledby={trackTabId('page', track.id)}
          {...fadeProps}
          exit={{ opacity: 0, transition: { duration: 0.1 } }}
        >
          {paths.map((c) => (
            <div key={c.id} style={{ '--accent': c.accent }} className="accent-border relative mb-5 border bg-panel/80 p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <c.icon size={18} aria-hidden className="accent-text" />
                <h2 className="accent-text font-ui text-sm font-bold track-20">{c.code}</h2>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/65">{c.blurb}</p>
              <LearningPath label={c.path} writeups={c.writeups} onOpen={openWriteup} />
            </div>
          ))}

          <CardStage
            label={`${track.code} // ${stations.length} ${stations.length === 1 ? 'SECTOR' : 'SECTORS'}`}
            fig={`FIG.00 — TRACK_${track.letter}`}
          >
            {stations.map((s, i) => (
              <li key={s.id} className={STATION_WIDTH}>
                <SectorCard sector={s} index={i} onConnect={enterSector} onDenied={() => {}} onHover={() => {}} />
              </li>
            ))}
          </CardStage>
        </motion.div>
      </AnimatePresence>

      <p className="mt-4 text-center font-ui text-[11px] track-20 text-white/30">
        [ PICK A SECTOR · SWITCH PATH ABOVE · ESC TO RETURN ]
      </p>
    </motion.main>
  );
}
