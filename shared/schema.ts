import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  loanType: text("loan_type").notNull(),
  propertyLocation: text("property_location"),
  propertyValue: text("property_value"),
  investmentExperience: text("investment_experience"),
  message: text("message"),
  howHeardAboutUs: text("how_heard_about_us"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  loanType: z.enum(["DSCR", "Fix & Flip", "New Construction", "Hard Money", "Both", "Other"]),
  propertyLocation: z.string().nullable().optional(),
  propertyValue: z.string().nullable().optional(),
  investmentExperience: z.string().nullable().optional(),
  message: z.string().nullable().optional(),
  howHeardAboutUs: z.string().nullable().optional(),
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

// State data for "Where We Lend" section and state-specific SEO pages
export interface StateData {
  abbreviation: string;
  name: string;
  slug: string;
  loansClosed: number;
  loanVolume: number; // in millions
  isEligible: boolean;
  eligiblePrograms: {
    dscr: boolean;
    fixFlip: boolean;
    hardMoney: boolean;
    newConstruction: boolean;
  };
}

// All 50 states + DC with lending data
export const statesData: StateData[] = [
  { abbreviation: "AL", name: "Alabama", slug: "alabama", loansClosed: 47, loanVolume: 12.3, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "AK", name: "Alaska", slug: "alaska", loansClosed: 8, loanVolume: 2.1, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "AZ", name: "Arizona", slug: "arizona", loansClosed: 156, loanVolume: 48.7, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "AR", name: "Arkansas", slug: "arkansas", loansClosed: 34, loanVolume: 8.9, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "CA", name: "California", slug: "california", loansClosed: 287, loanVolume: 112.4, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "CO", name: "Colorado", slug: "colorado", loansClosed: 98, loanVolume: 34.2, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "CT", name: "Connecticut", slug: "connecticut", loansClosed: 52, loanVolume: 18.6, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "DE", name: "Delaware", slug: "delaware", loansClosed: 23, loanVolume: 7.4, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "DC", name: "District of Columbia", slug: "washington-dc", loansClosed: 31, loanVolume: 14.2, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "FL", name: "Florida", slug: "florida", loansClosed: 312, loanVolume: 98.5, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "GA", name: "Georgia", slug: "georgia", loansClosed: 134, loanVolume: 42.1, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "HI", name: "Hawaii", slug: "hawaii", loansClosed: 18, loanVolume: 8.7, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "ID", name: "Idaho", slug: "idaho", loansClosed: 41, loanVolume: 12.8, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "IL", name: "Illinois", slug: "illinois", loansClosed: 89, loanVolume: 28.4, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "IN", name: "Indiana", slug: "indiana", loansClosed: 67, loanVolume: 18.9, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "IA", name: "Iowa", slug: "iowa", loansClosed: 28, loanVolume: 7.2, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "KS", name: "Kansas", slug: "kansas", loansClosed: 35, loanVolume: 9.1, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "KY", name: "Kentucky", slug: "kentucky", loansClosed: 42, loanVolume: 11.3, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "LA", name: "Louisiana", slug: "louisiana", loansClosed: 38, loanVolume: 10.2, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: false, hardMoney: false, newConstruction: false } },
  { abbreviation: "ME", name: "Maine", slug: "maine", loansClosed: 21, loanVolume: 6.8, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "MD", name: "Maryland", slug: "maryland", loansClosed: 78, loanVolume: 26.4, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "MA", name: "Massachusetts", slug: "massachusetts", loansClosed: 64, loanVolume: 24.7, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "MI", name: "Michigan", slug: "michigan", loansClosed: 76, loanVolume: 21.3, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "MN", name: "Minnesota", slug: "minnesota", loansClosed: 45, loanVolume: 14.6, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: false, hardMoney: false, newConstruction: false } },
  { abbreviation: "MS", name: "Mississippi", slug: "mississippi", loansClosed: 29, loanVolume: 7.1, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "MO", name: "Missouri", slug: "missouri", loansClosed: 58, loanVolume: 15.8, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "MT", name: "Montana", slug: "montana", loansClosed: 19, loanVolume: 5.4, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "NE", name: "Nebraska", slug: "nebraska", loansClosed: 24, loanVolume: 6.3, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "NV", name: "Nevada", slug: "nevada", loansClosed: 87, loanVolume: 29.6, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "NH", name: "New Hampshire", slug: "new-hampshire", loansClosed: 26, loanVolume: 8.9, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "NJ", name: "New Jersey", slug: "new-jersey", loansClosed: 92, loanVolume: 34.8, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "NM", name: "New Mexico", slug: "new-mexico", loansClosed: 31, loanVolume: 8.7, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "NY", name: "New York", slug: "new-york", loansClosed: 118, loanVolume: 52.3, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "NC", name: "North Carolina", slug: "north-carolina", loansClosed: 112, loanVolume: 36.4, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "ND", name: "North Dakota", slug: "north-dakota", loansClosed: 0, loanVolume: 0, isEligible: false, eligiblePrograms: { dscr: false, fixFlip: false, hardMoney: false, newConstruction: false } },
  { abbreviation: "OH", name: "Ohio", slug: "ohio", loansClosed: 94, loanVolume: 26.7, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "OK", name: "Oklahoma", slug: "oklahoma", loansClosed: 43, loanVolume: 11.2, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "OR", name: "Oregon", slug: "oregon", loansClosed: 56, loanVolume: 19.8, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "PA", name: "Pennsylvania", slug: "pennsylvania", loansClosed: 87, loanVolume: 28.3, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "RI", name: "Rhode Island", slug: "rhode-island", loansClosed: 18, loanVolume: 6.2, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "SC", name: "South Carolina", slug: "south-carolina", loansClosed: 68, loanVolume: 21.4, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "SD", name: "South Dakota", slug: "south-dakota", loansClosed: 0, loanVolume: 0, isEligible: false, eligiblePrograms: { dscr: false, fixFlip: false, hardMoney: false, newConstruction: false } },
  { abbreviation: "TN", name: "Tennessee", slug: "tennessee", loansClosed: 89, loanVolume: 27.6, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "TX", name: "Texas", slug: "texas", loansClosed: 245, loanVolume: 78.9, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "UT", name: "Utah", slug: "utah", loansClosed: 54, loanVolume: 18.4, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "VT", name: "Vermont", slug: "vermont", loansClosed: 12, loanVolume: 4.1, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "VA", name: "Virginia", slug: "virginia", loansClosed: 86, loanVolume: 29.7, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "WA", name: "Washington", slug: "washington", loansClosed: 78, loanVolume: 28.4, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "WV", name: "West Virginia", slug: "west-virginia", loansClosed: 21, loanVolume: 5.2, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "WI", name: "Wisconsin", slug: "wisconsin", loansClosed: 48, loanVolume: 13.7, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
  { abbreviation: "WY", name: "Wyoming", slug: "wyoming", loansClosed: 11, loanVolume: 3.2, isEligible: true, eligiblePrograms: { dscr: true, fixFlip: true, hardMoney: true, newConstruction: true } },
];

// Helper function to get state by slug
export function getStateBySlug(slug: string): StateData | undefined {
  return statesData.find(state => state.slug === slug);
}

// Helper function to get state by abbreviation
export function getStateByAbbreviation(abbr: string): StateData | undefined {
  return statesData.find(state => state.abbreviation === abbr);
}

// Get all eligible states
export function getEligibleStates(): StateData[] {
  return statesData.filter(state => state.isEligible);
}
