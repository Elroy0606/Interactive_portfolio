import { motion } from 'framer-motion';
import { Crosshair, Globe, KeyRound, Network, ShieldX } from 'lucide-react';
import { useMotion } from '../../../theme/motion';
import { Frame, TONE, mix, pad } from './shared';

// ```netpath
// title: Optional heading
// Zone name | What the attacker did there | state
// ```
// States: attacker, breach, blocked, target (anything else = a plain zone).
// The attack path is drawn zone to zone. A `blocked` row is a dead end: it
// hangs off the zone before it with a dashed link, and the path carries on
// from that zone. Zones are named by role only (no addresses).
const STATE = {
  attacker: { color: TONE.danger, icon: Globe, label: 'ORIGIN' },
  breach: { color: TONE.warn, icon: KeyRound, label: 'FOOTHOLD' },
  blocked: { color: TONE.ok, icon: ShieldX, label: 'BLOCKED' },
  target: { color: TONE.magenta, icon: Crosshair, label: 'NEXT TARGET' },
};
const plain = { color: 'var(--accent)', icon: Network, label: 'ZONE' };

function Zone({ row, step, dashed = false }) {
  const [name, text, state = ''] = row;
  const s = STATE[state.toLowerCase()] ?? plain;
  const Icon = s.icon;
  return (
    <div
      className={`relative border bg-panel/90 p-3 ${dashed ? 'border-dashed' : ''}`}
      style={{ borderColor: mix(s.color, 50) }}
    >
      <div className="flex items-center gap-2">
        <span className="grid h-6 w-6 shrink-0 place-items-center border" style={{ color: s.color, borderColor: mix(s.color, 45) }}>
          <Icon size={13} aria-hidden />
        </span>
        <span className="font-ui text-[10px] tracking-widest" style={{ color: s.color }}>
          {pad(step)} · {s.label}
        </span>
      </div>
      <p className="mt-2 font-ui text-[13px] font-bold leading-snug text-white">{name}</p>
      {text && <p className="mt-1 text-[13px] leading-snug text-white/75">{text}</p>}
    </div>
  );
}

export default function NetPath({ meta, rows }) {
  const { revealProps } = useMotion();
  // Group into the main path; blocked rows become branches of the zone before them.
  const chain = [];
  rows.forEach((row, i) => {
    const entry = { row, step: i + 1 };
    if ((row[2] ?? '').toLowerCase() === 'blocked' && chain.length) chain[chain.length - 1].branches.push(entry);
    else chain.push({ ...entry, branches: [] });
  });

  return (
    <Frame kind="ATTACK_PATH" title={meta.title} caption={meta.caption}>
      <ol className="flex flex-col md:flex-row md:items-start">
        {chain.map((z, i) => (
          <motion.li key={z.step} className="flex flex-col md:min-w-0 md:flex-1 md:flex-row md:items-start" {...revealProps(i)}>
            <div className="flex flex-1 flex-col">
              <Zone row={z.row} step={z.step} />
              {z.branches.map((b) => (
                <div key={b.step} className="flex flex-col pl-6 md:pl-0">
                  <span aria-hidden className="relative ml-4 h-6 w-0 border-l border-dashed" style={{ borderColor: TONE.danger }}>
                    <span className="absolute -left-[5px] top-1/2 -translate-y-1/2 font-ui text-[11px] font-bold leading-none" style={{ color: TONE.danger }}>
                      ✕
                    </span>
                  </span>
                  <Zone row={b.row} step={b.step} dashed />
                </div>
              ))}
            </div>
            {i < chain.length - 1 && (
              <span aria-hidden className="flow-link md:mt-12" style={{ '--flow-delay': `${i * 0.35}s`, '--accent': TONE.danger }} />
            )}
          </motion.li>
        ))}
      </ol>
    </Frame>
  );
}
