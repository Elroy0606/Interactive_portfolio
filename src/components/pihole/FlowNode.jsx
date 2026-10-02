import { Fragment } from 'react';
import CornerBrackets from '../ui/CornerBrackets';

// Let long SNAKE_CASE labels wrap at underscores instead of mid-word.
const softBreaks = (text) =>
  text.split('_').map((part, i, arr) => (
    <Fragment key={i}>
      {part}
      {i < arr.length - 1 && (
        <>
          _<wbr />
        </>
      )}
    </Fragment>
  ));

// One stage of the DNS pipeline (laptop, resolver, content). The Pi-hole stage
// has its own card in PiholeSubView because it hosts the filter visual.
export default function FlowNode({ nodeRef, tag, title, caption, icon: Icon, accent, className = '' }) {
  return (
    <div
      ref={nodeRef}
      style={{ '--accent': accent, '--led': accent }}
      className={`accent-border accent-glow relative border bg-panel/90 p-4 backdrop-blur-sm ${className}`}
    >
      <span className="accent-text">
        <CornerBrackets className="h-2.5 w-2.5" />
      </span>
      <div className="font-ui text-[10px] track-25 text-white/40">{tag}</div>
      <div className="mt-2 flex items-start gap-3">
        <div className="accent-text accent-bg-soft accent-border flex h-11 w-11 shrink-0 items-center justify-center border">
          <Icon size={22} strokeWidth={1.5} aria-hidden />
        </div>
        <div className="min-w-0">
          <div className="accent-text text-glow font-ui text-[12px] font-bold leading-snug tracking-wide">
            {softBreaks(title)}
          </div>
          <p className="mt-1 text-[12px] leading-snug text-white/50">{caption}</p>
        </div>
      </div>
    </div>
  );
}
