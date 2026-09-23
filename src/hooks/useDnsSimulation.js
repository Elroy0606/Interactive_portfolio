import { useEffect, useState } from 'react';
import { ALLOWED_DOMAINS, BLOCKED_DOMAINS } from '../data/dns';

const BLOCK_RATE = 0.27;
const TICK_MS = 700;
const LOG_MAX = 40;
const BUCKETS = 24;

const pick = (list) => list[Math.floor(Math.random() * list.length)];
const hms = (d = new Date()) => d.toLocaleTimeString('en-GB');

function makeQuery(id) {
  const blocked = Math.random() < BLOCK_RATE;
  return { id, time: hms(), domain: pick(blocked ? BLOCKED_DOMAINS : ALLOWED_DOMAINS), blocked };
}

/**
 * Fake Pi-hole telemetry: counters, a rolling query log and a per-tick history
 * for the mini chart. Purely decorative.
 * Returns { total, blocked, percent, log, history } where history = [[allowed, blocked], ...].
 */
export default function useDnsSimulation() {
  const [s, setS] = useState(() => ({
    total: 12847,
    blocked: 3502,
    nextId: 0,
    log: [],
    history: Array.from({ length: BUCKETS }, () => [3, 1]),
  }));

  useEffect(() => {
    const id = setInterval(() => {
      setS((p) => {
        const n = 1 + Math.floor(Math.random() * 3);
        const queries = Array.from({ length: n }, (_, i) => makeQuery(p.nextId + i));
        const blockedN = queries.filter((q) => q.blocked).length;
        return {
          total: p.total + n,
          blocked: p.blocked + blockedN,
          nextId: p.nextId + n,
          log: [...p.log, ...queries].slice(-LOG_MAX),
          history: [...p.history.slice(1), [n - blockedN, blockedN]],
        };
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  return { ...s, percent: (s.blocked / s.total) * 100 };
}
