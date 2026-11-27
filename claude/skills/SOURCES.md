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

## Skills written here

| Skill | Files | Written | Based on |
|---|---|---|---|
| procedural-2d-art | SKILL.md, TECHNIQUES.md, procgen.js, render.js, demo.html, bake.mjs | 27 Nov 2026; code and demo renders checked in headless Chromium | Techniques studied in github.com/kevintngo/cinderwatch (MIT, commit 6640b81, licence read 27 Nov 2026). No code, assets, names or palettes copied; the code here is new (its random generator follows the widely published mulberry32 algorithm). |

Project rules win over a skill. Notably, animate-expo suggests installing
packages (`react-native-keyboard-controller`, Lottie, Skia): in a project that
forbids new native modules without the user's approval, ask first.
break-ui's "Demo data / Worst case" toggle becomes a dev-only route or a test
fixture, never a shipped screen.
