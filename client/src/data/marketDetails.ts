export interface University {
  name: string;
  type: "public" | "private" | "community";
  enrollment: number;
  url?: string;
}

export interface STRFriendliness {
  score: number;
  tier: "Excellent" | "Good" | "Moderate" | "Restricted" | "Prohibited";
  summary: string;
  regulations: string[];
  permitRequired: boolean;
  licenseFee?: string;
}

export interface MarketDetail {
  id: string;
  name: string;
  stateSlug: string;
  lat: number;
  lng: number;
  rank: number;
  realEstate: {
    medianPrice: number;
    priceGrowth: number;
    avgRent: number;
    capRate: number;
    daysOnMarket: number;
    inventoryMonths: number;
    rentGrowth: number;
    medianPricePerSqft: number;
  };
  demographics: {
    population: number;
    populationGrowth: number;
    medianAge: number;
    medianIncome: number;
    unemploymentRate: number;
    crimeIndex: number;
    walkScore: number;
  };
  universities: University[];
  strFriendliness: STRFriendliness;
  highlights: string[];
  investorTips: string[];
}

export type MarketsByState = Record<string, MarketDetail[]>;

/**
 * Derives the STR tier from a numeric score.
 * This ensures consistent tier assignment across all markets.
 */
export function getSTRTierFromScore(score: number): "Excellent" | "Good" | "Moderate" | "Restricted" | "Prohibited" {
  if (score >= 80) return "Excellent";
  if (score >= 65) return "Good";
  if (score >= 50) return "Moderate";
  if (score >= 30) return "Restricted";
  return "Prohibited";
}

/**
 * Sorts markets by investment quality: CAP rate (primary), then price growth (secondary).
 * Higher CAP rate = better cash flow = ranked higher.
 */
export function sortMarketsByInvestmentQuality(markets: MarketDetail[]): MarketDetail[] {
  return [...markets].sort((a, b) => {
    // Primary: CAP rate (higher is better)
    const capDiff = b.realEstate.capRate - a.realEstate.capRate;
    // Only use secondary sort if CAP rates are essentially equal (within 0.05%)
    if (Math.abs(capDiff) >= 0.05) return capDiff;
    // Secondary: Price growth (higher is better)
    return b.realEstate.priceGrowth - a.realEstate.priceGrowth;
  });
}

