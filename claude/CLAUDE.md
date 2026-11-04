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
- Read the project's environment notes before installing, building or
  running a tool there: the project often has its own way (a mirror, a
  shared folder, a script).
- Before building, check that the session can do the whole job: every repo
  the task changes can be reached, and so can the package registry and any
  other host the checks need. If not, stop and tell the user what to change
  (which repos to add, which network setting) before writing any code.
- Know what the session may do on the code host: push to the main line,
  delete or force-push branches. Where it can't, plan for pull requests, and
  tell the user exactly what is left for them to do by hand (e.g. which
  merged branches to delete).
- New apps, features and game rules start from a brief that the user
  approves before anything is built (see the next section).
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

## Ask before deciding — when the user describes something new
The user's plain description is not a full spec. The gaps in it are the
user's decisions, not the agent's.
- Before building, list every major decision the description leaves open,
  for example: what it does and for whom, rules and scoring, scope (in and
  out), screens and flow, the look, what data is kept or sent, free vs
  paid, platforms, new libraries or services. Major means visible to the
  user, hard to undo, or changing cost, scope, data, money or security.
- Ask them all in one round (the question tool where there is one). Give
  each 2–4 options with the trade-off, and mark a recommendation. Never
  pick one and build it to show afterwards.
- Small, reversible details: take the conventional default without asking,
  and list each one in the brief under "Decided by the agent" so the user
  can overrule it.
- Follow what the user already accepted elsewhere in the project: how a
  sibling part shows feedback, its controls, colours and layouts. Departing
  from it is a major decision, even for a small marker or icon detail.
- This applies to fixes and small changes too, not only new features. When
  a fix or request has more than one reasonable result, ask which one.
- Write the result as a brief file in the repo (the project's template if
  it has one): goal, what "done" is, behaviour or scoring, edge and abuse
  cases, a worked example with real values, and each decision marked "user"
  or "agent default".
- Anything with a screen: show it before writing app code. Use a mockup
  image or rendered page of each new or changed screen, with real-looking
  content and the worst case (`UI_UX.md` §15). Get the user's OK on the
  look along with the brief.
- Every brief item that changes a screen is drawn, or the report says it
  isn't.
- A restyle across many existing screens (a type or card change everywhere):
  mock up one representative screen for the decision, then show real
  renders of every changed screen before anything reaches the main line.
  Say so in the brief.
- After every change to a mockup: render it again, look at it, send the new
  image and say it replaces the old one (users often look at the first one
  sent).
- When the user points at something you can't find, describe what is in
  that spot and ask. Don't redraw on a guess.
- Use the user's own wording for labels and texts they gave, exactly.
- If the work needs a change to a shared contract or library (an SDK, an
  API, a message format), the brief names it, so it is agreed before
  building.
- Every change of mind updates, in the same commit, the brief's behaviour
  text, its decisions row (who decided, when) and the mockup.
- Build only after the user approves the brief (and mockups). A major
  decision that comes up mid-build and is not in the brief: stop and ask.
  Small ones: decide, and add them to the brief's "Decided by the agent".
- When the user says "you decide" for an item, decide it, mark it "agent"
  in the brief and the decisions file, and say so in the report.
- Every report lists the choices made without asking, under "Decided by
  the agent", so the user can overrule them before they ship.
