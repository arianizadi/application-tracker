import type { Module } from "../types";

export const prepModule: Module = {
  id: "web-application-security",
  number: 5,
  title: "Find and Fix Web Security Problems",
  hook: "Follow untrusted input across the application's trust boundaries.",
  hours: 6,
  tracks: ["APP", "OFF", "ENG"],
  objectives: [
    "Explain major web vulnerability mechanisms.",
    "Distinguish authentication, sessions, and authorization.",
    "Connect findings to effective mitigations.",
    "Describe a safe, reproducible application-security investigation.",
  ],
  lesson: [
    { type: "h", text: "Draw the trust boundaries first" },
    {
      type: "p",
      text: "A web application accepts requests, applies business logic, accesses resources, and returns responses. Security failures often occur when the application trusts input or authority that it should verify. Before memorizing vulnerability names, draw the system and mark where trust changes.",
    },
    {
      type: "diagram",
      caption: "Draw a boundary around each component and label which identity and permissions cross it",
      lines: [
        "┌──────────┐   HTTP request    ┌──────────────┐   SQL query    ┌──────────┐",
        "│ Browser  │ ────────────────▶ │ Application  │ ─────────────▶ │ Database │",
        "│ (user)   │ ◀──────────────── │ server       │ ◀───────────── │          │",
        "└──────────┘   HTTP response   └──────┬───────┘                └──────────┘",
        "   untrusted input enters here        │ outbound request",
        "                                      ▼",
        "                              ┌─────────────────────────┐",
        "                              │ External API / metadata │",
        "                              └─────────────────────────┘",
      ],
    },
    {
      type: "p",
      text: "This picture makes three questions easier to reason about: How is input handled at each hop? Is authorization enforced on the server for every action? Where can the server be made to send requests on someone else's behalf?",
    },
    { type: "h", text: "Injection: SQL injection and XSS" },
    {
      type: "p",
      text: "**SQL injection** occurs when untrusted input changes the structure or meaning of a database query. **Parameterized queries** separate data from query structure and are the primary defense. Input validation and restricted database permissions support that defense but do not replace it.",
    },
    {
      type: "code",
      lang: "python",
      caption: "The first query lets input become SQL. The second sends the value separately, so it is always treated as data.",
      code: `# Vulnerable: string concatenation builds the query
username = request.args["username"]          # attacker sends:  ' OR '1'='1
cur.execute("SELECT * FROM users WHERE name = '" + username + "'")
# Resulting SQL: SELECT * FROM users WHERE name = '' OR '1'='1'   -> every row

# Fixed: parameterized query (sqlite3 placeholder style)
cur.execute("SELECT * FROM users WHERE name = ?", (username,))`,
    },
    {
      type: "p",
      text: "**Cross-site scripting (XSS)** occurs when attacker-controlled content executes as script in a victim's browser under the application's origin. It comes in three common forms: *stored* (saved on the server, such as in a comment), *reflected* (bounced back from the request, such as a search parameter), and *DOM-based* (client-side JavaScript writes untrusted data into the page). Context-appropriate output encoding, safe rendering APIs (for example setting `textContent` instead of `innerHTML`), and real sanitization for intentionally supported HTML address different situations. Content Security Policy is a valuable extra layer, not the fix itself.",
    },
    { type: "h", text: "SSRF versus CSRF" },
    {
      type: "p",
      text: "**SSRF** (server-side request forgery) causes a server to make requests influenced by an attacker, potentially reaching services the attacker cannot access directly, such as internal admin panels or a cloud metadata endpoint that can hand out credentials. Defenses include strict destination allowlists, careful URL parsing, network egress restrictions, and hardened metadata access (for example requiring AWS IMDSv2).",
    },
    {
      type: "p",
      text: "**CSRF** (cross-site request forgery) induces an authenticated browser to send an unwanted action using credentials attached automatically, such as cookies. Anti-CSRF tokens and cookie policies such as `SameSite` help. CORS alone is not a general CSRF defense: CORS controls whether another origin can *read* a response, while a simple cross-site form submission can still be *sent*.",
    },
    {
      type: "diagram",
      caption: "Same letters, different boundaries",
      lines: [
        "SSRF:  attacker → app server → internal service the attacker cannot reach",
        "                  (server is tricked into sending the request)",
        "",
        "CSRF:  attacker page → victim's browser (with cookies) → target app",
        "                       (browser is tricked into sending the request)",
      ],
    },
    { type: "h", text: "Access control: number one on the OWASP list" },
    {
      type: "p",
      text: "Authentication establishes identity, while **authorization** must protect each sensitive action and resource. If changing a document identifier reveals another user's file, that is an access-control failure even if login works perfectly. Hiding buttons in the interface does not enforce server-side permissions.",
    },
    {
      type: "code",
      lang: "http",
      caption: "An IDOR in its simplest form. Logged in as the owner of invoice 1042, you change the number and receive someone else's invoice.",
      code: `GET /api/invoices/1042 HTTP/1.1     -> 200 OK  (your invoice, expected)
GET /api/invoices/1043 HTTP/1.1     -> 200 OK  (another customer's invoice: broken access control)
                                    -> expected: 403 Forbidden or 404 Not Found`,
    },
    {
      type: "p",
      text: "Consider **horizontal** access between peers (one customer reading another's invoice) and **vertical** access to more privileged functions (a normal user calling an admin endpoint). Tests should include both successful authorized access and expected denials.",
    },
    { type: "h", text: "Sessions" },
    {
      type: "p",
      text: "Sessions connect multiple requests to an authenticated interaction. Session identifiers are sensitive because possession may allow impersonation. Secure cookie settings (`Secure`, `HttpOnly`, an appropriate `SameSite` value), sensible expiration, rotation at relevant transitions such as login and privilege change, and reliable server-side invalidation help manage that risk.",
    },
    {
      type: "p",
      text: "`HttpOnly` limits JavaScript access to a cookie but does not eliminate XSS or stop every action an injected script can perform, because the script can still make requests from the victim's page. Logging out should invalidate the session on the server rather than merely remove a visible button.",
    },
    { type: "h", text: "OWASP Top 10:2025 and how to use it" },
    {
      type: "p",
      text: "The current OWASP Top 10 is the **2025 edition** (released in late 2025), which replaced the 2021 list. Broken Access Control is still ranked first. Know the list by name, not just by number:",
    },
    {
      type: "list",
      items: [
        "**A01:2025** Broken Access Control (now also covers SSRF, which had its own 2021 category)",
        "**A02:2025** Security Misconfiguration (up from fifth)",
        "**A03:2025** Software Supply Chain Failures (an expansion of 2021's Vulnerable and Outdated Components)",
        "**A04:2025** Cryptographic Failures",
        "**A05:2025** Injection (includes XSS; down from third)",
        "**A06:2025** Insecure Design",
        "**A07:2025** Authentication Failures (renamed from Identification and Authentication Failures)",
        "**A08:2025** Software or Data Integrity Failures",
        "**A09:2025** Security Logging and Alerting Failures (renamed to stress alerting, not just logging)",
        "**A10:2025** Mishandling of Exceptional Conditions (new: unsafe error handling, failing open, leaking details in errors)",
      ],
    },
    {
      type: "p",
      text: "Many interviewers, job postings, and older courses still quote the 2021 numbering, where Injection was A03 and SSRF was A10. If someone cites \"A03 Injection,\" you can say you know it as A05 in the 2025 edition, which shows you keep current without correcting them awkwardly. Either way, the Top 10 is an awareness document, not a complete testing plan. Use the OWASP Web Security Testing Guide (WSTG) for testing structure and the Cheat Sheets for implementation guidance. [OWASP Top 10:2025](https://top10.owasp.org/2025/0x00_2025-Introduction/).",
    },
    {
      type: "callout",
      tone: "warning",
      title: "Only test what you are authorized to test",
      text: "Everything in this module is for labs you are permitted to use, such as PortSwigger's Web Security Academy or a Juice Shop instance you run yourself, or for bug bounty programs within their published scope and rules. Probing a real site without written permission can break laws such as the U.S. Computer Fraud and Abuse Act, even if you mean well and report what you find. Interviewers listen for this boundary.",
    },
    { type: "h", text: "Writing it up" },
    {
      type: "p",
      text: "In a lab report, explain each of these in order. Use the minimum demonstration needed to establish the issue, and stay within the platform's rules.",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "**Affected component:** the feature, endpoint, or parameter.",
        "**Required conditions:** for example, any logged-in user.",
        "**Observed behavior:** the exact request and response that show the issue.",
        "**Impact:** what an attacker could realistically do.",
        "**Remediation:** the root-cause fix, not just a filter.",
        "**Retest:** confirm the original failure is gone and legitimate use still works.",
      ],
    },
    {
      type: "callout",
      tone: "interview",
      title: "Say it like this",
      text: "\"The weakness is that untrusted input or identity crosses this boundary without the required check. I would fix the root cause and verify both the original failure and legitimate functionality.\"",
    },
  ],
  sayItLikeThis:
    "\"I approach web security by following untrusted input and identity across trust boundaries: browser to app, app to database, app to other services. Most bugs are a missing check at one of those boundaries. SQL injection is input changing query structure, so I fix it with parameterized queries. XSS is untrusted content running as script, so I use safe rendering and context-aware encoding, with CSP as an extra layer. For access control, I make sure the server checks permission for every object and action, not just the UI. When I find something in a lab, I write it up with the affected component, conditions, evidence, impact, a root-cause fix, and how I retested.\"",
  terms: [
    { term: "SQL injection", definition: "Untrusted input changes the structure or meaning of a database query." },
    { term: "XSS", definition: "Attacker-controlled script executes in a victim's browser under the application's origin; stored, reflected, or DOM-based." },
    { term: "SSRF", definition: "Attacker influences requests that a server makes, potentially reaching internal resources." },
    { term: "CSRF", definition: "A victim's browser is induced to send an unwanted authenticated request to a site." },
    { term: "IDOR", definition: "Insecure direct object reference: an access-control failure where changing an object identifier exposes or modifies an unauthorized resource." },
    { term: "Session", definition: "State connecting related requests to one authenticated interaction." },
    { term: "Access control", definition: "Enforcement of which actions an identity may perform on which resources." },
    { term: "Parameterized query", definition: "Query mechanism that sends structure and data separately so data cannot change the query." },
    { term: "Output encoding", definition: "Converting data into a safe form for the specific context (HTML body, attribute, JavaScript, URL) where it is placed." },
    { term: "Same-origin policy", definition: "Browser rule that limits how a page from one origin can read data from another origin." },
    { term: "Trust boundary", definition: "Point where trust assumptions or privileges change." },
  ],
  questions: [
    {
      id: "web-application-security-q1",
      question: "What causes SQL injection?",
      answer:
        "It happens when the application builds a query by concatenating untrusted input into the SQL string, so the database interprets part of that input as code. For example, a username of `' OR '1'='1` can turn a lookup for one user into a query that returns every row. The primary fix is parameterized queries or prepared statements, which send the query structure and the values separately. Parts of a query that cannot be parameterized, like a column name for sorting, should come from an allowlist. A least-privilege database account and input validation limit the damage if something is missed.",
      checking: "Root cause and appropriate mitigation.",
      difficulty: "warmup",
    },
    {
      id: "web-application-security-q2",
      question: "How would you prevent XSS?",
      answer:
        "The core fix is to make sure untrusted data is always rendered as data, never as markup or script. In practice that means using frameworks that escape output by default, like React or a templating engine with auto-escaping, avoiding escape hatches such as `dangerouslySetInnerHTML` or `innerHTML`, and encoding for the right context, since HTML body, attributes, JavaScript, and URLs each need different handling. If the application intentionally accepts user HTML, it needs a well-maintained sanitizer such as DOMPurify. On top of that I would add a Content Security Policy as defense in depth, not as the only fix.",
      checking: "Context-sensitive defense.",
      difficulty: "core",
    },
    {
      id: "web-application-security-q3",
      question: "How are SSRF and CSRF different?",
      answer:
        "In SSRF, the attacker tricks the server into making a request, for example by giving a URL-preview feature an internal address like a cloud metadata endpoint, so the server reaches places the attacker cannot. Defenses are server-side: destination allowlists, blocking internal address ranges after resolving the hostname, restricting egress, and hardening metadata access such as AWS IMDSv2. In CSRF, the attacker tricks the victim's browser into sending a request to a site where the victim is logged in, relying on cookies being attached automatically. Defenses are anti-CSRF tokens, `SameSite` cookies, and requiring re-authentication for sensitive actions. The short version: SSRF abuses the server's network position, CSRF abuses the user's session.",
      checking: "Mechanism rather than acronym recall.",
      difficulty: "core",
    },
    {
      id: "web-application-security-q4",
      question: "What is an insecure direct object reference (IDOR)?",
      answer:
        "It is an access-control weakness where a supplied object reference can expose or modify an unauthorized resource. A predictable identifier alone is not the complete problem. The server must enforce permission for the requested object and action.",
      checking: "Authorization reasoning.",
      difficulty: "core",
    },
    {
      id: "web-application-security-q5",
      question: "Does HttpOnly prevent XSS?",
      answer:
        "No, it prevents normal JavaScript access to the marked cookie. Injected script may still act within the page's context or access other data. The application must address the injection itself.",
      checking: "Limits of cookie controls.",
      difficulty: "core",
    },
    {
      id: "web-application-security-q6",
      question: "How would you secure sessions?",
      answer:
        "I would use the framework's established session mechanism rather than inventing one, so identifiers are long and random. The session cookie should be `Secure` so it only travels over HTTPS, `HttpOnly` so page scripts cannot read it, and `SameSite=Lax` or `Strict` to reduce cross-site use. I would issue a new session ID at login and on privilege changes to prevent session fixation, set idle and absolute timeouts, and make logout invalidate the session on the server. Then I would test those behaviors directly, for example by replaying an old session cookie after logout.",
      checking: "Session lifecycle understanding.",
      difficulty: "core",
    },
    {
      id: "web-application-security-q7",
      question: "Is the OWASP Top 10 a complete pentest checklist?",
      answer:
        "No, it is an awareness document describing major risk categories; the current edition is the 2025 list, with Broken Access Control at the top. A real assessment needs an agreed scope and rules of engagement, an understanding of the specific application and its business logic, and a testing methodology. I would use the OWASP WSTG for test structure and design review alongside it, because many serious bugs, like business-logic flaws, do not fit neatly into one Top 10 category.",
      checking: "Appropriate framework use.",
      difficulty: "warmup",
    },
    {
      id: "web-application-security-q8",
      question: "How would you report a lab vulnerability?",
      answer:
        "I would provide the affected feature, prerequisites, reproducible evidence, and practical impact. Then I would recommend a root-cause fix and describe how to retest it. I would clearly label the environment as a training lab.",
      checking: "Communication and honest scope.",
      difficulty: "core",
    },
    {
      id: "web-application-security-q9",
      question: "What is the difference between stored, reflected, and DOM-based XSS?",
      answer:
        "Stored XSS is saved by the application, such as in a comment or profile field, and runs for every user who views it, so it often has the widest impact. Reflected XSS comes from the current request, such as a search parameter echoed back, and usually requires tricking a victim into following a crafted link. DOM-based XSS happens entirely in client-side JavaScript, when code takes data from a source like the URL fragment and writes it into a dangerous sink like innerHTML. The fix is the same principle in each case: treat the data as untrusted and render it safely for its context.",
      checking: "Whether you understand where the payload lives and how that affects impact and defense.",
      difficulty: "core",
    },
    {
      id: "web-application-security-q10",
      question: "What is CORS, and is it a security control?",
      answer:
        "The same-origin policy stops a page on one origin from reading responses from another origin. CORS is a way for a server to relax that policy for specific trusted origins. So CORS does not add protection by itself; it loosens a default protection, and a misconfiguration, like reflecting any Origin header while allowing credentials, can let a malicious site read a logged-in user's data. It also does not stop CSRF, because it governs reading responses, not whether a cross-site request is sent.",
      checking: "Precise understanding of browser security boundaries and a common misconception.",
      difficulty: "stretch",
    },
    {
      id: "web-application-security-q11",
      question: "What are common security mistakes with JWTs?",
      answer:
        "A JWT is usually a signed token (JWS), and its payload is only Base64URL-encoded, so anyone holding it can read the claims; it should not contain secrets unless it is actually encrypted. Common mistakes are not verifying the signature, accepting whatever algorithm the token header specifies (including 'none', or switching RS256 to HS256 so the public key is misused as an HMAC secret), using a weak HMAC secret that can be brute-forced, and not validating claims like expiration, issuer, and audience. Because JWTs are often stateless, revocation and logout need a plan, such as short lifetimes with refresh tokens. I would use a well-maintained library and pin the expected algorithm.",
      checking: "Practical knowledge of token-based auth pitfalls and the encoding-versus-encryption distinction.",
      difficulty: "stretch",
    },
    {
      id: "web-application-security-q12",
      question: "How would you test an API endpoint for broken access control?",
      answer:
        "In an authorized lab or scoped test, I would create at least two users at the same privilege level and one at a different level. I would capture a legitimate request for user A's resource, then replay it with user B's session, and also try a low-privilege session against admin functions. I would change object IDs, HTTP methods, and parameters, and check that the server returns a denial rather than data. I would also confirm that legitimate access still works, and record each request and response as evidence.",
      checking: "A methodical, permission-aware testing approach covering horizontal and vertical access.",
      difficulty: "core",
    },
  ],
  lab: {
    title: "Two beginner Web Security Academy labs and short findings",
    steps: [
      "Create a free PortSwigger account and open the Web Security Academy. Labs run on PortSwigger's own hosted targets, so you are authorized to test them.",
      "Read the Access control topic, then filter labs to the Apprentice level and complete one, such as **Unprotected admin functionality** or **User ID controlled by request parameter**.",
      "Read the SQL injection topic, then complete one Apprentice-level lab, such as **SQL injection vulnerability in WHERE clause allowing retrieval of hidden data**.",
      "While you work, record the exact request you changed and the response that showed the issue. Your browser's developer tools are enough; the free Burp Suite Community Edition makes this easier.",
      "For each lab, write a short finding with: affected component, required conditions, observed behavior, impact, the trust boundary that failed, and a root-cause mitigation (for example, server-side authorization checks or parameterized queries).",
      "Add one sentence per finding describing how you would retest the fix, and label both write-ups clearly as training-lab work.",
    ],
    resourceIds: ["r12"],
    links: [],
  },
  resourceIds: ["r12", "r11", "r13", "r14", "r15"],
  extraLinks: [],
};
