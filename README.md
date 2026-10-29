# Agent guidelines

General rules for AI coding agents (written for Claude Code), used across
all projects: how to work, a security checklist, a launch checklist and a
UI/UX guide.

| File | What | Loaded |
|---|---|---|
| `claude/CLAUDE.md` | How to work: plan first, a visible queue, no scope creep, measure don't guess, review by a second agent, mistakes become rule fixes, reporting | every session (user-level) |
| `claude/guides/SECURITY.md` | Security checklist: authorization, accounts, input, secrets, abuse and cost, data, web, infrastructure, errors, dependencies, mobile, privacy, incidents | before security-relevant work |
| `claude/guides/LAUNCH.md` | Launch checklist: testing, delivery, observability, data, states, web/SEO, email, AI features, legal, docs | when planning a project and before a release |
| `claude/guides/UI_UX.md` | UI/UX: identity first, principles and laws, layout, interaction, forms, navigation, states, accessibility, content, ethics, a review checklist | before building or changing screens |

## Install

```bash
git clone https://github.com/tamaskis9211-jpg/agent_guidelines
cd agent_guidelines && ./install.sh
```

The script copies `claude/` into `~/.claude/` (Claude Code's user-level
instructions). A different existing file is kept as
`<name>.<timestamp>.bak`. Run it again after pulling changes.
`CLAUDE_HOME=<dir> ./install.sh` installs somewhere else (e.g. to try it
out). A guide removed from this repo is not deleted from `~/.claude/guides/`;
remove it by hand.

**Cloud sessions** (claude.ai/code) start in a fresh container. Add this repo
to the session, and the agent runs `./install.sh` itself: this repo's own
`CLAUDE.md` tells it to.

## How the pieces fit

- `CLAUDE.md` is short and always loaded. It says when to read each guide,
  so the guides cost nothing until a task needs them.
- Each project adds its own rules in its `AGENTS.md` (the project's
  `CLAUDE.md` imports it with `@AGENTS.md`) and `docs/`: decisions, open
  items, environment notes, a release checklist, a feature-brief template.
  Project rules add to these and may be stricter or rule items out (e.g. no
  analytics); they never weaken a security rule. Where they truly conflict,
  ask the user before acting.
- Whatever a tool can enforce (CI, lint, tests, secret scan, dependency
  audit) belongs in the project's tooling. Guides are strong defaults, not
  guarantees.

## Changing the rules

Edit the files under `claude/`, run `./install.sh`, and commit. Adjust them
from real use: when an agent keeps missing a rule or a rule keeps getting in
the way, trim it or turn it into an automated check.
