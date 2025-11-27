import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, index, pgEnum, boolean } from "drizzle-orm/pg-core";
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

// User role enum
export const userRoleEnum = pgEnum("user_role", ["borrower", "staff", "admin"]);

// User storage table for Replit Auth + local auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  username: varchar("username").unique(),
  password: varchar("password"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default("borrower").notNull(),
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
  
  // Analyzer Data (for linking back to the analysis)
  analyzerType: text("analyzer_type"), // "dscr", "fixflip", "construction"
  analyzerData: jsonb("analyzer_data"), // Full scenario inputs + results
  
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
  requiresSignature: boolean("requires_signature").default(false).notNull(),
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

export const documentsRelations = relations(documents, ({ one, many }) => ({
  loanApplication: one(loanApplications, {
    fields: [documents.loanApplicationId],
    references: [loanApplications.id],
  }),
  documentType: one(documentTypes, {
    fields: [documents.documentTypeId],
    references: [documentTypes.id],
  }),
  comments: many(documentComments),
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

// ============================================
// NOTIFICATIONS
// ============================================
export const notificationTypeEnum = pgEnum("notification_type", [
  "status_change",
  "document_request",
  "document_approved",
  "document_rejected",
  "payment_reminder",
  "co_borrower_invite",
  "co_borrower_accepted",
  "general"
]);

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: notificationTypeEnum("type").default("general").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: text("is_read").default("false").notNull(),
  linkUrl: text("link_url"),
  relatedApplicationId: varchar("related_application_id").references(() => loanApplications.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  application: one(loanApplications, {
    fields: [notifications.relatedApplicationId],
    references: [loanApplications.id],
  }),
}));

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// ============================================
// SAVED SCENARIOS (for analyzers)
// ============================================
export const scenarioTypeEnum = pgEnum("scenario_type", ["dscr", "fixflip", "construction"]);

export const savedScenarios = pgTable("saved_scenarios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  type: scenarioTypeEnum("type").notNull(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const savedScenariosRelations = relations(savedScenarios, ({ one }) => ({
  user: one(users, {
    fields: [savedScenarios.userId],
    references: [users.id],
  }),
}));

export type SavedScenario = typeof savedScenarios.$inferSelect;
export type InsertSavedScenario = typeof savedScenarios.$inferInsert;

export const insertSavedScenarioSchema = createInsertSchema(savedScenarios).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================
// USER PREFERENCES
// ============================================
export const userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  
  // Investment preferences
  investmentGoals: text("investment_goals").array(),
  preferredPropertyTypes: text("preferred_property_types").array(),
  preferredMarkets: text("preferred_markets").array(),
  investmentBudgetMin: integer("investment_budget_min"),
  investmentBudgetMax: integer("investment_budget_max"),
  experienceLevel: text("experience_level"),
  
  // Notification settings
  emailNotifications: text("email_notifications").default("true").notNull(),
  statusChangeAlerts: text("status_change_alerts").default("true").notNull(),
  documentAlerts: text("document_alerts").default("true").notNull(),
  paymentReminders: text("payment_reminders").default("true").notNull(),
  marketingEmails: text("marketing_emails").default("false").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = typeof userPreferences.$inferInsert;

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================
// CONNECTED ENTITIES (LLCs, Partners)
// ============================================
export const entityTypeEnum = pgEnum("entity_type", ["llc", "corporation", "trust", "partnership", "individual"]);

