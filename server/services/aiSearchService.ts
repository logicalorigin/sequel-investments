import { GoogleGenAI } from "@google/genai";
import type { SearchContext, SearchIntent, SearchResult, SearchResponse } from "@shared/schema";

const geminiClient = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY!,
  httpOptions: {
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

interface PageEntry {
  id: string;
  title: string;
  url: string;
  description: string;
  keywords: string[];
  priority: number;
}

const PUBLIC_PAGES: PageEntry[] = [
  { id: "home", title: "Home", url: "/", description: "Main landing page", keywords: ["homepage", "main", "start"], priority: 1 },
  { id: "dscr", title: "DSCR Loans", url: "/dscr", description: "Debt Service Coverage Ratio loans for rental properties", keywords: ["dscr", "rental", "investment", "rates", "long term", "30 year"], priority: 8 },
  { id: "fix-flip", title: "Fix & Flip Loans", url: "/fix-flip", description: "Short-term financing for property renovations", keywords: ["flip", "fix", "renovation", "rehab", "rates", "bridge", "short term"], priority: 8 },
  { id: "construction", title: "New Construction Loans", url: "/construction", description: "Ground-up construction financing", keywords: ["construction", "build", "new build", "ground up", "rates", "development"], priority: 8 },
  { id: "about", title: "About Us", url: "/about", description: "Company information and team", keywords: ["about", "team", "company", "who", "story"], priority: 3 },
  { id: "contact", title: "Contact Us", url: "/contact", description: "Get in touch with us", keywords: ["contact", "call", "phone", "email", "reach", "talk", "message", "speak"], priority: 9 },
  { id: "resources", title: "Resources", url: "/resources", description: "Educational content and tools", keywords: ["resources", "articles", "blog", "learn", "education", "guides"], priority: 5 },
  { id: "quote", title: "Get a Quote", url: "/quote", description: "Start your loan application", keywords: ["apply", "application", "quote", "start", "begin", "get started", "rates", "pricing"], priority: 10 },
  { id: "dscr-calculator", title: "DSCR Calculator", url: "/resources/dscr-calculator", description: "Calculate DSCR for rental properties - analyze cash flow and loan qualification", keywords: ["calculator", "calculators", "dscr", "analyze", "tool", "calculate", "analysis", "rental"], priority: 10 },
  { id: "flip-calculator", title: "Fix & Flip Calculator", url: "/resources/flip-calculator", description: "Analyze fix and flip deals - calculate ROI and profit", keywords: ["calculator", "calculators", "flip", "analyze", "tool", "calculate", "roi", "profit", "analysis"], priority: 10 },
  { id: "construction-calculator", title: "Construction Calculator", url: "/resources/construction-calculator", description: "Construction loan analysis - calculate draw schedules and costs", keywords: ["calculator", "calculators", "construction", "analyze", "tool", "calculate", "draw", "budget", "analysis"], priority: 10 },
  { id: "where-we-lend", title: "Where We Lend", url: "/where-we-lend", description: "See all states where we offer investment property loans", keywords: ["states", "locations", "where", "lend", "areas", "coverage", "map"], priority: 7 },
];

const US_STATES = [
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

const BORROWER_PAGES = [
  { id: "portal-dashboard", title: "Dashboard", url: "/portal", description: "Your loan dashboard" },
  { id: "portal-applications", title: "My Applications", url: "/portal/applications", description: "View and manage your loan applications" },
  { id: "portal-profile", title: "My Profile", url: "/portal/profile", description: "Account settings and profile" },
  { id: "portal-analyzers", title: "Deal Analyzers", url: "/portal/analyzers", description: "Investment analysis tools" },
];

const ADMIN_PAGES = [
  { id: "admin-dashboard", title: "Admin Dashboard", url: "/admin", description: "Staff dashboard overview" },
  { id: "admin-pipeline", title: "Pipeline", url: "/admin/pipeline", description: "Loan application pipeline" },
  { id: "admin-applications", title: "All Applications", url: "/admin/applications", description: "Manage all loan applications" },
  { id: "admin-users", title: "User Management", url: "/admin/users", description: "Manage users and staff" },
  { id: "admin-analytics", title: "Analytics", url: "/admin/analytics", description: "Performance analytics and reports" },
  { id: "admin-settings", title: "Settings", url: "/admin/settings", description: "System settings" },
];

const LOAN_PRODUCTS = [
  { id: "dscr", title: "DSCR Loans", description: "Long-term rental property financing based on property cash flow", keywords: ["rental", "cash flow", "dscr", "investment property", "30 year", "long term"] },
  { id: "fix-flip", title: "Fix & Flip Loans", description: "Short-term financing for property renovation and resale", keywords: ["flip", "renovation", "rehab", "short term", "bridge"] },
  { id: "construction", title: "New Construction Loans", description: "Ground-up construction financing for new builds", keywords: ["construction", "new build", "ground up", "development"] },
];

const FAQS = [
  { id: "faq-rates", question: "What are your interest rates?", answer: "Rates start at 7.99% depending on loan type, credit, and experience." },
  { id: "faq-timeline", question: "How fast can you close?", answer: "We can close in as fast as 10 business days for most loan types." },
  { id: "faq-credit", question: "What credit score do I need?", answer: "Minimum credit score is typically 660 for most programs." },
  { id: "faq-ltv", question: "What is the maximum LTV?", answer: "Up to 80% LTV for purchases and 75% for refinances on most products." },
  { id: "faq-prepay", question: "Are there prepayment penalties?", answer: "Most loans have flexible prepay options, including no prepay on some products." },
];

function searchStates(query: string): SearchResult[] {
  const lowerQuery = query.toLowerCase().trim();
  
  return US_STATES
    .filter(state =>
      state.name.toLowerCase().includes(lowerQuery) ||
      state.abbrev.toLowerCase() === lowerQuery ||
      state.slug.includes(lowerQuery) ||
      lowerQuery.includes(state.name.toLowerCase())
    )
    .map(state => ({
      id: `state-${state.id}`,
      type: "page" as const,
      title: `${state.name} Investment Loans`,
      description: `DSCR, Fix & Flip, and Construction loans in ${state.name} (${state.abbrev})`,
      url: `/states/${state.slug}`,
      icon: "building",
    }))
    .slice(0, 5);
}

async function generateSearchIntent(query: string, context: SearchContext): Promise<SearchIntent> {
  const contextDescription = {
    public: "a public website visitor looking for loan products, resources, or company information",
    borrower: "a logged-in borrower viewing their loan applications, documents, and account",
    admin: "a staff member managing loan applications, users, and pipeline",
  };

  const prompt = `You are a search intent classifier for Sequel Investments, a real estate lending website.

IMPORTANT GUARDRAILS:
- You ONLY search within this website's content. NEVER suggest external websites or resources.
- You ONLY classify intent for internal site navigation and content.
- All results must be from this site's pages, products, FAQs, state pages, or user data.
- Do NOT reference or suggest Google, Zillow, Redfin, or any external sources.

User context: ${contextDescription[context]}
User query: "${query}"

Classify the user's intent into one of these types:
1. "navigate" - User wants to go to a specific page (e.g., "go to contact page", "show me DSCR loans", "New York loans")
2. "filter" - User wants to filter or find specific items (e.g., "show pending applications", "loans over $500k")
3. "entity" - User is looking for a specific entity by name/ID (e.g., "application #123", "John Smith")
4. "question" - User is asking a question about our products/services (e.g., "what are the rates?", "how fast can you close?")

Respond with ONLY valid JSON in this exact format:
{"type": "navigate|filter|entity|question", "confidence": 0.0-1.0, "route": "/optional/path", "filters": {"optional": "filters"}, "entityType": "optional_type", "query": "original query"}`;

  try {
    const response = await geminiClient.models.generateContent({
      model: "gemini-2.5-flash-preview-05-20",
      contents: prompt,
    });

    const responseText = response.text || "";
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        type: parsed.type || "question",
        confidence: parsed.confidence || 0.5,
        route: parsed.route,
        filters: parsed.filters,
        entityType: parsed.entityType,
        query: query,
      };
    }
  } catch (error) {
    console.error("Error generating search intent:", error);
  }

  return {
    type: "question",
    confidence: 0.5,
    query: query,
  };
}

