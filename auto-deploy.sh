#!/bin/bash
# Auto-deploy script - commit, push, and wait for Vercel deployment
# Usage: ./auto-deploy.sh "Your commit message"

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

echo "📦 Committing changes..."
git add -A
git commit -m "$COMMIT_MSG"

echo "🚀 Pushing to GitHub..."
git push

echo "⏳ Waiting for Vercel deployment..."
echo "Check deployment status at: https://vercel.com/dashboard"

# Optional: Check deployment status using Vercel CLI
if command -v vercel &> /dev/null; then
  echo ""
  echo "Recent deployments:"
  vercel ls --limit 3 2>/dev/null || echo "Run 'vercel login' to link your account"
fi

echo ""
echo "✅ Deployment triggered! Vercel will:"
echo "   1. Build your project"
echo "   2. Run type checks"
echo "   3. Deploy to production"
echo ""
echo "🌐 Check deployment at: https://activationpartner.vercel.app"
