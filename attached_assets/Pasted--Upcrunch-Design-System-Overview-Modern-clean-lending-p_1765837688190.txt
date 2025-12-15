
# Upcrunch Design System

## Overview
Modern, clean lending platform design with pill-shaped buttons, zero border radius on containers, and a purple-cyan gradient accent system. Targets business professionals and startups with a professional yet approachable aesthetic.

## Color Palette

### Primary Colors
- **Primary Brand**: `#23D7FF` (Cyan) - Primary CTAs, accents
- **Secondary Brand**: `#806BFF` (Purple) - Secondary CTAs, highlights
- **Background**: `#FFFFFF` (White) - Main background
- **Surface**: `#F7F7F9` (Light Gray) - Input backgrounds, subtle containers
- **Text Primary**: `#000000` (Black) - Headings, primary text
- **Text Secondary**: `#5E5773` (Muted Purple) - Links, secondary text

### Usage Guidelines
- Use cyan (#23D7FF) for primary actions and key highlights
- Use purple (#806BFF) for secondary actions and complementary elements
- Maintain high contrast between text and backgrounds
- Use #F7F7F9 for input fields and subtle background differentiation

## Typography

### Font Family
- **Primary**: Odudo (fallback: sans-serif)
- **Headings**: Odudo, sans-serif
- **Body**: Odudo, sans-serif

### Font Sizes
- **H1**: 60px (3.75rem) - Hero headings
- **H2**: 45px (2.8125rem) - Section headings
- **Body**: 20px (1.25rem) - Paragraph text
- **Label**: 16px (1rem) - Form labels, buttons

### Font Weights
- **Headings**: 700 (Bold) - All heading levels
- **Body**: 400 (Regular) - Paragraph text
- **Buttons**: 600 (Semibold) - CTA text

## Component Design

### Buttons

#### Primary Button
- **Background**: #23D7FF (Cyan)
- **Text Color**: #FFFFFF (White)
- **Border Radius**: 100px (Pill shape)
- **Padding**: 12px 32px
- **Font Weight**: 600
- **Shadow**: None
- **Hover**: Slight opacity change (0.9)

#### Secondary Button
- **Background**: #806BFF (Purple)
- **Text Color**: #FFFFFF (White)
- **Border Radius**: 100px (Pill shape)
- **Padding**: 12px 32px
- **Font Weight**: 600
- **Shadow**: None
- **Hover**: Slight opacity change (0.9)

#### Outline Button
- **Background**: Transparent
- **Border**: 2px solid #23D7FF
- **Text Color**: #23D7FF
- **Border Radius**: 100px (Pill shape)
- **Padding**: 10px 30px

### Input Fields
- **Background**: #F7F7F9 (Light Gray)
- **Text Color**: #333333
- **Border**: None
- **Border Radius**: 100px (Pill shape)
- **Padding**: 14px 24px
- **Font Size**: 16px
- **Shadow**: None
- **Focus**: Border 2px solid #23D7FF

### Cards
- **Background**: #FFFFFF
- **Border**: 1px solid #E5E5E5
- **Border Radius**: 0px (Sharp corners)
- **Padding**: 32px
- **Shadow**: None (or very subtle on hover)

### Container Elements
- **Border Radius**: 0px (All containers use sharp corners)
- **Max Width**: 1200px (Content wrapper)
- **Padding**: 24px on mobile, 48px on desktop

## Layout Patterns

### Hero Section
- Full-width background
- Centered content with max-width constraint
- Large heading (60px) with subheading
- Pill-shaped CTA buttons side-by-side
- Optional background gradient or pattern

### Product Comparison Section
- 3-column grid on desktop, stacked on mobile
- Each column has:
  - Heading with icon
  - Feature list with checkmarks
  - Pill-shaped CTA at bottom
- Sharp-cornered cards with subtle borders

### Trust Indicators
- Horizontal badges/logos layout
- Subtle background (#F7F7F9)
- Even spacing between elements
- Responsive wrapping on mobile

### Form Sections
- Pill-shaped inputs with light gray backgrounds
- Labels above inputs
- Pill-shaped submit button (cyan)
- Generous spacing between fields

## Spacing System

### Base Unit: 8px

- **xs**: 8px (0.5rem)
- **sm**: 16px (1rem)
- **md**: 24px (1.5rem)
- **lg**: 32px (2rem)
- **xl**: 48px (3rem)
- **2xl**: 64px (4rem)

### Component Spacing
- **Section Padding**: 48px top/bottom on desktop, 32px on mobile
- **Card Padding**: 32px all sides
- **Button Padding**: 12px vertical, 32px horizontal
- **Input Padding**: 14px vertical, 24px horizontal
- **Grid Gap**: 24px on desktop, 16px on mobile

## Animations & Interactions

### Transitions
- **Duration**: 200ms (fast), 300ms (standard)
- **Easing**: ease-in-out
- **Properties**: opacity, transform, background-color

### Hover States
- **Buttons**: Opacity 0.9
- **Cards**: Subtle lift (translateY(-2px)) with shadow
- **Links**: Color change to primary brand color

### Focus States
- **Inputs**: 2px solid border in primary color (#23D7FF)
- **Buttons**: 2px outline offset 2px

## Design Principles

### Key Characteristics
1. **Pill-shaped interactives**: All buttons and inputs use 100px border radius
2. **Sharp containers**: Cards and sections use 0px border radius for modern look
3. **High contrast**: Black text on white backgrounds for readability
4. **Gradient accents**: Purple-to-cyan gradients for visual interest
5. **Minimal shadows**: Rely on borders and spacing for depth
6. **Clean typography**: Bold headings with regular body text

### Best Practices
- Always use pill buttons for primary actions
- Keep cards and containers with sharp corners (0px radius)
- Use light gray backgrounds (#F7F7F9) for input fields
- Maintain generous whitespace between sections
- Use cyan for primary CTAs, purple for secondary
- Keep shadows minimal or non-existent
- Use icons sparingly and consistently

## Responsive Behavior

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Adaptations
- Stack multi-column layouts vertically
- Reduce heading sizes (H1: 36px, H2: 28px)
- Reduce padding (24px instead of 48px)
- Full-width buttons on mobile
- Maintain pill shape on all interactive elements

## Implementation Notes

### CSS Utilities Needed
```css
.upcrunch-pill-button {
  border-radius: 100px;
  padding: 12px 32px;
  font-weight: 600;
  transition: opacity 200ms ease-in-out;
}

.upcrunch-pill-button:hover {
  opacity: 0.9;
}

.upcrunch-card {
  border-radius: 0px;
  padding: 32px;
  border: 1px solid #E5E5E5;
}

.upcrunch-input {
  background: #F7F7F9;
  border-radius: 100px;
  padding: 14px 24px;
  border: none;
}

.upcrunch-input:focus {
  outline: none;
  border: 2px solid #23D7FF;
}
```

### Tailwind Configuration
```javascript
colors: {
  'upcrunch-cyan': '#23D7FF',
  'upcrunch-purple': '#806BFF',
  'upcrunch-surface': '#F7F7F9',
  'upcrunch-text': '#5E5773',
}
```
