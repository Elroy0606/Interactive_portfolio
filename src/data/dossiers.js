// Sector 03: DOSSIER_ARCHIVE::BUNGE_OPS
//
// !! SAMPLE CONTENT !!  Every report below is a placeholder write-up on a common
// vulnerability class with a redacted target. They are NOT real findings.
// To publish real work:
//   * set `pdf: '/reports/<file>.pdf'` (file in /public/reports/) and the viewer
//     embeds that PDF instead of the built-in document, or edit the text fields;
//   * add `placeholder: false` to the entry, which removes the
//     "SAMPLE_DOCUMENT" stamp from the viewer;
//   * only publish reports the program has cleared for public disclosure.

export const ARCHIVE = {
  code: 'DOSSIER_ARCHIVE::BUNGE_OPS',
  blurb:
    'Vulnerability disclosure and bug-bounty write-ups, filed as classified dossiers. Hover a folder to peek inside; click to open the archive.',
};

export const SEVERITY = {
  CRITICAL: { color: '#ff2e97' },
  HIGH: { color: '#ff3b5c' },
  MEDIUM: { color: '#ffb700' },
  LOW: { color: '#00ff66' },
  INFO: { color: '#00f0ff' },
};

const addDays = (iso, n) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

// Standard disclosure timeline derived from the submission date.
const timeline = (date, { triage = 2, fix = 14, verify = 21 } = {}) => [
  [date, 'Report submitted to the program'],
  [addDays(date, triage), 'Triaged and severity confirmed'],
  [addDays(date, fix), 'Fix deployed by the vendor'],
  [addDays(date, verify), 'Fix verified, report closed'],
];

// `placeholder` is on by default so nothing sample ships un-stamped.
const sample = (r) => ({ placeholder: true, pdf: null, asset: '[REDACTED_ASSET]', status: 'RESOLVED', ...r });

