# Cybersecurity Internship Interview Prep and Resource Library

**Research date: October 16, 2026**

This curriculum is for a college student pursuing cybersecurity internships. It emphasizes clear explanations, safe practice, useful project evidence, and honest communication about what the student has actually done.

Resource links were checked through live searches and provider documentation. **Access limitations and unverified prices are marked explicitly.** A functioning program page does not mean applications are currently open.

Prices are approximate, before tax, and may vary by country, student eligibility, and subscription terms. Study times are planning estimates unless identified as provider estimates. Free training can still involve paid exams, cloud consumption, or optional certificates.

The scripting lesson uses small, plain-language examples to honor the instruction not to write code. The keyword presets are descriptive data specifications.

---

# Part A — Curated Resource Library

## How to use this library

Track abbreviations:

| Label | Internship track |
|---|---|
| ALL | General cybersecurity and all tracks |
| SOC | SOC analyst |
| ENG | Security engineering |
| OFF | Pentesting and red team |
| APP | Application security |
| CLOUD | Cloud security |
| GRC | Governance, risk, and compliance |
| DFIR | Digital forensics and incident response |
| CTI | Threat intelligence |
| DET | Detection engineering |
| IAM | Identity and access management |

**Recommended starting approach:** choose one primary track, complete its relevant course modules, and produce two well-explained projects. Apply while learning. Completing this entire library is not an internship prerequisite.

## Networking, operating systems, and scripting

