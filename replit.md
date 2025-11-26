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

### New Construction Loans (Ground-Up Construction)
- Rates from 9.90%
- Up to 90% LTC
- 9-month base term (extensions available)
- 48-hour draw turnaround
- Project size: 1-4 units
- Multi-home developments (up to 4 units per parcel)
- Spec homes and infill development
- In-house servicing

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, using Vite as the build tool and development server.

**Routing**: Client-side routing implemented with Wouter. Routes include:
- `/` - Homepage with hero, stats, product cards, why choose us, testimonials
- `/dscr-loans` - DSCR Loans product page with detailed terms, sidebar form, DSCR calculator, and Recently Funded Carousel
- `/fix-flip` - Fix & Flip product page with Fix & Flip calculator and Recently Funded Carousel
- `/new-construction` - New Construction product page with Construction calculator and Recently Funded Carousel
- `/calculator` - Interactive DSCR calculator page
- `/str-calculator` - STR (Short-Term Rental) income estimator with market data
- `/about` - About us page with company info and track record
- `/contact` - Contact page with lead form and contact details
- `/get-quote` - Multi-step quote application flow (Kiavi-style)
- `/portal` - Customer portal with loan applications list
- `/portal/application/:id` - Application detail page with progress stepper, loan info, fees, funds to close
- `/portal/application/:id/documents` - Document upload and checklist page
- `/portal/investment-analysis` - All-in-One Investment Analysis deal calculator with DSCR/ROI analysis
- `/portal/dscr-analyzer` - Dedicated DSCR Analyzer for rental property cash flow analysis
- `/portal/fixflip-analyzer` - Dedicated Fix & Flip Analyzer for rehab deal profitability
- `/portal/construction-analyzer` - Dedicated Construction Analyzer for ground-up build analysis
- `/portal/profile` - User profile settings with investment preferences, notification settings, connected entities, and password management

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
- `STRCalculatorPage` - Short-term rental income estimator with state-based market data, bedroom/property type multipliers, operating expense calculation, and DSCR analysis for loan qualification
- `GetQuotePage` - Multi-step quote flow: loan type → property details → contact info
- `USMap` - Interactive SVG map of US states using SimpleMaps coordinates (viewBox: 0 0 1000 589). States are color-coded by loan volume and clickable for navigation to state detail pages
- `RecentlyFundedCarousel` - Auto-scrolling carousel showcasing recently funded deals with property images, locations, loan amounts, rates (3 decimal precision), and LTV/LTC percentages. Filters by loan type when used on product pages
- `TeaserDSCRCalculator`, `TeaserFixFlipCalculator`, `TeaserConstructionCalculator` - Full-featured teaser calculators on public product pages (no sign-in required)

### Borrower Portal (ESC-Inspired)

The borrower portal is modeled after Easy Street Capital's portal design with the following features:

**Portal Navigation**:
- Portfolio tab - Lists all loan applications
- Analyzers dropdown - Contains links to:
  - DSCR Analyzer (data-testid="link-dscr-analyzer") - Rental property cash flow analysis
  - Fix & Flip Analyzer (data-testid="link-fixflip-analyzer") - Rehab deal profitability
  - Construction Analyzer (data-testid="link-construction-analyzer") - Ground-up build analysis

**Portal Landing Page** (`/portal`):
- "Analyze a New Deal" section with 3 cards linking to individual analyzers
- Each card navigates to its dedicated analyzer page (DSCR, Fix & Flip, Construction)

**Application Detail Page** (`/portal/application/:id`):
- Progress stepper with 6 stages: Account Executive Review → Underwriting → Term Sheet Issued → Processing → Docs Out → Closed
- Loan Info section with property address, guarantor, entity, purchase price, rehab budget, interest rate, LTC, loan term
- Contact Info sidebar with Account Executive and Processor contact details
- Fees breakdown: Daily Interest Charges, Origination Fee, Document Preparation Fee, Escrow Fee
- Funds to Close section: Down Payment, Rehab Equity, Debt Servicing, Fees
- Document status tabs (Needs/Documents) with Completed/Outstanding badges
- "View Analysis" button (data-testid="button-view-analyzer") for applications created from analyzers - links back to the analyzer with saved scenario data

**Analyzer-to-Application Data Persistence**:
- When creating a Draft application from any analyzer (DSCR, Fix & Flip, Construction), the complete scenario data is saved
- Schema fields: `analyzerType` (text: "dscr", "fixflip", "construction") and `analyzerData` (JSONB with inputs and results)
- The "View Analysis" button navigates to the appropriate analyzer with `?applicationId={id}` query parameter
- Analyzers detect the applicationId, fetch the application data, and restore all form inputs automatically
- This enables complete round-trip editing: Analyzer → Application → Analyzer with data persistence

