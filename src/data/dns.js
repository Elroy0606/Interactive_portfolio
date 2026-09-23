// Sample domains for the simulated Pi-hole. All traffic and counters are fake;
// this data only drives the visualization.

export const ALLOWED_DOMAINS = [
  'google.com',
  'github.com',
  'wikipedia.org',
  'cloudflare.com',
  'stackoverflow.com',
  'youtube.com',
  'reddit.com',
  'microsoft.com',
  'proxmox.com',
  'archlinux.org',
];

export const BLOCKED_DOMAINS = [
  'adserver.com',
  'ads.tracker.net',
  'doubleclick.net',
  'googleadservices.com',
  'telemetry.adnet.io',
  'pixel.trackco.com',
  'banner.adcdn.net',
];

// The single query that loops through the filter visual, in order.
export const FLOW_SAMPLES = [
  { domain: 'google.com', blocked: false },
  { domain: 'adserver.com', blocked: true },
  { domain: 'github.com', blocked: false },
  { domain: 'ads.tracker.net', blocked: true },
  { domain: 'wikipedia.org', blocked: false },
  { domain: 'doubleclick.net', blocked: true },
];

// Domains shown crossed-out next to the gate.
export const BLOCKLIST_PREVIEW = ['adserver.com', 'ads.tracker.net'];
