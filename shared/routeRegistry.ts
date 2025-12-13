import type { SearchContext } from "./schema";

export interface RouteEntry {
  id: string;
  path: string;
  title: string;
  description: string;
  keywords: string[];
  priority: number;
  context: "public" | "borrower" | "admin";
  isDynamic?: boolean;
}

export const PUBLIC_ROUTES: RouteEntry[] = [
  { 
    id: "home", 
    path: "/", 
    title: "Home", 
    description: "Main landing page", 
    keywords: ["homepage", "main", "start"], 
    priority: 1,
    context: "public"
  },
  { 
    id: "dscr-loans", 
    path: "/dscr-loans", 
    title: "DSCR Loans", 
    description: "Debt Service Coverage Ratio loans for rental properties", 
    keywords: ["dscr", "rental", "investment", "rates", "long term", "30 year"], 
    priority: 8,
    context: "public"
  },
  { 
    id: "fix-flip", 
    path: "/fix-flip", 
    title: "Fix & Flip Loans", 
    description: "Short-term financing for property renovations", 
    keywords: ["flip", "fix", "renovation", "rehab", "rates", "bridge", "short term"], 
    priority: 8,
    context: "public"
  },
  { 
    id: "hard-money", 
    path: "/hard-money", 
    title: "Hard Money Loans", 
    description: "Short-term financing for property renovations", 
    keywords: ["hard money", "bridge", "short term", "fast closing"], 
    priority: 7,
    context: "public"
  },
  { 
    id: "new-construction", 
    path: "/new-construction", 
    title: "New Construction Loans", 
    description: "Ground-up construction financing", 
    keywords: ["construction", "build", "new build", "ground up", "rates", "development"], 
    priority: 8,
    context: "public"
  },
  { 
    id: "calculator", 
    path: "/calculator", 
    title: "Calculator", 
    description: "Loan calculators and analysis tools", 
    keywords: ["calculator", "calculate", "tool"], 
    priority: 5,
    context: "public"
  },
  { 
    id: "about", 
    path: "/about", 
    title: "About Us", 
    description: "Company information and team", 
    keywords: ["about", "team", "company", "who", "story"], 
    priority: 3,
    context: "public"
  },
  { 
    id: "contact", 
    path: "/contact", 
    title: "Contact Us", 
    description: "Get in touch with us", 
    keywords: ["contact", "call", "phone", "email", "reach", "talk", "message", "speak"], 
    priority: 9,
    context: "public"
  },
  { 
    id: "get-quote", 
    path: "/get-quote", 
    title: "Get a Quote", 
    description: "Start your loan application", 
    keywords: ["apply", "application", "quote", "start", "begin", "get started", "rates", "pricing"], 
    priority: 10,
    context: "public"
  },
  { 
    id: "where-we-lend", 
    path: "/where-we-lend", 
    title: "Where We Lend", 
    description: "See all states where we offer investment property loans", 
    keywords: ["states", "locations", "where", "lend", "areas", "coverage", "map"], 
    priority: 7,
    context: "public"
  },
  { 
    id: "state-page", 
    path: "/states/:stateSlug", 
    title: "State Investment Loans", 
    description: "Investment loans in specific states", 
    keywords: ["state", "local", "region"], 
    priority: 6,
    context: "public",
    isDynamic: true
  },
  { 
    id: "state-loan-type", 
    path: "/states/:stateSlug/:loanType", 
    title: "State Loan Type", 
    description: "Specific loan types by state", 
    keywords: ["state", "loan type"], 
    priority: 6,
    context: "public",
    isDynamic: true
  },
  { 
    id: "str-calculator", 
    path: "/str-calculator", 
    title: "STR Calculator", 
    description: "Short-term rental calculator", 
    keywords: ["str", "short term rental", "airbnb", "vacation rental", "calculator"], 
    priority: 6,
    context: "public"
  },
  { 
    id: "fundings", 
    path: "/fundings", 
    title: "Recent Fundings", 
    description: "See our recently funded deals", 
    keywords: ["funded", "deals", "recent", "portfolio", "examples"], 
    priority: 5,
    context: "public"
  },
  { 
    id: "fundings-detail", 
    path: "/fundings/:propertyId", 
    title: "Funding Detail", 
    description: "Details of a funded property", 
    keywords: ["funded", "deal", "property"], 
    priority: 4,
    context: "public",
    isDynamic: true
  },
  { 
    id: "funded-deal-detail", 
    path: "/funded-deals/:id", 
    title: "Funded Deal Detail", 
    description: "Details of a funded deal", 
    keywords: ["funded", "deal"], 
    priority: 4,
    context: "public",
    isDynamic: true
  },
  { 
    id: "login", 
    path: "/login", 
    title: "Login", 
    description: "Sign in to your account", 
    keywords: ["login", "sign in", "account", "access"], 
    priority: 7,
    context: "public"
  },
  { 
    id: "resources", 
    path: "/resources", 
    title: "Resources", 
    description: "Educational content and tools", 
    keywords: ["resources", "articles", "blog", "learn", "education", "guides"], 
    priority: 5,
    context: "public"
  },
  { 
    id: "american-migration-2025", 
    path: "/resources/american-migration-2025", 
    title: "American Migration 2025", 
    description: "Insights on American migration trends for 2025", 
    keywords: ["migration", "2025", "trends", "moving", "population"], 
    priority: 5,
    context: "public"
  },
  { 
    id: "dscr-guide", 
    path: "/resources/complete-guide-to-dscr-loans", 
    title: "Complete Guide to DSCR Loans", 
    description: "Comprehensive guide to DSCR loans for investors", 
    keywords: ["dscr", "guide", "learn", "education", "how to"], 
    priority: 6,
    context: "public"
  },
  { 
    id: "adu-guide", 
    path: "/resources/what-investors-should-know-about-adus", 
    title: "ADU Guide for Investors", 
    description: "What investors should know about accessory dwelling units", 
    keywords: ["adu", "accessory dwelling", "guide", "investment"], 
    priority: 5,
    context: "public"
  },
  { 
    id: "renovations-guide", 
    path: "/resources/top-renovations-to-maximize-profits", 
    title: "Top Renovations Guide", 
    description: "Top renovations to maximize profits on investment properties", 
    keywords: ["renovation", "profit", "roi", "improvements", "rehab"], 
    priority: 5,
    context: "public"
  },
  { 
    id: "scope-of-work-guide", 
    path: "/resources/scope-of-work-guide", 
    title: "Scope of Work Guide", 
    description: "How to create a scope of work for renovation projects", 
    keywords: ["scope", "work", "renovation", "project", "planning"], 
    priority: 5,
    context: "public"
  },
  { 
    id: "dscr-calculator", 
    path: "/resources/dscr-calculator", 
    title: "DSCR Calculator", 
    description: "Calculate DSCR for rental properties - analyze cash flow and loan qualification", 
    keywords: ["calculator", "calculators", "dscr", "analyze", "tool", "calculate", "analysis", "rental"], 
    priority: 10,
    context: "public"
  },
  { 
    id: "flip-calculator", 
    path: "/resources/flip-calculator", 
    title: "Fix & Flip Calculator", 
    description: "Analyze fix and flip deals - calculate ROI and profit", 
    keywords: ["calculator", "calculators", "flip", "analyze", "tool", "calculate", "roi", "profit", "analysis"], 
    priority: 10,
    context: "public"
  },
  { 
    id: "construction-calculator", 
    path: "/resources/construction-calculator", 
    title: "Construction Calculator", 
    description: "Construction loan analysis - calculate draw schedules and costs", 
    keywords: ["calculator", "calculators", "construction", "analyze", "tool", "calculate", "draw", "budget", "analysis"], 
    priority: 10,
    context: "public"
  },
  { 
    id: "article-page", 
    path: "/resources/:slug", 
    title: "Resource Article", 
    description: "Educational article", 
    keywords: ["article", "guide", "learn"], 
    priority: 3,
    context: "public",
    isDynamic: true
  },
  { 
    id: "join", 
    path: "/join/:token", 
    title: "Join", 
    description: "Accept staff invitation", 
    keywords: ["join", "invite", "staff"], 
    priority: 2,
    context: "public",
    isDynamic: true
  },
  { 
    id: "sign-document", 
    path: "/sign/:token", 
    title: "Sign Document", 
    description: "Sign a document electronically", 
    keywords: ["sign", "document", "signature"], 
    priority: 2,
    context: "public",
    isDynamic: true
  },
];

