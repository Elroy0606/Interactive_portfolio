import { useCallback, useEffect, useRef, useState } from 'react';
import { sfx } from '../lib/sound';
import { useMotion } from '../theme/motion';

/**
 * Types `lines` out one character at a time.
 * lines: [{ text, tone?, pause? }]   pause = ms to wait after the line finishes.
 * Returns { pos: {i, c}, done, skip }.
 * Typing is a motion token: in a theme without it the full text shows at once.
 */
export default function useTerminal(lines, { speed = 14, onDone } = {}) {
  const { typing } = useMotion();
  const [pos, setPos] = useState(() => (typing ? { i: 0, c: 0 } : { i: lines.length, c: 0 }));
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const done = pos.i >= lines.length;

  useEffect(() => {
    if (done) {
      onDoneRef.current?.();
      return undefined;
    }
    const line = lines[pos.i];
    const typing = pos.c < line.text.length;
    const t = setTimeout(
      () => {
        if (typing) {
          if (pos.c % 3 === 0) sfx.key();
          setPos({ i: pos.i, c: pos.c + 1 });
        } else {
          setPos({ i: pos.i + 1, c: 0 });
        }
      },
      typing ? speed : (line.pause ?? 120),
    );
    return () => clearTimeout(t);
  }, [pos, done, lines, speed]);

  const skip = useCallback(() => setPos({ i: lines.length, c: 0 }), [lines.length]);

  // Theme switched mid-sentence to one without typing: finish the text.
  useEffect(() => {
    if (!typing) skip();
  }, [typing, skip]);

  return { pos, done, skip };
}
