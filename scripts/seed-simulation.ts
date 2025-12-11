/**
 * Loan Simulation Seed Script
 * 
 * Creates 100 randomized loans over 60 days through both funnels:
 * - Get Quote (leads converted to applications)
 * - Direct Application (portal applications)
 * 
 * Loan Types: DSCR (Purchase, Cash-Out, Rate&Term), Fix & Flip, New Construction
 * 
 * Leaves 10 loans in servicing for inspection (5 types × 2 funnels)
 */

import { db } from "../server/db";
import { 
  users, 
  leads, 
  loanApplications, 
  servicedLoans,
  applicationStageHistory,
  applicationTimeline
} from "../shared/schema";
import { sql } from "drizzle-orm";

// ============================================
// DATA CONSTANTS
// ============================================

// 100 unique real US residential addresses across different states
const ADDRESSES = [
  // High Cost of Living - California
  { street: "1847 Vallejo St", city: "San Francisco", state: "CA", zip: "94123", highCOL: true },
  { street: "2156 Divisadero St", city: "San Francisco", state: "CA", zip: "94115", highCOL: true },
  { street: "8721 Sunset Blvd", city: "Los Angeles", state: "CA", zip: "90069", highCOL: true },
  { street: "14523 Ventura Blvd", city: "Sherman Oaks", state: "CA", zip: "91403", highCOL: true },
  { street: "3842 Laurel Canyon Blvd", city: "Studio City", state: "CA", zip: "91604", highCOL: true },
  { street: "2847 Ocean Park Blvd", city: "Santa Monica", state: "CA", zip: "90405", highCOL: true },
  { street: "1523 Coast Blvd", city: "La Jolla", state: "CA", zip: "92037", highCOL: true },
  { street: "4521 Telegraph Ave", city: "Oakland", state: "CA", zip: "94609", highCOL: true },
  { street: "892 University Ave", city: "Palo Alto", state: "CA", zip: "94301", highCOL: true },
  { street: "1847 El Camino Real", city: "Menlo Park", state: "CA", zip: "94025", highCOL: true },
  
  // High Cost of Living - New York
  { street: "247 W 87th St", city: "New York", state: "NY", zip: "10024", highCOL: true },
  { street: "158 E 63rd St", city: "New York", state: "NY", zip: "10065", highCOL: true },
  { street: "432 Park Ave S", city: "New York", state: "NY", zip: "10016", highCOL: true },
  { street: "89 Bedford St", city: "New York", state: "NY", zip: "10014", highCOL: true },
  { street: "1247 Lexington Ave", city: "New York", state: "NY", zip: "10028", highCOL: true },
  { street: "523 Atlantic Ave", city: "Brooklyn", state: "NY", zip: "11217", highCOL: true },
  { street: "187 Columbia Heights", city: "Brooklyn", state: "NY", zip: "11201", highCOL: true },
  { street: "42 Shelter Island Rd", city: "East Hampton", state: "NY", zip: "11937", highCOL: true },
  
  // High Cost of Living - Massachusetts
  { street: "127 Beacon St", city: "Boston", state: "MA", zip: "02116", highCOL: true },
  { street: "48 Commonwealth Ave", city: "Boston", state: "MA", zip: "02116", highCOL: true },
  { street: "892 Massachusetts Ave", city: "Cambridge", state: "MA", zip: "02139", highCOL: true },
  { street: "234 Brattle St", city: "Cambridge", state: "MA", zip: "02138", highCOL: true },
  
  // High Cost of Living - Washington
  { street: "4521 Fremont Ave N", city: "Seattle", state: "WA", zip: "98103", highCOL: true },
  { street: "2847 Queen Anne Ave N", city: "Seattle", state: "WA", zip: "98109", highCOL: true },
  { street: "1234 Bellevue Way NE", city: "Bellevue", state: "WA", zip: "98004", highCOL: true },
  
  // High Cost of Living - Colorado
  { street: "1847 Pearl St", city: "Boulder", state: "CO", zip: "80302", highCOL: true },
  { street: "3421 17th Ave", city: "Denver", state: "CO", zip: "80211", highCOL: true },
  { street: "892 Larimer St", city: "Denver", state: "CO", zip: "80204", highCOL: true },
  
  // High Cost of Living - Hawaii
  { street: "1847 Kalakaua Ave", city: "Honolulu", state: "HI", zip: "96815", highCOL: true },
  { street: "523 Kapiolani Blvd", city: "Honolulu", state: "HI", zip: "96813", highCOL: true },
  
  // Standard Cost - Texas
  { street: "4521 Oak Lawn Ave", city: "Dallas", state: "TX", zip: "75219", highCOL: false },
  { street: "2847 Westheimer Rd", city: "Houston", state: "TX", zip: "77098", highCOL: false },
  { street: "1523 South Congress Ave", city: "Austin", state: "TX", zip: "78704", highCOL: false },
  { street: "8923 Broadway St", city: "San Antonio", state: "TX", zip: "78209", highCOL: false },
  { street: "3421 Camp Bowie Blvd", city: "Fort Worth", state: "TX", zip: "76107", highCOL: false },
  { street: "1847 Main St", city: "Frisco", state: "TX", zip: "75034", highCOL: false },
  { street: "523 Preston Rd", city: "Plano", state: "TX", zip: "75024", highCOL: false },
  { street: "892 Belt Line Rd", city: "Irving", state: "TX", zip: "75038", highCOL: false },
  
  // Standard Cost - Florida
  { street: "1234 Ocean Dr", city: "Miami Beach", state: "FL", zip: "33139", highCOL: false },
  { street: "4521 Brickell Ave", city: "Miami", state: "FL", zip: "33129", highCOL: false },
  { street: "892 Las Olas Blvd", city: "Fort Lauderdale", state: "FL", zip: "33301", highCOL: false },
  { street: "2847 Atlantic Blvd", city: "Jacksonville", state: "FL", zip: "32207", highCOL: false },
  { street: "1523 Central Ave", city: "St Petersburg", state: "FL", zip: "33701", highCOL: false },
  { street: "3421 Park Ave", city: "Winter Park", state: "FL", zip: "32789", highCOL: false },
  { street: "1847 Gulf Shore Blvd", city: "Naples", state: "FL", zip: "34102", highCOL: false },
  { street: "523 Main St", city: "Sarasota", state: "FL", zip: "34236", highCOL: false },
  
  // Standard Cost - Arizona
  { street: "4521 N Scottsdale Rd", city: "Scottsdale", state: "AZ", zip: "85251", highCOL: false },
  { street: "1847 E Camelback Rd", city: "Phoenix", state: "AZ", zip: "85016", highCOL: false },
  { street: "892 N Campbell Ave", city: "Tucson", state: "AZ", zip: "85719", highCOL: false },
  { street: "2847 E Baseline Rd", city: "Mesa", state: "AZ", zip: "85204", highCOL: false },
  
  // Standard Cost - Georgia
  { street: "1234 Peachtree St NE", city: "Atlanta", state: "GA", zip: "30309", highCOL: false },
  { street: "4521 Ponce De Leon Ave", city: "Atlanta", state: "GA", zip: "30308", highCOL: false },
  { street: "892 Bull St", city: "Savannah", state: "GA", zip: "31401", highCOL: false },
  { street: "2847 Broad St", city: "Augusta", state: "GA", zip: "30901", highCOL: false },
  
  // Standard Cost - North Carolina
  { street: "1523 South Blvd", city: "Charlotte", state: "NC", zip: "28203", highCOL: false },
  { street: "3421 Glenwood Ave", city: "Raleigh", state: "NC", zip: "27612", highCOL: false },
  { street: "1847 Battleground Ave", city: "Greensboro", state: "NC", zip: "27408", highCOL: false },
  { street: "523 Haywood Rd", city: "Asheville", state: "NC", zip: "28806", highCOL: false },
  
  // Standard Cost - Tennessee
  { street: "1234 Broadway", city: "Nashville", state: "TN", zip: "37203", highCOL: false },
  { street: "4521 Beale St", city: "Memphis", state: "TN", zip: "38103", highCOL: false },
  { street: "892 Market St", city: "Chattanooga", state: "TN", zip: "37402", highCOL: false },
  { street: "2847 Kingston Pike", city: "Knoxville", state: "TN", zip: "37919", highCOL: false },
  
  // Standard Cost - Nevada
  { street: "1523 S Las Vegas Blvd", city: "Las Vegas", state: "NV", zip: "89109", highCOL: false },
  { street: "3421 W Sahara Ave", city: "Las Vegas", state: "NV", zip: "89102", highCOL: false },
  { street: "1847 S Virginia St", city: "Reno", state: "NV", zip: "89502", highCOL: false },
  { street: "523 Victorian Ave", city: "Sparks", state: "NV", zip: "89431", highCOL: false },
  
  // Standard Cost - Ohio
  { street: "1234 Euclid Ave", city: "Cleveland", state: "OH", zip: "44115", highCOL: false },
  { street: "4521 High St", city: "Columbus", state: "OH", zip: "43214", highCOL: false },
  { street: "892 Vine St", city: "Cincinnati", state: "OH", zip: "45202", highCOL: false },
  { street: "2847 Monroe St", city: "Toledo", state: "OH", zip: "43606", highCOL: false },
  
  // Standard Cost - Illinois
  { street: "1523 N Clark St", city: "Chicago", state: "IL", zip: "60614", highCOL: false },
  { street: "3421 N Halsted St", city: "Chicago", state: "IL", zip: "60657", highCOL: false },
  { street: "1847 E Adams St", city: "Springfield", state: "IL", zip: "62701", highCOL: false },
  
  // Standard Cost - Michigan
  { street: "1234 Woodward Ave", city: "Detroit", state: "MI", zip: "48226", highCOL: false },
  { street: "4521 E Grand River Ave", city: "East Lansing", state: "MI", zip: "48823", highCOL: false },
  { street: "892 Monroe Center St", city: "Grand Rapids", state: "MI", zip: "49503", highCOL: false },
  
  // Standard Cost - Pennsylvania
  { street: "2847 Market St", city: "Philadelphia", state: "PA", zip: "19104", highCOL: false },
  { street: "1523 Liberty Ave", city: "Pittsburgh", state: "PA", zip: "15222", highCOL: false },
  { street: "3421 N Front St", city: "Harrisburg", state: "PA", zip: "17110", highCOL: false },
  
  // Standard Cost - Virginia
  { street: "1847 Duke St", city: "Alexandria", state: "VA", zip: "22314", highCOL: false },
  { street: "523 Granby St", city: "Norfolk", state: "VA", zip: "23510", highCOL: false },
  { street: "892 E Main St", city: "Richmond", state: "VA", zip: "23219", highCOL: false },
  
  // Standard Cost - Oregon
  { street: "1234 NW 23rd Ave", city: "Portland", state: "OR", zip: "97210", highCOL: false },
  { street: "4521 Willamette St", city: "Eugene", state: "OR", zip: "97401", highCOL: false },
  
  // Standard Cost - Minnesota
  { street: "2847 Hennepin Ave", city: "Minneapolis", state: "MN", zip: "55408", highCOL: false },
  { street: "1523 Grand Ave", city: "St Paul", state: "MN", zip: "55105", highCOL: false },
  
  // Standard Cost - Wisconsin
  { street: "1847 State St", city: "Madison", state: "WI", zip: "53703", highCOL: false },
  { street: "523 N Water St", city: "Milwaukee", state: "WI", zip: "53202", highCOL: false },
  
  // Standard Cost - Indiana
  { street: "892 Massachusetts Ave", city: "Indianapolis", state: "IN", zip: "46204", highCOL: false },
  { street: "2847 Calhoun St", city: "Fort Wayne", state: "IN", zip: "46802", highCOL: false },
  
  // Standard Cost - Missouri
  { street: "1234 Delmar Blvd", city: "St Louis", state: "MO", zip: "63112", highCOL: false },
  { street: "4521 Main St", city: "Kansas City", state: "MO", zip: "64111", highCOL: false },
  
  // Standard Cost - Louisiana
  { street: "1523 Magazine St", city: "New Orleans", state: "LA", zip: "70130", highCOL: false },
  { street: "3421 Government St", city: "Baton Rouge", state: "LA", zip: "70806", highCOL: false },
  
  // Standard Cost - Utah
  { street: "1847 E 400 S", city: "Salt Lake City", state: "UT", zip: "84111", highCOL: false },
  { street: "523 N University Ave", city: "Provo", state: "UT", zip: "84601", highCOL: false },
  
  // Standard Cost - New Mexico
  { street: "892 Central Ave NE", city: "Albuquerque", state: "NM", zip: "87106", highCOL: false },
  { street: "2847 Cerrillos Rd", city: "Santa Fe", state: "NM", zip: "87505", highCOL: false },
  
  // Standard Cost - South Carolina
  { street: "1234 King St", city: "Charleston", state: "SC", zip: "29401", highCOL: false },
  { street: "4521 Main St", city: "Columbia", state: "SC", zip: "29201", highCOL: false },
];

