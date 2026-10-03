import { useCallback, useEffect, useMemo, useState } from 'react';
import { useApp } from '../state/AppContext';
import { HELPER_DEFAULTS, HELPER_STEPS, HELPER_STORAGE_KEY } from '../data/helper';

// Which helper tip (data/helper.js) is on screen right now.
//
// A tip becomes the candidate when it has not been seen and its trigger
// (`view` / `when`) matches the app state. After its `delay` it is shown and
// remembered as seen. It ends after `duration`, on dismiss(), when its trigger
// stops matching (the visitor left the page), or on the first click, key press,
// scroll or touch. Then the next unseen matching tip, if any, takes its turn.

function readSeen() {
  try {
    const list = JSON.parse(window.localStorage.getItem(HELPER_STORAGE_KEY) ?? '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return []; // storage blocked or corrupt: tips show again next visit
  }
}
function writeSeen(list) {
  try {
    window.localStorage.setItem(HELPER_STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* storage blocked: remembered for this page load only */
  }
}

const matches = (step, state) =>
  (step.view === undefined || [].concat(step.view).includes(state.view)) && (step.when ? Boolean(step.when(state)) : true);

// Interactions that end a tip. Pointer movement alone does not.
const DISMISS_EVENTS = ['pointerdown', 'keydown', 'wheel', 'touchstart'];

export default function useHelper() {
  const { state } = useApp();
  const [seen, setSeen] = useState(readSeen);
  const [activeId, setActiveId] = useState(null);

  const candidate = useMemo(() => HELPER_STEPS.find((s) => !seen.includes(s.id) && matches(s, state)) ?? null, [seen, state]);
  const active = activeId ? HELPER_STEPS.find((s) => s.id === activeId) : null;

  // Show the candidate after its delay.
  useEffect(() => {
    if (activeId || !candidate) return undefined;
    const t = setTimeout(() => setActiveId(candidate.id), candidate.delay ?? HELPER_DEFAULTS.delay);
    return () => clearTimeout(t);
  }, [candidate, activeId]);

  const dismiss = useCallback(() => {
    setActiveId((id) => {
      if (id) {
        setSeen((prev) => {
          if (prev.includes(id)) return prev;
          const next = [...prev, id];
          writeSeen(next);
          return next;
        });
      }
      return null;
    });
  }, []);

  // End the active tip: timer, interaction, or the trigger no longer matching.
  const stillValid = active ? matches(active, state) : false;
  useEffect(() => {
    if (!active) return undefined;
    if (!stillValid) {
      dismiss();
      return undefined;
    }
    const t = setTimeout(dismiss, active.duration ?? HELPER_DEFAULTS.duration);
    // Interactions inside the helper itself (its close button, the close-up
    // panel) are handled there, so they are not treated as "the visitor moved on".
    const onInteract = (e) => {
      if (e.target instanceof Element && e.target.closest('[data-helper-ui]')) return;
      dismiss();
    };
    DISMISS_EVENTS.forEach((n) => window.addEventListener(n, onInteract, { passive: true }));
    return () => {
      clearTimeout(t);
      DISMISS_EVENTS.forEach((n) => window.removeEventListener(n, onInteract));
    };
  }, [active, stillValid, dismiss]);

  return { step: active, dismiss };
}
