import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Boxes, Container as ContainerIcon, Network } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { CONTAINERS, getContainer } from '../../data/containers';
import { getService } from '../../data/services';
import useTraces from '../../hooks/useTraces';
import useTerminal from '../../hooks/useTerminal';
import GlitchText from '../ui/GlitchText';
import Meter from '../ui/Meter';
import TraceLayer from '../ui/TraceLayer';
import Tip from '../ui/Tip';
import DataHUD from '../proxmox/DataHUD';
import ContainerCard from './ContainerCard';
import { sfx } from '../../lib/sound';

const MANIFEST_LINE = [
  { text: `> CONTAINER_OVERVIEW: This panel indexes 4 core services running in my Docker environment, including my local AI models and security testing tools.`, pause: 0 }, 
];

// Drill-down view for the Docker node: an engine hub with the services running
// inside it, wired together with schematic traces.
export default function DockerSubView() {
  const { state, dispatch } = useApp();
  const docker = getService('docker');
  const active = getContainer(state.activeContainerId);
  const [hoveredId, setHoveredId] = useState(null);
  const { pos } = useTerminal(MANIFEST_LINE, { speed: 14 });

  const stageRef = useRef(null);
  const hubRef = useRef(null);
  const nodeEls = useRef({});
  const registerNode = useCallback((id, el) => {
    nodeEls.current[id] = el;
  }, []);

  const traces = useTraces(stageRef, (rel) => {
    const hubEl = hubRef.current;
    if (!hubEl) return [];
    const hub = rel(hubEl);
    return CONTAINERS.flatMap((c) => {
      const el = nodeEls.current[c.id];
      if (!el) return [];
      const n = rel(el);
      const left = c.side === 'left';
      return [
        {
          id: c.id,
          accent: c.accent,
          x1: left ? hub.left : hub.right,
          y1: hub.top + hub.height * (c.row === 1 ? 0.28 : 0.72),
          x2: left ? n.right : n.left,
          y2: n.cy,
        },
      ];
    });
  });

  const exit = useCallback(() => {
    sfx.close();
    dispatch({ type: 'ZOOM_EXIT' });
  }, [dispatch]);

  // Esc backs out to the lab, unless a drawer is open (the drawer handles Esc itself).
  useEffect(() => {
    if (state.activeContainerId) return undefined;
    const onKey = (e) => e.key === 'Escape' && exit();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.activeContainerId, exit]);

  const select = useCallback((id) => dispatch({ type: 'OPEN_CONTAINER', id }), [dispatch]);
  const closeHud = useCallback(() => dispatch({ type: 'CLOSE_CONTAINER' }), [dispatch]);

  return (
    <>
      <motion.section
        aria-label="Docker container substrate manifest"
        initial={{ opacity: 0, scale: 1.06 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <button type="button" className="btn-cyber mb-4" onClick={exit}>
              <ArrowLeft size={14} aria-hidden /> [RETURN_TO_PROXMOX]
            </button>
            <p className="font-mono text-xs tracking-[0.3em] text-matrix">[SECTOR 01 ▸ NODE {docker.slot}] // ACCESS_GRANTED</p>
            <h1 className="mt-1 break-words font-mono text-xl font-bold leading-tight text-cyber text-glow sm:text-3xl">
              <GlitchText auto>DOCKER_INFRASTRUCTURE</GlitchText>
            </h1>
            <p className="mt-2 min-h-[1.5em] font-mono text-xs text-white/50">
              {MANIFEST_LINE[0].text.slice(0, pos.i > 0 ? undefined : pos.c)}
              <span className="cursor-block text-cyber" />
            </p>
          </div>

          <div className="flex flex-wrap gap-2 font-mono text-[11px] tracking-widest">
            <Tip label="CONTAINER HOST" side="bottom">
              <span className="flex items-center gap-2 border border-cyber/30 bg-cyber/5 px-2.5 py-1.5 text-cyber">
                <ContainerIcon size={13} aria-hidden /> HOST: {docker.slot}
              </span>
            </Tip>
            <Tip label="SERVICES RUNNING" side="bottom">
              <span className="flex items-center gap-2 border border-matrix/30 bg-matrix/5 px-2.5 py-1.5 text-matrix">
                <Boxes size={13} aria-hidden /> SERVICES: {CONTAINERS.length}/{CONTAINERS.length}
              </span>
            </Tip>
          </div>
        </div>

        <div className="relative overflow-hidden border border-cyber/25 shadow-[0_0_50px_rgba(0,240,255,0.07)]">
          <div ref={stageRef} className="blueprint-grid relative p-4 sm:p-6 lg:flex lg:min-h-[66vh] lg:flex-col lg:justify-center lg:px-10 lg:py-14">
            <div aria-hidden className="pointer-events-none absolute left-3 top-2 font-mono text-[10px] tracking-[0.25em] text-cyber/50">
              SUBSTRATE // DOCKER_ENGINE
            </div>
            <div aria-hidden className="pointer-events-none absolute right-3 top-2 font-mono text-[10px] tracking-[0.25em] text-cyber/50">
              NET: docker0 · BRIDGE
            </div>
            <div aria-hidden className="pointer-events-none absolute bottom-2 left-3 font-mono text-[10px] tracking-[0.25em] text-cyber/40">
              FIG.02 — CONTAINER_TOPOLOGY
            </div>

            <TraceLayer traces={traces} hoveredId={hoveredId} activeId={state.activeContainerId} />

            <div className="relative grid gap-5 lg:grid-cols-[1fr_minmax(260px,320px)_1fr] lg:gap-x-14 lg:gap-y-8">
              {/* Engine hub */}
              <div
                ref={hubRef}
                style={{ '--accent': '#00f0ff', '--led': '#00f0ff' }}
                className="accent-glow accent-border relative border bg-panel/90 p-4 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center"
              >
                <div className="flex items-center gap-3">
                  <div className="accent-text accent-border flex h-12 w-12 shrink-0 items-center justify-center border bg-cyber/[0.06]">
                    <ContainerIcon size={24} strokeWidth={1.5} aria-hidden />
                  </div>
                  <div className="min-w-0 font-mono">
                    <div className="accent-text text-glow text-[13px] font-bold tracking-wide">DOCKER_ENGINE</div>
                    <div className="text-[10px] tracking-widest text-white/45">{docker.slot} · COMPOSE STACKS</div>
                  </div>
                  <span className="led ml-auto" aria-hidden />
                </div>
                <dl className="mt-3 divide-y divide-white/5 border border-white/10 font-mono text-[11px]">
                  {docker.config.slice(1, 5).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3 px-2.5 py-1">
                      <dt className="text-white/40">{k}</dt>
                      <dd className="accent-text text-right">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Meter label="CPU" value={34} />
                  <Meter label="MEM" value={52} range={4} />
                </div>
                <div className="mt-3 flex items-center gap-2 font-mono text-[10px] tracking-widest text-white/40">
                  <Network size={12} aria-hidden /> BRIDGE NETWORK · {CONTAINERS.length} ATTACHED
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:contents">
                {CONTAINERS.map((c) => (
                  <ContainerCard
                    key={c.id}
                    container={c}
                    registerNode={registerNode}
                    hot={hoveredId === c.id || state.activeContainerId === c.id}
                    onHover={setHoveredId}
                    onSelect={select}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center font-mono text-[11px] tracking-[0.2em] text-white/30">
          [ CLICK A SERVICE TO OPEN ITS DATA_HUD · ESC TO RETURN ]
        </p>
      </motion.section>

      {/* Sibling of the scaled section so its ancestors never get a transform */}
      <AnimatePresence>
        {active && (
          <DataHUD
            key={active.id}
            eyebrow={`CONTAINER_HUD // ${active.kind}`}
            service={active}
            onClose={closeHud}
          />
        )}
      </AnimatePresence>
    </>
  );
}
