import { ArrowDown, ArrowUp, Cpu, Volume2, VolumeX } from 'lucide-react';
import { useApp } from '../state/AppContext';
import useTelemetry from '../hooks/useTelemetry';
import Tip from './ui/Tip';
import ThemeToggle from './ThemeToggle';
import { THEME } from '../theme/theme';
import { sfx } from '../lib/sound';

const PATHS = {
  hub: '~/mainframe',
  proxmox: '~/sector01/infrastructure_lab',
  dev: '~/sector02/dev_district',
  vulns: '~/sector03/sec_ops_grid',
  writeups: '~/sector04/write_ups',
};

// Breadcrumb for the current view, including drill-downs.
function currentPath(state) {
  if (state.view === 'proxmox' && state.zoom !== 'none') return `${PATHS.proxmox}/${state.zoomTarget}`;
  if (state.view === 'vulns') {
    let p = PATHS.vulns;
    if (state.activeDossierId) p += `/${state.activeDossierId}`;
    if (state.activeReportId) p += `/${state.activeReportId}.pdf`;
    return p;
  }
  if (state.view === 'writeups' && state.activeWriteupId) return `${PATHS.writeups}/${state.activeWriteupId}`;
  return PATHS[state.view];
}

const pad = (n) => String(n).padStart(2, '0');

export default function TelemetryBar() {
  const { state, dispatch } = useApp();
  const t = useTelemetry();
  const d = t.now;
  const clock = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const cpuHot = t.cpu > 65;

  return (
    <header className="sticky top-0 z-40 border-b border-cyber/20 bg-void/85 font-ui text-[11px] tracking-wider backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-5 gap-y-1 px-4 py-2 sm:px-8">
        <div className="flex items-center gap-2 text-cyber text-glow">
          <Cpu size={14} aria-hidden />
          <span className="font-bold">MAINFRAME_OS</span>
          <span className="text-white/35">v4.2</span>
        </div>
        <span className="hidden text-white/35 md:inline">{currentPath(state)}</span>

        <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-1">
          <Tip label="CPU LOAD (SIMULATED)" side="bottom">
            <span className="flex items-center gap-2">
              <span className="text-white/45">CPU</span>
              <span className="hidden h-1.5 w-14 bg-white/10 sm:inline-block">
                <span
                  className={`block h-full transition-[width] duration-700 ${cpuHot ? 'bg-warn' : 'bg-matrix'}`}
                  style={{ width: `${t.cpu}%` }}
                />
              </span>
              <span className={cpuHot ? 'text-warn' : 'text-matrix'}>{t.cpu.toFixed(0).padStart(2, '0')}%</span>
            </span>
          </Tip>

          <Tip label="NETWORK TRAFFIC (SIMULATED)" side="bottom" className="hidden sm:inline-flex">
            <span className="flex items-center gap-2 text-white/70">
              <span className="flex items-center text-cyber">
                <ArrowDown size={11} aria-hidden />
                {t.down.toFixed(1)}
              </span>
              <span className="flex items-center text-magenta">
                <ArrowUp size={11} aria-hidden />
                {t.up.toFixed(1)}
              </span>
              <span className="text-white/35">MB/s</span>
            </span>
          </Tip>

          <span className="hidden text-white/60 md:inline">
            {date} <span className="text-white">{clock}</span>
          </span>

          <Tip label="LINK STATUS" side="bottom">
            <span className="flex items-center gap-2 text-matrix">
              <span className="led" aria-hidden />
              SECURE_ESTABLISHED
            </span>
          </Tip>

          <ThemeToggle />

          {/* Sound effects are part of the cyberpunk theme only. */}
          {state.theme === THEME.CYBERPUNK && (
            <Tip label={state.soundOn ? 'AUDIO: ON' : 'AUDIO: OFF'} side="bottom">
              <button
                type="button"
                aria-pressed={state.soundOn}
                aria-label="Toggle sound effects"
                onClick={() => {
                  dispatch({ type: 'TOGGLE_SOUND' });
                  // Toggling ON: cue plays once the context exists (next tick).
                  if (!state.soundOn) setTimeout(sfx.confirm, 30);
                }}
                className="flex items-center gap-1.5 text-white/50 transition-colors hover:text-cyber"
              >
                {state.soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
                <span className="hidden sm:inline">SFX</span>
              </button>
            </Tip>
          )}
        </div>
      </div>
    </header>
  );
}