function searchPages(query: string, context: SearchContext): SearchResult[] {
  const lowerQuery = query.toLowerCase();
  const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 1);
  const pages = context === "public" ? PUBLIC_PAGES 
    : context === "borrower" ? [...BORROWER_PAGES, ...PUBLIC_PAGES]
    : [...ADMIN_PAGES, ...BORROWER_PAGES, ...PUBLIC_PAGES];

  return pages
    .filter(page => 
      page.title.toLowerCase().includes(lowerQuery) ||
      page.description.toLowerCase().includes(lowerQuery) ||
      page.url.toLowerCase().includes(lowerQuery) ||
      (page.keywords && page.keywords.some(kw => 
        queryWords.some(qw => kw.includes(qw) || qw.includes(kw))
      ))
    )
    .sort((a, b) => ((b as PageEntry).priority || 0) - ((a as PageEntry).priority || 0))
    .map(page => ({
      id: page.id,
      type: "page" as const,
      title: page.title,
      description: page.description,
      url: page.url,
    }))
    .slice(0, 5);
}

function searchProducts(query: string): SearchResult[] {
  const lowerQuery = query.toLowerCase();
  
  return LOAN_PRODUCTS
    .filter(product =>
      product.title.toLowerCase().includes(lowerQuery) ||
      product.description.toLowerCase().includes(lowerQuery) ||
      product.keywords.some(kw => kw.includes(lowerQuery) || lowerQuery.includes(kw))
    )
    .map(product => ({
      id: product.id,
      type: "product" as const,
      title: product.title,
      description: product.description,
      url: `/${product.id === "fix-flip" ? "fix-flip" : product.id}`,
      icon: "package",
    }));
}

