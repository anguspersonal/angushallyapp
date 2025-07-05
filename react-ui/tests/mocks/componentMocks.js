// Mock common third-party components and libraries

// Mock React Router
export const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    pathname: '/',
    search: '',
    hash: '',
    state: null
  })
}));

// Mock Mantine notifications
jest.mock('@mantine/notifications', () => ({
  notifications: {
    show: jest.fn(),
    hide: jest.fn(),
    clean: jest.fn(),
    update: jest.fn()
  }
}));

// Mock Tabler icons commonly used in the app
jest.mock('@tabler/icons-react', () => ({
  IconExternalLink: () => <div data-testid="external-link-icon">External Link</div>,
  IconClock: () => <div data-testid="clock-icon">Clock</div>,
  IconBookmark: () => <div data-testid="bookmark-icon">Bookmark</div>,
  IconTag: () => <div data-testid="tag-icon">Tag</div>,
  IconUser: () => <div data-testid="user-icon">User</div>,
  IconLogin: () => <div data-testid="login-icon">Login</div>,
  IconLogout: () => <div data-testid="logout-icon">Logout</div>,
  IconHome: () => <div data-testid="home-icon">Home</div>,
  IconMail: () => <div data-testid="mail-icon">Mail</div>,
  IconPhone: () => <div data-testid="phone-icon">Phone</div>,
  IconCalendar: () => <div data-testid="calendar-icon">Calendar</div>,
  IconChart: () => <div data-testid="chart-icon">Chart</div>,
  IconPlus: () => <div data-testid="plus-icon">Plus</div>,
  IconMinus: () => <div data-testid="minus-icon">Minus</div>,
  IconEdit: () => <div data-testid="edit-icon">Edit</div>,
  IconTrash: () => <div data-testid="trash-icon">Trash</div>,
  IconSearch: () => <div data-testid="search-icon">Search</div>,
  IconFilter: () => <div data-testid="filter-icon">Filter</div>
}));

// Mock Google reCAPTCHA
jest.mock('react-google-recaptcha', () => ({
  __esModule: true,
  default: ({ onChange, ...props }) => (
    <div data-testid="recaptcha-mock" onClick={() => onChange && onChange('test-token')}>
      Mock reCAPTCHA
    </div>
  )
}));

// Mock Google OAuth
jest.mock('@react-oauth/google', () => ({
  GoogleLogin: ({ onSuccess, onError, ...props }) => (
    <button
      data-testid="google-login-mock"
      onClick={() => onSuccess && onSuccess({
        credential: 'mock-google-token'
      })}
    >
      Mock Google Login
    </button>
  ),
  GoogleOAuthProvider: ({ children }) => <div>{children}</div>
}));

// Mock React Markdown
jest.mock('react-markdown', () => {
  return ({ children }) => <div data-testid="markdown-content">{children}</div>;
});

// Mock Recharts components
jest.mock('recharts', () => ({
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>
}));

// Mock theme assets
jest.mock('../../src/theme', () => ({
  assets: {
    placeholderImage: {
      landscape: '/test-placeholder.jpg',
      portrait: '/test-placeholder-portrait.jpg',
      square: '/test-placeholder-square.jpg'
    }
  }
}));

// Reset all component mocks
export const resetComponentMocks = () => {
  mockNavigate.mockReset();
  jest.clearAllMocks();
}; 