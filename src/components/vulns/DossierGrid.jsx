import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { DOSSIERS } from '../../data/dossiers';
import { ZOOM } from '../../state/AppContext';
import { useMotion } from '../../theme/motion';
import useCameraZoom, { measurePose } from '../../hooks/useCameraZoom';
import useMediaQuery from '../../hooks/useMediaQuery';
import { cn } from '../../lib/cn';
import DossierFolder from './DossierFolder';

// The folder shelf. Hovering glides the hovered folder forward and pushes the
// others aside (desktop). Clicking one aims the camera at it (useCameraZoom):
// it centres and scales up while the other folders blur away, then the parent
// swaps in the archive view.
//
// Props: phase (ZOOM.*), pose (kept by the parent for the reverse zoom),
// activeId (folder being opened), onOpen(id, pose).
export default function DossierGrid({ phase, pose, activeId, onOpen }) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const m = useMotion();
  const cameraRef = useRef(null);
  const folderEls = useRef({});
  const [hovered, setHovered] = useState(null); // index

  const { dim, cameraProps } = useCameraZoom({ phase, pose, ms: m.dossier });

  const open = (id) => {
    const cam = cameraRef.current;
    const el = folderEls.current[id];
    if (!cam || !el) return;
    onOpen(id, measurePose(cam, el, { scale: isDesktop ? m.zoomScale.dossier : Math.min(1.1, m.zoomScale.dossier), pan: isDesktop && m.pan }));
  };

  const hoveredDossier = hovered !== null ? DOSSIERS[hovered] : null;

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden border border-id-green/25 shadow-[0_0_50px_color-mix(in_srgb,var(--glow-matrix)_7%,transparent)]',
        phase !== ZOOM.NONE && 'pointer-events-none',
      )}
      {...m.fadeProps}
    >
      <motion.div ref={cameraRef} className="blueprint-grid relative px-4 pb-8 pt-6 sm:px-8 lg:flex lg:min-h-[66vh] lg:flex-col lg:justify-center lg:px-10 lg:py-12"
        {...cameraProps}
      >
        <div aria-hidden className="pointer-events-none absolute left-3 top-2 font-ui text-[10px] track-25 text-id-green/60">
          VAULT // SEC_OPS_GRID
        </div>
        <div aria-hidden className="pointer-events-none absolute right-3 top-2 hidden font-ui text-[10px] track-25 text-id-green/60 sm:block">
          {DOSSIERS.length} FOLDERS · SEALED
        </div>

        <div className="grid gap-x-8 gap-y-2 md:grid-cols-3">
          {DOSSIERS.map((d, i) => {
            const shift = !isDesktop || hovered === null || hovered === i ? 0 : i < hovered ? -14 : 14;
            return (
              <DossierFolder
                key={d.id}
                dossier={d}
                shift={shift}
                lively={m.tilt}
                hovered={hovered === i || activeId === d.id}
                dim={dim && d.id !== activeId}
                wrapRef={(el) => {
                  folderEls.current[d.id] = el;
                }}
                onHover={(v) => setHovered(v === null ? null : i)}
                onOpen={() => open(d.id)}
              />
            );
          })}
        </div>

        {/* terminal readout: the "sound cue" made visible */}
        <motion.p
          key={hoveredDossier?.id ?? 'idle'}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-6 min-h-[1.5em] break-words font-mono text-[11px] tracking-wider text-matrix/80 sm:text-xs"
          aria-live="polite"
        >
          {hoveredDossier
            ? `> peek ${hoveredDossier.code} :: ${hoveredDossier.title} :: ${hoveredDossier.reports.length} files :: clearance ${hoveredDossier.clearance}`
            : '> awaiting selection …'}
          <span className="cursor-block" />
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
