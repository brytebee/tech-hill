#!/bin/bash
# scripts/init-submodules.sh
# Authenticates and initializes private Git submodules during Vercel build.
# Requires GITHUB_PAT environment variable to be set in Vercel project settings.
set -e

if [ -z "$GITHUB_PAT" ]; then
  echo "⚠️  GITHUB_PAT is not set — skipping submodule init (local dev mode)"
  exit 0
fi

echo "🔐 Configuring Git authentication for submodules..."
git config --global url."https://${GITHUB_PAT}@github.com/".insteadOf "https://github.com/"

echo "📦 Initializing submodules..."
git submodule update --init --recursive

echo "✅ Submodules ready."
