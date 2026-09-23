import { cn } from '../../lib/cn';

// Animated schematic traces (from useTraces) with data-packet dots.
// Per-trace options: packets (dots in the stream, default 1), dur (seconds per
// lap), packetColor, and label + lx/ly (text drawn at that point).
// `visible` fades the whole layer (used while the camera is moving).
// Hidden below `lg` by default (stacked layouts); pass `mobile` to keep it.
export default function TraceLayer({ traces, hoveredId, activeId, visible = true, mobile = false }) {
  const anyHot = Boolean(hoveredId || activeId);
  return (
    <svg
      aria-hidden
      className={cn('zoomable pointer-events-none absolute inset-0 h-full w-full overflow-visible', !mobile && 'hidden lg:block')}
      style={{ opacity: visible ? 1 : 0 }}
    >
      {traces.map((t) => {
        const hot = hoveredId === t.id || activeId === t.id;
        const packets = t.packets ?? 1;
        const dur = t.dur ?? 3.2;
        return (
          <g key={t.id} opacity={anyHot ? (hot ? 1 : 0.35) : 0.85} style={{ transition: 'opacity .2s' }}>
            <path d={t.d} fill="none" stroke={t.accent} strokeOpacity={0.25} strokeWidth={hot ? 3 : 1.5} />
            <path
              d={t.d}
              fill="none"
              stroke={t.accent}
              strokeWidth={hot ? 2 : 1.25}
              className="trace"
              style={{ filter: `drop-shadow(0 0 ${hot ? 6 : 3}px ${t.accent})` }}
            />
            <circle cx={t.x1} cy={t.y1} r={3.5} fill={t.accent} />
            <circle cx={t.x2} cy={t.y2} r={3.5} fill={t.accent} />
            {Array.from({ length: packets }, (_, i) => (
              <circle key={i} r={2.5} fill={t.packetColor ?? '#fff'}>
                <animateMotion dur={`${dur}s`} begin={`${-(dur * i) / packets}s`} repeatCount="indefinite" path={t.d} />
              </circle>
            ))}
            {t.label && (
              <text
                x={t.lx}
                y={t.ly}
                textAnchor={t.anchor ?? 'middle'}
                fill={t.accent}
                stroke="#08121a"
                strokeWidth={4}
                paintOrder="stroke"
                style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em' }}
              >
                {t.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
