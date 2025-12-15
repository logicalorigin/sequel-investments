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
export const loanApplicationStatusEnum = pgEnum("loan_application_status", ["draft", "submitted", "in_review", "revisions_requested", "approved", "funded", "denied", "withdrawn"]);

// Processing stage enum (for progress stepper)
export const processingStageEnum = pgEnum("processing_stage", [
  "app_submitted",
  "account_review",
  "underwriting", 
  "term_sheet",
  "processing",
  "docs_out",
  "closed"
]);

// Revision request section enum
export const revisionSectionEnum = pgEnum("revision_section", [
  "property_info",
  "financials",
  "documents",
  "borrower_info",
  "entity_info",
  "loan_terms",
  "other"
]);

// Revision request status enum
export const revisionStatusEnum = pgEnum("revision_status", ["pending", "resolved", "cancelled"]);

// Product variant enum (for DSCR loan types)
export const productVariantEnum = pgEnum("product_variant", [
  "purchase",
  "cash_out",
  "rate_term"
]);
export type ProductVariant = "purchase" | "cash_out" | "rate_term";

// Loan product status enum
export const loanProductStatusEnum = pgEnum("loan_product_status", [
  "active",
  "inactive",
  "coming_soon"
]);
export type LoanProductStatus = "active" | "inactive" | "coming_soon";

// Loan Products table - dynamic loan product configuration
export const loanProducts = pgTable("loan_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Basic Info
  slug: varchar("slug").notNull().unique(), // "dscr", "fix-flip", "construction"
  name: text("name").notNull(), // "DSCR Loans"
  shortName: text("short_name").notNull(), // "DSCR"
  subtitle: text("subtitle"), // "Rental Loan"
  description: text("description"), // Short description
  detailedDescription: text("detailed_description"), // Longer description for product pages
  
  // Display
  icon: text("icon").default("Building2"), // Lucide icon name
  primaryColor: text("primary_color").default("#D4A01D"), // Brand color for this product
  cardImageUrl: text("card_image_url"), // Image for product cards
  heroImageUrl: text("hero_image_url"), // Image for product detail page hero
  
  // Core Terms - Loan Amounts
  minLoanAmount: integer("min_loan_amount"),
  maxLoanAmount: integer("max_loan_amount"),
  
  // Core Terms - Rates
  minRate: text("min_rate"), // "5.75"
  maxRate: text("max_rate"), // "11.99"
  
  // Core Terms - LTV/LTC
  maxLTV: integer("max_ltv"), // 80
  maxLTC: integer("max_ltc"), // 92
  maxLTARV: integer("max_lt_arv"), // Loan-to-ARV for fix & flip
  
  // Core Terms - Borrower Requirements
  minCreditScore: integer("min_credit_score"),
  minDSCR: text("min_dscr"), // "0.75" or null if no minimum
  experienceRequired: boolean("experience_required").default(false),
  
  // Term Options
  termOptions: text("term_options").array(), // ["12", "24", "360"] in months
  defaultTermMonths: integer("default_term_months"),
  isInterestOnlyAvailable: boolean("is_interest_only_available").default(false),
  amortizationMonths: integer("amortization_months"), // 360 for 30-year DSCR
  
  // Features (bullet points for marketing)
  features: jsonb("features").$type<string[]>(),
  
  // Mobile-specific display
  mobileDescription: text("mobile_description"),
  mobileRate: text("mobile_rate"), // "From 5.75% • 30-Year Fixed"
  mobileStats: jsonb("mobile_stats").$type<Array<{ label: string; value: string }>>(),
  
  // Desktop stats display
  stats: jsonb("stats").$type<Array<{ label: string; value: string }>>(),
  
  // Status & Ordering
  status: loanProductStatusEnum("status").default("active").notNull(),
  sortOrder: integer("sort_order").default(0),
  
  // Visibility Controls
  showInQuoteFlow: boolean("show_in_quote_flow").default(true),
  showInNavigation: boolean("show_in_navigation").default(true),
  showInProductsSection: boolean("show_in_products_section").default(true),
  showInCalculators: boolean("show_in_calculators").default(true),
  
  // Links
  detailPageUrl: text("detail_page_url"), // "/dscr-loans"
  
  // Product Variants (for products like DSCR with Purchase/Cash-Out/Rate-Term)
  hasVariants: boolean("has_variants").default(false),
  variants: jsonb("variants").$type<Array<{
    id: string;
    name: string;
    maxLTV?: number;
    description?: string;
  }>>(),
  
  // Versioning & Audit
  version: integer("version").default(1),
  publishedAt: timestamp("published_at"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLoanProductSchema = createInsertSchema(loanProducts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertLoanProduct = z.infer<typeof insertLoanProductSchema>;
export type LoanProduct = typeof loanProducts.$inferSelect;

// Loan Product Pricing Tiers - for complex rate structures based on LTV, credit score, etc.
export const loanProductPricingTiers = pgTable("loan_product_pricing_tiers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => loanProducts.id, { onDelete: "cascade" }),
  
  // Tier identification
  name: text("name").notNull(), // "Standard", "Premium", "First-Time Investor"
  description: text("description"),
  
  // Conditions for this tier
  minLTV: integer("min_ltv"),
  maxLTV: integer("max_ltv"),
  minCreditScore: integer("min_credit_score"),
  maxCreditScore: integer("max_credit_score"),
  minDSCR: text("min_dscr"),
  minExperience: integer("min_experience"), // Number of deals
  
  // Rates for this tier
  rate: text("rate").notNull(), // The base rate for this tier
  rateAdjustment: text("rate_adjustment"), // Adjustment from base ("+0.25", "-0.50")
  
  // Other terms
  maxLoanAmount: integer("max_loan_amount"),
  originationPoints: text("origination_points"),
  
  // Status
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLoanProductPricingTierSchema = createInsertSchema(loanProductPricingTiers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertLoanProductPricingTier = z.infer<typeof insertLoanProductPricingTierSchema>;
export type LoanProductPricingTier = typeof loanProductPricingTiers.$inferSelect;

// Relations for loan products
export const loanProductsRelations = relations(loanProducts, ({ many }) => ({
  pricingTiers: many(loanProductPricingTiers),
}));

export const loanProductPricingTiersRelations = relations(loanProductPricingTiers, ({ one }) => ({
  product: one(loanProducts, {
    fields: [loanProductPricingTiers.productId],
    references: [loanProducts.id],
  }),
}));

// Loan Applications table
export const loanApplications = pgTable("loan_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  loanType: text("loan_type").notNull(),
  productVariant: productVariantEnum("product_variant"), // purchase, cash_out, rate_term (for DSCR)
  propertyAddress: text("property_address"),
  propertyCity: text("property_city"),
  propertyState: text("property_state"),
  propertyZip: text("property_zip"),
  loanAmount: integer("loan_amount"),
  status: loanApplicationStatusEnum("status").default("draft").notNull(),
  processingStage: processingStageEnum("processing_stage").default("app_submitted"),
  
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
  applicationScopeItems: many(applicationScopeItems),
  stageHistory: many(applicationStageHistory),
  assignments: many(loanAssignments),
  revisionRequests: many(revisionRequests),
  messages: many(applicationMessages),
}));

export type LoanApplication = typeof loanApplications.$inferSelect;
export type InsertLoanApplication = typeof loanApplications.$inferInsert;

export const insertLoanApplicationSchema = createInsertSchema(loanApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================
// APPLICATION STAGE HISTORY (Timeline Audit Trail)
// ============================================
export const applicationStageHistory = pgTable("application_stage_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  loanApplicationId: varchar("loan_application_id").notNull().references(() => loanApplications.id),
  
  // What changed
  fromStatus: loanApplicationStatusEnum("from_status"),
  toStatus: loanApplicationStatusEnum("to_status").notNull(),
  fromStage: processingStageEnum("from_stage"),
  toStage: processingStageEnum("to_stage"),
  
  // Who made the change
  changedByUserId: varchar("changed_by_user_id").references(() => users.id),
  changedByName: text("changed_by_name"),
  
  // Details
  notes: text("notes"),
  reason: text("reason"), // Reason for denial/withdrawal/etc.
  isAutomated: boolean("is_automated").default(false).notNull(),
  
  // Timing
  durationMinutes: integer("duration_minutes"), // Time spent in previous stage
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_stage_history_app").on(table.loanApplicationId),
  index("idx_stage_history_status").on(table.toStatus),
  index("idx_stage_history_created").on(table.createdAt),
]);

export const applicationStageHistoryRelations = relations(applicationStageHistory, ({ one }) => ({
  loanApplication: one(loanApplications, {
    fields: [applicationStageHistory.loanApplicationId],
    references: [loanApplications.id],
  }),
  changedBy: one(users, {
    fields: [applicationStageHistory.changedByUserId],
    references: [users.id],
  }),
}));

export type ApplicationStageHistory = typeof applicationStageHistory.$inferSelect;
export type InsertApplicationStageHistory = typeof applicationStageHistory.$inferInsert;

export const insertApplicationStageHistorySchema = createInsertSchema(applicationStageHistory).omit({
  id: true,
  createdAt: true,
});

// ============================================
// REVISION REQUESTS (Return to Borrower)
// ============================================
export const revisionRequests = pgTable("revision_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  loanApplicationId: varchar("loan_application_id").notNull().references(() => loanApplications.id),
  
  // Which section needs revision
  section: revisionSectionEnum("section").notNull(),
  
  // Details
  notes: text("notes").notNull(), // Admin instructions for what needs to be fixed
  status: revisionStatusEnum("status").default("pending").notNull(),
  
  // Who requested the revision
  requestedByUserId: varchar("requested_by_user_id").notNull().references(() => users.id),
  requestedByName: text("requested_by_name"),
  
  // Resolution tracking
  resolvedByUserId: varchar("resolved_by_user_id").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  resolutionNotes: text("resolution_notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_revision_requests_app").on(table.loanApplicationId),
  index("idx_revision_requests_status").on(table.status),
]);

export const revisionRequestsRelations = relations(revisionRequests, ({ one }) => ({
  loanApplication: one(loanApplications, {
    fields: [revisionRequests.loanApplicationId],
    references: [loanApplications.id],
  }),
  requestedBy: one(users, {
    fields: [revisionRequests.requestedByUserId],
    references: [users.id],
  }),
  resolvedBy: one(users, {
    fields: [revisionRequests.resolvedByUserId],
    references: [users.id],
  }),
}));

export type RevisionRequest = typeof revisionRequests.$inferSelect;
export type InsertRevisionRequest = typeof revisionRequests.$inferInsert;

export const insertRevisionRequestSchema = createInsertSchema(revisionRequests).omit({
  id: true,
  createdAt: true,
  resolvedAt: true,
});

// ============================================
// APPLICATION MESSAGES (Admin-Borrower Communication)
// ============================================
export const messagePriorityEnum = pgEnum("message_priority", ["low", "normal", "high", "urgent"]);
export type MessagePriority = "low" | "normal" | "high" | "urgent";

export const applicationMessages = pgTable("application_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  loanApplicationId: varchar("loan_application_id").notNull().references(() => loanApplications.id),
  
  // Sender information
  senderUserId: varchar("sender_user_id").notNull().references(() => users.id),
  senderName: text("sender_name").notNull(),
  senderRole: userRoleEnum("sender_role").notNull(), // borrower, staff, admin
  
  // Message content
  subject: text("subject"), // Optional subject line for email-like experience
  content: text("content").notNull(),
  
  // Attachments (file URLs and names)
  attachments: jsonb("attachments").$type<Array<{ url: string; name: string; type: string; size: number }>>(),
  
  // Read tracking
  isRead: boolean("is_read").default(false).notNull(),
  readAt: timestamp("read_at"),
  
  // Email-like features
  isStarred: boolean("is_starred").default(false).notNull(),
  isArchived: boolean("is_archived").default(false).notNull(),
  priority: messagePriorityEnum("priority").default("normal").notNull(),
  
  // Internal note (only visible to staff)
  isInternalNote: boolean("is_internal_note").default(false).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_app_messages_app").on(table.loanApplicationId),
  index("idx_app_messages_sender").on(table.senderUserId),
  index("idx_app_messages_created").on(table.createdAt),
  index("idx_app_messages_starred").on(table.isStarred),
  index("idx_app_messages_archived").on(table.isArchived),
]);

export const applicationMessagesRelations = relations(applicationMessages, ({ one }) => ({
  loanApplication: one(loanApplications, {
    fields: [applicationMessages.loanApplicationId],
    references: [loanApplications.id],
  }),
  sender: one(users, {
    fields: [applicationMessages.senderUserId],
    references: [users.id],
  }),
}));

export type ApplicationMessage = typeof applicationMessages.$inferSelect;
export type InsertApplicationMessage = typeof applicationMessages.$inferInsert;

export const insertApplicationMessageSchema = createInsertSchema(applicationMessages).omit({
  id: true,
  createdAt: true,
  readAt: true,
});

// ============================================
// MESSAGE TEMPLATES (Reusable Response Templates)
// ============================================
export const messageTemplateCategoryEnum = pgEnum("message_template_category", [
  "general",
  "status_update",
  "document_request",
  "follow_up",
  "closing",
  "custom"
]);
export type MessageTemplateCategory = "general" | "status_update" | "document_request" | "follow_up" | "closing" | "custom";

export const messageTemplates = pgTable("message_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Template metadata
  name: text("name").notNull(),
  category: messageTemplateCategoryEnum("category").default("general").notNull(),
  subject: text("subject"),
  content: text("content").notNull(),
  
  // Creator info
  createdByUserId: varchar("created_by_user_id").references(() => users.id),
  
  // Visibility
  isGlobal: boolean("is_global").default(false).notNull(), // Visible to all staff
  isActive: boolean("is_active").default(true).notNull(),
  
  // Usage tracking
  usageCount: integer("usage_count").default(0).notNull(),
  lastUsedAt: timestamp("last_used_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_msg_templates_category").on(table.category),
  index("idx_msg_templates_creator").on(table.createdByUserId),
  index("idx_msg_templates_global").on(table.isGlobal),
]);

export const messageTemplatesRelations = relations(messageTemplates, ({ one }) => ({
  createdBy: one(users, {
    fields: [messageTemplates.createdByUserId],
    references: [users.id],
  }),
}));

export type MessageTemplate = typeof messageTemplates.$inferSelect;
export type InsertMessageTemplate = typeof messageTemplates.$inferInsert;

export const insertMessageTemplateSchema = createInsertSchema(messageTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  usageCount: true,
  lastUsedAt: true,
});

// ============================================
// LOAN ASSIGNMENTS (Staff Ownership)
// ============================================
export const loanAssignmentRoleEnum = pgEnum("loan_assignment_role", [
  "account_executive",
  "processor",
  "underwriter",
  "closer",
  "servicer"
]);
export type LoanAssignmentRole = "account_executive" | "processor" | "underwriter" | "closer" | "servicer";

export const loanAssignments = pgTable("loan_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  loanApplicationId: varchar("loan_application_id").notNull().references(() => loanApplications.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: loanAssignmentRoleEnum("role").notNull(),
  
  // Is this the primary assignee for this role?
  isPrimary: boolean("is_primary").default(true).notNull(),
  
  // Assignment tracking
  assignedByUserId: varchar("assigned_by_user_id").references(() => users.id),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  unassignedAt: timestamp("unassigned_at"),
  
  // Status
  isActive: boolean("is_active").default(true).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_loan_assignments_app").on(table.loanApplicationId),
  index("idx_loan_assignments_user").on(table.userId),
  index("idx_loan_assignments_role").on(table.role),
  index("idx_loan_assignments_active").on(table.isActive),
]);

