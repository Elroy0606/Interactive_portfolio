These are my notes from the TryHackMe room **SOC Metrics and Objectives**, the room after **SOC Workbooks and Lookups** in the SOC Level 1 path. The earlier rooms covered how to triage, report and look up context for a single alert. This one steps back and looks at how a SOC measures whether it is doing its job, and what an L1 analyst can do to improve those numbers.

This is training, not on-the-job SOC experience.

# The goal behind the metrics

A SOC exists to protect the confidentiality, integrity and availability of the organisation's digital assets. It does that by building, receiving and triaging alerts. The L1 analyst's part is to reliably pass the true positives up to L2. The first four metrics all measure how well that process works.

# Four core metrics

```cards
kind: METRICS
AC | Alerts Count | Total number of alerts received. Measures the overall load on the SOC analysts. | Target: about 5 to 30 alerts per day per L1 analyst, depending on company size. Too many (80 waiting at the start of a shift) buries real threats in noise. Too few (a whole week with none) is also a warning sign: the SIEM may be broken or the team may be missing visibility.
FPR | False Positive Rate | False positives / total alerts. Measures how much noise is in the alerts. | 0% is impossible, but 80% or higher is a serious problem: analysts get less vigilant and start treating every alert as more spam. It is usually fixed by tuning tools and detection rules, called false positive remediation. | warn
AER | Alert Escalation Rate | Escalated alerts / total alerts. Measures how experienced and independent the L1 analysts are. | L2 relies on L1 to filter out the noise and only escalate alerts that need action, but L1 should not close alerts they don't fully understand either. The aim is usually below 50%, and better below 20%.
TDR | Threat Detection Rate | Detected threats / total threats. Measures how reliable the SOC team is. | Should always be 100%, because one missed threat can mean ransomware or stolen data. | danger
```

The room's example for TDR: a team faces six attacks in a year. It stops four, misses one because a detection rule was broken, and misses another because an L1 analyst marked the breach as a false positive. That is 4 / 6 = 67%, which is a very bad result.

# Speed: the SLA metrics

An alert alone doesn't stop a breach. The team has to receive it, triage it and respond before the attacker reaches their goal. These speed requirements are usually written into a **Service Level Agreement (SLA)**, either between an internal SOC and the company's management, or between a managed SOC provider (MSSP) and its customers.

```flow
title: From attack to response
Detect | MTTD (Mean Time to Detect): the average time between the attack and its detection by the SOC tools. Common SLA: 5 minutes.
Acknowledge | MTTA (Mean Time to Acknowledge): the average time before an L1 analyst starts triaging a new alert. Common SLA: 10 minutes.
Respond | MTTR (Mean Time to Respond): the average time from the SOC receiving the alert until the breach is stopped, for example by isolating the device or securing the account. It includes MTTA. Common SLA: 60 minutes.
```

The SLA also sets **SOC team availability**: often Monday to Friday during working hours (8/5), or around the clock (24/7). Different teams may define or calculate these metrics differently, depending on what they want to measure.

# Improving the metrics

Why should an L1 analyst care? Metrics exist to make the SOC more efficient, so attacks succeed less often. They are also often used to judge an analyst's own performance, and good results lead toward more senior roles such as L2.

The room's reference table of common problems and fixes:

```scenarios
False positive rate over 80% | The team gets too much noise. Exclude trusted activity, such as system updates, from the EDR or SIEM detection rules, and consider automating triage of the most common alerts with SOAR or custom scripts.
MTTD over 30 minutes | Threats are detected late. Ask the SOC engineers to make the detection rules run faster or more often, and check that SIEM logs arrive in real time rather than with a delay.
MTTA over 30 minutes | L1 analysts start triage late. Make sure analysts are notified as soon as a new alert appears, and spread alerts evenly between the analysts on shift.
MTTR over 4 hours | The team can't stop breaches in time. As L1, escalate real threats to L2 as quickly as possible, and make sure the team has documented what to do in different attack scenarios.
```
