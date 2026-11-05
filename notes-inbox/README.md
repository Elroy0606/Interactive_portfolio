# notes-inbox

Drop study notes here as `.docx` (Google Docs: File > Download > Microsoft Word). The file name sets
the write-up id, e.g. `soc-l1-alert-triage.docx` updates the existing `soc-l1-alert-triage` write-up.

1. `npm run notes` converts new or changed files into `.staging/<id>/` (Markdown + images).
   Files already listed in `imported.json` with the same content are skipped.
2. The draft is reviewed (privacy rule in CLAUDE.md: no addresses, hostnames, emails, names) and
   copied into `src/content/writeups/` with an entry in `src/data/writeups.js`.
3. `npm run notes -- --mark <file.docx> <id>` records the file as published.

This folder is outside `src/`, so nothing here is bundled into the site. The `.docx` files and
`.staging/` are git-ignored; only `imported.json` and this README are committed.
