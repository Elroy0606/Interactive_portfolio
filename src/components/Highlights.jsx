import { motion } from 'framer-motion';
import { ArrowRight, FileText, Star } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { useMotion } from '../theme/motion';
import { HIGHLIGHTS } from '../data/highlights';
import { ZONES, getNode, nodesIn } from '../data/adlab';
import CornerBrackets from './ui/CornerBrackets';
import { cn } from '../lib/cn';
import { sfx } from '../lib/sound';

// Small static preview of the AD lab network diagram, drawn from the same node
// data as the full interactive one (data/adlab.js). Networks are named by role
// only, as everywhere else: no addresses.
function AdLabPreview() {
  const Row = ({ zone }) => (
    <div className="border border-dashed border-white/20 px-2 pb-2 pt-1.5">
      <div className="font-ui text-[9px] track-20 text-white/60">{ZONES[zone].label}</div>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {nodesIn(zone).map((n) => {
          const Icon = n.icon;
          return (
            <span key={n.id} style={{ '--accent': n.accent }} className="accent-text accent-border accent-bg-soft flex h-7 w-7 items-center justify-center border">
              <Icon size={14} strokeWidth={1.5} />
            </span>
          );
        })}
      </div>
    </div>
  );
  const Link = () => <span className="mx-auto block h-3 w-px bg-white/30" />;
  const fw = getNode('fw');
  const FwIcon = fw.icon;
  return (
    <div
      role="img"
      aria-label="Preview of the lab network diagram: the home network, the firewall, and the isolated lab network behind it"
      className="blueprint-grid flex h-full min-h-[200px] flex-col justify-center p-4"
    >
      <div aria-hidden>
        <Row zone="external" />
        <Link />
        <div style={{ '--accent': fw.accent }} className="accent-border accent-bg-soft accent-text mx-auto flex w-fit items-center gap-2 border px-2.5 py-1.5 font-ui text-[10px] font-bold tracking-wide">
          <FwIcon size={14} strokeWidth={1.5} /> {fw.name}
        </div>
        <Link />
        <Row zone="internal" />
      </div>
    </div>
  );
}

// Projects with their own preview; everything else gets its screenshot or the placeholder.
const PREVIEWS = { 'lab:adlab': AdLabPreview };

function Visual({ item }) {
  const Preview = PREVIEWS[item.key];
  if (Preview) return <Preview />;
  if (item.image) return <img src={item.image.src} alt={item.image.alt} loading="lazy" className="h-full max-h-64 w-full object-cover object-top" />;
  const Icon = item.icon;
  return (
    <div aria-hidden className="blueprint-grid flex h-full min-h-[140px] flex-col items-center justify-center gap-2">
      <Icon size={40} strokeWidth={1.25} className="accent-text opacity-80" />
      <span className="font-ui text-[10px] track-25 text-white/60">{item.kindLabel}</span>
    </div>
  );
}

function HighlightCard({ item, index, single }) {
  const { dispatch } = useApp();
  const { itemProps } = useMotion();
  const go = (action) => {
    sfx.open();
    dispatch(action);
  };

  return (
    <motion.li className="flex" {...itemProps(index)}>
      <article
        aria-labelledby={`hl-${item.key}`}
        style={{ '--accent': item.accent }}
        className={cn(
          'accent-border accent-glow relative flex w-full flex-col overflow-hidden border-2 bg-panel/90 backdrop-blur-sm',
          single && 'md:grid md:grid-cols-[minmax(0,1fr)_minmax(260px,380px)]',
        )}
      >
        <div aria-hidden className="absolute inset-x-0 top-0 z-10 h-[3px]" style={{ background: 'var(--accent)', boxShadow: '0 0 16px var(--glow-accent)' }} />
        {/* `contents`: the wrapper only passes the accent colour on, so it is not a grid cell */}
        <span className="accent-text contents">
          <CornerBrackets />
        </span>

        <div className="relative flex min-w-0 flex-1 flex-col p-5 sm:p-6">
          <p className="accent-text flex items-center gap-1.5 font-ui text-[11px] track-25">
            <Star size={12} aria-hidden /> {item.kindLabel}
          </p>
          <h3 id={`hl-${item.key}`} className="accent-text text-glow mt-2 font-ui text-xl font-bold leading-tight tracking-wide sm:text-2xl">
            {item.title}
          </h3>

          {item.reason && (
            <div className="mt-4 border-l-4 pl-3 sm:pl-4" style={{ borderLeftColor: 'var(--accent)' }}>
              <p className="font-ui text-[10px] track-25 text-white/60">WHY_THIS_MATTERS</p>
              <p className="mt-1 text-[15px] leading-relaxed text-white/95 sm:text-base">{item.reason}</p>
            </div>
          )}

          {item.description && <p className="mt-3 text-[13px] leading-relaxed text-white/65">{item.description}</p>}

          {item.tags.length > 0 && (
            <ul aria-label="Key skills" className="mt-4 flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <li key={tag} className="accent-border accent-text accent-bg-soft border px-2 py-0.5 font-ui text-[11px] font-medium tracking-wider">
                  {tag}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-5">
            <button type="button" className="btn-cyber" onClick={() => go(item.open)}>
              {item.openLabel} <ArrowRight size={14} aria-hidden />
              <span className="sr-only">: {item.title}</span>
            </button>
            {item.report && (
              <button
                type="button"
                className="flex items-center gap-1.5 font-ui text-xs tracking-widest text-white/70 underline decoration-white/30 underline-offset-4 transition-colors hover:text-cyber"
                onClick={() => go({ type: 'WRITEUP_OPEN', id: item.report.id })}
              >
                <FileText size={13} aria-hidden /> {item.report.published ? 'READ_REPORT' : 'REPORT: COMING_SOON'}
                <span className="sr-only">: {item.report.title}</span>
              </button>
            )}
          </div>
        </div>

        <div className={cn('relative border-white/10', single ? 'border-t md:border-l md:border-t-0' : 'order-first border-b')}>
          <Visual item={item} />
        </div>
      </article>
    </motion.li>
  );
}

// Home page section featuring the projects flagged in the data files
// (data/highlights.js). Renders nothing at all when no project is flagged.
export default function Highlights() {
  if (HIGHLIGHTS.length === 0) return null;
  const single = HIGHLIGHTS.length === 1;
  return (
    <section aria-labelledby="highlights-title" className="mb-8 sm:mb-12">
      <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h2 id="highlights-title" className="flex items-center gap-2 font-ui text-sm font-bold track-30 text-cyber">
          <span aria-hidden className="h-4 w-1 self-center bg-current shadow-[0_0_8px_var(--glow-current)]" />
          HIGHLIGHTS
        </h2>
        <p className="text-sm text-white/65">The projects I most want you to see.</p>
      </div>
      <ul className={cn('grid gap-5 lg:gap-6', !single && 'md:grid-cols-2 xl:grid-cols-3')}>
        {HIGHLIGHTS.map((item, i) => (
          <HighlightCard key={item.key} item={item} index={i} single={single} />
        ))}
      </ul>
    </section>
  );
}
