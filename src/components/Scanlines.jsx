// Fixed CRT overlay: scanlines + slow sweep bar + vignette. Never intercepts input.
export default function Scanlines() {
  return (
    <div aria-hidden className="crt-root pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      <div className="crt-lines absolute inset-0" />
      <div className="crt-sweep" />
      <div className="crt-vignette absolute inset-0" />
    </div>
  );
}
