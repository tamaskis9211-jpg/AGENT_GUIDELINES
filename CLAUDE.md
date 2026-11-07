# This repository: the user's general agent guidelines

It holds the rules that apply to every project, not the code of one.

- `claude/CLAUDE.md`: how to work (always loaded once installed).
- `claude/guides/`: `SECURITY.md`, `LAUNCH.md`, `UI_UX.md`, `LEGAL.md`,
  `REVIEW.md`, `PROMPTING.md` (read
  when the task needs them).
- `claude/skills/`: agent skills, installed into `~/.claude/skills/`; where
  each came from is in `claude/skills/SOURCES.md`.

## In any session

In a cloud environment whose setup script is `setup/cloud-setup.sh` (the
repo is public: nothing to select) the guidelines are installed before the
first message. Elsewhere:

If `~/.claude/guides/` is missing or older than this repo's copy, run
`./install.sh`. Then follow the installed `~/.claude/CLAUDE.md`. Cloud
sessions start in a fresh container, so this is usually needed once per
session.

## When editing the guidelines

- Edit the files here (under `claude/`), never only the installed copies,
  then run `./install.sh` and commit.
- Keep the format:
  - imperative bullets;
  - every guide section names when it applies (in its heading, e.g.
    "— when there is a server");
  - one source of truth per rule: guides link to each other instead of
    repeating (e.g. `LAUNCH.md` points to `SECURITY.md` sections).
- General rules only. Project-specific rules belong in that project's
  `AGENTS.md` and `docs/`.
- A rule a tool can enforce (lint, test, CI) goes into the project's tooling;
  the guide may mention it.

## Third-party skills

- Copy only the files a skill needs (its `SKILL.md` and the files it links
  to) into `claude/skills/<name>/`, after reading every one of them. Skills
  are instructions an agent will follow: a file you haven't read is
  unreviewed code.
- Never install with `npx skills add`, `npx skills@latest`, or any other
  installer or script from the source: it pulls whatever is there today,
  unread, and may run code.
- Record the source, commit and licence in `claude/skills/SOURCES.md`, and
  keep the licence file next to the skills. Only licences that allow reuse
  (MIT, Apache, CC BY…).
- Take a skill only if it fits the projects' stack; note the ones left out
  and why. Project rules win over a skill's advice.
- To update one, read the new version's diff before copying it in.

## The repo is public

- Never put anything personal, secret or project-specific here: names,
  emails, keys, server addresses, app details. Those belong in a project's
  own repo.
