These are my notes from the TryHackMe room **SOC Workbooks and Lookups**, the room after **SOC L1 Alert Triage** and **SOC L1 Alert Reporting** in the SOC Level 1 path. Triage often needs more context about the employee or server in an alert. This room covers where an L1 analyst finds that context (identity and asset inventories, network diagrams) and how workbooks keep the investigation steps consistent. The practice tasks ran in an interactive workflow builder.

This is training, not on-the-job SOC experience. The people, servers and addresses in the scenarios were made up for the lab, so I describe them by role here.

# Why context matters

The room opens with a night-shift alert: a user logs into a finance file server, downloads a 2024 financial report and shares it with a colleague. Before you can call that safe or suspicious, you need answers to questions like these:

- Who is the user? What is their role, and what are their normal working hours?
- What is the server for, where is it, and who is allowed to access it?
- Why would the colleague need the company's financial records?

# Lookup 1: identity and asset inventory

I worked through the questions using the lab's identity and asset inventories:

| Question | What I found |
| --- | --- |
| Who is the user? | The company's **Chief Financial Officer**. The inventory listed their role but not their working hours, so I couldn't check that part. |
| What is the server? | A **file server in the UK datacenter** that stores the company's financial records. |
| Who received the file? | The company's **US Financial Adviser**, so a US financial report going to them fits their job. |

```verdict
Legitimate activity | Both people hold finance roles, and sharing this file is within those roles.
```

# Lookup 2: network diagrams

In bigger companies you also need to read an alert from the network's point of view. The second scenario was a chain of firewall alerts:

```timeline
08:00 | An external IP repeatedly connects to the corporate firewall on port TCP/10443 | warn
08:23 | Firewall logs show that external IP being translated to an internal address | warn
08:25 | The internal address scans one internal network range and finds no open ports | danger
08:32 | It moves on to scan a second range, and the activity is still going | danger live
```

The IPs alone don't tell you much. A **network diagram**, a map of the company's locations, subnets and how they connect, answers the questions: what runs on port 10443, which subnet the internal address belongs to, and what those scanned ranges are. With the diagram, the attack path becomes clear:

```netpath
Internet | The attacker brute-forced the company VPN, which was the service listening on port 10443. | attacker
VPN subnet | After logging in, they were assigned an address from the VPN subnet. | breach
Database subnet | They tried to scan the database subnet, but the firewall rules likely blocked them. | blocked
Office subnet | Getting nowhere, they moved on to the office subnet to look for their next target. | target
```

Diagrams in real companies can be far more complex, but the job they do for an analyst is the same: they give meaning to suspicious network activity.

# SOC workbooks

Lookups give you context, but you still need to reach a verdict, and some alerts take dozens of steps. Missing one can mean missing evidence. That is what workbooks are for.

A **SOC workbook** (also called a playbook, runbook or workflow) is a structured document that lists the steps for investigating and remediating a specific kind of threat, so it's done efficiently and the same way every time. L1 analysts are junior and aren't expected to triage every attack perfectly, so senior analysts write workbooks to support them. L1s are encouraged, and sometimes required, to follow them exactly.

What I took from seeing one: a workbook is also how a team helps new analysts ease into the job. The workflow itself is straightforward. The hard part is understanding what the information you look up actually means, and whether it adds up to a true positive or a false positive.

# Practice: building workflows

The final task had three scenarios: **email analysis**, **PowerShell analysis** and **network analysis**. All three followed the same basic workflow:

```workflow
Take ownership | Assign the alert to yourself.
Investigate | Work it, using the lookups above.
? Is it serious, or are you not sure? | YES: Escalate to L2 | NO: Close it as a false positive
```

It took me a few tries to get this right. The lesson was the order: assign the alert to yourself first, then work it, then hand it on or close it.

# What I'm still working on

- **Reading the context correctly.** Following the workbook was easy. Knowing what the information I found means, and turning it into a confident true or false positive verdict, is the part I need more practice on.
- **Gaps in the data.** In the first scenario the inventory had no working hours. I want a better sense of what to do when a lookup doesn't have the answer.
