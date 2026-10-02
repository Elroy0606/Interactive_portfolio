import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ListChecks, Server } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { getService } from '../../data/services';
import {
  BUILT,
  DECISIONS,
  FLOWS,
  IN_PRODUCTION,
  LIMITS,
  TAGS,
  TASKS,
  TROUBLE,
  ZONES,
  getNode,
  nodesIn,
} from '../../data/adlab';
import useTraces from '../../hooks/useTraces';
import useTerminal from '../../hooks/useTerminal';
import useMediaQuery from '../../hooks/useMediaQuery';
import GlitchText from '../ui/GlitchText';
import TraceLayer from '../ui/TraceLayer';
import Tip from '../ui/Tip';
import CornerBrackets from '../ui/CornerBrackets';
import { cn } from '../../lib/cn';
import { sfx } from '../../lib/sound';

const CYAN = '#00f0ff';
const GREEN = '#00ff66';
const AMBER = '#ffb700';
const VIOLET = '#a78bfa';

const MANIFEST_LINE = [{ text: '> mapping lab.local ... 2 networks, 1 firewall between them, every rule named', pause: 0 }];

const JUMPS = [
  ['adlab-map', 'NETWORK_MAP'],
  ['adlab-built', 'WHAT_I_BUILT'],
  ['adlab-decisions', 'DESIGN_DECISIONS'],
  ['adlab-trouble', 'TROUBLESHOOTING'],
  ['adlab-limits', 'LIMITATIONS'],
];

const pad = (n) => String(n).padStart(2, '0');
const flowById = (id) => FLOWS.find((f) => f.id === id);
// Let SNAKE_CASE node names wrap at underscores instead of mid-word.
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

function Section({ id, title, accent = CYAN, intro, children }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} style={{ '--accent': accent }} className="scroll-mt-20">
      <h2 id={`${id}-title`} className="accent-text flex items-center gap-2 font-mono text-sm font-bold tracking-[0.3em]">
        <span aria-hidden className="h-4 w-1 bg-current shadow-[0_0_8px_currentColor]" />
        {title}
      </h2>
      {intro && <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/60">{intro}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

// One machine on the diagram. Hover / focus previews it in the inspector, click pins it.
function LabNode({ node, registerNode, hot, pinned, onHover, onPin, className = '', children }) {
  const Icon = node.icon;
  return (
    <button
      ref={(el) => registerNode(node.id, el)}
      type="button"
      data-hot={hot}
      aria-pressed={pinned}
      aria-label={`${node.name.replaceAll('_', ' ')}, ${ZONES[node.zone].short}. ${node.role}`}
      onClick={() => {
        sfx.click();
        onPin(node.id);
      }}
      onMouseEnter={() => {
        sfx.hover();
        onHover(node.id);
      }}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(node.id)}
      onBlur={() => onHover(null)}
      style={{ '--accent': node.accent, '--led': node.accent }}
      className={cn('hover-glow accent-border relative w-full border bg-panel/90 p-3 text-left backdrop-blur-sm', className)}
    >
      <span className="accent-text">
        <CornerBrackets className="h-2.5 w-2.5" />
      </span>
      <div className="flex items-start gap-2.5">
        <div className="accent-text accent-bg-soft accent-border flex h-9 w-9 shrink-0 items-center justify-center border">
          <Icon size={18} strokeWidth={1.5} aria-hidden />
        </div>
        <div className="min-w-0 font-mono">
          <div className="accent-text text-glow text-[12px] font-bold leading-snug tracking-wide">{softBreaks(node.name)}</div>
          <div className="mt-0.5 text-[10.5px] leading-snug text-white/50">{node.tag}</div>
        </div>
      </div>
      {children}
    </button>
  );
}