export const BORROWER_ROUTES: RouteEntry[] = [
  { 
    id: "portal-dashboard", 
    path: "/portal", 
    title: "Dashboard", 
    description: "Your loan dashboard", 
    keywords: ["portal", "dashboard", "home", "my loans", "my applications", "sign in"], 
    priority: 8,
    context: "borrower"
  },
  { 
    id: "portal-application", 
    path: "/portal/application/:id", 
    title: "Application Detail", 
    description: "View and manage your loan application", 
    keywords: ["application", "loan", "detail", "status"], 
    priority: 7,
    context: "borrower",
    isDynamic: true
  },
  { 
    id: "portal-documents", 
    path: "/portal/application/:id/documents", 
    title: "Application Documents", 
    description: "Upload and manage application documents", 
    keywords: ["documents", "upload", "files"], 
    priority: 6,
    context: "borrower",
    isDynamic: true
  },
  { 
    id: "portal-verification", 
    path: "/portal/application/:id/verification", 
    title: "Photo Verification", 
    description: "Upload property verification photos", 
    keywords: ["photos", "verification", "property", "images"], 
    priority: 6,
    context: "borrower",
    isDynamic: true
  },
  { 
    id: "portal-investment-analysis", 
    path: "/portal/investment-analysis", 
    title: "Investment Analysis", 
    description: "Analyze investment properties", 
    keywords: ["investment", "analysis", "property", "evaluate"], 
    priority: 7,
    context: "borrower"
  },
  { 
    id: "portal-dscr-analyzer", 
    path: "/portal/dscr-analyzer", 
    title: "DSCR Analyzer", 
    description: "Analyze DSCR deals", 
    keywords: ["dscr", "analyzer", "rental", "cash flow"], 
    priority: 8,
    context: "borrower"
  },
  { 
    id: "portal-fixflip-analyzer", 
    path: "/portal/fixflip-analyzer", 
    title: "Fix & Flip Analyzer", 
    description: "Analyze fix and flip deals", 
    keywords: ["flip", "analyzer", "renovation", "profit"], 
    priority: 8,
    context: "borrower"
  },
  { 
    id: "portal-construction-analyzer", 
    path: "/portal/construction-analyzer", 
    title: "Construction Analyzer", 
    description: "Analyze construction deals", 
    keywords: ["construction", "analyzer", "build", "development"], 
    priority: 8,
    context: "borrower"
  },
  { 
    id: "portal-profile", 
    path: "/portal/profile", 
    title: "My Profile", 
    description: "Account settings and profile", 
    keywords: ["profile", "account", "settings", "preferences"], 
    priority: 6,
    context: "borrower"
  },
  { 
    id: "portal-loans", 
    path: "/portal/loans", 
    title: "Active Loans", 
    description: "View your active loans", 
    keywords: ["loans", "active", "servicing", "payments"], 
    priority: 7,
    context: "borrower"
  },
  { 
    id: "portal-loan-detail", 
    path: "/portal/loans/:id", 
    title: "Loan Detail", 
    description: "View loan details and payments", 
    keywords: ["loan", "detail", "payment", "balance"], 
    priority: 6,
    context: "borrower",
    isDynamic: true
  },
  { 
    id: "portal-draw-capture", 
    path: "/portal/loans/:loanId/draws/:drawId/capture", 
    title: "Draw Media Capture", 
    description: "Upload draw request photos", 
    keywords: ["draw", "photos", "construction", "progress"], 
    priority: 5,
    context: "borrower",
    isDynamic: true
  },
  { 
    id: "portal-book-consultation", 
    path: "/portal/book-consultation", 
    title: "Book Consultation", 
    description: "Schedule a consultation with our team", 
    keywords: ["book", "consultation", "appointment", "schedule", "meeting"], 
    priority: 7,
    context: "borrower"
  },
  { 
    id: "portal-appointments", 
    path: "/portal/appointments", 
    title: "My Appointments", 
    description: "View your scheduled appointments", 
    keywords: ["appointments", "schedule", "meetings", "calendar"], 
    priority: 6,
    context: "borrower"
  },
  { 
    id: "portal-messages", 
    path: "/portal/messages", 
    title: "Messages", 
    description: "View your messages", 
    keywords: ["messages", "inbox", "communication"], 
    priority: 6,
    context: "borrower"
  },
];

