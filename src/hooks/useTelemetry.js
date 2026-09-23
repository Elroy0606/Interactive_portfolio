import { useEffect, useState } from 'react';

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const drift = (v, amp, min, max) => clamp(v + (Math.random() - 0.5) * amp, min, max);

/** Mock system stats on a 1s tick. Purely decorative. */
export default function useTelemetry() {
  const [t, setT] = useState(() => ({ cpu: 23, mem: 41, down: 12.4, up: 3.1, now: new Date() }));

  useEffect(() => {
    const id = setInterval(() => {
      setT((p) => ({
        cpu: drift(p.cpu, 14, 6, 82),
        mem: drift(p.mem, 2, 35, 58),
        down: drift(p.down, 8, 0.5, 95),
        up: drift(p.up, 3, 0.2, 30),
        now: new Date(),
      }));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return t;
}

/** A value that wobbles around `base`; used for "live" meters. */
export function useJitter(base, range = 8, ms = 1800) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => {
      setV(clamp(base + (Math.random() - 0.5) * 2 * range, 2, 98));
    }, ms + Math.random() * 600);
    return () => clearInterval(id);
  }, [base, range, ms]);
  return v;
}
