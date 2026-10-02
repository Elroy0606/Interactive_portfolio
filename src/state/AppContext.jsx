import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { setSoundEnabled } from '../lib/sound';
import { THEME, applyTheme, readTheme } from '../theme/theme';

export const VIEWS = {
  BOOT: 'boot',
  HUB: 'hub',
  PROXMOX: 'proxmox', // Sector 01
  DEV: 'dev', // Sector 02
  VULNS: 'vulns', // Sector 03
  WRITEUPS: 'writeups', // Sector 04
};

// Which view each hub sector opens.
const SECTOR_VIEWS = {
  '01': VIEWS.PROXMOX,
  '02': VIEWS.DEV,
  '03': VIEWS.VULNS,
  '04': VIEWS.WRITEUPS,
};

// Camera phases, used by the Proxmox lab (`zoom`) and the Sector 03 dossier
// shelf (`dossier`):
//   none     -> normal stage (blueprint / folder grid)
//   entering -> camera zooming toward the target, everything else fading out
//   inside   -> the target's inner view (sub-view / archive / info board) is showing
//   exiting  -> reverse zoom back to the stage
export const ZOOM = {
  NONE: 'none',
  ENTERING: 'entering',
  INSIDE: 'inside',
  EXITING: 'exiting',
};
// Timings for the entering / exiting phases are motion tokens (theme/motion.js:
// `zoom`, `dossier`); the world components schedule the *_ENTERED / *_EXITED
// actions from them and the stage animates to match.

// Onboarding tour: which lab node the guide cursor points at. null = hidden.
//   'pihole' -> 'docker' -> null (done)
const TOUR_NEXT = { pihole: 'docker', docker: null };
const TOUR_STORAGE_KEY = 'mainframe.tour';

// The tour shows once per browser; finishing / dismissing it is remembered.
function readTourStep() {
  try {
    return window.localStorage.getItem(TOUR_STORAGE_KEY) === 'done' ? null : 'pihole';
  } catch {
    return 'pihole'; // storage blocked: just show it
  }
}

// The boot log is part of the cyberpunk treatment; the professional theme
// starts on the hub.
const firstView = (theme) => (theme === THEME.CYBERPUNK ? VIEWS.BOOT : VIEWS.HUB);

const initialState = () => {
  const theme = readTheme(); // already applied to <html> by the inline script in index.html
  return {
    theme,
    view: firstView(theme),
    // Sector 01. Every node click starts a camera zoom; nodes with a sub-view
    // (see SUB_VIEWS in ProxmoxWorld) swap to it, the others show a centered info board.
    zoom: ZOOM.NONE,
    zoomTarget: null, // service id being zoomed into
    activeContainerId: null, // container open in the info board inside the Docker sub-view
    // Sector 03
    dossier: ZOOM.NONE, // camera phase for opening a dossier folder
    activeDossierId: null,
    activeReportId: null, // report open in the PDF viewer
    // Sector 04
    activeWriteupId: null, // write-up whose detail page is open (null = index)
    // Onboarding
    tourStep: readTourStep(),
    soundOn: false,
  };
};

const RESET_ZOOM = { zoom: ZOOM.NONE, zoomTarget: null, activeContainerId: null };
const RESET_DOSSIER = { dossier: ZOOM.NONE, activeDossierId: null, activeReportId: null };
const RESET_SECTORS = { ...RESET_ZOOM, ...RESET_DOSSIER, activeWriteupId: null };
// Cross-links (project <-> write-up) jump straight from one sector to another.
// They also work from the hub (the Highlights cards), but never during the boot log.
const canJump = (state) => state.view !== VIEWS.BOOT;

