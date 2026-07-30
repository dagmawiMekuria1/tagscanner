# TagScanner — Design System (for Yuvi)

## Brand Identity

**TagScanner** is a professional-grade ITAD tool with a dark, technical aesthetic. The design communicates precision, speed, and intelligence.

### Personality

- **Technical**: Monospace fonts, data-dense layouts, grid patterns
- **Efficient**: Minimal clicks, clear hierarchy, fast flows
- **Intelligent**: AI indicators (sparkle badges), automated data population
- **Dark & Focused**: Deep dark backgrounds reduce eye strain in server rooms and warehouses

## Color System

### Core Palette

| Token | Hex | RGB | Usage |
|---|---|---|---|
| `--color-bg-deep` | `#0A0A0F` | `10, 10, 15` | Page background |
| `--color-bg-surface` | `#12121A` | `18, 18, 26` | Card/panel backgrounds |
| `--color-bg-surface-raised` | `#1A1A26` | `26, 26, 38` | Elevated cards, modals |
| `--color-bg-glass` | `rgba(255,255,255,0.03)` | — | Glassmorphism panels |
| `--color-border` | `rgba(255,255,255,0.06)` | — | Subtle borders |
| `--color-border-focus` | `rgba(0,255,136,0.4)` | — | Input focus borders |
| `--color-text-primary` | `#E8E8ED` | `232, 232, 237` | Primary body text |
| `--color-text-secondary` | `#8888A0` | `136, 136, 160` | Labels, hints, secondary info |
| `--color-text-muted` | `#555566` | `85, 85, 102` | Disabled text, placeholders |
| `--color-accent` | `#00FF88` | `0, 255, 136` | Primary accent (buttons, links, active states) |
| `--color-accent-dim` | `#00CC6A` | `0, 204, 106` | Hover/pressed accent |
| `--color-accent-glow` | `rgba(0,255,136,0.15)` | — | Glow behind accent elements |
| `--color-error` | `#FF4466` | `255, 68, 102` | Error states, destructive actions |
| `--color-warning` | `#FFAA00` | `255, 170, 0` | Warning states |
| `--color-sparkle` | `#00FF88` | — | AI-populated cell indicator |

### Usage Rules

- **Never use pure white (`#FFFFFF`)** for text. Maximum brightness is `#E8E8ED`.
- **Never use pure black (`#000000`)** for backgrounds. Minimum is `#0A0A0F`.
- **Accent green is reserved** for interactive elements and AI indicators. Don't use it for decorative purposes.
- **Error red and warning orange** appear only in context — never as decoration.

## Typography

### Font Stacks

```css
--font-display: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
--font-mono: ui-monospace, 'Cascadia Code', 'SF Mono', 'Courier New', monospace;
```

### Scale

| Token | Size | Use |
|---|---|---|
| `--text-xs` | `0.75rem` (12px) | Labels, badges, metadata |
| `--text-sm` | `0.875rem` (14px) | Secondary text, table cells |
| `--text-base` | `1rem` (16px) | Body text, inputs |
| `--text-lg` | `1.25rem` (20px) | Card titles, section headers |
| `--text-xl` | `1.5rem` (24px) | Page subtitles |
| `--text-2xl` | `2rem` (32px) | Page titles |
| `--text-3xl` | `2.5rem` (40px) | Hero text, large numbers |

### Weight

| Token | Value |
|---|---|
| `--weight-normal` | 400 |
| `--weight-medium` | 500 |
| `--weight-semibold` | 600 |
| `--weight-bold` | 700 |

### Conventions

- **Headings**: `--font-display`, `--weight-bold`
- **Body text**: `--font-display`, `--weight-normal`
- **Data values** (serial numbers, model numbers): `--font-mono`, `--weight-medium`
- **Labels and small caps**: `--font-mono`, `--text-xs`, `letter-spacing: 0.08em`, `text-transform: uppercase`
- **Buttons**: `--font-mono`, `--weight-semibold`, `text-transform: uppercase`, `letter-spacing: 0.06em`

## Spacing

4px base unit:

