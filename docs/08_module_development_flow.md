# Module Development Flow

## Module Development Workflow (Manual Mode)

This guide supports consistent, verifiable module development flows within `angushallyapp`.  
The default mode is **manual**: the model will pause and ask for `"y"` confirmation at each step.  
If the terminal is opened during this process (e.g. to run tests), **wait for user input/output before proceeding**. If user says auto, complete all steps without pauses.

**⚠️ CRITICAL: The AI must stop and wait for user confirmation (`y`) between EVERY step in both workflows.**

**Choose your development context:**
- [**Server Development**](#server-development-workflow) - For changes in `/server`
- [**Frontend Development**](#frontend-development-workflow) - For changes in `/react-ui`

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

### 3. Implementation Validation

- [ ] Quick smoke test of core functionality
- [ ] Verify integration with existing systems
- [ ] Confirm interfaces match project patterns

**🛑 STOP: Wait for user confirmation before proceeding to next step**
✅ Implementation validated? (type `y` to continue)

---

### 4. Database Migration (If Applicable)

**If migration files were created:**
- [ ] Review migration files for correctness
- [ ] Run migrations in development environment:
  ```bash
  npm run migrate
  ```
- [ ] Verify schema changes in database
- [ ] Test rollback if migration is reversible:
  ```bash
  npm run migrate:rollback
  npm run migrate
  ```

⚠️ **Critical**: Always test migrations before proceeding to comprehensive testing  
💡 **Common issue**: Migration failures can break all subsequent tests

**🛑 STOP: Wait for user confirmation before proceeding to next step**
✅ Migrations completed successfully? (type `y` to continue)

---

### 5. Feature Testing

- [ ] Create test file(s) using the pattern:
  - `test[ModuleName].unit.test.js`
  - `test[ModuleName].integration.test.js`
  - `test[ModuleName]Controller.test.js`
- [ ] Add scripts or logs under `scripts/test/` if needed
- [ ] Load environment with `require('../../config/env')`
- [ ] Run tests from the correct working directory
- [ ] **Note**: Tests now run against updated database schema

**⚠️ Authentication Mocking (Critical for Route Testing):**
If your route uses authentication, use this EXACT pattern:
```javascript
jest.mock('../middleware/auth', () => ({
  authMiddleware: (req, res, next) => {
    req.user = { id: 'test-user-id' };
    next();
  }
}));

const { authMiddleware } = require('../middleware/auth');
```

**❌ Never mock as**: 
```javascript
jest.mock('../middleware/auth', () => jest.fn(...));  // ← This fails
```

⚠️ If user opens the terminal, **pause and wait** for command output  
💡 Common issue: tests fail when run from the wrong directory — double check!  
💡 **Authentication errors**: Check import destructuring and mock object structure

**🛑 STOP: Wait for user confirmation before proceeding to next step**
✅ Tests written and passing? (type `y` to continue)

---

### 6. Documentation (Post-Testing)

- [ ] Review what documentation changes need to be made to local and global documentation
- [ ] For guidance on documentation requirements, see `docs/01_guidance.md`
- [ ] **📅 DATE CHECK**: Confirm the current date for documentation timestamps and changelog entries

**🛑 STOP: Confirm current date with user before making documentation changes**
📅 What is today's date for documentation updates? (Please provide date in YYYY-MM-DD format)

**📝 Updates Documentation Format (`docs/03_updates.md`):**
- [ ] **Chronological Order**: Add new updates at the TOP of the file (most recent first)
- [ ] **Section Header Format**: Use `## Update[number] - [short name] - [YYYY-MM-DD] - [Uncommitted/Committed/Current]`
  - **[number]**: Incrementing update number, starting from 001 for the earliest update
  - **[short name]**: A concise summary of the update (e.g. 'Bookmark Transfer', 'Next.js Migration', 'Footer Modernization')
  - **[YYYY-MM-DD]**: Date of the update
  - **[status]**: Uncommitted, Committed, or Current
- [ ] **Example**: `## Update005 - MIME Type Fix - 2025-07-07 - Committed`
- [ ] **Numbering**: Increment the update number for each new section (Update001, Update002, etc.)
- [ ] **Short Name**: Use a concise, descriptive short name summarizing the update
- [ ] **Content**: Include detailed description of changes, technical implementation, and impact
- [ ] **Status Update**: After committing changes, update the section header status from `Uncommitted` to `Current` or `Committed` as appropriate

**🛑 STOP: Wait for user confirmation before proceeding to next step**
✅ Documentation updated? (type `y` to proceed)

---

### 7. Git Workflow

- [ ] Stage all changes with verbose output:
  ```bash
  git add . -v
  ```
- [ ] Review staged changes carefully
- [ ] Unstage any unintended files:
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

### 8. Deployment (Optional)

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
- [ ] Check for open issues or tasks in `react-ui/BACKLOG.md` related to this change
- [ ] Confirm the component/page location within `react-ui/src/`

**🛑 STOP: Wait for user confirmation before proceeding to next step**
✅ Ready to proceed? (type `y`)

---

### 2. Component Implementation

- [ ] Create or update React components in appropriate directories:
  - Pages: `react-ui/src/pages/`
  - Components: `react-ui/src/components/`
  - Utilities: `react-ui/src/utils/`
- [ ] Follow naming conventions: `PascalCase.jsx` for components
- [ ] Use shared utilities (`apiClient.js`, `authUtils.js`) if applicable
- [ ] Import styling: component-specific CSS or `mantine-overrides.css`

**⚠️ Authentication Setup (Critical for Protected Components):**
- [ ] **AuthContext Import**: `import { useAuth } from '../contexts/AuthContext'`
- [ ] **Protected Routes**: Use `<ProtectedRoute>` wrapper for auth-required pages
- [ ] **Token Handling**: Use `authUtils.js` for token management

**🛑 STOP: Wait for user confirmation before proceeding to next step**
✅ Implementation complete? (type `y` to proceed)

---

### 3. Implementation Validation

- [ ] Quick visual/functional test of component
- [ ] Verify integration with existing components and state
- [ ] Check responsive design on different screen sizes
- [ ] Confirm styling matches project design patterns

**🛑 STOP: Wait for user confirmation before proceeding to next step**
✅ Implementation validated? (type `y` to continue)

---

### 4. Build Verification

- [ ] Ensure no build errors:
  ```bash
  cd react-ui && npm run build
  ```
- [ ] Check for any TypeScript/ESLint warnings
- [ ] Verify no console errors in development mode:
  ```bash
  cd react-ui && npm start
  ```

⚠️ **Critical**: Build must be clean before testing  
💡 **Common issue**: Import path errors or missing dependencies

**🛑 STOP: Wait for user confirmation before proceeding to next step**
✅ Build completed successfully? (type `y` to continue)

---

### 5. Component Testing

- [ ] Create test file(s) using the pattern:
  - `[ComponentName].test.jsx` (alongside component)
  - Follow existing test patterns in `components/` directory
  - Shared testing utilities & mocks live in `react-ui/src/__tests__/` (import via `@tests/...` alias)
- [ ] Use React Testing Library for component testing
- [ ] Test user interactions, props, and state changes
- [ ] Run tests from `react-ui` directory:
  ```bash
  cd react-ui && npm test
  ```

**⚠️ Authentication Context Mocking (Critical for Auth-dependent Components):**
```javascript
import { AuthContext } from '../contexts/AuthContext';

const mockAuthContext = {
  user: { id: 'test-user', email: 'test@example.com' },
  isAuthenticated: true,
  login: jest.fn(),
  logout: jest.fn()
};

// Wrap component in test
<AuthContext.Provider value={mockAuthContext}>
  <YourComponent />
</AuthContext.Provider>
```

⚠️ If user opens the terminal, **pause and wait** for command output  
💡 Common issue: tests fail due to missing context providers or API mocks

**🛑 STOP: Wait for user confirmation before proceeding to next step**
✅ Tests written and passing? (type `y` to continue)

---

### 6. Documentation (Post-Testing)

- [ ] Review what documentation changes need to be made to local and global documentation
- [ ] For guidance on documentation requirements, see `docs/01_guidance.md`. If changes are react-nextjs migration specific then refer to `09_nextjs_migration_tracker`.
- [ ] **📅 DATE CHECK**: Confirm the current date for documentation timestamps and changelog entries

**🛑 STOP: Confirm current date with user before making documentation changes**
📅 What is today's date for documentation updates? (Please provide date in YYYY-MM-DD format)

**📝 Updates Documentation Format (`docs/03_updates.md`):**
- [ ] **Chronological Order**: Add new updates at the TOP of the file (most recent first)
- [ ] **Section Header Format**: Use `## Update[number] - [short name] - [YYYY-MM-DD] - [Uncommitted/Committed/Current]`
  - **[number]**: Incrementing update number, starting from 001 for the earliest update
  - **[short name]**: A concise summary of the update (e.g. 'Bookmark Transfer', 'Next.js Migration', 'Footer Modernization')
  - **[YYYY-MM-DD]**: Date of the update
  - **[status]**: Uncommitted, Committed, or Current
- [ ] **Example**: `## Update005 - MIME Type Fix - 2025-07-07 - Committed`
- [ ] **Numbering**: Increment the update number for each new section (Update001, Update002, etc.)
- [ ] **Short Name**: Use a concise, descriptive short name summarizing the update
- [ ] **Content**: Include detailed description of changes, technical implementation, and impact
- [ ] **Status Update**: After committing changes, update the section header status from `Uncommitted` to `Current` or `Committed` as appropriate

**🛑 STOP: Wait for user confirmation before proceeding to next step**
✅ Documentation updated? (type `y` to proceed)

---

### 7. Git Workflow

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

### 8. Deployment (Optional)

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
* Use `AuthContext`, `apiClient.js`, `authUtils.js` for consistency
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
**The `auth.js` module exports an OBJECT**: `{ authMiddleware, verifyGoogleToken, requireRoles }`

**✅ Correct Route Import**: `const { authMiddleware } = require('../middleware/auth')`  
**❌ Wrong Route Import**: `const authMiddleware = require('../middleware/auth')`

**Frontend (React Components):**
**The `AuthContext` provides user state and authentication methods**

**✅ Correct Context Usage**: `const { user, isAuthenticated } = useAuth()`  
**❌ Wrong Context Usage**: Direct token manipulation without context

*These patterns prevent 90% of authentication failures in both environments.* 