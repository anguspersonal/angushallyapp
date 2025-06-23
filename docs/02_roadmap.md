# Project Roadmap

This document outlines the high-level vision, goals, and planned development phases for **angushallyapp**.

## Vision

**angushallyapp** aims to serve as:
- A personal portfolio showcasing my work and skills
- A platform for useful tools serving myself, friends, and family
- A playground for exploring new technologies and development patterns

## Strategic Goals

1. **Content Management**
   - Maintain a flexible, modern blog system
   - Showcase projects and portfolio items
   - Support rich media content

2. **Personal Tooling**
   - Track personal habits (exercise, alcohol consumption)
   - Integrate with fitness platforms (Strava)
   - Time tracking via RescueTime API
   - Provide useful UK food safety information

3. **User Experience**
   - Create a cohesive, intuitive interface
   - Support responsive design for all devices
   - Implement robust authentication and authorization

## Completed Phases

1. ✅ **Core Platform**
   - Established base infrastructure and deployment pipeline
   - Set up PostgreSQL database with initial schemas
   - Created React frontend with Material UI components
   - Implemented Heroku deployment workflow
   - Configured continuous integration

2. ✅ **Content Management**
   - Built blog post creation and display system
   - Implemented author profiles and attribution
   - Added support for rich text content
   - Created content schema with proper relationships
   - Set up slug-based routing for articles

3. ✅ **Eat Safe UK Integration**
   - Established FSA data synchronization system
   - Built XML parsing and database storage
   - Created search interface for food establishments
   - Implemented map view with location markers
   - Added address-based matching algorithm

4. ✅ **Habit Tracking Foundation**
   - Created habit logging and visualization system
   - Integrated with Strava API for activity data
   - Implemented RescueTime API connection for productivity data
   - Built reporting interface with filters and date ranges
   - Added basic goal tracking functionality

5. ✅ **Contact Form & CRM System**
   - Built secure contact submission system
   - Implemented Google reCAPTCHA integration
   - Created CRM schema for inquiry management
   - Set up email notification system
   - Added admin interface for inquiry management
   - Implemented data isolation and privacy controls

6. ✅ **Authentication System**
   - Phase 1: Schema & Identity Framework ✅
     - Created `identity` schema with users, roles, and permissions tables
     - Designed comprehensive role-based access control architecture
     - Set up initial migrations for identity schema
     - Established PostgreSQL schema separation strategy
   
   - Phase 1b: Data Migration & Backfill ✅
     - Migrated legacy users from existing tables to identity schema
     - Preserved user history and relationships
     - Assigned appropriate roles to existing users
     - Handled conflict resolution for duplicate entries
   
   - Phase 1c: Foreign Key Updates ✅
     - Updated all habit tracking tables to link to identity users
     - Created CRM inquiries table with user linkage
     - Refined database configuration for multi-schema support
     - Implemented safer identifier quoting and SQL practices
   
   - Phase 1d/1e: API Integration ✅
     - Updated content routes to work with new schema
     - Aligned frontend data fetching with new endpoints
     - Stabilized schema across development and production
     - Fixed migration ordering and deployment issues
   
   - Phase 2: Auth Integration 🔄
     - Implement Google OAuth 2.0 with proper error handling
     - Create JWT token management and verification
     - Add "Remember me" functionality
     - Build role-based middleware and authorization framework
     - Enhanced security with proper CORS and headers

   - Phase 3: Access-Request Workflow (Backlogged)
     - Client form to POST /identity/access_requests
     - Admin UI (React) to list pending requests
     - Endpoints to approve/reject requests
     - Automatic role assignment on approval

   - Phase 4: RBAC Middleware & Data Guards (Backlogged)
     - Build authorize(roles…) middleware
     - Apply to admin routes
     - Update existing routes to filter by req.user.id
     - Write integration tests

   - Phase 5: Frontend Integration (1-2 weeks)
     - Complete Google Sign-In implementation
     - Update JWT storage in apiClient
     - Implement Auth context
     - Build Admin dashboard

7. ✅ **Raindrop.io Bookmark Integration**
   - Implemented OAuth 2.0 authentication flow with Raindrop.io
   - Created secure token storage in PostgreSQL `raindrop` schema
   - Built bookmark synchronization service
   - Developed React UI for viewing and managing bookmarks
   - Added proper error handling and user feedback
   - Successfully tested with real user data (3 bookmarks synced)