// Realistic first and last names for borrowers
const FIRST_NAMES = [
  "James", "Michael", "Robert", "David", "William", "Richard", "Joseph", "Thomas", "Christopher", "Charles",
  "Daniel", "Matthew", "Anthony", "Mark", "Donald", "Steven", "Paul", "Andrew", "Joshua", "Kenneth",
  "Mary", "Patricia", "Jennifer", "Linda", "Barbara", "Elizabeth", "Susan", "Jessica", "Sarah", "Karen",
  "Nancy", "Lisa", "Betty", "Margaret", "Sandra", "Ashley", "Kimberly", "Emily", "Donna", "Michelle",
  "Brian", "Kevin", "Timothy", "Ronald", "George", "Edward", "Jason", "Jeffrey", "Ryan", "Jacob",
  "Amanda", "Melissa", "Deborah", "Stephanie", "Rebecca", "Sharon", "Laura", "Cynthia", "Kathleen", "Amy"
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
  "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
  "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
  "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts"
];

// Loan type configuration
type LoanTypeConfig = {
  loanType: string;
  productVariant?: "purchase" | "cash_out" | "rate_term";
  analyzerType: string;
  minLoan: number;
  maxLoan: number;
  minLoanHighCOL: number;
  maxLoanHighCOL: number;
  ltvRange: [number, number];
  rateRange: [number, number];
};

