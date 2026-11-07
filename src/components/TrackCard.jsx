import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import CornerBrackets from './ui/CornerBrackets';
import GlitchText from './ui/GlitchText';
import { sfx } from '../lib/sound';
import { useMotion } from '../theme/motion';
import { TRACK_STATS, sectorsFor } from '../data/tracks';

// One of the two path cards on the home page (Theory / Practical). The whole
// card is the click target; it lists the sectors waiting on that path.
export default function TrackCard({ track, index, onEnter, onHover }) {
  const { itemProps } = useMotion();
  const Icon = track.icon;
  const stations = sectorsFor(track.id);
  const stats = TRACK_STATS[track.id] ?? [];

  return (
    <motion.div className="h-full" {...itemProps(index)}>
      <motion.button
        type="button"
        whileHover={{ y: -4 }}
        onClick={() => {
          sfx.click();
          onEnter(track);
        }}
        onMouseEnter={() => {
          sfx.hover();
          onHover(track);
        }}
        onFocus={() => onHover(track)}
        aria-label={`Track ${track.letter}: ${track.label}, ${track.title}`}
        style={{ '--accent': track.accent }}
        className="group hover-glow accent-border accent-glow relative flex h-full min-h-[320px] w-full cursor-pointer flex-col overflow-hidden border bg-panel/80 p-5 text-left backdrop-blur-sm sm:p-7"
      >
        <span className="accent-text">
          <CornerBrackets />
        </span>

        <div className="relative flex items-start justify-between gap-3">
          <span className="font-ui text-[11px] track-25 text-white/45">[TRACK {track.letter}] // {track.code}</span>
          <span className="shrink-0 whitespace-nowrap border border-matrix/50 bg-matrix/10 px-2 py-0.5 font-ui text-[10px] tracking-widest text-matrix">
            <span className="led mr-1.5" aria-hidden />
            {stations.length} {stations.length === 1 ? 'SECTOR' : 'SECTORS'}
          </span>
        </div>

        <div className="relative mt-6 flex items-center gap-4">
          <div className="accent-text accent-border accent-bg-soft flex h-16 w-16 shrink-0 items-center justify-center border">
            <Icon size={32} strokeWidth={1.5} aria-hidden />
          </div>
          <div className="min-w-0">
            <h2 className="accent-text text-glow font-ui text-2xl font-bold leading-tight tracking-wide sm:text-4xl">
              <GlitchText>{track.label.toUpperCase()}</GlitchText>
            </h2>
            <p className="mt-0.5 text-sm text-white/65 sm:text-base">{track.title}</p>
          </div>
        </div>

        <p className="relative mt-5 max-w-xl text-sm leading-relaxed text-white/60">{track.blurb}</p>

        <ul aria-label="Sectors on this path" className="relative mb-5 mt-5 flex flex-wrap gap-1.5">
          {stations.map((s) => {
            const SIcon = s.icon;
            return (
              <li key={s.id} className="chip-static flex items-center gap-1.5">
                <SIcon size={11} aria-hidden /> {s.id} · {s.label}
              </li>
            );
          })}
        </ul>

        <div className="relative mt-auto flex flex-wrap items-end justify-between gap-3 border-t border-white/10 pt-3 font-ui text-xs tracking-widest">
          <span className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-white/45">
            {stats.map((st) => (
              <span key={st.label}>
                {st.label}: <span className="accent-text">{st.value}</span>
              </span>
            ))}
          </span>
          <span className="accent-text flex items-center gap-1 transition-[gap] group-hover:gap-2">
            {track.cta} <ChevronRight size={14} aria-hidden className="cta-arrow" />
          </span>
        </div>
      </motion.button>
    </motion.div>
  );
}
