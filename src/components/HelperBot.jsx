import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MousePointer2, X } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { THEMES, saveTheme } from '../theme/theme';
import useHelper from '../hooks/useHelper';
import { THEME_ICONS } from './ThemeToggle';
import { cn } from '../lib/cn';
import squirrel from '../assets/squirrel.webp';

// The helper bot: a squirrel in the bottom-right corner that gives first-time
// visitors one tip at a time. The tips are data (data/helper.js) and the
// timing / "seen" logic is a hook (hooks/useHelper.js); this file only draws:
//   1. the squirrel and its speech bubble
//   2. a pointer that travels from the squirrel to the tip's target and taps it
//   3. a pulsing ring around the target
//   4. an optional close-up panel next to the target (CALLOUTS)
// Everything is a fixed overlay that ignores the pointer, except the bubble and
// the close-up panel (marked data-helper-ui so using them does not end the tip).

const TRAVEL_S = 1.1; // pointer flight time; the ring and the close-up appear when it lands
const CALLOUT_W = 300;

// Close-up of the theme switch: the three modes, enlarged, each with what it
// does. A highlight steps through them; clicking one switches to it.
function ThemeModesCallout() {
  const { state, dispatch } = useApp();
  const reduce = useReducedMotion();
  const [spot, setSpot] = useState(0);

  useEffect(() => {
    if (reduce) return undefined;
    const t = setInterval(() => setSpot((i) => (i + 1) % THEMES.length), 1700);
    return () => clearInterval(t);
  }, [reduce]);

  return (
    <>
      <p className="font-ui text-[10px] track-25 text-white/60">CLOSE-UP // THEME SWITCH</p>
      <ul className="mt-2 space-y-1.5">
        {THEMES.map((t, i) => {
          const Icon = THEME_ICONS[t.icon];
          const on = state.theme === t.id;
          return (
            <li key={t.id}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => {
                  saveTheme(t.id);
                  dispatch({ type: 'SET_THEME', theme: t.id });
                }}
                className={cn(
                  'flex w-full items-center gap-3 border px-3 py-2 text-left transition-colors hover:border-cyber',
                  on ? 'border-cyber bg-cyber/10' : 'border-white/15',
                  !reduce && spot === i && 'outline outline-2 outline-offset-2 outline-cyber/70',
                )}
              >
                <Icon size={22} strokeWidth={1.6} className="shrink-0 text-cyber" aria-hidden />
                <span className="min-w-0">
                  <span className="flex items-center gap-2 font-ui text-[13px] font-bold tracking-wide text-white">
                    {t.label}
                    {on && <span className="border border-cyber/60 px-1 text-[9px] font-medium tracking-widest text-cyber">ON</span>}
                  </span>
                  <span className="block text-[12px] leading-snug text-white/75">{t.hint}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-[11px] leading-snug text-white/60">Click one to try it. Your choice is remembered.</p>
    </>
  );
}

// Close-up panels a tip can name in its `callout` field (data/helper.js).
const CALLOUTS = {
  'theme-modes': ThemeModesCallout,
};

// Screen rectangle of the tip's target, kept current while the tip is shown.
function useTargetRect(selector) {
  const [rect, setRect] = useState(null);
  useEffect(() => {
    if (!selector) {
      setRect(null);
      return undefined;
    }
    const measure = () => {
      const r = document.querySelector(selector)?.getBoundingClientRect();
      setRect(r && r.width > 0 ? { left: r.left, top: r.top, width: r.width, height: r.height } : null);
    };
    measure();
    const t = setInterval(measure, 250);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      clearInterval(t);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [selector]);
  return rect;
}

function Tip({ step, onDismiss }) {
  const reduce = useReducedMotion();
  const rect = useTargetRect(step.target);
  const Callout = step.callout ? CALLOUTS[step.callout] : null;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const landed = reduce ? 0 : TRAVEL_S; // delay for whatever waits for the pointer

  // Pointer path: from the squirrel (bottom-right) to just under the target's middle.
  const from = { left: vw - 70, top: vh - 80 };
  const to = rect ? { left: rect.left + rect.width / 2 - 4, top: rect.top + rect.height - 6 } : null;
  // Close-up: under the target, right edge aligned with it, kept on screen.
  const calloutLeft = rect ? Math.min(Math.max(rect.left + rect.width - CALLOUT_W, 12), vw - CALLOUT_W - 12) : 0;

  return (
    <motion.div className="pointer-events-none fixed inset-0 z-[46]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
      {rect && (
        <>
          <motion.div
            aria-hidden
            className="tour-ring absolute border-2 border-cyber"
            style={{ left: rect.left - 6, top: rect.top - 6, width: rect.width + 12, height: rect.height + 12, borderRadius: 'calc(var(--radius) + 4px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: landed, duration: 0.3 }}
          />

          <motion.div
            aria-hidden
            className="absolute text-cyber"
            initial={reduce ? { ...to, opacity: 1 } : { ...from, opacity: 0 }}
            animate={{ ...to, opacity: 1 }}
            transition={{ duration: reduce ? 0 : TRAVEL_S, ease: [0.22, 1, 0.36, 1] }}
            style={{ filter: 'drop-shadow(0 0 8px var(--glow-accent))' }}
          >
            <motion.div
              animate={reduce ? undefined : { y: [10, 0, 0, 10], scale: [1, 0.9, 0.9, 1] }}
              transition={{ duration: 1.7, times: [0, 0.35, 0.55, 1], repeat: Infinity, ease: 'easeInOut', delay: TRAVEL_S }}
            >
              <MousePointer2 size={30} strokeWidth={1.6} style={{ fill: 'var(--pointer-fill)' }} />
            </motion.div>
          </motion.div>

          {Callout && (
            <motion.div
              data-helper-ui
              role="group"
              aria-label="Close-up of what the helper is pointing at"
              className="pointer-events-auto absolute border border-cyber/60 bg-panel p-3 shadow-[var(--shadow-board)]"
              style={{ left: calloutLeft, top: rect.top + rect.height + 44, width: CALLOUT_W, borderRadius: 'var(--radius)', transformOrigin: 'top right' }}
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.4, y: -30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: landed + 0.25, duration: reduce ? 0.2 : 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <Callout />
            </motion.div>
          )}
        </>
      )}

      {/* the squirrel and its speech bubble */}
      <motion.div
        data-helper-ui
        role="status"
        aria-live="polite"
        className="pointer-events-auto absolute bottom-4 right-4 flex items-end gap-3"
        initial={reduce ? false : { y: 24 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      >
        <div className="relative w-[min(300px,calc(100vw-7.5rem))] border border-cyber/60 bg-panel p-3 shadow-[var(--shadow-board)]" style={{ borderRadius: 'var(--radius)' }}>
          <div className="flex items-start justify-between gap-3">
            <p className="font-ui text-[10px] track-25 text-cyber">HELPER // TIP</p>
            <button type="button" onClick={onDismiss} aria-label="Close this tip" className="-m-1 p-1 text-white/60 transition-colors hover:text-white">
              <X size={14} aria-hidden />
            </button>
          </div>
          <p className="mt-1 font-ui text-[13px] font-bold leading-snug text-white">{step.title}</p>
          <p className="mt-1 text-[13px] leading-snug text-white/85">{step.text}</p>
          <button type="button" onClick={onDismiss} className="mt-2 font-ui text-[11px] tracking-widest text-cyber underline decoration-cyber/40 underline-offset-4 hover:decoration-cyber">
            GOT IT
          </button>
        </div>
        <img src={squirrel} alt="Helper squirrel" width="64" height="64" className="h-16 w-16 shrink-0 rounded-full border-2 border-cyber bg-black object-cover" />
      </motion.div>
    </motion.div>
  );
}

export default function HelperBot() {
  const { step, dismiss } = useHelper();
  return <AnimatePresence>{step && <Tip key={step.id} step={step} onDismiss={dismiss} />}</AnimatePresence>;
}
