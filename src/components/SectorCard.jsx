import { motion, useAnimationControls } from 'framer-motion';
import { ChevronRight, Lock } from 'lucide-react';
import CornerBrackets from './ui/CornerBrackets';
import GlitchText from './ui/GlitchText';
import { sfx } from '../lib/sound';
import { useMotion } from '../theme/motion';

export default function SectorCard({ sector, index, onConnect, onDenied, onHover }) {
  const controls = useAnimationControls();
  const { itemProps } = useMotion();
  const Icon = sector.icon;
  const { locked } = sector;

  const handleClick = () => {
    if (locked) {
      sfx.deny();
      controls.start({ x: [0, -9, 9, -6, 6, -2, 0], transition: { duration: 0.4 } });
      onDenied(sector);
    } else {
      sfx.click();
      onConnect(sector);
    }
  };

  return (
    <motion.div className="h-full" {...itemProps(index)}>
      <motion.button
        type="button"
        animate={controls}
        whileHover={locked ? undefined : { y: -4 }}
        onClick={handleClick}
        onMouseEnter={() => {
          sfx.hover();
          onHover(sector);
        }}
        onFocus={() => onHover(sector)}
        aria-disabled={locked}
        aria-label={`Sector ${sector.id}: ${sector.code}, ${locked ? 'locked, coming soon' : 'active'}`}
        style={{ '--accent': sector.accent }}
        className={[
          'group hover-glow relative flex h-full min-h-[280px] w-full flex-col overflow-hidden border p-5 text-left',
          'accent-border bg-panel/80 backdrop-blur-sm',
          locked ? 'cursor-not-allowed' : 'cursor-pointer accent-glow',
        ].join(' ')}
      >
        {locked && <div aria-hidden className="hatch pointer-events-none absolute inset-0" />}
        <span className="accent-text">
          <CornerBrackets />
        </span>

        <div className="relative flex items-start justify-between">
          <span className="font-ui text-[11px] track-25 text-white/45">[SECTOR {sector.id}]</span>
          {locked ? (
            <span className="flex items-center gap-1.5 border border-warn/50 bg-warn/10 px-2 py-0.5 font-ui text-[10px] tracking-widest text-warn">
              <Lock size={10} aria-hidden /> LOCKED
            </span>
          ) : (
            <span className="flex items-center gap-1.5 border border-matrix/50 bg-matrix/10 px-2 py-0.5 font-ui text-[10px] tracking-widest text-matrix">
              <span className="led" aria-hidden /> ACTIVE
            </span>
          )}
        </div>

        <div className="relative mt-5 flex items-center gap-4">
          <div className={`accent-text flex h-14 w-14 shrink-0 items-center justify-center border accent-border accent-bg-soft ${locked ? 'opacity-60' : ''}`}>
            <Icon size={28} strokeWidth={1.5} aria-hidden />
          </div>
          <div className="min-w-0">
            <h2 className={`accent-text font-ui text-lg font-bold leading-tight tracking-wide sm:text-xl ${locked ? 'opacity-80' : 'text-glow'}`}>
              <GlitchText>{sector.code}</GlitchText>
            </h2>
            <p className="mt-0.5 text-sm text-white/60">{sector.label}</p>
          </div>
        </div>

        <p className="relative mt-4 flex-1 text-sm leading-relaxed text-white/55">{sector.blurb}</p>

        <div className="relative mt-4 flex flex-wrap gap-1.5">
          {sector.tags.map((tag) => (
            <span key={tag} className="border border-white/10 px-1.5 py-0.5 font-ui text-[10px] tracking-widest text-white/45">
              {tag}
            </span>
          ))}
        </div>

        <div className="relative mt-4 border-t border-white/10 pt-3 font-ui text-xs tracking-widest">
          {locked ? (
            <span className="text-warn/80">ACCESS_RESTRICTED // COMING_SOON</span>
          ) : (
            <span className="accent-text flex items-center gap-1 transition-[gap] group-hover:gap-2">
              {sector.cta ?? 'INITIATE_CONNECTION'} <ChevronRight size={14} aria-hidden />
            </span>
          )}
        </div>
      </motion.button>
    </motion.div>
  );
}
