// Notes inbox: turns .docx notes in notes-inbox/ into Markdown drafts for Sector 04.
//
//   npm run notes            list new / changed / already-imported files, convert new + changed
//                            ones into notes-inbox/.staging/<slug>/ (nothing in src/ is touched)
//   npm run notes -- --mark <file.docx> <writeupId>
//                            record a file as published (stores its SHA-256 in imported.json)
//
// A file is skipped when its hash matches imported.json, so a note is never imported twice.
// If you edit a doc and re-download it under the same name, its hash changes and it shows up
// as CHANGED: that updates the existing write-up instead of creating a new one.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import mammoth from 'mammoth';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const INBOX = join(ROOT, 'notes-inbox');
const STAGING = join(INBOX, '.staging');
const MANIFEST = join(INBOX, 'imported.json');
const WRITEUPS = join(ROOT, 'src', 'data', 'writeups.js');

const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {};
const sha = (buf) => createHash('sha256').update(buf).digest('hex');
const slugify = (name) =>
  basename(name, extname(name)).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// --mark <file> <writeupId>
const args = process.argv.slice(2);
if (args[0] === '--mark') {
  const [, file, writeupId] = args;
  if (!file || !writeupId) throw new Error('usage: npm run notes -- --mark <file.docx> <writeupId>');
  const buf = readFileSync(join(INBOX, file));
  manifest[file] = { sha256: sha(buf), writeupId, importedAt: new Date().toISOString().slice(0, 10) };
  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`marked ${file} -> ${writeupId}`);
  process.exit(0);
}

const existingIds = new Set(
  [...readFileSync(WRITEUPS, 'utf8').matchAll(/\bid:\s*'([^']+)'/g)].map((m) => m[1]),
);

const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-' });
turndown.use(gfm);

const files = readdirSync(INBOX).filter((f) => f.toLowerCase().endsWith('.docx') && !f.startsWith('~$'));
if (!files.length) console.log('notes-inbox/ has no .docx files.');

for (const file of files) {
  const buf = readFileSync(join(INBOX, file));
  const hash = sha(buf);
  const prev = manifest[file];
  if (prev && prev.sha256 === hash) {
    console.log(`SKIP     ${file}  (already published as ${prev.writeupId})`);
    continue;
  }

  const slug = prev?.writeupId ?? slugify(file);
  const outDir = join(STAGING, slug);
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  let n = 0;
  const { value: html, messages } = await mammoth.convertToHtml(
    { buffer: buf },
    {
      convertImage: mammoth.images.imgElement(async (image) => {
        const ext = (image.contentType.split('/')[1] || 'png').replace('jpeg', 'jpg');
        const name = `img-${String(++n).padStart(2, '0')}.${ext}`;
        writeFileSync(join(outDir, name), await image.read());
        return { src: `${slug}/${name}`, alt: '' };
      }),
    },
  );
  // Word tables have no header row; GFM tables need one, so the first row becomes the header.
  const tidy = html
    .replace(/<table>(\s*<tbody>)?\s*<tr>([\s\S]*?)<\/tr>/g, (_, tb = '', row) =>
      `<table><thead><tr>${row.replace(/<td>/g, '<th>').replace(/<\/td>/g, '</th>')}</tr></thead>${tb}`)
    .replace(/<(td|th)><p>([\s\S]*?)<\/p><\/\1>/g, '<$1>$2</$1>');
  writeFileSync(join(outDir, `${slug}.md`), turndown.turndown(tidy).trim() + '\n');

  const status = prev ? 'CHANGED' : 'NEW    ';
  const target = existingIds.has(slug) ? `updates existing write-up '${slug}'` : `new write-up '${slug}'`;
  console.log(`${status}  ${file}  -> .staging/${slug}/ (${n} image${n === 1 ? '' : 's'}; ${target})`);
  for (const m of messages) console.log(`         ${m.type}: ${m.message}`);
}