const CALIFORNIA_MARKETS: MarketDetail[] = [
  {
    id: "los-angeles",
    name: "Los Angeles",
    stateSlug: "california",
    lat: 34.0522,
    lng: -118.2437,
    rank: 1,
    realEstate: {
      medianPrice: 925000,
      priceGrowth: 4.2,
      avgRent: 3150,
      capRate: 4.8,
      daysOnMarket: 32,
      inventoryMonths: 2.1,
      rentGrowth: 5.8,
      medianPricePerSqft: 685,
    },
    demographics: {
      population: 3898747,
      populationGrowth: 0.3,
      medianAge: 36.2,
      medianIncome: 69778,
      unemploymentRate: 5.1,
      crimeIndex: 62,
      walkScore: 67,
    },
    universities: [
      { name: "UCLA", type: "public", enrollment: 45000, url: "https://ucla.edu" },
      { name: "USC", type: "private", enrollment: 47000, url: "https://usc.edu" },
      { name: "Cal State LA", type: "public", enrollment: 27000 },
      { name: "Loyola Marymount", type: "private", enrollment: 9600 },
    ],
    strFriendliness: {
      score: 55,
      tier: "Moderate",
      summary: "LA has strict STR regulations with registration requirements and hosting limits in many neighborhoods.",
      regulations: [
        "Home-sharing ordinance requires registration",
        "Primary residence requirement for most STRs",
        "Maximum 120 days/year without extended permit",
        "Transient Occupancy Tax (TOT) of 14%",
      ],
      permitRequired: true,
      licenseFee: "$89 registration + TOT",
    },
    highlights: [
      "Largest metro economy in California",
      "Diverse rental demand from entertainment industry",
      "Strong appreciation in coastal submarkets",
    ],
    investorTips: [
      "Focus on 2-4 unit properties for DSCR loans",
      "East LA and South Bay offer better cap rates",
      "Consider mid-term furnished rentals near studios",
    ],
  },
  {
    id: "san-francisco",
    name: "San Francisco",
    stateSlug: "california",
    lat: 37.7749,
    lng: -122.4194,
    rank: 2,
    realEstate: {
      medianPrice: 1250000,
      priceGrowth: 2.8,
      avgRent: 3650,
      capRate: 4.2,
      daysOnMarket: 28,
      inventoryMonths: 1.8,
      rentGrowth: 3.2,
      medianPricePerSqft: 1050,
    },
    demographics: {
      population: 873965,
      populationGrowth: -0.8,
      medianAge: 38.5,
      medianIncome: 119136,
      unemploymentRate: 3.8,
      crimeIndex: 58,
      walkScore: 89,
    },
    universities: [
      { name: "UC San Francisco", type: "public", enrollment: 3200 },
      { name: "San Francisco State", type: "public", enrollment: 29000 },
      { name: "University of San Francisco", type: "private", enrollment: 10700 },
    ],
    strFriendliness: {
      score: 35,
      tier: "Restricted",
      summary: "One of the strictest STR markets in the US with extensive regulations and limited permits.",
      regulations: [
        "Permanent resident registration required",
        "90-day unhosted rental cap per year",
        "$450 annual registration fee",
        "14% Transient Occupancy Tax",
        "Liability insurance mandatory",
      ],
      permitRequired: true,
      licenseFee: "$450/year + 14% TOT",
    },
    highlights: [
      "Tech industry drives strong rental demand",
      "High barriers to entry protect existing owners",
      "Premium rents for furnished units",
    ],
    investorTips: [
      "Consider Oakland/East Bay for better returns",
      "Multi-family buildings have different regulations",
      "Corporate housing demand from tech companies",
    ],
  },
  {
    id: "san-diego",
    name: "San Diego",
    stateSlug: "california",
    lat: 32.7157,
    lng: -117.1611,
    rank: 3,
    realEstate: {
      medianPrice: 875000,
      priceGrowth: 5.1,
      avgRent: 2950,
      capRate: 4.9,
      daysOnMarket: 25,
      inventoryMonths: 1.5,
      rentGrowth: 6.2,
      medianPricePerSqft: 620,
    },
    demographics: {
      population: 1386932,
      populationGrowth: 0.5,
      medianAge: 35.4,
      medianIncome: 83454,
      unemploymentRate: 4.2,
      crimeIndex: 45,
      walkScore: 51,
    },
    universities: [
      { name: "UC San Diego", type: "public", enrollment: 42000 },
      { name: "San Diego State", type: "public", enrollment: 35000 },
      { name: "University of San Diego", type: "private", enrollment: 9000 },
    ],
    strFriendliness: {
      score: 65,
      tier: "Good",
      summary: "San Diego has tiered STR regulations with more flexibility in vacation zones.",
      regulations: [
        "Three-tier license system based on location",
        "Mission Beach has grandfather provisions",
        "10.5% Transient Occupancy Tax",
        "Business license required",
      ],
      permitRequired: true,
      licenseFee: "$1,010-$4,126 depending on tier",
    },
    highlights: [
      "Strong military and biotech employment base",
      "Year-round tourism supports STR market",
      "Growing tech presence from company relocations",
    ],
    investorTips: [
      "Beach communities have STR restrictions",
      "North County offers better cash flow",
      "Student housing near SDSU is stable",
    ],
  },
  {
    id: "sacramento",
    name: "Sacramento",
    stateSlug: "california",
    lat: 38.5816,
    lng: -121.4944,
    rank: 4,
    realEstate: {
      medianPrice: 510000,
      priceGrowth: 6.8,
      avgRent: 2100,
      capRate: 5.4,
      daysOnMarket: 18,
      inventoryMonths: 1.2,
      rentGrowth: 7.5,
      medianPricePerSqft: 340,
    },
    demographics: {
      population: 524943,
      populationGrowth: 1.2,
      medianAge: 34.8,
      medianIncome: 65847,
      unemploymentRate: 4.8,
      crimeIndex: 52,
      walkScore: 47,
    },
    universities: [
      { name: "UC Davis", type: "public", enrollment: 40000 },
      { name: "Sacramento State", type: "public", enrollment: 31000 },
    ],
    strFriendliness: {
      score: 70,
      tier: "Good",
      summary: "Sacramento has relatively permissive STR regulations compared to coastal California cities.",
      regulations: [
        "Permit required for all STRs",
        "No cap on rental days",
        "12% Transient Occupancy Tax",
        "Annual inspection may be required",
      ],
      permitRequired: true,
      licenseFee: "$200/year + 12% TOT",
    },
    highlights: [
      "State capital with stable government employment",
      "Bay Area migration driving demand",
      "Most affordable major CA metro",
    ],
    investorTips: [
      "Midtown and Land Park are walkable with strong rents",
      "Elk Grove and Roseville growing rapidly",
      "Good market for BRRRR strategy",
    ],
  },
  {
    id: "san-jose",
    name: "San Jose",
    stateSlug: "california",
    lat: 37.3382,
    lng: -121.8863,
    rank: 5,
    realEstate: {
      medianPrice: 1350000,
      priceGrowth: 3.5,
      avgRent: 3400,
      capRate: 3.8,
      daysOnMarket: 22,
      inventoryMonths: 1.4,
      rentGrowth: 4.1,
      medianPricePerSqft: 850,
    },
    demographics: {
      population: 1013240,
      populationGrowth: 0.2,
      medianAge: 37.1,
      medianIncome: 117324,
      unemploymentRate: 3.5,
      crimeIndex: 48,
      walkScore: 52,
    },
    universities: [
      { name: "San Jose State", type: "public", enrollment: 33000 },
      { name: "Santa Clara University", type: "private", enrollment: 9000 },
    ],
    strFriendliness: {
      score: 50,
      tier: "Moderate",
      summary: "San Jose has moderate regulations with permits required and hosting limits.",
      regulations: [
        "Business license required",
        "Primary residence rule for hosted stays",
        "180-day limit for un-hosted rentals",
        "12% Transient Occupancy Tax",
      ],
      permitRequired: true,
      licenseFee: "$150/year + 12% TOT",
    },
    highlights: [
      "Heart of Silicon Valley tech economy",
      "Highest median income in California",
      "Strong rental demand from tech workers",
    ],
    investorTips: [
      "ADUs can significantly boost rental income",
      "South San Jose more affordable entry point",
      "Consider townhomes for better returns",
    ],
  },
];

