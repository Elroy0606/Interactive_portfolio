These are my notes from the TryHackMe room **SOC L1 Alert Triage**, part of the SOC Level 1 path. The room covers what an alert is, how it is generated, what its fields mean, and how an L1 analyst decides which alert to pick up first. The practice tasks ran in a simulated SOC dashboard inside the TryHackMe SIEM.

This is training, not on-the-job SOC experience. I'm publishing it to show what I learned and where I still have questions.

# From events to alerts

An alert starts as an ordinary event, such as a user login, a process launch or a file download. The pipeline looks like this:

```flow
Event | Something happens on a system.
Log | The system that saw it (the operating system, a firewall, a cloud provider) records it.
Collection | The logs are shipped to a security solution such as a SIEM or EDR.
Detection | A rule matches a specific event or sequence of events and the solution raises an alert.
```

A SOC can receive millions of log lines a day from thousands of systems, and almost all of them are expected activity. Alerts exist so analysts don't have to read raw logs. They highlight only the suspicious or unusual events, so a team triages dozens of alerts a day instead of millions of lines.

# Where alerts are managed

```tools
kind: TOOLS
SIEM | Security Information and Event Management | Collects and analyses logs from devices, firewalls and servers across the network | Strong alert management; the right choice for most SOC teams
EDR | Endpoint Detection and Response | Runs on workstations, servers and laptops, watches endpoint activity and can isolate a compromised host | Has its own alert dashboard, but teams usually prefer to work alerts in a SIEM or SOAR
NDR | Network Detection and Response | Analyses network traffic for suspicious patterns, lateral movement and data exfiltration | Same as EDR: it has its own alert dashboard, but teams usually prefer to work alerts in a SIEM or SOAR
SOAR | Security Orchestration, Automation and Response | Connects security tools and runs automated playbooks for repetitive triage steps | Larger teams use it to pull alerts from many tools into one place
XDR | Extended Detection and Response | Correlates endpoint, network, cloud and email data in one platform | Cross-domain visibility
ITSM | IT Service Management | Ticketing for logging, assigning and tracking incidents to resolution | Some teams run alerts through a dedicated ticketing setup
```

# What alert triage is

Alert triage is the first look at an alert: reviewing, analysing and prioritising it to decide whether it is a real threat (**true positive**) or noise (**false positive**). The L1 analyst checks the context in the alert, such as IP addresses, file hashes, user accounts and process details, to answer one question: *is this a real attack that needs action now, or benign activity that can be closed?*

Why it matters to the SOC:

- **It cuts noise and prevents alert fatigue.** Security tools raise thousands of alerts. Triage separates the ones that need action so analysts aren't buried in false alarms.
- **It puts critical threats first.** Something like active ransomware or an unexpected domain admin login gets escalated right away. A low-risk configuration warning waits its turn.
- **It shortens dwell time and MTTR.** Faster triage lowers the Mean Time to Respond and the time an attacker stays inside the network before being found.
- **It starts incident response.** Once triage confirms a true positive, the alert is documented, given a severity and escalated to L2/L3 analysts or incident responders for containment.

# Alert properties

Every SIEM lays alerts out differently, but the same core fields show up everywhere.

```alert
title: Anatomy of an alert
Alert time | Event at 15:32, alert at 15:35 | When the alert was created. Usually a few minutes after the event itself.
Alert name | Unusual Login Location, Windows RDP Bruteforce, Potential Data Exfiltration | A summary of what happened, taken from the detection rule's name.
Severity | Low, Medium, High, Critical | How urgent it is. Set by detection engineers, can be changed by the analyst.
Status | New, In Progress, Closed (plus custom statuses) | Whether someone is working on it or triage is done.
Verdict | True Positive, False Positive (plus custom verdicts) | Also called classification: real threat or noise.
Assignee | Sometimes called the alert owner | The analyst who owns the alert and is responsible for it.
Description | Usually three short sections | What the rule detects, why it can mean an attack, and sometimes how to triage it.
Fields | Affected hostname, command line, and more depending on the alert | The values the alert fired on, plus analyst comments.
```

The detail I'll remember: **alert time is not event time.** When building a timeline, use the event time.

# Picking the right alert

Each SOC sets its own prioritisation rules and usually builds them into the SIEM's sorting. The simplest and most common approach has three steps:

```flow
Filter | Only take alerts that are new and unassigned. Don't pick up something a teammate has already reviewed or is working on.
Sort by severity | Critical first, then High, Medium and Low. Detection engineers tune critical rules to be the most likely to be real and the most damaging.
Sort by time | Oldest first. If two alerts are both real breaches, the attacker in the older one has had more time and may already be taking data, while the newer one is probably still exploring.
```

```severity
title: Severity order
caption: Inside each level, the oldest alert comes first.
Critical
High
Medium
Low
```

# Practice: working the queue

In the final task I worked through the whole alert queue in the simulated dashboard. I followed the order above: assigned each alert to myself, then went Critical, High, and finally Low.

The Low alert was the one I spent the most time on. The rule fires on **any download from GitHub**. Its description explained why: GitHub hosts plenty of legitimate projects the IT team relies on, but it also hosts malicious scripts and exploits that users shouldn't download.

What the alert showed:

```alert
title: Download from GitHub
severity: Low
Accessed URL | https://github.com/facebook/react
Source user | A developer account
Source host | An IT team laptop
Source network | The developers' VPN segment
```

My reasoning:

- The URL points to the official React repository, a widely used open-source library, not an exploit or script collection.
- The user and the network both belong to the development team, for whom downloading React is normal work.
- Nothing in the alert pointed to a malicious file.

```verdict
False positive | I closed it.
```

# What I'm still working on

I finished the room, but the GitHub alert showed me where I'm unsure, and I'd rather say so than pretend otherwise:

- **Writing triage comments.** I'm not yet confident about what a good closing comment should contain or how much detail an L2 analyst or auditor expects.
- **Being sure about a false positive.** I reached the right verdict here, but I want a more repeatable way to decide, rather than relying on "it looked fine."
- **How this plays out in a real SOC**, where the context is messier than in a lab and the same rule fires many times a day.

These are what I'm focusing on in the next rooms of the SOC Level 1 path.
