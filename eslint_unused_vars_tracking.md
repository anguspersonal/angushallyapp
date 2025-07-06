# ESLint Unused Variables & Issues Tracking Document

## Overview
This document tracks all unused variables, imports, and other ESLint issues found in the codebase. Use this to systematically fix each issue and track progress.

**Total Issues Found**: 76 issues across 29 files

## Issue Categories
- **Unused Imports**: Components/utilities imported but never used
- **Unused Variables**: Variables declared but never used  
- **React Hook Dependencies**: Missing dependencies in useEffect/useCallback
- **Code Quality**: Redundant code blocks, redeclared variables

---

## 📁 **src/App.js**
| Line | Issue Type | Description | Status |
|------|------------|-------------|--------|
| 9:8 | Unused Import | `'Header'` is defined but never used | ❌ TODO |

---

## 📁 **src/components/InstagramIntelligence/InstagramAnalysisDisplay.jsx**
| Line | Issue Type | Description | Status |
|------|------------|-------------|--------|
| 10:3 | Unused Import | `'Progress'` is defined but never used | ❌ TODO |
| 11:3 | Unused Import | `'Divider'` is defined but never used | ❌ TODO |
| 15:3 | Unused Import | `'Box'` is defined but never used | ❌ TODO |
| 27:3 | Unused Import | `'IconClock'` is defined but never used | ❌ TODO |
| 30:3 | Unused Import | `'IconTarget'` is defined but never used | ❌ TODO |

---

## 📁 **src/components/InstagramIntelligence/InstagramEnhancer.jsx**
| Line | Issue Type | Description | Status |
|------|------------|-------------|--------|
| 11:3 | Unused Import | `'Progress'` is defined but never used | ❌ TODO |
| 22:3 | Unused Import | `'IconX'` is defined but never used | ❌ TODO |
| 23:3 | Unused Import | `'IconAnalyze'` is defined but never used | ❌ TODO |
| 25:3 | Unused Import | `'IconExclamationMark'` is defined but never used | ❌ TODO |
| 48:6 | React Hook Deps | Missing dependency: `'fetchBookmarks'` | ❌ TODO |
| 52:6 | React Hook Deps | Missing dependency: `'filterAndPaginateBookmarks'` | ❌ TODO |
| 146:27 | Unused Variable | `'isEnhanced'` is assigned a value but never used | ❌ TODO |

---

## 📁 **src/contexts/AuthContext.jsx**
| Line | Issue Type | Description | Status |
|------|------------|-------------|--------|
| 83:6 | React Hook Deps | Missing dependency: `'checkAuth'` | ❌ TODO |
| 89:6 | React Hook Deps | Missing dependency: `'checkAuth'` | ❌ TODO |

---

## 📁 **src/pages/About.jsx**
| Line | Issue Type | Description | Status |
|------|------------|-------------|--------|
| 8:18 | Unused Import | `'motionTransitions'` is defined but never used | ✅ FIXED |
| 24:11 | Unused Variable | `'theme'` is assigned a value but never used | ❌ TODO |

---

## 📁 **src/pages/Blog.jsx**
| Line | Issue Type | Description | Status |
|------|------------|-------------|--------|
| 34:11 | Unused Variable | `'theme'` is assigned a value but never used | ❌ TODO |

---

## 📁 **src/pages/Collab.jsx**
| Line | Issue Type | Description | Status |
|------|------------|-------------|--------|
| 3:57 | Unused Import | `'Stack'` is defined but never used | ❌ TODO |
| 18:7 | Unused Variable | `'sectionStyles'` is assigned a value but never used | ❌ TODO |

---

## 📁 **src/pages/Contact.jsx**
| Line | Issue Type | Description | Status |
|------|------------|-------------|--------|
| 19:10 | Unused Import | `'motionTransitions'` is defined but never used | ❌ TODO |
| 36:11 | Unused Variable | `'theme'` is assigned a value but never used | ❌ TODO |

---

