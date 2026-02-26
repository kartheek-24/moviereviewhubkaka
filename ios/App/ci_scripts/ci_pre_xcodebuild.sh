#!/bin/sh
set -e

# Install Node.js dependencies before Xcode Cloud builds
cd "$CI_PRIMARY_REPOSITORY_PATH"
npm ci

# Build the web app
npm run build

# Sync Capacitor
npx cap sync ios
