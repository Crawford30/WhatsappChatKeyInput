#!/bin/bash

# Release script for @dev-tech/uchat-chat-input
# Usage: ./release.sh [patch|minor|major|current]
#   current = publish the version already in package.json (no bump)

set -e

VERSION_TYPE=${1:-patch}
PACKAGE_NAME=$(node -p "require('./package.json').name")

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📦 Publishing ${PACKAGE_NAME}...${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "src/index.ts" ]; then
  echo -e "${RED}❌ Error: run this from the package root${NC}"
  exit 1
fi

case "$VERSION_TYPE" in
  patch|minor|major|current) ;;
  *)
    echo -e "${RED}❌ Usage: ./release.sh [patch|minor|major|current]${NC}"
    exit 1
    ;;
esac

# npm login (publishing then asks for 2FA approval in the browser)
if ! NPM_USER=$(npm whoami 2>/dev/null); then
  echo -e "${RED}❌ Not logged in to npm. Run: npm login${NC}"
  exit 1
fi
echo -e "${BLUE}npm user: ${NPM_USER}${NC}"

# Check working directory
if ! git diff-index --quiet HEAD --; then
  echo -e "${YELLOW}⚠️  Warning: You have uncommitted changes (they will be published)${NC}"
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Aborted${NC}"
    exit 1
  fi
fi

BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${BLUE}Current version: ${CURRENT_VERSION}${NC}"

# Tests first, so a broken build never gets a version number
echo -e "${BLUE}🧪 Running tests...${NC}"
yarn test --silent

# Bump version
if [ "$VERSION_TYPE" != "current" ]; then
  echo -e "${BLUE}📝 Bumping version (${VERSION_TYPE})...${NC}"
  npm version "$VERSION_TYPE" --no-git-tag-version > /dev/null
fi
NEW_VERSION=$(node -p "require('./package.json').version")

# Refuse to publish a version that's already on npm
if npm view "${PACKAGE_NAME}@${NEW_VERSION}" version > /dev/null 2>&1; then
  echo -e "${RED}❌ ${PACKAGE_NAME}@${NEW_VERSION} is already published${NC}"
  echo -e "${YELLOW}   Use ./release.sh patch (or minor/major) to bump${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Version: v${NEW_VERSION}${NC}"

# Clean build directory
echo -e "${BLUE}🧹 Cleaning build directory...${NC}"
rm -rf lib

# Build
echo -e "${BLUE}🔨 Building package...${NC}"
npx bob build

# Check build
if [ ! -f "lib/typescript/index.d.ts" ]; then
  echo -e "${RED}❌ Build failed: lib/typescript/index.d.ts not found${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Build successful${NC}"

# Publish (approve in the browser when npm asks)
echo -e "${BLUE}🚀 Publishing to npm...${NC}"
npm publish

# Commit + tag only after a successful publish
echo -e "${BLUE}💾 Committing version bump...${NC}"
git add package.json
[ -f package-lock.json ] && git add package-lock.json
git diff --cached --quiet || git commit -m "chore: release v${NEW_VERSION}"

echo -e "${BLUE}🏷️  Creating git tag v${NEW_VERSION}...${NC}"
git tag "v${NEW_VERSION}"

# Push
echo -e "${BLUE}📤 Pushing to GitHub (${BRANCH})...${NC}"
git push origin "$BRANCH"
git push origin "v${NEW_VERSION}"

echo ""
echo -e "${GREEN}✅ Successfully published ${PACKAGE_NAME}@${NEW_VERSION}${NC}"
echo -e "${YELLOW}   npm can take a few minutes to show the new version.${NC}"
echo ""
echo -e "${YELLOW}To use in consuming apps:${NC}"
echo "  yarn add ${PACKAGE_NAME}@^${NEW_VERSION}"
echo ""
echo -e "${GREEN}🎉 Done!${NC}"
