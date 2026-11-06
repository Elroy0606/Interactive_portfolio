import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { useMotion } from '../../../theme/motion';
import { Frame, pad } from './shared';

// ```scenarios
// title: Optional heading
// The situation | What to do
// ```
// An accordion: each situation opens to show the response. The first one starts open.
function Item({ row, i, open, onToggle }) {
  const id = useId();
  const { revealProps } = useMotion();
  return (
    <motion.li className="border border-white/10 bg-panel/80" {...revealProps(i)}>
      <h4>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={onToggle}
          className="flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/5"
        >
          <span className="accent-text mt-0.5 font-ui text-[11px] font-bold">{pad(i + 1)}</span>
          <span className="flex-1 text-[14px] leading-snug text-white/90">{row[0]}</span>
          <span aria-hidden className="accent-text accent-border mt-0.5 grid h-5 w-5 shrink-0 place-items-center border">
            {open ? <Minus size={12} /> : <Plus size={12} />}
          </span>
        </button>
      </h4>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="accent-bg-soft border-t border-white/10 px-3 py-2.5 pl-10">
              <p className="accent-text font-ui text-[10px] tracking-widest">WHAT TO DO</p>
              <p className="mt-0.5 text-[14px] leading-relaxed text-white/85">{row[1]}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

export default function Scenarios({ meta, rows }) {
  const [open, setOpen] = useState(() => new Set([0]));
  const toggle = (i) =>
    setOpen((s) => {
      const n = new Set(s);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  return (
    <Frame kind="SCENARIOS" title={meta.title} caption={meta.caption} hint="CLICK TO EXPAND">
      <ul className="space-y-2">
        {rows.map((row, i) => (
          <Item key={i} row={row} i={i} open={open.has(i)} onToggle={() => toggle(i)} />
        ))}
      </ul>
    </Frame>
  );
}
