import { db } from "../db";
import { users, loanApplications, applicationStageHistory, loanAssignments } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

// ============================================================
// SIMULATION CONFIGURATION
// ============================================================

const SIMULATION_CONFIG = {
  totalLoans: 100,
  distribution: {
    dscr: 40, // 4 purchase, 4 cash_out, 2 rate_term (per 10)
    fixFlip: 35,
    construction: 25
  },
  batchSize: 10, // Create 10 loans per batch
  batchIntervalMs: 6 * 60 * 1000, // 6 minutes between batches (~1 hour total for 10 batches)
};

// ============================================================
// REALISTIC DATA GENERATORS
// ============================================================

const FIRST_NAMES = [
  "James", "Michael", "Robert", "David", "William", "Richard", "Joseph", "Thomas",
  "Christopher", "Charles", "Daniel", "Matthew", "Anthony", "Mark", "Donald",
  "Jennifer", "Linda", "Patricia", "Elizabeth", "Barbara", "Susan", "Jessica",
  "Sarah", "Karen", "Nancy", "Lisa", "Betty", "Margaret", "Sandra", "Ashley"
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
  "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
  "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson"
];

const STREET_NAMES = [
  "Oak Street", "Maple Avenue", "Cedar Lane", "Pine Road", "Elm Street",
  "Main Street", "Park Avenue", "Lake Drive", "Hill Road", "Valley View",
  "Sunset Boulevard", "Ocean Drive", "Mountain View", "River Road", "Forest Lane",
  "Willow Way", "Cherry Lane", "Birch Street", "Spruce Avenue", "Magnolia Drive"
];

