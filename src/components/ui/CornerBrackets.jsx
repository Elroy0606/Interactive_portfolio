// Decorative HUD corner ticks. Parent must be `relative`.
export default function CornerBrackets({ className = 'h-3 w-3' }) {
  const base = `corner-tick pointer-events-none absolute border-current ${className}`;
  return (
    <>
      <span aria-hidden className={`${base} left-0 top-0 border-l-2 border-t-2`} />
      <span aria-hidden className={`${base} right-0 top-0 border-r-2 border-t-2`} />
      <span aria-hidden className={`${base} bottom-0 left-0 border-b-2 border-l-2`} />
      <span aria-hidden className={`${base} bottom-0 right-0 border-b-2 border-r-2`} />
    </>
  );
}
