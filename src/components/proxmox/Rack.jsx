import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Laptop } from 'lucide-react';
import { HOST, SERVICES } from '../../data/services';
import Meter from '../ui/Meter';
import Tip from '../ui/Tip';
import { sfx } from '../../lib/sound';
import { useMotion } from '../../theme/motion';

const spring = { stiffness: 110, damping: 15 };

// Stylised server rack. The frame tilts toward the pointer for a 3D feel; the
// wrapper (rackRef) stays flat so blueprint traces can attach to it reliably.
export default function Rack({ rackRef, registerSlot, hoveredId, activeId, onHover, onSelect, className = '' }) {
  const { tilt } = useMotion(); // 3D tilt is a motion token: the rack sits flat without it
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], tilt ? [-20, 0] : [0, 0]), spring); // rests at -10deg
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], tilt ? [10, -2] : [0, 0]), spring); // rests at 4deg

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div
      ref={rackRef}
      data-tour-avoid
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`relative mx-auto w-full max-w-[340px] [perspective:1100px] lg:col-start-2 lg:row-span-3 lg:row-start-1 ${className}`}
    >
      <motion.div style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }} className="relative">
        {/* depth layers behind the frame */}
        <div aria-hidden className="absolute inset-0 border border-cyber/15 bg-cyber/[0.04]" style={{ transform: 'translateZ(-26px)' }} />
        <div aria-hidden className="absolute inset-0 border border-cyber/10 bg-cyber/[0.02]" style={{ transform: 'translateZ(-52px)' }} />

        <div
          className="relative flex border border-cyber/45 bg-panel shadow-[0_0_40px_color-mix(in_srgb,var(--glow-cyber)_15%,transparent)]"
          style={{ transform: 'translateZ(0)' }}
        >
          <div aria-hidden className="rack-rail w-4 shrink-0 border-r border-cyber/20" />

          <div className="min-w-0 flex-1 space-y-2 p-2.5">
            <div className="flex justify-between font-ui text-[10px] track-20 text-cyber/70">
              <span>RACK_A01</span>
              <span>12U</span>
            </div>

            {/* Hypervisor host */}
            <div className="relative border border-cyber/50 bg-cyber/[0.06] p-3 shadow-[inset_0_0_20px_color-mix(in_srgb,var(--glow-cyber)_8%,transparent)]" style={{ '--accent': 'var(--color-id-cyan)' }}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-cyber/40 text-cyber">
                  <Laptop size={20} strokeWidth={1.5} aria-hidden />
                </div>
                <div className="min-w-0 font-ui">
                  <div className="truncate text-[13px] font-bold text-cyber text-glow">{HOST.name}</div>
                  <div className="truncate text-[10px] tracking-widest text-white/50">
                    {HOST.role} · {HOST.os}
                  </div>
                </div>
                <span className="led ml-auto" aria-hidden />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <Meter label="CPU" value={32} />
                <Meter label="RAM" value={58} range={4} />
                <Meter label="DISK" value={41} range={2} />
              </div>
            </div>

            {/* Service slots */}
            {SERVICES.map((svc, i) => {
              const Icon = svc.icon;
              const hot = hoveredId === svc.id || activeId === svc.id;
              return (
                <Tip key={svc.id} label={`${svc.drillable ? 'ENTER' : 'INSPECT'} // ${svc.name}`} block>
                  <button
                    ref={(el) => registerSlot(svc.id, el)}
                    type="button"
                    data-hot={hot}
                    onClick={() => {
                      sfx.click();
                      onSelect(svc.id);
                    }}
                    onMouseEnter={() => onHover(svc.id)}
                    onMouseLeave={() => onHover(null)}
                    onFocus={() => onHover(svc.id)}
                    onBlur={() => onHover(null)}
                    aria-label={`${svc.drillable ? 'Enter' : 'Inspect'} ${svc.name}`}
                    style={{ '--accent': svc.accent, '--led': svc.accent }}
                    className="hover-glow accent-border accent-bg-soft flex w-full items-center gap-3 border px-3 py-2.5 text-left font-ui"
                  >
                    <span className="accent-text shrink-0">
                      <Icon size={18} strokeWidth={1.6} aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="accent-text block truncate text-[11px] font-bold tracking-wide">{svc.name}</span>
                      <span className="block text-[9px] track-20 text-white/40">{svc.slot}</span>
                    </span>
                    <span className="flex items-end gap-[2px]" aria-hidden>
                      {[6, 10, 7, 12, 8].map((h, k) => (
                        <span key={k} className="w-[3px] opacity-70" style={{ height: h, background: svc.accent }} />
                      ))}
                    </span>
                    <span className="led" style={{ animationDelay: `${i * 0.4}s` }} aria-hidden />
                  </button>
                </Tip>
              );
            })}

            {/* Decorative units */}
            <div aria-hidden className="grid grid-cols-8 gap-1 border border-white/10 bg-black/40 p-2">
              {Array.from({ length: 16 }).map((_, i) => (
                <span key={i} className="h-2 border border-white/15 bg-black/60" />
              ))}
            </div>
            <div aria-hidden className="flex h-7 items-center justify-between border border-white/10 bg-black/40 px-3 font-ui text-[9px] track-25 text-white/30">
              <span>UPS / PDU</span>
              <span className="text-matrix/70">LINE OK</span>
            </div>
          </div>

          <div aria-hidden className="rack-rail w-4 shrink-0 border-l border-cyber/20" />
        </div>
      </motion.div>
    </div>
  );
}