const CITIES_BY_STATE: Record<string, string[]> = {
  "AL": ["Birmingham", "Huntsville", "Montgomery", "Mobile", "Tuscaloosa"],
  "AK": ["Anchorage", "Fairbanks", "Juneau", "Sitka", "Wasilla"],
  "AZ": ["Phoenix", "Scottsdale", "Tucson", "Mesa", "Chandler", "Tempe", "Gilbert", "Glendale"],
  "AR": ["Little Rock", "Fort Smith", "Fayetteville", "Springdale", "Jonesboro"],
  "CA": ["Los Angeles", "San Diego", "San Francisco", "Sacramento", "San Jose", "Fresno", "Oakland", "Irvine", "Long Beach", "Anaheim"],
  "CO": ["Denver", "Colorado Springs", "Aurora", "Fort Collins", "Boulder", "Lakewood", "Thornton", "Arvada"],
  "CT": ["Hartford", "New Haven", "Stamford", "Bridgeport", "Norwalk", "Greenwich"],
  "DE": ["Wilmington", "Dover", "Newark", "Middletown", "Smyrna"],
  "FL": ["Miami", "Orlando", "Tampa", "Jacksonville", "Fort Lauderdale", "Naples", "Sarasota", "West Palm Beach", "St. Petersburg", "Boca Raton"],
  "GA": ["Atlanta", "Savannah", "Augusta", "Athens", "Marietta", "Sandy Springs", "Alpharetta", "Roswell"],
  "HI": ["Honolulu", "Pearl City", "Hilo", "Kailua", "Waipahu"],
  "ID": ["Boise", "Meridian", "Nampa", "Idaho Falls", "Pocatello", "Caldwell"],
  "IL": ["Chicago", "Aurora", "Naperville", "Joliet", "Rockford", "Springfield", "Evanston"],
  "IN": ["Indianapolis", "Fort Wayne", "Evansville", "South Bend", "Carmel", "Fishers"],
  "IA": ["Des Moines", "Cedar Rapids", "Davenport", "Sioux City", "Iowa City"],
  "KS": ["Wichita", "Overland Park", "Kansas City", "Olathe", "Topeka", "Lawrence"],
  "KY": ["Louisville", "Lexington", "Bowling Green", "Owensboro", "Covington"],
  "LA": ["New Orleans", "Baton Rouge", "Shreveport", "Lafayette", "Lake Charles"],
  "ME": ["Portland", "Lewiston", "Bangor", "South Portland", "Auburn"],
  "MD": ["Baltimore", "Frederick", "Rockville", "Gaithersburg", "Annapolis", "Bethesda"],
  "MA": ["Boston", "Worcester", "Springfield", "Cambridge", "Lowell", "Newton"],
  "MI": ["Detroit", "Grand Rapids", "Warren", "Sterling Heights", "Ann Arbor", "Lansing"],
  "MN": ["Minneapolis", "St. Paul", "Rochester", "Duluth", "Bloomington", "Brooklyn Park"],
  "MS": ["Jackson", "Gulfport", "Southaven", "Hattiesburg", "Biloxi"],
  "MO": ["Kansas City", "St. Louis", "Springfield", "Columbia", "Independence"],
  "MT": ["Billings", "Missoula", "Great Falls", "Bozeman", "Helena"],
  "NE": ["Omaha", "Lincoln", "Bellevue", "Grand Island", "Kearney"],
  "NV": ["Las Vegas", "Henderson", "Reno", "North Las Vegas", "Sparks", "Carson City"],
  "NH": ["Manchester", "Nashua", "Concord", "Derry", "Rochester"],
  "NJ": ["Newark", "Jersey City", "Paterson", "Elizabeth", "Trenton", "Hoboken", "Princeton"],
  "NM": ["Albuquerque", "Las Cruces", "Rio Rancho", "Santa Fe", "Roswell"],
  "NY": ["New York", "Buffalo", "Rochester", "Yonkers", "Syracuse", "Albany", "White Plains"],
  "NC": ["Charlotte", "Raleigh", "Durham", "Greensboro", "Winston-Salem", "Cary", "Wilmington", "Asheville"],
  "ND": ["Fargo", "Bismarck", "Grand Forks", "Minot", "West Fargo"],
  "OH": ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron", "Dayton"],
  "OK": ["Oklahoma City", "Tulsa", "Norman", "Broken Arrow", "Edmond"],
  "OR": ["Portland", "Salem", "Eugene", "Gresham", "Hillsboro", "Bend"],
  "PA": ["Philadelphia", "Pittsburgh", "Allentown", "Reading", "Erie", "Harrisburg"],
  "RI": ["Providence", "Warwick", "Cranston", "Pawtucket", "Newport"],
  "SC": ["Charleston", "Columbia", "Greenville", "Mount Pleasant", "Myrtle Beach", "Summerville"],
  "SD": ["Sioux Falls", "Rapid City", "Aberdeen", "Brookings", "Watertown"],
  "TN": ["Nashville", "Memphis", "Knoxville", "Chattanooga", "Clarksville", "Murfreesboro", "Franklin", "Brentwood"],
  "TX": ["Houston", "Dallas", "Austin", "San Antonio", "Fort Worth", "Plano", "Arlington", "Frisco", "El Paso", "Corpus Christi"],
  "UT": ["Salt Lake City", "West Valley City", "Provo", "West Jordan", "Orem", "Sandy", "Ogden"],
  "VT": ["Burlington", "South Burlington", "Rutland", "Essex", "Bennington"],
  "VA": ["Virginia Beach", "Norfolk", "Chesapeake", "Richmond", "Newport News", "Alexandria", "Arlington"],
  "WA": ["Seattle", "Spokane", "Tacoma", "Vancouver", "Bellevue", "Kent", "Everett"],
  "WV": ["Charleston", "Huntington", "Morgantown", "Parkersburg", "Wheeling"],
  "WI": ["Milwaukee", "Madison", "Green Bay", "Kenosha", "Racine", "Appleton"],
  "WY": ["Cheyenne", "Casper", "Laramie", "Gillette", "Rock Springs"]
};

const STATES = Object.keys(CITIES_BY_STATE);

