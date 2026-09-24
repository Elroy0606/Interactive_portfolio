import { useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { SERVICES } from '../../data/services';
import { ZOOM, ZOOM_MS } from '../../state/AppContext';
import useTraces from '../../hooks/useTraces';
import useMediaQuery from '../../hooks/useMediaQuery';
import useCameraZoom, { measurePose } from '../../hooks/useCameraZoom';
import { cn } from '../../lib/cn';
import TraceLayer from '../ui/TraceLayer';
import Rack from './Rack';
import NodeCard from './NodeCard';

// Blueprint stage: rack in the centre, service nodes around it, animated
// circuit traces linking each rack slot to its node (desktop only).
//
// Camera (hooks/useCameraZoom): `camera` (the padded grid layer) is what zooms.
// On desktop it translates the target node to the stage centre and scales up
// around it; on small screens (tall stacked layout) it only fades. Everything
// except the target fades/blurs via the `.zoomable.is-dim` class.
//
// Every node (or its rack slot) click calls onDrill(id, pose) so the camera
// centres on it; the parent decides whether that opens a sub-view or a centered
// info board. While an info board is open (zoom === 'inside') this stage stays
// mounted, zoomed and faded out behind it.
//
// Props: zoom (ZOOM.*), zoomTarget, pose (camera pose captured at click time,
// kept by the parent so the reverse zoom can start from the same place).
export default function Blueprint({ hoveredId, activeId, onHover, onDrill, zoom, zoomTarget, pose }) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const cameraRef = useRef(null);
  const rackRef = useRef(null);
  const slotEls = useRef({});
  const nodeEls = useRef({});

  const registerSlot = useCallback((id, el) => {
    slotEls.current[id] = el;
  }, []);
  const registerNode = useCallback((id, el) => {
    nodeEls.current[id] = el;
  }, []);

  const traces = useTraces(
    cameraRef,
    (rel) => {
      const rack = rackRef.current;
      if (!rack) return [];
      const rk = rel(rack);
      return SERVICES.flatMap((svc) => {
        const slot = slotEls.current[svc.id];
        const node = nodeEls.current[svc.id];
        if (!slot || !node) return [];
        const sl = rel(slot);
        const nd = rel(node);
        const left = svc.side === 'left';
        return [
          {
            id: svc.id,
            accent: svc.accent,
            x1: left ? rk.left : rk.right,
            y1: sl.cy,
            x2: left ? nd.right : nd.left,
            y2: nd.cy,
          },
        ];
      });
    },
    zoom === ZOOM.NONE, // rects are distorted while the camera is transformed
  );

  // Selecting a node measures where to point the camera, then hands off.
  const handleSelect = (id) => {
    const cam = cameraRef.current;
    const node = nodeEls.current[id];
    if (!cam || !node) return;
    onDrill(id, measurePose(cam, node, { scale: isDesktop ? 2.4 : 1.12, pan: isDesktop }));
  };

  const { dim, cameraProps } = useCameraZoom({ phase: zoom, pose, ms: ZOOM_MS });

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden border border-cyber/25 shadow-[0_0_50px_rgba(0,240,255,0.07)]',
        zoom !== ZOOM.NONE && 'pointer-events-none',
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      <motion.div
        ref={cameraRef}
        className="blueprint-grid relative p-4 sm:p-6 lg:flex lg:min-h-[74vh] lg:flex-col lg:justify-center lg:px-10 lg:py-14"
        {...cameraProps}
      >
        {/* blueprint chrome */}
        <div aria-hidden className="pointer-events-none absolute left-3 top-2 font-mono text-[10px] tracking-[0.25em] text-cyber/50">
          PVE Blueprint
        </div>
        <div aria-hidden className="pointer-events-none absolute right-3 top-2 font-mono text-[10px] tracking-[0.25em] text-cyber/50">
          SCALE 1:1 · SCHEMATIC
        </div>
        <div aria-hidden className="pointer-events-none absolute bottom-2 left-3 font-mono text-[10px] tracking-[0.25em] text-cyber/40">
          FIG.01 — HOME_LAB_TOPOLOGY
        </div>

        <TraceLayer traces={traces} hoveredId={hoveredId} activeId={activeId} visible={zoom === ZOOM.NONE} />

        <div className="relative grid gap-5 lg:grid-cols-[1fr_minmax(280px,340px)_1fr] lg:gap-x-14 lg:gap-y-8">
          <Rack
            rackRef={rackRef}
            registerSlot={registerSlot}
            hoveredId={hoveredId}
            activeId={activeId}
            onHover={onHover}
            onSelect={handleSelect}
            className={cn('zoomable', dim && 'is-dim')}
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:contents">
            {SERVICES.map((svc) => (
              <NodeCard
                key={svc.id}
                service={svc}
                registerNode={registerNode}
                hot={hoveredId === svc.id || activeId === svc.id}
                dim={dim && svc.id !== zoomTarget}
                onHover={onHover}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
