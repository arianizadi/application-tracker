import type { Module } from "../types";

export const prepModule: Module = {
  id: "threats-and-frameworks",
  number: 7,
  title: "Turn Threat Information into Decisions",
  hook: "Explain what the evidence suggests and what a defender should do.",
  hours: 4,
  tracks: ["SOC", "CTI", "DET", "DFIR"],
  objectives: [
    "Distinguish threats, vulnerabilities, indicators, and behaviors.",
    "Use ATT&CK and the kill chain appropriately.",
    "Evaluate threat reports and analytical confidence.",
    "Connect intelligence to a defensive decision.",
  ],
  lesson: [
    { type: "h", text: "Threat, vulnerability, exploit, risk" },
    {
      type: "p",
      text: "A **threat** is a potential cause of harm, while a **vulnerability** is a weakness that may be exploited. An **exploit** is a means of taking advantage of a weakness. Risk depends on the relevant scenario and its consequences, not merely the existence of a tool or a vulnerability. An unpatched server that is unreachable and holds nothing sensitive is a different risk from the same flaw on an internet-facing system that processes payments.",
    },
    {
      type: "p",
      text: "When you discuss an incident, try to answer four questions: what the adversary wanted, how access was obtained, what actions followed, and what evidence supports each part of the account. That structure keeps you from jumping straight to a scary label.",
    },

    { type: "h", text: "Phishing and malware are pieces, not the whole story" },
    {
      type: "p",
      text: "**Phishing** uses deceptive messages or interactions to influence a victim's behavior. It may seek credentials, malicious execution, payment, or the victim's approval of access (for example, accepting an MFA prompt or granting a malicious app consent). **Malware** is software used for harmful purposes and includes loaders, ransomware, information stealers, and other capabilities.",
    },
    {
      type: "p",
      text: "These categories overlap and do not tell you the entire intrusion path. A suspicious attachment is one artifact. Delivery records, execution evidence, account activity, and later network behavior build the larger picture.",
    },

    { type: "h", text: "Indicators versus behaviors" },
    {
      type: "p",
      text: "**Indicators of compromise (IOCs)** are observable values such as file hashes, domains, IP addresses, or file paths associated with suspicious activity. Their usefulness depends on context, age, specificity, and source quality. Shared hosting, recycled infrastructure, and ordinary software names can all create misleading matches. **Behaviors** (TTPs) tend to stay useful after an attacker changes infrastructure, because changing *how* you operate is much harder than registering a new domain.",
    },
    {
      type: "diagram",
      caption: "David Bianco's Pyramid of Pain: indicators near the top cost the attacker more to change, so detections built on them last longer.",
      lines: [
        "  TTPs                       Tough!        ^  harder for the attacker to change",
        "  Tools                      Challenging   |",
        "  Network / host artifacts   Annoying      |",
        "  Domain names               Simple        |",
        "  IP addresses               Easy          |",
        "  Hash values                Trivial       |  easier for the attacker to change",
      ],
    },
    {
      type: "diagram",
      caption: "How raw data becomes a defensible decision.",
      lines: [
        "raw observation            (IOC hit, alert, report claim)",
        "      |",
        "      v",
        "context and evaluation     (source quality, age, timing, direction, corroboration)",
        "      |",
        "      v",
        "supported assessment       (what the evidence supports, with stated confidence)",
        "      |",
        "      v",
        "decision or action         (block, hunt, escalate, tune, or close as benign)",
      ],
    },
    {
      type: "callout",
      tone: "example",
      title: "Worked example: reading an IOC match",
      text: "Your SIEM flags a proxy log because the destination domain appears on a threat feed: `2026-03-04T14:22:09Z src=10.20.4.17 user=jdoe method=GET host=cdn-update.example status=200 bytes=482113`. Before calling it a compromise, ask: When was the domain added to the feed, and is the listing still current? Which process on 10.20.4.17 made the request (endpoint telemetry)? Was the 482 KB response an executable or an ordinary web asset? Did other hosts contact it, and did anything unusual follow (new processes, persistence, outbound beacons at regular intervals)? A stale listing with no follow-on activity points one way; a fresh listing plus a newly launched unsigned binary points another.",
    },

    { type: "h", text: "MITRE ATT&CK" },
    {
      type: "p",
      text: "[MITRE ATT&CK](https://attack.mitre.org/) organizes observed adversary behaviors into **tactics**, **techniques**, and **sub-techniques**. A tactic represents an adversary objective (the *why*, such as Initial Access or Persistence), while a technique describes a way to achieve that objective (the *how*). **Procedures** are the specific ways a particular group or tool carried out a technique. ATT&CK is updated regularly, so check the current version when you cite names or IDs.",
    },
    {
      type: "p",
      text: "Map only what the evidence supports, and explain uncertainty when several mappings are plausible. A matrix with many colored cells does not prove comprehensive defensive coverage. Real coverage needs relevant data sources, working analytics, validated response steps, and an honest understanding of what remains unseen.",
    },
    {
      type: "callout",
      tone: "example",
      title: "Worked example: mapping a short narrative",
      text: "Report excerpt: *A user opened an emailed attachment, which launched PowerShell. PowerShell created a scheduled task and the host began making HTTPS requests to an external server every 60 seconds.* A reasonable mapping: Phishing: Spearphishing Attachment (`T1566.001`, Initial Access); User Execution: Malicious File (`T1204.002`, Execution); Command and Scripting Interpreter: PowerShell (`T1059.001`, Execution); Scheduled Task/Job: Scheduled Task (`T1053.005`, Persistence); Application Layer Protocol: Web Protocols (`T1071.001`, Command and Control). Some techniques sit under more than one tactic (Scheduled Task also appears under Execution and Privilege Escalation), so pick the tactic the evidence supports: here the task was created to survive reboots, which is persistence. Each mapping should point back to a specific sentence or log entry.",
    },

    { type: "h", text: "The Cyber Kill Chain" },
    {
      type: "p",
      text: "Lockheed Martin's [Cyber Kill Chain](https://www.lockheedmartin.com/en-us/capabilities/cyber/cyber-kill-chain.html) describes seven phases. It helps you explain where a defender might interrupt an intrusion, but real activity may repeat, skip, or reorder steps. ATT&CK and the kill chain offer different views rather than competing universal answers: use whichever helps explain the question, without forcing evidence into a neat sequence.",
    },
    {
      type: "diagram",
      caption: "The seven phases of the Lockheed Martin Cyber Kill Chain, with an example defensive opportunity beside each.",
      lines: [
        "1. Reconnaissance          ->  limit public exposure; notice scanning and enumeration",
        "2. Weaponization           ->  happens on the attacker's side; little direct visibility",
        "3. Delivery                ->  email and web filtering, attachment sandboxing",
        "4. Exploitation            ->  patching, hardening, exploit protection",
        "5. Installation            ->  application control, EDR, persistence monitoring",
        "6. Command and Control     ->  egress filtering, DNS and beacon detection",
        "7. Actions on Objectives   ->  data-loss controls, segmentation, backups, monitoring",
      ],
    },

    { type: "h", text: "Intelligence has to answer someone's question" },
    {
      type: "p",
      text: "Threat intelligence is only useful when it answers a consumer's question. A SOC might need detection opportunities, a vulnerability team might need exploitation context, and leadership might need likely business consequences. A common way to describe this is the intelligence lifecycle:",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "**Direction:** agree on the question and who needs the answer.",
        "**Collection:** gather reports, telemetry, and other sources relevant to that question.",
        "**Processing:** normalize, translate, and de-duplicate the raw material.",
        "**Analysis:** separate facts from assessments and reach a conclusion with stated confidence.",
        "**Dissemination:** deliver it in a form the consumer can act on.",
        "**Feedback:** learn whether it helped and adjust the next round.",
      ],
    },
    {
      type: "p",
      text: "When you evaluate a report, look at its evidence, publication timing, collection limits, and how clearly it separates facts from assessments. State your **confidence** and the assumptions that could change it. Attribution to a named actor requires much stronger evidence than observing a technique that many groups use.",
    },

    { type: "h", text: "Practice and interview phrasing" },
    {
      type: "p",
      text: "To prepare, pick one public report and summarize the initial access, two supported behaviors, the affected assets, and useful defensive actions. Then identify one claim you cannot independently confirm. Being able to say what you *don't* know is a strength in this field.",
    },
    {
      type: "callout",
      tone: "interview",
      text: "\"The report directly supports these observations; this part is an assessment. For our environment, I would check this log source and prioritize this control, because it addresses the demonstrated behavior.\"",
    },
  ],
  sayItLikeThis:
    "I treat threat information as evidence that has to earn its way into a decision. I separate threats from vulnerabilities, and short-lived indicators like hashes and IPs from behaviors that survive infrastructure changes. I use MITRE ATT&CK as a shared vocabulary for what the evidence actually shows, and the kill chain to explain where we could have interrupted an intrusion, without pretending a colored matrix equals coverage or that a technique identifies an actor. When I summarize a report, I say what is directly supported, what is assessment, how confident I am, and what this organization should check or change as a result.",
  terms: [
    { term: "Threat", definition: "Potential cause of harmful consequences." },
    { term: "Vulnerability", definition: "Weakness that can contribute to compromise." },
    { term: "Exploit", definition: "Means of taking advantage of a vulnerability." },
    { term: "IOC", definition: "Indicator of compromise: an observable value (hash, domain, IP, file path) associated with potential compromise." },
    { term: "TTP", definition: "Tactics, techniques, and procedures: a description of adversary behavior and methods." },
    { term: "Tactic", definition: "Adversary objective within ATT&CK, such as Initial Access or Persistence." },
    { term: "Technique", definition: "Method used to achieve an adversary objective; ATT&CK techniques may have more specific sub-techniques." },
    { term: "Procedure", definition: "The specific way a particular actor or tool carried out a technique, such as the exact command line used." },
    { term: "Pyramid of Pain", definition: "Model ranking indicator types by how costly they are for an adversary to change, from hash values (trivial) up to TTPs (tough)." },
    { term: "Cyber Kill Chain", definition: "Lockheed Martin's seven-phase model of an intrusion, from reconnaissance to actions on objectives." },
    { term: "Analytical confidence", definition: "Assessment of how strongly the evidence supports a conclusion." },
  ],
  questions: [
    {
      id: "threats-and-frameworks-q1",
      question: "What is the difference between a threat and a vulnerability?",
      answer:
        "A vulnerability is a weakness, such as an unpatched VPN appliance or a storage bucket that is accidentally public. A threat is something that could cause harm, such as a ransomware group, a careless insider, or even a power outage. Risk is where the two meet: how likely it is that a threat exploits that weakness, and how bad the impact would be in this organization. The same unpatched flaw is a much bigger risk on an internet-facing payment server than on an isolated test box.",
      checking: "Risk vocabulary.",
      difficulty: "warmup",
    },
    {
      id: "threats-and-frameworks-q2",
      question: "What is the difference between an IOC and a TTP?",
      answer:
        "An IOC is an observable value such as a domain, IP address, or file hash. TTPs describe adversary behavior and methods, for example \"a Word document spawns PowerShell, which creates a scheduled task.\" Both can support an investigation, but their reliability and lifespan differ: an attacker can swap a domain or recompile a file in minutes, while changing how they operate is much more expensive. So I would use IOCs for quick blocking and scoping, and behavior-based detections for longer-lasting coverage.",
      checking: "Intelligence concepts.",
      difficulty: "warmup",
    },
    {
      id: "threats-and-frameworks-q3",
      question: "What is MITRE ATT&CK used for?",
      answer:
        "It provides a shared way to describe adversary behaviors as tactics, techniques, and sub-techniques. Teams use it for analysis, detection planning, adversary emulation, and coverage discussions. A technique label alone does not prove detection effectiveness or actor identity.",
      checking: "Practical framework use.",
      difficulty: "warmup",
    },
    {
      id: "threats-and-frameworks-q4",
      question: "Does a match against a known-malicious IP address prove compromise?",
      answer:
        "No. I would inspect the timing, direction, service, and the source and age of the reputation claim. Shared or reassigned infrastructure can complicate interpretation. I would look for corroborating behavior, such as the process that made the connection or follow-on activity, before reaching a conclusion.",
      checking: "Context and false-positive awareness.",
      difficulty: "core",
    },
    {
      id: "threats-and-frameworks-q5",
      question: "How would you analyze a reported phishing email?",
      answer:
        "First I would preserve the original message, including full headers, and work on it without clicking or opening anything on a normal workstation. I would check the headers: the SPF, DKIM, and DMARC results, whether the From and Reply-To or Return-Path domains match, and the Received chain. I would look at what the message asks for, check link domains and attachment hashes against reputation sources, and detonate anything suspicious only in an approved sandbox. Then I would scope it: who else received it, who clicked or replied, and whether sign-in or endpoint activity followed. Depending on the findings and the organization's process, response could include removing the message from all mailboxes, blocking the sender or URL, and resetting credentials or revoking sessions for anyone who entered them.",
      checking: "End-to-end investigation.",
      difficulty: "core",
    },
    {
      id: "threats-and-frameworks-q6",
      question: "What makes threat intelligence actionable?",
      answer:
        "It answers a relevant question and supports a decision. For example, a report might identify a behavior we can detect with process logs we already collect. I would explain the recommended action, the data it requires, and the uncertainty.",
      checking: "Relevance to consumers.",
      difficulty: "core",
    },
    {
      id: "threats-and-frameworks-q7",
      question: "How would you discuss a recent security story in an interview?",
      answer:
        "I would summarize what happened, the evidence available, and why it matters to this employer. I would distinguish confirmed details from reporting or speculation. Then I would suggest one practical prevention or detection lesson.",
      checking: "Informed, careful communication.",
      difficulty: "core",
    },
    {
      id: "threats-and-frameworks-q8",
      question: "Can ATT&CK identify the attacker?",
      answer:
        "Not by itself, because many actors share techniques and tools. Attribution can require infrastructure, timing, operational, and other evidence beyond behavior mapping. I would state my confidence and avoid stronger claims than the evidence supports.",
      checking: "Attribution restraint.",
      difficulty: "stretch",
    },
    {
      id: "threats-and-frameworks-q9",
      question: "What is the Pyramid of Pain, and how does it affect detection choices?",
      answer:
        "It ranks indicator types by how much it costs an attacker to change them: hash values, IP addresses, and domain names at the bottom, then network and host artifacts, tools, and TTPs at the top. Blocking a hash is quick and useful, but an attacker can recompile in seconds. Detections built on behavior, like Microsoft Word spawning PowerShell, are harder to evade and last longer, though they usually need more tuning to control false positives.",
      checking: "Whether you can prioritize durable detections over brittle ones.",
      difficulty: "core",
    },
    {
      id: "threats-and-frameworks-q10",
      question: "Walk me through the Cyber Kill Chain. Where would you try to break it?",
      answer:
        "The seven phases are reconnaissance, weaponization, delivery, exploitation, installation, command and control, and actions on objectives. Defenders want to interrupt as early as possible, for example by filtering malicious email at delivery or blocking execution with application control, but they also need later layers, such as egress monitoring for beaconing, because early controls sometimes fail. I would also note that real intrusions do not always follow the sequence neatly.",
      checking: "Framework recall plus defense-in-depth thinking.",
      difficulty: "warmup",
    },
    {
      id: "threats-and-frameworks-q11",
      question: "How do you stay current on threats?",
      answer:
        "I keep a small weekly routine instead of just reading headlines. I check CISA's Known Exploited Vulnerabilities catalog to see what is actually being exploited, I read one full intrusion write-up from The DFIR Report or Google Threat Intelligence and Mandiant research, and I follow a newsletter such as tl;dr sec or a podcast such as Risky Business. For example, from a recent report I read, I noted [one behavior] and checked whether a home lab or log source I use would show it. (Replace the bracket with a real report you have read; interviewers often ask a follow-up about it.)",
      checking: "Genuine curiosity and a repeatable learning routine.",
      difficulty: "warmup",
    },
    {
      id: "threats-and-frameworks-q12",
      question: "A threat report says an actor is \"likely\" targeting your industry. How do you turn that into something useful for the SOC?",
      answer:
        "First I note the report's confidence and evidence, since \"likely\" is an assessment rather than a confirmed fact. Then I pull out the behaviors it actually documents, map them to ATT&CK, and check whether we collect the data sources needed to see them. Where we do, I would propose or tune a detection and test it; where we don't, I would flag the visibility gap. I would hand the SOC a short summary with the behaviors, what to look for, and what is still uncertain.",
      checking: "Translating intelligence into concrete defensive work.",
      difficulty: "stretch",
    },
  ],
  lab: {
    title: "Turn a public report into three behaviors, two defenses, and one uncertainty",
    steps: [
      "Pick a source: work through a section of MITRE's free CTI training, or choose one recent public report from Google Threat Intelligence / Mandiant research (The DFIR Report also works well).",
      "Read the report once for the story: what did the adversary want, how did they get in, and what happened next?",
      "On a second pass, list three behaviors the report directly supports with evidence (log excerpts, screenshots, or specific observations). Map each one to an ATT&CK technique and note the sentence it came from.",
      "For each behavior, write which data source would show it in a typical environment (for example, process creation logs, email gateway logs, or DNS logs).",
      "Propose two defensive opportunities: a detection, a hardening change, or a process improvement, and say which behavior each addresses.",
      "Identify one claim you cannot independently confirm (such as attribution or victim count) and note how confident the report is about it.",
      "Write a five-sentence summary you could say aloud in an interview, using the phrasing pattern from the lesson.",
    ],
    resourceIds: ["r39", "r41"],
    links: [],
  },
  resourceIds: ["r35", "r39", "r40", "r34", "r41"],
  extraLinks: [
    { title: "Lockheed Martin Cyber Kill Chain", url: "https://www.lockheedmartin.com/en-us/capabilities/cyber/cyber-kill-chain.html" },
  ],
};