function searchFAQs(query: string): SearchResult[] {
  const lowerQuery = query.toLowerCase();
  
  return FAQS
    .filter(faq =>
      faq.question.toLowerCase().includes(lowerQuery) ||
      faq.answer.toLowerCase().includes(lowerQuery)
    )
    .map(faq => ({
      id: faq.id,
      type: "faq" as const,
      title: faq.question,
      description: faq.answer,
      icon: "help-circle",
    }))
    .slice(0, 3);
}

export async function searchPublic(query: string): Promise<SearchResponse> {
  const intent = await generateSearchIntent(query, "public");
  
  const pageResults = searchPages(query, "public");
  const productResults = searchProducts(query);
  const stateResults = searchStates(query);
  const faqResults = searchFAQs(query);
  
  const results = [...stateResults, ...productResults, ...pageResults, ...faqResults].slice(0, 8);
  
  const suggestions = [
    "DSCR loan requirements",
    "Fix and flip rates",
    "How to apply",
    "Contact us",
  ].filter(s => !s.toLowerCase().includes(query.toLowerCase())).slice(0, 3);

  return {
    intent,
    results,
    suggestions,
  };
}

export async function searchBorrowerPortal(
  query: string,
  userId: string,
  storage: any
): Promise<SearchResponse> {
  const intent = await generateSearchIntent(query, "borrower");
  
  const pageResults = searchPages(query, "borrower");
  const faqResults = searchFAQs(query);
  
  let applicationResults: SearchResult[] = [];
  try {
    const applications = await storage.getLoanApplicationsByUserId(userId);
    const lowerQuery = query.toLowerCase();
    
    applicationResults = applications
      .filter((app: any) => 
        app.propertyAddress?.toLowerCase().includes(lowerQuery) ||
        app.loanType?.toLowerCase().includes(lowerQuery) ||
        app.status?.toLowerCase().includes(lowerQuery) ||
        app.id?.toLowerCase().includes(lowerQuery)
      )
      .map((app: any) => ({
        id: app.id,
        type: "application" as const,
        title: `${app.loanType} - ${app.propertyAddress || "No address"}`,
        description: `Status: ${app.status} | Amount: $${(app.loanAmount || 0).toLocaleString()}`,
        url: `/portal/application/${app.id}`,
        icon: "file-text",
        metadata: { status: app.status, loanType: app.loanType },
      }))
      .slice(0, 5);
  } catch (error) {
    console.error("Error searching applications:", error);
  }

  const results = [...applicationResults, ...pageResults, ...faqResults].slice(0, 8);
  
  return {
    intent,
    results,
    suggestions: ["My applications", "Upload documents", "Payment status"],
  };
}

