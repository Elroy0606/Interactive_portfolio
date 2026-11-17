import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppWindow, ArrowLeft, Folder, FolderOpen, Radio } from 'lucide-react';
import { useApp, ZOOM } from '../../state/AppContext';
import { KINDS, PROJECTS } from '../../data/projects';
import { getWriteupFor } from '../../data/writeups';
import { backLabel, sectorNumberOfView } from '../../data/tracks';
import SectorHeader from '../ui/SectorHeader';
import CardStage from '../ui/CardStage';
import GlitchText from '../ui/GlitchText';
import Tip from '../ui/Tip';
import DossierGrid from '../vulns/DossierGrid';
import ProjectCard from './ProjectCard';
import CaseStudy from './CaseStudy';
import { useMotion } from '../../theme/motion';
import { cn } from '../../lib/cn';
import { sfx } from '../../lib/sound';

const ACCENT = 'var(--color-id-amber)';
const LIVE = PROJECTS.filter((p) => p.status === 'Live').length;
const pad = (n) => String(n).padStart(2, '0');
// One folder per category that holds a project, in KINDS order. Shaped for the
// shared shelf (vulns/DossierGrid): code / title / blurb / accent / reports.
// Spotlight projects come first in their folder (stable sort keeps the rest in order).
const FOLDERS = KINDS.map((k) => ({
  ...k,
  items: PROJECTS.filter((p) => p.kind === k.id).sort((a, b) => Number(!!b.spotlight) - Number(!!a.spotlight)),
}))
  .filter((k) => k.items.length > 0)
  .map((k, i) => ({ ...k, code: `DIR_${pad(i + 1)}`, title: k.label, reports: k.items }));
const dirOf = (f) => `~/projects/${f.id}s/`;
// Two projects: an even pair side by side (stacked on phones), the same size each.
const PAIR_WIDTH = 'w-full md:w-[calc(50%-0.75rem)] md:max-w-[680px]';

if (import.meta.env.DEV) {
  for (const p of PROJECTS) {
    if (!KINDS.some((k) => k.id === p.kind)) console.warn(`[projects] "${p.id}" has kind "${p.kind}", which is not in KINDS, so it is not shown.`);
  }
}