export const loanAssignmentsRelations = relations(loanAssignments, ({ one }) => ({
  loanApplication: one(loanApplications, {
    fields: [loanAssignments.loanApplicationId],
    references: [loanApplications.id],
  }),
  user: one(users, {
    fields: [loanAssignments.userId],
    references: [users.id],
  }),
  assignedBy: one(users, {
    fields: [loanAssignments.assignedByUserId],
    references: [users.id],
  }),
}));

export type LoanAssignment = typeof loanAssignments.$inferSelect;
export type InsertLoanAssignment = typeof loanAssignments.$inferInsert;

export const insertLoanAssignmentSchema = createInsertSchema(loanAssignments).omit({
  id: true,
  createdAt: true,
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
  
  // Source tracking - links to the original application scope item when copied during funding
  sourceApplicationScopeItemId: varchar("source_application_scope_item_id"),
  
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

// New Construction category names (same enum values, different display for construction context)
export const NEW_CONSTRUCTION_CATEGORY_NAMES: Record<ScopeOfWorkCategory, string> = {
  soft_costs: "Pre-Construction & Soft Costs",
  demo_foundation: "Site Work & Foundation",
  hvac_plumbing_electrical: "MEP Rough-In",
  interior: "Interior Finishes",
  exterior: "Exterior & Site Completion",
};

// Default scope of work items template for New Construction
export const NEW_CONSTRUCTION_SCOPE_OF_WORK_ITEMS: { category: ScopeOfWorkCategory; itemName: string; sortOrder: number }[] = [
  // Pre-Construction & Soft Costs
  { category: "soft_costs", itemName: "Permits & Fees", sortOrder: 1 },
  { category: "soft_costs", itemName: "Architectural Plans", sortOrder: 2 },
  { category: "soft_costs", itemName: "Structural Engineering", sortOrder: 3 },
  { category: "soft_costs", itemName: "Civil Engineering", sortOrder: 4 },
  { category: "soft_costs", itemName: "Survey", sortOrder: 5 },
  { category: "soft_costs", itemName: "Geotechnical Report", sortOrder: 6 },
  { category: "soft_costs", itemName: "Legal & Title", sortOrder: 7 },
  { category: "soft_costs", itemName: "Project Management", sortOrder: 8 },
  { category: "soft_costs", itemName: "Contingency", sortOrder: 9 },
  { category: "soft_costs", itemName: "Other - Soft Costs", sortOrder: 10 },
  
  // Site Work & Foundation
  { category: "demo_foundation", itemName: "Site Clearing & Grading", sortOrder: 20 },
  { category: "demo_foundation", itemName: "Excavation", sortOrder: 21 },
  { category: "demo_foundation", itemName: "Utilities Trenching", sortOrder: 22 },
  { category: "demo_foundation", itemName: "Foundation Forms", sortOrder: 23 },
  { category: "demo_foundation", itemName: "Rebar & Reinforcement", sortOrder: 24 },
  { category: "demo_foundation", itemName: "Concrete Pour - Foundation", sortOrder: 25 },
  { category: "demo_foundation", itemName: "Waterproofing", sortOrder: 26 },
  { category: "demo_foundation", itemName: "Backfill & Compaction", sortOrder: 27 },
  { category: "demo_foundation", itemName: "Slab on Grade", sortOrder: 28 },
  { category: "demo_foundation", itemName: "Other - Foundation", sortOrder: 29 },
  
  // Framing & Structure (using exterior category for structural work)
  { category: "exterior", itemName: "Floor Framing", sortOrder: 40 },
  { category: "exterior", itemName: "Wall Framing", sortOrder: 41 },
  { category: "exterior", itemName: "Roof Framing", sortOrder: 42 },
  { category: "exterior", itemName: "Trusses", sortOrder: 43 },
  { category: "exterior", itemName: "Sheathing", sortOrder: 44 },
  { category: "exterior", itemName: "Windows & Exterior Doors", sortOrder: 45 },
  { category: "exterior", itemName: "Roofing", sortOrder: 46 },
  { category: "exterior", itemName: "House Wrap & Flashing", sortOrder: 47 },
  { category: "exterior", itemName: "Siding", sortOrder: 48 },
  { category: "exterior", itemName: "Stucco/Masonry", sortOrder: 49 },
  { category: "exterior", itemName: "Exterior Trim", sortOrder: 50 },
  { category: "exterior", itemName: "Exterior Paint", sortOrder: 51 },
  { category: "exterior", itemName: "Garage Door", sortOrder: 52 },
  { category: "exterior", itemName: "Gutters & Downspouts", sortOrder: 53 },
  { category: "exterior", itemName: "Driveway & Flatwork", sortOrder: 54 },
  { category: "exterior", itemName: "Landscaping", sortOrder: 55 },
  { category: "exterior", itemName: "Irrigation", sortOrder: 56 },
  { category: "exterior", itemName: "Fencing", sortOrder: 57 },
  { category: "exterior", itemName: "Pool/Spa (if applicable)", sortOrder: 58 },
  { category: "exterior", itemName: "Other - Exterior", sortOrder: 59 },
  
  // MEP Rough-In
  { category: "hvac_plumbing_electrical", itemName: "Plumbing Rough-In", sortOrder: 60 },
  { category: "hvac_plumbing_electrical", itemName: "Electrical Rough-In", sortOrder: 61 },
  { category: "hvac_plumbing_electrical", itemName: "HVAC Rough-In", sortOrder: 62 },
  { category: "hvac_plumbing_electrical", itemName: "Low Voltage Rough-In", sortOrder: 63 },
  { category: "hvac_plumbing_electrical", itemName: "Solar Pre-Wire", sortOrder: 64 },
  { category: "hvac_plumbing_electrical", itemName: "Plumbing Top Out", sortOrder: 65 },
  { category: "hvac_plumbing_electrical", itemName: "HVAC Trim Out", sortOrder: 66 },
  { category: "hvac_plumbing_electrical", itemName: "Electrical Trim Out", sortOrder: 67 },
  { category: "hvac_plumbing_electrical", itemName: "Plumbing Fixtures", sortOrder: 68 },
  { category: "hvac_plumbing_electrical", itemName: "Lighting Fixtures", sortOrder: 69 },
  { category: "hvac_plumbing_electrical", itemName: "HVAC Equipment", sortOrder: 70 },
  { category: "hvac_plumbing_electrical", itemName: "Water Heater", sortOrder: 71 },
  { category: "hvac_plumbing_electrical", itemName: "Solar Panels (if applicable)", sortOrder: 72 },
  { category: "hvac_plumbing_electrical", itemName: "Other - MEP", sortOrder: 73 },
  
  // Interior Finishes
  { category: "interior", itemName: "Insulation", sortOrder: 80 },
  { category: "interior", itemName: "Drywall Hang", sortOrder: 81 },
  { category: "interior", itemName: "Drywall Tape & Texture", sortOrder: 82 },
  { category: "interior", itemName: "Interior Doors", sortOrder: 83 },
  { category: "interior", itemName: "Interior Trim & Millwork", sortOrder: 84 },
  { category: "interior", itemName: "Stairs & Railings", sortOrder: 85 },
  { category: "interior", itemName: "Interior Paint", sortOrder: 86 },
  { category: "interior", itemName: "Kitchen Cabinets", sortOrder: 87 },
  { category: "interior", itemName: "Kitchen Countertops", sortOrder: 88 },
  { category: "interior", itemName: "Kitchen Appliances", sortOrder: 89 },
  { category: "interior", itemName: "Kitchen Backsplash", sortOrder: 90 },
  { category: "interior", itemName: "Bathroom Vanities", sortOrder: 91 },
  { category: "interior", itemName: "Bathroom Countertops", sortOrder: 92 },
  { category: "interior", itemName: "Shower/Tub Tile", sortOrder: 93 },
  { category: "interior", itemName: "Shower Glass", sortOrder: 94 },
  { category: "interior", itemName: "Mirrors", sortOrder: 95 },
  { category: "interior", itemName: "Tile Flooring", sortOrder: 96 },
  { category: "interior", itemName: "Wood Flooring", sortOrder: 97 },
  { category: "interior", itemName: "Carpet", sortOrder: 98 },
  { category: "interior", itemName: "Fireplace", sortOrder: 99 },
  { category: "interior", itemName: "Hardware & Accessories", sortOrder: 100 },
  { category: "interior", itemName: "Closet Systems", sortOrder: 101 },
  { category: "interior", itemName: "Final Clean", sortOrder: 102 },
  { category: "interior", itemName: "Other - Interior", sortOrder: 103 },
];

// Helper function to get appropriate SOW template based on loan type
export function getSOWTemplateForLoanType(loanType: string): { category: ScopeOfWorkCategory; itemName: string; sortOrder: number }[] {
  if (loanType === "New Construction" || loanType === "new_construction") {
    return NEW_CONSTRUCTION_SCOPE_OF_WORK_ITEMS;
  }
  return DEFAULT_SCOPE_OF_WORK_ITEMS;
}

// Helper function to get category names based on loan type
export function getCategoryNamesForLoanType(loanType: string): Record<ScopeOfWorkCategory, string> {
  if (loanType === "New Construction" || loanType === "new_construction") {
    return NEW_CONSTRUCTION_CATEGORY_NAMES;
  }
  return SCOPE_OF_WORK_CATEGORY_NAMES;
}

// ============================================
// APPLICATION SCOPE OF WORK (For Fix & Flip / New Construction Applications)
// ============================================

// Application scope of work items - entered during application phase before funding
export const applicationScopeItems = pgTable("application_scope_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  loanApplicationId: varchar("loan_application_id").notNull().references(() => loanApplications.id),
  
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

export const applicationScopeItemsRelations = relations(applicationScopeItems, ({ one }) => ({
  loanApplication: one(loanApplications, {
    fields: [applicationScopeItems.loanApplicationId],
    references: [loanApplications.id],
  }),
}));

export type ApplicationScopeItem = typeof applicationScopeItems.$inferSelect;
export type InsertApplicationScopeItem = typeof applicationScopeItems.$inferInsert;

export const insertApplicationScopeItemSchema = createInsertSchema(applicationScopeItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

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
  accentColor: text("accent_color"),
  backgroundColor: text("background_color"),
  foregroundColor: text("foreground_color"),
  mutedColor: text("muted_color"),
  cardColor: text("card_color"),
  fontFamily: text("font_family"),
  headingWeight: text("heading_weight"),
  borderRadius: text("border_radius"),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  contactAddress: text("contact_address"),
  footerText: text("footer_text"),
  // New customization fields
  buttonStyle: text("button_style"), // "rounded" | "square" | "pill"
  themePreference: text("theme_preference"), // "light" | "dark"
  heroStyle: text("hero_style"), // "gradient" | "image" | "pattern" | "solid"
  heroImageUrl: text("hero_image_url"),
  heroPatternType: text("hero_pattern_type"), // "dots" | "grid" | "waves" | "geometric"
  heroOverlayOpacity: integer("hero_overlay_opacity"), // 0-100
  favicon: text("favicon"),
  // Social links
  socialFacebook: text("social_facebook"),
  socialTwitter: text("social_twitter"),
  socialLinkedin: text("social_linkedin"),
  socialInstagram: text("social_instagram"),
  socialYoutube: text("social_youtube"),
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
  accentColor: "#f59e0b",
  backgroundColor: "#0a0a0a",
  foregroundColor: "#fafafa",
  mutedColor: "#171717",
  cardColor: "#1f1f1f",
  fontFamily: "Inter",
  headingWeight: "600",
  borderRadius: "0.5rem",
  contactPhone: "302.388.8860",
  contactEmail: "josh@fundwithsequel.com",
  contactAddress: "800 5th Avenue, Suite 4100, Miami Beach, FL 33139",
  footerText: null,
  // New customization defaults
  buttonStyle: "rounded",
  themePreference: "dark",
  heroStyle: "gradient",
  heroImageUrl: null,
  heroPatternType: null,
  heroOverlayOpacity: 80,
  favicon: null,
  socialFacebook: null,
  socialTwitter: null,
  socialLinkedin: null,
  socialInstagram: null,
  socialYoutube: null,
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
  "payoff_statement",
  "revisions_requested",
  "application_resubmitted",
  "message_notification"
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

export const consultationTypeEnum = pgEnum("consultation_type", [
  "initial_call",
  "follow_up",
  "loan_review",
  "document_review",
  "closing",
  "other"
]);
export type ConsultationType = "initial_call" | "follow_up" | "loan_review" | "document_review" | "closing" | "other";

export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  borrowerUserId: varchar("borrower_user_id").notNull().references(() => users.id),
  staffUserId: varchar("staff_user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  consultationType: consultationTypeEnum("consultation_type").default("other"),
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

// Draw media type enum (photo or video)
export const drawMediaTypeEnum = pgEnum("draw_media_type", [
  "photo",
  "video",
]);
export type DrawMediaType = "photo" | "video";

// Draw media category enum - categories for organizing construction progress media
export const drawMediaCategoryEnum = pgEnum("draw_media_category", [
  "site_overview",        // Overall site/property view
  "exterior_progress",    // Exterior work progress
  "interior_progress",    // Interior work progress  
  "foundation",           // Foundation work
  "framing",              // Framing/structural
  "roofing",              // Roof work
  "plumbing",             // Plumbing rough-in/finish
  "electrical",           // Electrical rough-in/finish
  "hvac",                 // HVAC installation
  "drywall",              // Drywall/interior walls
  "flooring",             // Flooring installation
  "cabinets_counters",    // Cabinets and countertops
  "fixtures",             // Fixtures and appliances
  "paint_finish",         // Paint and finishing
  "landscaping",          // Exterior landscaping
  "safety_compliance",    // Safety/code compliance shots
  "materials_delivery",   // Materials on site
  "before",               // Before condition
  "during",               // Work in progress
  "after",                // Completed work
  "other",                // Other/miscellaneous
]);
export type DrawMediaCategory = "site_overview" | "exterior_progress" | "interior_progress" | "foundation" | "framing" | "roofing" | "plumbing" | "electrical" | "hvac" | "drywall" | "flooring" | "cabinets_counters" | "fixtures" | "paint_finish" | "landscaping" | "safety_compliance" | "materials_delivery" | "before" | "during" | "after" | "other";

// Photo verification status enum
export const photoVerificationStatusEnum = pgEnum("photo_verification_status", [
  "pending",           // Just uploaded, not verified yet
  "verified",          // GPS + timestamp verified - all checks passed
  "gps_match",         // Browser and EXIF GPS match (within threshold)
  "gps_mismatch",      // Browser and EXIF GPS differ significantly
  "outside_geofence",  // Photo taken outside property location
  "stale_timestamp",   // Photo is too old (>24 hours)
  "metadata_missing",  // No EXIF GPS/timestamp data
  "browser_gps_only",  // Only browser GPS available, no EXIF
  "exif_gps_only",     // Only EXIF GPS available, browser denied
  "no_gps_data",       // Neither browser nor EXIF GPS available
  "manual_approved",   // Staff manually approved despite issues
  "manual_rejected"    // Staff manually rejected
]);
export type PhotoVerificationStatus = "pending" | "verified" | "gps_match" | "gps_mismatch" | "outside_geofence" | "stale_timestamp" | "metadata_missing" | "browser_gps_only" | "exif_gps_only" | "no_gps_data" | "manual_approved" | "manual_rejected";

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

// Draw photos/videos table - stores media with EXIF data and verification status
export const drawPhotos = pgTable("draw_photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  loanDrawId: varchar("loan_draw_id").notNull().references(() => loanDraws.id),
  scopeOfWorkItemId: varchar("scope_of_work_item_id").references(() => scopeOfWorkItems.id),
  uploadedByUserId: varchar("uploaded_by_user_id").notNull().references(() => users.id),
  
  // Media type and category
  mediaType: drawMediaTypeEnum("media_type").default("photo").notNull(),
  category: drawMediaCategoryEnum("category").default("other"),
  
  // File storage
  fileKey: text("file_key").notNull(), // Key in object storage / file path
  fileName: text("file_name").notNull(),
  fileSizeBytes: integer("file_size_bytes"),
  mimeType: text("mime_type"),
  
  // Video-specific fields
  durationSeconds: integer("duration_seconds"), // Video duration in seconds
  thumbnailUrl: text("thumbnail_url"), // Generated thumbnail for videos
  
  // EXIF metadata extracted from photo
  exifLatitude: text("exif_latitude"),
  exifLongitude: text("exif_longitude"),
  exifTimestamp: timestamp("exif_timestamp"),
  exifCameraModel: text("exif_camera_model"),
  exifOrientation: integer("exif_orientation"),
  
  // Browser-reported location (for comparison/fallback)
  browserLatitude: text("browser_latitude"),
  browserLongitude: text("browser_longitude"),
  browserAccuracyMeters: integer("browser_accuracy_meters"), // GPS accuracy
  browserCapturedAt: timestamp("browser_captured_at"), // When browser GPS was captured
  
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
  index("idx_draw_photos_category").on(table.category),
  index("idx_draw_photos_media_type").on(table.mediaType),
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

// Helper constants for photo/video verification
export const PHOTO_VERIFICATION_CONFIG = {
  DEFAULT_GEOFENCE_RADIUS_METERS: 100, // 100 meter radius around property
  MAX_PHOTO_AGE_HOURS: 72, // Photos must be taken within 72 hours
  MIN_PHOTOS_PER_DRAW: 1, // Minimum photos required per draw request
  MAX_PHOTO_SIZE_MB: 20, // Maximum photo file size
  MAX_VIDEO_SIZE_MB: 200, // Maximum video file size
  MAX_VIDEO_DURATION_SECONDS: 120, // Maximum video duration (2 minutes)
  ALLOWED_PHOTO_MIME_TYPES: ["image/jpeg", "image/png", "image/heic", "image/heif", "image/webp"],
  ALLOWED_VIDEO_MIME_TYPES: ["video/mp4", "video/quicktime", "video/webm", "video/x-m4v"],
  ALLOWED_MIME_TYPES: ["image/jpeg", "image/png", "image/heic", "image/heif", "image/webp", "video/mp4", "video/quicktime", "video/webm", "video/x-m4v"],
};

// Category labels for display
export const DRAW_MEDIA_CATEGORY_LABELS: Record<DrawMediaCategory, string> = {
  site_overview: "Site Overview",
  exterior_progress: "Exterior Progress",
  interior_progress: "Interior Progress",
  foundation: "Foundation",
  framing: "Framing",
  roofing: "Roofing",
  plumbing: "Plumbing",
  electrical: "Electrical",
  hvac: "HVAC",
  drywall: "Drywall",
  flooring: "Flooring",
  cabinets_counters: "Cabinets & Counters",
  fixtures: "Fixtures",
  paint_finish: "Paint & Finish",
  landscaping: "Landscaping",
  safety_compliance: "Safety/Compliance",
  materials_delivery: "Materials",
  before: "Before",
  during: "During",
  after: "After",
  other: "Other",
};

// ============================================================================
// PROPERTY & RENOVATION VERIFICATION PHOTOS
// ============================================================================

// Verification photo type enum - defines all required photos for property/renovation verification
export const verificationPhotoTypeEnum = pgEnum("verification_photo_type", [
  // Property Exterior (required for all Fix & Flip)
  "exterior_front",
  "exterior_back", 
  "exterior_left",
  "exterior_right",
  "street_view",
  "property_signage",
  
  // Property Interior (required rooms)
  "kitchen",
  "kitchen_appliances",
  "bathroom_1",
  "bathroom_2",
  "living_room",
  "master_bedroom",
  "bedroom_2",
  "bedroom_3",
  
  // Systems & Mechanicals
  "hvac_unit",
  "electrical_panel",
  "water_heater",
  "plumbing_main",
  
  // Renovation Areas
  "renovation_area_1",
  "renovation_area_2",
  "renovation_area_3",
  "renovation_area_4",
  
  // Condition Documentation
  "damage_area_1",
  "damage_area_2",
  "damage_area_3",
  
  // Other
  "other"
]);

export type VerificationPhotoType = 
  | "exterior_front" | "exterior_back" | "exterior_left" | "exterior_right" | "street_view" | "property_signage"
  | "kitchen" | "kitchen_appliances" | "bathroom_1" | "bathroom_2" | "living_room" | "master_bedroom" | "bedroom_2" | "bedroom_3"
  | "hvac_unit" | "electrical_panel" | "water_heater" | "plumbing_main"
  | "renovation_area_1" | "renovation_area_2" | "renovation_area_3" | "renovation_area_4"
  | "damage_area_1" | "damage_area_2" | "damage_area_3"
  | "other";

// Verification category for grouping photo types
export const VERIFICATION_PHOTO_CATEGORIES = {
  property_exterior: {
    name: "Property Exterior",
    description: "Photos showing all sides of the property from the outside",
    photoTypes: ["exterior_front", "exterior_back", "exterior_left", "exterior_right", "street_view", "property_signage"] as VerificationPhotoType[],
  },
  property_interior: {
    name: "Property Interior",
    description: "Photos of key rooms inside the property",
    photoTypes: ["kitchen", "kitchen_appliances", "bathroom_1", "bathroom_2", "living_room", "master_bedroom", "bedroom_2", "bedroom_3"] as VerificationPhotoType[],
  },
  systems_mechanicals: {
    name: "Systems & Mechanicals",
    description: "Photos of HVAC, electrical, plumbing systems",
    photoTypes: ["hvac_unit", "electrical_panel", "water_heater", "plumbing_main"] as VerificationPhotoType[],
  },
  renovation_areas: {
    name: "Renovation Areas",
    description: "Photos of areas planned for renovation work",
    photoTypes: ["renovation_area_1", "renovation_area_2", "renovation_area_3", "renovation_area_4"] as VerificationPhotoType[],
  },
  condition_documentation: {
    name: "Condition Documentation",
    description: "Photos documenting any damage or issues",
    photoTypes: ["damage_area_1", "damage_area_2", "damage_area_3"] as VerificationPhotoType[],
  },
} as const;

// Photo type display names and instructions
export const VERIFICATION_PHOTO_CONFIG: Record<VerificationPhotoType, { 
  name: string; 
  description: string; 
  instructions: string;
  required: boolean;
}> = {
  // Exterior
  exterior_front: { name: "Front of Property", description: "Front facade including entrance", instructions: "Stand at street level facing the front of the property. Include the entire front facade, entrance door, and any visible landscaping.", required: true },
  exterior_back: { name: "Back of Property", description: "Rear view of property", instructions: "Photograph the entire back of the property including any patio, deck, or backyard area.", required: true },
  exterior_left: { name: "Left Side", description: "Left side of property", instructions: "Stand facing the property and photograph the entire left side from front to back.", required: true },
  exterior_right: { name: "Right Side", description: "Right side of property", instructions: "Stand facing the property and photograph the entire right side from front to back.", required: true },
  street_view: { name: "Street View", description: "Property from street", instructions: "Stand across the street to capture the property in context with neighboring properties.", required: true },
  property_signage: { name: "Property Signage", description: "Address or property sign", instructions: "Photograph any visible property address numbers, signs, or markers.", required: false },
  
  // Interior
  kitchen: { name: "Kitchen Overview", description: "Full kitchen view", instructions: "Stand in doorway or corner to capture the entire kitchen including cabinets, counters, and appliances.", required: true },
  kitchen_appliances: { name: "Kitchen Appliances", description: "Stove, fridge, dishwasher", instructions: "Close-up photo showing all major kitchen appliances - stove, refrigerator, dishwasher.", required: true },
  bathroom_1: { name: "Primary Bathroom", description: "Main bathroom", instructions: "Capture the entire bathroom including toilet, sink/vanity, and shower/tub.", required: true },
  bathroom_2: { name: "Secondary Bathroom", description: "Additional bathroom", instructions: "Full view of additional bathroom if property has more than one.", required: false },
  living_room: { name: "Living Room", description: "Main living area", instructions: "Wide shot capturing the entire living room or main gathering space.", required: true },
  master_bedroom: { name: "Master Bedroom", description: "Primary bedroom", instructions: "Full view of the master/primary bedroom.", required: true },
  bedroom_2: { name: "Bedroom 2", description: "Second bedroom", instructions: "Full view of the second bedroom.", required: false },
  bedroom_3: { name: "Bedroom 3", description: "Third bedroom", instructions: "Full view of the third bedroom if applicable.", required: false },
  
  // Systems
  hvac_unit: { name: "HVAC Unit", description: "Heating/cooling system", instructions: "Photo of the HVAC unit (indoor and/or outdoor) showing condition and model info if visible.", required: true },
  electrical_panel: { name: "Electrical Panel", description: "Main breaker box", instructions: "Photo of the electrical panel. Include the panel cover and inside breakers if accessible.", required: true },
  water_heater: { name: "Water Heater", description: "Hot water tank", instructions: "Photo of the water heater showing condition and any visible labels.", required: true },
  plumbing_main: { name: "Main Plumbing", description: "Main shutoff or pipes", instructions: "Photo of main water shutoff or visible plumbing lines.", required: false },
  
  // Renovation
  renovation_area_1: { name: "Renovation Area 1", description: "First area needing work", instructions: "Photo of first renovation area showing current condition.", required: false },
  renovation_area_2: { name: "Renovation Area 2", description: "Second area needing work", instructions: "Photo of second renovation area showing current condition.", required: false },
  renovation_area_3: { name: "Renovation Area 3", description: "Third area needing work", instructions: "Photo of third renovation area showing current condition.", required: false },
  renovation_area_4: { name: "Renovation Area 4", description: "Fourth area needing work", instructions: "Photo of fourth renovation area showing current condition.", required: false },
  
  // Damage
  damage_area_1: { name: "Damage Area 1", description: "First area with damage", instructions: "Close-up photo documenting any damage found.", required: false },
  damage_area_2: { name: "Damage Area 2", description: "Second area with damage", instructions: "Close-up photo documenting any damage found.", required: false },
  damage_area_3: { name: "Damage Area 3", description: "Third area with damage", instructions: "Close-up photo documenting any damage found.", required: false },
  
  // Other
  other: { name: "Other", description: "Additional photos", instructions: "Any additional photos that help document the property condition.", required: false },
};

// ============================================
// VERIFICATION WORKFLOWS
// ============================================

// Workflow type enum: property (underwriting) vs renovation (draws/servicing)
export const verificationWorkflowTypeEnum = pgEnum("verification_workflow_type", [
  "property",    // Property verification during underwriting (before funding)
  "renovation"   // Renovation verification during servicing (tied to draw requests)
]);
export type VerificationWorkflowType = "property" | "renovation";

// Workflow status enum
export const verificationWorkflowStatusEnum = pgEnum("verification_workflow_status", [
  "pending",           // Workflow created, awaiting photos
  "in_progress",       // Some photos submitted
  "submitted",         // All required photos submitted, awaiting review
  "approved",          // All photos verified/approved
  "rejected",          // Workflow rejected, requires re-submission
  "expired"            // Workflow expired (deadline passed)
]);
export type VerificationWorkflowStatus = "pending" | "in_progress" | "submitted" | "approved" | "rejected" | "expired";

// Verification workflows table - groups verification photos into logical workflows
export const verificationWorkflows = pgTable("verification_workflows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Type of verification
  workflowType: verificationWorkflowTypeEnum("workflow_type").notNull(),
  
  // For PROPERTY verification (underwriting): links to loan application
  loanApplicationId: varchar("loan_application_id").references(() => loanApplications.id),
  
  // For RENOVATION verification (servicing): links to serviced loan and draw request
  servicedLoanId: varchar("serviced_loan_id").references(() => servicedLoans.id),
  loanDrawId: varchar("loan_draw_id").references(() => loanDraws.id),
  
  // Status tracking
  status: verificationWorkflowStatusEnum("status").default("pending").notNull(),
  
  // Required categories for this workflow (subset of all categories)
  requiredCategories: text("required_categories").array(),
  
  // Progress tracking
  totalRequiredPhotos: integer("total_required_photos"),
  completedPhotos: integer("completed_photos").default(0).notNull(),
  
  // Review information
  reviewedByUserId: varchar("reviewed_by_user_id").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  
  // Deadlines
  dueDate: timestamp("due_date"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_verification_workflows_app").on(table.loanApplicationId),
  index("idx_verification_workflows_serviced").on(table.servicedLoanId),
  index("idx_verification_workflows_draw").on(table.loanDrawId),
  index("idx_verification_workflows_status").on(table.status),
  index("idx_verification_workflows_type").on(table.workflowType),
]);

export const verificationWorkflowsRelations = relations(verificationWorkflows, ({ one, many }) => ({
  loanApplication: one(loanApplications, {
    fields: [verificationWorkflows.loanApplicationId],
    references: [loanApplications.id],
  }),
  servicedLoan: one(servicedLoans, {
    fields: [verificationWorkflows.servicedLoanId],
    references: [servicedLoans.id],
  }),
  loanDraw: one(loanDraws, {
    fields: [verificationWorkflows.loanDrawId],
    references: [loanDraws.id],
  }),
  reviewedBy: one(users, {
    fields: [verificationWorkflows.reviewedByUserId],
    references: [users.id],
  }),
  photos: many(verificationPhotos),
}));

export type VerificationWorkflow = typeof verificationWorkflows.$inferSelect;
export type InsertVerificationWorkflow = typeof verificationWorkflows.$inferInsert;

export const insertVerificationWorkflowSchema = createInsertSchema(verificationWorkflows).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================
// VERIFICATION PHOTOS
// ============================================

// Verification photos table - stores photos submitted during verification walkthrough
export const verificationPhotos = pgTable("verification_photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Link to workflow (new - for organized verification flows)
  verificationWorkflowId: varchar("verification_workflow_id").references(() => verificationWorkflows.id),
  
  // Legacy: direct link to loan application (for backward compatibility)
  loanApplicationId: varchar("loan_application_id").references(() => loanApplications.id),
  
  uploadedByUserId: varchar("uploaded_by_user_id").notNull().references(() => users.id),
  
  // Photo type and categorization
  photoType: verificationPhotoTypeEnum("photo_type").notNull(),
  
  // For RENOVATION verification: optional link to specific scope item being verified
  scopeOfWorkItemId: varchar("scope_of_work_item_id").references(() => scopeOfWorkItems.id),
  drawLineItemId: varchar("draw_line_item_id").references(() => drawLineItems.id),
  
  // File storage
  fileKey: text("file_key").notNull(),
  fileName: text("file_name").notNull(),
  fileSizeBytes: integer("file_size_bytes"),
  mimeType: text("mime_type"),
  
  // EXIF metadata extracted from photo
  exifLatitude: text("exif_latitude"),
  exifLongitude: text("exif_longitude"),
  exifTimestamp: timestamp("exif_timestamp"),
  exifCameraModel: text("exif_camera_model"),
  
  // Browser-reported location (captured at time of photo)
  browserLatitude: text("browser_latitude"),
  browserLongitude: text("browser_longitude"),
  browserAccuracyMeters: integer("browser_accuracy_meters"), // GPS accuracy in meters
  browserCapturedAt: timestamp("browser_captured_at"), // When browser GPS was captured
  
  // EXIF altitude (if available)
  exifAltitude: text("exif_altitude"),
  
  // GPS verification distances (computed)
  distanceExifToBrowserMeters: integer("distance_exif_to_browser_meters"), // Distance between EXIF and browser GPS
  distanceExifToPropertyMeters: integer("distance_exif_to_property_meters"), // Distance from EXIF to property
  distanceBrowserToPropertyMeters: integer("distance_browser_to_property_meters"), // Distance from browser to property
  
  // GPS verification flags
  gpsPermissionDenied: boolean("gps_permission_denied").default(false),
  exifGpsMissing: boolean("exif_gps_missing").default(false),
  
  // Verification results
  verificationStatus: photoVerificationStatusEnum("verification_status").default("pending").notNull(),
  distanceFromPropertyMeters: integer("distance_from_property_meters"), // Legacy: primary distance metric
  verificationDetails: text("verification_details"), // JSON with detailed verification info
  verifiedAt: timestamp("verified_at"),
  verifiedByUserId: varchar("verified_by_user_id").references(() => users.id), // Staff who manually verified
  
  // Notes from borrower
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_verification_photos_workflow").on(table.verificationWorkflowId),
  index("idx_verification_photos_app").on(table.loanApplicationId),
  index("idx_verification_photos_type").on(table.photoType),
  index("idx_verification_photos_status").on(table.verificationStatus),
  index("idx_verification_photos_scope").on(table.scopeOfWorkItemId),
]);

export const verificationPhotosRelations = relations(verificationPhotos, ({ one }) => ({
  verificationWorkflow: one(verificationWorkflows, {
    fields: [verificationPhotos.verificationWorkflowId],
    references: [verificationWorkflows.id],
  }),
  loanApplication: one(loanApplications, {
    fields: [verificationPhotos.loanApplicationId],
    references: [loanApplications.id],
  }),
  uploadedBy: one(users, {
    fields: [verificationPhotos.uploadedByUserId],
    references: [users.id],
  }),
  verifiedBy: one(users, {
    fields: [verificationPhotos.verifiedByUserId],
    references: [users.id],
  }),
  scopeOfWorkItem: one(scopeOfWorkItems, {
    fields: [verificationPhotos.scopeOfWorkItemId],
    references: [scopeOfWorkItems.id],
  }),
  drawLineItem: one(drawLineItems, {
    fields: [verificationPhotos.drawLineItemId],
    references: [drawLineItems.id],
  }),
}));

export type VerificationPhoto = typeof verificationPhotos.$inferSelect;
export type InsertVerificationPhoto = typeof verificationPhotos.$inferInsert;

export const insertVerificationPhotoSchema = createInsertSchema(verificationPhotos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Staff Message Preferences - controls email notification behavior for offline staff
export const staffMessagePreferences = pgTable("staff_message_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  staffUserId: varchar("staff_user_id").notNull().references(() => users.id).unique(),
  
  // Notification settings
  emailNotificationsEnabled: boolean("email_notifications_enabled").default(true).notNull(),
  
  // Quiet hours (times when no notifications are sent)
  quietHoursEnabled: boolean("quiet_hours_enabled").default(false).notNull(),
  quietHoursStart: text("quiet_hours_start"), // e.g., "22:00" (10 PM)
  quietHoursEnd: text("quiet_hours_end"), // e.g., "08:00" (8 AM)
  quietHoursTimezone: text("quiet_hours_timezone").default("America/New_York"), // User's timezone
  
  // Batching settings (how often to send digest emails when offline)
  batchIntervalMinutes: integer("batch_interval_minutes").default(15).notNull(), // 0 = instant, 15/30/60 = batched
  
  // Tracking timestamps
  lastNotifiedAt: timestamp("last_notified_at"), // When staff was last emailed about new messages
  lastSeenAt: timestamp("last_seen_at"), // When staff was last active in admin messenger
  lastHeartbeatAt: timestamp("last_heartbeat_at"), // For presence detection (online/offline)
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_staff_message_prefs_user").on(table.staffUserId),
  index("idx_staff_message_prefs_heartbeat").on(table.lastHeartbeatAt),
]);

export const staffMessagePreferencesRelations = relations(staffMessagePreferences, ({ one }) => ({
  staff: one(users, {
    fields: [staffMessagePreferences.staffUserId],
    references: [users.id],
  }),
}));

export type StaffMessagePreferences = typeof staffMessagePreferences.$inferSelect;
export type InsertStaffMessagePreferences = typeof staffMessagePreferences.$inferInsert;

export const insertStaffMessagePreferencesSchema = createInsertSchema(staffMessagePreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================
// PAGE LAYOUTS (Modular Page Builder)
// ============================================

// Available section types for the modular page builder
export const sectionTypeEnum = pgEnum("section_type", [
  "hero",
  "trust_indicators",
  "loan_products",
  "testimonials",
  "faq",
  "lead_form",
  "recently_funded",
  "state_map",
  "feature_highlights",
  "cta_banner",
  "custom_content",
  "stats_bar",
  "process_steps",
  "product_comparison",
  "partner_badges",
]);

// Hero section variants
export type HeroVariant = "carousel" | "static" | "video" | "split" | "stats_centered";

// Animated stat configuration for stats_centered hero variant
export interface HeroAnimatedStat {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
}

// Badge pill configuration for hero section
export interface HeroBadge {
  text: string;
  icon?: string;
}

// Feature pill for hero footer
export interface HeroFeaturePill {
  icon?: string;
  text: string;
}

// Section configuration types (stored as JSONB)
export interface HeroSectionConfig {
  variant: HeroVariant;
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  showFundedDeals?: boolean;
  overlayOpacity?: number;
  // Stats centered variant options
  animatedStats?: HeroAnimatedStat[];
  badge?: HeroBadge;
  featurePills?: HeroFeaturePill[];
  darkBackground?: boolean;
  accentColor?: string; // e.g., "gold", "purple", "blue"
}

export interface TrustIndicatorsSectionConfig {
  showYearsInBusiness?: boolean;
  showTotalFunded?: boolean;
  showStatesServed?: boolean;
  showActiveLoans?: boolean;
  customStats?: Array<{
    label: string;
    value: string;
    icon?: string;
  }>;
}

export interface LoanProductsSectionConfig {
  showDSCR?: boolean;
  showFixFlip?: boolean;
  showConstruction?: boolean;
  customTitle?: string;
  customDescription?: string;
  cardStyle?: "default" | "compact" | "detailed";
}

export interface TestimonialsSectionConfig {
  testimonials?: Array<{
    name: string;
    role?: string;
    company?: string;
    quote: string;
    image?: string;
    rating?: number;
  }>;
  layout?: "carousel" | "grid" | "list";
  showRatings?: boolean;
}

export interface FAQSectionConfig {
  title?: string;
  description?: string;
  items?: Array<{
    question: string;
    answer: string;
  }>;
  layout?: "accordion" | "two-column";
}

export interface LeadFormSectionConfig {
  title?: string;
  description?: string;
  ctaText?: string;
  showPhone?: boolean;
  showLoanAmount?: boolean;
  showPropertyType?: boolean;
  backgroundColor?: string;
}

export interface RecentlyFundedSectionConfig {
  title?: string;
  maxItems?: number;
  showRate?: boolean;
  showCloseTime?: boolean;
  autoScroll?: boolean;
}

export interface StateMapSectionConfig {
  title?: string;
  description?: string;
  highlightStates?: string[];
  showLoanVolume?: boolean;
}

export interface FeatureHighlightsSectionConfig {
  title?: string;
  features?: Array<{
    icon?: string;
    title: string;
    description: string;
  }>;
  layout?: "grid" | "list" | "cards";
  columns?: 2 | 3 | 4;
}

export interface CTABannerSectionConfig {
  headline?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface CustomContentSectionConfig {
  htmlContent?: string;
  cssClass?: string;
  paddingTop?: string;
  paddingBottom?: string;
}

export interface StatsBarSectionConfig {
  stats?: Array<{
    value: string;
    label: string;
    prefix?: string;
    suffix?: string;
  }>;
  backgroundColor?: string;
}

export interface ProcessStepsSectionConfig {
  title?: string;
  steps: Array<{
    icon?: string;
    title: string;
    description: string;
  }>;
  layout?: "row" | "grid";
  columns?: 2 | 3 | 4;
  showConnectors?: boolean;
}

export interface ProductComparisonSectionConfig {
  title?: string;
  description?: string;
  products: Array<{
    icon?: string;
    name: string;
    description: string;
    specs: Array<{
      label: string;
      value: string;
    }>;
    ctaText?: string;
    ctaLink?: string;
  }>;
  layout?: "cards" | "table";
  showCTA?: boolean;
}

export interface PartnerBadgesSectionConfig {
  title?: string;
  badges: Array<{
    name: string;
    rating?: string;
    icon?: string;
    link?: string;
  }>;
  layout?: "row" | "grid";
  showLinks?: boolean;
}

// Union type for all section configs
export type SectionConfig = 
  | HeroSectionConfig
  | TrustIndicatorsSectionConfig
  | LoanProductsSectionConfig
  | TestimonialsSectionConfig
  | FAQSectionConfig
  | LeadFormSectionConfig
  | RecentlyFundedSectionConfig
  | StateMapSectionConfig
  | FeatureHighlightsSectionConfig
  | CTABannerSectionConfig
  | CustomContentSectionConfig
  | StatsBarSectionConfig
  | ProcessStepsSectionConfig
  | ProductComparisonSectionConfig
  | PartnerBadgesSectionConfig;

// Individual section in a page layout
export interface PageSection {
  id: string;
  type: typeof sectionTypeEnum.enumValues[number];
  title?: string;
  isVisible: boolean;
  config: SectionConfig;
  order: number;
}

// Pages that can be customized
export const customizablePageEnum = pgEnum("customizable_page", [
  "home",
  "dscr",
  "fix_flip",
  "construction",
  "about",
  "contact",
  "resources",
]);

// Page layouts table
export const pageLayouts = pgTable("page_layouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pageId: customizablePageEnum("page_id").notNull().unique(),
  pageName: text("page_name").notNull(),
  sections: jsonb("sections").$type<PageSection[]>().notNull().default([]),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_page_layouts_page_id").on(table.pageId),
  index("idx_page_layouts_active").on(table.isActive),
]);

export type PageLayout = typeof pageLayouts.$inferSelect;
export type InsertPageLayout = typeof pageLayouts.$inferInsert;

export const insertPageLayoutSchema = createInsertSchema(pageLayouts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Zod schemas for section config validation
export const heroSectionConfigSchema = z.object({
  variant: z.enum(["carousel", "static", "video", "split"]).optional(),
  headline: z.string().optional(),
  subheadline: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  secondaryCtaText: z.string().optional(),
  secondaryCtaLink: z.string().optional(),
  backgroundImage: z.string().optional(),
  backgroundVideo: z.string().optional(),
  showFundedDeals: z.boolean().optional(),
  overlayOpacity: z.number().optional(),
}).passthrough();

export const trustIndicatorsSectionConfigSchema = z.object({
  showYearsInBusiness: z.boolean().optional(),
  showTotalFunded: z.boolean().optional(),
  showStatesServed: z.boolean().optional(),
  showActiveLoans: z.boolean().optional(),
  customStats: z.array(z.object({
    label: z.string(),
    value: z.string(),
    icon: z.string().optional(),
  })).optional(),
}).passthrough();

export const loanProductsSectionConfigSchema = z.object({
  showDSCR: z.boolean().optional(),
  showFixFlip: z.boolean().optional(),
  showConstruction: z.boolean().optional(),
  customTitle: z.string().optional(),
  customDescription: z.string().optional(),
  cardStyle: z.enum(["default", "compact", "detailed"]).optional(),
}).passthrough();

export const testimonialsSectionConfigSchema = z.object({
  testimonials: z.array(z.object({
    name: z.string(),
    role: z.string().optional(),
    company: z.string().optional(),
    quote: z.string(),
    image: z.string().optional(),
    rating: z.number().optional(),
  })).optional(),
  layout: z.enum(["carousel", "grid", "list"]).optional(),
  showRatings: z.boolean().optional(),
}).passthrough();

export const faqSectionConfigSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  items: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).optional(),
  layout: z.enum(["accordion", "two-column"]).optional(),
}).passthrough();

export const featureHighlightsSectionConfigSchema = z.object({
  title: z.string().optional(),
  features: z.array(z.object({
    icon: z.string().optional(),
    title: z.string(),
    description: z.string(),
  })).optional(),
  layout: z.enum(["grid", "list", "cards"]).optional(),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
}).passthrough();

export const ctaBannerSectionConfigSchema = z.object({
  headline: z.string().optional(),
  description: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
}).passthrough();

// Generic config schema for other section types (passthrough for flexibility)
export const genericSectionConfigSchema = z.object({}).passthrough();

// Valid section types
export const sectionTypes = [
  "hero",
  "trust_indicators",
  "loan_products",
  "testimonials",
  "faq",
  "lead_form",
  "recently_funded",
  "state_map",
  "feature_highlights",
  "cta_banner",
  "custom_content",
  "stats_bar",
  "process_steps",
  "product_comparison",
  "partner_badges",
] as const;

// Lead form config schema
export const leadFormSectionConfigSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  ctaText: z.string().optional(),
  showPhone: z.boolean().optional(),
  showLoanAmount: z.boolean().optional(),
  showPropertyType: z.boolean().optional(),
  backgroundColor: z.string().optional(),
}).passthrough();

// Recently funded config schema
export const recentlyFundedSectionConfigSchema = z.object({
  title: z.string().optional(),
  maxItems: z.number().optional(),
  showRate: z.boolean().optional(),
  showCloseTime: z.boolean().optional(),
  autoScroll: z.boolean().optional(),
}).passthrough();

// State map config schema
export const stateMapSectionConfigSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  highlightStates: z.array(z.string()).optional(),
  showLoanVolume: z.boolean().optional(),
}).passthrough();

