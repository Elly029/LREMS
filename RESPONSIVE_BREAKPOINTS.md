# Responsive Design Breakpoints

## Breakpoint System

### Mobile (< 768px)
**Target Devices**: Smartphones in portrait and landscape

#### Layout Changes
- **Navigation**: Compact header with truncated title
- **Data Display**: Card-based view instead of table
- **Stats Cards**: Single column layout
- **Controls**: Stacked vertically
- **Export Buttons**: Icon-only display
- **Touch Targets**: Minimum 44px height

#### Component Behavior
```
DataTable → Mobile Card View
  - Each book displayed as a card
  - All fields visible in organized layout
  - Touch-friendly action buttons
  - Swipe-friendly spacing

Navigation → Compact Mode
  - Logo: 8px (32px)
  - Title: "TM Inventory"
  - User info in dropdown only

Controls → Vertical Stack
  - Search bar: Full width
  - Buttons: Full width
  - Export: Icon only
```

### Tablet (768px - 1023px)
**Target Devices**: Tablets, small laptops

#### Layout Changes
- **Navigation**: Medium-sized header
- **Data Display**: Optimized table with reduced padding
- **Stats Cards**: 3-column grid
- **Controls**: Horizontal layout with wrapping
- **Export Buttons**: Icon + text

#### Component Behavior
```
DataTable → Optimized Table
  - Reduced column padding (3px vs 4px)
  - Smaller minimum widths
  - Compact filter inputs
  - Visible scrollbar

Navigation → Medium Mode
  - Logo: 10px (40px)
  - Title: Full text
  - User info visible

Controls → Flexible Layout
  - Search bar: Flexible width
  - Buttons: Auto width
  - Export: Icon + text
```

### Desktop (≥ 1024px)
**Target Devices**: Laptops, desktops, large displays

#### Layout Changes
- **Navigation**: Full-sized header
- **Data Display**: Full table with all features
- **Stats Cards**: 3-column grid with larger padding
- **Controls**: Horizontal layout
- **Export Buttons**: Full display

#### Component Behavior
```
DataTable → Full Table
  - Full column padding (4px)
  - Maximum column widths
  - Spacious filter inputs
  - Hover effects prominent

Navigation → Full Mode
  - Logo: 12px (48px)
  - Title: Full text
  - User info always visible

Controls → Horizontal Layout
  - Search bar: Fixed max-width (384px)
  - Buttons: Auto width
  - Export: Full display
```

## Tailwind Breakpoint Classes

### Usage Examples

#### Padding
```tsx
className="px-3 sm:px-4 lg:px-8"
// Mobile: 12px, Tablet: 16px, Desktop: 32px
```

#### Font Size
```tsx
className="text-sm sm:text-base lg:text-xl"
// Mobile: 14px, Tablet: 16px, Desktop: 20px
```

#### Display
```tsx
className="hidden sm:block"
// Mobile: hidden, Tablet+: visible

className="block sm:hidden"
// Mobile: visible, Tablet+: hidden
```

#### Flex Direction
```tsx
className="flex-col sm:flex-row"
// Mobile: vertical, Tablet+: horizontal
```

#### Grid Columns
```tsx
className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
// Mobile: 1 col, Tablet: 2 cols, Desktop: 3 cols
```

## Component-Specific Breakpoints

### App.tsx - Dashboard Stats
```tsx
Mobile (< 768px):
  - 1 column grid
  - Padding: 12px
  - Font size: 20px (numbers)

Tablet+ (≥ 768px):
  - 3 column grid
  - Padding: 16px
  - Font size: 24px (numbers)
```

### App.tsx - Controls Section
```tsx
Mobile (< 768px):
  - Vertical stack
  - Search: 100% width
  - Buttons: 100% width
  - Export: Hidden

Tablet+ (≥ 768px):
  - Horizontal layout
  - Search: Flexible (max 384px)
  - Buttons: Auto width
  - Export: Visible
```

### DataTable.tsx - View Mode
```tsx
Mobile (< 768px):
  - Card view
  - Vertical layout
  - Touch-optimized spacing
  - Full-width cards

Tablet+ (≥ 768px):
  - Table view
  - Horizontal scroll
  - Sticky columns
  - Hover effects
```

