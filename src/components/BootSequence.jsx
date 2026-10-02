import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../state/AppContext';
import useTerminal from '../hooks/useTerminal';
import TerminalOutput from './TerminalOutput';

const LINES = [
  { text: 'MAINFRAME_OS v4.2.0 // COLD BOOT', tone: 'cmd', pause: 200 },
  { text: 'BIOS CHECK ............................. PASS', tone: 'dim', pause: 60 },
  { text: '[ OK ] mounting /dev/sector01 ... /dev/sector03', pause: 60 },
  { text: '[ OK ] loading neural-grid drivers', pause: 60 },
  { text: '[ OK ] establishing encrypted uplink', pause: 60 },
  { text: '[WARN] sector02 : clearance not granted', tone: 'warn', pause: 80 },
  { text: '[ OK ] telemetry daemon online', pause: 200 },
  { text: '', pause: 40 },
  { text: '> authenticating GUEST_USER ...', tone: 'cmd', pause: 260 },
  { text: '> ACCESS LEVEL: VISITOR // WELCOME TO THE GRID', tone: 'ok', pause: 500 },
];

export default function BootSequence() {
  const { dispatch } = useApp();
  const finish = () => dispatch({ type: 'BOOT_DONE' });
  const { pos, done, skip } = useTerminal(LINES, { speed: 11, onDone: () => setTimeout(finish, 450) });

  // Any key / click skips the boot log.
  useEffect(() => {
    const handler = () => skip();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [skip]);

  return (
    <motion.main
      key="boot"
      className="flex min-h-screen cursor-pointer items-center justify-center px-5"
      onClick={skip}
      exit={{ opacity: 0, filter: 'blur(6px)' }}
      transition={{ duration: 0.35 }}
    >
      <div className="w-full max-w-2xl">
        <div className="mb-4 font-ui text-xs track-30 text-cyber/70">// SYSTEM BOOT</div>
        <div className="min-h-[300px] border border-cyber/25 bg-panel/70 p-4 shadow-[0_0_30px_color-mix(in_srgb,var(--glow-cyber)_8%,transparent)] sm:p-6">
          <TerminalOutput lines={LINES} pos={pos} prompt={false} />
        </div>
        <div className="mt-3 text-right font-ui text-[11px] tracking-widest text-white/30">
          {done ? 'LAUNCHING…' : '[ PRESS ANY KEY OR CLICK TO SKIP ]'}
        </div>
      </div>
    </motion.main>
  );
}
