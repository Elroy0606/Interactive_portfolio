import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, FileText, Minus, Plus, X } from 'lucide-react';
import { SEVERITY, reportImage } from '../../data/dossiers';
import { sfx } from '../../lib/sound';
import { useMotion } from '../../theme/motion';
import useReadingMode from '../../hooks/useReadingMode';
import ReadingSurface from '../ui/ReadingSurface';

const Markdown = lazy(() => import('../writeups/Markdown'));

const ZOOMS = [0.85, 1, 1.15, 1.3];

function Meta({ label, children, className = '' }) {
  return (
    <div className={`border border-white/10 bg-black/30 px-3 py-2 ${className}`}>
      <div className="font-ui text-[9px] track-20 text-white/35">{label}</div>
      <div className="mt-0.5 font-ui text-[12.5px] text-white/85">{children}</div>
    </div>
  );
}

const Loading = () => (
  <p className="mt-8 font-mono text-xs text-white/50">
    &gt; loading report<span className="cursor-block text-cyber" />
  </p>
);

// The report text (Markdown in src/content/reports/), fetched when the reader opens.
function ReportBody({ report }) {
  const [text, setText] = useState(null);
  const [failed, setFailed] = useState(!report.load);

  useEffect(() => {
    if (!report.load) return undefined;
    let alive = true;
    report
      .load()
      .then((t) => alive && setText(t))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [report]);

  if (failed) {
    return (
      <p role="alert" className="mt-8 font-mono text-xs text-danger">
        &gt; ERROR: the report could not be loaded. Reload the page to try again.
      </p>
    );
  }
  if (text === null) return <Loading />;
  return (
    <div className="mt-8">
      <Suspense fallback={<Loading />}>
        <Markdown resolveImage={reportImage}>{text}</Markdown>
      </Suspense>
    </div>
  );
}

// Cyberpunk-skinned reader. If `report.pdf` is set the PDF is embedded, otherwise
// the report's Markdown file is rendered as a document under a details grid.
// The panel shares its layoutId with the report's thumbnail (ReportIcon), so it
// expands out of the icon and collapses back into it.
export default function ReportViewer({ report, onClose }) {
  const sev = SEVERITY[report.severity];
  const closeRef = useRef(null);
  const { morph } = useMotion();
  const [zoomIdx, setZoomIdx] = useState(1);
  useReadingMode(); // no moving background or CRT overlay while the reader is open (PDF reports too)

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
        className="fixed inset-0 z-50 bg-void/90 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={close}
      />
      <motion.div
        // With the `morph` motion token the panel grows out of the thumbnail; without it, it fades in.
        layoutId={morph ? `rpt-${report.id}` : undefined}
        {...(morph ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } })}
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-title"
        style={{ '--accent': sev.color, borderRadius: 2 }}
        className="accent-border accent-glow fixed inset-2 z-[60] flex flex-col overflow-hidden border bg-shell sm:inset-5 lg:inset-x-[10%] lg:inset-y-6"
        transition={morph ? { type: 'spring', damping: 30, stiffness: 240 } : { duration: 0.15 }}
      >
        {/* Content fades in after the panel has expanded so the morph stays clean. */}
        <motion.div
          className="flex min-h-0 flex-1 flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: morph ? { delay: 0.28, duration: 0.25 } : { duration: 0.12 } }}
          exit={{ opacity: 0, transition: { duration: 0.08 } }}
        >
          {/* toolbar */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-white/10 bg-black/40 px-3 py-2 font-ui text-[11px] tracking-wider sm:px-4">
            <FileText size={14} className="text-cyber" aria-hidden />
            <span className="min-w-0 truncate text-white/80">{report.file}</span>
            <span className="border px-1.5 py-0.5 text-[10px] tracking-widest" style={{ color: sev.color, borderColor: `color-mix(in srgb, ${sev.color} 53.3%, transparent)` }}>
              {report.severity}
            </span>

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
            <>
              <h2 id="report-title" className="sr-only">
                {report.title}
              </h2>
              <iframe title={report.title} src={report.pdf} className="min-h-0 flex-1 bg-white" />
            </>
          ) : (
            <div className="min-w-0 flex-1 overflow-y-auto p-3 sm:p-8">
              <ReadingSurface style={{ zoom }} className="max-w-3xl">
                {report.kind && <div className="font-ui text-[10px] track-25 text-cyber/80">{report.kind}</div>}
                <h2 id="report-title" className="mt-2 font-sans text-2xl font-semibold leading-tight text-white sm:text-3xl">
                  {report.title}
                </h2>

                <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Meta label="REPORT_ID">{report.id.toUpperCase()}</Meta>
                  <Meta label="SEVERITY">
                    <span style={{ color: sev.color }}>{report.severity}</span>
                  </Meta>
                  {report.cwe && <Meta label="WEAKNESS">{report.cwe}</Meta>}
                  {report.cvss && <Meta label="CVSS">{report.cvss}</Meta>}
                  {report.date && <Meta label="DATE">{report.date}</Meta>}
                  {report.status && <Meta label="STATUS" className="col-span-2">{report.status}</Meta>}
                  {report.environment && <Meta label="ENVIRONMENT" className="col-span-2">{report.environment}</Meta>}
                  {report.target && <Meta label="TARGET" className="col-span-2 sm:col-span-4">{report.target}</Meta>}
                </div>

                <ReportBody report={report} />

                <div className="mt-10 border-t border-white/10 pt-3 font-ui text-[10px] track-20 text-white/30">
                  END_OF_DOCUMENT // {report.file}
                </div>
              </ReadingSurface>
            </div>
          )}
        </motion.div>
      </motion.div>
    </>
  );
}
