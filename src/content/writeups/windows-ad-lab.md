I wanted to understand Active Directory properly, not just know the terms. The best way I know to learn something is to build it, so I designed and built a complete small-business Windows network in my home lab, from an empty hypervisor to working logons, policies, remote access and backups.

This write-up walks through how I planned it, the order I built it in, and the problems I had to solve along the way.

# What I set out to build

I pictured a small company with a handful of staff and asked what IT would need to give them:

- **One identity for everyone.** Each person signs in with a single domain account on any company machine.
- **Central control.** Settings like mapped drives, folder locations and printers are pushed out by policy, not set up by hand on each PC.
- **Shared files with the right access.** A folder everyone can use, and a folder only one team can open.
- **Remote work.** Staff can reach a work desktop from outside the office.
- **Safe browsing.** Unwanted website categories are blocked at the network edge.
- **Recovery.** If a file is deleted or a server dies, it can be brought back.

Then I added rules for myself: keep the lab isolated from my home network, open only what is needed, and prove every feature works by testing it as a normal user, not just as the administrator.

# Architecture

![Network diagram: home network on top, Sophos Firewall in the middle, isolated lab network with five machines below](windows-ad-lab/network-diagram.svg)

The design has two networks with a firewall between them. My home network is the "outside". The lab network is fully isolated: its only route anywhere is through the firewall. That gave me a realistic boundary to secure and test against.

| Machine | Role |
| --- | --- |
| Proxmox VE host | Hypervisor that runs everything, with one external and one isolated virtual network |
| Sophos Firewall | Gateway between the two networks: NAT, DHCP, firewall rules, web filtering |
| DC01 | Domain controller: Active Directory, DNS, file server and print server |
| RD01 | Remote Desktop server that users connect to from outside |
| VEEAM01 | Backup server, deliberately kept out of the domain |
| Veeam worker | Small helper VM that reads the VM disks during backups |
| WIN11 | Windows 11 client where I tested everything as a normal user |

Only three kinds of traffic are allowed to cross the firewall:

1. Lab machines going out to the internet for name lookups and web traffic only.
2. Remote Desktop coming in from my home network, forwarded to RD01 and nowhere else.
3. The backup server and its worker reaching the Proxmox host on its management ports.

Everything else is dropped.

## Working with 16 GB of RAM

My host has 16 GB of RAM, which is not enough to run every server at once. Instead of cutting features, I planned which machines each stage needed and powered the rest off. For example, I backed up two servers while they were shut down so the backup server had enough memory to work. Planning around a hard limit turned out to be a useful skill in itself.

# Phase 1: The foundation

I started with the platform. Proxmox got two virtual bridges: `vmbr0` connected to my home network, and `vmbr1` with no physical port at all, so anything on it is isolated by design.

![Proxmox network settings showing vmbr0 attached to the physical network card and vmbr1 with no port](windows-ad-lab/proxmox-network.webp)

*vmbr0 is bridged to the real network card. vmbr1 has no port, so it is a private network inside the host.*

![Proxmox guest list showing the lab machines](windows-ad-lab/proxmox-guests.webp)

*The lab machines on the host. Other personal guests are hidden.*

All Windows VMs use the same template: UEFI, TPM 2.0, SATA disks and an Intel network card, which kept the installs predictable.

# Phase 2: The firewall comes first

I built the firewall before any Windows server, because every other machine depends on it for its gateway and addresses. Sophos Firewall sits on both networks: one interface on the home network and one on the lab network.

![Sophos setup summary: internet on Port2 by DHCP, local network on Port1, default network policy created](windows-ad-lab/sophos-setup-summary.webp)

*The initial firewall setup: internet on one port, the lab on the other.*

![Sophos interfaces page with Port1 as the lab side and Port2 as the internet side](windows-ad-lab/sophos-interfaces.webp)

*The two interfaces in use. Addresses are hidden.*

The firewall also hands out addresses to lab clients over DHCP and points them at the domain controller for DNS. For outbound traffic I started strict: lab machines can only reach DNS, HTTP and HTTPS on the internet.

![Sophos rule from the lab zone to the internet zone allowing only DNS, HTTP and HTTPS](windows-ad-lab/sophos-outbound-rule.webp)

*Outbound traffic is limited to the services the lab actually needs.*

A side effect I had to plan for: the lab cannot reach internet time servers, so the domain controller became the time source for every other machine.

# Phase 3: Building the domain

With the network ready, I installed Windows Server 2025 on DC01, gave it a fixed address and added the Active Directory Domain Services role.

![Server Manager showing the AD DS role installed and asking to promote the server](windows-ad-lab/adds-role-installed.webp)

*The role installs first. The server only becomes a domain controller once it is promoted.*

I then promoted it to a domain controller for a new forest, `lab.local`, with DNS on the same server.

