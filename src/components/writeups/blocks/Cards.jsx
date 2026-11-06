import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { useMotion } from '../../../theme/motion';
import { Badge, Frame, SERIES, mix, tone } from './shared';

// ```cards            (also ```tools)
// title: Optional heading
// BADGE | Full name | What it is or does | Optional note (opens as an accordion) | optional tone
// ```
// A grid of badge cards, e.g. tool categories (SIEM, EDR, NDR ...) or terms.
// Without a tone, cards take the series colours in order.
function Card({ row, i }) {
  const [badge, name, body, note, toneName] = row;
  const [open, setOpen] = useState(false);
  const { revealProps } = useMotion();
  const color = toneName ? tone(toneName) : SERIES[i % SERIES.length];
  const id = `card-note-${i}-${badge}`.replace(/[^a-zA-Z0-9-]/g, '');
  return (
    <motion.li
      className="flex flex-col border bg-panel/80 p-3"
      style={{ borderColor: mix(color, 35) }}
      {...revealProps(i)}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge color={color}>{badge}</Badge>
        {name && name !== badge && <span className="font-ui text-[11px] leading-snug text-white/70">{name}</span>}
      </div>
      {body && <p className="mt-2 text-[13px] leading-snug text-white/80">{body}</p>}
      {note && (
        <div className="mt-auto pt-2.5">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={id}
            onClick={() => setOpen((v) => !v)}
            className="press flex items-center gap-1.5 border px-1.5 py-0.5 font-ui text-[10px] tracking-widest"
            style={{ color, borderColor: mix(color, 45) }}
          >
            {open ? <Minus size={11} aria-hidden /> : <Plus size={11} aria-hidden />}
            {open ? 'HIDE_NOTE' : 'NOTE_FROM_THE_ROOM'}
          </button>
          <AnimatePresence initial={false}>
            {open && (
              <motion.p
                id={id}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden text-[13px] leading-snug text-white/70"
              >
                <span className="block pt-1.5">{note}</span>
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.li>
  );
}

export default function Cards({ meta, rows }) {
  return (
    <Frame kind={meta.kind || 'CARDS'} title={meta.title} caption={meta.caption} hint={rows.some((r) => r[3]) ? 'CLICK + TO EXPAND' : undefined}>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row, i) => (
          <Card key={i} row={row} i={i} />
        ))}
      </ul>
    </Frame>
  );
}
