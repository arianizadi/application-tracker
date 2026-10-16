import type { Module } from "../types";

export const prepModule: Module = {
  id: "offensive-security-basics",
  number: 8,
  title: "Test Systems with Permission and Purpose",
  hook: "Demonstrate a weakness safely and explain how to fix it.",
  hours: 5,
  tracks: ["OFF", "APP"],
  objectives: [
    "Explain authorization, scope, and rules of engagement.",
    "Describe a repeatable penetration-testing methodology.",
    "Distinguish discovery from validated findings.",
    "Report impact and remediation with minimal necessary evidence.",
  ],
  lesson: [
    { type: "h", text: "Permission comes first" },
    {
      type: "p",
      text: "Offensive security begins with permission. Technical access, public availability, or personal curiosity does not establish authorization to test a system. Professional work requires clearly defined targets, permitted techniques, timing, data handling rules, contacts, and stop conditions, usually captured in a **rules of engagement** document.",
    },
    {
      type: "p",
      text: "A company's public website is not automatically a practice target, even if you are interviewing there. Use dedicated training environments and follow their rules, including restrictions on automation, sharing solutions, and attacking the platform itself. Some companies run bug bounty or vulnerability disclosure programs, but those also have written scopes and rules you must read first.",
    },
    {
      type: "callout",
      tone: "warning",
      text: "Testing systems you are not authorized to test can violate laws such as the U.S. Computer Fraud and Abuse Act (and similar laws in other countries) and can end a career before it starts. When in doubt, don't. Ask, get it in writing, or practice in a lab built for it.",
    },

    { type: "h", text: "Pentest, scan, red team: know the difference" },
    {
      type: "list",
      items: [
        "**Vulnerability scan:** automated checks that flag *potential* weaknesses. Useful input, but it needs interpretation and often contains false positives.",
        "**Penetration test:** a scoped assessment that discovers and *validates* weaknesses and explains their consequences. Scanning may support it, but a pentest adds human analysis, confirmation, and context.",
        "**Red team:** an authorized exercise focused on defined adversary objectives, often over a longer period, that also evaluates how well defenders detect and respond.",
      ],
    },
    {
      type: "p",
      text: "Titles vary between companies, so ask about the actual engagement goals. An intern is not expected to treat every assessment as an unrestricted adversary simulation.",
    },

    { type: "h", text: "A repeatable methodology" },
    {
      type: "diagram",
      caption: "A practical testing flow. Steps overlap, and new findings often send you back to enumeration.",
      lines: [
        "planning -> information gathering -> enumeration -> analysis -> authorized validation -> reporting -> retesting",
        "                                         ^                            |",
        "                                         +---- new information -------+",
      ],
    },
    {
      type: "p",
      text: "You do not have to invent this flow. Published methodologies such as the Penetration Testing Execution Standard (PTES), NIST SP 800-115, and, for web applications, the [OWASP Web Security Testing Guide](https://owasp.org/projects/web-security-testing-guide) describe similar phases. Naming one in an interview shows you work from a method rather than a list of tools.",
    },
    {
      type: "p",
      text: "**Enumeration** identifies the services, application functions, accounts, or configurations relevant to the scope. Keep notes that separate what a tool *observed* from what you *inferred*. A version string may be incomplete or misleading, and a service associated with a CVE is not automatically exploitable.",
    },
    {
      type: "code",
      lang: "text",
      caption: "Service enumeration against an authorized lab host (output abbreviated). `-sV` asks Nmap to probe for service and version information on the listed ports.",
      code: `$ nmap -sV -p 22,80 10.10.10.5
Nmap scan report for 10.10.10.5
Host is up (0.031s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))`,
    },
    {
      type: "callout",
      tone: "example",
      title: "Worked example: observation versus inference",
      text: "**Observed:** port 22 reports `OpenSSH 8.2p1 Ubuntu 4ubuntu0.5`. **Tempting inference:** \"OpenSSH 8.2 has CVE-X, so this host is vulnerable.\" **Better reasoning:** Linux distributions often *backport* security fixes into older version numbers, so the upstream version alone does not tell you which patches are present. You would check the distribution's security advisories for that package build and, only if it is in scope and safe, validate the specific vulnerable condition. Otherwise, report it as a potential issue with stated uncertainty.",
    },

    { type: "h", text: "Validate with the minimum necessary impact" },
    {
      type: "p",
      text: "Validation should use the minimum action needed to establish the issue within agreed limits. Demonstrating unauthorized access to a harmless test record can be sufficient; collecting real customer data is unnecessary and may violate scope. Avoid disruptive tests (such as denial-of-service or brute-forcing production accounts) unless they are explicitly authorized with safeguards.",
    },
    {
      type: "p",
      text: "If you encounter sensitive information, unexpected access, instability, or a third-party system, pause that activity and use the agreed escalation contact rather than exploring further.",
    },
    {
      type: "p",
      text: "Consider a fictional application that lets one test user view another test user's document. Document the prerequisite accounts, the affected request, the expected denial, the observed response, and the business consequence.",
    },
    {
      type: "code",
      lang: "http",
      caption: "Fictional finding in a lab app: logged in as test-user-a, requesting a document owned by test-user-b still returns 200 OK.",
      code: `GET /api/documents/1042 HTTP/1.1
Host: app.lab.test
Cookie: session=<test-user-a session>

HTTP/1.1 200 OK
Content-Type: application/json

{"id": 1042, "owner": "test-user-b", "title": "Q3 test notes"}`,
    },
    {
      type: "p",
      text: "The root cause is **missing server-side authorization**, not merely a predictable identifier. (This class of bug is often called an IDOR, an insecure direct object reference, and falls under A01 Broken Access Control in the current OWASP Top 10:2025, the same top spot it held in the 2021 edition.) The fix is to check on the server that the requesting user is allowed to access that specific object, plus negative tests that confirm user A gets a 403 or 404 for user B's document. This explanation is far more useful than a screenshot labeled \"critical\" or a list of every tool you installed.",
    },

    { type: "h", text: "Write a report people can act on" },
    {
      type: "p",
      text: "A good report serves both technical and business readers. For each finding, include:",
    },
    {
      type: "list",
      items: [
        "**Affected asset** and the conditions required (for example, any authenticated user).",
        "**Evidence and reproduction steps** that another tester can follow.",
        "**Realistic impact** in business terms, plus any limitations of your testing.",
        "**Severity** that reflects context, exploitability, and consequences, not excitement about the technique. CVSS scores are a useful input, not the whole decision.",
        "**Remediation** that targets the root cause, and how to verify it.",
        "**Cleanup notes** confirming that temporary accounts, files, or configuration changes were removed when required.",
      ],
    },
    {
      type: "p",
      text: "**Retesting** checks whether the root cause is fixed and whether legitimate behavior still works.",
    },

    { type: "h", text: "In the interview" },
    {
      type: "p",
      text: "Walk through one legal lab finding from scope to retest. Mention hypotheses that did not work and how you revised them; that shows real methodology. If an interviewer asks you to test a live system, clarify authorization and boundaries before interacting with it.",
    },
    {
      type: "callout",
      tone: "interview",
      text: "\"I would confirm scope, enumerate carefully, validate with minimal impact, and produce a reproducible finding with a practical fix. If the activity crosses the agreed boundary, I stop and escalate.\"",
    },
  ],
  sayItLikeThis:
    "For me, offensive security starts with written authorization and a clear scope, including stop conditions and an escalation contact. From there I follow a repeatable flow: gather information, enumerate, form hypotheses, and validate only with the minimum action needed, keeping notes that separate what a tool observed from what I inferred. A version banner or scanner result is a lead, not a finding. My deliverable is a reproducible write-up that explains the affected asset, realistic business impact, the root-cause fix, and how we would retest, and if I ever hit sensitive data or something outside scope, I stop and escalate rather than dig further.",
  terms: [
    { term: "Scope", definition: "Defined systems, actions, and boundaries of an assessment." },
    { term: "Authorization", definition: "Explicit, preferably written, permission for the specified activity." },
    { term: "Rules of engagement", definition: "Operational constraints and procedures for testing, such as timing, permitted techniques, contacts, and stop conditions." },
    { term: "Enumeration", definition: "Structured discovery of relevant system details such as services, functions, accounts, and configurations." },
    { term: "Validation", definition: "Confirmation that a suspected weakness is real." },
    { term: "Proof of concept", definition: "Minimal demonstration supporting a finding." },
    { term: "IDOR", definition: "Insecure direct object reference: an access-control flaw where changing an object identifier exposes data the user should not reach." },
    { term: "Retest", definition: "Follow-up checking whether remediation resolves the issue without breaking legitimate behavior." },
    { term: "Red team", definition: "Objective-driven adversary simulation under authorization, often also testing detection and response." },
  ],
  questions: [
    {
      id: "offensive-security-basics-q1",
      question: "What comes before scanning?",
      answer:
        "I would confirm explicit authorization, targets, timing, and permitted techniques. I would identify stop conditions and escalation contacts. Then I would choose a discovery approach consistent with those limits.",
      checking: "Professional boundaries.",
      difficulty: "warmup",
    },
    {
      id: "offensive-security-basics-q2",
      question: "What is the difference between a vulnerability scan and a penetration test?",
      answer:
        "A scan identifies potential weaknesses through automated checks. A pentest adds scoped investigation, validation, context, and reporting. Automated output still requires interpretation and may contain false positives.",
      checking: "Methodology.",
      difficulty: "warmup",
    },
    {
      id: "offensive-security-basics-q3",
      question: "What would you do if you found customer data during a test?",
      answer:
        "I would stop unnecessary access and preserve only the minimum evidence the engagement allows. I would notify the designated contact using the agreed procedure. I would not copy or explore the data to make the finding more dramatic.",
      checking: "Ethics and data handling.",
      difficulty: "core",
    },
    {
      id: "offensive-security-basics-q4",
      question: "Does an old software version prove a system is vulnerable?",
      answer:
        "No. Banners may be inaccurate, and distributions often backport security patches without changing the upstream version number. I would verify the relevant configuration and vulnerability conditions within scope, and report the uncertainty if safe validation is not available.",
      checking: "Evidence quality.",
      difficulty: "core",
    },
    {
      id: "offensive-security-basics-q5",
      question: "What makes a strong pentest report?",
      answer:
        "It explains the affected asset, the conditions, reproducible evidence, and realistic impact. It recommends a root-cause fix and a retest approach. Both an engineer and a risk owner should understand what to do next.",
      checking: "Deliverable quality.",
      difficulty: "core",
    },
    {
      id: "offensive-security-basics-q6",
      question: "When would you stop a test?",
      answer:
        "I would stop when an agreed condition occurs, such as instability or access outside scope. I would also pause if authorization becomes unclear. I would document the situation and contact the engagement lead.",
      checking: "Judgment under uncertainty.",
      difficulty: "core",
    },
    {
      id: "offensive-security-basics-q7",
      question: "How do you prioritize findings?",
      answer:
        "I consider exposure, exploitability, the privileges involved, and business consequences. I also consider compensating controls and evidence of real-world exploitation, such as whether a CVE appears in CISA's Known Exploited Vulnerabilities catalog, or its EPSS score, which estimates the probability of exploitation. A scanner's severity or CVSS score is useful input rather than the entire decision. For example, a medium-severity access-control flaw on an internet-facing app holding customer data can outrank a critical CVE on an isolated internal test box.",
      checking: "Risk-based prioritization.",
      difficulty: "stretch",
    },
    {
      id: "offensive-security-basics-q8",
      question: "What did CTFs teach you about pentesting?",
      answer:
        "They helped me practice enumeration and hypothesis testing in an authorized environment. I also learned to document why an approach worked rather than only record the final flag. I recognize that production assessments add scope, safety, communication, and business constraints that CTFs don't.",
      checking: "Transfer without exaggeration.",
      difficulty: "warmup",
    },
    {
      id: "offensive-security-basics-q9",
      question: "What is the difference between a pentest, a red team exercise, and a purple team exercise?",
      answer:
        "A pentest tries to find and validate as many relevant weaknesses as practical within a defined scope and time. A red team pursues specific adversary-style objectives, often stealthily and over a longer period, to test the organization's detection and response as well as its controls. Purple teaming is collaborative: offensive and defensive staff work together, running techniques and immediately checking and improving detections.",
      checking: "Understanding of engagement types and their goals.",
      difficulty: "core",
    },
    {
      id: "offensive-security-basics-q10",
      question: "What is the difference between a bind shell and a reverse shell?",
      answer:
        "With a bind shell, the target opens a listening port and the tester connects in to it. With a reverse shell, the target connects outbound to a listener the tester controls. Reverse shells are more common in practice because outbound connections are often less restricted than inbound ones by firewalls and NAT. From a defensive angle, that is why egress filtering and monitoring for unexpected outbound connections from servers matter.",
      checking: "Basic offensive mechanics and their defensive implications.",
      difficulty: "core",
    },
    {
      id: "offensive-security-basics-q11",
      question: "You notice what looks like a security bug on a company's public website while browsing normally. What do you do?",
      answer:
        "I would not probe further or try to confirm it by exploiting it, because I am not authorized. I would check whether the company has a vulnerability disclosure policy or bug bounty program (often linked from a security page or a `security.txt` file at `/.well-known/security.txt`) and follow its rules, including any safe-harbor terms. If there is no program, I would report what I observed through an official security contact, describing only what I saw during normal use, and let them investigate. I would not disclose it publicly before they have had a reasonable chance to fix it.",
      checking: "Ethics and responsible disclosure.",
      difficulty: "core",
    },
    {
      id: "offensive-security-basics-q12",
      question: "Walk me through how you would approach testing a web application.",
      answer:
        "After confirming scope and rules, I would map the application: pages, API endpoints, roles, and how authentication and sessions work, usually by proxying traffic through a tool like Burp Suite. Then I would test by category, using something like the OWASP Web Security Testing Guide: authentication, session handling, access control between roles and users, input handling for injection and XSS, and business logic. I would validate each suspected issue minimally, keep notes on what I tested and ruled out, and write up confirmed findings with reproduction steps and root-cause fixes.",
      checking: "Structured methodology rather than a list of tools.",
      difficulty: "stretch",
    },
  ],
  lab: {
    title: "Solve a beginner challenge and write it up like an engagement",
    steps: [
      "Choose an authorized practice environment: a beginner picoGym challenge, or the first few levels of OverTheWire Bandit (connect with `ssh bandit0@bandit.labs.overthewire.org -p 2220` and follow the level instructions on the site).",
      "Before starting, read the platform's rules and write a one-paragraph **scope** for yourself: which target, what techniques are allowed, and what is off limits (for example, attacking the platform infrastructure or publishing solutions where the rules forbid it).",
      "Solve the challenge, keeping timestamped notes. Record each hypothesis you tried, including the ones that failed and why.",
      "Write a short report with these headings: Scope, Method, Evidence (the minimal commands or screenshots that prove the result), Limitation (what you did not test or cannot be sure of), and Remediation lesson (how a real system would prevent this weakness).",
      "Rewrite your remediation section for a non-technical reader in two or three sentences.",
      "Practice explaining the finding aloud in under two minutes, from scope to fix.",
    ],
    resourceIds: ["r19", "r18"],
    links: [],
  },
  resourceIds: ["r10", "r14", "r19", "r83", "r17"],
  extraLinks: [],
};
