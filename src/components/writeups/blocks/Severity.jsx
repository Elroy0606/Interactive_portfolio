import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { SEVERITY } from '../../../data/dossiers';
import { useMotion } from '../../../theme/motion';
import { Badge, Frame, TONE, mix } from './shared';

// ```severity
// title: Optional heading
// caption: Optional note under the ladder
// Critical | Optional note
// High
// Medium
// Low
// ```
// A priority ladder, first row = picked first. Colours are the Sector 03
// SEVERITY colours, so a level looks the same everywhere on the site.
export default function Severity({ meta, rows }) {
  const { revealProps } = useMotion();
  return (
    <Frame kind="PRIORITY" title={meta.title} caption={meta.caption}>
      <div className="flex gap-3">
        <div aria-hidden className="flex flex-col items-center gap-1 pt-1 font-ui text-[9px] track-20 text-white/45">
          <span>FIRST</span>
          <span className="w-px flex-1 bg-white/15" />
          <ArrowDown size={12} />
          <span>LAST</span>
        </div>
        <ol className="flex-1 space-y-2">
          {rows.map(([level, note], i) => {
            const color = SEVERITY[level.toUpperCase()]?.color ?? TONE.accent;
            const width = `${100 - (i * 60) / Math.max(rows.length - 1, 1)}%`;
            return (
              <motion.li key={i} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3" {...revealProps(i)}>
                <div className="w-full sm:w-2/5">
                  <div
                    className="flex h-8 items-center border-l-4 px-2"
                    style={{ width, borderLeftColor: color, backgroundColor: mix(color, 14) }}
                  >
                    <Badge color={color}>{level.toUpperCase()}</Badge>
                  </div>
                </div>
                {note && <p className="flex-1 text-[13px] leading-snug text-white/75">{note}</p>}
              </motion.li>
            );
          })}
        </ol>
      </div>
    </Frame>
  );
}
