# Sequel Investments - Real Estate Investment Lending Platform

## Overview

Sequel Investments is a professional marketing and lead generation website for an investor-focused real estate lender. It specializes in DSCR, Fix & Flip, and New Construction loans, providing educational content, interactive calculators, a multi-step quote application, and lead capture forms. The platform is designed for white-label use by mortgage brokers, featuring a dark theme with gold/amber accents, modern aesthetics, trust indicators, and conversion-focused layouts to connect borrowers with loan specialists.

## User Preferences

I prefer simple language. I want iterative development. Ask before making major changes. I prefer detailed explanations. Do not make changes to the folder `Z`. Do not make changes to the file `Y`.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript, Vite.
- **Routing**: Client-side routing with Wouter.
- **UI Components**: shadcn/ui ("New York" style) built on Radix UI.
- **Styling**: Tailwind CSS with custom design tokens, light/dark modes, Inter font.
- **State Management**: TanStack Query for server state, React Hook Form with Zod for form validation.

### Backend
- **Server Framework**: Express.js on Node.js with TypeScript.
- **API Endpoints**: `POST /api/leads` and `GET /api/leads`.
- **Storage**: In-memory storage with interface for future database integration.

### Key Features
- **Loan Application Flow**: Multi-step quote application with interactive calculators (DSCR, Fix & Flip, New Construction) that dynamically calculate rates and terms.
- **Lead Capture**: Reusable forms for lead generation.
- **Content & Resources**: Educational sections, blog-style resources, and Kiavi-inspired product pages with detailed loan terms and program highlights.
- **Interactive Maps**: US map showing loan volume by state, and state-specific interactive Google Maps with market data, property search, and amenity layers.
- **Borrower Portal**: Features portfolio management, investment analysis tools, application detail pages, document upload with automated organization, and user profile management. Analyzers save scenario data to draft applications.
- **Company Backend (Staff Portal)**: Role-Based Access Control (borrower, staff, admin), pipeline view of applications, application status management, user management, and staff invitations.
- **SaaS Features**:
    - **Admin Analytics Dashboard**: Pipeline metrics and visualization.
    - **White-Label Demo Mode**: Customizable company branding, colors, and contact information.
    - **Email Notifications**: Integration with Resend for templated email delivery with demo mode.
    - **Stripe Payment Processing**: For application, commitment, and appraisal fees, including webhook handling.
    - **SMS Notifications**: Integration with Twilio for key loan milestones with user controls and demo mode.
    - **Calendar Booking System**: For consultations with staff, including admin management and availability.
    - **Document E-Signatures**: Secure, token-based signature capture with administrative management.

## External Dependencies

- **Google Maps API**: For property search autocomplete, interactive state maps, and property map previews.
- **Stripe**: For processing payments related to loan applications.
- **Resend**: For sending email notifications.
- **Twilio**: For sending SMS notifications.
- **RentCast API**: Integrated for automatic property data fetching in deal analyzers.
- **Bridge Interactive (formerly Zillow API services), Attom Data Solutions, Estated API, CoreLogic, HouseCanary**: Recommended for property valuations and data in production (Bridge Interactive currently recommended).