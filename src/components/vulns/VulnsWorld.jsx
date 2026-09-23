import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Folder, FileText } from 'lucide-react';
import { useApp, DOSSIER_MS, ZOOM } from '../../state/AppContext';
import { ARCHIVE, DOSSIERS, REPORT_COUNT, getDossier, getReport } from '../../data/dossiers';
import GlitchText from '../ui/GlitchText';
import Tip from '../ui/Tip';
import DossierGrid from './DossierGrid';
import DossierArchive from './DossierArchive';
import ReportViewer from './ReportViewer';
import { cn } from '../../lib/cn';
import { sfx } from '../../lib/sound';

// Sector 03 (SEC_OPS_GRID / VULN_REPORTS).
// Navigation layers, each reversible:
//   folder shelf  --click folder-->  archive (mini report icons)  --click icon-->  report viewer
// State lives in the app reducer (dossier phase, activeDossierId, activeReportId);
// this component schedules the phase timers, keeps the camera pose and owns Esc.
export default function VulnsWorld() {
  const { state, dispatch } = useApp();
  const { dossier: phase, activeDossierId, activeReportId } = state;
  const [pose, setPose] = useState(null); // camera pose captured at folder click, reused for the reverse zoom

  const dossier = getDossier(activeDossierId);
  const report = getReport(activeReportId);
  const inside = phase === ZOOM.INSIDE && dossier;

  // Phase timers: the camera animation lives in DossierGrid, the hand-off lives here.
  useEffect(() => {
    if (phase === ZOOM.ENTERING) {
      const t = setTimeout(() => dispatch({ type: 'DOSSIER_ENTERED' }), DOSSIER_MS.entering);
      return () => clearTimeout(t);
    }
    if (phase === ZOOM.EXITING) {
      const t = setTimeout(() => dispatch({ type: 'DOSSIER_EXITED' }), DOSSIER_MS.exiting);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [phase, dispatch]);

  // Esc backs out one layer at a time: report -> dossier -> hub.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (activeReportId) {
        sfx.close();
        dispatch({ type: 'REPORT_CLOSE' });
      } else if (phase === ZOOM.INSIDE) {
        sfx.close();
        dispatch({ type: 'DOSSIER_EXIT' });
      } else if (phase === ZOOM.NONE) {
        dispatch({ type: 'RETURN_TO_HUB' });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeReportId, phase, dispatch]);

  const openDossier = useCallback(
    (id, nextPose) => {
      setPose(nextPose);
      dispatch({ type: 'DOSSIER_START', id });
    },
    [dispatch],
  );
  const closeDossier = useCallback(() => dispatch({ type: 'DOSSIER_EXIT' }), [dispatch]);
  const openReport = useCallback((id) => dispatch({ type: 'REPORT_OPEN', id }), [dispatch]);
  const closeReport = useCallback(() => dispatch({ type: 'REPORT_CLOSE' }), [dispatch]);

  return (
    <motion.main
      key="vulns"
      className="mx-auto max-w-[1600px] px-4 pb-16 pt-6 sm:px-8 sm:pt-8"
      // camera push-in from the hub. opacity/scale only: a filter or clip-path here would re-anchor the fixed report viewer
      initial={{ opacity: 0, scale: 1.12 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {!inside && (
        <div
          className={cn(
            'mb-6 flex flex-wrap items-start justify-between gap-4 transition-opacity duration-500',
            phase === ZOOM.ENTERING && 'pointer-events-none opacity-0',
          )}
        >
          <div className="min-w-0">
            <button
              type="button"
              className="btn-cyber mb-4"
              onClick={() => {
                sfx.click();
                dispatch({ type: 'RETURN_TO_HUB' });
              }}
            >
              <ArrowLeft size={14} aria-hidden /> [RETURN_TO_SECTOR_HUB]
            </button>
            <p className="font-mono text-xs tracking-[0.3em] text-matrix">[SECTOR 03] // SEC_OPS_GRID // SECURE_ACCESS</p>
            <h1 className="mt-1 break-words font-mono text-xl font-bold leading-tight text-matrix text-glow sm:text-4xl">
              <GlitchText auto>{ARCHIVE.code}</GlitchText>
            </h1>
            <p className="mt-2 max-w-xl text-sm text-white/55">{ARCHIVE.blurb}</p>
          </div>

          <div className="flex flex-wrap gap-2 font-mono text-[11px] tracking-widest">
            <Tip label="DOSSIER FOLDERS" side="bottom">
              <span className="flex items-center gap-2 border border-matrix/30 bg-matrix/5 px-2.5 py-1.5 text-matrix">
                <Folder size={13} aria-hidden /> FOLDERS: {DOSSIERS.length}
              </span>
            </Tip>
            <Tip label="REPORTS IN THE ARCHIVE" side="bottom">
              <span className="flex items-center gap-2 border border-cyber/30 bg-cyber/5 px-2.5 py-1.5 text-cyber">
                <FileText size={13} aria-hidden /> REPORTS: {REPORT_COUNT}
              </span>
            </Tip>
          </div>
        </div>
      )}

      {inside ? (
        <DossierArchive key={dossier.id} dossier={dossier} onClose={closeDossier} onOpenReport={openReport} />
      ) : (
        <DossierGrid phase={phase} pose={pose} activeId={activeDossierId} onOpen={openDossier} />
      )}

      {phase === ZOOM.NONE && (
        <p className="mt-4 text-center font-mono text-[11px] tracking-[0.2em] text-white/30">
          [ HOVER A FOLDER TO PEEK · CLICK TO OPEN · ESC TO RETURN ]
        </p>
      )}

      {/* Sibling of the scaled sections so no ancestor has a persistent transform */}
      <AnimatePresence>{report && <ReportViewer key={report.id} report={report} onClose={closeReport} />}</AnimatePresence>
    </motion.main>
  );
}