| Token | Value |
|---|---|
| `--space-1` | `0.25rem` (4px) |
| `--space-2` | `0.5rem` (8px) |
| `--space-3` | `0.75rem` (12px) |
| `--space-4` | `1rem` (16px) |
| `--space-5` | `1.25rem` (20px) |
| `--space-6` | `1.5rem` (24px) |
| `--space-8` | `2rem` (32px) |
| `--space-10` | `2.5rem` (40px) |
| `--space-12` | `3rem` (48px) |
| `--space-16` | `4rem` (64px) |

## Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `6px` | Small elements (badges, tags) |
| `--radius-md` | `10px` | Buttons, inputs |
| `--radius-lg` | `16px` | Cards, panels |
| `--radius-xl` | `24px` | Large cards, modals |
| `--radius-full` | `9999px` | Pills, circular elements |

## Shadows

```css
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.4);
--shadow-glow: 0 0 20px var(--color-accent-glow);
--shadow-glow-lg: 0 0 30px rgba(0, 255, 136, 0.3);
```

## Components

### Glass Card

The primary container for content blocks.

```css
.glass-card {
    background: var(--color-bg-glass);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
}
```

### Buttons

**Primary**: Green accent background, dark text, glow shadow, uppercase mono font.
**Ghost**: Transparent background, subtle border, light text. Border turns green on hover.

### Inputs

Dark inset background (`--color-bg-surface`), subtle border, rounded corners. On focus: green glow border with `box-shadow: 0 0 0 3px var(--color-accent-glow)`.

### Progress Dots

5 dots in a horizontal row:
- **Completed**: Solid `--color-accent-dim`, no glow
- **Active**: Solid `--color-accent` with glow pulse animation
- **Future**: Border only (`--color-border`), empty fill

### AI Sparkle Badge

A small inline SVG sparkle icon in `--color-sparkle` positioned next to AI-populated values. Has a subtle `pulse` animation (scale 1 → 1.2 → 1 over 2s, infinite).

### Toast Notifications

Fixed position, bottom-right. Dark surface background with colored left border:
- Success: green border
- Error: red border
- Warning: orange border
- Info: accent border

Auto-dismiss after 4 seconds with a fade-out animation.

## Background Pattern

Dot grid overlay on the body:

```css
body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 24px 24px;
    pointer-events: none;
    z-index: 0;
}
```

## Responsive Breakpoints

| Token | Value | Target |
|---|---|---|
| `--bp-sm` | `480px` | Small phones |
| `--bp-md` | `768px` | Tablets |
| `--bp-lg` | `1024px` | Desktops |
| `--bp-xl` | `1280px` | Wide screens |

### Layout Rules

- **Mobile (< 768px)**: Single column. Cards stack vertically. Table scrolls horizontally.
- **Tablet (768–1024px)**: Two-column grid for dashboard cards. Table fits without scroll for most columns.
- **Desktop (> 1024px)**: Full layout. Max-width containers center content.

### Page Max Widths

- **Dashboard**: `960px`
- **Capture flow**: `560px`
- **Inventory**: Full width with `--space-6` padding
- **Auth**: `400px`

## Animation

All animations are subtle and purposeful:

| Animation | Duration | Usage |
|---|---|---|
| `fadeIn` | `0.3s` | Page content appearing |
| `slideUp` | `0.3s` | Cards entering viewport |
| `glowPulse` | `2s infinite` | Active progress dot, processing state |
| `shimmer` | `1.5s infinite` | Loading skeleton states |
| `sparkle` | `2s infinite` | AI badge pulse |

Respect `prefers-reduced-motion`: disable all animations when the user prefers reduced motion.

## Iconography

All icons are inline SVGs. No icon fonts, no external icon libraries.

Icons use `currentColor` for fill/stroke so they inherit text color. Standard size: `20px × 20px` with `viewBox="0 0 24 24"`.

### Required Icons

- Camera (capture)
- Sparkle/Stars (AI indicator)
- Download/Export (Excel export)
- Search (inventory filter)
- Chevron (navigation, dropdowns)
- Check (success, completion)
- X/Close (dismiss, cancel)
- Edit/Pencil (inline edit)
- Sync/Refresh (Excel sync status)
- User (profile/avatar)
- Sign Out (logout)
- Menu/Hamburger (mobile nav)
- Plus (add new)
- Grid (category selector)