![Configuration wizard result: the server was successfully configured as a domain controller](windows-ad-lab/dc-promoted.webp)

*DC01 promoted to the first domain controller of lab.local.*

Before joining anything to the domain I fixed one thing that catches a lot of people: time. The new VMs started up about two hours off, and Kerberos refuses logons when clocks differ by more than five minutes. Correcting the clocks first saved me from confusing join errors later.

## Users, groups and structure

I created organizational units to keep things tidy: **Lab Users** for accounts and **Lab Computers** for workstations. Then I added four test users and one security group.

![PowerShell listing the Avengers group members and all enabled users](windows-ad-lab/users-and-group.webp)

*Tony, Steve and Bruce are in the Avengers group. Thanos is deliberately left out so I can prove access is denied.*

Having one user outside the group was a design choice. Every permission I set up later is tested twice: once with someone who should get in, and once with someone who should not.

Finally, I joined the Windows 11 client to the domain and checked its trust relationship with the domain controller.

![PowerShell on WIN11: Test-ComputerSecureChannel returns True](windows-ad-lab/win11-secure-channel.webp)

*WIN11's secure channel to the domain is healthy.*

# Phase 4: Central control with Group Policy

With users in place, I moved to the part that makes a domain worth having: managing every machine from one place. I linked my policies to the Lab Users OU so they follow the user to any computer.

![Group Policy Management showing GPOs linked to the Lab Users OU](windows-ad-lab/gpos-linked.webp)

*Policies linked to the Lab Users OU.*

## Folder redirection

I wanted users' Documents folders to live on the server instead of the local PC, so files survive a broken laptop and follow the user. A policy redirects Documents to a hidden share, with a separate folder created for each user.

![GPO report showing Documents redirected to a per-user folder on the server](windows-ad-lab/folder-redirection-gpo.webp)

*Each user's Documents goes to their own folder on the server.*

Permissions here need care. Users must be able to create their own folder, but must not be able to read anyone else's.

![Share permissions for the redirected folder share](windows-ad-lab/redirected-share-permissions.webp)

*Share permissions on the redirection share.*

![NTFS permissions where Authenticated Users have access to this folder only](windows-ad-lab/redirected-ntfs-permissions.webp)

*NTFS permissions: users can create their own folder at the top level, and nothing more.*

![Server folder showing a separate folder for each user who has signed in](windows-ad-lab/redirected-user-folders.webp)

*On the server, each user who has signed in now has their own folder.*

![Documents properties on WIN11 showing the location on the server](windows-ad-lab/win11-documents-location.webp)

*From tony's side, Documents now lives on the server.*

## Mapped drives with targeting

I wanted two drives: a **Company** drive for everyone and an **Avengers** drive only for that team. Rather than two policies, I used one policy with item-level targeting, so the second drive only maps for members of the group.

![Drive Maps in Group Policy listing the S: Company drive and the V: Avengers drive](windows-ad-lab/drive-maps.webp)

*Two drive maps in one policy.*

![Targeting Editor: the V: drive only applies when the user is a member of the Avengers group](windows-ad-lab/drive-targeting.webp)

*The rule that limits the V: drive to the Avengers group.*

![File Explorer for thanos showing only the Company drive](windows-ad-lab/thanos-drives.webp)

*Thanos gets the Company drive only, which is exactly what should happen.*

# Phase 5: File services and permissions

Mapping a drive is not the same as securing it. Hiding the V: drive from Thanos means nothing if he can still type the path in by hand, so the real protection is in the folder and share permissions. I granted access to the **group**, never to individual users, so adding or removing someone is a single membership change.

![NTFS permissions on the Avengers folder granting Modify to the Avengers group](windows-ad-lab/avengers-ntfs-permissions.webp)

*NTFS permissions: administrators, SYSTEM and the Avengers group. No entry for ordinary users.*

![Share permissions on the Avengers share](windows-ad-lab/avengers-share-permissions.webp)

*Share permissions on the Avengers share.*

Then I tested it the way an attacker or a curious user would: going straight to the path.

![PowerShell as thanos: listing the Avengers share returns Access is denied](windows-ad-lab/thanos-share-denied.webp)

*Thanos tries the share directly and is denied.*

## Recovering mistakes with Shadow Copies

Backups are for disasters, but most real recovery requests are small: "I overwrote my file". I enabled Shadow Copies on the data volume so users can roll back a file themselves from Previous Versions.

![Shadow Copies enabled on the data volume with a snapshot taken](windows-ad-lab/shadow-copies-enabled.webp)

*Shadow Copies enabled on the data volume.*

To test it, I signed in as tony, wrote a file, took a snapshot, then overwrote it.

![The original contents of the test file](windows-ad-lab/file-original.webp)

*Before.*

![The same file with its contents rewritten](windows-ad-lab/file-overwritten.webp)

*After the "mistake".*

