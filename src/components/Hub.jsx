import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp, SECTOR_MS, ZOOM } from '../state/AppContext';
import { SECTORS } from '../data/sectors';
import useTerminal from '../hooks/useTerminal';
import useMediaQuery from '../hooks/useMediaQuery';
import useCameraZoom, { measurePose } from '../hooks/useCameraZoom';
import { cn } from '../lib/cn';
import GlitchText from './ui/GlitchText';
import SectorCard from './SectorCard';
import SystemLog from './SystemLog';

const SUBTITLE = [{ text: '// SELECT A SECTOR TO INITIATE NODE CONNECTION', pause: 0 }];
const stamp = () => new Date().toLocaleTimeString('en-GB');

export default function Hub() {
  const { dispatch } = useApp();
  const { pos } = useTerminal(SUBTITLE, { speed: 22 });
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const nextId = useRef(3);
  const cameraRef = useRef(null);
  const [log, setLog] = useState([
    { id: 0, time: stamp(), tone: 'ok', text: 'session established // visitor access granted' },
    {
      id: 1,
      time: stamp(),
      tone: 'info',
      text: `${SECTORS.length} sectors indexed, ${SECTORS.filter((s) => !s.locked).length} online, ${SECTORS.filter((s) => s.locked).length} restricted`,
    },
    { id: 2, time: stamp(), tone: 'info', text: 'awaiting operator input…' },
  ]);

  // Camera push toward the clicked sector card (local state: the hub remounts
  // fresh on return, and the handshake view takes over after the push).
  const [phase, setPhase] = useState(ZOOM.NONE);
  const [pose, setPose] = useState(null);
  const [targetId, setTargetId] = useState(null);
  const { dim, cameraProps } = useCameraZoom({ phase, pose, ms: SECTOR_MS });

  const push = useCallback((text, tone = 'info') => {
    setLog((prev) => [...prev, { id: nextId.current++, time: stamp(), tone, text }].slice(-5));
  }, []);

  const connect = (sector, cardEl) => {
    if (phase !== ZOOM.NONE || !cameraRef.current || !cardEl) return;
    push(`node_connect --target=${sector.target}`, 'ok');
    setPose(measurePose(cameraRef.current, cardEl, { scale: isDesktop ? 2.3 : 1.2, pan: true }));
    setTargetId(sector.id);
    setPhase(ZOOM.ENTERING);
  };

  useEffect(() => {
    if (phase !== ZOOM.ENTERING) return undefined;
    const t = setTimeout(() => dispatch({ type: 'CONNECT', sectorId: targetId }), SECTOR_MS.entering);
    return () => clearTimeout(t);
  }, [phase, targetId, dispatch]);

  return (
    <motion.main
      key="hub"
      className={cn('mx-auto flex min-h-[calc(100vh-3.2rem)] max-w-[1600px] flex-col justify-center px-4 py-10 sm:px-8', phase !== ZOOM.NONE && 'overflow-hidden')}
      initial={{ opacity: 0, filter: 'blur(6px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.98, filter: 'blur(8px)' }}
      transition={{ duration: 0.4 }}
    >
      <motion.div ref={cameraRef} {...cameraProps} className={cn(phase !== ZOOM.NONE && 'pointer-events-none')}>
        <div className={cn('zoomable mb-8 sm:mb-12', dim && 'is-dim')}>
          <p className="mb-2 font-mono text-xs tracking-[0.3em] text-matrix">&gt; SYSTEM ONLINE</p>
          <h1 className="flicker font-mono text-4xl font-bold leading-none tracking-tight text-cyber text-glow sm:text-6xl lg:text-7xl">
            <GlitchText auto>MAINFRAME_OS</GlitchText>
          </h1>
          <p className="mt-4 min-h-[1.5em] font-mono text-sm text-white/60">
            {SUBTITLE[0].text.slice(0, pos.i > 0 ? undefined : pos.c)}
            <span className="cursor-block text-cyber" />
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3 lg:gap-8">
          {SECTORS.map((sector, i) => (
            <SectorCard
              key={sector.id}
              sector={sector}
              index={i}
              dim={dim && sector.id !== targetId}
              onHover={(s) =>
                push(`scanning sector ${s.id} :: ${s.code} [${s.locked ? 'RESTRICTED' : 'ONLINE'}]`)
              }
              onDenied={(s) => push(`ACCESS_DENIED: sector ${s.id} :: clearance insufficient`, 'danger')}
              onConnect={connect}
            />
          ))}
        </div>

        <div className={cn('zoomable mt-8', dim && 'is-dim')}>
          <SystemLog entries={log} />
        </div>
      </motion.div>
    </motion.main>
  );
}
