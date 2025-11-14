# PrimeLend - Non-QM Mortgage Broker Platform

## Overview

PrimeLend is a marketing and lead generation website for a non-QM (non-qualified mortgage) broker specializing in DSCR (Debt Service Coverage Ratio) loans and Hard Money loans for real estate investors. The platform provides educational content about loan products, an interactive DSCR calculator, and lead capture forms to connect potential borrowers with loan specialists.

The application is built as a full-stack TypeScript solution with a React frontend and Express backend, designed for rapid deployment and easy maintenance.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, using Vite as the build tool and development server.

**Routing**: Client-side routing implemented with Wouter, a lightweight alternative to React Router. Routes include:
- Homepage with hero section and loan product overview
- DSCR Loans detail page
- Hard Money Loans detail page  
- Interactive Calculator page
- About page
- Contact page

**UI Component System**: shadcn/ui component library in "New York" style, built on Radix UI primitives. Provides accessible, pre-styled components including forms, cards, dialogs, navigation menus, and data display elements.

**Styling**: Tailwind CSS with custom design tokens defined in CSS variables. Theme supports light/dark modes with HSL color system. Typography uses Inter font family for modern, professional appearance aligned with financial services aesthetic.

**State Management**: TanStack Query (React Query) for server state management, form state handled by React Hook Form with Zod validation.

**Design Philosophy**: Conversion-focused design inspired by modern fintech companies (Better.com, SoFi, Stripe) emphasizing trust, credibility, and clear calls-to-action.

### Backend Architecture

**Server Framework**: Express.js running on Node.js with TypeScript.

**API Design**: RESTful JSON API with two primary endpoints:
- `POST /api/leads` - Creates new lead submissions with validation
- `GET /api/leads` - Retrieves all leads (administrative function)

**Data Validation**: Zod schemas shared between client and server (in `/shared` directory) ensure type safety and consistent validation rules. Uses `zod-validation-error` for user-friendly error messages.

**Storage Strategy**: Currently implements in-memory storage (`MemStorage` class) using a Map data structure. This is designed as an abstraction layer (`IStorage` interface) allowing easy swap to database persistence without changing application logic.

**Development Server**: Vite middleware integration in development mode enables hot module replacement and fast refresh. Production build serves static assets from Express.

### Data Layer

**Schema Definition**: Drizzle ORM used to define database schema in TypeScript. The `leads` table includes:
- Contact information (name, email, phone)
- Loan preferences (type, property location)
- Lead source tracking (how they heard about the service)
- Timestamps

**Database Configuration**: Configured for PostgreSQL (via Neon serverless driver) but currently using in-memory storage. The Drizzle config points to a PostgreSQL connection, ready for database provisioning.

**Type Generation**: Drizzle generates TypeScript types from schema, ensuring end-to-end type safety from database to UI.

### Form Handling & Validation

**Validation Schema**: Single source of truth defined in `shared/schema.ts` using Zod:
- Name: minimum 2 characters
- Email: valid email format
- Phone: minimum 10 digits
- Loan type: enum of "DSCR", "Hard Money", "Both", "Other"
- Optional fields: property location, message, referral source

**Client-side Forms**: React Hook Form with Zod resolver provides instant validation feedback. Forms are reusable across pages with configurable defaults (e.g., pre-selecting DSCR loan type on DSCR page).

**Server-side Validation**: Express middleware validates all incoming requests against same Zod schema, returning field-specific error messages for client display.

### Asset Management

**Static Assets**: Images stored in `/attached_assets/generated_images/` directory and imported via Vite alias `@assets`. Includes hero images, loan product photos, and testimonial headshots.

**Build Process**: Vite bundles all assets with content hashing for cache busting. Production build outputs to `/dist/public`.

### Interactive Features

**DSCR Calculator**: Client-side calculation component that:
- Accepts property value, monthly rent, and expenses as inputs
- Calculates estimated monthly mortgage payment (assuming 80% LTV, 7.5% rate, 30-year term)
- Computes DSCR ratio (monthly rent / total debt obligations)
- Displays qualification status (DSCR >= 1.0)
- Updates in real-time as user adjusts values

### Navigation & Layout

**Responsive Navigation**: Fixed header with logo, navigation links, and mobile hamburger menu. Background opacity changes on scroll for visual hierarchy.

**Footer**: Multi-column layout with company info, loan product links, quick links, and newsletter signup. Includes social media icons.

**Page Structure**: Consistent layout with hero sections, content areas, and lead capture forms. Uses gradient backgrounds and card components for visual separation.

## External Dependencies

### UI Libraries
- **Radix UI**: Headless component primitives (@radix-ui/react-*) for accessible interactive elements
- **shadcn/ui**: Pre-styled component system built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### Data Fetching & Forms
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state management with minimal re-renders
- **Zod**: Schema validation library
- **@hookform/resolvers**: Zod integration for React Hook Form

### Routing & Navigation
- **Wouter**: Lightweight client-side routing (< 2KB alternative to React Router)

### Database & ORM
- **Drizzle ORM**: TypeScript ORM with migrations support
- **@neondatabase/serverless**: PostgreSQL driver optimized for serverless/edge environments
- **drizzle-zod**: Generates Zod schemas from Drizzle tables

### Build Tools
- **Vite**: Frontend build tool and dev server
- **esbuild**: Fast JavaScript bundler for backend code
- **TypeScript**: Type safety across entire stack
- **PostCSS**: CSS processing with Autoprefixer

### Development Tools
- **@replit/vite-plugin-***: Replit-specific development enhancements (error overlay, cartographer, dev banner)
- **tsx**: TypeScript execution for development server

### Utility Libraries
- **clsx** & **tailwind-merge**: Class name composition utilities
- **class-variance-authority**: Variant-based component styling
- **date-fns**: Date manipulation and formatting
- **nanoid**: Unique ID generation

### Planned Integrations
The architecture supports future integration of:
- PostgreSQL database (Drizzle config already present)
- Email service for lead notifications
- CRM integration for lead management
- Analytics tracking (Google Analytics, Mixpanel, etc.)
- Live chat support