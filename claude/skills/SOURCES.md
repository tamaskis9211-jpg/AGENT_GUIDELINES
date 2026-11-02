# Third-party skills: where each came from

Skills here are copied file by file from their source, after reading every
file, and installed by `install.sh` into `~/.claude/skills/`. Never install
skills with `npx skills add` or any other installer: it pulls whatever the
source holds today, unread (repo `CLAUDE.md`, "Third-party skills").

| Skill | Files | Source | Commit | Licence |
|---|---|---|---|---|
| animate-expo | SKILL.md, RECIPES.md | github.com/emilkowalski/skills | a81dbca | MIT (`LICENSE-emilkowalski-skills.txt`) |
| break-ui | SKILL.md, CATALOG.md | same | a81dbca | MIT |
| review-animations | SKILL.md, STANDARDS.md | same | a81dbca | MIT |
| remove-animations | SKILL.md | same | a81dbca | MIT |

Not taken from that repo (web-only or off our stack): animate,
animation-performance, animation-vocabulary, apple-design, ask-sonner,
emil-design-eng, find-animation-opportunities, improve-animations,
mobile-native, pick-ui-library, prototype, write-swift.

Project rules win over a skill. Notably, animate-expo suggests installing
packages (`react-native-keyboard-controller`, Lottie, Skia): in a project that
forbids new native modules without the user's approval, ask first.
break-ui's "Demo data / Worst case" toggle becomes a dev-only route or a test
fixture, never a shipped screen.
