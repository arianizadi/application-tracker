import type { Module } from "../types";

export const prepModule: Module = {
  id: "cloud-and-identity",
  number: 9,
  title: "Secure Access in the Cloud",
  hook: "Start with identities, permissions, data, and service boundaries.",
  hours: 5,
  tracks: ["CLOUD", "IAM", "ENG"],
  objectives: [
    "Explain service-dependent shared responsibility.",
    "Evaluate human and workload permissions.",
    "Describe common cloud misconfigurations and logging needs.",
    "Explain SSO, federation, provisioning, and identity lifecycle.",
  ],
  lesson: [
    { type: "h", text: "Shared responsibility depends on the service" },
    {
      type: "p",
      text: "Cloud security applies familiar principles to services with different operational boundaries. The provider secures the underlying infrastructure (AWS phrases this as security *of* the cloud), while the customer's duties (security *in* the cloud) depend on the service being used. With a virtual machine, the customer commonly manages the guest operating system and applications. With a managed service, more platform responsibilities move to the provider, but identities, data, and configuration still belong to the customer.",
    },
    {
      type: "diagram",
      caption: "A simplified view of who typically handles what. Exact boundaries vary by provider and service, so always check the specific service's documentation.",
      lines: [
        "                              IaaS (VM)   PaaS (managed DB/app)   SaaS",
        "Data, identities, access      Customer    Customer                Customer",
        "Service settings and sharing  Customer    Customer                Customer",
        "Application code              Customer    Customer (your code)    Provider",
        "Guest OS, patching, runtime   Customer    Provider                Provider",
        "Hypervisor, hosts, network    Provider    Provider                Provider",
        "Physical facilities           Provider    Provider                Provider",
      ],
    },
    {
      type: "p",
      text: "Avoid saying \"the cloud provider handles security\" without naming the service and the responsibility. Notice the top two rows: in every model, *you* decide who can access what and how your data and settings are configured. Even in SaaS, a file-sharing link set to \"anyone with the link\" or an admin account without MFA is the customer's problem.",
    },

    { type: "h", text: "Identity is the control plane" },
    {
      type: "p",
      text: "Human users, applications, virtual machines, and automation pipelines all act through identities and credentials. Permissions should match a defined task, with unnecessary access removed. Prefer temporary or centrally managed credentials (such as roles that issue short-lived tokens) over distributing long-lived secrets like static access keys.",
    },
    {
      type: "diagram",
      caption: "Every cloud API call follows roughly this path. Understanding it is more useful than memorizing console screens.",
      lines: [
        "principal  ->  authentication  ->  policy evaluation  ->  requested action on resource  ->  audit event",
        "(user, role,    (who are you?)      (is this allowed,      (e.g. read an object,            (who did what,",
        " workload)                           under what            change a bucket policy)         when, from where)",
        "                                     conditions?)",
      ],
    },

    { type: "h", text: "Effective permissions, not role names" },
    {
      type: "p",
      text: "IAM policies describe permissions, but **effective access** can depend on multiple policy layers and conditions. In AWS, for example, requests are denied by default, an explicit deny anywhere overrides any allow, and organization-level guardrails, permission boundaries, and resource-based policies can all affect the outcome. A role name like `ReadOnly` does not prove least privilege, and a read-only permission can still expose sensitive data.",
    },
    {
      type: "code",
      lang: "json",
      caption: "A narrowly scoped AWS identity policy: read objects only under one prefix of one bucket. Compare that with \"Action\": \"s3:*\" on \"Resource\": \"*\".",
      code: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::example-reports-bucket/reports/*"
    }
  ]
}`,
    },
    {
      type: "p",
      text: "When you evaluate access, ask: Which resources are reachable? Which actions are allowed, and under what conditions? Can this identity gain more privileges indirectly, for example by attaching a policy to itself (`iam:AttachUserPolicy` or `iam:PutUserPolicy` in AWS), passing a more powerful role to a service it controls (`iam:PassRole`), or creating new credentials for another user (`iam:CreateAccessKey`)? Access reviews should include workload identities and dormant accounts, not only employees who log in interactively.",
    },

    { type: "h", text: "Common misconfigurations and the logs that reveal them" },
    {
      type: "list",
      items: [
        "**Public data exposure:** storage buckets or snapshots readable by anyone. Public access may be intentional for some content (a website's images), so compare it with the data's classification and the intended design.",
        "**Overly broad permissions:** wildcards on actions or resources, or admin rights granted for convenience.",
        "**Exposed secrets:** access keys committed to code repositories, baked into images, or pasted into tickets.",
        "**Insecure network access:** management ports or databases open to the whole internet.",
        "**Missing or inadequate audit coverage:** logging disabled, not retained long enough, or not collected centrally.",
      ],
    },
    {
      type: "p",
      text: "Cloud activity logs, identity provider sign-in logs, storage access records, and workload telemetry provide different evidence. Confirm what is enabled, retained, and collected before assuming an investigation can reconstruct every action. For example, AWS CloudTrail's Event history shows the last 90 days of management events (like changing a bucket policy) by default, but keeping them longer or sending them to central storage requires a configured trail. Object-level reads such as `GetObject` are *data events* that are not logged unless you enable them, and they add cost.",
    },
    {
      type: "code",
      lang: "json",
      caption: "An abbreviated, fictional CloudTrail record. The access key shown is AWS's documentation example.",
      code: `{
  "eventTime": "2026-05-12T03:14:07Z",
  "eventSource": "s3.amazonaws.com",
  "eventName": "PutBucketPolicy",
  "awsRegion": "us-east-1",
  "sourceIPAddress": "203.0.113.50",
  "userIdentity": {
    "type": "IAMUser",
    "userName": "build-bot",
    "accessKeyId": "AKIAIOSFODNN7EXAMPLE"
  },
  "requestParameters": { "bucketName": "example-reports-bucket" }
}`,
    },
    {
      type: "callout",
      tone: "example",
      title: "Worked example: reading that event",
      text: "A build automation user changed a bucket policy at 3:14 a.m. UTC from an IP address you don't recognize. The `AKIA` prefix indicates a long-term IAM user access key (temporary credentials from AWS STS start with `ASIA`). Questions to ask next: Does this pipeline normally change bucket policies, and from which IP range? What did the new policy allow (did it make the bucket public)? What else did this key do before and after? Could the key have leaked? If the answers look bad, follow the incident process: contain by deactivating or rotating the key, review the policy change, and scope the impact.",
    },

    { type: "h", text: "SSO, federation, and the identity lifecycle" },
    {
      type: "p",
      text: "Authentication and lifecycle controls must work together. **SSO** reduces repeated sign-ins, **federation** lets systems rely on an external identity provider's assertions, and **provisioning** creates, updates, and removes accounts. These protocols solve related but different problems:",
    },
    {
      type: "list",
      items: [
        "**SAML 2.0:** an XML-based federation standard, widely used for enterprise web SSO.",
        "**OAuth 2.0:** delegated *authorization*. It lets an application obtain an access token to call an API on a user's behalf. On its own it is not an authentication protocol.",
        "**OpenID Connect (OIDC):** an identity layer on top of OAuth 2.0. It adds an ID token (a signed JWT) that tells the application who signed in.",
        "**SCIM:** a standard for provisioning and deprovisioning users and groups between an identity provider and applications.",
      ],
    },
    {
      type: "diagram",
      caption: "Joiner-mover-leaver: access has to follow a person through their whole time at the organization.",
      lines: [
        "JOINER   ->  identity created, provisioned to apps (e.g. via SCIM), MFA enrolled, baseline role access",
        "   |",
        "MOVER    ->  new access granted AND old access removed (otherwise privileges pile up over time)",
        "   |",
        "LEAVER   ->  identity disabled, sessions and tokens revoked, app-local accounts removed,",
        "             shared secrets rotated, devices recovered",
        "",
        "Throughout: periodic access reviews by managers or resource owners",
      ],
    },
    {
      type: "p",
      text: "Removing an employee from the directory should also address active sessions, refresh tokens, API keys, and application-specific accounts that were never connected to SSO. Disabling one account does not automatically remove every access path.",
    },

    { type: "h", text: "MFA, privileged access, and zero trust" },
    {
      type: "p",
      text: "MFA improves authentication, but the method and the recovery process matter. **Phishing-resistant** methods such as FIDO2/WebAuthn security keys and passkeys, or smart cards, bind the login to the real site and reduce credential-relay risk. Push notifications can be abused through repeated prompts (\"MFA fatigue\"), which number matching helps reduce, and [NIST SP 800-63B](https://csrc.nist.gov/pubs/sp/800/63/b/4/final) treats SMS and voice codes as *restricted* authenticators. A weak account recovery process can undermine an otherwise strong primary method.",
    },
    {
      type: "p",
      text: "Privileged access deserves extra attention: limited duration (just-in-time elevation), approval where appropriate, monitoring, and planned emergency (\"break-glass\") accounts that are tightly controlled. **Zero trust** means evaluating each access request explicitly using identity, device, and context rather than trusting network location. It is an architecture approach, not a product that removes the need for careful permissions or network design.",
    },

    { type: "h", text: "Practice safely and cheaply" },
    {
      type: "callout",
      tone: "warning",
      text: "Free training material does not guarantee free deployed resources. Use provider training sandboxes or a dedicated, empty account; never use sensitive or employer workloads; set billing alerts (remember an alert is not a hard spending cap); and verify cleanup after every exercise.",
    },
    {
      type: "callout",
      tone: "interview",
      text: "\"I would identify the service boundary, evaluate effective permissions, protect credentials, and verify logging. For an identity change, I would check the full lifecycle rather than assume disabling one account removes every active access path.\"",
    },
  ],
  sayItLikeThis:
    "When I look at cloud security, I start with the service boundary, because shared responsibility shifts between a VM, a managed database, and SaaS, but identities, data, and configuration are always ours. Then I focus on identity as the control plane: who or what the principal is, what its effective permissions really allow after every policy layer and condition, whether it could escalate, and whether it uses short-lived credentials instead of static keys. I confirm which logs are actually enabled and retained before assuming we can investigate. And for people, I think in terms of the full joiner-mover-leaver lifecycle, with SSO, provisioning, phishing-resistant MFA, and session and token revocation working together.",
  terms: [
    { term: "IAM", definition: "Identity and access management: managing identities and the access they are permitted." },
    { term: "Principal", definition: "An identity, human or workload, capable of requesting an action." },
    { term: "Role", definition: "Permission-bearing identity or assignment, depending on the platform; in AWS, a role is assumed to obtain temporary credentials." },
    { term: "Effective permissions", definition: "What an identity can actually do after all policy layers, conditions, and explicit denies are evaluated." },
    { term: "Federation", definition: "Trust arrangement allowing a system to accept identity assertions from an external identity provider." },
    { term: "SSO", definition: "Single sign-on: an authentication experience spanning multiple applications." },
    { term: "OAuth 2.0", definition: "Framework for delegated authorization, letting an app obtain limited access to a resource on a user's behalf." },
    { term: "OIDC", definition: "OpenID Connect: an identity (authentication) layer built on OAuth 2.0." },
    { term: "SCIM", definition: "System for Cross-domain Identity Management: a standard for provisioning and deprovisioning identities." },
    { term: "Shared responsibility", definition: "Allocation of security duties between cloud provider and customer, varying by service type." },
    { term: "Joiner-mover-leaver (JML)", definition: "The identity lifecycle model covering onboarding, role changes, and offboarding." },
    { term: "Phishing-resistant MFA", definition: "Cryptographic authentication bound to the legitimate site or channel, such as FIDO2/WebAuthn security keys, passkeys, or PIV smart cards, designed so a fake login page cannot relay it. Codes you type in, including SMS and authenticator-app codes, do not qualify." },
  ],
  questions: [
    {
      id: "cloud-and-identity-q1",
      question: "What is the shared responsibility model?",
      answer:
        "It divides security duties between the cloud provider and the customer. The boundary changes by service, such as a virtual machine versus a managed database: with a VM I patch the guest OS, with a managed database the provider does. I would identify the specific service before assigning responsibilities, but data, identities, and access configuration stay with the customer in every model.",
      checking: "Service-aware reasoning.",
      difficulty: "warmup",
    },
    {
      id: "cloud-and-identity-q2",
      question: "What does least privilege mean in cloud IAM?",
      answer:
        "An identity receives only the actions and resource access needed for its task. I would assess effective permissions, conditions, and possible privilege-escalation paths. I would also review access over time rather than treat the initial policy as permanent.",
      checking: "Practical access evaluation.",
      difficulty: "core",
    },
    {
      id: "cloud-and-identity-q3",
      question: "What would you do about a leaked cloud access key?",
      answer:
        "I would treat it as compromised from the moment it was exposed and follow the incident process to deactivate and replace it promptly. Deleting the commit is not enough, because automated scanners harvest keys from public repositories within minutes and the key is still in git history and forks. Then I would use the audit logs, such as CloudTrail across all regions, to see everything the key did since exposure, looking especially for persistence like new users, access keys, or roles, and for unexpected resources such as crypto-mining instances. Finally I would remove the secret from the code, move the workload to short-lived credentials or a secrets manager, and verify dependent services work with the new credential.",
      checking: "Response beyond deleting a file.",
      difficulty: "core",
    },
    {
      id: "cloud-and-identity-q4",
      question: "Is public object storage always a vulnerability?",
      answer:
        "No, public distribution may be intentional for approved content. I would compare actual access with the data classification and intended design. Sensitive or unintentionally exposed data would require urgent investigation and remediation.",
      checking: "Contextual configuration assessment.",
      difficulty: "core",
    },
    {
      id: "cloud-and-identity-q5",
      question: "What is the difference between SSO and provisioning?",
      answer:
        "SSO concerns the authentication experience across applications. Provisioning concerns creating, updating, and removing accounts or entitlements. An organization can have SSO while still failing to remove application access correctly.",
      checking: "Identity lifecycle distinctions.",
      difficulty: "core",
    },
    {
      id: "cloud-and-identity-q6",
      question: "What is the difference between OAuth and OpenID Connect?",
      answer:
        "OAuth 2.0 supports delegated authorization to resources, so an app can get an access token to call an API. OpenID Connect adds an identity layer on top for authentication, including an ID token, a signed JWT that tells the client application who signed in. The tokens have different audiences: the access token is meant for the API, and the ID token is meant for the client app, so treating an access token as proof of login is a classic mistake. I would use a well-supported library and validate the signature, issuer, audience, and expiry rather than hand-rolling it.",
      checking: "Protocol purposes.",
      difficulty: "core",
    },
    {
      id: "cloud-and-identity-q7",
      question: "What should happen when an employee leaves?",
      answer:
        "The organization should execute its approved offboarding process across identities, entitlements, sessions, and credentials. I would verify application deprovisioning and access removal rather than assume every system updates immediately, including app-local accounts and API keys outside SSO. Exceptions should be documented and escalated.",
      checking: "Complete lifecycle thinking.",
      difficulty: "core",
    },
    {
      id: "cloud-and-identity-q8",
      question: "Why might a cloud lab cost money?",
      answer:
        "The training material may be free while compute, storage, networking, or lab credits are billed. I would review what the exercise deploys and use an isolated sandbox. I would verify cleanup, because a spending alert is not necessarily a hard cap.",
      checking: "Operational responsibility.",
      difficulty: "warmup",
    },
    {
      id: "cloud-and-identity-q9",
      question: "Which MFA methods are strongest, and what is MFA fatigue?",
      answer:
        "Phishing-resistant methods such as FIDO2/WebAuthn security keys, passkeys, and smart cards are strongest because they are bound to the legitimate site and can't be relayed through a fake login page. Authenticator-app codes and push are better than passwords alone but can be phished or abused. MFA fatigue is when an attacker with a stolen password triggers repeated push prompts until the user approves one; number matching, rate limits, and moving to phishing-resistant methods reduce it. Recovery processes also need protection, or they become the bypass.",
      checking: "Nuanced understanding of authentication strength.",
      difficulty: "core",
    },
    {
      id: "cloud-and-identity-q10",
      question: "How would you investigate an alert about a cloud console sign-in from an unusual location?",
      answer:
        "I would check the identity provider and cloud audit logs for that sign-in: the user, source IP and location, device, whether MFA was satisfied, and whether it fits the user's normal pattern or a known VPN. Then I would look at what the session did afterward, such as creating keys, changing policies, or accessing data. If it looks unauthorized, I would follow the incident process: confirm with the user through a separate channel, revoke sessions, reset credentials, and scope what was touched.",
      checking: "Applying investigation habits to identity and cloud telemetry.",
      difficulty: "core",
    },
    {
      id: "cloud-and-identity-q11",
      question: "What is zero trust?",
      answer:
        "It is an approach where no request is trusted just because of its network location. Each access decision is evaluated explicitly using identity, device health, and context, with least privilege and continuous monitoring. NIST SP 800-207 describes it as an architecture. It is not a single product, and it still depends on good identity hygiene, permissions, and segmentation.",
      checking: "Cutting through buzzwords.",
      difficulty: "warmup",
    },
    {
      id: "cloud-and-identity-q12",
      question: "Why does server-side request forgery (SSRF) matter so much in the cloud?",
      answer:
        "Cloud VMs can reach an instance metadata service at a link-local address (`169.254.169.254` on AWS) that can hand out temporary credentials for the machine's role. If an application has an SSRF flaw, an attacker may be able to make the server request those credentials and then use the role's permissions from anywhere. The 2019 Capital One breach is the widely cited example: public reporting describes SSRF through a misconfigured web application firewall, followed by use of the role's credentials to read S3 data. Mitigations include fixing the SSRF with strict destination allowlists, requiring IMDSv2 (which needs a session token obtained with a PUT request, blocking many simple SSRF attempts), and keeping the workload role's permissions minimal so stolen credentials can do little. OWASP's current Top 10:2025 folds SSRF into A01 Broken Access Control; in 2021 it was its own category, A10.",
      checking: "Connecting an application bug to cloud identity impact.",
      difficulty: "stretch",
    },
  ],
  lab: {
    title: "Map a fictional employee's identity lifecycle",
    steps: [
      "Work through selected free modules of Microsoft's Introduction to Microsoft Entra learning path, focusing on authentication, access management, and identity governance. No paid subscription or deployed resources are needed for the reading.",
      "Invent a fictional employee, for example a marketing analyst who later moves to finance and then leaves the company.",
      "Draw their joiner-mover-leaver lifecycle as a timeline or flowchart.",
      "At each stage, mark where **authentication** happens (SSO, MFA enrollment), where **provisioning** happens (account creation in apps, group membership, deprovisioning), where **authorization** decisions are made (roles, group-based access), and where **reviews** occur (manager or owner access reviews).",
      "For the mover step, list which access must be *removed*, not only added.",
      "For the leaver step, list at least five things to revoke or verify (for example: directory account, active sessions and refresh tokens, app-local accounts, API keys, shared secrets, devices).",
      "Write two sentences explaining one gap that could leave access behind and how you would detect it.",
    ],
    resourceIds: ["r44"],
    links: [],
  },
  resourceIds: ["r43", "r44", "r45", "r48", "r84"],
  extraLinks: [],
};
