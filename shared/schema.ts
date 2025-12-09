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
export type UserRole = "borrower" | "staff" | "admin";

// User storage table for Replit Auth + local auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  username: varchar("username").unique(),
  password: varchar("password"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  phone: varchar("phone"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default("borrower").notNull(),
  staffRole: text("staff_role"), // For color-coding: account_executive, processor, underwriter, management
  emailNotificationsEnabled: boolean("email_notifications_enabled").default(true).notNull(),
  smsNotificationsEnabled: boolean("sms_notifications_enabled").default(false).notNull(),
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
  
  // Legacy broker ID field (kept for historical data, broker portal removed)
  brokerId: varchar("broker_id"),
  
  // Stripe Payment Status
  applicationFeePaid: boolean("application_fee_paid").default(false).notNull(),
  commitmentFeePaid: boolean("commitment_fee_paid").default(false).notNull(),
  appraisalFeePaid: boolean("appraisal_fee_paid").default(false).notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  applicationFeePaymentId: text("application_fee_payment_id"),
  commitmentFeePaymentId: text("commitment_fee_payment_id"),
  appraisalFeePaymentId: text("appraisal_fee_payment_id"),
  
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
  desiredClosingDate: text("desired_closing_date"),
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
  desiredClosingDate: z.string().nullable().optional(),
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

// ============================================
// ACTIVE LOANS / SERVICED LOANS SYSTEM
// ============================================

// Loan servicing type enum
export const servicedLoanTypeEnum = pgEnum("serviced_loan_type", [
  "dscr",           // DSCR - amortizing, long-term
  "fix_flip",       // Fix & Flip - interest-only, draws
  "new_construction", // New Construction - interest-only, draws
  "bridge"          // Bridge - interest-only, draws
]);
export type ServicedLoanType = "dscr" | "fix_flip" | "new_construction" | "bridge";

// Loan servicing status enum
export const servicedLoanStatusEnum = pgEnum("serviced_loan_status", [
  "current",        // On-time with payments
  "grace_period",   // Within grace period
  "late",           // Past due
  "default",        // In default
  "paid_off",       // Loan fully paid
  "foreclosure",    // In foreclosure process
  "matured"         // Term ended, awaiting payoff
]);
export type ServicedLoanStatus = "current" | "grace_period" | "late" | "default" | "paid_off" | "foreclosure" | "matured";

// Payment status enum
export const paymentStatusEnum = pgEnum("payment_status", [
  "scheduled",      // Future payment
  "pending",        // Payment initiated
  "completed",      // Payment received
  "late",           // Overdue
  "partial",        // Partial payment received
  "waived",         // Fee waived
  "reversed"        // Payment reversed
]);
export type PaymentStatus = "scheduled" | "pending" | "completed" | "late" | "partial" | "waived" | "reversed";

// Draw request status enum
export const drawStatusEnum = pgEnum("draw_status", [
  "draft",          // Not yet submitted
  "submitted",      // Submitted for review
  "inspection_scheduled", // Inspection scheduled
  "inspection_complete", // Inspection done
  "approved",       // Draw approved
  "funded",         // Funds disbursed
  "denied",         // Draw denied
  "cancelled"       // Draw cancelled
]);
export type DrawStatus = "draft" | "submitted" | "inspection_scheduled" | "inspection_complete" | "approved" | "funded" | "denied" | "cancelled";

// Serviced Loans table - expanded for DSCR and Hard Money
export const servicedLoans = pgTable("serviced_loans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  loanApplicationId: varchar("loan_application_id").references(() => loanApplications.id),
  loanNumber: varchar("loan_number").notNull().unique(),
  loanType: servicedLoanTypeEnum("loan_type").notNull(),
  
  // Property Info
  propertyAddress: text("property_address").notNull(),
  propertyCity: text("property_city"),
  propertyState: text("property_state"),
  propertyZip: text("property_zip"),
  propertyType: text("property_type"), // sfr, multi, condo, etc.
  
  // Core Loan Terms
  originalLoanAmount: integer("original_loan_amount").notNull(),
  currentBalance: integer("current_balance").notNull(),
  interestRate: text("interest_rate").notNull(), // Stored as decimal string e.g. "7.25"
  loanTermMonths: integer("loan_term_months").notNull(),
  amortizationMonths: integer("amortization_months"), // For DSCR (30yr = 360)
  isInterestOnly: boolean("is_interest_only").default(false).notNull(),
  
  // Payment Info
  monthlyPayment: integer("monthly_payment").notNull(), // P&I or I-only amount
  paymentDueDay: integer("payment_due_day").default(1).notNull(), // Day of month
  gracePeriodDays: integer("grace_period_days").default(15),
  lateFeePercent: text("late_fee_percent").default("5"), // e.g. "5" for 5%
  lateFeeFlat: integer("late_fee_flat"), // Flat late fee in cents
  
  // Current Status
  loanStatus: servicedLoanStatusEnum("loan_status").default("current").notNull(),
  nextPaymentDate: timestamp("next_payment_date"),
  nextPaymentAmount: integer("next_payment_amount"),
  lastPaymentDate: timestamp("last_payment_date"),
  lastPaymentAmount: integer("last_payment_amount"),
  paymentsDue: integer("payments_due").default(0),
  totalPastDue: integer("total_past_due").default(0),
  
  // DSCR-Specific: Escrow & Amortization
  hasEscrow: boolean("has_escrow").default(false),
  escrowBalance: integer("escrow_balance").default(0),
  monthlyEscrowAmount: integer("monthly_escrow_amount").default(0),
  annualTaxes: integer("annual_taxes"),
  annualInsurance: integer("annual_insurance"),
  annualHOA: integer("annual_hoa"),
  totalInterestPaid: integer("total_interest_paid").default(0),
  totalPrincipalPaid: integer("total_principal_paid").default(0),
  
  // Hard Money Specific: Draws & Budget
  totalRehabBudget: integer("total_rehab_budget"),
  totalDrawsApproved: integer("total_draws_approved").default(0),
  totalDrawsFunded: integer("total_draws_funded").default(0),
  remainingHoldback: integer("remaining_holdback"),
  projectCompletionPercent: integer("project_completion_percent").default(0),
  
  // Key Dates
  closingDate: timestamp("closing_date").notNull(),
  firstPaymentDate: timestamp("first_payment_date"),
  maturityDate: timestamp("maturity_date").notNull(),
  extensionDate: timestamp("extension_date"), // If extended
  
  // Payoff Info
  payoffAmount: integer("payoff_amount"),
  payoffValidUntil: timestamp("payoff_valid_until"),
  perDiemInterest: integer("per_diem_interest"),
  
  // Servicer Info
  servicerName: text("servicer_name"),
  servicerPhone: text("servicer_phone"),
  servicerEmail: text("servicer_email"),
  
  // ARV and Property Value
  purchasePrice: integer("purchase_price"),
  currentValue: integer("current_value"),
  arv: integer("arv"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const servicedLoansRelations = relations(servicedLoans, ({ one, many }) => ({
  user: one(users, {
    fields: [servicedLoans.userId],
    references: [users.id],
  }),
  loanApplication: one(loanApplications, {
    fields: [servicedLoans.loanApplicationId],
    references: [loanApplications.id],
  }),
  payments: many(loanPayments),
  draws: many(loanDraws),
  escrowItems: many(loanEscrowItems),
  loanDocuments: many(loanDocuments),
  milestones: many(loanMilestones),
  scopeOfWorkItems: many(scopeOfWorkItems),
}));

export type ServicedLoan = typeof servicedLoans.$inferSelect;
export type InsertServicedLoan = typeof servicedLoans.$inferInsert;

export const insertServicedLoanSchema = createInsertSchema(servicedLoans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================
// LOAN PAYMENTS (Payment History & Schedule)
// ============================================
export const loanPayments = pgTable("loan_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  servicedLoanId: varchar("serviced_loan_id").notNull().references(() => servicedLoans.id),
  
  // Payment Details
  paymentNumber: integer("payment_number").notNull(),
  dueDate: timestamp("due_date").notNull(),
  paidDate: timestamp("paid_date"),
  status: paymentStatusEnum("status").default("scheduled").notNull(),
  
  // Amounts
  scheduledAmount: integer("scheduled_amount").notNull(),
  paidAmount: integer("paid_amount"),
  principalAmount: integer("principal_amount").default(0),
  interestAmount: integer("interest_amount").default(0),
  escrowAmount: integer("escrow_amount").default(0),
  lateFee: integer("late_fee").default(0),
  otherFees: integer("other_fees").default(0),
  
  // Balance after payment
  balanceAfterPayment: integer("balance_after_payment"),
  
  // Payment method
  paymentMethod: text("payment_method"), // ach, wire, check
  confirmationNumber: text("confirmation_number"),
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const loanPaymentsRelations = relations(loanPayments, ({ one }) => ({
  servicedLoan: one(servicedLoans, {
    fields: [loanPayments.servicedLoanId],
    references: [servicedLoans.id],
  }),
}));

export type LoanPayment = typeof loanPayments.$inferSelect;
export type InsertLoanPayment = typeof loanPayments.$inferInsert;

export const insertLoanPaymentSchema = createInsertSchema(loanPayments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================
// LOAN DRAWS (For Hard Money / Construction)
// ============================================
export const loanDraws = pgTable("loan_draws", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  servicedLoanId: varchar("serviced_loan_id").notNull().references(() => servicedLoans.id),
  
  // Draw Details
  drawNumber: integer("draw_number").notNull(),
  status: drawStatusEnum("status").default("draft").notNull(),
  requestedAmount: integer("requested_amount").notNull(),
  approvedAmount: integer("approved_amount"),
  fundedAmount: integer("funded_amount"),
  
  // Purpose/Scope
  description: text("description"),
  workCompleted: text("work_completed"), // Description of work done
  completionPercent: integer("completion_percent"), // % of project this represents
  
  // Inspection
  inspectionDate: timestamp("inspection_date"),
  inspectorName: text("inspector_name"),
  inspectionNotes: text("inspection_notes"),
  inspectionPhotos: text("inspection_photos").array(), // URLs to photos
  
  // Timeline
  requestedDate: timestamp("requested_date").defaultNow(),
  approvedDate: timestamp("approved_date"),
  fundedDate: timestamp("funded_date"),
  deniedDate: timestamp("denied_date"),
  deniedReason: text("denied_reason"),
  
  // Running totals after this draw
  totalDisbursedAfter: integer("total_disbursed_after"),
  remainingHoldbackAfter: integer("remaining_holdback_after"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const loanDrawsRelations = relations(loanDraws, ({ one, many }) => ({
  servicedLoan: one(servicedLoans, {
    fields: [loanDraws.servicedLoanId],
    references: [servicedLoans.id],
  }),
  lineItems: many(drawLineItems),
}));

export type LoanDraw = typeof loanDraws.$inferSelect;
export type InsertLoanDraw = typeof loanDraws.$inferInsert;

export const insertLoanDrawSchema = createInsertSchema(loanDraws).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================
// LOAN ESCROW ITEMS (For DSCR Loans)
// ============================================
export const escrowItemTypeEnum = pgEnum("escrow_item_type", [
  "property_tax",
  "hazard_insurance",
  "flood_insurance",
  "hoa_dues",
  "pmi",
  "other"
]);

export const loanEscrowItems = pgTable("loan_escrow_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  servicedLoanId: varchar("serviced_loan_id").notNull().references(() => servicedLoans.id),
  
  itemType: escrowItemTypeEnum("item_type").notNull(),
  vendorName: text("vendor_name"),
  
  // Amounts
  annualAmount: integer("annual_amount").notNull(),
  monthlyAmount: integer("monthly_amount").notNull(),
  
  // Due dates
  dueDate: timestamp("due_date"),
  lastPaidDate: timestamp("last_paid_date"),
  lastPaidAmount: integer("last_paid_amount"),
  nextDueDate: timestamp("next_due_date"),
  
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const loanEscrowItemsRelations = relations(loanEscrowItems, ({ one }) => ({
  servicedLoan: one(servicedLoans, {
    fields: [loanEscrowItems.servicedLoanId],
    references: [servicedLoans.id],
  }),
}));

export type LoanEscrowItem = typeof loanEscrowItems.$inferSelect;
export type InsertLoanEscrowItem = typeof loanEscrowItems.$inferInsert;

export const insertLoanEscrowItemSchema = createInsertSchema(loanEscrowItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================
// LOAN DOCUMENTS (Servicing Documents)
// ============================================
export const loanDocumentCategoryEnum = pgEnum("loan_document_category", [
  "closing",        // Closing documents
  "payment",        // Payment receipts
  "escrow",         // Escrow statements
  "draw",           // Draw documentation
  "inspection",     // Inspection reports
  "insurance",      // Insurance documents
  "tax",            // Tax documents
  "correspondence", // Letters/notices
  "other"
]);

export const loanDocuments = pgTable("loan_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  servicedLoanId: varchar("serviced_loan_id").notNull().references(() => servicedLoans.id),
  
  documentType: text("document_type").notNull(),
  title: text("title").notNull(),
  
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const loanDocumentsRelations = relations(loanDocuments, ({ one }) => ({
  servicedLoan: one(servicedLoans, {
    fields: [loanDocuments.servicedLoanId],
    references: [servicedLoans.id],
  }),
  uploader: one(users, {
    fields: [loanDocuments.uploadedBy],
    references: [users.id],
  }),
}));

export type LoanDocument = typeof loanDocuments.$inferSelect;
export type InsertLoanDocument = typeof loanDocuments.$inferInsert;

export const insertLoanDocumentSchema = createInsertSchema(loanDocuments).omit({
  id: true,
  createdAt: true,
});

// ============================================
// LOAN MILESTONES (For Construction/Renovation)
// ============================================
export const milestoneStatusEnum = pgEnum("milestone_status", [
  "not_started",
  "in_progress",
  "completed",
  "delayed"
]);

export const loanMilestones = pgTable("loan_milestones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  servicedLoanId: varchar("serviced_loan_id").notNull().references(() => servicedLoans.id),
  
  milestoneNumber: integer("milestone_number").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: milestoneStatusEnum("status").default("not_started").notNull(),
  
  targetCompletionPercent: integer("target_completion_percent"),
  actualCompletionPercent: integer("actual_completion_percent"),
  
  targetDate: timestamp("target_date"),
  completedDate: timestamp("completed_date"),
  
  budgetAmount: integer("budget_amount"),
  actualAmount: integer("actual_amount"),
  inspectionRequired: boolean("inspection_required").default(false),
  
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const loanMilestonesRelations = relations(loanMilestones, ({ one }) => ({
  servicedLoan: one(servicedLoans, {
    fields: [loanMilestones.servicedLoanId],
    references: [servicedLoans.id],
  }),
}));

export type LoanMilestone = typeof loanMilestones.$inferSelect;
export type InsertLoanMilestone = typeof loanMilestones.$inferInsert;

export const insertLoanMilestoneSchema = createInsertSchema(loanMilestones).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================
// SCOPE OF WORK (For Construction/Rehab Draws)
// ============================================

// Scope of work category enum
export const scopeOfWorkCategoryEnum = pgEnum("scope_of_work_category", [
  "soft_costs",
  "demo_foundation",
  "hvac_plumbing_electrical",
  "interior",
  "exterior"
]);
export type ScopeOfWorkCategory = "soft_costs" | "demo_foundation" | "hvac_plumbing_electrical" | "interior" | "exterior";

// Scope of work items table - tracks individual budget line items
export const scopeOfWorkItems = pgTable("scope_of_work_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  servicedLoanId: varchar("serviced_loan_id").notNull().references(() => servicedLoans.id),
  
  category: scopeOfWorkCategoryEnum("category").notNull(),
  itemName: text("item_name").notNull(),
  details: text("details"),
  sortOrder: integer("sort_order").default(0).notNull(),
  
  // Budget
  budgetAmount: integer("budget_amount").default(0).notNull(),
  
  // Notes
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const scopeOfWorkItemsRelations = relations(scopeOfWorkItems, ({ one, many }) => ({
  servicedLoan: one(servicedLoans, {
    fields: [scopeOfWorkItems.servicedLoanId],
    references: [servicedLoans.id],
  }),
  drawLineItems: many(drawLineItems),
}));

export type ScopeOfWorkItem = typeof scopeOfWorkItems.$inferSelect;
export type InsertScopeOfWorkItem = typeof scopeOfWorkItems.$inferInsert;

export const insertScopeOfWorkItemSchema = createInsertSchema(scopeOfWorkItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Draw line items - tracks amounts per scope item per draw
export const drawLineItems = pgTable("draw_line_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  loanDrawId: varchar("loan_draw_id").notNull().references(() => loanDraws.id),
  scopeOfWorkItemId: varchar("scope_of_work_item_id").notNull().references(() => scopeOfWorkItems.id),
  
  // Amounts
  requestedAmount: integer("requested_amount").default(0).notNull(),
  approvedAmount: integer("approved_amount"),
  fundedAmount: integer("funded_amount"),
  
  // Notes for this specific line item in this draw
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const drawLineItemsRelations = relations(drawLineItems, ({ one }) => ({
  loanDraw: one(loanDraws, {
    fields: [drawLineItems.loanDrawId],
    references: [loanDraws.id],
  }),
  scopeOfWorkItem: one(scopeOfWorkItems, {
    fields: [drawLineItems.scopeOfWorkItemId],
    references: [scopeOfWorkItems.id],
  }),
}));

export type DrawLineItem = typeof drawLineItems.$inferSelect;
export type InsertDrawLineItem = typeof drawLineItems.$inferInsert;

export const insertDrawLineItemSchema = createInsertSchema(drawLineItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Default scope of work items template
export const DEFAULT_SCOPE_OF_WORK_ITEMS: { category: ScopeOfWorkCategory; itemName: string; sortOrder: number }[] = [
  // Soft Costs
  { category: "soft_costs", itemName: "Permits", sortOrder: 1 },
  { category: "soft_costs", itemName: "Architectural", sortOrder: 2 },
  { category: "soft_costs", itemName: "Engineering", sortOrder: 3 },
  { category: "soft_costs", itemName: "Legal", sortOrder: 4 },
  { category: "soft_costs", itemName: "Other - Soft Costs", sortOrder: 5 },
  
  // Demo, Foundation
  { category: "demo_foundation", itemName: "Demolition", sortOrder: 10 },
  { category: "demo_foundation", itemName: "Foundation", sortOrder: 11 },
  { category: "demo_foundation", itemName: "Other - Demo/Foundation", sortOrder: 12 },
  
  // HVAC, Plumbing, Electrical
  { category: "hvac_plumbing_electrical", itemName: "HVAC Rough", sortOrder: 20 },
  { category: "hvac_plumbing_electrical", itemName: "HVAC Trim Out", sortOrder: 21 },
  { category: "hvac_plumbing_electrical", itemName: "HVAC Service/Repair", sortOrder: 22 },
  { category: "hvac_plumbing_electrical", itemName: "Electrical Service", sortOrder: 23 },
  { category: "hvac_plumbing_electrical", itemName: "Electrical Rough", sortOrder: 24 },
  { category: "hvac_plumbing_electrical", itemName: "Electrical Final/Fixtures", sortOrder: 25 },
  { category: "hvac_plumbing_electrical", itemName: "Plumbing Rough", sortOrder: 26 },
  { category: "hvac_plumbing_electrical", itemName: "Plumbing Top Out", sortOrder: 27 },
  { category: "hvac_plumbing_electrical", itemName: "Plumbing Final/Fixtures", sortOrder: 28 },
  { category: "hvac_plumbing_electrical", itemName: "Other - MEP", sortOrder: 29 },
  
  // Interior
  { category: "interior", itemName: "Windows", sortOrder: 40 },
  { category: "interior", itemName: "Interior Doors", sortOrder: 41 },
  { category: "interior", itemName: "Interior Trim", sortOrder: 42 },
  { category: "interior", itemName: "Insulation", sortOrder: 43 },
  { category: "interior", itemName: "Drywall", sortOrder: 44 },
  { category: "interior", itemName: "Interior Paint", sortOrder: 45 },
  { category: "interior", itemName: "Tile Flooring", sortOrder: 46 },
  { category: "interior", itemName: "Carpet", sortOrder: 47 },
  { category: "interior", itemName: "Wood Flooring", sortOrder: 48 },
  { category: "interior", itemName: "Kitchen Countertops", sortOrder: 49 },
  { category: "interior", itemName: "Kitchen Cabinets", sortOrder: 50 },
  { category: "interior", itemName: "Backsplash", sortOrder: 51 },
  { category: "interior", itemName: "Appliances", sortOrder: 52 },
  { category: "interior", itemName: "Other - Kitchen", sortOrder: 53 },
  { category: "interior", itemName: "Bathroom Cabinets", sortOrder: 54 },
  { category: "interior", itemName: "Bathroom Vanity Tops", sortOrder: 55 },
  { category: "interior", itemName: "Showers Tile", sortOrder: 56 },
  { category: "interior", itemName: "Tubs", sortOrder: 57 },
  { category: "interior", itemName: "Door and Cabinet Handles", sortOrder: 58 },
  { category: "interior", itemName: "Mirrors", sortOrder: 59 },
  { category: "interior", itemName: "Shower Glass", sortOrder: 60 },
  { category: "interior", itemName: "Fireplace", sortOrder: 61 },
  { category: "interior", itemName: "Other - Interior", sortOrder: 62 },
  
  // Exterior
  { category: "exterior", itemName: "Masonry/Stucco", sortOrder: 70 },
  { category: "exterior", itemName: "Roofing", sortOrder: 71 },
  { category: "exterior", itemName: "Framing", sortOrder: 72 },
  { category: "exterior", itemName: "Siding", sortOrder: 73 },
  { category: "exterior", itemName: "Exterior Paint", sortOrder: 74 },
  { category: "exterior", itemName: "Exterior Doors", sortOrder: 75 },
  { category: "exterior", itemName: "Garage Doors", sortOrder: 76 },
  { category: "exterior", itemName: "Driveway/Flatwork", sortOrder: 77 },
  { category: "exterior", itemName: "Pressure Wash", sortOrder: 78 },
  { category: "exterior", itemName: "Landscaping", sortOrder: 79 },
  { category: "exterior", itemName: "Decks/Patio", sortOrder: 80 },
  { category: "exterior", itemName: "Rain Gutters", sortOrder: 81 },
  { category: "exterior", itemName: "Sprinkler System", sortOrder: 82 },
  { category: "exterior", itemName: "Fencing", sortOrder: 83 },
  { category: "exterior", itemName: "Rough Clean", sortOrder: 84 },
  { category: "exterior", itemName: "Final Clean", sortOrder: 85 },
  { category: "exterior", itemName: "Other - Exterior", sortOrder: 86 },
];

// Helper to get category display name
export const SCOPE_OF_WORK_CATEGORY_NAMES: Record<ScopeOfWorkCategory, string> = {
  soft_costs: "Soft Costs",
  demo_foundation: "Demo, Foundation",
  hvac_plumbing_electrical: "HVAC, Plumbing, Electrical",
  interior: "Interior",
  exterior: "Exterior",
};

// ============================================
// HELPER FUNCTIONS FOR LOAN CALCULATIONS
// ============================================

// Calculate amortization schedule for DSCR loans
export interface AmortizationRow {
  paymentNumber: number;
  paymentDate: Date;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
}

export function calculateAmortizationSchedule(
  principal: number,
  annualRate: number,
  termMonths: number,
  startDate: Date
): AmortizationRow[] {
  const monthlyRate = annualRate / 100 / 12;
  const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
  
  const schedule: AmortizationRow[] = [];
  let balance = principal;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;
  
  for (let i = 1; i <= termMonths; i++) {
    const interest = balance * monthlyRate;
    const principalPart = monthlyPayment - interest;
    balance = Math.max(0, balance - principalPart);
    cumulativeInterest += interest;
    cumulativePrincipal += principalPart;
    
    const paymentDate = new Date(startDate);
    paymentDate.setMonth(paymentDate.getMonth() + i - 1);
    
    schedule.push({
      paymentNumber: i,
      paymentDate,
      payment: Math.round(monthlyPayment),
      principal: Math.round(principalPart),
      interest: Math.round(interest),
      balance: Math.round(balance),
      cumulativeInterest: Math.round(cumulativeInterest),
      cumulativePrincipal: Math.round(cumulativePrincipal),
    });
  }
  
  return schedule;
}

// Calculate interest-only payment for hard money loans
export function calculateInterestOnlyPayment(principal: number, annualRate: number): number {
  return Math.round(principal * (annualRate / 100 / 12));
}

// Calculate payoff amount
export function calculatePayoffAmount(
  currentBalance: number,
  perDiemInterest: number,
  daysUntilPayoff: number,
  outstandingFees: number = 0
): number {
  return currentBalance + (perDiemInterest * daysUntilPayoff) + outstandingFees;
}

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
// SIGNATURE REQUESTS (E-Signature Workflow)
// ============================================
export const signatureRequestStatusEnum = pgEnum("signature_request_status", [
  "pending",
  "viewed",
  "signed",
  "declined",
  "expired"
]);
export type SignatureRequestStatus = "pending" | "viewed" | "signed" | "declined" | "expired";

export const signatureRequests = pgTable("signature_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  loanApplicationId: varchar("loan_application_id").notNull().references(() => loanApplications.id),
  documentId: varchar("document_id").notNull().references(() => documents.id),
  requestedByUserId: varchar("requested_by_user_id").notNull().references(() => users.id),
  signerUserId: varchar("signer_user_id").references(() => users.id),
  signerEmail: text("signer_email").notNull(),
  signerName: text("signer_name").notNull(),
  status: signatureRequestStatusEnum("status").default("pending").notNull(),
  accessToken: varchar("access_token").notNull().unique(),
  signatureType: text("signature_type"),
  signatureImageUrl: text("signature_image_url"),
  declineReason: text("decline_reason"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  viewedAt: timestamp("viewed_at"),
  signedAt: timestamp("signed_at"),
  declinedAt: timestamp("declined_at"),
  expiresAt: timestamp("expires_at").notNull(),
});

export const signatureRequestsRelations = relations(signatureRequests, ({ one }) => ({
  loanApplication: one(loanApplications, {
    fields: [signatureRequests.loanApplicationId],
    references: [loanApplications.id],
  }),
  document: one(documents, {
    fields: [signatureRequests.documentId],
    references: [documents.id],
  }),
  requestedBy: one(users, {
    fields: [signatureRequests.requestedByUserId],
    references: [users.id],
    relationName: "requestedBy",
  }),
  signer: one(users, {
    fields: [signatureRequests.signerUserId],
    references: [users.id],
    relationName: "signer",
  }),
}));

export type SignatureRequest = typeof signatureRequests.$inferSelect;
export type InsertSignatureRequest = typeof signatureRequests.$inferInsert;

export const insertSignatureRequestSchema = createInsertSchema(signatureRequests).omit({
  id: true,
  requestedAt: true,
  viewedAt: true,
  signedAt: true,
  declinedAt: true,
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
  staffRole: text("staff_role"), // For color-coding: account_executive, processor, underwriter, management
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
  "loan_closed",
  "payment_received"
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

// Loan subtypes for categorization from LendFlowPro API
// DSCR subtypes: Long-term Rental, Short-term Rental, DSCR No Ratio, Portfolio
// Bridge subtypes: Bridge to Sale, Bridge to Rent, Fix & Flip
// Construction subtypes: Ground Up, Heavy Rehab, ADU/Conversion
export const loanSubtypeMap = {
  "DSCR": ["Long-term Rental", "Short-term Rental", "DSCR No Ratio", "Portfolio", "Mixed Use"],
  "Fix & Flip": ["Bridge to Sale", "Bridge to Rent", "Fix & Flip", "Light Rehab", "Heavy Rehab"],
  "New Construction": ["Ground Up", "ADU/Conversion", "Spec Build", "Pre-Sold"],
} as const;

export const fundedDeals = pgTable("funded_deals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Property Info
  location: text("location").notNull(), // City name
  state: varchar("state", { length: 2 }).notNull(), // State abbreviation
  propertyType: text("property_type").notNull(), // Single Family, Duplex, etc.
  
  // Loan Details
  loanType: text("loan_type").notNull(), // DSCR, Fix & Flip, New Construction
  loanSubtype: text("loan_subtype"), // Subtype from LendFlowPro (e.g., "Long-term Rental", "Bridge to Sale")
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
}).extend({
  secret: z.string().optional(),
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

// ============================================
// STAFF ROLES FOR COLOR-CODING
// ============================================
export const staffRoleEnum = pgEnum("staff_role", [
  "account_executive",
  "processor", 
  "underwriter",
  "management"
]);

export type StaffRole = "account_executive" | "processor" | "underwriter" | "management";

// Staff role colors for UI
export const STAFF_ROLE_COLORS: Record<StaffRole, { bg: string; text: string; label: string }> = {
  account_executive: { bg: "bg-blue-100 dark:bg-blue-900", text: "text-blue-700 dark:text-blue-300", label: "Account Executive" },
  processor: { bg: "bg-emerald-100 dark:bg-emerald-900", text: "text-emerald-700 dark:text-emerald-300", label: "Processor" },
  underwriter: { bg: "bg-amber-100 dark:bg-amber-900", text: "text-amber-700 dark:text-amber-300", label: "Underwriter" },
  management: { bg: "bg-purple-100 dark:bg-purple-900", text: "text-purple-700 dark:text-purple-300", label: "Management" },
};

// ============================================
// DOCUMENT REVIEWS (Approval/Rejection History)
// ============================================
export const documentReviewActionEnum = pgEnum("document_review_action", [
  "approved",
  "rejected", 
  "request_changes",
  "under_review"
]);

export const documentReviews = pgTable("document_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull().references(() => documents.id),
  reviewerId: varchar("reviewer_id").notNull().references(() => users.id),
  action: documentReviewActionEnum("action").notNull(),
  staffRole: staffRoleEnum("staff_role"),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const documentReviewsRelations = relations(documentReviews, ({ one, many }) => ({
  document: one(documents, {
    fields: [documentReviews.documentId],
    references: [documents.id],
  }),
  reviewer: one(users, {
    fields: [documentReviews.reviewerId],
    references: [users.id],
  }),
  attachments: many(commentAttachments),
}));

export type DocumentReview = typeof documentReviews.$inferSelect;
export type InsertDocumentReview = typeof documentReviews.$inferInsert;

export const insertDocumentReviewSchema = createInsertSchema(documentReviews).omit({
  id: true,
  createdAt: true,
});

// ============================================
// COMMENT ATTACHMENTS (Images in Comments)
// ============================================
export const commentAttachments = pgTable("comment_attachments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  // Can be attached to either a document comment or a document review
  documentCommentId: varchar("document_comment_id").references(() => documentComments.id),
  documentReviewId: varchar("document_review_id").references(() => documentReviews.id),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type").notNull(),
  uploadedById: varchar("uploaded_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const commentAttachmentsRelations = relations(commentAttachments, ({ one }) => ({
  documentComment: one(documentComments, {
    fields: [commentAttachments.documentCommentId],
    references: [documentComments.id],
  }),
  documentReview: one(documentReviews, {
    fields: [commentAttachments.documentReviewId],
    references: [documentReviews.id],
  }),
  uploadedBy: one(users, {
    fields: [commentAttachments.uploadedById],
    references: [users.id],
  }),
}));

export type CommentAttachment = typeof commentAttachments.$inferSelect;
export type InsertCommentAttachment = typeof commentAttachments.$inferInsert;

export const insertCommentAttachmentSchema = createInsertSchema(commentAttachments).omit({
  id: true,
  createdAt: true,
});

// ============================================
// NOTIFICATION QUEUE (For Batched Notifications)
// ============================================
export const notificationQueueStatusEnum = pgEnum("notification_queue_status", [
  "pending",
  "sent",
  "failed"
]);

export const notificationQueue = pgTable("notification_queue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  recipientId: varchar("recipient_id").notNull().references(() => users.id),
  recipientEmail: text("recipient_email"),
  notificationType: notificationTypeEnum("notification_type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  linkUrl: text("link_url"),
  relatedApplicationId: varchar("related_application_id").references(() => loanApplications.id),
  relatedDocumentId: varchar("related_document_id").references(() => documents.id),
  
  // Batching control
  batchKey: text("batch_key"), // e.g., "document_upload:app123" to group related notifications
  sendAfter: timestamp("send_after").notNull(), // When this notification should be sent (for 30-min batching)
  status: notificationQueueStatusEnum("status").default("pending").notNull(),
  sentAt: timestamp("sent_at"),
  errorMessage: text("error_message"),
  
  // Metadata for the notification
  metadata: jsonb("metadata"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_notification_queue_status_send_after").on(table.status, table.sendAfter),
  index("idx_notification_queue_recipient").on(table.recipientId),
  index("idx_notification_queue_batch").on(table.batchKey),
]);

export const notificationQueueRelations = relations(notificationQueue, ({ one }) => ({
  recipient: one(users, {
    fields: [notificationQueue.recipientId],
    references: [users.id],
  }),
  application: one(loanApplications, {
    fields: [notificationQueue.relatedApplicationId],
    references: [loanApplications.id],
  }),
  document: one(documents, {
    fields: [notificationQueue.relatedDocumentId],
    references: [documents.id],
  }),
}));

export type NotificationQueueItem = typeof notificationQueue.$inferSelect;
export type InsertNotificationQueueItem = typeof notificationQueue.$inferInsert;

export const insertNotificationQueueItemSchema = createInsertSchema(notificationQueue).omit({
  id: true,
  createdAt: true,
  sentAt: true,
});

// ============================================
// EXTENDED DOCUMENT COMMENTS (with staff role)
// ============================================
// Note: Adding staffRole to track which role made the comment for color-coding
// The existing documentComments table will be extended via migration

// ============================================
// WHITE-LABEL SETTINGS (Demo Mode Branding)
// ============================================
export const whiteLabelSettings = pgTable("white_label_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyName: text("company_name").notNull(),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").notNull(), // Hex color e.g. "#D4A01D"
  secondaryColor: text("secondary_color"), // Hex color
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  contactAddress: text("contact_address"),
  footerText: text("footer_text"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type WhiteLabelSettings = typeof whiteLabelSettings.$inferSelect;
export type InsertWhiteLabelSettings = typeof whiteLabelSettings.$inferInsert;

export const insertWhiteLabelSettingsSchema = createInsertSchema(whiteLabelSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Default Sequel Investments branding
export const DEFAULT_WHITE_LABEL_SETTINGS: Omit<InsertWhiteLabelSettings, 'id'> = {
  companyName: "SEQUEL INVESTMENTS",
  logoUrl: null,
  primaryColor: "#D4A01D",
  secondaryColor: "#1a1a1a",
  contactPhone: "302.388.8860",
  contactEmail: "josh@fundwithsequel.com",
  contactAddress: "800 5th Avenue, Suite 4100, Miami Beach, FL 33139",
  footerText: null,
  isActive: false,
};

// ============================================
// EMAIL LOGS (For tracking sent emails)
// ============================================
export const emailStatusEnum = pgEnum("email_status", [
  "sent",
  "failed",
  "demo"
]);

export const emailTypeEnum = pgEnum("email_type", [
  "application_submitted",
  "status_change",
  "document_request",
  "draw_approved",
  "payment_reminder",
  "payoff_statement"
]);

export const emailLogs = pgTable("email_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  recipientEmail: text("recipient_email").notNull(),
  recipientUserId: varchar("recipient_user_id").references(() => users.id),
  subject: text("subject").notNull(),
  emailType: emailTypeEnum("email_type").notNull(),
  status: emailStatusEnum("status").notNull(),
  errorMessage: text("error_message"),
  relatedApplicationId: varchar("related_application_id").references(() => loanApplications.id),
  relatedLoanId: varchar("related_loan_id").references(() => servicedLoans.id),
  metadata: jsonb("metadata"),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
}, (table) => [
  index("idx_email_logs_recipient").on(table.recipientEmail),
  index("idx_email_logs_sent_at").on(table.sentAt),
]);

export const emailLogsRelations = relations(emailLogs, ({ one }) => ({
  recipient: one(users, {
    fields: [emailLogs.recipientUserId],
    references: [users.id],
  }),
  application: one(loanApplications, {
    fields: [emailLogs.relatedApplicationId],
    references: [loanApplications.id],
  }),
  loan: one(servicedLoans, {
    fields: [emailLogs.relatedLoanId],
    references: [servicedLoans.id],
  }),
}));

export type EmailLog = typeof emailLogs.$inferSelect;
export type InsertEmailLog = typeof emailLogs.$inferInsert;

export const insertEmailLogSchema = createInsertSchema(emailLogs).omit({
  id: true,
  sentAt: true,
});

// ============================================
// SMS LOGS (For tracking sent SMS messages)
// ============================================
export const smsStatusEnum = pgEnum("sms_status", [
  "sent",
  "failed",
  "demo"
]);

export const smsTypeEnum = pgEnum("sms_type", [
  "application_submitted",
  "status_change",
  "document_request",
  "draw_approved",
  "payment_reminder",
  "approval_notification"
]);

export const smsLogs = pgTable("sms_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  recipientPhone: text("recipient_phone").notNull(),
  recipientUserId: varchar("recipient_user_id").references(() => users.id),
  message: text("message").notNull(),
  smsType: smsTypeEnum("sms_type").notNull(),
  status: smsStatusEnum("status").notNull(),
  errorMessage: text("error_message"),
  relatedApplicationId: varchar("related_application_id").references(() => loanApplications.id),
  relatedLoanId: varchar("related_loan_id").references(() => servicedLoans.id),
  metadata: jsonb("metadata"),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
}, (table) => [
  index("idx_sms_logs_recipient").on(table.recipientPhone),
  index("idx_sms_logs_sent_at").on(table.sentAt),
]);

export const smsLogsRelations = relations(smsLogs, ({ one }) => ({
  recipient: one(users, {
    fields: [smsLogs.recipientUserId],
    references: [users.id],
  }),
  application: one(loanApplications, {
    fields: [smsLogs.relatedApplicationId],
    references: [loanApplications.id],
  }),
  loan: one(servicedLoans, {
    fields: [smsLogs.relatedLoanId],
    references: [servicedLoans.id],
  }),
}));

export type SmsLog = typeof smsLogs.$inferSelect;
export type InsertSmsLog = typeof smsLogs.$inferInsert;

export const insertSmsLogSchema = createInsertSchema(smsLogs).omit({
  id: true,
  sentAt: true,
});

// ============================================
// APPOINTMENTS (Calendar Booking System)
// ============================================
export const appointmentStatusEnum = pgEnum("appointment_status", [
  "scheduled",
  "completed",
  "cancelled",
  "no_show"
]);
export type AppointmentStatus = "scheduled" | "completed" | "cancelled" | "no_show";

export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  borrowerUserId: varchar("borrower_user_id").notNull().references(() => users.id),
  staffUserId: varchar("staff_user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  scheduledAt: timestamp("scheduled_at").notNull(),
  durationMinutes: integer("duration_minutes").default(30).notNull(),
  status: appointmentStatusEnum("status").default("scheduled").notNull(),
  meetingUrl: text("meeting_url"),
  relatedApplicationId: varchar("related_application_id").references(() => loanApplications.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_appointments_borrower").on(table.borrowerUserId),
  index("idx_appointments_staff").on(table.staffUserId),
  index("idx_appointments_scheduled").on(table.scheduledAt),
]);

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  borrower: one(users, {
    fields: [appointments.borrowerUserId],
    references: [users.id],
    relationName: "borrowerAppointments",
  }),
  staff: one(users, {
    fields: [appointments.staffUserId],
    references: [users.id],
    relationName: "staffAppointments",
  }),
  application: one(loanApplications, {
    fields: [appointments.relatedApplicationId],
    references: [loanApplications.id],
  }),
}));

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================
// STAFF AVAILABILITY (For Scheduling)
// ============================================
export const staffAvailability = pgTable("staff_availability", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  staffUserId: varchar("staff_user_id").notNull().references(() => users.id),
  dayOfWeek: integer("day_of_week").notNull(), // 0 = Sunday, 6 = Saturday
  startTime: text("start_time").notNull(), // e.g., "09:00"
  endTime: text("end_time").notNull(), // e.g., "17:00"
  isAvailable: boolean("is_available").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_staff_availability_user").on(table.staffUserId),
  index("idx_staff_availability_day").on(table.dayOfWeek),
]);

export const staffAvailabilityRelations = relations(staffAvailability, ({ one }) => ({
  staff: one(users, {
    fields: [staffAvailability.staffUserId],
    references: [users.id],
  }),
}));

export type StaffAvailability = typeof staffAvailability.$inferSelect;
export type InsertStaffAvailability = typeof staffAvailability.$inferInsert;

export const insertStaffAvailabilitySchema = createInsertSchema(staffAvailability).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Default business hours for staff (Mon-Fri 9AM-5PM)
export const DEFAULT_BUSINESS_HOURS = [
  { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", isAvailable: true }, // Monday
  { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", isAvailable: true }, // Tuesday
  { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", isAvailable: true }, // Wednesday
  { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", isAvailable: true }, // Thursday
  { dayOfWeek: 5, startTime: "09:00", endTime: "17:00", isAvailable: true }, // Friday
  { dayOfWeek: 0, startTime: "09:00", endTime: "17:00", isAvailable: false }, // Sunday
  { dayOfWeek: 6, startTime: "09:00", endTime: "17:00", isAvailable: false }, // Saturday
];

// ============================================
// PHOTO VERIFICATION SYSTEM (Pruvan-style)
// ============================================

// Photo verification status enum
export const photoVerificationStatusEnum = pgEnum("photo_verification_status", [
  "pending",           // Just uploaded, not verified yet
  "verified",          // GPS + timestamp verified
  "outside_geofence",  // Photo taken outside property location
  "stale_timestamp",   // Photo is too old (>24 hours)
  "metadata_missing",  // No EXIF GPS/timestamp data
  "manual_approved",   // Staff manually approved despite issues
  "manual_rejected"    // Staff manually rejected
]);
export type PhotoVerificationStatus = "pending" | "verified" | "outside_geofence" | "stale_timestamp" | "metadata_missing" | "manual_approved" | "manual_rejected";

// Property locations table - stores geocoded lat/lng for job sites
export const propertyLocations = pgTable("property_locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  servicedLoanId: varchar("serviced_loan_id").notNull().references(() => servicedLoans.id).unique(),
  
  // Geocoded coordinates
  latitude: text("latitude").notNull(),  // Stored as string for precision
  longitude: text("longitude").notNull(),
  
  // Geofence settings
  geofenceRadiusMeters: integer("geofence_radius_meters").default(100).notNull(), // Default 100m radius
  
  // Address used for geocoding (for reference)
  geocodedAddress: text("geocoded_address"),
  geocodedAt: timestamp("geocoded_at"),
  geocodeSource: text("geocode_source"), // "google", "mapbox", etc.
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_property_locations_loan").on(table.servicedLoanId),
]);

export const propertyLocationsRelations = relations(propertyLocations, ({ one }) => ({
  servicedLoan: one(servicedLoans, {
    fields: [propertyLocations.servicedLoanId],
    references: [servicedLoans.id],
  }),
}));

export type PropertyLocation = typeof propertyLocations.$inferSelect;
export type InsertPropertyLocation = typeof propertyLocations.$inferInsert;

export const insertPropertyLocationSchema = createInsertSchema(propertyLocations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Draw photos table - stores photos with EXIF data and verification status
export const drawPhotos = pgTable("draw_photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  loanDrawId: varchar("loan_draw_id").notNull().references(() => loanDraws.id),
  scopeOfWorkItemId: varchar("scope_of_work_item_id").references(() => scopeOfWorkItems.id),
  uploadedByUserId: varchar("uploaded_by_user_id").notNull().references(() => users.id),
  
  // File storage
  fileKey: text("file_key").notNull(), // Key in object storage / file path
  fileName: text("file_name").notNull(),
  fileSizeBytes: integer("file_size_bytes"),
  mimeType: text("mime_type"),
  
  // EXIF metadata extracted from photo
  exifLatitude: text("exif_latitude"),
  exifLongitude: text("exif_longitude"),
  exifTimestamp: timestamp("exif_timestamp"),
  exifCameraModel: text("exif_camera_model"),
  exifOrientation: integer("exif_orientation"),
  
  // Browser-reported location (for comparison/fallback)
  browserLatitude: text("browser_latitude"),
  browserLongitude: text("browser_longitude"),
  
  // Verification results
  verificationStatus: photoVerificationStatusEnum("verification_status").default("pending").notNull(),
  distanceFromPropertyMeters: integer("distance_from_property_meters"),
  verificationDetails: text("verification_details"), // JSON with detailed verification info
  verifiedAt: timestamp("verified_at"),
  
  // Photo caption/notes from borrower
  caption: text("caption"),
  
  // Sort order within the draw
  sortOrder: integer("sort_order").default(0),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_draw_photos_draw").on(table.loanDrawId),
  index("idx_draw_photos_scope_item").on(table.scopeOfWorkItemId),
  index("idx_draw_photos_status").on(table.verificationStatus),
]);

export const drawPhotosRelations = relations(drawPhotos, ({ one, many }) => ({
  loanDraw: one(loanDraws, {
    fields: [drawPhotos.loanDrawId],
    references: [loanDraws.id],
  }),
  scopeOfWorkItem: one(scopeOfWorkItems, {
    fields: [drawPhotos.scopeOfWorkItemId],
    references: [scopeOfWorkItems.id],
  }),
  uploadedBy: one(users, {
    fields: [drawPhotos.uploadedByUserId],
    references: [users.id],
  }),
  audits: many(photoVerificationAudits),
}));

export type DrawPhoto = typeof drawPhotos.$inferSelect;
export type InsertDrawPhoto = typeof drawPhotos.$inferInsert;

export const insertDrawPhotoSchema = createInsertSchema(drawPhotos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Photo verification audit trail - tracks manual overrides and reviews
export const photoVerificationAudits = pgTable("photo_verification_audits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  drawPhotoId: varchar("draw_photo_id").notNull().references(() => drawPhotos.id),
  performedByUserId: varchar("performed_by_user_id").notNull().references(() => users.id),
  
  // What changed
  previousStatus: photoVerificationStatusEnum("previous_status").notNull(),
  newStatus: photoVerificationStatusEnum("new_status").notNull(),
  
  // Why it was changed
  reason: text("reason"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_photo_audits_photo").on(table.drawPhotoId),
  index("idx_photo_audits_user").on(table.performedByUserId),
]);

export const photoVerificationAuditsRelations = relations(photoVerificationAudits, ({ one }) => ({
  drawPhoto: one(drawPhotos, {
    fields: [photoVerificationAudits.drawPhotoId],
    references: [drawPhotos.id],
  }),
  performedBy: one(users, {
    fields: [photoVerificationAudits.performedByUserId],
    references: [users.id],
  }),
}));

export type PhotoVerificationAudit = typeof photoVerificationAudits.$inferSelect;
export type InsertPhotoVerificationAudit = typeof photoVerificationAudits.$inferInsert;

export const insertPhotoVerificationAuditSchema = createInsertSchema(photoVerificationAudits).omit({
  id: true,
  createdAt: true,
});

// Helper constants for photo verification
export const PHOTO_VERIFICATION_CONFIG = {
  DEFAULT_GEOFENCE_RADIUS_METERS: 100, // 100 meter radius around property
  MAX_PHOTO_AGE_HOURS: 72, // Photos must be taken within 72 hours
  MIN_PHOTOS_PER_DRAW: 1, // Minimum photos required per draw request
  MAX_PHOTO_SIZE_MB: 10, // Maximum file size
  ALLOWED_MIME_TYPES: ["image/jpeg", "image/png", "image/heic", "image/heif"],
};