**Investment Analysis Page** (`/portal/investment-analysis`):
- Property type icon selector (SFR, Duplex, Triplex, Fourplex, Townhome/Condo) with visual SVG icons
- Deal type selector (Rehab, New Construction, Rental/DSCR)
- Property inputs: Address, ARV/Property Value, Purchase Price, Down Payment
- Cost inputs: Rehab Budget, Requested Rehab Funding, Annual Taxes/Insurance/HOA, Closing Costs
- Loan inputs: Loan Term, Hold Time, Interest Rate
- Results panel: Total Project Cost, Cash Invested, Total Profit, ROI (%), Profit Margin (%), LTC (%), LTV (%)

**DSCR Calculator Features** (when Rental deal type selected):
- Transaction Type selector: Purchase, Rate & Term Refi, Cash-Out
- Dynamic label: "Purchase Price" for purchases, "Property Value" for refinances
- Requested Loan Amount with real-time LTV display and max thresholds (80% purchase/rate&term, 75% cash-out)
- Loan Factors section: Credit Score slider (660-800) and Expected Monthly Rent
- Operating Expenses: Annual Taxes, Insurance, HOA
- Interest rate calculated dynamically based on: credit score, LTV, DSCR ratio, and property type
- Base rate: 6.25% with adjustments ranging from 5.75% to 9.0%
- DSCR Results panel displays:
  - Interest Rate and DSCR ratio (color-coded: green ≥1.0, yellow ≥0.75, red <0.75)
  - Estimated Value and Equity %
  - Loan Amount and LTV (with max threshold warnings)
  - Monthly Breakdown: Rent Income, Principal & Interest, Taxes/Ins/HOA, Total PITIA, Monthly Cash Flow

**Profile Page** (`/portal/profile`):
- User profile information display (name, email from Replit Auth)
- Password management section with change password form
- Investment preferences section with:
  - Preferred loan types (DSCR, Fix & Flip, New Construction, Bridge Loan) - clickable badges
  - Target markets (California, Texas, Florida, etc.) - clickable badges
  - Investment experience dropdown
  - Investment goal dropdown
  - Budget range inputs (min/max)
- Notification settings with toggles for:
  - Email updates
  - Application status notifications
  - Document request notifications
  - SMS alerts
  - Marketing emails
- Connected entities management:
  - List of business entities (LLCs, etc.)
  - Add new entity input and button
  - Remove entity functionality
- Account overview with status and member since date
- Quick action buttons for Portfolio and Analysis
- Danger zone with account deletion dialog

**Shared Portal Header** (`PortalHeader` component):
- SAF logo image (not icon) with company name
- Navigation tabs: Portfolio, Investment Analysis (with active state highlighting)
- User avatar with dropdown menu for Profile Settings and Logout

**Construction Calculator Features**:
- "Land is Owned" checkbox that applies land value as equity
- When checked, land value is applied as equity towards project financing
- ROI calculation includes total capital deployed (land equity + cash invested)
- 90% LTC cap enforced against both ARV and total project cost

### Assets

**Logo Files**:
- Full logo: `attached_assets/ChatGPT Image Jun 25, 2025, 12_56_17 PM_1764028561921.png`
- Icon only: `attached_assets/ChatGPT Image Jun 25, 2025, 12_32_43 PM_1764028581255.png`

**Stock Images** (used in hero carousel and product pages):
- DSCR/Luxury Home: `attached_assets/stock_images/luxury_modern_single_2639d1bd.jpg`
- Fix & Flip/Renovation: `attached_assets/stock_images/house_renovation_con_aaeb0f05.jpg`
- New Construction: `attached_assets/stock_images/new_construction_hom_ee055247.jpg`

**Generated Images**:
- Hero background: `attached_assets/generated_images/Mortgage_office_hero_background_*.png`
- Testimonial headshots (3 images)

## Development

### Running the Project

The workflow `Start application` runs `npm run dev` which starts both Express backend and Vite frontend on port 5000.

### Key Files

- `client/src/App.tsx` - Route definitions
- `client/src/components/Navigation.tsx` - Header with SAF branding
- `client/src/components/Footer.tsx` - Footer with company info
- `client/src/components/LeadForm.tsx` - Reusable lead capture form
- `client/src/components/PortalHeader.tsx` - Shared portal header with SAF logo and user menu
- `client/src/pages/GetQuotePage.tsx` - Multi-step quote application
- `client/src/pages/PortalPage.tsx` - Customer portal with loan applications
- `client/src/pages/InvestmentAnalysisPage.tsx` - Investment analyzer with DSCR calculator
- `client/src/pages/ProfilePage.tsx` - User profile settings
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
