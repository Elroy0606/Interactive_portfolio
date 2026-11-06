import { useRef } from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import { cn } from '../../lib/cn';
import { sfx } from '../../lib/sound';

export const tabId = (id) => `wu-tab-${id}`;
export const PANEL_ID = 'wu-panel';

// One tab per category that holds a report (CATEGORY_TABS in data/writeups.js).
// Arrow keys / Home / End move between tabs (WAI-ARIA tabs pattern).
export default function CategoryTabs({ tabs, active, onChange }) {
  const refs = useRef({});
  const move = (i) => {
    const t = tabs[(i + tabs.length) % tabs.length];
    onChange(t.id);
    refs.current[t.id]?.focus();
  };
  const onKey = (e, i) => {
    const to = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    move(to);
  };

  return (
    <div className="mb-5">
    <p className="hint mb-2" id="wu-tabs-hint">
      <SlidersHorizontal size={12} aria-hidden /> FILTER BY TOPIC
    </p>
    <div role="tablist" aria-label="Write-up categories" aria-describedby="wu-tabs-hint" className="flex flex-wrap gap-2">
      {tabs.map((c, i) => {
        const on = c.id === active;
        const Icon = c.icon;
        return (
          <button
            key={c.id}
            ref={(el) => (refs.current[c.id] = el)}
            id={tabId(c.id)}
            type="button"
            role="tab"
            aria-selected={on}
            aria-controls={PANEL_ID}
            tabIndex={on ? 0 : -1}
            onKeyDown={(e) => onKey(e, i)}
            onClick={() => {
              if (!on) sfx.click();
              onChange(c.id);
            }}
            style={{ '--accent': c.accent }}
            className={cn(
              'press hover-glow accent-border relative flex items-center gap-2 border px-3 py-2 font-ui text-[11px] tracking-widest',
              on ? 'accent-text accent-bg-soft' : 'text-white/60',
            )}
          >
            <Icon size={14} aria-hidden />
            {c.code}
            <span className={cn('border px-1 text-[10px]', on ? 'accent-border' : 'border-white/15')}>{c.writeups.length}</span>
            {on && <motion.span layoutId="wu-tab-bar" aria-hidden className="absolute inset-x-0 -bottom-px h-0.5 bg-[var(--accent)]" />}
          </button>
        );
      })}
    </div>
    </div>
  );
}
