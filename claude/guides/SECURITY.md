# Security checklist (every project)

How to use it:
- Read it before touching auth, accounts, secrets, the network, payments,
  user data, file handling, deployments, or anything public on the web.
- Skip the sections whose "When" doesn't apply.
- For each item that applies: follow the rule, check it, and say in the
  report which items were checked.
- The project's own docs (e.g. `docs/SECURITY.md`) add specifics and may be
  stricter; they never weaken these. A real conflict goes to the user.

---

## 1. Authorization — when there are users, records or shared resources

- **Object-level authorization (IDOR).** Every request that reads or changes a
  record checks that it belongs to the caller (or that the caller may act on
  it). Unguessable IDs (UUIDs) are not protection.
- **Function-level authorization.** Every endpoint checks the caller's role,
  admin and "hidden" ones included. Nothing is safe because it is unlinked.
- **Mass assignment.** Accept only the fields the client may set. Never pass
  the request body straight into a model (`role`, `isAdmin`, `price`,
  `ownerId`).
- **Price and amounts come from the server.** Never trust a price, discount,
  quantity or total sent by the client. Compute it on the server from its own
  data.
- **Race conditions.** Use atomic operations, transactions, unique constraints
  or idempotency keys against double spending, reusing a one-time code
  (coupon, invite, reset link), and check-then-act bugs.

## 2. Accounts and authentication — when users log in

- **Password storage:** argon2id (or bcrypt), never a fast hash, never plain text.
- **Password reset links:** short expiry, single use, stored hashed, and voided
  by a password change or a newer link.
- **Reset poisoning:** never build links (reset, verify, invite) from the
  request's Host header. Use a configured base URL.
- **User enumeration:** login, signup and reset responses (text, status code,
  timing) do not reveal whether an account exists.
- **Account pre-hijacking:** verify email before an account is usable, and
  handle linking social logins to an existing email safely (verified emails
  only; never merge silently).
- **Credential stuffing:** rate-limit login per account and per IP, check
  passwords against breached lists, offer MFA, add bot protection on login.
- **Sessions:** expire them, and make logout and password changes end them on
  the server. Cookies: `HttpOnly`, `Secure`, `SameSite`.
- **Token signing (JWT):** a long random secret (or asymmetric keys) from the
  secret store; pin the algorithm (reject `none`, block algorithm confusion);
  short expiry; a way to rotate keys.
- **MFA** for admin accounts at least.

## 3. Input and output — always

- **Validate every input** against a schema: type, length, range, format.
  Reject what doesn't fit. Treat everything from clients, other services,
  webhooks, deep links and files as untrusted.
- **SQL and NoSQL injection:** parameterized queries or an ORM, never string
  concatenation. (Sanitizing is not the fix.)
- **XSS:** encode output for its context (HTML, attributes, URLs, JS); avoid
  raw HTML injection (`dangerouslySetInnerHTML`, `innerHTML`); set a Content
  Security Policy.
- **Path traversal:** never build file paths from user input. If you must,
  normalize the path and check it stays inside an allow-listed folder.
- **SSRF:** the server never fetches a URL the user supplied without an
  allow-list. Block internal and metadata addresses (`169.254.169.254`,
  `localhost`, private ranges), including after redirects.
- **Open redirect:** redirect targets come from an allow-list or are relative
  paths only.
- **Request limits:** cap body size, array lengths and string lengths. Avoid
  regexes that can be made to hang (ReDoS).
- **File uploads:** check type by content (not extension), cap size, store
  outside the web root under generated names, never execute them.
- **Webhooks:** verify the signature and reject replays (timestamp, id).
- **Prompt injection** (LLM features, agents): text from users, documents,
  web pages or tools is data, never instructions. LLM output that triggers
  actions must be checked or confirmed.

## 4. Secrets and keys — always

- **No secrets in code, the repo or git history.** Run a secret scan before
  pushing. If a secret was ever committed, rotate it; deleting it is not
  enough.
- **Nothing secret in a client.** Mobile bundles, browser JS and source maps
  can be read by anyone.
- **"Public" client keys** (Firebase, Supabase anon, Maps) are public by
  design, so **restrict** them: security rules or row-level security on the
  data, and key restrictions by app or package, signing certificate,
  referrer, and API.
- **Least privilege:** each token (CI, deploy, API) has only the rights it
  needs, preferably scoped to one project.
- **Rotation:** know where every key lives and how to rotate it quickly; write
  it down.