const TEXAS_MARKETS: MarketDetail[] = [
  {
    id: "houston",
    name: "Houston",
    stateSlug: "texas",
    lat: 29.7604,
    lng: -95.3698,
    rank: 1,
    realEstate: {
      medianPrice: 325000,
      priceGrowth: 4.8,
      avgRent: 1650,
      capRate: 6.2,
      daysOnMarket: 35,
      inventoryMonths: 2.8,
      rentGrowth: 5.5,
      medianPricePerSqft: 165,
    },
    demographics: {
      population: 2304580,
      populationGrowth: 1.5,
      medianAge: 33.4,
      medianIncome: 53600,
      unemploymentRate: 4.5,
      crimeIndex: 68,
      walkScore: 48,
    },
    universities: [
      { name: "University of Houston", type: "public", enrollment: 47000, url: "https://uh.edu" },
      { name: "Rice University", type: "private", enrollment: 8000, url: "https://rice.edu" },
      { name: "Texas Southern", type: "public", enrollment: 9500 },
    ],
    strFriendliness: {
      score: 85,
      tier: "Excellent",
      summary: "Houston has minimal STR regulations with no city-wide permit requirements.",
      regulations: [
        "No specific STR ordinance city-wide",
        "HOA restrictions may apply",
        "Hotel Occupancy Tax of 17%",
        "Some deed restrictions in neighborhoods",
      ],
      permitRequired: false,
      licenseFee: "17% Hotel Occupancy Tax only",
    },
    highlights: [
      "No zoning laws creates investment flexibility",
      "Energy sector diversification ongoing",
      "Medical Center is world's largest",
    ],
    investorTips: [
      "Inner Loop properties appreciate faster",
      "Flooding zones require careful due diligence",
      "The Heights and Montrose are premium rental areas",
    ],
  },
  {
    id: "dallas",
    name: "Dallas",
    stateSlug: "texas",
    lat: 32.7767,
    lng: -96.797,
    rank: 2,
    realEstate: {
      medianPrice: 385000,
      priceGrowth: 5.2,
      avgRent: 1850,
      capRate: 5.8,
      daysOnMarket: 28,
      inventoryMonths: 2.2,
      rentGrowth: 6.1,
      medianPricePerSqft: 210,
    },
    demographics: {
      population: 1304379,
      populationGrowth: 1.8,
      medianAge: 33.5,
      medianIncome: 54747,
      unemploymentRate: 4.1,
      crimeIndex: 62,
      walkScore: 46,
    },
    universities: [
      { name: "UT Dallas", type: "public", enrollment: 31000 },
      { name: "SMU", type: "private", enrollment: 12000, url: "https://smu.edu" },
      { name: "UNT Dallas", type: "public", enrollment: 4200 },
    ],
    strFriendliness: {
      score: 80,
      tier: "Excellent",
      summary: "Dallas has business-friendly STR policies with straightforward permitting.",
      regulations: [
        "Registration required for STRs",
        "Annual permit fee of $400",
        "No day limits",
        "13% Hotel Occupancy Tax",
      ],
      permitRequired: true,
      licenseFee: "$400/year + 13% HOT",
    },
    highlights: [
      "Corporate headquarters relocations driving growth",
      "Strong job market across multiple sectors",
      "DFW airport is major economic driver",
    ],
    investorTips: [
      "Deep Ellum and Bishop Arts are trendy",
      "Suburbs like Frisco/McKinney growing rapidly",
      "Consider duplex/triplex for house hacking",
    ],
  },
  {
    id: "austin",
    name: "Austin",
    stateSlug: "texas",
    lat: 30.2672,
    lng: -97.7431,
    rank: 3,
    realEstate: {
      medianPrice: 525000,
      priceGrowth: 3.2,
      avgRent: 2100,
      capRate: 5.1,
      daysOnMarket: 42,
      inventoryMonths: 3.5,
      rentGrowth: 2.8,
      medianPricePerSqft: 285,
    },
    demographics: {
      population: 978908,
      populationGrowth: 2.8,
      medianAge: 34.0,
      medianIncome: 75752,
      unemploymentRate: 3.4,
      crimeIndex: 45,
      walkScore: 42,
    },
    universities: [
      { name: "UT Austin", type: "public", enrollment: 51000, url: "https://utexas.edu" },
      { name: "St. Edward's University", type: "private", enrollment: 4000 },
      { name: "Austin Community College", type: "community", enrollment: 42000 },
    ],
    strFriendliness: {
      score: 45,
      tier: "Restricted",
      summary: "Austin has phased out most non-owner-occupied STR licenses over recent years.",
      regulations: [
        "Type 2 (non-owner occupied) licenses phased out",
        "Type 1 (owner occupied) still available",
        "15% Hotel Occupancy Tax",
        "Strict enforcement in residential areas",
      ],
      permitRequired: true,
      licenseFee: "$528/year + 15% HOT",
    },
    highlights: [
      "Tech hub with Tesla, Apple, Google presence",
      "Fastest growing major metro in US",
      "Live music capital drives tourism",
    ],
    investorTips: [
      "Mid-term rentals popular with tech relocations",
      "East Austin gentrification continues",
      "Consider Round Rock/Cedar Park suburbs",
    ],
  },
  {
    id: "san-antonio",
    name: "San Antonio",
    stateSlug: "texas",
    lat: 29.4241,
    lng: -98.4936,
    rank: 4,
    realEstate: {
      medianPrice: 285000,
      priceGrowth: 4.5,
      avgRent: 1450,
      capRate: 6.5,
      daysOnMarket: 38,
      inventoryMonths: 3.0,
      rentGrowth: 5.2,
      medianPricePerSqft: 155,
    },
    demographics: {
      population: 1434625,
      populationGrowth: 1.2,
      medianAge: 33.6,
      medianIncome: 52455,
      unemploymentRate: 4.3,
      crimeIndex: 55,
      walkScore: 37,
    },
    universities: [
      { name: "UTSA", type: "public", enrollment: 34000 },
      { name: "Trinity University", type: "private", enrollment: 2500 },
      { name: "Our Lady of the Lake", type: "private", enrollment: 3000 },
    ],
    strFriendliness: {
      score: 75,
      tier: "Good",
      summary: "San Antonio has moderate STR regulations focused on the downtown/Riverwalk area.",
      regulations: [
        "Permit required in designated STR zones",
        "16.75% Hotel Occupancy Tax",
        "Parking requirements may apply",
        "Residential areas have some restrictions",
      ],
      permitRequired: true,
      licenseFee: "$375/year + 16.75% HOT",
    },
    highlights: [
      "Military bases provide stable rental demand",
      "Riverwalk tourism supports STR market",
      "Lower cost of living than other TX metros",
    ],
    investorTips: [
      "Pearl District is gentrifying rapidly",
      "Medical Center area has strong rental demand",
      "Good market for workforce housing",
    ],
  },
  {
    id: "fort-worth",
    name: "Fort Worth",
    stateSlug: "texas",
    lat: 32.7555,
    lng: -97.3308,
    rank: 5,
    realEstate: {
      medianPrice: 340000,
      priceGrowth: 5.8,
      avgRent: 1700,
      capRate: 6.0,
      daysOnMarket: 30,
      inventoryMonths: 2.4,
      rentGrowth: 6.5,
      medianPricePerSqft: 185,
    },
    demographics: {
      population: 918915,
      populationGrowth: 2.1,
      medianAge: 32.8,
      medianIncome: 63023,
      unemploymentRate: 3.9,
      crimeIndex: 48,
      walkScore: 34,
    },
    universities: [
      { name: "TCU", type: "private", enrollment: 11500, url: "https://tcu.edu" },
      { name: "UNT Health Science Center", type: "public", enrollment: 2200 },
      { name: "Texas Wesleyan", type: "private", enrollment: 2700 },
    ],
    strFriendliness: {
      score: 85,
      tier: "Excellent",
      summary: "Fort Worth has minimal STR restrictions with simple registration requirements.",
      regulations: [
        "Registration required but straightforward",
        "No cap on rental days",
        "15% Hotel Occupancy Tax",
        "HOA rules may apply",
      ],
      permitRequired: true,
      licenseFee: "$50/year + 15% HOT",
    },
    highlights: [
      "Fastest growing city in DFW metro",
      "Cultural District attracts visitors",
      "More affordable than Dallas proper",
    ],
    investorTips: [
      "Near Southside is an emerging neighborhood",
      "Stockyards area good for STR",
      "Alliance/North Fort Worth growing rapidly",
    ],
  },
];

