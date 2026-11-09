// Parses the body of a visual block (a fenced code block in a Markdown report).
//
//   title: Optional heading          <- `key: value` lines before the first row
//   caption: Optional note under it     are settings (only the keys below)
//   First cell | second cell | third  <- every other line is a row, cells split on " | "
//
// Blank lines are ignored. `depth` is the indentation of the line (two spaces
// per level), used by the process tree.
const META = new Set(['title', 'caption', 'severity', 'status', 'verdict', 'kind', 'label']);

export default function parseBlock(text) {
  const meta = {};
  const rows = [];
  for (const raw of String(text).split(/\r?\n/)) {
    if (!raw.trim()) continue;
    const m = rows.length === 0 && /^\s*([a-z]+):\s*(.*)$/.exec(raw);
    if (m && META.has(m[1])) {
      meta[m[1]] = m[2].trim();
      continue;
    }
    const cells = raw.trim().split(/\s*\|\s*/);
    cells.depth = Math.floor((raw.length - raw.trimStart().length) / 2);
    rows.push(cells);
  }
  return { meta, rows };
}
