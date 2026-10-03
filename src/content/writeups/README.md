# Reports and write-ups

Report files for Sector 04. This is the "upload" folder: there is no upload form on the site.

## Add a report

1. **Check the file.** It must not contain addresses, subnets, hardware identifiers, an email address, a phone number, or the name of any company or person. Screenshots count. Strip the file's metadata.
2. **Drop it in this folder.**
   - `.md` is rendered as a styled article.
   - `.pdf` is shown in an embedded viewer with a download button.
   - Images used by a Markdown report go in this folder too: `![what it shows](file-name.png)`, or in a sub-folder named after the report: `![what it shows](my-report/file-name.png)`.
3. **Add one entry** to `src/data/writeups.js` (every field is explained at the top of that file) and set `privacyChecked: true`.
4. Redeploy.

Everything in this folder is deployed with the site, even while `privacyChecked` is false. Only put a file here once it is clean.

This README is not published.