const FLORIDA_MARKETS: MarketDetail[] = [
  {
    id: "miami",
    name: "Miami",
    stateSlug: "florida",
    lat: 25.7617,
    lng: -80.1918,
    rank: 1,
    realEstate: {
      medianPrice: 580000,
      priceGrowth: 6.2,
      avgRent: 2650,
      capRate: 5.4,
      daysOnMarket: 45,
      inventoryMonths: 4.2,
      rentGrowth: 8.5,
      medianPricePerSqft: 445,
    },
    demographics: {
      population: 442241,
      populationGrowth: 0.8,
      medianAge: 40.2,
      medianIncome: 44581,
      unemploymentRate: 3.8,
      crimeIndex: 72,
      walkScore: 78,
    },
    universities: [
      { name: "University of Miami", type: "private", enrollment: 19000, url: "https://miami.edu" },
      { name: "FIU", type: "public", enrollment: 58000 },
      { name: "Miami Dade College", type: "community", enrollment: 85000 },
    ],
    strFriendliness: {
      score: 60,
      tier: "Moderate",
      summary: "Miami Beach has strict regulations; mainland Miami is more permissive.",
      regulations: [
        "Miami Beach: 6-month minimum in residential",
        "City of Miami: registration required",
        "13% bed tax (varies by county)",
        "HOA/condo rules often restrict STR",
      ],
      permitRequired: true,
      licenseFee: "Varies by area + 13% bed tax",
    },
    highlights: [
      "International gateway with year-round tourism",
      "Crypto and finance industry growth",
      "No state income tax attracts relocations",
    ],
    investorTips: [
      "Mainland Miami has fewer STR restrictions",
      "Condo-hotel properties allow STR",
      "Wynwood and Brickell are hot markets",
    ],
  },
  {
    id: "orlando",
    name: "Orlando",
    stateSlug: "florida",
    lat: 28.5383,
    lng: -81.3792,
    rank: 2,
    realEstate: {
      medianPrice: 385000,
      priceGrowth: 5.8,
      avgRent: 1850,
      capRate: 5.9,
      daysOnMarket: 32,
      inventoryMonths: 2.8,
      rentGrowth: 7.2,
      medianPricePerSqft: 235,
    },
    demographics: {
      population: 307573,
      populationGrowth: 2.2,
      medianAge: 34.1,
      medianIncome: 51077,
      unemploymentRate: 3.5,
      crimeIndex: 58,
      walkScore: 42,
    },
    universities: [
      { name: "UCF", type: "public", enrollment: 72000, url: "https://ucf.edu" },
      { name: "Rollins College", type: "private", enrollment: 3600 },
      { name: "Valencia College", type: "community", enrollment: 50000 },
    ],
    strFriendliness: {
      score: 85,
      tier: "Excellent",
      summary: "Orlando is one of the most STR-friendly major markets due to tourism industry.",
      regulations: [
        "State preemption limits local restrictions",
        "Business license required",
        "6% state + 6% county tourist tax",
        "STR-zoned communities near Disney",
      ],
      permitRequired: true,
      licenseFee: "$200 + 12% tourist tax",
    },
    highlights: [
      "Disney World drives massive tourism demand",
      "Theme park expansion continues",
      "Major convention destination",
    ],
    investorTips: [
      "Kissimmee/Championsgate for STR",
      "Near Disney has highest occupancy",
      "Consider resort communities with amenities",
    ],
  },
  {
    id: "tampa",
    name: "Tampa",
    stateSlug: "florida",
    lat: 27.9506,
    lng: -82.4572,
    rank: 3,
    realEstate: {
      medianPrice: 410000,
      priceGrowth: 5.5,
      avgRent: 2050,
      capRate: 5.6,
      daysOnMarket: 28,
      inventoryMonths: 2.5,
      rentGrowth: 6.8,
      medianPricePerSqft: 275,
    },
    demographics: {
      population: 384959,
      populationGrowth: 1.8,
      medianAge: 35.2,
      medianIncome: 54599,
      unemploymentRate: 3.4,
      crimeIndex: 52,
      walkScore: 49,
    },
    universities: [
      { name: "USF", type: "public", enrollment: 50000, url: "https://usf.edu" },
      { name: "University of Tampa", type: "private", enrollment: 11000 },
    ],
    strFriendliness: {
      score: 75,
      tier: "Good",
      summary: "Tampa has moderate regulations with some neighborhood restrictions.",
      regulations: [
        "Registration required",
        "6% state + 6% county tourist tax",
        "Some neighborhoods have STR limits",
        "Vacation rental licenses available",
      ],
      permitRequired: true,
      licenseFee: "$200 + 12% tourist tax",
    },
    highlights: [
      "Fastest growing job market in Florida",
      "Lower cost than Miami with beach access",
      "Major corporate relocations ongoing",
    ],
    investorTips: [
      "Seminole Heights is gentrifying",
      "South Tampa premium but competitive",
      "Clearwater Beach for STR",
    ],
  },
  {
    id: "jacksonville",
    name: "Jacksonville",
    stateSlug: "florida",
    lat: 30.3322,
    lng: -81.6557,
    rank: 4,
    realEstate: {
      medianPrice: 335000,
      priceGrowth: 6.2,
      avgRent: 1650,
      capRate: 6.1,
      daysOnMarket: 35,
      inventoryMonths: 2.9,
      rentGrowth: 7.0,
      medianPricePerSqft: 195,
    },
    demographics: {
      population: 949611,
      populationGrowth: 1.5,
      medianAge: 35.6,
      medianIncome: 54701,
      unemploymentRate: 3.7,
      crimeIndex: 55,
      walkScore: 26,
    },
    universities: [
      { name: "UNF", type: "public", enrollment: 17000 },
      { name: "Jacksonville University", type: "private", enrollment: 5000 },
      { name: "FSCJ", type: "community", enrollment: 45000 },
    ],
    strFriendliness: {
      score: 80,
      tier: "Excellent",
      summary: "Jacksonville has minimal STR regulations with easy permitting.",
      regulations: [
        "Business license required",
        "6% state + 6% county tourist tax",
        "Few neighborhood restrictions",
        "Beach communities may have rules",
      ],
      permitRequired: true,
      licenseFee: "$50 + 12% tourist tax",
    },
    highlights: [
      "Largest city by land area in contiguous US",
      "Major port and logistics hub",
      "Most affordable major FL metro",
    ],
    investorTips: [
      "Riverside/Avondale are trendy areas",
      "Beach communities premium but limited",
      "Good cash flow market for rentals",
    ],
  },
  {
    id: "fort-lauderdale",
    name: "Fort Lauderdale",
    stateSlug: "florida",
    lat: 26.1224,
    lng: -80.1373,
    rank: 5,
    realEstate: {
      medianPrice: 485000,
      priceGrowth: 5.2,
      avgRent: 2350,
      capRate: 5.5,
      daysOnMarket: 40,
      inventoryMonths: 3.5,
      rentGrowth: 7.5,
      medianPricePerSqft: 350,
    },
    demographics: {
      population: 182760,
      populationGrowth: 1.0,
      medianAge: 43.2,
      medianIncome: 56713,
      unemploymentRate: 3.6,
      crimeIndex: 62,
      walkScore: 62,
    },
    universities: [
      { name: "Nova Southeastern", type: "private", enrollment: 20000 },
      { name: "FAU", type: "public", enrollment: 30000 },
      { name: "Broward College", type: "community", enrollment: 63000 },
    ],
    strFriendliness: {
      score: 65,
      tier: "Good",
      summary: "Fort Lauderdale has moderate regulations with restrictions in some areas.",
      regulations: [
        "Registration required",
        "6% state + 6% county tourist tax",
        "Some beach areas have 30-day minimums",
        "Condo associations often restrict",
      ],
      permitRequired: true,
      licenseFee: "$200 + 12% tourist tax",
    },
    highlights: [
      "Major cruise port and yacht capital",
      "LGBTQ+ friendly tourism market",
      "Less expensive than Miami Beach",
    ],
    investorTips: [
      "Victoria Park is walkable and trendy",
      "Beach condo rules vary significantly",
      "Consider west Broward for cash flow",
    ],
  },
];