const LOAN_TYPES: LoanTypeConfig[] = [
  { 
    loanType: "DSCR", 
    productVariant: "purchase", 
    analyzerType: "dscr",
    minLoan: 150000, maxLoan: 2000000,
    minLoanHighCOL: 300000, maxLoanHighCOL: 3000000,
    ltvRange: [65, 80], rateRange: [6.5, 8.5]
  },
  { 
    loanType: "DSCR", 
    productVariant: "cash_out", 
    analyzerType: "dscr",
    minLoan: 150000, maxLoan: 2000000,
    minLoanHighCOL: 300000, maxLoanHighCOL: 3000000,
    ltvRange: [60, 75], rateRange: [7.0, 9.0]
  },
  { 
    loanType: "DSCR", 
    productVariant: "rate_term", 
    analyzerType: "dscr",
    minLoan: 150000, maxLoan: 2000000,
    minLoanHighCOL: 300000, maxLoanHighCOL: 3000000,
    ltvRange: [65, 80], rateRange: [6.25, 8.0]
  },
  { 
    loanType: "Fix & Flip", 
    analyzerType: "fixflip",
    minLoan: 100000, maxLoan: 2000000,
    minLoanHighCOL: 200000, maxLoanHighCOL: 5000000,
    ltvRange: [70, 90], rateRange: [10.0, 13.0]
  },
  { 
    loanType: "New Construction", 
    analyzerType: "construction",
    minLoan: 100000, maxLoan: 2000000,
    minLoanHighCOL: 200000, maxLoanHighCOL: 5000000,
    ltvRange: [65, 85], rateRange: [10.5, 14.0]
  },
];

