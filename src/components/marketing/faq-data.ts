/**
 * FAQ content. Plain strings (no markup) so the same data feeds the page,
 * the client-side search, and the FAQPage JSON-LD. Paragraphs are separated
 * by blank lines ("\n\n"); lines starting with "• " render as a list.
 */
export type FaqItem = {
  id: string;
  q: string;
  a: string;
  links?: { href: string; label: string }[];
};

export type FaqGroup = { id: string; title: string; blurb: string; items: FaqItem[] };

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: "using-canopy",
    title: "Using Canopy",
    blurb: "The basics, and the small things that save you time.",
    items: [
      {
        id: "free",
        q: "Is Canopy free? Who can use it?",
        a: "Yes, it's free, and anyone can make an account. Canopy was designed with cybersecurity students in mind, but tracking works for any field. Pick a track when you sign up (or later in Settings) and the analyzer and prep suggestions tune themselves to it.",
        links: [{ href: "/signup", label: "Create an account" }],
      },
      {
        id: "quick-add",
        q: "How fast is adding an application, really?",
        a: "Company and role are the only required fields, so most people are done in about ten seconds. Status defaults to Applied. Links, deadlines, contacts, salary, notes and how excited you are can all be added later, or never.\n\nOn your phone, the + button in the middle of the bottom bar opens quick add from anywhere.",
      },
      {
        id: "drafts",
        q: "What happens if I close the tab halfway through a form?",
        a: "Nothing is lost. Forms save a draft on your device as you type, and you'll see a small \"Draft saved\" note. When you come back, Canopy restores the draft and offers a one-tap discard if you'd rather start fresh. Drafts live in this browser only until you hit Save, which stores the record in your account.",
      },
      {
        id: "correct-status",
        q: "Can I fix a status or date I got wrong?",
        a: "Yes. Open the application and change its status or dates whenever you need to. Each status change is recorded in the application's history, and your stats are recalculated from your corrected data.",
      },
      {
        id: "phone",
        q: "Does it work on my phone?",
        a: "It's built mobile-first. On iPhone, tap Share then \"Add to Home Screen\"; on Android, use \"Install app\" or \"Add to Home screen\" in your browser menu. Canopy then opens full screen like a regular app.",
      },
      {
        id: "export",
        q: "Can I export my data?",
        a: "Anytime. Settings → Your data → Export downloads a JSON file with your profile, every application (with notes and status history), resume versions and their text, analyzer results, achievements and prep progress. Original PDF files aren't bundled into the export to keep it small.",
        links: [{ href: "/settings", label: "Go to Settings" }],
      },
      {
        id: "streaks",
        q: "Do I have to keep a streak?",
        a: "No. Canopy uses a gentle weekly rhythm instead of a daily streak, and you choose the number (anywhere from 1 to 30 applications a week). Missing a week doesn't reset or punish anything. Your rhythm is a suggestion, not a contract.",
      },
    ],
  },
  {
    id: "forest-game",
    title: "The forest & the game",
    blurb: "How effort turns into trees, XP, and the occasional celebrating otter.",
    items: [
      {
        id: "forest",
        q: "How does my forest grow?",
        a: "Every application plants a tree. Preparation adds life to the clearing, interviews bring visitors, offers light lanterns, and big milestones add landmarks. The scene also follows your local time of day, so a late-night session looks like one.",
      },
      {
        id: "rejection",
        q: "Does a rejection remove my progress?",
        a: "Never. The tree stays. A few mushrooms appear underneath it, because rejections become compost: they're part of the record of you showing up, not a deduction from it. Your XP and achievements stay too.",
      },
      {
        id: "break",
        q: "What happens if I take a break?",
        a: "Your forest stays healthy. Nothing wilts, dies, or guilt-trips you. Exams, burnout, and summer jobs happen. When you come back: welcome back, no explanation required.",
      },
      {
        id: "xp",
        q: "How do XP and levels work?",
        a: "You earn XP for actions you control: applying, following up, prepping, improving a resume, checking a match. You don't earn (or lose) XP based on whether a company replies, because that part isn't up to you. XP fills levels, and levels unlock new forest stages and achievements.",
        links: [{ href: "/achievements", label: "See achievements" }],
      },
      {
        id: "ghosted",
        q: "Is 30 days of silence definitely ghosting?",
        a: "No. Long silence only triggers a gentle suggestion to follow up, keep waiting, or close it out. You choose the label. Plenty of internship replies arrive weeks late, and Tuck the turtle is happy to keep waiting with you.",
      },
      {
        id: "mascots",
        q: "Who are all these animals?",
        a: "Twelve small helpers, each with one job: Alder the owl gives practical advice, Pip the fox helps with interviews, Moss the sloth guards your breaks, Nib the beaver runs the resume workshop, Rue the raccoon hunts keywords, Prickle the hedgehog sits with you after rejections, Miso the otter throws the parties, and a few more. They appear at the right moment and then leave you alone.",
      },
    ],
  },
  {
    id: "resumes-analyzer",
    title: "Resumes & analyzer",
    blurb: "Versions, keyword matches, and what the percentage actually means.",
    items: [
      {
        id: "versions",
        q: "Why keep multiple resume versions?",
        a: "Because six weeks from now you won't remember which resume you sent to which company. Canopy numbers each version (v1, v2, v3…), lets you mark a default, and links applications to the version you used, so you can bring the right one to the interview and see which version gets more replies.",
        links: [{ href: "/resumes", label: "Open resumes" }],
      },
      {
        id: "file-types",
        q: "What can I upload?",
        a: "PDF resumes up to 4 MB, or paste the text directly. Canopy extracts the text from your PDF for the analyzer. Scanned or image-only PDFs don't contain readable text, so if extraction comes back empty, paste your resume text instead.",
      },
      {
        id: "analyzer-predict",
        q: "Is the analyzer predicting my chances?",
        a: "No. It compares the language in your resume with a role preset or a job description you paste, and shows exactly which recognized terms it found and which it didn't. It's a wording check, not a verdict, and it doesn't know anything about the hiring manager's mood.",
      },
      {
        id: "missing-keyword",
        q: "Why is a keyword marked missing when I know that skill?",
        a: "It wasn't found in the extracted text or in the synonyms Canopy recognizes (for example \"SIEM\" vs \"security information and event management\"). If the skill is genuinely yours, add it in the words the posting uses. If it isn't, leave it out. Only add things that are true.",
      },
      {
        id: "keyword-stuffing",
        q: "Should I stuff my resume with keywords to get a higher score?",
        a: "Please don't. Resumes are screened by software and then read by humans, and humans notice a keyword pile instead of real work. A better approach:\n\n• Mirror the posting's exact phrasing for things you've actually done.\n• Put tools in context: \"Built Splunk dashboards to triage 2k daily alerts\" beats a bare \"Splunk\".\n• Lead bullets with the result, then how you got there.",
      },
    ],
  },
  {
    id: "interview-prep",
    title: "Interview prep",
    blurb: "The built-in course, and how to walk in prepared.",
    items: [
      {
        id: "prep-course",
        q: "What's in the interview prep course?",
        a: "A cybersecurity-focused course with fundamentals refreshers, practice questions, flashcards, and behavioral story prep. You can mark things done or saved, and your progress stays put between sessions. Canopy also suggests what to review based on the roles you're applying for.",
        links: [{ href: "/prep", label: "Open interview prep" }],
      },
      {
        id: "not-cyber",
        q: "I'm not in cybersecurity. Is prep still useful?",
        a: "The behavioral and story-building parts work for any internship interview: telling a project story, handling \"tell me about a time…\", and asking good questions back. Set your track in Settings so suggestions match your field.",
      },
      {
        id: "tech-interview",
        q: "How do I prepare for a technical cybersecurity interview?",
        a: "Intern interviews mostly check fundamentals and how you think, not encyclopedic knowledge.\n\n• Know the basics cold: TCP vs UDP, the three-way handshake, DNS resolution, what happens in a TLS handshake, common ports, and HTTP status codes.\n• Be able to walk through an attack end to end, like phishing to credential theft to lateral movement, and how you'd detect each step.\n• Have two or three project or lab stories ready, with what broke and how you fixed it.\n• \"I don't know, but here's how I'd find out\" is a strong answer. Guessing confidently is not.",
      },
    ],
  },
  {
    id: "privacy-security",
    title: "Privacy & security",
    blurb: "What we store, who can see it, and how to take it with you.",
    items: [
      {
        id: "who-sees",
        q: "Who can see my data?",
        a: "Only you. Every read and write on the server is scoped to your signed-in account, there are no public profiles, and nothing is shared with recruiters, advertisers or anyone else. Canopy has no ads and doesn't sell data.",
      },
      {
        id: "passwords",
        q: "How is my password stored?",
        a: "Passwords are hashed with scrypt and never stored or logged in plain text. Sign-in uses a random session token in an httpOnly cookie, and only a hash of that token is kept in the database. Sign-in attempts are rate-limited. You can change your password or sign out of every device from Settings.",
      },
      {
        id: "ai",
        q: "Does an AI read my resume?",
        a: "No. The analyzer uses transparent keyword matching and shows you its evidence. Your resume isn't sent to third-party AI services.",
      },
      {
        id: "delete",
        q: "How do I delete my account?",
        a: "Settings → Danger zone. Confirm with your password and Canopy deletes your account, applications, resumes (including files), analyses, achievements, prep progress and sessions right away. Export first if you'd like a copy.",
        links: [{ href: "/settings", label: "Go to Settings" }],
      },
    ],
  },
  {
    id: "search-tips",
    title: "Internship search tips",
    blurb: "Hard-won advice, with a cybersecurity flavor.",
    items: [
      {
        id: "when-apply",
        q: "When should I apply for cybersecurity internships?",
        a: "Earlier than feels reasonable. Many large companies, banks, consultancies and federal contractors open summer internships in August through October of the year before, and some fill on a rolling basis. Roles that need a security clearance tend to recruit earliest because processing takes time. Smaller companies and startups often post later, from January to April, so keep applying through spring.\n\nA useful rhythm: build your list over the summer, apply heavily in the fall, and keep a steady trickle going all winter.",
      },
      {
        id: "how-many",
        q: "How many applications should I send?",
        a: "There's no magic number. It's normal for most internship applications to get no reply at all, so both volume and targeting matter. A steady weekly rhythm with a tailored resume beats a panicked weekend sprint, and it's much kinder to you. Start with a goal you can actually keep.",
      },
      {
        id: "referrals",
        q: "Do referrals actually help?",
        a: "Often a lot. A referral usually gets a human to look at your resume, which is half the battle. You don't need a famous network:\n\n• Ask people you've already met: alumni, club officers, CTF teammates, career fair recruiters, past TAs.\n• Ask for advice first (\"what's the team like?\"), then ask whether they'd be comfortable referring you.\n• Make it easy: send the job link, your resume, and a two-sentence blurb they can paste.\n• Say thank you, and tell them how it turned out.",
      },
      {
        id: "home-lab",
        q: "What's a home lab, and do I need one?",
        a: "A home lab is a small setup where you practice real security work: a few virtual machines (VirtualBox, VMware or Proxmox), a Windows Active Directory domain to attack and defend, a firewall like pfSense, and a SIEM or log stack such as Security Onion, Wazuh or the free tier of Splunk.\n\nIt's not required, but it's the best substitute for job experience. Document what you built and what broke on GitHub or a short blog, and you'll have concrete stories for every interview.",
      },
      {
        id: "certs",
        q: "Is Security+ (or another cert) worth it as an intern?",
        a: "Helpful, not required. CompTIA Security+ shows you've covered the fundamentals, and it's a baseline certification for many U.S. Department of Defense cyber roles, so it carries extra weight with government and defense contractor employers. For most private-sector internships, projects, labs, CTFs and coursework matter as much or more.\n\nIf you go for it, check for student or academic discounts first, and list it as \"in progress\" with an expected date while you study.",
      },
      {
        id: "clearance",
        q: "What about internships that require a security clearance?",
        a: "Many federal and defense internships require U.S. citizenship and either an existing clearance or the ability to obtain one. You can't apply for a clearance on your own; the employer sponsors it after an offer, and processing can take months, which is why these roles recruit early.\n\n• Be completely honest on the background forms. Omissions hurt far more than the things you disclose.\n• Federal standards apply even where state law differs, such as with cannabis.\n• Keep your finances and online presence in reasonable shape.\n• It's fine to ask a recruiter what the clearance process looks like and when it starts.",
      },
      {
        id: "ctf",
        q: "Do CTFs, clubs and competitions count as experience?",
        a: "Yes. Put them on your resume under projects or activities and describe what you actually did: \"Placed top 10% in National Cyber League; solved log analysis and cryptography challenges\" is a real line. picoCTF, NCL, CCDC and your school's security club are all great places to start and great things to talk about in interviews.",
      },
    ],
  },
];

export const FAQ_COUNT = FAQ_GROUPS.reduce((n, g) => n + g.items.length, 0);
