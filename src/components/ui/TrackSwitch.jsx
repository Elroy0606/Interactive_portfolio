import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Split } from 'lucide-react';
import { TRACKS } from '../../data/tracks';
import { cn } from '../../lib/cn';
import { sfx } from '../../lib/sound';

export const trackTabId = (scope, id) => `${scope}-track-${id}`;

// The Theory / Practical path switch (WAI-ARIA tabs: arrow keys, Home / End).
// Used on the track page (switches the whole page) and in Sector 02 (filters
// the write-up categories). `counts` is optional ({ theory: 3, ... }).
// `scope` keeps ids and the shared underline unique per place it is used.
export default function TrackSwitch({ active, onChange, counts, controls, scope = 'trk', hint = 'SWITCH PATH' }) {
  const refs = useRef({});
  const pick = (id) => {
    if (id !== active) sfx.click();
    onChange(id);
  };
  const onKey = (e, i) => {
    const to = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: TRACKS.length - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    const t = TRACKS[(to + TRACKS.length) % TRACKS.length];
    pick(t.id);
    refs.current[t.id]?.focus();
  };

  return (
    <div className="mb-5">
      <p className="hint mb-2" id={`${scope}-track-hint`}>
        <Split size={12} aria-hidden /> {hint}
      </p>
      <div role="tablist" aria-label="Portfolio path" aria-describedby={`${scope}-track-hint`} className="flex flex-wrap gap-2">
        {TRACKS.map((t, i) => {
          const on = t.id === active;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              ref={(el) => (refs.current[t.id] = el)}
              id={trackTabId(scope, t.id)}
              type="button"
              role="tab"
              aria-selected={on}
              aria-controls={controls}
              tabIndex={on ? 0 : -1}
              onKeyDown={(e) => onKey(e, i)}
              onClick={() => pick(t.id)}
              style={{ '--accent': t.accent }}
              className={cn(
                'press hover-glow accent-border relative flex items-center gap-2 border px-3 py-2 font-ui text-[11px] tracking-widest',
                on ? 'accent-text accent-bg-soft' : 'text-white/60',
              )}
            >
              <Icon size={14} aria-hidden />
              <span className="font-bold">{t.label.toUpperCase()}</span>
              <span className="hidden text-white/45 sm:inline">// {t.title.toUpperCase()}</span>
              {counts && (
                <span className={cn('border px-1 text-[10px]', on ? 'accent-border' : 'border-white/15')}>{counts[t.id] ?? 0}</span>
              )}
              {on && (
                <motion.span layoutId={`${scope}-track-bar`} aria-hidden className="absolute inset-x-0 -bottom-px h-0.5 bg-[var(--accent)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
