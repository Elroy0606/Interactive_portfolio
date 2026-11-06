import { motion } from 'framer-motion';
import { useMotion } from '../../../theme/motion';
import { Frame, pad } from './shared';

// ```flow
// title: Optional heading
// Step name | What happens at this step
// ```
// Numbered steps joined by links that carry a moving packet (Night only).
// Left to right from md, top to bottom on phones.
export default function Flow({ meta, rows }) {
  const { revealProps } = useMotion();
  return (
    <Frame kind="FLOW" title={meta.title} caption={meta.caption}>
      <ol className="flex flex-col md:flex-row md:items-stretch">
        {rows.map(([label, text], i) => (
          <motion.li key={i} className="flex flex-col md:min-w-0 md:flex-1 md:flex-row md:items-stretch" {...revealProps(i)}>
            <div className="accent-border relative flex-1 border bg-panel/80 p-3">
              <span className="font-ui text-[10px] track-20 text-white/50">STEP {pad(i + 1)}</span>
              <p className="accent-text mt-1 font-ui text-[13px] font-bold leading-snug">{label}</p>
              {text && <p className="mt-1 text-[13px] leading-snug text-white/75">{text}</p>}
            </div>
            {i < rows.length - 1 && <span aria-hidden className="flow-link md:self-center" style={{ '--flow-delay': `${i * 0.35}s` }} />}
          </motion.li>
        ))}
      </ol>
    </Frame>
  );
}
