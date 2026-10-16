import type { Module } from "../types";

export const prepModule: Module = {
  id: "grc-and-risk",
  number: 11,
  title: "Connect Controls to Business Risk",
  hook: "Explain why a control matters and what evidence supports it.",
  hours: 3,
  tracks: ["GRC", "IAM", "CLOUD"],
  objectives: [
    "Distinguish governance, risk management, and compliance.",
    "Write a concrete risk statement and treatment plan.",
    "Compare CSF 2.0, ISO 27001, and SOC 2.",
    "Evaluate control evidence and communicate exceptions.",
  ],
  lesson: [
    { type: "h", text: "Three related jobs: governance, risk, compliance" },
    {
      type: "p",
      text: "**Governance** establishes direction, accountability, and oversight. **Risk management** identifies and evaluates uncertainty that could affect objectives, then chooses how to address it. **Compliance** concerns meeting applicable requirements, such as laws, contracts, or internal policies. These activities overlap, but passing a checklist does not establish that every important risk is controlled. A useful starting question is: what business outcome are we protecting, and who is accountable for the decision?",
    },
    { type: "h", text: "Write risk as a scenario" },
    {
      type: "p",
      text: "Write risk as a scenario rather than a vague label. For example: *If a privileged account is compromised, an attacker could alter customer records because access is broad and administrative actions are not sufficiently reviewed.* This identifies a threat situation, weakness, asset, and consequence. Evaluate likelihood and impact using the organization's method, and document assumptions. Avoid multiplying arbitrary scores and presenting the result as precise scientific measurement.",
    },
    {
      type: "diagram",
      caption: "Anatomy of a risk statement",
      lines: [
        "threat event        → weakness              → asset              → consequence",
        "privileged account     broad access, admin     customer records     records altered;",
        "is compromised         actions not reviewed                         trust and legal impact",
      ],
    },
    {
      type: "callout",
      tone: "example",
      title: "A sample risk register entry",
      text: "**Scenario:** the privileged-account statement above. **Likelihood / impact:** medium / high, using the organization's scale, with the assumption that admin accounts already require MFA. **Existing controls:** MFA on admin logins. **Proposed treatment:** reduce standing admin access and add a monthly review of admin actions. **Owner:** head of the customer platform. **Status / review date:** open, review next quarter.",
    },
    { type: "h", text: "Controls, and the documents that describe them" },
    {
      type: "p",
      text: "Controls can **prevent**, **detect**, or help **correct** unwanted events. Examples include restricted permissions (preventive), monitoring (detective), and backups and recovery exercises (corrective). You will also hear controls grouped by how they are implemented: administrative (policies, training), technical (MFA, logging), and physical (badges, locks). A control is useful only when its design addresses the scenario and its operation can be demonstrated over the relevant scope and period.",
    },
    {
      type: "list",
      items: [
        "**Policy:** states expectations and intent, for example that access follows least privilege.",
        "**Standard:** defines mandatory, measurable requirements, for example that admin accounts must use phishing-resistant MFA.",
        "**Procedure:** explains step by step how to perform a task, for example how to run the quarterly access review.",
        "**Guideline:** recommended, non-mandatory advice.",
      ],
    },
    {
      type: "p",
      text: "These names and their hierarchy vary by organization, so ask how a given team uses them.",
    },
    { type: "h", text: "Treating risk" },
    {
      type: "p",
      text: "Risk treatment options commonly include **reducing**, **avoiding**, **transferring or sharing**, and **accepting** risk. Acceptance should involve the appropriate owner and documented rationale, conditions, and review date. Insurance or contractual transfer does not remove every operational consequence. **Residual risk** remains after treatment. A GRC intern may help gather evidence or track exceptions, but should not quietly accept significant risk on behalf of the organization.",
    },
    { type: "h", text: "CSF 2.0, ISO 27001, and SOC 2 are different things" },
    {
      type: "p",
      text: "**NIST CSF 2.0** organizes cybersecurity outcomes into six functions: Govern, Identify, Protect, Detect, Respond, and Recover. Govern was added in version 2.0 and sits at the center, informing the other five. CSF supports communication and prioritization rather than prescribing one universal implementation.",
    },
    {
      type: "diagram",
      caption: "NIST CSF 2.0 functions. The arrows show a common way to remember them; CSF intends all six to be addressed together and continuously, not as a one-time sequence.",
      lines: [
        "                 +-----------+",
        "                 |  GOVERN   |  strategy, roles, policy, oversight, supply chain",
        "                 +-----------+",
        "                       |",
        "  IDENTIFY → PROTECT → DETECT → RESPOND → RECOVER",
        "  (assets,   (access,   (monitor, (contain,  (restore,",
        "   risk)      data)      analyze)  report)    communicate)",
      ],
    },
    {
      type: "p",
      text: "**ISO/IEC 27001** specifies requirements for an information security management system (ISMS) and its continual improvement; the 2022 edition's Annex A lists 93 reference controls. Organizations, not people, are certified against it by an accredited certification body. **SOC 2** is an assurance examination, performed by an independent CPA firm, that produces a report on a service organization's scoped controls against the relevant Trust Services Criteria: Security (always included), plus optionally Availability, Processing Integrity, Confidentiality, and Privacy. These serve different purposes and should not be described as interchangeable or as personal certifications.",
    },
    { type: "h", text: "Evidence should match the claim" },
    {
      type: "p",
      text: "A screenshot of a setting may support configuration at one moment, but not prove that a process operated consistently for six months. Access-review evidence might include the population reviewed, reviewer decisions, approvals, and remediation of exceptions. Check completeness, dates, scope, and provenance. Auditors usually test a sample drawn from the full population (for example, every access change in the period), so the population list itself must be complete and come from the system of record. Ask whether the evidence shows that a control exists, that it operated, or that it achieved the intended result.",
    },
    {
      type: "diagram",
      caption: "Three levels of evidence for the same control",
      lines: [
        "EXISTS              → OPERATED                     → EFFECTIVE",
        "policy + screenshot   review records for every       stale access actually",
        "of the setting        quarter in the period          removed; exceptions tracked",
      ],
    },
    { type: "h", text: "Communicate gaps as decisions" },
    {
      type: "p",
      text: "Communicate findings in terms of consequence and action. Instead of saying *noncompliant*, explain the requirement, observed gap, supporting evidence, affected scope, and proposed next step. Respect sensitive information and share only what the review requires.",
    },
    {
      type: "callout",
      tone: "interview",
      title: "Say it like this",
      text: "I would connect the requirement to a risk scenario, gather evidence appropriate to the claim, and route exceptions to the accountable owner with a clear remediation or acceptance process.",
    },
  ],
  sayItLikeThis:
    "I think of GRC as connecting security work to business decisions: governance sets accountability, risk management decides what matters most, and compliance shows we meet our obligations. I write risks as concrete scenarios naming the threat, the weakness, the asset, and the consequence, then evaluate them with the organization's method and document my assumptions. I know CSF 2.0, ISO 27001, and SOC 2 do different jobs: an outcomes framework, a certifiable management-system standard, and an independent assurance report. When I gather evidence, I check whether it shows a control exists, actually operated over the period, or achieved its goal. When there is a gap, I describe the consequence and the options and route the decision to the accountable owner rather than accepting risk myself.",
  terms: [
    { term: "Governance", definition: "Direction, accountability, and oversight." },
    { term: "Risk", definition: "The effect of uncertainty on objectives (ISO 31000 wording); in security work, usually expressed as the likelihood and impact of a harmful scenario." },
    { term: "Control", definition: "Measure intended to modify risk." },
    { term: "Residual risk", definition: "Risk remaining after treatment." },
    { term: "Risk owner", definition: "Person accountable for managing a risk." },
    { term: "ISMS", definition: "Information security management system." },
    { term: "Audit evidence", definition: "Information supporting an assurance conclusion." },
    { term: "Exception", definition: "Approved or identified departure from a requirement." },
    { term: "Compensating control", definition: "An alternative control that meets the intent of a requirement when the primary control is not feasible." },
    { term: "Trust Services Criteria", definition: "AICPA criteria used in SOC 2: Security, Availability, Processing Integrity, Confidentiality, and Privacy." },
    { term: "Risk appetite", definition: "The amount and type of risk an organization is willing to pursue or retain to meet its objectives." },
  ],
  questions: [
    {
      id: "grc-and-risk-q1",
      question: "What is GRC?",
      answer:
        "It connects governance, risk management, and compliance. Governance defines accountability, risk management addresses uncertainty, and compliance evaluates applicable obligations. Effective GRC connects these activities to actual business outcomes.",
      checking: "Clear distinctions.",
      difficulty: "warmup",
    },
    {
      id: "grc-and-risk-q2",
      question: "Risk versus vulnerability?",
      answer:
        "A vulnerability is a weakness, a threat is something that could exploit it, and risk combines the likelihood of that scenario with its impact on something the business cares about. The same weakness can create very different risk in different environments: an unpatched remote code execution flaw on an internet-facing server holding customer data is a much bigger risk than the same flaw on an isolated lab machine with no sensitive data.",
      checking: "Contextual assessment.",
      difficulty: "warmup",
    },
    {
      id: "grc-and-risk-q3",
      question: "What is residual risk?",
      answer:
        "It is the risk remaining after controls or other treatment are applied. The appropriate owner should understand and evaluate it. A completed remediation task does not necessarily reduce the remaining risk to zero.",
      checking: "Limits of controls.",
      difficulty: "warmup",
    },
    {
      id: "grc-and-risk-q4",
      question: "What is SOC 2?",
      answer:
        "It is an assurance examination and report about scoped controls relevant to Trust Services Criteria. It is performed by an independent CPA firm, and Security is always in scope while Availability, Processing Integrity, Confidentiality, and Privacy are optional. It is not a certification, not a personal credential, and not a promise that no breach can occur. When reviewing a vendor's report, I would check the scope, the report type and period, any exceptions the auditor found, and the controls we as the customer are expected to operate.",
      checking: "Assurance literacy.",
      difficulty: "core",
    },
    {
      id: "grc-and-risk-q5",
      question: "How does ISO 27001 differ from CSF?",
      answer:
        "ISO 27001 specifies requirements for an information security management system, and an organization can be certified against it by an accredited certification body. NIST CSF 2.0 is a voluntary framework of cybersecurity outcomes that helps organizations assess, prioritize, and communicate their approach; there is no official CSF certification. Organizations often use them together, for example using CSF profiles to describe current and target state while running an ISO-certified ISMS.",
      checking: "Framework differentiation.",
      difficulty: "core",
    },
    {
      id: "grc-and-risk-q6",
      question: "What makes good audit evidence?",
      answer:
        "It is relevant to the claim, complete for the scope, and attributable to the right source and period. I would check whether it demonstrates design or actual operation. I would document gaps rather than assume a screenshot proves everything.",
      checking: "Evidence quality.",
      difficulty: "core",
    },
    {
      id: "grc-and-risk-q7",
      question: "Who can accept a risk?",
      answer:
        "The organization's defined accountable authority should make that decision. My role would be to document the scenario, treatment options, and residual risk. I would not treat silence or an overdue ticket as formal acceptance.",
      checking: "Accountability.",
      difficulty: "core",
    },
    {
      id: "grc-and-risk-q8",
      question: "How would you explain a control gap to leadership?",
      answer:
        "I would describe the affected business process and plausible consequence. Then I would summarize the evidence and practical treatment options. I would state the decision needed and who should own it.",
      checking: "Business communication.",
      difficulty: "core",
    },
    {
      id: "grc-and-risk-q9",
      question: "What is the difference between a SOC 2 Type I and a Type II report?",
      answer:
        "A Type I report covers the description of the system and whether the controls are suitably designed as of a specific date. A Type II report also tests whether those controls operated effectively over a review period, often several months to a year, so it gives stronger assurance. When reading either, I would check the scope, the period, any exceptions the auditor found, carved-out subservice organizations, and the complementary user entity controls that we, as the customer, are expected to operate ourselves.",
      checking: "Whether you understand design versus operating effectiveness and know how to actually read a vendor's report.",
      difficulty: "core",
    },
    {
      id: "grc-and-risk-q10",
      question: "What is the difference between a policy, a standard, and a procedure?",
      answer:
        "A policy states management's intent and expectations, such as requiring least-privilege access. A standard sets specific mandatory requirements that make the policy measurable, such as requiring phishing-resistant MFA for administrators. A procedure gives the step-by-step instructions for doing the work, such as how to run the quarterly access review. Guidelines are recommended rather than mandatory. Exact names vary by organization, so I would follow the local document hierarchy.",
      checking: "Familiarity with how security programs are documented and enforced.",
      difficulty: "warmup",
    },
    {
      id: "grc-and-risk-q11",
      question: "What is a compensating control? Give an example.",
      answer:
        "It is an alternative control that meets the intent of a requirement when the primary control is not feasible. For example, a legacy system might not support MFA. A compensating approach could place it on an isolated network segment reachable only through a jump host that does require MFA, with enhanced logging of access. I would document why the primary control is not feasible, show how the alternative addresses the same risk, get approval from the right owner, and set a review date, because compensating controls should not become permanent by default.",
      checking: "Practical, risk-based problem solving instead of treating requirements as pass or fail.",
      difficulty: "core",
    },
    {
      id: "grc-and-risk-q12",
      question: "What is the difference between qualitative and quantitative risk analysis?",
      answer:
        "Qualitative analysis rates likelihood and impact on scales like low, medium, and high; it is fast and good for prioritization but subjective. Quantitative analysis estimates money values. A classic model is single loss expectancy (asset value times exposure factor) multiplied by the annualized rate of occurrence to get annualized loss expectancy. For example, if one incident would cost about $50,000 and is estimated to happen once every five years, the ALE is $50,000 times 0.2, or $10,000 per year; a $4,000-per-year control that cuts the rate to 0.05 lowers the ALE to $2,500, a reduction of $7,500. Because that reduction is larger than the $4,000 cost, the control saves roughly $3,500 a year on these assumptions. Modern approaches such as FAIR use ranges and probability distributions instead of single numbers. Either way, I would present the results as estimates with stated assumptions, not precise measurements.",
      checking: "Knowing the standard formulas and, more importantly, their limits.",
      difficulty: "stretch",
    },
  ],
  lab: {
    title: "Assess a fictional student club's membership system with CSF 2.0",
    steps: [
      "Read the NIST CSF 2.0 overview and skim the six functions and their categories (for example GV.RR roles, responsibilities, and authorities; PR.AA identity management, authentication, and access control; PR.DS data security; DE.CM continuous monitoring; RC.RP incident recovery plan execution).",
      "Describe the fictional system in a few sentences: for example, an online signup form feeding a shared spreadsheet with names, student emails, and dues status, managed by three club officers.",
      "List the assets that matter (member data, officer accounts, the spreadsheet, the form) and the business outcomes the club cares about.",
      "Write three risk scenarios in the form: if [threat event], then [consequence to an asset] because [weakness].",
      "Rate likelihood and impact for each on a simple scale, writing down the assumptions behind each rating.",
      "Choose one control per scenario and map it to a CSF 2.0 function and category.",
      "For each control, write the evidence you would request and say whether it shows the control exists, operated over time, or achieved its result.",
      "Name the person who should own each risk decision (for example, the club president or faculty advisor) and propose a treatment: reduce, avoid, transfer, or accept with a review date.",
    ],
    resourceIds: ["r50"],
    links: [],
  },
  resourceIds: ["r50", "r51", "r52", "r53"],
  extraLinks: [],
};