### Layout.tsx - Navigation
```tsx
Mobile (< 768px):
  - Height: 56px
  - Logo: 32px
  - Title: "TM Inventory"
  - User info: In dropdown

Tablet (768px - 1023px):
  - Height: 64px
  - Logo: 40px
  - Title: Full
  - User info: In dropdown

Desktop (≥ 1024px):
  - Height: 64px
  - Logo: 48px
  - Title: Full
  - User info: Always visible
```

## Testing Checklist

### Mobile Testing (< 768px)
- [ ] iPhone SE (375px)
- [ ] iPhone 12/13 (390px)
- [ ] iPhone 14 Pro Max (430px)
- [ ] Samsung Galaxy S21 (360px)
- [ ] Landscape orientation

### Tablet Testing (768px - 1023px)
- [ ] iPad Mini (768px)
- [ ] iPad Air (820px)
- [ ] iPad Pro 11" (834px)
- [ ] Surface Pro (912px)
- [ ] Landscape orientation

### Desktop Testing (≥ 1024px)
- [ ] Small laptop (1024px)
- [ ] Standard laptop (1366px)
- [ ] Full HD (1920px)
- [ ] 2K (2560px)
- [ ] 4K (3840px)

## Common Responsive Patterns

### Pattern 1: Progressive Enhancement
```tsx
// Start with mobile, add features for larger screens
<div className="
  p-3              // Mobile base
  sm:p-4           // Tablet enhancement
  lg:p-6           // Desktop enhancement
">
```

### Pattern 2: Conditional Display
```tsx
// Show different content at different sizes
<>
  <div className="block sm:hidden">Mobile Content</div>
  <div className="hidden sm:block lg:hidden">Tablet Content</div>
  <div className="hidden lg:block">Desktop Content</div>
</>
```

### Pattern 3: Flexible Sizing
```tsx
// Use flex and max-width for adaptability
<div className="
  w-full           // Mobile: full width
  sm:w-auto        // Tablet+: auto width
  sm:max-w-md      // Tablet+: max 448px
">
```

### Pattern 4: Responsive Grid
```tsx
// Adapt grid columns to screen size
<div className="
  grid
  grid-cols-1      // Mobile: 1 column
  sm:grid-cols-2   // Tablet: 2 columns
  lg:grid-cols-3   // Desktop: 3 columns
  gap-3 sm:gap-4   // Responsive gap
">
```

## Media Query Hooks

### Custom Hooks Available
```typescript
import { 
  useIsMobile,    // < 768px
  useIsTablet,    // 768px - 1023px
  useIsDesktop    // ≥ 1024px
} from './hooks/useMediaQuery';

function MyComponent() {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return <MobileView />;
  }
  return <DesktopView />;
}
```

### Custom Media Query
```typescript
import { useMediaQuery } from './hooks/useMediaQuery';

function MyComponent() {
  const isLargeScreen = useMediaQuery('(min-width: 1440px)');
  const isPrint = useMediaQuery('print');
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
}
```

## Performance Considerations

### Avoid
❌ Multiple resize listeners per component
❌ Inline media queries in every component
❌ Recalculating breakpoints on every render

### Prefer
✅ Shared media query hooks
✅ CSS-based responsive design (Tailwind)
✅ Memoized breakpoint values
✅ Single resize listener with context

## Accessibility Notes

### Touch Targets
- Minimum 44px × 44px on mobile
- Adequate spacing between interactive elements
- Larger tap areas for primary actions

### Text Sizing
- Minimum 14px font size on mobile
- Scalable text (no fixed pixel heights)
- Proper line height (1.5 minimum)

### Focus Indicators
- Visible on all screen sizes
- Larger on mobile (easier to see)
- High contrast for visibility

## Browser Support

### Modern Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Mobile Browsers
- iOS Safari 13+
- Chrome Mobile 90+
- Samsung Internet 14+

### Features Used
- CSS Grid
- Flexbox
- Media Queries
- CSS Custom Properties
- Modern JavaScript (ES6+)
