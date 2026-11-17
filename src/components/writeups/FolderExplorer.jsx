import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ChevronRight, FileCheck2, FileText, Folder, FolderOpen, FolderTree, Hourglass, ScrollText } from 'lucide-react';
import GlitchText from '../ui/GlitchText';
import Tip from '../ui/Tip';
import LearningPath from './LearningPath';
import { FormatBadge, WriteupDate } from './WriteupMeta';
import useTerminal from '../../hooks/useTerminal';
import { cn } from '../../lib/cn';
import { sfx } from '../../lib/sound';
import { useMotion } from '../../theme/motion';
import { sectorNumberOfView } from '../../data/tracks';

const pad = (n) => String(n).padStart(2, '0');
// "SOC L1 Alert Triage: TryHackMe Notes" -> "SOC L1 Alert Triage"
const short = (title) => title.split(':')[0];
export const folderPath = (trackId, cat) => `~/write_ups/${trackId}/${cat.id}/`;

// Sector 03, inside an opened folder (one write-up category).
//   left (lg): explorer tree of the track's folders; the open one is expanded and lists its files
//   right:     folder intro (+ learning path) and the file list with metadata
// Props: track, folders (the track's categories), folder (the open one),
// onSelect(categoryId), onClose(), onOpen(writeupId).
export default function FolderExplorer({ track, folders, folder, onSelect, onClose, onOpen }) {
  const { subView } = useMotion();
  const published = folder.writeups.filter((w) => w.published).length;
  const lines = useMemo(
    () => [{ text: `> ls -l ${folderPath(track.id, folder)} ... ${folder.writeups.length} files, ${published} published`, pause: 0 }],
    [track.id, folder, published],
  );
  const { pos } = useTerminal(lines, { speed: 14 });

  return (
    <motion.section aria-label={`${folder.label} folder`} style={{ '--accent': folder.accent, '--led': folder.accent }} {...subView}>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <button
            type="button"
            className="btn-cyber mb-4"
            onClick={() => {
              sfx.close();
              onClose();
            }}
          >
            <ArrowLeft size={14} aria-hidden /> [CLOSE_FOLDER]
          </button>
          <p className="font-ui text-xs track-30 text-matrix">
            [SECTOR {sectorNumberOfView('writeups', track.id)} ▸ {track.label.toUpperCase()} ▸ {folder.code}] // DIRECTORY_OPEN
          </p>
          <h1 className="accent-text text-glow mt-1 break-words font-ui text-2xl font-bold leading-tight sm:text-4xl">
            <GlitchText auto>{folder.label}</GlitchText>
          </h1>
          <p className="mt-2 min-h-[1.5em] break-words font-mono text-xs text-white/50">
            {lines[0].text.slice(0, pos.i > 0 ? undefined : pos.c)}
            <span className="cursor-block text-cyber" />
          </p>
        </div>

        <div className="flex flex-wrap gap-2 font-ui text-[11px] tracking-widest">
          <Tip label="FILES IN THIS FOLDER" side="bottom">
            <span className="chip-stat accent-border accent-text accent-bg-soft flex items-center gap-2 border px-2.5 py-1.5">
              <FileText size={13} aria-hidden /> FILES: {folder.writeups.length}
            </span>
          </Tip>
          <Tip label="READY TO READ" side="bottom">
            <span className="chip-stat flex items-center gap-2 border border-matrix/30 bg-matrix/5 px-2.5 py-1.5 text-matrix">
              <FileCheck2 size={13} aria-hidden /> PUBLISHED: {published}
            </span>
          </Tip>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]">
        <ExplorerTree track={track} folders={folders} openId={folder.id} onSelect={onSelect} onOpen={onOpen} />

        <div className="min-w-0">
          <div className="accent-border relative mb-5 border bg-panel/80 p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <folder.icon size={18} aria-hidden className="accent-text" />
              <h2 className="accent-text font-ui text-sm font-bold track-20">{folder.code}</h2>
              {folder.notice && (
                <span className="border border-warn/40 bg-warn/5 px-2 py-0.5 font-ui text-[10px] tracking-widest text-warn">
                  {folder.notice}
                </span>
              )}
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/65">{folder.blurb}</p>
            {folder.path && <LearningPath label={folder.path} writeups={folder.writeups} onOpen={onOpen} />}
          </div>

          <FileList folder={folder} onOpen={onOpen} />
        </div>
      </div>

      <p className="mt-4 text-center font-ui text-[11px] track-20 text-white/30">
        [ CLICK A FILE TO OPEN IT · ESC TO CLOSE THE FOLDER ]
      </p>
    </motion.section>
  );
}

