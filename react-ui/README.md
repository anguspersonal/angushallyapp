# React Frontend Application

A modern React application for habit tracking with Material-UI components, Google Maps integration, and responsive design.

## Features

- User authentication with Google OAuth
- Habit tracking interface
- Data visualization
- Google Maps integration
- Responsive design
- Material-UI components

## Project Structure

```
react-ui/
├── public/                 # Static files
├── src/
│   ├── components/        # Reusable components
│   │   └── projects/     # Project-specific pages
│   │       ├── habit/    # Habit tracking feature
│   │       └── data-value-game/ # Data value game
│   ├── utils/            # Utility functions
│   │   ├── apiClient.js  # API client
│   │   └── auth.js       # Authentication utilities
│   ├── App.js           # Main application component
│   └── index.js         # Application entry point
└── package.json         # Dependencies and scripts
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Google Cloud Platform account (for OAuth)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Required environment variables:
```env
REACT_APP_API_BASE_URL=http://localhost:3001/api
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

3. Start the development server:
```bash
npm start
```

## Development

### Available Scripts

- `npm start`: Start development server
- `npm test`: Run tests
- `npm run build`: Build for production
- `npm run eject`: Eject from Create React App

### Code Style

- Follow ESLint configuration
- Use functional components with hooks
- Implement proper error handling
- Write meaningful component documentation

### Component Structure

```jsx
import React from 'react';
import PropTypes from 'prop-types';

const Component = ({ prop1, prop2 }) => {
  // Component logic
  
  return (
    // JSX
  );
};

Component.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number
};

export default Component;
```

## Key Features

### Authentication
- Google OAuth integration
- Token management
- Protected routes
- Session handling

### API Integration
- Centralized API client
- Error handling
- Request/response interceptors
- Token refresh

### State Management
- React Context for global state
- Local state with useState
- Custom hooks for reusable logic

## Testing

### Unit Tests
```bash
npm test
```

### Component Tests
```bash
npm test -- --coverage
```

## Deployment

### Production Build
```bash
npm run build
```

### Environment Configuration
- Development: `.env.development`
- Production: `.env.production`
- Test: `.env.test`

## Dependencies

### Core
- React
- React Router
- Material-UI
- Axios

### Development
- ESLint
- Prettier
- Jest
- React Testing Library

## Contributing

1. Follow the established code style
2. Write tests for new features
3. Update documentation
4. Submit pull requests

## Related Documentation
- [Component Library](./src/components/README.md)
- [Habit Tracking UI](./src/pages/projects/habit/README.md)
- [API Client](./src/utils/apiClient.js)