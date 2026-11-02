# Launch checklist (every project)

How to use it:
- Read it when planning a new project (to choose what it will need) and
  before a release (to check what it has).
- Skip the sections whose "When" doesn't apply.
- Security items live in `SECURITY.md`; this file links to them and never
  repeats them.
- Project rules may rule items out or be stricter (e.g. a project that
  forbids analytics has none); a real conflict goes to the user.
- In the release report, list what was checked, what doesn't apply, and
  what is knowingly left out.

---

## 1. Testing — always

- **Unit tests** for logic: rules, scoring, parsing, money, dates. Keep logic
  in pure functions so it can be tested without screens.
- **A regression test for every fixed bug,** written to fail before the fix.
- **Smoke tests:** the main flows end to end (start, play or buy, finish) and
  every server endpoint answering, run in CI.
- **Content checks:** rules about data (word lists, puzzles, configs) written
  as tests, not hoped for.
- **Devices** (apps, responsive sites):
  - a small and a large phone, an old Android version, a tablet if supported;
  - light and dark mode; the largest text size; landscape if supported.
- **Slow and broken networks:**
  - throttled (3G), offline, the connection dropping in the middle of an
    action, the server down;
  - nothing hangs, nothing is lost silently, and the user is told what
    happened.

## 2. Delivery — when there is more than a local prototype

- **CI on every push:** typecheck, lint, tests, the dependency audit and
  secret scan (`SECURITY.md` §4, §10).
- **CD:** deploys come from CI or the platform, never from a laptop.
  Releases are reproducible from a commit.
- **Staging:** once real users exist, a staging environment (or preview
  deploys) with its own data and keys, used before production.
- **Rollback:** see `SECURITY.md` §8. Know the exact command or button
  before you need it.
- **Mobile:** a staged rollout on the stores; tester builds before store
  builds; old app versions keep working with the server (version the API
  and messages).
- **Domain:** a custom domain with SSL (automatic renewal), redirects
  between `www` and the bare domain, HSTS (`SECURITY.md` §7).

## 3. Observability — when there is a server or real users

- **Error tracking** (crashes and exceptions, client and server), with
  releases tagged. Strip personal data before sending.
- **Logging:** structured, with request ids, and a retention period. Never
  log secrets or personal data (`SECURITY.md` §9).
- **Uptime monitoring:** an external check of the main endpoint, which
  alerts someone.
- **Performance monitoring:** response times, slow queries, app start time,
  bundle size; a budget for each that matters.
- **Alerting:** on errors, downtime, spikes in traffic or cost, failed
  backups. Alerts go to a person who will see them; few, and each one
  actionable.
- **Analytics:** only if the project needs and allows it. Decide what
  question it answers; prefer privacy-friendly, cookieless tools; disclose
  it in the privacy policy.

## 4. Data — when anything is stored

- **Backups and restore tests:** `SECURITY.md` §6.
- **Indexes** for the main queries; check query plans before traffic grows.
- **Migrations:** versioned and reversible; saved formats versioned, with old
  data migrated or rejected clearly.
- **Spending caps and billing alerts:** `SECURITY.md` §5.

## 5. States and UX — always, for anything with a screen

- **Every screen has its states designed:** loading, empty, error, offline,
  and success. No blank screens and no endless spinners.
- **Web:** real 404 and 500 pages, with a way back.
- **Errors say what happened and what to do next,** in the user's language.
- **Accessibility and look-and-feel:** follow `UI_UX.md`.

## 6. Web — when there is a public website

- **SEO:**
  - unique titles and meta descriptions;
  - a `sitemap.xml`, and a `robots.txt` that doesn't block what should be
    found;
  - canonical URLs;
  - structured data (JSON-LD) for the content type;
  - correct `lang`.
- **AEO** (answer engines, AI search): clear headings, direct answers near
  the top, structured data, crawlable content without JS-only rendering,
  and an `llms.txt` if it helps.
- **Sharing:** OG and Twitter card tags and images (1200×630), a favicon and
  app icons, a web manifest.
- **Images:** modern formats (WebP/AVIF), correct sizes, lazy loading,
  dimensions set (no layout shift).
- **Caching:** long cache for fingerprinted assets, short or none for HTML
  and API data; a CDN for static files.
- **Core Web Vitals** checked (Lighthouse or PageSpeed) on a mid-range phone.

## 7. Email — when the product sends email

- **SPF, DKIM and DMARC** on the sending domain (start DMARC at `p=none`,
  then tighten). Without them, mail lands in spam, and the domain can be
  spoofed.
- **Password reset and email verification actually arrive** and work end to
  end, from a fresh account, with mail from a real provider (security rules:
  `SECURITY.md` §2).
- **Unsubscribe** for anything that isn't transactional.

## 8. AI features — when the product calls an LLM

- **Evals:** a fixed set of real inputs with expected outputs or grading
  rules, run on every prompt or model change. Track the score.
- **Prompt injection:** test with hostile inputs; the rules are in
  `SECURITY.md` §3.
- **Fallback when the model API is down or slow:**
  - timeouts, retries with backoff;
  - a clear message or a degraded mode;
  - never a hang.
- **Token limits:** count or estimate tokens; trim, summarise or chunk long
  inputs; handle "context too long" and cut-off output on purpose.
- **Cost:** a cap per user and per day (`SECURITY.md` §5); the cheaper model
  for simple steps.

## 9. Legal and privacy — when there are users

- Follow `LEGAL.md`: published documents (privacy policy, terms, refunds,
  business details), consent and children, other products' names and
  looks, third-party assets and data, honest listings, and its release
  checklist.

## 10. Docs — always

- **A README:** what it is, how to run it, test it and deploy it. Agents get
  the project's `AGENTS.md` and docs folder (decisions, open items,
  environment, release).
- Keep them current in the same commit as the change.
