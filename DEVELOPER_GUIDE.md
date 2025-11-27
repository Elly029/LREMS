# Developer Guide - UI Optimization

## Quick Start

### Running the Application
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Architecture Overview

### Component Structure
```
src/
├── components/
│   ├── DataTable.tsx          # Main table with mobile card view
│   ├── Layout.tsx             # Responsive navigation and layout
│   ├── StatusFilterDropdown.tsx # Multi-select status filter
│   ├── ExportButtons.tsx      # PDF/Excel export buttons
│   └── ...
├── hooks/
│   ├── useDebounce.ts         # Debounce hook for search
│   ├── useFilterPersistence.ts # Filter state persistence
│   ├── useMediaQuery.ts       # Responsive breakpoint hooks
│   └── useOnClickOutside.ts   # Click outside detection
├── types.ts                   # TypeScript type definitions
└── App.tsx                    # Main application component
```

## Key Features Implementation

### 1. Filter Persistence

Filters are automatically saved to sessionStorage and restored on page load:

```typescript
// In App.tsx
const [filters, setFilters] = useState<Partial<Record<keyof Book, string | Status[]>>>(() => {
  try {
    const savedFilters = sessionStorage.getItem('bookFilters');
    return savedFilters ? JSON.parse(savedFilters) : {};
  } catch {
    return {};
  }
});

// Persist on change
useEffect(() => {
  sessionStorage.setItem('bookFilters', JSON.stringify(filters));
}, [filters]);
```

### 2. Responsive Design

The DataTable component automatically switches between table and card view:

```typescript
const [isMobileView, setIsMobileView] = useState(false);

useEffect(() => {
  const checkMobile = () => setIsMobileView(window.innerWidth < 768);
  checkMobile();
  window.addEventListener('resize', checkMobile);
  return () => window.removeEventListener('resize', checkMobile);
}, []);

if (isMobileView) {
  return <MobileCardView />;
}
return <DesktopTableView />;
```

### 3. Filter Logic

Filters support both string matching and array-based selection:

```typescript
const filteredBooks = useMemo(() => {
  return books.filter(book => {
    return (Object.keys(filters) as Array<keyof Book>).every(key => {
      const filterValue = filters[key];
      
      // Handle empty filters
      if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) {
        return true;
      }

      // Handle status array filter
      if (key === 'status' && Array.isArray(filterValue)) {
        return filterValue.includes(book.status);
      }

      // Handle string filters
      if (typeof filterValue === 'string') {
        const bookValue = book[key];
        if (typeof bookValue === 'string') {
          return bookValue.toLowerCase().includes(filterValue.toLowerCase());
        }
        if (typeof bookValue === 'number') {
          return bookValue.toString().includes(filterValue);
        }
      }
      
      return true;
    });
  });
}, [books, filters]);
```

## Custom Hooks Usage

### useFilterPersistence

Persist any state to storage:

```typescript
import { useFilterPersistence } from './hooks/useFilterPersistence';

const [filters, setFilters, clearFilters] = useFilterPersistence({
  key: 'myFilters',
  defaultValue: {},
  storage: 'session' // or 'local'
});

// Use like normal state
setFilters({ status: ['Active'] });

// Clear and reset
clearFilters();
```

### useMediaQuery

Responsive design hooks:

```typescript
import { useIsMobile, useIsTablet, useIsDesktop } from './hooks/useMediaQuery';

function MyComponent() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();

  return (
    <div>
      {isMobile && <MobileView />}
      {isTablet && <TabletView />}
      {isDesktop && <DesktopView />}
    </div>
  );
}
```

### useDebounce

Debounce input values:

```typescript
import { useDebounce } from './hooks/useDebounce';

const [searchTerm, setSearchTerm] = useState('');
const debouncedSearchTerm = useDebounce(searchTerm, 300);

// Use debouncedSearchTerm for API calls
useEffect(() => {
  fetchData(debouncedSearchTerm);
}, [debouncedSearchTerm]);
```

## Styling Guidelines

### Responsive Classes

Use Tailwind's responsive prefixes:

