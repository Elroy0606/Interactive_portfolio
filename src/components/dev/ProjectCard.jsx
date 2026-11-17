import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, ChevronRight, CodeXml, FileText, ImageOff } from 'lucide-react';
import { KINDS, STATUS } from '../../data/projects';
import CornerBrackets from '../ui/CornerBrackets';
import GlitchText from '../ui/GlitchText';
import { CARD_WIDTH } from '../ui/CardStage';
import { cn } from '../../lib/cn';
import { sfx } from '../../lib/sound';
import { useMotion } from '../../theme/motion';

const pad = (n) => String(n).padStart(2, '0');
const hostOf = (url) => {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
};

// Reminder for a field left empty in data/projects.js. Dev server only: the
// live site simply leaves the line out.
function Todo({ field }) {
  if (!import.meta.env.DEV) return null;
  return (
    <p className="mt-3 border border-dashed border-warn/50 px-2 py-1 font-ui text-[10px] tracking-widest text-warn">
      TODO: {field} in src/data/projects.js (this note only shows in dev)
    </p>
  );
}

// The preview image. With a live URL it is a link into the app: hover / focus
// zooms the image, firms up the glass frame and runs a shine across it.
// Night also runs a slow idle scan line (.thumb-scan, paused in Dim / Day).
function Preview({ project, revealDelay, revealDur, reduce }) {
  const img = (
    <>
      {/* frosted copy fills the frame when the box is not 16:9 */}
      <img src={project.thumbnailUrl} alt="" aria-hidden loading="lazy" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-xl" />
      <img
        src={project.thumbnailUrl}
        alt={project.thumbnailAlt || `Preview of ${project.name}`}
        loading="lazy"
        className="thumb-img relative h-full w-full object-contain object-center"
      />
      <span aria-hidden className="thumb-glass pointer-events-none absolute inset-0" />
      <span aria-hidden className="thumb-scan pointer-events-none absolute inset-x-0 top-0 h-px" />
      <span aria-hidden className="thumb-shine pointer-events-none absolute inset-y-0 left-0 w-1/3" />
      {/* "decrypt" wipe: an accent panel that slides off the image once, on entrance */}
      {!reduce && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 origin-bottom border-b-2"
          style={{ background: 'color-mix(in srgb, var(--accent) 22%, var(--color-void))', borderColor: 'var(--accent)' }}
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          transition={{ duration: revealDur, delay: revealDelay, ease: [0.65, 0, 0.35, 1] }}
        />
      )}
    </>
  );

  if (!project.url) return <div className="absolute inset-0 overflow-hidden">{img}</div>;
  return (
    <a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className="thumb-link absolute inset-0 block overflow-hidden"
      onClick={() => sfx.click()}
    >
      {img}
      <span className="thumb-chip accent-text accent-border absolute bottom-3 right-3 flex items-center gap-1.5 border bg-void/70 px-2 py-1 font-ui text-[10px] tracking-widest backdrop-blur-md">
        OPEN <ArrowUpRight size={12} aria-hidden />
        <span className="sr-only">{project.name} (opens in a new tab)</span>
      </span>
    </a>
  );
}