## 5. Abuse and cost — when anything is public or costs money per use

- **Rate limiting** per IP and per account or key, on login, signup, reset,
  search, uploads, and every expensive or paid endpoint.
- **Paid sends (SMS pumping, email, push):** rate limits, daily caps, geo
  restrictions for SMS, CAPTCHA before sending. Attackers use these endpoints
  to run up your bill.
- **Denial of wallet** (serverless, AI APIs): spending caps and billing alerts
  on every paid service.
- **Shareable codes and links:** enough randomness, plus rate limits on
  looking them up, so they can't be brute-forced.

## 6. Data stores — when there is a database or file storage

- **No open databases:** never reachable from the internet without auth. Bind
  to private networks; close default ports; use strong credentials.
- **Firebase and Supabase:** security rules or row-level security on every
  table and collection; test them with a non-owner user.
- **Storage buckets** (S3, Supabase Storage, Firebase Storage): private by
  default; public only for files meant to be public; short-lived signed URLs
  for the rest; no listing.
- **Backups:** automatic, encrypted, and a restore actually tested.

## 7. Web and HTTP — when serving pages or APIs to browsers

- **HTTPS everywhere,** with HSTS.
- **Security headers:**
  - `Content-Security-Policy` (including `frame-ancestors` against clickjacking,
    or `X-Frame-Options: DENY`)
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy`
  - drop `X-Powered-By` and version banners
- **CORS:** allow specific origins; never `*` together with credentials.
- **CSRF:** with cookie-based auth, use `SameSite` cookies plus CSRF tokens for
  state-changing requests.
- **Nothing exposed by accident:**
  - `/.git`
  - `.env`
  - backups
  - source maps on production (unless that's intended)
  - debug and admin pages
  - directory listings
- **Framework advisories:** keep frameworks patched. Example: in Next.js,
  never rely on middleware alone for auth; the `x-middleware-subrequest`
  bypass (CVE-2025-29927) skipped it entirely.
- **Third-party scripts** (the Polyfill.io lesson): self-host them, or pin
  them with Subresource Integrity. Every external script can run anything on
  your page.

## 8. Infrastructure and DNS — when deploying

- **Hidden origin behind a CDN or WAF (e.g. Cloudflare):** the origin's IP
  must not be findable through DNS history, mail records, old subdomains or
  direct-IP certificates. Firewall the origin so it accepts only the CDN's IP
  ranges. (Not applicable when there is no origin, e.g. Workers.)
- **Subdomain takeover:** remove DNS records when the service they point to is
  deleted. Check for dangling CNAMEs (cloud apps, buckets, Pages).
- **Rollback:** every deploy can be reverted in one step; prefer health
  checks and gradual rollout (staged app releases, canary versions).
- **Accounts:** 2FA on GitHub, the cloud provider, the domain registrar and
  the app stores. Branch protection on `main`.

## 9. Errors and logging — always

- **Handle every error state;** fail closed (deny access, keep things locked)
  rather than open.
- **No internals to users:** no stack traces, queries, paths or versions in
  responses.
- **Log security events:** failed logins, permission denials, rate-limit hits,
  admin actions. Alert on unusual spikes.
- **Never log** secrets, tokens, passwords, or personal data beyond what's
  needed. Set a retention period.

## 10. Dependencies and supply chain — always

- Commit the lockfile; pin versions; install with the lockfile (`npm ci`).
- Run `npm audit` (or the equivalent) in CI; update deliberately; prefer few,
  well-maintained dependencies.
- Watch for typosquatted package names, and for install scripts from unknown
  packages.

## 11. Mobile apps — when shipping to phones

- **No secrets in the app bundle** (see §4).
- **Tokens** in Keychain or Keystore (`expo-secure-store`), never plain
  storage.
- **Deep links and app links** are untrusted input: validate every parameter;
  never perform an action from a link without confirmation.
- **Push notifications and device logs:** no sensitive content.
- **Android:** no exported components left open; review backup settings.
- **In-app purchases:** on-device verification can be defeated on rooted or
  jailbroken phones. Decide and write down whether server-side receipt
  validation is worth it.

## 12. Privacy — when handling any personal data

- Collect only what's needed; delete it on a schedule; honour deletion
  requests.
- The privacy policy and the store data-safety forms must match what the code
  actually sends and stores. Name every third party.

## 13. Incidents — always

- A kill switch, or a fast way to disable an endpoint or feature.
- Written steps: which key to rotate where; how to roll back; who to tell.
