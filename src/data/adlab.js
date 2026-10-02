import {
  Archive,
  DatabaseBackup,
  FolderLock,
  FolderSync,
  Globe,
  History,
  Laptop,
  Layers,
  Monitor,
  MonitorUp,
  Network,
  Printer,
  Server,
  ShieldCheck,
  ShieldX,
  Users,
  Workflow,
} from 'lucide-react';

// Sector 01 > WINDOWS_AD_LAB: content for the Windows Server / Active Directory
// lab sub-view (components/adlab/AdLabSubView.jsx).
//
// Unlike services.js this is REAL content from the lab, not template copy.
// PRIVACY: networks are named by role only. Never add addresses, subnets,
// hardware identifiers or home-network details to this file.

const CYAN = '#00f0ff';
const GREEN = '#00ff66';
const AMBER = '#ffb700';
const VIOLET = '#a78bfa';

export const ZONES = {
  external: { label: 'HOME NETWORK (EXTERNAL)', short: 'Home network (external)' },
  gateway: { label: 'GATEWAY', short: 'Between the two networks' },
  internal: { label: 'LAB NETWORK (INTERNAL, ISOLATED)', short: 'Lab network (internal, isolated)' },
};

// Traffic paths drawn on the diagram. `traces` are the TraceLayer ids that
// belong to the path (the backup path has two legs: VEEAM01 and its worker).
export const FLOWS = [
  {
    id: 'web',
    accent: GREEN,
    label: 'LAB → INTERNET',
    rule: 'DNS, HTTP and HTTPS only',
    detail: 'Web and name-resolution traffic only. Everything else is blocked.',
    traces: ['web'],
  },
  {
    id: 'rdp',
    accent: CYAN,
    label: 'LAPTOP → RD01',
    rule: 'Remote Desktop only',
    detail: 'Allowed from my home network only, forwarded through the firewall (DNAT).',
    traces: ['rdp'],
  },
  {
    id: 'backup',
    accent: VIOLET,
    label: 'VEEAM01 + WORKER → PROXMOX HOST',
    rule: 'Management ports only',
    detail: 'So the backup jobs can reach the hypervisor.',
    traces: ['backup', 'backup-w'],
  },
];