function reducer(state, action) {
  switch (action.type) {
    case 'BOOT_DONE':
      return state.view === VIEWS.BOOT ? { ...state, view: VIEWS.HUB } : state;
    case 'ENTER_SECTOR': // hub card click: the sector opens straight away
      return state.view === VIEWS.HUB ? { ...state, view: SECTOR_VIEWS[action.sectorId] ?? VIEWS.HUB } : state;
    case 'SET_THEME':
      if (action.theme === state.theme) return state;
      return {
        ...state,
        theme: action.theme,
        // switching away from cyberpunk while its boot log is playing skips the log
        view: state.view === VIEWS.BOOT ? firstView(action.theme) : state.view,
      };
    case 'RETURN_TO_HUB':
      return { ...state, view: VIEWS.HUB, ...RESET_SECTORS };

    // ---- Sector 01: lab ----
    case 'ZOOM_START':
      if (state.view !== VIEWS.PROXMOX || state.zoom !== ZOOM.NONE) return state;
      return {
        ...state,
        zoom: ZOOM.ENTERING,
        zoomTarget: action.id,
        // Guide logic: clicking the node the cursor points at advances the tour;
        // clicking anything else means the visitor is exploring alone, so it stops.
        tourStep: state.tourStep === action.id ? TOUR_NEXT[state.tourStep] : null,
      };
    case 'ZOOM_ENTERED':
      return state.zoom === ZOOM.ENTERING ? { ...state, zoom: ZOOM.INSIDE } : state;
    case 'ZOOM_EXIT':
      return state.zoom === ZOOM.INSIDE ? { ...state, zoom: ZOOM.EXITING, activeContainerId: null } : state;
    case 'ZOOM_EXITED':
      return state.zoom === ZOOM.EXITING ? { ...state, ...RESET_ZOOM } : state;

    case 'OPEN_CONTAINER':
      return state.zoom === ZOOM.INSIDE ? { ...state, activeContainerId: action.id } : state;
    case 'CLOSE_CONTAINER':
      return { ...state, activeContainerId: null };

    // ---- Sector 03: dossiers ----
    case 'DOSSIER_START':
      return state.view === VIEWS.VULNS && state.dossier === ZOOM.NONE
        ? { ...state, dossier: ZOOM.ENTERING, activeDossierId: action.id }
        : state;
    case 'DOSSIER_ENTERED':
      return state.dossier === ZOOM.ENTERING ? { ...state, dossier: ZOOM.INSIDE } : state;
    case 'DOSSIER_EXIT':
      return state.dossier === ZOOM.INSIDE ? { ...state, dossier: ZOOM.EXITING, activeReportId: null } : state;
    case 'DOSSIER_EXITED':
      return state.dossier === ZOOM.EXITING ? { ...state, ...RESET_DOSSIER } : state;

    case 'REPORT_OPEN':
      return state.dossier === ZOOM.INSIDE ? { ...state, activeReportId: action.id } : state;
    case 'REPORT_CLOSE':
      return { ...state, activeReportId: null };

    // ---- Sector 04: write-ups (+ cross-links between a project and its write-up) ----
    case 'WRITEUP_OPEN': // from the index, a related project in another sector, or a hub highlight
      return canJump(state) ? { ...state, ...RESET_SECTORS, view: VIEWS.WRITEUPS, activeWriteupId: action.id } : state;
    case 'WRITEUP_CLOSE':
      return { ...state, activeWriteupId: null };
    case 'JUMP_TO_LAB': // straight into a lab node's inner view (no camera zoom: the stage was never shown)
      return canJump(state)
        ? { ...state, ...RESET_SECTORS, view: VIEWS.PROXMOX, zoom: ZOOM.INSIDE, zoomTarget: action.id }
        : state;
    case 'JUMP_TO_PROJECTS':
      return canJump(state) ? { ...state, ...RESET_SECTORS, view: VIEWS.DEV } : state;

    // ---- Onboarding tour ----
    case 'TOUR_NEXT': // timer ran out on the current step
      return state.tourStep ? { ...state, tourStep: TOUR_NEXT[state.tourStep] } : state;
    case 'TOUR_OFF':
      return { ...state, tourStep: null };
    case 'TOUR_ON':
      return { ...state, tourStep: 'pihole' };

    case 'TOGGLE_SOUND':
      return { ...state, soundOn: !state.soundOn };
    default:
      return state;
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  // Sound effects belong to the cyberpunk theme only.
  useEffect(() => {
    setSoundEnabled(state.soundOn && state.theme === THEME.CYBERPUNK);
  }, [state.soundOn, state.theme]);

  // One attribute on <html> switches the token set. The choice itself is stored
  // by ThemeToggle, only when the visitor clicks it.
  useEffect(() => {
    applyTheme(state.theme);
  }, [state.theme]);

  // Remember that the tour finished / was dismissed / was switched off.
  useEffect(() => {
    try {
      window.localStorage.setItem(TOUR_STORAGE_KEY, state.tourStep ? 'active' : 'done');
    } catch {
      /* storage unavailable: the tour simply shows again next visit */
    }
  }, [state.tourStep]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