// Custom content config schema
export const customContentSectionConfigSchema = z.object({
  htmlContent: z.string().optional(),
  cssClass: z.string().optional(),
  paddingTop: z.string().optional(),
  paddingBottom: z.string().optional(),
}).passthrough();

// Stats bar config schema
export const statsBarSectionConfigSchema = z.object({
  stats: z.array(z.object({
    value: z.string(),
    label: z.string(),
    prefix: z.string().optional(),
    suffix: z.string().optional(),
  })).optional(),
  backgroundColor: z.string().optional(),
}).passthrough();

// Process steps config schema
export const processStepsSectionConfigSchema = z.object({
  title: z.string().optional(),
  steps: z.array(z.object({
    icon: z.string().optional(),
    title: z.string(),
    description: z.string(),
  })),
  layout: z.enum(["row", "grid"]).optional(),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
  showConnectors: z.boolean().optional(),
}).passthrough();

// Product comparison config schema
export const productComparisonSectionConfigSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  products: z.array(z.object({
    icon: z.string().optional(),
    name: z.string(),
    description: z.string(),
    specs: z.array(z.object({
      label: z.string(),
      value: z.string(),
    })),
    ctaText: z.string().optional(),
    ctaLink: z.string().optional(),
  })),
  layout: z.enum(["cards", "table"]).optional(),
  showCTA: z.boolean().optional(),
}).passthrough();

