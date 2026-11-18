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
// Papers (i = 0 back, 2 front) rise inside the pocket: the flap opens first,
// then the papers follow back to front, and on leave they drop back together.
// `y` is a share of the paper's own height; the highest one still stops below
// the tab, so a paper never crosses the tab or the folder's border.
const RISE = ['-19%', '-19%', '-17%'];
const RISE_CALM = ['-9%', '-9%', '-8%'];
const paperVariants = (i, lively) => ({
  rest: { y: '0%', rotate: (i - 1) * 1.2, transition: { type: 'spring', stiffness: 320, damping: 30 } },
  hover: {
    y: (lively ? RISE : RISE_CALM)[i],
    rotate: (i - 1) * (lively ? 2 : 1.2),
    transition: { type: 'spring', stiffness: 230, damping: 22, delay: 0.06 + (2 - i) * 0.05 },
  },
});
const flapVariants = (lively) => ({
  rest: { rotateX: 0, transition: { type: 'spring', stiffness: 260, damping: 24, delay: 0.05 } },
  hover: { rotateX: lively ? -17 : 0, transition: { type: 'spring', stiffness: 210, damping: 20 } },
});
// Depth of each layer inside the tilting (preserve-3d) folder. In a 3D context
// the browser ignores z-index and sorts by real depth, so layers left on the
// same plane fight: the papers used to draw through the flap and the cursor
// flickered between them. Small steps keep the perspective scaling under 1px.
const DEPTH = { pocket: 'translateZ(1px)', flap: 2 };

// A futuristic dossier folder. Hover: glides up, the front flap tilts open, the
// papers slide out, neighbours shift aside, a holographic sheen follows the
// pointer and the folder tilts toward it.
// `wrapRef` registers the (untransformed) wrapper so the parent can aim the camera at it.
// `labels` overrides the dossier wording, so Sector 03 can reuse the folder:
//   { top, status, stamp (null = none), aria, count, cta }. Default: clearance / SEALED /
//   CLASSIFIED / "NN FILES" / OPEN. The track page uses it for the sector folders.
// `compact` (one-row track shelf): narrow folders keep enough height for the flap text.
export default function DossierFolder({ dossier, shift, hovered, dim, lively = true, labels, wrapRef, onHover, onOpen, compact = false }) {
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
  const L = {
    top: `CLEARANCE ${dossier.clearance}`,
    status: 'SEALED',
    stamp: 'CLASSIFIED',
    aria: `Open ${dossier.code}, ${dossier.title}, ${count} reports, clearance ${dossier.clearance}`,
    count: `${String(count).padStart(2, '0')} FILES`,
    cta: 'OPEN',
    ...labels,
  };

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
        aria-label={L.aria}
        className={cn('group/folder relative mt-14 block aspect-[4/3.3] w-full text-left', compact && 'min-h-[17.5rem]')}
      >
        {/* back plate + tab */}
        <div className="accent-border absolute inset-x-0 bottom-0 top-[12%] border bg-paper shadow-[0_0_30px_color-mix(in_srgb,var(--glow-accent)_18%,transparent)] transition-shadow duration-300 group-hover/folder:shadow-[0_0_46px_color-mix(in_srgb,var(--glow-accent)_45%,transparent)]" />
        {/* the tab belongs to the back plate (depth 0); the papers' pocket starts below it */}
        <div className="accent-border accent-text absolute left-0 top-0 z-[5] flex h-[13%] w-[42%] items-center border border-b-0 bg-paper pl-3 font-ui text-[10px] track-25 [clip-path:polygon(0_0,88%_0,100%_100%,0_100%)]">
          {dossier.code}
        </div>

        {/* the pocket: the inside of the folder, between the back plate and the flap.
            It clips the papers to the folder's inner edge (overflow-hidden also keeps
            them flat, so their z-index order holds) and does not take the pointer. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-px bottom-px top-[calc(13%+1px)] z-[6] overflow-hidden"
          style={{ transform: DEPTH.pocket }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              variants={paperVariants(i, lively)}
              className="absolute inset-x-[7%] h-[64%] border border-white/15 bg-sheet p-3"
              style={{ zIndex: i, top: `${14 + i * 4}%` }}
            >
              <div className="space-y-1.5">
                {[70, 92, 55, 80].map((w, k) => (
                  <div key={k} className="h-[3px] bg-white/10" style={{ width: `${w - i * 6}%` }} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* front flap */}
        <motion.div
          variants={flapVariants(lively)}
          style={{ transformOrigin: '50% 100%', zIndex: 10, z: DEPTH.flap }}
          className={cn('accent-border accent-glow absolute inset-x-0 bottom-0 h-[64%] overflow-hidden border bg-folder/95', compact ? 'p-3.5 2xl:p-4' : 'p-4')}
        >
          <div aria-hidden className="folder-lines pointer-events-none absolute inset-0" />
          <div
            aria-hidden
            className="holo pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/folder:opacity-80 group-focus-visible/folder:opacity-80"
          />

          <div className="relative flex h-full flex-col">
            <div className="flex items-start justify-between font-ui text-[10px] track-20">
              <span className="text-white/45">{L.top}</span>
              <span className="accent-text flex items-center gap-1.5">
                <span className="led" aria-hidden /> {L.status}
              </span>
            </div>

            <h2 className="accent-text text-glow mt-3 break-words font-ui text-lg font-bold leading-tight tracking-wide sm:text-xl">
              <GlitchText>{dossier.title}</GlitchText>
            </h2>
            <p className="mt-1 text-[12.5px] leading-snug text-white/50">{dossier.blurb}</p>

            <div className="mt-auto flex items-end justify-between gap-2 font-ui text-[11px] tracking-widest">
              <span className="whitespace-nowrap text-white/60">{L.count}</span>
              <span className="accent-text flex items-center transition-[gap] group-hover/folder:gap-1">
                {L.cta} <ChevronRight size={13} aria-hidden className="cta-arrow" />
              </span>
            </div>

            {L.stamp && (
              <span
                aria-hidden
                className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 -rotate-12 border-2 border-current px-2 py-0.5 font-ui text-xs font-bold track-30 opacity-[0.12]"
                style={{ color: dossier.accent }}
              >
                {L.stamp}
              </span>
            )}
          </div>
        </motion.div>
      </motion.button>
    </div>
  );
}
