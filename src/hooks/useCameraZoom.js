import { useEffect, useState } from 'react';
import { ZOOM } from '../state/AppContext';

/**
 * Where the camera should point: origin = target centre (px, relative to the
 * camera element), dx/dy = translation that moves the target to the middle of
 * the visible screen (below the sticky telemetry bar) or, with `toViewport:
 * false`, to the middle of the camera element; 0 when `pan` is false.
 * Measure while the camera is at rest (untransformed).
 */
export function measurePose(cameraEl, targetEl, { scale, pan = true, toViewport = true }) {
  const c = cameraEl.getBoundingClientRect();
  const n = targetEl.getBoundingClientRect();
  const ox = n.left + n.width / 2 - c.left;
  const oy = n.top + n.height / 2 - c.top;
  let destX = c.left + c.width / 2;
  let destY = c.top + c.height / 2;
  if (toViewport) {
    const barBottom = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0;
    destX = window.innerWidth / 2;
    destY = (barBottom + window.innerHeight) / 2;
  }
  return {
    ox,
    oy,
    dx: pan ? destX - (n.left + n.width / 2) : 0,
    dy: pan ? destY - (n.top + n.height / 2) : 0,
    scale,
  };
}

/**
 * Camera zoom for a "stage" (Proxmox blueprint, dossier grid).
 *
 *   phase : ZOOM.* value (none / entering / inside / exiting)
 *   pose  : from measurePose, captured at click time and kept by the parent so
 *           the reverse zoom can start from the same place
 *   ms    : { entering, exiting } durations in ms (motion tokens `zoom` / `dossier`)
 *
 * Returns:
 *   dim         : true while everything except the target should fade/blur
 *                 (add `zoomable` + `is-dim` classes to those elements)
 *   cameraProps : spread onto the <motion.div> that zooms
 *
 * `inside` holds the zoomed, faded-out pose (used when a centered info board is
 * open over a stage that stays mounted). A stage that unmounts while `inside`
 * (sub-views) remounts already in the zoomed pose on `exiting`, then animates
 * back to rest while `dim` releases two frames later.
 */
export default function useCameraZoom({ phase, pose, ms }) {
  const [released, setReleased] = useState(false);
  useEffect(() => {
    if (phase === ZOOM.NONE) {
      setReleased(false);
      return undefined;
    }
    if (phase !== ZOOM.EXITING) return undefined;
    let raf2;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setReleased(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [phase]);

  const dim = phase === ZOOM.ENTERING || phase === ZOOM.INSIDE || (phase === ZOOM.EXITING && !released);

  const zoomed = pose && { x: pose.dx, y: pose.dy, scale: pose.scale };
  const initial = phase === ZOOM.EXITING && zoomed ? { ...zoomed, opacity: 0 } : false;
  let animate = { x: 0, y: 0, scale: 1, opacity: 1 };
  let transition = { duration: ms.exiting / 1000 - 0.05, ease: [0.22, 1, 0.36, 1] };
  if (zoomed && phase === ZOOM.ENTERING) {
    animate = { ...zoomed, opacity: [1, 1, 0] }; // fade out at the very end; the inside view fades in
    transition = {
      duration: ms.entering / 1000,
      ease: [0.65, 0, 0.35, 1],
      opacity: { duration: ms.entering / 1000, times: [0, 0.72, 1] },
    };
  } else if (zoomed && phase === ZOOM.INSIDE) {
    animate = { ...zoomed, opacity: 0 };
    transition = { duration: 0 };
  }
  const style = pose && phase !== ZOOM.NONE ? { originX: `${pose.ox}px`, originY: `${pose.oy}px` } : {};

  return { dim, cameraProps: { style, initial, animate, transition } };
}