export const DOSSIERS = [
  {
    id: 'dossier_01',
    code: 'DOSSIER_01',
    title: 'WEB_APPLICATION',
    blurb: 'Client-side and input-handling flaws in web front ends.',
    clearance: 'L3',
    accent: '#00f0ff',
    reports: [
      sample({
        id: 'rpt-001',
        file: 'RPT-001_stored-xss.pdf',
        title: 'Stored XSS in a user-content field',
        severity: 'HIGH',
        cvss: '7.1',
        cwe: 'CWE-79',
        date: '2026-01-14',
        summary:
          'A free-text field accepted markup that was stored and later rendered unescaped to other users, allowing script execution in their sessions.',
        details: [
          'User-supplied content from an authenticated form was saved without output encoding. When another user (including staff) opened the page that displayed it, the stored markup was interpreted by the browser instead of shown as text.',
          'The issue is scoped to the display of that field; input validation elsewhere on the form behaved correctly.',
        ],
        steps: [
          'Sign in with a standard test account.',
          'Submit the form with a harmless marker string containing an HTML tag in the affected field.',
          'Open the record from a second test account and observe the tag rendered as markup rather than text.',
          'Confirm the same behaviour on reload, proving it is persisted.',
        ],
        impact: [
          'Script execution in the context of any user who views the record, enabling session-scoped actions on their behalf.',
          'Higher exposure when the viewer is a privileged user.',
        ],
        remediation: [
          'Contextually encode all user-controlled data on output.',
          'Add a restrictive Content-Security-Policy to limit inline script execution.',
          'Sanitize rich-text input with an allow-list if markup must be supported.',
        ],
        timeline: timeline('2026-01-14'),
      }),
      sample({
        id: 'rpt-002',
        file: 'RPT-002_reflected-xss.pdf',
        title: 'Reflected XSS via search parameter',
        severity: 'MEDIUM',
        cvss: '6.1',
        cwe: 'CWE-79',
        date: '2026-02-03',
        summary: 'A query-string parameter was echoed into the results page without encoding, enabling reflected script execution via a crafted link.',
        details: [
          'The search term was reflected inside the page body. Special characters were not encoded, so a crafted URL could inject markup that executes when a victim opens the link.',
        ],
        steps: [
          'Open the search page and submit a benign marker containing angle brackets.',
          'Inspect the response and note the characters returned unencoded.',
          'Verify that a crafted link reproduces the behaviour without any stored state.',
        ],
        impact: ['Requires user interaction (clicking a link), but can be used for phishing-style session abuse on the trusted domain.'],
        remediation: ['Encode reflected values for the HTML context.', 'Validate the parameter against an expected character set.'],
        timeline: timeline('2026-02-03', { fix: 10, verify: 16 }),
      }),
      sample({
        id: 'rpt-003',
        file: 'RPT-003_open-redirect.pdf',
        title: 'Open redirect in login return URL',
        severity: 'LOW',
        cvss: '4.7',
        cwe: 'CWE-601',
        date: '2026-02-19',
        summary: 'The post-login redirect parameter accepted arbitrary external URLs, which can lend credibility to phishing links.',
        details: [
          'After authentication the application redirected to whatever address was given in a return-URL parameter, without checking that it belonged to the same site.',
        ],
        steps: [
          'Visit the login page with the return parameter set to an external test address.',
          'Authenticate and observe the browser being redirected off-site.',
        ],
        impact: ['Assists phishing by chaining a trusted-domain link to an attacker-controlled page. No direct data exposure.'],
        remediation: ['Allow only relative paths or an allow-list of hosts for redirect targets.', 'Reject or ignore unexpected schemes.'],
        timeline: timeline('2026-02-19', { triage: 3, fix: 20, verify: 27 }),
      }),
    ],
  },
  {
    id: 'dossier_02',
    code: 'DOSSIER_02',
    title: 'API_&_ACCESS_CONTROL',
    blurb: 'Authorization, rate-limiting and cross-origin issues in APIs.',
    clearance: 'L4',
    accent: '#ffb700',
    reports: [
      sample({
        id: 'rpt-004',
        file: 'RPT-004_idor.pdf',
        title: 'IDOR exposing other users’ records',
        severity: 'HIGH',
        cvss: '7.5',
        cwe: 'CWE-639',
        date: '2026-03-08',
        summary: 'An API returned records for any sequential identifier without checking that the requester owned them.',
        details: [
          'The endpoint authenticated the caller but authorised the object by identifier alone. Changing the identifier in the request returned data belonging to other accounts.',
        ],
        steps: [
          'Authenticate with two separate test accounts (A and B).',
          'As account A, request one of its own records and note the identifier format.',
          'Request a record belonging to account B using its identifier while authenticated as A.',
          'Observe that the response succeeds instead of returning an authorisation error.',
        ],
        impact: ['Unauthorised read access to other users’ data, scalable by iterating over predictable identifiers.'],
        remediation: [
          'Enforce object-level authorisation on every request.',
          'Use unpredictable identifiers as defence in depth, not as the control.',
          'Add automated tests for cross-account access.',
        ],
        timeline: timeline('2026-03-08', { triage: 1, fix: 9, verify: 15 }),
      }),
      sample({
        id: 'rpt-005',
        file: 'RPT-005_rate-limiting.pdf',
        title: 'Missing rate limiting on authentication',
        severity: 'MEDIUM',
        cvss: '5.3',
        cwe: 'CWE-307',
        date: '2026-03-27',
        summary: 'The login endpoint accepted unlimited attempts, making credential-guessing and stuffing practical.',
        details: ['Repeated failed sign-in attempts against a test account produced no lockout, delay, or challenge across a bounded, low-volume test.'],
        steps: [
          'Attempt a small, capped number of failed sign-ins against a dedicated test account.',
          'Note the absence of throttling, lockout or CAPTCHA and consistent response timing.',
        ],
        impact: ['Increases the feasibility of password guessing and credential-stuffing against real accounts.'],
        remediation: ['Apply per-account and per-IP throttling.', 'Add progressive delays or a challenge after repeated failures.', 'Alert on anomalous failure rates.'],
        timeline: timeline('2026-03-27', { fix: 18, verify: 25 }),
      }),
      sample({
        id: 'rpt-006',
        file: 'RPT-006_cors.pdf',
        title: 'Overly permissive CORS on an authenticated API',
        severity: 'MEDIUM',
        cvss: '5.4',
        cwe: 'CWE-942',
        date: '2026-04-11',
        summary: 'The API reflected arbitrary origins and allowed credentials, letting other sites read authenticated responses.',
        details: ['The Access-Control-Allow-Origin header echoed the request origin while credentials were permitted, negating the same-origin policy for that API.'],
        steps: [
          'Send a request with a test Origin header from an unrelated domain.',
          'Observe the origin reflected back together with credentials being allowed.',
        ],
        impact: ['A malicious page could read a signed-in visitor’s API data from their browser.'],
        remediation: ['Use a strict allow-list of trusted origins.', 'Never combine wildcard or reflected origins with credentials.'],
        timeline: timeline('2026-04-11', { fix: 12, verify: 19 }),
      }),
    ],
  },
  {
    id: 'dossier_03',
    code: 'DOSSIER_03',
    title: 'INFRA_&_EXPOSURE',
    blurb: 'Exposed services, information leaks and DNS hygiene.',
    clearance: 'L5',
    accent: '#00ff66',
    reports: [
      sample({
        id: 'rpt-007',
        file: 'RPT-007_exposed-admin.pdf',
        title: 'Exposed admin interface without authentication',
        severity: 'CRITICAL',
        cvss: '9.1',
        cwe: 'CWE-306',
        date: '2026-05-06',
        summary: 'An administrative interface was reachable from the internet with no authentication in front of it.',
        details: [
          'A management panel intended for internal use was published on a public host. Requests to it were served without any login, exposing configuration and administrative functions.',
          'Testing was limited to confirming reachability and read-only views; no changes were made.',
        ],
        steps: [
          'Identify the host during reconnaissance of the in-scope asset list.',
          'Request the panel path without credentials and observe the interface load.',
          'Stop at confirmation and report immediately.',
        ],
        impact: ['Potential full administrative control of the affected service and disclosure of sensitive configuration.'],
        remediation: ['Remove the panel from public exposure or place it behind VPN / SSO.', 'Require authentication and MFA for all admin paths.', 'Rotate any secrets that were visible.'],
        timeline: timeline('2026-05-06', { triage: 1, fix: 3, verify: 7 }),
      }),
      sample({
        id: 'rpt-008',
        file: 'RPT-008_verbose-errors.pdf',
        title: 'Verbose errors leaking stack traces',
        severity: 'LOW',
        cvss: '3.7',
        cwe: 'CWE-209',
        date: '2026-05-21',
        summary: 'Malformed requests returned full stack traces, revealing framework versions and internal paths.',
        details: ['Sending an invalid value produced a debug-style error page with file paths, library versions and query fragments.'],
        steps: ['Send a request with an intentionally malformed parameter.', 'Observe the detailed error response.'],
        impact: ['Information disclosure that helps an attacker fingerprint the stack and plan further attacks.'],
        remediation: ['Disable debug output in production.', 'Return generic errors to clients and log details server-side.'],
        timeline: timeline('2026-05-21', { fix: 8, verify: 13 }),
      }),
      sample({
        id: 'rpt-009',
        file: 'RPT-009_subdomain-takeover.pdf',
        title: 'Dangling DNS record enabling subdomain takeover',
        severity: 'HIGH',
        cvss: '7.4',
        cwe: 'CWE-284',
        date: '2026-06-09',
        summary: 'A subdomain still pointed at a deprovisioned third-party service that could be claimed by anyone.',
        details: ['A DNS record referenced a cloud resource that no longer existed. The provider allowed new accounts to claim that name, which would serve content under the trusted subdomain.'],
        steps: [
          'Enumerate subdomains for the in-scope domain.',
          'Identify a record resolving to an unclaimed resource (provider “not found” page).',
          'Report without claiming the resource.',
        ],
        impact: ['Content served from a trusted domain, enabling phishing and, where cookies are scoped broadly, session theft.'],
        remediation: ['Remove dangling DNS records when services are decommissioned.', 'Inventory DNS against live assets on a schedule.'],
        timeline: timeline('2026-06-09', { triage: 2, fix: 5, verify: 12 }),
      }),
    ],
  },
];

export const getDossier = (id) => DOSSIERS.find((d) => d.id === id);
export const getReport = (id) => DOSSIERS.flatMap((d) => d.reports).find((r) => r.id === id);
export const REPORT_COUNT = DOSSIERS.reduce((n, d) => n + d.reports.length, 0);