// Status progression based on days since creation
type StatusProgression = {
  status: "draft" | "submitted" | "in_review" | "approved" | "funded";
  processingStage: "account_review" | "underwriting" | "term_sheet" | "processing" | "docs_out" | "closed";
};

function getStatusByAge(daysOld: number): StatusProgression {
  if (daysOld >= 50) return { status: "funded", processingStage: "closed" };
  if (daysOld >= 40) return { status: "approved", processingStage: "docs_out" };
  if (daysOld >= 25) return { status: "in_review", processingStage: "underwriting" };
  if (daysOld >= 10) return { status: "submitted", processingStage: "account_review" };
  return { status: "draft", processingStage: "account_review" };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 2): number {
  const value = Math.random() * (max - min) + min;
  return parseFloat(value.toFixed(decimals));
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generatePhone(): string {
  const areaCode = randomInt(200, 999);
  const prefix = randomInt(200, 999);
  const line = randomInt(1000, 9999);
  return `(${areaCode}) ${prefix}-${line}`;
}

function generateBorrowerInfo(index: number) {
  const firstName = randomElement(FIRST_NAMES);
  const lastName = randomElement(LAST_NAMES);
  const name = `${firstName} ${lastName}`;
  const uniqueSuffix = Date.now().toString(36) + index.toString(36);
  const email = `${firstName.toLowerCase()}${lastName.toLowerCase()}${uniqueSuffix}@email.com`;
  const phone = generatePhone();
  return { firstName, lastName, name, email, phone, uniqueSuffix };
}

function generateLoanNumber(index: number): string {
  const year = new Date().getFullYear();
  const uniquePart = Date.now().toString(36).slice(-4).toUpperCase();
  return `SQ${year}-${String(index + 1).padStart(4, '0')}-${uniquePart}`;
}

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(randomInt(8, 18), randomInt(0, 59), randomInt(0, 59));
  return date;
}