// `flows` lists the FLOWS a node takes part in (used for highlighting).
export const NODES = [
  {
    id: 'laptop',
    zone: 'external',
    name: 'MY_LAPTOP',
    tag: 'Outside test client',
    icon: Laptop,
    accent: CYAN,
    flows: ['rdp'],
    role: 'My laptop on the home network. I used it as the outside test client.',
    configured: [
      'Used it to test Remote Desktop to RD01 from outside the lab.',
      'It can only reach RD01, and only over Remote Desktop, through the firewall DNAT rule.',
    ],
  },
  {
    id: 'internet',
    zone: 'external',
    name: 'INTERNET',
    tag: 'Web and name resolution',
    icon: Globe,
    accent: CYAN,
    flows: ['web'],
    role: 'Where the lab’s web and name-resolution traffic ends up.',
    configured: [
      'Lab machines can reach it for DNS, HTTP and HTTPS only.',
      'A web policy blocks the gambling category on the way out.',
    ],
  },
  {
    id: 'pve',
    zone: 'external',
    name: 'PROXMOX_VE_HOST',
    tag: 'Hypervisor · 16 GB RAM',
    icon: Server,
    accent: CYAN,
    flows: ['backup'],
    role: 'The hypervisor that runs every lab VM. 16 GB RAM and two virtual bridges: one external, one isolated.',
    configured: [
      'Created an external bridge and an isolated internal bridge for the lab.',
      'Added it to Veeam so the lab servers can be backed up.',
      'Budgeted RAM per task and powered off VMs that were not in use.',
      'The lab sheet specified Hyper-V. I used Proxmox VE as the equivalent.',
    ],
  },
  {
    id: 'fw',
    zone: 'gateway',
    name: 'SOPHOS_FIREWALL',
    tag: 'Only route in or out of the lab',
    icon: ShieldCheck,
    accent: AMBER,
    flows: ['web', 'rdp', 'backup'],
    role: 'Default gateway for the lab: NAT, DHCP, web filtering and firewall rules. It is the only route in or out.',
    configured: [
      'Limited outbound traffic to named services.',
      'Scoped each rule to specific sources, destinations and ports.',
      'Published Remote Desktop with a DNAT rule restricted to one source network and one port.',
      'Added a web policy that blocks the gambling category, and checked it with the block page and the firewall log.',
    ],
  },
  {
    id: 'rd01',
    zone: 'internal',
    name: 'RD01',
    tag: 'Remote Desktop Services',
    icon: MonitorUp,
    accent: GREEN,
    flows: ['rdp'],
    role: 'Remote Desktop Services: Session Host, Connection Broker and Web Access.',
    configured: [
      'Deployed RDS on its own server, separate from the domain controller.',
      'Limited access to one security group.',
      'Tested both ways: a group member could sign in, a non-member was denied.',
      'Backed up by Veeam.',
    ],
  },
  {
    id: 'dc01',
    zone: 'internal',
    name: 'DC01',
    tag: 'AD DS · DNS · File · Print',
    icon: Network,
    accent: GREEN,
    flows: ['web'],
    role: 'Active Directory Domain Services, DNS, file server and print server for lab.local.',
    configured: [
      'Windows Server 2025 domain controller for lab.local, with DNS.',
      'OUs, security groups and fictional test users (tony, bruce, steve, thanos).',
      'Group Policy for folder redirection, mapped drives and the shared printer.',
      'Group-based share and NTFS permissions, plus shadow copies on the data volume.',
      'Clients sync their time from it.',
    ],
  },
  {
    id: 'win11',
    zone: 'internal',
    name: 'WIN11',
    tag: 'Domain-joined client',
    icon: Monitor,
    accent: GREEN,
    flows: ['web'],
    role: 'Domain-joined Windows 11 client. I used it to test everything as standard users.',
    configured: [
      'Corrected the clock, then joined it to lab.local.',
      'Signed in as standard users to check the redirected folders, mapped drives, printer and share permissions.',
    ],
  },
  {
    id: 'veeam01',
    zone: 'internal',
    name: 'VEEAM01',
    tag: 'Backup server · workgroup',
    icon: DatabaseBackup,
    accent: GREEN,
    flows: ['backup'],
    role: 'Veeam Backup & Replication Community Edition. Kept in a workgroup, not joined to the domain.',
    configured: [
      'Added the Proxmox host and deployed a worker VM.',
      'Backed up DC01 and RD01, then restored a single file from the backup.',
      'Raised the Windows service start timeout so the Veeam services could start on a low-memory VM.',
    ],
  },
  {
    id: 'worker',
    zone: 'internal',
    name: 'VEEAM_WORKER',
    tag: 'Backup proxy VM',
    icon: Workflow,
    accent: GREEN,
    flows: ['backup'],
    role: 'Backup proxy VM that runs only during backup jobs.',
    configured: [
      'Deployed from Veeam.',
      'Moved it onto the lab network, behind the firewall.',
      'Gave it a static address so the firewall rule covers it.',
    ],
  },
];

export const getNode = (id) => NODES.find((n) => n.id === id);
export const nodesIn = (zone) => NODES.filter((n) => n.zone === zone);

// Lab sheet progress. Shown as counts only: the sheet's task order is not recorded here.
export const TASKS = { total: 14, handsOn: 11, study: 2, notCompleted: 1, notCompletedName: 'Microsoft 365' };

export const BUILT = [
  {
    title: 'Hypervisor and networks',
    icon: Layers,
    text: 'I set up Proxmox VE with two virtual bridges: an external one, and an isolated internal one for the lab.',
  },
  {
    title: 'Domain',
    icon: Network,
    text: 'I built a Windows Server 2025 domain controller for lab.local, with DNS, and joined a Windows 11 client to the domain.',
  },
  {
    title: 'Remote Desktop Services',
    icon: MonitorUp,
    text: 'I deployed RDS on a separate server and limited it to one security group. I published it to the outside through a firewall DNAT rule restricted to one source network and one port. A group member could sign in; a non-member was denied.',
  },
  {
    title: 'Backups',
    icon: DatabaseBackup,
    text: 'I installed Veeam Backup & Replication on a dedicated workgroup server, added the Proxmox host and deployed a worker VM. I backed up the domain controller and the RDS server, then restored a single file from the backup.',
    stats: [
      ['DISK PROCESSED', '153 GB'],
      ['STORED AFTER COMPRESSION', '29.3 GB'],
      ['JOB TIME', 'about 18 min'],
    ],
  },
  {
    title: 'Firewall',
    icon: ShieldCheck,
    text: 'Sophos Firewall is the lab gateway. I limited outbound traffic to named services and scoped each rule to specific sources, destinations and ports.',
  },
  {
    title: 'Web filtering',
    icon: ShieldX,
    text: 'I added a web policy that blocks the gambling category, and verified it with the block page and the firewall log.',
  },
  {
    title: 'Folder redirection',
    icon: FolderSync,
    text: 'Users’ Documents folders are redirected to the file server by Group Policy.',
  },
  {
    title: 'OUs and mapped drives',
    icon: Users,
    text: 'One drive is mapped for all users and one only for a security group, using item-level targeting in a single GPO.',
  },
  {
    title: 'Print server',
    icon: Printer,
    text: 'I shared a virtual printer, deployed it to users by Group Policy, and tested it from a standard user account.',
  },
  {
    title: 'File share permissions',
    icon: FolderLock,
    text: 'Group-based share and NTFS permissions, proven both ways: a member was allowed and a non-member was denied.',
  },
  {
    title: 'Shadow copies',
    icon: History,
    text: 'I enabled shadow copies on the data volume, then restored an overwritten file and a whole folder from previous versions.',
  },
];

