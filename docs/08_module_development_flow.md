# Module Development Flow

## Module Development Workflow (Manual Mode)

This guide supports consistent, verifiable module development flows within `angushallyapp`.  
The default mode is **manual**: the model will pause and ask for `"y"` confirmation at each step.  
If the terminal is opened during this process (e.g. to run tests), **wait for user input/output before proceeding**. If user says auto, complete all steps without pauses.

**⚠️ CRITICAL: The AI must stop and wait for user confirmation (`y`) between EVERY step in both workflows.**

**Choose your development context:**
- [**Server Development**](#server-development-workflow) - For changes in `/server`
- [**Frontend Development**](#frontend-development-workflow) - For changes in `/next-ui`

---

## Server Development Workflow

### 1. Setup & Context

- [ ] Confirm the purpose and scope of the module update
- [ ] Review related files or prior commits
- [ ] Check for open issues or tasks in the backlog related to this module
- [ ] Confirm the name and location of the module within its sub-project

**🛑 STOP: Wait for user confirmation before proceeding to next step**
✅ Ready to proceed? (type `y`)

---

### 2. Code Implementation

- [ ] Create or update files in the appropriate module directory within the sub-project
- [ ] Adhere to naming conventions and folder structure
- [ ] Use shared utilities (`db.js`, `env.js`, `auth.js`) if applicable
- [ ] Avoid raw SQL — use `db.query` unless special justification

**⚠️ Authentication Setup (Critical for Route Development):**
- [ ] **Route Import**: Use destructuring: `const { authMiddleware } = require('../middleware/auth')`
- [ ] **Route Usage**: Apply as middleware: `router.use(authMiddleware())`
- [ ] **Never import as**: `const authMiddleware = require('../middleware/auth')` ← This fails

**🛑 STOP: Wait for user confirmation before proceeding to next step**
✅ Implementation complete? (type `y` to proceed)

---

### 3. Testing

- [ ] Run unit tests: `npm test`
- [ ] Run integration tests: `npm test -- --grep="integration"`
- [ ] Test database migrations (if applicable): `npm run migrate:status`
- [ ] Verify API endpoints work correctly

**🛑 STOP: Wait for user confirmation before proceeding to next step**
✅ Testing complete? (type `y` to proceed)

---

### 4. Documentation

- [ ] Update sub-project README.md if module changes affect public interface
- [ ] Update API documentation in `/server/routes/README.md` if new endpoints added
- [ ] Update `docs/03_updates.md` if changes are cross-system or significant
- [ ] Update `docs/04_schema.md` if database schema changes

**🛑 STOP: Wait for user confirmation before proceeding to next step**
✅ Documentation updated? (type `y` to proceed)

---

### 5. Git Workflow

- [ ] Stage all changes with verbose output:
  ```bash
  git add . -v
  ```
- [ ] Review staged changes carefully
- [ ] Unstage any unintended files (build artifacts, etc.):
  ```bash
  git reset <file>
  ```
- [ ] Commit with Conventional Commit format:
  ```bash
  git commit -m "feat(api): short description"
  ```
- [ ] Reference issues, include breaking change if relevant

**🛑 STOP: Wait for user confirmation before proceeding to next step**
✅ All changes committed? (type `y` to continue)

---

### 6. Deployment (Optional)

- [ ] Push to the working branch:
  ```bash
  git push
  ```
- [ ] If on `main`, push to Heroku:
  ```bash
  git push heroku main
  ```
- [ ] Verify deployment via Heroku logs or UI
- [ ] Verify migrations ran successfully in production (if applicable)

✅ Server module development complete.

---

## Frontend Development Workflow

### 1. Setup & Context

- [ ] Confirm the purpose and scope of the frontend module/component update
- [ ] Review related components, pages, or styling files
- [ ] Check for open issues or tasks in the backlog related to this change
- [ ] Confirm the component/page location within `next-ui/src/`

**🛑 STOP: Wait for user confirmation before proceeding to next step**
✅ Ready to proceed? (type `y`)

---

### 2. Component Implementation

- [ ] Create or update React components in appropriate directories:
  - Pages: `next-ui/src/app/`
  - Components: `next-ui/src/components/`
  - Utilities: `next-ui/src/utils/`
- [ ] Follow naming conventions: `PascalCase.tsx` for components
- [ ] Use shared utilities (`apiClient.ts`, `authUtils.ts`) if applicable
- [ ] Import styling: component-specific CSS or `mantine-overrides.css`

**⚠️ Authentication Setup (Critical for Protected Components):**
- [ ] **AuthContext Import**: `import { useAuth } from '../contexts/AuthContext'`
- [ ] **Protected Routes**: Use `<ProtectedRoute>` wrapper for auth-required pages
- [ ] **API Calls**: Use `apiClient.ts` for consistent API communication

**🛑 STOP: Wait for user confirmation before proceeding to next step**
✅ Implementation complete? (type `y` to proceed)

---

### 3. Build Verification

- [ ] Verify Next.js build succeeds:
  ```bash
  cd next-ui && npm run build
  ```
- [ ] Check for TypeScript errors: `npx tsc --noEmit`
- [ ] Verify ESLint passes: `npm run lint`
- [ ] Test component rendering and functionality

**🛑 STOP: Wait for user confirmation before proceeding to next step**
✅ Build verification complete? (type `y` to proceed)

---

### 4. Testing

- [ ] Run component tests (if available):
  ```bash
  cd next-ui && npm test
  ```
- [ ] Test component in browser at development URL
- [ ] Verify responsive design and accessibility
- [ ] Test integration with backend APIs

**🛑 STOP: Wait for user confirmation before proceeding to next step**
✅ Testing complete? (type `y` to proceed)

---

### 5. Documentation

- [ ] Update component documentation if public interface changes
- [ ] Update `docs/03_updates.md` if changes are cross-system or significant
- [ ] Update sub-project README.md if component affects public interface
- [ ] Add JSDoc comments for complex components

**🛑 STOP: Wait for user confirmation before proceeding to next step**
✅ Documentation updated? (type `y` to proceed)

---

### 6. Git Workflow

- [ ] Stage all changes with verbose output:
  ```bash
  git add . -v
  ```
- [ ] Review staged changes carefully
- [ ] Unstage any unintended files (build artifacts, etc.):
  ```bash
  git reset <file>
  ```
- [ ] Commit with Conventional Commit format:
  ```bash
  git commit -m "feat(ui): short description"
  ```
- [ ] Reference issues, include breaking change if relevant

**🛑 STOP: Wait for user confirmation before proceeding to next step**
✅ All changes committed? (type `y` to continue)

---

### 7. Deployment (Optional)

- [ ] Push to the working branch:
  ```bash
  git push
  ```
- [ ] If on `main`, changes will deploy automatically via Heroku
- [ ] Verify frontend build succeeds in deployment
- [ ] Test deployed changes in production environment

✅ Frontend module development complete.

---

## Notes

**Server Development:**
* Use `db.js`, `env.js`, `authMiddleware` to ensure interoperability
* Always test migrations before comprehensive testing
* Authentication patterns prevent 90% of route testing failures

**Frontend Development:**
* Use `AuthContext`, `apiClient.ts`, `authUtils.ts` for consistency
* Build verification catches most integration issues early
* Component testing focuses on user interactions and props

**Common to Both:**
* **🛑 AI MUST STOP**: Wait for user confirmation (`y`) between every workflow step
* **📅 DATE CHECK**: Always confirm current date before making documentation changes
* Use `docs/01_guidance.md` as your reference for documentation rules
* Always pause if terminal is opened — assume model should wait for real-time debugging
* Documentation comes AFTER successful testing to ensure accuracy
* Global documentation updates only for significant changes that impact multiple systems

## Common Authentication Issues 🚨

**Server (Express Routes):**
- **❌ Wrong Import**: `const authMiddleware = require('../middleware/auth')` ← Missing destructuring
- **✅ Correct Import**: `const { authMiddleware } = require('../middleware/auth')` ← Destructuring required
- **❌ Wrong Usage**: `router.get('/api/test', authMiddleware)` ← Missing function call
- **✅ Correct Usage**: `router.get('/api/test', authMiddleware())` ← Function call required

**Frontend (React Components):**
- **❌ Wrong Import**: `import AuthContext from '../contexts/AuthContext'` ← Missing destructuring
- **✅ Correct Import**: `import { useAuth } from '../contexts/AuthContext'` ← Hook destructuring
- **❌ Wrong Usage**: `const user = AuthContext.user` ← Direct context access
- **✅ Correct Usage**: `const { user } = useAuth()` ← Hook usage required

**Testing (Jest Mocks):**
- **❌ Wrong Mock**: `jest.mock('../middleware/auth', () => jest.fn(...))` ← Wrong structure
- **✅ Correct Mock**: `jest.mock('../middleware/auth', () => ({ authMiddleware: jest.fn(...) }))` ← Object structure

**Why This Matters:**
- 90% of authentication-related test failures stem from incorrect import/mock patterns
- The `auth.js` module exports an object with multiple functions, not a single function
- Destructuring is required for both imports and mocks to work correctly
- Function calls are required when applying middleware to routes

**Quick Fix Checklist:**
- [ ] Import uses destructuring: `const { authMiddleware } = require(...)`
- [ ] Usage includes function call: `router.use(authMiddleware())`
- [ ] Tests mock the object structure: `{ authMiddleware: jest.fn(...) }`
- [ ] Frontend uses hook destructuring: `const { user } = useAuth()` 