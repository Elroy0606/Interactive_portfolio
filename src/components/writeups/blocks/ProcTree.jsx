import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Cpu } from 'lucide-react';
import { useMotion } from '../../../theme/motion';
import { Frame, TONE, mix } from './shared';

// ```proctree
// title: Optional heading
// parent.exe | Optional note
//   child.exe | Optional note | !        <- two spaces per level; `!` flags it as suspicious
//     grandchild.exe | Optional note | !
// ```
// A process tree that draws in line by line. Clicking a process highlights
// the chain that launched it (its parents up to the root) and dims the rest;
// clicking it again clears the selection. Only use it for a tree that is in
// my own notes.

// Indexes of row i and every parent above it.
function chainOf(rows, i) {
  const chain = new Set([i]);
  let depth = rows[i].depth;
  for (let j = i - 1; j >= 0 && depth > 0; j--) {
    if (rows[j].depth < depth) {
      chain.add(j);
      depth = rows[j].depth;
    }
  }
  return chain;
}

export default function ProcTree({ meta, rows }) {
  const { revealProps } = useMotion();
  const [sel, setSel] = useState(null);
  const chain = sel === null ? null : chainOf(rows, sel);

  return (
    <Frame kind="PROCESS_TREE" title={meta.title} caption={meta.caption} hint="EXPLORE PROCESS TREE">
      <ol className="font-mono text-[12.5px]">
        {rows.map((row, i) => {
          const [name, note, flag = ''] = row;
          const bad = /^(!|suspicious|malicious)$/i.test(flag);
          const color = bad ? TONE.danger : 'var(--accent)';
          const inChain = chain?.has(i);
          return (
            <motion.li key={i} className="flex items-stretch" style={{ paddingLeft: `${row.depth * 1.5}rem` }} {...revealProps(i)}>
              {row.depth > 0 && (
                <span
                  aria-hidden
                  className="mr-2 w-3 shrink-0 border-b border-l transition-colors"
                  style={{ height: '1.1rem', borderColor: inChain ? color : 'color-mix(in srgb, var(--color-white) 20%, transparent)' }}
                />
              )}
              <button
                type="button"
                aria-pressed={sel === i}
                onClick={() => setSel(sel === i ? null : i)}
                className="press mb-1.5 flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-0.5 border px-2 py-1.5 text-left"
                style={{
                  borderColor: inChain ? color : mix(color, 40),
                  backgroundColor: mix(color, inChain ? 16 : bad ? 10 : 5),
                  opacity: chain && !inChain ? 0.45 : 1,
                }}
              >
                {bad ? <AlertTriangle size={13} aria-hidden style={{ color }} /> : <Cpu size={13} aria-hidden style={{ color }} />}
                <span className="font-bold" style={{ color }}>
                  {name}
                </span>
                {bad && <span className="sr-only">(suspicious)</span>}
                {note && <span className="font-sans text-[13px] text-white/70">{note}</span>}
              </button>
            </motion.li>
          );
        })}
      </ol>
      {chain && (
        <p aria-live="polite" className="hint mt-2">
          LAUNCH CHAIN: {[...chain].sort((a, b) => a - b).map((j) => rows[j][0]).join(' → ')}
        </p>
      )}
    </Frame>
  );
}