## 📁 **src/pages/Projects.jsx**
| Line | Issue Type | Description | Status |
|------|------------|-------------|--------|
| 31:11 | Unused Variable | `'theme'` is assigned a value but never used | ❌ TODO |

---

## 📁 **src/pages/SoftwareCV.jsx**
| Line | Issue Type | Description | Status |
|------|------------|-------------|--------|
| 2:114 | Unused Import | `'Overlay'` is defined but never used | ❌ TODO |
| 3:10 | Unused Import | `'IconCode'` is defined but never used | ✅ FIXED |
| 3:73 | Unused Import | `'IconBrandNodejs'` is defined but never used | ✅ FIXED |
| 3:90 | Unused Import | `'IconBrandPython'` is defined but never used | ✅ FIXED |
| 3:107 | Unused Import | `'IconChevronRight'` is defined but never used | ✅ FIXED |
| 3:143 | Unused Import | `'IconBrandCss3'` is defined but never used | ✅ FIXED |
| 3:158 | Unused Import | `'IconBrandJavascript'` is defined but never used | ✅ FIXED |
| 5:10 | Unused Import | `'motionTransitions'` is defined but never used | ❌ TODO |

---

## 📁 **src/pages/collab/components/FounderJourney.jsx**
| Line | Issue Type | Description | Status |
|------|------------|-------------|--------|
| 3:10 | Unused Import | `'useRef'` is defined but never used | ❌ TODO |

---

## 📁 **src/pages/collab/components/TraitGrid.jsx**
| Line | Issue Type | Description | Status |
|------|------------|-------------|--------|
| 71:7 | Unused Variable | `'containerSizeVmin'` is assigned a value but never used | ❌ TODO |

---

## 📁 **src/pages/projects/ai/AIProjects.jsx**
| Line | Issue Type | Description | Status |
|------|------------|-------------|--------|
| 31:11 | Unused Variable | `'theme'` is assigned a value but never used | ❌ TODO |

---

## 📁 **src/pages/projects/ai/Instapaper.jsx**
| Line | Issue Type | Description | Status |
|------|------------|-------------|--------|
| 4:3 | Unused Import | `'TextInput'` is defined but never used | ❌ TODO |
| 5:3 | Unused Import | `'Button'` is defined but never used | ❌ TODO |
| 8:3 | Unused Import | `'Text'` is defined but never used | ❌ TODO |
| 18:17 | Unused Variable | `'setInput'` is assigned a value but never used | ❌ TODO |
| 19:10 | Unused Variable | `'response'` is assigned a value but never used | ❌ TODO |
| 21:11 | Unused Variable | `'user'` is assigned a value but never used | ❌ TODO |
| 23:9 | Unused Variable | `'handleSubmit'` is assigned a value but never used | ❌ TODO |

---

## 📁 **src/pages/projects/ai/TextAnalysisAI.jsx**
| Line | Issue Type | Description | Status |
|------|------------|-------------|--------|
| 21:11 | Unused Variable | `'user'` is assigned a value but never used | ❌ TODO |

---

## 📁 **src/pages/projects/bookmarks/Bookmarks.jsx**
| Line | Issue Type | Description | Status |
|------|------------|-------------|--------|
| 2:75 | Unused Import | `'Grid'` is defined but never used | ❌ TODO |
| 2:88 | Unused Import | `'Transition'` is defined but never used | ❌ TODO |
| 2:107 | Unused Import | `'Avatar'` is defined but never used | ❌ TODO |
| 2:115 | Unused Import | `'Progress'` is defined but never used | ❌ TODO |
| 78:6 | React Hook Deps | Missing dependency: `'calculateStats'` | ❌ TODO |
| 136:6 | React Hook Deps | Missing dependency: `'calculateStats'` | ❌ TODO |
| 146:9 | Unused Variable | `'getStatColor'` is assigned a value but never used | ❌ TODO |
| 156:9 | Unused Variable | `'getStatIcon'` is assigned a value but never used | ❌ TODO |
| 166:9 | Unused Variable | `'getInsightIcon'` is assigned a value but never used | ❌ TODO |

