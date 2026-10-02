import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { writeupImage } from '../../data/writeups';

// Themed Markdown renderer for write-ups. Loaded lazily (WriteupDetail), so the
// parser is only downloaded when an article is opened.
// - Raw HTML in the file is not rendered (react-markdown default), so a report
//   file cannot inject markup or scripts.
// - Headings are shifted down one level: the page title is the only <h1>.
// - Images must sit in src/content/writeups/ and are referenced by file name.

const text = 'text-[15px] leading-relaxed text-white/75';

const components = {
  h1: ({ node, ...p }) => (
    <h2 className="mb-3 mt-10 border-b border-white/10 pb-1.5 font-ui text-[15px] font-bold track-12 text-cyber first:mt-0" {...p} />
  ),
  h2: ({ node, ...p }) => <h3 className="mb-2 mt-8 font-sans text-lg font-semibold text-white" {...p} />,
  h3: ({ node, ...p }) => <h4 className="accent-text mb-2 mt-6 font-ui text-[12px] font-bold track-20" {...p} />,
  h4: ({ node, ...p }) => <h5 className="mb-1 mt-5 font-sans text-[15px] font-semibold text-white/90" {...p} />,
  h5: ({ node, ...p }) => <h6 className="mb-1 mt-4 font-sans text-sm font-semibold text-white/80" {...p} />,
  h6: ({ node, ...p }) => <h6 className="mb-1 mt-4 font-sans text-sm font-semibold text-white/70" {...p} />,
  p: ({ node, ...p }) => <p className={`my-3 ${text}`} {...p} />,
  ul: ({ node, ...p }) => <ul className={`my-3 list-disc space-y-1.5 pl-5 marker:text-cyber ${text}`} {...p} />,
  ol: ({ node, ...p }) => <ol className={`my-3 list-decimal space-y-1.5 pl-5 marker:font-ui marker:text-xs marker:text-cyber ${text}`} {...p} />,
  strong: ({ node, ...p }) => <strong className="font-semibold text-white" {...p} />,
  hr: () => <hr className="my-8 border-white/10" />,
  blockquote: ({ node, ...p }) => (
    <blockquote className="accent-bg-soft my-4 border-l-4 py-1 pl-4 pr-2" style={{ borderLeftColor: 'var(--accent)' }} {...p} />
  ),
  a: ({ node, href = '', ...p }) => {
    const external = /^https?:\/\//i.test(href);
    return (
      <a
        href={href}
        className="text-cyber underline decoration-cyber/40 underline-offset-2 hover:decoration-cyber"
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...p}
      />
    );
  },
  code: ({ node, ...p }) => <code className="bg-white/10 px-1 py-0.5 font-mono text-[0.88em] text-matrix" {...p} />,
  pre: ({ node, ...p }) => (
    <pre
      className="my-4 overflow-x-auto border border-white/10 bg-black/50 p-3 font-mono text-[12.5px] leading-relaxed text-white/85 [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-inherit"
      tabIndex={0}
      {...p}
    />
  ),
  table: ({ node, ...p }) => (
    <div className="my-4 overflow-x-auto" tabIndex={0}>
      <table className="w-full border-collapse border border-white/10 text-left text-[13.5px]" {...p} />
    </div>
  ),
  th: ({ node, ...p }) => <th className="border border-white/10 bg-black/40 px-3 py-1.5 font-ui text-[11px] tracking-widest text-cyber" {...p} />,
  td: ({ node, ...p }) => <td className="border border-white/10 px-3 py-1.5 text-white/75" {...p} />,
  img: ({ node, src = '', alt = '' }) => {
    const url = writeupImage(src.replace(/^\.\//, ''));
    if (!url) return null; // only images saved next to the report are shown
    return <img src={url} alt={alt} loading="lazy" className="my-4 max-w-full border border-white/10" />;
  },
};

export default function Markdown({ children }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </ReactMarkdown>
  );
}
