import useReadingMode from '../../hooks/useReadingMode';
import { cn } from '../../lib/cn';

// The page a report is read on (write-ups and vulnerability reports).
// It is opaque (`.reading-surface` in index.css: solid paper colour, own
// stacking context) and switches reading mode on, so the animated background
// and the CRT overlay are gone for as long as it is on screen.
export default function ReadingSurface({ as: Tag = 'article', className = '', children, ...rest }) {
  useReadingMode();
  return (
    <Tag className={cn('reading-surface mx-auto border border-white/10 p-5 sm:p-10', className)} {...rest}>
      {children}
    </Tag>
  );
}
