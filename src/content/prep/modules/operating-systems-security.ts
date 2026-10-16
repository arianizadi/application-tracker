import type { Module } from "../types";

export const prepModule: Module = {
  id: "operating-systems-security",
  number: 3,
  title: "Understand the Host",
  hook: "Connect processes, permissions, identities, and logs.",
  hours: 5,
  tracks: ["SOC", "DFIR", "ENG", "OFF", "IAM", "DET"],
  objectives: [
    "Explain processes, services, files, and privilege boundaries.",
    "Compare Linux and Windows security evidence.",
    "Describe AD DS and basic enterprise authentication.",
    "Preserve evidence while investigating suspicious activity.",
  ],
  lesson: [
    { type: "h", text: "Kernel, user space, and processes" },
    {
      type: "p",
      text: "An operating system manages resources and enforces boundaries between users and programs. The **kernel** handles privileged operations, while ordinary applications generally run in **user space**. A **process** is a running program with an identity, memory, open resources, and relationships to other processes.",
    },
    {
      type: "p",
      text: "Security investigations often begin with four questions: **which process acted, under which account, from which parent, and with what access?** A familiar executable name alone does not answer any of them. Malware can be named `svchost.exe` too; what matters is its path, parent, and behavior.",
    },
    { type: "h", text: "Linux users, groups, and permissions" },
    {
      type: "p",
      text: "On Linux, users and groups determine access to files and other resources. Basic permission bits describe **read**, **write**, and **execute** for the file's **owner**, its **group**, and **others**. ACLs and additional controls such as SELinux or AppArmor can refine access further.",
    },
    {
      type: "code",
      lang: "text",
      caption: "Reading `ls -l` output.",
      code: [
        "$ ls -l /opt/reports",
        "-rwxr-x---  1 alice  analysts  2048 Oct 16 09:12 collect.sh",
        "drwxr-x--x  2 alice  analysts  4096 Oct 16 09:10 archive",
        "",
        "-rwxr-x---  ->  type: - (regular file)",
        "                owner alice:      rwx  (read, write, execute)",
        "                group analysts:   r-x  (read, execute)",
        "                others:           ---  (no access)       = octal 750",
      ].join("\n"),
    },
    {
      type: "p",
      text: "Directory permissions have special practical meanings: **r** lets you list names, **w** lets you create, rename, or delete entries, and **x** lets you traverse into the directory and reach files inside it. In the example above, others can enter `archive` (x) but cannot list it (no r), so they can only open files whose exact names they already know, and only if those files' own permissions allow it.",
    },
    {
      type: "p",
      text: "**Root** has broad privilege, and Linux **capabilities** can split some privileged operations into narrower permissions (for example, binding to ports below 1024 without full root). Special bits deserve attention too: a **setuid** program runs with its owner's privileges, so an unexpected setuid-root binary is a classic privilege-escalation lead. Use elevated access only when necessary, and understand the effect before you change ownership or permissions.",
    },
    { type: "h", text: "Linux evidence sources" },
    {
      type: "p",
      text: "Linux evidence can include authentication records, system journals, service definitions, scheduled tasks, process details, and network sockets. Locations vary by distribution and configuration:",
    },
    {
      type: "list",
      items: [
        "**Authentication:** `/var/log/auth.log` on Debian and Ubuntu, `/var/log/secure` on RHEL and Fedora, or `journalctl` on systemd systems.",
        "**Services:** systemd unit files under `/etc/systemd/system/` (local and admin-created units, a common persistence spot) and `/usr/lib/systemd/system/` (package-installed units; `/lib/systemd/system/` on some distributions); inspect with `systemctl list-units --type=service`.",
        "**Scheduled tasks:** `crontab -l` per user, `/etc/crontab`, `/etc/cron.d/`, and systemd timers (`systemctl list-timers`).",
        "**Processes and sockets:** `ps -ef --forest` for the process tree and `ss -tulpn` for listening sockets and their owning processes.",
      ],
    },
    {
      type: "code",
      lang: "text",
      caption: "An illustrative SSH log line from /var/log/auth.log, read field by field.",
      code: [
        "Oct 16 09:14:02 web01 sshd[2213]: Failed password for invalid user admin from 198.51.100.23 port 52144 ssh2",
        "",
        "Oct 16 09:14:02     timestamp (check the host's time zone and clock accuracy)",
        "web01               host that wrote the log",
        "sshd[2213]          program and process ID",
        "invalid user admin  the username does not exist on this host",
        "198.51.100.23       source IP of the attempt",
      ].join("\n"),
    },
    {
      type: "p",
      text: "One line like this is noise on most internet-facing servers. Hundreds of lines across many usernames from one source suggest password guessing, and a **successful** login after many failures from the same source is what really deserves escalation.",
    },
    {
      type: "p",
      text: "A suspicious scheduled task may support a persistence hypothesis, but an entry is not automatically malicious. Compare it with expected administration, creation time, account ownership, and associated processes. **Preserve the original evidence before changing the configuration you are trying to understand.**",
    },
    { type: "h", text: "Windows security model" },
    {
      type: "p",
      text: "Windows uses **security principals** (users, groups, computers, services), **SIDs** that uniquely identify them, **access tokens** that carry a process's identity and group memberships, **privileges**, and **access-control lists** on objects. Services, scheduled tasks, startup entries, and registry Run keys explain how software starts automatically. Sysinternals tools such as Process Explorer, Autoruns, and Process Monitor help you inspect these relationships.",
    },
    {
      type: "diagram",
      caption: "How Windows decides whether a process can touch a resource.",
      lines: [
        "account --> access token --> process --> attempted resource access --> authorization decision",
        "            (user SID,        (runs       (file, registry key,          (token compared",
        "             group SIDs,       with the    service, ...)                 against the object's",
        "             privileges)       token)                                    ACL)",
      ],
    },
    {
      type: "p",
      text: "Knowing an account's display name is less precise than understanding its identity, group memberships, and effective permissions.",
    },
    { type: "h", text: "Active Directory and enterprise authentication" },
    {
      type: "p",
      text: "**Active Directory Domain Services (AD DS)** centralizes directory and domain capabilities in many Windows environments. **Domain controllers** handle authentication and directory services, and **Group Policy** manages settings across users and computers. **Kerberos** is the default domain authentication protocol and uses tickets; **NTLM**, an older challenge-response protocol, still appears in many environments as a fallback. Microsoft deprecated NTLM in June 2024 and has announced a phased plan to disable network NTLM by default in future Windows releases, so expect it to linger for a while and to be watched closely.",
    },
    {
      type: "diagram",
      caption: "Kerberos at a glance. The KDC runs on the domain controller.",
      lines: [
        "user/workstation --1. AS-REQ (pre-auth using password-derived key)--> KDC on domain controller",
        "                 <--2. TGT (ticket-granting ticket)--",
        "                 --3. TGS-REQ (TGT + target service)--> KDC",
        "                 <--4. service ticket--",
        "                 --5. AP-REQ (service ticket)--> file server, web app, ...",
      ],
    },
    {
      type: "p",
      text: "AD DS is distinct from **Microsoft Entra ID** (formerly Azure AD), the cloud identity service, although organizations often integrate them. Avoid describing all Microsoft identity systems as the same directory with different branding.",
    },
    { type: "h", text: "Windows logs and event IDs" },
    {
      type: "p",
      text: "Logs depend on auditing and collection settings. A few Windows event IDs come up again and again in interviews:",
    },
    {
      type: "list",
      items: [
        "**4624** (Security): successful logon. Check the **logon type**: 2 interactive, 3 network, 5 service, 10 remote interactive (RDP).",
        "**4625** (Security): failed logon. The status and sub-status codes explain why, such as a bad password or an unknown user.",
        "**4688** (Security): process creation, when process-creation auditing is enabled. The command line is recorded only if the separate command-line policy is also enabled.",
        "**4672** (Security): special privileges assigned to a new logon, a hint of an administrative session.",
        "**4720** (Security): a user account was created.",
        "**7045** (System): a new service was installed.",
        "**1102** (Security): the audit log was cleared.",
      ],
    },
    {
      type: "p",
      text: "**Sysmon** adds richer telemetry according to its configuration, such as Event ID 1 for process creation with hashes and Event ID 3 for network connections. Event IDs are only meaningful together with their provider and channel, not as universal numbers. Microsoft documents each event's fields, such as the [4624 logon event and its logon types](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4624), and [Microsoft Sentinel's Windows security event sets](https://learn.microsoft.com/en-us/azure/sentinel/windows-security-event-id-reference) show which IDs are commonly collected.",
    },
    { type: "h", text: "Investigating a suspicious process" },
    {
      type: "p",
      text: "For a suspicious process, gather context before you act:",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "Full executable path (is `svchost.exe` really in `C:\\Windows\\System32`?).",
        "Signer and file hash.",
        "Parent process and the wider process tree.",
        "Full command line.",
        "User account and privilege level.",
        "Start time, and what else happened around it.",
        "Related network connections and file changes.",
      ],
    },
    {
      type: "code",
      lang: "powershell",
      caption: "Read-only process context on Windows. Replace the name with one you are inspecting.",
      code: [
        "Get-CimInstance Win32_Process -Filter \"Name = 'notepad.exe'\" |",
        "  Select-Object ProcessId, ParentProcessId, ExecutablePath, CommandLine",
        "",
        "# Which account owns it?",
        "Get-CimInstance Win32_Process -Filter \"Name = 'notepad.exe'\" |",
        "  Invoke-CimMethod -MethodName GetOwner",
      ].join("\n"),
    },
    {
      type: "code",
      lang: "bash",
      caption: "The Linux equivalent for a given PID (read-only).",
      code: [
        "ps -o pid,ppid,user,lstart,args -p 1234",
        "sudo readlink /proc/1234/exe   # actual executable path (sudo needed for other users' processes)",
      ].join("\n"),
    },
    {
      type: "p",
      text: "Correlate multiple sources and consider legitimate explanations. **Do not terminate a process or reboot a host reflexively**: either action can disrupt the business or destroy volatile evidence such as memory contents and live network connections.",
    },
    {
      type: "callout",
      tone: "interview",
      title: "Say it like this",
      text: "I would identify the process context, preserve relevant evidence, and follow the response authority before taking a disruptive action.",
    },
  ],
  sayItLikeThis:
    "When I look at a host, I think in terms of who did what with which access. A process runs under an account whose token or user and group IDs decide what it can touch, so for anything suspicious I check the full path, signer and hash, parent and command line, user, timing, and network activity, then correlate that with logs like Windows 4624, 4625, and 4688 or the Linux auth log and journal, keeping in mind that what's logged depends on how auditing is configured. In a Windows domain I'd also consider Active Directory and Kerberos, which is separate from Entra ID in the cloud. And I'd preserve evidence and follow the response plan before killing a process or rebooting, because those actions can destroy exactly the data we need.",
  terms: [
    { term: "Kernel", definition: "Privileged core of an operating system that manages hardware, memory, and processes." },
    { term: "Process", definition: "Running program with execution and resource context, including an identity, memory, and a parent." },
    { term: "Service", definition: "Background component managed by the operating system, such as a Windows service or a systemd unit." },
    { term: "ACL", definition: "Access-control list: rules governing which principals can access an object and how." },
    { term: "setuid", definition: "Unix and Linux permission bit that makes a program run with its file owner's privileges instead of the caller's." },
    { term: "SID", definition: "Security identifier: the unique Windows identifier for a security principal." },
    { term: "Access token", definition: "Windows representation of a process or thread's security context: user SID, group SIDs, and privileges." },
    { term: "Domain controller", definition: "Server providing AD DS domain services, including authentication." },
    { term: "Kerberos", definition: "Ticket-based authentication protocol used by default in Active Directory domains." },
    { term: "Logon type", definition: "Field in Windows logon events that describes how the logon happened, such as interactive (2), network (3), or RDP (10)." },
    { term: "Persistence", definition: "Mechanism allowing continued or renewed access, such as a scheduled task, service, or startup entry." },
  ],
  questions: [
    {
      id: "operating-systems-security-q1",
      question: "What would you check on a suspicious process?",
      answer:
        "I would inspect its path, parent, command line, account, signature, and timing. Then I would correlate file, network, and endpoint events with expected activity. I would preserve evidence and follow the playbook before terminating it.",
      checking: "Contextual host investigation.",
      difficulty: "core",
    },
    {
      id: "operating-systems-security-q2",
      question: "What does least privilege mean on an endpoint?",
      answer:
        "Users and processes should receive only the access needed for their tasks. I would separate routine use from administrative actions, for example a standard daily account plus a separate admin account, and review unnecessary permissions. The goal is to reduce what a mistake or compromise can affect.",
      checking: "Practical privilege management.",
      difficulty: "warmup",
    },
    {
      id: "operating-systems-security-q3",
      question: "What is Active Directory?",
      answer:
        "AD DS is Microsoft's domain directory service used to organize identities, computers, and related resources. It supports centralized authentication, mainly through Kerberos, and management capabilities such as Group Policy. I would distinguish it from Entra ID when discussing cloud identity.",
      checking: "Enterprise identity fundamentals.",
      difficulty: "warmup",
    },
    {
      id: "operating-systems-security-q4",
      question: "What is a process tree useful for?",
      answer:
        "It shows relationships between processes and helps reconstruct execution. An office application launching an unusual interpreter, such as Word starting PowerShell, may deserve investigation, but context matters. I would inspect command lines and related activity before deciding the chain is malicious.",
      checking: "Behavioral analysis.",
      difficulty: "core",
    },
    {
      id: "operating-systems-security-q5",
      question: "What do Windows events 4624 and 4625 indicate?",
      answer:
        "In the Windows Security log, they represent successful and failed logons respectively. Their fields, including logon type, account, source, and timing, determine the investigative meaning. A single failure is not enough to establish an attack, but many failures followed by a success from the same source is worth escalating.",
      checking: "Log interpretation.",
      difficulty: "core",
    },
    {
      id: "operating-systems-security-q6",
      question: "How could an attacker maintain persistence?",
      answer:
        "Examples include scheduled tasks, services, registry Run keys or startup folders, cron jobs, new accounts, or changes to authentication configuration such as added SSH keys. Many of those mechanisms also have legitimate uses. I would look for unexpected changes and connect them to accounts and execution evidence.",
      checking: "Mechanisms without overclaiming.",
      difficulty: "core",
    },
    {
      id: "operating-systems-security-q7",
      question: "Why avoid immediately rebooting a compromised host?",
      answer:
        "A reboot can destroy volatile evidence such as memory, running processes, and network connections, and it changes the system state. It may also interrupt critical services. I would coordinate containment, such as network isolation, and evidence collection according to the incident plan.",
      checking: "Evidence preservation and respect for response authority.",
      difficulty: "core",
    },
    {
      id: "operating-systems-security-q8",
      question: "Is a signed executable necessarily safe?",
      answer:
        "No. A valid signature does not establish that the observed use is benign. Legitimate signed tools can be abused, and signing keys or infrastructure can be compromised. I would assess provenance, behavior, and context together.",
      checking: "Limits of trust signals.",
      difficulty: "core",
    },
    {
      id: "operating-systems-security-q9",
      question: "What does chmod 755 mean, and when would 777 be a problem?",
      answer:
        "Each digit is owner, group, and others, where read is 4, write is 2, and execute is 1. So 755 means the owner can read, write, and execute, while group and others can read and execute. 777 gives everyone write access, so any local user or compromised service could modify the file; if it's a script that runs as root or a web-served directory, that can become privilege escalation or code execution.",
      checking: "Fluency with Linux permissions and the ability to connect a misconfiguration to an attack path.",
      difficulty: "warmup",
    },
    {
      id: "operating-systems-security-q10",
      question: "How do Kerberos and NTLM differ?",
      answer:
        "Kerberos uses tickets issued by a key distribution center on the domain controller: the user gets a ticket-granting ticket, then requests service tickets for specific services, and it supports mutual authentication. NTLM is an older challenge-response protocol where the server checks a response derived from the password hash, often by passing it to a domain controller. NTLM is weaker: it lacks mutual authentication, is exposed to relay and pass-the-hash attacks, and Microsoft deprecated it in 2024 and plans to disable network NTLM by default, so teams audit where it is still used and reduce it. Kerberos isn't immune either; attacks like Kerberoasting target weak service-account passwords, which is why strong or managed service-account credentials matter.",
      checking: "Enterprise authentication fundamentals and awareness of why legacy protocols matter to attackers.",
      difficulty: "stretch",
    },
    {
      id: "operating-systems-security-q11",
      question: "You suspect a Linux server was used to run unauthorized commands. Where would you look first?",
      answer:
        "I would start with authentication logs, auth.log or secure, or journalctl, to see who logged in, from where, and when, including sudo usage. Then I'd look at running processes and listening sockets with ps and ss, cron entries and systemd timers and services for anything new, recently modified files in places like /tmp and users' home directories, and shell history, keeping in mind history can be cleared or edited. I'd collect copies before changing anything and record times in a consistent time zone.",
      checking: "A structured, evidence-first approach to Linux triage and awareness that some sources are unreliable.",
      difficulty: "stretch",
    },
  ],
  lab: {
    title: "Permissions in Bandit, then inspect a real process",
    steps: [
      "Connect to [OverTheWire Bandit](https://overthewire.org/wargames/bandit/) and complete the first several levels (for example, levels 0 to 5) using manual pages rather than walkthroughs.",
      "For each level, write one sentence naming the file or permission concept it taught, such as hidden files, files with unusual names, or searching by size and permissions with `find`.",
      "On your own computer, open a benign program such as a text editor.",
      "On Windows, run `Get-CimInstance Win32_Process -Filter \"Name = 'notepad.exe'\" | Select-Object ProcessId, ParentProcessId, ExecutablePath, CommandLine` in PowerShell, or view the process in Sysinternals Process Explorer. To see the owning account, pipe the same `Get-CimInstance` command to `Invoke-CimMethod -MethodName GetOwner`. On Linux or macOS, find its PID with `pgrep` and run `ps -o pid,ppid,user,args -p PID` (replacing PID with the number); this works on both systems.",
      "Record the process's user identity, parent process (look up the parent's name too), full executable path, and command line.",
      "Write two or three sentences on what would make this same process look suspicious, for example an unusual path, an unexpected parent, or an odd command line.",
    ],
    resourceIds: ["r18", "r06"],
    links: [],
  },
  resourceIds: ["r03", "r05", "r06", "r09"],
  extraLinks: [
    {
      title: "Microsoft: Event 4624, an account was successfully logged on",
      url: "https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4624",
    },
    {
      title: "Microsoft Sentinel: Windows security event sets",
      url: "https://learn.microsoft.com/en-us/azure/sentinel/windows-security-event-id-reference",
    },
  ],
};