// An opened category folder: header (close, path, title, blurb), buttons to
// switch to the other folders, then the folder's projects as cards.
function FolderView({ folder, num, onClose, onSwitch, onOpenWriteup, onOpenCaseStudy }) {
  const { subView } = useMotion();
  const live = folder.items.filter((p) => p.status === 'Live').length;

  return (
    <motion.section aria-label={`${folder.label} folder`} style={{ '--accent': folder.accent, '--led': folder.accent }} {...subView}>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <button
            type="button"
            className="btn-cyber mb-4"
            onClick={() => {
              sfx.close();
              onClose();
            }}
          >
            <ArrowLeft size={14} aria-hidden /> [CLOSE_FOLDER]
          </button>
          <p className="font-ui text-xs track-30 text-matrix">
            [SECTOR {num} ▸ {folder.code}] // DIRECTORY_OPEN
          </p>
          <h1 className="accent-text text-glow mt-1 flex items-center gap-3 break-words font-ui text-2xl font-bold leading-tight sm:text-4xl">
            <folder.icon className="h-6 w-6 shrink-0 sm:h-8 sm:w-8" aria-hidden />
            <GlitchText auto>{folder.label.toUpperCase()}</GlitchText>
          </h1>
          <p className="mt-2 font-mono text-xs text-white/50">
            &gt; ls {dirOf(folder)} ... {folder.items.length} {folder.items.length === 1 ? 'project' : 'projects'}, {live} live
          </p>
          {folder.blurb && <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/60">{folder.blurb}</p>}
        </div>

        {FOLDERS.length > 1 && (
          <nav aria-label="Project folders" className="flex flex-wrap gap-2 font-ui text-[11px] tracking-widest">
            {FOLDERS.map((f) => {
              const on = f.id === folder.id;
              const Icon = on ? FolderOpen : Folder;
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-current={on ? 'true' : undefined}
                  disabled={on}
                  onClick={() => {
                    sfx.click();
                    onSwitch(f.id);
                  }}
                  style={{ '--accent': f.accent }}
                  className={cn(
                    'press accent-border flex items-center gap-2 border px-2.5 py-1.5',
                    on ? 'accent-text accent-bg-soft cursor-default' : 'hover-glow text-white/60',
                  )}
                >
                  <Icon size={13} aria-hidden /> {f.label.toUpperCase()}
                  <span className={cn('border px-1 text-[10px]', on ? 'accent-border' : 'border-white/15')}>{f.items.length}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>

      <CardStage label={`${folder.code} // ${folder.items.length} INDEXED`} fig={`FIG.02 — ${folder.code}`}>
        {folder.items.map((p, i) => (
          <ProjectCard
            key={p.id}
            project={p}
            index={i}
            featured={folder.items.length === 1}
            width={folder.items.length === 2 ? PAIR_WIDTH : undefined}
            writeup={getWriteupFor('project', p.id)}
            onOpenWriteup={onOpenWriteup}
            onOpenCaseStudy={onOpenCaseStudy}
          />
        ))}
      </CardStage>

      <p className="mt-4 text-center font-ui text-[11px] track-20 text-white/30">
        [ EACH LINK OPENS IN A NEW TAB · ESC TO CLOSE THE FOLDER ]
      </p>
    </motion.section>
  );
}

// Sector 02 (DEV_DISTRICT): my projects, filed in one folder per category
// (KINDS in data/projects.js: Tools, Games, ...), built like Sector 03:
//   folder shelf --click folder, camera zoom--> folder view (cards)
// The open folder, zoom phase and camera pose are local state. Esc pops one
// layer: folder -> shelf -> track page / hub.
export default function DevDistrict() {
  const { state, dispatch } = useApp();
  const { viewProps, dossier: FOLDER_MS } = useMotion();
  const num = sectorNumberOfView('dev', state.track);
  const [openId, setOpenId] = useState(null);
  const [phase, setPhase] = useState(ZOOM.NONE);
  const [pose, setPose] = useState(null);
  const [caseId, setCaseId] = useState(null); // project whose case study is open
  const caseProject = PROJECTS.find((p) => p.id === caseId && p.caseStudy);
  const folder = FOLDERS.find((f) => f.id === openId);
  const inside = phase === ZOOM.INSIDE && folder;

  // Phase timers (same hand-off as Sectors 03 / 04; the camera animation lives in DossierGrid).
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
  const openWriteup = useCallback((id) => dispatch({ type: 'WRITEUP_OPEN', id }), [dispatch]);
  const openFolder = useCallback((id, nextPose) => {
    setPose(nextPose);
    setOpenId(id);
    setPhase(ZOOM.ENTERING);
  }, []);
  // Switching folder from inside: no pose for the new one, so closing fades back.
  const switchFolder = useCallback((id) => {
    setPose(null);
    setOpenId(id);
  }, []);
  const closeFolder = useCallback(() => setPhase(ZOOM.EXITING), []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (caseId) {
        sfx.close();
        setCaseId(null);
      } else if (phase === ZOOM.INSIDE) {
        sfx.close();
        closeFolder();
      } else if (phase === ZOOM.NONE) {
        toHub();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, caseId, closeFolder, toHub]);

  return (
    <motion.main
      key="dev"
      style={{ '--accent': ACCENT }}
      className="mx-auto max-w-[1600px] px-4 pb-16 pt-6 sm:px-8 sm:pt-8"
      {...viewProps}
    >
      <AnimatePresence mode="wait" initial={false}>
        {inside ? (
          <FolderView
            key="folder"
            folder={folder}
            num={num}
            onClose={closeFolder}
            onSwitch={switchFolder}
            onOpenWriteup={openWriteup}
            onOpenCaseStudy={setCaseId}
          />
        ) : (
          <motion.section
            key="shelf"
            aria-label="Project folders"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className={cn('transition-opacity duration-500', phase === ZOOM.ENTERING && 'pointer-events-none opacity-0')}>
              <SectorHeader
                backLabel={backLabel(state.track)}
                onBack={toHub}
                eyebrow={`[SECTOR ${num}] // DEV_DISTRICT // ACCESS_GRANTED`}
                title="PROJECTS"
                chips={
                  <>
                    <Tip label="FOLDERS AND PROJECTS" side="bottom">
                      <span className="chip-stat accent-border accent-text accent-bg-soft flex items-center gap-2 border px-2.5 py-1.5">
                        <AppWindow size={13} aria-hidden /> FOLDERS: {FOLDERS.length} · PROJECTS: {PROJECTS.length}
                      </span>
                    </Tip>
                    <Tip label="ONLINE RIGHT NOW" side="bottom">
                      <span className="chip-stat flex items-center gap-2 border border-matrix/30 bg-matrix/5 px-2.5 py-1.5 text-matrix">
                        <Radio size={13} aria-hidden /> LIVE: {LIVE}
                      </span>
                    </Tip>
                  </>
                }
              >
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/55">
                  Tools and games I have built, filed by type. These are personal projects. Each one links to the live version.
                </p>
              </SectorHeader>
            </div>

            <DossierGrid
              phase={phase}
              pose={pose}
              activeId={openId}
              onOpen={openFolder}
              folders={FOLDERS}
              frame={{
                left: 'FILESYSTEM // ~/projects',
                right: `${FOLDERS.length} ${FOLDERS.length === 1 ? 'FOLDER' : 'FOLDERS'} · ${PROJECTS.length} PROJECTS`,
                border: 'accent-border',
                label: 'accent-text opacity-70',
              }}
              peek={(f) => `> ls ${dirOf(f)} :: ${f.items.map((p) => p.name).join(', ')}`}
              labelsFor={(f) => ({
                top: `${f.items.filter((p) => p.status === 'Live').length} LIVE`,
                status: 'INDEXED',
                stamp: null,
                count: `${pad(f.items.length)} ${f.items.length === 1 ? 'PROJECT' : 'PROJECTS'}`,
                aria: `Open folder ${f.label}, ${f.items.length} ${f.items.length === 1 ? 'project' : 'projects'}`,
              })}
            />

            {phase === ZOOM.NONE && (
              <p className="mt-4 text-center font-ui text-[11px] track-20 text-white/30">
                [ HOVER A FOLDER TO PEEK · CLICK TO OPEN · ESC TO RETURN ]
              </p>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {caseProject && <CaseStudy key={caseProject.id} project={caseProject} onClose={() => setCaseId(null)} />}
      </AnimatePresence>
    </motion.main>
  );
}