![Previous Versions confirming the file was restored](windows-ad-lab/file-restored.webp)

*Restored from Previous Versions, without an administrator.*

![Previous Versions restoring the whole folder to an earlier snapshot](windows-ad-lab/folder-restored.webp)

*The same works for a whole folder.*

# Phase 6: Print services

I had no physical printer, so I designed around that. A third-party PDF printer was flagged by Windows Security as a potentially unwanted app, and the built-in Microsoft Print to PDF cannot be shared. The working answer was a printer using the built-in Generic / Text Only driver, writing to a file on the server. It behaves like a real shared printer: it has a queue, jobs and owners.

![PowerShell installing the Print Server role](windows-ad-lab/print-role-installed.webp)

*Print Server role installed on DC01.*

I shared it and deployed it with a Group Policy Preferences item, so users get it automatically.

![Group Policy printer item connecting the shared printer for users](windows-ad-lab/printer-gpo.webp)

*The policy that connects the printer for every user.*

To prove the whole chain worked, I paused the queue on the server, printed from Notepad as tony, and checked who the job belonged to.

![Print Management with the queue paused and one job owned by Tony](windows-ad-lab/print-queue.webp)

*Tony's job, held in the paused queue on the server.*

![Get-Printer on WIN11 showing the printer connected from the server](windows-ad-lab/tony-printer.webp)

*On tony's side, the printer arrived by policy. He never added it.*

# Phase 7: Remote access

For remote work I installed Remote Desktop Services on its own server, RD01, using the Quick Start deployment (Session Host, Connection Broker and Web Access on one server). The session collection only allows the Avengers group.

![Session collection properties limited to the Avengers group](windows-ad-lab/rds-collection-group.webp)

*Only the Avengers group can use the remote desktops.*

The harder part was reaching it from outside. On the firewall I used a destination NAT rule to forward Remote Desktop traffic arriving on the outside interface to RD01, and a firewall rule to decide who is allowed through.

![Sophos NAT rules including the rule that forwards Remote Desktop to RD01](windows-ad-lab/nat-rules.webp)

*The NAT rule that forwards incoming Remote Desktop to RD01.*

![Sophos firewall rules with the Remote Desktop rule restricted by zone, network and service](windows-ad-lab/firewall-rules.webp)

*The Remote Desktop rule: only from my home network, only to RD01, only on the Remote Desktop port.*

Then I tested it from my laptop on the home network, outside the lab, as two different users.