function generateAnalyzerData(loanType: LoanTypeConfig, address: typeof ADDRESSES[0], loanAmount: number, purchasePrice: number, rate: number) {
  const ltv = (loanAmount / purchasePrice) * 100;
  
  if (loanType.analyzerType === "dscr") {
    const monthlyRent = Math.round(purchasePrice * 0.007); // ~0.7% rule
    const annualTaxes = Math.round(purchasePrice * 0.012);
    const annualInsurance = Math.round(purchasePrice * 0.003);
    const annualHOA = randomInt(0, 500) * 12;
    
    return {
      inputs: {
        transactionType: loanType.productVariant,
        propertyType: randomElement(["sfr", "condo", "townhouse", "2-4_unit"]),
        rentalType: randomElement(["long_term", "short_term"]),
        propertyAddress: `${address.street}, ${address.city}, ${address.state} ${address.zip}`,
        propertyValue: purchasePrice.toString(),
        requestedLoanAmount: loanAmount.toString(),
        monthlyRent: monthlyRent.toString(),
        annualTaxes: annualTaxes.toString(),
        annualInsurance: annualInsurance.toString(),
        annualHOA: annualHOA.toString(),
        creditScore: randomElement(["720-739", "740-759", "760+"]),
        prepaymentPenalty: randomElement(["3yr", "5yr"]),
      },
      results: {
        ltv: ltv,
        dscrRatio: randomFloat(1.1, 1.8, 2),
        calculatedRate: rate,
        monthlyPayment: Math.round(loanAmount * (rate / 100 / 12) / (1 - Math.pow(1 + rate / 100 / 12, -360))),
        cashToClose: Math.round((purchasePrice - loanAmount) * 1.03),
      }
    };
  } else if (loanType.analyzerType === "fixflip") {
    const arv = Math.round(purchasePrice * randomFloat(1.3, 1.6, 2));
    const rehabBudget = Math.round(arv * randomFloat(0.1, 0.25, 2));
    
    return {
      inputs: {
        propertyAddress: `${address.street}, ${address.city}, ${address.state} ${address.zip}`,
        purchasePrice: purchasePrice.toString(),
        arv: arv.toString(),
        rehabBudget: rehabBudget.toString(),
        holdTime: randomElement(["6", "9", "12"]),
        creditScore: randomElement(["680+", "720+", "760+"]),
        experience: randomElement(["1-2", "3-5", "5+"]),
      },
      results: {
        ltv: ltv,
        ltc: ((loanAmount / (purchasePrice + rehabBudget)) * 100),
        calculatedRate: rate,
        totalProfit: Math.round((arv - purchasePrice - rehabBudget) * 0.7),
        cashToClose: Math.round(purchasePrice * 0.15 + rehabBudget * 0.1),
      }
    };
  } else {
    // construction
    const totalProjectCost = purchasePrice;
    const landCost = Math.round(totalProjectCost * 0.25);
    const constructionBudget = totalProjectCost - landCost;
    const arv = Math.round(totalProjectCost * randomFloat(1.2, 1.4, 2));
    
    return {
      inputs: {
        propertyAddress: `${address.street}, ${address.city}, ${address.state} ${address.zip}`,
        landCost: landCost.toString(),
        constructionBudget: constructionBudget.toString(),
        arv: arv.toString(),
        buildTime: randomElement(["9", "12", "18"]),
        experience: randomElement(["1-2", "3-5", "5+"]),
      },
      results: {
        ltc: ((loanAmount / totalProjectCost) * 100),
        calculatedRate: rate,
        totalProjectCost: totalProjectCost,
        estimatedProfit: Math.round((arv - totalProjectCost) * 0.7),
      }
    };
  }
}

// ============================================
// MAIN SIMULATION LOGIC
// ============================================

interface SimulationConfig {
  totalLoans: number;
  daysSpan: number;
  servicingTargets: Array<{
    loanType: string;
    productVariant?: string;
    funnel: "quote" | "direct";
  }>;
}

