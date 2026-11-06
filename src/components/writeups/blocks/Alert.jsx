import { useState } from 'react';
import { motion } from 'framer-motion';
import { Siren } from 'lucide-react';
import { SEVERITY } from '../../../data/dossiers';
import { useMotion } from '../../../theme/motion';
import { Badge, Frame, TONE, pad } from './shared';
import { verdictTone } from './Verdict';

// ```alert
// title: Alert name shown in the header
// severity: Low            (optional: Critical / High / Medium / Low)
// status: Closed           (optional)
// verdict: False positive  (optional: stamped on the card)
// Field | Value | Optional explanation
// ```
// A mock SIEM alert. When rows have an explanation, each field gets a numbered
// callout: hover, focus or click it to read what the field means.
export default function Alert({ meta, rows }) {
  const { revealProps } = useMotion();
  const explained = rows.some((r) => r[2]);
  const [sel, setSel] = useState(0);
  const sev = meta.severity && SEVERITY[meta.severity.toUpperCase()];
  const current = rows[sel] ?? rows[0];

  return (
    <Frame kind="ALERT" caption={meta.caption} hint={explained ? 'TAP A NUMBER' : undefined}>
      <div className={explained ? 'grid gap-4 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]' : ''}>
        <motion.div className="relative border border-white/15 bg-panel/90" {...revealProps(0)}>
          <div className="flex flex-wrap items-center gap-2 border-b border-white/10 bg-black/30 px-3 py-2">
            <span className="led" style={{ '--led': sev?.color ?? TONE.warn }} aria-hidden />
            <Siren size={13} aria-hidden className="text-white/60" />
            <span className="min-w-0 flex-1 font-ui text-[12px] font-bold tracking-wide text-white">{meta.title || 'Alert'}</span>
            {sev && <Badge color={sev.color}>{meta.severity.toUpperCase()}</Badge>}
            {meta.status && <Badge color={TONE.info}>{meta.status.toUpperCase()}</Badge>}
          </div>
          <dl className={`divide-y divide-white/5 ${meta.verdict ? 'pb-12' : ''}`}>
            {rows.map((row, i) => {
              const [field, value] = row;
              const on = explained && i === sel;
              return (
                <div
                  key={i}
                  className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-3 px-3 py-2 transition-colors sm:grid-cols-[auto_minmax(0,7.5rem)_minmax(0,1fr)]"
                  style={on ? { backgroundColor: 'color-mix(in srgb, var(--accent) 9%, transparent)' } : undefined}
                >
                  {explained ? (
                    <button
                      type="button"
                      aria-pressed={on}
                      aria-label={`Explain ${field}`}
                      onMouseEnter={() => setSel(i)}
                      onFocus={() => setSel(i)}
                      onClick={() => setSel(i)}
                      className={`press grid h-5 w-5 place-items-center rounded-full border font-ui text-[10px] font-bold ${
                        on ? 'accent-text border-[var(--accent)]' : 'border-white/20 text-white/55'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ) : (
                    <span aria-hidden className="font-ui text-[10px] text-white/35">{pad(i + 1)}</span>
                  )}
                  <dt className="font-ui text-[11px] tracking-widest text-white/55">{field.toUpperCase()}</dt>
                  <dd className="col-start-2 break-words font-mono text-[12.5px] text-white/85 sm:col-start-3 sm:row-start-1">{value}</dd>
                  {on && row[2] && (
                    <dd className="accent-text col-start-2 mt-1.5 text-[13px] leading-snug md:hidden">{row[2]}</dd>
                  )}
                </div>
              );
            })}
          </dl>
          {meta.verdict && (
            <motion.div
              initial={{ opacity: 0, scale: 1.4 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35, duration: 0.25 }}
              className="pointer-events-none absolute bottom-3 right-3 -rotate-6 border-2 px-2 py-1 font-ui text-[12px] font-bold tracking-widest"
              style={{ color: verdictTone(meta.verdict), borderColor: verdictTone(meta.verdict) }}
            >
              {meta.verdict.toUpperCase()}
            </motion.div>
          )}
        </motion.div>

        {explained && current && (
          <div className="accent-border accent-bg-soft hidden border p-4 md:block md:self-start" aria-live="polite">
            <p className="font-ui text-[10px] track-20 text-white/50">
              FIELD {pad(sel + 1)} / {pad(rows.length)}
            </p>
            <p className="accent-text mt-1 font-ui text-sm font-bold">{current[0]}</p>
            <p className="mt-2 text-[14px] leading-relaxed text-white/85">{current[2]}</p>
          </div>
        )}
      </div>
    </Frame>
  );
}