export const MARKET_DETAILS: MarketsByState = {
  california: CALIFORNIA_MARKETS,
  texas: TEXAS_MARKETS,
  florida: FLORIDA_MARKETS,
};

export function getMarketDetails(stateSlug: string): MarketDetail[] {
  const markets = MARKET_DETAILS[stateSlug] || [];
  // Sort by CAP rate (primary) then price growth (secondary)
  return sortMarketsByInvestmentQuality(markets);
}

export function getMarketById(stateSlug: string, marketId: string): MarketDetail | undefined {
  const markets = getMarketDetails(stateSlug);
  return markets.find(m => m.id === marketId);
}

export function generateMarketDetailFromBasicData(
  name: string,
  stateSlug: string,
  lat: number,
  lng: number,
  rank: number
): MarketDetail {
  const cityHash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const basePrices: Record<string, number> = {
    "california": 750000, "new-york": 680000, "florida": 420000, "texas": 340000,
    "arizona": 445000, "colorado": 560000, "washington": 620000, "nevada": 410000,
    "georgia": 380000, "north-carolina": 365000, "tennessee": 340000, "default": 350000,
  };
  const basePrice = basePrices[stateSlug] || basePrices["default"];
  const rankMultiplier = 1 + (1 - rank) * 0.08;
  const medianPrice = Math.round(basePrice * rankMultiplier * (0.9 + (cityHash % 25) / 100));
  
  return {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    stateSlug,
    lat,
    lng,
    rank,
    realEstate: {
      medianPrice,
      priceGrowth: 3.0 + (cityHash % 50) / 10,
      avgRent: Math.round(medianPrice * 0.0055),
      capRate: 4.5 + (cityHash % 30) / 10,
      daysOnMarket: 20 + (cityHash % 30),
      inventoryMonths: 1.5 + (cityHash % 30) / 10,
      rentGrowth: 3.5 + (cityHash % 40) / 10,
      medianPricePerSqft: Math.round(medianPrice / (1200 + cityHash % 800)),
    },
    demographics: {
      population: 100000 + (cityHash * 1000) % 900000,
      populationGrowth: 0.5 + (cityHash % 30) / 10,
      medianAge: 32 + (cityHash % 12),
      medianIncome: 45000 + (cityHash * 100) % 55000,
      unemploymentRate: 3.0 + (cityHash % 30) / 10,
      crimeIndex: 30 + (cityHash % 45),
      walkScore: 25 + (cityHash % 55),
    },
    universities: [],
    strFriendliness: (() => {
      // Known STR-friendly markets with specific scores
      const knownSTRFriendlyMarkets: Record<string, { score: number; summary: string; regulations: string[] }> = {
        "scottsdale": { 
          score: 88, 
          summary: "Scottsdale is one of the most STR-friendly markets in Arizona with streamlined permitting and strong tourist demand.",
          regulations: ["Annual registration required", "2.5% city STR tax", "No primary residence requirement", "Strong vacation rental market"]
        },
        "phoenix": { 
          score: 82, 
          summary: "Phoenix has favorable STR regulations with minimal restrictions and strong rental demand.",
          regulations: ["Transaction Privilege Tax applies", "Business license required", "No day limits", "Property must meet safety codes"]
        },
        "orlando": { 
          score: 85, 
          summary: "Orlando is highly STR-friendly due to tourism industry, with streamlined vacation rental permits.",
          regulations: ["Vacation rental license required", "6% state + 6% county tourist tax", "No night minimums in most areas", "Strong year-round demand"]
        },
        "tampa": { 
          score: 80, 
          summary: "Tampa has moderate STR regulations with good investment potential in tourist areas.",
          regulations: ["Business tax receipt required", "Tourist development tax applies", "Some HOA restrictions", "Growing short-term rental market"]
        },
        "las vegas": { 
          score: 75, 
          summary: "Las Vegas allows STRs in specific zones with proper licensing.",
          regulations: ["Business license required", "13% room tax", "Owner-occupied requirement in some areas", "Distance restrictions from schools"]
        },
        "denver": { 
          score: 70, 
          summary: "Denver requires primary residence for STR licensing.",
          regulations: ["Primary residence requirement", "10.75% lodging tax", "Annual license renewal", "Occupancy limits apply"]
        },
        "austin": { 
          score: 72, 
          summary: "Austin has tiered STR regulations based on property type and location.",
          regulations: ["Type 1/2/3 license system", "15% hotel occupancy tax", "Owner-occupied gets more flexibility", "Some neighborhoods restrict STRs"]
        },
        "nashville": { 
          score: 65, 
          summary: "Nashville has increased STR regulations in recent years with permit requirements.",
          regulations: ["Owner-occupied permits easier to get", "Non-owner-occupied limited by zone", "5% local occupancy tax", "Annual permit renewal"]
        },
      };
      
      const marketKey = name.toLowerCase();
      const knownMarket = knownSTRFriendlyMarkets[marketKey];
      
      if (knownMarket) {
        return {
          score: knownMarket.score,
          tier: getSTRTierFromScore(knownMarket.score),
          summary: knownMarket.summary,
          regulations: knownMarket.regulations,
          permitRequired: true,
        };
      }
      
      // Default: generate score based on city hash but use score-based tier
      const score = 50 + (cityHash % 40);
      return {
        score,
        tier: getSTRTierFromScore(score),
        summary: `${name} has standard STR regulations. Check local ordinances for current rules.`,
        regulations: [
          "Local permits may be required",
          "Occupancy taxes typically apply",
          "HOA rules may restrict STR activity",
        ],
        permitRequired: true,
      };
    })(),
    highlights: [
      `Growing market in ${stateSlug.replace(/-/g, ' ')}`,
      "Diverse local economy",
      "Good rental demand",
    ],
    investorTips: [
      "Research local regulations before investing",
      "Consider both long-term and short-term rental strategies",
      "Network with local real estate investors",
    ],
  };
}