export const connectedEntities = pgTable("connected_entities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  type: entityTypeEnum("type").notNull(),
  ein: text("ein"),
  stateOfFormation: text("state_of_formation"),
  dateOfFormation: text("date_of_formation"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  isDefault: text("is_default").default("false").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const connectedEntitiesRelations = relations(connectedEntities, ({ one }) => ({
  user: one(users, {
    fields: [connectedEntities.userId],
    references: [users.id],
  }),
}));

export type ConnectedEntity = typeof connectedEntities.$inferSelect;
export type InsertConnectedEntity = typeof connectedEntities.$inferInsert;

export const insertConnectedEntitySchema = createInsertSchema(connectedEntities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================
// DOCUMENT SIGNATURES (E-Sign)
// ============================================
export const signatureStatusEnum = pgEnum("signature_status", ["pending", "signed", "declined"]);

export const documentSignatures = pgTable("document_signatures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull().references(() => documents.id),
  signerId: varchar("signer_id").notNull().references(() => users.id),
  status: signatureStatusEnum("status").default("pending").notNull(),
  signatureData: text("signature_data"),
  signedAt: timestamp("signed_at"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const documentSignaturesRelations = relations(documentSignatures, ({ one }) => ({
  document: one(documents, {
    fields: [documentSignatures.documentId],
    references: [documents.id],
  }),
  signer: one(users, {
    fields: [documentSignatures.signerId],
    references: [users.id],
  }),
}));

export type DocumentSignature = typeof documentSignatures.$inferSelect;
export type InsertDocumentSignature = typeof documentSignatures.$inferInsert;

export const insertDocumentSignatureSchema = createInsertSchema(documentSignatures).omit({
  id: true,
  createdAt: true,
});

// ============================================
// DOCUMENT COMMENTS
// ============================================
export const documentComments = pgTable("document_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull().references(() => documents.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isInternal: boolean("is_internal").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const documentCommentsRelations = relations(documentComments, ({ one }) => ({
  document: one(documents, {
    fields: [documentComments.documentId],
    references: [documents.id],
  }),
  user: one(users, {
    fields: [documentComments.userId],
    references: [users.id],
  }),
}));

export type DocumentComment = typeof documentComments.$inferSelect;
export type InsertDocumentComment = typeof documentComments.$inferInsert;

export const insertDocumentCommentSchema = createInsertSchema(documentComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================
// CO-BORROWERS (Collaboration)
// ============================================
export const coBorrowerStatusEnum = pgEnum("co_borrower_status", ["pending", "accepted", "declined"]);
export const coBorrowerRoleEnum = pgEnum("co_borrower_role", ["co_borrower", "guarantor", "viewer"]);

export const coBorrowers = pgTable("co_borrowers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  loanApplicationId: varchar("loan_application_id").notNull().references(() => loanApplications.id),
  invitedByUserId: varchar("invited_by_user_id").notNull().references(() => users.id),
  invitedUserId: varchar("invited_user_id").references(() => users.id),
  invitedEmail: text("invited_email").notNull(),
  role: coBorrowerRoleEnum("role").default("co_borrower").notNull(),
  status: coBorrowerStatusEnum("status").default("pending").notNull(),
  inviteToken: text("invite_token"),
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const coBorrowersRelations = relations(coBorrowers, ({ one }) => ({
  application: one(loanApplications, {
    fields: [coBorrowers.loanApplicationId],
    references: [loanApplications.id],
  }),
  invitedBy: one(users, {
    fields: [coBorrowers.invitedByUserId],
    references: [users.id],
  }),
  invitedUser: one(users, {
    fields: [coBorrowers.invitedUserId],
    references: [users.id],
  }),
}));

export type CoBorrower = typeof coBorrowers.$inferSelect;
export type InsertCoBorrower = typeof coBorrowers.$inferInsert;

export const insertCoBorrowerSchema = createInsertSchema(coBorrowers).omit({
  id: true,
  createdAt: true,
});

// ============================================
// APPLICATION TIMELINE EVENTS
// ============================================
export const timelineEventTypeEnum = pgEnum("timeline_event_type", [
  "application_created",
  "application_submitted",
  "status_changed",
  "document_uploaded",
  "document_approved",
  "document_rejected",
  "co_borrower_added",
  "signature_requested",
  "signature_completed",
  "stage_advanced",
  "note_added",
  "loan_funded",
  "loan_closed"
]);

export const applicationTimeline = pgTable("application_timeline", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  loanApplicationId: varchar("loan_application_id").notNull().references(() => loanApplications.id),
  eventType: timelineEventTypeEnum("event_type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  metadata: jsonb("metadata"),
  createdByUserId: varchar("created_by_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const applicationTimelineRelations = relations(applicationTimeline, ({ one }) => ({
  application: one(loanApplications, {
    fields: [applicationTimeline.loanApplicationId],
    references: [loanApplications.id],
  }),
  createdBy: one(users, {
    fields: [applicationTimeline.createdByUserId],
    references: [users.id],
  }),
}));

export type ApplicationTimelineEvent = typeof applicationTimeline.$inferSelect;
export type InsertApplicationTimelineEvent = typeof applicationTimeline.$inferInsert;

export const insertApplicationTimelineEventSchema = createInsertSchema(applicationTimeline).omit({
  id: true,
  createdAt: true,
});

// ============================================
// MARKET DATA CACHE
// ============================================
export const marketDataSourceEnum = pgEnum("market_data_source", ["rentcast", "zillow", "manual"]);

export const marketDataSnapshots = pgTable("market_data_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stateSlug: varchar("state_slug", { length: 50 }).notNull(),
  source: marketDataSourceEnum("source").notNull(),
  
  medianHomePrice: integer("median_home_price"),
  avgCapRate: text("avg_cap_rate"),
  avgDaysOnMarket: integer("avg_days_on_market"),
  priceGrowthYoY: text("price_growth_yoy"),
  rentGrowthYoY: text("rent_growth_yoy"),
  medianRent: integer("median_rent"),
  
  dataDate: timestamp("data_date").notNull(),
  fetchedAt: timestamp("fetched_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  
  metadata: jsonb("metadata"),
  isManualOverride: text("is_manual_override").default("false").notNull(),
}, (table) => [
  index("idx_market_data_state_date").on(table.stateSlug, table.dataDate),
]);

export type MarketDataSnapshot = typeof marketDataSnapshots.$inferSelect;
export type InsertMarketDataSnapshot = typeof marketDataSnapshots.$inferInsert;

export const insertMarketDataSnapshotSchema = createInsertSchema(marketDataSnapshots).omit({
  id: true,
  fetchedAt: true,
});

export interface MarketDataResponse {
  stateSlug: string;
  stateName: string;
  medianHomePrice: number;
  avgCapRate: number;
  avgDaysOnMarket: number;
  priceGrowthYoY: number;
  rentGrowthYoY: number;
  medianRent: number;
  source: string;
  dataDate: Date;
  isCached: boolean;
}

// ============================================
// STAFF INVITES
// ============================================
export const staffInviteStatusEnum = pgEnum("staff_invite_status", ["pending", "accepted", "expired", "revoked"]);

export const staffInvites = pgTable("staff_invites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull(),
  token: varchar("token").notNull().unique(),
  role: userRoleEnum("role").default("staff").notNull(),
  status: staffInviteStatusEnum("status").default("pending").notNull(),
  invitedById: varchar("invited_by_id").references(() => users.id),
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  acceptedByUserId: varchar("accepted_by_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const staffInvitesRelations = relations(staffInvites, ({ one }) => ({
  invitedBy: one(users, {
    fields: [staffInvites.invitedById],
    references: [users.id],
  }),
  acceptedByUser: one(users, {
    fields: [staffInvites.acceptedByUserId],
    references: [users.id],
  }),
}));

export type StaffInvite = typeof staffInvites.$inferSelect;
export type InsertStaffInvite = typeof staffInvites.$inferInsert;

export const insertStaffInviteSchema = createInsertSchema(staffInvites).omit({
  id: true,
  createdAt: true,
  acceptedAt: true,
  acceptedByUserId: true,
});

// ============================================
// FUNDED DEALS (for Recently Funded section)
// ============================================
export const loanTypeEnum = pgEnum("loan_type", ["DSCR", "Fix & Flip", "New Construction"]);

export const fundedDeals = pgTable("funded_deals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Property Info
  location: text("location").notNull(), // City name
  state: varchar("state", { length: 2 }).notNull(), // State abbreviation
  propertyType: text("property_type").notNull(), // Single Family, Duplex, etc.
  
  // Loan Details
  loanType: text("loan_type").notNull(), // DSCR, Fix & Flip, New Construction
  loanAmount: integer("loan_amount").notNull(),
  rate: text("rate").notNull(), // Interest rate as decimal string
  ltv: integer("ltv"), // Loan-to-Value percentage (for DSCR)
  ltc: integer("ltc"), // Loan-to-Cost percentage (for Fix & Flip/Construction)
  closeTime: text("close_time").notNull(), // e.g., "21 days", "48 hrs"
  
  // Display
  imageUrl: text("image_url"), // URL to property image
  imageKey: text("image_key"), // Key for uploaded images (for internal storage)
  isVisible: boolean("is_visible").default(true).notNull(),
  displayOrder: integer("display_order").default(0),
  
  // Metadata
  createdById: varchar("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const fundedDealsRelations = relations(fundedDeals, ({ one }) => ({
  createdBy: one(users, {
    fields: [fundedDeals.createdById],
    references: [users.id],
  }),
}));

export type FundedDeal = typeof fundedDeals.$inferSelect;
export type InsertFundedDeal = typeof fundedDeals.$inferInsert;

export const insertFundedDealSchema = createInsertSchema(fundedDeals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================
// WEBHOOKS (for LendFlowPro CRM integration)
// ============================================
export const webhookEventTypeEnum = pgEnum("webhook_event_type", [
  "fundedDeal.created",
  "fundedDeal.updated", 
  "fundedDeal.deleted",
  "loanApplication.created",
  "loanApplication.updated",
  "loanApplication.statusChanged"
]);

export const webhookDeliveryStatusEnum = pgEnum("webhook_delivery_status", [
  "pending",
  "success",
  "failed",
  "retrying"
]);

// Webhook endpoints configuration (where to send webhooks)
export const webhookEndpoints = pgTable("webhook_endpoints", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // e.g., "LendFlowPro Production"
  targetUrl: text("target_url").notNull(),
  secret: text("secret").notNull(), // For HMAC signing
  subscribedEvents: jsonb("subscribed_events").notNull().$type<string[]>(), // Array of event types
  isActive: boolean("is_active").default(true).notNull(),
  
  createdById: varchar("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const webhookEndpointsRelations = relations(webhookEndpoints, ({ one }) => ({
  createdBy: one(users, {
    fields: [webhookEndpoints.createdById],
    references: [users.id],
  }),
}));

export type WebhookEndpoint = typeof webhookEndpoints.$inferSelect;
export type InsertWebhookEndpoint = typeof webhookEndpoints.$inferInsert;

export const insertWebhookEndpointSchema = createInsertSchema(webhookEndpoints).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Webhook events (outbox pattern - events waiting to be delivered)
export const webhookEvents = pgTable("webhook_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventType: text("event_type").notNull(),
  payload: jsonb("payload").notNull(),
  resourceId: varchar("resource_id"), // ID of the related resource (deal, application, etc.)
  
  // Processing state
  lockedAt: timestamp("locked_at"),
  lockedBy: text("locked_by"), // Worker instance ID
  processedAt: timestamp("processed_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type InsertWebhookEvent = typeof webhookEvents.$inferInsert;

export const insertWebhookEventSchema = createInsertSchema(webhookEvents).omit({
  id: true,
  createdAt: true,
  lockedAt: true,
  lockedBy: true,
  processedAt: true,
});

// Webhook delivery logs (tracking each delivery attempt)
export const webhookDeliveryLogs = pgTable("webhook_delivery_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => webhookEvents.id),
  endpointId: varchar("endpoint_id").notNull().references(() => webhookEndpoints.id),
  
  status: text("status").notNull().default("pending"), // pending, success, failed, retrying
  responseCode: integer("response_code"),
  responseBody: text("response_body"),
  errorMessage: text("error_message"),
  
  attemptCount: integer("attempt_count").default(0).notNull(),
  nextRetryAt: timestamp("next_retry_at"),
  lastAttemptAt: timestamp("last_attempt_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const webhookDeliveryLogsRelations = relations(webhookDeliveryLogs, ({ one }) => ({
  event: one(webhookEvents, {
    fields: [webhookDeliveryLogs.eventId],
    references: [webhookEvents.id],
  }),
  endpoint: one(webhookEndpoints, {
    fields: [webhookDeliveryLogs.endpointId],
    references: [webhookEndpoints.id],
  }),
}));

export type WebhookDeliveryLog = typeof webhookDeliveryLogs.$inferSelect;
export type InsertWebhookDeliveryLog = typeof webhookDeliveryLogs.$inferInsert;

export const insertWebhookDeliveryLogSchema = createInsertSchema(webhookDeliveryLogs).omit({
  id: true,
  createdAt: true,
});
