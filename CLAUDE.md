# This repository: the user's general agent guidelines

It holds the rules that apply to every project, not the code of one.

- `claude/CLAUDE.md`: how to work (always loaded once installed).
- `claude/guides/`: `SECURITY.md`, `LAUNCH.md`, `UI_UX.md` (read when the
  task needs them).

## In any session

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
