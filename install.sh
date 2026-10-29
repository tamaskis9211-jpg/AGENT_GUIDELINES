#!/usr/bin/env bash
# Installs these guidelines as Claude Code's user-level instructions:
#   claude/CLAUDE.md -> ~/.claude/CLAUDE.md
#   claude/guides/   -> ~/.claude/guides/
# A different existing file is kept as <name>.<timestamp>.bak first. Safe to
# run again. CLAUDE_HOME=<dir> installs somewhere else (for testing).
set -euo pipefail
src="$(cd "$(dirname "$0")" && pwd)/claude"
dest="${CLAUDE_HOME:-$HOME/.claude}"
mkdir -p "$dest/guides"

copy() { # copy <from> <to>: back up a different existing file, then copy
  if [ -f "$2" ] && ! cmp -s "$1" "$2"; then
    local bak="$2.$(date +%Y%m%d-%H%M%S).bak"
    cp "$2" "$bak"; echo "kept the old $2 as $bak"
  fi
  cp "$1" "$2"
}

copy "$src/CLAUDE.md" "$dest/CLAUDE.md"
for f in "$src"/guides/*.md; do copy "$f" "$dest/guides/$(basename "$f")"; done
echo "Installed into $dest: CLAUDE.md, guides/$(cd "$src/guides" && ls *.md | tr '\n' ' ')"
