import { cn } from '../../lib/cn';

// Animated schematic traces (from useTraces) with data-packet dots.
// Per-trace options: packets (dots in the stream, default 1), dur (seconds per
// lap), packetColor, and label + lx/ly (text drawn at that point).
// `visible` fades the whole layer (used while the camera is moving).
// Hidden below `lg` by default (stacked layouts); pass `mobile` to keep it.
//
// Colours are CSS values (usually tokens), so they are applied through `style`
// rather than SVG attributes; each trace sets `--accent` so its glow follows
// the theme's `--glow-accent`.
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
          <g key={t.id} opacity={anyHot ? (hot ? 1 : 0.35) : 0.85} style={{ '--accent': t.accent, transition: 'opacity .2s' }}>
            <path d={t.d} fill="none" strokeOpacity={0.25} strokeWidth={hot ? 3 : 1.5} style={{ stroke: 'var(--accent)' }} />
            <path
              d={t.d}
              fill="none"
              strokeWidth={hot ? 2 : 1.25}
              className="trace"
              style={{ stroke: 'var(--accent)', filter: `drop-shadow(0 0 ${hot ? 6 : 3}px var(--glow-accent))` }}
            />
            <circle cx={t.x1} cy={t.y1} r={3.5} style={{ fill: 'var(--accent)' }} />
            <circle cx={t.x2} cy={t.y2} r={3.5} style={{ fill: 'var(--accent)' }} />
            {Array.from({ length: packets }, (_, i) => (
              <circle key={i} r={2.5} style={{ fill: t.packetColor ?? 'var(--color-white)' }}>
                <animateMotion dur={`${dur}s`} begin={`${-(dur * i) / packets}s`} repeatCount="indefinite" path={t.d} />
              </circle>
            ))}
            {t.label && (
              <text
                x={t.lx}
                y={t.ly}
                textAnchor={t.anchor ?? 'middle'}
                strokeWidth={4}
                paintOrder="stroke"
                style={{
                  fill: 'var(--accent)',
                  stroke: 'var(--color-blueprint)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 9,
                  letterSpacing: 'calc(0.12em * var(--track))',
                }}
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