export const ADMIN_ROUTES: RouteEntry[] = [
  { 
    id: "admin-login", 
    path: "/admin/login", 
    title: "Staff Login", 
    description: "Staff login page", 
    keywords: ["login", "staff", "admin", "sign in"], 
    priority: 5,
    context: "admin"
  },
  { 
    id: "admin-dashboard", 
    path: "/admin", 
    title: "Admin Dashboard", 
    description: "Staff dashboard overview", 
    keywords: ["dashboard", "admin", "overview", "home"], 
    priority: 8,
    context: "admin"
  },
  { 
    id: "admin-analytics", 
    path: "/admin/analytics", 
    title: "Analytics", 
    description: "Performance analytics and reports", 
    keywords: ["analytics", "reports", "metrics", "performance", "stats"], 
    priority: 7,
    context: "admin"
  },
  { 
    id: "admin-application", 
    path: "/admin/application/:id", 
    title: "Application Detail", 
    description: "Manage loan application", 
    keywords: ["application", "loan", "manage", "review"], 
    priority: 7,
    context: "admin",
    isDynamic: true
  },
  { 
    id: "admin-servicing", 
    path: "/admin/servicing", 
    title: "Loan Servicing", 
    description: "Manage active loans", 
    keywords: ["servicing", "loans", "active", "payments"], 
    priority: 7,
    context: "admin"
  },
  { 
    id: "admin-servicing-detail", 
    path: "/admin/servicing/:id", 
    title: "Loan Detail", 
    description: "View and manage loan details", 
    keywords: ["loan", "detail", "servicing"], 
    priority: 6,
    context: "admin",
    isDynamic: true
  },
  { 
    id: "admin-borrower", 
    path: "/admin/borrower/:id", 
    title: "Borrower Profile", 
    description: "View borrower profile", 
    keywords: ["borrower", "profile", "user", "customer"], 
    priority: 6,
    context: "admin",
    isDynamic: true
  },
  { 
    id: "admin-customize-site", 
    path: "/admin/customize-site", 
    title: "Customize Site", 
    description: "Configure site branding and customization", 
    keywords: ["customize", "site", "branding", "white label", "logo"], 
    priority: 5,
    context: "admin"
  },
  { 
    id: "admin-email-log", 
    path: "/admin/email-log", 
    title: "Email Log", 
    description: "View sent email history", 
    keywords: ["email", "log", "sent", "history"], 
    priority: 5,
    context: "admin"
  },
  { 
    id: "admin-sms-log", 
    path: "/admin/sms-log", 
    title: "SMS Log", 
    description: "View sent SMS history", 
    keywords: ["sms", "text", "log", "sent", "history"], 
    priority: 5,
    context: "admin"
  },
  { 
    id: "admin-appointments", 
    path: "/admin/appointments", 
    title: "Appointments", 
    description: "Manage appointments and availability", 
    keywords: ["appointments", "calendar", "schedule", "availability"], 
    priority: 6,
    context: "admin"
  },
  { 
    id: "admin-financials", 
    path: "/admin/financials", 
    title: "Financials", 
    description: "Financial reports and management", 
    keywords: ["financials", "money", "revenue", "payments"], 
    priority: 7,
    context: "admin"
  },
  { 
    id: "admin-portfolio", 
    path: "/admin/portfolio", 
    title: "Portfolio", 
    description: "Loan portfolio overview", 
    keywords: ["portfolio", "loans", "assets"], 
    priority: 7,
    context: "admin"
  },
  { 
    id: "admin-map-calibration", 
    path: "/admin/map-calibration", 
    title: "Map Calibration", 
    description: "Calibrate map settings", 
    keywords: ["map", "calibration", "settings"], 
    priority: 4,
    context: "admin"
  },
  { 
    id: "admin-messages", 
    path: "/admin/messages", 
    title: "Messages", 
    description: "View and manage messages", 
    keywords: ["messages", "inbox", "communication"], 
    priority: 6,
    context: "admin"
  },
  { 
    id: "admin-draw-requests", 
    path: "/admin/draw-requests", 
    title: "Draw Requests", 
    description: "Manage construction draw requests", 
    keywords: ["draw", "requests", "construction", "disbursement"], 
    priority: 6,
    context: "admin"
  },
  { 
    id: "admin-users", 
    path: "/admin/users", 
    title: "User Management", 
    description: "Manage users and staff", 
    keywords: ["users", "staff", "manage", "accounts", "permissions"], 
    priority: 7,
    context: "admin"
  },
  { 
    id: "admin-webhooks", 
    path: "/admin/webhooks", 
    title: "Webhooks", 
    description: "Manage webhook integrations", 
    keywords: ["webhooks", "integrations", "api"], 
    priority: 5,
    context: "admin"
  },
  { 
    id: "admin-page-builder", 
    path: "/admin/page-builder", 
    title: "Page Builder", 
    description: "Customize website pages", 
    keywords: ["page", "builder", "customize", "cms", "content"], 
    priority: 6,
    context: "admin"
  },
];

