import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FileCheck2, Library } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { CATEGORY_TABS, WRITEUPS, getWriteup } from '../../data/writeups';
import SectorHeader from '../ui/SectorHeader';
import CardStage from '../ui/CardStage';
import Tip from '../ui/Tip';
import WriteupCard from './WriteupCard';
import WriteupDetail from './WriteupDetail';
import CategoryTabs, { PANEL_ID, tabId } from './CategoryTabs';
import LearningPath from './LearningPath';
import { sfx } from '../../lib/sound';
import { useMotion } from '../../theme/motion';

const ACCENT = 'var(--color-id-violet)';
const PUBLISHED = WRITEUPS.filter((w) => w.published).length;

// Sector 02 (WRITE-UPS): reports and study notes, grouped by category.
//   index (category tabs -> intro, learning path, cards)  --click card-->  detail page (article / PDF / coming soon)
// The open tab is local state; it follows the report that was open, so closing
// a report (even one opened from another sector) lands on its own category.
// `activeWriteupId` lives in the app reducer so other sectors can link straight
// to a report (WRITEUP_OPEN). Esc pops one layer: detail -> index -> hub.
export default function WriteupsWorld() {
  const { state, dispatch } = useApp();
  const active = getWriteup(state.activeWriteupId);
  const { viewProps, fadeProps } = useMotion();
  const [catId, setCatId] = useState(() => active?.category ?? CATEGORY_TABS[0]?.id);
  useEffect(() => {
    if (active?.category) setCatId(active.category);
  }, [active]);
  const cat = CATEGORY_TABS.find((c) => c.id === catId) ?? CATEGORY_TABS[0];

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
              eyebrow="[SECTOR 02] // KNOWLEDGE_BASE // ACCESS_GRANTED"
              title="REPORTS_AND_WRITE-UPS"
              chips={
                <>
                  <Tip label="REPORTS LISTED" side="bottom">
                    <span className="chip-stat accent-border accent-text accent-bg-soft flex items-center gap-2 border px-2.5 py-1.5">
                      <Library size={13} aria-hidden /> REPORTS: {WRITEUPS.length}
                    </span>
                  </Tip>
                  <Tip label="READY TO READ" side="bottom">
                    <span className="chip-stat flex items-center gap-2 border border-matrix/30 bg-matrix/5 px-2.5 py-1.5 text-matrix">
                      <FileCheck2 size={13} aria-hidden /> PUBLISHED: {PUBLISHED}
                    </span>
                  </Tip>
                </>
              }
            >
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/55">
                Reports on my home lab builds and my study notes, grouped by topic. These are personal projects and training, not client work.
              </p>
            </SectorHeader>

            {cat && (
              <>
                <CategoryTabs tabs={CATEGORY_TABS} active={cat.id} onChange={setCatId} />
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={cat.id}
                    id={PANEL_ID}
                    role="tabpanel"
                    aria-labelledby={tabId(cat.id)}
                    style={{ '--accent': cat.accent }}
                    {...fadeProps}
                    exit={{ opacity: 0, transition: { duration: 0.1 } }}
                  >
                    <div className="accent-border relative mb-5 border bg-panel/80 p-4 sm:p-5">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <cat.icon size={18} aria-hidden className="accent-text" />
                        <h2 className="accent-text font-ui text-sm font-bold track-20">{cat.code}</h2>
                        {cat.notice && (
                          <span className="border border-warn/40 bg-warn/5 px-2 py-0.5 font-ui text-[10px] tracking-widest text-warn">
                            {cat.notice}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/65">{cat.blurb}</p>
                      {cat.path && <LearningPath label={cat.path} writeups={cat.writeups} onOpen={open} />}
                    </div>

                    <CardStage label={`${cat.code} // ${cat.writeups.length} INDEXED`} fig={`FIG.05 — ${cat.code}`}>
                      {cat.writeups.map((w, i) => (
                        <WriteupCard key={w.id} writeup={w} index={i} single={cat.writeups.length === 1} onOpen={open} />
                      ))}
                    </CardStage>
                  </motion.div>
                </AnimatePresence>
              </>
            )}

            <p className="mt-4 text-center font-ui text-[11px] track-20 text-white/30">
              [ PICK A TOPIC · CLICK A REPORT TO OPEN IT · ESC TO RETURN ]
            </p>
          </motion.section>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
