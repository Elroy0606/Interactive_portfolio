import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import GlitchText from '../ui/GlitchText';
import { cn } from '../../lib/cn';
import { sfx } from '../../lib/sound';

const spring = { stiffness: 140, damping: 16 };

// Folder states. `rest` takes the sibling shift as `custom` so neighbours glide
// aside while one folder is hovered; children (papers, front flap) pick up the
// same variant names automatically.
// `lively` is the theme's `tilt` motion token: without it the folder only lifts
// a little and the papers peek out, with no 3D rotation.
const folderVariants = (lively) => ({
  rest: (shift) => ({ x: shift, y: 0, scale: 1 }),
  hover: lively ? { x: 0, y: -16, scale: 1.04 } : { x: 0, y: -6, scale: 1 },
});
const paperVariants = (i, lively) => ({
  rest: { y: 0, rotate: (i - 1) * 1.5 },
  hover: lively ? { y: -(46 - i * 13), rotate: (i - 1) * 3 } : { y: -(18 - i * 5), rotate: (i - 1) * 1.5 },
});
const flapVariants = (lively) => ({
  rest: { rotateX: 0 },
  hover: { rotateX: lively ? -17 : 0 },
});

// A futuristic dossier folder. Hover: glides up, the front flap tilts open, the
// papers slide out, neighbours shift aside, a holographic sheen follows the
// pointer and the folder tilts toward it.
// `wrapRef` registers the (untransformed) wrapper so the parent can aim the camera at it.
export default function DossierFolder({ dossier, shift, hovered, dim, lively = true, wrapRef, onHover, onOpen }) {
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const rotateY = useSpring(useTransform(tx, [-0.5, 0.5], lively ? [-8, 8] : [0, 0]), spring);
  const rotateX = useSpring(useTransform(ty, [-0.5, 0.5], lively ? [6, -6] : [0, 0]), spring);

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width;
    const ny = (e.clientY - r.top) / r.height;
    tx.set(nx - 0.5);
    ty.set(ny - 0.5);
    e.currentTarget.style.setProperty('--mx', nx.toFixed(3));
    e.currentTarget.style.setProperty('--my', ny.toFixed(3));
  };
  const onLeave = () => {
    tx.set(0);
    ty.set(0);
    onHover(null);
  };

  const count = dossier.reports.length;

  return (
    <div ref={wrapRef} className={cn('zoomable mx-auto w-full max-w-[360px]', dim && 'is-dim')}>
      <motion.button
        type="button"
        variants={folderVariants(lively)}
        custom={shift}
        initial="rest"
        animate={hovered ? 'hover' : 'rest'}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 210, damping: 20 }}
        style={{
          '--accent': dossier.accent,
          '--led': dossier.accent,
          rotateX,
          rotateY,
          transformPerspective: 900,
          transformStyle: 'preserve-3d',
        }}
        onPointerEnter={() => {
          sfx.hover();
          onHover();
        }}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onFocus={() => onHover()}
        onBlur={() => onHover(null)}
        onClick={() => {
          sfx.open();
          onOpen();
        }}
        aria-label={`Open ${dossier.code}, ${dossier.title}, ${count} reports, clearance ${dossier.clearance}`}
        className="group/folder relative mt-14 block aspect-[4/3.3] w-full text-left"
      >
        {/* back plate + tab */}
        <div className="accent-border absolute inset-x-0 bottom-0 top-[12%] border bg-paper shadow-[0_0_30px_color-mix(in_srgb,var(--glow-accent)_18%,transparent)] transition-shadow duration-300 group-hover/folder:shadow-[0_0_46px_color-mix(in_srgb,var(--glow-accent)_45%,transparent)]" />
        {/* z-[5]: above the papers (z 0-2) so they slide out behind the tab, below the front flap (z 10) */}
        <div className="accent-border accent-text absolute left-0 top-0 z-[5] flex h-[13%] w-[42%] items-center border border-b-0 bg-paper pl-3 font-ui text-[10px] track-25 [clip-path:polygon(0_0,88%_0,100%_100%,0_100%)]">
          {dossier.code}
        </div>

        {/* papers slide out on hover */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            aria-hidden
            variants={paperVariants(i, lively)}
            className="absolute inset-x-[7%] top-[18%] h-[58%] border border-white/15 bg-sheet p-3"
            style={{ zIndex: i }}
          >
            <div className="space-y-1.5">
              {[70, 92, 55, 80].map((w, k) => (
                <div key={k} className="h-[3px] bg-white/10" style={{ width: `${w - i * 6}%` }} />
              ))}
            </div>
          </motion.div>
        ))}

        {/* front flap */}
        <motion.div
          variants={flapVariants(lively)}
          style={{ transformOrigin: '50% 100%', zIndex: 10 }}
          className="accent-border accent-glow absolute inset-x-0 bottom-0 h-[64%] overflow-hidden border bg-folder/95 p-4"
        >
          <div aria-hidden className="folder-lines pointer-events-none absolute inset-0" />
          <div
            aria-hidden
            className="holo pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/folder:opacity-80 group-focus-visible/folder:opacity-80"
          />

          <div className="relative flex h-full flex-col">
            <div className="flex items-start justify-between font-ui text-[10px] track-20">
              <span className="text-white/45">CLEARANCE {dossier.clearance}</span>
              <span className="accent-text flex items-center gap-1.5">
                <span className="led" aria-hidden /> SEALED
              </span>
            </div>

            <h2 className="accent-text text-glow mt-3 break-words font-ui text-lg font-bold leading-tight tracking-wide sm:text-xl">
              <GlitchText>{dossier.title}</GlitchText>
            </h2>
            <p className="mt-1 text-[12.5px] leading-snug text-white/50">{dossier.blurb}</p>

            <div className="mt-auto flex items-end justify-between font-ui text-[11px] tracking-widest">
              <span className="text-white/60">
                {String(count).padStart(2, '0')} FILES
              </span>
              <span className="accent-text flex items-center transition-[gap] group-hover/folder:gap-1">
                OPEN <ChevronRight size={13} aria-hidden />
              </span>
            </div>

            <span
              aria-hidden
              className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 -rotate-12 border-2 border-current px-2 py-0.5 font-ui text-xs font-bold track-30 opacity-[0.12]"
              style={{ color: dossier.accent }}
            >
              CLASSIFIED
            </span>
          </div>
        </motion.div>
      </motion.button>
    </div>
  );
}
