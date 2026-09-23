import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import CornerBrackets from '../ui/CornerBrackets';
import Meter from '../ui/Meter';
import { sfx } from '../../lib/sound';

const STATUS_TONE = { ok: 'text-matrix', warn: 'text-warn' };

function Section({ title, children, className = '' }) {
  return (
    <section className={className}>
      <h3 className="accent-text mb-3 flex items-center gap-2 font-mono text-xs font-bold tracking-[0.3em]">
        <span aria-hidden className="h-3 w-1 bg-current shadow-[0_0_8px_currentColor]" />
        {title}
      </h3>
      {children}
    </section>
  );
}

// Centered information board: frosted dark glass over a dimmed, blurred backdrop.
// Used for lab services, containers and the Pi-hole NODE_INFO. Fields:
//   required: name, icon, accent, mission, architecture[], config[][], stack[]
//   optional: status/tone, uptime, role, ports[][], load, and the `eyebrow` prop.
export default function DataHUD({ service, onClose, eyebrow }) {
  const closeRef = useRef(null);
  const Icon = service.icon;

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const close = () => {
    sfx.close();
    onClose();
  };

  return (
    <>
      <motion.div
        className="fixed inset-0 z-50 bg-void/70 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={close}
      />
      {/* The wrapper ignores pointer events so clicks outside the board reach the backdrop. */}
      <div className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-8">
        <motion.aside
          role="dialog"
          aria-modal="true"
          aria-labelledby="hud-title"
          style={{ '--accent': service.accent, '--led': service.accent }}
          className="accent-border accent-glow pointer-events-auto relative max-h-[calc(100vh-1.5rem)] w-full max-w-4xl overflow-y-auto border bg-[rgba(7,11,17,0.66)] shadow-[0_30px_120px_rgba(0,0,0,0.7)] backdrop-blur-2xl backdrop-saturate-150 sm:max-h-[calc(100vh-4rem)]"
          initial={{ opacity: 0, scale: 0.86, y: 28 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ type: 'spring', damping: 26, stiffness: 260 }}
        >
          {/* glass sheen + scanline texture + top accent bar */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 14%, transparent), transparent 38%)' }}
          />
          <div aria-hidden className="folder-lines pointer-events-none absolute inset-0 opacity-60" />
          <div aria-hidden className="absolute inset-x-0 top-0 h-[3px]" style={{ background: 'var(--accent)', boxShadow: '0 0 16px var(--accent)' }} />
          <span className="accent-text">
            <CornerBrackets className="h-4 w-4" />
          </span>

          <div className="relative p-5 sm:p-8">
            {/* header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4 sm:gap-5">
                <div className="accent-text accent-bg-soft accent-glow accent-border flex h-14 w-14 shrink-0 items-center justify-center border sm:h-[72px] sm:w-[72px]">
                  <Icon size={32} strokeWidth={1.4} aria-hidden />
                </div>
                <div className="min-w-0 font-mono">
                  <p className="text-[10px] tracking-[0.3em] text-white/50 sm:text-[11px]">
                    {eyebrow ?? `DATA_HUD // NODE ${service.slot}`}
                  </p>
                  <h2 id="hud-title" className="accent-text text-glow break-words text-xl font-bold leading-tight tracking-wide sm:text-3xl">
                    {service.name}
                  </h2>
                  {service.status ? (
                    <p className={`mt-1 flex items-center gap-2 text-xs ${STATUS_TONE[service.tone] ?? 'text-matrix'}`}>
                      <span className="led" style={{ '--led': 'currentColor' }} aria-hidden /> {service.status}
                    </p>
                  ) : (
                    <p className="mt-1 flex items-center gap-2 text-xs text-matrix">
                      <span className="led" style={{ '--led': '#00ff66' }} aria-hidden /> ONLINE · UPTIME {service.uptime}
                    </p>
                  )}
                </div>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="Close information board"
                className="shrink-0 border border-white/20 p-2 text-white/70 transition-colors hover:border-cyber hover:text-cyber"
              >
                <X size={18} />
              </button>
            </div>

            {service.role && (
              <p className="mt-4 border-l-2 border-current pl-3 text-sm leading-snug text-white/70 accent-text">
                <span className="text-white/75">{service.role}</span>
              </p>
            )}

            {/* mission: the headline takeaway */}
            <p className="accent-border accent-bg-soft mt-6 border-l-4 py-3 pl-4 pr-3 text-base leading-relaxed text-white/95 sm:text-lg" style={{ borderLeftColor: 'var(--accent)' }}>
              {service.mission}
            </p>

            <div className="mt-8 grid gap-8 md:grid-cols-[1.25fr_1fr]">
              <Section title="ARCHITECTURE">
                <ul className="space-y-3 text-[15px] leading-relaxed text-white/85">
                  {service.architecture.map((line) => (
                    <li key={line} className="flex gap-3">
                      <span className="accent-text mt-[3px] shrink-0 font-mono text-sm">▸</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </Section>

              <div className="space-y-7">
                <Section title="CONFIGURATION">
                  <dl className="accent-border divide-y divide-white/10 border bg-black/25 font-mono text-[12.5px]">
                    {service.config.map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4 px-3 py-2">
                        <dt className="text-white/50">{k}</dt>
                        <dd className="accent-text text-right font-medium">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </Section>

                {service.ports && (
                  <Section title="PORTS">
                    <ul className="accent-border divide-y divide-white/10 border bg-black/25 font-mono text-[12.5px]">
                      {service.ports.map(([port, desc]) => (
                        <li key={port} className="flex justify-between gap-4 px-3 py-2">
                          <span className="accent-text font-medium">{port}</span>
                          <span className="text-right text-white/60">{desc}</span>
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}

                {service.load != null && (
                  <Section title="LIVE_LOAD">
                    <Meter label="UTILISATION (SIMULATED)" value={service.load} />
                  </Section>
                )}
              </div>
            </div>

            <Section title="TECH_STACK" className="mt-8">
              <ul className="flex flex-wrap gap-2">
                {service.stack.map((tech) => (
                  <li key={tech} className="accent-border accent-text accent-bg-soft border px-2.5 py-1 font-mono text-xs font-medium tracking-wider">
                    {tech}
                  </li>
                ))}
              </ul>
            </Section>

            <button type="button" onClick={close} className="btn-cyber mt-8 w-full justify-center">
              [ CLOSE_PANEL ] <span className="text-white/40">ESC</span>
            </button>
          </div>
        </motion.aside>
      </div>
    </>
  );
}
