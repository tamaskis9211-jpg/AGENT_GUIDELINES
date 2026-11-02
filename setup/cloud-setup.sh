#!/bin/bash
# Claude cloud environment setup script: installs these guidelines (~/.claude:
# CLAUDE.md, guides, skills) at the start of every session.
#
# Paste it into the environment's settings (cloud environment menu in the
# session's title bar → Edit → Setup script). The environment must list
# tamaskis9211-jpg/AGENT_GUIDELINES under Repositories (it is private).
# It never fails the session: without the repo it only says so.
for d in /home/user/AGENT_GUIDELINES /home/user/agent_guidelines; do
  if [ -x "$d/install.sh" ]; then
    "$d/install.sh"
    exit 0
  fi
done
echo "Agent guidelines not installed: add tamaskis9211-jpg/AGENT_GUIDELINES under Repositories in this environment's settings." >&2
exit 0
