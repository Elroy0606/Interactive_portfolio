import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../state/AppContext';
import { SECTORS } from '../data/sectors';
import useTerminal from '../hooks/useTerminal';
import TerminalOutput from './TerminalOutput';
import { sfx } from '../lib/sound';

// Simulated command-line handshake shown between the hub and a sector.
export default function Handshake() {
  const { state, dispatch } = useApp();
  const sector = SECTORS.find((s) => s.id === state.targetSector) ?? SECTORS[0];

  const lines = useMemo(
    () => [
      { text: `> executing node_connect --target=${sector.target}...`, tone: 'cmd', pause: 260 },
      { text: `[ .. ] resolving host ${sector.host ?? 'pve.local'}`, tone: 'dim', pause: 120 },
      { text: '[ OK ] tls 1.3 handshake // AES-256-GCM', pause: 80 },
      { text: '[ OK ] verifying operator token', pause: 80 },
      { text: `[ OK ] mounting /sector/${sector.id}/${sector.code.toLowerCase()}`, pause: 220 },
      { text: '', pause: 20 },
      { text: '> access granted', tone: 'ok', pause: 500 },
    ],
    [sector],
  );

  const { pos, done } = useTerminal(lines, {
    speed: 16,
    onDone: () => {
      sfx.confirm();
      setTimeout(() => dispatch({ type: 'ENTER_SECTOR' }), 450);
    },
  });

  const progress = Math.min(100, ((pos.i + (done ? 0 : pos.c / (lines[pos.i]?.text.length || 1))) / lines.length) * 100);

  return (
    <motion.main
      key="handshake"
      className="flex min-h-[calc(100vh-49px)] items-center justify-center px-5"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.03, filter: 'blur(8px)' }}
      transition={{ duration: 0.35 }}
    >
      <div className="w-full max-w-2xl">
        <div className="mb-3 flex items-center justify-between font-mono text-xs tracking-[0.25em] text-cyber/80">
          <span>// NODE_CONNECT</span>
          <span className="flicker">SECTOR_{sector.id}</span>
        </div>
        <div className="relative border border-cyber/30 bg-panel/80 p-4 shadow-[0_0_40px_rgba(0,240,255,0.12)] sm:p-6">
          <div className="min-h-[190px]">
            <TerminalOutput lines={lines} pos={pos} prompt={false} />
          </div>
          <div className="mt-4 h-1 w-full bg-white/10">
            <div
              className="h-full bg-cyber shadow-[0_0_10px_#00f0ff] transition-[width] duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </motion.main>
  );
}
