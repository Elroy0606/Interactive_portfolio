import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Pointer, X } from 'lucide-react';
import { useApp, VIEWS, ZOOM } from '../state/AppContext';
import { getService } from '../data/services';

// Onboarding guide: a glowing finger-pointer that taps the node it wants the
// visitor to open, then glides to the next one.
//
// Steps come from state.tourStep ('pihole' -> 'docker' -> null). The reducer
// advances the step when the pointed-at node is clicked and ends the tour when
// any other node is clicked (see ZOOM_START); this component only handles the
// timing: if a step is ignored for STEP_MS it advances by itself, so the guide
// always finishes and fades out. It is visible only on the lab stage (no zoom).
const STEP_MS = 9000;
const STEPS = {
  pihole: { n: 1, text: 'Click Pi-hole to watch ads get sinkholed in real time.' },
  docker: { n: 2, text: 'Next: enter Docker to explore J.A.R.V.I.S, Juice Shop and the Nmap Visualizer.' },
};
const LABEL_W = 264;
const LABEL_H = 92; // approximate caption height, used for placement only
const FINGERTIP = { x: 16, y: 4 }; // fingertip position inside the 46px pointer icon

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const overlap = (a, b) =>
  Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
  Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));

// Try right / left / below / above of the target, clamp each to the screen, and
// keep the one that covers the least: the target itself counts triple, other
// nodes and the rack count once. Ties keep that order.
function placeCaption(rect, vw, vh) {
  const G = 14;
  const midTop = rect.top + rect.height / 2 - LABEL_H / 2;
  const candidates = [
    { left: rect.left + rect.width + G, top: midTop },
    { left: rect.left - G - LABEL_W, top: midTop },
    { left: rect.left + rect.width - LABEL_W, top: rect.top + rect.height + G },
    { left: rect.left + rect.width - LABEL_W, top: rect.top - LABEL_H - G },
  ].map((c) => ({ left: clamp(c.left, 12, vw - LABEL_W - 12), top: clamp(c.top, 64, vh - LABEL_H - 8) }));

  const target = { left: rect.left, top: rect.top, right: rect.left + rect.width, bottom: rect.top + rect.height };
  let best = candidates[0];
  let bestScore = Infinity;
  for (const c of candidates) {
    const box = { left: c.left, top: c.top, right: c.left + LABEL_W, bottom: c.top + LABEL_H };
    const score = overlap(box, target) * 3 + (rect.obstacles ?? []).reduce((s, o) => s + overlap(box, o), 0);
    if (score < bestScore) {
      best = c;
      bestScore = score;
    }
  }
  return best;
}

