import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, FileText, Minus, Plus, X } from 'lucide-react';
import { SEVERITY } from '../../data/dossiers';
import { sfx } from '../../lib/sound';

const ZOOMS = [0.85, 1, 1.15, 1.3];

const SECTIONS = [
  ['summary', 'SUMMARY'],
  ['details', 'VULNERABILITY_DETAILS'],
  ['steps', 'STEPS_TO_REPRODUCE'],
  ['impact', 'IMPACT'],
  ['remediation', 'REMEDIATION'],
  ['timeline', 'DISCLOSURE_TIMELINE'],
];

function Heading({ id, n, children }) {
  return (
    <h3 id={id} className="mb-3 mt-9 scroll-mt-4 border-b border-white/10 pb-1.5 font-mono text-[12px] tracking-[0.25em] text-cyber">
      <span className="text-white/35">{String(n).padStart(2, '0')} // </span>
      {children}
    </h3>
  );
}

const Bullets = ({ items }) => (
  <ul className="space-y-2 text-[14.5px] leading-relaxed text-white/75">
    {items.map((t) => (
      <li key={t} className="flex gap-2.5">
        <span className="mt-[2px] shrink-0 font-mono text-xs text-cyber">▸</span>
        <span>{t}</span>
      </li>
    ))}
  </ul>
);

function Meta({ label, children }) {
  return (
    <div className="border border-white/10 bg-black/30 px-3 py-2">
      <div className="font-mono text-[9px] tracking-[0.2em] text-white/35">{label}</div>
      <div className="mt-0.5 font-mono text-[12.5px] text-white/85">{children}</div>
    </div>
  );
}

