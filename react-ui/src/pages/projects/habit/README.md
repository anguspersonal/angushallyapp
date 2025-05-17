# Habit Tracking UI

This module provides the user interface for tracking and visualizing habits, including alcohol consumption and exercise activities.

## Features

- Habit logging interface
- Data visualization
- Real-time updates
- Filtering and sorting
- Responsive design
- Dark/light theme support

## Components

### Main Components

#### HabitTracker
The main component that orchestrates the habit tracking interface.

```javascript
import { HabitTracker } from './components/HabitTracker';
```

#### HabitLogForm
Form component for logging new habits.

```javascript
import { HabitLogForm } from './components/HabitLogForm';
```

#### HabitStats
Component for displaying habit statistics and trends.

```javascript
import { HabitStats } from './components/HabitStats';
```

### UI Components

#### HabitCard
Displays individual habit entries with details.

```javascript
import { HabitCard } from './components/ui/HabitCard';
```

#### HabitChart
Visualizes habit data using charts.

```javascript
import { HabitChart } from './components/ui/HabitChart';
```

## Implementation

### State Management

```javascript
const [habits, setHabits] = useState([]);
const [stats, setStats] = useState({});
const [loading, setLoading] = useState(false);
```

### API Integration

```javascript
const fetchHabits = async () => {
  try {
    const response = await api.get('/habit');
    setHabits(response.data);
  } catch (error) {
    console.error('Error fetching habits:', error);
  }
};
```

### Data Visualization

```javascript
const renderChart = (data) => {
  return (
    <LineChart
      data={data}
      xAxis="date"
      yAxis="value"
      series={['alcohol', 'exercise']}
    />
  );
};
```

## Styling

### Theme Integration

```javascript
const theme = useTheme();
const styles = {
  container: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
  },
  // ... more styles
};
```

### Responsive Design

```javascript
const useStyles = makeStyles((theme) => ({
  root: {
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(3),
    },
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(1),
    },
  },
}));
```

## User Interactions

### Habit Logging

1. **Form Submission**
```javascript
const handleSubmit = async (values) => {
  try {
    await api.post('/habit', values);
    await fetchHabits();
  } catch (error) {
    console.error('Error logging habit:', error);
  }
};
```

2. **Validation**
```javascript
const validateForm = (values) => {
  const errors = {};
  if (!values.value) {
    errors.value = 'Required';
  }
  return errors;
};
```

### Data Filtering

```javascript
const filterHabits = (habits, filters) => {
  return habits.filter(habit => {
    return (
      (!filters.type || habit.type === filters.type) &&
      (!filters.date || habit.date === filters.date)
    );
  });
};
```

## Error Handling

### Error Boundaries

```javascript
class HabitErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

### Error Messages

```javascript
const ErrorMessage = ({ error }) => (
  <Alert severity="error">
    {error.message || 'An error occurred'}
  </Alert>
);
```

## Performance Optimization

### Memoization

```javascript
const MemoizedHabitCard = React.memo(HabitCard);
const MemoizedHabitChart = React.memo(HabitChart);
```

### Lazy Loading

```javascript
const HabitStats = React.lazy(() => import('./components/HabitStats'));
```

## Testing

### Component Tests

```javascript
describe('HabitTracker', () => {
  it('renders without crashing', () => {
    render(<HabitTracker />);
  });

  it('fetches habits on mount', () => {
    // Test implementation
  });
});
```

### Integration Tests

```javascript
describe('Habit Logging', () => {
  it('submits habit data correctly', async () => {
    // Test implementation
  });
});
```

## Accessibility

### ARIA Labels

```javascript
<button
  aria-label="Add new habit"
  onClick={handleAddHabit}
>
  <AddIcon />
</button>
```

### Keyboard Navigation

```javascript
const handleKeyPress = (event) => {
  if (event.key === 'Enter') {
    handleSubmit();
  }
};
```

## Contributing

1. Follow the established code style
2. Add tests for new features
3. Update documentation
4. Submit pull requests

## Dependencies
- @material-ui/core: UI components
- @material-ui/icons: Icons
- recharts: Data visualization
- date-fns: Date manipulation
- formik: Form handling
- yup: Form validation 