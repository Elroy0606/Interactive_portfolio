import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { useMotion } from '../../../theme/motion';
import { Frame, TONE, mix, pad } from './shared';

// ```workflow
// title: Optional heading
// Step | What you do
// ? The question | YES: what happens | NO: what happens
// ```
// A top-to-bottom flowchart. A line starting with `?` is a decision that
// splits into two outcomes (first = warn colour, second = ok colour).
const outcome = (cell = '') => {
  const m = /^([^:]{1,16}):\s*(.*)$/.exec(cell);
  return m ? { label: m[1].trim().toUpperCase(), text: m[2] } : { label: '', text: cell };
};

function Link() {
  return <span aria-hidden className="flow-link flow-link-y mx-auto" />;
}

export default function Workflow({ meta, rows }) {
  const { revealProps } = useMotion();
  let step = 0;
  return (
    <Frame kind="WORKFLOW" title={meta.title} caption={meta.caption}>
      <ol className="mx-auto flex max-w-xl flex-col">
        {rows.map((row, i) => {
          const decision = row[0].startsWith('?');
          return (
            <motion.li key={i} className="flex flex-col" {...revealProps(i)}>
              {i > 0 && <Link />}
              {decision ? (
                <div>
                  <div className="mx-auto flex max-w-sm items-center justify-center gap-2 border-2 border-dashed px-3 py-2 text-center" style={{ borderColor: mix(TONE.warn, 60) }}>
                    <HelpCircle size={15} aria-hidden style={{ color: TONE.warn }} />
                    <span className="font-ui text-[13px] font-bold text-white">{row[0].replace(/^\?\s*/, '')}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[row[1], row[2]].map((cell, j) => {
                      const o = outcome(cell);
                      const color = j === 0 ? TONE.warn : TONE.ok;
                      return (
                        <div key={j} className="flex flex-col">
                          <span aria-hidden className="flow-link flow-link-y mx-auto" style={{ '--accent': color }} />
                          <div className="flex-1 border p-3 text-center" style={{ borderColor: mix(color, 50), backgroundColor: mix(color, 8) }}>
                            {o.label && <p className="font-ui text-[10px] font-bold tracking-widest" style={{ color }}>{o.label}</p>}
                            <p className="mt-0.5 text-[13px] leading-snug text-white/85">{o.text}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="accent-border border bg-panel/80 px-3 py-2.5">
                  <p className="font-ui text-[10px] track-20 text-white/50">STEP {pad(++step)}</p>
                  <p className="accent-text font-ui text-[13px] font-bold">{row[0]}</p>
                  {row[1] && <p className="mt-0.5 text-[13px] leading-snug text-white/75">{row[1]}</p>}
                </div>
              )}
            </motion.li>
          );
        })}
      </ol>
    </Frame>
  );
}
