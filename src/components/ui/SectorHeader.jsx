import { ArrowLeft } from 'lucide-react';
import GlitchText from './GlitchText';
import { sfx } from '../../lib/sound';

// Page header shared by the card-based sectors (02 and 04): return button,
// eyebrow line, glitch title, intro text and stat chips on the right.
// The title colour follows the `--accent` CSS var of an ancestor.
export default function SectorHeader({ backLabel, onBack, backRef, eyebrow, title, chips, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <button
          ref={backRef}
          type="button"
          className="btn-cyber mb-4"
          onClick={() => {
            sfx.click();
            onBack();
          }}
        >
          <ArrowLeft size={14} aria-hidden /> {backLabel}
        </button>
        <p className="font-ui text-xs track-30 text-matrix">{eyebrow}</p>
        <h1 className="accent-text text-glow mt-1 break-words font-ui text-xl font-bold leading-tight sm:text-4xl">
          <GlitchText auto>{title}</GlitchText>
        </h1>
        {children}
      </div>
      {chips && <div className="flex flex-wrap gap-2 font-ui text-[11px] tracking-widest">{chips}</div>}
    </div>
  );
}