- Prototype mode: ask only the questions that change what gets built. Skip
  mockups unless the user asks.

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
- Licences, versions and codepoints come from their primary source (the
  licence file, the registry, the font's own table), never from memory.
  Record where you checked.
- Compute a test's expected values and a brief's worked examples with the
  real code and data, not from what you believe the rule gives. When a test
  fails, check the expectation before changing the code.
- Check a fact in its source before writing it down: what a branch or build
  contains (git log, import records), what a config does (the config, not a
  sentence in the docs).
- Before saying "it works", run the path that fails too: no network, a full
  disk, a missing tool, a crash halfway.
- Do not claim a screen looks right without seeing it (screenshot or render).
- A check tool has blind spots too. When it shows something odd (text that
  didn't grow, a screen that never loads), find out whether the tool or the
  app is at fault before fixing either, and fix the tool when it is.
- An audit finding names where the user meets it. A string in the code is
  not a defect until it reaches a screen, a log or a message: trace it
  before listing it.

## Commands and scripts
- Gate a push, release or deploy on the check's exit code in the same
  command (`npm run check && git push`), never on reading a log, which may
  be stale or from another run.
- Don't push code that hasn't passed the check. If a hook forces a push
  anyway, say "not run through the check" in the commit message, in the
  changelog line and to the user.
- Never kill processes by a pattern that also matches your own command line
  (`pkill -f`, `pgrep -f … | xargs kill`). Kill by a PID or process group
  you started and saved.
- Guard destructive paths: `rm -rf "${DIR:?}/sub"`, never a bare variable.
- Scripted edits match the exact old text and assert it occurs once. Never
  edit by line number after other edits to the same file: the lines have
  moved.
- A script that changes shared state for a while (installs packages, edits
  config) puts it back in `trap` / `finally`, also when it fails, and checks
  that the restore itself worked.
- Never edit a file a running process is reading (a shell script mid-run:
  bash reads as it goes). Wait, or edit a copy and swap it in between runs.
- Don't run two heavy jobs that share files or the CPU at once (a build and
  a test run). A timing test that fails under load: re-run it alone, then
  decide whether it is flaky or real.
- A repeated manual procedure (a build, a screenshot pass) becomes a script
  in the repo, with its measured run time in its header.
- When the permission mode refuses a command (downloading or running an
  outside program, a force-push), don't look for a way around it. Say what
  it was for, and ask the user to switch the mode or run it themselves.
- Network workarounds (a blocked host, a rate limit): reproduce the exact
  failing request, try the fix on it, then rerun the whole job. Expect more
  than one cause (a redirect can lead back to the blocked host), and check
  whether filling a tool's list (mirrors, repositories) drops its defaults.
  A mirror only serves what it mirrors: when the failing artifact isn't
  there, the tool falls through to the next host in the list, so check
  where that artifact really lives and put that host before the blocked
  one.

## Review and delegation
- After every batch that changes code (not text-only changes), have a
  subagent on a cheap model review the diff with minimal context: only the
  diff and the rules files. Fix what it finds before pushing. (In prototype
  mode: only security-relevant code, see above.)
- When the batch changes a screen, the reviewer also gets the screenshots
  of the worst case (`UI_UX.md` §15): it cannot see layout from code.
- Keep reviews lean (they are the biggest cost after the session itself):
  give the reviewer the diff and only the guide sections that apply, ask
  for a short report, and review once per batch. Re-review fixes only when
  they add logic or touch security; small fixes you check yourself.
- Screenshots: look at the worst-case set; the normal-size set only when a
  question needs it. Downscale tall ones before viewing.
- Large, self-contained pieces of work (a data file, a new screen) may go
  to a subagent with an exact spec. The supervisor stays responsible: check
  its output against the spec and run the checks yourself. Small edits and
  integration stay with the supervisor.
- Check each reviewer finding against the code before acting on it; some
  are wrong or go against the user's own choice. Fix the real ones and say
  why the others were left.
- Treat each real finding as a class of bug: search for the same mistake
  elsewhere before fixing the one instance.
- When a hook asks to push before the review is done, push the work branch
  only. The main line waits for the review.

## Mistakes
- No apologies. Name the gap that let it happen (a missing rule, a missing
  check, an untested assumption) and add the fix in the same change: one
  line in the project's rules or environment notes, a test, or a checklist
  step. If the cause was simply wrong reasoning, say so plainly and still
  add a guard.
- A rule that was already written down and still missed goes into a tool, a
  test or a checklist step that blocks "done". Writing it down again is not
  a fix.

## Keeping a project manageable
- Decisions, rules and open items live in files in the repo, never only in
  chat. Update them in the same commit as the change they describe.
- Keep a human-readable `CHANGELOG.md` at the repo root: newest first, one
  section per build or release that reaches testers or users, and
  **Unreleased** on top. Write plain words, user-visible changes first,
  then internal ones (docs, CI, tooling, tests, refactors) under their own
  heading. Add the line in the same commit as the change. When a build
  ships, rename Unreleased to its number and date.
- One source of truth per fact; other files link to it. Where a text must
  exist in several places (app and server copies, store forms), search for
  every copy and change them all in the same batch, or add a test that they
  match.
- If a tool can enforce a rule (lint, test, script), put it there, not in prose.
- Prefer one session per feature; long sessions lose detail and every step
  re-sends the whole conversation, so cost grows with length. When a feature
  is done, make sure the repo's open-items file says where things stand;
  once it is merged (see "Sessions"), tell the user it is a good point to
  start a new session.

## Sessions
- A new session starts from the main line; it doesn't see another
  session's branch.
- Start work in any repo from its main line by name
  (`git fetch origin main && git checkout -B <branch> origin/main`). A
  clone's default branch can be another session's unmerged work.
- Never suggest starting a new session (or say "a new session can pick
  this up") until everything on this session's branch is merged into the
  main line. Before that, say which branch holds the work and offer to open
  a pull request. Once the user has merged it, check that the main line has
  it (`git fetch origin main` and compare) before suggesting a new session.
- If a new session must start before the merge, tell the user to have it
  work from this session's branch, by name.
- When more than one session works on a project: take numbers that must be
  unique (build numbers, versions) from one file on the main line, and push
  them there.
- Before building on another session's work, find which branch it was
  pushed to. Bring in only what you need, and say what you left out.
- A commit that one repo records from another (an import, a vendored copy)
  must be on the source repo's main line. Check it (`git merge-base
  --is-ancestor`) before importing, or the next import from the main line
  silently drops it.
- A branch whose pull request is merged is finished: for new work, start it
  again from the main line.
- Merging into the main line needs the user's word; "open and merge" covers
  both. Several open pull requests that each add a changelog line conflict:
  merge them one at a time, merging the main line into the next one first
  (keep both lines, run the check).

## Reporting
- End every piece of work with: what changed, what was checked, what was
  not checked (e.g. "not seen on a real phone"), what is still open, and
  whether testers need a new build.
- "Not checked" is a list, not a summary: every validation step of the
  guides that applies to the work (e.g. `UI_UX.md` §15, `SECURITY.md`'s
  sections, `LEGAL.md` §6) appears in the report, each marked done or not
  done. A step is never left out silently.