async function runSimulation(config: SimulationConfig) {
  console.log("Starting loan simulation...");
  console.log(`Creating ${config.totalLoans} loans over ${config.daysSpan} days`);
  
  // Shuffle addresses
  const shuffledAddresses = shuffleArray(ADDRESSES);
  
  // Track created records
  const createdUsers: string[] = [];
  const createdLeads: string[] = [];
  const createdApplications: string[] = [];
  const servicedLoanIds: string[] = [];
  
  // Distribution: roughly even across loan types
  const loansPerType = Math.floor(config.totalLoans / LOAN_TYPES.length);
  let loanIndex = 0;
  
  // Track which servicing targets have been fulfilled
  const usedServicingTargets = new Set<string>();
  
  // Create loans for each type
  for (let typeIndex = 0; typeIndex < LOAN_TYPES.length; typeIndex++) {
    const loanTypeConfig = LOAN_TYPES[typeIndex];
    // Last loan type gets remaining loans to ensure we hit exactly 100
    const loansForThisType = typeIndex === LOAN_TYPES.length - 1 
      ? config.totalLoans - loanIndex 
      : loansPerType;
    
    for (let i = 0; i < loansForThisType; i++) {
      const address = shuffledAddresses[loanIndex % shuffledAddresses.length];
      const borrower = generateBorrowerInfo(loanIndex);
      const daysOld = randomInt(1, config.daysSpan);
      const createdAt = daysAgo(daysOld);
      
      // Determine funnel type (50/50 split)
      const isQuoteFunnel = loanIndex % 2 === 0;
      
      // Check if this should be a servicing target (only mark first match)
      const targetKey = `${loanTypeConfig.loanType}|${loanTypeConfig.productVariant || ''}|${isQuoteFunnel ? 'quote' : 'direct'}`;
      const matchesTarget = config.servicingTargets.some(
        t => t.loanType === loanTypeConfig.loanType && 
             t.productVariant === loanTypeConfig.productVariant &&
             t.funnel === (isQuoteFunnel ? "quote" : "direct")
      );
      const isServicingTarget = matchesTarget && !usedServicingTargets.has(targetKey);
      if (isServicingTarget) {
        usedServicingTargets.add(targetKey);
      }
      
      // Calculate loan amounts based on location
      const minLoan = address.highCOL ? loanTypeConfig.minLoanHighCOL : loanTypeConfig.minLoan;
      const maxLoan = address.highCOL ? loanTypeConfig.maxLoanHighCOL : loanTypeConfig.maxLoan;
      const loanAmount = randomInt(minLoan, maxLoan);
      const ltv = randomFloat(loanTypeConfig.ltvRange[0], loanTypeConfig.ltvRange[1], 1);
      const purchasePrice = Math.round(loanAmount / (ltv / 100));
      const rate = randomFloat(loanTypeConfig.rateRange[0], loanTypeConfig.rateRange[1], 3);
      
      // Get status based on age (override for servicing targets)
      let statusInfo = getStatusByAge(daysOld);
      if (isServicingTarget) {
        statusInfo = { status: "funded", processingStage: "closed" };
      }
      
      console.log(`[${loanIndex + 1}/${config.totalLoans}] Creating ${loanTypeConfig.loanType}${loanTypeConfig.productVariant ? ` (${loanTypeConfig.productVariant})` : ''} - ${isQuoteFunnel ? 'Quote' : 'Direct'} funnel - ${address.city}, ${address.state} - ${statusInfo.status}${isServicingTarget ? ' [SERVICING TARGET]' : ''}`);
      
      try {
        // Step 1: Create user
        const [user] = await db.insert(users).values({
          email: borrower.email,
          username: `${borrower.firstName.toLowerCase()}${borrower.lastName.toLowerCase()}${borrower.uniqueSuffix}`,
          firstName: borrower.firstName,
          lastName: borrower.lastName,
          phone: borrower.phone,
          role: "borrower",
          createdAt,
        }).returning();
        
        createdUsers.push(user.id);
        
        // Step 2: Create lead if quote funnel
        if (isQuoteFunnel) {
          const [lead] = await db.insert(leads).values({
            name: borrower.name,
            email: borrower.email,
            phone: borrower.phone,
            loanType: loanTypeConfig.loanType === "Fix & Flip" || loanTypeConfig.loanType === "New Construction" ? "Hard Money" : loanTypeConfig.loanType,
            propertyLocation: `${address.city}, ${address.state}`,
            propertyValue: purchasePrice.toString(),
            investmentExperience: randomElement(["Beginner", "Intermediate", "Experienced"]),
            desiredClosingDate: randomElement(["ASAP", "30 days", "60 days", "90+ days"]),
            message: `Interested in ${loanTypeConfig.loanType} loan for investment property.`,
            howHeardAboutUs: randomElement(["Google", "Referral", "Social Media", "BiggerPockets"]),
            createdAt,
          }).returning();
          
          createdLeads.push(lead.id);
        }
        
        // Step 3: Create application
        const analyzerData = generateAnalyzerData(loanTypeConfig, address, loanAmount, purchasePrice, rate);
        
        const [application] = await db.insert(loanApplications).values({
          userId: user.id,
          loanType: loanTypeConfig.loanType,
          productVariant: loanTypeConfig.productVariant || null,
          propertyAddress: `${address.street}, ${address.city}, ${address.state} ${address.zip}`,
          propertyCity: address.city,
          propertyState: address.state,
          propertyZip: address.zip,
          loanAmount,
          purchasePrice,
          arv: loanTypeConfig.analyzerType !== "dscr" ? Math.round(purchasePrice * 1.35) : null,
          rehabBudget: loanTypeConfig.analyzerType === "fixflip" ? Math.round(purchasePrice * 0.2) : null,
          interestRate: rate.toFixed(3),
          ltv: ltv.toFixed(1),
          loanTermMonths: loanTypeConfig.analyzerType === "dscr" ? 360 : randomElement([6, 9, 12, 18]),
          annualTaxes: Math.round(purchasePrice * 0.012),
          annualInsurance: Math.round(purchasePrice * 0.003),
          annualHOA: randomInt(0, 6000),
          status: statusInfo.status,
          processingStage: statusInfo.processingStage,
          analyzerType: loanTypeConfig.analyzerType,
          analyzerData,
          guarantor: borrower.name,
          entity: `${borrower.lastName} Investments LLC`,
          createdAt,
          updatedAt: createdAt,
        }).returning();
        
        createdApplications.push(application.id);
        
        // Step 4: Create timeline event
        await db.insert(applicationTimeline).values({
          loanApplicationId: application.id,
          eventType: "application_created",
          title: "Application Created",
          description: `${loanTypeConfig.loanType} loan application ${isQuoteFunnel ? 'converted from quote' : 'submitted directly'}`,
          createdAt,
        });
        
        // Step 5: Create stage history for progression
        if (statusInfo.status !== "draft") {
          await db.insert(applicationStageHistory).values({
            loanApplicationId: application.id,
            fromStatus: "draft",
            toStatus: "submitted",
            isAutomated: true,
            createdAt: new Date(createdAt.getTime() + 1000 * 60 * 60), // 1 hour after creation
          });
        }
        
        if (["in_review", "approved", "funded"].includes(statusInfo.status)) {
          await db.insert(applicationStageHistory).values({
            loanApplicationId: application.id,
            fromStatus: "submitted",
            toStatus: "in_review",
            toStage: "underwriting",
            isAutomated: false,
            notes: "Application assigned to underwriting team",
            createdAt: new Date(createdAt.getTime() + 1000 * 60 * 60 * 24 * 5), // 5 days later
          });
        }
        
        if (["approved", "funded"].includes(statusInfo.status)) {
          await db.insert(applicationStageHistory).values({
            loanApplicationId: application.id,
            fromStatus: "in_review",
            toStatus: "approved",
            toStage: "docs_out",
            isAutomated: false,
            notes: "Loan approved - closing documents prepared",
            createdAt: new Date(createdAt.getTime() + 1000 * 60 * 60 * 24 * 15), // 15 days later
          });
        }
        
        // Step 6: Create serviced loan if funded (and especially for targets)
        if (statusInfo.status === "funded") {
          const fundedDate = new Date(createdAt.getTime() + 1000 * 60 * 60 * 24 * 30);
          const nextPaymentDate = new Date(fundedDate);
          nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
          nextPaymentDate.setDate(1);
          
          const monthlyPayment = loanTypeConfig.analyzerType === "dscr" 
            ? Math.round(loanAmount * (rate / 100 / 12) / (1 - Math.pow(1 + rate / 100 / 12, -360)))
            : Math.round(loanAmount * (rate / 100 / 12));
          
          const [servicedLoan] = await db.insert(servicedLoans).values({
            userId: user.id,
            loanApplicationId: application.id,
            loanNumber: generateLoanNumber(loanIndex),
            loanType: loanTypeConfig.analyzerType === "dscr" ? "dscr" : (loanTypeConfig.loanType === "Fix & Flip" ? "fix_flip" : "new_construction"),
            propertyAddress: `${address.street}, ${address.city}, ${address.state} ${address.zip}`,
            propertyCity: address.city,
            propertyState: address.state,
            propertyZip: address.zip,
            propertyType: randomElement(["sfr", "condo", "townhouse", "multi_family"]),
            originalLoanAmount: loanAmount,
            currentBalance: loanAmount,
            interestRate: rate.toFixed(2),
            loanTermMonths: loanTypeConfig.analyzerType === "dscr" ? 360 : randomElement([6, 9, 12, 18]),
            amortizationMonths: loanTypeConfig.analyzerType === "dscr" ? 360 : null,
            isInterestOnly: loanTypeConfig.analyzerType !== "dscr",
            monthlyPayment,
            paymentDueDay: 1,
            gracePeriodDays: 15,
            lateFeePercent: "5",
            loanStatus: "current",
            nextPaymentDate,
            nextPaymentAmount: monthlyPayment,
            hasEscrow: loanTypeConfig.analyzerType === "dscr",
            escrowBalance: loanTypeConfig.analyzerType === "dscr" ? Math.round((purchasePrice * 0.015) / 12) * 2 : 0,
            monthlyEscrowAmount: loanTypeConfig.analyzerType === "dscr" ? Math.round((purchasePrice * 0.015) / 12) : 0,
            annualTaxes: Math.round(purchasePrice * 0.012),
            annualInsurance: Math.round(purchasePrice * 0.003),
            totalRehabBudget: loanTypeConfig.analyzerType !== "dscr" ? Math.round(purchasePrice * 0.2) : null,
            createdAt: fundedDate,
            updatedAt: fundedDate,
          }).returning();
          
          servicedLoanIds.push(servicedLoan.id);
          
          // Create funded timeline event
          await db.insert(applicationTimeline).values({
            loanApplicationId: application.id,
            eventType: "loan_funded",
            title: "Loan Funded",
            description: `Loan funded and transferred to servicing. Loan #${servicedLoan.loanNumber}`,
            createdAt: fundedDate,
          });
          
          // Final stage history
          await db.insert(applicationStageHistory).values({
            loanApplicationId: application.id,
            fromStatus: "approved",
            toStatus: "funded",
            toStage: "closed",
            isAutomated: true,
            notes: `Loan funded - Servicing loan created: ${servicedLoan.loanNumber}`,
            createdAt: fundedDate,
          });
        }
        
        loanIndex++;
        
      } catch (error) {
        console.error(`Error creating loan ${loanIndex + 1}:`, error);
      }
    }
  }
  
  console.log("\n========================================");
  console.log("SIMULATION COMPLETE");
  console.log("========================================");
  console.log(`Users created: ${createdUsers.length}`);
  console.log(`Leads created: ${createdLeads.length}`);
  console.log(`Applications created: ${createdApplications.length}`);
  console.log(`Serviced loans created: ${servicedLoanIds.length}`);
  console.log("========================================\n");
  
  return {
    users: createdUsers,
    leads: createdLeads,
    applications: createdApplications,
    servicedLoans: servicedLoanIds,
  };
}

// ============================================
// EXECUTION
// ============================================

const SIMULATION_CONFIG: SimulationConfig = {
  totalLoans: 100,
  daysSpan: 60,
  servicingTargets: [
    // 10 specific loans to leave in servicing (5 types × 2 funnels)
    { loanType: "DSCR", productVariant: "purchase", funnel: "quote" },
    { loanType: "DSCR", productVariant: "purchase", funnel: "direct" },
    { loanType: "DSCR", productVariant: "cash_out", funnel: "quote" },
    { loanType: "DSCR", productVariant: "cash_out", funnel: "direct" },
    { loanType: "DSCR", productVariant: "rate_term", funnel: "quote" },
    { loanType: "DSCR", productVariant: "rate_term", funnel: "direct" },
    { loanType: "Fix & Flip", funnel: "quote" },
    { loanType: "Fix & Flip", funnel: "direct" },
    { loanType: "New Construction", funnel: "quote" },
    { loanType: "New Construction", funnel: "direct" },
  ],
};

runSimulation(SIMULATION_CONFIG)
  .then((results) => {
    console.log("Simulation completed successfully!");
    console.log("Results:", JSON.stringify(results, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error("Simulation failed:", error);
    process.exit(1);
  });
