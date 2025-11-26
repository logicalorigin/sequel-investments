import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, index, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Document status enum
export const documentStatusEnum = pgEnum("document_status", ["pending", "uploaded", "approved", "rejected", "if_applicable"]);

// Loan application status enum
export const loanApplicationStatusEnum = pgEnum("loan_application_status", ["draft", "submitted", "in_review", "approved", "funded", "denied", "withdrawn"]);

// Processing stage enum (for progress stepper)
export const processingStageEnum = pgEnum("processing_stage", [
  "account_review",
  "underwriting", 
  "term_sheet",
  "processing",
  "docs_out",
  "closed"
]);

// Loan Applications table
export const loanApplications = pgTable("loan_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  loanType: text("loan_type").notNull(),
  propertyAddress: text("property_address"),
  propertyCity: text("property_city"),
  propertyState: text("property_state"),
  propertyZip: text("property_zip"),
  loanAmount: integer("loan_amount"),
  status: loanApplicationStatusEnum("status").default("draft").notNull(),
  processingStage: processingStageEnum("processing_stage").default("account_review"),
  
  // Property & Deal Details
  purchasePrice: integer("purchase_price"),
  arv: integer("arv"),
  rehabBudget: integer("rehab_budget"),
  requestedRehabFunding: integer("requested_rehab_funding"),
  downPayment: integer("down_payment"),
  
  // Loan Terms
  loanTermMonths: integer("loan_term_months"),
  holdTimeMonths: integer("hold_time_months"),
  interestRate: text("interest_rate"),
  interestType: text("interest_type"),
  ltc: text("ltc"),
  ltv: text("ltv"),
  
  // Annual Costs
  annualTaxes: integer("annual_taxes"),
  annualInsurance: integer("annual_insurance"),
  annualHOA: integer("annual_hoa"),
  totalClosingCosts: integer("total_closing_costs"),
  
  // Fees
  originationFee: integer("origination_fee"),
  documentPrepFee: integer("document_prep_fee"),
  escrowFee: integer("escrow_fee"),
  dailyInterestCharges: integer("daily_interest_charges"),
  
  // Funds to Close
  rehabEquity: integer("rehab_equity"),
  debtServicing: integer("debt_servicing"),
  
  // Borrower Info
  guarantor: text("guarantor"),
  entity: text("entity"),
  
  // Staff Assignments
  accountExecutiveName: text("account_executive_name"),
  accountExecutiveEmail: text("account_executive_email"),
  accountExecutivePhone: text("account_executive_phone"),
  processorName: text("processor_name"),
  processorEmail: text("processor_email"),
  processorPhone: text("processor_phone"),
  
  // Dates
  requestedClosingDate: timestamp("requested_closing_date"),
  closingDate: timestamp("closing_date"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const loanApplicationsRelations = relations(loanApplications, ({ one, many }) => ({
  user: one(users, {
    fields: [loanApplications.userId],
    references: [users.id],
  }),
  documents: many(documents),
}));

export type LoanApplication = typeof loanApplications.$inferSelect;
export type InsertLoanApplication = typeof loanApplications.$inferInsert;

export const insertLoanApplicationSchema = createInsertSchema(loanApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Document types - static list of required documents per loan type
export const documentTypes = pgTable("document_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  loanTypes: text("loan_types").array().notNull(),
  isRequired: text("is_required").default("required").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export type DocumentType = typeof documentTypes.$inferSelect;
export type InsertDocumentType = typeof documentTypes.$inferInsert;

// Documents table - tracks uploaded documents for each loan application
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  loanApplicationId: varchar("loan_application_id").notNull().references(() => loanApplications.id),
  documentTypeId: varchar("document_type_id").notNull().references(() => documentTypes.id),
  status: documentStatusEnum("status").default("pending").notNull(),
  fileName: text("file_name"),
  fileUrl: text("file_url"),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  comment: text("comment"),
  uploadedAt: timestamp("uploaded_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const documentsRelations = relations(documents, ({ one }) => ({
  loanApplication: one(loanApplications, {
    fields: [documents.loanApplicationId],
    references: [loanApplications.id],
  }),
  documentType: one(documentTypes, {
    fields: [documents.documentTypeId],
    references: [documentTypes.id],
  }),
}));

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Leads table (existing)
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

// Default document types for loan applications
export const DEFAULT_DOCUMENT_TYPES = [
  { name: "Purchase Contract", description: "Signed purchase agreement", category: "Property Documentation", loanTypes: ["DSCR", "Fix & Flip", "New Construction", "Hard Money"], isRequired: "required", sortOrder: 1 },
  { name: "Entity Documents", description: "LLC operating agreement, articles of incorporation, or trust documents", category: "Borrower Documentation", loanTypes: ["DSCR", "Fix & Flip", "New Construction", "Hard Money"], isRequired: "required", sortOrder: 2 },
  { name: "Photo ID", description: "Government-issued photo identification", category: "Borrower Documentation", loanTypes: ["DSCR", "Fix & Flip", "New Construction", "Hard Money"], isRequired: "required", sortOrder: 3 },
  { name: "Bank Statements", description: "Last 2 months of bank statements showing reserves", category: "Financial Documentation", loanTypes: ["DSCR", "Fix & Flip", "New Construction", "Hard Money"], isRequired: "required", sortOrder: 4 },
  { name: "Lease Agreement", description: "Current lease agreement for rental property", category: "Property Documentation", loanTypes: ["DSCR"], isRequired: "if_applicable", sortOrder: 5 },
  { name: "Rent Roll", description: "Current rent roll showing tenant information", category: "Property Documentation", loanTypes: ["DSCR"], isRequired: "if_applicable", sortOrder: 6 },
  { name: "Property Insurance", description: "Proof of hazard insurance", category: "Property Documentation", loanTypes: ["DSCR", "Fix & Flip", "New Construction", "Hard Money"], isRequired: "required", sortOrder: 7 },
  { name: "Title Insurance", description: "Title commitment or preliminary title report", category: "Property Documentation", loanTypes: ["DSCR", "Fix & Flip", "New Construction", "Hard Money"], isRequired: "required", sortOrder: 8 },
  { name: "Scope of Work", description: "Detailed renovation budget and timeline", category: "Project Documentation", loanTypes: ["Fix & Flip", "New Construction"], isRequired: "required", sortOrder: 9 },
  { name: "Contractor Agreement", description: "Signed agreement with licensed contractor", category: "Project Documentation", loanTypes: ["Fix & Flip", "New Construction"], isRequired: "required", sortOrder: 10 },
  { name: "Construction Plans", description: "Architectural plans and permits", category: "Project Documentation", loanTypes: ["New Construction"], isRequired: "required", sortOrder: 11 },
  { name: "Property Appraisal", description: "Current appraisal report", category: "Property Documentation", loanTypes: ["DSCR", "Fix & Flip", "New Construction", "Hard Money"], isRequired: "if_applicable", sortOrder: 12 },
  { name: "Experience Resume", description: "Track record of completed real estate transactions", category: "Borrower Documentation", loanTypes: ["Fix & Flip", "New Construction"], isRequired: "if_applicable", sortOrder: 13 },
];

// Closed/Serviced Loans table
export const servicedLoans = pgTable("serviced_loans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  loanNumber: varchar("loan_number").notNull(),
  loanType: text("loan_type").notNull(),
  propertyAddress: text("property_address").notNull(),
  propertyCity: text("property_city"),
  propertyState: text("property_state"),
  propertyZip: text("property_zip"),
  
  // Loan Terms
  originalLoanAmount: integer("original_loan_amount").notNull(),
  currentBalance: integer("current_balance").notNull(),
  interestRate: text("interest_rate").notNull(),
  monthlyPayment: integer("monthly_payment").notNull(),
  loanTermMonths: integer("loan_term_months"),
  
  // Payment Info
  nextPaymentDate: timestamp("next_payment_date"),
  lastPaymentDate: timestamp("last_payment_date"),
  lastPaymentAmount: integer("last_payment_amount"),
  paymentsDue: integer("payments_due").default(0),
  
  // Status
  loanStatus: text("loan_status").default("current").notNull(), // current, late, paid_off
  closingDate: timestamp("closing_date"),
  maturityDate: timestamp("maturity_date"),
  
  // Servicer Info
  servicerName: text("servicer_name"),
  servicerPhone: text("servicer_phone"),
  servicerEmail: text("servicer_email"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const servicedLoansRelations = relations(servicedLoans, ({ one }) => ({
  user: one(users, {
    fields: [servicedLoans.userId],
    references: [users.id],
  }),
}));

export type ServicedLoan = typeof servicedLoans.$inferSelect;
export type InsertServicedLoan = typeof servicedLoans.$inferInsert;

export const insertServicedLoanSchema = createInsertSchema(servicedLoans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// State data for "Where We Lend" section and state-specific SEO pages
export interface StateData {
  abbreviation: string;
  name: string;
  slug: string;
  loansClosed: number;
  loanVolume: number;
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

export function getStateBySlug(slug: string): StateData | undefined {
  return statesData.find(state => state.slug === slug);
}

export function getStateByAbbreviation(abbr: string): StateData | undefined {
  return statesData.find(state => state.abbreviation === abbr);
}

export function getEligibleStates(): StateData[] {
  return statesData.filter(state => state.isEligible);
}
