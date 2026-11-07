import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../state/AppContext';
import { useMotion } from '../theme/motion';
import { SECTORS } from '../data/sectors';
import { TRACKS } from '../data/tracks';
import useTerminal from '../hooks/useTerminal';
import GlitchText from './ui/GlitchText';
import TrackCard from './TrackCard';
import SystemLog from './SystemLog';
import Highlights from './Highlights';

const SUBTITLE = [{ text: "> Everything built into this interface represents real systems I've deployed, applications I've coded, and security labs I've configured. Pick a path below: THEORY for what I have studied, PRACTICAL for what I have built hands-on.", pause: 0 }];
const stamp = () => new Date().toLocaleTimeString('en-GB');

export default function Hub() {
  const { dispatch } = useApp();
  const { viewProps } = useMotion();
  const { pos } = useTerminal(SUBTITLE, { speed: 22 });
  const nextId = useRef(3);
  const [log, setLog] = useState([
    { id: 0, time: stamp(), tone: 'ok', text: 'session established // visitor access granted' },
    {
      id: 1,
      time: stamp(),
      tone: 'info',
      text: `${TRACKS.length} paths indexed // ${SECTORS.filter((s) => !s.locked).length} sectors online`,
    },
    { id: 2, time: stamp(), tone: 'info', text: 'awaiting operator input…' },
  ]);

  const push = useCallback((text, tone = 'info') => {
    setLog((prev) => [...prev, { id: nextId.current++, time: stamp(), tone, text }].slice(-5));
  }, []);

  // The home page offers two paths (data/tracks.js); each opens a track page
  // listing its sectors. It opens straight away: the only wait is the short
  // view transition (motion token `view`), no loading sequence in between.
  const enter = (track) => dispatch({ type: 'ENTER_TRACK', track: track.id });

  return (
    <motion.main
      key="hub"
      className="mx-auto flex min-h-[calc(100vh-3.2rem)] max-w-[1600px] flex-col justify-center px-4 py-10 sm:px-8"
      {...viewProps}
    >
      <div className="mb-8 sm:mb-12">
        <p className="mb-2 font-ui text-xs track-30 text-matrix">&gt; SYSTEM ONLINE</p>
        <h1 className="flicker font-ui text-4xl font-bold leading-none tracking-tight text-cyber text-glow sm:text-6xl lg:text-7xl">
          <GlitchText auto>WELCOME TO MY INTERACTIVE PORTFOLIO</GlitchText>
        </h1>
        <p className="mt-4 min-h-[1.5em] font-ui text-sm text-white/60">
          {SUBTITLE[0].text.slice(0, pos.i > 0 ? undefined : pos.c)}
          <span className="cursor-block text-cyber" />
        </p>
      </div>

      <section aria-labelledby="hub-paths" className="mb-10 sm:mb-12">
        <h2 id="hub-paths" className="mb-3 font-ui text-[11px] track-25 text-white/45">
          &gt; SELECT_PATH // {TRACKS.length} AVAILABLE
        </h2>
        <div className="grid gap-5 md:grid-cols-2 lg:gap-6">
          {TRACKS.map((track, i) => (
            <TrackCard
              key={track.id}
              track={track}
              index={i}
              onHover={(t) => push(`scanning track ${t.letter} :: ${t.code}`)}
              onEnter={enter}
            />
          ))}
        </div>
      </section>

      <Highlights />

      <div className="mt-8">
        <SystemLog entries={log} />
      </div>
    </motion.main>
  );
}
