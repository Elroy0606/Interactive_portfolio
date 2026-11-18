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
// The shelf has as many columns as there are folders, up to 3; four make a 2 x 2
// grid. Five or more wrap in rows of 3. Hover shifts only move folders in the same row.
// `row` (track page): every folder on one line on lg (up to 4), 2 per row on md.
const COLS = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:mx-auto md:w-full md:max-w-4xl md:grid-cols-2' };
const ROW_COLS = { 1: '', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-2 lg:grid-cols-4' };
const colsOf = (n, row, desktop) => (row ? (desktop || n < 4 ? Math.min(n, 4) : 2) : n === 4 ? 2 : Math.min(n, 3));

// Props: phase (ZOOM.*), pose (kept by the parent for the reverse zoom),
// activeId (folder being opened), onOpen(id, pose).
// Sector 03 reuses the shelf with its own folders and wording:
//   folders   [{ id, code, title, blurb, accent, reports }]   (default: DOSSIERS)
//   frame     { left, right, border, label }   corner labels + frame / label colour classes
//   peek(f)   terminal readout while a folder is hovered
//   labelsFor(f)  `labels` for DossierFolder
const defaultPeek = (d) => `> peek ${d.code} :: ${d.title} :: ${d.reports.length} files :: clearance ${d.clearance}`;

export default function DossierGrid({ phase, pose, activeId, onOpen, folders = DOSSIERS, frame, peek = defaultPeek, labelsFor, row = false }) {
  const F = {
    left: 'VAULT // SEC_OPS_GRID',
    right: `${folders.length} FOLDERS · SEALED`,
    border: 'border-id-green/25',
    label: 'text-id-green/60',
    ...frame,
  };
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

  const hoveredDossier = hovered !== null ? folders[hovered] : null;

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden border shadow-[0_0_50px_color-mix(in_srgb,var(--glow-matrix)_7%,transparent)]',
        F.border,
        phase !== ZOOM.NONE && 'pointer-events-none',
      )}
      {...m.fadeProps}
    >
      <motion.div ref={cameraRef} className={cn('blueprint-grid relative px-4 pb-8 pt-6 sm:px-8 lg:flex lg:flex-col lg:justify-center', row ? 'lg:px-6 lg:py-8 2xl:px-10' : 'lg:min-h-[66vh] lg:px-10 lg:py-12')}
        {...cameraProps}
      >
        <div aria-hidden className={cn('pointer-events-none absolute left-3 top-2 font-ui text-[10px] track-25', F.label)}>
          {F.left}
        </div>
        <div aria-hidden className={cn('pointer-events-none absolute right-3 top-2 hidden font-ui text-[10px] track-25 sm:block', F.label)}>
          {F.right}
        </div>

        <div className={cn('grid gap-y-2', row ? cn('gap-x-6 lg:gap-x-4 2xl:gap-x-8', ROW_COLS[Math.min(folders.length, 4)] ?? 'md:grid-cols-2 lg:grid-cols-4') : cn('gap-x-8', COLS[folders.length > 4 ? 3 : folders.length]))}>
          {folders.map((d, i) => {
            const cols = colsOf(folders.length, row, isDesktop);
            const sameRow = hovered !== null && Math.floor(i / cols) === Math.floor(hovered / cols);
            const shift = !isDesktop || !sameRow || hovered === i ? 0 : i < hovered ? -14 : 14;
            return (
              <DossierFolder
                key={d.id}
                dossier={d}
                shift={shift}
                lively={m.tilt}
                compact={row}
                hovered={hovered === i || activeId === d.id}
                dim={dim && d.id !== activeId}
                labels={labelsFor?.(d)}
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
            ? peek(hoveredDossier)
            : '> awaiting selection …'}
          <span className="cursor-block" />
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
