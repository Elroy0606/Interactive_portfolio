import { ChevronRight } from 'lucide-react';
import CornerBrackets from '../ui/CornerBrackets';
import { sfx } from '../../lib/sound';

// Where each container sits on the desktop 3-column grid.
const POSITION = {
  jarvis1: 'lg:col-start-1 lg:row-start-1',
  jarvis2: 'lg:col-start-3 lg:row-start-1',
  juice: 'lg:col-start-1 lg:row-start-2',
  nmap: 'lg:col-start-3 lg:row-start-2',
};
const STATUS_TONE = {
  ok: 'border-matrix/50 bg-matrix/10 text-matrix',
  warn: 'border-warn/50 bg-warn/10 text-warn',
};

export default function ContainerCard({ container, registerNode, hot, onHover, onSelect }) {
  const Icon = container.icon;
  return (
    <button
      ref={(el) => registerNode(container.id, el)}
      type="button"
      data-hot={hot}
      onClick={() => {
        sfx.open();
        onSelect(container.id);
      }}
      onMouseEnter={() => {
        sfx.hover();
        onHover(container.id);
      }}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(container.id)}
      onBlur={() => onHover(null)}
      aria-label={`Open data panel for ${container.name}, status ${container.status}`}
      style={{ '--accent': container.accent, '--led': container.accent }}
      className={`hover-glow accent-border relative w-full border bg-panel/90 p-4 text-left backdrop-blur-sm lg:max-w-[320px] lg:self-center ${
        container.side === 'left' ? 'lg:justify-self-end' : 'lg:justify-self-start'
      } ${POSITION[container.id]}`}
    >
      <span className="accent-text">
        <CornerBrackets className="h-2.5 w-2.5" />
      </span>
      <div className="flex items-start gap-3">
        <div className="accent-text accent-bg-soft accent-border flex h-11 w-11 shrink-0 items-center justify-center border">
          <Icon size={22} strokeWidth={1.5} aria-hidden />
        </div>
        <div className="min-w-0 font-ui">
          <div className="text-[9px] track-25 text-white/40">{container.kind}</div>
          <div className="accent-text text-glow break-words text-[13px] font-bold leading-snug tracking-wide">
            {container.name}
          </div>
        </div>
      </div>

      <p className="mt-3 text-[12.5px] leading-relaxed text-white/60">
        <span className="font-ui text-[10px] tracking-widest text-white/35">ROLE ▸ </span>
        {container.role}
      </p>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/10 pt-2 font-ui text-[10px] tracking-widest">
        <span className={`border px-1.5 py-0.5 ${STATUS_TONE[container.tone]}`}>{container.status}</span>
        <span className="accent-text flex shrink-0 items-center">
          INSPECT <ChevronRight size={12} aria-hidden />
        </span>
      </div>
    </button>
  );
}