// One website / app: preview on top, details below. `featured` (used when it
// is the only project in its folder) lays it out wide, preview beside details.
// `width` overrides the card width class (DevDistrict sizes cards by count).
export default function ProjectCard({ project, index, featured = false, width, writeup, onOpenWriteup, onOpenCaseStudy }) {
  const { reveal } = useMotion();
  const reduce = useReducedMotion();
  const status = STATUS[project.status] ?? { color: 'var(--color-body)', led: false };
  const kind = KINDS.find((k) => k.id === project.kind) ?? KINDS[0];
  const cta = project.cta ?? kind.cta;

  // Entrance, from the theme's reveal tokens (calm and quick in Dim / Day, none with reduced motion).
  const delay = index * reveal.stagger * 2;
  const rise = reduce ? { initial: false } : { initial: { opacity: 0, y: reveal.y * 2 }, animate: { opacity: 1, y: 0 }, transition: { duration: reveal.duration * 1.5, delay, ease: [0.22, 1, 0.36, 1] } };
  const chipIn = (i) =>
    reduce ? { initial: false } : { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, transition: { duration: reveal.duration, delay: delay + reveal.duration + i * reveal.stagger * 0.6 } };
  const hasFooter = (project.caseStudy && onOpenCaseStudy) || writeup || project.url;

  return (
    <motion.li className={cn('flex', featured ? 'w-full max-w-4xl' : (width ?? CARD_WIDTH))} {...rise}>
      <article
        aria-labelledby={`project-${project.id}`}
        className={cn('group accent-border relative flex w-full flex-col border bg-panel/90 backdrop-blur-sm', featured && 'md:flex-row')}
      >
        <span className="accent-text">
          <CornerBrackets />
        </span>

        {/* preview */}
        <div className={cn('relative aspect-video shrink-0 overflow-hidden border-white/10', featured ? 'border-b md:w-[55%] md:border-b-0 md:border-r' : 'border-b')}>
          {project.thumbnailUrl ? (
            <Preview project={project} revealDelay={delay + reveal.duration * 0.5} revealDur={reveal.duration * 2} reduce={reduce} />
          ) : (
            <div
              role="img"
              aria-label={`No preview image for ${project.name} yet`}
              className="blueprint-grid flex h-full w-full flex-col items-center justify-center gap-2 font-ui"
            >
              <div aria-hidden className="hatch pointer-events-none absolute inset-0" />
              <ImageOff size={28} strokeWidth={1.25} className="accent-text relative opacity-70" aria-hidden />
              <span className="accent-text relative text-[11px] track-30">PREVIEW_PENDING</span>
              <span className="relative text-[10px] track-20 text-white/35">NO SCREENSHOT CAPTURED YET</span>
            </div>
          )}
        </div>

        {/* details */}
        <div className="relative flex min-w-0 flex-1 flex-col p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <span className="font-ui text-[11px] track-25 text-white/45">[{kind.item} {pad(index + 1)}]</span>
            <span
              className="flex items-center gap-1.5 border px-2 py-0.5 font-ui text-[10px] tracking-widest"
              style={{ color: status.color, borderColor: `color-mix(in srgb, ${status.color} 50%, transparent)`, backgroundColor: `color-mix(in srgb, ${status.color} 10%, transparent)`, '--led': status.color }}
            >
              {status.led && <span className="led" aria-hidden />}
              <span className="sr-only">Status: </span>
              {project.status.toUpperCase()}
            </span>
          </div>

          {project.category && <p className="mt-3 font-ui text-[10px] track-25 text-white/50">{project.category.toUpperCase()}</p>}
          <h2 id={`project-${project.id}`} className="accent-text text-glow mt-2 font-ui text-xl font-bold leading-tight tracking-wide sm:text-2xl">
            <GlitchText>{project.name}</GlitchText>
          </h2>

          {project.description ? (
            <p className="mt-3 text-sm leading-relaxed text-white/70">{project.description}</p>
          ) : (
            <Todo field="add a description" />
          )}

          {project.tags.length > 0 ? (
            <ul aria-label="Built with" className="mt-4 flex flex-wrap gap-1.5">
              {project.tags.map((tag, i) => (
                <motion.li key={tag} className="chip-static" {...chipIn(i)}>
                  {tag.toUpperCase()}
                </motion.li>
              ))}
            </ul>
          ) : (
            <Todo field="add the tech tags" />
          )}

          {/* actions: primary buttons, then a footer line (case study / write-up, host) */}
          <div className="mt-auto pt-6">
            <div className="flex flex-wrap gap-3">
              {project.url ? (
                <a href={project.url} target="_blank" rel="noopener noreferrer" className="btn-cyber" onClick={() => sfx.click()}>
                  {cta} <ArrowUpRight size={14} aria-hidden />
                  <span className="sr-only">{project.name} (opens in a new tab)</span>
                </a>
              ) : (
                <span className="font-ui text-xs tracking-widest text-warn/80">LINK_PENDING</span>
              )}
              {project.repo && (
                <a href={project.repo} target="_blank" rel="noopener noreferrer" className="btn-cyber" onClick={() => sfx.click()}>
                  <CodeXml size={14} aria-hidden /> VIEW_SOURCE <ArrowUpRight size={14} aria-hidden />
                  <span className="sr-only">of {project.name} on GitHub (opens in a new tab)</span>
                </a>
              )}
            </div>

            {hasFooter && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-dashed border-white/10 pt-3">
                <div className="flex flex-wrap items-center gap-4">
                  {project.caseStudy && onOpenCaseStudy && (
                    <button
                      type="button"
                      className="link-ui flex items-center gap-1 font-ui text-xs tracking-widest"
                      onClick={() => {
                        sfx.click();
                        onOpenCaseStudy(project.id);
                      }}
                    >
                      CASE_STUDY <ChevronRight size={14} className="cta-arrow" aria-hidden />
                      <span className="sr-only">: {project.name}</span>
                    </button>
                  )}
                  {writeup && (
                    <button
                      type="button"
                      className="link-ui flex items-center gap-1.5 font-ui text-xs tracking-widest"
                      onClick={() => {
                        sfx.click();
                        onOpenWriteup(writeup.id);
                      }}
                    >
                      <FileText size={13} aria-hidden /> {writeup.published ? 'READ_WRITE-UP' : 'WRITE-UP: COMING_SOON'}
                    </button>
                  )}
                </div>
                {project.url && <span className="min-w-0 truncate font-ui text-[11px] text-white/35">{hostOf(project.url)}</span>}
              </div>
            )}
          </div>
        </div>
      </article>
    </motion.li>
  );
}