// The track's folders as a tree. Clicking a closed folder opens it (and expands it);
// clicking the open one collapses / expands its file list. Desktop only: on small
// screens [CLOSE_FOLDER] leads back to the shelf.
function ExplorerTree({ track, folders, openId, onSelect, onOpen }) {
  const [collapsed, setCollapsed] = useState(false);
  const { itemProps } = useMotion();

  return (
    <nav aria-label={`${track.label} folders`} className="accent-border hidden self-start border bg-panel/80 p-3 lg:sticky lg:top-20 lg:block">
      <p className="mb-3 flex items-center gap-2 border-b border-white/10 pb-2 font-ui text-[10px] track-25 text-white/50">
        <FolderTree size={12} aria-hidden className="accent-text" /> EXPLORER // {track.id.toUpperCase()}
      </p>
      <ul className="space-y-1">
        {folders.map((f) => {
          const isOpen = f.id === openId;
          const expanded = isOpen && !collapsed;
          const Icon = expanded ? FolderOpen : Folder;
          return (
            <li key={f.id} style={{ '--accent': f.accent }}>
              <button
                type="button"
                aria-expanded={isOpen ? expanded : false}
                aria-current={isOpen ? 'location' : undefined}
                onClick={() => {
                  sfx.click();
                  if (isOpen) setCollapsed((c) => !c);
                  else {
                    setCollapsed(false);
                    onSelect(f.id);
                  }
                }}
                className={cn(
                  'press flex w-full items-center gap-2 border px-2 py-1.5 text-left font-ui text-[11px] tracking-widest transition-colors',
                  isOpen ? 'accent-border accent-text accent-bg-soft' : 'border-transparent text-white/65 hover:text-white',
                )}
              >
                <ChevronRight
                  size={13}
                  aria-hidden
                  className="shrink-0 transition-[rotate] duration-200"
                  style={{ rotate: expanded ? '90deg' : '0deg' }}
                />
                <Icon size={14} aria-hidden className="accent-text shrink-0" />
                <span className="min-w-0 flex-1 truncate">{f.code}</span>
                <span className={cn('border px-1 text-[10px]', isOpen ? 'accent-border' : 'border-white/15')}>{f.writeups.length}</span>
              </button>

              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.ul
                    key="files"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="ml-[1.1rem] overflow-hidden border-l border-white/15"
                  >
                    {f.writeups.map((w, i) => {
                      const FileIcon = w.published ? (w.format === 'PDF' ? FileText : ScrollText) : Hourglass;
                      return (
                        <motion.li key={w.id} {...itemProps(i)}>
                          <button
                            type="button"
                            onClick={() => {
                              sfx.open();
                              onOpen(w.id);
                            }}
                            title={w.title}
                            className="group flex w-full items-center gap-2 py-1 pl-3 pr-1 text-left text-[12px] leading-snug text-white/60 hover:text-white focus-visible:text-white"
                          >
                            <FileIcon size={12} aria-hidden className={cn('shrink-0', w.published ? 'accent-text' : 'text-warn')} />
                            <span className="min-w-0 flex-1 truncate">{short(w.title)}</span>
                          </button>
                        </motion.li>
                      );
                    })}
                  </motion.ul>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// Files of the open folder, one row each, in learning-path order then newest.
// The title is the button; its ::after covers the row so the row is one target.
function FileList({ folder, onOpen }) {
  const { itemProps } = useMotion();
  return (
    <div>
      <div
        aria-hidden
        className="mb-2 hidden grid-cols-[minmax(0,1fr)_7rem_5rem_7.5rem] gap-4 px-4 font-ui text-[10px] track-25 text-white/40 md:grid"
      >
        <span>NAME</span>
        <span>DATE</span>
        <span>{folder.path ? 'PART' : 'DOC'}</span>
        <span>FORMAT</span>
      </div>
      <ul aria-label={`${folder.label} files`} className="space-y-2.5">
        {folder.writeups.map((w, i) => (
          <motion.li key={w.id} {...itemProps(i)}>
            <article
              className="group lift hover-glow accent-border relative grid gap-3 border bg-panel/90 p-4 backdrop-blur-sm md:grid-cols-[minmax(0,1fr)_7rem_5rem_7.5rem] md:items-start md:gap-4"
              onMouseEnter={() => sfx.hover()}
            >
              {!w.published && <div aria-hidden className="hatch pointer-events-none absolute inset-0" />}

              <div className="relative min-w-0">
                <h3 className="accent-text font-ui text-[15px] font-bold leading-snug tracking-wide">
                  <button
                    type="button"
                    className="text-left after:absolute after:inset-0 after:z-10 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-cyber"
                    onClick={() => {
                      sfx.open();
                      onOpen(w.id);
                    }}
                  >
                    {w.title}
                  </button>
                </h3>
                {w.summary && <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-white/60">{w.summary}</p>}
                {w.related && (
                  <p className="mt-2 font-ui text-[11px] tracking-wider text-white/45">
                    PROJECT ▸ <span className="text-white/70">{w.related.label}</span>
                  </p>
                )}
                {w.tags.length > 0 && (
                  <ul aria-label="Tags" className="mt-2.5 flex flex-wrap gap-1.5">
                    {w.tags.map((tag) => (
                      <li key={tag} className="chip-static">
                        {tag.toUpperCase()}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="relative flex flex-wrap items-center gap-x-3 gap-y-2 md:contents">
                <div className="md:pt-0.5">
                  <WriteupDate date={w.date} />
                </div>
                <span className="font-ui text-[11px] tracking-widest text-white/50 md:pt-0.5">
                  <span className="md:sr-only">{w.part ? 'PART ' : 'DOC '}</span>
                  {pad(w.part ?? i + 1)}
                </span>
                <div className="flex flex-col items-start gap-2">
                  <FormatBadge writeup={w} />
                  <span aria-hidden className="accent-text flex items-center gap-1 font-ui text-[10px] font-bold tracking-widest transition-[gap] group-hover:gap-2">
                    {w.published ? 'OPEN' : 'STATUS'} <ChevronRight size={12} className="cta-arrow" />
                  </span>
                </div>
              </div>
            </article>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
