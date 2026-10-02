# CLAUDE.md — MAINFRAME_OS Cyberpunk Portfolio

Interactive portfolio styled as a cyberpunk mainframe / hacker terminal. The visitor lands on a hub: hero, a **Highlights** section, then the "sectors"; clicking one opens it straight away (a short view transition, no loading sequence). The site has **two themes**, Cyberpunk and Professional, switched by a toggle in the top bar (see "Themes"). **Sector 01** (`INFRASTRUCTURE_LAB`, Proxmox home lab) and **Sector 03** (`SEC_OPS_GRID`, vulnerability reports) are playable, as are the two card-based sectors: **Sector 02** (`DEV_DISTRICT`, websites and apps) and **Sector 04** (`WRITE-UPS`, build reports).

- **Sector 01**: a blueprint of the lab. **Every node click flies the camera to that node.** Docker (`CONTAINER_SUBSTRATE_MANIFEST::DOCKER_INFRA`), Pi-hole (`DNS_TRAFFIC_FLOW::AD_BLOCKING_PIPELINE`) and the Windows AD lab (`WINDOWS_SERVER::ACTIVE_DIRECTORY_LAB`) then swap to a full sub-view; HAOS, Kali and Ollama show a **centered information board**. A guide cursor onboards first-time visitors (Pi-hole, then Docker).
- **Sector 03**: `DOSSIER_ARCHIVE::BUNGE_OPS`, a shelf of dossier folders → camera-zoom into one → miniature report icons → PDF-style reader.
- In the Cyberpunk theme every screen sits on an **ambient background** (drifting hex particles, data streams, circuit lines, telemetry readouts) that fades out toward the middle so focus stays on the active module.

## Tech stack
- **Vite 8 + React 19** (plain JS/JSX, no TypeScript, no router)
- **Tailwind CSS v4** via `@tailwindcss/vite` (tokens in `@theme static` + `:root` inside `src/index.css`, no tailwind.config)
- **Framer Motion** for view transitions, camera zooms, info boards, tour cursor, rack tilt, shared-layout report expansion
- **lucide-react** for icons
- Fonts: JetBrains Mono + Inter via Google Fonts in `index.html`. `font-ui` = interface face (mono in Cyberpunk, Inter in Professional); `font-mono` = real code / terminal output only; `font-sans` = prose

