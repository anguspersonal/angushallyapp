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

## Upcoming Phases

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