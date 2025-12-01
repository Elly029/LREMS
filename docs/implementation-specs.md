# Implementation Specifications

## Tokens
- Tailwind `theme.extend.colors`: `primary`, `neutral`, `success`, `warning`, `error`
- Fonts: `fontFamily.sans` updated with system fallbacks
- Shadows & radius: extended for polished yet performant visuals

## Global Styles
- `src/index.css` sets base typography and focus styles
- Component utilities: `.card`, `.btn`, variants refined for consistency

## Components
- `src/components/ui/Button.tsx`: variants, optional loading, icon slots
- `src/components/ui/Spinner.tsx`: sizes and fullscreen overlay support
- `src/components/ui/Skeleton.tsx`: `TableSkeleton`, `StatsSkeleton`
- `src/components/ui/Alert.tsx`: tones with optional CTA and dismiss
- `src/components/ui/Card.tsx`: structured content wrappers

## Integration
- Replace inline spinners with `Spinner`
- Use skeletons for tables (books) and stats (dashboard)
- Standardize error visuals using `Alert`

## Accessibility
- Add `SkipNavLink`; main content `id="main-content"`
- Navigation tabs: `role="tablist"`, `role="tab"`, `aria-selected`
- Ensure interactive elements have visible focus and labels

## Responsive
- Preserve Tailwind responsive classes; maintain `max-w-7xl` and `gap-*` patterns

## Testing & Validation
- Manual runs across small, medium, large viewports
- Keyboard-only navigation for tabs and menus
- Contrast check of primary and feedback tones against white/neutral backgrounds