export const US_STATES = [
  { id: "alabama", name: "Alabama", abbrev: "AL", slug: "alabama" },
  { id: "alaska", name: "Alaska", abbrev: "AK", slug: "alaska" },
  { id: "arizona", name: "Arizona", abbrev: "AZ", slug: "arizona" },
  { id: "arkansas", name: "Arkansas", abbrev: "AR", slug: "arkansas" },
  { id: "california", name: "California", abbrev: "CA", slug: "california" },
  { id: "colorado", name: "Colorado", abbrev: "CO", slug: "colorado" },
  { id: "connecticut", name: "Connecticut", abbrev: "CT", slug: "connecticut" },
  { id: "delaware", name: "Delaware", abbrev: "DE", slug: "delaware" },
  { id: "florida", name: "Florida", abbrev: "FL", slug: "florida" },
  { id: "georgia", name: "Georgia", abbrev: "GA", slug: "georgia" },
  { id: "hawaii", name: "Hawaii", abbrev: "HI", slug: "hawaii" },
  { id: "idaho", name: "Idaho", abbrev: "ID", slug: "idaho" },
  { id: "illinois", name: "Illinois", abbrev: "IL", slug: "illinois" },
  { id: "indiana", name: "Indiana", abbrev: "IN", slug: "indiana" },
  { id: "iowa", name: "Iowa", abbrev: "IA", slug: "iowa" },
  { id: "kansas", name: "Kansas", abbrev: "KS", slug: "kansas" },
  { id: "kentucky", name: "Kentucky", abbrev: "KY", slug: "kentucky" },
  { id: "louisiana", name: "Louisiana", abbrev: "LA", slug: "louisiana" },
  { id: "maine", name: "Maine", abbrev: "ME", slug: "maine" },
  { id: "maryland", name: "Maryland", abbrev: "MD", slug: "maryland" },
  { id: "massachusetts", name: "Massachusetts", abbrev: "MA", slug: "massachusetts" },
  { id: "michigan", name: "Michigan", abbrev: "MI", slug: "michigan" },
  { id: "minnesota", name: "Minnesota", abbrev: "MN", slug: "minnesota" },
  { id: "mississippi", name: "Mississippi", abbrev: "MS", slug: "mississippi" },
  { id: "missouri", name: "Missouri", abbrev: "MO", slug: "missouri" },
  { id: "montana", name: "Montana", abbrev: "MT", slug: "montana" },
  { id: "nebraska", name: "Nebraska", abbrev: "NE", slug: "nebraska" },
  { id: "nevada", name: "Nevada", abbrev: "NV", slug: "nevada" },
  { id: "new-hampshire", name: "New Hampshire", abbrev: "NH", slug: "new-hampshire" },
  { id: "new-jersey", name: "New Jersey", abbrev: "NJ", slug: "new-jersey" },
  { id: "new-mexico", name: "New Mexico", abbrev: "NM", slug: "new-mexico" },
  { id: "new-york", name: "New York", abbrev: "NY", slug: "new-york" },
  { id: "north-carolina", name: "North Carolina", abbrev: "NC", slug: "north-carolina" },
  { id: "north-dakota", name: "North Dakota", abbrev: "ND", slug: "north-dakota" },
  { id: "ohio", name: "Ohio", abbrev: "OH", slug: "ohio" },
  { id: "oklahoma", name: "Oklahoma", abbrev: "OK", slug: "oklahoma" },
  { id: "oregon", name: "Oregon", abbrev: "OR", slug: "oregon" },
  { id: "pennsylvania", name: "Pennsylvania", abbrev: "PA", slug: "pennsylvania" },
  { id: "rhode-island", name: "Rhode Island", abbrev: "RI", slug: "rhode-island" },
  { id: "south-carolina", name: "South Carolina", abbrev: "SC", slug: "south-carolina" },
  { id: "south-dakota", name: "South Dakota", abbrev: "SD", slug: "south-dakota" },
  { id: "tennessee", name: "Tennessee", abbrev: "TN", slug: "tennessee" },
  { id: "texas", name: "Texas", abbrev: "TX", slug: "texas" },
  { id: "utah", name: "Utah", abbrev: "UT", slug: "utah" },
  { id: "vermont", name: "Vermont", abbrev: "VT", slug: "vermont" },
  { id: "virginia", name: "Virginia", abbrev: "VA", slug: "virginia" },
  { id: "washington", name: "Washington", abbrev: "WA", slug: "washington" },
  { id: "west-virginia", name: "West Virginia", abbrev: "WV", slug: "west-virginia" },
  { id: "wisconsin", name: "Wisconsin", abbrev: "WI", slug: "wisconsin" },
  { id: "wyoming", name: "Wyoming", abbrev: "WY", slug: "wyoming" },
];