// Partner badges config schema
export const partnerBadgesSectionConfigSchema = z.object({
  title: z.string().optional(),
  badges: z.array(z.object({
    name: z.string(),
    rating: z.string().optional(),
    icon: z.string().optional(),
    link: z.string().optional(),
  })),
  layout: z.enum(["row", "grid"]).optional(),
  showLinks: z.boolean().optional(),
}).passthrough();

// Base section fields shared across all section types
const baseSectionFields = {
  id: z.string().min(1, "Section ID is required"),
  title: z.string().optional(),
  isVisible: z.boolean(),
  order: z.number().int().min(0),
};

// Discriminated union for page sections with type-specific config validation
export const pageSectionSchema = z.discriminatedUnion("type", [
  z.object({
    ...baseSectionFields,
    type: z.literal("hero"),
    config: heroSectionConfigSchema,
  }),
  z.object({
    ...baseSectionFields,
    type: z.literal("trust_indicators"),
    config: trustIndicatorsSectionConfigSchema,
  }),
  z.object({
    ...baseSectionFields,
    type: z.literal("loan_products"),
    config: loanProductsSectionConfigSchema,
  }),
  z.object({
    ...baseSectionFields,
    type: z.literal("testimonials"),
    config: testimonialsSectionConfigSchema,
  }),
  z.object({
    ...baseSectionFields,
    type: z.literal("faq"),
    config: faqSectionConfigSchema,
  }),
  z.object({
    ...baseSectionFields,
    type: z.literal("lead_form"),
    config: leadFormSectionConfigSchema,
  }),
  z.object({
    ...baseSectionFields,
    type: z.literal("recently_funded"),
    config: recentlyFundedSectionConfigSchema,
  }),
  z.object({
    ...baseSectionFields,
    type: z.literal("state_map"),
    config: stateMapSectionConfigSchema,
  }),
  z.object({
    ...baseSectionFields,
    type: z.literal("feature_highlights"),
    config: featureHighlightsSectionConfigSchema,
  }),
  z.object({
    ...baseSectionFields,
    type: z.literal("cta_banner"),
    config: ctaBannerSectionConfigSchema,
  }),
  z.object({
    ...baseSectionFields,
    type: z.literal("custom_content"),
    config: customContentSectionConfigSchema,
  }),
  z.object({
    ...baseSectionFields,
    type: z.literal("stats_bar"),
    config: statsBarSectionConfigSchema,
  }),
  z.object({
    ...baseSectionFields,
    type: z.literal("process_steps"),
    config: processStepsSectionConfigSchema,
  }),
  z.object({
    ...baseSectionFields,
    type: z.literal("product_comparison"),
    config: productComparisonSectionConfigSchema,
  }),
  z.object({
    ...baseSectionFields,
    type: z.literal("partner_badges"),
    config: partnerBadgesSectionConfigSchema,
  }),
]);

