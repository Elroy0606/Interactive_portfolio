import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-react';
import { Frame, TONE, mix } from './shared';

// The colour a verdict is shown in, from its wording.
export const verdictTone = (v = '') =>
  /true positive|malicious|escalat/i.test(v)
    ? TONE.danger
    : /false positive|legitimate|benign|safe/i.test(v)
      ? TONE.ok
      : TONE.warn;

const iconFor = (v) => (verdictTone(v) === TONE.danger ? ShieldAlert : verdictTone(v) === TONE.ok ? ShieldCheck : ShieldQuestion);

// ```verdict
// False positive | Why I reached this verdict
// ```
export default function Verdict({ rows }) {
  return (
    <>
      {rows.map(([verdict, reason], i) => {
        const color = verdictTone(verdict);
        const Icon = iconFor(verdict);
        return (
          <Frame key={i} kind="VERDICT">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 1.3 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.25 }}
                className="flex shrink-0 items-center gap-2 self-start border-2 px-2.5 py-1.5 font-ui text-[13px] font-bold tracking-widest"
                style={{ color, borderColor: color, backgroundColor: mix(color, 8) }}
              >
                <Icon size={16} aria-hidden /> {verdict.toUpperCase()}
              </motion.div>
              {reason && <p className="text-[14px] leading-relaxed text-white/85">{reason}</p>}
            </div>
          </Frame>
        );
      })}
    </>
  );
}
