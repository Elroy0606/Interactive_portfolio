import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useMotion } from '../../../theme/motion';
import { Frame, TONE, mix } from './shared';

// ```fivews
// title: Optional heading
// Who | What it answers
// Why | What it answers | key        <- `key` marks the most important one
// ```
// A row of tiles; pick one to read what it answers.
export default function FiveWs({ meta, rows }) {
  const { revealProps } = useMotion();
  const [sel, setSel] = useState(0);
  const current = rows[sel] ?? rows[0];
  const isKey = (r) => /^key$/i.test(r[2] ?? '');

  return (
    <Frame kind="FIVE_WS" title={meta.title} caption={meta.caption} hint="SELECT A TILE">
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${rows.length}, minmax(0, 1fr))` }}>
        {rows.map((r, i) => {
          const on = i === sel;
          const color = isKey(r) ? TONE.warn : 'var(--accent)';
          return (
            <motion.button
              key={i}
              type="button"
              aria-pressed={on}
              onClick={() => setSel(i)}
              onMouseEnter={() => setSel(i)}
              onFocus={() => setSel(i)}
              className="press relative flex flex-col items-center gap-1 border px-1 py-3 font-ui"
              style={{
                color,
                borderColor: on ? color : mix(color, 30),
                backgroundColor: on ? mix(color, 14) : 'transparent',
              }}
              {...revealProps(i)}
            >
              {isKey(r) && <Star size={11} aria-hidden className="absolute right-1 top-1" />}
              <span className="text-[10px] tracking-widest opacity-70">{String(i + 1).padStart(2, '0')}</span>
              <span className="text-[11px] font-bold tracking-wide sm:text-base">{r[0].toUpperCase()}</span>
            </motion.button>
          );
        })}
      </div>
      {current && (
        <div aria-live="polite" className="mt-3 min-h-[4.5rem] border border-white/10 bg-panel/80 p-3">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={sel} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
              <p className="flex flex-wrap items-center gap-2 font-ui text-[12px] font-bold tracking-widest" style={{ color: isKey(current) ? TONE.warn : 'var(--accent)' }}>
                {current[0].toUpperCase()}
                {isKey(current) && <span className="text-[10px] font-normal">// THE MOST IMPORTANT ONE</span>}
              </p>
              <p className="mt-1 text-[14px] leading-relaxed text-white/85">{current[1]}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </Frame>
  );
}
