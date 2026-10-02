// Framed blueprint stage holding a wrapping, centred row of cards. Cards size
// themselves with CARD_WIDTH, so one card sits in the middle and ten wrap into
// rows of two / three with the last row centred. Uses the ancestor's `--accent`.
export const CARD_WIDTH = 'w-full md:w-[calc(50%-0.75rem)] xl:w-[calc(33.333%-1rem)]';

export default function CardStage({ label, fig, children }) {
  return (
    <div className="accent-border relative overflow-hidden border shadow-[0_0_50px_color-mix(in_srgb,var(--glow-accent)_10%,transparent)]">
      <div className="blueprint-grid relative p-4 pb-9 pt-8 sm:p-8 sm:pb-10 lg:flex lg:min-h-[52vh] lg:flex-col lg:justify-center">
        <div aria-hidden className="pointer-events-none absolute left-3 top-2 font-ui text-[10px] track-25 text-white/35">
          {label}
        </div>
        {fig && (
          <div aria-hidden className="pointer-events-none absolute bottom-2 left-3 font-ui text-[10px] track-25 text-white/30">
            {fig}
          </div>
        )}
        <ul className="flex flex-wrap justify-center gap-6">{children}</ul>
      </div>
    </div>
  );
}