// Validate sections array schema
export const pageSectionsArraySchema = z.array(pageSectionSchema);

// Default homepage layout configuration
export const DEFAULT_HOME_PAGE_LAYOUT: Omit<InsertPageLayout, 'id'> = {
  pageId: "home",
  pageName: "Home Page",
  sections: [
    {
      id: "hero-1",
      type: "hero",
      title: "Hero Section",
      isVisible: true,
      order: 0,
      config: {
        variant: "carousel",
        headline: "Fast, Flexible Real Estate Investment Loans",
        subheadline: "Close in as few as 5 days with competitive rates",
        ctaText: "Get Your Quote",
        ctaLink: "/get-quote",
        showFundedDeals: true,
      } as HeroSectionConfig,
    },
    {
      id: "trust-1",
      type: "trust_indicators",
      title: "Trust Indicators",
      isVisible: true,
      order: 1,
      config: {
        showYearsInBusiness: true,
        showTotalFunded: true,
        showStatesServed: true,
        showActiveLoans: true,
      } as TrustIndicatorsSectionConfig,
    },
    {
      id: "products-1",
      type: "loan_products",
      title: "Loan Products",
      isVisible: true,
      order: 2,
      config: {
        showDSCR: true,
        showFixFlip: true,
        showConstruction: true,
        customTitle: "Loan Programs",
        cardStyle: "default",
      } as LoanProductsSectionConfig,
    },
    {
      id: "features-1",
      type: "feature_highlights",
      title: "Why Choose Us",
      isVisible: true,
      order: 3,
      config: {
        title: "Why Investors Choose Us",
        layout: "grid",
        columns: 3,
        features: [
          { icon: "Clock", title: "Fast Closings", description: "Close in as few as 5 days" },
          { icon: "Shield", title: "No Prepayment Penalty", description: "Pay off early with no fees" },
          { icon: "Users", title: "Dedicated Support", description: "Personal loan specialist assigned" },
        ],
      } as FeatureHighlightsSectionConfig,
    },
    {
      id: "testimonials-1",
      type: "testimonials",
      title: "Client Testimonials",
      isVisible: true,
      order: 4,
      config: {
        layout: "carousel",
        showRatings: true,
      } as TestimonialsSectionConfig,
    },
    {
      id: "funded-1",
      type: "recently_funded",
      title: "Recently Funded",
      isVisible: true,
      order: 5,
      config: {
        title: "Recently Funded Deals",
        maxItems: 8,
        showRate: true,
        showCloseTime: true,
        autoScroll: true,
      } as RecentlyFundedSectionConfig,
    },
    {
      id: "map-1",
      type: "state_map",
      title: "Where We Lend",
      isVisible: true,
      order: 6,
      config: {
        title: "Where We Lend",
        showLoanVolume: true,
      } as StateMapSectionConfig,
    },
    {
      id: "faq-1",
      type: "faq",
      title: "FAQ",
      isVisible: true,
      order: 7,
      config: {
        title: "Frequently Asked Questions",
        layout: "accordion",
      } as FAQSectionConfig,
    },
    {
      id: "cta-1",
      type: "cta_banner",
      title: "Call to Action",
      isVisible: true,
      order: 8,
      config: {
        headline: "Ready to Get Started?",
        description: "Get your personalized rate quote in minutes",
        ctaText: "Get Your Quote",
        ctaLink: "/get-quote",
      } as CTABannerSectionConfig,
    },
  ],
  isActive: true,
};

// Default DSCR page layout configuration
export const DEFAULT_DSCR_PAGE_LAYOUT: Omit<InsertPageLayout, 'id'> = {
  pageId: "dscr",
  pageName: "DSCR Loan Page",
  sections: [
    {
      id: "dscr-hero-1",
      type: "hero",
      title: "Hero Section",
      isVisible: true,
      order: 0,
      config: {
        variant: "static",
        headline: "DSCR Loans for Rental Property Investors",
        subheadline: "No tax returns required. Qualify based on property cash flow, not personal income.",
        ctaText: "Get Your DSCR Quote",
        ctaLink: "/get-quote",
        showFundedDeals: false,
      } as HeroSectionConfig,
    },
    {
      id: "dscr-trust-1",
      type: "trust_indicators",
      title: "Trust Indicators",
      isVisible: true,
      order: 1,
      config: {
        showYearsInBusiness: true,
        showTotalFunded: true,
        showStatesServed: true,
        showActiveLoans: true,
      } as TrustIndicatorsSectionConfig,
    },
    {
      id: "dscr-features-1",
      type: "feature_highlights",
      title: "DSCR Loan Benefits",
      isVisible: true,
      order: 2,
      config: {
        title: "Why Choose DSCR Loans?",
        layout: "grid",
        columns: 3,
        features: [
          { icon: "FileX", title: "No Tax Returns", description: "Qualify based on rental income, not personal income" },
          { icon: "Building", title: "Up to 80% LTV", description: "Finance up to 80% of property value" },
          { icon: "Calendar", title: "30-Year Terms", description: "Long-term fixed rate financing available" },
          { icon: "Clock", title: "Fast Closings", description: "Close in as few as 14 days" },
          { icon: "Home", title: "1-4 Unit Properties", description: "Single family, condos, townhomes, and small multi-family" },
          { icon: "TrendingUp", title: "Cash-Out Available", description: "Access equity for your next investment" },
        ],
      } as FeatureHighlightsSectionConfig,
    },
    {
      id: "dscr-stats-1",
      type: "stats_bar",
      title: "Program Stats",
      isVisible: true,
      order: 3,
      config: {
        stats: [
          { label: "Min DSCR", value: "1.0" },
          { label: "Max LTV", value: "80%" },
          { label: "Min Credit Score", value: "660" },
          { label: "Loan Range", value: "$75K - $3M" },
        ],
      } as StatsBarSectionConfig,
    },
    {
      id: "dscr-faq-1",
      type: "faq",
      title: "DSCR FAQ",
      isVisible: true,
      order: 4,
      config: {
        title: "DSCR Loan FAQs",
        layout: "accordion",
        items: [
          { question: "What is a DSCR loan?", answer: "A DSCR (Debt Service Coverage Ratio) loan qualifies borrowers based on the rental income of the property rather than personal income. If the property's rent covers the mortgage payment, you can qualify." },
          { question: "What DSCR ratio do I need?", answer: "We offer programs starting at 1.0 DSCR, meaning the property's rental income just needs to cover the monthly payment. Higher DSCR ratios may qualify for better rates." },
          { question: "Can I use projected rent?", answer: "Yes! For properties without current tenants, we can use market rent estimates from an appraisal to qualify the property." },
          { question: "Are there prepayment penalties?", answer: "We offer flexible prepayment options including no prepay on select programs. Standard options include 3-2-1 and 5-4-3-2-1 step-down structures." },
        ],
      } as FAQSectionConfig,
    },
    {
      id: "dscr-cta-1",
      type: "cta_banner",
      title: "Call to Action",
      isVisible: true,
      order: 5,
      config: {
        headline: "Ready to Finance Your Rental Property?",
        description: "Get a customized DSCR loan quote in minutes",
        ctaText: "Get Your Quote",
        ctaLink: "/get-quote",
      } as CTABannerSectionConfig,
    },
  ],
  isActive: true,
};

// Default Fix & Flip page layout configuration
export const DEFAULT_FIX_FLIP_PAGE_LAYOUT: Omit<InsertPageLayout, 'id'> = {
  pageId: "fix_flip",
  pageName: "Fix & Flip Page",
  sections: [
    {
      id: "flip-hero-1",
      type: "hero",
      title: "Hero Section",
      isVisible: true,
      order: 0,
      config: {
        variant: "static",
        headline: "Fix & Flip Loans for Real Estate Investors",
        subheadline: "Fast funding for your next renovation project. Close in as few as 5 days.",
        ctaText: "Get Your Flip Quote",
        ctaLink: "/get-quote",
        showFundedDeals: false,
      } as HeroSectionConfig,
    },
    {
      id: "flip-features-1",
      type: "feature_highlights",
      title: "Fix & Flip Benefits",
      isVisible: true,
      order: 1,
      config: {
        title: "Why Choose Our Fix & Flip Loans?",
        layout: "grid",
        columns: 3,
        features: [
          { icon: "Zap", title: "Close in 5 Days", description: "Quick funding to secure your deal" },
          { icon: "Hammer", title: "100% Rehab Financing", description: "Finance your entire renovation budget" },
          { icon: "Percent", title: "Up to 90% LTC", description: "Maximize your leverage on each project" },
          { icon: "DollarSign", title: "No Prepay Options", description: "Pay off early without penalties" },
          { icon: "Users", title: "New Investors Welcome", description: "Programs for first-time flippers" },
          { icon: "RefreshCw", title: "Quick Draw Process", description: "Get rehab funds released fast" },
        ],
      } as FeatureHighlightsSectionConfig,
    },
    {
      id: "flip-stats-1",
      type: "stats_bar",
      title: "Program Stats",
      isVisible: true,
      order: 2,
      config: {
        stats: [
          { label: "Max LTC", value: "90%" },
          { label: "Max ARV", value: "75%" },
          { label: "Loan Range", value: "$75K - $3M" },
          { label: "Terms", value: "12-24 mo" },
        ],
      } as StatsBarSectionConfig,
    },
    {
      id: "flip-funded-1",
      type: "recently_funded",
      title: "Recently Funded Flips",
      isVisible: true,
      order: 3,
      config: {
        title: "Recently Funded Fix & Flip Projects",
        maxItems: 6,
        showRate: true,
        showCloseTime: true,
        autoScroll: true,
      } as RecentlyFundedSectionConfig,
    },
    {
      id: "flip-faq-1",
      type: "faq",
      title: "Fix & Flip FAQ",
      isVisible: true,
      order: 4,
      config: {
        title: "Fix & Flip Loan FAQs",
        layout: "accordion",
        items: [
          { question: "How fast can you close?", answer: "We can close in as few as 5 business days for experienced investors with clean deals. Most loans close within 10-14 days." },
          { question: "How do rehab draws work?", answer: "After your initial purchase closes, we release rehab funds in draws as work is completed. Our inspectors typically approve draws within 24-48 hours." },
          { question: "What experience do I need?", answer: "We have programs for investors of all experience levels. First-time flippers can qualify with slightly lower leverage and may require additional documentation." },
          { question: "Can I refinance into a rental loan?", answer: "Yes! Many of our flip clients refinance completed projects into our DSCR program for long-term hold. We make this transition seamless." },
        ],
      } as FAQSectionConfig,
    },
    {
      id: "flip-cta-1",
      type: "cta_banner",
      title: "Call to Action",
      isVisible: true,
      order: 5,
      config: {
        headline: "Ready to Fund Your Next Flip?",
        description: "Get pre-approved and close faster than the competition",
        ctaText: "Get Your Quote",
        ctaLink: "/get-quote",
      } as CTABannerSectionConfig,
    },
  ],
  isActive: true,
};

// Default Construction page layout configuration
export const DEFAULT_CONSTRUCTION_PAGE_LAYOUT: Omit<InsertPageLayout, 'id'> = {
  pageId: "construction",
  pageName: "Construction Page",
  sections: [
    {
      id: "const-hero-1",
      type: "hero",
      title: "Hero Section",
      isVisible: true,
      order: 0,
      config: {
        variant: "static",
        headline: "Ground-Up Construction Loans",
        subheadline: "Build your vision from the ground up with flexible construction financing.",
        ctaText: "Get Your Construction Quote",
        ctaLink: "/get-quote",
        showFundedDeals: false,
      } as HeroSectionConfig,
    },
    {
      id: "const-features-1",
      type: "feature_highlights",
      title: "Construction Benefits",
      isVisible: true,
      order: 1,
      config: {
        title: "Why Choose Our Construction Loans?",
        layout: "grid",
        columns: 3,
        features: [
          { icon: "Building2", title: "Ground-Up Financing", description: "From lot acquisition through vertical build" },
          { icon: "Layers", title: "Flexible Draw Schedule", description: "Draws based on your construction timeline" },
          { icon: "Percent", title: "Up to 85% LTC", description: "Maximize leverage on your build projects" },
          { icon: "Home", title: "Spec & Pre-Sold", description: "Programs for both speculative and pre-sold builds" },
          { icon: "Users", title: "Builder-Friendly", description: "Work with your preferred contractors" },
          { icon: "ArrowRightLeft", title: "Easy Exit Options", description: "Refinance to DSCR or sell upon completion" },
        ],
      } as FeatureHighlightsSectionConfig,
    },
    {
      id: "const-stats-1",
      type: "stats_bar",
      title: "Program Stats",
      isVisible: true,
      order: 2,
      config: {
        stats: [
          { label: "Max LTC", value: "85%" },
          { label: "Max ARV", value: "70%" },
          { label: "Loan Range", value: "$150K - $5M" },
          { label: "Terms", value: "12-24 mo" },
        ],
      } as StatsBarSectionConfig,
    },
    {
      id: "const-faq-1",
      type: "faq",
      title: "Construction FAQ",
      isVisible: true,
      order: 3,
      config: {
        title: "Construction Loan FAQs",
        layout: "accordion",
        items: [
          { question: "What types of construction do you finance?", answer: "We finance ground-up single family, townhomes, and small multi-family (2-4 units). Both spec builds and pre-sold projects qualify." },
          { question: "How do construction draws work?", answer: "Funds are released in stages based on completed construction milestones. Our draw process is designed to keep your project moving with quick inspections and approvals." },
          { question: "Do I need permits before applying?", answer: "You can apply before permits are in hand, but permits and approved plans are required before closing. We can issue a term sheet while you finalize permits." },
          { question: "What happens when construction is complete?", answer: "You can sell the property, refinance into a permanent loan like our DSCR program, or pay off the loan. We offer streamlined refinance options for completed projects." },
        ],
      } as FAQSectionConfig,
    },
    {
      id: "const-cta-1",
      type: "cta_banner",
      title: "Call to Action",
      isVisible: true,
      order: 4,
      config: {
        headline: "Ready to Build?",
        description: "Get financing for your next construction project",
        ctaText: "Get Your Quote",
        ctaLink: "/get-quote",
      } as CTABannerSectionConfig,
    },
  ],
  isActive: true,
};

