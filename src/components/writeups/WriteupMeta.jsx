import { FileText, Hourglass, ScrollText } from 'lucide-react';

// Shared write-up metadata (file list in FolderExplorer, detail page).

// Reading format badge: Article (Markdown), PDF, or coming soon while unpublished.
export function FormatBadge({ writeup }) {
  if (!writeup.published) {
    return (
      <span className="flex items-center gap-1.5 border border-warn/50 bg-warn/10 px-2 py-0.5 font-ui text-[10px] tracking-widest text-warn">
        <Hourglass size={10} aria-hidden /> COMING_SOON
      </span>
    );
  }
  const Icon = writeup.format === 'PDF' ? FileText : ScrollText;
  return (
    <span className="accent-border accent-text accent-bg-soft flex items-center gap-1.5 border px-2 py-0.5 font-ui text-[10px] tracking-widest">
      <Icon size={10} aria-hidden />
      <span className="sr-only">Format: </span>
      {writeup.format.toUpperCase()}
    </span>
  );
}

export function WriteupDate({ date }) {
  return date ? (
    <time dateTime={date} className="font-ui text-[11px] tracking-widest text-white/50">
      {date}
    </time>
  ) : (
    <span className="font-ui text-[11px] tracking-widest text-white/35">DATE_PENDING</span>
  );
}
