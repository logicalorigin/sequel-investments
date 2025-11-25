# Secured Asset Funding - Real Estate Investment Lending Platform

## Overview

Secured Asset Funding (SAF) is a professional marketing and lead generation website for an investor-focused real estate lender specializing in DSCR Loans, Fix & Flip Loans, and New Construction financing. The platform provides educational content about loan products, an interactive DSCR calculator, multi-step quote application flow, and lead capture forms to connect potential borrowers with loan specialists.

The design is inspired by leading fintech lenders like Kiavi and Easy Street Capital, featuring modern aesthetics, trust indicators, and conversion-focused layouts.

## Loan Products

### DSCR Loans (Long-Term Rental)
- Rates from 5.75%
- Up to 80% LTV (purchase/refi), 75% LTV (cash-out)
- Loan amounts: $100K - $3M
- 30-year fixed or 5/6 ARM options
- No minimum DSCR requirement
- No W2 or tax returns required
- Short-term rental (STR) friendly
- No seasoning required for BRRRR refinance

### Fix & Flip Loans
- Rates from 8.90%
- Up to 90% LTC / 70% ARV
- Loan amounts: $80K - $2M
- 6-12 month terms (interest-only)
- 48-hour closings available
- No appraisal required
- 48-hour draw process
- No prepayment penalty

### New Construction Loans
- Rates from 9.90%
- Up to 82.5% LTC
- 12-18 month terms
- 48-hour draw turnaround
- Spec homes and infill development
- Multi-home developments
- In-house servicing

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, using Vite as the build tool and development server.

**Routing**: Client-side routing implemented with Wouter. Routes include:
- `/` - Homepage with hero, stats, product cards, why choose us, calculator, testimonials
- `/dscr-loans` - DSCR Loans product page with detailed terms and sidebar form
- `/fix-flip` - Fix & Flip product page (replaces old hard-money route)
- `/new-construction` - New Construction product page
- `/calculator` - Interactive DSCR calculator page
- `/about` - About us page with company info and track record
- `/contact` - Contact page with lead form and contact details
- `/get-quote` - Multi-step quote application flow (Kiavi-style)

**UI Component System**: shadcn/ui component library in "New York" style, built on Radix UI primitives.

**Styling**: Tailwind CSS with custom design tokens. Theme supports light/dark modes. Typography uses Inter font family.

**State Management**: TanStack Query for server state, React Hook Form with Zod validation for forms.

### Backend Architecture

**Server Framework**: Express.js running on Node.js with TypeScript.

**API Endpoints**:
- `POST /api/leads` - Creates new lead submissions with Zod validation
- `GET /api/leads` - Retrieves all leads (administrative function)

**Storage**: In-memory storage (`MemStorage` class) with interface abstraction for easy database swap.

### Key Components

- `Navigation` - Sticky header with SAF logo, nav links, and "Get Your Rate" CTA
- `Footer` - 4-column layout with company info, loan products, quick links, newsletter
- `LeadForm` - Reusable lead capture form with field-level error handling
- `DSCRCalculator` - Interactive DSCR calculator with dynamic rate calculation based on credit score (660-800), LTV (up to 80%), DSCR (0.75-2.0+), and property type (SFR, 2-4 unit)
- `GetQuotePage` - Multi-step quote flow: loan type → property details → contact info
- `USMap` - Interactive SVG map of US states using SimpleMaps coordinates (viewBox: 0 0 1000 589). States are color-coded by loan volume and clickable for navigation to state detail pages

### Assets

**Logo Files**:
- Full logo: `attached_assets/ChatGPT Image Jun 25, 2025, 12_56_17 PM_1764028561921.png`
- Icon only: `attached_assets/ChatGPT Image Jun 25, 2025, 12_32_43 PM_1764028581255.png`

**Generated Images**:
- Hero background: `attached_assets/generated_images/Mortgage_office_hero_background_*.png`
- DSCR property: `attached_assets/generated_images/DSCR_loan_rental_property_*.png`
- Fix & Flip property: `attached_assets/generated_images/Hard_money_fix-and-flip_property_*.png`
- Testimonial headshots (3 images)

## Development

### Running the Project

The workflow `Start application` runs `npm run dev` which starts both Express backend and Vite frontend on port 5000.

### Key Files

- `client/src/App.tsx` - Route definitions
- `client/src/components/Navigation.tsx` - Header with SAF branding
- `client/src/components/Footer.tsx` - Footer with company info
- `client/src/components/LeadForm.tsx` - Reusable lead capture form
- `client/src/pages/GetQuotePage.tsx` - Multi-step quote application
- `shared/schema.ts` - Zod schemas and types for lead data
- `server/routes.ts` - API endpoints with validation
- `server/storage.ts` - In-memory storage interface

### Lead Data Schema

Lead submissions capture structured data:
- **Required fields**: name (min 2 chars), email (valid format), phone (min 10 digits)
- **Loan type**: "DSCR", "Fix & Flip", "New Construction", "Hard Money", "Both", "Other"
- **Optional fields**: propertyLocation, propertyValue, investmentExperience, message, howHeardAboutUs

The GetQuotePage captures propertyValue and investmentExperience as dedicated fields (not concatenated into message), enabling structured lead analysis.

### Trust Indicators

Homepage displays:
- $500M+ Loans Funded
- 1,500+ Investors Served
- 48hrs Fastest Closing
- 48 States + DC Licensed
