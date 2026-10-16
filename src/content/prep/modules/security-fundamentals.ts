import type { Module } from "../types";

export const prepModule: Module = {
  id: "security-fundamentals",
  number: 4,
  title: "Explain the Security Building Blocks",
  hook: "State what a control protects and what it cannot promise.",
  hours: 4,
  tracks: ["ALL"],
  objectives: [
    "Apply CIA and AAA to concrete systems.",
    "Distinguish encryption, hashing, encoding, and signatures.",
    "Explain password storage and basic PKI.",
    "Evaluate controls through their actual security properties.",
  ],
  lesson: [
    { type: "h", text: "Start with the asset: the CIA triad" },
    {
      type: "p",
      text: "The CIA triad describes **confidentiality**, **integrity**, and **availability**. Confidentiality concerns inappropriate disclosure, integrity concerns unauthorized or improper change, and availability concerns dependable access when needed.",
    },
    {
      type: "callout",
      tone: "example",
      title: "One system, three properties",
      text: "Picture a student records system. Grades should remain private (confidentiality), changes should be authorized and accurate (integrity), and students should be able to reach the service during registration week (availability). A ransomware attack can hit all three at once: data is stolen, files are altered, and the service goes down.",
    },
    {
      type: "p",
      text: "Security decisions often involve tradeoffs. Locking an account after a few failed logins protects confidentiality but can hurt availability if an attacker deliberately locks everyone out. So begin with the asset and the consequence you are trying to prevent, then pick the control.",
    },
    { type: "h", text: "Who are you, what may you do, and what did you do: AAA" },
    {
      type: "p",
      text: "AAA means **authentication**, **authorization**, and **accounting**. Authentication checks an identity claim, authorization decides whether that identity may perform a particular action, and accounting records activity. A valid login does not authorize access to every record.",
    },
    {
      type: "diagram",
      caption: "Each AAA step can fail independently",
      lines: [
        "identity established  →  action requested  →  permission evaluated  →  activity recorded",
        "  (authentication)          (request)           (authorization)           (accounting)",
      ],
    },
    {
      type: "p",
      text: "Useful logs identify the relevant **principal** (who), **action** (what), **resource** (on what), and **result** (allowed or denied, success or failure). If one of those is missing, an investigator later has to guess.",
    },
    { type: "h", text: "Encryption, hashing, encoding, and signatures" },
    {
      type: "p",
      text: "**Encryption** transforms plaintext into ciphertext using an algorithm and key, and an authorized party can reverse it with the corresponding key. **Symmetric** encryption uses shared secret key material (for example AES). **Asymmetric** systems use related public and private keys (for example RSA or elliptic-curve schemes). Modern systems combine primitives for different purposes: TLS, for instance, uses asymmetric cryptography to authenticate the server and agree on keys, then fast symmetric encryption for the bulk of the data.",
    },
    {
      type: "callout",
      tone: "warning",
      title: "A common misstatement",
      text: "Do not describe every asymmetric operation as \"encrypting with the private key.\" Digital signatures have their own algorithms and security properties. Say \"the sender signs with the private key and anyone with the public key can verify the signature.\"",
    },
    {
      type: "p",
      text: "A **cryptographic hash** produces a fixed-size digest designed to make inversion and finding collisions computationally difficult. Hashing is not encryption and has no decryption key. **Encoding**, such as Base64, only changes representation and provides no secrecy. A digest can help confirm evidence integrity, but an attacker who can replace both a file and its published digest may defeat a naive check. Trust in the reference value matters.",
    },
    {
      type: "code",
      lang: "text",
      caption: "Change one character and compare. Base64 barely changes and decodes instantly; the SHA-256 digest changes completely and cannot be reversed with a key.",
      code: `input   Base64     SHA-256
hello   aGVsbG8=   2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
hellp   aGVsbHA=   fdd7585e08c4e2afd71dcabdb4636c89d557a3f42db9e2040c8bbd1708aa4ce7`,
    },
    {
      type: "list",
      items: [
        "**Encoding** (Base64, URL encoding): changes format. No key. Anyone can reverse it.",
        "**Hashing** (SHA-256): one-way digest. No key. Same input always gives the same output.",
        "**Encryption** (AES, RSA-OAEP): reversible with the right key. Protects confidentiality. On its own it does not prove the data was not tampered with, so modern systems use authenticated encryption such as AES-GCM or ChaCha20-Poly1305.",
        "**MAC** (HMAC-SHA256): a keyed digest. Anyone holding the shared secret can create or check it, so it proves integrity and origin between parties who share the key, but not to outsiders.",
        "**Signature** (ECDSA, Ed25519, RSA-PSS): created with a private key, verified with a public key. Supports integrity and authenticity, not secrecy.",
      ],
    },
    { type: "h", text: "Storing passwords safely" },
    {
      type: "p",
      text: "Password storage requires a dedicated, deliberately expensive **password-hashing scheme** with unique salts. A fast general-purpose hash such as SHA-256 alone allows rapid guessing after a database leak, because attackers can try billions of candidates on commodity GPUs. OWASP currently recommends Argon2id, with scrypt, bcrypt, and PBKDF2 as alternatives depending on constraints (PBKDF2 where FIPS compliance is required).",
    },
    {
      type: "p",
      text: "**Salts** are normally stored alongside the resulting hashes and prevent identical passwords from producing identical stored values under the same parameters. That defeats precomputed lookup (rainbow) tables and hides which users share a password. Salts do not make weak passwords unguessable. Use established libraries and current guidance, such as the [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html), rather than designing cryptography yourself.",
    },
    { type: "h", text: "PKI and TLS: trusting a public key" },
    {
      type: "p",
      text: "**PKI** connects identities and public keys through certificates and trust relationships. When validating a server certificate, a client checks the hostname, validity period, trust chain up to a root it already trusts, and other applicable rules such as permitted key usage and, where the client checks it, revocation status.",
    },
    {
      type: "diagram",
      caption: "A typical certificate chain the browser validates",
      lines: [
        "Root CA (pre-installed in OS/browser trust store)",
        "   │ signs",
        "   ▼",
        "Intermediate CA certificate (sent by the server)",
        "   │ signs",
        "   ▼",
        "Leaf certificate for www.example.com (hostname, validity dates, public key)",
      ],
    },
    {
      type: "p",
      text: "TLS uses these mechanisms to protect a connection in transit, but it does not guarantee that the application is honest or free of vulnerabilities. A phishing site can have a perfectly valid certificate. Key storage, rotation, revocation, and recovery are operational parts of cryptographic security, not optional details after choosing an algorithm.",
    },
    { type: "h", text: "MFA and phishing resistance" },
    {
      type: "p",
      text: "**MFA** combines different factor types: something you know (password), something you have (security key, phone), and something you are (biometric). Two passwords remain one factor type. Some methods resist phishing better than others. FIDO2/WebAuthn credentials, including passkeys and hardware security keys, are bound to the legitimate site's origin, so a look-alike site cannot reuse them the way it can relay a one-time code that a user types in.",
    },
    {
      type: "p",
      text: "Current U.S. guidance reflects this. [NIST SP 800-63B-4](https://csrc.nist.gov/pubs/sp/800/63/b/4/final) (2025) requires services at its middle assurance level (AAL2) to offer at least one phishing-resistant option, requires a phishing-resistant authenticator at AAL3, and still classifies one-time codes sent by SMS or voice call as a *restricted* authenticator. You do not need to memorize assurance levels for an internship interview, but knowing that SMS is the weakest common second factor is worth it.",
    },
    {
      type: "callout",
      tone: "interview",
      title: "Say it like this",
      text: "\"I would choose a control based on the threat, its security properties, and its operational limits, then verify that the implementation actually provides those properties.\"",
    },
  ],
  sayItLikeThis:
    "\"I start with the asset and the harm I want to prevent, then map it to confidentiality, integrity, or availability. I keep authentication, authorization, and accounting separate, because a valid login is not permission. I am careful with terms: encoding changes format, hashing is one-way, encryption is reversible with a key, and signatures prove integrity and authenticity relative to a trusted public key. For passwords I would use a slow, salted password-hashing scheme like Argon2id from a trusted library, and for MFA I would prefer phishing-resistant methods like FIDO2 security keys or passkeys. For any control, I state what it protects and what it cannot promise.\"",
  terms: [
    { term: "Confidentiality", definition: "Protection against inappropriate disclosure." },
    { term: "Integrity", definition: "Protection against unauthorized or improper change." },
    { term: "Availability", definition: "Dependable access to services and information when needed." },
    { term: "Authentication", definition: "Verification of an identity claim." },
    { term: "Authorization", definition: "Decision about which actions an identity may perform on which resources." },
    { term: "Accounting", definition: "Recording activity so actions can be reviewed and attributed later." },
    { term: "Encoding", definition: "A reversible change of representation (such as Base64) that provides no secrecy." },
    { term: "Hash", definition: "Fixed-size digest produced by a one-way cryptographic hash function." },
    { term: "Salt", definition: "Unique per-password value stored with the hash so identical passwords produce different stored results." },
    { term: "Digital signature", definition: "Value created with a private key that anyone with the matching public key can verify, supporting integrity and authenticity." },
    { term: "MAC (message authentication code)", definition: "Keyed digest, such as HMAC-SHA256, that lets parties sharing a secret key detect tampering and confirm origin." },
    { term: "PKI", definition: "System of certificates, keys, certificate authorities, and trust relationships." },
    { term: "Phishing-resistant MFA", definition: "Authentication, such as FIDO2/WebAuthn, that is bound to the legitimate service so credentials cannot simply be relayed by a fake site." },
  ],
  questions: [
    {
      id: "security-fundamentals-q1",
      question: "What is the difference between hashing and encryption?",
      answer:
        "Encryption is two-way: anyone with the right key can turn the ciphertext back into the original data, so I use it when the system must read the data later, like a stored bank account number or traffic over TLS. Hashing is one-way: it produces a fixed-size digest with no key and no way to decrypt it, so I use it to check integrity, for example comparing a downloaded file against a published SHA-256 value. Passwords are a special case: the system only needs to verify them, never read them back, so they should be hashed, but with a deliberately slow, salted algorithm like Argon2id or bcrypt rather than plain SHA-256.",
      checking: "Correct properties and use cases.",
      difficulty: "warmup",
    },
    {
      id: "security-fundamentals-q2",
      question: "Is Base64 encryption?",
      answer:
        "No, Base64 is an encoding that changes representation. Anyone who recognizes it can generally decode it without a secret. It should not be used as a confidentiality control.",
      checking: "Basic terminology.",
      difficulty: "warmup",
    },
    {
      id: "security-fundamentals-q3",
      question: "Why salt password hashes?",
      answer:
        "A unique random salt per password means two users with the same password get different stored hashes, so a leak does not reveal who shares a password. It also makes precomputed rainbow tables useless and forces an attacker to crack each hash separately. Salts are not secret and do not make a weak password strong, so salting has to be paired with a slow password-hashing algorithm like Argon2id or bcrypt, which is what actually limits how fast an attacker can guess.",
      checking: "Benefits and limitations.",
      difficulty: "core",
    },
    {
      id: "security-fundamentals-q4",
      question: "What is the CIA triad?",
      answer:
        "It describes confidentiality, integrity, and availability. For a medical scheduling system, examples are protecting patient details, preventing unauthorized appointment changes, and keeping scheduling accessible. I would use the business consequences to prioritize controls.",
      checking: "Application of concepts.",
      difficulty: "warmup",
    },
    {
      id: "security-fundamentals-q5",
      question: "What is the difference between authentication and authorization?",
      answer:
        "Authentication establishes confidence in an identity claim. Authorization evaluates whether that identity may take a specific action on a specific resource. An authenticated student should still be denied access to another student's private records.",
      checking: "Access-control reasoning.",
      difficulty: "warmup",
    },
    {
      id: "security-fundamentals-q6",
      question: "What does a digital signature provide?",
      answer:
        "A valid signature shows that the data has not changed since it was signed and that it was signed by whoever controls the matching private key. That is why operating systems check signatures on software updates. It does not encrypt the message, and it does not prove the content is true. Its value also depends on trusting the public key, usually through a certificate, and on the private key not having been stolen.",
      checking: "Signature guarantees.",
      difficulty: "core",
    },
    {
      id: "security-fundamentals-q7",
      question: "What is MFA?",
      answer:
        "MFA requires factors from more than one category: something you know, something you have, and something you are. A password plus a hardware security key combines knowledge and possession, while a password plus a security question is still just two things you know. When choosing a method I would weigh phishing resistance, with FIDO2 security keys or passkeys at the strong end and SMS codes at the weak end, plus account recovery, because a weak recovery flow can bypass strong MFA.",
      checking: "Factors and implementation judgment.",
      difficulty: "warmup",
    },
    {
      id: "security-fundamentals-q8",
      question: "Why is a file hash useful in forensics?",
      answer:
        "It helps compare whether collected data has changed relative to a recorded reference. I would record the algorithm, value, and collection context. The hash alone does not establish provenance, ownership, or truthfulness of the contents.",
      checking: "Evidence integrity without overclaiming.",
      difficulty: "core",
    },
    {
      id: "security-fundamentals-q9",
      question: "What is the difference between symmetric and asymmetric encryption, and where would you see each?",
      answer:
        "Symmetric encryption uses the same secret key to encrypt and decrypt, like AES, and it is fast, so it protects bulk data. Asymmetric cryptography uses a public and private key pair, like RSA or elliptic-curve schemes, which solves the problem of establishing trust and keys with someone you have never shared a secret with. Real protocols combine them: in TLS, asymmetric cryptography authenticates the server and helps agree on session keys, and then symmetric encryption protects the traffic.",
      checking: "Whether you understand why both exist and how protocols combine them, not just definitions.",
      difficulty: "core",
    },
    {
      id: "security-fundamentals-q10",
      question: "A site shows the padlock icon. Does that mean it is safe?",
      answer:
        "Not by itself. The padlock means the connection uses TLS and the certificate validated for that hostname, so traffic is protected in transit from eavesdropping and tampering. It says nothing about whether the site is legitimate or the application is secure. Phishing sites routinely get valid certificates for look-alike domains, and a TLS-protected app can still have SQL injection or broken access control.",
      checking: "Understanding the exact guarantee of TLS and not overclaiming what a control provides.",
      difficulty: "core",
    },
    {
      id: "security-fundamentals-q11",
      question: "Explain least privilege and defense in depth with an example.",
      answer:
        "Least privilege means each user, service, or process gets only the access it needs, for only as long as it needs it. Defense in depth means layering independent controls so one failure does not cause a full compromise. For a web app, the database account should only have the permissions the app actually uses, the app should use parameterized queries, MFA should protect admin logins, and logging should catch anomalies. If one layer fails, the others still limit the damage.",
      checking: "Ability to apply core design principles concretely rather than reciting slogans.",
      difficulty: "core",
    },
    {
      id: "security-fundamentals-q12",
      question: "Why are SMS codes considered weaker than a FIDO2 security key or passkey?",
      answer:
        "An SMS code can be phished, because a user can be tricked into typing it into a fake site that relays it to the real one in real time. SMS can also be intercepted through SIM swapping. A FIDO2/WebAuthn credential is bound to the legitimate site's origin, so the authenticator will not produce a valid response for a look-alike domain. SMS is still better than a password alone, but phishing-resistant methods are preferred for high-value accounts, and NIST SP 800-63B-4 still classifies SMS and voice one-time codes as a restricted authenticator.",
      checking: "Knowledge of phishing resistance and realistic attacker techniques against MFA.",
      difficulty: "stretch",
    },
  ],
  lab: {
    title: "Compare encoding and hashing in CyberChef",
    steps: [
      "Open CyberChef in your browser. Use only synthetic text, never a real password.",
      "Type a sample input such as `practice-password-1` into the Input pane.",
      "Drag the **To Base64** operation into the Recipe and note the output. Then add **From Base64** after it and confirm you get the original text back with no key.",
      "Clear the recipe and add **SHA2** (set it to 256 bits). Record the digest.",
      "Change exactly one character of the input and record the new Base64 output and the new digest. Notice how much of each output changed.",
      "Hash the original input a second time and confirm the digest is identical. Think about what that means if two users choose the same password and the system stores a plain unsalted hash.",
      "Optional: search the operations list for **Bcrypt**, hash the same input twice, and notice that the outputs differ because each run uses a new random salt.",
      "Write one paragraph explaining why neither observation by itself demonstrates secure password storage. Mention salts, deliberately slow password-hashing algorithms, and why Base64 offers no secrecy.",
    ],
    resourceIds: ["r33"],
    links: [],
  },
  resourceIds: ["r20", "r49", "r13", "r84"],
  extraLinks: [],
};
