import type { Module } from "../types";

export const prepModule: Module = {
  id: "technical-scenarios",
  number: 13,
  title: "Reason Through Unfamiliar Evidence",
  hook: "Make your next step understandable even when the answer is uncertain.",
  hours: 5,
  tracks: ["ALL"],
  objectives: [
    "Separate observations, hypotheses, and conclusions.",
    "Ask useful scoping and impact questions.",
    "Build timelines and identify missing evidence.",
    "Choose safe next actions and communicate confidence.",
  ],
  lesson: [
    { type: "h", text: "What scenario questions are really testing" },
    {
      type: "p",
      text: "Scenario questions evaluate your **process** more than your ability to name one correct tool. The interviewer usually knows there is no single right answer. What they want to hear is how you organize uncertainty: what you know, what you still need, and what you would do next and why.",
    },
    {
      type: "p",
      text: "Begin by restating what you know and what remains unclear. Then ask about the environment, the time range, the affected assets, the business impact, and your own authority. Asking these out loud is not stalling; it shows you would not act on assumptions in a real environment.",
    },
    {
      type: "list",
      items: [
        "**Environment:** What kind of system, user, or service is this? Is the behavior normal for it?",
        "**Time range:** When did it start, and is it still happening?",
        "**Affected assets:** Which accounts, hosts, or data are involved? Is anything else showing the same pattern?",
        "**Impact:** What could be harmed, and how sensitive is it?",
        "**Authority:** What am I permitted to do, and who owns containment decisions?",
      ],
    },
    {
      type: "p",
      text: "Once you have scoped the problem, form a small number of hypotheses and identify the evidence that would tell them apart. That evidence is called **discriminating evidence**: it is worth more than anything that is equally consistent with every explanation.",
    },
    {
      type: "diagram",
      caption: "The reasoning loop to narrate in any scenario answer",
      lines: [
        "  observation",
        "       |",
        "       v",
        "  possible explanations (2-4 hypotheses)",
        "       |",
        "       v",
        "  discriminating evidence (what would separate them?)",
        "       |",
        "       v",
        "  decision (next action, escalation, containment)",
        "       |",
        "       v",
        "  reassessment --> new observations feed back to the top",
      ],
    },

    { type: "h", text: "Scenario: failed logons followed by a success" },
    {
      type: "p",
      text: "Consider this synthetic observation: at 02:14 UTC, account `student-a` had twelve failed logons from `192.0.2.25`, followed by one successful logon. The address is from a reserved documentation range (RFC 5737), and the sequence alone does not prove compromise. Possible explanations include user mistakes, an automated process with a stale password, or credential abuse.",
    },
    {
      type: "code",
      lang: "text",
      caption: "Synthetic, simplified SIEM view of the events (Windows event IDs 4625 = failed logon, 4624 = successful logon)",
      code: `2026-03-05T02:13:41Z  EventID=4625  user=student-a  src_ip=192.0.2.25  logon_type=3  status=bad_password
... 10 more 4625 events from the same source over ~30 seconds ...
2026-03-05T02:14:12Z  EventID=4625  user=student-a  src_ip=192.0.2.25  logon_type=3  status=bad_password
2026-03-05T02:14:19Z  EventID=4624  user=student-a  src_ip=192.0.2.25  logon_type=3`,
    },
    {
      type: "p",
      text: "Read it field by field. Twelve failures in roughly thirty seconds is a faster, steadier pace than a person retyping a password usually manages, which nudges you toward automation: a client retrying a cached password, a misconfigured script, or a guessing tool. Logon type 3 is a *network* logon (for example, accessing a file share over SMB), not someone typing at the console (type 2) or a completed Remote Desktop session (type 10). One caution: failed RDP attempts with Network Level Authentication are also commonly logged as type 3, so check which service the source was talking to. Neither fact settles the question; each one tells you what to ask next.",
    },
    {
      type: "p",
      text: "Real 4625 events also carry a **Sub Status** code that explains the failure. `0xC000006A` means the account exists but the password was wrong; `0xC0000064` means the username does not exist. Wrong passwords against a real account point to a different story than a source cycling through usernames that do not exist.",
    },
    {
      type: "list",
      items: [
        "**User mistake:** Would show a familiar device and location, a human pace, and normal activity after success. Ask the user, through a trusted channel, whether it was them.",
        "**Stale credential in automation:** Would show a regular pattern that repeats over days, often from a known server, mapped drive, or service context. Check history for the same source. Note that a stale password explains the failures but not the success, so ask what changed right before 02:14:19.",
        "**Credential abuse:** Would show a source not associated with the user, other accounts targeted from the same source, a new device, or suspicious actions after success (access to unusual shares or hosts, new services or scheduled tasks, or, for cloud identities, new mailbox rules or MFA methods).",
      ],
    },
    {
      type: "callout",
      tone: "tip",
      title: "Brute force vs. password spraying",
      text: "Many failures against **one** account from one source looks like brute force or a broken script. A few failures each against **many** accounts looks like password spraying, which is often spread across several source addresses to stay under lockout and alert thresholds. Pivoting on the source address to see which other accounts it touched is often the single most useful next query.",
    },
    {
      type: "p",
      text: "Ask about logon type, how the account is normally used, device identity, authentication method, and what happened after the success. It is also fair to ask why twelve failures did not trigger an account lockout: the answer tells you about the lockout policy and whether this source or account is treated specially. Correlation creates meaning that the raw count lacks.",
    },

    { type: "h", text: "Scenario: a document application starts a shell" },
    {
      type: "p",
      text: "Now imagine an endpoint alert showing a document application starting a shell, for example `WINWORD.EXE` spawning `powershell.exe`. That parent-child relationship is a well-known suspicious pattern, but legitimate add-ins and automation can produce unusual chains too.",
    },
    {
      type: "list",
      items: [
        "**Full command line:** Is it encoded (for example, `-EncodedCommand`), hidden, downloading something, or running a known admin script?",
        "**Executable path and signer:** Is the binary where it should be, and is it signed by the expected publisher?",
        "**File origin:** Where did the document come from: email attachment, download, internal share? Since 2022, Office blocks VBA macros by default in files marked as coming from the internet (Mark of the Web), so *how* code ran is itself a clue.",
        "**User interaction:** Did the user open the file and enable content?",
        "**Subsequent activity:** New network connections, new files, persistence, other hosts showing the same behavior?",
      ],
    },
    {
      type: "p",
      text: "If you want to use shared vocabulary, this chain often maps to MITRE ATT&CK techniques such as **Phishing: Spearphishing Attachment** (T1566.001), **User Execution: Malicious File** (T1204.002), and **Command and Scripting Interpreter: PowerShell** (T1059.001). Naming them is a bonus, not a substitute for the questions above.",
    },
    {
      type: "p",
      text: "If the evidence indicates active harm, escalate urgency and follow authorized containment. Do not delay necessary response while pursuing a perfect explanation, but document what remains uncertain.",
    },
    {
      type: "callout",
      tone: "interview",
      title: "Where this fits in incident response",
      text: "Interviewers still often ask about the classic incident response lifecycle from NIST SP 800-61 Rev. 2: **Preparation; Detection and Analysis; Containment, Eradication, and Recovery; Post-Incident Activity**. Know those phases. Also know that [NIST SP 800-61 Rev. 3](https://csrc.nist.gov/pubs/sp/800/61/r3/final), published in April 2025, superseded Rev. 2 and reorganized its recommendations around the six NIST CSF 2.0 Functions (Govern, Identify, Protect, Detect, Respond, Recover). Mentioning both shows you are current without losing the vocabulary most teams still use.",
    },

    { type: "h", text: "Scenario: one user can see another user's invoice" },
    {
      type: "p",
      text: "Suppose a user can retrieve another user's invoice by changing an identifier, such as requesting `/api/invoices/1044` instead of their own `/api/invoices/1043`. Ask whether the accounts are intended to share access and whether the server checks object-level permission. This pattern is usually called an IDOR (insecure direct object reference). It falls under **A01: Broken Access Control** in the current OWASP Top 10:2025 (it was also A01 in the 2021 edition), and under **API1:2023 Broken Object Level Authorization** in the OWASP API Security Top 10.",
    },
    {
      type: "p",
      text: "Use approved test records to validate the boundary. The likely fix is server-side authorization enforcement, not merely making identifiers longer or random; unguessable IDs reduce discovery but do not replace the permission check. After remediation, explain how you would test three cases: the legitimate owner still gets access, an unauthorized peer is denied, and a privileged role (such as support staff) behaves as designed.",
    },

    { type: "h", text: "Scenario: a cloud storage resource appears public" },
    {
      type: "p",
      text: "First determine what \"public\" means in that provider and configuration: anonymous read, anonymous list, anyone with an account, or write access. Then establish what data is present and whether access actually occurred, using the provider's access logs if they were enabled. In AWS, for example, that means checking the bucket policy, ACLs, and Block Public Access settings, then S3 server access logs or CloudTrail data events; neither of those object-level logs is on by default, so their absence is a visibility gap, not proof of no access. Preserve relevant configuration and access evidence while coordinating remediation.",
    },
    {
      type: "p",
      text: "Public website assets may be intentional; private records are a different situation. Identify the owner and downstream dependencies so a hurried access change does not cause an avoidable outage.",
    },

    { type: "h", text: "Building a reliable timeline" },
    {
      type: "p",
      text: "Timelines require careful time handling. Preserve original timestamps and their offsets, normalize to one zone (usually UTC) for analysis, and distinguish **event time** (when it happened) from **ingestion time** (when your log platform received it). Record the provenance of exported logs and any transformations you applied.",
    },
    {
      type: "code",
      lang: "text",
      caption: "The same moment written three ways; keep the original, analyze the normalized value",
      code: `Original (host log, local time):  2026-03-04T21:14:07-05:00
Normalized for analysis (UTC):    2026-03-05T02:14:07Z
SIEM ingestion time:              2026-03-05T02:19:52Z   <- arrived ~6 minutes later; not when it happened`,
    },
    {
      type: "p",
      text: "Missing records may reflect collection gaps rather than absence of activity. In DFIR, prefer documented evidence handling and working copies; a hash helps compare integrity, but it does not replace provenance or a clear account of your own actions.",
    },
    {
      type: "callout",
      tone: "example",
      title: "Labeling a timeline entry",
      text: "**Observation:** 02:14:19Z, 4624 network logon for student-a from 192.0.2.25. **Interpretation:** The preceding failures suggest automated attempts; confidence is low until the source's history is checked. **Open question:** Did this session access any file shares, and has 192.0.2.25 targeted other accounts?",
    },

    { type: "h", text: "Closing with a clear assessment" },
    {
      type: "p",
      text: "Finish with a short assessment. Avoid listing five tools without explaining the question each one answers.",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "**What I observed:** facts only, with sources and times.",
        "**Leading explanation and confidence:** low, moderate, or high, and why.",
        "**Next evidence needed:** the specific source that separates the competing explanations.",
        "**Actions already taken:** what was contained, escalated, or preserved, and by whom.",
      ],
    },
    {
      type: "callout",
      tone: "interview",
      title: "Say it like this",
      text: "\"This is suspicious because of these observations, but I would test these alternatives. My immediate priority is this impact, and my next evidence request is this source because it separates the competing explanations.\"",
    },
  ],
  sayItLikeThis:
    "When I get an unfamiliar scenario, I start by restating what I actually know and asking about scope: the environment, the time range, affected assets, business impact, and what I'm authorized to do. Then I form two or three hypotheses and look for the evidence that would separate them, rather than running every tool I know. I keep observations separate from interpretations, normalize timestamps while preserving the originals, and treat missing logs as a visibility gap rather than proof nothing happened. If the evidence points to active harm, I escalate and follow containment procedures without waiting for a perfect answer, and I close with a short assessment: what I saw, my leading explanation and confidence, the next evidence I need, and what has already been done.",
  terms: [
    { term: "Observation", definition: "Directly available fact or recorded result." },
    { term: "Hypothesis", definition: "Explanation that can be tested against evidence." },
    { term: "Corroboration", definition: "Independent evidence supporting an interpretation." },
    { term: "Timeline", definition: "Ordered reconstruction of relevant events." },
    { term: "Provenance", definition: "Origin and history of information or evidence." },
    { term: "Scope", definition: "Known or investigated extent of an issue." },
    { term: "Confidence", definition: "Strength of support for an assessment." },
    { term: "Discriminating evidence", definition: "Information that helps distinguish between competing explanations." },
    { term: "Event time vs. ingestion time", definition: "When an event actually occurred versus when a logging platform received or indexed it." },
    { term: "Password spraying", definition: "Trying a few common passwords against many accounts to avoid per-account lockouts, as opposed to many guesses against one account." },
  ],
  questions: [
    {
      id: "technical-scenarios-q1",
      question: "Failed logins followed by success: what do you do?",
      answer:
        "I would not call it compromise from the sequence alone. First I would look at the failure reason (wrong password versus unknown user), the logon type, and whether the source and device are normal for this account. Then I would pivot on the source address to see whether it targeted other accounts, which separates a single user's or script's mistake from brute force or spraying. Most important, I would check what the successful session did afterward. If the source is unfamiliar and the follow-on activity is unusual, I would escalate per the playbook, which may mean disabling the account or revoking sessions, and confirm with the user through a trusted channel.",
      checking: "Hypothesis-driven triage.",
      difficulty: "warmup",
    },
    {
      id: "technical-scenarios-q2",
      question: "A document application launches a shell. Is it malware?",
      answer:
        "Not automatically, but it is a high-priority pattern, because Office spawning PowerShell is a classic sign of a malicious attachment. I would read the full command line for encoding or download activity, check where the document came from and whether it was marked as coming from the internet, and look at what happened next: network connections, new files, persistence, and whether other hosts show the same chain. A known, signed add-in running a documented script points one way; an encoded command reaching out to an unfamiliar domain points the other. If the evidence indicates active harm, I would follow containment procedures without waiting for a complete explanation.",
      checking: "Balanced urgency and skepticism.",
      difficulty: "core",
    },
    {
      id: "technical-scenarios-q3",
      question: "You see a connection to a reported malicious domain. What next?",
      answer:
        "I would verify the indicator source and timing, then determine which process or user made the request. I would inspect related DNS, proxy, endpoint, and network evidence. I would distinguish a DNS lookup alone, a blocked attempt, and successful communication with follow-on activity, since each means something very different. I would also check whether the domain is shared infrastructure, such as a CDN or hosting provider, that could make the indicator noisy.",
      checking: "Correlation and impact.",
      difficulty: "core",
    },
    {
      id: "technical-scenarios-q4",
      question: "Logs disagree about timing. What do you do?",
      answer:
        "I would inspect time zones, clock synchronization, and event-versus-ingestion timestamps. I would preserve the original values while documenting any normalization. I would avoid forcing an exact sequence where the evidence cannot support it.",
      checking: "Timeline reliability.",
      difficulty: "core",
    },
    {
      id: "technical-scenarios-q5",
      question: "A cloud bucket is public. Is that an incident?",
      answer:
        "I would determine the intended access and data sensitivity. I would also inspect what operations were possible and whether access occurred. The response depends on the exposure and organizational criteria, not the word \"public\" alone.",
      checking: "Contextual cloud analysis.",
      difficulty: "core",
    },
    {
      id: "technical-scenarios-q6",
      question: "A user can access another user's invoice. What is the likely issue?",
      answer:
        "I would suspect an IDOR, meaning missing object-level authorization, which falls under Broken Access Control in the OWASP Top 10, after confirming the accounts are not supposed to share access. I would validate with two approved test accounts and capture minimal evidence. The fix is a server-side check that the requesting user is allowed to access that specific object; random IDs only make guessing harder. I would retest three cases: the owner still gets access, a peer is denied, and privileged roles behave as designed.",
      checking: "Root-cause identification.",
      difficulty: "core",
    },
    {
      id: "technical-scenarios-q7",
      question: "What if you have no relevant logs?",
      answer:
        "I would state the visibility gap and look for alternative sources such as endpoint, application, or identity evidence. I would not interpret missing logs as proof that nothing happened. I would document how the gap limits the conclusion and recommend improved collection.",
      checking: "Handling incomplete evidence.",
      difficulty: "stretch",
    },
    {
      id: "technical-scenarios-q8",
      question: "How would you summarize an unresolved investigation?",
      answer:
        "I would separate observed facts from the leading hypothesis and state confidence. I would explain current impact, actions taken, and the specific evidence still needed. I would give the next owner a clear question rather than an unsupported verdict.",
      checking: "Useful handoff under uncertainty.",
      difficulty: "stretch",
    },
    {
      id: "technical-scenarios-q9",
      question: "A user reports they clicked a link in a suspicious email. Walk me through your response.",
      answer:
        "I would first thank the user and ask what happened after the click: did a page load, did they enter credentials, did anything download or run? I would examine the email headers, sender, and link in a safe way, and search for the same message across other mailboxes to scope who else received or clicked it. If credentials may have been entered, I would follow the playbook for a password reset, session revocation, and a review of recent sign-ins and mailbox rules. If something executed, I would check endpoint telemetry for the process chain and network activity and escalate for containment if needed. Finally, I would document the indicators so similar messages can be blocked.",
      checking: "Structured phishing triage, scoping beyond one user, and knowing that credential entry and code execution lead to different next steps.",
      difficulty: "core",
    },
    {
      id: "technical-scenarios-q10",
      question: "You get an \"impossible travel\" alert: the same account signed in from two distant countries within an hour. What do you check?",
      answer:
        "I would treat it as a lead, not a verdict, because VPNs, mobile carriers, and cloud proxies often produce misleading geolocation. I would compare the two sign-ins: device, browser or user agent, application, MFA result, and whether either IP has been seen for this user before. I would check what each session did afterward. If one sign-in is unexplained and shows a new device or a suspicious action, such as a new MFA method or forwarding rule, I would escalate and follow the playbook for revoking sessions and resetting credentials, then confirm with the user through a trusted channel.",
      checking: "Knowing common benign causes, choosing discriminating evidence, and acting on identity risk without overreacting.",
      difficulty: "core",
    },
    {
      id: "technical-scenarios-q11",
      question: "A user calls saying their files have strange extensions and there is a ransom note on the desktop. What are your first steps?",
      answer:
        "This suggests active harm, so speed matters. I would escalate immediately under the incident response plan and, if authorized, isolate the host from the network, for example through the EDR's network containment, rather than powering it off, because shutting down can destroy volatile evidence. If isolation is not possible, the plan may call for powering it down to stop the spread, which is a fallback that CISA's ransomware guidance also describes. I would ask the user not to touch the machine further, note the time and what they saw, and help scope quickly: which shares the host could reach, whether other hosts show the same file changes, and which account was active. I would preserve the ransom note and relevant logs and leave decisions about recovery, communications, and any contact with the attacker to the incident lead.",
      checking: "Recognizing when urgency outranks perfect analysis, containment within authority, and evidence awareness.",
      difficulty: "stretch",
    },
  ],
  lab: {
    title: "Build a labeled five-event timeline from a blue team challenge",
    steps: [
      "Choose one free challenge: a free downloadable Blue Team Labs Online investigation or a free CyberDefenders lab. Read its rules, especially whether writeups may be published while the challenge is active.",
      "Before opening any tool, write down the investigation question in one sentence (for example: \"Did the user's account authenticate from an unexpected source, and what happened afterward?\").",
      "Record provenance: challenge name, URL, download date, and a SHA-256 hash of each file you received (`sha256sum file` on Linux, `shasum -a 256 file` on macOS, or `Get-FileHash file` in PowerShell, which uses SHA-256 by default). Work on copies, not the original download.",
      "As you investigate, log every finding with its source, its original timestamp and offset, and a normalized UTC value. Use CyberChef for decoding or timestamp conversion and the SANS DFIR Fundamentals poster as a map of where evidence lives.",
      "Select the five most important events and put them in time order.",
      "Label every statement in your notes as **Observation**, **Interpretation**, or **Unresolved question**. If an interpretation has no observation supporting it, rewrite or remove it.",
      "Write a four-line assessment: what you observed, your leading explanation and confidence, the next evidence you would request, and what action you would recommend.",
      "Practice explaining the timeline out loud in under two minutes, as if handing it off to the next analyst.",
    ],
    resourceIds: ["r24", "r26", "r33", "r29"],
    links: [],
  },
  resourceIds: ["r24", "r26", "r29", "r33", "r32", "r28"],
  extraLinks: [],
};
