import { cn } from '../../lib/cn';

// Chromatic-split glitch. Fires on hover of itself or any ancestor with `.group`;
// pass `auto` for a periodic idle glitch (hero titles).
export default function GlitchText({ children, auto = false, className = '' }) {
  return (
    <span data-text={children} className={cn('glitch', auto && 'glitch-auto', className)}>
      {children}
    </span>
  );
}
