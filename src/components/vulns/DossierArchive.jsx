import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, ShieldCheck } from 'lucide-react';
import GlitchText from '../ui/GlitchText';
import Tip from '../ui/Tip';
import useTerminal from '../../hooks/useTerminal';
import ReportIcon from './ReportIcon';
import { sfx } from '../../lib/sound';

// Inside an opened dossier: a grid of miniature report icons.
export default function DossierArchive({ dossier, onClose, onOpenReport }) {
  const lines = useMemo(
    () => [{ text: `> decrypting ${dossier.code} ... ${dossier.reports.length} files indexed, integrity OK`, pause: 0 }],
    [dossier],
  );
  const { pos } = useTerminal(lines, { speed: 14 });

  return (
    <motion.section
      aria-label={`${dossier.code} archive`}
      style={{ '--accent': dossier.accent, '--led': dossier.accent }}
      initial={{ opacity: 0, scale: 1.06 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
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
            <ArrowLeft size={14} aria-hidden /> [CLOSE_DOSSIER]
          </button>
          <p className="font-mono text-xs tracking-[0.3em] text-matrix">[SECTOR 03 ▸ {dossier.code}] // DECRYPTED</p>
          <h1 className="accent-text text-glow mt-1 break-words font-mono text-2xl font-bold leading-tight sm:text-4xl">
            <GlitchText auto>{dossier.title}</GlitchText>
          </h1>
          <p className="mt-2 min-h-[1.5em] font-mono text-xs text-white/50">
            {lines[0].text.slice(0, pos.i > 0 ? undefined : pos.c)}
            <span className="cursor-block text-cyber" />
          </p>
        </div>

        <div className="flex flex-wrap gap-2 font-mono text-[11px] tracking-widest">
          <Tip label="REPORTS IN THIS DOSSIER" side="bottom">
            <span className="accent-border accent-text accent-bg-soft flex items-center gap-2 border px-2.5 py-1.5">
              <FileText size={13} aria-hidden /> FILES: {dossier.reports.length}
            </span>
          </Tip>
          <Tip label="ACCESS LEVEL REQUIRED" side="bottom">
            <span className="flex items-center gap-2 border border-matrix/30 bg-matrix/5 px-2.5 py-1.5 text-matrix">
              <ShieldCheck size={13} aria-hidden /> CLEARANCE {dossier.clearance}
            </span>
          </Tip>
        </div>
      </div>

      <div className="relative overflow-hidden border accent-border shadow-[0_0_50px_color-mix(in_srgb,var(--accent)_10%,transparent)]">
        <div className="blueprint-grid relative p-4 pb-8 sm:p-8 lg:min-h-[50vh]">
          <div aria-hidden className="pointer-events-none absolute left-3 top-2 font-mono text-[10px] tracking-[0.25em] text-white/35">
            ARCHIVE // {dossier.code}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:grid-cols-5">
            {dossier.reports.map((r, i) => (
              <ReportIcon key={r.id} report={r} index={i} accent={dossier.accent} onOpen={onOpenReport} />
            ))}
          </div>
        </div>
      </div>

      <p className="mt-4 text-center font-mono text-[11px] tracking-[0.2em] text-white/30">
        [ CLICK A REPORT TO OPEN THE READER · ESC TO CLOSE ]
      </p>
    </motion.section>
  );
}