export const LOAN_PRODUCTS = [
  { id: "dscr", title: "DSCR Loans", description: "Long-term rental property financing based on property cash flow", keywords: ["rental", "cash flow", "dscr", "investment property", "30 year", "long term"] },
  { id: "fix-flip", title: "Fix & Flip Loans", description: "Short-term financing for property renovation and resale", keywords: ["flip", "renovation", "rehab", "short term", "bridge"] },
  { id: "construction", title: "New Construction Loans", description: "Ground-up construction financing for new builds", keywords: ["construction", "new build", "ground up", "development"] },
];

export const FAQS = [
  { id: "faq-rates", question: "What are your interest rates?", answer: "Rates start at 7.99% depending on loan type, credit, and experience." },
  { id: "faq-timeline", question: "How fast can you close?", answer: "We can close in as fast as 10 business days for most loan types." },
  { id: "faq-credit", question: "What credit score do I need?", answer: "Minimum credit score is typically 660 for most programs." },
  { id: "faq-ltv", question: "What is the maximum LTV?", answer: "Up to 80% LTV for purchases and 75% for refinances on most products." },
  { id: "faq-prepay", question: "Are there prepayment penalties?", answer: "Most loans have flexible prepay options, including no prepay on some products." },
];

export function getRoutesByContext(context: SearchContext): RouteEntry[] {
  switch (context) {
    case "public":
      return PUBLIC_ROUTES;
    case "borrower":
      return [...BORROWER_ROUTES, ...PUBLIC_ROUTES];
    case "admin":
      return [...ADMIN_ROUTES, ...BORROWER_ROUTES, ...PUBLIC_ROUTES];
    default:
      return PUBLIC_ROUTES;
  }
}

