These are my notes from the TryHackMe room on **Splunk**, the room I took after **Intro to SIEM** in the SOC Level 1 path. Intro to SIEM explained what a SIEM does in general. This one looks at a real one: Splunk, one of the leading SIEM solutions. Splunk collects, analyzes and correlates network and machine logs in real time.

This is training, not on-the-job SOC experience.

The room covered these learning objectives:

- Understanding the components of Splunk
- Exploring some of the options available in Splunk
- Understanding log ingestion in Splunk
- Ingesting some logs in Splunk and analyzing them

# Splunk components

Splunk has three main components: the **forwarder**, the **indexer** and the **search head**. They work together to help us search and analyze the data.

```flow
title: How data moves through Splunk
Forwarder | Collects the data on the endpoint and sends it to the indexer.
Indexer | Parses and normalizes the data into field-value pairs, categorizes it and stores the results as events.
Search head | Where users search the indexed logs with SPL and get the matching events back.
```

## Splunk Forwarder

The forwarder is a lightweight agent installed on the endpoint you want to monitor. Its main task is to collect the data and send it to the Splunk instance. It does not affect the endpoint's performance, because it takes few resources to run. Some of the key data sources:

```cards
kind: DATA SOURCES
WEB | Web server | Generates web traffic.
WIN | Windows machine | Generates Windows Event Logs, PowerShell and Sysmon data.
LNX | Linux host | Generates host-centric logs.
DB | Database | Generates DB connection requests, responses and errors.
```

The forwarder collects the data from these log sources and sends it to the Splunk indexer.

## Splunk Indexer

The indexer plays the main role in processing the data it receives from the forwarder. It parses and normalizes the data into field-value pairs, categorizes it, and stores the results as events, which makes the processed data easy to search and analyze.

The data that the indexer has normalized and stored can then be searched from the search head.

## Search Head

The search head is the place inside the **Search & Reporting** app where users search the indexed logs. Searches are written in **SPL** (Search Processing Language), a powerful query language for searching indexed data. When a user runs a search, the request is sent to the indexer, and the relevant events come back as field-value pairs.

# The Splunk home screen

When you open Splunk, you land on the default **home screen**. The room went through it one section at a time:

```cards
kind: HOME SCREEN
BAR | Splunk Bar | The top panel. Holds Messages (system-level notifications), Settings (configure the Splunk instance), Activity (progress of search jobs and processes), Help (tutorials and documentation) and Find (search across the app). | The Splunk Bar also lets you switch between installed Splunk apps without using the Apps panel.
APP | Apps panel | Shows the apps installed on the Splunk instance. | The default app for every Splunk installation is Search & Reporting.
EXP | Explore Splunk | Quick links to add data to the Splunk instance, add new Splunk apps, and open the Splunk documentation.
DSH | Home dashboard | Empty by default. You can pick one of the dashboards already available in the instance, from the dropdown menu or the dashboards listing page. | Dashboards you create can be added here too, and are listed separately under the Yours tab.
```

# Adding data

Splunk can ingest any data. According to the Splunk documentation, when data is added to Splunk, it is processed and transformed into a series of individual events. The data sources can be event logs, website logs, firewall logs and so on, and they are grouped into categories in the documentation.

# My first SPL searches

The room had me ingest a sample set of VPN logs and answer questions about them. These are the searches I wrote. I replaced the specific user name and IP addresses from the sample data with placeholders.

Count every event in the VPN logs:

```text
index=VPN_Logs
| stats count
```

Count the events for one user:

```text
index=VPN_Logs
| spath
| search UserName="<user>"
| stats count
```

List the user names seen from one source IP, with a count:

```text
index=VPN_Logs
| spath
| search Source_ip="<source-ip>"
| stats values(UserName) as UserName count
```

Count the events that did not come from France:

```text
index=VPN_Logs
| spath
| search Source_Country!="France"
| stats count
```

Count the events from another source IP:

```text
index=VPN_Logs
| spath
| search Source_ip="<source-ip>"
| stats count
```

# What I took away

SPL is its own language, and I will need more practice before I am fast with these searches. It is not hard, just new, so I need to put in more time with it. Using Splunk itself is pretty straightforward.
