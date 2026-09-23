import { AnimatePresence, MotionConfig } from 'framer-motion';
import { AppProvider, VIEWS, useApp } from './state/AppContext';
import Scanlines from './components/Scanlines';
import TelemetryBar from './components/TelemetryBar';
import BootSequence from './components/BootSequence';
import Hub from './components/Hub';
import Handshake from './components/Handshake';
import ProxmoxWorld from './components/proxmox/ProxmoxWorld';
import VulnsWorld from './components/vulns/VulnsWorld';
import AmbientBackground from './components/AmbientBackground';
import TourGuide from './components/TourGuide';

// View router: one active view at a time, cross-faded by AnimatePresence.
const VIEW_COMPONENTS = {
  [VIEWS.BOOT]: BootSequence,
  [VIEWS.HUB]: Hub,
  [VIEWS.HANDSHAKE]: Handshake,
  [VIEWS.PROXMOX]: ProxmoxWorld,
  [VIEWS.VULNS]: VulnsWorld,
};

function Shell() {
  const { state } = useApp();
  const View = VIEW_COMPONENTS[state.view];
  return (
    <>
      <AmbientBackground />
      {state.view !== VIEWS.BOOT && <TelemetryBar />}
      <AnimatePresence mode="wait">
        <View key={state.view} />
      </AnimatePresence>
      <TourGuide />
    </>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AppProvider>
        <Shell />
        <Scanlines />
      </AppProvider>
    </MotionConfig>
  );
}