export default function TourGuide() {
  const { state, dispatch } = useApp();
  const step = state.tourStep;
  const visible = state.view === VIEWS.PROXMOX && state.zoom === ZOOM.NONE && Boolean(step);
  const [rect, setRect] = useState(null);

  // Track the target node's on-screen box (it moves on resize / scroll / relayout).
  useEffect(() => {
    if (!visible) return undefined;
    const measure = () => {
      const el = document.querySelector(`[data-tour="${step}"]`);
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      // everything the caption should avoid covering: the other nodes and the rack
      const obstacles = [...document.querySelectorAll('[data-tour], [data-tour-avoid]')]
        .filter((o) => o !== el)
        .map((o) => o.getBoundingClientRect());
      setRect((p) =>
        p && Math.abs(p.left - r.left) < 1 && Math.abs(p.top - r.top) < 1 && Math.abs(p.width - r.width) < 1
          ? p
          : { left: r.left, top: r.top, width: r.width, height: r.height, obstacles },
      );
    };
    measure();
    const id = setInterval(measure, 200);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      clearInterval(id);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [visible, step]);

  // Ignored step -> move on by itself.
  useEffect(() => {
    if (!visible) return undefined;
    const t = setTimeout(() => dispatch({ type: 'TOUR_NEXT' }), STEP_MS);
    return () => clearTimeout(t);
  }, [visible, step, dispatch]);

  // Target node doesn't exist (e.g. removed from the lab): skip its step.
  const hasRect = Boolean(rect);
  useEffect(() => {
    if (!visible || hasRect) return undefined;
    const t = setTimeout(() => dispatch({ type: 'TOUR_NEXT' }), 1500);
    return () => clearTimeout(t);
  }, [visible, hasRect, step, dispatch]);

  const service = getService(step);
  const accent = service?.accent ?? 'var(--color-id-amber)';
  const vw = typeof window === 'undefined' ? 1440 : window.innerWidth;
  const vh = typeof window === 'undefined' ? 900 : window.innerHeight;
  const onScreen = rect && rect.top + rect.height > 60 && rect.top < vh - 24;

  // Fingertip lands on the upper part of the node; the caption goes wherever it
  // covers the least (see placeCaption).
  const px = rect ? rect.left + rect.width * 0.55 : 0;
  const py = rect ? rect.top + rect.height * 0.3 : 0;
  const { left: labelLeft, top: labelTop } = rect ? placeCaption(rect, vw, vh) : { left: 0, top: 0 };

  return (
    <AnimatePresence>
      {visible && rect && (
        <motion.div
          key="tour"
          className="pointer-events-none fixed inset-0 z-[45]"
          style={{ '--accent': accent }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
        >
          {onScreen ? (
            <>
              {/* pulsing highlight on the target */}
              <motion.div
                aria-hidden
                className="tour-ring absolute border-2"
                style={{ borderColor: accent }}
                initial={false}
                animate={{ left: rect.left - 6, top: rect.top - 6, width: rect.width + 12, height: rect.height + 12 }}
                transition={{ type: 'spring', stiffness: 90, damping: 17 }}
              />

              {/* tap ripples at the fingertip */}
              <motion.span
                aria-hidden
                className="absolute h-10 w-10 rounded-full border-2"
                style={{ borderColor: accent, marginLeft: -20, marginTop: -20 }}
                initial={false}
                animate={{ left: px, top: py, scale: [0.3, 0.3, 2.4, 2.4], opacity: [0, 0.9, 0, 0] }}
                transition={{
                  left: { type: 'spring', stiffness: 90, damping: 17 },
                  top: { type: 'spring', stiffness: 90, damping: 17 },
                  scale: { duration: 1.8, times: [0, 0.35, 0.85, 1], repeat: Infinity },
                  opacity: { duration: 1.8, times: [0, 0.35, 0.85, 1], repeat: Infinity },
                }}
              />

              {/* the pointer: glides to each target, taps in a loop */}
              <motion.div
                aria-hidden
                className="absolute"
                initial={false}
                animate={{ left: px - FINGERTIP.x, top: py - FINGERTIP.y }}
                transition={{ type: 'spring', stiffness: 90, damping: 17 }}
              >
                <motion.div
                  animate={{ x: [16, 0, 0, 16], y: [22, 0, 0, 22], scale: [1, 0.92, 0.92, 1] }}
                  transition={{ duration: 1.8, times: [0, 0.35, 0.55, 1], repeat: Infinity, ease: 'easeInOut' }}
                  style={{ color: accent, filter: 'drop-shadow(0 0 8px var(--glow-accent)) drop-shadow(0 0 18px var(--glow-accent))' }}
                >
                  <Pointer size={46} strokeWidth={1.6} style={{ fill: 'var(--pointer-fill)' }} />
                </motion.div>
              </motion.div>

              {/* caption + skip */}
              <motion.div
                role="note"
                className="absolute border bg-glass/82 p-3 backdrop-blur-md"
                style={{ width: LABEL_W, borderColor: `color-mix(in srgb, ${accent} 60%, transparent)`, boxShadow: '0 0 24px color-mix(in srgb, var(--glow-accent) 26.7%, transparent)' }}
                initial={false}
                animate={{ left: labelLeft, top: labelTop }}
                transition={{ type: 'spring', stiffness: 90, damping: 17 }}
              >
                <div className="flex items-center justify-between font-ui text-[10px] track-25">
                  <span style={{ color: accent }}>GUIDE {STEPS[step].n}/2</span>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'TOUR_OFF' })}
                    className="pointer-events-auto flex items-center gap-1 text-white/50 hover:text-white"
                    aria-label="Skip the guide"
                  >
                    <X size={11} aria-hidden /> SKIP
                  </button>
                </div>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={step}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="mt-1.5 text-[13px] leading-snug text-white/90"
                  >
                    {STEPS[step].text}
                  </motion.p>
                </AnimatePresence>
              </motion.div>
            </>
          ) : (
            // Target is scrolled off-screen (stacked mobile layout): pin a chip that scrolls to it.
            <button
              type="button"
              onClick={() =>
                document.querySelector(`[data-tour="${step}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }
              className="pointer-events-auto absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 border bg-glass/90 px-3 py-2 font-ui text-[11px] tracking-widest backdrop-blur-md"
              style={{ borderColor: `color-mix(in srgb, ${accent} 60%, transparent)`, color: accent, boxShadow: '0 0 20px color-mix(in srgb, var(--glow-accent) 33.3%, transparent)' }}
            >
              <ChevronDown size={14} aria-hidden /> GUIDE // SCROLL TO {service?.name ?? step.toUpperCase()}
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