---

## 📁 **src/pages/projects/bookmarks/Raindrops.jsx**
| Line | Issue Type | Description | Status |
|------|------------|-------------|--------|
| 6:15 | Unused Variable | `'API_BASE'` is defined but never used | ❌ TODO |
| 98:9 | Unused Variable | `'checkConnectionStatus'` is assigned a value but never used | ❌ TODO |

---

## 📁 **src/pages/projects/bookmarks/ShareHandler.jsx**
| Line | Issue Type | Description | Status |
|------|------------|-------------|--------|
| 23:28 | Unused Variable | `'user'` is assigned a value but never used | ❌ TODO |

---

## 📁 **src/pages/projects/bookmarks/components/BookmarkCard.jsx**
| Line | Issue Type | Description | Status |
|------|------------|-------------|--------|
| 2:75 | Unused Import | `'ActionIcon'` is defined but never used | ❌ TODO |
| 3:10 | Unused Import | `'notifications'` is defined but never used | ❌ TODO |
| 4:53 | Unused Import | `'IconTag'` is defined but never used | ❌ TODO |

---

## 📁 **src/pages/projects/data-value-game/Gameboard.jsx**
| Line | Issue Type | Description | Status |
|------|------------|-------------|--------|
| 48:10 | Unused Variable | `'guess'` is assigned a value but never used | ❌ TODO |
| 72:6 | React Hook Deps | Missing dependency: `'restartGame'` | ❌ TODO |
| 95:5 | Code Quality | Nested block is redundant | ❌ TODO |
| 146:6 | React Hook Deps | Missing dependency: `'setGameStatus'` | ❌ TODO |

---

## 📁 **src/pages/projects/eat-safe-uk/EatSafeUK.jsx**
| Line | Issue Type | Description | Status |
|------|------------|-------------|--------|
| 1:27 | Unused Import | `'useEffect'` is defined but never used | ✅ FIXED |
| 11:12 | Unused Variable | `'userSearched'` is assigned a value but never used | ❌ TODO |
| 13:12 | Unused Variable | `'userLocationPermission'` is assigned a value but never used | ❌ TODO |

---

## 📁 **src/pages/projects/eat-safe-uk/GMapView.jsx**
| Line | Issue Type | Description | Status |
|------|------------|-------------|--------|
| 58:6 | React Hook Deps | Missing dependency: `'setIsSearching'` | ❌ TODO |

---

## 📁 **src/pages/projects/eat-safe-uk/GMapsSearchBar.jsx**
| Line | Issue Type | Description | Status |
|------|------------|-------------|--------|
| 2:10 | Unused Import | `'askForLocationPermission'` is defined but never used | ✅ FIXED |
| 88:8 | React Hook Deps | Missing dependencies: `'GOOGLE_MAPS_API_KEY'`, `'setIsSearching'`, `'setSelectedMarker'`, `'setUserSearched'` | ❌ TODO |

---

## 📁 **src/pages/projects/eat-safe-uk/Markers.jsx**
| Line | Issue Type | Description | Status |
|------|------------|-------------|--------|
| 3:10 | Unused Import | `'MarkerClusterer'` is defined but never used | ❌ TODO |
| 4:10 | Unused Import | `'Marker'` is defined but never used | ❌ TODO |

---

## 📁 **src/pages/projects/habit/Habit.jsx**
| Line | Issue Type | Description | Status |
|------|------------|-------------|--------|
| 2:10 | Unused Import | `'Button'` is defined but never used | ✅ FIXED |
| 55:6 | React Hook Deps | Missing dependency: `'selectedLogs.length'` | ❌ TODO |
| 87:9 | Unused Variable | `'refreshHabitLogs'` is assigned a value but never used | ❌ TODO |

---

