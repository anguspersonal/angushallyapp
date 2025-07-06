# Step 3: Begin Feature Migration - Implementation Guide

## Overview
**Previous Steps**: ✅ Step 1 & 2 Complete  
**Current Step**: Step 3 - Begin Feature Migration  
**Priority**: Start with Bookmarks (highest complexity)  
**Estimated Time**: 2-3 days

## Implementation Strategy

### Phase 1: Bookmarks Feature (Priority: HIGH)
**Files**: 14 files | **Estimated Time**: 1 day | **Complexity**: High

#### 🎯 Starting Point: BookmarkCard Component
**File**: `src/pages/projects/bookmarks/components/BookmarkCard.tsx`
**Issues to Fix**:
1. Remove `// @ts-nocheck` comment
2. Import types from `../../../types/common`
3. Fix Mantine 7 props (`spacing`→`gap`, `position`→`justify`)
4. Add proper prop types using `BookmarkCardProps`

#### 🔧 Implementation Steps

##### 1. Import Required Types
```typescript
import { 
  Bookmark, 
  BookmarkCardProps, 
  BookmarkSourceType 
} from '../../../types/common';
```

##### 2. Update Component Props
```typescript
const BookmarkCard: React.FC<BookmarkCardProps> = ({ 
  bookmark, 
  onInstagramAnalysisClick,
  onEdit,
  onDelete,
  showActions = false
}) => {
  // Component implementation
};
```

##### 3. Fix Mantine 7 Props
Replace deprecated props throughout the component:
- `spacing` → `gap`
- `position` → `justify`
- `weight` → `fw`
- Check for other deprecated props

##### 4. Type State Variables
```typescript
const [imageError, setImageError] = useState<boolean>(false);
const [isHovered, setIsHovered] = useState<boolean>(false);
```

##### 5. Type Function Parameters
```typescript
const getSourceBadgeProps = (sourceType: BookmarkSourceType) => {
  // Implementation
};

const formatDate = (dateString: string): string => {
  // Implementation  
};
```

#### 📋 Complete File Migration Order

1. **Components** (Start Here)
   - [ ] `BookmarkCard.tsx` - Core component with complex props
   - [ ] `components/sidebar.tsx` - Sidebar component
   - [ ] `ShareHandler.tsx` - Share functionality
   - [ ] `Raindrops.tsx` - Animation component

2. **Main Pages**
   - [ ] `Bookmarks.tsx` - Main bookmarks page
   - [ ] `Bookmarks.integration.test.tsx` - Integration tests

3. **Tests**
   - [ ] `components/BookmarkCard.test.tsx` - Unit tests

#### 🔍 Common Issues & Solutions

**Issue**: `onInstagramAnalysisClick` missing in tests
**Solution**: Add proper mock function
```typescript
const mockOnInstagramAnalysisClick = jest.fn();
```

**Issue**: Mantine props not found
**Solution**: Check Mantine 7 migration guide and update props

**Issue**: Implicit any parameters
**Solution**: Add explicit type annotations using shared types

#### 🧪 Testing Strategy

1. **Type Check**: `npm run type-check` after each file
2. **Unit Tests**: Ensure tests pass with new types
3. **Integration**: Test bookmark card rendering with real data
4. **Manual Testing**: Verify Instagram analysis functionality

#### 🎨 Mantine 7 Migration Reference

Common prop changes needed:
```typescript
// OLD (Mantine 6)
<Group spacing="xs" position="apart">
<Text weight={600} size="sm">
<Badge variant="light">

// NEW (Mantine 7)  
<Group gap="xs" justify="space-between">
<Text fw={600} size="sm">
<Badge variant="light">
```

### Phase 2: Habit Tracker (Priority: HIGH)
**Files**: 8 files | **Estimated Time**: 0.5 day | **Complexity**: Medium

#### 🎯 Starting Point: Habit Service
**File**: `src/pages/projects/habit/habit.ts`
**Focus**: Type API calls and data structures

#### 🔧 Key Changes Needed
1. Import `HabitLog`, `HabitType`, `DrinkCatalogItem` types
2. Type function parameters and return values
3. Fix `aggregateService.ts` return types
4. Update React components with proper prop types

### Phase 3: Core Pages (Priority: HIGH)
**Files**: 4 files | **Estimated Time**: 0.25 day | **Complexity**: Low

#### 🎯 Quick Wins
- `Home.tsx` - Main landing page
- `Login.tsx` - Authentication page
- `SoftwareCV.tsx` - Resume/CV page

