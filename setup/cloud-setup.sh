#!/bin/bash
# Claude cloud environment setup script: installs these guidelines (~/.claude:
# CLAUDE.md, guides, skills) at the start of every session.
#
# Paste it into the environment's settings (cloud environment menu in the
# session's title bar → Edit → Setup script). The repo is public, so no
# repository needs to be selected. It never fails the session: without network
# it only says so.
dir=/tmp/agent-guidelines
rm -rf "$dir"
if git clone --depth 1 https://github.com/tamaskis9211-jpg/AGENT_GUIDELINES "$dir" 2>/dev/null; then
  "$dir/install.sh"
else
  echo "Agent guidelines not installed: GitHub was not reachable from this environment." >&2
fi
exit 0
