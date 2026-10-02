import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, ExternalLink, Hourglass, Link2 } from 'lucide-react';
import SectorHeader from '../ui/SectorHeader';
import CornerBrackets from '../ui/CornerBrackets';
import { FormatBadge, WriteupDate } from './WriteupCard';
import { sfx } from '../../lib/sound';
import { useMotion } from '../../theme/motion';

const Markdown = lazy(() => import('./Markdown'));

const Loading = () => (
  <p className="font-mono text-xs text-white/50">
    &gt; loading report<span className="cursor-block text-cyber" />
  </p>
);

// Markdown report: the text is fetched when the page opens, then rendered.
function Article({ writeup }) {
  const [text, setText] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    writeup
      .load()
      .then((t) => alive && setText(t))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [writeup]);

  return (
    <article className="relative mx-auto max-w-3xl border border-white/10 bg-paper p-5 sm:p-10">
      {failed ? (
        <p role="alert" className="font-mono text-xs text-danger">
          &gt; ERROR: the report could not be loaded. Reload the page to try again.
        </p>
      ) : text === null ? (
        <Loading />
      ) : (
        <Suspense fallback={<Loading />}>
          <Markdown>{text}</Markdown>
        </Suspense>
      )}
      {text !== null && (
        <div className="mt-10 border-t border-white/10 pt-3 font-ui text-[10px] track-20 text-white/30">
          END_OF_DOCUMENT // {writeup.file}
        </div>
      )}
    </article>
  );
}

// PDF report: embedded viewer plus download / new-tab links (phones often
// cannot show an embedded PDF, so the links are always there).
function PdfReport({ writeup }) {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center gap-3 border border-b-0 border-white/10 bg-black/40 px-3 py-2 font-ui text-[11px] tracking-wider">
        <span className="min-w-0 flex-1 truncate text-white/70">{writeup.file}</span>
        <a href={writeup.pdfUrl} download={writeup.file} className="btn-cyber !px-2.5 !py-1" onClick={() => sfx.click()}>
          <Download size={13} aria-hidden /> DOWNLOAD_PDF
        </a>
        <a
          href={writeup.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 border border-white/15 px-2 py-1 text-white/60 hover:border-cyber hover:text-cyber"
        >
          <ExternalLink size={12} aria-hidden /> OPEN_IN_NEW_TAB
        </a>
      </div>
      <iframe title={`${writeup.title} (PDF)`} src={writeup.pdfUrl} className="h-[80vh] w-full border border-white/10 bg-white" />
    </div>
  );
}

function ComingSoon({ writeup }) {
  return (
    <div className="relative mx-auto max-w-2xl overflow-hidden border border-warn/40 bg-panel/90 p-6 text-center sm:p-10">
      <div aria-hidden className="hatch pointer-events-none absolute inset-0" />
      <span className="text-warn">
        <CornerBrackets />
      </span>
      <div className="relative">
        <Hourglass size={30} strokeWidth={1.25} className="mx-auto text-warn" aria-hidden />
        <h2 className="mt-4 font-ui text-lg font-bold track-20 text-warn text-glow">COMING_SOON</h2>
        <p className="mt-1 font-ui text-[11px] track-25 text-white/40">TRANSMISSION_PENDING // FILE NOT PUBLISHED YET</p>
        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-white/70">
          I am still preparing a web-safe version of this report. It will be published here when it is ready.
        </p>
        {import.meta.env.DEV && writeup.awaitingCheck && (
          <p className="mx-auto mt-5 max-w-md border border-dashed border-warn/50 px-2 py-1.5 font-ui text-[10px] leading-relaxed tracking-widest text-warn">
            DEV NOTE: {writeup.file} is in the folder. Check it for private details, then set privacyChecked: true in
            src/data/writeups.js to publish it.
          </p>
        )}
      </div>
    </div>
  );
}

// Detail page for one write-up: header, link to the related project, then the
// report itself (article / PDF) or the coming-soon panel.
export default function WriteupDetail({ writeup, onBack, onOpenRelated }) {
  const backRef = useRef(null);
  const { page } = useMotion();

  useEffect(() => {
    window.scrollTo(0, 0);
    backRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <motion.section
      aria-label={writeup.title}
      {...page}
    >
      <SectorHeader
        backLabel="[BACK_TO_WRITE-UPS]"
        backRef={backRef}
        onBack={onBack}
        eyebrow={`[SECTOR 04 ▸ ${writeup.id.toUpperCase()}] // ${writeup.published ? 'DECRYPTED' : 'PENDING'}`}
        title={writeup.title}
      >
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <FormatBadge writeup={writeup} />
          <WriteupDate date={writeup.date} />
        </div>
        {writeup.summary && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/65">{writeup.summary}</p>}
        {writeup.tags.length > 0 && (
          <ul aria-label="Tags" className="mt-3 flex flex-wrap gap-1.5">
            {writeup.tags.map((tag) => (
              <li key={tag} className="border border-white/10 px-1.5 py-0.5 font-ui text-[10px] tracking-widest text-white/55">
                {tag.toUpperCase()}
              </li>
            ))}
          </ul>
        )}
        {writeup.related && (
          <button
            type="button"
            className="accent-border accent-text accent-bg-soft hover-glow mt-4 flex max-w-full items-center gap-2 border px-2.5 py-1.5 text-left font-ui text-[11px] tracking-wider"
            onClick={() => {
              sfx.click();
              onOpenRelated(writeup.related);
            }}
          >
            <Link2 size={13} className="shrink-0" aria-hidden />
            <span>
              <span className="text-white/45">RELATED_PROJECT ▸ </span>
              {writeup.related.label}
            </span>
          </button>
        )}
      </SectorHeader>

      {writeup.pdfUrl ? <PdfReport writeup={writeup} /> : writeup.load ? <Article writeup={writeup} /> : <ComingSoon writeup={writeup} />}

      <div className="mt-10 flex flex-col items-center gap-4">
        <button
          type="button"
          className="btn-cyber"
          onClick={() => {
            sfx.click();
            onBack();
          }}
        >
          <ArrowLeft size={14} aria-hidden /> [BACK_TO_WRITE-UPS]
        </button>
        <p className="text-center font-ui text-[11px] track-20 text-white/30">[ ESC TO GO BACK ]</p>
      </div>
    </motion.section>
  );
}