const ENTITY_TYPES = [
  "LLC", "Inc", "Properties LLC", "Investments LLC", "Holdings LLC", 
  "Real Estate LLC", "Development LLC", "Capital LLC", "Ventures LLC"
];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateEmail(firstName: string, lastName: string): string {
  const domains = ["gmail.com", "yahoo.com", "outlook.com", "icloud.com", "protonmail.com"];
  const rand = randomInt(100, 999);
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${rand}@${randomElement(domains)}`;
}

function generatePhone(): string {
  const areaCode = randomInt(200, 999);
  const prefix = randomInt(200, 999);
  const line = randomInt(1000, 9999);
  return `(${areaCode}) ${prefix}-${line}`;
}

function generateAddress(): { address: string; city: string; state: string; zip: string } {
  const state = randomElement(STATES);
  const city = randomElement(CITIES_BY_STATE[state]);
  const streetNumber = randomInt(100, 9999);
  const streetName = randomElement(STREET_NAMES);
  const zip = `${randomInt(10000, 99999)}`;
  
  return {
    address: `${streetNumber} ${streetName}`,
    city,
    state,
    zip
  };
}

function generateEntityName(lastName: string): string {
  const entityType = randomElement(ENTITY_TYPES);
  return `${lastName} ${entityType}`;
}

// ============================================================
// LOAN DATA GENERATORS BY TYPE
// ============================================================

interface LoanData {
  loanType: string;
  productVariant?: "purchase" | "cash_out" | "rate_term";
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  propertyZip: string;
  loanAmount: number;
  purchasePrice: number;
  arv?: number;
  rehabBudget?: number;
  requestedRehabFunding?: number;
  downPayment: number;
  loanTermMonths: number;
  holdTimeMonths?: number;
  interestRate: string;
  interestType: string;
  ltc?: string;
  ltv?: string;
  annualTaxes: number;
  annualInsurance: number;
  annualHOA: number;
  totalClosingCosts: number;
  originationFee: number;
  documentPrepFee: number;
  escrowFee: number;
  analyzerType: string;
  analyzerData: any;
}

function generateDSCRLoan(variant: "purchase" | "cash_out" | "rate_term"): LoanData {
  const location = generateAddress();
  const purchasePrice = randomInt(200000, 800000);
  const ltv = variant === "purchase" ? randomInt(70, 80) : randomInt(65, 75);
  const loanAmount = Math.round(purchasePrice * (ltv / 100));
  const downPayment = purchasePrice - loanAmount;
  const interestRate = (6.5 + Math.random() * 2).toFixed(3);
  
  // DSCR calculation data
  const monthlyRent = randomInt(1500, 4500);
  const annualTaxes = randomInt(3000, 12000);
  const annualInsurance = randomInt(1200, 4000);
  const annualHOA = randomInt(0, 4800);
  
  const monthlyPITI = (loanAmount * (parseFloat(interestRate) / 100 / 12)) + 
                      (annualTaxes / 12) + (annualInsurance / 12) + (annualHOA / 12);
  const dscr = (monthlyRent / monthlyPITI).toFixed(2);
  
  return {
    loanType: "DSCR",
    productVariant: variant,
    propertyAddress: location.address,
    propertyCity: location.city,
    propertyState: location.state,
    propertyZip: location.zip,
    loanAmount,
    purchasePrice,
    downPayment,
    loanTermMonths: randomElement([360, 180, 120]), // 30, 15, or 10 year
    interestRate,
    interestType: randomElement(["Fixed", "5/1 ARM", "7/1 ARM"]),
    ltv: `${ltv}%`,
    annualTaxes,
    annualInsurance,
    annualHOA,
    totalClosingCosts: Math.round(loanAmount * 0.025),
    originationFee: Math.round(loanAmount * 0.01),
    documentPrepFee: 995,
    escrowFee: randomInt(1500, 3000),
    analyzerType: "dscr",
    analyzerData: {
      variant,
      purchasePrice,
      loanAmount,
      monthlyRent,
      dscr: parseFloat(dscr),
      interestRate: parseFloat(interestRate),
      propertyType: randomElement(["Single Family", "Duplex", "Triplex", "Fourplex", "Condo"]),
      creditScore: randomInt(660, 800)
    }
  };
}

function generateFixFlipLoan(): LoanData {
  const location = generateAddress();
  const purchasePrice = randomInt(150000, 600000);
  const arv = Math.round(purchasePrice * (1.25 + Math.random() * 0.35)); // 25-60% profit margin
  const rehabBudget = Math.round((arv - purchasePrice) * 0.6);
  const ltc = randomInt(80, 90);
  const loanAmount = Math.round((purchasePrice + rehabBudget) * (ltc / 100));
  const requestedRehabFunding = Math.round(rehabBudget * 0.9);
  const downPayment = purchasePrice + rehabBudget - loanAmount;
  const interestRate = (9.5 + Math.random() * 2.5).toFixed(3);
  const holdTimeMonths = randomInt(4, 12);
  
  return {
    loanType: "Fix & Flip",
    propertyAddress: location.address,
    propertyCity: location.city,
    propertyState: location.state,
    propertyZip: location.zip,
    loanAmount,
    purchasePrice,
    arv,
    rehabBudget,
    requestedRehabFunding,
    downPayment,
    loanTermMonths: randomElement([12, 18, 24]),
    holdTimeMonths,
    interestRate,
    interestType: "Interest Only",
    ltc: `${ltc}%`,
    ltv: `${Math.round((loanAmount / arv) * 100)}%`,
    annualTaxes: randomInt(2000, 8000),
    annualInsurance: randomInt(1500, 4000),
    annualHOA: randomInt(0, 3600),
    totalClosingCosts: Math.round(loanAmount * 0.03),
    originationFee: Math.round(loanAmount * 0.02),
    documentPrepFee: 1295,
    escrowFee: randomInt(1800, 3500),
    analyzerType: "fixflip",
    analyzerData: {
      purchasePrice,
      arv,
      rehabBudget,
      loanAmount,
      holdTimeMonths,
      expectedProfit: arv - purchasePrice - rehabBudget - Math.round(loanAmount * 0.03),
      roi: Math.round(((arv - purchasePrice - rehabBudget) / (purchasePrice + rehabBudget)) * 100),
      propertyCondition: randomElement(["Light Rehab", "Medium Rehab", "Heavy Rehab"]),
      exitStrategy: randomElement(["Sell", "Refinance to DSCR", "Sell to Investor"])
    }
  };
}

function generateConstructionLoan(): LoanData {
  const location = generateAddress();
  const landCost = randomInt(50000, 300000);
  const constructionBudget = randomInt(200000, 800000);
  const totalProjectCost = landCost + constructionBudget;
  const arv = Math.round(totalProjectCost * (1.2 + Math.random() * 0.3)); // 20-50% profit margin
  const ltc = randomInt(75, 85);
  const loanAmount = Math.round(totalProjectCost * (ltc / 100));
  const downPayment = totalProjectCost - loanAmount;
  const interestRate = (10.0 + Math.random() * 2).toFixed(3);
  
  return {
    loanType: "New Construction",
    propertyAddress: location.address,
    propertyCity: location.city,
    propertyState: location.state,
    propertyZip: location.zip,
    loanAmount,
    purchasePrice: landCost,
    arv,
    rehabBudget: constructionBudget,
    requestedRehabFunding: constructionBudget,
    downPayment,
    loanTermMonths: randomElement([12, 18, 24]),
    holdTimeMonths: randomInt(8, 18),
    interestRate,
    interestType: "Interest Only",
    ltc: `${ltc}%`,
    ltv: `${Math.round((loanAmount / arv) * 100)}%`,
    annualTaxes: randomInt(1500, 6000),
    annualInsurance: randomInt(2000, 5000),
    annualHOA: 0,
    totalClosingCosts: Math.round(loanAmount * 0.035),
    originationFee: Math.round(loanAmount * 0.025),
    documentPrepFee: 1495,
    escrowFee: randomInt(2000, 4000),
    analyzerType: "construction",
    analyzerData: {
      landCost,
      constructionBudget,
      totalProjectCost,
      arv,
      loanAmount,
      constructionType: randomElement(["Single Family", "Duplex", "Small Multifamily", "Townhomes"]),
      drawSchedule: [
        { phase: "Foundation", percentage: 15 },
        { phase: "Framing", percentage: 25 },
        { phase: "MEP Rough-in", percentage: 20 },
        { phase: "Drywall & Interior", percentage: 25 },
        { phase: "Final Finishes", percentage: 15 }
      ],
      permitStatus: randomElement(["Approved", "Pending", "In Review"]),
      estimatedCompletionMonths: randomInt(6, 14)
    }
  };
}

// ============================================================
// STATUS & STAGE DISTRIBUTIONS
// ============================================================

// Realistic distribution of loan statuses
const STATUS_WEIGHTS = {
  draft: 5,
  submitted: 10,
  in_review: 35,
  approved: 15,
  funded: 25,
  denied: 5,
  withdrawn: 5
};

// Stage progression by status
const STAGE_BY_STATUS: Record<string, string[]> = {
  draft: ["account_review"],
  submitted: ["account_review"],
  in_review: ["account_review", "underwriting", "term_sheet", "processing", "docs_out"],
  approved: ["docs_out", "closed"],
  funded: ["closed"],
  denied: ["account_review", "underwriting", "term_sheet"],
  withdrawn: ["account_review", "underwriting", "term_sheet", "processing"]
};

function selectStatus(): string {
  const totalWeight = Object.values(STATUS_WEIGHTS).reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  
  for (const [status, weight] of Object.entries(STATUS_WEIGHTS)) {
    random -= weight;
    if (random <= 0) return status;
  }
  return "submitted";
}

function selectStageForStatus(status: string): string {
  const stages = STAGE_BY_STATUS[status] || ["account_review"];
  
  // Weight toward later stages for in_review
  if (status === "in_review") {
    const weights = [15, 25, 25, 25, 10]; // account_review through docs_out
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < stages.length; i++) {
      random -= weights[i];
      if (random <= 0) return stages[i];
    }
  }
  
  return randomElement(stages);
}

// ============================================================
// SIMULATION STATE TRACKING
// ============================================================

interface SimulationState {
  isRunning: boolean;
  startedAt: Date | null;
  loansCreated: number;
  totalLoans: number;
  currentBatch: number;
  totalBatches: number;
  errors: string[];
  completedAt: Date | null;
}

let simulationState: SimulationState = {
  isRunning: false,
  startedAt: null,
  loansCreated: 0,
  totalLoans: SIMULATION_CONFIG.totalLoans,
  currentBatch: 0,
  totalBatches: Math.ceil(SIMULATION_CONFIG.totalLoans / SIMULATION_CONFIG.batchSize),
  errors: [],
  completedAt: null
};

export function getSimulationStatus(): SimulationState {
  return { ...simulationState };
}

// ============================================================
// MAIN SIMULATION FUNCTIONS
// ============================================================

async function createBorrowerUser(firstName: string, lastName: string): Promise<string> {
  const email = generateEmail(firstName, lastName);
  const phone = generatePhone();
  
  const [user] = await db.insert(users).values({
    email,
    username: email.split("@")[0],
    firstName,
    lastName,
    phone,
    role: "borrower",
    emailNotificationsEnabled: true,
    smsNotificationsEnabled: false
  }).returning();
  
  return user.id;
}

async function getOrCreateStaffUsers(): Promise<Record<string, string>> {
  // Get existing staff users or create simulation staff
  const existingStaff = await db.select().from(users).where(eq(users.role, "staff"));
  
  if (existingStaff.length >= 5) {
    // Use existing staff
    const staffMap: Record<string, string> = {};
    const roles = ["account_executive", "processor", "underwriter", "closer", "servicer"];
    existingStaff.slice(0, 5).forEach((staff, i) => {
      staffMap[roles[i]] = staff.id;
    });
    return staffMap;
  }
  
  // Create simulation staff if needed
  const staffRoles = [
    { role: "account_executive", firstName: "Alex", lastName: "Morrison" },
    { role: "processor", firstName: "Jordan", lastName: "Chen" },
    { role: "underwriter", firstName: "Taylor", lastName: "Williams" },
    { role: "closer", firstName: "Morgan", lastName: "Davis" },
    { role: "servicer", firstName: "Casey", lastName: "Thompson" }
  ];
  
  const staffMap: Record<string, string> = {};
  
  for (const staff of staffRoles) {
    const email = `${staff.firstName.toLowerCase()}.${staff.lastName.toLowerCase()}@sequel.com`;
    
    // Check if exists
    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length > 0) {
      staffMap[staff.role] = existing[0].id;
      continue;
    }
    
    const [user] = await db.insert(users).values({
      email,
      username: email.split("@")[0],
      firstName: staff.firstName,
      lastName: staff.lastName,
      phone: generatePhone(),
      role: "staff",
      staffRole: staff.role,
      emailNotificationsEnabled: true,
      smsNotificationsEnabled: false
    }).returning();
    
    staffMap[staff.role] = user.id;
  }
  
  return staffMap;
}

async function createLoanWithHistory(
  userId: string,
  loanData: LoanData,
  status: string,
  stage: string,
  staffMap: Record<string, string>,
  guarantorName: string,
  entityName: string
): Promise<string> {
  // Create the loan application
  const [loan] = await db.insert(loanApplications).values({
    userId,
    loanType: loanData.loanType,
    productVariant: loanData.productVariant as any,
    propertyAddress: loanData.propertyAddress,
    propertyCity: loanData.propertyCity,
    propertyState: loanData.propertyState,
    propertyZip: loanData.propertyZip,
    loanAmount: loanData.loanAmount,
    status: status as any,
    processingStage: stage as any,
    purchasePrice: loanData.purchasePrice,
    arv: loanData.arv,
    rehabBudget: loanData.rehabBudget,
    requestedRehabFunding: loanData.requestedRehabFunding,
    downPayment: loanData.downPayment,
    loanTermMonths: loanData.loanTermMonths,
    holdTimeMonths: loanData.holdTimeMonths,
    interestRate: loanData.interestRate,
    interestType: loanData.interestType,
    ltc: loanData.ltc,
    ltv: loanData.ltv,
    annualTaxes: loanData.annualTaxes,
    annualInsurance: loanData.annualInsurance,
    annualHOA: loanData.annualHOA,
    totalClosingCosts: loanData.totalClosingCosts,
    originationFee: loanData.originationFee,
    documentPrepFee: loanData.documentPrepFee,
    escrowFee: loanData.escrowFee,
    guarantor: guarantorName,
    entity: entityName,
    analyzerType: loanData.analyzerType,
    analyzerData: loanData.analyzerData,
    applicationFeePaid: ["in_review", "approved", "funded"].includes(status),
    commitmentFeePaid: ["approved", "funded"].includes(status),
    appraisalFeePaid: ["approved", "funded"].includes(status)
  }).returning();
  
  // Create stage history based on current status
  await createStageHistory(loan.id, status, stage, staffMap);
  
  // Create staff assignments based on stage
  await createStaffAssignments(loan.id, stage, staffMap);
  
  return loan.id;
}

async function createStageHistory(
  loanId: string,
  currentStatus: string,
  currentStage: string,
  staffMap: Record<string, string>
): Promise<void> {
  const stageOrder = ["account_review", "underwriting", "term_sheet", "processing", "docs_out", "closed"];
  const currentStageIndex = stageOrder.indexOf(currentStage);
  
  let baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - randomInt(5, 60)); // Started 5-60 days ago
  
  // Initial submission
  await db.insert(applicationStageHistory).values({
    loanApplicationId: loanId,
    fromStatus: "draft" as const,
    toStatus: "submitted" as const,
    fromStage: null,
    toStage: "account_review" as const,
    changedByUserId: null,
    changedByName: "System",
    notes: "Application submitted by borrower",
    isAutomated: true,
    durationMinutes: null
  });
  
  // Progress through stages
  let previousDate = baseDate;
  
  if (currentStatus !== "draft" && currentStatus !== "submitted") {
    // Move to in_review
    const reviewDate = new Date(previousDate);
    reviewDate.setHours(reviewDate.getHours() + randomInt(1, 24));
    
    await db.insert(applicationStageHistory).values({
      loanApplicationId: loanId,
      fromStatus: "submitted" as const,
      toStatus: "in_review" as const,
      fromStage: "account_review" as const,
      toStage: "account_review" as const,
      changedByUserId: staffMap.account_executive,
      changedByName: "Alex Morrison",
      notes: "Application assigned for review",
      isAutomated: false,
      durationMinutes: Math.round((reviewDate.getTime() - previousDate.getTime()) / 60000)
    });
    previousDate = reviewDate;
  }
  
  // Progress through stages up to current
  for (let i = 1; i <= currentStageIndex; i++) {
    const stageDate = new Date(previousDate);
    stageDate.setDate(stageDate.getDate() + randomInt(1, 5));
    
    const staffForStage = i <= 1 ? "account_executive" : 
                          i === 2 ? "underwriter" :
                          i === 3 ? "processor" :
                          i === 4 ? "processor" : "closer";
    
    const staffNames: Record<string, string> = {
      account_executive: "Alex Morrison",
      processor: "Jordan Chen",
      underwriter: "Taylor Williams",
      closer: "Morgan Davis"
    };
    
    const toStatusValue = currentStatus === "approved" || currentStatus === "funded" ? 
                (i === currentStageIndex ? currentStatus : "in_review") : "in_review";
    await db.insert(applicationStageHistory).values({
      loanApplicationId: loanId,
      fromStatus: "in_review" as const,
      toStatus: toStatusValue as any,
      fromStage: stageOrder[i - 1] as any,
      toStage: stageOrder[i] as any,
      changedByUserId: staffMap[staffForStage],
      changedByName: staffNames[staffForStage],
      notes: `Moved to ${stageOrder[i].replace(/_/g, " ")} stage`,
      isAutomated: false,
      durationMinutes: Math.round((stageDate.getTime() - previousDate.getTime()) / 60000)
    });
    previousDate = stageDate;
  }
  
  // Add final status change if funded
  if (currentStatus === "funded") {
    const fundedDate = new Date(previousDate);
    fundedDate.setDate(fundedDate.getDate() + randomInt(1, 3));
    
    await db.insert(applicationStageHistory).values({
      loanApplicationId: loanId,
      fromStatus: "approved" as const,
      toStatus: "funded" as const,
      fromStage: "closed" as const,
      toStage: "closed" as const,
      changedByUserId: staffMap.closer,
      changedByName: "Morgan Davis",
      notes: "Loan funded successfully",
      isAutomated: false,
      durationMinutes: Math.round((fundedDate.getTime() - previousDate.getTime()) / 60000)
    });
  }
  
  // Add denial reason if denied
  if (currentStatus === "denied") {
    const reasons = [
      "DSCR ratio below minimum threshold",
      "Property valuation concerns",
      "Borrower credit history issues",
      "Insufficient documentation",
      "Property condition concerns"
    ];
    
    await db.insert(applicationStageHistory).values({
      loanApplicationId: loanId,
      fromStatus: "in_review" as const,
      toStatus: "denied" as const,
      fromStage: currentStage as any,
      toStage: currentStage as any,
      changedByUserId: staffMap.underwriter,
      changedByName: "Taylor Williams",
      notes: "Application denied",
      reason: randomElement(reasons),
      isAutomated: false,
      durationMinutes: randomInt(24, 72) * 60 // minutes not ms
    });
  }
}

async function createStaffAssignments(
  loanId: string,
  currentStage: string,
  staffMap: Record<string, string>
): Promise<void> {
  const stageOrder = ["account_review", "underwriting", "term_sheet", "processing", "docs_out", "closed"];
  const currentStageIndex = stageOrder.indexOf(currentStage);
  
  // Always assign account executive
  await db.insert(loanAssignments).values({
    loanApplicationId: loanId,
    userId: staffMap.account_executive,
    role: "account_executive" as const,
    isPrimary: true,
    assignedByUserId: null
  });
  
  // Assign based on stage progression
  if (currentStageIndex >= 1) { // underwriting or later
    await db.insert(loanAssignments).values({
      loanApplicationId: loanId,
      userId: staffMap.underwriter,
      role: "underwriter" as const,
      isPrimary: true,
      assignedByUserId: staffMap.account_executive
    });
  }
  
  if (currentStageIndex >= 3) { // processing or later
    await db.insert(loanAssignments).values({
      loanApplicationId: loanId,
      userId: staffMap.processor,
      role: "processor" as const,
      isPrimary: true,
      assignedByUserId: staffMap.underwriter
    });
  }
  
  if (currentStageIndex >= 5) { // closed
    await db.insert(loanAssignments).values({
      loanApplicationId: loanId,
      userId: staffMap.closer,
      role: "closer" as const,
      isPrimary: true,
      assignedByUserId: staffMap.processor
    });
  }
}

async function createLoanBatch(
  batchNumber: number,
  loansPerBatch: number,
  loanQueue: Array<{ type: string; variant?: string }>,
  staffMap: Record<string, string>
): Promise<void> {
  const startIndex = batchNumber * loansPerBatch;
  const endIndex = Math.min(startIndex + loansPerBatch, loanQueue.length);
  
  console.log(`[Simulation] Creating batch ${batchNumber + 1}: loans ${startIndex + 1} to ${endIndex}`);
  
  for (let i = startIndex; i < endIndex; i++) {
    try {
      const loanConfig = loanQueue[i];
      
      // Generate borrower
      const firstName = randomElement(FIRST_NAMES);
      const lastName = randomElement(LAST_NAMES);
      const userId = await createBorrowerUser(firstName, lastName);
      
      // Generate loan data based on type
      let loanData: LoanData;
      if (loanConfig.type === "DSCR") {
        loanData = generateDSCRLoan(loanConfig.variant as "purchase" | "cash_out" | "rate_term");
      } else if (loanConfig.type === "Fix & Flip") {
        loanData = generateFixFlipLoan();
      } else {
        loanData = generateConstructionLoan();
      }
      
      // Select status and stage
      const status = selectStatus();
      const stage = selectStageForStatus(status);
      
      // Create loan with full history
      await createLoanWithHistory(
        userId,
        loanData,
        status,
        stage,
        staffMap,
        `${firstName} ${lastName}`,
        generateEntityName(lastName)
      );
      
      simulationState.loansCreated++;
      console.log(`[Simulation] Created loan ${simulationState.loansCreated}/${simulationState.totalLoans}: ${loanConfig.type} (${status})`);
      
    } catch (error) {
      const errorMsg = `Error creating loan ${i + 1}: ${error}`;
      console.error(`[Simulation] ${errorMsg}`);
      simulationState.errors.push(errorMsg);
    }
  }
  
  simulationState.currentBatch = batchNumber + 1;
}

export async function startSimulation(): Promise<{ success: boolean; message: string }> {
  if (simulationState.isRunning) {
    return { success: false, message: "Simulation is already running" };
  }
  
  // Reset state
  simulationState = {
    isRunning: true,
    startedAt: new Date(),
    loansCreated: 0,
    totalLoans: SIMULATION_CONFIG.totalLoans,
    currentBatch: 0,
    totalBatches: Math.ceil(SIMULATION_CONFIG.totalLoans / SIMULATION_CONFIG.batchSize),
    errors: [],
    completedAt: null
  };
  
  console.log(`[Simulation] Starting loan simulation: ${SIMULATION_CONFIG.totalLoans} loans in ${simulationState.totalBatches} batches`);
  
  // Get or create staff users
  const staffMap = await getOrCreateStaffUsers();
  console.log("[Simulation] Staff users ready");
  
  // Build loan queue with proper distribution
  const loanQueue: Array<{ type: string; variant?: string }> = [];
  
  // DSCR loans: 40 total with 4/4/2 split per 10 (so 16 purchase, 16 cash_out, 8 rate_term)
  for (let i = 0; i < 16; i++) loanQueue.push({ type: "DSCR", variant: "purchase" });
  for (let i = 0; i < 16; i++) loanQueue.push({ type: "DSCR", variant: "cash_out" });
  for (let i = 0; i < 8; i++) loanQueue.push({ type: "DSCR", variant: "rate_term" });
  
  // Fix & Flip loans: 35
  for (let i = 0; i < 35; i++) loanQueue.push({ type: "Fix & Flip" });
  
  // Construction loans: 25
  for (let i = 0; i < 25; i++) loanQueue.push({ type: "New Construction" });
  
  // Shuffle the queue for variety
  for (let i = loanQueue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [loanQueue[i], loanQueue[j]] = [loanQueue[j], loanQueue[i]];
  }
  
  // Start batch processing
  const totalBatches = Math.ceil(loanQueue.length / SIMULATION_CONFIG.batchSize);
  
  // Process first batch immediately
  await createLoanBatch(0, SIMULATION_CONFIG.batchSize, loanQueue, staffMap);
  
  // Schedule remaining batches
  for (let batch = 1; batch < totalBatches; batch++) {
    setTimeout(async () => {
      if (!simulationState.isRunning) return;
      
      await createLoanBatch(batch, SIMULATION_CONFIG.batchSize, loanQueue, staffMap);
      
      if (batch === totalBatches - 1) {
        simulationState.isRunning = false;
        simulationState.completedAt = new Date();
        console.log(`[Simulation] Completed! Created ${simulationState.loansCreated} loans with ${simulationState.errors.length} errors`);
      }
    }, batch * SIMULATION_CONFIG.batchIntervalMs);
  }
  
  return { 
    success: true, 
    message: `Simulation started: ${SIMULATION_CONFIG.totalLoans} loans will be created in ${totalBatches} batches over ~${Math.round(totalBatches * SIMULATION_CONFIG.batchIntervalMs / 60000)} minutes` 
  };
}

export async function stopSimulation(): Promise<{ success: boolean; message: string }> {
  if (!simulationState.isRunning) {
    return { success: false, message: "No simulation is running" };
  }
  
  simulationState.isRunning = false;
  simulationState.completedAt = new Date();
  
  return { 
    success: true, 
    message: `Simulation stopped. Created ${simulationState.loansCreated} of ${simulationState.totalLoans} loans` 
  };
}
