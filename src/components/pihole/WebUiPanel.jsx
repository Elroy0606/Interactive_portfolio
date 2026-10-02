import { motion } from 'framer-motion';

const fmt = (n) => n.toLocaleString('en-US');

function Tile({ label, value, tone, sub }) {
  return (
    <div className={`border bg-black/30 p-3 ${tone.border}`}>
      <div className={`font-ui text-[9px] track-20 ${tone.label}`}>{label}</div>
      <div className={`mt-1 font-ui text-2xl font-bold tabular-nums leading-none sm:text-3xl xl:text-2xl 2xl:text-3xl ${tone.value}`}>{value}</div>
      <div className="mt-1.5 font-ui text-[9px] tracking-widest text-white/35">{sub}</div>
    </div>
  );
}

// Simulated Pi-hole admin dashboard fed by useDnsSimulation.
export default function WebUiPanel({ sim }) {
  const maxBucket = Math.max(7, ...sim.history.map(([a, b]) => a + b));
  const recent = sim.log.slice(-9);

  return (
    <section
      aria-label="Simulated Pi-hole web interface telemetry"
      className="relative flex flex-col border border-cyber/30 bg-panel/50 shadow-[0_0_40px_color-mix(in_srgb,var(--glow-pihole)_10%,transparent)] backdrop-blur-md"
    >
      {/* window chrome */}
      <div className="flex items-center gap-3 border-b border-cyber/20 bg-black/30 px-3 py-2 font-ui text-[10px] tracking-widest">
        <span className="flex gap-1" aria-hidden>
          <span className="h-2 w-2 rounded-full bg-danger/70" />
          <span className="h-2 w-2 rounded-full bg-warn/70" />
          <span className="h-2 w-2 rounded-full bg-matrix/70" />
        </span>
        <span className="min-w-0 flex-1 truncate text-cyber/80">PI-HOLE_WEB_INTERFACE_TELEMETRY</span>
        <span className="flex shrink-0 items-center gap-1.5 text-matrix">
          <span className="led" aria-hidden /> ACTIVE
        </span>
      </div>
      <div className="border-b border-white/5 px-3 py-1 font-mono text-[10px] text-white/30">http://pi.hole/admin · simulated data</div>

      <div className="space-y-4 p-3 sm:p-4">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <Tile
            label="TOTAL QUERIES"
            value={fmt(sim.total)}
            sub="LAST 24H"
            tone={{ border: 'border-pihole/40', label: 'text-pihole/80', value: 'text-pihole' }}
          />
          <Tile
            label="QUERIES BLOCKED"
            value={fmt(sim.blocked)}
            sub="ADS & TRACKERS"
            tone={{ border: 'border-danger/40', label: 'text-danger/80', value: 'text-danger' }}
          />
          <Tile
            label="PERCENT BLOCKED"
            value={`${sim.percent.toFixed(1)}%`}
            sub="OF ALL QUERIES"
            tone={{ border: 'border-warn/40', label: 'text-warn/80', value: 'text-warn' }}
          />
        </div>

        {/* stacked mini chart: allowed (blue) + blocked (red) per tick */}
        <div>
          <div className="mb-1 flex justify-between font-ui text-[9px] track-20 text-white/40">
            <span>QUERIES OVER TIME</span>
            <span>
              <span className="text-pihole">■</span> ALLOWED <span className="text-danger">■</span> BLOCKED
            </span>
          </div>
          <div className="flex h-16 items-end gap-[2px] border border-white/10 bg-black/30 p-1" aria-hidden>
            {sim.history.map(([allowed, blocked], i) => (
              <div key={i} className="flex h-full flex-1 flex-col-reverse">
                <div className="bg-pihole/80" style={{ height: `${(allowed / maxBucket) * 100}%` }} />
                <div className="bg-danger/90" style={{ height: `${(blocked / maxBucket) * 100}%` }} />
              </div>
            ))}
          </div>
        </div>

        {/* live log */}
        <div>
          <div className="mb-1 font-ui text-[9px] track-20 text-white/40">QUERY_LOG // LIVE</div>
          <ul role="log" aria-live="off" className="flex h-[188px] flex-col justify-end overflow-hidden border border-white/10 bg-black/40 p-2 font-mono text-[10.5px]">
            {recent.map((q) => (
              <motion.li
                key={q.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="flex gap-2 whitespace-nowrap py-[1px]"
              >
                <span className="shrink-0 text-white/30">{q.time}</span>
                <span className={`w-14 shrink-0 ${q.blocked ? 'text-danger' : 'text-matrix'}`}>{q.blocked ? 'BLOCKED' : 'ALLOWED'}</span>
                <span className={`min-w-0 truncate ${q.blocked ? 'text-danger/80 line-through decoration-danger/40' : 'text-white/70'}`}>{q.domain}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
