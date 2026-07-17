#!/bin/bash
# Auto-commit and push script
# Usage: ./auto-push.sh "Your commit message"

# Get commit message from argument or use default
if [ -z "$1" ]; then
  COMMIT_MSG="Auto-update: $(date '+%Y-%m-%d %H:%M:%S')"
else
  COMMIT_MSG="$1"
fi

# Check if there are changes to commit
if [ -z "$(git status --porcelain)" ]; then
  echo "No changes to commit"
  exit 0
fi

# Add all changes
git add -A

# Commit with timestamp
git commit -m "$COMMIT_MSG"

# Push to remote
echo "Pushing to GitHub..."
git push

echo "Done! GitHub Actions will auto-deploy to Vercel."
