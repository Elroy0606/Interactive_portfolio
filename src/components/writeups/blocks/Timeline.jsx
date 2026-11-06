import { motion } from 'framer-motion';
import { useMotion } from '../../../theme/motion';
import { Frame, tone } from './shared';

// ```timeline
// title: Optional heading
// 08:00 | What happened | optional tone (info, warn, danger, ...)
// 08:32 | Still going | danger live      <- `live` adds a blinking LED
// ```
export default function Timeline({ meta, rows }) {
  const { revealProps } = useMotion();
  return (
    <Frame kind="TIMELINE" title={meta.title} caption={meta.caption}>
      <ol className="relative ml-2 border-l border-white/15">
        {rows.map(([time, text, toneName = ''], i) => {
          const color = tone(toneName.split(' ')[0]);
          const live = /\blive\b/i.test(toneName);
          return (
            <motion.li key={i} className="relative pb-4 pl-5 last:pb-0" {...revealProps(i)}>
              <span
                aria-hidden
                className={`absolute -left-[5px] top-1.5 h-[9px] w-[9px] rounded-full ${live ? 'led' : ''}`}
                style={{ background: color, '--led': color }}
              />
              <time className="font-mono text-[12.5px] font-bold" style={{ color }}>
                {time}
              </time>
              {live && <span className="ml-2 font-ui text-[10px] tracking-widest" style={{ color }}>ONGOING</span>}
              <p className="mt-0.5 text-[14px] leading-snug text-white/85">{text}</p>
            </motion.li>
          );
        })}
      </ol>
    </Frame>
  );
}
