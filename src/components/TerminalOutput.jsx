const TONE = {
  plain: 'text-white/80',
  dim: 'text-white/40',
  cmd: 'text-cyber',
  ok: 'text-matrix',
  warn: 'text-warn',
  danger: 'text-danger',
};
const TAG_TONE = { OK: 'text-matrix', WARN: 'text-warn', FAIL: 'text-danger', '..': 'text-cyber' };
const TAG_RE = /^(\[\s?(OK|WARN|FAIL|\.\.)\s?\])/;

// Renders the partially-typed lines produced by useTerminal.
export default function TerminalOutput({ lines, pos, prompt = true }) {
  const done = pos.i >= lines.length;
  return (
    <div className="font-mono text-[12.5px] leading-relaxed sm:text-[13px]" aria-live="polite">
      {lines.map((line, idx) => {
        if (idx > pos.i) return null;
        const visible = idx < pos.i ? line.text : line.text.slice(0, pos.c);
        const tag = line.text.match(TAG_RE);
        const head = tag ? visible.slice(0, tag[1].length) : '';
        const rest = tag ? visible.slice(tag[1].length) : visible;
        return (
          <div key={idx} className={`whitespace-pre-wrap break-words ${TONE[line.tone || 'plain']}`}>
            {tag && <span className={TAG_TONE[tag[2]]}>{head}</span>}
            {rest || (!tag && ' ')}
            {idx === pos.i && <span className="cursor-block" />}
          </div>
        );
      })}
      {done && prompt && (
        <div className="text-cyber">
          &gt;<span className="cursor-block" />
        </div>
      )}
    </div>
  );
}