// Side panel describing the hovered / pinned node.
function Inspector({ node, panelRef }) {
  const Icon = node.icon;
  return (
    <section
      ref={panelRef}
      aria-label="Node inspector"
      aria-live="polite"
      className="relative flex scroll-mb-4 flex-col self-start border border-cyber/30 bg-panel/50 shadow-[0_0_40px_rgba(0,240,255,0.08)] backdrop-blur-md"
    >
      <div className="flex items-center gap-3 border-b border-cyber/20 bg-black/30 px-3 py-2 font-mono text-[10px] tracking-widest">
        <span className="flex gap-1" aria-hidden>
          <span className="h-2 w-2 rounded-full bg-danger/70" />
          <span className="h-2 w-2 rounded-full bg-warn/70" />
          <span className="h-2 w-2 rounded-full bg-matrix/70" />
        </span>
        <span className="min-w-0 flex-1 truncate text-cyber/80">NODE_INSPECTOR</span>
        <span className="shrink-0 text-white/35">HOVER OR CLICK A NODE</span>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={node.id}
          style={{ '--accent': node.accent }}
          className="p-4 xl:min-h-[420px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14 }}
        >
          <div className="flex items-center gap-3">
            <div className="accent-text accent-bg-soft accent-glow accent-border flex h-12 w-12 shrink-0 items-center justify-center border">
              <Icon size={24} strokeWidth={1.5} aria-hidden />
            </div>
            <div className="min-w-0 font-mono">
              <p className="text-[10px] tracking-[0.25em] text-white/45">{ZONES[node.zone].label}</p>
              <h3 className="accent-text text-glow break-words text-lg font-bold leading-tight tracking-wide">{node.name}</h3>
            </div>
          </div>

          <p className="accent-border accent-bg-soft mt-4 border-l-4 py-2.5 pl-3 pr-2 text-sm leading-relaxed text-white/90" style={{ borderLeftColor: 'var(--accent)' }}>
            {node.role}
          </p>

          <h4 className="accent-text mb-2 mt-5 font-mono text-[11px] font-bold tracking-[0.3em]">WHAT_I_CONFIGURED</h4>
          <ul className="space-y-2 text-[13.5px] leading-relaxed text-white/80">
            {node.configured.map((line) => (
              <li key={line} className="flex gap-2.5">
                <span className="accent-text mt-[2px] shrink-0 font-mono text-xs">▸</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>

          <h4 className="accent-text mb-2 mt-5 font-mono text-[11px] font-bold tracking-[0.3em]">TRAFFIC_PATHS</h4>
          <ul className="space-y-1.5 font-mono text-[11px]">
            {node.flows.map((id) => {
              const f = flowById(id);
              return (
                <li key={id} className="border border-white/10 bg-black/25 px-2.5 py-1.5">
                  <span style={{ color: f.accent }}>● {f.label}</span>
                  <span className="block text-white/55">{f.rule}</span>
                </li>
              );
            })}
          </ul>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

// Drill-down view for the Windows Server / Active Directory lab: an interactive
// network diagram (two zones with the firewall between them) plus the write-up.
// Networks are named by role only; no addresses appear anywhere in this view.
export default function AdLabSubView() {
  const { dispatch } = useApp();
  const lab = getService('adlab');
  const isLg = useMediaQuery('(min-width: 1024px)');
  const { pos } = useTerminal(MANIFEST_LINE, { speed: 14 });
  const [hovered, setHovered] = useState(null); // node under the pointer / keyboard focus
  const [pinned, setPinned] = useState('fw'); // node kept in the inspector
  const [flowHover, setFlowHover] = useState(null); // traffic rule hovered in the legend

  const stageRef = useRef(null);
  const extRef = useRef(null);
  const labRef = useRef(null);
  const inspectorRef = useRef(null);
  const nodeEls = useRef({});
  const registerNode = useCallback((id, el) => {
    nodeEls.current[id] = el;
  }, []);

  // Every path is one continuous line that runs behind the firewall card, so
  // the packets visibly pass through it.
  const traces = useTraces(stageRef, (rel) => {
    if (!isLg) return []; // stacked layout: the rules list under the stage carries this instead
    const ids = ['laptop', 'internet', 'pve', 'fw', 'rd01', 'veeam01', 'worker'];
    const els = [...ids.map((id) => nodeEls.current[id]), extRef.current, labRef.current];
    if (els.some((e) => !e)) return [];
    const [l, i, h, f, r, v, w, ext, zone] = els.map(rel);

    const yUp = (ext.bottom + f.top) / 2; // lane between the home network and the firewall
    const gap = zone.top - f.bottom; // lanes between the firewall and the lab network
    const yRdp = f.bottom + gap * 0.5;
    const yBackup = f.bottom + gap * 0.68;
    const yWorker = f.bottom + gap * 0.32;
    const xRdp = f.left + f.width * 0.1;
    const xBackup = f.left + f.width * 0.72;
    const xWorker = f.left + f.width * 0.9;

    return [
      {
        id: 'rdp', accent: CYAN, packetColor: CYAN, packets: 3, dur: 4.2,
        x1: l.cx, y1: l.bottom, x2: r.cx, y2: r.top,
        d: `M${l.cx} ${l.bottom} V${yUp} H${xRdp} V${yRdp} H${r.cx} V${r.top}`,
        label: 'RDP ONLY · DNAT', lx: (l.cx + xRdp) / 2, ly: yUp - 8,
      },
      {
        id: 'web', accent: GREEN, packetColor: GREEN, packets: 3, dur: 3.4,
        x1: f.cx, y1: zone.top, x2: i.cx, y2: i.bottom,
        d: `M${f.cx} ${zone.top} V${yUp} H${i.cx} V${i.bottom}`,
        label: 'DNS · HTTP · HTTPS', lx: Math.min(f.cx, i.cx) - 10, ly: yUp + 3, anchor: 'end',
      },
      {
        id: 'backup', accent: VIOLET, packetColor: VIOLET, packets: 3, dur: 4.2,
        x1: v.cx, y1: v.top, x2: h.cx, y2: h.bottom,
        d: `M${v.cx} ${v.top} V${yBackup} H${xBackup} V${yUp} H${h.cx} V${h.bottom}`,
        label: 'MGMT PORTS ONLY · BACKUPS', lx: (xBackup + h.cx) / 2, ly: yUp - 8,
      },
      {
        id: 'backup-w', accent: VIOLET, packetColor: VIOLET, packets: 2, dur: 2.6,
        x1: w.cx, y1: w.top, x2: xWorker, y2: f.bottom,
        d: `M${w.cx} ${w.top} V${yWorker} H${xWorker} V${f.bottom}`,
      },
    ];
  });

  const exit = useCallback(() => {
    sfx.close();
    dispatch({ type: 'ZOOM_EXIT' });
  }, [dispatch]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && exit();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [exit]);

  // Pinning a node on a stacked layout: bring the inspector into view if it is off-screen.
  const pin = useCallback((id) => {
    setPinned(id);
    const r = inspectorRef.current?.getBoundingClientRect();
    if (r && (r.top > window.innerHeight - 140 || r.bottom < 80)) {
      inspectorRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, []);

  const shown = getNode(hovered ?? pinned);
  // Highlight the paths of the hovered rule, else of the node in the inspector.
  // The firewall is on every path, so it highlights nothing in particular.
  const hotFlows = flowHover ? [flowHover] : shown.flows.length < FLOWS.length ? shown.flows : [];
  const hotTraces = hotFlows.flatMap((id) => flowById(id).traces);

  const nodeProps = (node) => ({
    node,
    registerNode,
    hot: shown.id === node.id || (flowHover ? node.flows.includes(flowHover) : false),
    pinned: pinned === node.id,
    onHover: setHovered,
    onPin: pin,
  });

  return (
    <motion.section
      aria-label="Windows Server and Active Directory lab"
      initial={{ opacity: 0, scale: 1.06 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <button type="button" className="btn-cyber mb-4" onClick={exit}>
            <ArrowLeft size={14} aria-hidden /> [RETURN_TO_PROXMOX_LAB]
          </button>
          <p className="font-mono text-xs tracking-[0.3em] text-matrix">[SECTOR 01 ▸ NODE {lab.slot}] // ACCESS_GRANTED</p>
          <h1 className="mt-1 break-words font-mono text-xl font-bold leading-tight text-cyber text-glow sm:text-3xl">
            <GlitchText auto>WINDOWS_SERVER::ACTIVE_DIRECTORY_LAB</GlitchText>
          </h1>
          <p className="mt-2 min-h-[1.5em] font-mono text-xs text-white/50">
            {MANIFEST_LINE[0].text.slice(0, pos.i > 0 ? undefined : pos.c)}
            <span className="cursor-block text-cyber" />
          </p>
        </div>

        <div className="flex flex-wrap gap-2 font-mono text-[11px] tracking-widest">
          <Tip label="USED IN PLACE OF HYPER-V" side="bottom">
            <span className="flex items-center gap-2 border border-cyber/30 bg-cyber/5 px-2.5 py-1.5 text-cyber">
              <Server size={13} aria-hidden /> HYPERVISOR: PROXMOX VE
            </span>
          </Tip>
          <Tip label="LAB SHEET PROGRESS" side="bottom">
            <span className="flex items-center gap-2 border border-matrix/30 bg-matrix/5 px-2.5 py-1.5 text-matrix">
              <ListChecks size={13} aria-hidden /> HANDS-ON: {TASKS.handsOn}/{TASKS.total} TASKS
            </span>
          </Tip>
        </div>
      </div>

      {/* ---- overview + honest task progress ---- */}
      <div className="mb-6 grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <p className="max-w-3xl text-sm leading-relaxed text-white/75">
          <span className="font-mono text-cyan-400">&gt; LAB_OVERVIEW:</span> I built a small business-style Windows network on my
          Proxmox home lab server, working through a structured {TASKS.total}-task lab sheet. The sheet specified Hyper-V;{' '}
          <span className="font-semibold text-white">I used Proxmox VE as the equivalent</span>. This is a home lab project, not
          professional experience. I built it to learn how the pieces fit together and to practise fixing them when they break.
        </p>

        <div className="border border-white/10 bg-black/25 p-3">
          <div className="mb-2 flex justify-between font-mono text-[10px] tracking-[0.2em] text-white/45">
            <span>LAB_SHEET_PROGRESS</span>
            <span>{TASKS.total} TASKS</span>
          </div>
          <div
            role="img"
            aria-label={`Lab sheet progress: ${TASKS.handsOn} of ${TASKS.total} tasks completed hands-on, ${TASKS.study} were study topics, ${TASKS.notCompleted} (${TASKS.notCompletedName}) was not completed.`}
            className="flex gap-1"
          >
            {Array.from({ length: TASKS.total }, (_, k) => (
              <span
                key={k}
                className={cn(
                  'h-2.5 flex-1',
                  k < TASKS.handsOn
                    ? 'bg-matrix shadow-[0_0_6px_rgba(0,255,102,0.5)]'
                    : k < TASKS.handsOn + TASKS.study
                      ? 'bg-warn/80'
                      : 'border border-white/30 bg-transparent',
                )}
              />
            ))}
          </div>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] tracking-widest text-white/55">
            <li><span className="text-matrix">■</span> {TASKS.handsOn} HANDS-ON</li>
            <li><span className="text-warn">■</span> {TASKS.study} STUDY TOPICS</li>
            <li><span className="text-white/50">□</span> {TASKS.notCompleted} NOT COMPLETED ({TASKS.notCompletedName.toUpperCase()})</li>
          </ul>
        </div>
      </div>

      <nav aria-label="Sections of this project" className="mb-6 flex flex-wrap gap-2 font-mono text-[10px] tracking-widest">
        {JUMPS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="border border-white/15 px-2.5 py-1.5 text-white/55 transition-colors hover:border-cyber/50 hover:text-cyber"
          >
            {label}
          </button>
        ))}
      </nav>

      {/* ---- interactive network diagram ---- */}
      <div id="adlab-map" className="grid scroll-mt-20 gap-6 xl:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <div className="relative overflow-hidden border border-cyber/25 shadow-[0_0_50px_rgba(0,240,255,0.07)]">
            <div ref={stageRef} className="blueprint-grid relative p-4 pb-9 pt-8 sm:p-6 sm:pb-10 sm:pt-9 lg:flex lg:min-h-[66vh] lg:flex-col lg:justify-center lg:px-8 lg:py-12">
              <div aria-hidden className="pointer-events-none absolute left-3 top-2 font-mono text-[10px] tracking-[0.25em] text-cyber/50">
                NETWORK_MAP // lab.local
              </div>
              <div aria-hidden className="pointer-events-none absolute right-3 top-2 hidden font-mono text-[10px] tracking-[0.25em] text-cyber/50 sm:block">
                ADDRESSES WITHHELD
              </div>
              <div aria-hidden className="pointer-events-none absolute bottom-2 left-3 font-mono text-[10px] tracking-[0.25em] text-cyber/40">
                FIG.04 — WINDOWS_AD_LAB_TOPOLOGY
              </div>

              <TraceLayer traces={traces} hoveredId={hotTraces[0]} activeId={hotTraces[1]} />

              <div className="relative grid gap-y-3 lg:gap-y-16">
                {/* Home network (external) */}
                <div ref={extRef} role="group" aria-label={ZONES.external.short} className="relative border border-dashed border-cyber/35 bg-cyber/[0.03] p-3 pt-8">
                  <div className="absolute left-3 top-2.5 font-mono text-[10px] font-bold tracking-[0.25em] text-cyber/80">{ZONES.external.label}</div>
                  <div className="grid gap-3 sm:grid-cols-3 lg:gap-8">
                    {nodesIn('external').map((n) => (
                      <LabNode key={n.id} {...nodeProps(n)} />
                    ))}
                  </div>
                </div>

                <p aria-hidden className="text-center font-mono text-[10px] tracking-[0.2em] text-white/35 lg:hidden">▲ ▼ ONLY ROUTE IN OR OUT ▲ ▼</p>

                {/* Firewall between the two networks */}
                <LabNode {...nodeProps(getNode('fw'))} className="accent-glow lg:mx-auto lg:max-w-[460px]">
                  <div className="mt-2.5 flex flex-wrap justify-between gap-x-3 gap-y-1 border-t border-white/10 pt-2 font-mono text-[9.5px] tracking-widest">
                    <span className="text-matrix/80">ALLOWED ▸ NAMED SERVICES ONLY</span>
                    <span className="text-danger/80">EVERYTHING ELSE ▸ BLOCKED</span>
                  </div>
                </LabNode>

                <p aria-hidden className="text-center font-mono text-[10px] tracking-[0.2em] text-white/35 lg:hidden">▲ ▼ ONLY ROUTE IN OR OUT ▲ ▼</p>

                {/* Lab network (internal, isolated) */}
                <div ref={labRef} role="group" aria-label={ZONES.internal.short} className="relative border border-dashed border-matrix/35 bg-matrix/[0.03] p-3 pt-8">
                  <div className="absolute left-3 top-2.5 font-mono text-[10px] font-bold tracking-[0.25em] text-matrix/80">{ZONES.internal.label}</div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    {nodesIn('internal').map((n) => (
                      <LabNode key={n.id} {...nodeProps(n)} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Traffic rules: the same paths as the traces, readable at every screen size. */}
          <ul className="mt-3 grid gap-2 font-mono text-[11px] sm:grid-cols-2 xl:grid-cols-4" aria-label="Traffic allowed through the firewall">
            {FLOWS.map((f) => (
              <li
                key={f.id}
                onMouseEnter={() => setFlowHover(f.id)}
                onMouseLeave={() => setFlowHover(null)}
                data-hot={flowHover === f.id}
                style={{ '--accent': f.accent }}
                className="hover-glow accent-border border bg-black/25 px-3 py-2"
              >
                <span className="accent-text block text-[10px] font-bold tracking-widest">● {f.label}</span>
                <span className="mt-0.5 block text-white/85">{f.rule}</span>
                <span className="mt-0.5 block font-sans text-[12px] leading-snug text-white/50">{f.detail}</span>
              </li>
            ))}
            <li className="border border-danger/35 bg-black/25 px-3 py-2">
              <span className="block text-[10px] font-bold tracking-widest text-danger">● EVERYTHING ELSE</span>
              <span className="mt-0.5 block text-white/85">Blocked</span>
              <span className="mt-0.5 block font-sans text-[12px] leading-snug text-white/50">The firewall is the only route in or out of the lab.</span>
            </li>
          </ul>
        </div>

        <Inspector node={shown} panelRef={inspectorRef} />
      </div>

      <div className="mt-14 space-y-14">
        {/* ---- what I built ---- */}
        <Section id="adlab-built" title="WHAT_I_BUILT" intro={`The ${TASKS.handsOn} tasks I completed hands-on.`}>
          <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {BUILT.map((item, k) => {
              const Icon = item.icon;
              return (
                <li key={item.title} className="accent-border relative border bg-panel/90 p-4">
                  <span className="accent-text">
                    <CornerBrackets className="h-2.5 w-2.5" />
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="accent-text accent-bg-soft accent-border flex h-10 w-10 shrink-0 items-center justify-center border">
                      <Icon size={20} strokeWidth={1.5} aria-hidden />
                    </div>
                    <div className="min-w-0 font-mono">
                      <div className="text-[9px] tracking-[0.25em] text-white/40">BUILD_{pad(k + 1)}</div>
                      <h3 className="accent-text text-[13px] font-bold leading-snug tracking-wide">{item.title}</h3>
                    </div>
                  </div>
                  <p className="mt-3 text-[13.5px] leading-relaxed text-white/75">{item.text}</p>
                  {item.stats && (
                    <dl className="accent-border mt-3 divide-y divide-white/10 border bg-black/25 font-mono text-[11.5px]">
                      {item.stats.map(([label, value]) => (
                        <div key={label} className="flex justify-between gap-4 px-2.5 py-1.5">
                          <dt className="text-white/50">{label}</dt>
                          <dd className="accent-text text-right font-medium">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </li>
              );
            })}
          </ol>
        </Section>

        {/* ---- design decisions ---- */}
        <Section id="adlab-decisions" title="DESIGN_DECISIONS" accent={GREEN} intro="Three choices I made on purpose, and why.">
          <ul className="grid gap-3 md:grid-cols-3">
            {DECISIONS.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.title} className="accent-border accent-bg-soft border border-l-4 p-4" style={{ borderLeftColor: 'var(--accent)' }}>
                  <h3 className="accent-text flex items-center gap-2 font-mono text-[13px] font-bold tracking-wide">
                    <Icon size={16} strokeWidth={1.6} aria-hidden /> {item.title}
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-white/80">
                    <span className="font-mono text-[10px] tracking-widest text-white/40">WHY ▸ </span>
                    {item.text}
                  </p>
                </li>
              );
            })}
          </ul>
        </Section>

        {/* ---- troubleshooting ---- */}
        <Section
          id="adlab-trouble"
          title="TROUBLESHOOTING_LOG"
          accent={AMBER}
          intro="Things that did not work the first time, what told me why, and what fixed them. This is the part I learned the most from."
        >
          <ol className="grid gap-3 lg:grid-cols-2">
            {TROUBLE.map((t, k) => (
              <li key={t.title} className="accent-border relative border bg-panel/90 p-4">
                <span className="accent-text">
                  <CornerBrackets className="h-2.5 w-2.5" />
                </span>
                <div className="font-mono">
                  <div className="text-[9px] tracking-[0.25em] text-white/40">CASE_{pad(k + 1)}</div>
                  <h3 className="accent-text text-glow text-[14px] font-bold leading-snug tracking-wide">{t.title}</h3>
                </div>
                <dl className="mt-3 space-y-2.5 text-[13.5px] leading-relaxed">
                  <div>
                    <dt className="font-mono text-[10px] tracking-[0.25em] text-danger/90">SYMPTOM</dt>
                    <dd className="text-white/80">{t.symptom}</dd>
                  </div>
                  {t.evidence && (
                    <div>
                      <dt className="font-mono text-[10px] tracking-[0.25em] text-warn/90">HOW_I_FOUND_IT</dt>
                      <dd className="text-white/80">{t.evidence}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="font-mono text-[10px] tracking-[0.25em] text-matrix/90">CAUSE / FIX</dt>
                    <dd className="text-white/90">{t.fix}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ol>
        </Section>

        {/* ---- limitations ---- */}
        <Section id="adlab-limits" title="LIMITATIONS" accent="#ff3b5c" intro="What this lab is not.">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="border border-danger/30 bg-black/25 p-4">
              <h3 className="font-mono text-[11px] font-bold tracking-[0.3em] text-danger">KNOWN_LIMITS</h3>
              <ul className="mt-3 space-y-2 text-[13.5px] leading-relaxed text-white/80">
                {LIMITS.map((line) => (
                  <li key={line} className="flex gap-2.5">
                    <span className="mt-[2px] shrink-0 font-mono text-xs text-danger">▸</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border border-matrix/30 bg-black/25 p-4">
              <h3 className="font-mono text-[11px] font-bold tracking-[0.3em] text-matrix">{softBreaks('WHAT_I_WOULD_DO_DIFFERENTLY_IN_PRODUCTION')}</h3>
              <ul className="mt-3 space-y-2 text-[13.5px] leading-relaxed text-white/80">
                {IN_PRODUCTION.map((line) => (
                  <li key={line} className="flex gap-2.5">
                    <span className="mt-[2px] shrink-0 font-mono text-xs text-matrix">▸</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        {/* ---- skills and tools ---- */}
        <Section id="adlab-stack" title="TECH_STACK" accent={VIOLET}>
          <ul className="flex flex-wrap gap-2">
            {TAGS.map((tech) => (
              <li key={tech} className="accent-border accent-text accent-bg-soft border px-2.5 py-1 font-mono text-xs font-medium tracking-wider">
                {tech}
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <div className="mt-12 flex flex-col items-center gap-4">
        <button type="button" className="btn-cyber" onClick={exit}>
          <ArrowLeft size={14} aria-hidden /> [RETURN_TO_PROXMOX_LAB]
        </button>
        <p className="text-center font-mono text-[11px] tracking-[0.2em] text-white/30">
          [ ESC TO EXIT · HOME LAB PROJECT · NO ADDRESSES SHOWN ]
        </p>
      </div>
    </motion.section>
  );
}