export async function searchAdminPortal(
  query: string,
  storage: any
): Promise<SearchResponse> {
  const intent = await generateSearchIntent(query, "admin");
  
  const pageResults = searchPages(query, "admin");
  const lowerQuery = query.toLowerCase();
  
  let applicationResults: SearchResult[] = [];
  let userResults: SearchResult[] = [];

  try {
    const applications = await storage.getAllLoanApplications();
    
    applicationResults = applications
      .filter((app: any) => 
        app.propertyAddress?.toLowerCase().includes(lowerQuery) ||
        app.loanType?.toLowerCase().includes(lowerQuery) ||
        app.status?.toLowerCase().includes(lowerQuery) ||
        app.id?.toLowerCase().includes(lowerQuery)
      )
      .map((app: any) => ({
        id: app.id,
        type: "application" as const,
        title: `${app.loanType} - ${app.propertyAddress || "No address"}`,
        description: `Status: ${app.status} | Amount: $${(app.loanAmount || 0).toLocaleString()}`,
        url: `/admin/application/${app.id}`,
        icon: "file-text",
        metadata: { status: app.status, loanType: app.loanType },
      }))
      .slice(0, 5);
  } catch (error) {
    console.error("Error searching applications:", error);
  }

  try {
    const users = await storage.getAllUsers();
    
    userResults = users
      .filter((user: any) => 
        user.email?.toLowerCase().includes(lowerQuery) ||
        user.firstName?.toLowerCase().includes(lowerQuery) ||
        user.lastName?.toLowerCase().includes(lowerQuery) ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(lowerQuery)
      )
      .map((user: any) => ({
        id: user.id,
        type: "user" as const,
        title: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "Unknown",
        description: `${user.role} | ${user.email}`,
        url: `/admin/users/${user.id}`,
        icon: "user",
        metadata: { role: user.role, email: user.email },
      }))
      .slice(0, 3);
  } catch (error) {
    console.error("Error searching users:", error);
  }

  const results = [...applicationResults, ...userResults, ...pageResults].slice(0, 10);
  
  return {
    intent,
    results,
    suggestions: ["Pending applications", "Submitted today", "All users"],
  };
}

export async function performSearch(
  query: string,
  context: SearchContext,
  userId?: string,
  storage?: any
): Promise<SearchResponse> {
  if (!query || query.trim().length === 0) {
    return {
      intent: { type: "question", confidence: 0, query: "" },
      results: [],
      suggestions: ["DSCR loans", "Fix & Flip", "Get a quote", "Contact us"],
    };
  }

  switch (context) {
    case "public":
      return searchPublic(query);
    case "borrower":
      if (!userId || !storage) {
        return searchPublic(query);
      }
      return searchBorrowerPortal(query, userId, storage);
    case "admin":
      if (!storage) {
        return searchPublic(query);
      }
      return searchAdminPortal(query, storage);
    default:
      return searchPublic(query);
  }
}
