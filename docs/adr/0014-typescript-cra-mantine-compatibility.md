# ADR 0014: TypeScript/CRA/Mantine Compatibility Resolution

**Date**: 2025-07-08  
**Status**: Accepted  
**Type**: Technical Decision  

## Context

During the React UI build process, we encountered a complex three-way version compatibility conflict between Create React App (CRA), Mantine UI library, and TypeScript ESLint tooling. This conflict prevented successful dependency installation and builds.

## Issue Summary

The build process failed due to missing `react-scripts` and dependency resolution conflicts caused by incompatible version constraints between:

1. **Create React App** - Requires TypeScript ≤5.1.x for its ESLint stack
2. **Mantine v7.17+** - Requires TypeScript ≥5.0 for proper type support
3. **TypeScript ESLint v8.x** - Not compatible with CRA's ESLint v7 stack

## Detailed Conflict Analysis

| Component | Version Constraint | Notes |
|-----------|-------------------|-------|
| CRA | TS ≤ 5.1.x | react-scripts + eslint-config-react-app choke on higher versions |
| Mantine v7.17+ | TS ≥ 5.0 | Needs TS for typings |
| TS ESLint v8.x | 🔥 Not compatible with CRA's ESLint stack | CRA uses ESLint v7 stack (via react-scripts) |

## Decision

**Accept the version constraint conflict and use `--legacy-peer-deps` flag to bypass CRA's strict peer dependency resolution.**

## Current Solution

| Config | Version | Status |
|--------|---------|--------|
| TypeScript | `5.1.6` | ✅ Mantine-compatible and within CRA limits |
| `--legacy-peer-deps` | install flag | ✅ Bypasses CRA's strict peerDeps |
| ESLint (CRA config) | Keep as-is | ✅ Don't manually bump versions |
| Mantine | `v7.17.x` | ✅ Fully supported |

## Implementation

### Installation Commands
```bash
# Always use legacy peer deps for React UI
npm install --legacy-peer-deps

# For fresh installs
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Package.json Configuration
```json
{
  "devDependencies": {
    "typescript": "5.1.6"
  }
}
```

## Tips for Safe Development

**Always install using:**
```bash
npm install --legacy-peer-deps
```

**Avoid manually updating `@typescript-eslint/*` or `eslint` packages while still on CRA.**

**Lock TypeScript at 5.1.6 in your package.json:**
```json
"typescript": "5.1.6"
```

**For Next.js (post-migration):**
- You can move to the latest TS + ESLint stacks.
- This issue won't persist once CRA is gone.

## Consequences

### Positive
- ✅ Maintains Mantine compatibility
- ✅ Keeps CRA build process working
- ✅ Preserves existing development workflow
- ✅ No breaking changes to existing code

### Negative
- ⚠️ Requires `--legacy-peer-deps` flag for all installations
- ⚠️ Cannot upgrade TypeScript beyond 5.1.6 while on CRA
- ⚠️ Cannot use modern ESLint + TS-ESLint 8.x stack
- ⚠️ Potential for dependency version drift

### Neutral
- 🔄 Temporary solution until CRA migration completes
- 🔄 No impact on Next.js migration timeline

## Future Resolution

**Once CRA is fully removed (Phase 7), you can:**

🔼 Upgrade TypeScript past 5.1.6  
🔼 Move to modern ESLint + TS-ESLint 8.x stack  
🧼 Drop `--legacy-peer-deps`  

## Related ADRs

- [ADR 0012: TypeScript Migration](./0012-typescript-migration.md) - Original TypeScript adoption decision
- [ADR 0013: Next.js Migration](./0013-nextjs-migration.md) - Migration plan that will resolve this constraint

## Notes

This ADR documents a temporary compatibility workaround that will be resolved once the Next.js migration (ADR 0013) is complete. The `--legacy-peer-deps` approach is a well-established pattern for CRA projects with modern dependency requirements. 