import { useEffect, useRef } from 'react';

// Ambient atmosphere behind every view. All layers fade out toward the middle
// of the screen so the eye stays on the active module / info board:
//   1. canvas: drifting hex outlines + falling hex/binary data streams
//   2. SVG: glowing circuit traces hugging the left and right edges
//   3. HTML: telemetry readouts drifting upward along the outer edges (xl+)
//   4. a faint central spotlight
// It sits at z-index -10 inside #root's stacking context: above the body grid,
// below all content, never intercepting input.
// Cyberpunk-only: App.jsx does not mount it in the dim and professional themes.
// `.ambient-root` fades out while a report is being read (hooks/useReadingMode.js). Colours
// still come from tokens (the canvas reads them once when it starts).

const GLYPHS = '01ABCDEF<>/\\|=+*'.split('');

// 0 in the middle of the screen, 1 near the left/right edges.
const edgeFactor = (x, w) => {
  const d = Math.abs(x - w / 2) / (w / 2);
  return Math.min(1, Math.max(0, (d - 0.5) / 0.4));
};

function HexCanvas() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rand = (a, b) => a + Math.random() * (b - a);
    const token = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const COLOR_A = token('--color-cyber');
    const COLOR_B = token('--color-matrix');
    const STREAM_HEAD = token('--ambient-stream-head');
    const FONT = `12px ${token('--font-mono')}`;
    let w = 0;
    let h = 0;
    let raf = 0;
    let last = 0;
    let hexes = [];
    let streams = [];

    const outerX = () => (Math.random() < 0.5 ? rand(0, w * 0.14) : rand(w * 0.86, w));

    function init() {
      const small = w < 700;
      const hexCount = small ? 10 : Math.min(46, Math.round((w * h) / 42000));
      hexes = Array.from({ length: hexCount }, () => ({
        x: rand(0, w),
        y: rand(0, h),
        r: rand(10, 34),
        vx: rand(-6, 6),
        vy: rand(-22, -6),
        rot: rand(0, Math.PI * 2),
        vr: rand(-0.2, 0.2),
        c: Math.random() < 0.6 ? COLOR_A : COLOR_B,
        filled: Math.random() < 0.18,
      }));
      const streamCount = small ? 4 : 14;
      streams = Array.from({ length: streamCount }, () => ({
        x: outerX(),
        y: rand(-h, h),
        speed: rand(40, 110),
        len: Math.round(rand(8, 18)),
        chars: Array.from({ length: 20 }, () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]),
      }));
    }

    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      init();
      draw(0);
    }

    function hexPath(x, y, r, rot) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = rot + (i * Math.PI) / 3;
        const px = x + r * Math.cos(a);
        const py = y + r * Math.sin(a);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    }

    function draw(dt) {
      ctx.clearRect(0, 0, w, h);

      for (const hx of hexes) {
        hx.x += hx.vx * dt;
        hx.y += hx.vy * dt;
        hx.rot += hx.vr * dt;
        if (hx.y < -40) {
          hx.y = h + 40;
          hx.x = rand(0, w);
        }
        if (hx.x < -40) hx.x = w + 40;
        if (hx.x > w + 40) hx.x = -40;
        const a = 0.04 + 0.3 * edgeFactor(hx.x, w);
        hexPath(hx.x, hx.y, hx.r, hx.rot);
        ctx.strokeStyle = hx.c;
        ctx.globalAlpha = a;
        ctx.lineWidth = 1;
        ctx.stroke();
        if (hx.filled) {
          ctx.fillStyle = hx.c;
          ctx.globalAlpha = a * 0.25;
          ctx.fill();
        }
      }

      ctx.font = FONT;
      ctx.textAlign = 'center';
      for (const s of streams) {
        s.y += s.speed * dt;
        if (s.y - s.len * 14 > h) {
          s.y = rand(-200, 0);
          s.x = outerX();
        }
        const edge = 0.25 + 0.75 * edgeFactor(s.x, w);
        for (let i = 0; i < s.len; i++) {
          const y = s.y - i * 14;
          if (y < -14 || y > h + 14) continue;
          if (Math.random() < 0.01) s.chars[i] = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          const fade = 1 - i / s.len;
          ctx.fillStyle = i === 0 ? STREAM_HEAD : COLOR_B;
          ctx.globalAlpha = i === 0 ? 0.5 * edge : 0.26 * fade * edge;
          ctx.fillText(s.chars[i], s.x, y);
        }
      }
      ctx.globalAlpha = 1;
    }

    function frame(t) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (t - last) / 1000 || 0);
      last = t;
      draw(dt);
    }

    resize();
    window.addEventListener('resize', resize);
    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduce) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener('visibilitychange', onVis);
    if (!reduce) raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0" />;
}

