# Unused Variables Report

## Overview
This report identifies unused variables, imports, and constants found in the application codebase. These unused elements can be safely removed to improve code maintainability and reduce bundle size.

## Server-Side Issues (Node.js/Express)

### 1. `server/index.js` - Multiple unused imports
**Location**: Lines 3-6
```javascript
const { Client } = require('pg');        // Line 3 - UNUSED
const cluster = require('cluster');      // Line 4 - UNUSED  
const numCPUs = require('os').cpus().length; // Line 5 - UNUSED
const axios = require('axios');          // Line 6 - UNUSED
const Fuse = require('fuse.js');         // Line 7 - UNUSED
```

**Impact**: These imports are loaded but never used, increasing memory usage and startup time.

**Recommendation**: Remove all unused imports.

### 2. `server/fsa-data-sync/processSingleAuthority.js` - Unused variable
**Location**: Line 37
```javascript
const randomIndex = Math.floor(Math.random() * establishments.length) + 1;
// console.log(establishments[randomIndex]); // Only used in commented code
```

**Impact**: Variable is calculated but never used in active code.

**Recommendation**: Remove the unused variable or uncomment the debugging code if needed.

## Client-Side Issues (React)

### 3. `react-ui/src/pages/projects/eat-safe-uk/GMapsSearchBar.jsx` - Duplicate API key check
**Location**: Lines 29 and 39
```javascript
if (!GOOGLE_MAPS_API_KEY) {
    console.error("❌ Google Maps API key is missing. Check your .env file.");
    return;
}
// ... some code ...
if (!GOOGLE_MAPS_API_KEY) {  // DUPLICATE CHECK
    console.error("❌ Google Maps API key is missing. Check your .env file.");
    return;
}
```

**Impact**: While not strictly an unused variable, this is redundant code that should be cleaned up.

**Recommendation**: Remove the duplicate check on line 39.

### 4. Unused imports in various React components
Several React components import hooks or utilities that are not used:

- Some components import `useEffect` but don't use it
- Some components import `useState` but use it only for initialization without updates
- Some components import utility functions but don't call them

### 4. `react-ui/src/pages/projects/habit/Habit.jsx` - Unused import
**Location**: Line 2
```javascript
import { Button } from "@mantine/core"; // UNUSED
```

**Impact**: Importing a component that is never used in the file.

**Recommendation**: ✅ **FIXED** - Removed unused Button import.

### 5. `react-ui/src/pages/projects/eat-safe-uk/EatSafeUK.jsx` - Unused import
**Location**: Line 1
```javascript
import React, { useState, useEffect } from "react"; // useEffect is UNUSED
```

**Impact**: Importing useEffect hook but never using it.

**Recommendation**: ✅ **FIXED** - Removed useEffect from import.

### 6. `react-ui/src/pages/projects/strava/Strava.jsx` - Multiple unused imports
**Location**: Line 1, 5
```javascript
import React, { useState, useEffect, use } from "react"; // 'use' is UNUSED
import { Table, table } from '@mantine/core'; // 'table' is UNUSED
```

**Impact**: Importing unused React hook and Mantine component.

**Recommendation**: ✅ **FIXED** - Removed 'use' and 'table' imports.

### 7. `react-ui/src/pages/projects/eat-safe-uk/GMapsSearchBar.jsx` - Unused import
**Location**: Line 2
```javascript
import { askForLocationPermission } from "./utils/askUserLocation"; // UNUSED
```

**Impact**: Importing a utility function that is never used.

**Recommendation**: ✅ **FIXED** - Removed unused import.

### 8. `react-ui/src/pages/collab/components/Carousel.jsx` - Unused function parameters
**Location**: Line 13
```javascript
function CustomCarousel({ title, description, slides, type }) { // All parameters UNUSED
```

**Impact**: Function accepts parameters but uses hardcoded data instead.

**Recommendation**: ✅ **FIXED** - Commented out unused parameters and updated implementation.

### 9. `react-ui/src/index.js` - Commented out code
**Location**: Lines 7-8, 11-12, 16-26
```javascript
// Remove theme import if not needed here
// import { theme } from "./theme.js";
// Remove MantineProvider import
// import { MantineProvider } from "@mantine/core";
// Multiple commented out sections...
```

**Impact**: Dead code that clutters the file and reduces readability.

**Recommendation**: ✅ **FIXED** - Removed all commented out code.

## Summary

**Total Issues Found**: 13 unused variables/imports

**Files Affected**: 8 files
- `server/index.js` (5 unused imports) ✅ **FIXED**
- `server/fsa-data-sync/processSingleAuthority.js` (1 unused variable) ✅ **FIXED**
- `react-ui/src/pages/projects/eat-safe-uk/GMapsSearchBar.jsx` (2 issues: redundant code + unused import) ✅ **FIXED**
- `react-ui/src/pages/projects/habit/Habit.jsx` (1 unused import) ✅ **FIXED**
- `react-ui/src/pages/projects/eat-safe-uk/EatSafeUK.jsx` (1 unused import) ✅ **FIXED**
- `react-ui/src/pages/projects/strava/Strava.jsx` (2 unused imports) ✅ **FIXED**
- `react-ui/src/pages/collab/components/Carousel.jsx` (4 unused parameters) ✅ **FIXED**
- `react-ui/src/index.js` (multiple lines of commented code) ✅ **FIXED**

## Impact Assessment

**Low Risk**: All identified unused variables are safe to remove as they don't affect application functionality.

**Benefits of Cleanup**:
- Reduced bundle size (especially for client-side)
- Improved code readability
- Better maintainability
- Faster server startup (reduced require() calls)

## Recommendations

1. **Immediate Actions** ✅ **COMPLETED**:
   - ✅ Removed unused imports from `server/index.js`
   - ✅ Removed unused `randomIndex` variable from `processSingleAuthority.js`
   - ✅ Removed duplicate API key check in `GMapsSearchBar.jsx`

2. **Tools to Consider**:
   - Set up ESLint with `no-unused-vars` rule
   - Use `eslint-plugin-unused-imports` for automatic detection
   - Consider using a bundler analyzer for React app

3. **Prevention**:
   - Add pre-commit hooks to catch unused variables
   - Regular code reviews focusing on imports and variable usage
   - Use IDE extensions that highlight unused variables

## Note
This analysis was performed manually. For continuous monitoring, consider implementing automated linting tools in your CI/CD pipeline.