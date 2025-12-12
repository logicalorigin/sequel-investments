# Sequel Investments - Real Estate Investment Lending Platform

## Overview

Sequel Investments is a professional marketing and lead generation website for an investor-focused real estate lender. It specializes in DSCR, Fix & Flip, and New Construction loans, providing educational content, interactive calculators, a multi-step quote application, and lead capture forms. The platform is designed for white-label use by mortgage brokers, featuring a dark theme with gold/amber accents, modern aesthetics, trust indicators, and conversion-focused layouts to connect borrowers with loan specialists.

## User Preferences

I prefer simple language. I want iterative development. Ask before making major changes. I prefer detailed explanations. Do not make changes to the folder `Z`. Do not make changes to the file `Y`.

## Content Guidelines

- **No quotes from other lenders or mortgage brokers** in articles or resources. Acceptable sources include: industry publications (Zonda, Remodeling Magazine), research organizations (CBRE), investor communities (BiggerPockets), government data, and the company's own insights.

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
- **Photo Verification Walkthrough**: Interactive camera-based photo capture for property and renovation verification. Borrowers upload required photos (exterior, interior, renovation areas) with EXIF metadata extraction and browser location tracking. Progress tracking guides users through required photo categories. Available for Fix & Flip and Construction loan applications via `/portal/application/:id/verification`. **100% mobile-optimized** with single-column layout, horizontal scrolling category tabs, bottom action bar, touch-friendly 44px+ tap targets, and portrait-oriented camera preview.
- **Document Carry-Forward**: Documents from loan processing/closing phase automatically carry forward to servicing. Both borrower portal and admin views show combined documents grouped by phase (Processing/Closing vs Servicing). Borrowers only see uploaded documents with valid file URLs; internal metadata hidden for security.
    - **GPS Double-Verification System**: Three-way coordinate comparison ensures photos are taken at the actual property:
        - **Browser GPS**: Captured at photo time with accuracy metrics (±Xm) and timestamp
        - **EXIF GPS**: Extracted from photo metadata (camera location, altitude, timestamp)
        - **Property Location**: Geocoded address coordinates for geofence verification
        - **Haversine Distance Calculation**: Computes great-circle distance between GPS sources
        - **Verification Statuses**: pending, verified, gps_match, gps_mismatch, outside_geofence, stale_timestamp, metadata_missing, browser_gps_only, exif_gps_only, no_gps_data, manual_approved, manual_rejected
        - **Staff Review UI**: Admin can view GPS comparison details, distance metrics, and manually approve/reject photos with audit logging
        - **Distance Thresholds**: 50m for outdoor photos, 75m for indoor (configurable per photo type)
- **Company Backend (Staff Portal)**: Role-Based Access Control (borrower, staff, admin), pipeline view of applications, application status management, user management, and staff invitations.
- **Loan Pipeline Infrastructure** (Phase 1 Complete):
    - **Application Stage History**: Timeline audit trail tracking all status/stage changes with timestamps, user attribution, duration tracking, and notes. Supports automated vs manual transition logging.
    - **Loan Assignments**: Staff ownership with role-based assignments (account_executive, processor, underwriter, closer, servicer). Tracks primary assignees, assignment history, and active/inactive status.
    - **DSCR Product Variants**: Purchase, Cash-Out Refinance, and Rate & Term Refinance loan types for DSCR loans via `productVariant` enum.
    - **API Endpoints**: Full CRUD operations for stage history and assignments at `/api/admin/applications/:id/stage-history`, `/api/admin/applications/:id/assignments`, `/api/admin/assignments/:id`, and `/api/my-assignments` for staff dashboard.
- **Application Revision Workflow**:
    - **Revision Requests**: Staff can return applications to borrowers with section-specific revision requests (property_info, financials, documents, borrower_info, entity_info, loan_terms, other). Each request includes staff notes explaining what needs correction.
    - **Borrower Revision Flow**: Borrowers see a prominent banner when revisions are requested, with cards for each pending request showing the section, notes, and a "Mark as Addressed" button. Once all requests are addressed, borrowers can resubmit.
    - **Application Messaging**: Threaded messaging between staff and borrowers per application. Messages show sender role badges, timestamps, and support file attachments. Unread count indicators on both portals.
    - **Email Notifications**: Automatic emails sent when staff request revisions (to borrower) and when borrower resubmits (to assigned staff members).
    - **API Endpoints**: `/api/applications/:id/revision-requests`, `/api/applications/:id/revision-requests/pending`, `/api/admin/applications/:id/revision-requests`, `/api/revision-requests/:id/resolve`, `/api/applications/:id/resubmit`, `/api/applications/:id/messages`, `/api/applications/:id/messages/unread-count`.
- **Modular Page Builder** (Admin Feature):
    - **Visual Section Editor**: Admin interface at `/admin/page-builder` for customizing website pages (home, dscr, fix_flip, construction, about, contact, resources).
    - **Section Types**: Hero, Trust Indicators, Loan Products, Testimonials, FAQ, Lead Form, Recently Funded, State Map, Feature Highlights, CTA Banner, Custom Content, Stats Bar.
    - **Configuration Panels**: Per-section config with variants, layouts, visibility toggles, and type-specific options.
    - **Drag-Reorder**: Sections can be reordered with up/down buttons; order normalized on save.
    - **API Endpoints**: `GET /api/page-layouts/:pageId`, `PUT /api/admin/page-layouts/:pageId`, `POST /api/admin/page-layouts/:pageId/reset`.
    - **Zod Validation**: Discriminated union schema validates section configs by type, preventing malformed data.
    - **Auto-Create Layouts**: Empty layouts auto-created for all valid page IDs on first access; home page gets default sections.
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