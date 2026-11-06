# Visual blocks for write-ups

A fenced code block in a Markdown report whose language is one of the names
below is drawn as a diagram instead of as code. The text inside stays plain and
readable in the `.md` file.

Format: optional `key: value` settings first (`title`, `caption`, plus the keys
a block lists), then one row per line with cells split by ` | `. Blank lines are
ignored. A block with no rows falls back to a normal code block.

Colours come from tokens only. Packets on links move in Night only; in Dim and
Day and with reduced motion the diagrams are static.

| Block | Rows | Notes |
| --- | --- | --- |
| `flow` | `Step | text` | Numbered steps, left to right from md, stacked on phones |
| `cards` / `tools` | `BADGE | full name | body | note | tone?` | Badge cards; `note` opens as an accordion. `kind:` sets the FIG label |
| `alert` | `Field | value | explanation?` | Mock SIEM alert. Settings `severity`, `status`, `verdict`. With explanations, numbered callouts |
| `severity` | `Critical | note?` | Priority ladder in the Sector 03 SEVERITY colours, first row picked first |
| `fivews` | `Who | answer | key?` | Five tiles; `key` marks the most important one |
| `timeline` | `08:00 | event | tone? live?` | Vertical timeline; `live` adds a blinking LED |
| `netpath` | `Zone | text | attacker/breach/blocked/target` | Attack path; a `blocked` row hangs off the zone before it as a dead end. Roles only, no addresses |
| `workflow` | `Step | text` or `? Question | YES: a | NO: b` | Flowchart with a decision split |
| `scenarios` | `Situation | what to do` | Accordion, first item open |
| `verdict` | `False positive | reasoning` | Verdict stamp; colour from the wording |
| `proctree` | `name.exe | note | !` | Process tree, two spaces of indent per level, `!` = suspicious. Only for trees that are in my own notes |

Tones: `accent info ok warn danger critical magenta violet blue`.

To add a block: create the component here (props `{ meta, rows }`), register it
in `index.js`, add any new setting key to `META` in `parse.js`, and add a row to
this table.
