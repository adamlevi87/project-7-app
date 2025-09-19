#!/bin/bash

# Script to run lockfile-lint and auto-fix registry issues
# Usage: cd it-works-on-my-machine && ../scripts/fix-lockfile.sh

echo "Installing lockfile-lint..."
sudo npm install -g lockfile-lint

echo "Running lockfile-lint to check for registry issues..."

# Run lockfile-lint on current directory
LINT_OUTPUT=$(lockfile-lint --path package-lock.json --validate-https --allowed-hosts npm registry.npmjs.org 2>&1)
LINT_EXIT_CODE=$?

if [ $LINT_EXIT_CODE -eq 0 ]; then
    echo "No registry issues found!"
    exit 0
fi

echo "Registry issues detected:"
echo "$LINT_OUTPUT"
echo ""

echo "Extracting problematic registries..."

# Extract registry URLs from "actual:" lines in lockfile-lint output
REGISTRIES=$(echo "$LINT_OUTPUT" | grep "actual:" | sed 's/.*actual: //' | sort -u)

if [ -z "$REGISTRIES" ]; then
    echo "No problematic registries found in output"
    exit 1
fi

echo "Found problematic registries:"
echo "$REGISTRIES"
echo ""

# Backup the original lock file
mkdir -p backup
cp package-lock.json backup/package-lock.json.lockfile-lint.backup
echo "Backed up package-lock.json to backup/package-lock.json.lockfile-lint.backup"

# Remove packages from each problematic registry
for registry in $REGISTRIES; do
    echo "Removing packages from registry: $registry"
    jq "del(.packages[] | select(.resolved and (.resolved | contains(\"$registry\"))))" package-lock.json > temp.json && mv temp.json package-lock.json
done

# Clean up temp file
rm -f temp.json

echo ""
echo "Removed all packages from problematic registries"
echo "Run 'npm install' to reinstall with correct registry"
echo "Backup available at: backup/package-lock.json.lockfile-lint.backup"