**R01. [Cisco Networking Basics](https://www.netacad.com/courses/networking-basics?courseLang=en-US)**  
**Type:** free course · **Cost:** free · **Difficulty:** beginner · **Time:** 22 hours · **Tracks:** ALL  
**Why this one:** Cisco connects networking vocabulary to how devices actually communicate. Start here if subnetting, routing, and protocols still feel like unrelated facts.  
**Tags:** networking, TCP/IP, routing, subnetting, Packet Tracer

**R02. [Wireshark User’s Guide](https://www.wireshark.org/docs/wsug_html_chunked/)**  
**Type:** tool and reference · **Cost:** free · **Difficulty:** beginner–intermediate · **Time:** 3–6 hours of selected chapters and practice · **Tracks:** SOC, ENG, OFF, DFIR, DET  
**Why this one:** The official guide helps you explain packet evidence instead of simply naming Wireshark on a résumé. Practice following conversations and distinguishing capture filters from display filters.  
**Tags:** Wireshark, PCAP, DNS, TCP, packet analysis

**R03. [Introduction to Linux — Linux Foundation LFS101](https://training.linuxfoundation.org/training/introduction-to-linux/)**  
**Type:** free course · **Cost:** free · **Difficulty:** beginner · **Time:** approximately 60 hours for the full course · **Tracks:** ALL technical tracks  
**Why this one:** A dependable foundation in files, permissions, processes, networking, and shells makes later security labs much easier. Selected chapters are enough to begin this course.  
**Tags:** Linux, permissions, processes, shell, administration

**R04. [The Missing Semester of Your CS Education](https://missing.csail.mit.edu/)**  
**Type:** free course and videos · **Cost:** free · **Difficulty:** beginner–intermediate · **Time:** 10–20 hours selected material · **Tracks:** ENG, OFF, APP, CLOUD, DET, DFIR  
**Why this one:** MIT’s course teaches practical command-line, debugging, and version-control habits that security projects need. Its current site includes a 2026 edition.  
**Tags:** shell, Git, debugging, development tools, reproducibility

**R05. [Microsoft Learn: Active Directory Domain Services](https://learn.microsoft.com/en-us/training/paths/active-directory-domain-services/)**  
**Type:** free course · **Cost:** free learning content · **Difficulty:** intermediate · **Time:** approximately 4 hours 35 minutes · **Tracks:** IAM, SOC, ENG, OFF, DFIR  
**Why this one:** Learn domains, forests, domain controllers, and Group Policy from Microsoft. These concepts appear repeatedly in enterprise security interviews.  
**Tags:** Active Directory, AD DS, Windows, Group Policy, identity

**R06. [Sysinternals Resources](https://learn.microsoft.com/en-us/sysinternals/resources/)**  
**Type:** tools, videos, and references · **Cost:** free online materials; books priced separately · **Difficulty:** intermediate · **Time:** 3–6 hours selected material · **Tracks:** SOC, ENG, DFIR, DET  
**Why this one:** Tools such as Process Explorer and Autoruns make Windows behavior visible. Learn what evidence one tool provides before trying to learn the whole suite.  
**Tags:** Windows internals, processes, persistence, troubleshooting

**R07. [The Python Tutorial](https://docs.python.org/3/tutorial/)**  
**Type:** free tutorial · **Cost:** free · **Difficulty:** beginner in Python; assumes some programming familiarity · **Time:** 10–20 hours selected chapters · **Tracks:** ENG, SOC, APP, DFIR, CTI, DET  
**Why this one:** The official tutorial is a reliable reference for files, data structures, exceptions, and standard-library work. A complete programming beginner should move slowly and practice each concept.  
**Tags:** Python, JSON, parsing, automation, exceptions

**R08. [GNU Bash Reference Manual](https://www.gnu.org/software/bash/manual/)**  
**Type:** reference and cheat sheet · **Cost:** free · **Difficulty:** intermediate · **Time:** 3–6 hours selected sections · **Tracks:** ENG, OFF, CLOUD, SOC, DFIR  
**Why this one:** Quoting, expansion, pipelines, and exit statuses matter more than clever one-liners. This is the authoritative reference when shell behavior surprises you.  
**Tags:** Bash, quoting, pipelines, exit status, shell

**R09. [PowerShell 101](https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/01-getting-started)**  
**Type:** free book/tutorial · **Cost:** free · **Difficulty:** beginner · **Time:** 6–12 hours selected chapters · **Tracks:** IAM, SOC, ENG, DFIR, DET  
**Why this one:** Microsoft explains PowerShell’s object-based pipeline clearly. It is especially useful for Windows events, processes, services, and identity administration.  
**Tags:** PowerShell, Windows, objects, automation, administration

**R10. [Nmap Reference Guide](https://nmap.org/book/man.html)**  
**Type:** tool and reference · **Cost:** free · **Difficulty:** beginner–advanced · **Time:** 3–5 hours introductory practice · **Tracks:** OFF, ENG, CLOUD, SOC  
**Why this one:** Learn what open, closed, and filtered actually mean. Practice only against explicitly authorized targets, and remember that finding a service does not establish a vulnerability.  
**Tags:** Nmap, enumeration, scanning, ports, scope

## Web security, offensive practice, and introductory cryptography

**R11. [OWASP Top 10:2025](https://top10.owasp.org/2025/0x00_2025-Introduction/)**  
**Type:** awareness guide · **Cost:** free · **Difficulty:** beginner–intermediate · **Time:** 2–4 hours · **Tracks:** APP, OFF, ENG, CLOUD, GRC  
**Why this one:** This is the current released OWASP Top 10. Learn a concrete example and mitigation for each category rather than memorizing rankings.  
**Tags:** OWASP, web security, application risk, supply chain

**R12. [PortSwigger Web Security Academy](https://portswigger.net/web-security)**  
**Type:** free course and lab platform · **Cost:** free · **Difficulty:** beginner–advanced · **Time:** 15–25 hours for an introductory selection · **Tracks:** APP, OFF, ENG  
**Why this one:** Exceptionally strong explanations are paired with authorized browser labs. Start with SQL injection, XSS, access control, authentication, CSRF, and SSRF.  
**Tags:** web labs, Burp Suite, SQLi, XSS, authentication, SSRF

**R13. [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)**  
**Type:** cheat sheets · **Cost:** free · **Difficulty:** beginner–advanced · **Time:** 20–45 minutes per selected sheet · **Tracks:** APP, ENG, IAM, CLOUD, OFF  
**Why this one:** These sheets help answer the essential follow-up: “How would you prevent it?” Prioritize password storage, authorization, session management, and injection prevention.  
**Tags:** secure coding, mitigations, sessions, passwords, authorization

**R14. [OWASP Web Security Testing Guide](https://owasp.org/projects/web-security-testing-guide)**  
**Type:** free book and methodology guide · **Cost:** free · **Difficulty:** intermediate · **Time:** 6–12 hours selected sections · **Tracks:** OFF, APP, ENG  
**Why this one:** WSTG helps turn tool usage into a repeatable testing method. The published stable guide and development material should be distinguished when citing a test procedure.  
**Tags:** WSTG, testing methodology, reporting, web assessment

**R15. [OWASP Juice Shop](https://owasp.org/projects/juice-shop?tab=overview)**  
**Type:** intentionally vulnerable lab/tool · **Cost:** free software; hosting may cost · **Difficulty:** beginner–advanced · **Time:** 6–15 hours introductory practice · **Tracks:** APP, OFF, ENG  
**Why this one:** A deliberately vulnerable application gives you a legitimate place to practice and write findings. Keep local deployments isolated from public access.  
**Tags:** vulnerable application, web lab, portfolio, OWASP

**R16. [TryHackMe](https://tryhackme.com/pricing)**  
**Type:** lab platform · **Cost:** freemium; retrieved Premium price approximately €16.99/month, with regional and annual variations · **Difficulty:** beginner–advanced · **Time:** 20–60 hours selected path · **Tracks:** ALL technical tracks  
**Why this one:** Guided rooms are useful when you want structure and immediate practice. Use the free material first, then subscribe only if a specific path suits your goals.  
**Tags:** guided labs, SOC, pentesting, foundations

**R17. [Hack The Box Academy](https://academy.hackthebox.com/)**  
**Type:** lab platform · **Cost:** freemium; eligible student plan $10/month · **Difficulty:** beginner–advanced · **Time:** 10–30 hours selected modules · **Tracks:** OFF, APP, SOC, DET, ENG  
**Why this one:** Academy provides detailed explanations and sustained hands-on practice. The student price changed October 12, 2026; Academy and HTB Labs are separate products. [Current pricing announcement](https://www.hackthebox.com/blog/new-academy-pricing).  
**Tags:** HTB, student plan, pentesting, SOC, practical skills

**R18. [OverTheWire: Bandit](https://overthewire.org/wargames/bandit/)**  
**Type:** CTF/wargame · **Cost:** free · **Difficulty:** beginner · **Time:** 8–15 hours substantial first pass · **Tracks:** ALL technical tracks  
**Why this one:** Bandit builds terminal confidence through small problems. Reading manual pages and explaining your approach matters more than collecting passwords from walkthroughs.  
**Tags:** Linux, SSH, shell, permissions, beginner CTF

**R19. [picoCTF and picoGym](https://picoctf.org/get_started.html)**  
**Type:** CTF and practice platform · **Cost:** free · **Difficulty:** beginner–intermediate · **Time:** 5–15 hours initial challenges · **Tracks:** OFF, APP, DFIR, ENG, general  
**Why this one:** Carnegie Mellon’s practice ecosystem makes security problem-solving approachable. picoGym allows practice outside competition windows.  
**Tags:** CTF, forensics, cryptography, web, beginner

**R20. [CryptoHack](https://cryptohack.org/)**  
**Type:** free course/CTF platform · **Cost:** free · **Difficulty:** beginner–advanced · **Time:** 5–10 hours introductory topics · **Tracks:** ENG, APP, OFF, general  
**Why this one:** Small challenges make encoding, hashes, and cryptographic primitives less abstract. Most internships require sound concepts before advanced mathematics.  
**Tags:** cryptography, encoding, hashing, AES, RSA

## SOC, SIEM, incident response, and forensics

**R21. [Splunk Free Training Courses](https://www.splunk.com/en_us/training/free-courses/overview.html)**  
**Type:** free courses · **Cost:** listed free eLearning is free; other training modalities may cost · **Difficulty:** beginner–intermediate · **Time:** 4–12 hours selected courses · **Tracks:** SOC, DET, DFIR, ENG  
**Why this one:** Learn events, fields, searching, investigations, and detection concepts directly from Splunk. A paid certification is unnecessary to begin building useful knowledge.  
**Tags:** Splunk, SPL, SIEM, logs, investigation

**R22. [Intro to Elastic Security](https://www.elastic.co/training/intro-to-elastic-security)**  
**Type:** free course · **Cost:** free · **Difficulty:** beginner · **Time:** approximately 1 hour · **Tracks:** SOC, DET, DFIR  
**Why this one:** A compact introduction to alerts, timelines, cases, and investigation workflows. It helps you transfer concepts between SIEM products.  
**Tags:** Elastic Security, SIEM, alerts, cases, timelines

**R23. [Configure Your Microsoft Sentinel Environment](https://learn.microsoft.com/en-us/training/paths/sc-200-configure-azure-sentinel-environment/)**  
**Type:** free course · **Cost:** learning content free; Azure services may incur charges · **Difficulty:** intermediate · **Time:** 4–6 hours · **Tracks:** SOC, DET, CLOUD, DFIR  
**Why this one:** Official training covers workspaces, queries, watchlists, and integrations. Learn the workflow before deciding whether to fund a cloud deployment.  
**Tags:** Microsoft Sentinel, KQL, Azure, SIEM, ingestion

**R24. [Blue Team Labs Online](https://blueteamlabs.online/)**  
**Type:** lab platform · **Cost:** free downloadable challenges; Pro approximately £15/month or £144/year · **Difficulty:** intermediate · **Time:** 1–4 hours per challenge · **Tracks:** SOC, DFIR, CTI, DET  
**Why this one:** Evidence-focused challenges help you practice with logs, packet captures, and suspicious messages. Pair them with introductory teaching if the tools are new.  
**Tags:** DFIR, phishing, PCAP, investigation, blue team

**R25. [LetsDefend](https://letsdefend.io/)**  
**Type:** lab platform and courses · **Cost:** freemium; VIP approximately $24.99/month, with annual/student options · **Difficulty:** beginner–intermediate · **Time:** 2–5 hours starter selection · **Tracks:** SOC, DFIR, CTI  
**Why this one:** A simulated SOC makes alert ownership, investigation, and disposition tangible. Start with free lessons and available alerts. [Pricing](https://app.letsdefend.io/pricing).  
**Tags:** alert triage, SOC, phishing, incident response

**R26. [CyberDefenders Blue Team Labs](https://cyberdefenders.org/blueteam-ctf-challenges/)**  
**Type:** lab platform · **Cost:** freemium; free community content available; exact current paid price unverified · **Difficulty:** beginner–advanced · **Time:** 1–3 hours per introductory lab · **Tracks:** SOC, DFIR, CTI, DET, CLOUD  
**Why this one:** A completed investigation can become a concrete interview story. Explain your evidence, uncertainty, and timeline rather than only publishing challenge answers.  
**Tags:** cyber range, DFIR, threat hunting, cloud investigation

**R27. [Security Onion: Getting Started](https://docs.securityonion.net/en/2.4/getting-started.html)**  
**Type:** tool and homelab guide · **Cost:** free platform; hardware/hosting extra · **Difficulty:** intermediate · **Time:** 6–12 hours initial exercise · **Tracks:** SOC, DFIR, DET, ENG  
**Why this one:** Security Onion connects network evidence, alerts, and investigations. Review hardware requirements; importing a PCAP may be more practical than running a full monitoring environment.  
**Tags:** network monitoring, Zeek, Suricata, PCAP, homelab

**R28. [NIST SP 800-61 Rev. 3](https://csrc.nist.gov/pubs/sp/800/61/r3/final)**  
**Type:** incident-response reference · **Cost:** free · **Difficulty:** intermediate · **Time:** 2–4 hours selected reading · **Tracks:** SOC, DFIR, GRC, ENG  
**Why this one:** This April 2025 publication supersedes Rev. 2 and integrates incident response with CSF 2.0. Use it to understand organizational preparation, response, recovery, and improvement.  
**Tags:** NIST, incident response, CSF 2.0, risk management

**R29. [SANS DFIR Fundamentals Poster](https://www.sans.org/posters/dfir-fundamentals-poster)**  
**Type:** cheat sheet · **Cost:** free; account may be required · **Difficulty:** beginner · **Time:** 30–60 minutes · **Tracks:** DFIR, SOC  
**Why this one:** A helpful map of evidence sources and investigative considerations. Keep it nearby during a lab rather than trying to memorize it.  
**Tags:** evidence, artifacts, preservation, forensics

**R30. [Volatility 3 Documentation](https://volatility3.readthedocs.io/en/stable/)**  
**Type:** tool and documentation · **Cost:** free · **Difficulty:** intermediate · **Time:** 3–8 hours first guided investigation · **Tracks:** DFIR, SOC, CTI  
**Why this one:** Memory analysis can connect process activity, network behavior, and volatile artifacts. Learn Volatility 3 rather than building a new study plan around deprecated Volatility 2 workflows.  
**Tags:** memory forensics, Volatility, processes, malware analysis

**R31. [Autopsy](https://www.autopsy.com/)**  
**Type:** forensic tool · **Cost:** software free; official training generally paid · **Difficulty:** beginner–intermediate · **Time:** 3–8 hours first case · **Tracks:** DFIR, SOC  
**Why this one:** Its visual interface is useful for learning disk-image analysis and artifact review. Use a documented practice image and a specific investigation question.  
**Tags:** disk forensics, Autopsy, artifacts, timeline

**R32. [NIST CFReDS Portal](https://cfreds.nist.gov/artcat)**  
**Type:** forensic datasets/lab resource · **Cost:** free; storage and bandwidth needed · **Difficulty:** beginner–advanced · **Time:** 2–10 hours selected exercise · **Tracks:** DFIR, SOC, ENG  
**Why this one:** Documented datasets give your forensic portfolio clear provenance. Begin with a manageable dataset and record its limitations.  
**Tags:** forensic datasets, validation, evidence, practice

**R33. [CyberChef](https://gchq.github.io/CyberChef/)**  
**Type:** tool · **Cost:** free · **Difficulty:** beginner–intermediate · **Time:** 1–3 hours · **Tracks:** SOC, DFIR, CTI, APP  
**Why this one:** Excellent for exploring encodings, timestamps, hashes, and transformations. Use synthetic data while learning and distinguish decoding from decryption.  
**Tags:** encoding, decoding, timestamps, hashing, analysis

**R34. [The DFIR Report](https://thedfirreport.com/)**  
**Type:** research library/newsletter · **Cost:** public reports free; commercial products separate · **Difficulty:** intermediate–advanced · **Time:** 45–90 minutes per report · **Tracks:** DFIR, SOC, CTI, DET  
**Why this one:** Detailed intrusion narratives show how individual artifacts support a larger timeline. Choose one report and explain its defensive implications.  
**Tags:** intrusion analysis, case study, ATT&CK, detection

## Threat intelligence and detection engineering

**R35. [MITRE ATT&CK](https://attack.mitre.org/)**  
**Type:** knowledge base/framework · **Cost:** free · **Difficulty:** beginner–advanced · **Time:** 3–5 hours introductory exercise · **Tracks:** SOC, DET, CTI, DFIR, OFF, ENG  
**Why this one:** ATT&CK gives teams shared language for adversary behavior. A technique mapping describes behavior; it does not establish actor attribution.  
**Tags:** ATT&CK, tactics, techniques, coverage, adversary behavior

**R36. [Sigma Documentation](https://sigmahq.io/docs/guide/about)**  
**Type:** detection format and guide · **Cost:** free · **Difficulty:** intermediate · **Time:** 3–6 hours initial exercise · **Tracks:** DET, SOC, CTI, DFIR  
**Why this one:** Sigma helps describe log-based detection logic in a shareable format. Useful deployment still requires field mapping, suitable telemetry, testing, and tuning.  
**Tags:** Sigma, SIEM, detection rules, false positives

**R37. [Atomic Red Team](https://github.com/redcanaryco/atomic-red-team)**  
**Type:** adversary-emulation test library/tool · **Cost:** free · **Difficulty:** intermediate–advanced · **Time:** 3–6 hours reviewed exercise · **Tracks:** DET, SOC, ENG, DFIR, OFF  
**Why this one:** Focused tests help validate whether your lab produces expected evidence. Review prerequisites, side effects, and cleanup before using any test in an authorized disposable environment.  
**Tags:** purple team, detection validation, ATT&CK, telemetry

**R38. [Wazuh Quickstart](https://documentation.wazuh.com/current/quickstart.html)**  
**Type:** tool and homelab guide · **Cost:** self-hosted software free; compute extra · **Difficulty:** intermediate · **Time:** 4–8 hours initial lab · **Tracks:** SOC, DET, DFIR, ENG, CLOUD  
**Why this one:** A current, maintained path to endpoint monitoring with one or two test machines. A small working investigation is more valuable than an elaborate unfinished lab.  
**Tags:** homelab, endpoint monitoring, SIEM, alerts

**R39. [MITRE ATT&CK Cyber Threat Intelligence Training](https://attack.mitre.org/resources/learn-more-about-attack/training/cti/)**  
**Type:** free course, videos, and exercises · **Cost:** free · **Difficulty:** intermediate · **Time:** approximately 4 hours · **Tracks:** CTI, SOC, DET, DFIR  
**Why this one:** Learn to turn narrative reports into supported behavior mappings and recommendations. Exercises use older ATT&CK v8 material intentionally; distinguish exercise versions from the current knowledge base.  
**Tags:** CTI, analytical confidence, ATT&CK mapping, reporting

**R40. [MISP Documentation and Training](https://www.misp-project.org/documentation/)**  
**Type:** free training and tool documentation · **Cost:** materials/software free; deployment compute optional · **Difficulty:** intermediate · **Time:** 3–6 hours introduction · **Tracks:** CTI, SOC, DFIR, DET  
**Why this one:** MISP teaches structured sharing and contextualization of threat information. You can study the analyst materials without deploying a server.  
**Tags:** threat sharing, MISP, indicators, taxonomies

**R41. [Google Threat Intelligence and Mandiant Research](https://cloud.google.com/blog/topics/threat-intelligence)**  
**Type:** research library · **Cost:** free public articles · **Difficulty:** intermediate–advanced · **Time:** 30–60 minutes per report · **Tracks:** CTI, DFIR, SOC, CLOUD, DET  
**Why this one:** Investigations provide examples of evidence, uncertainty, and defensive recommendations. Assess each report’s scope rather than repeating vendor conclusions uncritically.  
**Tags:** threat research, campaigns, cloud incidents, intelligence

**R42. [YARA-X Documentation](https://virustotal.github.io/yara-x/docs/)**  
**Type:** tool and documentation · **Cost:** free · **Difficulty:** intermediate · **Time:** 3–6 hours introductory study · **Tracks:** CTI, DFIR, DET, SOC  
**Why this one:** Learn how content-based rules can identify patterns in files. A pattern match is an investigative lead, and rules need benign examples as well as malicious ones.  
**Tags:** YARA-X, file matching, malware analysis, rule testing

## Cloud and identity security

**R43. [AWS Security Training](https://aws.amazon.com/training/learn-about/security/)**  
**Type:** free course collection · **Cost:** free digital options; subscription labs separate · **Difficulty:** beginner–intermediate · **Time:** 2 hours for Security Fundamentals; 10–20 hours selected sequence · **Tracks:** CLOUD, IAM, ENG, SOC, GRC  
**Why this one:** Learn AWS terminology, IAM, and shared responsibility directly from AWS. Select training that matches your target posting.  
**Tags:** AWS, IAM, CloudTrail, shared responsibility

**R44. [Microsoft Learn: Introduction to Microsoft Entra](https://learn.microsoft.com/en-us/training/paths/describe-capabilities-of-microsoft-identity-access/)**  
**Type:** free course · **Cost:** learning content free; tenant features may require access · **Difficulty:** beginner · **Time:** approximately 3 hours · **Tracks:** IAM, CLOUD, SOC, ENG, GRC  
**Why this one:** A strong introduction to MFA, Conditional Access, and identity governance. It also clarifies how Entra ID differs from on-premises AD DS.  
**Tags:** Entra ID, Azure, IAM, MFA, Conditional Access

**R45. [Security Best Practices in Google Cloud](https://www.skills.google/course_templates/87)**  
**Type:** course and lab platform · **Cost:** freemium; Starter allowance available, Pro approximately $29/month · **Difficulty:** intermediate · **Time:** approximately 11 hours 15 minutes · **Tracks:** CLOUD, IAM, ENG, GRC  
**Why this one:** Official training covers access controls, encryption, API access, and workload protection. Lab access depends on credits and plan terms. [Current plans](https://www.skills.google/subscriptions).  
**Tags:** GCP, cloud IAM, encryption, workload security

**R46. [flaws.cloud](http://flaws.cloud/)** — **live availability unverified**  
**Type:** cloud CTF · **Cost:** historically free · **Difficulty:** beginner–intermediate · **Time:** 4–8 hours · **Tracks:** CLOUD, IAM, OFF, ENG  
**Why this one:** Scott Piper’s exercise is a well-known introduction to AWS misconfigurations, with creator provenance verified. Direct access timed out during this review; use official cloud training immediately and treat this as an optional link to recheck. [Creator reference](https://summitroute.com/downloads/aws_security_maturity_roadmap-Summit_Route.pdf).  
**Tags:** AWS, S3, misconfiguration, availability unverified

**R47. [CloudGoat](https://github.com/RhinoSecurityLabs/cloudgoat)**  
**Type:** cloud lab deployment tool · **Cost:** software free; real cloud usage billed separately · **Difficulty:** intermediate–advanced · **Time:** 3–8 hours per scenario · **Tracks:** CLOUD, IAM, OFF, ENG, DET  
**Why this one:** Documented scenarios make cloud attack paths tangible. Use a dedicated empty sandbox, review costs, and verify resource cleanup; budget alerts are not guaranteed spending caps.  
**Tags:** cloud lab, AWS, IAM, Terraform, attack paths

**R48. [AWS Shared Responsibility Model](https://aws.amazon.com/compliance/shared-responsibility-model/)**  
**Type:** reference/cheat sheet · **Cost:** free · **Difficulty:** beginner · **Time:** 30–60 minutes · **Tracks:** CLOUD, IAM, ENG, GRC, SOC  
**Why this one:** This is a foundational cloud interview topic. Practice explaining how responsibilities change between a virtual machine and a managed service.  
**Tags:** shared responsibility, IaaS, managed services, cloud risk

## Cryptography, governance, and professional frameworks

**R49. [Crypto 101](https://www.crypto101.io/)**  
**Type:** free book · **Cost:** free · **Difficulty:** beginner–intermediate · **Time:** 8–15 hours selected chapters · **Tracks:** ENG, APP, OFF, general  
**Why this one:** A readable introduction to cryptographic building blocks and how they fit together. Use current protocol documentation for deployment decisions because some examples are historical.  
**Tags:** cryptography, hashes, MACs, signatures, key agreement

**R50. [NIST Cybersecurity Framework 2.0](https://www.nist.gov/cyberframework)**  
**Type:** framework and reference · **Cost:** free · **Difficulty:** beginner–intermediate · **Time:** 2–4 hours · **Tracks:** GRC, ENG, CLOUD, ALL  
**Why this one:** CSF connects technical work to business outcomes. Learn all six functions: Govern, Identify, Protect, Detect, Respond, and Recover.  
**Tags:** CSF 2.0, governance, risk, outcomes, profiles

**R51. [ISO/IEC 27001:2022 Overview](https://www.iso.org/standard/27001)**  
**Type:** standards overview · **Cost:** overview free; standard approximately CHF155 on retrieved page · **Difficulty:** beginner–intermediate · **Time:** 1–2 hours overview · **Tracks:** GRC, ENG, IAM  
**Why this one:** Understand an information security management system and continual improvement. An internship applicant generally does not need to purchase the standard or a lead-auditor course.  
**Tags:** ISO 27001, ISMS, risk treatment, audit

**R52. [AICPA SOC Suite of Services](https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services)**  
**Type:** assurance reference · **Cost:** overview free; some detailed materials paid · **Difficulty:** beginner–intermediate · **Time:** 1–2 hours · **Tracks:** GRC, CLOUD, ENG  
**Why this one:** Start with the organization behind SOC reporting. SOC 2 is a scoped assurance examination and report, not a personal certification or a guarantee that breaches cannot occur.  
**Tags:** SOC 2, assurance, Trust Services Criteria, evidence

**R53. [NICE Framework: Current Versions](https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center/nice-framework-current-versions)**  
**Type:** workforce framework · **Cost:** free · **Difficulty:** beginner–intermediate · **Time:** 1–2 hours selected roles · **Tracks:** ALL  
**Why this one:** NICE helps translate broad job titles into tasks, knowledge, and skills. Use it to understand role differences rather than treating every cybersecurity internship as the same job.  
**Tags:** NICE, career planning, work roles, skills

## Certifications: optional, targeted investments

**R54. [CompTIA Security+](https://www.comptia.org/en-us/certifications/security/)** — **official page retrieval and current price unverified**  
**Type:** certification · **Cost:** paid; budget roughly $400–500 exam-only pending official checkout verification · **Difficulty:** beginner–intermediate · **Time:** 60–120 hours · **Tracks:** ALL, especially SOC, ENG, government-related roles  
**Why this one:** A reasonable breadth credential when target postings request it. It does not demonstrate hands-on investigation or pentesting, and applications should continue while studying.  
**Tags:** Security+, foundations, certification, hiring signal

**R55. [CompTIA CySA+](https://www.comptia.org/en-us/certifications/cybersecurity-analyst/)** — **official page retrieval, current version, and price unverified**  
**Type:** certification · **Cost:** paid; budget roughly $400–500 exam-only pending verification · **Difficulty:** intermediate · **Time:** 80–150 hours · **Tracks:** SOC, DET, DFIR  
**Why this one:** More relevant to defensive analysis than to every internship. Usually prioritize log-analysis practice and a strong investigation project before buying another exam.  
**Tags:** CySA+, security analysis, SOC, certification

**R56. [Cisco CCNA](https://www.cisco.com/site/us/en/learn/training-certifications/certifications/enterprise/ccna/index.html)**  
**Type:** certification · **Cost:** approximately $300 exam · **Difficulty:** intermediate · **Time:** 100–200 hours · **Tracks:** ENG, SOC, CLOUD, OFF  
**Why this one:** Strong networking knowledge transfers across security specialties. CCNA is useful when networking is a weakness or target roles value it; it is not required before applying.  
**Tags:** CCNA, networking, routing, switching

**R57. [INE eJPT](https://ine.com/security/certifications/ejpt-certification)**  
**Type:** practical certification · **Cost:** paid; subscription and voucher required; bundles start around $299, with Fundamentals annual options around $349 · **Difficulty:** beginner–intermediate · **Time:** 60–120 hours · **Tracks:** OFF, APP, ENG  
**Why this one:** A sensible optional practical credential after Linux and networking basics. Verify the selected bundle carefully because a standalone voucher does not provide every required subscription entitlement.  
**Tags:** eJPT, practical assessment, pentesting, enumeration

**R58. [Blue Team Level 1 — Centri](https://www.centri.org/certifications/blue-team-level-1)**  
**Type:** practical certification · **Cost:** approximately £399 training/exam package · **Difficulty:** beginner–intermediate · **Time:** 30–60 hours · **Tracks:** SOC, DFIR, CTI  
**Why this one:** Useful structured investigation practice for a student committed to defensive work. Its recognition varies by employer, so try free blue-team labs before paying.  
**Tags:** BTL1, SOC, DFIR, practical assessment

**R59. [Google Cybersecurity Certificate](https://grow.google/certificates/cybersecurity/)**  
**Type:** course-completion certificate · **Cost:** approximately $49/month in the U.S./Canada; roughly $147–294 over 3–6 months · **Difficulty:** beginner · **Time:** typically 3–6 months at 5–10 hours/week · **Tracks:** general, SOC, ENG  
**Why this one:** Good structure for a novice learning Linux, SQL, Python, and security operations. A cybersecurity major with equivalent coursework may benefit more from targeted labs.  
**Tags:** Google certificate, foundations, Python, SQL, SOC

**R60. [ISC2 Certified in Cybersecurity](https://www.isc2.org/certifications/cc)**  
**Type:** certification · **Cost:** approximately $199 exam plus $50 annual maintenance after certification · **Difficulty:** beginner · **Time:** 30–60 hours · **Tracks:** general, SOC, GRC, IAM  
**Why this one:** A reasonable fundamentals option when funded or explicitly useful. **New enrollment in the free initiative ended May 20, 2026**; existing eligible unexpired codes may remain usable through December 31, 2026. [Official conclusion notice](https://www.isc2.org/insights/2026/04/one-million-certified-cyber-conclusion).  
**Tags:** ISC2 CC, fundamentals, certification, funding

## Interview, résumé, and portfolio guidance

**R61. [Daniel Miessler: 60 Cybersecurity Interview Questions](https://danielmiessler.com/blog/infosec-interview-questions)**  
**Type:** interview question guide · **Cost:** free · **Difficulty:** beginner–intermediate · **Time:** 2–4 hours · **Tracks:** ALL  
**Why this one:** Useful prompts for explaining fundamentals aloud. The guide is labeled a 2019 update; treat historical answers and hiring attitudes critically.  
**Tags:** interviews, fundamentals, reasoning, historical resource

**R62. [Tad Whitaker: Security Engineer Interview Questions](https://github.com/tadwhitaker/Security_Engineer_Interview_Questions)**  
**Type:** public question repository · **Cost:** free · **Difficulty:** intermediate · **Time:** 3–6 hours selected questions · **Tracks:** ENG, APP, OFF  
**Why this one:** A useful historical practice bank for finding weak spots. Its original questions were gathered in 2016, so it is not evidence of current company interview content.  
**Tags:** interview questions, security engineering, practice

**R63. [Jassics: Security Interview Questions](https://github.com/jassics/security-interview-questions)**  
**Type:** public question repository · **Cost:** free · **Difficulty:** beginner–advanced · **Time:** 2–6 hours per selected track · **Tracks:** SOC, ENG, APP, CLOUD, GRC, OFF  
**Why this one:** Role-based organization makes targeted practice convenient. Cross-check community answers with primary documentation.  
**Tags:** role-specific interviews, question bank, mock interview

**R64. [Harvard: Create a Strong Résumé](https://careerservices.fas.harvard.edu/resources/create-a-strong-resume/)**  
**Type:** résumé guide · **Cost:** free · **Difficulty:** beginner · **Time:** 1–2 hours plus revision · **Tracks:** ALL  
**Why this one:** Clear guidance on factual accomplishments and readable presentation. Replace tool lists with honest examples of how you used those tools.  
**Tags:** résumé, accomplishment bullets, career preparation

**R65. [GitHub Docs: Customizing Your Profile](https://docs.github.com/en/account-and-profile/how-tos/profile-customization)**  
**Type:** portfolio guide · **Cost:** free · **Difficulty:** beginner · **Time:** 1–2 hours · **Tracks:** ALL technical tracks  
**Why this one:** Help a reviewer find two or three strong projects quickly. Pin work with clear explanations, limitations, and safe public artifacts.  
**Tags:** GitHub, portfolio, README, project presentation

**R66. [OPM: Applicant Guidance on the Two-Page Résumé Limit](https://www.opm.gov/policy-data-oversight/hiring-information/merit-hiring-plan-resources/applicant-guidance-on-the-two-page-resume-limit/)**  
**Type:** federal application guide · **Cost:** free · **Difficulty:** beginner · **Time:** 30–60 minutes · **Tracks:** government internships, ALL  
**Why this one:** Covered USAJOBS applications now require résumés no longer than two pages, effective September 27, 2025. Older advice recommending very long federal résumés is outdated.  
**Tags:** federal résumé, USAJOBS, eligibility, applications

## Communities, newsletters, and podcasts

**R67. [r/cybersecurity](https://www.reddit.com/r/cybersecurity/)**  
**Type:** community · **Cost:** free · **Difficulty:** all levels · **Time:** 20–30 minutes/week · **Tracks:** ALL  
**Why this one:** Mentorship discussions can help with career questions and comparing experiences. Community advice needs verification, especially on hiring requirements and technical claims.  
**Tags:** Reddit, mentorship, careers, community

**R68. [TryHackMe Community](https://tryhackme.com/community)**  
**Type:** community/official Discord entry · **Cost:** free · **Difficulty:** beginner–intermediate · **Time:** 20–60 minutes/week · **Tracks:** SOC, OFF, general  
**Why this one:** Join Discord through the provider’s own page and find a steady study group. Ask for hints with your attempted approach instead of requesting complete solutions.  
**Tags:** Discord, study group, workshops, CTF

**R69. [Hack The Box Community](https://www.hackthebox.com/community)**  
**Type:** community/official Discord entry · **Cost:** free · **Difficulty:** beginner–advanced · **Time:** 20–60 minutes/week · **Tracks:** OFF, APP, SOC, DFIR  
**Why this one:** Official channels offer lab discussion, meetups, and practice partners. Follow spoiler rules and restrictions on active challenge writeups.  
**Tags:** Discord, meetups, CTF, peers

**R70. [Darknet Diaries](https://darknetdiaries.com/)**  
**Type:** podcast · **Cost:** main episodes free; optional paid membership · **Difficulty:** beginner · **Time:** approximately 45–90 minutes/episode · **Tracks:** ALL  
**Why this one:** Memorable stories connect technical failures with human decisions. After listening, identify initial access, impact, and one defensive lesson.  
**Tags:** security stories, incidents, ethics, podcast

**R71. [Risky Business](https://www.risky.biz/netcasts/risky-business/)**  
**Type:** podcast · **Cost:** free, sponsor-supported · **Difficulty:** intermediate · **Time:** approximately 50–60 minutes/episode · **Tracks:** ALL, especially CTI, SOC, GRC  
**Why this one:** Useful preparation for discussing a recent security story. Separate commentary and sponsored content from independently established facts.  
**Tags:** security news, industry awareness, podcast

**R72. [tl;dr sec](https://tldrsec.com/)**  
**Type:** newsletter · **Cost:** free · **Difficulty:** intermediate · **Time:** 20–45 minutes/week including one linked article · **Tracks:** APP, CLOUD, ENG, DET, CTI  
**Why this one:** Clint Gibler’s curated links help you find useful research without following every feed. Pick one item you can explain well.  
**Tags:** newsletter, AppSec, cloud security, research

**R73. [SANS Internet Storm Center Podcasts](https://isc.sans.edu/podcast.html)**  
**Type:** podcast/news briefing · **Cost:** free · **Difficulty:** beginner–intermediate · **Time:** approximately 5–15 minutes per briefing · **Tracks:** SOC, CTI, DFIR, DET  
**Why this one:** Short briefings make a manageable current-events habit. Follow the original advisory before repeating details in an interview.  
**Tags:** daily briefing, vulnerabilities, threat activity, news

## Internship programs, scholarships, and conferences

**R74. [Microsoft Early in Profession](https://careers.microsoft.com/v2/global/en/students)**  
**Type:** internship search tool · **Cost:** free to apply · **Difficulty:** beginner · **Time:** 30-minute setup; 15 minutes/week · **Tracks:** SOC, ENG, CLOUD, IAM, OFF  
**Why this one:** Search the official portal for security, identity, operations, and offensive roles. Each posting controls eligibility, location, and application availability.  
**Tags:** internships, Microsoft, company programs, job search

**R75. [Google Security Engineering Intern, Summer 2027 — Role Example](https://www.google.com/about/careers/applications/jobs/results/136826798817059526-security-engineering-intern-bsms-summer-2027)**  
**Type:** internship posting/role reference · **Cost:** free · **Difficulty:** intermediate · **Time:** 30–60 minutes analysis · **Tracks:** ENG, APP, CLOUD, DET  
**Why this one:** A verified example of security intern expectations involving programming and security fundamentals. **Its stated October 9, 2026 deadline has passed**; use it for planning and search Google Careers for current openings.  
**Tags:** Google, internship requirements, closed deadline, role analysis

**R76. [Amazon Security Careers](https://www.amazon.jobs/content/en/teams/amazon-security)**  
**Type:** internship/job search tool · **Cost:** free to apply · **Difficulty:** beginner · **Time:** 30 minutes; 15 minutes/week · **Tracks:** ENG, APP, CLOUD, IAM, DFIR, GRC  
**Why this one:** The official security organization page helps you discover team names and related job titles. Confirm that a result is cybersecurity rather than physical security or loss prevention.  
**Tags:** Amazon, security teams, internships, job search

**R77. [CISA Students and Recent Graduates](https://www.cisa.gov/careers/students-recent-graduates-employment-opportunities)** — **access-limited verification**  
**Type:** government internship search tool · **Cost:** free to apply · **Difficulty:** beginner · **Time:** 30–60 minutes · **Tracks:** SOC, DFIR, CTI, ENG, GRC  
**Why this one:** An official starting point for federal student opportunities. Agency references confirm the source, but direct access returned an error during review; no current vacancy is promised.  
**Tags:** CISA, government, Pathways, internships

**R78. [NSA Students and Internships](https://www.intelligencecareers.gov/nsa/students-and-internships)**  
**Type:** government internship/program finder · **Cost:** free to apply; paid programs available · **Difficulty:** beginner · **Time:** 1 hour eligibility review · **Tracks:** ENG, OFF, cryptography, CTI, DFIR  
**Why this one:** Official information covers internships, co-ops, and scholarships. Review citizenship, clearance, academic, and application-window requirements early.  
**Tags:** NSA, government, clearance, internships

**R79. [CyberCorps Scholarship for Service: Student Information](https://sfs.opm.gov/Student/Information)**  
**Type:** scholarship/program finder · **Cost:** free application; funded study with service obligations · **Difficulty:** beginner · **Time:** 1–2 hours research · **Tracks:** ALL, especially government careers  
**Why this one:** A substantial funding path through participating institutions. Understand the required internship, government service commitment, and repayment terms before accepting funding.  
**Tags:** scholarship, CyberCorps, SFS, government service

**R80. [BSides Las Vegas](https://bsideslv.org/registration)**  
**Type:** conference/community/CTF · **Cost:** 2026 registration $110; selected volunteer/participant badge routes · **Difficulty:** all levels · **Time:** 1–3 days · **Tracks:** ALL  
**Why this one:** Talks, volunteering, and Pros v Joes offer ways to learn and meet practitioners. The 2026 event is over; student discounts were not offered that year, so monitor the next cycle’s actual terms.  
**Tags:** BSides, conference, mentorship, CTF, volunteering

**R81. [DEF CON](https://defcon.org/)** — **access-limited verification**  
**Type:** conference/community/CTF · **Cost:** paid attendance; current badge price unverified · **Difficulty:** all levels · **Time:** 1–3 selected days · **Tracks:** OFF, APP, CLOUD, DFIR, CTI  
**Why this one:** Villages and contests can expose students to specialized work. Main-page access was blocked during research; no general student discount or scholarship is asserted.  
**Tags:** DEF CON, villages, contests, conference

**R82. [WiCyS 2027 Conference Scholarships](https://www.wicys.org/events/wicys-2027/wicys-2027-scholarships/)**  
**Type:** conference scholarship/community · **Cost:** selected recipients pay $75 processing fee; travel may remain · **Difficulty:** all levels · **Time:** 1–2 hours application; conference attendance additional · **Tracks:** ALL  
**Why this one:** The program supports conference participation and career connections. **The stated September 30, 2026 application deadline has passed**, despite remaining “Applications Open” wording on the page; monitor future calls and their eligibility rules.  
**Tags:** WiCyS, scholarship, career fair, closed deadline

## Additional focused references

**R83. [SANS Pen Test Rules of Engagement Worksheet](https://www.sans.org/posters/pen-test-rules-of-engagement-worksheet)**  
**Type:** cheat sheet · **Cost:** free; account may be required · **Difficulty:** beginner–intermediate · **Time:** 30–60 minutes · **Tracks:** OFF, APP, ENG  
**Why this one:** Scope, authorization, stop conditions, and reporting are part of technical competence. Use the worksheet to practice planning a safe fictional engagement.  
**Tags:** authorization, rules of engagement, scope, ethics

**R84. [NIST SP 800-63B-4: Authentication and Authenticator Management](https://csrc.nist.gov/pubs/sp/800/63/b/4/final)**  
**Type:** technical reference · **Cost:** free · **Difficulty:** intermediate · **Time:** 2–4 hours selected sections · **Tracks:** IAM, APP, ENG, CLOUD, GRC  
**Why this one:** Current guidance helps distinguish authentication factors, phishing resistance, and recovery requirements. Read selected sections to support clear explanations, not to memorize compliance language.  
**Tags:** authentication, MFA, passkeys, assurance, recovery

**R85. [OWASP Threat Modeling](https://community.owasp.org/Threat_Modeling)**  
**Type:** methodology guide · **Cost:** free · **Difficulty:** beginner–intermediate · **Time:** 1–2 hours plus exercise · **Tracks:** APP, ENG, CLOUD, GRC  
**Why this one:** Threat modeling turns “make it secure” into questions about assets, trust boundaries, threats, and mitigations. A small diagram makes a strong interview discussion.  
**Tags:** threat modeling, trust boundaries, design, risk

**R86. [CISA Known Exploited Vulnerabilities Catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog)** — **access-limited verification**  
**Type:** vulnerability prioritization tool/reference · **Cost:** free · **Difficulty:** beginner–intermediate · **Time:** 30–60 minutes · **Tracks:** SOC, ENG, CLOUD, GRC, CTI  
**Why this one:** Confirmed exploitation is useful prioritization context alongside exposure and business impact. The official catalog’s identity was verified, but direct access returned HTTP 403 during review.  
**Tags:** KEV, vulnerability management, exploitation, prioritization

**R87. [Wazuh Proof-of-Concept Guide](https://documentation.wazuh.com/current/proof-of-concept-guide/index.html)**  
**Type:** homelab exercise guide · **Cost:** free software/material; compute extra · **Difficulty:** intermediate · **Time:** 2–6 hours selected exercise · **Tracks:** SOC, DET, DFIR, CLOUD, ENG  
**Why this one:** Official examples turn an installed platform into a tested project. Document one detection’s telemetry, expected behavior, false positives, and limitations.  
**Tags:** homelab, portfolio, file integrity, detection validation

---

# Part B — Full Interview Prep Course

## Course structure

**Total suggested time: 64 hours**, including initial labs and interview practice. External courses are optional extensions.

| Order | Module ID | Title | Hours |
|---|---|---|---:|
| 1 | `security-internship-hiring` | How Security Internship Hiring Works | 2 |
| 2 | `networking-fundamentals` | Follow the Packet | 5 |
| 3 | `operating-systems-security` | Understand the Host | 5 |
| 4 | `security-fundamentals` | Explain the Security Building Blocks | 4 |
| 5 | `web-application-security` | Find and Fix Web Security Problems | 6 |
| 6 | `blue-team-soc` | Investigate Alerts and Handle Incidents | 6 |
| 7 | `threats-and-frameworks` | Turn Threat Information into Decisions | 4 |
| 8 | `offensive-security-basics` | Test Systems with Permission and Purpose | 5 |
| 9 | `cloud-and-identity` | Secure Access in the Cloud | 5 |
| 10 | `security-automation` | Automate Carefully | 5 |
| 11 | `grc-and-risk` | Connect Controls to Business Risk | 3 |
| 12 | `behavioral-security-interviews` | Tell Credible Security Stories | 4 |
| 13 | `technical-scenarios` | Reason Through Unfamiliar Evidence | 5 |
| 14 | `portfolio-and-projects` | Make Your Work Easy to Evaluate | 5 |

For every practice answer, replace hypothetical experience with your own facts. A model answer demonstrates structure and reasoning; it is not a story to claim as personal experience.

---

## Module 1 — How Security Internship Hiring Works

**ID:** `security-internship-hiring`  
**Hook:** Learn what each interview stage is trying to discover.  
**Estimated time:** 2 hours

### Learning objectives

- Distinguish major security internship tracks.
- Explain common hiring stages and their variation.
- Connect résumé claims to supporting evidence.
- Prepare a realistic interview and application plan.

### Lesson content

Security internships hire for potential as well as current ability. A team wants someone who can learn, communicate, handle access responsibly, and complete bounded work with supervision. Your degree gives context, but interviewers still need evidence of how you think. A class investigation, campus IT job, team project, or carefully documented lab can provide that evidence. You do not need to pretend those experiences were production security work.

Start by understanding the actual role. A SOC intern may investigate alerts and write case notes. An AppSec intern may review code and reproduce application weaknesses. An IAM intern may help with access reviews, while a GRC intern gathers evidence and evaluates controls. Job titles are inconsistent, so read the responsibilities and required qualifications. Highlight tasks you understand, tasks you have practiced, and tasks you need to investigate.

A common hiring sequence is application review, recruiter conversation, assessment, technical interview, behavioral discussion, and decision. Some employers combine stages, add coding exercises, or use a team-matching step. A text diagram is: application → evidence review → conversations or exercises → team decision. Movement through this diagram depends on scheduling, hiring capacity, eligibility, and competition as well as candidate performance. Silence is not a reliable technical assessment.

Recruiters often check enrollment, graduation timing, availability, location, work authorization, and basic interest. Technical interviewers explore fundamentals and problem-solving. A hiring manager may focus on how you ask questions, accept feedback, and work with others. Ask the recruiter what format to expect, how long it lasts, and whether any tools or outside assistance are permitted. Request accommodations through the employer’s stated process when needed.

Prepare a short introduction using present, evidence, and direction. For example: “I’m studying cybersecurity and focusing on defensive operations. In a recent lab, I correlated authentication events and wrote a timeline that separated suspicious activity from a configuration error. I’m looking for an internship where I can develop investigation skills and learn a team’s response process.” Use that structure with your actual experience and a reason specific to the employer.

During technical questions, state assumptions and explain your next step. If you cannot recall a command, describe the information you need and where you would verify the syntax. “I haven’t used that product, but I understand the underlying workflow” is useful when followed by a concrete explanation. Avoid bluffing: follow-up questions quickly expose claims that cannot be supported, and trust matters when the role involves sensitive systems.

After each interview, record the questions you remember, where your explanation became unclear, and one improvement. Continue applying while practicing rather than waiting to feel completely ready. In an interview, say: “Here is what I know, here is what I would verify, and here is how I would proceed safely.” That pattern shows judgment even when your knowledge is still developing.

### Key terms

- **Recruiter screen:** Initial conversation about eligibility, interest, and logistics.
- **Technical screen:** Evaluation of relevant knowledge and reasoning.
- **Assessment:** A structured task used during candidate evaluation.
- **Hiring manager:** Person responsible for the team’s hiring decision.
- **Competency:** An ability supported by observable behavior.
- **Eligibility:** Requirements determining whether someone can participate.
- **Evidence:** Work or examples supporting a stated capability.
- **Interview loop:** The sequence of interviews and evaluations.

### Practice interview questions

1. **Tell me about yourself.**  
   **Model answer:** “I’m a cybersecurity student interested in this team’s work on identity security. My strongest relevant example is a class project where I documented access requirements and tested whether permissions matched them. I’d like to build on that foundation through supervised work with real operational constraints.”  
   **Checking:** Relevance, clarity, and truthful evidence.

2. **Why this internship?**  
   **Model answer:** “The posting emphasizes log analysis and incident documentation, which match the work I’ve most enjoyed. I researched your team’s responsibilities and would like to learn how it validates and escalates alerts. I can contribute careful investigation notes while developing familiarity with your tools.”  
   **Checking:** Specific motivation and realistic expectations.

3. **Which security track interests you most?**  
   **Model answer:** “My current focus is application security because I enjoy connecting a technical weakness to a practical fix. I have practiced authorized web labs and documented prevention approaches. I’m still exploring, so I’m also interested in how AppSec works with engineering and incident response.”  
   **Checking:** Direction without unsupported certainty.

4. **You have no professional security experience. Why hire you?**  
   **Model answer:** “I would bring a solid foundation, curiosity, and care with evidence and access. My projects show that I can investigate a question, document the result, and explain limitations. I expect to need supervision and would use feedback to become useful quickly.”  
   **Checking:** Self-awareness and learning potential.

5. **What would you do if you did not know an answer?**  
   **Model answer:** “I would explain the parts I understand and identify the uncertainty. Then I would describe how I would verify it using documentation or a controlled test. I would avoid making an operational decision based on an unverified guess.”  
   **Checking:** Honesty and judgment.

6. **How are SOC and security engineering different?**  
   **Model answer:** “SOC work commonly emphasizes monitoring, investigation, and response coordination. Security engineering commonly emphasizes designing, implementing, and maintaining protective capabilities. The responsibilities overlap, so I would use this posting’s tasks rather than assume the title defines everything.”  
   **Checking:** Understanding of role variation.

7. **How do you prepare for a technical interview?**  
   **Model answer:** “I map the responsibilities to fundamentals, practical exercises, and my existing projects. I practice explaining one investigation or design decision aloud and review gaps that appear. I also confirm the interview format and permitted tools.”  
   **Checking:** Deliberate preparation.

8. **What questions would you ask us?**  
   **Model answer:** “I would ask what useful work an intern typically owns and how supervision works. I would also ask how the team measures a successful internship and provides feedback. Those answers help me understand how to contribute and learn.”  
   **Checking:** Thoughtfulness and team interest.

### Hands-on task

Choose one posting from [Microsoft Early in Profession](https://careers.microsoft.com/v2/global/en/students). Create a role map with five responsibilities, your supporting evidence, and two preparation priorities. Do not claim skills you have only read about.

### Linked resources

- [NICE Framework](https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center/nice-framework-current-versions)
- [Harvard résumé guide](https://careerservices.fas.harvard.edu/resources/create-a-strong-resume/)
- [Jassics interview questions](https://github.com/jassics/security-interview-questions)
- [Microsoft student opportunities](https://careers.microsoft.com/v2/global/en/students)

---

## Module 2 — Follow the Packet

**ID:** `networking-fundamentals`  
**Hook:** Explain how a request travels before deciding what went wrong.  
**Estimated time:** 5 hours

### Learning objectives

- Relate OSI and TCP/IP models to real traffic.
- Explain addressing, ports, routing, and name resolution.
- Describe HTTP, TLS, and common transport behavior.
- Investigate connectivity using evidence from multiple layers.

### Lesson content

Networking questions become easier when you follow one conversation. Imagine your browser requesting a page from google.com. The name identifies a service, an IP address helps deliver packets, a transport protocol carries communication, and HTTP describes the application exchange. Each layer answers a different question. A useful text diagram is: browser request → transport conversation → IP packets → local network frames → next hop, repeated across the route.

The OSI model has seven conceptual layers: physical, data link, network, transport, session, presentation, and application. The TCP/IP model commonly groups responsibilities into link, internet, transport, and application layers. These are models for reasoning, not separate programs that every packet visibly contains. For interviews, explain Ethernet or Wi-Fi at the link layer, IP at the internet layer, TCP or UDP at transport, and DNS or HTTP at application.

An IP address identifies an interface within an addressing context. A subnet prefix helps a host decide whether a destination is local or requires a gateway. MAC addresses support local-link delivery; routers forward between networks. ARP resolves IPv4 neighbors on a local link, while IPv6 uses Neighbor Discovery. NAT can translate addresses, but translation alone is not a complete security policy. Routing and filtering remain distinct concerns.

Before contacting a named server, the client often needs DNS resolution. Caches may already hold an answer. Otherwise, a resolver can obtain information through the DNS hierarchy, involving root, top-level-domain, and authoritative servers. A and AAAA records provide IPv4 and IPv6 addresses; CNAME records identify aliases. DNS commonly uses UDP or TCP port 53, while encrypted DNS has other transport arrangements. A DNS answer does not establish that a destination is safe.

For a common HTTPS path using HTTP/1.1 or HTTP/2, the client establishes TCP and then TLS before exchanging application data. TCP’s handshake uses SYN, SYN-ACK, and ACK. TCP provides an ordered byte stream, but does not encrypt it. TLS supplies connection confidentiality, integrity, and peer authentication through its protocol and certificate validation. HTTP/3 instead uses QUIC over UDP, incorporating TLS 1.3, so do not insist every HTTPS request begins with TCP. [HTTP/3 specification](https://www.rfc-editor.org/rfc/rfc9114.html).

Ports help identify transport endpoints. Learn common defaults such as SSH 22, DNS 53, HTTP 80, HTTPS 443, SMB 445, and RDP 3389, while remembering services can use other ports. A port number suggests a convention; it does not prove which application is running. A browser then exchanges requests and responses, potentially follows redirects, retrieves additional resources, and reuses existing connections rather than repeating every setup step.

When troubleshooting, move from observations to layers: does the name resolve, is there a route, can a transport connection form, does TLS validate, and what response does the application return? A failed ping is inconclusive because ICMP may be filtered. In an interview, say: “I would separate resolution, connectivity, TLS, and application behavior, then use packet and service evidence to narrow the failure.”

### Key terms

- **Subnet:** An address range described by a network prefix.
- **Gateway:** A next-hop device used to reach other networks.
- **DNS:** System for resolving names and publishing related records.
- **TCP:** Connection-oriented transport providing an ordered byte stream.
- **UDP:** Datagram transport without TCP’s delivery guarantees.
- **TLS:** Protocol protecting communication confidentiality and integrity.
- **Port:** Number identifying a transport endpoint.
- **PCAP:** File containing captured packet data.

### Practice interview questions

1. **What happens when you type google.com?**  
   **Model answer:** “The browser interprets the address and obtains a destination through cached or fresh DNS resolution. It establishes or reuses a suitable connection, using TLS over TCP or HTTP/3 over QUIC, and sends an HTTP request. The server responds, and the browser processes the response and additional resources.”  
   **Checking:** Connected reasoning and modern protocol awareness.

2. **TCP versus UDP?**  
   **Model answer:** “TCP supplies a connection-oriented ordered byte stream with retransmission and flow control. UDP sends datagrams without those transport-level guarantees. Applications can build additional reliability and security over UDP, as QUIC does.”  
   **Checking:** Understanding beyond “TCP reliable, UDP fast.”

3. **What does DNS do?**  
   **Model answer:** “DNS publishes records associated with names, including address records. A resolver may answer from cache or obtain information through authoritative infrastructure. I would inspect the record, response status, and resolver behavior when investigating a resolution problem.”  
   **Checking:** Resolution mechanics and troubleshooting.

4. **Does HTTPS mean a website is safe?**  
   **Model answer:** “HTTPS protects the connection and helps authenticate the server for the requested hostname. A malicious website can obtain a valid certificate for its own domain. I would still assess the destination, content, and business context.”  
   **Checking:** Security guarantees and limitations.

5. **What is the difference between a switch and router?**  
   **Model answer:** “A switch commonly forwards frames within a link-layer network using MAC information. A router forwards IP packets between networks using routing information. Real devices can combine these capabilities, so I would discuss their function in the specific path.”  
   **Checking:** Layer distinctions.

6. **A host does not respond to ping. Is it offline?**  
   **Model answer:** “Not necessarily, because ICMP may be blocked or deprioritized. I would test the relevant service and inspect routing, filtering, and packet evidence. I would avoid equating one failed diagnostic with total host unavailability.”  
   **Checking:** Avoiding premature conclusions.

7. **What does a filtered port mean in Nmap?**  
   **Model answer:** “It means Nmap could not determine whether the port was open because probes or responses were blocked or otherwise unavailable. The result depends on the scan method and observed responses. I would document those conditions rather than report a confirmed service.”  
   **Checking:** Interpretation of tool output.

8. **What can you learn from an encrypted packet capture?**  
   **Model answer:** “I may still see endpoints, timing, sizes, transport behavior, and some handshake metadata. Application content may remain unavailable, and visibility depends on the protocol and capture location. I would combine that metadata with endpoint and application logs.”  
   **Checking:** Realistic visibility.

### Hands-on task

Using the [Wireshark guide](https://www.wireshark.org/docs/wsug_html_chunked/), capture only your own authorized test traffic or inspect an approved sample. Identify one DNS exchange and one transport conversation, then explain what the capture proves and what it cannot reveal.

### Linked resources

- [Cisco Networking Basics](https://www.netacad.com/courses/networking-basics?courseLang=en-US)
- [Wireshark User’s Guide](https://www.wireshark.org/docs/wsug_html_chunked/)
- [Nmap Reference Guide](https://nmap.org/book/man.html)

---

## Module 3 — Understand the Host

**ID:** `operating-systems-security`  
**Hook:** Connect processes, permissions, identities, and logs.  
**Estimated time:** 5 hours

### Learning objectives

- Explain processes, services, files, and privilege boundaries.
- Compare Linux and Windows security evidence.
- Describe AD DS and basic enterprise authentication.
- Preserve evidence while investigating suspicious activity.

### Lesson content

An operating system manages resources and enforces boundaries between users and programs. The kernel handles privileged operations, while ordinary applications generally run in user space. A process is a running program with an identity, memory, open resources, and relationships to other processes. Security investigations often begin by asking which process acted, under which account, from which parent, and with what access. A familiar executable name alone does not answer those questions.

On Linux, users and groups influence access to files and other resources. Basic permission bits describe read, write, and execute permissions for owner, group, and others, while ACLs and additional controls can refine access. Directory permissions have special practical meanings, including traversal. Root has broad privilege, and capabilities can divide some privileged operations into narrower permissions. Use elevated access only when necessary and understand the effect of changing ownership or permissions.

Linux evidence can include authentication records, system journals, service definitions, scheduled tasks, process details, and network sockets. Locations and available records vary by distribution and configuration. A suspicious scheduled task may support a persistence hypothesis, but an entry is not automatically malicious. Compare it with expected administration, creation time, account ownership, and associated processes. Preserve the original evidence before changing the configuration you are trying to understand.

Windows uses security principals, SIDs, access tokens, privileges, and access-control lists. Services, scheduled tasks, startup entries, and registry configuration can explain how software runs automatically. Tools in Sysinternals help inspect these relationships. A useful diagram is: account → access token → process → attempted resource access → authorization decision. Knowing an account’s display name is less precise than understanding its identity, groups, and effective permissions.

Active Directory Domain Services centralizes directory and domain capabilities for many Windows environments. Domain controllers participate in authentication and directory services; Group Policy can manage settings across users and computers. Kerberos uses tickets in authentication workflows, while NTLM may still appear in some environments. AD DS is distinct from Microsoft Entra ID, although organizations can integrate them. Avoid describing all Microsoft identity systems as the same directory with different branding.

Logs depend on auditing and collection settings. Windows Security events include 4624 for successful logon, 4625 for failed logon, and 4688 for process creation when relevant auditing is enabled. Command-line visibility needs appropriate configuration, and Sysmon provides additional telemetry according to its configuration. Event IDs are meaningful with their provider and channel, not as universal numbers. [Microsoft event reference](https://learn.microsoft.com/en-us/azure/sentinel/windows-security-event-id-reference).

For a suspicious process, examine the full path, signer, hash, parent, command line, user, timing, and related network activity. Correlate multiple sources and consider legitimate explanations. Do not terminate a process or reboot a host reflexively: either action can disrupt business or lose volatile evidence. In an interview, say: “I would identify the process context, preserve relevant evidence, and follow the response authority before taking a disruptive action.”

### Key terms

- **Kernel:** Privileged core of an operating system.
- **Process:** Running program with execution and resource context.
- **Service:** Background component managed by the operating system.
- **ACL:** Rules governing access to an object.
- **SID:** Windows identifier for a security principal.
- **Access token:** Windows representation of a process or thread’s security context.
- **Domain controller:** Server providing AD DS domain services.
- **Persistence:** Mechanism allowing continued or renewed access.

### Practice interview questions

1. **What would you check on a suspicious process?**  
   **Model answer:** “I would inspect its path, parent, command line, account, signature, and timing. Then I would correlate file, network, and endpoint events with expected activity. I would preserve evidence and follow the playbook before terminating it.”  
   **Checking:** Contextual host investigation.

2. **What does least privilege mean on an endpoint?**  
   **Model answer:** “Users and processes should receive only the access needed for their tasks. I would separate routine use from administrative actions and review unnecessary permissions. The goal is to reduce what a mistake or compromise can affect.”  
   **Checking:** Practical privilege management.

3. **What is Active Directory?**  
   **Model answer:** “AD DS is Microsoft’s domain directory service used to organize identities, computers, and related resources. It supports centralized authentication and management capabilities such as Group Policy. I would distinguish it from Entra ID when discussing cloud identity.”  
   **Checking:** Enterprise identity fundamentals.

4. **What is a process tree useful for?**  
   **Model answer:** “It shows relationships between processes and helps reconstruct execution. An office application launching an unusual interpreter may deserve investigation, but context matters. I would inspect command lines and related activity before deciding the chain is malicious.”  
   **Checking:** Behavioral analysis.

5. **What do Windows events 4624 and 4625 indicate?**  
   **Model answer:** “In the Windows Security log, they represent successful and failed logons respectively. Their fields, logon type, account, source, and timing determine investigative meaning. A single failure is not enough to establish an attack.”  
   **Checking:** Log interpretation.

6. **How could an attacker maintain persistence?**  
   **Model answer:** “Examples include scheduled tasks, services, startup entries, or changes to authentication configuration. Many of those mechanisms also have legitimate uses. I would look for unexpected changes and connect them to accounts and execution evidence.”  
   **Checking:** Mechanisms without overclaiming.

7. **Why avoid immediately rebooting a compromised host?**  
   **Model answer:** “A reboot can destroy volatile evidence and change the system state. It may also interrupt critical services. I would coordinate containment and evidence collection according to the incident plan.”  
   **Checking:** Evidence preservation and authority.

8. **Is a signed executable necessarily safe?**  
   **Model answer:** “No, a valid signature does not establish that the observed use is benign. Legitimate signed tools can be abused, and signing infrastructure can be compromised. I would assess provenance, behavior, and context together.”  
   **Checking:** Limits of trust signals.

### Hands-on task

Complete several early [Bandit](https://overthewire.org/wargames/bandit/) levels and explain the permission or file concept behind each. Then inspect a benign process on your own computer using operating-system tools, recording its identity, parent, and executable path.

### Linked resources

- [Introduction to Linux](https://training.linuxfoundation.org/training/introduction-to-linux/)
- [Active Directory Domain Services](https://learn.microsoft.com/en-us/training/paths/active-directory-domain-services/)
- [Sysinternals Resources](https://learn.microsoft.com/en-us/sysinternals/resources/)
- [PowerShell 101](https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/01-getting-started)

---

## Module 4 — Explain the Security Building Blocks

**ID:** `security-fundamentals`  
**Hook:** State what a control protects and what it cannot promise.  
**Estimated time:** 4 hours

### Learning objectives

- Apply CIA and AAA to concrete systems.
- Distinguish encryption, hashing, encoding, and signatures.
- Explain password storage and basic PKI.
- Evaluate controls through their actual security properties.

### Lesson content

The CIA triad describes confidentiality, integrity, and availability. Confidentiality concerns inappropriate disclosure, integrity concerns unauthorized or improper change, and availability concerns dependable access when needed. A student records system illustrates all three: grades should remain private, changes should be authorized and accurate, and students should be able to access the service. Security decisions often involve tradeoffs, so begin with the asset and the consequence you are trying to prevent.

AAA means authentication, authorization, and accounting. Authentication checks an identity claim, authorization decides whether that identity may perform a particular action, and accounting records activity. A valid login does not authorize access to every record. Picture a sequence: identity established → action requested → permission evaluated → activity recorded. Each step can fail independently, and useful logs should identify the relevant principal, action, resource, and result.

Encryption transforms plaintext into ciphertext using an algorithm and key, with authorized reversal through the corresponding cryptographic operation. Symmetric encryption uses shared secret key material; asymmetric systems use related public and private keys. Modern systems combine primitives for different purposes. Do not describe every asymmetric operation as “encrypting with the private key”: digital signatures have their own algorithms and security properties.

A cryptographic hash produces a digest designed to make inversion and finding certain collisions computationally difficult. Hashing is not encryption and has no decryption key. Encoding, such as Base64, changes representation and generally provides no secrecy. A digest can help compare evidence integrity, but an attacker who can replace both a file and its published digest may defeat a naive check. Trust in the reference value matters.

Password storage requires a dedicated, deliberately expensive password-hashing scheme with unique salts. A fast general-purpose hash alone allows rapid guessing after a database leak. Salts are normally stored with the resulting hashes and prevent identical passwords from producing identical stored values under the same parameters. They do not make weak passwords unguessable. Use established libraries and current guidance, such as OWASP’s password-storage recommendations, rather than designing cryptography yourself. [Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).

PKI connects identities and public keys through certificates and trust relationships. When validating a server certificate, a client considers the hostname, validity period, trust chain, and applicable validation rules. TLS uses cryptographic mechanisms to protect a connection, but does not guarantee that the application is honest or free of vulnerabilities. Key storage, rotation, revocation processes, and recovery are operational parts of cryptographic security, not optional details after choosing an algorithm.

MFA combines different factor types, such as possession and knowledge. Two passwords remain one factor type. Some methods resist phishing better than others; FIDO/WebAuthn approaches bind authentication to the legitimate service in ways ordinary one-time codes do not. In an interview, say: “I would choose a control based on the threat, its security properties, and its operational limits, then verify that the implementation provides those properties.”

### Key terms

- **Confidentiality:** Protection against inappropriate disclosure.
- **Integrity:** Protection against unauthorized or improper change.
- **Availability:** Dependable access to services and information.
- **Authentication:** Verification of an identity claim.
- **Authorization:** Decision about permitted access or actions.
- **Hash:** Digest produced by a cryptographic hash function.
- **Salt:** Per-password value used in password hashing.
- **PKI:** System of certificates, keys, and trust relationships.

### Practice interview questions

1. **Hashing versus encryption?**  
   **Model answer:** “Encryption protects data with a reversible cryptographic operation using appropriate key material. Hashing produces a digest and is designed to resist inversion. I would use encryption for recoverable confidential data and a suitable password-hashing scheme for stored passwords.”  
   **Checking:** Correct properties and use cases.

2. **Is Base64 encryption?**  
   **Model answer:** “No, Base64 is an encoding that changes representation. Anyone who recognizes it can generally decode it without a secret. It should not be used as a confidentiality control.”  
   **Checking:** Basic terminology.

3. **Why salt password hashes?**  
   **Model answer:** “Unique salts prevent identical passwords from producing identical stored results under the same parameters. They also frustrate reuse of precomputed lookup tables across accounts. Salting still needs an expensive password-hashing algorithm and does not prevent all guessing.”  
   **Checking:** Benefits and limitations.

4. **What is the CIA triad?**  
   **Model answer:** “It describes confidentiality, integrity, and availability. For a medical scheduling system, examples are protecting patient details, preventing unauthorized appointment changes, and keeping scheduling accessible. I would use the business consequences to prioritize controls.”  
   **Checking:** Application of concepts.

5. **Authentication versus authorization?**  
   **Model answer:** “Authentication establishes confidence in an identity claim. Authorization evaluates whether that identity may take a specific action on a specific resource. An authenticated student should still be denied access to another student’s private records.”  
   **Checking:** Access-control reasoning.

6. **What does a digital signature provide?**  
   **Model answer:** “A valid signature supports integrity and authenticity relative to a trusted public key and algorithm. It does not encrypt the message or prove every statement in it is true. I would also consider key provenance and whether the signing key remained secure.”  
   **Checking:** Signature guarantees.

7. **What is MFA?**  
   **Model answer:** “MFA uses more than one distinct authentication factor type. A password plus a hardware authenticator can combine knowledge and possession. I would consider phishing resistance, recovery, and user requirements when selecting a method.”  
   **Checking:** Factors and implementation judgment.

8. **Why is a file hash useful in forensics?**  
   **Model answer:** “It helps compare whether collected data has changed relative to a recorded reference. I would record the algorithm, value, and collection context. The hash alone does not establish provenance, ownership, or truthfulness of the contents.”  
   **Checking:** Evidence integrity without overclaiming.

### Hands-on task

Use [CyberChef](https://gchq.github.io/CyberChef/) with synthetic text to compare encoding and hashing. Change one character, observe the results, and write a paragraph explaining why neither observation by itself demonstrates secure password storage.

### Linked resources

- [CryptoHack](https://cryptohack.org/)
- [Crypto 101](https://www.crypto101.io/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [NIST authentication guidance](https://csrc.nist.gov/pubs/sp/800/63/b/4/final)

---

## Module 5 — Find and Fix Web Security Problems

**ID:** `web-application-security`  
**Hook:** Follow untrusted input across the application’s trust boundaries.  
**Estimated time:** 6 hours

### Learning objectives

- Explain major web vulnerability mechanisms.
- Distinguish authentication, sessions, and authorization.
- Connect findings to effective mitigations.
- Describe a safe, reproducible application-security investigation.

### Lesson content

A web application accepts requests, applies business logic, accesses resources, and returns responses. Security failures often occur when the application trusts input or authority that it should verify. Draw a simple diagram: browser → application → database or external service. Add a boundary around each component and label which identity and permissions cross it. This makes questions about input handling, server-side authorization, and outbound requests easier to reason about.

SQL injection occurs when untrusted input changes the structure or meaning of a database query. Parameterized queries separate data from query structure and are a primary defense. Input validation and restricted database permissions support that defense, but do not replace it. Cross-site scripting occurs when attacker-controlled content executes in a victim’s browser under an application’s context. Context-appropriate output encoding, safe rendering APIs, and suitable sanitization for intentionally supported HTML address different situations.

SSRF causes a server to make requests influenced by an attacker, potentially reaching services the attacker cannot access directly. Defenses include strict destination policies, careful URL handling, network restrictions, and protection of cloud metadata access. CSRF induces an authenticated browser to send an unwanted action using credentials attached automatically, such as cookies. Appropriate anti-CSRF mechanisms and cookie policies help; CORS alone is not a general CSRF defense.

Authentication establishes identity, while authorization must protect each sensitive action and resource. If changing a document identifier reveals another user’s file, the problem is an access-control failure even if login works perfectly. Hiding buttons in the interface does not enforce server-side permissions. Consider horizontal access between peers and vertical access to more privileged functions. Tests should include both successful authorized access and expected denials.

Sessions connect multiple requests to an authenticated interaction. Session identifiers are sensitive because possession may allow impersonation. Secure cookie settings, sensible expiration, rotation at relevant transitions, and reliable server-side invalidation help manage that risk. HttpOnly limits JavaScript access to a cookie but does not eliminate XSS or stop every action an injected script can perform. Logging out should invalidate the relevant session rather than merely remove a visible button.

The current OWASP Top 10 is the 2025 edition. Alongside familiar access-control, injection, and authentication risks, it highlights areas including software supply chain failures and mishandling of exceptional conditions. It is an awareness document, not a complete testing plan. Dependency handling, safe errors, secure defaults, and useful security logging also deserve attention. Use WSTG for testing structure and Cheat Sheets for implementation guidance. [OWASP Top 10:2025](https://top10.owasp.org/2025/0x00_2025-Introduction/).

In a lab report, explain the affected component, required conditions, observed behavior, impact, remediation, and retest. Use the minimum demonstration needed to establish the issue, and stay within the platform’s rules. In an interview, say: “The weakness is that untrusted input or identity crosses this boundary without the required check. I would fix the root cause and verify both the original failure and legitimate functionality.”

### Key terms

- **SQL injection:** Input changes database query structure or meaning.
- **XSS:** Attacker-controlled script executes in a victim’s browser context.
- **SSRF:** Attacker influences requests made by a server.
- **CSRF:** Browser credentials are used for an unwanted cross-site action.
- **Session:** State connecting related requests.
- **Access control:** Enforcement of permitted actions on resources.
- **Parameterized query:** Query mechanism separating structure from data.
- **Trust boundary:** Point where trust assumptions or privileges change.

### Practice interview questions

1. **What causes SQL injection?**  
   **Model answer:** “Untrusted input is interpreted as part of query structure rather than only data. I would use parameterized queries and review any dynamically constructed query components carefully. Restricted database permissions and validation provide additional protection.”  
   **Checking:** Root cause and appropriate mitigation.

2. **How would you prevent XSS?**  
   **Model answer:** “I would use safe rendering APIs and context-appropriate output encoding. If the application intentionally accepts HTML, it needs suitable sanitization as well. I would treat CSP as additional protection rather than the only fix.”  
   **Checking:** Context-sensitive defense.

3. **How are SSRF and CSRF different?**  
   **Model answer:** “SSRF involves a server making attacker-influenced requests. CSRF involves inducing a browser to send an unwanted authenticated action. They cross different boundaries and require different defenses.”  
   **Checking:** Mechanism rather than acronym recall.

4. **What is an insecure direct object reference?**  
   **Model answer:** “It is an access-control weakness where a supplied object reference can expose or modify an unauthorized resource. A predictable identifier alone is not the complete problem. The server must enforce permission for the requested object and action.”  
   **Checking:** Authorization reasoning.

5. **Does HttpOnly prevent XSS?**  
   **Model answer:** “No, it prevents normal JavaScript access to the marked cookie. Injected script may still act within the page’s context or access other data. The application must address the injection itself.”  
   **Checking:** Limits of cookie controls.

6. **How would you secure sessions?**  
   **Model answer:** “I would use established session mechanisms with strong identifiers and appropriate cookie settings. I would define expiration, rotation, and server-side invalidation behavior. I would test logout and privilege changes as well as normal login.”  
   **Checking:** Session lifecycle understanding.

7. **Is OWASP Top 10 a complete pentest checklist?**  
   **Model answer:** “No, it is an awareness document describing major risk categories. A real assessment needs scope, application-specific understanding, and a testing methodology. I would use WSTG and design review alongside it.”  
   **Checking:** Appropriate framework use.

8. **How would you report a lab vulnerability?**  
   **Model answer:** “I would provide the affected feature, prerequisites, reproducible evidence, and practical impact. Then I would recommend a root-cause fix and describe how to retest it. I would clearly label the environment as a training lab.”  
   **Checking:** Communication and honest scope.

### Hands-on task

Complete one beginner access-control lab and one beginner injection lab in [Web Security Academy](https://portswigger.net/web-security). Write a short finding for each, including the boundary that failed and a mitigation.

### Linked resources

- [PortSwigger Web Security Academy](https://portswigger.net/web-security)
- [OWASP Top 10:2025](https://top10.owasp.org/2025/0x00_2025-Introduction/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [OWASP WSTG](https://owasp.org/projects/web-security-testing-guide)
- [OWASP Juice Shop](https://owasp.org/projects/juice-shop?tab=overview)

---

## Module 6 — Investigate Alerts and Handle Incidents

**ID:** `blue-team-soc`  
**Hook:** Turn an alert into a supported decision and a useful handoff.  
**Estimated time:** 6 hours

### Learning objectives

- Explain SIEM ingestion, normalization, queries, and alerts.
- Triage suspicious activity using context and corroboration.
- Describe current incident-response guidance.
- Document evidence, decisions, and escalation clearly.

### Lesson content

A SOC helps an organization notice, investigate, and respond to security-relevant activity. A SIEM collects and searches events from sources such as identity providers, endpoints, applications, firewalls, and cloud services. Its value depends on source quality, time handling, parsing, retention, and detection logic. A useful diagram is: activity → source event → collected record → normalized fields → detection → analyst investigation. Failures anywhere in that chain affect what an analyst can conclude.

An alert is a lead, not a verdict. Start by understanding what triggered it, which entities are involved, and what time window matters. Confirm the asset’s importance and the account’s expected behavior. A successful administrative login may be routine maintenance or a serious incident depending on the source, device, permissions, and surrounding actions. Compare the alert with original events rather than relying only on its title or severity label.

Triage asks whether activity is expected, suspicious, confirmed harmful, or still unresolved under the team’s classification scheme. Correlate authentication records with endpoint execution, network activity, and account changes. Consider clock differences and ingestion delays. Write a hypothesis and look for evidence that could disprove it. If a pattern could come from a broken service account, investigate that explanation instead of treating a failed-login threshold as proof of password spraying.

Incident response is broader than responding to alerts. NIST SP 800-61 Rev. 3 integrates response with CSF 2.0: organizational preparation supports operational detection, response, and recovery, with improvement throughout. The older preparation → detection and analysis → containment, eradication, and recovery → lessons learned sequence remains useful operational vocabulary, but it should not be presented as the current publication’s exact model. [Current NIST publication](https://csrc.nist.gov/pubs/sp/800/61/r3/final).

Containment limits harm, eradication addresses the cause and footholds, and recovery restores dependable operation. These activities require authority and business coordination. Isolating a workstation differs from disconnecting a hospital system or disabling a critical service account. Preserve relevant evidence and record decisions while responding. An intern should know the escalation path and approved actions rather than assume permission to block accounts, delete files, or contact external parties independently.

Good case notes identify what happened, affected entities, observed times with time zones, supporting evidence, confidence, actions taken, and remaining questions. Preserve raw records and distinguish event time from collection time. For forensic material, record provenance and handling; hashes support integrity comparisons but do not establish the entire chain of custody. A concise handoff lets another analyst continue without repeating your work or guessing why a decision was made.

Detection quality also matters. A rule needs expected telemetry, a meaningful hypothesis, validation examples, and known benign cases. Reducing noise should preserve useful coverage rather than simply hiding inconvenient alerts. In an interview, say: “I would validate the alert, correlate context, assess impact, document uncertainty, and escalate or act within the playbook. Afterward, I would help improve the detection or procedure based on what we learned.”

### Key terms

- **SIEM:** Platform supporting centralized event analysis and detection.
- **Normalization:** Mapping source data into consistent fields.
- **Triage:** Initial assessment of significance and next action.
- **False positive:** Alert identifying benign activity as suspicious.
- **Containment:** Action limiting an incident’s spread or harm.
- **Eradication:** Removal of causes and adversary footholds.
- **Recovery:** Restoration and validation of dependable operations.
- **Chain of custody:** Documented handling and transfer of evidence.

### Practice interview questions

1. **What is a SIEM?**  
   **Model answer:** “A SIEM centralizes events and supports searches, correlation, alerts, and investigations. Its effectiveness depends on the logs and detection logic available. It does not automatically establish whether every alert is malicious.”  
   **Checking:** Platform purpose and limits.

2. **How would you triage a suspicious login?**  
   **Model answer:** “I would inspect the account, source, device, authentication method, and timing. Then I would correlate subsequent activity and compare it with expected use. I would document uncertainty and escalate according to risk and the playbook.”  
   **Checking:** Structured investigation.

3. **What is the difference between an event and incident?**  
   **Model answer:** “An event is an observed occurrence in a system or network. An incident meets the organization’s criteria for a security situation requiring coordinated response. I would apply those criteria rather than equate every failed login with an incident.”  
   **Checking:** Operational classification.

4. **What is a false positive?**  
   **Model answer:** “It is an alert on activity that turns out to be benign under the detection’s intended purpose. I would document why it was benign and whether tuning is appropriate. A broad exclusion could hide real attacks, so tuning needs validation.”  
   **Checking:** Safe noise reduction.

5. **What would you do during ransomware activity?**  
   **Model answer:** “I would urgently notify the response lead and follow authorized containment procedures. I would preserve relevant evidence and help determine affected systems and ongoing impact. Recovery and business decisions would be coordinated rather than made unilaterally.”  
   **Checking:** Urgency, authority, and preservation.

6. **What belongs in a case note?**  
   **Model answer:** “I would record the question, affected entities, timeline, evidence, and actions. I would separate observations from interpretations and state unresolved gaps. Another analyst should be able to continue the investigation from the note.”  
   **Checking:** Operational communication.

7. **Why might a detection miss an attack?**  
   **Model answer:** “Required telemetry may be absent, delayed, misparsed, or outside retention. The logic may also fail to cover the observed behavior or environment. I would test the collection and query path before concluding the attacker was invisible.”  
   **Checking:** Detection-system reasoning.

8. **How would you explain incident response today?**  
   **Model answer:** “I would describe preparation and risk management supporting detection, response, recovery, and continuous improvement. During an incident, teams analyze, contain, remove footholds, and restore operations under defined authority. I would identify SP 800-61 Rev. 3 as the current NIST reference.”  
   **Checking:** Current guidance and practical understanding.

### Hands-on task

Complete a free starter lesson or available alert in [LetsDefend](https://letsdefend.io/). Produce a case note containing a hypothesis, three evidence observations, a disposition, and one unresolved question.

### Linked resources

- [Splunk free training](https://www.splunk.com/en_us/training/free-courses/overview.html)
- [Intro to Elastic Security](https://www.elastic.co/training/intro-to-elastic-security)
- [Microsoft Sentinel training](https://learn.microsoft.com/en-us/training/paths/sc-200-configure-azure-sentinel-environment/)
- [LetsDefend](https://letsdefend.io/)
- [NIST SP 800-61 Rev. 3](https://csrc.nist.gov/pubs/sp/800/61/r3/final)

---

## Module 7 — Turn Threat Information into Decisions

**ID:** `threats-and-frameworks`  
**Hook:** Explain what the evidence suggests and what a defender should do.  
**Estimated time:** 4 hours

### Learning objectives

- Distinguish threats, vulnerabilities, indicators, and behaviors.
- Use ATT&CK and the kill chain appropriately.
- Evaluate threat reports and analytical confidence.
- Connect intelligence to a defensive decision.

### Lesson content

A threat is a potential cause of harm, while a vulnerability is a weakness that may be exploited. An exploit is a means of taking advantage of a weakness. Risk depends on the relevant scenario and consequences, not merely the existence of a tool or vulnerability. When discussing an incident, identify what the adversary wanted, how access was obtained, what actions followed, and what evidence supports each part of the account.

Phishing uses deceptive messages or interactions to influence a victim’s behavior. It may seek credentials, malicious execution, payment, or authorization of access. Malware is software used for harmful purposes and can include loaders, ransomware, information stealers, and other capabilities. These categories overlap and do not tell you the entire intrusion path. A suspicious attachment is one artifact; delivery records, execution evidence, account activity, and subsequent network behavior build the larger picture.

Indicators of compromise include observable values such as hashes, domains, addresses, or file paths associated with suspicious activity. Their usefulness depends on context, age, specificity, and source quality. Shared hosting, recycled infrastructure, and ordinary software names can create misleading matches. Behaviors may remain useful after an attacker changes infrastructure. A diagram to remember is: raw observation → context and evaluation → supported assessment → decision or action.

MITRE ATT&CK organizes observed adversary behaviors into tactics, techniques, and sub-techniques. A tactic represents an adversary objective, while a technique describes a way to achieve an objective. Map what the evidence supports and explain uncertainty when several mappings are plausible. A matrix with many colored cells does not prove comprehensive defensive coverage. You need relevant data, functioning analytics, validated responses, and an understanding of what remains unseen.

The Cyber Kill Chain describes reconnaissance, weaponization, delivery, exploitation, installation, command and control, and actions on objectives. It can help explain opportunities to interrupt an intrusion, but real activity may repeat, skip, or reorder what a simple diagram suggests. ATT&CK and the kill chain offer different views rather than competing universal answers. Use whichever helps explain the question without forcing evidence into a neat sequence. [Original framework](https://www.lockheedmartin.com/en-us/capabilities/cyber/cyber-kill-chain.html).

Threat intelligence should answer a consumer’s question. A SOC might need detection opportunities, a vulnerability team might need exploitation context, and leadership might need likely business consequences. Evaluate the report’s evidence, publication timing, collection limits, and distinction between facts and assessments. State confidence and the assumptions that could change it. Attribution to a named actor requires stronger evidence than observing a technique used by many groups.

For interview preparation, select one public report and summarize the initial access, two supported behaviors, affected assets, and useful defensive actions. Identify one claim you cannot independently confirm. In an interview, say: “The report directly supports these observations; this part is an assessment. For our environment, I would check this log source and prioritize this control because it addresses the demonstrated behavior.”

### Key terms

- **Threat:** Potential cause of harmful consequences.
- **Vulnerability:** Weakness that can contribute to compromise.
- **Exploit:** Means of taking advantage of a vulnerability.
- **IOC:** Observable indicator associated with potential compromise.
- **TTP:** Tactics, techniques, and procedures describing behavior.
- **Tactic:** Adversary objective within ATT&CK.
- **Technique:** Method used to achieve an adversary objective.
- **Analytical confidence:** Assessment of how strongly evidence supports a conclusion.

### Practice interview questions

1. **Threat versus vulnerability?**  
   **Model answer:** “A vulnerability is a weakness, while a threat is a potential source or cause of harm. An attacker exploiting an exposed application weakness is one threat scenario. I would evaluate likelihood and impact in the organization’s context.”  
   **Checking:** Risk vocabulary.

2. **IOC versus TTP?**  
   **Model answer:** “An IOC is an observable value such as a domain or hash. TTPs describe adversary behavior and methods. Both can support investigation, but their reliability and lifespan differ.”  
   **Checking:** Intelligence concepts.

3. **What is MITRE ATT&CK used for?**  
   **Model answer:** “It provides a shared way to describe adversary behaviors. Teams use it for analysis, detection planning, emulation, and coverage discussions. A technique label alone does not prove detection effectiveness or actor identity.”  
   **Checking:** Practical framework use.

4. **Does a malicious IP match prove compromise?**  
   **Model answer:** “No, I would inspect timing, direction, service, and the source of the reputation claim. Shared or reassigned infrastructure can complicate interpretation. I would seek corroborating behavior before reaching a conclusion.”  
   **Checking:** Context and false-positive awareness.

5. **How would you analyze phishing?**  
   **Model answer:** “I would inspect delivery details, sender infrastructure, links, attachments, and the requested action safely. Then I would check whether recipients interacted and whether account or endpoint activity followed. I would preserve the message and use the organization’s reporting process.”  
   **Checking:** End-to-end investigation.

6. **What makes intelligence actionable?**  
   **Model answer:** “It answers a relevant question and supports a decision. For example, a report might identify behavior we can detect with existing process logs. I would explain the recommended action, required data, and uncertainty.”  
   **Checking:** Relevance to consumers.

7. **How would you discuss a recent security story?**  
   **Model answer:** “I would summarize what happened, the evidence available, and why it matters to the employer. I would distinguish confirmed details from reporting or speculation. Then I would suggest one practical prevention or detection lesson.”  
   **Checking:** Informed, careful communication.

8. **Can ATT&CK identify the attacker?**  
   **Model answer:** “Not by itself, because many actors share techniques and tools. Attribution can require infrastructure, timing, operational, and other evidence beyond behavior mapping. I would state the confidence and avoid stronger claims than the evidence supports.”  
   **Checking:** Attribution restraint.

### Hands-on task

Use [MITRE’s CTI training](https://attack.mitre.org/resources/learn-more-about-attack/training/cti/) or a public [Mandiant report](https://cloud.google.com/blog/topics/threat-intelligence). Identify three supported behaviors, two defensive opportunities, and one uncertainty.

### Linked resources

- [MITRE ATT&CK](https://attack.mitre.org/)
- [MITRE CTI training](https://attack.mitre.org/resources/learn-more-about-attack/training/cti/)
- [MISP training](https://www.misp-project.org/documentation/)
- [The DFIR Report](https://thedfirreport.com/)
- [Google threat research](https://cloud.google.com/blog/topics/threat-intelligence)

---

## Module 8 — Test Systems with Permission and Purpose

**ID:** `offensive-security-basics`  
**Hook:** Demonstrate a weakness safely and explain how to fix it.  
**Estimated time:** 5 hours

### Learning objectives

- Explain authorization, scope, and rules of engagement.
- Describe a repeatable penetration-testing methodology.
- Distinguish discovery from validated findings.
- Report impact and remediation with minimal necessary evidence.

### Lesson content

Offensive security begins with permission. Technical access, public availability, or personal curiosity does not establish authorization to test a system. Professional work requires clearly defined targets, permitted techniques, timing, data handling, contacts, and stop conditions. A company’s public website is not automatically an internship practice target. Use dedicated training environments and follow their rules, including restrictions on automation, disclosure, and attacks against the platform itself.

A penetration test is a scoped assessment intended to discover and validate security weaknesses and explain their consequences. A vulnerability scan can support it, but scanning alone does not provide the same contextual validation. Red-team work may emphasize defined adversary objectives and defensive evaluation over a broader period. Titles vary, so ask about the actual engagement goals. An intern is not expected to treat every assessment as unrestricted adversary simulation.

A practical methodology is planning → information gathering → enumeration → analysis → authorized validation → reporting → retesting. These activities can overlap as findings change your understanding. Enumeration identifies services, application functions, accounts, or configurations relevant to the scope. Keep notes that separate what a tool observed from what you inferred. A version string may be incomplete or misleading, and a service associated with a CVE is not automatically exploitable.

Validation should use the minimum action needed to establish the issue within agreed limits. Demonstrating unauthorized access to a harmless test record can be sufficient; collecting real customer data is unnecessary and may violate scope. Avoid disruptive tests unless explicitly authorized with safeguards. If you encounter sensitive information, unexpected access, instability, or a third-party system, pause the relevant activity and use the agreed escalation contact rather than exploring further.

Consider a fictional application that allows one test user to view another test user’s document. Document the prerequisite accounts, affected request, expected denial, observed response, and business consequence. The root cause is missing authorization, not merely a predictable identifier. Recommend server-side permission checks and appropriate negative tests. This explanation is more useful than a screenshot labeled “critical” without context or a list of every tool you installed.

A good report serves both technical and business readers. Explain the affected asset, evidence, reproduction conditions, realistic impact, limitations, and remediation. Severity should reflect context, exploitability, and consequences rather than excitement about the technique. Record cleanup actions and confirm that temporary accounts, files, or configuration changes are removed when required. Retesting checks whether the root cause is fixed and whether legitimate behavior still works.

In an interview, walk through one legal lab finding from scope to retest. Mention unsuccessful hypotheses and how you revised them. If asked to test a live system during an interview, clarify authorization and boundaries before interacting. Say: “I would confirm scope, enumerate carefully, validate with minimal impact, and produce a reproducible finding with a practical fix. If the activity crosses the agreed boundary, I stop and escalate.”

### Key terms

- **Scope:** Defined systems, actions, and boundaries of an assessment.
- **Authorization:** Explicit permission for the specified activity.
- **Rules of engagement:** Operational constraints and procedures for testing.
- **Enumeration:** Structured discovery of relevant system details.
- **Validation:** Confirmation that a suspected weakness is real.
- **Proof of concept:** Minimal demonstration supporting a finding.
- **Retest:** Follow-up checking whether remediation resolves the issue.
- **Red team:** Objective-driven adversary simulation under authorization.

### Practice interview questions

1. **What comes before scanning?**  
   **Model answer:** “I would confirm explicit authorization, targets, timing, and permitted techniques. I would identify stop conditions and escalation contacts. Then I would choose a discovery approach consistent with those limits.”  
   **Checking:** Professional boundaries.

2. **Vulnerability scan versus pentest?**  
   **Model answer:** “A scan identifies potential weaknesses through automated checks. A pentest adds scoped investigation, validation, context, and reporting. Automated output still requires interpretation and may contain false positives.”  
   **Checking:** Methodology.

3. **What would you do if you found customer data?**  
   **Model answer:** “I would stop unnecessary access and preserve only the minimum evidence allowed by the engagement. I would notify the designated contact using the agreed procedure. I would not copy or explore the data to make the finding more dramatic.”  
   **Checking:** Ethics and data handling.

4. **Does an old software version prove vulnerability?**  
   **Model answer:** “No, banners may be inaccurate and patches may be backported. I would verify the relevant configuration and vulnerability conditions within scope. I would report uncertainty if safe validation is unavailable.”  
   **Checking:** Evidence quality.

5. **What makes a strong pentest report?**  
   **Model answer:** “It explains the affected asset, conditions, reproducible evidence, and realistic impact. It recommends a root-cause fix and a retest approach. Both an engineer and a risk owner should understand what to do next.”  
   **Checking:** Deliverable quality.

6. **When would you stop a test?**  
   **Model answer:** “I would stop when an agreed condition occurs, such as instability or access outside scope. I would also pause if authorization becomes unclear. I would document the situation and contact the engagement lead.”  
   **Checking:** Judgment under uncertainty.

7. **How do you prioritize findings?**  
   **Model answer:** “I consider exposure, exploitability, affected privileges, and business consequences. I also consider compensating controls and evidence of exploitation. A scanner’s severity is useful input rather than the entire decision.”  
   **Checking:** Risk-based prioritization.

8. **What did a CTF teach you about pentesting?**  
   **Model answer:** “It helped me practice enumeration and hypothesis testing in an authorized environment. I also learned to document why an approach worked rather than only record the final answer. I recognize that production assessments add scope, safety, communication, and business constraints.”  
   **Checking:** Transfer without exaggeration.

### Hands-on task

Complete a beginner [picoGym](https://picoctf.org/get_started.html) or [Bandit](https://overthewire.org/wargames/bandit/) challenge. Write a short engagement-style report with scope, method, evidence, limitation, and remediation lesson.

### Linked resources

- [Nmap Reference Guide](https://nmap.org/book/man.html)
- [OWASP WSTG](https://owasp.org/projects/web-security-testing-guide)
- [picoCTF/picoGym](https://picoctf.org/get_started.html)
- [SANS rules of engagement worksheet](https://www.sans.org/posters/pen-test-rules-of-engagement-worksheet)
- [HTB Academy](https://academy.hackthebox.com/)

---

## Module 9 — Secure Access in the Cloud

**ID:** `cloud-and-identity`  
**Hook:** Start with identities, permissions, data, and service boundaries.  
**Estimated time:** 5 hours

### Learning objectives

- Explain service-dependent shared responsibility.
- Evaluate human and workload permissions.
- Describe common cloud misconfigurations and logging needs.
- Explain SSO, federation, provisioning, and identity lifecycle.

### Lesson content

Cloud security applies familiar principles to services with different operational boundaries. The provider secures underlying infrastructure, while customer duties depend on the service being used. With a virtual machine, the customer commonly manages the guest operating system and applications. With a managed service, more platform responsibilities move to the provider, but identities, data, and configuration still matter. Avoid saying “the cloud provider handles security” without naming the service and responsibility.

Identity is a major control plane. Human users, applications, virtual machines, and automation can all act through identities and credentials. Permissions should match a defined task, with unnecessary access removed. Prefer temporary or appropriately managed credentials over distributing long-lived secrets. A useful diagram is: principal → authentication → policy evaluation → requested action on resource → audit event. Understanding that sequence is more useful than memorizing isolated console screens.

IAM policies describe permissions, but effective access can depend on multiple policy layers and conditions. A role name does not prove least privilege, and a read-only permission can still expose sensitive data. Evaluate which resources are accessible, what actions are allowed, under what conditions, and whether the identity can gain additional privileges indirectly. Access reviews should include workload identities and dormant accounts, not only employees who log in interactively.

Common cloud problems include public data exposure, overly broad permissions, exposed secrets, insecure network access, and missing or inadequate audit coverage. Public access may be intentional for some content, so evaluate the data and intended design. Cloud activity logs, identity logs, storage access records, and workload telemetry provide different evidence. Confirm what is enabled, retained, and collected before assuming an investigation can reconstruct every action.

Authentication and lifecycle controls must work together. SSO reduces repeated sign-ins, federation lets systems rely on an external identity provider, and provisioning creates or updates accounts. OAuth concerns delegated authorization, while OpenID Connect adds an identity layer; SAML is another federation standard. SCIM supports identity provisioning. These mechanisms solve related but different problems. Removing an employee from the organization should also address access, sessions, tokens, and application-specific accounts.

MFA improves authentication, but the method and recovery process matter. Phishing-resistant authentication can reduce credential-relay risk, while weak recovery may undermine a strong primary method. Privileged access should receive additional attention through limited duration, approval where appropriate, monitoring, and emergency-access planning. “Zero trust” means evaluating access with explicit assumptions and context; it is not a product that removes the need for careful permissions or network design.

Cloud practice also requires cost and isolation planning. Free reading does not guarantee free deployed resources. Use provider training or dedicated empty sandbox accounts, avoid sensitive workloads, and verify cleanup after exercises. In an interview, say: “I would identify the service boundary, evaluate effective permissions, protect credentials, and verify logging. For an identity change, I would check the full lifecycle rather than assume disabling one account removes every active access path.”

### Key terms

- **IAM:** Management of identities and permitted access.
- **Principal:** Identity capable of requesting an action.
- **Role:** Permission-bearing identity or assignment, depending on platform.
- **Federation:** Trust arrangement allowing external identity assertions.
- **SSO:** Authentication experience spanning multiple applications.
- **OIDC:** Identity layer built on OAuth 2.0.
- **SCIM:** Standard supporting identity provisioning.
- **Shared responsibility:** Allocation of security duties between provider and customer.

### Practice interview questions

1. **What is shared responsibility?**  
   **Model answer:** “It divides security duties between the cloud provider and customer. The boundary changes by service, such as a virtual machine versus a managed database. I would identify the specific service before assigning responsibilities.”  
   **Checking:** Service-aware reasoning.

2. **What is least privilege in cloud IAM?**  
   **Model answer:** “An identity receives only the actions and resource access needed for its task. I would assess effective permissions, conditions, and possible privilege-escalation paths. I would also review access over time rather than treat the initial policy as permanent.”  
   **Checking:** Practical access evaluation.

3. **What would you do about a leaked cloud key?**  
   **Model answer:** “I would follow the incident process to revoke or rotate the credential promptly. I would investigate its exposure and use, including actions taken before revocation. I would also remove the source of leakage and verify dependent services recover safely.”  
   **Checking:** Response beyond deleting a file.

4. **Is public object storage always a vulnerability?**  
   **Model answer:** “No, public distribution may be intentional for approved content. I would compare actual access with the data classification and intended design. Sensitive or unintentionally exposed data would require urgent investigation and remediation.”  
   **Checking:** Contextual configuration assessment.

5. **SSO versus provisioning?**  
   **Model answer:** “SSO concerns the authentication experience across applications. Provisioning concerns creating, updating, and removing accounts or entitlements. An organization can have SSO while still failing to remove application access correctly.”  
   **Checking:** Identity lifecycle distinctions.

6. **OAuth versus OpenID Connect?**  
   **Model answer:** “OAuth supports delegated authorization to resources. OpenID Connect adds an identity layer for authentication use cases. I would use a supported library and verify tokens according to the specific protocol and application requirements.”  
   **Checking:** Protocol purposes.

7. **What should happen when an employee leaves?**  
   **Model answer:** “The organization should execute its approved offboarding process across identities, entitlements, sessions, and credentials. I would verify application provisioning and access removal rather than assume every system updates immediately. Exceptions should be documented and escalated.”  
   **Checking:** Complete lifecycle thinking.

8. **Why might a cloud lab cost money?**  
   **Model answer:** “The training material may be free while compute, storage, networking, or lab credits are billed. I would review the deployment and use an isolated sandbox. I would verify cleanup because an alert about spending is not necessarily a hard cap.”  
   **Checking:** Operational responsibility.

### Hands-on task

Complete selected free material from [Microsoft Entra training](https://learn.microsoft.com/en-us/training/paths/describe-capabilities-of-microsoft-identity-access/). Draw a fictional employee’s joiner–mover–leaver lifecycle and mark authentication, provisioning, authorization, and review steps.

### Linked resources

- [AWS security training](https://aws.amazon.com/training/learn-about/security/)
- [Microsoft Entra training](https://learn.microsoft.com/en-us/training/paths/describe-capabilities-of-microsoft-identity-access/)
- [Google Cloud security training](https://www.skills.google/course_templates/87)
- [AWS shared responsibility](https://aws.amazon.com/compliance/shared-responsibility-model/)
- [NIST authentication guidance](https://csrc.nist.gov/pubs/sp/800/63/b/4/final)

---

## Module 10 — Automate Carefully

**ID:** `security-automation`  
**Hook:** Make repetitive work faster without making mistakes harder to see.  
**Estimated time:** 5 hours

### Learning objectives

- Select Python, Bash, or PowerShell for a bounded task.
- Describe robust parsing and data handling.
- Explain safe API, credential, and failure handling.
- Validate automation before trusting its output.

### Lesson content

Security automation is useful when a task has repeatable inputs, clear rules, and a result someone can verify. Examples include summarizing authentication failures, enriching indicators, checking configuration, or preparing a report. Begin with a question rather than a language: what decision should the output support, which records are available, and what could go wrong? Automating an unclear process can produce misleading results more quickly without improving the decision.

Python is useful for structured data, APIs, and workflows requiring more logic. Bash works well for connecting command-line tools in suitable environments. PowerShell is particularly useful for Windows administration and object-based data handling. These are overlapping choices, not rigid boundaries. In an interview, explain why the language fits the environment, available libraries, expected maintenance, and the people who will use the result.

Consider a tiny Python-style example described in plain language: read JSON authentication records → validate required fields → keep failed attempts → group by source and account → report counts and time ranges. That workflow preserves structure rather than searching arbitrary text for the word “failed.” It also exposes design questions: what happens to malformed rows, missing timestamps, duplicate events, or records from different time zones? Those decisions can change the conclusion.

A Bash-style example is: read an approved log export → select the intended fields → count relevant records → write a summary. Quoting and safe argument handling matter because filenames and input values may contain spaces or shell characters. Do not turn log text into commands. Check exit statuses and avoid silently interpreting an empty intermediate result as proof that no suspicious activity occurred.

A PowerShell-style example is: retrieve approved event objects → filter by properties → select account and timestamp → export a report. Its pipeline commonly passes objects rather than only text, so property-aware operations are often clearer than parsing formatted output. PowerShell’s execution policy is not a security boundary. Administrative permissions, endpoint controls, secure design, and logging remain relevant regardless of the policy setting.

Automation that calls an API needs authentication, timeouts, pagination handling, and a plan for rate limits or partial failures. Keep secrets out of source files, screenshots, and logs. Use read-only permissions where possible, and separate observation from changes that disable users or modify systems. For impactful actions, design approval, preview, logging, and rollback behavior according to the organization’s process. Retrying an operation can be unsafe if it is not idempotent.

Validate a small tool using representative normal, malformed, empty, duplicate, and boundary-case inputs. Compare its output with a manual result and document assumptions. Counts are observations, not automatic attack verdicts: a threshold needs context and a suitable time window. In an interview, say: “I would parse structured input, handle failures explicitly, preserve traceability to raw events, and test the result before using it to drive a security decision.”

### Key terms

- **Parsing:** Interpreting input according to a defined structure.
- **JSON:** Structured text format for data exchange.
- **API:** Interface through which software requests functionality or data.
- **Pagination:** Splitting a result set across multiple responses.
- **Exception:** Condition disrupting normal program execution.
- **Idempotency:** Repeating an operation has no additional intended effect.
- **Rate limit:** Restriction on request frequency or volume.
- **Secret:** Sensitive credential or cryptographic material.

### Practice interview questions

1. **What would you automate first in a SOC?**  
   **Model answer:** “I would choose a repetitive, low-risk task with clear inputs, such as preparing a consistent event summary. I would compare automated output with manual analysis. I would avoid starting with unsupervised containment actions.”  
   **Checking:** Scope and risk judgment.

2. **Why parse JSON instead of searching raw text?**  
   **Model answer:** “Structured parsing lets me use defined fields and types. A text match may confuse a message description with the actual result field. I would still validate the schema and handle missing or malformed values.”  
   **Checking:** Data correctness.

3. **How would you handle malformed records?**  
   **Model answer:** “I would record that parsing failed and preserve enough context to inspect the original input safely. I would distinguish skipped records from valid records with no matching activity. The report should expose incomplete coverage rather than silently hide it.”  
   **Checking:** Failure transparency.

4. **Python, Bash, or PowerShell?**  
   **Model answer:** “I would choose based on the task and operating environment. Python suits structured workflows, Bash can connect Unix tools, and PowerShell provides strong Windows object-based administration. Maintainability and team familiarity also matter.”  
   **Checking:** Practical language selection.

5. **How should a script store an API key?**  
   **Model answer:** “It should use the organization’s approved secret-management mechanism. I would avoid committing the key or exposing it in logs and command history. The credential should have limited permissions and a rotation process.”  
   **Checking:** Credential handling.

6. **What are common API mistakes?**  
   **Model answer:** “Ignoring pagination, timeouts, rate limits, and partial failures can produce incomplete or misleading results. Authentication errors also need clear handling. I would report which data was retrieved and which requests failed.”  
   **Checking:** Reliability.

7. **How would you test a log-summary tool?**  
   **Model answer:** “I would use a small dataset with known expected results and compare it manually. I would include malformed rows, duplicates, empty input, and time-boundary cases. I would also verify that no sensitive fields appear unnecessarily in the output.”  
   **Checking:** Meaningful validation.

8. **Does crossing a failure threshold prove an attack?**  
   **Model answer:** “No, a threshold identifies a pattern worth investigating. Misconfigured services or normal user mistakes may produce similar counts. I would examine distribution, account context, successful activity, and other evidence.”  
   **Checking:** Separation of measurement and conclusion.

### Hands-on task

Use the free [Python Tutorial](https://docs.python.org/3/tutorial/) or [PowerShell 101](https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/01-getting-started) exercises. Design a log-summary workflow on paper, including five test inputs, expected results, and failure handling; implementation can be a later project.

### Linked resources

- [Python Tutorial](https://docs.python.org/3/tutorial/)
- [GNU Bash Manual](https://www.gnu.org/software/bash/manual/)
- [PowerShell 101](https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/01-getting-started)
- [Missing Semester](https://missing.csail.mit.edu/)

---

## Module 11 — Connect Controls to Business Risk

**ID:** `grc-and-risk`  
**Hook:** Explain why a control matters and what evidence supports it.  
**Estimated time:** 3 hours

### Learning objectives

- Distinguish governance, risk management, and compliance.
- Write a concrete risk statement and treatment plan.
- Compare CSF 2.0, ISO 27001, and SOC 2.
- Evaluate control evidence and communicate exceptions.

### Lesson content

Governance establishes direction, accountability, and oversight. Risk management identifies and evaluates uncertainty that could affect objectives, then chooses how to address it. Compliance concerns meeting applicable requirements, such as laws, contracts, or internal policies. These activities overlap, but passing a checklist does not establish that every important risk is controlled. A useful starting question is: what business outcome are we protecting, and who is accountable for the decision?

Write risk as a scenario rather than a vague label. For example: “If a privileged account is compromised, an attacker could alter customer records because access is broad and administrative actions are not sufficiently reviewed.” This identifies a threat situation, weakness, asset, and consequence. Evaluate likelihood and impact using the organization’s method, and document assumptions. Avoid multiplying arbitrary scores and presenting the result as precise scientific measurement.

Controls can prevent, detect, or help correct unwanted events. Examples include restricted permissions, monitoring, backups, and recovery exercises. A policy states expectations; a standard may define mandatory requirements; a procedure explains how to perform a task. Their names and hierarchy vary by organization. A control is useful only when its design addresses the scenario and its operation can be demonstrated over the relevant scope and period.

Risk treatment options commonly include reducing, avoiding, transferring or sharing, and accepting risk. Acceptance should involve the appropriate owner and documented rationale, conditions, and review date. Insurance or contractual transfer does not remove every operational consequence. Residual risk remains after treatment. A GRC intern may help gather evidence or track exceptions, but should not quietly accept significant risk on behalf of the organization.

NIST CSF 2.0 organizes cybersecurity outcomes into Govern, Identify, Protect, Detect, Respond, and Recover. It supports communication and prioritization rather than prescribing one universal implementation. ISO/IEC 27001 concerns an information security management system and continual improvement. SOC 2 is an assurance examination and report concerning scoped controls against relevant Trust Services Criteria. They serve different purposes and should not be described as interchangeable personal certifications.

Evidence should match the claim. A screenshot of a setting may support configuration at one moment, but not prove that a process operated consistently for six months. Access-review evidence might include the population reviewed, reviewer decisions, approvals, and remediation of exceptions. Check completeness, dates, scope, and provenance. Ask whether the evidence shows that a control exists, that it operated, or that it achieved the intended result.

Communicate findings in terms of consequence and action. Instead of saying “noncompliant,” explain the requirement, observed gap, supporting evidence, affected scope, and proposed next step. Respect sensitive information and share only what the review requires. In an interview, say: “I would connect the requirement to a risk scenario, gather evidence appropriate to the claim, and route exceptions to the accountable owner with a clear remediation or acceptance process.”

### Key terms

- **Governance:** Direction, accountability, and oversight.
- **Risk:** Uncertainty affecting objectives, including potential harm.
- **Control:** Measure intended to modify risk.
- **Residual risk:** Risk remaining after treatment.
- **Risk owner:** Person accountable for managing a risk.
- **ISMS:** Information security management system.
- **Audit evidence:** Information supporting an assurance conclusion.
- **Exception:** Approved or identified departure from a requirement.

### Practice interview questions

1. **What is GRC?**  
   **Model answer:** “It connects governance, risk management, and compliance. Governance defines accountability, risk management addresses uncertainty, and compliance evaluates applicable obligations. Effective GRC connects these activities to actual business outcomes.”  
   **Checking:** Clear distinctions.

2. **Risk versus vulnerability?**  
   **Model answer:** “A vulnerability is a weakness that may contribute to harm. Risk considers a scenario’s likelihood and consequences in context. The same weakness can create different risk in different environments.”  
   **Checking:** Contextual assessment.

3. **What is residual risk?**  
   **Model answer:** “It is the risk remaining after controls or other treatment are applied. The appropriate owner should understand and evaluate it. A completed remediation task does not necessarily reduce the remaining risk to zero.”  
   **Checking:** Limits of controls.

4. **What is SOC 2?**  
   **Model answer:** “It is an assurance examination and report about scoped controls relevant to Trust Services Criteria. It is not a personal certification or a promise that no breach can occur. I would review scope, period, exceptions, and other relevant report details.”  
   **Checking:** Assurance literacy.

5. **How does ISO 27001 differ from CSF?**  
   **Model answer:** “ISO 27001 specifies requirements for an information security management system. CSF describes cybersecurity outcomes that help organizations assess and communicate their approach. Organizations can use them together, but they are not the same artifact.”  
   **Checking:** Framework differentiation.

6. **What makes good audit evidence?**  
   **Model answer:** “It is relevant to the claim, complete for the scope, and attributable to the right source and period. I would check whether it demonstrates design or actual operation. I would document gaps rather than assume a screenshot proves everything.”  
   **Checking:** Evidence quality.

7. **Who can accept a risk?**  
   **Model answer:** “The organization’s defined accountable authority should make that decision. My role would be to document the scenario, treatment options, and residual risk. I would not treat silence or an overdue ticket as formal acceptance.”  
   **Checking:** Accountability.

8. **How would you explain a control gap to leadership?**  
   **Model answer:** “I would describe the affected business process and plausible consequence. Then I would summarize the evidence and practical treatment options. I would state the decision needed and who should own it.”  
   **Checking:** Business communication.

### Hands-on task

Using [NIST CSF 2.0](https://www.nist.gov/cyberframework), assess a fictional student club’s membership system. Write three risk scenarios, one control per scenario, the evidence you would request, and the person who should own the decision.

### Linked resources

- [NIST CSF 2.0](https://www.nist.gov/cyberframework)
- [ISO 27001 overview](https://www.iso.org/standard/27001)
- [AICPA SOC resources](https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services)
- [NICE Framework](https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center/nice-framework-current-versions)

---

## Module 12 — Tell Credible Security Stories

**ID:** `behavioral-security-interviews`  
**Hook:** Show judgment through specific actions and honest reflection.  
**Estimated time:** 4 hours

### Learning objectives

- Build truthful STAR stories from student experiences.
- Explain individual contributions within team work.
- Respond to ethical and interpersonal situations.
- Give concise answers that include results and learning.

### Lesson content

Behavioral interviews ask how you have acted because teams need more than technical vocabulary. Security work involves uncertainty, access, disagreement, deadlines, and sensitive information. A useful answer makes your decisions visible. Experiences from classes, campus jobs, volunteer work, clubs, or personal projects are valid when they demonstrate the relevant behavior. Do not invent a breach response or professional responsibility because you assume ordinary student experience is insufficient.

STAR stands for Situation, Task, Action, and Result. Briefly establish the context and your responsibility, spend most of the answer on what you did, and finish with the outcome and learning. Add reflection when it helps explain what you would change. A text diagram is: context → responsibility → decisions and actions → observed outcome → improvement. The structure should support a natural conversation rather than sound like four memorized headings.

Build a small story bank covering teamwork, a mistake, learning something unfamiliar, disagreement, prioritization, and ethical judgment. One project can support several stories, but change the emphasis to answer the actual question. Distinguish “we” from “I”: credit the team while identifying your contribution. If you do not know the project’s final business impact, describe the result you observed rather than inventing a percentage or revenue estimate.

A mistake story should show ownership without suggesting carelessness is acceptable. Explain how you noticed the issue, limited its effects, informed the right person, corrected it, and changed your process. For example, a lab configuration error may have caused missing logs. The lesson is stronger when you explain how you verified collection afterward than when you claim you “learned to be more careful” without a concrete change.

Security disagreements often involve tradeoffs. A developer may resist a proposed control because it disrupts users, or an analyst may interpret evidence differently. Clarify the shared goal, listen to the other reasoning, and bring evidence or a small test. Escalate unresolved decisions through the appropriate owner. Respectful disagreement does not require pretending every proposal is equally sound; it requires separating the person from the technical and business question.

Ethics questions test boundaries and trust. If you discover access you should not have, do not explore it to prove curiosity. Stop unnecessary interaction, preserve minimal appropriate context, and report through the correct channel. If someone asks you to hide a finding or misstate evidence, explain the factual issue and escalate appropriately. An intern should be willing to ask for guidance while still recognizing clearly improper requests.

Practice aloud with a partner and ask what they understood about your role, reasoning, and result. Remove excessive setup and details that do not affect the decision. In an interview, say: “Here was my responsibility, here is what I observed, and here is why I chose that action.” A credible, modest story with reflection usually gives a better signal than a dramatic story whose details cannot withstand follow-up.

### Key terms

- **STAR:** Situation, Task, Action, and Result.
- **Ownership:** Taking responsibility for one’s actions and follow-through.
- **Escalation:** Routing an issue to an appropriate authority.
- **Reflection:** Evaluation of what worked and what should change.
- **Conflict resolution:** Constructive handling of differing views.
- **Confidentiality:** Appropriate protection of sensitive information.
- **Feedback:** Information used to improve performance.
- **Scope of authority:** Decisions and actions a person is permitted to take.

### Practice interview questions

1. **Tell me about a mistake.**  
   **Model answer:** “In a suitable real example, I would explain the error and my responsibility directly. I would describe how I corrected it, communicated the impact, and verified the fix. I would finish with the specific process change I now use.”  
   **Checking:** Ownership and learning; replace with an actual story.

2. **Tell me about a disagreement.**  
   **Model answer:** “I would describe the shared goal and the two competing approaches. My answer would focus on listening, gathering evidence, and testing assumptions rather than proving someone wrong. I would explain the decision and what I learned from it.”  
   **Checking:** Constructive collaboration.

3. **What if you found unauthorized access?**  
   **Model answer:** “I would stop unnecessary access and avoid collecting sensitive information. I would preserve minimal relevant context and report through the approved channel. I would not expand the test without explicit authorization.”  
   **Checking:** Ethical boundaries.

4. **What if a teammate wanted to omit a finding?**  
   **Model answer:** “I would ask about the concern and distinguish a disputed conclusion from hiding evidence. I would keep the report factual and seek review from the appropriate lead. I would not knowingly misrepresent a result.”  
   **Checking:** Integrity and escalation.

5. **How do you handle feedback?**  
   **Model answer:** “I ask for a concrete example and the expected behavior. Then I apply the feedback and check whether the result improved. A real example should show the change, not just say I am receptive.”  
   **Checking:** Coachability.

6. **How do you prioritize several tasks?**  
   **Model answer:** “I clarify deadlines, impact, dependencies, and who owns the priorities. I communicate tradeoffs early if everything cannot be completed. I then track the agreed work and raise blockers before they become surprises.”  
   **Checking:** Reliability.

7. **Tell me about learning something difficult.**  
   **Model answer:** “I would choose an actual example and explain the initial gap. I would describe how I broke it into smaller tasks, used documentation, and checked understanding through practice. I would finish with what I can now do and what remains unfamiliar.”  
   **Checking:** Learning process.

8. **What if you caused a security problem?**  
   **Model answer:** “I would report it promptly and follow the incident or supervisory process. I would provide accurate facts and help limit the impact within my authority. After correction, I would support a review focused on preventing recurrence.”  
   **Checking:** Trust under pressure.

### Hands-on task

Use prompts from the [Jassics question repository](https://github.com/jassics/security-interview-questions). Record six truthful STAR outlines and practice two aloud with a partner; ask them to identify your action, result, and learning.

### Linked resources

- [Jassics interview questions](https://github.com/jassics/security-interview-questions)
- [Harvard résumé guidance](https://careerservices.fas.harvard.edu/resources/create-a-strong-resume/)
- [SANS rules of engagement](https://www.sans.org/posters/pen-test-rules-of-engagement-worksheet)

---

## Module 13 — Reason Through Unfamiliar Evidence

**ID:** `technical-scenarios`  
**Hook:** Make your next step understandable even when the answer is uncertain.  
**Estimated time:** 5 hours

### Learning objectives

- Separate observations, hypotheses, and conclusions.
- Ask useful scoping and impact questions.
- Build timelines and identify missing evidence.
- Choose safe next actions and communicate confidence.

### Lesson content

Scenario questions evaluate your process more than your ability to name one correct tool. Begin by restating what you know and what remains unclear. Ask about the environment, time range, affected assets, business impact, and your authority. Then form a small number of hypotheses and identify evidence that would distinguish them. A useful diagram is: observation → possible explanations → discriminating evidence → decision → reassessment.

Consider this synthetic log observation: at 02:14 UTC, account student-a had twelve failed logons from 192.0.2.25, followed by one successful logon. The address is from a documentation range, and the sequence alone does not prove compromise. Possible explanations include user mistakes, an automated process, or credential abuse. Ask about logon type, account use, device identity, authentication method, and what happened after success. Correlation creates meaning that the count lacks.

Now imagine an endpoint alert showing a document application starting a shell. That parent-child relationship may be suspicious, but legitimate automation can produce unusual chains. Examine the full command line, executable path, signer, file origin, user interaction, and subsequent activity. If evidence indicates active harm, escalate urgency and follow authorized containment. Do not delay necessary response while pursuing a perfect explanation, but document what remains uncertain.

For a web scenario, suppose one user can retrieve another user’s invoice by changing an identifier. Ask whether the accounts are intended to share access and whether the server checks object-level permission. Use approved test records to validate the boundary. The likely fix is authorization enforcement rather than merely making identifiers longer. Explain how you would test legitimate owner access, unauthorized peer access, and privileged access after remediation.

For a cloud scenario, a storage resource appears public. Determine what “public” means in that provider, which operations are allowed, and what data is present or exposed. Preserve relevant configuration and access evidence while coordinating remediation. Public website assets may be intentional; private records are a different situation. Identify the owner and downstream dependencies so a hurried access change does not create an avoidable outage.

Timelines require careful time handling. Preserve original timestamps and offsets, normalize for analysis, and distinguish event time from ingestion time. Record the provenance of exported logs and any transformations. Missing records may reflect collection gaps rather than absence of activity. In DFIR, prefer documented evidence handling and appropriate working copies; a hash helps compare integrity but does not replace provenance or a clear account of your actions.

Finish with a short assessment: what you observed, your leading explanation and confidence, the next evidence needed, and any action already taken. Avoid presenting five tools without explaining the question each answers. In an interview, say: “This is suspicious because of these observations, but I would test these alternatives. My immediate priority is this impact, and my next evidence request is this source because it separates the competing explanations.”

### Key terms

- **Observation:** Directly available fact or recorded result.
- **Hypothesis:** Explanation that can be tested against evidence.
- **Corroboration:** Independent evidence supporting an interpretation.
- **Timeline:** Ordered reconstruction of relevant events.
- **Provenance:** Origin and history of information or evidence.
- **Scope:** Known or investigated extent of an issue.
- **Confidence:** Strength of support for an assessment.
- **Discriminating evidence:** Information that helps distinguish explanations.

### Practice interview questions

1. **Failed logins followed by success: what do you do?**  
   **Model answer:** “I would inspect the account, source, logon type, and authentication details. I would compare the sequence with expected behavior and examine actions after success. I would escalate according to impact and evidence rather than declare compromise from the sequence alone.”  
   **Checking:** Hypothesis-driven triage.

2. **A document application launches a shell. Is it malware?**  
   **Model answer:** “It is a useful suspicious behavior, but it needs context. I would inspect the command line, file origin, account, and subsequent activity. I would follow containment procedures if the evidence indicates active harm.”  
   **Checking:** Balanced urgency and skepticism.

3. **You see a connection to a reported malicious domain. What next?**  
   **Model answer:** “I would verify the indicator source and timing, then determine which process or user made the request. I would inspect related DNS, proxy, endpoint, and network evidence. I would distinguish a blocked attempt from successful communication and follow-on activity.”  
   **Checking:** Correlation and impact.

4. **Logs disagree about timing. What do you do?**  
   **Model answer:** “I would inspect time zones, clock synchronization, and event-versus-ingestion timestamps. I would preserve the original values while documenting any normalization. I would avoid forcing an exact sequence where the evidence cannot support it.”  
   **Checking:** Timeline reliability.

5. **A cloud bucket is public. Is that an incident?**  
   **Model answer:** “I would determine the intended access and data sensitivity. I would also inspect what operations were possible and whether access occurred. The response depends on the exposure and organizational criteria, not the word ‘public’ alone.”  
   **Checking:** Contextual cloud analysis.

6. **A user can access another user’s invoice. What is the likely issue?**  
   **Model answer:** “I would suspect missing object-level authorization, subject to confirming the intended permissions. I would validate with approved test accounts and minimal evidence. The remediation should enforce server-side access checks and include negative tests.”  
   **Checking:** Root-cause identification.

7. **What if you have no relevant logs?**  
   **Model answer:** “I would state the visibility gap and look for alternative sources such as endpoint, application, or identity evidence. I would not interpret missing logs as proof that nothing happened. I would document how the gap limits the conclusion and recommend improved collection.”  
   **Checking:** Handling incomplete evidence.

8. **How would you summarize an unresolved investigation?**  
   **Model answer:** “I would separate observed facts from the leading hypothesis and state confidence. I would explain current impact, actions taken, and the specific evidence still needed. I would give the next owner a clear question rather than an unsupported verdict.”  
   **Checking:** Useful handoff under uncertainty.

### Hands-on task

Complete a free downloadable [Blue Team Labs Online](https://blueteamlabs.online/) challenge or a free [CyberDefenders](https://cyberdefenders.org/blueteam-ctf-challenges/) lab. Produce a five-event timeline and label every statement as observation, interpretation, or unresolved question.

### Linked resources

- [Blue Team Labs Online](https://blueteamlabs.online/)
- [CyberDefenders](https://cyberdefenders.org/blueteam-ctf-challenges/)
- [SANS DFIR Fundamentals](https://www.sans.org/posters/dfir-fundamentals-poster)
- [CyberChef](https://gchq.github.io/CyberChef/)
- [NIST CFReDS](https://cfreds.nist.gov/artcat)

---

## Module 14 — Make Your Work Easy to Evaluate

**ID:** `portfolio-and-projects`  
**Hook:** Show a question, a method, a result, and your own judgment.  
**Estimated time:** 5 hours

### Learning objectives

- Select projects relevant to an internship track.
- Document reproducible work and meaningful limitations.
- Write factual résumé bullets and project explanations.
- Present projects without exposing secrets or restricted material.

### Lesson content

A portfolio gives an interviewer something concrete to discuss. It does not need many repositories or expensive equipment. Two well-explained projects can be enough to show curiosity, technical foundations, and follow-through. The strongest projects answer a question and produce evidence. Installing a tool is a starting point; investigating an event, testing a control, or evaluating a design shows what you can do with it.

Choose projects that match your target work. A SOC candidate might investigate a supplied log set and produce a timeline. An AppSec candidate might document an authorized lab finding and its fix. An IAM candidate could model a joiner–mover–leaver process and test permissions in a safe environment. A GRC candidate could build a fictional risk register and explain evidence requests. Label every simulation, dataset, and assumption clearly.

A useful project structure is purpose → environment → method → evidence → result → limitations → next steps. Include enough detail for another person to understand or reproduce the work within the same authorized conditions. Explain why you selected the telemetry or tool and what alternatives you considered. Record versions when they matter. Screenshots should support the explanation, not replace it, and should avoid unnecessary personal or sensitive data.

For a detection project, explain the behavior you wanted to identify, required logs, test conditions, and observed alert. Include at least one benign case and one limitation. A rule that matches a demonstration does not automatically detect every implementation of an ATT&CK technique. For a forensic project, document dataset provenance, evidence handling, tool actions, and uncertainty. Your reasoning matters more than obtaining a challenge’s final answer.

Homelabs should fit your resources. Browser labs, public datasets, campus environments, and small local virtual machines can all provide valuable evidence. Review hardware requirements before installing a large monitoring stack. Keep vulnerable systems isolated and avoid real personal data. If a cloud exercise creates billable resources, verify cleanup. A maintained, modest lab that you understand is easier to defend in an interview than a copied architecture you cannot explain.

Write résumé bullets with an action, task, method, and supported result. For example: “Analyzed a public authentication-log dataset, correlated failed and successful logons, and documented three competing explanations with supporting evidence.” Use numbers only when you measured them, and say “lab” when it was a lab. Do not write “prevented a breach” because a simulated alert fired. List certifications as earned, in progress, or planned accurately.

Prepare a two-minute walkthrough and a deeper version. Explain the question, your contribution, the hardest decision, the result, and what you would improve. Respect CTF publication rules, dataset licenses, and confidentiality obligations; link to the challenge instead of publishing restricted solutions. In an interview, say: “This was a controlled project. Here is the evidence I produced, the part I personally owned, and the limitation I would address next.”

### Key terms

- **Portfolio:** Selected work demonstrating relevant capabilities.
- **Reproducibility:** Ability to repeat a method under documented conditions.
- **README:** Project document explaining purpose and usage.
- **Artifact:** Output or evidence produced during work.
- **Validation:** Check that a result supports the intended claim.
- **Limitation:** Boundary on what a result establishes.
- **Homelab:** Personally managed environment for authorized learning.
- **Attribution:** Credit identifying the source of work or material.

### Practice interview questions

1. **Walk me through your best project.**  
   **Model answer:** “I would start with the question and why it mattered. Then I would explain my method, personal contribution, and supporting evidence. I would finish with the result and one limitation or improvement.”  
   **Checking:** Ownership and depth.

2. **What makes a project useful for a SOC internship?**  
   **Model answer:** “It should show investigation rather than only installation. A clear hypothesis, correlated evidence, timeline, and case note demonstrate relevant work. I would also explain uncertainty and false-positive considerations.”  
   **Checking:** Role relevance.

3. **Do you need an expensive homelab?**  
   **Model answer:** “No, useful evidence can come from browser labs, public datasets, campus systems, or small local environments. The important part is a question I can investigate and explain. I would choose a setup that I can maintain and validate.”  
   **Checking:** Practical priorities.

4. **How do you know your detection works?**  
   **Model answer:** “I would verify the required telemetry and test the intended behavior in an authorized environment. I would also examine benign cases and document limitations. A single successful demonstration supports a bounded claim rather than universal coverage.”  
   **Checking:** Validation discipline.

5. **What would you improve in your project?**  
   **Model answer:** “I would identify the most consequential limitation rather than add features arbitrarily. For example, I might improve timestamp handling or test additional benign activity. I would explain how that change improves confidence in the result.”  
   **Checking:** Reflection and prioritization.

6. **How would you describe a CTF on your résumé?**  
   **Model answer:** “I would label it as a training challenge and name the skills I practiced. I would describe my method or writeup without implying production responsibility. I would also respect restrictions on publishing solutions.”  
   **Checking:** Honest representation.

7. **What should you remove before publishing a project?**  
   **Model answer:** “I would check for credentials, tokens, personal data, internal identifiers, and restricted material. I would also review screenshots, history, and sample files. If a secret was exposed, removing the visible text alone would not replace revocation and investigation.”  
   **Checking:** Publication hygiene.

8. **How did you contribute to a team project?**  
   **Model answer:** “I would distinguish the team outcome from the components I personally owned. I would describe interfaces, decisions, and collaboration with teammates. I would be clear about parts I understand conceptually but did not implement.”  
   **Checking:** Accurate ownership.

### Hands-on task

Use [GitHub’s profile guidance](https://docs.github.com/en/account-and-profile/how-tos/profile-customization) to plan a portfolio with two pinned projects. Complete one safe exercise from the [Wazuh proof-of-concept guide](https://documentation.wazuh.com/current/proof-of-concept-guide/index.html), or document an existing browser lab if local hardware is unsuitable.

### Linked resources

- [GitHub profile guidance](https://docs.github.com/en/account-and-profile/how-tos/profile-customization)
- [Harvard résumé guide](https://careerservices.fas.harvard.edu/resources/create-a-strong-resume/)
- [Wazuh Quickstart](https://documentation.wazuh.com/current/quickstart.html)
- [Wazuh proof-of-concept guide](https://documentation.wazuh.com/current/proof-of-concept-guide/index.html)
- [NIST CFReDS](https://cfreds.nist.gov/artcat)

---

# Part C — Detections → Recommendations

## Interpretation and delivery rules

These detections recommend preparation; they do not diagnose ability or predict hiring outcomes.

- **Role matching:** case-insensitive words or phrases, with boundaries where appropriate. Avoid matching `soc` inside an unrelated word.
- **Stage history:** use recorded status transitions. “Rejected after interview” requires a prior `INTERVIEW` event before `REJECTED`.
- **Application counts:** count distinct application records with an actual `appliedAt` in the window. A wishlist entry is not an application.
- **Current-stage age:** use the latest history entry entering that status. `updatedAt` is only a fallback because unrelated edits may update it.
- **Missing keywords:** means the résumé analysis did not find wording. It does not mean the student lacks the skill.
- **Repeated analysis:** count separate saved analyses only when analysis history exists. Do not fabricate repeated misses from one result.
- **Unknown dates:** suppress date-dependent rules when the necessary timestamp is unavailable.
- **Priority:** active interviews and assessments first; track-specific preparation next; application habits afterward.
- **Frequency:** show at most three recommendations together. Suppress the same rule for seven days unless a new relevant stage transition occurs.
- **Tone:** offer a small next step, acknowledge uncertainty, and allow dismissal. Do not use rejection counts as a punitive score.
- **Ghosting:** recommend reviewing a record; do not automatically change its status to `GHOSTED`.
- **Accepted offers:** suppress routine application-volume nudges for that cycle.

Resource titles below refer to the linked entries in Part A.

## Rules

| ID and name | Trigger condition | Message to show | Recommended modules and resources |
|---|---|---|---|
| `first-application` — Start the preparation loop | First record receives a non-null `appliedAt` | “Your first application is in. Spend 20 minutes preparing a short introduction and matching this role to one project.” | `security-internship-hiring`; Harvard résumé guide; NICE Framework |
| `soc-interview` — SOC interview preparation | Any current `INTERVIEW` with role containing “SOC” or “security operations” | “A SOC interview is active. Practice one alert investigation and explain how you would document and escalate it.” | `blue-team-soc`, `technical-scenarios`; LetsDefend; Splunk Free Training |
| `engineering-interview` — Engineering foundations | Current `INTERVIEW`; role contains “security engineer” or “security engineering” | “Prepare to explain systems, automation, and one engineering tradeoff from your own work.” | `operating-systems-security`, `security-automation`, `portfolio-and-projects`; Missing Semester |
| `pentest-interview` — Offensive methodology | Current `INTERVIEW`; role contains “pentest,” “penetration,” “red team,” or “offensive” | “Walk through scope, enumeration, safe validation, and reporting for one authorized lab finding.” | `offensive-security-basics`, `web-application-security`; WSTG; SANS Rules of Engagement |
| `appsec-interview` — Explain the fix | Current `INTERVIEW`; role contains “AppSec,” “application security,” or “product security” | “Practice explaining the root cause and fix for an access-control issue and an injection issue.” | `web-application-security`, `technical-scenarios`; PortSwigger; OWASP Cheat Sheets |
| `cloud-interview` — Cloud responsibility and access | Current `INTERVIEW`; role contains “cloud security,” “AWS security,” “Azure security,” or “GCP security” | “Review shared responsibility, effective permissions, exposed secrets, and the logs you would investigate.” | `cloud-and-identity`, `technical-scenarios`; AWS Security Training; Google Cloud security training |
| `iam-interview` — Identity lifecycle | Current `INTERVIEW`; role contains “IAM,” “identity,” “access management,” or “PAM” | “Prepare a joiner–mover–leaver example and explain authentication, authorization, and provisioning separately.” | `cloud-and-identity`, `security-fundamentals`; Microsoft Entra; NIST authentication guidance |
| `grc-interview` — Risk and evidence | Current `INTERVIEW`; role contains “GRC,” “compliance,” “risk,” or “security audit” | “Practice a concrete risk statement and explain what evidence would support a control claim.” | `grc-and-risk`, `behavioral-security-interviews`; NIST CSF 2.0; AICPA SOC resources |
| `dfir-interview` — Preserve and reconstruct | Current `INTERVIEW`; role contains “DFIR,” “forensic,” “incident response,” or “incident responder” | “Practice building a timeline and explaining how you preserve evidence before changing a system.” | `blue-team-soc`, `technical-scenarios`, `operating-systems-security`; SANS DFIR; Volatility 3 |
| `cti-interview` — Evidence and confidence | Current `INTERVIEW`; role contains “threat intelligence,” “cyber intelligence,” or “CTI” | “Choose one report. Explain three supported behaviors, one uncertainty, and one defensive recommendation.” | `threats-and-frameworks`; MITRE CTI Training; MISP |
| `detection-interview` — Validate a detection | Current `INTERVIEW`; role contains “detection” or “threat hunting” | “Prepare a detection hypothesis, required telemetry, a positive test, and a benign case.” | `blue-team-soc`, `threats-and-frameworks`, `security-automation`; Sigma; Atomic Red Team |
| `assessment-active` — Understand the assessment | Any application currently `ASSESSMENT` | “Before starting, confirm the format, deadline, permitted tools, and assistance policy. Then rehearse one relevant task.” | `security-internship-hiring`, `technical-scenarios`; Jassics question repository |
| `interview-new-stage` — Prepare the story bank | History shows entry into `INTERVIEW` within the past three days | “Prepare six short stories about teamwork, mistakes, learning, disagreement, prioritization, and ethics.” | `behavioral-security-interviews`; Harvard résumé guide |
| `missing-splunk-repeat` — Splunk wording gap | “splunk” missing in at least two saved analyses; at least one SOC/DET target role | “Your recent résumé analyses do not mention Splunk. If it is relevant, try a free lesson; add it only after you can explain your experience.” | `blue-team-soc`; Splunk Free Training |
| `missing-siem` — SIEM workflow | Latest analysis missing “siem”; SOC/DET target exists | “A target track values SIEM work, but the résumé does not describe it yet. Practice the event-to-investigation workflow.” | `blue-team-soc`; Elastic Security; Sentinel training |
| `missing-python` — Automation evidence | Latest analysis missing “python”; ENG, DET, CTI, or CLOUD target exists | “Consider a small structured-data exercise. If you already use Python, describe the actual task and result rather than adding the word alone.” | `security-automation`; Python Tutorial |
| `missing-powershell` — Windows automation | Latest analysis missing “powershell”; IAM, Windows security, or DFIR target exists | “A Windows-focused application may benefit from evidence of object-based administration or event analysis.” | `security-automation`, `operating-systems-security`; PowerShell 101 |
| `missing-linux` — Terminal foundations | Latest analysis missing “linux”; OFF, CLOUD, or ENG target exists | “Check whether your résumé explains any Linux work. If not, start with permissions and process basics in a legal lab.” | `operating-systems-security`; Introduction to Linux; Bandit |
| `missing-wireshark` — Packet evidence | Latest analysis missing “wireshark”; SOC, DFIR, or OFF target exists | “Try one packet-analysis exercise and explain what the capture reveals. List Wireshark only if you can discuss that work.” | `networking-fundamentals`; Wireshark User’s Guide |
| `missing-nmap` — Explain scan results | Latest analysis missing “nmap”; OFF target exists | “Review authorized enumeration and the meaning of scan states. A service discovery result is a lead, not a vulnerability finding.” | `offensive-security-basics`; Nmap Reference Guide |
| `missing-aws` — AWS-specific preparation | Latest analysis missing “aws”; a role explicitly contains “AWS” | “This role names AWS. Review IAM, logging, and shared responsibility, then describe any relevant experience accurately.” | `cloud-and-identity`; AWS Security Training; AWS Shared Responsibility |
| `missing-incident-response` — Response vocabulary | Latest analysis missing “incident response”; SOC/DFIR target exists | “Review how investigation connects to containment and recovery. Add a response-related project bullet only if you have supporting work.” | `blue-team-soc`; NIST SP 800-61 Rev. 3 |
| `missing-attack` — Behavior mapping | Latest analysis missing “MITRE ATT&CK”; CTI/DET target exists | “Practice mapping observed behavior to a technique and explaining your confidence.” | `threats-and-frameworks`; MITRE ATT&CK; MITRE CTI Training |
| `missing-sigma` — Detection portability | Latest analysis missing “sigma”; DET target exists | “Study one Sigma rule’s log source, fields, and false positives. Understand the rule before adding it to your résumé.” | `blue-team-soc`; Sigma Documentation |
| `missing-risk-language` — GRC evidence gap | Latest analysis missing both “risk assessment” and “audit evidence”; GRC target exists | “Check whether your projects describe a risk scenario or evidence review. A short fictional assessment can help you practice.” | `grc-and-risk`; NIST CSF 2.0 |
| `wishlist-backlog` — Turn research into a decision | At least five `WISHLIST` records have remained there for 14 days | “Choose one saved role to apply to, archive, or research further. Use its requirements to select one focused lesson.” | `security-internship-hiring`; NICE Framework |
| `application-gap` — Restart with a small step | At least one prior application; 14 days since last `appliedAt`; no `ACCEPTED` record | “If you are still searching, choose one suitable role and take the next application step. You can keep learning while applying.” | `security-internship-hiring`; Microsoft student portal; Amazon Security Careers |
| `burst-without-interviews` — Review targeting | At least 15 applications in 28 days; zero records with an `INTERVIEW` history; at least ten applications aged 14+ days | “You have enough activity for a useful review, although employer timing varies. Compare a few postings with your résumé and check eligibility and evidence.” | `security-internship-hiring`, `portfolio-and-projects`; Harvard résumé guide |
| `preinterview-rejections` — Review document match | At least five `REJECTED` in 60 days with no prior `INTERVIEW` event | “Several decisions arrived before an interview. Review eligibility, role fit, and how clearly your résumé demonstrates relevant work.” | `security-internship-hiring`, `portfolio-and-projects`; Harvard; NICE |
| `postinterview-rejections` — Improve interview explanations | At least three `REJECTED` in 90 days with prior `INTERVIEW` history | “You are reaching interviews. Review the questions you remember and practice concise technical and behavioral answers; the rejection pattern alone does not reveal the cause.” | `behavioral-security-interviews`, `technical-scenarios`; Jassics question repository |
| `stale-applied-review` — Check the application record | Current `APPLIED` for 30+ days based on stage-entry history | “Review whether there has been an update or whether the employer gave a timeline. Keep the record accurate and continue other applications.” | `security-internship-hiring`; official employer search portal |
| `ghosted-pattern` — Diversify the next step | At least five records explicitly marked `GHOSTED` in 90 days | “A quiet process can be discouraging. Review a few target roles and consider campus recruiting or a reputable professional community.” | `security-internship-hiring`, `portfolio-and-projects`; r/cybersecurity mentorship; HTB Community |
| `broad-track-spread` — Pick a preparation priority | Applications in at least four recognized track groups during 28 days; no active interview | “You are exploring several specialties. Pick one primary preparation track this week while keeping suitable applications open.” | `security-internship-hiring`; NICE Framework |
| `multiple-interviews` — Consolidate preparation | At least two current `INTERVIEW` records | “Build one reusable story bank, then add a short role-specific checklist for each interview.” | `behavioral-security-interviews`, `technical-scenarios`, `portfolio-and-projects` |
| `offer-stage` — Prepare final discussions | Any current `OFFER` | “Review the written role, learning opportunities, supervision, dates, and response deadline. Prepare questions about any unclear terms.” | `security-internship-hiring`, `behavioral-security-interviews` |
| `accepted-stage` — Shift to internship readiness | Any current `ACCEPTED` | “Congratulations on accepting. Shift preparation toward the team’s tools, safe handling of access, and a realistic learning plan.” | `operating-systems-security`, `security-fundamentals`, `behavioral-security-interviews` |

### Mock interview checklist for rejection-pattern recommendations

1. Use a real target posting.
2. Practice a 60-second introduction.
3. Explain one technical concept without jargon.
4. Work through one scenario aloud.
5. Deliver two truthful STAR stories.
6. Walk through one project, including a limitation.
7. Ask the reviewer where the answer became unclear.
8. Select one improvement for the next attempt.

---

# Part D — Cybersecurity Résumé Analyzer Keyword Presets

## Matching specification

Each entry uses:

**`["canonical keyword", weight, ["genuine aliases"]]`**

Weights represent **role relevance**, not proficiency:

- **3:** central to this track.
- **2:** useful supporting evidence.
- **1:** contextual or optional.

Each preset contains **30 keywords**, grouped into seven categories.

These are curriculum presets, not a validated hiring model. A résumé should be evaluated against the actual posting and supporting accomplishments.

Important matching behavior:

- Match words and phrases with appropriate boundaries.
- Normalize case, punctuation, and common spelling variants.
- Do not treat a tool as a synonym for its category: **Splunk is not an alias for SIEM**, and Elastic is not an alias for security analysis.
- Tool usage can support a separate contextual inference when the surrounding bullet demonstrates the relevant activity.
- Handle negation, coursework-only mentions, and “planned” certifications.
- Record certification status separately: earned, in progress, or planned.
- Avoid double-counting a canonical term and its alias in the same evidence.
- Missing keywords are prompts for review, not instructions to stuff a résumé.
- Soft-skill terms should receive more credit when demonstrated through an example.
- A narrow role may need only a subset of a track’s tools; no student should be expected to know every product listed.

## SOC analyst

```text
{
  track: "soc-analyst",
  tools: [
    ["Splunk", 2, ["Splunk Enterprise Security"]],
    ["Microsoft Sentinel", 2, ["Azure Sentinel"]],
    ["Elastic Security", 2, ["Elastic SIEM"]],
    ["Wireshark", 2, []],
    ["Microsoft Defender for Endpoint", 2, ["MDE"]]
  ],
  skills: [
    ["alert triage", 3, ["security alert triage"]],
    ["log analysis", 3, ["security log analysis"]],
    ["incident response", 3, ["cyber incident response"]],
    ["phishing analysis", 3, ["phishing investigation"]],
    ["threat hunting", 2, ["cyber threat hunting"]]
  ],
  concepts: [
    ["SIEM", 3, ["security information and event management"]],
    ["EDR", 3, ["endpoint detection and response"]],
    ["TCP/IP", 3, ["TCP IP"]],
    ["DNS", 2, ["Domain Name System"]],
    ["authentication", 3, ["user authentication"]]
  ],
  certs: [
    ["CompTIA Security+", 1, ["Security+", "Security Plus"]],
    ["Blue Team Level 1", 1, ["BTL1"]]
  ],
  languages: [
    ["Python", 2, []],
    ["PowerShell", 2, []],
    ["KQL", 2, ["Kusto Query Language"]]
  ],
  frameworks: [
    ["MITRE ATT&CK", 3, ["MITRE ATTACK", "ATT&CK"]],
    ["NIST SP 800-61", 2, ["NIST 800-61"]],
    ["NIST CSF", 1, ["NIST Cybersecurity Framework"]],
    ["Sigma", 2, ["Sigma rules"]],
    ["Cyber Kill Chain", 1, ["Lockheed Martin Cyber Kill Chain"]]
  ],
  softSkills: [
    ["written communication", 2, ["technical writing"]],
    ["documentation", 2, ["case documentation"]],
    ["collaboration", 1, ["team collaboration"]],
    ["critical thinking", 2, []],
    ["attention to detail", 2, ["detail-oriented"]]
  ]
}
```

## Security engineer

```text
{
  track: "security-engineer",
  tools: [
    ["Git", 2, []],
    ["Docker", 2, []],
    ["Terraform", 2, []],
    ["Nmap", 2, []],
    ["Wireshark", 2, []]
  ],
  skills: [
    ["security architecture", 3, ["secure architecture"]],
    ["system hardening", 3, ["host hardening"]],
    ["security automation", 3, ["security workflow automation"]],
    ["vulnerability management", 3, []],
    ["threat modeling", 3, ["threat modelling"]]
  ],
  concepts: [
    ["least privilege", 3, ["principle of least privilege"]],
    ["defense in depth", 3, ["defence in depth"]],
    ["network segmentation", 2, []],
    ["secrets management", 3, ["secret management"]],
    ["PKI", 2, ["public key infrastructure"]]
  ],
  certs: [
    ["CompTIA Security+", 1, ["Security+", "Security Plus"]],
    ["Cisco CCNA", 1, ["CCNA"]]
  ],
  languages: [
    ["Python", 3, []],
    ["Bash", 2, []],
    ["PowerShell", 2, []]
  ],
  frameworks: [
    ["NIST CSF", 2, ["NIST Cybersecurity Framework"]],
    ["CIS Controls", 2, ["CIS Critical Security Controls"]],
    ["CIS Benchmarks", 2, []],
    ["OWASP Top 10", 2, ["OWASP Top Ten"]],
    ["NIST SSDF", 2, ["Secure Software Development Framework", "NIST SP 800-218"]]
  ],
  softSkills: [
    ["technical communication", 2, []],
    ["documentation", 2, []],
    ["collaboration", 2, ["cross-functional collaboration"]],
    ["problem solving", 2, ["problem-solving"]],
    ["ownership", 1, ["task ownership"]]
  ]
}
```

## Pentest / red team

```text
{
  track: "pentest-red-team",
  tools: [
    ["Nmap", 3, []],
    ["Burp Suite", 3, ["Burp Suite Professional", "Burp Suite Community Edition"]],
    ["Metasploit", 2, ["Metasploit Framework"]],
    ["BloodHound", 2, []],
    ["Wireshark", 2, []]
  ],
  skills: [
    ["penetration testing", 3, ["pentesting", "pen testing"]],
    ["enumeration", 3, ["service enumeration"]],
    ["web application testing", 3, ["web security testing"]],
    ["privilege escalation", 3, []],
    ["security reporting", 3, ["penetration test reporting"]]
  ],
  concepts: [
    ["rules of engagement", 3, []],
    ["scope validation", 3, ["testing scope validation"]],
    ["Active Directory", 2, ["Active Directory Domain Services", "AD DS"]],
    ["authorization flaws", 3, ["broken access control"]],
    ["attack surface", 2, []]
  ],
  certs: [
    ["INE eJPT", 1, ["eJPT", "eLearnSecurity Junior Penetration Tester"]],
    ["CompTIA Security+", 1, ["Security+", "Security Plus"]]
  ],
  languages: [
    ["Python", 2, []],
    ["Bash", 3, []],
    ["PowerShell", 2, []]
  ],
  frameworks: [
    ["OWASP WSTG", 3, ["Web Security Testing Guide"]],
    ["OWASP Top 10", 3, ["OWASP Top Ten"]],
    ["MITRE ATT&CK", 2, ["MITRE ATTACK", "ATT&CK"]],
    ["PTES", 2, ["Penetration Testing Execution Standard"]],
    ["NIST SP 800-115", 1, ["NIST 800-115"]]
  ],
  softSkills: [
    ["ethical judgment", 3, ["ethical judgement"]],
    ["technical writing", 3, []],
    ["client communication", 2, []],
    ["problem solving", 2, ["problem-solving"]],
    ["attention to detail", 2, ["detail-oriented"]]
  ]
}
```

## Application security

```text
{
  track: "appsec",
  tools: [
    ["Burp Suite", 3, []],
    ["ZAP", 2, ["OWASP ZAP", "Zed Attack Proxy"]],
    ["Semgrep", 2, []],
    ["CodeQL", 2, []],
    ["Git", 2, []]
  ],
  skills: [
    ["secure code review", 3, ["security code review"]],
    ["threat modeling", 3, ["threat modelling"]],
    ["vulnerability remediation", 3, ["security remediation"]],
    ["API security testing", 3, []],
    ["dependency analysis", 2, ["software dependency analysis"]]
  ],
  concepts: [
    ["SQL injection", 3, ["SQLi"]],
    ["cross-site scripting", 3, ["XSS", "cross site scripting"]],
    ["server-side request forgery", 3, ["SSRF"]],
    ["cross-site request forgery", 2, ["CSRF"]],
    ["access control", 3, ["authorization controls"]]
  ],
  certs: [
    ["CompTIA Security+", 1, ["Security+", "Security Plus"]],
    ["INE eJPT", 1, ["eJPT"]]
  ],
  languages: [
    ["JavaScript", 2, ["ECMAScript"]],
    ["Python", 2, []],
    ["SQL", 2, ["Structured Query Language"]]
  ],
  frameworks: [
    ["OWASP Top 10", 3, ["OWASP Top Ten"]],
    ["OWASP ASVS", 3, ["Application Security Verification Standard"]],
    ["OWASP WSTG", 2, ["Web Security Testing Guide"]],
    ["NIST SSDF", 2, ["Secure Software Development Framework", "NIST SP 800-218"]],
    ["STRIDE", 2, ["STRIDE threat model"]]
  ],
  softSkills: [
    ["developer collaboration", 3, ["collaboration with developers"]],
    ["technical writing", 2, []],
    ["risk communication", 2, []],
    ["problem solving", 2, ["problem-solving"]],
    ["attention to detail", 2, ["detail-oriented"]]
  ]
}
```

## Cloud security

```text
{
  track: "cloud-security",
  tools: [
    ["AWS", 3, ["Amazon Web Services"]],
    ["Microsoft Azure", 2, ["Azure"]],
    ["Google Cloud", 2, ["Google Cloud Platform", "GCP"]],
    ["Terraform", 2, []],
    ["Kubernetes", 2, ["K8s"]]
  ],
  skills: [
    ["cloud configuration review", 3, ["cloud security configuration review"]],
    ["IAM policy review", 3, ["identity policy review"]],
    ["cloud log analysis", 3, []],
    ["infrastructure as code security", 2, ["IaC security"]],
    ["secrets management", 3, ["secret management"]]
  ],
  concepts: [
    ["shared responsibility", 3, ["shared responsibility model"]],
    ["least privilege", 3, ["principle of least privilege"]],
    ["workload identity", 3, ["workload identities"]],
    ["network segmentation", 2, []],
    ["encryption key management", 2, ["cryptographic key management"]]
  ],
  certs: [
    ["CompTIA Security+", 1, ["Security+", "Security Plus"]],
    ["Cisco CCNA", 1, ["CCNA"]]
  ],
  languages: [
    ["Python", 2, []],
    ["Bash", 2, []],
    ["PowerShell", 1, []]
  ],
  frameworks: [
    ["CIS Benchmarks", 2, []],
    ["NIST CSF", 2, ["NIST Cybersecurity Framework"]],
    ["CSA CCM", 2, ["Cloud Controls Matrix"]],
    ["ISO 27001", 1, ["ISO/IEC 27001"]],
    ["NIST SP 800-53", 1, ["NIST 800-53"]]
  ],
  softSkills: [
    ["technical communication", 2, []],
    ["documentation", 2, []],
    ["collaboration", 2, ["cross-functional collaboration"]],
    ["problem solving", 2, ["problem-solving"]],
    ["cost awareness", 1, ["cloud cost awareness"]]
  ]
}
```

## GRC

```text
{
  track: "grc",
  tools: [
    ["Microsoft Excel", 2, ["Excel"]],
    ["ServiceNow GRC", 2, ["ServiceNow Integrated Risk Management", "ServiceNow IRM"]],
    ["Archer", 2, ["Archer GRC", "RSA Archer"]],
    ["Jira", 1, ["Atlassian Jira"]],
    ["Power BI", 1, ["Microsoft Power BI"]]
  ],
  skills: [
    ["risk assessment", 3, ["cybersecurity risk assessment"]],
    ["control testing", 3, ["security control testing"]],
    ["audit evidence review", 3, ["audit evidence analysis"]],
    ["policy development", 3, ["security policy development"]],
    ["third-party risk management", 2, ["vendor risk management", "TPRM"]]
  ],
  concepts: [
    ["residual risk", 3, []],
    ["risk treatment", 3, []],
    ["risk acceptance", 3, []],
    ["control effectiveness", 3, []],
    ["data classification", 2, ["information classification"]]
  ],
  certs: [
    ["ISC2 CC", 1, ["Certified in Cybersecurity"]],
    ["CompTIA Security+", 1, ["Security+", "Security Plus"]]
  ],
  languages: [
    ["SQL", 1, ["Structured Query Language"]],
    ["Python", 1, []],
    ["PowerShell", 1, []]
  ],
  frameworks: [
    ["NIST CSF", 3, ["NIST Cybersecurity Framework"]],
    ["ISO 27001", 3, ["ISO/IEC 27001"]],
    ["SOC 2", 3, ["SOC2"]],
    ["NIST SP 800-53", 2, ["NIST 800-53"]],
    ["CIS Controls", 2, ["CIS Critical Security Controls"]]
  ],
  softSkills: [
    ["risk communication", 3, []],
    ["technical writing", 3, []],
    ["stakeholder management", 2, ["stakeholder coordination"]],
    ["attention to detail", 3, ["detail-oriented"]],
    ["ethical judgment", 2, ["ethical judgement"]]
  ]
}
```

## DFIR / incident response

```text
{
  track: "dfir",
  tools: [
    ["Volatility 3", 3, ["Volatility3"]],
    ["Autopsy", 2, []],
    ["Wireshark", 3, []],
    ["CyberChef", 2, []],
    ["Sysinternals", 2, ["Windows Sysinternals"]]
  ],
  skills: [
    ["incident response", 3, ["cyber incident response"]],
    ["memory forensics", 3, ["memory analysis"]],
    ["disk forensics", 3, ["disk image analysis"]],
    ["timeline analysis", 3, ["forensic timeline analysis"]],
    ["evidence preservation", 3, ["digital evidence preservation"]]
  ],
  concepts: [
    ["chain of custody", 3, []],
    ["volatile evidence", 3, ["volatile data"]],
    ["file integrity", 2, []],
    ["persistence mechanisms", 3, ["persistence analysis"]],
    ["Windows artifacts", 3, ["Windows forensic artifacts"]]
  ],
  certs: [
    ["Blue Team Level 1", 1, ["BTL1"]],
    ["CompTIA CySA+", 1, ["CySA+", "CySA Plus"]]
  ],
  languages: [
    ["Python", 2, []],
    ["PowerShell", 2, []],
    ["Bash", 2, []]
  ],
  frameworks: [
    ["NIST SP 800-61", 3, ["NIST 800-61"]],
    ["MITRE ATT&CK", 2, ["MITRE ATTACK", "ATT&CK"]],
    ["NIST SP 800-86", 2, ["NIST 800-86"]],
    ["NIST CSF", 1, ["NIST Cybersecurity Framework"]],
    ["Cyber Kill Chain", 1, ["Lockheed Martin Cyber Kill Chain"]]
  ],
  softSkills: [
    ["technical writing", 3, []],
    ["attention to detail", 3, ["detail-oriented"]],
    ["critical thinking", 3, []],
    ["collaboration", 2, ["team collaboration"]],
    ["confidentiality", 2, ["confidential information handling"]]
  ]
}
```

## Threat intelligence

```text
{
  track: "threat-intelligence",
  tools: [
    ["MISP", 3, ["Malware Information Sharing Platform"]],
    ["OpenCTI", 2, []],
    ["VirusTotal", 2, []],
    ["ATT&CK Navigator", 2, ["MITRE ATT&CK Navigator"]],
    ["CyberChef", 2, []]
  ],
  skills: [
    ["intelligence analysis", 3, ["cyber intelligence analysis"]],
    ["source evaluation", 3, ["intelligence source evaluation"]],
    ["threat actor research", 2, []],
    ["campaign analysis", 3, []],
    ["intelligence reporting", 3, ["threat intelligence reporting"]]
  ],
  concepts: [
    ["indicators of compromise", 3, ["IOC", "IOCs"]],
    ["TTPs", 3, ["tactics techniques and procedures"]],
    ["analytical confidence", 3, ["analytic confidence"]],
    ["intelligence requirements", 3, ["priority intelligence requirements", "PIRs"]],
    ["attribution", 2, ["threat actor attribution"]]
  ],
  certs: [
    ["CompTIA Security+", 1, ["Security+", "Security Plus"]],
    ["Blue Team Level 1", 1, ["BTL1"]]
  ],
  languages: [
    ["Python", 2, []],
    ["SQL", 1, ["Structured Query Language"]],
    ["YARA", 2, ["YARA rules"]]
  ],
  frameworks: [
    ["MITRE ATT&CK", 3, ["MITRE ATTACK", "ATT&CK"]],
    ["STIX", 2, ["Structured Threat Information Expression"]],
    ["TAXII", 2, ["Trusted Automated Exchange of Intelligence Information"]],
    ["Traffic Light Protocol", 2, ["TLP"]],
    ["Diamond Model", 2, ["Diamond Model of Intrusion Analysis"]]
  ],
  softSkills: [
    ["analytical writing", 3, ["intelligence writing"]],
    ["critical thinking", 3, []],
    ["briefing", 2, ["intelligence briefing"]],
    ["collaboration", 2, ["team collaboration"]],
    ["attention to detail", 2, ["detail-oriented"]]
  ]
}
```

## Detection engineering

```text
{
  track: "detection-engineering",
  tools: [
    ["Splunk", 2, ["Splunk Enterprise Security"]],
    ["Microsoft Sentinel", 2, ["Azure Sentinel"]],
    ["Elastic Security", 2, ["Elastic SIEM"]],
    ["Sysmon", 3, ["System Monitor"]],
    ["Atomic Red Team", 2, []]
  ],
  skills: [
    ["detection development", 3, ["detection rule development"]],
    ["detection validation", 3, ["detection testing"]],
    ["log source onboarding", 3, ["security telemetry onboarding"]],
    ["false-positive tuning", 3, ["false positive tuning"]],
    ["threat hunting", 2, ["cyber threat hunting"]]
  ],
  concepts: [
    ["telemetry", 3, ["security telemetry"]],
    ["field normalization", 3, ["log field normalization"]],
    ["detection coverage", 3, []],
    ["precision", 2, ["detection precision"]],
    ["recall", 2, ["detection recall"]]
  ],
  certs: [
    ["CompTIA CySA+", 1, ["CySA+", "CySA Plus"]],
    ["Blue Team Level 1", 1, ["BTL1"]]
  ],
  languages: [
    ["Python", 3, []],
    ["KQL", 2, ["Kusto Query Language"]],
    ["SPL", 2, ["Splunk Search Processing Language"]]
  ],
  frameworks: [
    ["Sigma", 3, ["Sigma rules"]],
    ["MITRE ATT&CK", 3, ["MITRE ATTACK", "ATT&CK"]],
    ["NIST SP 800-61", 1, ["NIST 800-61"]],
    ["NIST CSF", 1, ["NIST Cybersecurity Framework"]],
    ["Cyber Kill Chain", 1, ["Lockheed Martin Cyber Kill Chain"]]
  ],
  softSkills: [
    ["technical writing", 2, []],
    ["analyst collaboration", 3, ["collaboration with analysts"]],
    ["critical thinking", 3, []],
    ["attention to detail", 2, ["detail-oriented"]],
    ["ownership", 1, ["task ownership"]]
  ]
}
```

## IAM

```text
{
  track: "iam",
  tools: [
    ["Microsoft Entra ID", 3, ["Azure Active Directory", "Azure AD"]],
    ["Active Directory", 3, ["Active Directory Domain Services", "AD DS"]],
    ["Okta", 2, []],
    ["SailPoint", 2, []],
    ["CyberArk", 2, []]
  ],
  skills: [
    ["identity lifecycle management", 3, ["joiner mover leaver", "joiner-mover-leaver"]],
    ["access reviews", 3, ["access certification reviews"]],
    ["account provisioning", 3, ["user provisioning"]],
    ["privileged access management", 3, ["PAM"]],
    ["federation configuration", 2, ["identity federation configuration"]]
  ],
  concepts: [
    ["least privilege", 3, ["principle of least privilege"]],
    ["RBAC", 3, ["role-based access control"]],
    ["MFA", 3, ["multi-factor authentication", "multifactor authentication"]],
    ["SSO", 3, ["single sign-on"]],
    ["separation of duties", 2, ["segregation of duties"]]
  ],
  certs: [
    ["ISC2 CC", 1, ["Certified in Cybersecurity"]],
    ["CompTIA Security+", 1, ["Security+", "Security Plus"]]
  ],
  languages: [
    ["PowerShell", 3, []],
    ["Python", 2, []],
    ["SQL", 1, ["Structured Query Language"]]
  ],
  frameworks: [
    ["SAML", 3, ["Security Assertion Markup Language"]],
    ["OpenID Connect", 3, ["OIDC"]],
    ["OAuth 2.0", 3, ["OAuth2"]],
    ["SCIM", 3, ["System for Cross-domain Identity Management"]],
    ["NIST SP 800-63", 2, ["NIST 800-63"]]
  ],
  softSkills: [
    ["stakeholder communication", 3, []],
    ["documentation", 2, []],
    ["attention to detail", 3, ["detail-oriented"]],
    ["confidentiality", 2, ["confidential information handling"]],
    ["problem solving", 2, ["problem-solving"]]
  ]
}
```

## General cybersecurity intern

```text
{
  track: "general-cybersecurity-intern",
  tools: [
    ["Wireshark", 2, []],
    ["Nmap", 2, []],
    ["Git", 2, []],
    ["Splunk", 1, ["Splunk Enterprise Security"]],
    ["Burp Suite", 1, []]
  ],
  skills: [
    ["log analysis", 3, ["security log analysis"]],
    ["vulnerability assessment", 2, []],
    ["incident response", 2, ["cyber incident response"]],
    ["security documentation", 3, []],
    ["risk assessment", 2, ["cybersecurity risk assessment"]]
  ],
  concepts: [
    ["TCP/IP", 3, ["TCP IP"]],
    ["Linux", 3, ["GNU/Linux"]],
    ["Windows", 2, ["Microsoft Windows"]],
    ["authentication", 3, ["user authentication"]],
    ["least privilege", 3, ["principle of least privilege"]]
  ],
  certs: [
    ["CompTIA Security+", 1, ["Security+", "Security Plus"]],
    ["ISC2 CC", 1, ["Certified in Cybersecurity"]]
  ],
  languages: [
    ["Python", 2, []],
    ["Bash", 2, []],
    ["PowerShell", 2, []]
  ],
  frameworks: [
    ["NIST CSF", 2, ["NIST Cybersecurity Framework"]],
    ["MITRE ATT&CK", 2, ["MITRE ATTACK", "ATT&CK"]],
    ["OWASP Top 10", 2, ["OWASP Top Ten"]],
    ["NIST SP 800-61", 1, ["NIST 800-61"]],
    ["CIS Controls", 1, ["CIS Critical Security Controls"]]
  ],
  softSkills: [
    ["communication", 2, ["technical communication"]],
    ["collaboration", 2, ["team collaboration"]],
    ["critical thinking", 2, []],
    ["ethical judgment", 3, ["ethical judgement"]],
    ["attention to detail", 2, ["detail-oriented"]]
  ]
}
```

### Alias implementation cautions

Some abbreviations require context:

- **System Monitor** can mean software other than Sysmon; require Windows/Sysinternals context before matching that alias.
- **CC**, **AD**, **ES**, and **IR** alone are too ambiguous for reliable matching.
- **SQL** in a skills list is not proof of SQL injection testing.
- **OAuth** is not a synonym for authentication or OpenID Connect.
- **Azure AD** is a former name for Entra ID; it is not an alias for on-premises AD DS.
- **SOC** can mean a security operations center or an assurance-report family. Match **SOC 2** separately.
- **Security+ coursework** and **Security+ certified** should produce different credential statuses.

---

# Part E — 50 Rapid-Fire Flashcards

| # | Question | Crisp answer |
|---:|---|---|
| 1 | What is the CIA triad? | Confidentiality, integrity, and availability. |
| 2 | Authentication versus authorization? | Authentication checks identity; authorization decides permitted actions and resources. |
| 3 | What does accounting mean in AAA? | Recording activity so actions can be reviewed and attributed appropriately. |
| 4 | What is least privilege? | Grant only the access needed for the task and required duration. |
| 5 | What is defense in depth? | Multiple complementary controls reduce dependence on any single control. |
| 6 | Threat versus vulnerability? | A threat can cause harm; a vulnerability is a weakness that may enable it. |
| 7 | What is risk? | Uncertainty affecting objectives, evaluated through relevant scenarios, likelihood, and consequences. |
| 8 | Hashing versus encryption? | Hashing produces a digest; encryption protects recoverable data using cryptographic keys. |
| 9 | Is Base64 encryption? | No. It is an encoding and provides no secrecy by itself. |
| 10 | Why salt password hashes? | To prevent identical stored results and frustrate reusable precomputed guessing tables. |
| 11 | Is plain SHA-256 suitable for password storage? | No. Use a suitable salted, deliberately expensive password-hashing scheme. |
| 12 | What does a digital signature provide? | Integrity and authenticity relative to a trusted key and sound validation. |
| 13 | What is MFA? | Authentication using more than one distinct factor type. |
| 14 | Are two passwords MFA? | No. Both are knowledge factors. |
| 15 | Does HTTPS mean a site is trustworthy? | No. It protects the connection; malicious sites can have valid certificates. |
| 16 | What does DNS do? | Publishes records associated with names, including address mappings. |
| 17 | TCP versus UDP? | TCP provides an ordered byte stream; UDP sends datagrams without those guarantees. |
| 18 | What is TCP’s three-way handshake? | SYN, SYN-ACK, ACK. |
| 19 | Does HTTPS always use TCP? | No. HTTP/3 uses QUIC over UDP and incorporates TLS 1.3. |
| 20 | Common HTTPS port? | 443 by convention; the port alone does not prove the application. |
| 21 | Common SSH port? | TCP 22 by convention. |
| 22 | Common DNS port? | UDP or TCP 53 for conventional DNS. |
| 23 | Does failed ping prove a host is down? | No. ICMP may be blocked while services remain reachable. |
| 24 | What is a process? | A running program with identity, execution state, and resources. |
| 25 | What is Active Directory Domain Services? | Microsoft’s domain directory service for identities, computers, and related management capabilities. |
| 26 | Is Entra ID the same as AD DS? | No. They are distinct identity systems that can be integrated. |
| 27 | What do Windows Security events 4624 and 4625 mean? | Successful and failed logons, respectively, interpreted with their surrounding fields. |
| 28 | What is a SIEM? | A platform for centralized event analysis, correlation, detection, and investigation. |
| 29 | Is an alert proof of compromise? | No. It is a lead requiring validation and context. |
| 30 | What is a false positive? | An alert on activity determined benign under the detection’s intended purpose. |
| 31 | What is containment? | Limiting an incident’s spread or harm under authorized procedures. |
| 32 | What is the current NIST incident-response publication? | SP 800-61 Rev. 3, published April 2025. |
| 33 | What is chain of custody? | Documentation of evidence handling, possession, and transfers. |
| 34 | Does a matching file hash prove provenance? | No. It supports an integrity comparison, not the full history of the evidence. |
| 35 | What is an IOC? | An observable indicator associated with potential compromise. |
| 36 | What does MITRE ATT&CK describe? | Adversary tactics, techniques, and related behavior knowledge. |
| 37 | Does an ATT&CK mapping prove attribution? | No. Many actors share behaviors and tools. |
| 38 | What causes SQL injection? | Untrusted input changes the structure or meaning of a database query. |
| 39 | Primary SQL injection defense? | Parameterized queries, with careful handling of any dynamic query structure. |
| 40 | What is XSS? | Attacker-controlled script executes in a victim’s browser under an application’s context. |
| 41 | What is SSRF? | An attacker influences requests made by a server. |
| 42 | What is CSRF? | A browser is induced to perform an unwanted action using automatically attached credentials. |
| 43 | Does CORS generally prevent CSRF? | No. CORS is not a general CSRF defense. |
| 44 | What is broken object-level authorization? | A server permits access to an object without checking the requester’s permission. |
| 45 | What must precede a penetration test? | Explicit authorization, defined scope, and agreed rules of engagement. |
| 46 | What is cloud shared responsibility? | Provider and customer security duties vary according to the service. |
| 47 | SSO versus provisioning? | SSO concerns sign-in; provisioning manages accounts and entitlements. |
| 48 | What is SOC 2? | A scoped assurance examination and report, not a personal certification. |
| 49 | What does STAR stand for? | Situation, Task, Action, Result. |
| 50 | What should you say when you do not know? | State what you understand, identify uncertainty, and explain how you would verify safely. |