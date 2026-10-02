import { motion } from 'framer-motion';
import { ChevronRight, FileText, Hourglass, ScrollText } from 'lucide-react';
import CornerBrackets from '../ui/CornerBrackets';
import GlitchText from '../ui/GlitchText';
import { CARD_WIDTH } from '../ui/CardStage';
import { cn } from '../../lib/cn';
import { sfx } from '../../lib/sound';
import { useMotion } from '../../theme/motion';

const pad = (n) => String(n).padStart(2, '0');

// Reading format badge: Article (Markdown), PDF, or coming soon while unpublished.
export function FormatBadge({ writeup }) {
  if (!writeup.published) {
    return (
      <span className="flex items-center gap-1.5 border border-warn/50 bg-warn/10 px-2 py-0.5 font-ui text-[10px] tracking-widest text-warn">
        <Hourglass size={10} aria-hidden /> COMING_SOON
      </span>
    );
  }
  const Icon = writeup.format === 'PDF' ? FileText : ScrollText;
  return (
    <span className="accent-border accent-text accent-bg-soft flex items-center gap-1.5 border px-2 py-0.5 font-ui text-[10px] tracking-widest">
      <Icon size={10} aria-hidden />
      <span className="sr-only">Format: </span>
      {writeup.format.toUpperCase()}
    </span>
  );
}

export function WriteupDate({ date }) {
  return date ? (
    <time dateTime={date} className="font-ui text-[11px] tracking-widest text-white/50">
      {date}
    </time>
  ) : (
    <span className="font-ui text-[11px] tracking-widest text-white/35">DATE_PENDING</span>
  );
}

// Index card. The title is the button; its ::after covers the whole card so the
// card is one click / tab target and still has a real heading.
export default function WriteupCard({ writeup, index, single = false, onOpen }) {
  const { itemProps } = useMotion();
  return (
    <motion.li
      className={cn('flex', single ? 'w-full max-w-2xl' : CARD_WIDTH)}
      {...itemProps(index)}
    >
      <article
        className="group hover-glow accent-border relative flex w-full flex-col border bg-panel/90 p-5 backdrop-blur-sm"
        onMouseEnter={() => sfx.hover()}
      >
        {!writeup.published && <div aria-hidden className="hatch pointer-events-none absolute inset-0" />}
        <span className="accent-text">
          <CornerBrackets />
        </span>

        <div className="relative flex items-start justify-between gap-3">
          <span className="font-ui text-[11px] track-25 text-white/45">[DOC {pad(index + 1)}]</span>
          <FormatBadge writeup={writeup} />
        </div>

        <h2 className="accent-text mt-4 font-ui text-lg font-bold leading-snug tracking-wide sm:text-xl">
          <button
            type="button"
            className="text-left after:absolute after:inset-0 after:z-10 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-cyber"
            onClick={() => {
              sfx.open();
              onOpen(writeup.id);
            }}
          >
            <GlitchText>{writeup.title}</GlitchText>
          </button>
        </h2>

        <div className="relative mt-2">
          <WriteupDate date={writeup.date} />
        </div>

        {writeup.summary && <p className="relative mt-3 text-sm leading-relaxed text-white/65">{writeup.summary}</p>}

        {writeup.related && (
          <p className="relative mt-3 font-ui text-[11px] tracking-wider text-white/45">
            PROJECT ▸ <span className="text-white/70">{writeup.related.label}</span>
          </p>
        )}

        {writeup.tags.length > 0 && (
          <ul aria-label="Tags" className="relative mt-4 flex flex-wrap gap-1.5">
            {writeup.tags.map((tag) => (
              <li key={tag} className="border border-white/10 px-1.5 py-0.5 font-ui text-[10px] tracking-widest text-white/55">
                {tag.toUpperCase()}
              </li>
            ))}
          </ul>
        )}

        <div aria-hidden className="relative mt-auto pt-5">
          <div className="border-t border-white/10 pt-3 font-ui text-xs tracking-widest">
            <span className="accent-text flex items-center gap-1 transition-[gap] group-hover:gap-2">
              {writeup.published ? 'OPEN_REPORT' : 'VIEW_STATUS'} <ChevronRight size={14} />
            </span>
          </div>
        </div>
      </article>
    </motion.li>
  );
}