8. ✅ **Production Deployment Safety System**
   - Addressed production deployment risks through environment consistency verification
   - Created comprehensive `checkEnvSync.js` pre-deployment validation script
   - Implemented multi-environment database connectivity and schema validation
   - Added migration version synchronization checks and data consistency warnings
   - Integrated CI/CD-ready exit codes for automated deployment gating
   - Established deployment safety protocols with clear pass/fail criteria
   - Comprehensive test coverage and troubleshooting documentation

9. ✅ **F5 Universal Certainty Scoring Framework** 
   - **Status**: ✅ **Complete** - Production-ready foundation for F-series modules (2025-06-23)
   - **Core Achievement**: Comprehensive confidence scoring system for platform-specific content intelligence
   - **Technical Implementation**:
     - 4-factor weighted confidence algorithm (Source Quality 40%, Completeness 25%, API Compliance 20%, Validation 15%)
     - 5-tier confidence levels (EXCELLENT to VERY_POOR)
     - Platform-specific validation for Instagram, LinkedIn, YouTube, Twitter
     - Database integration with intelligence levels and processing status tracking
   - **API Suite**: 6 production-ready endpoints for assessment, validation, and analytics
   - **Quality Assurance**: 40 comprehensive tests with 80%+ coverage, migration rollback testing
   - **Strategic Impact**: Ready foundation for F1-F4 platform-specific intelligence modules

## Upcoming Phases

### Bookmark System Enhancement
- **Phase 1: Schema Consolidation & Auto-Transfer** ✅
  - **A3 - Bookmark Transfer to Canonical** ✅: Full implementation of staging-to-canonical transfer system
  - **A3.1 - Frontend Display** ✅: Unified bookmark display from canonical table
  - **A3.2 - Automatic Transfer** ✅: **Production issue resolved** - automatic transfer system with hybrid approach:
    - On-demand auto-transfer when users access bookmarks
    - Bulk migration for existing users (`npm run migrate`)
    - OpenGraph metadata enrichment during transfer
    - Frontend notification system with transfer statistics
    - Enhanced API response format with `_metadata` object
    - Zero-downtime deployment with backward compatibility
  - **Data Validation**: Comprehensive validation system with 37 test cases
  - **Testing**: 100+ test cases with full coverage for transfer and validation
  - **Migration Scripts**: Added standardized migration commands (`npm run migrate`, `migrate:rollback`, etc.)

- **Phase 2: Platform-Specific Content Intelligence** 🔄 **IN PROGRESS - 2025-06-23**
  - **Architectural Shift**: Moved from generic content processing to platform-specific intelligence extraction
  - **Critical Discovery**: Social media platforms (Instagram, LinkedIn) require specialized parsing approaches
  - **F-Series Modules Status**:
    - ✅ **F5 - Universal Certainty Scoring** ✅ **COMPLETE**: Production-ready foundation with confidence assessment and platform validation
    - 🔄 **F1 - Instagram Intelligence** (Next Priority): Caption analysis, hashtag extraction, engagement context
    - 🔄 **F2 - LinkedIn Intelligence** (Planned): Professional context, engagement signals, content classification  
    - 🔄 **F3 - YouTube Intelligence** (Planned): Description/comments analysis, accessibility features
    - 🔄 **F4 - Twitter/X Intelligence** (Planned): Thread analysis, real-time signals, engagement patterns
  - **Tiered Processing Approach**:
    - L1: Platform metadata only (instant, 60-70% accuracy)
    - L2: Enhanced context analysis (fast, 75-85% accuracy)
    - L3: Deep web agent analysis (slow, 85-95% accuracy)
    - L4: Manual user enrichment (variable, 95-100% accuracy)
  - **Deprecated**: Generic content ingestion pipeline (C1) - replaced by platform-specific adapters
  - **Foundation Complete**: F5 framework ready to support all future platform-specific modules

- **Phase 3: Multi-Source Integration**
  - Design extensible bookmark source interface
  - Implement additional bookmark sources (e.g., Pocket, Instapaper)
  - Create unified bookmark sync system
  - Build source-specific configuration UI

### Enhanced Habit Tracker
- Improved data visualization
- Goal setting and tracking
- Social sharing capabilities
- Enhanced Strava integration

### Time Tracking Application
- Personal time tracking
- Project categorization
- Reporting and analytics
- Integration with habit data

### Admin Dashboard
- Centralized management interface
- User administration
- Content moderation tools
- System health monitoring

## Long-Term Vision

- Expand to additional personal productivity tools
- Implement machine learning for habit insights
- Create mobile application companion
- Develop API for third-party integrations