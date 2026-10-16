import type { Module } from "../types";

export const prepModule: Module = {
  id: "security-internship-hiring",
  number: 1,
  title: "How Security Internship Hiring Works",
  hook: "Learn what each interview stage is trying to discover.",
  hours: 2,
  tracks: ["ALL"],
  objectives: [
    "Distinguish major security internship tracks.",
    "Explain common hiring stages and their variation.",
    "Connect résumé claims to supporting evidence.",
    "Prepare a realistic interview and application plan.",
  ],
  lesson: [
    { type: "h", text: "What teams are really hiring for" },
    {
      type: "p",
      text: "Security internships hire for **potential** as well as current ability. A team wants someone who can learn, communicate, handle access responsibly, and complete bounded work with supervision. Your degree gives context, but interviewers still need evidence of how you think.",
    },
    {
      type: "p",
      text: "A class investigation, a campus IT job, a team project, or a carefully documented lab can all provide that evidence. You do not need to pretend those experiences were production security work. Describing them accurately is a strength, not a weakness.",
    },
    { type: "h", text: "Read the role, not just the title" },
    {
      type: "p",
      text: "Start by understanding the actual role. Job titles are inconsistent across companies, so read the responsibilities and required qualifications carefully. A few examples of what different tracks often involve:",
    },
    {
      type: "list",
      items: [
        "**SOC intern:** investigates alerts and writes case notes.",
        "**AppSec intern:** reviews code and reproduces application weaknesses.",
        "**IAM intern:** helps with access reviews and identity workflows.",
        "**GRC intern:** gathers evidence and evaluates controls against requirements.",
        "**Security engineering intern:** builds or maintains protective tooling and infrastructure.",
      ],
    },
    {
      type: "p",
      text: "As you read a posting, sort each responsibility into three buckets: tasks you **understand**, tasks you have **practiced**, and tasks you still need to **investigate**. That sorting becomes your preparation plan.",
    },
    { type: "h", text: "The typical hiring sequence" },
    {
      type: "p",
      text: "A common sequence is application review, recruiter conversation, assessment, technical interview, behavioral discussion, and decision. Some employers combine stages, add coding exercises, or use a team-matching step.",
    },
    {
      type: "diagram",
      caption: "A simplified hiring flow. Real processes merge, skip, or reorder these stages.",
      lines: [
        "application --> evidence review --> conversations or exercises --> team decision",
        "",
        "  (resume,        (recruiter screen,     (technical interview,     (offer, waitlist,",
        "   transcript,     eligibility,           assessment, behavioral,   or decline)",
        "   portfolio)      logistics)             team matching)",
      ],
    },
    {
      type: "p",
      text: "Movement through this flow depends on scheduling, hiring capacity, eligibility, and competition as well as on your performance. **Silence is not a reliable technical assessment.** A slow reply often reflects the employer's timeline, not your ability.",
    },
    { type: "h", text: "What each person in the loop is checking" },
    {
      type: "list",
      items: [
        "**Recruiters** often check enrollment, graduation timing, availability, location, work authorization, and basic interest.",
        "**Technical interviewers** explore fundamentals and how you solve problems.",
        "**Hiring managers** may focus on how you ask questions, accept feedback, and work with others.",
      ],
    },
    {
      type: "callout",
      tone: "tip",
      title: "Ask about the format",
      text: "Ask the recruiter what format to expect, how long each interview lasts, and whether any tools or outside assistance are permitted. If you need accommodations, request them through the employer's stated process.",
    },
    { type: "h", text: "Your short introduction" },
    {
      type: "p",
      text: "Prepare a short introduction built from three parts: **present** (what you study and focus on), **evidence** (one concrete thing you did), and **direction** (what you want to learn next, and why this employer).",
    },
    {
      type: "callout",
      tone: "example",
      title: "Present, evidence, direction",
      text: "I'm studying cybersecurity and focusing on defensive operations. In a recent lab, I correlated authentication events and wrote a timeline that separated suspicious activity from a configuration error. I'm looking for an internship where I can develop investigation skills and learn a team's response process.",
    },
    {
      type: "p",
      text: "Use that structure with your **actual** experience and a reason specific to the employer. Aim for 45 to 90 seconds when spoken aloud.",
    },
    { type: "h", text: "Turning a project into a story" },
    {
      type: "p",
      text: "Interviewers often ask you to walk through something you built or investigated. The STAR structure (Situation, Task, Action, Result) keeps the answer focused. Here is a sample outline based on a lab, not a job:",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "**Situation:** In my security operations course, we received a week of exported authentication logs from a lab domain.",
        "**Task:** I had to decide whether a burst of failed logons was an attack or a misconfiguration.",
        "**Action:** I grouped failures by account and source host, noticed one service account failing every five minutes from a single server, and checked when its password had last changed.",
        "**Result:** The pattern matched a stale stored credential, not password guessing. I wrote a timeline with my evidence and noted what I could not confirm from logs alone.",
        "**Reflection (optional but strong):** Next time I would check the change record first, because it would have shortened the investigation.",
      ],
    },
    { type: "h", text: "Handling questions you can't fully answer" },
    {
      type: "p",
      text: "During technical questions, state your assumptions and explain your next step. If you cannot recall a command, describe the information you need and where you would verify the syntax. Saying *I haven't used that product, but I understand the underlying workflow* is useful when you follow it with a concrete explanation.",
    },
    {
      type: "callout",
      tone: "warning",
      title: "Don't bluff",
      text: "Follow-up questions quickly expose claims you cannot support, and trust matters a great deal when the role involves sensitive systems. An honest *I'm not sure, here is how I would find out* beats a confident wrong answer.",
    },
    { type: "h", text: "Keep a feedback loop" },
    {
      type: "p",
      text: "After each interview, record the questions you remember, where your explanation became unclear, and one improvement. Keep applying while you practice rather than waiting to feel completely ready; most people never feel fully ready.",
    },
    {
      type: "callout",
      tone: "interview",
      title: "A pattern that shows judgment",
      text: "Here is what I know, here is what I would verify, and here is how I would proceed safely. That pattern shows good judgment even when your knowledge is still developing.",
    },
  ],
  sayItLikeThis:
    "I'm a cybersecurity student focused on [your track], and I've been building evidence through [your real lab, class project, or campus job], where I [one concrete action and result]. I read this posting closely: the work on [specific responsibility] matches what I've practiced, and [another responsibility] is where I'd most like to grow under supervision. When I hit something I don't know, I say what I understand, what I'd verify, and how I'd proceed safely, because in security a careful answer is worth more than a fast guess.",
  terms: [
    { term: "Recruiter screen", definition: "Initial conversation about eligibility, interest, and logistics." },
    { term: "Technical screen", definition: "Evaluation of relevant knowledge and reasoning." },
    { term: "Assessment", definition: "A structured task, such as a quiz, coding exercise, or take-home, used during candidate evaluation." },
    { term: "Hiring manager", definition: "Person responsible for the team's hiring decision." },
    { term: "Competency", definition: "An ability supported by observable behavior." },
    { term: "Eligibility", definition: "Requirements determining whether someone can participate, such as enrollment status, graduation date, or work authorization." },
    { term: "Evidence", definition: "Work or examples supporting a stated capability." },
    { term: "Interview loop", definition: "The sequence of interviews and evaluations a candidate goes through." },
    { term: "STAR", definition: "Situation, Task, Action, Result: a structure for telling concise, evidence-based stories in behavioral interviews." },
  ],
  questions: [
    {
      id: "security-internship-hiring-q1",
      question: "Tell me about yourself.",
      answer:
        "I'm a cybersecurity student focusing on identity and access. My strongest example is a class project where I wrote down which roles in a sample app needed which permissions, then compared that list with the actual group memberships in a lab directory. I found accounts with access they no longer needed, including one still sitting in an admin group, and wrote up the findings with a cleanup plan. This posting mentions access reviews, so I'd like to learn how that work runs at real scale, with supervision.",
      checking: "Relevance, clarity, and truthful evidence. A strong answer follows present, evidence, direction in about a minute. This sample is a pattern to adapt; swap in your own real project and details.",
      difficulty: "warmup",
    },
    {
      id: "security-internship-hiring-q2",
      question: "Why this internship?",
      answer:
        "The posting emphasizes log analysis and incident documentation, which is the work I've enjoyed most. In my home lab I triaged failed-login alerts and wrote short case notes for each, so I already know I like that loop. From [a specific source, such as the team's blog, a talk, or my conversation with a recruiter], I learned that [one concrete detail about this team], and I'd like to see how a real team validates and escalates alerts. I can contribute careful, well-documented investigation notes while I learn your tools.",
      checking: "Specific motivation and realistic expectations. Interviewers notice a generic answer that could apply to any company, so fill in the brackets with something you actually learned.",
      difficulty: "warmup",
    },
    {
      id: "security-internship-hiring-q3",
      question: "Which security track interests you most?",
      answer:
        "My current focus is application security because I enjoy connecting a technical weakness to a practical fix. I have practiced authorized web labs and documented prevention approaches. I'm still exploring, so I'm also interested in how AppSec works with engineering and incident response.",
      checking: "Direction without unsupported certainty.",
      difficulty: "warmup",
    },
    {
      id: "security-internship-hiring-q4",
      question: "You have no professional security experience. Why hire you?",
      answer:
        "You're right that I haven't held a security job yet, so let me point to evidence instead. In my lab project I set up logging, wrote detections, tested them against activity I generated myself, and documented what they missed. In my campus IT job I handled account and access requests where mistakes mattered, so I'm used to following a procedure and asking before I act. I expect to need supervision, and I'd use feedback quickly to become useful on the team's routine work.",
      checking: "Self-awareness and learning potential. Answer the gap directly, then point to concrete evidence; use only examples you actually have.",
      difficulty: "core",
    },
    {
      id: "security-internship-hiring-q5",
      question: "What would you do if you did not know an answer?",
      answer:
        "I would explain the parts I understand and identify the uncertainty. Then I would describe how I would verify it using documentation or a controlled test. I would avoid making an operational decision based on an unverified guess.",
      checking: "Honesty and judgment.",
      difficulty: "core",
    },
    {
      id: "security-internship-hiring-q6",
      question: "How are SOC and security engineering different?",
      answer:
        "SOC work commonly emphasizes monitoring, investigation, and response coordination. Security engineering commonly emphasizes designing, implementing, and maintaining protective capabilities. The responsibilities overlap, so I would use this posting's tasks rather than assume the title defines everything.",
      checking: "Understanding of role variation.",
      difficulty: "core",
    },
    {
      id: "security-internship-hiring-q7",
      question: "How do you prepare for a technical interview?",
      answer:
        "I map the responsibilities to fundamentals, practical exercises, and my existing projects. I practice explaining one investigation or design decision aloud and review gaps that appear. I also confirm the interview format and permitted tools.",
      checking: "Deliberate preparation.",
      difficulty: "core",
    },
    {
      id: "security-internship-hiring-q8",
      question: "What questions would you ask us?",
      answer:
        "I would ask what useful work an intern typically owns and how supervision works. I would also ask how the team measures a successful internship and provides feedback. Those answers help me understand how to contribute and learn.",
      checking: "Thoughtfulness and team interest.",
      difficulty: "warmup",
    },
    {
      id: "security-internship-hiring-q9",
      question: "Walk me through a project on your résumé.",
      answer:
        "In my home lab I set up a small Linux server, forwarded its SSH and system logs to a free SIEM, and wrote a few simple alerts. The goal was to see whether I could detect repeated failed SSH logins. I generated test failures from a second VM I controlled, tuned the alert threshold so normal typos didn't fire it, and documented the setup and its limits on GitHub. The biggest lesson was that most of the work is understanding what normal looks like before deciding what is suspicious.",
      checking: "Whether the project is real, whether you understand your own decisions, and whether you can explain limitations. Expect follow-up questions on any detail you mention, so only include what you actually did.",
      difficulty: "core",
    },
    {
      id: "security-internship-hiring-q10",
      question: "How do you keep up with security news?",
      answer:
        "I skim a couple of sources each week, such as a security newsletter and a podcast, and check advisories like the CISA Known Exploited Vulnerabilities catalog when something big breaks. Recently I read about [a real incident or advisory you actually followed]. What stood out to me was [the root cause or the defensive lesson], and it made me think about how a team would check whether they were exposed.",
      checking: "Genuine curiosity and the habit of turning news into a defensive takeaway. Interviewers often ask a follow-up about the story you mention, so only cite one you actually read and understood.",
      difficulty: "warmup",
    },
    {
      id: "security-internship-hiring-q11",
      question: "Tell me about a time you received critical feedback.",
      answer:
        "On a group lab report, my instructor said my findings section listed observations without explaining why they mattered. I asked for an example of a stronger write-up, then rewrote each finding as observation, evidence, impact, and recommendation. I've used that structure on every report since, and my later reports needed far fewer revisions.",
      checking: "Coachability, which matters a lot for interns. Interviewers want a real example, a non-defensive response, and a concrete change in behavior.",
      difficulty: "core",
    },
  ],
  lab: {
    title: "Build a role map for a real posting",
    steps: [
      "Open [Microsoft Early in Profession](https://careers.microsoft.com/v2/global/en/students) (or another employer's student portal) and choose one security, identity, or operations internship posting. A live portal does not mean applications are currently open, so check the posting's own dates and eligibility.",
      "Copy five responsibilities or qualifications from the posting into a table.",
      "For each one, label it **understand**, **practiced**, or **need to investigate**.",
      "Next to each item you labeled practiced, write the specific evidence: a lab, class project, campus job, or write-up you could show or describe in detail.",
      "Pick the two weakest items and write one concrete preparation step for each, with a date (for example, finish three Bandit levels and write notes by Friday).",
      "Draft a present, evidence, direction introduction tailored to this posting and say it aloud in under 90 seconds.",
      "Review the whole map and delete any claim you have only read about but not actually done.",
    ],
    resourceIds: ["r74"],
    links: [],
  },
  resourceIds: ["r53", "r64", "r63", "r74"],
  extraLinks: [],
};