## Commands
- `npm run dev` — dev server (http://localhost:5173)
- `npm run build` / `npm run preview` — production build / preview

## Themes (one set of components, two sets of tokens)
`<html data-theme="cyberpunk|professional">` picks the token set. An inline script in `index.html` sets it from `localStorage['mainframe.theme']` before the stylesheet paints (default for anyone without a saved choice: **cyberpunk**, never derived from the system light/dark setting; keep the key and default in sync with `src/theme/theme.js`). `ThemeToggle` (in `TelemetryBar`, and fixed top-right on the boot screen) calls `saveTheme` and dispatches `SET_THEME`; `AppProvider` then calls `applyTheme` (attribute, `theme-color` meta). **Only a toggle click is stored**: loading the page never writes the theme, so a changed default still reaches visitors who never chose. Reduced-motion users get the same default, without the animated effects.
- **Visual tokens: `src/index.css`.** Cyberpunk values are the defaults (`@theme static` for colours/fonts, `:root` for effects); the `[data-theme="professional"]` block overrides them. Never hard-code a colour, glow, font or shadow in a component: add or reuse a token.
  - Surfaces `void panel edge shell paper sheet folder glass blueprint body`; ink = `white` (every `white/NN` utility), recess = `black` (`black/NN`). In Professional these are redefined (dark ink, light recess).
  - Semantic colours `cyber` (the accent) `matrix` (ok) `warn` `danger` `magenta` `violet` `pihole`; use these where colour carries meaning (status, severity, diagram series).
  - Identity colours `id-cyan id-amber id-green id-magenta id-blue id-violet id-red`: the `accent` of a sector / node / container / folder in `src/data` (stored as `'var(--color-id-…)'`). Distinct hues in Cyberpunk, all equal to the accent in Professional.
  - Effects: `--glow-*` (+ per-element `--glow-accent`; `transparent` = glow off), `--text-glow`, `--shadow-board/card/card-hover`, `--track` (multiplier for `track-NN` letter-spacing utilities), `--fx` (running/paused for decorative CSS animations), `--dur-hover/dim`, textures (`--page-grid --blueprint-* --hatch --holo --texture-lines`), `--btn-*`, `--toggle-*`, `--radius`.
  - Colours passed from JS are CSS values (often `var(--color-…)`): apply them with `style`, mix alpha with `color-mix(in srgb, X N%, transparent)`, never by appending hex digits.
- **Motion tokens: `src/theme/motion.js`** (`useMotion()`): `viewProps` (hub <-> sector switch), `itemProps(i)` / `fadeProps` (content entrance), `subView`, `page`, `board`, `zoom` / `dossier` (camera phase ms), `zoomScale`, `pan`, `tilt`, `morph`, `typing`. With `prefers-reduced-motion` the view and item transitions are 0.
- **Professional-only behaviour** (small conditionals, not forked components): `AmbientBackground` and `Scanlines` are not mounted; typing shows text at once (`useTerminal`); the boot log is skipped; sound is off and the SFX toggle hidden; rack / folder tilt and the report morph are off. A short block at the end of `index.css` holds the rules a token cannot express (hide cursor / glitch layers / corner ticks, card shadows, and the **AA contrast floor** that maps dim `text-white/≤60` to `--color-muted` and tinted status text to its full colour).
- **Change a token**: edit the value in the theme's block, e.g. the Professional accent is `--color-cyber` in `[data-theme="professional"]`; the Cyberpunk accent is `--color-cyber` in `@theme static` (and `--color-id-*` for per-sector colours).

## Design tokens (src/index.css)
Cyberpunk values: `void #0a0a0c` bg · `cyber #00f0ff` · `matrix #00ff66` · `warn #ffb700` · `danger #ff3b5c` · `magenta #ff2e97` · `violet #a78bfa` · `pihole #4da3ff`.
Utility classes: `.accent-*` and `.hover-glow` read a per-element `--accent` CSS var (set via `style={{'--accent': color}}`); `.zoomable` + `.is-dim` (fade/blur away during a camera zoom); `.glitch` (needs `data-text`), `.flicker`, `.cursor-block`, `.blueprint-grid`, `.rack-rail`, `.trace`, `.led`, `.hatch`, `.holo`, `.folder-lines`, `.redact`, `.btn-cyber`, `.theme-toggle`, `.corner-tick`, `track-NN`, `.ambient-drift`, `.tour-ring`, CRT overlay classes.

## File structure
```
index.html                  fonts, favicon, mount, inline theme script (runs before first paint)
src/
  main.jsx                  React root
  App.jsx                   MotionConfig + AppProvider + Shell: AmbientBackground + Scanlines (cyberpunk only), TelemetryBar, view router (AnimatePresence mode="wait"), TourGuide
  index.css                 Tailwind import, both token sets, all custom CSS/keyframes
  theme/theme.js            theme names, default, storage key, readTheme / applyTheme
  theme/motion.js           motion tokens per theme + useMotion()
  state/AppContext.jsx      useReducer store + useApp(); VIEWS, ZOOM enum, theme, tour persistence
  data/
    sectors.js              hub sector definitions (locked flag, accent, tags, optional `cta`)
    services.js            HOST + SERVICES (Docker, HAOS, Kali, Ollama, Pi-hole): copy, architecture, config, stack; `drillable` = has a sub-view (only changes the ENTER/INSPECT label)
    containers.js           CONTAINERS inside Docker (J.A.R.V.I.S 1.0/2.0, Juice Shop, Nmap Visualizer): status, role, ports
    dns.js                  sample allowed/blocked domains + looping FLOW_SAMPLES for the Pi-hole visuals
    dossiers.js             Sector 03: ARCHIVE, SEVERITY colours, DOSSIERS (3 folders x 3 SAMPLE reports)
    projects.js             Sector 02: PROJECTS (one object per website / app) + STATUS colours
    writeups.js             Sector 04: WRITEUPS (one object per report), file lookup, getWriteupFor
    highlights.js           home page HIGHLIGHTS: collects entries flagged `featured` in services / projects / writeups (holds no content)
  content/
    projects/               optional project screenshots (referenced by file name)
    writeups/               report files (.md / .pdf) and their images; README = how to add one
  hooks/
    useTerminal.js          char-by-char typing engine
    useTelemetry.js         mock CPU/net/clock + useJitter
    useDnsSimulation.js     fake Pi-hole counters / query log / chart history
    useTraces.js            DOM rects -> trace paths (Blueprint, DockerSubView, PiholeSubView)
    useCameraZoom.js        shared camera zoom: measurePose + phase -> animate props + dim flag (Blueprint, DossierGrid)
    useMediaQuery.js
  lib/  cn.js  sound.js     class join; WebAudio sfx (off by default)
  components/
    AmbientBackground.jsx   canvas hexes + data streams, SVG circuit lines, drifting readouts
    TourGuide.jsx           onboarding pointer cursor (see "Guided tour")
    BootSequence  Hub  Highlights  SectorCard  SystemLog  TelemetryBar  ThemeToggle  Scanlines  TerminalOutput
    ui/       CornerBrackets  GlitchText  Tip  Meter  TraceLayer
    proxmox/  ProxmoxWorld  Blueprint  Rack  NodeCard  DataHUD (the centered info board)
    docker/   DockerSubView  ContainerCard
    pihole/   PiholeSubView  FlowNode  FilterVisual  WebUiPanel
    vulns/    VulnsWorld  DossierGrid  DossierFolder  DossierArchive  ReportIcon  ReportViewer
    dev/      DevDistrict  ProjectCard
    writeups/ WriteupsWorld  WriteupCard  WriteupDetail  Markdown
    (ui/ also has SectorHeader and CardStage, shared by Sectors 02 and 04)
```

## Layout, camera and centered info boards
- **Bigger viewing window**: all worlds use `max-w-[1600px]` with `px-4 sm:px-8` (Hub, ProxmoxWorld, VulnsWorld, TelemetryBar). On `lg`, stages are `min-h` 66–74vh and vertically centred (`lg:flex lg:flex-col lg:justify-center` on the camera/stage div), so the content sits mid-screen with breathing room instead of hugging the top. The Hub is `min-h-[calc(100vh-3.2rem)]` and vertically centred.
- **Camera always centres on the viewport**: `measurePose` moves the clicked target to the middle of the visible screen (below the sticky telemetry bar), not to the middle of its stage. Pass `toViewport: false` for the old stage-centre behaviour. On small screens (stacked layouts) `pan` is off and the zoom is a light scale/fade.
- **Info boards are centered, not side drawers.** `DataHUD` is a fixed, centered, frosted-glass board (`bg-[rgba(7,11,17,.66)] backdrop-blur-2xl`, accent glow, top accent bar, scanline texture, corner brackets) over a dimmed, blurred backdrop, max width `4xl`, scrolls internally on short screens. Layout: header (icon, eyebrow, name, status, close) → highlighted mission → two columns (ARCHITECTURE bullets | CONFIGURATION / PORTS / LIVE_LOAD) → TECH_STACK chips → close button. The fixed wrapper is `pointer-events-none` (the board and the backdrop take clicks). Used by: lab node boards, container boards (Docker sub-view), Pi-hole `NODE_INFO`. `ReportViewer` (Sector 03) is also centered.
- **Sector click (hub)**: `SectorCard` → `ENTER_SECTOR{sectorId}` → the sector view mounts. There is no loading sequence: the old camera push + typed handshake was a purely cosmetic ~7.9 s delay and was removed. The only wait is `viewProps` (hub exit + sector enter, about 0.2 s in Cyberpunk, 0.13 s in Professional, 0 with reduced motion). Do not add timers between the click and the sector.
- **Lab node click (all nodes)**: `Blueprint.handleSelect` always measures a pose and calls `onDrill(id, pose)`; `ProxmoxWorld.zoomTo` stores the pose and dispatches `ZOOM_START`. `SUB_VIEWS[zoomTarget]` (Docker, Pi-hole) replaces the stage while `inside`. For nodes **without** a sub-view, `Blueprint` stays mounted, zoomed and faded out (`useCameraZoom` holds the pose during `inside`), and `ProxmoxWorld` renders the `DataHUD` board (`board = inside && !SubView ? getService(zoomTarget)`). Closing it dispatches `ZOOM_EXIT`, and the camera pulls back.

## Camera-zoom mechanism (`hooks/useCameraZoom.js`)
- `measurePose(cameraEl, targetEl, {scale, pan, toViewport})` → `pose {ox, oy, dx, dy, scale}` (origin = target centre in camera coords; dx/dy = translation to screen centre). Measure while the camera is at rest.
- `useCameraZoom({phase, pose, ms})` → `{dim, cameraProps}`; spread `cameraProps` on the zooming `motion.div`; add `zoomable` + `is-dim` to whatever should blur away.
- Phases (ZOOM enum): **entering** animates `x/y/scale` to the pose with `transform-origin` at the target and opacity keyframes `[1,1,0]`; **inside** holds the zoomed, faded pose (so a stage that stays mounted sits behind an info board); **exiting** animates back to rest; a stage that unmounted while inside remounts *already zoomed* (`initial`) and pulls back, with `dim` released two frames later (`released` resets when phase returns to `none`).
- Timings are motion tokens (`theme/motion.js`): `zoom` 950/800 (lab) and `dossier` 900/750 (Sector 03) in Cyberpunk, 220/180 in Professional (where the zoom is a light scale/fade: `zoomScale` 1.04, `pan` off); the world components schedule `*_ENTERED/EXITED` from the same tokens.
- `useTraces` is passed `enabled = (zoom === 'none')` by Blueprint (rects are distorted while the camera is transformed).
- **Fixed overlays vs transforms**: info boards / viewers must never have an ancestor with `filter`/`clip-path`/persistent `transform` (fixed positioning would re-anchor). Worlds animate only opacity/scale on `main` and render overlays as siblings of scaled sections.

## State management
Single reducer in `AppContext.jsx` (`initialState()` is a function: it reads the applied theme and localStorage for the tour):
```
{ theme: 'cyberpunk'|'professional',
  view: 'boot'|'hub'|'proxmox'|'dev'|'vulns'|'writeups',   // starts at 'hub' in professional (no boot log)
  // Sector 01
  zoom: 'none'|'entering'|'inside'|'exiting',   // ZOOM enum
  zoomTarget,                 // service id being zoomed into (any node)
  activeContainerId,          // container board open inside the Docker sub-view
  // Sector 03
  dossier: 'none'|'entering'|'inside'|'exiting',
  activeDossierId,            // 'dossier_01' ...
  activeReportId,             // 'rpt-001' ... (report open in the viewer)
  // Sector 04
  activeWriteupId,            // write-up detail page open (null = index)
  // Onboarding
  tourStep: 'pihole'|'docker'|null,
  soundOn }
```
(`activeServiceId`, `OPEN_SERVICE` and `CLOSE_SERVICE` were removed: every node click is now a zoom.)
Actions: `BOOT_DONE`, `SET_THEME{theme}`, `ENTER_SECTOR{sectorId}` (routes via `SECTOR_VIEWS`: '01' → proxmox, '02' → dev, '03' → vulns, '04' → writeups), `RETURN_TO_HUB` (resets zoom and dossier state), `ZOOM_START{id}`, `ZOOM_ENTERED`, `ZOOM_EXIT`, `ZOOM_EXITED`, `OPEN_CONTAINER{id}`, `CLOSE_CONTAINER`, `DOSSIER_START{id}`, `DOSSIER_ENTERED`, `DOSSIER_EXIT`, `DOSSIER_EXITED`, `REPORT_OPEN{id}`, `REPORT_CLOSE`, `WRITEUP_OPEN{id}`, `WRITEUP_CLOSE`, `JUMP_TO_LAB{id}`, `JUMP_TO_PROJECTS`, `TOUR_NEXT`, `TOUR_OFF`, `TOUR_ON`, `TOGGLE_SOUND`. Transitions are guarded (`ENTER_SECTOR` only from hub, `ZOOM_START` only in proxmox with `zoom==='none'`, `DOSSIER_START` only in vulns with `dossier==='none'`, …) so double-fires are harmless.
Flows: (boot →) hub → (click sector) → proxmox | dev | vulns | writeups → `RETURN_TO_HUB`. Lab: `none` →(click node)→ `entering` →(950ms)→ `inside` →(close / `[RETURN_TO_PROXMOX_LAB]` / Esc)→ `exiting` →(800ms)→ `none`.
Local UI state stays local: hub log (`Hub.jsx`), hovered ids and camera `pose` (`ProxmoxWorld.jsx`, `DockerSubView.jsx`, `DossierGrid.jsx`), Pi-hole `showInfo`, the DNS simulation (restarts on each entry to the Pi-hole view).

## Component hierarchy
```
Shell (App.jsx)         AmbientBackground* · TelemetryBar (ThemeToggle) · <View> · TourGuide (z-45) · Scanlines*   (* cyberpunk only)
Hub                     header / Highlights (only if something is featured) / SectorCard x4 / SystemLog
ProxmoxWorld            pose, phase timers, lab header (+ GUIDE toggle chip), info board
├─ Blueprint            (unless zoom==='inside' with a sub-view) camera layer + rack/nodes/traces
│  ├─ TraceLayer · Rack (data-tour-avoid) · NodeCard xN (data-tour="<id>")
├─ SUB_VIEWS[zoomTarget] (zoom==='inside')  DockerSubView | PiholeSubView
│  ├─ DockerSubView     engine hub + ContainerCard x4 + TraceLayer + DataHUD (container board)
│  └─ PiholeSubView     FlowNode x3 + Pi-hole card (FilterVisual) + TraceLayer(mobile) + WebUiPanel + DataHUD (NODE_INFO)
└─ DataHUD              board for nodes with no sub-view (HAOS, Kali, Ollama), over the zoomed Blueprint
VulnsWorld              pose, phase timers, Esc handling, sector header
├─ DossierGrid          (dossier !== 'inside') folder shelf = camera stage; DossierFolder x3
├─ DossierArchive       (dossier === 'inside') ReportIcon xN (thumbnail owns layoutId `rpt-<id>`)
└─ ReportViewer         (activeReportId) sibling; panel shares layoutId `rpt-<id>`
```

## Ambient background (`components/AmbientBackground.jsx`)
Fixed, `pointer-events-none`, `-z-10` inside `#root`'s stacking context (above the body grid, below all content), rendered once in `Shell` so it shows on every view including boot. Layers, all masked/weighted toward the **left and right edges** so the centre stays clean:
1. **Canvas** (`HexCanvas`): drifting hex outlines (count scales with screen area, 10 on phones) and falling hex/binary "data streams" confined to the outer 14% on each side. `edgeFactor(x)` is 0 in the middle and 1 near the edges and scales alpha (hexes 0.04–0.34, streams ≤0.5). DPR capped at 2, `requestAnimationFrame` paused when the tab is hidden, a single static frame with `prefers-reduced-motion`.
2. **Circuit lines** (`CircuitLines`): SVG paths (defined for the left edge, mirrored for the right) with the `.trace` dash animation, non-scaling strokes and a horizontal mask that fades to transparent at 19%/81%.
3. **Telemetry readouts** (`Readouts`): fake status lines drifting upward (`.ambient-drift`, 70s/95s loops, list doubled for a seamless loop), `xl` and up only, ~20% opacity, vertically faded.
4. A faint central spotlight (radial gradient) to pull the eye to the middle.
Tuning knobs: `edgeFactor` thresholds, the alpha constants in `draw`, `outerX` zone widths, mask stops. Keep contrast low: content reaches the screen edges on ≤1440px displays, so ambient elements must never fight text.

## Guided tour (`components/TourGuide.jsx`)
A glowing finger-pointer that teaches the two drill-downs.
- **State** (`tourStep`): `'pihole'` → `'docker'` → `null`. Initial value comes from `localStorage['mainframe.tour']` (`'done'` → `null`, else `'pihole'`, so it shows once per browser); an effect in `AppProvider` writes `'active'`/`'done'` whenever the step changes (all storage access is try/catch).
- **Reducer logic** (in `ZOOM_START`): clicking the node the cursor points at advances the tour (`pihole → docker → null`); clicking any other node ends it (the visitor is exploring alone). `TOUR_NEXT` (timer) advances, `TOUR_OFF` (SKIP button / GUIDE toggle) ends it, `TOUR_ON` (GUIDE toggle) restarts at `'pihole'`.
- **Visibility**: only when `view==='proxmox' && zoom==='none' && tourStep`. It disappears during a zoom or sub-view and reappears pointing at the next target when the visitor returns, so the sequence is: Pi-hole → (visit) → back in lab, cursor glides to Docker → (visit) → cursor fades out.
- **Timing** (`TourGuide`): each step auto-advances after `STEP_MS` (9s) if ignored; if the target element does not exist (`[data-tour="<id>"]`) the step is skipped after 1.5s. The final advance sets `tourStep` to `null`, which fades the whole overlay out (AnimatePresence, 0.5s).
- **Rendering**: a fixed overlay with (1) a pulsing highlight ring on the target (`.tour-ring`), (2) tap ripples at the fingertip, (3) the pointer (`lucide Pointer`, neon drop-shadow) that springs to each target and loops a tap motion, (4) a caption ("GUIDE n/2" + text + SKIP). The target rect is polled every 200ms (plus resize/scroll) so it follows relayout. The caption is placed by `placeCaption`: it tries right / left / below / above of the target, clamps to the screen, and picks the spot covering the least (target counts triple; other `[data-tour]` nodes and the `[data-tour-avoid]` rack count once). If the target is scrolled off-screen (stacked mobile layout) a pinned chip "GUIDE // SCROLL TO <NODE>" scrolls to it instead.
- **Toggle**: the `GUIDE: ON/OFF` chip in the lab header (`ProxmoxWorld`).
- **To change the tour**: edit `TOUR_NEXT` in `AppContext.jsx`, `STEPS` text in `TourGuide.jsx`, and make sure the target node has `data-tour="<service id>"` (`NodeCard` sets it for every service).

## Sector 01 notes
- Node placement is the static `POSITION` map in `NodeCard.jsx` (Tailwind can't do dynamic class names); `service.side` controls trace direction. Pi-hole is at `lg:col-start-3 lg:row-start-3`, so the lab grid has 3 rows and the rack spans all three (`lg:row-span-3` in `Rack.jsx`).
- **Traces** (`hooks/useTraces.js` + `ui/TraceLayer.jsx`): SVG paths from `getBoundingClientRect` of source/target elements relative to a stage ref, re-measured on resize (ResizeObserver) and at 300/900/1800 ms. Callers pass `compute(rel)` returning `{id, accent, x1,y1,x2,y2, d?, label?, lx?, ly?, packets?, dur?, packetColor?}`. Keep measured elements free of entrance transforms. Desktop-only (`lg:`) unless `mobile` is passed.
- **Rack tilt**: only the inner frame rotates; the outer wrapper (`rackRef`) stays flat and is what traces attach to.
- **Adding a node**: add to `SERVICES` (id, name, icon, accent, side, mission, architecture, config, stack) and to `POSITION`. It gets the camera zoom and a centered info board for free. For a dedicated sub-view: create the component, register it in `SUB_VIEWS` (`ProxmoxWorld.jsx`), set `drillable: true` (label only), and have it dispatch `ZOOM_EXIT` for its return control and render any board as a sibling of its animated section. More than 3 nodes per side means revisiting the `lg` grid rows in `Blueprint.jsx` and `Rack.jsx`.
- **Adding a container**: add to `CONTAINERS` (`side`, `row`, `tone`, `status`, `ports`) and to `POSITION` in `ContainerCard.jsx`.
- **Pi-hole visualizer** (`components/pihole/`): the pipeline (laptop → Pi-hole → resolver, resolver ↓ content, content back to laptop) is real HTML cards with traces from `useTraces`; `compute` returns horizontal geometry on `lg` and vertical (return path up a left gutter) when stacked. `FilterVisual` runs an async loop driving one token with `useAnimationControls` (fade in → gate → verdict → allowed exits right / blocked drops into the incinerator), cleaned up via an `alive` flag + `controls.stop()`. `WebUiPanel` shows simulated Total/Blocked/Percent tiles, a chart and a live log from `useDnsSimulation`; it sits beside the flow at `xl`. Labels use `<wbr>` after underscores; `.glitch` has `overflow-wrap:anywhere`.
- **Windows AD lab** (`components/adlab/AdLabSubView.jsx`, content in `data/adlab.js`, node id `adlab` at `lg:col-start-1 lg:row-start-3`): a network diagram of real HTML node buttons in two zone frames with the firewall between them, wired by `useTraces` (each path is one line running behind the firewall card; `lg` only, the rules list under the stage carries the same information when stacked). Hover/focus previews a node in the `NODE_INSPECTOR` panel, click pins it. Below it: what I built, design decisions, troubleshooting log, limitations, tags. This content is REAL, not template. **Privacy rule: no IP addresses, subnets, MACs, port-forwarding addresses, screenshots or home-network details; networks are named by role only** ("Home network (external)", "Lab network (internal, isolated)"). Task progress is 11 hands-on / 2 study / 1 not completed (Microsoft 365) of 14; keep it accurate. A service may set `state` (e.g. `ON-DEMAND`) to replace the `ONLINE` label on its `NodeCard`.
- **DataHUD fields**: required `name, icon, accent, mission, architecture[], config[][], stack[]`; optional `status/tone`, `uptime`, `role`, `ports[][]`, `load`, `eyebrow` prop. Esc/backdrop closes, focus goes to the close button, body scroll locked while open.
- Copy in `services.js`, `containers.js` and the Pi-hole entry is TEMPLATE content (only names, statuses and roles came from the lab); replace VM IDs, RAM, ports, VLANs, models with real values.

## Sector 03: vulnerability reports (`components/vulns/`)
**Navigation (each layer reverses to the previous one; Esc pops one layer):** hub →(click Sector 03)→ folder shelf →(click folder)→ archive of report icons →(click icon)→ report viewer. Back: `[CLOSE_REPORT]`/Esc → `[CLOSE_DOSSIER]`/Esc → `[RETURN_TO_SECTOR_HUB]`/Esc → hub. `VulnsWorld` owns the single `keydown` handler (report → dossier → hub); the viewer does not bind Esc.
**Animation states:**
1. *Entry* (`VulnsWorld`): the shared `viewProps` transition (opacity + slight scale in Cyberpunk, fade in Professional).
2. *Folder hover* (`DossierFolder` + `DossierGrid`): hovered folder variant `hover` glides up 16px, scale 1.04; front flap `rotateX -17°`, three papers slide out (child variants share the variant names); other folders get a `custom` sibling shift (±14px, desktop); pointer sets `--mx/--my` for the `.holo` sheen and springs a ±8° tilt; `sfx.hover` plus a terminal readout line (`> peek DOSSIER_0X ...`). The tab is `z-[5]` so papers slide out behind its label.
3. *Folder open* (`useCameraZoom`, phase `state.dossier`, `DOSSIER_MS`): click → `measurePose` on the folder wrapper (scale 2.1) → `DOSSIER_START`; entering: pan/scale onto the folder, others dimmed, header fades; inside: `DossierArchive`; exiting: grid remounts zoomed and pulls back.
4. *Report open* (`ReportIcon` → `ReportViewer`): thumbnail and viewer panel share `layoutId="rpt-<id>"`, so the thumbnail morphs into the fixed reader (spring); content fades in 0.28s after the morph starts so text is never distorted.
- **Viewer content**: if `report.pdf` is set the real PDF is embedded (`<iframe>` + `OPEN_PDF`); otherwise the structured fields in `dossiers.js` render as a themed document (meta grid, redaction bars, sections, contents rail, zoom 85–130% via CSS `zoom`). `SAMPLE_DOCUMENT` watermark/badge while `placeholder` is true and no `pdf`.
- **All report content is SAMPLE content**: generic vulnerability classes, redacted asset/program, made-up dates and CVSS; it deliberately names no company. To publish real work: PDFs in `public/reports/`, set `pdf`, set `placeholder: false`, and only publish what the program cleared for disclosure. The archive title is `ARCHIVE.code`.
- **Adding a dossier/report**: append to `DOSSIERS` (folder: id `dossier_0N`, code, title, accent, clearance; report: `sample()` helper or the same fields). The shelf is `md:grid-cols-3`; more than 3 folders needs a wrapping grid (check the `shift` logic in `DossierGrid`).
- `TelemetryBar.currentPath` shows the breadcrumb (`~/sector03/sec_ops_grid/<dossier>/<report>.pdf`, `~/sector01/infrastructure_lab/<node>`).

## Home page highlights (`components/Highlights.jsx`, `data/highlights.js`)
- Sits between the hero and the sector cards. Features up to `MAX_HIGHLIGHTS` (3) projects; with none flagged the section does not render at all.
- **No copied content.** `highlights.js` only collects entries from `services.js` (home lab), `projects.js` and `writeups.js` and maps them to one shape (title, description, tags, icon, accent, `open` action, linked `report`).
- **To feature / unfeature a project**: on its entry set `featured: true` (remove it or set false to unfeature), optional `highlightOrder` (lowest first, unordered last), `highlightReason` (the "why this matters" line, shown larger than the description) and optional `highlightTags` (two or three; default = the entry's first three tags). Lab nodes can also set `title` (plain name; default `name`).
- Card: kind label, `h3` title (section heading is `h2`), reason, description, tags, `OPEN_PROJECT` (dispatches `JUMP_TO_LAB` / `JUMP_TO_PROJECTS` / `WRITEUP_OPEN`, which are allowed from the hub) and a report link when `getWriteupFor` finds one. One highlight = wide card with the visual beside the text; two or three = a grid with the visual on top.
- Visual: `PREVIEWS` maps a highlight key to a custom preview (`lab:adlab` = a small static diagram built from `data/adlab.js` nodes, role names only); otherwise the project's screenshot, otherwise an icon placeholder.
- Entrance uses `itemProps` (about 0.1 s, no delay before content). Colours come from tokens only, so it follows both themes.
- **Wording rule**: `highlightReason` is written by the site owner, in first person and plain language. Do not write or reword it, and do not add claims, metrics or dates. These are home lab / personal projects.

## Sector 02: websites and apps (`components/dev/`)
- `DevDistrict` renders one `ProjectCard` per entry of `PROJECTS` in **`data/projects.js`** (the only place to edit; the how-to is the comment block at the top of that file). Fields: `id, name, url, status ('Live' | 'In progress', colours in STATUS), description, tags, thumbnail, thumbnailAlt`.
- Thumbnails are files in `src/content/projects/`, resolved by file name with `import.meta.glob`; a missing or null thumbnail draws the `PREVIEW_PENDING` placeholder.
- Empty `description` / `tags` are hidden on the live site; a dashed `TODO` note shows in dev only (`import.meta.env.DEV`).
- Layout: `ui/CardStage` is a centred `flex-wrap` row and cards use `CARD_WIDTH` (1 / 2 / 3 per row). A single project gets the wide `featured` layout (preview beside details).
- The Visit link is `target="_blank" rel="noopener noreferrer"`. Esc returns to the hub.
- **Honesty rule**: only real projects, with the tools actually used. These are personal projects; never describe them as professional or client work.

## Sector 04: reports and write-ups (`components/writeups/`)
- **No upload form.** Publishing = drop a file in `src/content/writeups/`, add one entry to **`data/writeups.js`**, redeploy (how-to at the top of that file and in the folder's README).
- `.md` files are loaded lazily (`?raw`) and rendered by `Markdown.jsx` (`react-markdown` + `remark-gfm`, lazy chunk; raw HTML is not rendered; headings shift down one level because the page title is the only `h1`; images only from the same folder). `.pdf` files get an `<iframe>` viewer plus `DOWNLOAD_PDF` / `OPEN_IN_NEW_TAB`.
- An entry is `published` only when its file exists **and** `privacyChecked: true`; otherwise the card and the detail page show `COMING_SOON` (dev shows a note if the file is there but unchecked). Everything in the folder is bundled regardless of the flag, so only clean files go in.
- Entry fields: `id, title, date (YYYY-MM-DD | null), summary, tags, file, privacyChecked, related {kind: 'lab' | 'project', id, label}`. Sorted newest first, undated last. No tag filter (the site has no filter pattern).
- Navigation: index (`WriteupCard`s) → detail (`WriteupDetail`) via `activeWriteupId`; Esc pops detail → index → hub.
- **Cross-links**: `related` links a report to its project and back (`getWriteupFor(kind, id)`). `WRITEUP_OPEN{id}` opens a report from any sector (used by the chip in `AdLabSubView` and by `ProjectCard`); `JUMP_TO_LAB{id}` lands directly inside a lab node (`zoom: 'inside'`, no stored pose, so the exit is a plain fade-in of the blueprint); `JUMP_TO_PROJECTS` opens Sector 02. These go straight to the target view.
- **Privacy rule (both sectors)**: no addresses, subnets, hardware identifiers, email, phone number, or names of companies or people, in files, alt text, data or comments. The original AD lab report PDF must never be added to the repo; only a checked, web-safe version with metadata stripped.
- The first entry (`windows-ad-lab`) is a `COMING_SOON` placeholder: `date`, `summary`, `tags` and `file` are TODOs until the web-safe report is supplied.

## Other notes
- **Sound**: off by default; the AudioContext is created only after the SFX toggle click.
- `prefers-reduced-motion` honoured (`MotionConfig reducedMotion="user"` + CSS block that also stops ambient drift, tour ring, glitch, cursor blink; the canvas draws one static frame).
- Verifying UI when the Chrome extension is unavailable: headless Chrome via `puppeteer-core` (see the assistant memory note); set the viewport before `goto`, wait on button `aria-label`s, not fixed sleeps.

## Adding another sector
Add it to `sectors.js` (`locked:false`, an identity-token `accent`, optional `cta`), add a `VIEWS.*` entry and world component, map it in `SECTOR_VIEWS` (`state/AppContext.jsx`) and `VIEW_COMPONENTS` (`App.jsx`), and add its breadcrumb in `TelemetryBar.jsx`. Spread `useMotion().viewProps` on its `motion.main` so it opens with the same short transition. The hub grid is `md:grid-cols-2 xl:grid-cols-4` (four sectors); a fifth needs a new layout. Card-based sectors can reuse `ui/SectorHeader` and `ui/CardStage`.

## Future expansion
1. Sector 02: fill in the Tetris description, tags and screenshot; repo links per project.
2. Sector 03: real PDFs in `public/reports/`, filter/sort by severity, a stats strip, CTF write-ups as an extra dossier.
3. Tour: a hub-level step ("open a sector") and a Sector 03 step, reusing `data-tour` + `placeCaption`.
4. Generalise the sector shell (header + return button) into a shared `SectorLayout`.
5. Optional: real telemetry endpoint, deep-linkable views via URL hash, a resume/contact command palette, TypeScript migration.
