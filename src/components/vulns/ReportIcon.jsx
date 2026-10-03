import { motion } from 'framer-motion';
import { SEVERITY } from '../../data/dossiers';
import { sfx } from '../../lib/sound';
import { useMotion } from '../../theme/motion';

// Miniature document-page icon for one report. The thumbnail carries the
// `layoutId` that the viewer panel shares, so opening a report morphs this
// thumbnail into the full reader.
export default function ReportIcon({ report, index, accent, onOpen }) {
  const sev = SEVERITY[report.severity];
  const { morph } = useMotion();
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.07, duration: 0.4 }}
      onPointerEnter={() => sfx.hover()}
      onClick={() => {
        sfx.open();
        onOpen(report.id);
      }}
      aria-label={`Open report ${report.file}: ${report.title}, severity ${report.severity}`}
      style={{ '--accent': sev.color }}
      className="group/doc block w-full text-left"
    >
      <motion.div
        layoutId={morph ? `rpt-${report.id}` : undefined}
        className="accent-border relative aspect-[3/4] overflow-hidden border bg-folder shadow-[0_0_18px_color-mix(in_srgb,var(--glow-accent)_16%,transparent)] transition-[translate,box-shadow,border-color] duration-200 group-hover/doc:-translate-y-1.5 group-hover/doc:border-[var(--accent)] group-hover/doc:shadow-[0_0_28px_color-mix(in_srgb,var(--glow-accent)_45%,transparent)] group-focus-visible/doc:-translate-y-1.5"
        style={{ borderRadius: 2 }}
      >
        <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: sev.color, boxShadow: '0 0 10px var(--glow-accent)' }} />
        <div className="flex items-center justify-between px-2.5 pt-3.5 font-ui text-[8px] track-20">
          <span className="border border-white/20 px-1 text-white/60">{report.pdf ? 'PDF' : 'DOC'}</span>
          <span style={{ color: sev.color }}>{report.severity}</span>
        </div>
        <div aria-hidden className="mt-3 space-y-[5px] px-2.5">
          <div className="h-[5px] w-4/5 bg-white/25" />
          {[92, 70, 88, 60, 80, 45, 90, 66].map((w, i) => (
            <div key={i} className="h-[3px] bg-white/10" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="absolute inset-x-2.5 bottom-2 flex items-end justify-between font-ui text-[8px] tracking-widest text-white/40">
          <span>{report.id.toUpperCase()}</span>
          <span>{report.cwe}</span>
        </div>
        {/* folded corner */}
        <div aria-hidden className="absolute right-0 top-0 h-4 w-4 bg-void [clip-path:polygon(0_0,100%_100%,0_100%)]" />
        {/* hover scan */}
        <div
          aria-hidden
          className="holo pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/doc:opacity-60"
        />
      </motion.div>

      <div className="mt-2.5">
        <div className="text-[13px] font-medium leading-snug text-white/85 transition-colors group-hover/doc:text-white">{report.title}</div>
        <div className="mt-1 font-ui text-[10px] tracking-widest text-white/35">{report.file}</div>
      </div>
    </motion.button>
  );
}
