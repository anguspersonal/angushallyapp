# 📊 Current React App Setup Analysis

## 🏗️ **Architecture Overview**

### **React Router Setup**
- **Version**: React Router v7 (`react-router-dom: ^7.6.3`)
- **Pattern**: Client-side routing with `<Routes>` and `<Route>`
- **Location**: All routes defined in `src/App.tsx`
- **Navigation**: Uses `useNavigate`, `Link`, `useParams`, `useLocation`

### **Route Structure (18 total routes)**
```
/ ............................ Home page
/about ....................... About page  
/blog ........................ Blog listing
/blog/:slug .................. Individual blog posts
/projects .................... Projects overview
/contact ..................... Contact form
/collab ...................... Collaboration page
/cv .......................... Software CV
/login ....................... Authentication
/share ....................... Share handler
/projects/eat-safe-uk ........ Food safety project
/projects/data-value-game .... Interactive game
/projects/strava ............. Strava integration
/projects/habit .............. Habit tracking
/projects/ai ................. AI projects overview
/projects/ai/text-analysis ... Text analysis tool
/projects/ai/instapaper ...... Instapaper integration
/projects/bookmarks .......... Bookmarks management
/projects/bookmarks/raindrop . Raindrop integration
```

## 🎨 **UI Framework & Styling**

### **Mantine UI Library v7.17.4**
- **Core**: `@mantine/core` for components
- **Extensions**: carousel, charts, forms, notifications, modals, etc.
- **Theme**: Custom theme in `src/theme.js` with color palettes
- **Icons**: `@tabler/icons-react` for icons

### **Styling Approach**
- **CSS**: Global CSS files (`index.css`, `general.css`)
- **Mantine**: Component-based styling with custom theme
- **Responsive**: Custom breakpoints defined in theme

## 🔐 **Authentication & State Management**

### **Authentication**
- **Provider**: Google OAuth (`@react-oauth/google`)
- **Context**: Custom `AuthContext` with TypeScript
- **Storage**: Local token storage with `authUtils`
- **Protection**: `ProtectedRoute` component for secured routes

### **API Integration**
- **Client**: Custom TypeScript API client (`apiClient.ts`)
- **Base URL**: Environment-based (`REACT_APP_API_BASE_URL`)
- **Features**: Token management, error handling, type safety
- **HTTP Library**: Fetch API (no axios dependency)

## 🧩 **Key Dependencies & Features**

### **Major Libraries**
```json
{
  "react": "^18.3.1",
  "react-router-dom": "^7.6.3",
  "@mantine/core": "^7.17.4",
  "@react-oauth/google": "^0.12.2",
  "framer-motion": "^12.7.4",
  "axios": "^1.7.9"
}
```

### **Specialized Features**
- **Maps**: Google Maps integration (`@googlemaps/js-api-loader`)
- **Charts**: Recharts + Mantine charts
- **Rich Text**: TipTap editor with extensions
- **Animations**: Framer Motion
- **Date Handling**: DayJS
- **Search**: Fuse.js for fuzzy search
- **Carousels**: Embla Carousel

## 📁 **File Structure Analysis**

### **Page Organization**
- **Top-level pages**: `src/pages/` (Home, About, Contact, etc.)
- **Project pages**: `src/pages/projects/[project-name]/`
- **Blog pages**: `src/pages/blog/`
- **Collaboration**: `src/pages/collab/`

### **Component Structure**
- **Shared components**: `src/components/`
- **Project-specific**: Nested within project folders
- **Layout**: Header/Footer components
- **Utilities**: `src/utils/` for API client, auth, etc.

## 🔧 **Build & Development**

### **Create React App v5.0.1**
- **Scripts**: Standard CRA scripts with TypeScript support
- **Build**: `react-scripts build`
- **Dev**: `react-scripts start` with legacy OpenSSL provider
- **Proxy**: Development proxy to `http://localhost:5000`

### **TypeScript Integration**
- **Mixed codebase**: `.tsx` and `.jsx` files coexist
- **Type definitions**: Custom types in `src/types/`
- **Configuration**: Standard CRA TypeScript setup

## 🎯 **Migration Complexity Assessment**

### **🟢 Low Complexity Routes** (Good migration candidates)
```
/about ...................... Static content
/contact .................... Form-based
/cv ......................... Static resume
/projects ................... Overview page
```

### **🟡 Medium Complexity Routes**
```
/ ........................... Home page with dynamic content
/blog ....................... Blog listing (may need data fetching)
/blog/:slug ................. Dynamic blog posts
/collab ..................... Complex interactive page
```

### **🔴 High Complexity Routes** (Migrate last)
```
/login ...................... Authentication flow
/share ...................... Share handler with URL params
/projects/data-value-game ... Interactive game
/projects/habit ............. Complex state management
/projects/ai/* .............. AI integrations
/projects/bookmarks/* ....... API-heavy features
```

## 🚀 **Recommended Migration Strategy**

### **Phase 2A: Simple Static Pages**
1. `/about` - Pure content page
2. `/contact` - Form with API integration
3. `/cv` - Static resume page

### **Phase 2B: Project Pages** 
1. `/projects` - Overview page
2. `/projects/eat-safe-uk` - Maps integration
3. `/projects/strava` - API integration

### **Phase 2C: Dynamic Content**
1. `/blog` - Blog listing
2. `/blog/:slug` - Dynamic routing
3. `/` - Home page

### **Phase 2D: Complex Features**
1. Authentication routes
2. Interactive applications
3. Real-time features

## 🔄 **Migration Considerations**

### **Shared Dependencies**
- Mantine components can be reused in Next.js
- API client is framework-agnostic
- Authentication context needs adaptation
- Theme configuration is portable

### **Route Mapping Strategy**
```
CRA Route              → Next.js Route
/about                → /about/page.tsx
/projects/strava      → /projects/strava/page.tsx
/blog/:slug           → /blog/[slug]/page.tsx
```

### **Key Challenges**
1. **Client-side routing** → File-based routing
2. **React Router hooks** → Next.js navigation
3. **CRA environment vars** → Next.js environment handling
4. **Global CSS** → Next.js CSS handling
5. **Authentication flow** → Next.js middleware/layout patterns

This analysis shows you have a well-structured, modern React application that's an excellent candidate for incremental migration to Next.js!