import { useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AppWindow, Radio } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { PROJECTS } from '../../data/projects';
import { getWriteupFor } from '../../data/writeups';
import SectorHeader from '../ui/SectorHeader';
import CardStage from '../ui/CardStage';
import Tip from '../ui/Tip';
import ProjectCard from './ProjectCard';
import { useMotion } from '../../theme/motion';

const ACCENT = 'var(--color-id-amber)';
const LIVE = PROJECTS.filter((p) => p.status === 'Live').length;

// Sector 02 (DEV_DISTRICT): the websites and apps I have made, one card each.
// Everything shown comes from data/projects.js.
export default function DevDistrict() {
  const { dispatch } = useApp();
  const { viewProps } = useMotion();
  const toHub = useCallback(() => dispatch({ type: 'RETURN_TO_HUB' }), [dispatch]);
  const openWriteup = useCallback((id) => dispatch({ type: 'WRITEUP_OPEN', id }), [dispatch]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && toHub();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toHub]);

  return (
    <motion.main
      key="dev"
      style={{ '--accent': ACCENT }}
      className="mx-auto max-w-[1600px] px-4 pb-16 pt-6 sm:px-8 sm:pt-8"
      {...viewProps}
    >
      <SectorHeader
        backLabel="[RETURN_TO_SECTOR_HUB]"
        onBack={toHub}
        eyebrow="[SECTOR 02] // DEV_DISTRICT // ACCESS_GRANTED"
        title="WEBSITES_AND_APPS"
        chips={
          <>
            <Tip label="PROJECTS LISTED" side="bottom">
              <span className="accent-border accent-text accent-bg-soft flex items-center gap-2 border px-2.5 py-1.5">
                <AppWindow size={13} aria-hidden /> PROJECTS: {PROJECTS.length}
              </span>
            </Tip>
            <Tip label="ONLINE RIGHT NOW" side="bottom">
              <span className="flex items-center gap-2 border border-matrix/30 bg-matrix/5 px-2.5 py-1.5 text-matrix">
                <Radio size={13} aria-hidden /> LIVE: {LIVE}
              </span>
            </Tip>
          </>
        }
      >
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/55">
          Websites and apps I have made. These are personal projects. Each card links to the live version.
        </p>
      </SectorHeader>

      <CardStage label={`DEPLOYMENTS // ${PROJECTS.length} INDEXED`} fig="FIG.02 — WEBSITES_AND_APPS">
        {PROJECTS.map((p, i) => (
          <ProjectCard
            key={p.id}
            project={p}
            index={i}
            featured={PROJECTS.length === 1}
            writeup={getWriteupFor('project', p.id)}
            onOpenWriteup={openWriteup}
          />
        ))}
      </CardStage>

      <p className="mt-4 text-center font-ui text-[11px] track-20 text-white/30">
        [ VISIT OPENS THE SITE IN A NEW TAB · ESC TO RETURN ]
      </p>
    </motion.main>
  );
}
