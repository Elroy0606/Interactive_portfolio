import { ChevronRight } from 'lucide-react';
import CornerBrackets from '../ui/CornerBrackets';
import { sfx } from '../../lib/sound';

// Where each node sits on the desktop 3-column grid.
const POSITION = {
  docker: 'lg:col-start-1 lg:row-start-1',
  haos: 'lg:col-start-3 lg:row-start-1',
  kali: 'lg:col-start-1 lg:row-start-2',
  ollama: 'lg:col-start-3 lg:row-start-2',
  pihole: 'lg:col-start-3 lg:row-start-3',
  adlab: 'lg:col-start-1 lg:row-start-3',
};

export default function NodeCard({ service, registerNode, hot, dim = false, onHover, onSelect }) {
  const Icon = service.icon;
  return (
    <button
      ref={(el) => registerNode(service.id, el)}
      data-tour={service.id}
      type="button"
      data-hot={hot}
      onClick={() => {
        sfx.open();
        onSelect(service.id);
      }}
      onMouseEnter={() => {
        sfx.hover();
        onHover(service.id);
      }}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(service.id)}
      onBlur={() => onHover(null)}
      aria-label={
        service.drillable ? `Enter ${service.name} internal view` : `Open data panel for ${service.name}`
      }
      style={{ '--accent': service.accent, '--led': service.accent }}
      className={`hover-glow zoomable ${dim ? 'is-dim' : ''} accent-border relative w-full border bg-panel/90 p-4 text-left backdrop-blur-sm lg:max-w-[300px] lg:self-center ${
        service.side === 'left' ? 'lg:justify-self-end' : 'lg:justify-self-start'
      } ${POSITION[service.id]}`}
    >
      <span className="accent-text">
        <CornerBrackets className="h-2.5 w-2.5" />
      </span>
      <div className="flex items-center gap-3">
        <div className="accent-text accent-bg-soft flex h-11 w-11 shrink-0 items-center justify-center border accent-border">
          <Icon size={22} strokeWidth={1.5} aria-hidden />
        </div>
        <div className="min-w-0 font-ui">
          <div className="accent-text truncate text-[13px] font-bold tracking-wide text-glow">{service.name}</div>
          <div className="text-[11px] text-white/50">{service.short}</div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2 font-ui text-[10px] tracking-widest">
        <span className="flex items-center gap-1.5 text-white/50">
          <span className="led" aria-hidden /> {service.state ?? 'ONLINE'} · {service.slot}
        </span>
        <span className="accent-text flex items-center">
          {service.drillable ? 'ENTER' : 'INSPECT'} <ChevronRight size={12} aria-hidden />
        </span>
      </div>
    </button>
  );
}