// Default About page layout configuration
export const DEFAULT_ABOUT_PAGE_LAYOUT: Omit<InsertPageLayout, 'id'> = {
  pageId: "about",
  pageName: "About Page",
  sections: [
    {
      id: "about-hero-1",
      type: "hero",
      title: "Hero Section",
      isVisible: true,
      order: 0,
      config: {
        variant: "static",
        headline: "About Sequel Investments",
        subheadline: "A lender built by investors, for investors. We understand your deals because we've done them ourselves.",
        ctaText: "Get Started",
        ctaLink: "/get-quote",
        showFundedDeals: false,
      } as HeroSectionConfig,
    },
    {
      id: "about-trust-1",
      type: "trust_indicators",
      title: "Trust Indicators",
      isVisible: true,
      order: 1,
      config: {
        showYearsInBusiness: true,
        showTotalFunded: true,
        showStatesServed: true,
        showActiveLoans: true,
      } as TrustIndicatorsSectionConfig,
    },
    {
      id: "about-features-1",
      type: "feature_highlights",
      title: "Our Values",
      isVisible: true,
      order: 2,
      config: {
        title: "What Sets Us Apart",
        layout: "grid",
        columns: 3,
        features: [
          { icon: "Handshake", title: "Investor-First Mindset", description: "We're investors too—we understand your timelines and needs" },
          { icon: "Zap", title: "Speed & Reliability", description: "Fast decisions and consistent execution on every deal" },
          { icon: "MessageSquare", title: "Transparent Communication", description: "Clear terms, no hidden fees, responsive team" },
          { icon: "Target", title: "Tailored Solutions", description: "Loan programs designed for real investment strategies" },
          { icon: "Shield", title: "Proven Track Record", description: "Hundreds of millions funded across the country" },
          { icon: "Users", title: "Dedicated Support", description: "Your own loan specialist from application to close" },
        ],
      } as FeatureHighlightsSectionConfig,
    },
    {
      id: "about-testimonials-1",
      type: "testimonials",
      title: "Client Testimonials",
      isVisible: true,
      order: 3,
      config: {
        layout: "carousel",
        showRatings: true,
      } as TestimonialsSectionConfig,
    },
    {
      id: "about-cta-1",
      type: "cta_banner",
      title: "Call to Action",
      isVisible: true,
      order: 4,
      config: {
        headline: "Ready to Work Together?",
        description: "Experience the difference of a lender who understands investors",
        ctaText: "Contact Us",
        ctaLink: "/contact",
      } as CTABannerSectionConfig,
    },
  ],
  isActive: true,
};

// Default Contact page layout configuration
export const DEFAULT_CONTACT_PAGE_LAYOUT: Omit<InsertPageLayout, 'id'> = {
  pageId: "contact",
  pageName: "Contact Page",
  sections: [
    {
      id: "contact-hero-1",
      type: "hero",
      title: "Hero Section",
      isVisible: true,
      order: 0,
      config: {
        variant: "static",
        headline: "Contact Us",
        subheadline: "Have questions? Our team is here to help. Reach out and we'll get back to you quickly.",
        ctaText: "Call Now",
        ctaLink: "tel:+1234567890",
        showFundedDeals: false,
      } as HeroSectionConfig,
    },
    {
      id: "contact-form-1",
      type: "lead_form",
      title: "Contact Form",
      isVisible: true,
      order: 1,
      config: {
        title: "Send Us a Message",
        description: "Fill out the form below and a member of our team will reach out within one business day.",
        formType: "contact",
        showPhoneField: true,
        showPropertyAddress: false,
        showLoanAmount: false,
      } as LeadFormSectionConfig,
    },
    {
      id: "contact-faq-1",
      type: "faq",
      title: "Contact FAQ",
      isVisible: true,
      order: 2,
      config: {
        title: "Common Questions",
        layout: "accordion",
        items: [
          { question: "What are your business hours?", answer: "Our team is available Monday through Friday, 9 AM to 6 PM Eastern Time. You can submit inquiries anytime through our website." },
          { question: "How quickly will I hear back?", answer: "We typically respond to all inquiries within one business day. For urgent matters, we recommend calling our office directly." },
          { question: "Can I schedule a call?", answer: "Yes! You can book a consultation through our borrower portal or request a callback through the contact form." },
        ],
      } as FAQSectionConfig,
    },
  ],
  isActive: true,
};

// Default Resources page layout configuration
export const DEFAULT_RESOURCES_PAGE_LAYOUT: Omit<InsertPageLayout, 'id'> = {
  pageId: "resources",
  pageName: "Resources Page",
  sections: [
    {
      id: "resources-hero-1",
      type: "hero",
      title: "Hero Section",
      isVisible: true,
      order: 0,
      config: {
        variant: "static",
        headline: "Investor Resources",
        subheadline: "Tools, guides, and calculators to help you analyze deals and make smarter investment decisions.",
        ctaText: "Browse Resources",
        ctaLink: "#resources",
        showFundedDeals: false,
      } as HeroSectionConfig,
    },
    {
      id: "resources-features-1",
      type: "feature_highlights",
      title: "Resource Categories",
      isVisible: true,
      order: 1,
      config: {
        title: "Explore Our Resources",
        layout: "grid",
        columns: 3,
        features: [
          { icon: "Calculator", title: "Deal Calculators", description: "DSCR, Fix & Flip, and Construction calculators to analyze your deals" },
          { icon: "BookOpen", title: "Investment Guides", description: "In-depth guides on loan programs and investment strategies" },
          { icon: "TrendingUp", title: "Market Insights", description: "Data and trends to inform your investment decisions" },
          { icon: "FileText", title: "Loan Programs", description: "Detailed information on all our financing options" },
          { icon: "Map", title: "State Resources", description: "Market data and lending info for each state we serve" },
          { icon: "HelpCircle", title: "FAQs", description: "Answers to common questions about our loan programs" },
        ],
      } as FeatureHighlightsSectionConfig,
    },
    {
      id: "resources-cta-1",
      type: "cta_banner",
      title: "Call to Action",
      isVisible: true,
      order: 2,
      config: {
        headline: "Ready to Analyze Your Next Deal?",
        description: "Use our free calculators to evaluate your investment",
        ctaText: "Try Our Calculators",
        ctaLink: "/resources/dscr-calculator",
      } as CTABannerSectionConfig,
    },
  ],
  isActive: true,
};

// ============================================
// SECTION PRESETS (Pre-built Section Templates)
// ============================================

export type SectionPresetCategory = 
  | "hero" 
  | "trust" 
  | "products" 
  | "testimonials" 
  | "faq" 
  | "features" 
  | "cta" 
  | "content" 
  | "map" 
  | "form"
  | "stats"
  | "funded"
  | "process"
  | "comparison"
  | "badges";

export interface SectionPreset {
  id: string;
  name: string;
  description: string;
  type: typeof sectionTypes[number];
  config: SectionConfig;
  category: SectionPresetCategory;
  thumbnail?: string;
}