## 📁 **src/pages/projects/habit/HabitCombobox.jsx**
| Line | Issue Type | Description | Status |
|------|------------|-------------|--------|
| 6:3 | Unused Import | `'Group'` is defined but never used | ❌ TODO |
| 7:3 | Unused Import | `'Text'` is defined but never used | ❌ TODO |
| 8:3 | Unused Import | `'Badge'` is defined but never used | ❌ TODO |
| 43:9 | Unused Variable | `'addDrink'` is assigned a value but never used | ❌ TODO |
| 60:9 | Unused Variable | `'handleCreate'` is assigned a value but never used | ❌ TODO |
| 86:6 | React Hook Deps | Missing dependency: `'combobox'` | ❌ TODO |

---

## 📁 **src/pages/projects/habit/HabitHeader.jsx**
| Line | Issue Type | Description | Status |
|------|------------|-------------|--------|
| 9:12 | Code Quality | `'onButtonClick'` is already defined | ❌ TODO |

---

## 📁 **src/pages/projects/habit/HabitTile.jsx**
| Line | Issue Type | Description | Status |
|------|------------|-------------|--------|
| 2:32 | Unused Import | `'Button'` is defined but never used | ❌ TODO |

---

## 📁 **src/pages/projects/strava/Strava.jsx**
| Line | Issue Type | Description | Status |
|------|------------|-------------|--------|
| 1:38 | Unused Import | `'use'` is defined but never used | ✅ FIXED |
| 5:17 | Unused Import | `'table'` is defined but never used | ✅ FIXED |
| 7:10 | Unused Import | `'useMantineTheme'` is defined but never used | ✅ FIXED |
| 12:12 | Unused Variable | `'data'` is assigned a value but never used | ❌ TODO |

---

## 📁 **src/pages/projects/strava/stravaDataService.js**
| Line | Issue Type | Description | Status |
|------|------------|-------------|--------|
| 134:10 | Unused Variable | `'getWeekNumber'` is defined but never used | ❌ TODO |

---

## 📁 **src/utils/apiClient.js**
| Line | Issue Type | Description | Status |
|------|------------|-------------|--------|
| 65:19 | Unused Variable | `'text'` is assigned a value but never used | ❌ TODO |

---

## 📊 **Progress Summary**

### Issues by Type:
- **Unused Imports**: 38 issues
- **Unused Variables**: 21 issues  
- **React Hook Dependencies**: 13 issues
- **Code Quality**: 4 issues

### Status Overview:
- ✅ **Fixed**: 9 issues
- ❌ **TODO**: 67 issues

### Files with Most Issues:
1. **src/pages/projects/bookmarks/Bookmarks.jsx** - 9 issues
2. **src/components/InstagramIntelligence/InstagramEnhancer.jsx** - 7 issues
3. **src/pages/projects/ai/Instapaper.jsx** - 7 issues
4. **src/pages/projects/habit/HabitCombobox.jsx** - 6 issues
5. **src/pages/SoftwareCV.jsx** - 6 issues (mostly fixed)

---

## 🎯 **Recommended Fix Order**

### Priority 1: Quick Wins (Unused Imports)
Focus on files with multiple unused imports - these are easy to fix and provide immediate cleanup.

### Priority 2: Unused Variables
Address unused variables that might indicate incomplete features or dead code.

### Priority 3: React Hook Dependencies
Fix missing dependencies to prevent potential bugs and improve performance.

### Priority 4: Code Quality Issues
Address redeclared variables and redundant code blocks.

---

## 📝 **Usage Instructions**

1. **Pick a file** from the list above
2. **Fix the issues** one by one
3. **Update the Status** column from ❌ TODO to ✅ FIXED
4. **Test the changes** to ensure nothing breaks
5. **Commit your changes** with a descriptive message

### Example Commit Messages:
- `fix: remove unused imports from BookmarkCard.jsx`
- `fix: add missing useEffect dependencies in AuthContext`
- `refactor: remove unused theme variables from multiple pages`

---

*Last Updated: [Current Date]*
*Total Progress: 9/76 issues fixed (11.8%)*