export function getSearchableRoutes(context: SearchContext): RouteEntry[] {
  return getRoutesByContext(context).filter(route => !route.isDynamic);
}

export function validateRouteExists(path: string, routes: RouteEntry[]): boolean {
  return routes.some(route => route.path === path);
}

export function getAllStaticRoutes(): RouteEntry[] {
  return [
    ...PUBLIC_ROUTES.filter(r => !r.isDynamic),
    ...BORROWER_ROUTES.filter(r => !r.isDynamic),
    ...ADMIN_ROUTES.filter(r => !r.isDynamic),
  ];
}

export function getStateRoute(stateSlug: string): string {
  return `/states/${stateSlug}`;
}

export function getAllRoutes(): RouteEntry[] {
  return [...PUBLIC_ROUTES, ...BORROWER_ROUTES, ...ADMIN_ROUTES];
}

export interface RouteValidationResult {
  valid: boolean;
  missingRoutes: string[];
  extraRoutes: string[];
}

export function validateRoutesAgainstAppRoutes(appRoutes: string[]): RouteValidationResult {
  const registryPaths = getAllRoutes().map(r => r.path);
  
  const missingFromRegistry = appRoutes.filter(
    appRoute => !registryPaths.some(regPath => {
      const regPattern = regPath.replace(/:[^/]+/g, '[^/]+');
      const regex = new RegExp(`^${regPattern}$`);
      return regex.test(appRoute) || appRoute === regPath;
    })
  );
  
  const extraInRegistry = registryPaths.filter(
    regPath => !appRoutes.some(appRoute => {
      const regPattern = regPath.replace(/:[^/]+/g, '[^/]+');
      const appPattern = appRoute.replace(/:[^/]+/g, '[^/]+');
      return regPattern === appPattern || regPath === appRoute;
    })
  );

  return {
    valid: missingFromRegistry.length === 0 && extraInRegistry.length === 0,
    missingRoutes: missingFromRegistry,
    extraRoutes: extraInRegistry,
  };
}

export function logRouteValidation(appRoutes: string[]): void {
  const result = validateRoutesAgainstAppRoutes(appRoutes);
  
  if (!result.valid) {
    if (result.missingRoutes.length > 0) {
      console.warn("[Route Registry] Routes in App.tsx missing from registry:", result.missingRoutes);
    }
    if (result.extraRoutes.length > 0) {
      console.warn("[Route Registry] Routes in registry not found in App.tsx:", result.extraRoutes);
    }
  } else {
    console.log("[Route Registry] All routes validated successfully");
  }
}
