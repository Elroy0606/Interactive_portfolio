import { useJitter } from '../../hooks/useTelemetry';

// Thin horizontal bar that wobbles around `value` (0-100). Colour comes from --accent.
export default function Meter({ label, value, range = 8, className = '' }) {
  const v = useJitter(value, range);
  return (
    <div className={className}>
      <div className="mb-1 flex justify-between font-ui text-[10px] tracking-widest text-white/50">
        <span>{label}</span>
        <span className="accent-text">{Math.round(v)}%</span>
      </div>
      <div className="h-1.5 w-full bg-white/10">
        <div
          className="h-full transition-[width] duration-700 ease-out"
          style={{
            width: `${v}%`,
            background: 'var(--accent, var(--color-cyber))',
            boxShadow: '0 0 8px var(--glow-accent)',
          }}
        />
      </div>
    </div>
  );
}