```tsx
<div className="
  px-3 sm:px-4 lg:px-8        // Padding
  text-sm sm:text-base lg:text-lg  // Font size
  hidden sm:block             // Visibility
  flex-col sm:flex-row        // Flex direction
">
```

### Common Patterns

```tsx
// Button with responsive sizing
<button className="
  px-3 sm:px-4 
  py-2 
  text-sm 
  rounded-lg 
  bg-primary-600 
  hover:bg-primary-700 
  active:scale-95 
  transition-all
">

// Card with responsive padding
<div className="
  p-3 sm:p-4 lg:p-6 
  bg-white 
  rounded-lg 
  shadow-sm 
  border border-gray-200
">

// Responsive grid
<div className="
  grid 
  grid-cols-1 
  sm:grid-cols-2 
  lg:grid-cols-3 
  gap-3 sm:gap-4
">
```

## Performance Best Practices

### 1. Memoization

Use `useMemo` for expensive computations:

```typescript
const sortedBooks = useMemo(() => {
  return [...filteredBooks].sort((a, b) => {
    // Sorting logic
  });
}, [filteredBooks, sortConfig]);
```

### 2. Debouncing

Debounce user input to reduce API calls:

```typescript
const debouncedSearchTerm = useDebounce(searchTerm, 300);

useEffect(() => {
  if (debouncedSearchTerm) {
    fetchBooks(debouncedSearchTerm);
  }
}, [debouncedSearchTerm]);
```

### 3. Conditional Rendering

Only render what's needed:

```typescript
{loading && <LoadingSpinner />}
{error && <ErrorMessage />}
{!loading && !error && <DataTable />}
```

## Accessibility Checklist

- [ ] All interactive elements have proper ARIA labels
- [ ] Keyboard navigation works throughout the app
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG AA standards
- [ ] Form inputs have associated labels
- [ ] Error messages are announced to screen readers
- [ ] Modal dialogs trap focus properly

## Testing

### Manual Testing Checklist

#### Responsive Design
- [ ] Test on mobile (< 768px)
- [ ] Test on tablet (768px - 1023px)
- [ ] Test on desktop (≥ 1024px)
- [ ] Test landscape and portrait orientations
- [ ] Verify touch interactions on mobile

#### Filters
- [ ] Apply single filter
- [ ] Apply multiple filters
- [ ] Clear individual filter
- [ ] Clear all filters
- [ ] Verify persistence after refresh
- [ ] Test search functionality
- [ ] Test status multi-select

#### Loading States
- [ ] Initial page load
- [ ] Filter application
- [ ] Delete operation
- [ ] Error states

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Common Issues & Solutions

### Issue: Filters not persisting
**Solution**: Check browser's sessionStorage is enabled and not full

### Issue: Mobile view not activating
**Solution**: Verify window.innerWidth is being checked correctly and resize listener is attached

### Issue: Sticky header offset incorrect
**Solution**: Ensure headerRef is properly measuring the header height

### Issue: Dropdown positioning wrong
**Solution**: Check z-index values and parent positioning context

## Code Style

### TypeScript
- Use explicit types for props and state
- Avoid `any` type
- Use interfaces for object shapes
- Export types from types.ts

### React
- Use functional components
- Use hooks for state and effects
- Keep components focused and small
- Extract reusable logic to custom hooks

### CSS/Tailwind
- Use Tailwind utilities first
- Create custom CSS only when necessary
- Follow mobile-first approach
- Use consistent spacing scale

## Deployment

### Build Optimization
```bash
# Production build
npm run build

# Preview production build
npm run preview
```

### Environment Variables
Create `.env` file for configuration:
```
VITE_API_URL=http://localhost:3000
```

## Support

For issues or questions:
1. Check this guide first
2. Review UI_OPTIMIZATION_SUMMARY.md
3. Check component comments
4. Review TypeScript types in types.ts

## Contributing

When adding new features:
1. Follow existing patterns
2. Add TypeScript types
3. Ensure responsive design
4. Test on multiple devices
5. Update documentation
6. Check accessibility
