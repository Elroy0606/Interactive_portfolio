import { useMemo } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useApp } from '../state/AppContext';
import { THEME } from './theme';

// Motion tokens: the JavaScript half of the theme (Framer Motion needs numbers,
// so these cannot live in CSS). One set per theme; components read them through
// useMotion() and never hard-code a duration that differs between themes.
//
//   view     hub <-> sector switch. exit + enter is the whole wait after a click.
//   item     entrance of the cards / stage inside a view (y = rise in px,
//            stagger = extra delay per card).
//   subView  entrance of a drill-down inside a sector (Docker, Pi-hole, AD lab, dossier).
//   page     a detail page opened from a list (write-up).
//   board    centered info board (DataHUD).
//   zoom / dossier   camera zoom phases in ms (lab node / dossier folder).
//   zoomScale, pan   how far the camera pushes in, and whether it travels.
//   tilt     3D pointer tilt on the rack and the dossier folders.
//   morph    report thumbnail morphing into the reader.
//   typing   char-by-char terminal typing (false = text appears at once).
const TOKENS = {
  [THEME.CYBERPUNK]: {
    view: { exit: 0.06, enter: 0.11, from: { opacity: 0, scale: 1.03 }, ease: [0.22, 1, 0.36, 1] },
    item: { duration: 0.11, stagger: 0.012, y: 8 },
    subView: { initial: { opacity: 0, scale: 1.06 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.5, ease: 'easeOut' } },
    page: { initial: { opacity: 0, scale: 1.04 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0 }, transition: { duration: 0.35, ease: 'easeOut' } },
    board: {
      initial: { opacity: 0, scale: 0.86, y: 28 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.94, y: 12 },
      transition: { type: 'spring', damping: 26, stiffness: 260 },
    },
    zoom: { entering: 950, exiting: 800 },
    dossier: { entering: 900, exiting: 750 },
    zoomScale: { lab: 2.4, dossier: 2.1 },
    pan: true,
    tilt: true,
    morph: true,
    typing: true,
  },
  [THEME.PROFESSIONAL]: {
    view: { exit: 0.04, enter: 0.08, from: { opacity: 0 }, ease: 'easeOut' },
    item: { duration: 0.08, stagger: 0, y: 0 },
    subView: { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.15, ease: 'easeOut' } },
    page: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.12, ease: 'easeOut' } },
    board: {
      initial: { opacity: 0, y: 8 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0 },
      transition: { duration: 0.15, ease: 'easeOut' },
    },
    zoom: { entering: 220, exiting: 180 },
    dossier: { entering: 220, exiting: 180 },
    zoomScale: { lab: 1.04, dossier: 1.04 },
    pan: false,
    tilt: false,
    morph: false,
    typing: false,
  },
};
// Dim is the calm dark mode: it moves like the professional theme.
TOKENS[THEME.DIM] = TOKENS[THEME.PROFESSIONAL];

const REST = { opacity: 1, scale: 1 };

export function useMotion() {
  const { state } = useApp();
  const reduce = useReducedMotion();
  return useMemo(() => {
    const t = TOKENS[state.theme] ?? TOKENS[THEME.CYBERPUNK];
    // prefers-reduced-motion: views and their content swap with no animation at all.
    const view = reduce ? { ...t.view, exit: 0, enter: 0, from: REST } : t.view;
    const item = reduce ? { duration: 0, stagger: 0, y: 0 } : t.item;
    return {
      ...t,
      // Spread on the <motion.main> of a view.
      viewProps: {
        initial: view.from,
        animate: { ...REST, transition: { duration: view.enter, ease: view.ease } },
        exit: { opacity: 0, transition: { duration: view.exit, ease: 'easeIn' } },
      },
      // Spread on a stage frame inside a view (opacity only: traces are measured inside it).
      fadeProps: {
        initial: reduce ? false : { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: item.duration },
      },
      // Spread on a card inside a view; i = position in a list.
      itemProps: (i = 0) => ({
        initial: reduce ? false : { opacity: 0, y: item.y },
        animate: { opacity: 1, y: 0 },
        transition: { duration: item.duration, delay: Math.min(i, 8) * item.stagger },
      }),
    };
  }, [state.theme, reduce]);
}
