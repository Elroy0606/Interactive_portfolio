import { useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FileCheck2, Library } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { WRITEUPS, getWriteup } from '../../data/writeups';
import SectorHeader from '../ui/SectorHeader';
import CardStage from '../ui/CardStage';
import Tip from '../ui/Tip';
import WriteupCard from './WriteupCard';
import WriteupDetail from './WriteupDetail';
import { sfx } from '../../lib/sound';
import { useMotion } from '../../theme/motion';

const ACCENT = 'var(--color-id-violet)';
const PUBLISHED = WRITEUPS.filter((w) => w.published).length;

// Sector 04 (WRITE-UPS): reports on how I built things.
//   index (cards, newest first)  --click card-->  detail page (article / PDF / coming soon)
// `activeWriteupId` lives in the app reducer so other sectors can link straight
// to a report (WRITEUP_OPEN). Esc pops one layer: detail -> index -> hub.
export default function WriteupsWorld() {
  const { state, dispatch } = useApp();
  const active = getWriteup(state.activeWriteupId);
  const { viewProps } = useMotion();

  const toHub = useCallback(() => dispatch({ type: 'RETURN_TO_HUB' }), [dispatch]);
  const open = useCallback((id) => dispatch({ type: 'WRITEUP_OPEN', id }), [dispatch]);
  const close = useCallback(() => dispatch({ type: 'WRITEUP_CLOSE' }), [dispatch]);
  const openRelated = useCallback(
    (related) => dispatch(related.kind === 'lab' ? { type: 'JUMP_TO_LAB', id: related.id } : { type: 'JUMP_TO_PROJECTS' }),
    [dispatch],
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (active) {
        sfx.close();
        close();
      } else {
        toHub();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, close, toHub]);

  return (
    <motion.main
      key="writeups"
      style={{ '--accent': ACCENT }}
      className="mx-auto max-w-[1600px] px-4 pb-16 pt-6 sm:px-8 sm:pt-8"
      {...viewProps}
    >
      <AnimatePresence mode="wait" initial={false}>
        {active ? (
          <WriteupDetail key={active.id} writeup={active} onBack={close} onOpenRelated={openRelated} />
        ) : (
          <motion.section
            key="index"
            aria-label="All write-ups"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <SectorHeader
              backLabel="[RETURN_TO_SECTOR_HUB]"
              onBack={toHub}
              eyebrow="[SECTOR 04] // BUILD_LOGS // ACCESS_GRANTED"
              title="REPORTS_AND_WRITE-UPS"
              chips={
                <>
                  <Tip label="REPORTS LISTED" side="bottom">
                    <span className="accent-border accent-text accent-bg-soft flex items-center gap-2 border px-2.5 py-1.5">
                      <Library size={13} aria-hidden /> REPORTS: {WRITEUPS.length}
                    </span>
                  </Tip>
                  <Tip label="READY TO READ" side="bottom">
                    <span className="flex items-center gap-2 border border-matrix/30 bg-matrix/5 px-2.5 py-1.5 text-matrix">
                      <FileCheck2 size={13} aria-hidden /> PUBLISHED: {PUBLISHED}
                    </span>
                  </Tip>
                </>
              }
            >
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/55">
                Reports that explain how I built my labs and projects. These are personal and home lab projects. Newest first.
              </p>
            </SectorHeader>

            <CardStage label={`ARCHIVE // ${WRITEUPS.length} INDEXED`} fig="FIG.05 — BUILD_REPORTS">
              {WRITEUPS.map((w, i) => (
                <WriteupCard key={w.id} writeup={w} index={i} single={WRITEUPS.length === 1} onOpen={open} />
              ))}
            </CardStage>

            <p className="mt-4 text-center font-ui text-[11px] track-20 text-white/30">
              [ CLICK A REPORT TO OPEN IT · ESC TO RETURN ]
            </p>
          </motion.section>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
