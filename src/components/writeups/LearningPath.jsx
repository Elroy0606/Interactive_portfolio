import { motion } from 'framer-motion';
import { ChevronRight, MousePointerClick, Route } from 'lucide-react';
import { useMotion } from '../../theme/motion';
import { sfx } from '../../lib/sound';

const pad = (n) => String(n).padStart(2, '0');
// "SOC L1 Alert Triage: TryHackMe Notes" -> "SOC L1 Alert Triage"
const short = (title) => title.split(':')[0];

// The reports of a category that have a `part`, drawn as a numbered path,
// ending in a dashed "more to come" stop. Each stop opens its report.
export default function LearningPath({ label, writeups, onOpen }) {
  const { itemProps } = useMotion();
  const steps = writeups.filter((w) => w.part);
  if (steps.length < 2) return null;
  const stops = [...steps, null];

  return (
    <nav aria-label="Learning path" className="mt-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p className="flex items-center gap-2 font-ui text-[10px] track-25 text-white/50">
          <Route size={12} aria-hidden className="accent-text" /> {label}
        </p>
        <p className="hint">
          <MousePointerClick size={12} aria-hidden /> CLICK A ROOM TO OPEN IT
        </p>
      </div>
      <ol className="grid" style={{ gridTemplateColumns: `repeat(${stops.length}, minmax(0, 1fr))` }}>
        {stops.map((w, i) => {
          const last = i === stops.length - 1;
          return (
            <motion.li key={w?.id ?? 'next'} className="relative flex flex-col items-center px-1 text-center" {...itemProps(i)}>
              {!last && (
                <span
                  aria-hidden
                  className={`absolute left-1/2 top-4 h-px w-full ${i === stops.length - 2 ? 'border-t border-dashed border-white/25' : 'bg-[var(--accent)]'}`}
                />
              )}
              {w ? (
                <button
                  type="button"
                  onClick={() => {
                    sfx.open();
                    onOpen(w.id);
                  }}
                  className="group lift relative flex flex-col items-center gap-1.5"
                >
                  <span className="accent-text grid h-8 w-8 place-items-center rounded-full border-2 border-[var(--accent)] bg-panel font-ui text-[11px] font-bold transition-colors group-hover:bg-[color-mix(in_srgb,var(--accent)_20%,var(--color-panel))]">
                    {pad(w.part)}
                  </span>
                  <span className="text-[11px] leading-tight text-white/75 group-hover:text-white sm:text-[12.5px]">{short(w.title)}</span>
                  <span aria-hidden className="accent-text flex items-center font-ui text-[9px] font-bold tracking-widest opacity-60 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    OPEN <ChevronRight size={11} className="cta-arrow" />
                  </span>
                </button>
              ) : (
                <div className="relative flex flex-col items-center gap-1.5">
                  <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-dashed border-white/25 bg-panel font-ui text-[11px] text-white/45">
                    ··
                  </span>
                  <span className="font-ui text-[10px] leading-tight tracking-widest text-white/45">NEXT_ROOM</span>
                </div>
              )}
            </motion.li>
          );
        })}
      </ol>
    </nav>
  );
}
