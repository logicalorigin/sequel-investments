# Secured Asset Funding - Real Estate Investment Lending Platform

## Overview

Secured Asset Funding (SAF) is a professional marketing and lead generation website for an investor-focused real estate lender specializing in DSCR Loans, Fix & Flip Loans, and New Construction financing. The platform provides educational content, interactive calculators, a multi-step quote application, and lead capture forms to connect borrowers with loan specialists. The design is inspired by leading fintech lenders, featuring modern aesthetics, trust indicators, and conversion-focused layouts.

## User Preferences

I prefer simple language. I want iterative development. Ask before making major changes. I prefer detailed explanations. Do not make changes to the folder `Z`. Do not make changes to the file `Y`.

## System Architecture

### Frontend

**Framework**: React 18 with TypeScript, Vite.
**Routing**: Client-side routing with Wouter, supporting various public and authenticated portal routes.
**UI Components**: shadcn/ui ("New York" style) built on Radix UI.
**Styling**: Tailwind CSS with custom design tokens, light/dark modes, Inter font.
**State Management**: TanStack Query for server state, React Hook Form with Zod for form validation.

### Backend

**Server Framework**: Express.js on Node.js with TypeScript.
**API Endpoints**: `POST /api/leads` for lead submission, `GET /api/leads` for administration.
**Storage**: In-memory storage (`MemStorage`) with an interface for future database integration.

### Key Features and Components

- **Navigation & Footer**: Standard website navigation and footer with company info and quick links.
- **LeadForm**: Reusable form for lead capture with validation.
- **DSCRCalculator**: Interactive calculator for dynamic rate calculation based on credit score, LTV, DSCR, and property type.
- **STRCalculatorPage**: Short-term rental income estimator with market data and DSCR analysis.
- **GetQuotePage**: Multi-step application flow for loan quotes.
- **USMap**: Interactive SVG map showing loan volume by state, with clickable states for detailed pages.
- **RecentlyFundedCarousel**: Displays recent deals, filterable by loan type.
- **Teaser Calculators**: Full-featured calculators on public product pages (DSCR, Fix & Flip, Construction).
- **RatesTermsSection**: Kiavi-inspired visual cards displaying key loan metrics (rates, LTV, terms) with icons and benefit checkmarks.
- **ResourcesSection**: Blog-style resource showcase with categorized cards (Guide, Webinar, Article, Calculator) linking to educational content.

### Product Pages Structure (Kiavi-Inspired)

All three product pages (DSCR, Fix & Flip, New Construction) follow a consistent layout:
1. **Hero Section**: Badge, title, description, CTA button, and feature badges
2. **Rates & Terms Section**: Visual metric cards with icons showing key loan parameters and benefit checkmarks
3. **Recently Funded Carousel**: Recent deals for that loan type (moved higher for visibility)
4. **Main Content**: Program highlights, loan terms table, eligible properties, calculator, FAQs, and lead capture form
5. **Resources Section**: Blog-style cards linking to guides, articles, and calculators
6. **CTA Section**: Final call-to-action with primary background

### Loan Product Requirements

- **FICO Requirement**: 660+ minimum across all loan products (DSCR, Fix & Flip, New Construction)
- **Fix & Flip Terms**: Up to 90% of purchase price + 100% of rehab cost (not combined LTC)
- **DSCR Terms**: No minimum DSCR requirement, rates from 5.75%, 30-year fixed terms
- **Construction Terms**: Up to 90% LTC, 9-24 month terms, rates from 9.90%

### Borrower Portal (ESC-Inspired)

- **Portal Navigation**: Portfolio, Investment Analysis (DSCR, Fix & Flip, Construction Analyzers).
- **Portal Landing Page**: Links to deal analyzers.
- **Application Detail Page**: Progress stepper, loan info, contact info, fees breakdown, funds to close, document status, "View Analysis" button for analyzer-created applications, and "Submit Application" button for draft applications.
- **Analyzer-to-Application Data Persistence**: Scenario data from analyzers (DSCR, Fix & Flip, Construction) is saved with Draft applications, allowing for round-trip editing and data restoration.
- **Investment Analysis Page**: Comprehensive deal calculator with property, cost, and loan inputs, providing ROI, profit margin, and LTV/LTC. Includes specific DSCR calculator features for rental deals and Construction Calculator features (e.g., "Land is Owned" checkbox, state-based rates).
- **Analyzer Rate Structure**: 
  - Fix & Flip: 8.9% fixed base rate, credit score adjustments (+0% for 720+, +0.5% for 700-719, +1.0% for 680-699, +1.5% below 680)
  - Construction: State-based base rate (8.9% for California, 9.9% for non-California), same credit score adjustments
  - Origination Points: Linear scale from 2.0% at base rate to 0.0% at 12.9% rate (both analyzers)
- **Profile Page**: User profile management, password, investment preferences, notification settings, connected entities, and account overview.
- **Shared Portal Header**: Consistent branding and user menu.
- **Document Upload Organization**: Automated file organization creates deal-specific folders using the property address (e.g., "123 Main Street, Los Angeles, CA") for human-readable document storage. Files are stored as `/{dealName}/{uniqueId}_{fileName}`.

### Company Backend (Staff Portal)

- **Role-Based Access Control**: Three user roles - borrower (default), staff, admin. Staff and admin can access the Company Backend.
- **Admin Dashboard** (`/admin`): Pipeline view of all loan applications with filters for status and loan type. Shows stats cards for Total Apps, Submitted, In Review, Approved, Funded.
- **Application Management**: Staff can view any application, update status (draft/submitted/in_review/approved/funded/denied/withdrawn), and advance processing stage (Account Review → Underwriting → Term Sheet → Processing → Docs Out → Closed).
- **User Management** (Admin only): View all users, change user roles between borrower/staff/admin.
- **Staff Invitations** (Admin only): Create invitation links with 7-day expiry, send to email addresses with specified role (staff or admin). Invites are token-based and single-use.
- **Join Flow** (`/join/:token`): Invited users access the join page, sign in with the invited email address, and accept the invitation to gain staff/admin access.
- **Timeline Events**: Status and stage changes create timeline events with staff attribution.

### Trust Indicators

Homepage displays: $500M+ Loans Funded, 1,500+ Investors Served, 48hrs Fastest Closing, 48 States + DC Licensed.

### State Pages Enhancement

Dedicated state pages (`/states/{state-slug}`) feature a Recent Fundings Dashboard, Market Data Widgets, a Mini DSCR Calculator, and state-specific investor testimonials.

## External Dependencies

- **Google Maps Places Autocomplete**: Used for address autocomplete in analyzer pages via `AddressAutocomplete` component.
- **Bridge Interactive (formerly Zillow API services)**: Recommended for property valuations, public records, and historical data. Requires manual approval and attribution.
- **Attom Data Solutions, Estated API, CoreLogic, HouseCanary**: Alternatives for comprehensive property data and AVMs for production environments.