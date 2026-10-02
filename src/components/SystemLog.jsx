const TONE = { info: 'text-white/55', ok: 'text-matrix', warn: 'text-warn', danger: 'text-danger' };

export default function SystemLog({ entries }) {
  return (
    <section aria-label="System log" className="border border-cyber/20 bg-panel/70 p-3 font-mono text-[11.5px] sm:p-4">
      <div className="mb-2 flex items-center justify-between text-[10px] track-25 text-cyber/70">
        <span>// SYSTEM_LOG</span>
        <span className="text-white/30">tail -f /var/log/mainframe</span>
      </div>
      <ul className="space-y-0.5" aria-live="polite">
        {entries.map((e) => (
          <li key={e.id} className={`flex gap-3 ${TONE[e.tone] ?? TONE.info}`}>
            <span className="shrink-0 text-white/30">{e.time}</span>
            <span className="min-w-0 break-words">{e.text}</span>
          </li>
        ))}
        <li className="text-cyber">
          &gt;<span className="cursor-block" />
        </li>
      </ul>
    </section>
  );
}
