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

### Borrower Portal (ESC-Inspired)

- **Portal Navigation**: Portfolio, Investment Analysis (DSCR, Fix & Flip, Construction Analyzers).
- **Portal Landing Page**: Links to deal analyzers.
- **Application Detail Page**: Progress stepper, loan info, contact info, fees breakdown, funds to close, document status, and a "View Analysis" button for analyzer-created applications.
- **Analyzer-to-Application Data Persistence**: Scenario data from analyzers (DSCR, Fix & Flip, Construction) is saved with Draft applications, allowing for round-trip editing and data restoration.
- **Investment Analysis Page**: Comprehensive deal calculator with property, cost, and loan inputs, providing ROI, profit margin, and LTV/LTC. Includes specific DSCR calculator features for rental deals and Construction Calculator features (e.g., "Land is Owned" checkbox).
- **Profile Page**: User profile management, password, investment preferences, notification settings, connected entities, and account overview.
- **Shared Portal Header**: Consistent branding and user menu.

### Trust Indicators

Homepage displays: $500M+ Loans Funded, 1,500+ Investors Served, 48hrs Fastest Closing, 48 States + DC Licensed.

### State Pages Enhancement

Dedicated state pages (`/states/{state-slug}`) feature a Recent Fundings Dashboard, Market Data Widgets, a Mini DSCR Calculator, and state-specific investor testimonials.

## External Dependencies

- **Google Maps Places Autocomplete**: Used for address autocomplete in analyzer pages via `AddressAutocomplete` component.
- **Bridge Interactive (formerly Zillow API services)**: Recommended for property valuations, public records, and historical data. Requires manual approval and attribution.
- **Attom Data Solutions, Estated API, CoreLogic, HouseCanary**: Alternatives for comprehensive property data and AVMs for production environments.