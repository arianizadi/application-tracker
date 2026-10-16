import type { Module } from "../types";

export const prepModule: Module = {
  id: "behavioral-security-interviews",
  number: 12,
  title: "Tell Credible Security Stories",
  hook: "Show judgment through specific actions and honest reflection.",
  hours: 4,
  tracks: ["ALL"],
  objectives: [
    "Build truthful STAR stories from student experiences.",
    "Explain individual contributions within team work.",
    "Respond to ethical and interpersonal situations.",
    "Give concise answers that include results and learning.",
  ],
  lesson: [
    { type: "h", text: "Why behavioral questions matter in security" },
    {
      type: "p",
      text: "Behavioral interviews ask how you have acted because teams need more than technical vocabulary. Security work involves uncertainty, access, disagreement, deadlines, and sensitive information. A useful answer makes your decisions visible. Experiences from classes, campus jobs, volunteer work, clubs, or personal projects are valid when they demonstrate the relevant behavior. Do not invent a breach response or professional responsibility because you assume ordinary student experience is insufficient.",
    },
    { type: "h", text: "The STAR structure" },
    {
      type: "p",
      text: "STAR stands for **Situation, Task, Action, and Result**. Briefly establish the context and your responsibility, spend most of the answer on what you did, and finish with the outcome and learning. Add reflection when it helps explain what you would change. The structure should support a natural conversation rather than sound like four memorized headings.",
    },
    {
      type: "diagram",
      caption: "STAR as a flow, with a rough sense of where the time goes",
      lines: [
        "context → responsibility → decisions and actions → observed outcome → improvement",
        "(Situation) (Task)          (Action)                (Result)           (Reflection)",
        "  brief       brief          most of your answer     concrete           one or two sentences",
      ],
    },
    {
      type: "callout",
      tone: "tip",
      title: "Length",
      text: "Aim for roughly one and a half to two and a half minutes per story, then stop and let the interviewer ask follow-ups. If your setup takes longer than your actions, cut the setup.",
    },
    { type: "h", text: "Build a story bank" },
    {
      type: "p",
      text: "Build a small story bank so you are not inventing answers under pressure. One project can support several stories, but change the emphasis to answer the actual question.",
    },
    {
      type: "list",
      items: [
        "**Teamwork:** a group project where you can name your specific contribution.",
        "**A mistake:** something you got wrong, how you found it, and what you changed.",
        "**Learning something unfamiliar:** a tool, language, or concept you picked up quickly.",
        "**Disagreement:** a time you saw a problem differently from someone else.",
        "**Prioritization:** competing deadlines and how you decided what came first.",
        "**Ethical judgment:** a time you protected information, respected a boundary, or raised a concern.",
      ],
    },
    {
      type: "p",
      text: "Distinguish *we* from *I*: credit the team while identifying your contribution. If you do not know the project's final business impact, describe the result you observed rather than inventing a percentage or revenue estimate.",
    },
    { type: "h", text: "Telling a mistake story well" },
    {
      type: "p",
      text: "A mistake story should show ownership without suggesting carelessness is acceptable. Explain how you noticed the issue, limited its effects, informed the right person, corrected it, and changed your process. For example, a lab configuration error may have caused missing logs. The lesson is stronger when you explain how you verified collection afterward than when you claim you *learned to be more careful* without a concrete change.",
    },
    {
      type: "callout",
      tone: "example",
      title: "Sample STAR outline (adapt only if it is true for you)",
      text: "**Situation:** In a two-person class project, we built a small home lab that forwarded Linux logs to a SIEM for a detection exercise. **Task:** I owned the log-forwarding setup. **Action:** While testing our detection, I noticed it never fired. Instead of assuming the rule was wrong, I checked the SIEM for recent events from that host and found nothing after a config change I had made. I told my partner right away, rolled back the change, confirmed events were arriving again, then fixed the setting properly. **Result:** We re-ran the test and the detection fired; we lost a day but submitted on time. **Reflection:** I now verify that data is arriving after every configuration change and keep a short checklist for it, because an empty result can mean *no data* rather than *no activity*.",
    },
    { type: "h", text: "Disagreements are about tradeoffs" },
    {
      type: "p",
      text: "Security disagreements often involve tradeoffs. A developer may resist a proposed control because it disrupts users, or an analyst may interpret evidence differently. Clarify the shared goal, listen to the other reasoning, and bring evidence or a small test. Escalate unresolved decisions through the appropriate owner. Respectful disagreement does not require pretending every proposal is equally sound; it requires separating the person from the technical and business question.",
    },
    { type: "h", text: "Ethics questions test boundaries and trust" },
    {
      type: "p",
      text: "If you discover access you should not have, do not explore it to prove curiosity. Stop unnecessary interaction, preserve minimal appropriate context, and report through the correct channel. If someone asks you to hide a finding or misstate evidence, explain the factual issue and escalate appropriately. An intern should be willing to ask for guidance while still recognizing clearly improper requests.",
    },
    {
      type: "callout",
      tone: "warning",
      title: "Do not borrow stories",
      text: "Model answers in this course show structure and reasoning. They are not stories to claim as your own. Interviewers probe with follow-ups like \"What exactly did you configure?\" or \"What would you do differently?\", and invented details rarely survive them.",
    },
    { type: "h", text: "Practice out loud" },
    {
      type: "p",
      text: "Practice aloud with a partner and ask what they understood about your role, reasoning, and result. Remove excessive setup and details that do not affect the decision. A credible, modest story with reflection usually gives a better signal than a dramatic story whose details cannot withstand follow-up.",
    },
    {
      type: "callout",
      tone: "interview",
      title: "Say it like this",
      text: "Here was my responsibility, here is what I observed, and here is why I chose that action.",
    },
  ],
  sayItLikeThis:
    "I answer behavioral questions with short, truthful STAR stories drawn from my real experience: classes, projects, jobs, and clubs. I keep the situation brief, spend most of the time on what I specifically did and why, and finish with the result I actually observed and what I changed afterward. I say *we* for team outcomes and *I* for my own decisions. On ethics or security judgment, I stay inside my authorization, stop and report when something looks wrong, and escalate to the right person instead of hiding or stretching the facts. I would rather tell a modest story I can defend in detail than a dramatic one that falls apart at the first follow-up.",
  terms: [
    { term: "STAR", definition: "Situation, Task, Action, and Result." },
    { term: "Ownership", definition: "Taking responsibility for one's actions and follow-through." },
    { term: "Escalation", definition: "Routing an issue to an appropriate authority." },
    { term: "Reflection", definition: "Evaluation of what worked and what should change." },
    { term: "Conflict resolution", definition: "Constructive handling of differing views." },
    { term: "Confidentiality", definition: "Appropriate protection of sensitive information." },
    { term: "Feedback", definition: "Information used to improve performance." },
    { term: "Scope of authority", definition: "Decisions and actions a person is permitted to take." },
    { term: "Story bank", definition: "A prepared set of true experiences you can adapt to different behavioral questions." },
  ],
  questions: [
    {
      id: "behavioral-security-interviews-q1",
      question: "Tell me about a mistake.",
      answer:
        "In a suitable real example, I would explain the error and my responsibility directly. I would describe how I corrected it, communicated the impact, and verified the fix. I would finish with the specific process change I now use.",
      checking: "Ownership and learning; replace with an actual story.",
      difficulty: "core",
    },
    {
      id: "behavioral-security-interviews-q2",
      question: "Tell me about a disagreement.",
      answer:
        "I would describe the shared goal and the two competing approaches. My answer would focus on listening, gathering evidence, and testing assumptions rather than proving someone wrong. I would explain the decision and what I learned from it.",
      checking: "Constructive collaboration.",
      difficulty: "core",
    },
    {
      id: "behavioral-security-interviews-q3",
      question: "What if you found unauthorized access?",
      answer:
        "I would stop right away and not browse, download, or test further to see how far it goes. I would write down only what someone needs to reproduce and fix it, such as the system, the path or link, the time, and how I got there, without copying the sensitive data itself. Then I would report it promptly to my supervisor or the security contact and not discuss it with anyone else. If it happened during an authorized test and the system was outside scope, I would pause and notify the engagement lead as the rules of engagement require, rather than expanding the test on my own.",
      checking: "Ethical boundaries.",
      difficulty: "core",
    },
    {
      id: "behavioral-security-interviews-q4",
      question: "What if a teammate wanted to omit a finding?",
      answer:
        "I would ask about the concern and distinguish a disputed conclusion from hiding evidence. I would keep the report factual and seek review from the appropriate lead. I would not knowingly misrepresent a result.",
      checking: "Integrity and escalation.",
      difficulty: "stretch",
    },
    {
      id: "behavioral-security-interviews-q5",
      question: "How do you handle feedback?",
      answer:
        "I ask for a concrete example and the expected behavior. Then I apply the feedback and check whether the result improved. A real example should show the change, not just say I am receptive.",
      checking: "Coachability.",
      difficulty: "warmup",
    },
    {
      id: "behavioral-security-interviews-q6",
      question: "How do you prioritize several tasks?",
      answer:
        "I clarify deadlines, impact, dependencies, and who owns the priorities. I communicate tradeoffs early if everything cannot be completed. I then track the agreed work and raise blockers before they become surprises.",
      checking: "Reliability.",
      difficulty: "warmup",
    },
    {
      id: "behavioral-security-interviews-q7",
      question: "Tell me about learning something difficult.",
      answer:
        "I would choose an actual example and explain the initial gap. I would describe how I broke it into smaller tasks, used documentation, and checked understanding through practice. I would finish with what I can now do and what remains unfamiliar.",
      checking: "Learning process.",
      difficulty: "core",
    },
    {
      id: "behavioral-security-interviews-q8",
      question: "What if you caused a security problem?",
      answer:
        "I would report it right away to my supervisor or through the incident process, even if I think I can fix it quietly, because the people responsible may need to act or preserve evidence. I would give accurate facts, including what I did and when, without minimizing it. I would help limit the impact only within my authority and avoid destructive cleanup that could erase evidence. Afterward I would take part in the review and propose a concrete change, such as a checklist or a guardrail, so it does not happen again.",
      checking: "Trust under pressure.",
      difficulty: "stretch",
    },
    {
      id: "behavioral-security-interviews-q9",
      question: "Why do you want to work in security, and why here?",
      answer:
        "I would give one specific, true moment that drew me to security, such as a class, lab, or project, and connect it to the kind of work this team does, for example detection, application security, or risk. Then I would name something concrete about the company or role that I researched, like the products they protect or the responsibilities in the posting, and explain what I hope to learn and contribute. I would keep it under a minute and avoid generic lines like \"I am passionate about security\" without evidence.",
      checking: "Genuine motivation, preparation, and whether your interests match the role.",
      difficulty: "warmup",
    },
    {
      id: "behavioral-security-interviews-q10",
      question: "Tell me about a time you explained something technical to a non-technical person.",
      answer:
        "I would pick a real example, such as helping a family member, club member, or classmate understand a security issue. I would describe how I found out what they already knew, replaced jargon with an analogy or a concrete consequence, focused on the one action they needed to take, and checked understanding by asking them to explain it back. I would end with what they did afterward, which shows whether the explanation worked.",
      checking: "Communication skills, since security teams constantly explain risk to people outside security.",
      difficulty: "core",
    },
    {
      id: "behavioral-security-interviews-q11",
      question: "How do you stay current in cybersecurity?",
      answer:
        "I would name two or three sources I actually use, such as a newsletter like tl;dr sec, a podcast like the SANS Internet Storm Center daily stormcast or Risky Business, or vendor and government advisories such as the CISA Known Exploited Vulnerabilities catalog. Then I would give one recent example of something I read and what I did with it, like reproducing it in a lab, checking whether it affected a project, or discussing it at a club meeting. A short, honest routine with one concrete follow-through is stronger than a long list of sources.",
      checking: "Curiosity and a sustainable learning habit, verified by a real example rather than a list of names.",
      difficulty: "warmup",
    },
    {
      id: "behavioral-security-interviews-q12",
      question: "Do you have any questions for us?",
      answer:
        "Yes, always prepare two or three. Good ones show interest in the actual work: what a typical week looks like for an intern on this team, how interns get feedback and from whom, what a successful intern project looked like last year, or which tools and data sources the team relies on most. Avoid questions the job posting already answers, and save compensation logistics for the recruiter unless the interviewer raises them.",
      checking: "Engagement and preparation; whether you are evaluating fit, not just hoping for an offer.",
      difficulty: "warmup",
    },
  ],
  lab: {
    title: "Build and rehearse a six-story bank",
    steps: [
      "Browse the behavioral and scenario prompts in the Jassics security interview questions repository and pick six that cover teamwork, a mistake, learning something unfamiliar, disagreement, prioritization, and ethical judgment.",
      "For each prompt, choose a true experience from classes, projects, jobs, volunteering, or clubs. Do not invent or borrow details.",
      "Write each story as a short STAR outline: one line each for Situation and Task, three to five bullets for Action, and one line each for Result and Reflection.",
      "Mark every place you say *we* and add what *you* specifically did.",
      "Replace any guessed numbers or impacts with results you actually observed.",
      "Practice two stories aloud with a partner, timing each at about two minutes.",
      "Ask your partner to repeat back your action, your result, and your learning; revise any story where they could not.",
      "Have your partner ask one follow-up per story (for example, \"What would you do differently?\") and note any detail you could not answer confidently.",
    ],
    resourceIds: ["r63"],
    links: [],
  },
  resourceIds: ["r63", "r64", "r83", "r71", "r72", "r73", "r86"],
  extraLinks: [],
};
