import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { ListTree, Minus, Plus } from 'lucide-react';
import { cn } from '../../lib/cn';

const pad = (n) => String(n).padStart(2, '0');

// Splits a Markdown report on its top-level `#` headings (outside code fences):
// { intro, sections: [{ id, title, body }] }. Each section becomes a numbered
// panel on the page and an entry in the rail.
export function splitSections(text) {
  const intro = [];
  const sections = [];
  const used = new Set();
  let fence = false;
  for (const line of String(text).split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    const m = !fence && /^#\s+(.+?)\s*#*\s*$/.exec(line);
    if (m) {
      let id = `sec-${m[1].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
      while (used.has(id)) id += '-x';
      used.add(id);
      sections.push({ id, title: m[1].replace(/[*_`]/g, ''), lines: [line] });
    } else (sections.length ? sections[sections.length - 1].lines : intro).push(line);
  }
  return {
    intro: intro.join('\n').trim(),
    sections: sections.map(({ lines, ...s }) => ({ ...s, body: lines.join('\n') })),
  };
}

// The section that is currently being read (the last one whose top has
// passed the upper third of the screen).
export function useActiveSection(sections) {
  const [active, setActive] = useState(sections[0]?.id ?? null);
  useEffect(() => {
    if (!sections.length) return undefined;
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        const seen = entries.filter((e) => e.isIntersecting).map((e) => e.target.id);
        if (seen.length) setActive(sections.find((s) => seen.includes(s.id))?.id ?? seen[0]);
      },
      { rootMargin: '-15% 0px -70% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections]);
  return active;
}

function useJump() {
  const reduce = useReducedMotion();
  return (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    el.focus({ preventScroll: true }); // keyboard users continue from the section
  };
}

function Entries({ sections, active, onPick }) {
  const jump = useJump();
  return (
    <ol className="space-y-0.5">
      {sections.map((s, i) => {
        const on = s.id === active;
        return (
          <li key={s.id}>
            <button
              type="button"
              aria-current={on ? 'location' : undefined}
              onClick={() => {
                jump(s.id);
                onPick?.();
              }}
              className={cn(
                'flex w-full items-baseline gap-2 border-l-2 py-1 pl-2.5 pr-1 text-left text-[12.5px] leading-snug transition-colors',
                on ? 'accent-text accent-bg-soft border-[var(--accent)]' : 'border-white/10 text-white/60 hover:text-white/85',
              )}
            >
              <span className="font-ui text-[10px]">{pad(i + 1)}</span>
              <span className="min-w-0">{s.title}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

// Sticky rail on xl screens.
export function SectionRail({ sections, active }) {
  const index = Math.max(0, sections.findIndex((s) => s.id === active));
  return (
    <nav aria-label="Sections" className="sticky top-20 hidden max-h-[calc(100vh-6rem)] overflow-y-auto border border-white/10 bg-panel/90 p-3 xl:block">
      <p className="mb-2 flex items-center gap-2 font-ui text-[10px] track-20 text-white/50">
        <ListTree size={12} aria-hidden /> SECTIONS // {pad(index + 1)}/{pad(sections.length)}
      </p>
      <div aria-hidden className="mb-3 h-0.5 bg-white/10">
        <div className="h-full bg-[var(--accent)] transition-[width] duration-300" style={{ width: `${((index + 1) / sections.length) * 100}%` }} />
      </div>
      <Entries sections={sections} active={active} />
    </nav>
  );
}

// Collapsible "jump to" menu above the report below xl.
export function JumpMenu({ sections, active }) {
  const ref = useRef(null);
  return (
    <details ref={ref} className="group/jump mx-auto mb-4 max-w-[52rem] border border-white/10 bg-panel/90 xl:hidden">
      <summary className="flex items-center gap-2 px-3 py-2 font-ui text-[11px] tracking-widest text-white/70 [&::-webkit-details-marker]:hidden [list-style:none]">
        <ListTree size={13} aria-hidden className="accent-text" />
        <span className="flex-1">JUMP_TO // {sections.length} SECTIONS</span>
        <Plus size={13} aria-hidden className="accent-text group-open/jump:hidden" />
        <Minus size={13} aria-hidden className="accent-text hidden group-open/jump:block" />
      </summary>
      <nav aria-label="Sections" className="border-t border-white/10 p-2">
        <Entries sections={sections} active={active} onPick={() => ref.current && (ref.current.open = false)} />
      </nav>
    </details>
  );
}