export const DECISIONS = [
  {
    title: 'RDS on its own server',
    icon: MonitorUp,
    text: 'RDS runs on its own server, not on the domain controller. Ordinary users never log on to the machine that holds every account, and the server exposed to the outside is not the domain controller.',
  },
  {
    title: 'Backup server outside the domain',
    icon: Archive,
    text: 'The backup server is kept out of the domain, so a stolen domain admin password does not unlock the backups.',
  },
  {
    title: 'Narrow firewall rules',
    icon: ShieldCheck,
    text: 'The firewall rules are as narrow as I could make them: a named source, a named destination and a named port.',
  },
];

// `evidence` is optional: not every problem had a log line that gave it away.
export const TROUBLE = [
  {
    title: 'A firewall rule that matched nothing',
    symptom: 'A restricted firewall rule matched no traffic.',
    evidence: 'I opened the rule up, then tightened one field at a time and re-tested after each change.',
    fix: 'The cause was a host object defined as a single address instead of a whole network.',
  },
  {
    title: 'VMs shutting down by themselves',
    symptom: 'VMs kept shutting down by themselves.',
    evidence: 'The host kernel log showed out-of-memory kills.',
    fix: 'I budgeted RAM per task and powered off VMs that were not in use.',
  },
  {
    title: 'Wrong clock on new VMs',
    symptom: 'New Windows VMs started with the wrong clock, which breaks domain logons.',
    fix: 'I corrected the time before joining them to the domain and had clients sync from the domain controller.',
  },
  {
    title: 'Veeam installer reported a failure',
    symptom: 'The Veeam installer reported a failure.',
    evidence: 'The event log showed services timing out at the default 30-second start limit on a low-memory VM.',
    fix: 'I raised the Windows service start timeout and the services came up.',
  },
  {
    title: 'Veeam worker test failed twice',
    symptom: 'The Veeam worker test failed, twice, for two different reasons.',
    evidence: 'The test log’s “address obtained” line pointed to the cause both times. First the worker was attached to the wrong network, outside the firewall. Then it had picked up a DHCP address the firewall rule did not cover.',
    fix: 'A static address fixed it.',
  },
  {
    title: 'No shareable PDF printer',
    symptom: 'A shared PDF printer was not possible.',
    evidence: 'One option was flagged by Windows Security, and the built-in one cannot be shared.',
    fix: 'I used a generic text driver writing to a file instead.',
  },
];

export const LIMITS = [
  'A single host with limited RAM.',
  'One domain controller.',
  'Backups are stored on the same physical machine as the servers they protect.',
  'Evaluation licences.',
  'A virtual printer, not a real one.',
];

export const IN_PRODUCTION = [
  'Add a second domain controller.',
  'Keep backups on separate hardware, with a copy off-site.',
  'Use enough memory, or more than one host, so nothing has to be powered off to make room.',
  'Put Remote Desktop behind a VPN or an RD Gateway instead of forwarding it directly.',
  'Use proper licences and a real printer with its own driver.',
];

export const TAGS = [
  'Windows Server 2025',
  'Active Directory',
  'DNS',
  'Group Policy',
  'Remote Desktop Services',
  'Sophos Firewall',
  'NAT and firewall rules',
  'Web filtering',
  'Veeam Backup & Replication',
  'Proxmox VE',
  'PowerShell',
  'File and print services',
  'Troubleshooting',
];
