These are my notes from the TryHackMe room **SOC L1 Alert Reporting**, the room after **SOC L1 Alert Triage** in the SOC Level 1 path. Triage decides whether an alert is a real threat. This room covers what happens next: writing up the investigation, escalating to L2, and communicating with other teams. The practice tasks run in a simulated SOC dashboard.

This is training, not on-the-job SOC experience.

# Why this room mattered to me

In the previous room I struggled to write a report. This room teaches how to write one, which was the first gap I listed at the end of my triage notes.

# Where an alert goes after triage

L1 analysts receive alerts in a SIEM, an EDR or a ticketing platform. Most are closed as false positives or handled at L1. The complex and threatening ones go to L2, who remediate most breaches. Moving an alert along depends on three things:

| Term | What it means |
| --- | --- |
| **Reporting** | Documenting the investigation before closing the alert or passing it on. For true positives that need escalation, a short comment is not enough: the report should include all relevant evidence. |
| **Escalation** | Handing a true positive that needs more action or deeper investigation to L2, following the team's procedure. The report gives L2 the context so they don't start the analysis from scratch. |
| **Communication** | Contacting other departments during or after the analysis, for example asking IT to confirm that a user was really granted admin rights, or asking HR about a new employee. |

# Writing the report: the five Ws

Write for the person who reads it next: an L2 analyst, a DFIR responder or someone in IT. The room recommends covering at least the five Ws:

| W | What it answers |
| --- | --- |
| **Who** | Which user logged in, ran the command or downloaded the file |
| **What** | The exact action or sequence of events |
| **When** | When the suspicious activity started and ended |
| **Where** | Which device, IP address or website was involved |
| **Why** | The reasoning behind the final verdict. This is the most important one |

The room's example of a good report met five checks, which I use as a checklist:

- All five Ws are included.
- The report is clear and precise.
- It reads as a single timeline.
- Evidence and indicators are attached.
- The reason for escalating to L2 is explained.

# When to escalate

Every team has its own rules, but these fit most SOCs. Escalate when:

1. The alert points to a major attack that needs deeper investigation or DFIR.
2. Remediation is needed, such as removing malware, isolating a host or resetting a password.
3. Someone outside the SOC has to be contacted: customers, partners, management or law enforcement.
4. You don't fully understand the alert and need help from a more senior analyst.

# How escalation works

In most teams, escalating means **reassigning the alert to the L2 on shift** and pinging them in the team chat or in person. Some teams require a formal written escalation request with many required fields instead.

Either way, L2 reads the report and comes back with questions. Then they research the alert further, confirm whether it is really a true positive, talk to other departments if needed and, for major incidents, start a formal incident response.

The room's example of an escalation flow:

1. L1 messages L2 with a short summary of what happened and a link to the alert.
2. L2 acknowledges it and starts investigating right away.
3. L2 starts incident response with the DFIR team.
4. L2 contacts team managers so the legal and PR teams are brought in.

Asking L2 for help is normal, especially in the first months. It is better to discuss an alert and clarify the procedure than to close an alert you don't understand.

# Communication when things go wrong

Ideally the SOC has its own **crisis communication** procedures. Without them, the room suggests how to handle these cases:

| Situation | What to do |
| --- | --- |
| An urgent, critical alert needs escalating, but L2 hasn't responded for 30 minutes | Know where the emergency contacts are. Call L2, then L3, then your manager. |
| A Slack or Teams account may be compromised and the login has to be checked with the user | Don't contact the user through the breached chat. Use another channel, such as a phone call. |
| A flood of alerts arrives in a short time, some of them critical | Prioritise them according to the workflow, and tell the L2 on shift what is happening. |
| Days later you realise you misclassified an alert and likely missed something malicious | Tell your L2 immediately and explain your concerns. Attackers can stay quiet for weeks before they act. |
| Triage can't be finished because SIEM logs aren't parsed or aren't searchable | Don't skip the alert. Investigate what you can and report the problem to the L2 on shift or a SOC engineer. |

# What I'm still working on

I'm still not confident using the five Ws, but I now understand the format a report should follow so that the L2 analyst at the next stage knows what is needed.
