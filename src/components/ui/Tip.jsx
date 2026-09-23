import { cn } from '../../lib/cn';

// CSS-only tooltip; shows on hover and keyboard focus of the wrapped control.
export default function Tip({ label, children, side = 'top', block = false, className = '' }) {
  return (
    <span className={cn('group/tip relative', block ? 'flex w-full' : 'inline-flex', className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-sm',
          'border border-cyber/40 bg-void/95 px-2 py-1 font-mono text-[10px] tracking-widest text-cyber',
          'opacity-0 shadow-[0_0_12px_rgba(0,240,255,0.25)] transition-opacity duration-150',
          'group-hover/tip:opacity-100 group-focus-within/tip:opacity-100',
          side === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2',
        )}
      >
        {label}
      </span>
    </span>
  );
}
