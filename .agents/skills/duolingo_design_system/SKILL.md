---
name: duolingo_design_system
description: Rules and guidelines for applying the Duolingo Design System (colors, typography, spacing, components) to UI elements in the project.
---

# Duolingo Design System

Use this design system for all UI generated or modified in the workspace.

## Design Tokens

### Colors
- **primary**: `#a5ed6e` (vibrant lime-green) - success/progress, CTAs
- **on-primary**: `#111111` (near-black) - text over green/primary
- **background**: `#ddf4ff` (pale sky-blue) - main window background
- **text**: `#3c3c3c` (charcoal) - default body text (neutral, high-contrast, reduced eye strain)
- **text-muted**: `#777777` (mid-gray) - secondary info, hints, disabled states
- **accent**: `#1cb0f6` (bright cyan-blue) - interactive highlights, links, focus/state changes

### Typography (duolingo-sans)
- **display**: `fontFamily: "duolingo-sans, sans-serif"`, `fontSize: 15px`, `fontWeight: 700`, `lineHeight: 1.5`, `letterSpacing: 0.8px` (headings, hero statements)
- **heading**: `fontFamily: "duolingo-sans, sans-serif"`, `fontSize: 14px`, `fontWeight: 600`, `lineHeight: 1.5`, `letterSpacing: 0.8px` (section titles, moderate hierarchy)
- **body**: `fontFamily: "duolingo-sans, sans-serif"`, `fontSize: 13px`, `fontWeight: 700`, `lineHeight: 1.23` (default text, bold by default for mobile scannability)

### Spacing & Grid
- **base unit**: `10px`
- Use multiples of `10px` for margins and paddings (e.g., `10px`, `20px` internal padding; `30px` to `50px` for block gaps).

### Radii
- **sm**: `2px` (fine details, tags)
- **md**: `12px` (buttons, cards, content containers)

### Shadows
- **card / elevated**: `rgb(128, 128, 128) 0px 0px 5px 0px` (subtle diffuse shadow)

### Motion
- **duration**: `300ms` for all transitions (snappy, responsive feel)
- **easing**: `linear` or custom simple transitions

### Breakpoints
- `400px` (small phones/SE)
- `426px` (standard mobile)
- `550px` (large phones/tablets)

---

## Component Guidelines

### Call-to-Action (CTA) Buttons
- **Background**: `#a5ed6e`
- **Text Color**: `#111111` (bold, readable)
- **Border Radius**: `12px`
- **Touch Target**: At least `44x44px`

### Cards / Containers
- **Background**: `#ddf4ff` or white/custom within the blue theme
- **Border Radius**: `12px`
- **Shadow**: `0px 0px 5px rgb(128, 128, 128)`

### Focus States
- Keyboard navigation or interactive focus: `2px` solid outline in accent blue (`#1cb0f6`) or primary green (`#a5ed6e`), offset by `2px` outside the boundary.

### Accessibility Rules
- **Contrast**: Default body text `#3c3c3c` on `#ddf4ff` exceeds WCAG AAA (18:1).
- **Muted/Accent Text**: Muted text (`#777777`) or accent links (`#1cb0f6`) directly on `#ddf4ff` background fail WCAG AA contrast. Ensure they are underlined, have icons, or are paired with high-contrast elements. Do not rely on color alone to convey state or links.