// Cyberpunk-skinned reader. If `report.pdf` is set the real PDF is embedded,
// otherwise the structured write-up from data/dossiers.js is rendered as a document.
// The panel shares its layoutId with the report's thumbnail (ReportIcon), so it
// expands out of the icon and collapses back into it.
export default function ReportViewer({ report, onClose }) {
  const sev = SEVERITY[report.severity];
  const closeRef = useRef(null);
  const [zoomIdx, setZoomIdx] = useState(1);
  const sample = report.placeholder && !report.pdf;

  useEffect(() => {
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const close = () => {
    sfx.close();
    onClose();
  };
  const zoom = ZOOMS[zoomIdx];

  return (
    <>
      <motion.div
        className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={close}
      />
      <motion.div
        layoutId={`rpt-${report.id}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-title"
        style={{ '--accent': sev.color, borderRadius: 2 }}
        className="accent-border accent-glow fixed inset-2 z-[60] flex flex-col overflow-hidden border bg-[#080a0e] sm:inset-5 lg:inset-x-[10%] lg:inset-y-6"
        transition={{ type: 'spring', damping: 30, stiffness: 240 }}
      >
        {/* Content fades in after the panel has expanded so the morph stays clean. */}
        <motion.div
          className="flex min-h-0 flex-1 flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.28, duration: 0.25 } }}
          exit={{ opacity: 0, transition: { duration: 0.08 } }}
        >
          {/* toolbar */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-white/10 bg-black/40 px-3 py-2 font-mono text-[11px] tracking-wider sm:px-4">
            <FileText size={14} className="text-cyber" aria-hidden />
            <span className="min-w-0 truncate text-white/80">{report.file}</span>
            <span className="border px-1.5 py-0.5 text-[10px] tracking-widest" style={{ color: sev.color, borderColor: `${sev.color}88` }}>
              {report.severity}
            </span>
            {sample && <span className="hidden border border-warn/50 px-1.5 py-0.5 text-[10px] tracking-widest text-warn sm:inline">SAMPLE</span>}

            <div className="ml-auto flex items-center gap-2">
              {!report.pdf && (
                <span className="flex items-center gap-1 text-white/50">
                  <button
                    type="button"
                    aria-label="Zoom out"
                    disabled={zoomIdx === 0}
                    onClick={() => setZoomIdx((z) => Math.max(0, z - 1))}
                    className="border border-white/15 p-1 hover:border-cyber hover:text-cyber disabled:opacity-30"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-10 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
                  <button
                    type="button"
                    aria-label="Zoom in"
                    disabled={zoomIdx === ZOOMS.length - 1}
                    onClick={() => setZoomIdx((z) => Math.min(ZOOMS.length - 1, z + 1))}
                    className="border border-white/15 p-1 hover:border-cyber hover:text-cyber disabled:opacity-30"
                  >
                    <Plus size={12} />
                  </button>
                </span>
              )}
              {report.pdf && (
                <a href={report.pdf} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 border border-white/15 px-2 py-1 text-white/60 hover:border-cyber hover:text-cyber">
                  <ExternalLink size={12} aria-hidden /> OPEN_PDF
                </a>
              )}
              <button ref={closeRef} type="button" onClick={close} className="btn-cyber !px-2.5 !py-1">
                <X size={13} aria-hidden /> [CLOSE_REPORT]
              </button>
            </div>
          </div>

          {report.pdf ? (
            <iframe title={report.title} src={report.pdf} className="min-h-0 flex-1 bg-white" />
          ) : (
            <div className="flex min-h-0 flex-1">
              {/* table of contents */}
              <nav aria-label="Report sections" className="hidden w-52 shrink-0 space-y-1 overflow-y-auto border-r border-white/10 bg-black/30 p-4 font-mono text-[10px] tracking-[0.18em] lg:block">
                <div className="mb-3 text-white/30">// CONTENTS</div>
                {SECTIONS.map(([id, label], i) => (
                  <a key={id} href={`#rpt-${report.id}-${id}`} onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(`rpt-${report.id}-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }} className="block py-1 text-white/50 transition-colors hover:text-cyber">
                    <span className="text-white/25">{String(i + 1).padStart(2, '0')} </span>
                    {label}
                  </a>
                ))}
              </nav>

              <div className="min-w-0 flex-1 overflow-y-auto p-3 sm:p-8">
                <article
                  style={{ zoom }}
                  className="relative mx-auto max-w-3xl overflow-hidden border border-white/10 bg-[#0b0e13] p-5 sm:p-10"
                >
                  {sample && (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute left-1/2 top-[38%] -translate-x-1/2 -rotate-[18deg] whitespace-nowrap border-4 border-warn/20 px-6 py-2 font-mono text-3xl font-bold tracking-[0.3em] text-warn/15 sm:text-5xl"
                    >
                      SAMPLE_DOCUMENT
                    </div>
                  )}

                  <div className="font-mono text-[10px] tracking-[0.25em] text-danger/80">
                    CLASSIFICATION: CONFIDENTIAL // VULNERABILITY_DISCLOSURE
                  </div>
                  <h2 id="report-title" className="mt-2 font-sans text-2xl font-semibold leading-tight text-white sm:text-3xl">
                    {report.title}
                  </h2>

                  <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <Meta label="REPORT_ID">{report.id.toUpperCase()}</Meta>
                    <Meta label="SEVERITY">
                      <span style={{ color: sev.color }}>{report.severity}</span>
                    </Meta>
                    <Meta label="CVSS (SAMPLE)">{report.cvss}</Meta>
                    <Meta label="WEAKNESS">{report.cwe}</Meta>
                    <Meta label="STATUS">{report.status}</Meta>
                    <Meta label="SUBMITTED">{report.date}</Meta>
                    <Meta label="ASSET">
                      <span className="redact px-1" aria-label="redacted">
                        {report.asset}
                      </span>
                    </Meta>
                    <Meta label="PROGRAM">
                      <span className="redact px-1" aria-label="redacted">
                        REDACTED
                      </span>
                    </Meta>
                  </div>

                  <Heading id={`rpt-${report.id}-summary`} n={1}>SUMMARY</Heading>
                  <p className="text-[14.5px] leading-relaxed text-white/75">{report.summary}</p>

                  <Heading id={`rpt-${report.id}-details`} n={2}>VULNERABILITY_DETAILS</Heading>
                  <div className="space-y-3 text-[14.5px] leading-relaxed text-white/75">
                    {report.details.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                  </div>

                  <Heading id={`rpt-${report.id}-steps`} n={3}>STEPS_TO_REPRODUCE</Heading>
                  <ol className="space-y-2 text-[14.5px] leading-relaxed text-white/75">
                    {report.steps.map((s, i) => (
                      <li key={s} className="flex gap-3">
                        <span className="mt-[1px] w-5 shrink-0 font-mono text-xs text-cyber">{String(i + 1).padStart(2, '0')}</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ol>

                  <Heading id={`rpt-${report.id}-impact`} n={4}>IMPACT</Heading>
                  <Bullets items={report.impact} />

                  <Heading id={`rpt-${report.id}-remediation`} n={5}>REMEDIATION</Heading>
                  <Bullets items={report.remediation} />

                  <Heading id={`rpt-${report.id}-timeline`} n={6}>DISCLOSURE_TIMELINE</Heading>
                  <ul className="border border-white/10 font-mono text-[12px]">
                    {report.timeline.map(([d, what]) => (
                      <li key={d + what} className="flex gap-4 border-b border-white/5 px-3 py-1.5 last:border-b-0">
                        <span className="shrink-0 text-cyber">{d}</span>
                        <span className="text-white/65">{what}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-10 border-t border-white/10 pt-3 font-mono text-[10px] tracking-[0.2em] text-white/30">
                    END_OF_DOCUMENT // {report.file}
                  </div>
                </article>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </>
  );
}
