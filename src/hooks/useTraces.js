import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * Measures DOM elements and returns elbow-shaped schematic traces between them.
 *
 * stageRef : element the trace <svg> is positioned in (coordinates are relative to it)
 * compute  : (rel) => [{ id, accent, x1, y1, x2, y2, d?, label?, lx?, ly?, packets?, dur?, packetColor? }]
 *            `d` overrides the default elbow path; the rest is rendered by TraceLayer.
 *            rel(el) -> { left, right, top, bottom, width, height, cx, cy } in stage coords
 * enabled  : pass false while ancestors are transformed (rects would be distorted);
 *            traces measured earlier are kept and re-measured when enabled again.
 *
 * Re-measures on mount, resize, and shortly after (entrance animations, fonts).
 */
export default function useTraces(stageRef, compute, enabled = true) {
  const [traces, setTraces] = useState([]);
  const computeRef = useRef(compute);
  computeRef.current = compute;

  const measure = useCallback(() => {
    const stage = stageRef.current;
    if (!stage || !enabled) return;
    const s = stage.getBoundingClientRect();
    const ox = s.left + stage.clientLeft;
    const oy = s.top + stage.clientTop;
    const rel = (el) => {
      const r = el.getBoundingClientRect();
      const left = r.left - ox;
      const top = r.top - oy;
      return {
        left,
        top,
        right: left + r.width,
        bottom: top + r.height,
        width: r.width,
        height: r.height,
        cx: left + r.width / 2,
        cy: top + r.height / 2,
      };
    };
    setTraces(
      computeRef.current(rel).map((t) => {
        const mx = t.x1 + (t.x2 - t.x1) * 0.5;
        return { ...t, d: t.d ?? `M${t.x1} ${t.y1} H${mx} V${t.y2} H${t.x2}` };
      }),
    );
  }, [stageRef, enabled]);

  useLayoutEffect(() => {
    measure();
    const stage = stageRef.current;
    const ro = new ResizeObserver(measure);
    if (stage) ro.observe(stage);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure, stageRef]);

  useEffect(() => {
    const ids = [300, 900, 1800].map((ms) => setTimeout(measure, ms));
    return () => ids.forEach(clearTimeout);
  }, [measure]);

  return traces;
}
