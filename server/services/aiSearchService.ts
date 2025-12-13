import { GoogleGenAI } from "@google/genai";
import type { SearchContext, SearchIntent, SearchResult, SearchResponse } from "@shared/schema";
import { 
  getSearchableRoutes, 
  US_STATES, 
  LOAN_PRODUCTS, 
  FAQS,
  type RouteEntry 
} from "@shared/routeRegistry";

const geminiClient = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY!,
  httpOptions: {
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

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
      model: "gemini-2.5-flash",
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
    type: "navigate",
    confidence: 0.3,
    query: query,
  };
}

async function semanticAIFallback(query: string, context: SearchContext): Promise<SearchResult[]> {
  const routes = getSearchableRoutes(context);
  
  const routeList = routes.map(r => `- ${r.title}: ${r.path} (${r.description})`).join("\n");
  
  const prompt = `You are a helpful assistant for Sequel Investments, a real estate lending website.

The user searched for: "${query}"

Based on their query, suggest the most relevant pages from our website. Here are all available pages:

${routeList}

Return a JSON array of up to 3 most relevant page paths, ordered by relevance. Only include pages that are truly relevant to the query.
Format: ["path1", "path2", "path3"]

If no pages are relevant, return an empty array: []`;

  try {
    const response = await geminiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const responseText = response.text || "";
    const jsonMatch = responseText.match(/\[[\s\S]*?\]/);
    
    if (jsonMatch) {
      const suggestedPaths: string[] = JSON.parse(jsonMatch[0]);
      
      return suggestedPaths
        .map(path => routes.find(r => r.path === path))
        .filter((r): r is RouteEntry => r !== undefined)
        .map(route => ({
          id: route.id,
          type: "page" as const,
          title: route.title,
          description: route.description,
          url: route.path,
          metadata: { aiSuggested: true },
        }));
    }
  } catch (error) {
    console.error("Error in semantic AI fallback:", error);
  }

  return [];
}

function searchPages(query: string, context: SearchContext): SearchResult[] {
  const lowerQuery = query.toLowerCase();
  const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 1);
  const routes = getSearchableRoutes(context);

  return routes
    .filter(route => 
      route.title.toLowerCase().includes(lowerQuery) ||
      route.description.toLowerCase().includes(lowerQuery) ||
      route.path.toLowerCase().includes(lowerQuery) ||
      route.keywords.some(kw => 
        queryWords.some(qw => kw.includes(qw) || qw.includes(kw))
      )
    )
    .sort((a, b) => b.priority - a.priority)
    .map(route => ({
      id: route.id,
      type: "page" as const,
      title: route.title,
      description: route.description,
      url: route.path,
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
      url: `/${product.id === "fix-flip" ? "fix-flip" : product.id === "dscr" ? "dscr-loans" : "new-construction"}`,
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
  
  let pageResults = searchPages(query, "public");
  const productResults = searchProducts(query);
  const stateResults = searchStates(query);
  const faqResults = searchFAQs(query);
  
  let results = [...stateResults, ...productResults, ...pageResults, ...faqResults];
  
  if (results.length === 0 || (results.length < 3 && intent.confidence < 0.7)) {
    const aiResults = await semanticAIFallback(query, "public");
    const existingIds = new Set(results.map(r => r.id));
    const newAiResults = aiResults.filter(r => !existingIds.has(r.id));
    results = [...results, ...newAiResults];
  }
  
  results = results.slice(0, 8);
  
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
  
  let pageResults = searchPages(query, "borrower");
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

  let results = [...applicationResults, ...pageResults, ...faqResults];
  
  if (results.length === 0 || (results.length < 3 && intent.confidence < 0.7)) {
    const aiResults = await semanticAIFallback(query, "borrower");
    const existingIds = new Set(results.map(r => r.id));
    const newAiResults = aiResults.filter(r => !existingIds.has(r.id));
    results = [...results, ...newAiResults];
  }
  
  results = results.slice(0, 8);
  
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
  
  let pageResults = searchPages(query, "admin");
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

  let results = [...applicationResults, ...userResults, ...pageResults];
  
  if (results.length === 0 || (results.length < 3 && intent.confidence < 0.7)) {
    const aiResults = await semanticAIFallback(query, "admin");
    const existingIds = new Set(results.map(r => r.id));
    const newAiResults = aiResults.filter(r => !existingIds.has(r.id));
    results = [...results, ...newAiResults];
  }
  
  results = results.slice(0, 10);
  
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
