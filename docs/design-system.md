# LREMS Design System

## Brand & Palette
- Primary: `primary` scale centered on DepEd Blue (`#002F87`)
- Neutrals: `neutral` 50–900 for backgrounds, borders, text
- Feedback: `success`, `warning`, `error` scales meeting WCAG AA contrast

## Typography
- Font family: Inter → system UI stack fallback
- Headings: semantic h1–h3 set via global Tailwind `@layer base`
- Body: `leading-relaxed`, maintain readable line length; avoid excessive uppercase

## Spacing & Layout
- Use Tailwind spacing scale; keep consistent padding (`p-5` in cards)
- Max content width: `max-w-7xl` for primary pages
- White space: prefer `gap-4/6`, avoid cramped stacks

## Components
- Buttons: `Button` with variants `primary | secondary | ghost | danger`
- Cards: `Card` with `header`, `footer`
- Loading: `Spinner` sizes `sm | md | lg`, `Skeleton` for tables and stats
- Alerts: `Alert` with tones `info | success | warning | error`

## Iconography
- Use existing SVG icons in `src/components/Icons.tsx`
- Keep icons 16–20px for labels, 24–32px for illustrative

## Accessibility (WCAG 2.1 AA)
- Skip link: `SkipNavLink` → `#main-content`
- Roles/aria: tabs use `role="tablist"` with `aria-selected`
- Focus: visible rings via `:focus-visible` global style
- Contrast: feedback and primary tones tuned for AA
- Motion: respect `prefers-reduced-motion`

## Micro-interactions
- Buttons: subtle `active:scale-[0.98]`, hover shadow
- Cards: hover `shadow-md`, avoid heavy drop shadows
- Copy-to-clipboard affordances for codes

## Performance
- Favor CSS transitions over JS animations
- Avoid excessive complex shadows; use Tailwind `shadow-sm/md`
- Skeletons reduce layout shift vs. spinners

## Usage Guidelines
- Default to reusable `ui` components
- Keep content and controls within visible hit target sizes (≥44px mobile)