### Phase 4: Remaining Features (Priority: MEDIUM)
Follow same pattern for:
- **Eat-Safe-UK** (10 files) - Google Maps typing
- **Data-Value-Game** (8 files) - Game state types
- **AI + Strava** (6 files) - API response types

---

## Step-by-Step Execution Guide

### Before Starting
1. **Create Feature Branch**
   ```bash
   git checkout -b feature/typescript-migration-step-3-bookmarks
   ```

2. **Backup Current State**
   ```bash
   git stash push -m "Pre-migration backup"
   ```

### Migration Process (Per File)

#### Step 1: Prepare File
```bash
# Open file in editor
code src/pages/projects/bookmarks/components/BookmarkCard.tsx
```

#### Step 2: Remove @ts-nocheck
```typescript
// Remove this line
// @ts-nocheck

// Add proper imports
import { 
  Bookmark, 
  BookmarkCardProps 
} from '../../../types/common';
```

#### Step 3: Fix Type Errors
```bash
# Run type check to see errors
npm run type-check

# Fix errors one by one:
# 1. Add type annotations
# 2. Fix Mantine props
# 3. Update function signatures
```

#### Step 4: Test Changes
```bash
# Type check
npm run type-check

# Run specific tests
npm test -- --testNamePattern="BookmarkCard"

# Manual verification
npm start
```

#### Step 5: Commit Progress
```bash
git add src/pages/projects/bookmarks/components/BookmarkCard.tsx
git commit -m "refactor(ts): type-safe BookmarkCard component

- Remove @ts-nocheck comment
- Add proper TypeScript types using shared interfaces
- Fix Mantine 7 props (spacing→gap, position→justify)
- Type component props with BookmarkCardProps interface
- Add explicit type annotations for state and functions"
```

### Quality Checklist (Per File)

- [ ] `@ts-nocheck` comment removed
- [ ] Required types imported from `../../../types/common`
- [ ] Component props properly typed
- [ ] State variables have explicit types
- [ ] Function parameters and returns typed
- [ ] Mantine 7 props updated
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] Tests still pass
- [ ] Manual testing confirms functionality

---

## Troubleshooting Guide

### Common TypeScript Errors

**Error**: `Property 'X' does not exist on type 'Y'`
**Fix**: Check if property exists in shared types or add to interface

**Error**: `Argument of type 'X' is not assignable to parameter of type 'Y'`
**Fix**: Add type assertion or update function signature

**Error**: `Cannot find name 'X'`
**Fix**: Add import statement for the type

### Common Mantine 7 Issues

**Error**: `Property 'spacing' does not exist`
**Fix**: Replace `spacing` with `gap`

**Error**: `Property 'position' does not exist`
**Fix**: Replace `position` with `justify`

**Error**: `Property 'weight' does not exist`
**Fix**: Replace `weight` with `fw`

### Performance Tips

1. **Type Check Frequently**: Run `npm run type-check` after each file
2. **Fix Errors Incrementally**: Don't let errors accumulate
3. **Test Early**: Run tests after each component migration
4. **Use IDE Features**: Leverage TypeScript IntelliSense for hints

---

## Success Metrics

### Step 3 Completion Criteria
- [ ] All 14 Bookmarks files migrated (no `@ts-nocheck`)
- [ ] TypeScript compilation passes (`npm run type-check`)
- [ ] All tests pass (`npm test`)
- [ ] Manual testing confirms functionality
- [ ] Mantine 7 props updated throughout
- [ ] Proper type safety for Instagram analysis features

### Code Quality Indicators
- [ ] No `any` types used (except where truly necessary)
- [ ] Proper error handling with typed exceptions
- [ ] IntelliSense working for all props and functions
- [ ] No runtime type errors in browser console

---

## Next Steps After Step 3

1. **Merge to Main**: Follow merge instructions in `MERGE_INSTRUCTIONS.md`
2. **Step 4**: Continue with Habit Tracker (8 files)
3. **Step 5**: Migrate Core Pages (4 files)
4. **Step 6**: Complete remaining features

---

## Emergency Rollback

If issues arise:
```bash
# Revert to previous state
git stash pop  # If you created a backup stash

# Or reset to last known good commit
git reset --hard HEAD~1
```

---

## Resources

- **Shared Types**: `/src/types/common.ts`
- **Mantine 7 Migration**: https://mantine.dev/changelog/7-0-0/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Project Backlog**: `TYPESCRIPT_MIGRATION_BACKLOG.md`

---

*Created*: Current Date  
*Ready for Execution*: ✅ Step 3 Implementation  
*Estimated Completion*: 2-3 days for full bookmarks migration