#!/usr/bin/env bash
# Installs these guidelines as Claude Code's user-level instructions:
#   claude/CLAUDE.md -> ~/.claude/CLAUDE.md
#   claude/guides/   -> ~/.claude/guides/
#   claude/skills/   -> ~/.claude/skills/ (one folder per skill)
# A different existing file is kept as <name>.<timestamp>.bak first. Safe to
# run again. CLAUDE_HOME=<dir> installs somewhere else (for testing).
set -euo pipefail
src="$(cd "$(dirname "$0")" && pwd)/claude"
dest="${CLAUDE_HOME:-$HOME/.claude}"
mkdir -p "$dest/guides"

copy() { # copy <from> <to>: back up a different existing file, then copy
  if [ -f "$2" ] && ! cmp -s "$1" "$2"; then
    # Backups go to backups/, never next to a skill (an agent would read them).
    local rel="${2#"$dest"/}" bak
    bak="$dest/backups/${rel//\//__}.$(date +%Y%m%d-%H%M%S).bak"
    mkdir -p "$dest/backups"; cp "$2" "$bak"; echo "kept the old $2 as $bak"
  fi
  cp "$1" "$2"
}

copy "$src/CLAUDE.md" "$dest/CLAUDE.md"
for f in "$src"/guides/*.md; do copy "$f" "$dest/guides/$(basename "$f")"; done

# Skills: one folder each, files only (a skill with subfolders is not supported:
# say so rather than half-install). A skill installed earlier from here and since
# removed from the repo is removed too; skills installed by other means are kept.
manifest="$dest/skills/.from-agent-guidelines"
mkdir -p "$dest/skills"
names=()
for d in "$src"/skills/*/; do
  [ -d "$d" ] || continue  # no skills: the glob stays literal
  name="$(basename "$d")"; names+=("$name")
  for f in "$d"*; do
    if [ -d "$f" ]; then echo "skipped $f: subfolders in skills are not supported" >&2; continue; fi
    [ -f "$f" ] || continue
    mkdir -p "$dest/skills/$name"
    copy "$f" "$dest/skills/$name/$(basename "$f")"
  done
done
if [ -f "$manifest" ]; then
  while IFS= read -r old; do
    [ -n "$old" ] || continue
    keep=0; for n in "${names[@]}"; do [ "$n" = "$old" ] && keep=1; done
    if [ "$keep" = 0 ] && [ -d "$dest/skills/$old" ]; then
      mkdir -p "$dest/backups"; mv "$dest/skills/$old" "$dest/backups/skill-$old.$(date +%Y%m%d-%H%M%S)"
      echo "removed skill $old (no longer in the repo; moved to backups/)"
    fi
  done < "$manifest"
fi
printf '%s\n' "${names[@]}" > "$manifest"
echo "Installed into $dest: CLAUDE.md, guides/$(cd "$src/guides" && ls *.md | tr '\n' ' '), skills/${names[*]}"
