import { useEffect } from 'react';

// Reading mode: while at least one component using this hook is mounted,
// <html> carries `data-reading`, and index.css fades out the moving background,
// the page grid and the CRT overlay so nothing moves behind or over a report.
// Counted, so a reader inside a reader (or two readers) cannot switch it off early.
let readers = 0;

export default function useReadingMode() {
  useEffect(() => {
    readers += 1;
    document.documentElement.dataset.reading = '';
    return () => {
      readers -= 1;
      if (readers === 0) delete document.documentElement.dataset.reading;
    };
  }, []);
}
