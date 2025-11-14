# Design Guidelines: Non-QM Mortgage Broker Website

## Design Approach
**Reference-Based: Modern Financial Services**
Drawing inspiration from Better.com's approachable mortgage design, SoFi's clean financial interfaces, and Stripe's trust-building aesthetic. Focus on credibility, clarity, and conversion while maintaining warmth and accessibility.

## Core Design Principles
1. **Trust Through Professionalism**: Clean, sophisticated layouts that communicate financial expertise
2. **Conversion-Focused**: Clear pathways to contact forms and loan applications
3. **Education-First**: Make complex loan products (DSCR, Hard Money) understandable

## Typography System
- **Headings**: Inter or DM Sans (700-800 weight) - modern, trustworthy
- **Body**: Inter or System UI (400-500 weight) - excellent readability
- **Accents**: Medium weight (600) for CTAs and emphasis
- **Hierarchy**: H1 (text-5xl to text-6xl), H2 (text-4xl), H3 (text-2xl), Body (text-base to text-lg)

## Layout System
**Spacing Primitives**: Tailwind units of 4, 6, 8, 12, 16, 20, 24
- Section padding: py-16 md:py-24 lg:py-32
- Component gaps: gap-6 to gap-12
- Container max-width: max-w-7xl with px-6

## Component Library

### Homepage Structure
1. **Hero Section** (with large background image):
   - Professional mortgage/real estate imagery (modern office, handshake, or home exterior)
   - Large headline: "Non-QM Loan Solutions for Real Estate Investors"
   - Subheadline explaining DSCR and Hard Money expertise
   - Primary CTA: "Get Pre-Qualified" + Secondary: "View Loan Products"
   - Trust indicators: "Licensed in 50 States" | "$2B+ Funded" | "24hr Approval"
   - Buttons with backdrop-blur-sm bg-white/20 treatment

2. **Loan Products Grid** (2-column on desktop):
   - DSCR Loans card with icon, rates, key benefits
   - Hard Money Loans card with icon, terms, use cases
   - Each card: image, title, bullet points, "Learn More" link
   - Cards with subtle border, hover lift effect

3. **Why Choose Us** (3-column):
   - Fast Approval | Flexible Terms | Expert Guidance
   - Icons from Heroicons, brief descriptions

4. **Interactive Calculator Section**:
   - DSCR calculator with inputs: Property value, Monthly rent, Monthly expenses
   - Real-time calculation display
   - "Get Custom Quote" CTA below results

5. **Social Proof**:
   - 3-column testimonial cards with investor photos
   - Star ratings, loan type badges
   - "See More Success Stories" link

6. **Final CTA Section**:
   - Split layout: Left (headline + benefits list), Right (lead capture form)
   - Form fields: Name, Email, Phone, Loan Type dropdown, Property Location
   - "Connect with a Loan Specialist" submit button

### Product Pages (DSCR & Hard Money)
- Hero with product-specific value proposition
- Loan requirements checklist (2-column grid)
- Rate table with terms comparison
- Use case scenarios (3-column cards)
- FAQ accordion
- Contact form in sidebar (sticky on desktop)

### Navigation
- Top bar: Logo left, nav center (Home, DSCR Loans, Hard Money, Calculator, About, Contact), CTA button right
- Sticky on scroll with backdrop blur
- Mobile: Hamburger menu with slide-in panel

### Forms
- Grouped inputs with labels above
- Generous padding (p-4)
- Focus states with ring treatment
- Submit buttons: full-width on mobile, auto on desktop
- Progress indicators for multi-step forms

### Footer
- 4-column layout: Company info, Loan Products, Resources, Contact
- Newsletter signup with horizontal input + button
- NMLS license number prominently displayed
- Social links, legal links

## Images
- **Hero**: Professional real estate/mortgage scene (modern office, property handshake, or luxury property exterior) - full-width, 70vh minimum
- **Product Cards**: DSCR (rental property/apartment building), Hard Money (fix-and-flip home)
- **Testimonials**: Professional headshots of investors/clients
- **About Page**: Team photo, office environment

## Animations
Minimal, professional:
- Subtle fade-in on scroll for sections
- Smooth calculator result transitions
- Hover lift (translate-y-1) on cards
- No distracting animations

## Key UX Patterns
- Multiple conversion points (every section has CTA)
- Phone numbers clickable (tel: links)
- Calculator results trigger "Speak to Specialist" prompt
- Forms include "How did you hear about us?" dropdown
- Mobile-first forms with large touch targets (min-h-12 inputs)

This design balances financial industry credibility with modern web aesthetics to build trust while driving loan applications.