![Tony's remote session showing hostname RD01 and whoami lab\tony](windows-ad-lab/tony-remote-session.webp)

*Tony connects from outside and lands on RD01.*

![Server view listing Tony's active session on RD01](windows-ad-lab/rds-sessions.webp)

*The server sees tony's session.*

![Remote Desktop error: the user account is not authorized for remote login](windows-ad-lab/thanos-rds-denied.webp)

*Thanos is refused.*

# Phase 8: Web filtering

To block unwanted sites at the edge, I created a Sophos web policy that blocks the gambling category and attached it to the outbound firewall rule. Attaching it to the rule is the step that makes it take effect.

![Sophos web policy blocking Games and Gambling](windows-ad-lab/web-policy.webp)

*The web policy.*

![Outbound firewall rule with the web policy applied](windows-ad-lab/web-policy-on-rule.webp)

*The policy attached to the lab's outbound rule.*

![Sophos block page in the browser on WIN11](windows-ad-lab/block-page.webp)

*What a user sees when they try a blocked site.*

![Firewall web log with the blocked request marked Denied between allowed requests](windows-ad-lab/web-filter-log.webp)

*The block, recorded in the firewall log.*

# Phase 9: Backups I can actually restore

A backup only counts if you have restored from it, so I treated restore as part of the build, not an afterthought.

I installed Veeam Backup & Replication Community Edition on a dedicated server, VEEAM01, and deliberately kept it out of the domain. Then I added a firewall rule that lets only the backup server and its worker reach the Proxmox host, on its management ports only.

![PowerShell on VEEAM01 confirming it can reach the Proxmox host on the management ports](windows-ad-lab/veeam-proxmox-ports.webp)

*The backup server reaching the Proxmox host through the firewall, on the two ports it needs.*

Veeam backs up Proxmox VMs through a small worker VM that runs on the host. I gave it a fixed address on the lab network and trimmed it to 2 vCPUs and 2 GB of RAM to fit my host.

![Veeam worker test log with every step successful](windows-ad-lab/veeam-worker-test.webp)

*The worker passing its test.*

![Veeam backup repository on a dedicated 60 GB data volume](windows-ad-lab/veeam-repository.webp)

*Backups go to a dedicated 60 GB volume on VEEAM01, separate from its system disk.*

I backed up the domain controller and the Remote Desktop server in one job.

![Veeam job finished: 2 of 2 VMs successful, 153 GB processed, 47.6 GB read, 29.3 GB transferred](windows-ad-lab/veeam-job-result.webp)

*Both servers backed up successfully.*

| Result | Value |
| --- | --- |
| VMs backed up | 2 of 2, no warnings or errors |
| Time | 17 minutes 44 seconds |
| Disk processed | 153 GB |
| Data read | 47.6 GB |
| Stored after compression | 29.3 GB |

Then the real test. I opened the domain controller's backup, browsed into the Company share and restored a single file, without restoring the whole server.

![Veeam Backup Browser showing the domain controller's drives inside the backup](windows-ad-lab/veeam-backup-browser.webp)

*Browsing inside the domain controller's backup.*

![Veeam restore of a file from the Company share completed successfully](windows-ad-lab/veeam-restore-complete.webp)

*A single file restored from the backup.*

# Problems I hit and how I solved them

Most of what I learned came from things going wrong. These are the ones worth telling.

| Problem | How I found the cause | Fix |
| --- | --- | --- |
| The Remote Desktop firewall rule matched no traffic at all | Opened the rule up, then tightened it one field at a time, testing after each change. The source "home network" object was defined as a single address, not a whole network. | Recreated it as a proper network object. Every field then passed. |
| VMs shut down on their own | The Proxmox kernel log showed the host killing VMs when it ran out of memory. | Planned RAM per phase, powered off what wasn't needed, and trimmed the domain controller to 3 GB. |
| Domain joins and logons failing | New VMs started about two hours off, and internet time was blocked by design. | Fixed clocks before joining, and made the domain controller the time source. |
| The domain controller sometimes came up on the "Public" network profile | Checked the network profile in PowerShell after reboots. | Restarted the Network Location Awareness service. |
| The Veeam installer reported a failure | The Windows event log showed Veeam services timing out at the default 30-second start limit on a low-memory VM. The install had actually succeeded. | Raised the Windows service start timeout to 5 minutes and gave the VM more CPU. |
| The Veeam worker test timed out | The test log showed the worker on my home network, outside the firewall. | Moved it to the lab network. |
| The worker test failed again | The log showed a DHCP address that my firewall rule did not cover. | Gave the worker its planned fixed address. The test passed. |
| Veeam refused to restore to a local folder | Veeam 13 does not allow restoring to the backup server's own disk. | Shared a folder and restored to its network path. |
| No way to share a PDF printer | One option was flagged by Windows Security; the built-in one cannot be shared. | Used a generic text printer that writes to a file. |

The pattern I took away: read the log before guessing. In almost every case, the event log, the firewall log or the Veeam test log named the real cause in one line.

# Design decisions

**Remote Desktop runs on its own server, not on the domain controller.** Windows would let me install both on one machine, but Microsoft recommends against it. A Remote Desktop server is where ordinary users log in and run programs, and the domain controller holds every account in the domain. Keeping them apart means normal users never sit on the most important server, and the machine I exposed to the outside is not the domain controller.

**The backup server is not joined to the domain.** VEEAM01 has its own local administrator account. If someone stole a domain admin password, it would not unlock the backups. A separate server also means that if the domain controller fails, the tool I need to restore it is still standing.

**Every firewall rule is as narrow as I could make it.** Each rule names its source, destination and port. Remote Desktop is allowed from one network to one server on one port. The backup rule lets two machines reach one machine on two ports.

**Permissions are given to groups, never to individual users.** Access changes become membership changes, which are easier to manage and easier to audit.

**Every feature is tested from both sides.** For each permission I tested a user who should get in and a user who should not. A test that only proves access works says nothing about whether access is restricted.

# What I would change for a real company

This is a single-host lab with 16 GB of RAM, so some things are simpler than they should be in production:

- **Two domain controllers, not one**, so logons and DNS survive a failure.
- **Separate file and print servers** instead of putting those roles on the domain controller.
- **Backups on separate storage, plus an off-site copy.** Mine sit on the same physical machine they protect.
- **Scheduled backups of running servers** instead of backing up servers while they are shut down.
- **Certificates from an internal certificate authority** instead of accepting self-signed ones.
- **The NAT rule limited to Remote Desktop as well.** Right now the firewall rule enforces that, but tightening both would be cleaner.

# What I took away

I came into this knowing what Active Directory was. I came out knowing how the pieces depend on each other: why DNS has to be right before anything joins, why time matters to Kerberos, why a hidden drive is not a secured drive, and why a backup is only real once you have restored from it.

**Skills used:** Active Directory Domain Services, DNS, Group Policy and Group Policy Preferences, item-level targeting, NTFS and share permissions, Shadow Copies, print services, Remote Desktop Services, Sophos Firewall (NAT, firewall rules, DHCP, web filtering), Veeam Backup & Replication, Proxmox VE, PowerShell, and a lot of log reading.
