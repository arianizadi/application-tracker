import type { Module } from "../types";

export const prepModule: Module = {
  id: "portfolio-and-projects",
  number: 14,
  title: "Make Your Work Easy to Evaluate",
  hook: "Show a question, a method, a result, and your own judgment.",
  hours: 5,
  tracks: ["ALL"],
  objectives: [
    "Select projects relevant to an internship track.",
    "Document reproducible work and meaningful limitations.",
    "Write factual résumé bullets and project explanations.",
    "Present projects without exposing secrets or restricted material.",
  ],
  lesson: [
    { type: "h", text: "What a portfolio is for" },
    {
      type: "p",
      text: "A portfolio gives an interviewer something concrete to discuss. It does not need many repositories or expensive equipment. **Two well-explained projects** can be enough to show curiosity, technical foundations, and follow-through.",
    },
    {
      type: "p",
      text: "The strongest projects answer a question and produce evidence. Installing a tool is a starting point; investigating an event, testing a control, or evaluating a design shows what you can do with it.",
    },

    { type: "h", text: "Match projects to the work you want" },
    {
      type: "p",
      text: "Choose projects that resemble the work of your target role. Label every simulation, dataset, and assumption clearly so no one mistakes a lab for production experience.",
    },
    {
      type: "list",
      items: [
        "**SOC:** Investigate a supplied log set and produce a timeline with a case note.",
        "**AppSec:** Document an authorized lab finding, its root cause, and the fix, including a test that proves the fix works.",
        "**IAM:** Model a joiner-mover-leaver process and test permissions in a safe environment.",
        "**GRC:** Build a fictional risk register and explain which evidence you would request for each control.",
        "**Detection engineering:** Write one detection, test it against the intended behavior and benign activity, and document its gaps.",
      ],
    },

    { type: "h", text: "A structure that makes your work easy to evaluate" },
    {
      type: "diagram",
      caption: "Project write-up flow: each stage answers a question a reviewer will ask",
      lines: [
        "purpose  -->  environment  -->  method  -->  evidence",
        "  (why?)       (where?)          (how?)      (what did you see?)",
        "                                                 |",
        "                                                 v",
        "next steps  <--  limitations  <--  result",
        "(what now?)      (what it does NOT show)  (what you concluded)",
      ],
    },
    {
      type: "p",
      text: "Include enough detail for another person to understand or reproduce the work under the same authorized conditions. Explain why you selected the telemetry or tool and what alternatives you considered. Record versions when they matter. Screenshots should support the explanation, not replace it, and should avoid unnecessary personal or sensitive data.",
    },
    {
      type: "code",
      lang: "markdown",
      caption: "A README skeleton you can copy into a project repository",
      code: `# Detecting Repeated Failed Logons in a Wazuh Lab

## Purpose
Question: can I alert on repeated failed SSH logons against one lab VM,
and what benign activity would also trigger it?

## Environment (lab only)
- Wazuh all-in-one server (version noted here) on a local VM
- One Ubuntu test VM with the Wazuh agent (SSH enabled)
- A second lab VM used only to generate test logons
- All VMs on a host-only network; no real users or personal data

## Method
1. Generated failed logons from a second lab VM.
2. Generated a benign case: a user mistyping their password twice.
3. Reviewed the alerts and the raw auth.log entries behind them.

## Evidence
- Screenshots of alerts (hostnames are lab names only)
- Excerpt of the raw log lines that matched

## Result
The rule fired on the scripted attempts and also on the benign case,
so on its own it cannot distinguish guessing from user error.

## Limitations
- One host, one protocol (SSH); no password-spraying test
- Default thresholds; not tuned for a real environment

## Next steps
Add a frequency threshold per source, and correlate by source across
multiple accounts to separate guessing and spraying from typos.`,
    },

    { type: "h", text: "Detection and forensic projects" },
    {
      type: "p",
      text: "For a **detection** project, explain the behavior you wanted to identify, the logs it requires, your test conditions, and the alert you observed. Include at least one benign case and one limitation. A rule that matches one demonstration does not automatically detect every implementation of an ATT&CK technique.",
    },
    {
      type: "p",
      text: "For a **forensic** project, document dataset provenance, evidence handling, tool actions, and uncertainty. Your reasoning matters more than obtaining a challenge's final answer.",
    },

    { type: "h", text: "Homelabs that fit your resources" },
    {
      type: "p",
      text: "Browser labs, public datasets, campus environments, and small local virtual machines can all produce valuable evidence. Review hardware requirements before installing a large monitoring stack. Keep vulnerable systems isolated (for example, on a host-only or internal virtual network) and avoid real personal data. If a cloud exercise creates billable resources, verify cleanup afterward.",
    },
    {
      type: "callout",
      tone: "tip",
      text: "A maintained, modest lab that you understand is easier to defend in an interview than a copied architecture you cannot explain.",
    },

    { type: "h", text: "Résumé bullets that hold up to questions" },
    {
      type: "p",
      text: "Write résumé bullets with an action, a task, a method, and a supported result. Use numbers only when you measured them, and say \"lab\" when it was a lab. Do not write \"prevented a breach\" because a simulated alert fired. List certifications accurately as earned, in progress, or planned.",
    },
    {
      type: "callout",
      tone: "example",
      title: "Before and after",
      text: "**Weak:** \"Used Splunk, Wireshark, and Wazuh for threat detection.\" (Tool list, no question, no result.) **Stronger:** \"Analyzed a public authentication-log dataset, correlated failed and successful logons, and documented three competing explanations with supporting evidence.\" (Action, method, honest result.) **Also strong, for a lab:** \"Built a three-VM Wazuh lab, generated scripted and benign SSH logon failures, and documented that the default rules alerted on both; proposed source-based correlation to separate them.\"",
    },

    { type: "h", text: "Publishing safely" },
    {
      type: "p",
      text: "Before you make a repository public, check for credentials, tokens, personal data, internal identifiers, and restricted material, including in screenshots, sample files, and **git history**. Deleting a secret in a new commit does not remove it from earlier commits.",
    },
    {
      type: "code",
      lang: "bash",
      caption: "A rough, read-only first pass over every commit on every branch for likely secrets. It is noisy and misses many formats, so also run a dedicated scanner such as Gitleaks or TruffleHog, and turn on GitHub secret scanning and push protection for public repositories.",
      code: `git log -p --all | grep -inE "password|passwd|secret|api[_-]?key|token|BEGIN .*PRIVATE KEY"`,
    },
    {
      type: "callout",
      tone: "warning",
      text: "If a real secret was ever pushed, assume it is exposed: revoke or rotate it first, then check its logs for use. Rewriting history afterward (for example, with `git filter-repo`) helps, but copies may already exist in forks, clones, or caches, and automated scanners can pick up public secrets within minutes.",
    },
    {
      type: "p",
      text: "Respect CTF publication rules, dataset licenses, and confidentiality obligations. Link to a challenge instead of publishing restricted solutions, and credit any material you reused.",
    },

    { type: "h", text: "Talking through a project" },
    {
      type: "p",
      text: "Prepare a two-minute walkthrough and a deeper version for follow-up questions. Cover the same five points in both.",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "**The question** and why it mattered.",
        "**Your contribution**, separated from the team's or the tutorial's.",
        "**The hardest decision** and the alternatives you weighed.",
        "**The result**, stated no more strongly than the evidence supports.",
        "**What you would improve** next and why that improvement matters most.",
      ],
    },
    {
      type: "callout",
      tone: "interview",
      title: "Say it like this",
      text: "\"This was a controlled project. Here is the evidence I produced, the part I personally owned, and the limitation I would address next.\"",
    },
  ],
  sayItLikeThis:
    "I keep my portfolio small and focused: a couple of projects that match the role, each written up as a question, an environment, a method, the evidence I collected, the result, and its limitations. I label labs and simulations as labs, and I only use numbers I actually measured. For example, in a detection project I show the telemetry it depends on, a benign case that also triggered it, and what it would miss. Before publishing anything I check the code, screenshots, and git history for secrets or personal data. When I walk through a project, I'm clear about what I personally owned, the hardest decision I made, and the limitation I would fix next.",
  terms: [
    { term: "Portfolio", definition: "Selected work demonstrating relevant capabilities." },
    { term: "Reproducibility", definition: "Ability to repeat a method under documented conditions." },
    { term: "README", definition: "Project document explaining purpose and usage." },
    { term: "Artifact", definition: "Output or evidence produced during work." },
    { term: "Validation", definition: "Check that a result supports the intended claim." },
    { term: "Limitation", definition: "Boundary on what a result establishes." },
    { term: "Homelab", definition: "Personally managed environment for authorized learning." },
    { term: "Attribution", definition: "Credit identifying the source of work or material." },
    { term: "Secret rotation", definition: "Replacing an exposed credential with a new one and invalidating the old one; the required response when a secret leaks." },
  ],
  questions: [
    {
      id: "portfolio-and-projects-q1",
      question: "Walk me through your best project.",
      answer:
        "I would use the five-part shape with a real example. For instance: \"I wanted to know whether I could alert on SSH password guessing in a small Wazuh lab, and what benign activity would also trigger it. I built three VMs on a host-only network, generated scripted failures and a user mistyping twice, and compared the alerts with the raw auth.log lines. The default rules fired on both, so on their own they could not separate guessing from typos. I owned the whole lab; the hardest decision was keeping it small enough to finish. Next I would add per-source thresholds and test a spraying pattern.\" Then I would stop and let the interviewer pick what to dig into.",
      checking: "Ownership and depth.",
      difficulty: "warmup",
    },
    {
      id: "portfolio-and-projects-q2",
      question: "What makes a project useful for a SOC internship?",
      answer:
        "It should show investigation rather than only installation. A clear hypothesis, correlated evidence, timeline, and case note demonstrate relevant work. I would also explain uncertainty and false-positive considerations.",
      checking: "Role relevance.",
      difficulty: "core",
    },
    {
      id: "portfolio-and-projects-q3",
      question: "Do you need an expensive homelab?",
      answer:
        "No, useful evidence can come from browser labs, public datasets, campus systems, or small local environments. The important part is a question I can investigate and explain. I would choose a setup that I can maintain and validate.",
      checking: "Practical priorities.",
      difficulty: "warmup",
    },
    {
      id: "portfolio-and-projects-q4",
      question: "How do you know your detection works?",
      answer:
        "First I confirm the telemetry actually arrives, because a rule cannot fire on logs that are never collected. Then I run a positive test of the intended behavior in an authorized lab, for example with an Atomic Red Team test, and at least one benign case that looks similar, and I record whether each produced an alert. I also try a simple variation of the behavior to see what the rule misses. That supports a bounded claim like \"it detects this implementation under these conditions,\" not \"it detects the ATT&CK technique,\" and I retest after any change.",
      checking: "Validation discipline.",
      difficulty: "stretch",
    },
    {
      id: "portfolio-and-projects-q5",
      question: "What would you improve in your project?",
      answer:
        "I would identify the most consequential limitation rather than add features arbitrarily. For example, I might improve timestamp handling or test additional benign activity. I would explain how that change improves confidence in the result.",
      checking: "Reflection and prioritization.",
      difficulty: "core",
    },
    {
      id: "portfolio-and-projects-q6",
      question: "How would you describe a CTF on your résumé?",
      answer:
        "I would label it as a competition or training challenge, name the skills I practiced, and include results only if they are verifiable, with team size when it was a team effort. For example: \"Competed in (event name) on a four-person team; solved the web and forensics challenges, including recovering a deleted file from a disk image.\" I would not imply production responsibility, and I would link to a writeup only where the event's rules allow publishing solutions.",
      checking: "Honest representation.",
      difficulty: "core",
    },
    {
      id: "portfolio-and-projects-q7",
      question: "What should you remove before publishing a project?",
      answer:
        "I would check for credentials, tokens, personal data, internal identifiers, and restricted material. I would also review screenshots, history, and sample files. If a secret was exposed, removing the visible text alone would not replace revocation and investigation.",
      checking: "Publication hygiene.",
      difficulty: "core",
    },
    {
      id: "portfolio-and-projects-q8",
      question: "How did you contribute to a team project?",
      answer:
        "I would distinguish the team outcome from the components I personally owned. I would describe interfaces, decisions, and collaboration with teammates. I would be clear about parts I understand conceptually but did not implement.",
      checking: "Accurate ownership.",
      difficulty: "core",
    },
    {
      id: "portfolio-and-projects-q9",
      question: "Tell me about a project that didn't work the way you expected.",
      answer:
        "I would pick a real example and describe what I expected, what actually happened, and how I found out. For instance, a detection might have fired on benign activity, or a lab tool might not have collected the logs I assumed it did. I would explain how I diagnosed the gap, what I changed or documented as a limitation, and what I now check earlier in a project. The point is to show that I learn from evidence rather than hide the result.",
      checking: "Honesty, debugging process, and the ability to learn from a negative result.",
      difficulty: "core",
    },
    {
      id: "portfolio-and-projects-q10",
      question: "How did you keep your homelab from becoming a risk to your own network?",
      answer:
        "I would describe the concrete controls I used: running intentionally vulnerable machines on a host-only or internal virtual network with no route to my home network or the internet, taking snapshots so I could reset to a known state, and not storing real credentials or personal data in the lab. If I used cloud resources, I would mention restricting inbound access and confirming that everything was deleted afterward. I would only claim controls I actually set up.",
      checking: "Practical isolation habits and treating a lab as something that also needs securing.",
      difficulty: "core",
    },
    {
      id: "portfolio-and-projects-q11",
      question: "If I open your GitHub, what should I look at first, and what will I learn from it?",
      answer:
        "I would point to the one or two pinned projects most relevant to this role and summarize each in a sentence: the question it answers and what it shows about how I work. I would mention that each README explains the environment, method, evidence, and limitations, so a reviewer can evaluate it in a few minutes. I would also be upfront about which parts were adapted from tutorials and which were my own.",
      checking: "Whether you can direct a busy reviewer to relevant evidence and represent your work accurately.",
      difficulty: "warmup",
    },
  ],
  lab: {
    title: "Plan a two-project portfolio and document one tested exercise",
    steps: [
      "Write down your target track (for example SOC, AppSec, or IAM) and list two project ideas that resemble that work. One can be something you have already done.",
      "Read GitHub's profile customization guidance. Plan a short profile README (it lives in a public repository named exactly like your username) and decide which two repositories you will pin.",
      "Check whether your hardware can run a small monitoring lab using the requirements in the Wazuh Quickstart. If it cannot, choose an existing browser lab you completed and document that instead.",
      "If your hardware is suitable, install Wazuh in an isolated lab and complete one safe exercise from the Wazuh proof-of-concept guide, such as file integrity monitoring or brute-force detection, against your own test VM only.",
      "Run the intended behavior and at least one benign activity, and capture the alert and the raw log entries behind it.",
      "Write the README using the structure purpose, environment, method, evidence, result, limitations, next steps. Note software versions.",
      "Before publishing, review files, screenshots, and git history for secrets, personal data, and real hostnames. Remove or redact them, and rotate anything real that was ever committed.",
      "Write one factual résumé bullet for the project and rehearse a two-minute walkthrough that names the part you personally owned and one limitation.",
      "If you used any cloud resources, delete them and confirm in the billing or resource console that nothing is still running.",
    ],
    resourceIds: ["r65", "r38", "r87"],
    links: [],
  },
  resourceIds: ["r65", "r64", "r38", "r87", "r32", "r37"],
  extraLinks: [],
};
