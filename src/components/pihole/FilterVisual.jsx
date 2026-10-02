import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import { Check, Flame, X } from 'lucide-react';
import { BLOCKLIST_PREVIEW, FLOW_SAMPLES } from '../../data/dns';

// Geometry (px) of the filter box; the lane runs left→right at LANE_Y.
const BOX_H = 176;
const LANE_Y = 62;
const DROP_Y = 146;

const TOKEN_TONE = {
  null: 'border-cyber/60 bg-cyber/10 text-cyber',
  allow: 'border-matrix/70 bg-matrix/15 text-matrix',
  block: 'border-danger/70 bg-danger/15 text-danger',
};

// [FILTERING_LOGIC]: a DNS query travels the lane to the blocklist gate.
//  - blocked domain: gate flashes a red X and the token drops into the incinerator
//  - allowed domain: gate flashes a green check and the token continues out the right side
// inRef / outRef are invisible anchors the parent uses to attach the flow traces.
export default function FilterVisual({ inRef, outRef }) {
  const controls = useAnimationControls();
  const [query, setQuery] = useState(FLOW_SAMPLES[0]);
  const [verdict, setVerdict] = useState(null); // null | 'allow' | 'block'

  useEffect(() => {
    let alive = true;
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      let i = 0;
      while (alive) {
        const q = FLOW_SAMPLES[i++ % FLOW_SAMPLES.length];
        setQuery(q);
        setVerdict(null);
        controls.set({ left: '20%', top: LANE_Y, opacity: 0, scale: 1 });
        await controls.start({ opacity: 1, transition: { duration: 0.2 } });
        if (!alive) return;
        await controls.start({ left: '50%', transition: { duration: 0.9, ease: 'linear' } });
        if (!alive) return;
        setVerdict(q.blocked ? 'block' : 'allow');
        await sleep(550);
        if (!alive) return;
        if (q.blocked) {
          await controls.start({ top: DROP_Y, scale: 0.3, opacity: 0, transition: { duration: 0.6, ease: 'easeIn' } });
        } else {
          await controls.start({ left: '86%', opacity: 0, transition: { duration: 0.8, ease: 'linear' } });
        }
        if (!alive) return;
        await sleep(200);
      }
    })();
    return () => {
      alive = false;
      controls.stop();
    };
  }, [controls]);

  const burning = verdict === 'block';

  return (
    <div
      className="relative overflow-hidden border border-white/10 bg-black/40"
      style={{ height: BOX_H }}
      role="img"
      aria-label="Animation: DNS queries reach the blocklist gate; ad domains are dropped into an incinerator, safe domains pass through"
    >
      {/* lane */}
      <div aria-hidden className="absolute inset-x-0 h-px bg-cyber/30" style={{ top: LANE_Y }} />
      <span ref={inRef} aria-hidden className="absolute left-0 h-px w-px" style={{ top: LANE_Y }} />
      <span ref={outRef} aria-hidden className="absolute right-0 h-px w-px" style={{ top: LANE_Y }} />

      {/* gate */}
      <div
        aria-hidden
        className={`absolute left-1/2 w-[2px] -translate-x-1/2 transition-colors duration-200 ${
          burning ? 'bg-danger shadow-[0_0_10px_var(--glow-danger)]' : verdict === 'allow' ? 'bg-matrix shadow-[0_0_10px_var(--glow-matrix)]' : 'bg-cyber/60 shadow-[0_0_8px_color-mix(in_srgb,var(--glow-cyber)_50%,transparent)]'
        }`}
        style={{ top: 14, height: LANE_Y + 28 }}
      />
      <div aria-hidden className="absolute left-1/2 top-1 -translate-x-1/2 font-ui text-[8px] track-25 text-white/40">
        BLOCKLIST
      </div>

      {/* verdict icon */}
      <AnimatePresence>
        {verdict && (
          <motion.div
            key={`${query.domain}-${verdict}`}
            aria-hidden
            className={`absolute left-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border ${
              verdict === 'block' ? 'border-danger bg-danger/20 text-danger shadow-[0_0_14px_var(--glow-danger)]' : 'border-matrix bg-matrix/20 text-matrix shadow-[0_0_14px_var(--glow-matrix)]'
            }`}
            style={{ top: LANE_Y + 22 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          >
            {verdict === 'block' ? <X size={14} strokeWidth={3} /> : <Check size={14} strokeWidth={3} />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* blocklist preview */}
      <ul aria-hidden className="absolute bottom-1.5 left-2 space-y-0.5 font-mono text-[8.5px] leading-tight text-danger/60">
        {BLOCKLIST_PREVIEW.map((d) => (
          <li key={d} className="line-through decoration-danger/70">
            {d}
          </li>
        ))}
      </ul>
      <div aria-hidden className="absolute bottom-1.5 right-2 font-ui text-[8.5px] tracking-widest text-matrix/50">
        PASS ▸
      </div>

      {/* incinerator */}
      <div
        aria-hidden
        className={`absolute bottom-1.5 left-1/2 flex -translate-x-1/2 flex-col items-center transition-all duration-200 ${
          burning ? 'text-warn drop-shadow-[0_0_10px_var(--glow-warn)]' : 'text-warn/50'
        }`}
      >
        <Flame size={burning ? 20 : 16} className={burning ? 'animate-pulse' : ''} />
        <span className="font-ui text-[7px] track-10">INCINERATOR</span>
      </div>

      {/* travelling query */}
      <motion.div
        animate={controls}
        initial={{ left: '20%', top: LANE_Y, opacity: 0 }}
        className={`absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap border px-1.5 py-0.5 font-mono text-[10px] transition-colors duration-150 ${TOKEN_TONE[verdict]}`}
      >
        {query.domain}
      </motion.div>
    </div>
  );
}
