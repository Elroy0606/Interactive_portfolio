import { AnimatePresence, MotionConfig } from 'framer-motion';
import { AppProvider, VIEWS, useApp } from './state/AppContext';
import Scanlines from './components/Scanlines';
import TelemetryBar from './components/TelemetryBar';
import BootSequence from './components/BootSequence';
import Hub from './components/Hub';
import ProxmoxWorld from './components/proxmox/ProxmoxWorld';
import DevDistrict from './components/dev/DevDistrict';
import VulnsWorld from './components/vulns/VulnsWorld';
import WriteupsWorld from './components/writeups/WriteupsWorld';
import AmbientBackground from './components/AmbientBackground';
import TourGuide from './components/TourGuide';
import ThemeToggle from './components/ThemeToggle';
import { THEME } from './theme/theme';

// View router: one active view at a time, cross-faded by AnimatePresence.
const VIEW_COMPONENTS = {
  [VIEWS.BOOT]: BootSequence,
  [VIEWS.HUB]: Hub,
  [VIEWS.PROXMOX]: ProxmoxWorld,
  [VIEWS.DEV]: DevDistrict,
  [VIEWS.VULNS]: VulnsWorld,
  [VIEWS.WRITEUPS]: WriteupsWorld,
};

function Shell() {
  const { state } = useApp();
  const View = VIEW_COMPONENTS[state.view];
  // The animated backdrop and the CRT overlay are cyberpunk-only decoration:
  // they are not mounted in the professional theme (no canvas loop running).
  const cyberpunk = state.theme === THEME.CYBERPUNK;
  return (
    <>
      {cyberpunk && <AmbientBackground />}
      {state.view === VIEWS.BOOT ? (
        // The boot log has no top bar; keep the theme switch reachable there too.
        <div className="fixed right-4 top-3 z-40">
          <ThemeToggle />
        </div>
      ) : (
        <TelemetryBar />
      )}
      <AnimatePresence mode="wait">
        <View key={state.view} />
      </AnimatePresence>
      <TourGuide />
      {cyberpunk && <Scanlines />}
    </>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AppProvider>
        <Shell />
      </AppProvider>
    </MotionConfig>
  );
}