export const SECTION_PRESETS: SectionPreset[] = [
  // ========== HERO PRESETS ==========
  {
    id: "hero-standard",
    name: "Standard Hero",
    description: "Full-width hero with headline, subheadline, and CTA button",
    type: "hero",
    category: "hero",
    config: {
      variant: "carousel",
      headline: "Fast, Flexible Real Estate Investment Loans",
      subheadline: "Close in as few as 5 days with competitive rates and no prepayment penalties",
      ctaText: "Get Your Quote",
      ctaLink: "/get-quote",
      showFundedDeals: true,
    } as HeroSectionConfig,
  },
  {
    id: "hero-minimal",
    name: "Minimal Hero",
    description: "Clean, minimal hero with centered text",
    type: "hero",
    category: "hero",
    config: {
      variant: "static",
      headline: "Investment Loans Made Simple",
      subheadline: "From application to closing in days, not months",
      ctaText: "Apply Now",
      ctaLink: "/get-quote",
      showFundedDeals: false,
    } as HeroSectionConfig,
  },
  {
    id: "hero-rate-focused",
    name: "Rate-Focused Hero",
    description: "Hero highlighting current rates and terms",
    type: "hero",
    category: "hero",
    config: {
      variant: "split",
      headline: "Rates Starting at 7.99%",
      subheadline: "DSCR loans up to $5M with no income verification required",
      ctaText: "Check Your Rate",
      ctaLink: "/get-quote",
      secondaryCtaText: "View Programs",
      secondaryCtaLink: "/loan-programs",
      showFundedDeals: true,
    } as HeroSectionConfig,
  },
  {
    id: "hero-dscr",
    name: "DSCR Product Hero",
    description: "Hero specifically for DSCR loan product page",
    type: "hero",
    category: "hero",
    config: {
      variant: "split",
      headline: "DSCR Loans for Real Estate Investors",
      subheadline: "Qualify based on property cash flow, not personal income. Perfect for building your rental portfolio.",
      ctaText: "Get DSCR Quote",
      ctaLink: "/get-quote?type=dscr",
      showFundedDeals: false,
    } as HeroSectionConfig,
  },
  {
    id: "hero-fixflip",
    name: "Fix & Flip Hero",
    description: "Hero for fix & flip loan product page",
    type: "hero",
    category: "hero",
    config: {
      variant: "split",
      headline: "Fix & Flip Financing That Moves Fast",
      subheadline: "Close in as few as 5 days. Up to 90% LTC and 75% LTARV for your next flip.",
      ctaText: "Get Fix & Flip Quote",
      ctaLink: "/get-quote?type=fixflip",
      showFundedDeals: false,
    } as HeroSectionConfig,
  },
  {
    id: "hero-construction",
    name: "Construction Loan Hero",
    description: "Hero for new construction loan product page",
    type: "hero",
    category: "hero",
    config: {
      variant: "split",
      headline: "Ground-Up Construction Financing",
      subheadline: "Build from the ground up with flexible draw schedules and competitive rates.",
      ctaText: "Get Construction Quote",
      ctaLink: "/get-quote?type=construction",
      showFundedDeals: false,
    } as HeroSectionConfig,
  },
  {
    id: "hero-summit-stats",
    name: "Summit Stats Hero",
    description: "Dramatic full-screen hero with animated stats, dark background, and gold/purple accents - ideal for premium investor-focused branding",
    type: "hero",
    category: "hero",
    config: {
      variant: "stats_centered",
      headline: "Elevate Your Investments",
      subheadline: "Access premium lending solutions designed for high-net-worth investors. Fast closings, competitive rates, and white-glove service.",
      ctaText: "Get Started",
      ctaLink: "/get-quote",
      secondaryCtaText: "View Products",
      secondaryCtaLink: "/loan-programs",
      darkBackground: true,
      accentColor: "gold",
      badge: {
        text: "Private lending for sophisticated investors",
        icon: "Shield",
      },
      animatedStats: [
        { value: 1200, prefix: "$", suffix: "M+", label: "Funded" },
        { value: 2500, prefix: "", suffix: "+", label: "Deals Closed" },
        { value: 47, prefix: "", suffix: "", label: "States" },
      ],
      featurePills: [
        { icon: "TrendingUp", text: "Institutional-Grade Underwriting" },
        { icon: "Zap", text: "24-Hour Term Sheets" },
        { icon: "Shield", text: "Dedicated Account Manager" },
      ],
    } as HeroSectionConfig,
  },

  // ========== TRUST INDICATORS PRESETS ==========
  {
    id: "trust-full",
    name: "Full Trust Bar",
    description: "All trust indicators displayed",
    type: "trust_indicators",
    category: "trust",
    config: {
      showYearsInBusiness: true,
      showTotalFunded: true,
      showStatesServed: true,
      showActiveLoans: true,
    } as TrustIndicatorsSectionConfig,
  },
  {
    id: "trust-compact",
    name: "Compact Trust Bar",
    description: "Minimal trust indicators - years and total funded",
    type: "trust_indicators",
    category: "trust",
    config: {
      showYearsInBusiness: true,
      showTotalFunded: true,
      showStatesServed: false,
      showActiveLoans: false,
    } as TrustIndicatorsSectionConfig,
  },
  {
    id: "trust-custom",
    name: "Custom Stats",
    description: "Custom trust statistics",
    type: "trust_indicators",
    category: "trust",
    config: {
      showYearsInBusiness: false,
      showTotalFunded: false,
      showStatesServed: false,
      showActiveLoans: false,
      customStats: [
        { label: "Average Close Time", value: "7 Days", icon: "Clock" },
        { label: "Approval Rate", value: "94%", icon: "CheckCircle" },
        { label: "Repeat Borrowers", value: "78%", icon: "Users" },
        { label: "Properties Funded", value: "12,500+", icon: "Building" },
      ],
    } as TrustIndicatorsSectionConfig,
  },

  // ========== LOAN PRODUCTS PRESETS ==========
  {
    id: "products-all",
    name: "All Loan Products",
    description: "Display all three loan products",
    type: "loan_products",
    category: "products",
    config: {
      showDSCR: true,
      showFixFlip: true,
      showConstruction: true,
      customTitle: "Our Loan Programs",
      cardStyle: "default",
    } as LoanProductsSectionConfig,
  },
  {
    id: "products-dscr-only",
    name: "DSCR Focus",
    description: "Highlight DSCR loans only",
    type: "loan_products",
    category: "products",
    config: {
      showDSCR: true,
      showFixFlip: false,
      showConstruction: false,
      customTitle: "DSCR Loan Programs",
      cardStyle: "detailed",
    } as LoanProductsSectionConfig,
  },
  {
    id: "products-bridge",
    name: "Bridge Loans Focus",
    description: "Highlight Fix & Flip and Construction",
    type: "loan_products",
    category: "products",
    config: {
      showDSCR: false,
      showFixFlip: true,
      showConstruction: true,
      customTitle: "Bridge Loan Programs",
      cardStyle: "default",
    } as LoanProductsSectionConfig,
  },
  {
    id: "products-compact",
    name: "Compact Product Cards",
    description: "Smaller, compact product cards",
    type: "loan_products",
    category: "products",
    config: {
      showDSCR: true,
      showFixFlip: true,
      showConstruction: true,
      customTitle: "Loan Programs",
      cardStyle: "compact",
    } as LoanProductsSectionConfig,
  },

  // ========== TESTIMONIALS PRESETS ==========
  {
    id: "testimonials-carousel",
    name: "Testimonial Carousel",
    description: "Auto-scrolling testimonial carousel",
    type: "testimonials",
    category: "testimonials",
    config: {
      layout: "carousel",
      showRatings: true,
    } as TestimonialsSectionConfig,
  },
  {
    id: "testimonials-grid",
    name: "Testimonial Grid",
    description: "Static grid of testimonials",
    type: "testimonials",
    category: "testimonials",
    config: {
      layout: "grid",
      showRatings: true,
    } as TestimonialsSectionConfig,
  },
  {
    id: "testimonials-featured",
    name: "Featured Testimonials",
    description: "Large featured testimonials list",
    type: "testimonials",
    category: "testimonials",
    config: {
      layout: "list",
      showRatings: true,
    } as TestimonialsSectionConfig,
  },

  // ========== FAQ PRESETS ==========
  {
    id: "faq-general",
    name: "General FAQs",
    description: "Common questions about the lending process",
    type: "faq",
    category: "faq",
    config: {
      title: "Frequently Asked Questions",
      layout: "accordion",
      items: [
        { question: "How quickly can you close a loan?", answer: "We can close loans in as few as 5-7 business days for fix & flip and bridge loans. DSCR loans typically close in 14-21 days." },
        { question: "What credit score do I need?", answer: "We work with borrowers with credit scores as low as 620. Higher scores may qualify for better rates and terms." },
        { question: "Do you verify personal income?", answer: "For DSCR loans, we qualify based on property cash flow, not personal income. Fix & flip loans focus on the deal and experience rather than income." },
        { question: "What states do you lend in?", answer: "We currently lend in 47 states. Contact us to confirm availability in your state." },
        { question: "Is there a prepayment penalty?", answer: "Most of our bridge loan products have no prepayment penalty. DSCR loans may have prepayment terms depending on the program." },
      ],
    } as FAQSectionConfig,
  },
  {
    id: "faq-dscr",
    name: "DSCR Loan FAQs",
    description: "Questions specific to DSCR loans",
    type: "faq",
    category: "faq",
    config: {
      title: "DSCR Loan Questions",
      layout: "accordion",
      items: [
        { question: "What is a DSCR loan?", answer: "A Debt Service Coverage Ratio (DSCR) loan is a type of investment property loan where qualification is based on the property's rental income rather than the borrower's personal income." },
        { question: "What DSCR ratio do I need?", answer: "We offer loans starting at 0.75 DSCR. A ratio of 1.0 or higher (where rent covers the mortgage) typically qualifies for the best rates." },
        { question: "Can I use DSCR loans for short-term rentals?", answer: "Yes, we accept short-term rental income from platforms like Airbnb and VRBO with proper documentation of rental history." },
        { question: "How many DSCR loans can I have?", answer: "There is no limit to the number of DSCR loans you can have with us. We encourage building your portfolio with our programs." },
        { question: "What property types qualify for DSCR?", answer: "Single-family homes, 2-4 unit properties, condos, townhomes, and 5+ unit multifamily properties are all eligible." },
      ],
    } as FAQSectionConfig,
  },
  {
    id: "faq-fixflip",
    name: "Fix & Flip FAQs",
    description: "Questions specific to fix & flip loans",
    type: "faq",
    category: "faq",
    config: {
      title: "Fix & Flip Loan Questions",
      layout: "accordion",
      items: [
        { question: "How are rehab funds distributed?", answer: "Rehab funds are held in escrow and distributed in draws as work is completed. Inspections are typically done within 24-48 hours of a draw request." },
        { question: "What is the maximum loan-to-cost (LTC)?", answer: "We offer up to 90% LTC on purchases and 100% of rehab costs for experienced flippers. New investors typically start at 85% LTC." },
        { question: "Do I need flipping experience?", answer: "While we prefer experienced flippers, we work with first-time investors who have a solid team (contractor, real estate agent) in place." },
        { question: "What is the typical loan term?", answer: "Fix & flip loans typically have 12-month terms with options to extend up to 18 or 24 months if needed." },
        { question: "Can I use a fix & flip loan for a rental conversion?", answer: "Yes, we can structure bridge-to-DSCR financing where you can refinance into a long-term DSCR loan after renovations are complete." },
      ],
    } as FAQSectionConfig,
  },
  {
    id: "faq-construction",
    name: "Construction Loan FAQs",
    description: "Questions specific to construction loans",
    type: "faq",
    category: "faq",
    config: {
      title: "Construction Loan Questions",
      layout: "accordion",
      items: [
        { question: "What type of construction do you finance?", answer: "We finance ground-up new construction of residential properties including single-family homes, townhomes, and small multifamily projects." },
        { question: "How do construction draws work?", answer: "Draws are released based on completion milestones outlined in your construction budget. Inspections are conducted before each draw release." },
        { question: "Do I need permits before closing?", answer: "Yes, we require approved building permits prior to closing. We can provide pre-approval letters to help with your permit application." },
        { question: "What experience is required?", answer: "We typically require at least 1-2 completed ground-up projects or significant renovation experience. Joint ventures with experienced builders are also considered." },
        { question: "Can I include land acquisition in the loan?", answer: "Yes, we can include land acquisition or refinance existing land debt as part of the construction loan package." },
      ],
    } as FAQSectionConfig,
  },

  // ========== FEATURE HIGHLIGHTS PRESETS ==========
  {
    id: "features-why-us",
    name: "Why Choose Us",
    description: "Key differentiators and benefits",
    type: "feature_highlights",
    category: "features",
    config: {
      title: "Why Investors Choose Us",
      layout: "grid",
      columns: 3,
      features: [
        { icon: "Clock", title: "Fast Closings", description: "Close in as few as 5 days with our streamlined process" },
        { icon: "Shield", title: "No Prepayment Penalty", description: "Pay off your loan early without additional fees" },
        { icon: "Users", title: "Dedicated Support", description: "Work with a dedicated loan specialist from start to finish" },
        { icon: "DollarSign", title: "Competitive Rates", description: "Rates starting at 7.99% with transparent pricing" },
        { icon: "FileCheck", title: "Simple Process", description: "Minimal documentation with fast pre-approvals" },
        { icon: "Building2", title: "Portfolio Lending", description: "In-house underwriting for faster, flexible decisions" },
      ],
    } as FeatureHighlightsSectionConfig,
  },
  {
    id: "features-process",
    name: "Loan Process Steps",
    description: "Step-by-step loan process",
    type: "feature_highlights",
    category: "features",
    config: {
      title: "Simple 4-Step Process",
      layout: "cards",
      columns: 4,
      features: [
        { icon: "FileText", title: "1. Apply Online", description: "Complete our quick application in under 5 minutes" },
        { icon: "Search", title: "2. Get Pre-Approved", description: "Receive your pre-approval within 24 hours" },
        { icon: "ClipboardCheck", title: "3. Submit Documents", description: "Upload required documents through our secure portal" },
        { icon: "Key", title: "4. Close & Fund", description: "Close your loan and receive funding" },
      ],
    } as FeatureHighlightsSectionConfig,
  },
  {
    id: "features-dscr-benefits",
    name: "DSCR Benefits",
    description: "Key benefits of DSCR loans",
    type: "feature_highlights",
    category: "features",
    config: {
      title: "DSCR Loan Benefits",
      layout: "list",
      columns: 2,
      features: [
        { icon: "FileX", title: "No Income Verification", description: "Qualify based on property cash flow, not personal income" },
        { icon: "Banknote", title: "Cash-Out Available", description: "Access up to 75% of property value for cash-out refinance" },
        { icon: "Building", title: "Unlimited Properties", description: "No cap on the number of investment properties" },
        { icon: "TrendingUp", title: "Interest-Only Options", description: "Improve cash flow with interest-only payment periods" },
      ],
    } as FeatureHighlightsSectionConfig,
  },

  // ========== CTA BANNER PRESETS ==========
  {
    id: "cta-standard",
    name: "Standard CTA",
    description: "Simple call-to-action with button",
    type: "cta_banner",
    category: "cta",
    config: {
      headline: "Ready to Get Started?",
      description: "Get your personalized rate quote in minutes. No obligation, no impact to your credit.",
      ctaText: "Get Your Quote",
      ctaLink: "/get-quote",
    } as CTABannerSectionConfig,
  },
  {
    id: "cta-urgent",
    name: "Urgency CTA",
    description: "CTA with urgency messaging",
    type: "cta_banner",
    category: "cta",
    config: {
      headline: "Don't Miss Your Next Deal",
      description: "Get pre-approved today so you're ready to move when the right opportunity comes.",
      ctaText: "Get Pre-Approved Now",
      ctaLink: "/get-quote",
    } as CTABannerSectionConfig,
  },
  {
    id: "cta-consultation",
    name: "Consultation CTA",
    description: "CTA for scheduling a consultation",
    type: "cta_banner",
    category: "cta",
    config: {
      headline: "Questions? Let's Talk.",
      description: "Schedule a free consultation with one of our loan specialists to discuss your investment goals.",
      ctaText: "Schedule Consultation",
      ctaLink: "/contact",
    } as CTABannerSectionConfig,
  },
  {
    id: "cta-calculator",
    name: "Calculator CTA",
    description: "CTA promoting loan calculators",
    type: "cta_banner",
    category: "cta",
    config: {
      headline: "Crunch the Numbers",
      description: "Use our free calculators to analyze your next deal and see potential returns.",
      ctaText: "Try Our Calculators",
      ctaLink: "/calculators",
    } as CTABannerSectionConfig,
  },

  // ========== STATS BAR PRESETS ==========
  {
    id: "stats-lending",
    name: "Lending Stats",
    description: "Key lending statistics",
    type: "stats_bar",
    category: "stats",
    config: {
      stats: [
        { value: "500", label: "Loans Closed Annually", suffix: "+" },
        { value: "250", label: "Million Funded", prefix: "$", suffix: "M" },
        { value: "7", label: "Day Average Close", suffix: " Days" },
        { value: "47", label: "States Served" },
      ],
    } as StatsBarSectionConfig,
  },
  {
    id: "stats-performance",
    name: "Performance Stats",
    description: "Performance and service metrics",
    type: "stats_bar",
    category: "stats",
    config: {
      stats: [
        { value: "94", label: "Approval Rate", suffix: "%" },
        { value: "4.9", label: "Customer Rating", suffix: "/5" },
        { value: "78", label: "Repeat Borrowers", suffix: "%" },
        { value: "24/7", label: "Online Portal Access", suffix: "" },
      ],
    } as StatsBarSectionConfig,
  },

  // ========== LEAD FORM PRESETS ==========
  {
    id: "lead-simple",
    name: "Simple Lead Form",
    description: "Basic contact form with essential fields",
    type: "lead_form",
    category: "form",
    config: {
      title: "Get Your Free Quote",
      description: "Fill out the form below and we'll get back to you within 24 hours.",
      ctaText: "Submit",
      showPhone: true,
      showLoanAmount: false,
      showPropertyType: false,
    } as LeadFormSectionConfig,
  },
  {
    id: "lead-detailed",
    name: "Detailed Lead Form",
    description: "Comprehensive form with loan details",
    type: "lead_form",
    category: "form",
    config: {
      title: "Request Your Custom Quote",
      description: "Provide details about your investment and we'll prepare a personalized quote.",
      ctaText: "Get My Quote",
      showPhone: true,
      showLoanAmount: true,
      showPropertyType: true,
    } as LeadFormSectionConfig,
  },

  // ========== RECENTLY FUNDED PRESETS ==========
  {
    id: "funded-carousel",
    name: "Funded Deals Carousel",
    description: "Auto-scrolling showcase of recent deals",
    type: "recently_funded",
    category: "funded",
    config: {
      title: "Recently Funded Deals",
      maxItems: 8,
      showRate: true,
      showCloseTime: true,
      autoScroll: true,
    } as RecentlyFundedSectionConfig,
  },
  {
    id: "funded-grid",
    name: "Funded Deals Grid",
    description: "Static grid of recent deals",
    type: "recently_funded",
    category: "funded",
    config: {
      title: "Our Recent Closings",
      maxItems: 6,
      showRate: true,
      showCloseTime: true,
      autoScroll: false,
    } as RecentlyFundedSectionConfig,
  },

  // ========== STATE MAP PRESETS ==========
  {
    id: "map-interactive",
    name: "Interactive Lending Map",
    description: "Interactive US map showing lending coverage",
    type: "state_map",
    category: "map",
    config: {
      title: "Where We Lend",
      description: "We provide investment property loans in 47 states across the nation.",
      showLoanVolume: true,
    } as StateMapSectionConfig,
  },
  {
    id: "map-simple",
    name: "Simple Coverage Map",
    description: "Simple map showing state coverage",
    type: "state_map",
    category: "map",
    config: {
      title: "Nationwide Coverage",
      showLoanVolume: false,
    } as StateMapSectionConfig,
  },

  // ========== CUSTOM CONTENT PRESETS ==========
  {
    id: "content-text-block",
    name: "Text Block",
    description: "Rich text content section",
    type: "custom_content",
    category: "content",
    config: {
      paddingTop: "4rem",
      paddingBottom: "4rem",
    } as CustomContentSectionConfig,
  },

  // ========== PROCESS STEPS PRESETS ==========
  {
    id: "process-steps-default",
    name: "Process Steps",
    description: "Fast, Simple, Funding style with 3 steps",
    type: "process_steps",
    category: "process",
    config: {
      title: "How It Works",
      steps: [
        { icon: "Zap", title: "Fast", description: "Apply in minutes with our streamlined online application" },
        { icon: "CheckCircle", title: "Simple", description: "No tax returns needed. We focus on property cash flow" },
        { icon: "DollarSign", title: "Funding", description: "Close in as few as 5 days with competitive rates" },
      ],
      layout: "row",
      columns: 3,
      showConnectors: true,
    } as ProcessStepsSectionConfig,
  },
  {
    id: "process-steps-numbered",
    name: "Numbered Steps",
    description: "4-step process with numbered steps",
    type: "process_steps",
    category: "process",
    config: {
      title: "Your Path to Funding",
      steps: [
        { icon: "FileText", title: "Apply Online", description: "Complete our simple application in under 10 minutes" },
        { icon: "Search", title: "Quick Review", description: "Our team reviews your application within 24 hours" },
        { icon: "FileCheck", title: "Get Approved", description: "Receive your term sheet and loan approval" },
        { icon: "Banknote", title: "Get Funded", description: "Close and receive your funds" },
      ],
      layout: "grid",
      columns: 4,
      showConnectors: true,
    } as ProcessStepsSectionConfig,
  },

  // ========== PRODUCT COMPARISON PRESETS ==========
  {
    id: "product-comparison-loans",
    name: "Loan Comparison",
    description: "Compare different loan products with specs",
    type: "product_comparison",
    category: "comparison",
    config: {
      title: "Compare Our Loan Products",
      description: "Find the right financing solution for your investment strategy",
      products: [
        {
          icon: "Building2",
          name: "DSCR Loan",
          description: "Long-term rental financing based on property cash flow",
          specs: [
            { label: "Loan Amount", value: "$75K - $3M" },
            { label: "Term", value: "30 Years" },
            { label: "LTV", value: "Up to 80%" },
            { label: "Min DSCR", value: "1.0" },
          ],
          ctaText: "Get DSCR Quote",
          ctaLink: "/get-quote?type=dscr",
        },
        {
          icon: "Hammer",
          name: "Fix & Flip",
          description: "Short-term bridge financing for property renovations",
          specs: [
            { label: "Loan Amount", value: "$100K - $2M" },
            { label: "Term", value: "12-24 Months" },
            { label: "LTC", value: "Up to 90%" },
            { label: "LTARV", value: "Up to 75%" },
          ],
          ctaText: "Get Bridge Quote",
          ctaLink: "/get-quote?type=fixflip",
        },
        {
          icon: "HardHat",
          name: "Construction",
          description: "Ground-up construction financing with draw schedules",
          specs: [
            { label: "Loan Amount", value: "$250K - $5M" },
            { label: "Term", value: "12-18 Months" },
            { label: "LTC", value: "Up to 85%" },
            { label: "Interest", value: "Interest Only" },
          ],
          ctaText: "Get Construction Quote",
          ctaLink: "/get-quote?type=construction",
        },
      ],
      layout: "cards",
      showCTA: true,
    } as ProductComparisonSectionConfig,
  },

  // ========== PARTNER BADGES PRESETS ==========
  {
    id: "partner-badges-trust",
    name: "Trust Badges",
    description: "BBB and TrustPilot style trust badges",
    type: "partner_badges",
    category: "badges",
    config: {
      title: "Trusted By Investors",
      badges: [
        { name: "BBB Accredited", rating: "A+", icon: "Shield" },
        { name: "TrustPilot", rating: "4.8/5", icon: "Star" },
        { name: "Google Reviews", rating: "4.9/5", icon: "Star" },
        { name: "NMLS Licensed", rating: "#123456", icon: "BadgeCheck" },
      ],
      layout: "row",
      showLinks: false,
    } as PartnerBadgesSectionConfig,
  },
  {
    id: "partner-badges-minimal",
    name: "Minimal Badges",
    description: "Clean, minimal partner badges",
    type: "partner_badges",
    category: "badges",
    config: {
      badges: [
        { name: "BBB Accredited", icon: "Shield" },
        { name: "Equal Housing Lender", icon: "Home" },
        { name: "NMLS Licensed", icon: "BadgeCheck" },
      ],
      layout: "row",
      showLinks: false,
    } as PartnerBadgesSectionConfig,
  },
];