// Glowing circuit traces along both edges (mirrored). Non-scaling strokes keep
// the line weight constant while the viewBox stretches to the screen.
const CIRCUIT_LEFT = [
  'M0 8 H5 L7 10 V26 L5 28 H0',
  'M0 34 H3 L5 36 V52 H9 L11 54 V64',
  'M0 72 H6 L8 74 V92 L6 94 H0',
  'M2 0 V5 L4 7 H8',
];
const NODES_LEFT = [[7, 10], [5, 36], [11, 54], [8, 74], [8, 7]];

function CircuitLines() {
  // The right side reuses the left paths, mirrored with an SVG transform.
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      style={{
        WebkitMaskImage: 'linear-gradient(90deg,#000 0,#000 7%,transparent 19%,transparent 81%,#000 93%,#000 100%)',
        maskImage: 'linear-gradient(90deg,#000 0,#000 7%,transparent 19%,transparent 81%,#000 93%,#000 100%)',
      }}
    >
      {[false, true].map((flip) => (
        <g key={String(flip)} transform={flip ? 'translate(100 0) scale(-1 1)' : undefined}>
          {CIRCUIT_LEFT.map((d) => (
            <g key={d}>
              <path d={d} fill="none" strokeOpacity="0.1" strokeWidth="1.5" vectorEffect="non-scaling-stroke" style={{ stroke: 'var(--color-cyber)' }} />
              <path
                d={d}
                fill="none"
                strokeOpacity="0.5"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
                className="trace"
                style={{ stroke: 'var(--color-cyber)', filter: 'drop-shadow(0 0 3px var(--color-cyber))' }}
              />
            </g>
          ))}
          {NODES_LEFT.map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="0.45" style={{ fill: 'var(--color-matrix)', filter: 'drop-shadow(0 0 3px var(--color-matrix))' }} />
          ))}
        </g>
      ))}
    </svg>
  );
}

const READOUTS = [
  'NODE_A01 ▸ 42ms',
  'PKT_RX 0x3FA9',
  'TEMP 41.2°C',
  'MEM 58%',
  'SIG -61dBm',
  'UPLINK ▸ OK',
  'FW ▸ ACTIVE',
  'DNS ▸ 0.0.0.0 x214',
  'TLS 1.3 ▸ AES-256',
  'VLAN 20 ▸ ISOLATED',
  'SYNC ▸ 99.98%',
  'IOPS 1.2k',
  'GRID ▸ NOMINAL',
  'KEY ▸ ROTATED',
  'BUS ▸ 0xA4F1',
  'LOAD 0.42 0.38',
];

function Readouts({ side }) {
  // Content is doubled so translating by -50% loops seamlessly.
  const lines = [...READOUTS, ...READOUTS];
  return (
    <div
      className={`absolute bottom-0 top-0 hidden w-40 overflow-hidden xl:block ${side === 'left' ? 'left-3' : 'right-3 text-right'}`}
      style={{
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, #000 15%, #000 85%, transparent)',
        maskImage: 'linear-gradient(to bottom, transparent, #000 15%, #000 85%, transparent)',
      }}
    >
      <ul className={`ambient-drift space-y-4 font-ui text-[10px] tracking-widest text-cyber/[0.2] ${side === 'right' ? 'ambient-drift-slow' : ''}`}>
        {(side === 'right' ? [...lines].reverse() : lines).map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ul>
    </div>
  );
}

export default function AmbientBackground() {
  return (
    <div aria-hidden className="ambient-root pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 55% 50% at 50% 48%, color-mix(in srgb, var(--color-cyber) 6%, transparent), transparent 70%)' }} />
      <HexCanvas />
      <CircuitLines />
      <Readouts side="left" />
      <Readouts side="right" />
    </div>
  );
}
