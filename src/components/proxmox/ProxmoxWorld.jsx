import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Boxes, HardDrive, MousePointerClick } from 'lucide-react';
import { useApp, ZOOM } from '../../state/AppContext';
import { useMotion } from '../../theme/motion';
import { HOST, SERVICES, getService } from '../../data/services';
import GlitchText from '../ui/GlitchText';
import Tip from '../ui/Tip';
import Blueprint from './Blueprint';
import DataHUD from './DataHUD';
import DockerSubView from '../docker/DockerSubView';
import PiholeSubView from '../pihole/PiholeSubView';
import AdLabSubView from '../adlab/AdLabSubView';
import { cn } from '../../lib/cn';
import { sfx } from '../../lib/sound';

// Nodes with a dedicated sub-view. Every other node (HAOS, Kali, Ollama) gets the
// generic centered info board (DataHUD) after the same camera zoom.
const SUB_VIEWS = {
  docker: DockerSubView,
  pihole: PiholeSubView,
  adlab: AdLabSubView,
};

export default function ProxmoxWorld() {
  const { state, dispatch } = useApp();
  const { zoom, zoomTarget, tourStep } = state;
  const { zoom: ZOOM_MS, viewProps } = useMotion();
  const [hoveredId, setHoveredId] = useState(null);
  // Camera pose captured when a node is clicked; kept here (not in Blueprint)
  // because Blueprint unmounts while a sub-view is showing and the reverse
  // zoom needs to start from the same pose.
  const [pose, setPose] = useState(null);

  const SubView = SUB_VIEWS[zoomTarget];
  const inside = zoom === ZOOM.INSIDE;
  const board = inside && !SubView ? getService(zoomTarget) : null; // info board over the zoomed stage

  // Phase timers: the camera animation lives in Blueprint, the hand-off lives here.
  useEffect(() => {
    if (zoom === ZOOM.ENTERING) {
      const t = setTimeout(() => dispatch({ type: 'ZOOM_ENTERED' }), ZOOM_MS.entering);
      return () => clearTimeout(t);
    }
    if (zoom === ZOOM.EXITING) {
      const t = setTimeout(() => dispatch({ type: 'ZOOM_EXITED' }), ZOOM_MS.exiting);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [zoom, dispatch, ZOOM_MS]);

  const closeBoard = useCallback(() => dispatch({ type: 'ZOOM_EXIT' }), [dispatch]);
  const zoomTo = useCallback(
    (id, nextPose) => {
      setPose(nextPose);
      setHoveredId(null);
      sfx.open();
      dispatch({ type: 'ZOOM_START', id });
    },
    [dispatch],
  );

  const showHeader = !(inside && SubView);

  return (
    <motion.main
      key="proxmox"
      className="mx-auto max-w-[1600px] px-4 pb-16 pt-6 sm:px-8 sm:pt-8"
      // opacity/scale only: clip-path or filter on this element would clip / re-anchor the fixed info board
      {...viewProps}
    >
      {showHeader && (
        <div
          className={cn(
            'mb-6 flex flex-wrap items-start justify-between gap-4 transition-opacity duration-500',
            (zoom === ZOOM.ENTERING || zoom === ZOOM.INSIDE) && 'pointer-events-none opacity-0',
          )}
        >
          <div>
            <button
              type="button"
              className="btn-cyber mb-4"
              onClick={() => {
                sfx.click();
                dispatch({ type: 'RETURN_TO_HUB' });
              }}
            >
              <ArrowLeft size={14} aria-hidden /> RETURN TO HOME
            </button>
            <p className="font-ui text-xs track-30 text-matrix">[SECTOR 01] // ACCESS_GRANTED</p>
            <h1 className="mt-1 font-ui text-3xl font-bold leading-tight text-cyber text-glow sm:text-4xl">
              <GlitchText auto>Home Lab</GlitchText>
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70">
              <span className="font-ui text-cyan-400">&gt; INFRA_OVERVIEW:</span> I built this home lab by repurposing my old laptop into a Proxmox hypervisor. 
              Connected globally via <span className="text-white font-semibold">Tailscale</span>, this lab runs a suite of containers I use to practice penetration testing, 
              orchestrate security exercises with <span className="text-white font-semibold">Kali Linux</span>, and run a local AI that controls my smart devices. 
              <span className="block mt-1 text-emerald-400 font-ui text-xs">
                [ACTION REQUIRED]: Click any module to focus the view. <br></br>Dive into DOCKER, PI-HOLE or WINDOWS_AD_LAB to ENTER the internal architecture.
              </span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2 font-ui text-[11px] tracking-widest">
            <Tip label={tourStep ? 'HIDE THE GUIDE CURSOR' : 'SHOW THE GUIDE CURSOR'} side="bottom">
              <button
                type="button"
                aria-pressed={Boolean(tourStep)}
                onClick={() => dispatch({ type: tourStep ? 'TOUR_OFF' : 'TOUR_ON' })}
                className={cn(
                  'flex items-center gap-2 border px-2.5 py-1.5 transition-colors',
                  tourStep
                    ? 'border-warn/50 bg-warn/10 text-warn hover:bg-warn/20'
                    : 'border-white/20 text-white/50 hover:border-warn/50 hover:text-warn',
                )}
              >
                <MousePointerClick size={13} aria-hidden /> GUIDE: {tourStep ? 'ON' : 'OFF'}
              </button>
            </Tip>
            <Tip label="PHYSICAL HOST" side="bottom">
              <span className="flex items-center gap-2 border border-cyber/30 bg-cyber/5 px-2.5 py-1.5 text-cyber">
                <HardDrive size={13} aria-hidden /> HOST: {HOST.name}
              </span>
            </Tip>
            <Tip label="GUESTS ONLINE" side="bottom">
              <span className="flex items-center gap-2 border border-matrix/30 bg-matrix/5 px-2.5 py-1.5 text-matrix">
                <Boxes size={13} aria-hidden /> NODES: {SERVICES.length}/{SERVICES.length}
              </span>
            </Tip>
          </div>
        </div>
      )}

      {inside && SubView ? (
        <SubView key={zoomTarget} />
      ) : (
        <Blueprint
          hoveredId={hoveredId}
          activeId={zoom !== ZOOM.NONE ? zoomTarget : null}
          onHover={setHoveredId}
          onDrill={zoomTo}
          zoom={zoom}
          zoomTarget={zoomTarget}
          pose={pose}
        />
      )}

      {zoom === ZOOM.NONE && (
        <p className="mt-4 text-center font-ui text-[11px] track-20 text-white/35">
          [ CLICK A MODULE · DOCKER_CONTAINERS, PI-HOLE_DNS AND WINDOWS_AD_LAB OPEN THEIR INTERNAL VIEWS ]
        </p>
      )}

      {/* Centered info board for nodes without a sub-view; the stage stays zoomed behind it. */}
      <AnimatePresence>{board && <DataHUD key={board.id} service={board} onClose={closeBoard} />}</AnimatePresence>
    </motion.main>
  );
}
