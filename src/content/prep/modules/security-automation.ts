import type { Module } from "../types";

export const prepModule: Module = {
  id: "security-automation",
  number: 10,
  title: "Automate Carefully",
  hook: "Make repetitive work faster without making mistakes harder to see.",
  hours: 5,
  tracks: ["SOC", "ENG", "DET", "DFIR", "CLOUD"],
  objectives: [
    "Select Python, Bash, or PowerShell for a bounded task.",
    "Describe robust parsing and data handling.",
    "Explain safe API, credential, and failure handling.",
    "Validate automation before trusting its output.",
  ],
  lesson: [
    { type: "h", text: "Start with the decision, not the language" },
    {
      type: "p",
      text: "Security automation is useful when a task has repeatable inputs, clear rules, and a result someone can verify. Examples include summarizing authentication failures, enriching indicators, checking configuration, or preparing a report. Begin with a question rather than a language: what decision should the output support, which records are available, and what could go wrong? Automating an unclear process can produce misleading results more quickly without improving the decision.",
    },
    {
      type: "list",
      items: [
        "**Decision:** What will someone do differently because of this output?",
        "**Inputs:** Which records exist, in what format, and over what time window?",
        "**Failure modes:** What happens with malformed, missing, duplicate, or empty data?",
        "**Verification:** How will you check the output against a manual result?",
      ],
    },
    { type: "h", text: "Choosing Python, Bash, or PowerShell" },
    {
      type: "p",
      text: "**Python** is useful for structured data, APIs, and workflows requiring more logic. **Bash** works well for connecting command-line tools in suitable environments. **PowerShell** is particularly useful for Windows administration and object-based data handling. These are overlapping choices, not rigid boundaries. In an interview, explain why the language fits the environment, available libraries, expected maintenance, and the people who will use the result.",
    },
    { type: "h", text: "Worked example: a Python log summary" },
    {
      type: "p",
      text: "Here is the workflow in plain language: read JSON authentication records, validate required fields, keep failed attempts, group by source and account, then report counts and time ranges. That workflow preserves structure rather than searching arbitrary text for the word *failed*. It also exposes design questions: what happens to malformed rows, missing timestamps, duplicate events, or records from different time zones? Those decisions can change the conclusion.",
    },
    {
      type: "diagram",
      caption: "A structured log-summary pipeline",
      lines: [
        "read JSON lines → validate required fields → keep result == failure",
        "      |                    |",
        "      |                    +--> invalid or incomplete: count as skipped, note line number",
        "      v",
        "group by (source IP, account) → count + first/last seen → report (with skipped count)",
      ],
    },
    {
      type: "code",
      lang: "text",
      caption: "Sample input (one JSON object per line). The third line is deliberately broken; the fourth is missing a field.",
      code: `{"timestamp": "2026-10-16T09:12:01Z", "user": "alice", "src_ip": "203.0.113.7", "result": "failure"}
{"timestamp": "2026-10-16T09:12:05Z", "user": "alice", "src_ip": "203.0.113.7", "result": "failure"}
{"timestamp": "2026-10-16T09:13:00Z", "user": "bob", "src_ip"
{"timestamp": "2026-10-16T09:14:10Z", "user": "carol", "result": "success"}
{"timestamp": "2026-10-16T09:15:42Z", "user": "alice", "src_ip": "203.0.113.7", "result": "success"}`,
    },
    {
      type: "code",
      lang: "python",
      caption: "Comparing timestamps as strings with min/max only works here because every timestamp uses the same ISO 8601 format in UTC (the trailing Z). With real data, parse them with the datetime module and normalize time zones first.",
      code: `import json
import sys
from collections import defaultdict

REQUIRED = ("timestamp", "user", "src_ip", "result")


def summarize(path):
    groups = defaultdict(list)  # (src_ip, user) -> list of timestamps
    skipped = 0
    with open(path, encoding="utf-8") as f:
        for line_no, line in enumerate(f, start=1):
            if not line.strip():
                continue
            try:
                event = json.loads(line)
            except json.JSONDecodeError:
                skipped += 1
                print(f"line {line_no}: invalid JSON, skipped", file=sys.stderr)
                continue
            if not isinstance(event, dict) or any(k not in event for k in REQUIRED):
                skipped += 1
                print(f"line {line_no}: missing fields, skipped", file=sys.stderr)
                continue
            if event["result"] == "failure":
                groups[(event["src_ip"], event["user"])].append(event["timestamp"])
    return groups, skipped


if __name__ == "__main__":
    groups, skipped = summarize(sys.argv[1])
    if not groups:
        print("no failed-login records found (check that the input covers the window you expect)")
    for (src_ip, user), times in sorted(groups.items(), key=lambda kv: -len(kv[1])):
        print(f"{src_ip}  {user}  failures={len(times)}  first={min(times)}  last={max(times)}")
    print(f"skipped records: {skipped}", file=sys.stderr)`,
    },
    {
      type: "callout",
      tone: "example",
      title: "Reading the result",
      text: "On the sample input, the tool reports `203.0.113.7  alice  failures=2` and `skipped records: 2`. Notice what the count alone hides: the same source then logged in **successfully** as alice at 09:15:42. That success is the more interesting finding, which is why a summary should keep a path back to the raw events. Also notice the tool does not de-duplicate yet; deciding what counts as a duplicate is a design choice you should make deliberately.",
    },
    { type: "h", text: "Bash: connect tools, but quote everything" },
    {
      type: "p",
      text: "A Bash-style example is: read an approved log export, select the intended fields, count relevant records, and write a summary. Quoting and safe argument handling matter because filenames and input values may contain spaces or shell characters. Do not turn log text into commands. Check exit statuses and avoid silently interpreting an empty intermediate result as proof that no suspicious activity occurred.",
    },
    {
      type: "code",
      lang: "bash",
      caption: "Top sources of failed SSH password attempts. `grep` exits 1 for no matches and 2 for an error; the script treats those differently instead of reporting a quiet empty result.",
      code: `#!/usr/bin/env bash
set -uo pipefail

if (( $# != 1 )); then echo "usage: $0 LOGFILE" >&2; exit 2; fi
log_file="$1"
[[ -r "$log_file" ]] || { echo "cannot read: $log_file" >&2; exit 2; }

tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT

grep -E -- 'sshd.*Failed password' "$log_file" > "$tmp"
status=$?
if (( status == 1 )); then
  echo "no failed-password lines in $log_file (does it cover the window you expect?)"
  exit 0
elif (( status > 1 )); then
  echo "grep failed while reading $log_file" >&2
  exit 2
fi

grep -oE 'from [0-9a-fA-F:.]+ port' "$tmp" |
  awk '{print $2}' | sort | uniq -c | sort -rn | head -n 10`,
    },
    {
      type: "callout",
      tone: "tip",
      title: "Where SSH logs live",
      text: "Debian and Ubuntu typically write SSH authentication events to `/var/log/auth.log`; RHEL-family systems use `/var/log/secure`. Many systemd-based hosts also (or only) keep them in the journal, readable with `journalctl -u ssh` or `journalctl -u sshd` depending on the unit name. Remember rotated files such as `auth.log.1` and compressed `.gz` archives when your time window is longer than a day.",
    },
    { type: "h", text: "PowerShell: work with objects, not formatted text" },
    {
      type: "p",
      text: "A PowerShell-style example is: retrieve approved event objects, filter by properties, select account and timestamp, and export a report. Its pipeline commonly passes objects rather than only text, so property-aware operations are often clearer than parsing formatted output. PowerShell's execution policy is **not a security boundary**. Administrative permissions, endpoint controls, secure design, and logging remain relevant regardless of the policy setting.",
    },
    {
      type: "code",
      lang: "powershell",
      caption: "Failed Windows logons (event ID 4625) in the last 24 hours, grouped by account and source. Reading the Security log typically requires an elevated (administrator) session or membership in the Event Log Readers group. Note that Get-WinEvent raises an error when nothing matches, so the script distinguishes \"no events\" from a real failure.",
      code: `$since = (Get-Date).AddHours(-24)
try {
    $events = Get-WinEvent -FilterHashtable @{ LogName = 'Security'; Id = 4625; StartTime = $since } -ErrorAction Stop
} catch {
    if ($_.FullyQualifiedErrorId -like 'NoMatchingEventsFound*') { $events = @() } else { throw }
}

$events | ForEach-Object {
    $xml = [xml]$_.ToXml()
    $data = @{}
    foreach ($d in $xml.Event.EventData.Data) { $data[$d.Name] = $d.'#text' }
    [pscustomobject]@{
        Time    = $_.TimeCreated
        Account = $data['TargetUserName']
        Source  = $data['IpAddress']
    }
} | Group-Object Account, Source | Sort-Object Count -Descending | Select-Object Count, Name -First 10`,
    },
    { type: "h", text: "Calling APIs safely" },
    {
      type: "p",
      text: "Automation that calls an API needs authentication, timeouts, pagination handling, and a plan for rate limits or partial failures. Keep secrets out of source files, screenshots, and logs. Use read-only permissions where possible, and separate observation from changes that disable users or modify systems. For impactful actions, design approval, preview, logging, and rollback behavior according to the organization's process. Retrying an operation can be unsafe if it is not **idempotent**.",
    },
    {
      type: "diagram",
      caption: "A defensive pagination loop for a read-only API",
      lines: [
        "request page (credential from secret store, explicit timeout)",
        "   |",
        "   +-- 401/403 ---------> stop; report an authentication or permission failure",
        "   +-- 429 -------------> wait (honor Retry-After or back off), retry the same page",
        "   +-- 5xx or timeout --> limited retries, then record the page as failed",
        "   v 200 OK",
        "save records → next page token? --yes--> request next page",
        "                    |",
        "                    no",
        "                    v",
        "report: records fetched, pages failed, time range actually covered",
      ],
    },
    { type: "h", text: "Validate before you trust it" },
    {
      type: "p",
      text: "Validate a small tool using representative normal, malformed, empty, duplicate, and boundary-case inputs. Compare its output with a manual result and document assumptions. Counts are observations, not automatic attack verdicts: a threshold needs context and a suitable time window.",
    },
    {
      type: "list",
      items: [
        "**Normal:** a handful of clean records with a known expected count.",
        "**Malformed:** truncated JSON or a missing field; it should be counted as skipped, not silently dropped.",
        "**Empty:** an empty file; the report should say \"no records,\" not \"no attacks.\"",
        "**Duplicate:** the same event twice; confirm your tool does what you decided it should.",
        "**Boundary:** events exactly at the edges of the time window and in different time zones.",
      ],
    },
    {
      type: "callout",
      tone: "interview",
      title: "Say it like this",
      text: "I would parse structured input, handle failures explicitly, preserve traceability to raw events, and test the result before using it to drive a security decision.",
    },
  ],
  sayItLikeThis:
    "I automate tasks that are repetitive, low-risk, and verifiable, and I start from the decision the output should support rather than from a favorite language. I pick Python for structured data and APIs, Bash for gluing command-line tools together, and PowerShell for Windows and object-based administration. Whatever the language, I parse structured fields instead of matching raw text, quote inputs and never execute log content, count and surface records I could not parse, and handle API timeouts, pagination, and rate limits so partial results are reported as partial. Secrets come from an approved secret store with least privilege. Before anyone acts on the output, I test it against normal, malformed, empty, duplicate, and boundary inputs and compare it with a manual check, because a count is an observation, not a verdict.",
  terms: [
    { term: "Parsing", definition: "Interpreting input according to a defined structure." },
    { term: "JSON", definition: "Structured text format for data exchange." },
    { term: "API", definition: "Interface through which software requests functionality or data." },
    { term: "Pagination", definition: "Splitting a result set across multiple responses." },
    { term: "Exception", definition: "Condition disrupting normal program execution." },
    { term: "Idempotency", definition: "Repeating an operation has no additional intended effect." },
    { term: "Rate limit", definition: "Restriction on request frequency or volume." },
    { term: "Secret", definition: "Sensitive credential or cryptographic material." },
    { term: "Exit status", definition: "Numeric code a command returns on completion; by convention 0 means success and non-zero signals a condition such as no match or an error." },
    { term: "SOAR", definition: "Security orchestration, automation, and response: platforms that connect security tools and run playbooks for enrichment and response actions." },
  ],
  questions: [
    {
      id: "security-automation-q1",
      question: "What would you automate first in a SOC?",
      answer:
        "I would pick something repetitive, read-only, and easy to verify, such as enriching phishing alerts: pull the sender domain, check URL and domain reputation, find other mailboxes that received the same message, and attach a consistent summary to the ticket. Analysts still make the call, but they start with the facts gathered. I would run it alongside the manual process for a while and compare results before relying on it, and I would not start with unsupervised containment actions like disabling accounts.",
      checking: "Scope and risk judgment.",
      difficulty: "core",
    },
    {
      id: "security-automation-q2",
      question: "Why parse JSON instead of searching raw text?",
      answer:
        "Structured parsing lets me use defined fields and types. A text match may confuse a message description with the actual result field. I would still validate the schema and handle missing or malformed values.",
      checking: "Data correctness.",
      difficulty: "warmup",
    },
    {
      id: "security-automation-q3",
      question: "How would you handle malformed records?",
      answer:
        "I would record that parsing failed and preserve enough context to inspect the original input safely. I would distinguish skipped records from valid records with no matching activity. The report should expose incomplete coverage rather than silently hide it.",
      checking: "Failure transparency.",
      difficulty: "core",
    },
    {
      id: "security-automation-q4",
      question: "Python, Bash, or PowerShell?",
      answer:
        "I would choose based on the task and operating environment. Python suits structured workflows, Bash can connect Unix tools, and PowerShell provides strong Windows object-based administration. Maintainability and team familiarity also matter.",
      checking: "Practical language selection.",
      difficulty: "warmup",
    },
    {
      id: "security-automation-q5",
      question: "How should a script store an API key?",
      answer:
        "Never in the source code. The script should fetch it at runtime from the organization's approved secret store, such as a vault or a cloud secrets manager, or receive it through an environment variable injected by that system. I would keep it out of logs, error messages, and shell history, and run a secret scanner before committing. The key should be scoped to the minimum permissions the script needs, preferably read-only, and have an owner and rotation process. If a key ever lands in a repository, I treat it as exposed: revoke and rotate it, because deleting the commit does not remove it from clones or history.",
      checking: "Credential handling.",
      difficulty: "core",
    },
    {
      id: "security-automation-q6",
      question: "What are common API mistakes?",
      answer:
        "Ignoring pagination, timeouts, rate limits, and partial failures can produce incomplete or misleading results. Authentication errors also need clear handling. I would report which data was retrieved and which requests failed.",
      checking: "Reliability.",
      difficulty: "core",
    },
    {
      id: "security-automation-q7",
      question: "How would you test a log-summary tool?",
      answer:
        "I would use a small dataset with known expected results and compare it manually. I would include malformed rows, duplicates, empty input, and time-boundary cases. I would also verify that no sensitive fields appear unnecessarily in the output.",
      checking: "Meaningful validation.",
      difficulty: "core",
    },
    {
      id: "security-automation-q8",
      question: "Does crossing a failure threshold prove an attack?",
      answer:
        "No, a threshold identifies a pattern worth investigating. Misconfigured services or normal user mistakes may produce similar counts. I would examine distribution, account context, successful activity, and other evidence.",
      checking: "Separation of measurement and conclusion.",
      difficulty: "warmup",
    },
    {
      id: "security-automation-q9",
      question: "Walk me through finding the top source IPs for failed SSH logins on a Linux server.",
      answer:
        "First I would confirm where the host logs SSH authentication: `/var/log/auth.log` on Debian or Ubuntu, `/var/log/secure` on RHEL-family systems, or the systemd journal via `journalctl -u ssh` or `-u sshd`. I would filter for `Failed password` lines from sshd, extract the address after `from`, then count with `sort | uniq -c | sort -rn | head`. I would check that the files cover the time window I care about, including rotated or compressed logs. Then I would treat the list as a lead, not a verdict: I would look for `Accepted` logins from the same sources, which matter more than failures, and check whether the top sources are known scanners, internal hosts, or a misconfigured service.",
      checking: "Practical command-line fluency plus the habit of validating coverage and following up on successes.",
      difficulty: "core",
    },
    {
      id: "security-automation-q10",
      question: "How do you avoid command injection when a script uses values from logs or user input?",
      answer:
        "I never build a shell command by concatenating untrusted strings, and I never pass log content to `eval`. In Python I call `subprocess.run` with an argument list and the default `shell=False`, so the value is passed as a single argument rather than interpreted by a shell. In Bash I double-quote every expansion, like `\"$file\"`, and use `--` to mark the end of options so a value starting with a dash is not read as a flag. Where possible I also validate input against an allowlist, such as checking that a value is a well-formed IP address before using it.",
      checking: "Secure coding instincts in the scripts you write, not just in the systems you defend.",
      difficulty: "stretch",
    },
    {
      id: "security-automation-q11",
      question: "What is SOAR, and what guardrails would you want on an automated response playbook?",
      answer:
        "SOAR stands for security orchestration, automation, and response: platforms that connect tools like the SIEM, ticketing, threat intelligence, and endpoint controls, and run playbooks. I would start with enrichment steps that only read data, such as looking up an IP's reputation or the user's recent logins. For disruptive actions like disabling an account or isolating a host, I would want human approval, an allowlist that protects critical systems and service accounts, a cap on how many objects one run can change, full logging, and a tested rollback. Actions should be idempotent so a retry does not cause extra damage.",
      checking: "Understanding that automation amplifies both good and bad decisions, and the ability to design safe limits.",
      difficulty: "stretch",
    },
  ],
  lab: {
    title: "Design a log-summary tool on paper",
    steps: [
      "Work through the relevant parts of the free Python Tutorial (chapters on data structures, input and output, and errors and exceptions) or the PowerShell 101 chapters on objects and the pipeline.",
      "Write the decision your tool supports in one sentence, for example: \"Which source and account pairs had repeated failed logins in the last 24 hours, and did any of them later succeed?\"",
      "Define the input: the fields you require (such as timestamp, user, source IP, result), their expected format, and the time zone.",
      "Sketch the workflow as a numbered pipeline from reading input to producing the report, marking where validation happens.",
      "Write five test inputs with the exact expected output for each: a normal case, a malformed record, an empty file, a duplicate event, and a time-boundary case.",
      "Describe the failure handling for each case: what is counted, what is logged, and what the final report says about incomplete coverage.",
      "List the assumptions and limits a reader of the report should know, such as the threshold you chose and why it is not an attack verdict.",
      "Optional, as a later project: implement the design (the Python example in this lesson is a starting point) and run it against your five test inputs to confirm the expected results.",
    ],
    resourceIds: ["r07", "r09"],
    links: [],
  },
  resourceIds: ["r07", "r08", "r09", "r04"],
  extraLinks: [],
};
