import { Container, Home, Skull, BrainCircuit, ShieldBan } from 'lucide-react';

// NOTE: descriptions/architecture/config values below are TEMPLATE content
// written from the general shape of each service. Edit them to match the real
// lab (VM IDs, RAM/CPU, VLANs, stacks, models) before publishing.
//
// `side` decides which column the node sits in on desktop and which side of the
// rack its blueprint trace leaves from.

export const HOST = {
  name: 'HP_SPECTRE',
  role: 'HYPERVISOR NODE',
  os: 'PROXMOX_VE',
};

export const SERVICES = [
  {
    id: 'docker',
    name: 'DOCKER_CONTAINERS',
    short: 'Containerized service stack',
    slot: 'VM 101',
    icon: Container,
    accent: '#00f0ff',
    drillable: true, // click zooms into DockerSubView instead of opening the Data HUD
    side: 'left',
    load: 34,
    uptime: '99.9%',
    mission:
      'Hosts the always-on self-hosted apps in isolated, reproducible containers, so any service can be rebuilt from a compose file in minutes instead of hand-configured.',
    architecture: [
      'Dedicated Linux VM on Proxmox acts as the Docker host, isolated from the hypervisor itself.',
      'Every app is described as a docker-compose stack kept under version control.',
      'A reverse proxy fronts the web UIs and terminates TLS on the LAN.',
      'Persistent volumes live on host storage and are covered by scheduled Proxmox VM backups.',
    ],
    config: [
      ['GUEST_TYPE', 'QEMU/KVM VM'],
      ['GUEST_OS', 'Debian 12'],
      ['VCPU', '2 cores'],
      ['MEMORY', '4 GB'],
      ['DISK', '40 GB (virtio)'],
      ['NETWORK', 'vmbr0 · bridged'],
    ],
    stack: ['Docker', 'Docker Compose', 'Portainer', 'Reverse Proxy', 'Linux'],
  },
  {
    id: 'haos',
    name: 'HOME_ASSISTANT_OS',
    short: 'Smart-home automation hub',
    slot: 'VM 102',
    icon: Home,
    accent: '#ffb700',
    side: 'right',
    load: 18,
    uptime: '99.8%',
    mission:
      'Central brain of the smart home: unifies lights, sensors and switches under one local-first dashboard and runs automations without depending on the cloud.',
    architecture: [
      'Official Home Assistant OS image runs as its own VM so upgrades and add-ons stay self-contained.',
      'USB radio dongles are passed through from the host for Zigbee/Z-Wave style devices.',
      'Automations, scenes and dashboards are defined declaratively and included in VM snapshots.',
      'Integrates with the container stack (MQTT broker) and local LLM endpoint for voice/intent experiments.',
    ],
    config: [
      ['GUEST_TYPE', 'QEMU/KVM VM'],
      ['GUEST_OS', 'Home Assistant OS'],
      ['VCPU', '2 cores'],
      ['MEMORY', '2 GB'],
      ['DISK', '32 GB (virtio)'],
      ['PASSTHROUGH', 'USB radio dongle'],
    ],
    stack: ['Home Assistant', 'HAOS', 'MQTT', 'YAML Automations', 'USB Passthrough'],
  },
  {
    id: 'kali',
    name: 'KALI_LINUX',
    short: 'Security testing node',
    slot: 'VM 103',
    icon: Skull,
    accent: '#00ff66',
    side: 'left',
    load: 9,
    uptime: 'ON-DEMAND',
    mission:
      'A disposable offensive-security workstation for practicing pentesting, CTFs and validating the hardening of the rest of the lab, kept away from production services.',
    architecture: [
      'Full Kali VM, powered on only when needed and rolled back to a clean snapshot after each engagement.',
      'Attached to an isolated bridge so scans and exploits cannot touch the home network by accident.',
      'Reaches deliberately vulnerable practice targets and the lab services it is authorised to test.',
      'Accessed over SSH / remote desktop from the LAN only.',
    ],
    config: [
      ['GUEST_TYPE', 'QEMU/KVM VM'],
      ['GUEST_OS', 'Kali Linux (rolling)'],
      ['VCPU', '2 cores'],
      ['MEMORY', '4 GB'],
      ['DISK', '60 GB (virtio)'],
      ['NETWORK', 'isolated bridge'],
    ],
    stack: ['Kali Linux', 'Nmap', 'Metasploit', 'Burp Suite', 'Wireshark'],
  },
  {
    id: 'ollama',
    name: 'OLLAMA_LOCAL_LLMS',
    short: 'Local AI model runner',
    slot: 'CT 104',
    icon: BrainCircuit,
    accent: '#ff2e97',
    side: 'right',
    load: 52,
    uptime: '99.5%',
    mission:
      'Runs open-weight language models entirely on-premises, giving private, no-API-key inference for experiments, automation and coding assistance.',
    architecture: [
      'Ollama serves models over a local HTTP API that other lab services can call.',
      'Models are pulled on demand and cached on local storage; quantized variants fit modest hardware.',
      'Requests stay on the LAN, so prompts and data never leave the house.',
      'Consumed by scripts, chat front-ends and Home Assistant integrations.',
    ],
    config: [
      ['GUEST_TYPE', 'LXC / VM'],
      ['RUNTIME', 'Ollama'],
      ['VCPU', '4 cores'],
      ['MEMORY', '8 GB'],
      ['API', ':11434 (LAN only)'],
      ['MODELS', 'quantized open-weight LLMs'],
    ],
    stack: ['Ollama', 'Open-weight LLMs', 'REST API', 'Quantization', 'Python'],
  },
  {
    id: 'pihole',
    name: 'PI-HOLE_DNS',
    short: 'Network-wide ad blocker',
    slot: 'CT 105',
    icon: ShieldBan,
    accent: '#4da3ff',
    drillable: true, // click zooms into PiholeSubView (DNS_TRAFFIC_FLOW::AD_BLOCKING_PIPELINE)
    side: 'right',
    load: 14,
    uptime: '99.9%',
    mission:
      'Acts as the network’s DNS resolver and sinkhole: lookups for known ad, tracker and malware domains are answered with nothing, so they never load on any device and no per-device extension is needed.',
    architecture: [
      'Runs as a lightweight container on Proxmox with a static IP address.',
      'The router (or each device) hands out the Pi-hole as its DNS server, so every client uses it.',
      'Blocklists are pulled on a schedule into the gravity database; allow/deny tweaks are made in the web UI.',
      'Blocked domains are answered with 0.0.0.0; clean queries are forwarded to a privacy-focused upstream resolver such as Quad9.',
    ],
    config: [
      ['GUEST_TYPE', 'LXC / container'],
      ['DNS_PORT', '53 (udp/tcp)'],
      ['WEB_UI', 'http://pi.hole/admin'],
      ['UPSTREAM', 'Quad9 (example)'],
      ['BLOCKLISTS', 'default + custom'],
      ['NETWORK', 'vmbr0 · static IP'],
    ],
    stack: ['Pi-hole', 'DNS', 'FTL (dnsmasq)', 'Gravity Blocklists', 'Quad9'],
  },
];

export const getService = (id) => SERVICES.find((s) => s.id === id);
