import { Fragment, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, CodeXml, X } from 'lucide-react';
import { KINDS, STATUS } from '../../data/projects';
import CornerBrackets from '../ui/CornerBrackets';
import useReadingMode from '../../hooks/useReadingMode';
import { sfx } from '../../lib/sound';
import { useMotion } from '../../theme/motion';

// `code` spans in data strings: 'defanging (`hxxp://`, `[.]`)'.
function Rich({ text }) {
  return text.split('`').map((part, i) =>
    i % 2 ? (
      <code key={i} className="accent-text bg-black/30 px-1 font-mono text-[0.9em]">
        {part}
      </code>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

function Heading({ n, children }) {
  return (
    <h3 className="accent-text mb-3 flex items-center gap-2 font-ui text-xs font-bold track-30">
      <span aria-hidden className="h-3 w-1 bg-current shadow-[0_0_8px_var(--glow-current)]" />
      <span className="text-white/40">{n}</span> {children}
    </h3>
  );
}

// Detailed case study of a project (Sector 02), opened from its card's
// CASE_STUDY button. Same centered glass board as the lab's DataHUD.
// Esc is handled by DevDistrict (it owns the sector's single keydown handler).
// Content: `caseStudy` on the project in data/projects.js.
export default function CaseStudy({ project, onClose }) {
  const closeRef = useRef(null);
  const { board } = useMotion();
  const kind = KINDS.find((k) => k.id === project.kind) ?? KINDS[0];
  const status = STATUS[project.status] ?? { color: 'var(--color-body)', led: false };
  const { problem, solution, modules = [] } = project.caseStudy;
  useReadingMode();

  useEffect(() => {
    const opener = document.activeElement;
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, []);

  const close = () => {
    sfx.close();
    onClose();
  };
  const titleId = `case-${project.id}`;

  return (
    <>
      <motion.div
        className="fixed inset-0 z-50 bg-void/70 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={close}
      />
      <div className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-8">
        <motion.article
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          style={{ '--accent': kind.accent, '--led': status.color }}
          className="accent-border accent-glow pointer-events-auto relative max-h-[calc(100vh-1.5rem)] w-full max-w-5xl overflow-y-auto border bg-glass/66 shadow-[var(--shadow-board)] backdrop-blur-2xl backdrop-saturate-150 sm:max-h-[calc(100vh-4rem)]"
          {...board}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 14%, transparent), transparent 38%)' }}
          />
          <div aria-hidden className="folder-lines pointer-events-none absolute inset-0 opacity-60" />
          <div aria-hidden className="absolute inset-x-0 top-0 h-[3px]" style={{ background: 'var(--accent)', boxShadow: '0 0 16px var(--glow-accent)' }} />
          <span className="accent-text">
            <CornerBrackets className="h-4 w-4" />
          </span>

          <div className="relative p-5 sm:p-8">
            {/* header */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 font-ui">
                <p className="text-[10px] track-30 text-white/50 sm:text-[11px]">
                  [CASE_STUDY] // {project.category ? project.category.toUpperCase() : kind.code}
                </p>
                <h2 id={titleId} className="accent-text text-glow mt-1 break-words text-2xl font-bold leading-tight tracking-wide sm:text-4xl">
                  {project.name}
                </h2>
                <p className="mt-2 flex items-center gap-2 text-xs" style={{ color: status.color }}>
                  {status.led && <span className="led" aria-hidden />}
                  <span className="sr-only">Status: </span>
                  {project.status.toUpperCase()}
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="Close case study"
                className="press shrink-0 border border-white/20 p-2 text-white/70 transition-colors hover:border-cyber hover:text-cyber"
              >
                <X size={18} />
              </button>
            </div>

            {(project.tagline || project.description) && (
              <p className="accent-border accent-bg-soft mt-6 border-l-4 py-3 pl-4 pr-3 text-base leading-relaxed text-white/95 sm:text-lg" style={{ borderLeftColor: 'var(--accent)' }}>
                {project.tagline || project.description}
              </p>
            )}

            {/* problem / solution */}
            <div className="mt-8 grid gap-8 md:grid-cols-2">
              <section>
                <Heading n="01">THE_PROBLEM</Heading>
                <p className="text-[15px] leading-relaxed text-white/85">
                  <Rich text={problem} />
                </p>
              </section>
              <section>
                <Heading n="02">THE_SOLUTION</Heading>
                <p className="text-[15px] leading-relaxed text-white/85">
                  <Rich text={solution} />
                </p>
              </section>
            </div>

            {/* feature grid */}
            {modules.length > 0 && (
              <section className="mt-9">
                <Heading n="03">CORE_MODULES</Heading>
                <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {modules.map((m, i) => {
                    const Icon = m.icon;
                    return (
                      <li key={m.title} className="flex flex-col border border-dashed border-white/15 bg-black/25 p-4">
                        <div className="flex items-center gap-3">
                          {Icon && (
                            <span className="accent-text accent-bg-soft flex h-10 w-10 shrink-0 items-center justify-center">
                              <Icon size={20} strokeWidth={1.5} aria-hidden />
                            </span>
                          )}
                          <div className="min-w-0 font-ui">
                            <span className="block text-[10px] track-25 text-white/40">MODULE_{String(i + 1).padStart(2, '0')}</span>
                            <h4 className="accent-text text-sm font-bold leading-snug">{m.title}</h4>
                          </div>
                        </div>
                        <ul className="mt-4 space-y-2 text-sm leading-relaxed text-white/80">
                          {m.points.map((pt) => (
                            <li key={pt} className="flex gap-2.5">
                              <span aria-hidden className="accent-text mt-[2px] shrink-0 font-ui text-xs">▸</span>
                              <span>
                                <Rich text={pt} />
                              </span>
                            </li>
                          ))}
                        </ul>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            {project.tags.length > 0 && (
              <section className="mt-9">
                <Heading n="04">TECH_STACK</Heading>
                <ul aria-label="Built with" className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <li key={tag} className="accent-text accent-bg-soft px-2.5 py-1 font-ui text-xs font-medium tracking-wider">
                      {tag}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* CTAs */}
            <div className="mt-9 flex flex-wrap items-center gap-3 border-t border-white/10 pt-6">
              {project.url && (
                <a href={project.url} target="_blank" rel="noopener noreferrer" className="btn-cyber" onClick={() => sfx.click()}>
                  LAUNCH_LIVE_APP <ArrowUpRight size={14} aria-hidden />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              )}
              {project.repo && (
                <a href={project.repo} target="_blank" rel="noopener noreferrer" className="btn-cyber" onClick={() => sfx.click()}>
                  <CodeXml size={14} aria-hidden /> VIEW_SOURCE <ArrowUpRight size={14} aria-hidden />
                  <span className="sr-only">on GitHub (opens in a new tab)</span>
                </a>
              )}
              <button type="button" onClick={close} className="link-ui ml-auto font-ui text-xs tracking-widest">
                [ CLOSE ] <span className="text-white/40">ESC</span>
              </button>
            </div>
          </div>
        </motion.article>
      </div>
    </>
  );
}
