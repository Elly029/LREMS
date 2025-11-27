# Evaluator Dashboard Tour Guide

## Overview
The Evaluator Dashboard includes an interactive guided tour that helps users understand the key features and functionality. The tour is built using the `driver.js` library and provides context-aware guidance based on the user's role (Admin vs Evaluator).

## Features

### 1. **Context-Aware Content**
The tour adapts its content based on whether the user is:
- **Admin**: Shows information about monitoring all evaluators, managing assignments, and tracking progress
- **Evaluator**: Focuses on personal dashboard features, task management, and progress tracking

### 2. **Tour Steps**
The tour includes the following steps:

1. **Welcome Message** - Introduction to the dashboard
2. **Dashboard Statistics** - Explains the stats cards (Total Evaluators, Active Evaluators, etc.)
3. **Search Functionality** - How to search and filter evaluators
4. **Evaluator Profile Cards** - Understanding evaluator information
5. **Evaluator Details** - What information is available when clicking a card
6. **Role-Specific Features**:
   - Admin: Monitoring and management capabilities
   - Evaluator: Task management and progress tracking
7. **Completion Message** - Summary and how to restart the tour

### 3. **Accessing the Tour**

Users can start the tour in two ways:

#### Option 1: "Start Tour" Button on Dashboard
- Located in the top-right corner of the Evaluator Dashboard
- Blue button with an info icon
- Always visible when on the Evaluator Dashboard page

#### Option 2: Profile Menu
- Click on the user avatar (top-right of navigation bar)
- Select "Start Tour" from the dropdown menu
- Context-aware: starts the appropriate tour based on current page

### 4. **Tour Behavior**

- **Auto-start**: Disabled by default (can be enabled in code if desired)
- **Progress Indicator**: Shows current step number (e.g., "2 of 7")
- **Navigation**: Users can move forward, backward, or close the tour
- **Completion Tracking**: Tour completion is saved to localStorage
- **Restart Capability**: Users can restart the tour anytime

## Technical Implementation

### Files Involved:

1. **`EvaluatorDashboardTour.tsx`** - Tour logic and configuration
   - `useEvaluatorDashboardTour` hook - Main tour functionality
   - `EvaluatorDashboardTour` component - (Not currently used, but available)

2. **`EvaluatorDashboardTour.css`** - Custom styling for tour popovers
   - Modern design with gradients and shadows
   - Responsive layout for mobile devices
   - Smooth animations and transitions

3. **`EvaluatorDashboard.tsx`** - Dashboard component with tour integration
   - `data-tour` attributes on key elements
   - Tour start button
   - Hook integration

4. **`Layout.tsx`** - Global layout with context-aware tour handling
   - Profile menu integration
   - Route-specific tour triggering

5. **`App.tsx`** - Main app component
   - Tour state management via refs
   - Passing tour handlers between components

### Data Attributes:

The following `data-tour` attributes are used to identify tour elements:

- `data-tour="stats-section"` - Statistics cards grid
- `data-tour="search-input"` - Search bar container
- `data-tour="evaluator-card"` - First evaluator card (used as example)

### Customization:

#### Modifying Tour Steps:
Edit the `steps` array in `EvaluatorDashboardTour.tsx` (line ~26):

```typescript
steps: [
    {
        popover: {
            title: 'Step Title',
            description: 'Step description...'
        }
    },
    {
        element: '[data-tour="element-id"]',
        popover: {
            title: 'Step Title',
            description: 'Step description...'
        }
    }
]
```

#### Enabling Auto-start:
Uncomment lines in `useEvaluatorDashboardTour` (around line 103-105):

```typescript
if (!tourCompleted) {
    setTimeout(startTour, 500);
}
```

#### Customizing Styles:
Modify `EvaluatorDashboardTour.css` to change colors, spacing, animations, etc.

## Best Practices

1. **Keep tour concise**: 5-8 steps is optimal
2. **Use clear language**: Avoid jargon
3. **Highlight key features**: Focus on what users need most
4. **Test on mobile**: Ensure responsiveness
5. **Update with changes**: Keep tour in sync with UI updates

## Troubleshooting

### Tour not starting:
- Check browser console for errors
- Verify `data-tour` attributes exist on elements
- Ensure tour hasn't been completed (check localStorage: `evaluatorDashboardTourCompleted`)

### Elements not highlighting:
- Verify CSS selectors in tour steps match actual elements
- Check if elements are visible/rendered when tour starts
- Ensure no z-index conflicts

### Tour appears broken on mobile:
- Check responsive CSS in `EvaluatorDashboardTour.css`
- Verify viewport meta tag is present
- Test on actual devices, not just browser DevTools

## Future Enhancements

Potential improvements for the tour feature:

1. **Multiple Tours**: Separate tours for different pages (Inventory, Monitoring, etc.)
2. **Interactive Elements**: Allow users to interact with elements during tour
3. **Conditional Steps**: Show different steps based on user permissions
4. **Analytics**: Track which steps users skip or where they drop off
5. **Tooltips**: Mini-tours or contextual help for specific features
6. **Video Integration**: Embed short video tutorials in tour steps

## Dependencies

- **driver.js** (v1.4.0): Core tour functionality
- **React** (v19.2.0): Component framework
- **TypeScript** (~5.8.2): Type safety

## Support

For issues or questions about the tour feature:
1. Check this documentation
2. Review the driver.js documentation: https://driverjs.com
3. Inspect browser console for errors
4. Contact the development team
