import { motion } from 'framer-motion';
import { ArrowUpRight, FileText, ImageOff } from 'lucide-react';
import { STATUS } from '../../data/projects';
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

// One website / app. `featured` (used when it is the only project) lays the
// card out wide, with the preview beside the details.
export default function ProjectCard({ project, index, featured = false, writeup, onOpenWriteup }) {
  const { itemProps } = useMotion();
  const status = STATUS[project.status] ?? { color: 'var(--color-body)', led: false };

  return (
    <motion.li
      className={cn('flex', featured ? 'w-full max-w-4xl' : CARD_WIDTH)}
      {...itemProps(index)}
    >
      <article
        aria-labelledby={`project-${project.id}`}
        className={cn(
          'group hover-glow accent-border relative flex w-full flex-col border bg-panel/90 backdrop-blur-sm',
          featured && 'md:flex-row',
        )}
      >
        <span className="accent-text">
          <CornerBrackets />
        </span>

        {/* preview */}
        <div className={cn('relative aspect-video shrink-0 overflow-hidden border-white/10', featured ? 'border-b md:w-[55%] md:border-b-0 md:border-r' : 'border-b')}>
          {project.thumbnailUrl ? (
            <img
              src={project.thumbnailUrl}
              alt={project.thumbnailAlt || `Screenshot of ${project.name}`}
              loading="lazy"
              className="h-full w-full object-cover object-top"
            />
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
        <div className="relative flex min-w-0 flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <span className="font-ui text-[11px] track-25 text-white/45">[BUILD {pad(index + 1)}]</span>
            <span
              className="flex items-center gap-1.5 border px-2 py-0.5 font-ui text-[10px] tracking-widest"
              style={{ color: status.color, borderColor: `color-mix(in srgb, ${status.color} 50%, transparent)`, backgroundColor: `color-mix(in srgb, ${status.color} 10%, transparent)`, '--led': status.color }}
            >
              {status.led && <span className="led" aria-hidden />}
              <span className="sr-only">Status: </span>
              {project.status.toUpperCase()}
            </span>
          </div>

          <h2 id={`project-${project.id}`} className="accent-text text-glow mt-3 font-ui text-xl font-bold leading-tight tracking-wide sm:text-2xl">
            <GlitchText>{project.name}</GlitchText>
          </h2>

          {project.description ? (
            <p className="mt-3 text-sm leading-relaxed text-white/70">{project.description}</p>
          ) : (
            <Todo field="add a description" />
          )}

          {project.tags.length > 0 ? (
            <ul aria-label="Built with" className="mt-4 flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <li key={tag} className="border border-white/10 px-1.5 py-0.5 font-ui text-[10px] tracking-widest text-white/55">
                  {tag.toUpperCase()}
                </li>
              ))}
            </ul>
          ) : (
            <Todo field="add the tech tags" />
          )}

          <div className="mt-auto flex flex-wrap items-center gap-3 pt-5">
            {project.url ? (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-cyber"
                onClick={() => sfx.click()}
              >
                VISIT <ArrowUpRight size={14} aria-hidden />
                <span className="sr-only">
                  {project.name} (opens in a new tab)
                </span>
              </a>
            ) : (
              <span className="font-ui text-xs tracking-widest text-warn/80">LINK_PENDING</span>
            )}
            {writeup && (
              <button
                type="button"
                className="flex items-center gap-1.5 font-ui text-xs tracking-widest text-white/55 transition-colors hover:text-cyber"
                onClick={() => {
                  sfx.click();
                  onOpenWriteup(writeup.id);
                }}
              >
                <FileText size={13} aria-hidden /> {writeup.published ? 'READ_WRITE-UP' : 'WRITE-UP: COMING_SOON'}
              </button>
            )}
            {project.url && <span className="min-w-0 truncate font-ui text-[11px] text-white/35">{hostOf(project.url)}</span>}
          </div>
        </div>
      </article>
    </motion.li>
  );
}
