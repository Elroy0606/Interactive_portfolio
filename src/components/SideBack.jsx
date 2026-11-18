import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useApp, VIEWS } from '../state/AppContext';
import useMediaQuery from '../hooks/useMediaQuery';

// Left-margin back control. An invisible strip on the left of the page (the
// empty margin outside the 1600px content column, never less than the page
// padding) reveals a back "portal" after the mouse has rested in it for DWELL ms.
// Only clicking it goes back; passing through the margin does nothing.
//
// "Back" = one Escape press: every view already pops exactly one layer on Esc
// (report -> folder -> shelf -> track page -> hub), so this reuses that
// instead of duplicating each view's back logic.
//
// Mouse / trackpad only: not mounted below lg or on devices whose main pointer
// is touch (they swipe back), and touch / pen pointers on hybrid laptops are
// ignored. Keyboard users have Esc and the back buttons.
const DWELL = 320; // ms the pointer must rest in the strip
const STILL = 24; // px of movement allowed during the dwell before it restarts
const HIDE = 450; // ms grace after leaving before the control fades
const ZONE_W = 'max(2rem, calc((100vw - 1600px) / 2 + 2rem))';
const CHEVRONS = [0, 1, 2];

export default function SideBack() {
  const { state } = useApp();
  const mouse = useMediaQuery('(min-width: 1024px) and (hover: hover) and (pointer: fine)');
  // Nothing to go back to on the hub or the boot log.
  if (!mouse || state.view === VIEWS.HUB || state.view === VIEWS.BOOT) return null;
  return <Strip />;
}

function Strip() {
  const [shown, setShown] = useState(false);
  const [y, setY] = useState(0);
  const dwell = useRef(null);
  const hide = useRef(null);
  const anchor = useRef(null);

  const clear = (t) => {
    clearTimeout(t.current);
    t.current = null;
  };
  useEffect(() => () => {
    clear(dwell);
    clear(hide);
  }, []);

  const isMouse = (e) => e.pointerType === 'mouse';
  const arm = (e) => {
    clear(dwell);
    anchor.current = { x: e.clientX, y: e.clientY };
    dwell.current = setTimeout(() => {
      setY(anchor.current.y);
      setShown(true);
    }, DWELL);
  };
  const onEnter = (e) => {
    if (!isMouse(e)) return;
    clear(hide);
    if (!shown) arm(e);
  };
  const onMove = (e) => {
    if (!isMouse(e) || shown) return;
    const a = anchor.current;
    if (!a || Math.hypot(e.clientX - a.x, e.clientY - a.y) > STILL) arm(e);
  };
  const onLeave = (e) => {
    if (!isMouse(e)) return;
    clear(dwell);
    anchor.current = null;
    clear(hide);
    hide.current = setTimeout(() => setShown(false), HIDE);
  };
  const goBack = () => {
    setShown(false);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  };

  return (
    <div
      aria-hidden={!shown}
      className="fixed bottom-0 left-0 top-[3.2rem] z-30"
      style={{ width: ZONE_W }}
      onPointerEnter={onEnter}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <AnimatePresence>
        {shown && (
          <motion.div
            className="back-portal-glow fixed left-2"
            style={{ '--glow-accent': 'var(--glow-cyber)', top: `clamp(4rem, calc(${y}px - 3.5rem), calc(100vh - 8rem))`, perspective: 600 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            <motion.button
              type="button"
              tabIndex={-1}
              aria-label="Go back"
              title="Go back"
              onClick={goBack}
              style={{ '--accent': 'var(--color-cyber)', '--glow-accent': 'var(--glow-cyber)', transformStyle: 'preserve-3d', transformOrigin: '0% 50%' }}
              className="press accent-text group/back relative flex h-28 w-16 flex-col items-center justify-center gap-2"
              initial={{ rotateY: 75, x: -18, scale: 0.85 }}
              animate={{ rotateY: 0, x: 0, scale: 1 }}
              exit={{ rotateY: 75, x: -18, scale: 0.85, transition: { duration: 0.15 } }}
              whileHover={{ rotateY: -16, z: 14, scale: 1.06 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              {/* holo panel: angled frame, scan sweep, corner rails */}
              <span aria-hidden className="back-portal-frame" />
              <span aria-hidden className="back-portal-scan" />
              {/* flowing chevrons, a "this way" signal */}
              <span aria-hidden className="relative flex h-8 items-center" style={{ transform: 'translateZ(18px)' }}>
                {CHEVRONS.map((i) => (
                  <ChevronLeft
                    key={i}
                    size={22}
                    strokeWidth={2.5}
                    className="back-chev -mx-[7px]"
                    style={{ animationDelay: `${i * 0.18}s` }}
                  />
                ))}
              </span>
              <span
                aria-hidden
                className="relative font-ui text-[10px] font-bold track-25 text-glow"
                style={{ transform: 'translateZ(10px)' }}
              >
                BACK
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
