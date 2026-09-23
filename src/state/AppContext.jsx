import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { setSoundEnabled } from '../lib/sound';

export const VIEWS = {
  BOOT: 'boot',
  HUB: 'hub',
  HANDSHAKE: 'handshake',
  PROXMOX: 'proxmox', // Sector 01
  VULNS: 'vulns', // Sector 03
};

// Which view a sector opens once its handshake completes.
const SECTOR_VIEWS = {
  '01': VIEWS.PROXMOX,
  '03': VIEWS.VULNS,
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
// Timings (ms) for the entering / exiting phases; the world components schedule
// the *_ENTERED / *_EXITED actions from these and the stage animates to match.
export const ZOOM_MS = { entering: 950, exiting: 800 };
export const DOSSIER_MS = { entering: 900, exiting: 750 };
export const SECTOR_MS = { entering: 800, exiting: 600 }; // hub -> sector camera push

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

const initialState = () => ({
  view: VIEWS.BOOT,
  targetSector: null, // sector id being connected to during HANDSHAKE
  // Sector 01. Every node click starts a camera zoom; nodes with a sub-view
  // (see SUB_VIEWS in ProxmoxWorld) swap to it, the others show a centered info board.
  zoom: ZOOM.NONE,
  zoomTarget: null, // service id being zoomed into
  activeContainerId: null, // container open in the info board inside the Docker sub-view
  // Sector 03
  dossier: ZOOM.NONE, // camera phase for opening a dossier folder
  activeDossierId: null,
  activeReportId: null, // report open in the PDF viewer
  // Onboarding
  tourStep: readTourStep(),
  soundOn: false,
});

const RESET_ZOOM = { zoom: ZOOM.NONE, zoomTarget: null, activeContainerId: null };
const RESET_DOSSIER = { dossier: ZOOM.NONE, activeDossierId: null, activeReportId: null };

function reducer(state, action) {
  switch (action.type) {
    case 'BOOT_DONE':
      return state.view === VIEWS.BOOT ? { ...state, view: VIEWS.HUB } : state;
    case 'CONNECT':
      return state.view === VIEWS.HUB
        ? { ...state, view: VIEWS.HANDSHAKE, targetSector: action.sectorId }
        : state;
    case 'ENTER_SECTOR':
      return state.view === VIEWS.HANDSHAKE
        ? { ...state, view: SECTOR_VIEWS[state.targetSector] ?? VIEWS.HUB }
        : state;
    case 'RETURN_TO_HUB':
      return { ...state, view: VIEWS.HUB, targetSector: null, ...RESET_ZOOM, ...RESET_DOSSIER };

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

  useEffect(() => {
    setSoundEnabled(state.soundOn);
  }, [state.soundOn]);

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