// ============================================
// PAGE TEMPLATES (Recommended Layouts Per Page)
// ============================================

export type PageTemplateId = "home" | "dscr" | "fix_flip" | "construction" | "about" | "contact" | "resources";

export interface PageTemplate {
  id: PageTemplateId;
  name: string;
  description: string;
  sections: PageSection[];
}

export const PAGE_TEMPLATES: Record<PageTemplateId, PageTemplate> = {
  home: {
    id: "home",
    name: "Home Page",
    description: "Complete homepage with all key sections",
    sections: [
      { id: "hero-1", type: "hero", title: "Hero Section", isVisible: true, order: 0, config: SECTION_PRESETS.find(p => p.id === "hero-standard")!.config },
      { id: "trust-1", type: "trust_indicators", title: "Trust Indicators", isVisible: true, order: 1, config: SECTION_PRESETS.find(p => p.id === "trust-full")!.config },
      { id: "products-1", type: "loan_products", title: "Loan Products", isVisible: true, order: 2, config: SECTION_PRESETS.find(p => p.id === "products-all")!.config },
      { id: "features-1", type: "feature_highlights", title: "Why Choose Us", isVisible: true, order: 3, config: SECTION_PRESETS.find(p => p.id === "features-why-us")!.config },
      { id: "testimonials-1", type: "testimonials", title: "Testimonials", isVisible: true, order: 4, config: SECTION_PRESETS.find(p => p.id === "testimonials-carousel")!.config },
      { id: "funded-1", type: "recently_funded", title: "Recently Funded", isVisible: true, order: 5, config: SECTION_PRESETS.find(p => p.id === "funded-carousel")!.config },
      { id: "map-1", type: "state_map", title: "Where We Lend", isVisible: true, order: 6, config: SECTION_PRESETS.find(p => p.id === "map-interactive")!.config },
      { id: "faq-1", type: "faq", title: "FAQ", isVisible: true, order: 7, config: SECTION_PRESETS.find(p => p.id === "faq-general")!.config },
      { id: "cta-1", type: "cta_banner", title: "Call to Action", isVisible: true, order: 8, config: SECTION_PRESETS.find(p => p.id === "cta-standard")!.config },
    ],
  },
  dscr: {
    id: "dscr",
    name: "DSCR Loan Page",
    description: "Dedicated page for DSCR loan products",
    sections: [
      { id: "hero-1", type: "hero", title: "DSCR Hero", isVisible: true, order: 0, config: SECTION_PRESETS.find(p => p.id === "hero-dscr")!.config },
      { id: "stats-1", type: "stats_bar", title: "Stats Bar", isVisible: true, order: 1, config: SECTION_PRESETS.find(p => p.id === "stats-lending")!.config },
      { id: "features-1", type: "feature_highlights", title: "DSCR Benefits", isVisible: true, order: 2, config: SECTION_PRESETS.find(p => p.id === "features-dscr-benefits")!.config },
      { id: "process-1", type: "feature_highlights", title: "Process Steps", isVisible: true, order: 3, config: SECTION_PRESETS.find(p => p.id === "features-process")!.config },
      { id: "testimonials-1", type: "testimonials", title: "Testimonials", isVisible: true, order: 4, config: SECTION_PRESETS.find(p => p.id === "testimonials-grid")!.config },
      { id: "faq-1", type: "faq", title: "DSCR FAQ", isVisible: true, order: 5, config: SECTION_PRESETS.find(p => p.id === "faq-dscr")!.config },
      { id: "cta-1", type: "cta_banner", title: "Call to Action", isVisible: true, order: 6, config: SECTION_PRESETS.find(p => p.id === "cta-standard")!.config },
    ],
  },
  fix_flip: {
    id: "fix_flip",
    name: "Fix & Flip Page",
    description: "Dedicated page for fix & flip loans",
    sections: [
      { id: "hero-1", type: "hero", title: "Fix & Flip Hero", isVisible: true, order: 0, config: SECTION_PRESETS.find(p => p.id === "hero-fixflip")!.config },
      { id: "stats-1", type: "stats_bar", title: "Stats Bar", isVisible: true, order: 1, config: SECTION_PRESETS.find(p => p.id === "stats-lending")!.config },
      { id: "features-1", type: "feature_highlights", title: "Why Choose Us", isVisible: true, order: 2, config: SECTION_PRESETS.find(p => p.id === "features-why-us")!.config },
      { id: "process-1", type: "feature_highlights", title: "Process Steps", isVisible: true, order: 3, config: SECTION_PRESETS.find(p => p.id === "features-process")!.config },
      { id: "funded-1", type: "recently_funded", title: "Recently Funded", isVisible: true, order: 4, config: SECTION_PRESETS.find(p => p.id === "funded-grid")!.config },
      { id: "faq-1", type: "faq", title: "Fix & Flip FAQ", isVisible: true, order: 5, config: SECTION_PRESETS.find(p => p.id === "faq-fixflip")!.config },
      { id: "cta-1", type: "cta_banner", title: "Call to Action", isVisible: true, order: 6, config: SECTION_PRESETS.find(p => p.id === "cta-urgent")!.config },
    ],
  },
  construction: {
    id: "construction",
    name: "Construction Loan Page",
    description: "Dedicated page for construction loans",
    sections: [
      { id: "hero-1", type: "hero", title: "Construction Hero", isVisible: true, order: 0, config: SECTION_PRESETS.find(p => p.id === "hero-construction")!.config },
      { id: "stats-1", type: "stats_bar", title: "Stats Bar", isVisible: true, order: 1, config: SECTION_PRESETS.find(p => p.id === "stats-lending")!.config },
      { id: "features-1", type: "feature_highlights", title: "Why Choose Us", isVisible: true, order: 2, config: SECTION_PRESETS.find(p => p.id === "features-why-us")!.config },
      { id: "process-1", type: "feature_highlights", title: "Process Steps", isVisible: true, order: 3, config: SECTION_PRESETS.find(p => p.id === "features-process")!.config },
      { id: "faq-1", type: "faq", title: "Construction FAQ", isVisible: true, order: 4, config: SECTION_PRESETS.find(p => p.id === "faq-construction")!.config },
      { id: "cta-1", type: "cta_banner", title: "Call to Action", isVisible: true, order: 5, config: SECTION_PRESETS.find(p => p.id === "cta-standard")!.config },
    ],
  },
  about: {
    id: "about",
    name: "About Page",
    description: "Company about page with team and values",
    sections: [
      { id: "hero-1", type: "hero", title: "About Hero", isVisible: true, order: 0, config: { variant: "static", headline: "About Our Company", subheadline: "Empowering real estate investors with fast, flexible financing solutions." } as HeroSectionConfig },
      { id: "trust-1", type: "trust_indicators", title: "Trust Indicators", isVisible: true, order: 1, config: SECTION_PRESETS.find(p => p.id === "trust-full")!.config },
      { id: "features-1", type: "feature_highlights", title: "Our Values", isVisible: true, order: 2, config: SECTION_PRESETS.find(p => p.id === "features-why-us")!.config },
      { id: "testimonials-1", type: "testimonials", title: "Testimonials", isVisible: true, order: 3, config: SECTION_PRESETS.find(p => p.id === "testimonials-featured")!.config },
      { id: "cta-1", type: "cta_banner", title: "Call to Action", isVisible: true, order: 4, config: SECTION_PRESETS.find(p => p.id === "cta-consultation")!.config },
    ],
  },
  contact: {
    id: "contact",
    name: "Contact Page",
    description: "Contact page with lead form",
    sections: [
      { id: "hero-1", type: "hero", title: "Contact Hero", isVisible: true, order: 0, config: { variant: "static", headline: "Get In Touch", subheadline: "Our team is ready to help with your investment financing needs." } as HeroSectionConfig },
      { id: "lead-1", type: "lead_form", title: "Contact Form", isVisible: true, order: 1, config: SECTION_PRESETS.find(p => p.id === "lead-detailed")!.config },
      { id: "faq-1", type: "faq", title: "FAQ", isVisible: true, order: 2, config: SECTION_PRESETS.find(p => p.id === "faq-general")!.config },
    ],
  },
  resources: {
    id: "resources",
    name: "Resources Page",
    description: "Educational resources and tools",
    sections: [
      { id: "hero-1", type: "hero", title: "Resources Hero", isVisible: true, order: 0, config: { variant: "static", headline: "Investor Resources", subheadline: "Tools, guides, and insights to help you succeed in real estate investing." } as HeroSectionConfig },
      { id: "cta-1", type: "cta_banner", title: "Calculator CTA", isVisible: true, order: 1, config: SECTION_PRESETS.find(p => p.id === "cta-calculator")!.config },
      { id: "faq-1", type: "faq", title: "FAQ", isVisible: true, order: 2, config: SECTION_PRESETS.find(p => p.id === "faq-general")!.config },
      { id: "cta-2", type: "cta_banner", title: "Quote CTA", isVisible: true, order: 3, config: SECTION_PRESETS.find(p => p.id === "cta-standard")!.config },
    ],
  },
};

// Helper to get a section preset by ID
export function getSectionPreset(presetId: string): SectionPreset | undefined {
  return SECTION_PRESETS.find(p => p.id === presetId);
}

// Helper to get all presets for a category
export function getSectionPresetsByCategory(category: SectionPresetCategory): SectionPreset[] {
  return SECTION_PRESETS.filter(p => p.category === category);
}

// Helper to get all presets for a section type
export function getSectionPresetsByType(type: typeof sectionTypes[number]): SectionPreset[] {
  return SECTION_PRESETS.filter(p => p.type === type);
}

// Helper to get page template by ID
export function getPageTemplate(pageId: PageTemplateId): PageTemplate | undefined {
  return PAGE_TEMPLATES[pageId];
}

// ============================================
// AI-POWERED SEARCH TYPES
// ============================================

export type SearchContext = "public" | "borrower" | "admin";

export interface SearchIntent {
  type: "navigate" | "filter" | "entity" | "question";
  confidence: number;
  route?: string;
  filters?: Record<string, any>;
  entityType?: string;
  query: string;
}

export interface SearchResult {
  id: string;
  type: "page" | "product" | "resource" | "faq" | "application" | "document" | "user";
  title: string;
  description?: string;
  url?: string;
  icon?: string;
  metadata?: Record<string, any>;
}

export interface SearchResponse {
  intent: SearchIntent;
  results: SearchResult[];
  suggestions: string[];
}

// ============================================
// PREMIUM TEMPLATES
// ============================================

// Template categories
export const templateCategoryEnum = pgEnum("template_category", [
  "modern",
  "classic", 
  "minimal",
  "bold",
]);

// Color scheme type for templates
export interface TemplateColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted?: string;
  card?: string;
}

// Typography configuration
export interface TemplateTypography {
  headingFont: string;
  bodyFont: string;
  headingWeight?: string;
}

// Page layouts configuration for templates
export type TemplatePageLayoutsConfig = Partial<Record<PageTemplateId, PageSection[]>>;

// Premium templates table
export const premiumTemplates = pgTable("premium_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  category: templateCategoryEnum("category").default("modern"),
  
  // Visual preview
  thumbnailUrl: text("thumbnail_url"),
  previewUrl: text("preview_url"),
  screenshotUrls: jsonb("screenshot_urls").$type<string[]>().default([]),
  
  // Design configuration
  colorScheme: jsonb("color_scheme").$type<TemplateColorScheme>(),
  typography: jsonb("typography").$type<TemplateTypography>(),
  
  // Page layouts for this template
  pageLayoutsConfig: jsonb("page_layouts_config").$type<TemplatePageLayoutsConfig>(),
  
  // Additional styling options
  buttonStyle: varchar("button_style", { length: 50 }).default("rounded"), // "rounded" | "square" | "pill"
  borderRadius: varchar("border_radius", { length: 50 }).default("0.5rem"),
  themePreference: varchar("theme_preference", { length: 20 }).default("dark"), // "light" | "dark"
  
  // Metadata
  isPremium: boolean("is_premium").default(true).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_premium_templates_slug").on(table.slug),
  index("idx_premium_templates_active").on(table.isActive),
  index("idx_premium_templates_category").on(table.category),
]);

export type PremiumTemplate = typeof premiumTemplates.$inferSelect;
export type InsertPremiumTemplate = typeof premiumTemplates.$inferInsert;

export const insertPremiumTemplateSchema = createInsertSchema(premiumTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// White-label template assignments
export const whiteLabelTemplateAssignments = pgTable("white_label_template_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  whiteLabelSiteId: varchar("white_label_site_id")
    .references(() => whiteLabelSettings.id, { onDelete: "cascade" })
    .notNull(),
  templateId: varchar("template_id")
    .references(() => premiumTemplates.id, { onDelete: "set null" }),
  
  // Custom overrides after template selection
  colorOverrides: jsonb("color_overrides").$type<Partial<TemplateColorScheme>>(),
  typographyOverrides: jsonb("typography_overrides").$type<Partial<TemplateTypography>>(),
  contentOverrides: jsonb("content_overrides").$type<Record<string, any>>(),
  
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  customizedAt: timestamp("customized_at"),
}, (table) => [
  index("idx_wl_template_assignments_site").on(table.whiteLabelSiteId),
  index("idx_wl_template_assignments_template").on(table.templateId),
]);

export type WhiteLabelTemplateAssignment = typeof whiteLabelTemplateAssignments.$inferSelect;
export type InsertWhiteLabelTemplateAssignment = typeof whiteLabelTemplateAssignments.$inferInsert;

export const insertWhiteLabelTemplateAssignmentSchema = createInsertSchema(whiteLabelTemplateAssignments).omit({
  id: true,
  assignedAt: true,
});
