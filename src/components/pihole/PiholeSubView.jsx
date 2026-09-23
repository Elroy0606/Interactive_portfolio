import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Cloud, Globe, Info, Laptop, ShieldBan } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { getService } from '../../data/services';
import useTraces from '../../hooks/useTraces';
import useTerminal from '../../hooks/useTerminal';
import useMediaQuery from '../../hooks/useMediaQuery';
import useDnsSimulation from '../../hooks/useDnsSimulation';
import GlitchText from '../ui/GlitchText';
import TraceLayer from '../ui/TraceLayer';
import Tip from '../ui/Tip';
import DataHUD from '../proxmox/DataHUD';
import CornerBrackets from '../ui/CornerBrackets';
import FlowNode from './FlowNode';
import FilterVisual from './FilterVisual';
import WebUiPanel from './WebUiPanel';
import { sfx } from '../../lib/sound';

const CYAN = '#00f0ff';
const GREEN = '#00ff66';
const BLUE = '#4da3ff';

const MANIFEST_LINE = [{ text: '> tracing DNS_TRAFFIC_FLOW ... 5 stages, upstream resolver reachable', pause: 0 }];

// Drill-down view for the Pi-hole node. Left: the DNS request lifecycle as a
// schematic (horizontal on desktop, vertical on small screens). Right: a
// simulated Pi-hole web UI with live telemetry.
export default function PiholeSubView() {
  const { dispatch } = useApp();
  const pihole = getService('pihole');
  const isLg = useMediaQuery('(min-width: 1024px)');
  const sim = useDnsSimulation();
  const { pos } = useTerminal(MANIFEST_LINE, { speed: 14 });
  const [showInfo, setShowInfo] = useState(false);

  const stageRef = useRef(null);
  const laptopRef = useRef(null);
  const piRef = useRef(null);
  const inRef = useRef(null);
  const outRef = useRef(null);
  const resolverRef = useRef(null);
  const contentRef = useRef(null);

  const traces = useTraces(stageRef, (rel) => {
    const els = [laptopRef, piRef, inRef, outRef, resolverRef, contentRef].map((r) => r.current);
    if (els.some((e) => !e)) return [];
    const [l, p, i, o, u, c] = els.map(rel);

    if (isLg) {
      // horizontal pipeline: laptop → pi-hole → resolver, then resolver ↓ content, content ← back to laptop
      return [
        { id: 'query', accent: CYAN, x1: l.right, y1: l.cy, x2: p.left, y2: i.cy, packets: 4, dur: 2.2, packetColor: CYAN, label: 'QUERY', lx: (l.right + p.left) / 2, ly: Math.min(l.cy, i.cy) - 8 },
        { id: 'allowed', accent: GREEN, x1: p.right, y1: o.cy, x2: u.left, y2: u.cy, packets: 3, dur: 2.2, packetColor: GREEN, label: 'ALLOWED', lx: (p.right + u.left) / 2, ly: Math.min(o.cy, u.cy) - 8 },
        { id: 'resolved', accent: GREEN, x1: u.cx, y1: u.bottom, x2: c.cx, y2: c.top, d: `M${u.cx} ${u.bottom} V${c.top}`, packets: 2, dur: 1.6, packetColor: GREEN, label: 'RESOLVED', lx: u.cx + 8, ly: (u.bottom + c.top) / 2 + 3, anchor: 'start' },
        { id: 'content', accent: BLUE, x1: c.left, y1: c.cy, x2: l.cx, y2: l.bottom, d: `M${c.left} ${c.cy} H${l.cx} V${l.bottom}`, packets: 4, dur: 3.4, packetColor: BLUE, label: 'AD-FREE CONTENT', lx: (c.left + l.cx) / 2, ly: c.cy - 8 },
      ];
    }

    // stacked pipeline: everything shares one column, return path runs up the left gutter
    const gx = Math.min(l.left, c.left) - 14;
    return [
      { id: 'query', accent: CYAN, x1: l.cx, y1: l.bottom, x2: p.cx, y2: p.top, d: `M${l.cx} ${l.bottom} V${p.top}`, packets: 3, dur: 1.8, packetColor: CYAN, label: 'QUERY', lx: l.cx + 8, ly: (l.bottom + p.top) / 2 + 3, anchor: 'start' },
      { id: 'allowed', accent: GREEN, x1: p.cx, y1: p.bottom, x2: u.cx, y2: u.top, d: `M${p.cx} ${p.bottom} V${u.top}`, packets: 2, dur: 1.8, packetColor: GREEN, label: 'ALLOWED', lx: p.cx + 8, ly: (p.bottom + u.top) / 2 + 3, anchor: 'start' },
      { id: 'resolved', accent: GREEN, x1: u.cx, y1: u.bottom, x2: c.cx, y2: c.top, d: `M${u.cx} ${u.bottom} V${c.top}`, packets: 2, dur: 1.8, packetColor: GREEN, label: 'RESOLVED', lx: u.cx + 8, ly: (u.bottom + c.top) / 2 + 3, anchor: 'start' },
      { id: 'content', accent: BLUE, x1: c.left, y1: c.cy, x2: l.left, y2: l.cy, d: `M${c.left} ${c.cy} H${gx} V${l.cy} H${l.left}`, packets: 4, dur: 4, packetColor: BLUE },
    ];
  });

  const exit = useCallback(() => {
    sfx.close();
    dispatch({ type: 'ZOOM_EXIT' });
  }, [dispatch]);

  // Esc backs out to the lab unless the info drawer is open (it handles Esc itself).
  useEffect(() => {
    if (showInfo) return undefined;
    const onKey = (e) => e.key === 'Escape' && exit();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showInfo, exit]);

  const closeInfo = useCallback(() => setShowInfo(false), []);

  return (
    <>
      <motion.section
        aria-label="Pi-hole DNS traffic flow"
        initial={{ opacity: 0, scale: 1.06 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <button type="button" className="btn-cyber mb-4" onClick={exit}>
              <ArrowLeft size={14} aria-hidden /> [RETURN_TO_PROXMOX_LAB]
            </button>
            <p className="font-mono text-xs tracking-[0.3em] text-matrix">[SECTOR 01 ▸ NODE {pihole.slot}] // ACCESS_GRANTED</p>
            <h1 className="mt-1 break-words font-mono text-xl font-bold leading-tight text-cyber text-glow sm:text-3xl">
              <GlitchText auto>DNS_TRAFFIC_FLOW::AD_BLOCKING_PIPELINE</GlitchText>
            </h1>
            <p className="mt-2 min-h-[1.5em] font-mono text-xs text-white/50">
              {MANIFEST_LINE[0].text.slice(0, pos.i > 0 ? undefined : pos.c)}
              <span className="cursor-block text-cyber" />
            </p>
          </div>

          <div className="flex flex-wrap gap-2 font-mono text-[11px] tracking-widest">
            <Tip label="PI-HOLE CONFIG, ARCHITECTURE, STACK" side="bottom">
              <button
                type="button"
                onClick={() => {
                  sfx.open();
                  setShowInfo(true);
                }}
                className="flex items-center gap-2 border border-[#4da3ff]/40 bg-[#4da3ff]/5 px-2.5 py-1.5 text-[#4da3ff] transition-colors hover:bg-[#4da3ff]/15"
              >
                <Info size={13} aria-hidden /> NODE_INFO
              </button>
            </Tip>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)]">
          {/* ---- DNS flow schematic ---- */}
          <div className="min-w-0">
            <div className="relative overflow-hidden border border-cyber/25 shadow-[0_0_50px_rgba(0,240,255,0.07)]">
              <div ref={stageRef} className="blueprint-grid relative p-4 pb-9 sm:p-6 sm:pb-10 lg:flex lg:min-h-[66vh] lg:flex-col lg:justify-center lg:px-6 lg:py-10">
                <div aria-hidden className="pointer-events-none absolute left-3 top-2 font-mono text-[10px] tracking-[0.25em] text-cyber/50">
                  DNS_LIFECYCLE // 5 STAGES
                </div>
                <div aria-hidden className="pointer-events-none absolute bottom-2 left-3 font-mono text-[10px] tracking-[0.25em] text-cyber/40">
                  FIG.03 — AD_BLOCKING_PIPELINE
                </div>

                <TraceLayer traces={traces} mobile />

                <div className="relative mt-3 grid gap-y-16 pl-5 lg:mt-0 lg:grid-cols-[1fr_1.45fr_1fr] lg:gap-x-14 lg:pl-0">
                  <FlowNode
                    nodeRef={laptopRef}
                    tag="[CLIENT_DEVICE]"
                    title="USER_LAPTOP_DNS_CONFIGURED_TO_PIHOLE"
                    caption="Every lookup is sent to the Pi-hole first."
                    icon={Laptop}
                    accent={CYAN}
                    className="lg:col-start-1 lg:row-start-1 lg:self-center"
                  />

                  {/* Pi-hole node hosting the filtering logic */}
                  <div
                    ref={piRef}
                    style={{ '--accent': BLUE, '--led': BLUE }}
                    className="accent-glow accent-border relative border bg-panel/90 p-4 backdrop-blur-sm lg:col-start-2 lg:row-start-1"
                  >
                    <span className="accent-text">
                      <CornerBrackets className="h-2.5 w-2.5" />
                    </span>
                    <div className="font-mono text-[10px] tracking-[0.25em] text-white/40">[PI-HOLE_INTERCEPT]</div>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="accent-text accent-bg-soft accent-border flex h-11 w-11 shrink-0 items-center justify-center border">
                        <ShieldBan size={22} strokeWidth={1.5} aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <div className="accent-text text-glow font-mono text-[13px] font-bold tracking-wide">PI-HOLE // DNS_SINKHOLE</div>
                        <p className="text-[12px] text-white/50">Checks each query against the blocklist.</p>
                      </div>
                      <span className="led ml-auto shrink-0" aria-hidden />
                    </div>

                    <div className="mb-1.5 mt-4 font-mono text-[10px] tracking-[0.25em] text-white/40">[FILTERING_LOGIC]</div>
                    <FilterVisual inRef={inRef} outRef={outRef} />

                    <div className="mt-2 flex flex-wrap justify-between gap-x-3 gap-y-1 font-mono text-[9.5px] tracking-widest">
                      <span className="text-danger/80">BLOCKED ▸ ANSWERED WITH 0.0.0.0</span>
                      <span className="text-matrix/80">SAFE ▸ FORWARDED UPSTREAM</span>
                    </div>
                  </div>

                  <FlowNode
                    nodeRef={resolverRef}
                    tag="[UPSTREAM_RESOLVER]"
                    title="EXTERNAL_DNS_PROVIDER (e.g., Quad9)"
                    caption="Only clean requests are forwarded here."
                    icon={Cloud}
                    accent={GREEN}
                    className="lg:col-start-3 lg:row-start-1 lg:self-center"
                  />
                  <FlowNode
                    nodeRef={contentRef}
                    tag="[CONTENT_DELIVERY]"
                    title="AD-FREE_WEBSITE_CONTENT"
                    caption="Delivered straight back to the laptop."
                    icon={Globe}
                    accent={BLUE}
                    className="lg:col-start-3 lg:row-start-2"
                  />
                </div>
              </div>
            </div>

            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[10px] tracking-widest text-white/45" aria-label="Legend">
              <li><span style={{ color: CYAN }}>●</span> DNS QUERY</li>
              <li><span style={{ color: GREEN }}>●</span> ALLOWED / FORWARDED</li>
              <li><span className="text-danger">●</span> BLOCKED (SINKHOLED)</li>
              <li><span style={{ color: BLUE }}>●</span> CONTENT RESPONSE</li>
            </ul>
          </div>

          {/* ---- simulated web UI ---- */}
          <WebUiPanel sim={sim} />
        </div>

        <p className="mt-4 text-center font-mono text-[11px] tracking-[0.2em] text-white/30">
          [ ESC OR [RETURN_TO_PROXMOX_LAB] TO EXIT · ALL TRAFFIC SHOWN IS SIMULATED ]
        </p>
      </motion.section>

      {/* Sibling of the scaled section so its ancestors never get a transform */}
      <AnimatePresence>
        {showInfo && <DataHUD key="pihole-info" eyebrow={`NODE_INFO // ${pihole.slot}`} service={pihole} onClose={closeInfo} />}
      </AnimatePresence>
    </>
  );
}
