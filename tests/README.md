# Frontend Testing Guide

This directory contains the centralized testing infrastructure for the Next.js frontend, following patterns established in `/server/tests/` while leveraging Vitest for modern React testing.

## Directory Structure

```
tests/
├── setup.ts              # Test environment configuration
├── fixtures/
│   └── testUtils.tsx     # Shared test utilities and render helpers
├── components/           # Component tests
├── utils/                # Utility function tests
└── services/             # Service/API client tests
```

## Quick Start

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run Vitest UI (interactive)
npm run test:ui
```

## Testing Patterns

### Component Tests

Use React Testing Library with the custom `renderWithProviders` helper:

```tsx
import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from '../fixtures/testUtils';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    renderWithProviders(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Testing with Authentication

The `renderWithProviders` helper accepts options for auth state:

```tsx
import { renderWithProviders } from '../fixtures/testUtils';

const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
};

it('shows user-specific content', () => {
  renderWithProviders(<MyComponent />, {
    user: mockUser,
  });
  // Test authenticated state
});
```

### Utility Function Tests

Test pure functions directly:

```tsx
import { describe, it, expect } from 'vitest';
import { calculateUnits } from '@/utils/calculateUnits';

describe('calculateUnits', () => {
  it('calculates units correctly', () => {
    const result = calculateUnits(500, 5, 1);
    expect(result).toBe(2.5);
  });
});
```

### Service/API Tests

Mock API calls using Vitest:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { api } from '@/shared/apiClient';

vi.mock('@/shared/apiClient', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('MyService', () => {
  it('fetches data correctly', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: 'test' });
    // Test service logic
  });
});
```

## Mocking Next.js Features

### Router

The router is automatically mocked in `tests/setup.ts`. To customize:

```tsx
import { useRouter } from 'next/navigation';

const mockPush = vi.fn();
vi.mocked(useRouter).mockReturnValue({
  push: mockPush,
  // ... other methods
});
```

### Image Component

Next.js `Image` is automatically mocked to render as a regular `<img>` tag.

### Link Component

Next.js `Link` is automatically mocked to render as a regular `<a>` tag.

## Testing with Mantine UI

Components are automatically wrapped with `MantineProvider` via `renderWithProviders`. No additional setup needed.

## Test File Naming

Follow the convention: `*.test.{ts,tsx}`

- Component tests: `ComponentName.test.tsx`
- Utility tests: `utilityName.test.ts`
- Service tests: `serviceName.test.ts`

## Coverage Expectations

- **Components**: Aim for critical user interactions and rendering logic
- **Utils**: Target 100% coverage for pure functions
- **Services**: Test API integration points and error handling

## Common Patterns

### Testing User Interactions

```tsx
import userEvent from '@testing-library/user-event';

it('handles button click', async () => {
  const user = userEvent.setup();
  renderWithProviders(<MyComponent />);
  
  const button = screen.getByRole('button', { name: 'Submit' });
  await user.click(button);
  
  expect(screen.getByText('Submitted')).toBeInTheDocument();
});
```

### Testing Async Operations

```tsx
import { waitFor } from '@testing-library/react';

it('loads data asynchronously', async () => {
  renderWithProviders(<MyComponent />);
  
  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  });
});
```

### Mocking Hooks

```tsx
import { useAuth } from '@/providers/AuthProvider';

vi.mock('@/providers/AuthProvider', async () => {
  const actual = await vi.importActual('@/providers/AuthProvider');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

// In test
(useAuth as any).mockReturnValue({
  user: mockUser,
  logout: vi.fn(),
});
```

## Alignment with Backend Testing

This frontend test infrastructure mirrors patterns from `/server/tests/`:

- Similar directory structure (`tests/` at project root)
- Setup file for environment configuration
- Fixtures directory for shared utilities
- Consistent test naming conventions (`*.test.{ts,tsx}`)
- Coverage reporting enabled

## Troubleshooting

### Tests not finding modules

Ensure path aliases in `vitest.config.ts` match `tsconfig.json`. The config includes:
- `@/*` → `src/*`
- `@/types/*` → `src/types/*`
- `@shared/*` → `../shared/*`

### Mantine components not rendering

Ensure you're using `renderWithProviders` which wraps components with `MantineProvider`.

### Next.js router not working

The router is mocked in `tests/setup.ts`. If you need custom behavior, override the mock in your test file.

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Jest DOM Matchers](https://github.com/testing-library/jest-dom)

