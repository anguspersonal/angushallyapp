#!/bin/bash
# Fix staged deletions for config and docs files
# These files should not be deleted - they're still needed

# Get the directory where the script is located (works in both WSL and Windows)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

echo "Current git status:"
git status --short | head -15

echo ""
echo "Unstaging deletions..."
git reset HEAD config/README.md config/env.example config/env.js 2>&1
git reset HEAD docs/01_guidance.md docs/02_roadmap.md docs/03_updates.md docs/04_schema.md docs/05_database.md docs/06_tech_debt.md docs/07_backlog.md docs/08_module_development_flow.md 2>&1

echo ""
echo "Adding files back (they exist in working directory)..."
git add -f config/README.md config/env.example config/env.js 2>&1
git add -f docs/01_guidance.md docs/02_roadmap.md docs/03_updates.md docs/04_schema.md docs/05_database.md docs/06_tech_debt.md docs/07_backlog.md docs/08_module_development_flow.md 2>&1

echo ""
echo "Final git status:"
git status --short

echo ""
echo "If files are still showing as deleted, trying restore from parent commit..."
PARENT_COMMIT=$(git rev-parse 1fcbf69^)
echo "Parent commit: $PARENT_COMMIT"

# Try restoring from parent if files existed there
if git cat-file -e "$PARENT_COMMIT:config/env.js" 2>/dev/null; then
    echo "Restoring config files from parent commit..."
    git restore --source="$PARENT_COMMIT" --staged -- config/ 2>&1
fi

if git cat-file -e "$PARENT_COMMIT:docs/01_guidance.md" 2>/dev/null; then
    echo "Restoring docs files from parent commit..."
    git restore --source="$PARENT_COMMIT" --staged -- docs/01_guidance.md docs/02_roadmap.md docs/03_updates.md docs/04_schema.md docs/05_database.md docs/06_tech_debt.md docs/07_backlog.md docs/08_module_development_flow.md 2>&1
fi

echo ""
echo "Final status after restore:"
git status --short

