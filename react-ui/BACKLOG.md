# Authentication Features Backlog

## Future Authentication Methods
- [ ] Email/Password Registration System
  - Create registration form component
  - Add email verification flow
  - Implement password reset functionality
  - Add email notifications for account actions

## User Profile & Personalization
- [ ] Add user profile section showing Google account information
  - Display user's name, email, and profile picture
  - Add ability to update profile settings
  - Show user's activity history

## Login Experience Improvements
- [ ] Add loading states during authentication
  - Show loading spinner during Google sign-in
  - Disable login button while processing
- [ ] Enhance error handling
  - Display user-friendly error messages
  - Handle network errors gracefully
  - Add retry mechanism for failed logins

## UI/UX Enhancements
- [ ] Style login page to match site design
  - Add custom Google sign-in button styling
  - Improve layout and spacing
  - Add animations for better user experience
- [ ] Add "Welcome back" message
  - Show personalized greeting for returning users
  - Display last login time
  - Add quick access to recent activities

## Technical Debt
- [ ] Refactor authentication logic into a custom hook
- [ ] **TypeScript Migration (Major)** - ✅ **ANALYSIS COMPLETE**
  - ✅ **Analysis Complete**: Comprehensive migration analysis completed (see `docs/typescript-migration-analysis.md`)
  - ✅ **Ready for Implementation**: TypeScript already installed, Create React App supports seamless migration
  - ✅ **Implementation Plan**: Four-phase incremental migration strategy with 1-2 week timeline
  - ✅ **Phase 1**: Foundation setup (tsconfig.json, package.json scripts) - **COMPLETE** (2025-01-27)
  - ✅ **Phase 2**: Core type definitions (User, API responses, contexts) - **COMPLETE** (2025-01-27)
  - [ ] **Phase 3**: Incremental file conversion (utils → contexts → components → pages)
  - [ ] **Phase 4**: Optional server integration with shared types
  - **Priority**: High (upgraded from Medium based on analysis)
  - **Risk**: Low (well-supported migration path)
  - **Benefit**: 15-20% reduction in runtime errors, enhanced developer experience
- [ ] **Testing Strategy Standardization**
  - [ ] Decide on co-located vs centralized frontend testing
  - [ ] Consider moving frontend tests to centralized location (like /react-ui/tests/) for consistency with /server/tests
  - [ ] Standardize testing patterns across frontend and backend
- [ ] Add unit tests for authentication components
- [ ] Add integration tests for auth flow
- [ ] Token Refresh Mechanism (Future Enhancement)
  - Add refresh_tokens table for better token management
  - Implement token refresh endpoints
  - Add automatic token refresh in frontend
  - Enable device tracking and session management
  - Allow token revocation for security