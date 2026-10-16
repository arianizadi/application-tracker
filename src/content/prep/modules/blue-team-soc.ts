import type { Module } from "../types";

export const prepModule: Module = {
  id: "blue-team-soc",
  number: 6,
  title: "Investigate Alerts and Handle Incidents",
  hook: "Turn an alert into a supported decision and a useful handoff.",
  hours: 6,
  tracks: ["SOC", "DFIR", "DET"],
  objectives: [
    "Explain SIEM ingestion, normalization, queries, and alerts.",
    "Triage suspicious activity using context and corroboration.",
    "Describe current incident-response guidance.",
    "Document evidence, decisions, and escalation clearly.",
  ],
  lesson: [
    { type: "h", text: "What a SOC and a SIEM actually do" },
    {
      type: "p",
      text: "A **SOC** (security operations center) helps an organization notice, investigate, and respond to security-relevant activity. A **SIEM** collects and searches events from sources such as identity providers, endpoints, applications, firewalls, and cloud services. Its value depends on source quality, time handling, parsing, retention, and detection logic.",
    },
    {
      type: "diagram",
      caption: "Failures anywhere in this chain affect what an analyst can conclude",
      lines: [
        "activity → source event → collected record → normalized fields → detection → analyst investigation",
        "(a login)  (raw log line)  (shipped to SIEM)  (user, src_ip, ...)  (rule fires)  (you)",
      ],
    },
    { type: "h", text: "An alert is a lead, not a verdict" },
    {
      type: "p",
      text: "Start by understanding what triggered the alert, which entities are involved (users, hosts, IPs, files), and what time window matters. Confirm the asset's importance and the account's expected behavior. A successful administrative login may be routine maintenance or a serious incident depending on the source, device, permissions, and surrounding actions. Compare the alert with the original events rather than relying only on its title or severity label.",
    },
    {
      type: "callout",
      tone: "example",
      title: "Reading raw log lines",
      text: "Below are synthetic Linux `sshd` authentication logs (IP addresses come from documentation-only ranges). Read them field by field: timestamp, host, process, outcome, user, and source address.",
    },
    {
      type: "code",
      lang: "text",
      caption: "Many failures for several usernames from one address, then a success for a real account from that same address",
      code: `Oct 16 03:12:41 web01 sshd[2209]: Failed password for invalid user admin from 203.0.113.45 port 51510 ssh2
Oct 16 03:12:43 web01 sshd[2210]: Failed password for invalid user test from 203.0.113.45 port 51512 ssh2
Oct 16 03:12:44 web01 sshd[2211]: Failed password for alice from 203.0.113.45 port 51514 ssh2
Oct 16 03:13:02 web01 sshd[2230]: Accepted password for alice from 203.0.113.45 port 51533 ssh2`,
    },
    {
      type: "list",
      items: [
        "**Observation:** repeated failures for multiple usernames, including ones that do not exist, from 203.0.113.45 within seconds, followed by a successful password login as `alice` from the same address.",
        "**Gap:** the syslog timestamp has no year or time zone. Check the host's configured time zone before building a timeline.",
        "**Next questions:** Is 203.0.113.45 expected for alice? What did the session do after 03:13:02 (commands, new keys added, outbound connections)? Did the same address hit other hosts?",
        "**Interpretation:** consistent with password guessing that succeeded, but not yet proven. Escalate per the playbook because a likely compromise of a real account is involved.",
        "**Shared vocabulary:** in MITRE ATT&CK terms, the failures look like Brute Force: Password Guessing (T1110.001), and a successful login with a real password would be Valid Accounts (T1078). Naming techniques this way helps other teams search for the same behavior.",
      ],
    },
    {
      type: "p",
      text: "On Windows, the equivalent evidence lives in the Security event log. A few event IDs come up constantly: **4624** (successful logon, check the Logon Type, for example 2 interactive, 3 network, 10 RDP), **4625** (failed logon), **4672** (special privileges assigned to a new logon, a sign of an admin-level session), **4688** (process creation, when auditing is enabled), **4720** (user account created), **4732** (member added to a security-enabled local group), and **1102** (audit log cleared).",
    },
    { type: "h", text: "Triage: hypothesize, then try to disprove it" },
    {
      type: "p",
      text: "Triage asks whether activity is expected, suspicious, confirmed harmful, or still unresolved under the team's classification scheme. Correlate authentication records with endpoint execution, network activity, and account changes. Consider clock differences and ingestion delays.",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "Read the rule: what exactly did it detect, and over what window?",
        "Pull the raw events behind the alert.",
        "Identify entities and their context: asset criticality, account role, normal behavior.",
        "Write a hypothesis, such as \"this account was accessed by an unauthorized party.\"",
        "Look for evidence that could *disprove* it, such as a change ticket, a known scanner, or a misconfigured service.",
        "Correlate across sources: identity, endpoint, network, and account changes.",
        "Decide on a disposition, record your confidence, and escalate or close according to the playbook.",
      ],
    },
    {
      type: "p",
      text: "If a pattern could come from a broken service account with an expired password, investigate that explanation instead of treating a failed-login threshold as proof of password spraying.",
    },
    { type: "h", text: "Incident response: current NIST guidance" },
    {
      type: "p",
      text: "Incident response is broader than responding to alerts. **NIST SP 800-61 Rev. 3** (April 2025) replaced Rev. 2 from 2012. It is written as a *CSF 2.0 Community Profile*: instead of a standalone four-phase lifecycle, it places incident response inside the NIST Cybersecurity Framework (CSF) 2.0, so organizational preparation supports operational detection, response, and recovery, with improvement throughout. [Current NIST publication](https://csrc.nist.gov/pubs/sp/800/61/r3/final).",
    },
    {
      type: "diagram",
      caption: "Rev. 3 maps incident response onto the six CSF 2.0 functions",
      lines: [
        "Preparation:          Govern  ·  Identify  ·  Protect",
        "                                   │",
        "                                   ▼",
        "Incident response:    Detect  →  Respond  →  Recover",
        "                                   │",
        "Improvement:          lessons learned from every activity feed back into all six functions",
      ],
    },
    {
      type: "callout",
      tone: "warning",
      title: "Know both vocabularies",
      text: "Interviewers very often ask for \"the incident response lifecycle\" and expect one of two classic answers. The NIST Rev. 2 lifecycle has four phases: **preparation → detection and analysis → containment, eradication, and recovery → post-incident activity**. The SANS model splits the same work into six steps, often remembered as **PICERL**: preparation, identification, containment, eradication, recovery, lessons learned. Know both and use them confidently, then add that NIST's current Rev. 3 reframes this work around CSF 2.0. That one sentence shows you are current without discarding the vocabulary the team uses.",
    },
    {
      type: "p",
      text: "**Containment** limits harm, **eradication** addresses the cause and footholds, and **recovery** restores dependable operation. These activities require authority and business coordination. Isolating a workstation differs from disconnecting a hospital system or disabling a critical service account. Preserve relevant evidence and record decisions while responding. As an intern, know the escalation path and approved actions rather than assume permission to block accounts, delete files, or contact external parties independently.",
    },
    { type: "h", text: "Case notes and handoffs" },
    {
      type: "p",
      text: "Good case notes identify what happened, affected entities, observed times with time zones, supporting evidence, confidence, actions taken, and remaining questions. Preserve raw records and distinguish **event time** from **collection time**. For forensic material, record provenance and handling; hashes support integrity comparisons but do not establish the entire chain of custody.",
    },
    {
      type: "code",
      lang: "text",
      caption: "A compact case-note shape, filled in for the sshd example above",
      code: `Case:        Possible SSH password guessing followed by success on web01
Question:    Did an unauthorized party log in as alice?
Entities:    host web01; user alice; source 203.0.113.45
Timeline:    2026-10-16 03:12:41-03:12:44 (year inferred, host local time, zone to confirm) failed logins
             2026-10-16 03:13:02 accepted password for alice from same source
Evidence:    raw sshd lines attached; source IP not in alice's usual login history
Hypothesis:  account accessed via guessed password (confidence: medium)
Actions:     escalated to on-call lead per playbook; no containment taken by me
Open:        post-login activity? same source against other hosts? is alice's MFA enforced on SSH?`,
    },
    {
      type: "p",
      text: "A concise handoff lets another analyst continue without repeating your work or guessing why a decision was made.",
    },
    { type: "h", text: "Detection quality" },
    {
      type: "p",
      text: "A detection rule needs expected telemetry, a meaningful hypothesis, validation examples, and known benign cases. Reducing noise should preserve useful coverage rather than simply hiding inconvenient alerts. A broad exclusion that silences a false positive can also silence the real attack.",
    },
    {
      type: "callout",
      tone: "interview",
      title: "Say it like this",
      text: "\"I would validate the alert, correlate context, assess impact, document uncertainty, and escalate or act within the playbook. Afterward, I would help improve the detection or procedure based on what we learned.\"",
    },
  ],
  sayItLikeThis:
    "\"I treat an alert as a lead, not a verdict. First I read what the rule actually detected and pull the raw events behind it. Then I identify the user, host, and source involved, check what normal looks like for them, and form a hypothesis that I actively try to disprove, for example by checking for a change ticket or a misconfigured service account. I correlate identity, endpoint, and network data, keeping time zones and ingestion delays in mind. Then I record a disposition with my confidence, escalate within the playbook rather than taking actions I am not authorized for, and write a case note another analyst can pick up. For incident response I know the classic preparation, detection, containment, eradication, recovery, lessons-learned cycle, and that NIST SP 800-61 Rev. 3 now frames it within CSF 2.0.\"",
  terms: [
    { term: "SOC", definition: "Security operations center: the team and processes that monitor, investigate, and respond to security activity." },
    { term: "SIEM", definition: "Platform supporting centralized event collection, search, correlation, detection, and investigation." },
    { term: "Normalization", definition: "Mapping data from different sources into consistent field names and formats." },
    { term: "Triage", definition: "Initial assessment of an alert's significance and the next action." },
    { term: "False positive", definition: "Alert that fires on benign activity." },
    { term: "False negative", definition: "Malicious activity that the detection fails to alert on." },
    { term: "Event vs. incident", definition: "An event is any observed occurrence; an incident meets the organization's criteria for a security situation requiring coordinated response." },
    { term: "Containment", definition: "Action limiting an incident's spread or harm." },
    { term: "Eradication", definition: "Removal of causes and adversary footholds." },
    { term: "Recovery", definition: "Restoration and validation of dependable operations." },
    { term: "Chain of custody", definition: "Documented handling and transfer of evidence from collection onward." },
    { term: "MITRE ATT&CK", definition: "Public knowledge base of adversary tactics and techniques, with IDs such as T1110 (Brute Force), used to describe and map detections to attacker behavior." },
    { term: "Playbook", definition: "Documented procedure describing how to investigate and respond to a given alert or incident type, including who may take which actions." },
  ],
  questions: [
    {
      id: "blue-team-soc-q1",
      question: "What is a SIEM?",
      answer:
        "A SIEM centralizes events and supports searches, correlation, alerts, and investigations. Its effectiveness depends on the logs and detection logic available. It does not automatically establish whether every alert is malicious.",
      checking: "Platform purpose and limits.",
      difficulty: "warmup",
    },
    {
      id: "blue-team-soc-q2",
      question: "How would you triage a suspicious login?",
      answer:
        "First I would look at what makes it suspicious and compare it with that user's normal pattern: source IP and geolocation, device, time of day, and authentication method. I would check whether it followed a burst of failures, whether MFA was satisfied or there were repeated MFA prompts, and whether there is impossible travel from a recent login elsewhere. Then I would look at what happened after the login, such as mailbox rule changes, new MFA devices registered, or unusual file access, and check for a benign explanation like a VPN or travel. I would document what I found and how confident I am, and escalate per the playbook, which might lead to a password reset and session revocation.",
      checking: "Structured investigation.",
      difficulty: "core",
    },
    {
      id: "blue-team-soc-q3",
      question: "What is the difference between an event and an incident?",
      answer:
        "An event is an observed occurrence in a system or network. An incident meets the organization's criteria for a security situation requiring coordinated response. I would apply those criteria rather than equate every failed login with an incident.",
      checking: "Operational classification.",
      difficulty: "warmup",
    },
    {
      id: "blue-team-soc-q4",
      question: "What is a false positive?",
      answer:
        "It is an alert on activity that turns out to be benign under the detection's intended purpose. I would document why it was benign and whether tuning is appropriate. A broad exclusion could hide real attacks, so tuning needs validation.",
      checking: "Safe noise reduction.",
      difficulty: "warmup",
    },
    {
      id: "blue-team-soc-q5",
      question: "What would you do during active ransomware activity?",
      answer:
        "Speed matters, so I would escalate to the incident response lead immediately rather than finish my own analysis first. Within the playbook, containment usually means isolating affected hosts from the network, often through EDR, rather than powering them off, because memory can hold evidence such as encryption keys or attacker tooling. The team would also look for the compromised accounts and the spread path, and protect backups so they are not encrypted too. My role as an intern would be to follow the playbook, preserve evidence, and keep accurate timestamped notes. Decisions such as restoring systems, notifying outside parties, or dealing with a ransom demand belong to leadership, legal, and the IR team.",
      checking: "Urgency, authority, and preservation.",
      difficulty: "core",
    },
    {
      id: "blue-team-soc-q6",
      question: "What belongs in a case note?",
      answer:
        "I would record the question, affected entities, timeline, evidence, and actions. I would separate observations from interpretations and state unresolved gaps. Another analyst should be able to continue the investigation from the note.",
      checking: "Operational communication.",
      difficulty: "core",
    },
    {
      id: "blue-team-soc-q7",
      question: "Why might a detection miss an attack?",
      answer:
        "Required telemetry may be absent, delayed, misparsed, or outside retention. The logic may also fail to cover the observed behavior or environment. I would test the collection and query path before concluding the attacker was invisible.",
      checking: "Detection-system reasoning.",
      difficulty: "stretch",
    },
    {
      id: "blue-team-soc-q8",
      question: "How would you explain incident response today?",
      answer:
        "The classic lifecycle, from NIST SP 800-61 Rev. 2, is preparation, detection and analysis, containment, eradication, and recovery, and post-incident activity; SANS describes the same work as preparation, identification, containment, eradication, recovery, and lessons learned. In practice that means you get ready before anything happens, confirm and scope the incident, stop it from spreading, remove the attacker's footholds, restore normal operation, and then fix what let it happen. NIST's current guidance, SP 800-61 Rev. 3 from 2025, places this inside CSF 2.0: Govern, Identify, and Protect are the preparation, Detect, Respond, and Recover are the response, and improvement runs through everything.",
      checking: "Current guidance and practical understanding.",
      difficulty: "core",
    },
    {
      id: "blue-team-soc-q9",
      question: "A user reports a suspicious email. How would you investigate it?",
      answer:
        "I would avoid clicking anything and work from a copy of the original message with full headers. I would check the sender address, Reply-To, and Return-Path, and the SPF, DKIM, and DMARC results in the Authentication-Results header. I would extract URLs and attachment hashes without opening them and check them against reputation sources or an approved sandbox. Then I would search mail logs to see who else received it, and check proxy, DNS, or endpoint logs for anyone who clicked or opened the attachment. Depending on the playbook, I would recommend blocking indicators and removing the message from mailboxes, and I would thank the reporter.",
      checking: "A safe, structured phishing workflow that moves from one message to organizational scope.",
      difficulty: "core",
    },
    {
      id: "blue-team-soc-q10",
      question: "Which Windows event IDs would you look at for a suspected account compromise?",
      answer:
        "I would start with 4624 for successful logons, paying attention to the Logon Type, such as 3 for network or 10 for RDP, and 4625 for failed logons. I would look at 4688 for process creation if that auditing is enabled, plus 4720 for new accounts and 4732 for additions to security-enabled local groups such as Administrators. I would check 4672 to see whether the session received admin-level privileges. Event 1102 means the Security log was cleared, which is a strong warning sign because attackers clear logs to hide activity. I would correlate those with the source workstation and IP and with any EDR telemetry.",
      checking: "Practical familiarity with Windows logging that SOC work depends on.",
      difficulty: "core",
    },
    {
      id: "blue-team-soc-q11",
      question: "What is the difference between a SIEM, EDR, and SOAR?",
      answer:
        "A SIEM collects and correlates logs from many sources across the environment and is where analysts search and receive many alerts. EDR is an agent on endpoints that records detailed host activity like process, file, and network events and can take response actions such as isolating a host. SOAR orchestrates and automates workflows across tools, like enriching an alert or opening a ticket, according to playbooks. They overlap and many products blur the lines, but the short version is: SIEM for breadth, EDR for endpoint depth and response, SOAR for automation.",
      checking: "Understanding of the core SOC tool stack and how the pieces fit together.",
      difficulty: "warmup",
    },
  ],
  lab: {
    title: "Work one alert and write a case note",
    steps: [
      "Create a free LetsDefend account. You do not need a paid plan for this task; which lessons and alerts are free can change, so pick whatever starter lesson or alert is currently available.",
      "Before investigating, write down what the alert claims, the entities involved, and the time window.",
      "Investigate using the platform's provided logs, email, or endpoint data. Look at the raw evidence, not just the alert title.",
      "Write a hypothesis in one sentence, then note what evidence would disprove it.",
      "Record three evidence observations, each with a timestamp (including time zone if known) and the source it came from.",
      "Assign a disposition (for example true positive, false positive, or needs escalation) and state your confidence.",
      "Add one unresolved question you would hand to the next analyst, and compare your note with the case-note shape in this module's lesson.",
    ],
    resourceIds: ["r25"],
    links: [],
  },
  resourceIds: ["r21", "r22", "r23", "r25", "r28"],
  extraLinks: [],
};
