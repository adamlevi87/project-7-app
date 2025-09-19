#!/bin/bash


# Script to run lockfile-lint and auto-fix registry issues
# Usage: ./scripts/fix-lockfile.sh

echo "📦 Installing lockfile-lint..."
sudo npm install -g lockfile-lint

echo "🔍 Running lockfile-lint to check for registry issues..."

# Run lockfile-lint and capture output (from root, target the project folder)
LINT_OUTPUT=$(lockfile-lint --path ../it-works-on-my-machine/package-lock.json --validate-https --allowed-hosts npm registry.npmjs.org 2>&1)
LINT_EXIT_CODE=$?

if [ $LINT_EXIT_CODE -eq 0 ]; then
    echo "✅ No registry issues found!"
    exit 0
fi

echo "❌ Registry issues detected:"
echo "$LINT_OUTPUT"
echo ""

echo "🔧 Extracting problematic packages..."

# Extract package names from lockfile-lint output
# Pattern: "detected invalid host(s) for package: packagename@version-hash"
PACKAGES=$(echo "$LINT_OUTPUT" | grep "detected invalid host" | \
    sed 's/.*for package: //' | \
    sed 's/@[0-9].*//' | \
    sort -u)

if [ -z "$PACKAGES" ]; then
    echo "❌ No problematic packages found in output"
    exit 1
fi

echo "📦 Found problematic packages:"
echo "$PACKAGES"
echo ""

# Backup the original lock file
mkdir -p it-works-on-my-machine/backup
cp it-works-on-my-machine/package-lock.json it-works-on-my-machine/backup/package-lock.json.lockfile-lint.backup
echo "💾 Backed up package-lock.json to backup/package-lock.json.lockfile-lint.backup"

# Remove each package from package-lock.json
for package in $PACKAGES; do
    echo "🗑️  Removing $package from package-lock.json..."
    
    # Use jq to remove the package from node_modules section
    jq "del(.packages.\"node_modules/$package\")" it-works-on-my-machine/package-lock.json > temp.json && mv temp.json it-works-on-my-machine/package-lock.json
    
    # Also remove from dependencies if it exists there
    jq "del(.dependencies.\"$package\")" it-works-on-my-machine/package-lock.json > temp.json && mv temp.json it-works-on-my-machine/package-lock.json
done

echo ""
echo "✅ Removed all problematic packages"
echo "🔄 Run 'cd it-works-on-my-machine && npm install' to reinstall with correct registry"
echo "📋 Backup available at: it-works-on-my-machine/backup/package-lock.json.lockfile-lint.backup"

if [ -z "$PACKAGES" ]; then
    echo "❌ No problematic packages found in output"
    exit 1
fi

echo "📦 Found problematic packages:"
echo "$PACKAGES"
echo ""

# Backup the original lock file
cp package-lock.json package-lock.json.backup
echo "💾 Backed up package-lock.json to package-lock.json.backup"

# Remove each package from package-lock.json
for package in $PACKAGES; do
    echo "🗑️  Removing $package from package-lock.json..."
    
    # Use jq to remove the package from node_modules section
    jq "del(.packages.\"node_modules/$package\")" package-lock.json > temp.json && mv temp.json package-lock.json
    
    # Also remove from dependencies if it exists there
    jq "del(.dependencies.\"$package\")" package-lock.json > temp.json && mv temp.json package-lock.json
done

echo ""
echo "✅ Removed all problematic packages"
echo "🔄 Run 'npm install' to reinstall with correct registry"
echo "📋 Backup available at: package-lock.json.backup"
