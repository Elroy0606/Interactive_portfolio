import { MousePointerClick } from 'lucide-react';

// Shared pieces of the write-up visual blocks (see README.md in this folder).

export const pad = (n) => String(n).padStart(2, '0');

// Named tones a block line can use. Every value is a colour token, so the
// three themes recolour the diagrams on their own.
export const TONE = {
  accent: 'var(--accent)',
  info: 'var(--color-cyber)',
  ok: 'var(--color-matrix)',
  warn: 'var(--color-warn)',
  danger: 'var(--color-danger)',
  critical: 'var(--color-magenta)',
  magenta: 'var(--color-magenta)',
  violet: 'var(--color-violet)',
  blue: 'var(--color-pihole)',
};
export const tone = (name, fallback = TONE.accent) => TONE[String(name ?? '').trim().toLowerCase()] ?? fallback;

// Series colours for blocks that list several peers (tool cards): semantic
// colours, used only to tell the items apart.
export const SERIES = [TONE.info, TONE.ok, TONE.warn, TONE.magenta, TONE.violet, TONE.blue];

export const mix = (color, pct) => `color-mix(in srgb, ${color} ${pct}%, transparent)`;

// Small status / category badge in a given colour.
export function Badge({ color = TONE.accent, children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 border px-1.5 py-0.5 font-ui text-[10px] font-bold tracking-widest ${className}`}
      style={{ color, borderColor: mix(color, 45), backgroundColor: mix(color, 9) }}
    >
      {children}
    </span>
  );
}

// The frame every block sits in: a labelled figure on the reading page.
// `hint` = micro-label that says how to use an interactive block.
export function Frame({ kind, title, caption, hint, children }) {
  return (
    <figure className="relative my-6 border border-white/10 bg-black/20 p-4 pt-7 sm:p-5 sm:pt-8">
      <span aria-hidden className="absolute left-3 top-2 font-ui text-[10px] track-25 text-white/35">
        FIG // {kind}
      </span>
      {hint && (
        <span className="hint absolute right-3 top-2">
          <MousePointerClick size={11} aria-hidden /> {hint}
        </span>
      )}
      {title && <p className="accent-text mb-4 font-ui text-[13px] font-bold track-12">{title}</p>}
      {children}
      {caption && <figcaption className="mt-4 text-[13px] leading-relaxed text-white/60">{caption}</figcaption>}
    </figure>
  );
}
