These are my notes from the TryHackMe room **Intro to EDR**, the room after **SOC Metrics and Objectives** in the SOC Level 1 path. The earlier rooms were about handling alerts in general. This one looks at one of the main tools those alerts come from: Endpoint Detection and Response (EDR), which watches what happens on the endpoints themselves.

This is training, not on-the-job SOC experience.

# What EDR is

Most security controls protect the network the devices sit on. With remote work, a lot of laptops spend their time outside that perimeter. An EDR is a security solution that sits on each endpoint and keeps monitoring it wherever it is, so threats are detected even when the device is off the company network.

The room named a few EDR products as examples: CrowdStrike Falcon, Symantec EDR, SentinelOne and Microsoft Defender for Endpoint. Their architecture is mostly similar; the features vary.

An EDR rests on three pillars:

```cards
kind: PILLARS
VIS | Visibility | Collects detailed data from the endpoint: process, registry, file and folder changes, user actions and more, and presents it in a structured way. | The analyst can see the whole process tree with a timeline of what happened, and can go back through an endpoint's history for threat hunting. Every detection arrives with its full context.
DET | Detection | Combines signature-based detection with behaviour-based detection, such as unexpected user activity. | Machine learning flags deviations from the baseline, it can detect fileless malware that lives only in memory, and custom IOCs can be fed in. Detections are mapped to MITRE ATT&CK tactics and techniques.
RSP | Response | Lets the analyst act on a detection from the central console. | Isolate an endpoint, terminate a process, quarantine files, or connect to the host remotely and run commands. | ok
```

One limit to remember: an EDR is a host-only solution. It does not detect network-level threats.

# Why antivirus is not enough

The room's analogy is an airport. The antivirus (AV) is the immigration check: it compares each passport against a list of known criminals and stops a match. Someone with no record walks straight through, even if they are a trained thief.

The EDR is the security officers inside the airport, watching the cameras and motion sensors. They notice someone wandering near restricted areas, behaving oddly or leaving a bag unattended, and they can act or alert management with the full details.

In short, AV mostly matches signatures of known threats. EDR records and monitors behaviour, and it gives organisation-wide visibility: if a suspicious file is found on one endpoint, the EDR can check for it on all the others.

The room walked through a phishing attack step by step to show the difference:

```flow
title: The attack
Phishing email | A user receives a Word document with a malicious macro (VBA script).
Open document | The user downloads and opens it.
Macro runs | The macro runs silently and spawns PowerShell.
Second stage | An obfuscated PowerShell command downloads a second-stage payload.
Injection | The payload is injected into a legitimate svchost.exe.
Remote access | The attacker gains remote access to the system.
```

```scenarios
title: How AV and EDR react at each step
label: AV VS EDR
Phishing email | AV: does nothing if the file has no known signature. EDR: logs the download and keeps monitoring the file.
Document opened | AV: does nothing, because winword.exe is a legitimate program. EDR: records winword.exe running and keeps watching.
Macro spawns PowerShell | AV: does nothing if the macro has no known signature. EDR: flags it, because Word starting PowerShell is an unusual parent-child relationship.
Obfuscated PowerShell | AV: usually does not detect obfuscated scripts. EDR: flags the obfuscated script execution.
Injection into svchost.exe | AV: misses it, because it does not monitor memory injection. EDR: detects the process injection.
Remote access | AV: has no network-level visibility. EDR: flags svchost.exe making an unexpected outbound connection.
Final result | AV: may mark the whole thing as clean. EDR: raises one alert with the full attack chain, and the analyst can respond from inside the EDR.
```

Some modern AVs have better visibility than this, but EDR still goes further on detection and response.

# How an EDR works

```flow
title: From endpoint to alert
Agent | An EDR agent (also called a sensor) is installed on each endpoint. It watches all activity and sends it to the console in real time. It can also run basic signature and behaviour detections itself.
Console | The central console correlates the data from all agents using detection logic, machine learning and threat intelligence. It connects the dots.
Alert | When the dots connect into something suspicious, the result is a detection, usually called an alert.
```

# Telemetry

The data the agents send is called **telemetry**. The room described it as the black box of the endpoint: everything needed for detection and investigation. Most endpoint activity is legitimate, so the more data the EDR has, the better it can tell normal from malicious.

```cards
kind: TELEMETRY
PROC | Process executions and terminations | Tracks running and idle processes. | Helps spot suspicious parent-child relationships, suspicious executables starting processes, and malware payloads.
NET | Network connections | Monitors every connection the endpoint makes. | Helps spot connections to a C2 server, unusual ports, data exfiltration and lateral movement.
CMD | Command line activity | Captures commands run in CMD, PowerShell and so on. | Catches malicious and obfuscated commands that a traditional AV often misses.
FILE | File and folder changes | Tracks files and folders being changed. | Attackers touch files when staging data, running ransomware or dropping malicious files.
REG | Registry changes | Monitors changes to the Windows registry. | The registry holds a lot of system configuration, and many attacks change it.
```

Advanced attackers try to stay quiet by using legitimate tools, so each action can look harmless on its own. Seen together in detailed telemetry, they tell a different story. The same telemetry helps the analyst understand the full chain of events, find the root cause and rebuild the attack timeline.

# Detection techniques

```cards
kind: DETECTION
BEH | Behavioural detection | Looks at what a file or process actually does instead of only matching signatures. | Example: winword.exe spawning powershell.exe is flagged, because a Word document starting PowerShell is an unusual parent-child relationship.
ANOM | Anomaly detection | Learns each endpoint's normal baseline over time and flags anything that deviates from it. | This can create false positives, but the context the EDR gives helps the analyst decide. Example: a process changes an auto-start registry key, which is not normal on that endpoint. | warn
IOC | IOC matching | Compares activity with threat intelligence feeds. Apart from zero-days, most attacks have published indicators. | Example: a downloaded file drops an executable whose hash is known from a specific attack, so it is flagged straight away.
ATT&CK | MITRE ATT&CK mapping | Every flagged activity is mapped to the MITRE tactic and technique it belongs to. | Example: creating a scheduled task maps to the tactic Persistence and the technique Scheduled Task/Job.
ML | Machine learning | Models trained on large sets of normal and malicious behaviour recognise complex attack patterns. | Catches attacks where no single step is malicious but the whole chain is, such as fileless attacks and multi-stage intrusions.
```

Here is the process tree from the behavioural detection example:

```proctree
winword.exe | Word opens the attachment
  powershell.exe | Word starting PowerShell is the unusual parent-child relationship | !
```

# Response actions

An EDR supports automatic responses (policies that block known malicious behaviour) and manual ones taken by the analyst.

```scenarios
Isolate host | Cut the endpoint off from the network. Most attacks start on one endpoint and move laterally, so isolating it in time contains the attack.
Terminate process | Used when isolating would hurt more than help, for example on a host that runs core business operations. Killing the malicious process can be enough. Do it carefully: ending a legitimate process can disrupt the endpoint.
Quarantine | Move a malicious file to an isolated location where it can't run. The analyst can then review it and restore or delete it.
Remote access | Open a shell on the endpoint from the console when the built-in actions are not enough, to look deeper, run scripts or collect data. The room's example was CrowdStrike's Real Time Response (RTR) console.
Artefact collection | Pull data off the endpoint for forensics or legal reporting without touching the device. Common artefacts: memory dumps, event logs, specific folder contents and registry hives.
```
