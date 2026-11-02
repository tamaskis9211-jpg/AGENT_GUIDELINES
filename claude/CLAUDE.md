# How to work (every project)

These rules apply in every repository. A project's own `AGENTS.md` /
`CLAUDE.md` adds what is specific to it. Project rules add to these and may be stricter or rule items out (e.g. no
analytics); they never weaken a security rule. Where they truly conflict,
ask the user before acting. The same applies
when two rules here conflict.

## Guides (read when the task needs them)
- Before touching auth, accounts, secrets, the network, payments, user data,
  file handling, deployments or anything public on the web: read
  `~/.claude/guides/SECURITY.md` and check the sections that apply.
- When planning a new project, and before a release: read
  `~/.claude/guides/LAUNCH.md`.
- Before building or changing any screen, page or flow: read
  `~/.claude/guides/UI_UX.md`.
- When planning a product, adding a third-party asset or dataset, writing
  store or marketing texts, and before a release: read
  `~/.claude/guides/LEGAL.md`.
- Skills in `~/.claude/skills/` come from the guidelines repo (its
  `claude/skills/SOURCES.md`). Never install a skill with `npx skills add` or
  another installer: copy only the files it needs, after reading them, into
  that repo.
- The reviewer subagent (below) gets `SECURITY.md` whenever the batch
  touches any of those areas, and `UI_UX.md` (its checklist) whenever the
  batch changes a screen.

## Plan, then act
- Before changing anything, list every file the task touches and read them
  in one pass. Write the plan, then make all the edits, then run the checks
  once per finished batch (re-run only after fixing a failure).
- New features and game rules start from a short brief (goal, how it ends
  or what "done" is, scoring or behaviour, edge and abuse cases, a worked
  example). Get the user's OK on the brief before building.
- At a project's start (and before any major upgrade), check the current
  stable versions of the main framework and key libraries (measure it,
  e.g. `npm view <pkg> dist-tags` and release dates). Present the options
  with their trade-offs and a recommendation; the user decides which
  version to use. Record the choice and its reason in the decisions file.
- Say where the work sits between "quick and dirty" and "production grade",
  and engineer to that. Money, saved data, security and networking are
  always production grade.
- Prototype mode (the user calls it quick and dirty): a one-paragraph brief
  is enough; `LAUNCH.md` only for the parts the user picks; the reviewer
  only for security-relevant code. `SECURITY.md` rules still apply to
  anything real users or real money touch.

## The queue
- Keep all work as a visible task list. New requests and corrections go to
  the end of the list; do not drop the current item to jump to them.
- A correction that makes queued work obsolete: edit or remove those items
  instead of building them and redoing them.
- Stop only when the list is empty.

## Scope
- You Aren't Gonna Need It: build only what was asked. Never widen scope
  without permission.
- Do suggest improvements that make sense, in one line each, and let the
  user decide.
- Every change must be justifiable by the request or a real defect.

## Measure, don't guess
- Look values up in their source (font tables, API docs, config), write a
  tiny test for an assumption, compute examples. Measure twice, do the work
  once.
- Do not claim a screen looks right without seeing it (screenshot or render).

## Review and delegation
- After every batch that changes code (not text-only changes), have a
  subagent on a cheap model review the diff with minimal context: only the
  diff and the rules files. Fix what it finds before pushing. (In prototype
  mode: only security-relevant code, see above.)
- When the batch changes a screen, the reviewer also gets the screenshots
  of the worst case (`UI_UX.md` §15): it cannot see layout from code.
- Large, self-contained pieces of work (a data file, a new screen) may go
  to a subagent with an exact spec. The supervisor stays responsible: check
  its output against the spec and run the checks yourself. Small edits and
  integration stay with the supervisor.

## Mistakes
- No apologies. Name the gap that let it happen (a missing rule, a missing
  check, an untested assumption) and add the fix in the same change: one
  line in the project's rules or environment notes, a test, or a checklist
  step. If the cause was simply wrong reasoning, say so plainly and still
  add a guard.

## Keeping a project manageable
- Decisions, rules and open items live in files in the repo, never only in
  chat. Update them in the same commit as the change they describe.
- One source of truth per fact; other files link to it.
- If a tool can enforce a rule (lint, test, script), put it there, not in prose.
- Prefer one session per feature; long sessions lose detail.

## Reporting
- End every piece of work with: what changed, what was checked, what was
  not checked (e.g. "not seen on a real phone"), what is still open, and
  whether testers need a new build.
- "Not checked" is a list, not a summary: every validation step of the
  guides that applies to the work (e.g. `UI_UX.md` §15, `SECURITY.md`'s
  sections, `LEGAL.md` §6) appears in the report, each marked done or not
  done. A step is never left out silently.
