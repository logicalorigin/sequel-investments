import { 
  users, 
  leads, 
  loanApplications, 
  documents, 
  documentTypes,
  servicedLoans,
  loanPayments,
  loanDraws,
  loanEscrowItems,
  loanDocuments,
  loanMilestones,
  notifications,
  savedScenarios,
  userPreferences,
  connectedEntities,
  documentSignatures,
  coBorrowers,
  applicationTimeline,
  marketDataSnapshots,
  documentComments,
  staffInvites,
  fundedDeals,
  webhookEndpoints,
  webhookEvents,
  webhookDeliveryLogs,
  documentReviews,
  commentAttachments,
  notificationQueue,
  type User, 
  type UpsertUser,
  type Lead, 
  type InsertLead,
  type LoanApplication,
  type InsertLoanApplication,
  type Document,
  type InsertDocument,
  type DocumentType,
  type InsertDocumentType,
  type ServicedLoan,
  type InsertServicedLoan,
  type LoanPayment,
  type InsertLoanPayment,
  type LoanDraw,
  type InsertLoanDraw,
  type LoanEscrowItem,
  type InsertLoanEscrowItem,
  type LoanDocument,
  type InsertLoanDocument,
  type LoanMilestone,
  type InsertLoanMilestone,
  type Notification,
  type InsertNotification,
  type SavedScenario,
  type InsertSavedScenario,
  type UserPreferences,
  type InsertUserPreferences,
  type ConnectedEntity,
  type InsertConnectedEntity,
  type DocumentSignature,
  type InsertDocumentSignature,
  type CoBorrower,
  type InsertCoBorrower,
  type ApplicationTimelineEvent,
  type InsertApplicationTimelineEvent,
  type MarketDataSnapshot,
  type InsertMarketDataSnapshot,
  type DocumentComment,
  type InsertDocumentComment,
  type StaffInvite,
  type InsertStaffInvite,
  type FundedDeal,
  type InsertFundedDeal,
  type WebhookEndpoint,
  type InsertWebhookEndpoint,
  type WebhookEvent,
  type InsertWebhookEvent,
  type WebhookDeliveryLog,
  type InsertWebhookDeliveryLog,
  type DocumentReview,
  type InsertDocumentReview,
  type CommentAttachment,
  type InsertCommentAttachment,
  type NotificationQueueItem,
  type InsertNotificationQueueItem,
  type StaffRole,
  DEFAULT_DOCUMENT_TYPES,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createLocalUser(user: { username: string; password: string; email: string; firstName: string; lastName: string; role: "borrower" | "staff" | "admin" }): Promise<User>;
  updateUserPassword(userId: string, hashedPassword: string): Promise<void>;
  
  // Lead operations
  createLead(lead: InsertLead): Promise<Lead>;
  getLeads(): Promise<Lead[]>;
  getLead(id: string): Promise<Lead | undefined>;
  getLeadsByEmail(email: string): Promise<Lead[]>;
  markLeadConverted(leadId: string): Promise<void>;
  
  // Lead-to-Application conversion
  convertLeadsToApplications(userId: string, email: string): Promise<LoanApplication[]>;
  
  // Loan application operations
  createLoanApplication(application: InsertLoanApplication): Promise<LoanApplication>;
  getLoanApplications(userId: string): Promise<LoanApplication[]>;
  getLoanApplication(id: string): Promise<LoanApplication | undefined>;
  updateLoanApplication(id: string, data: Partial<InsertLoanApplication>): Promise<LoanApplication | undefined>;
  deleteLoanApplication(id: string): Promise<boolean>;
  
  // Document type operations
  getDocumentTypes(): Promise<DocumentType[]>;
  getDocumentTypesByLoanType(loanType: string): Promise<DocumentType[]>;
  seedDocumentTypes(): Promise<void>;
  
  // Document operations
  getDocumentsByApplication(applicationId: string): Promise<Document[]>;
  getDocument(id: string): Promise<Document | undefined>;
  createDocument(doc: InsertDocument): Promise<Document>;
  updateDocument(id: string, data: Partial<InsertDocument>): Promise<Document | undefined>;
  
  // Serviced loans operations
  getServicedLoans(userId: string): Promise<ServicedLoan[]>;
  getAllServicedLoans(): Promise<ServicedLoan[]>;
  getServicedLoan(id: string): Promise<ServicedLoan | undefined>;
  getServicedLoanByNumber(loanNumber: string): Promise<ServicedLoan | undefined>;
  createServicedLoan(loan: InsertServicedLoan): Promise<ServicedLoan>;
  updateServicedLoan(id: string, data: Partial<InsertServicedLoan>): Promise<ServicedLoan | undefined>;
  deleteServicedLoan(id: string): Promise<boolean>;
  
  // Loan payment operations
  getLoanPayments(servicedLoanId: string): Promise<LoanPayment[]>;
  getLoanPayment(id: string): Promise<LoanPayment | undefined>;
  createLoanPayment(payment: InsertLoanPayment): Promise<LoanPayment>;
  updateLoanPayment(id: string, data: Partial<InsertLoanPayment>): Promise<LoanPayment | undefined>;
  
  // Loan draw operations (for hard money loans)
  getLoanDraws(servicedLoanId: string): Promise<LoanDraw[]>;
  getLoanDraw(id: string): Promise<LoanDraw | undefined>;
  createLoanDraw(draw: InsertLoanDraw): Promise<LoanDraw>;
  updateLoanDraw(id: string, data: Partial<InsertLoanDraw>): Promise<LoanDraw | undefined>;
  deleteLoanDraw(id: string): Promise<boolean>;
  
  // Loan escrow operations (for DSCR loans)
  getLoanEscrowItems(servicedLoanId: string): Promise<LoanEscrowItem[]>;
  getLoanEscrowItem(id: string): Promise<LoanEscrowItem | undefined>;
  createLoanEscrowItem(item: InsertLoanEscrowItem): Promise<LoanEscrowItem>;
  updateLoanEscrowItem(id: string, data: Partial<InsertLoanEscrowItem>): Promise<LoanEscrowItem | undefined>;
  deleteLoanEscrowItem(id: string): Promise<boolean>;
  
  // Loan documents operations
  getLoanDocuments(servicedLoanId: string): Promise<LoanDocument[]>;
  getLoanDocument(id: string): Promise<LoanDocument | undefined>;
  createLoanDocument(doc: InsertLoanDocument): Promise<LoanDocument>;
  deleteLoanDocument(id: string): Promise<boolean>;
  
  // Loan milestones operations (for construction)
  getLoanMilestones(servicedLoanId: string): Promise<LoanMilestone[]>;
  getLoanMilestone(id: string): Promise<LoanMilestone | undefined>;
  createLoanMilestone(milestone: InsertLoanMilestone): Promise<LoanMilestone>;
  updateLoanMilestone(id: string, data: Partial<InsertLoanMilestone>): Promise<LoanMilestone | undefined>;
  deleteLoanMilestone(id: string): Promise<boolean>;
  
  // Notification operations
  getNotifications(userId: string): Promise<Notification[]>;
  getUnreadNotificationCount(userId: string): Promise<number>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: string): Promise<Notification | undefined>;
  markAllNotificationsRead(userId: string): Promise<void>;
  deleteNotification(id: string): Promise<boolean>;
  
  // Saved scenarios operations
  getSavedScenarios(userId: string, type?: string): Promise<SavedScenario[]>;
  getSavedScenario(id: string): Promise<SavedScenario | undefined>;
  createSavedScenario(scenario: InsertSavedScenario): Promise<SavedScenario>;
  updateSavedScenario(id: string, data: Partial<InsertSavedScenario>): Promise<SavedScenario | undefined>;
  deleteSavedScenario(id: string): Promise<boolean>;
  
  // User preferences operations
  getUserPreferences(userId: string): Promise<UserPreferences | undefined>;
  upsertUserPreferences(prefs: InsertUserPreferences): Promise<UserPreferences>;
  
  // Connected entities operations
  getConnectedEntities(userId: string): Promise<ConnectedEntity[]>;
  getConnectedEntity(id: string): Promise<ConnectedEntity | undefined>;
  createConnectedEntity(entity: InsertConnectedEntity): Promise<ConnectedEntity>;
  updateConnectedEntity(id: string, data: Partial<InsertConnectedEntity>): Promise<ConnectedEntity | undefined>;
  deleteConnectedEntity(id: string): Promise<boolean>;
  
  // Document signatures operations
  getDocumentSignatures(documentId: string): Promise<DocumentSignature[]>;
  getDocumentSignature(id: string): Promise<DocumentSignature | undefined>;
  createDocumentSignature(signature: InsertDocumentSignature): Promise<DocumentSignature>;
  updateDocumentSignature(id: string, data: Partial<InsertDocumentSignature>): Promise<DocumentSignature | undefined>;
  
  // Co-borrower operations
  getCoBorrowers(applicationId: string): Promise<CoBorrower[]>;
  getCoBorrowerByToken(token: string): Promise<CoBorrower | undefined>;
  createCoBorrower(coBorrower: InsertCoBorrower): Promise<CoBorrower>;
  updateCoBorrower(id: string, data: Partial<InsertCoBorrower>): Promise<CoBorrower | undefined>;
  deleteCoBorrower(id: string): Promise<boolean>;
  
  // Application timeline operations
  getApplicationTimeline(applicationId: string): Promise<ApplicationTimelineEvent[]>;
  createTimelineEvent(event: InsertApplicationTimelineEvent): Promise<ApplicationTimelineEvent>;
  
  // Market data cache operations
  getMarketDataSnapshot(stateSlug: string): Promise<MarketDataSnapshot | undefined>;
  getLatestMarketData(stateSlug: string): Promise<MarketDataSnapshot | undefined>;
  createMarketDataSnapshot(snapshot: InsertMarketDataSnapshot): Promise<MarketDataSnapshot>;
  getAllMarketDataSnapshots(): Promise<MarketDataSnapshot[]>;
  
  // Document comment operations
  getDocumentComments(documentId: string): Promise<(DocumentComment & { user: User | null })[]>;
  getDocumentComment(id: string): Promise<DocumentComment | undefined>;
  createDocumentComment(comment: InsertDocumentComment): Promise<DocumentComment>;
  updateDocumentComment(id: string, data: Partial<InsertDocumentComment>): Promise<DocumentComment | undefined>;
  deleteDocumentComment(id: string): Promise<boolean>;
  
  // Staff invite operations
  createStaffInvite(invite: InsertStaffInvite): Promise<StaffInvite>;
  getStaffInviteByToken(token: string): Promise<StaffInvite | undefined>;
  getStaffInvites(): Promise<StaffInvite[]>;
  updateStaffInvite(id: string, data: Partial<InsertStaffInvite>): Promise<StaffInvite | undefined>;
  acceptStaffInvite(token: string, userId: string): Promise<StaffInvite | undefined>;
  
  // Admin operations
  getAllUsers(): Promise<User[]>;
  updateUserRole(id: string, role: string): Promise<User | undefined>;
  getAllLoanApplications(): Promise<LoanApplication[]>;
  
  // Funded deals operations
  getFundedDeals(visibleOnly?: boolean): Promise<FundedDeal[]>;
  getFundedDeal(id: string): Promise<FundedDeal | undefined>;
  createFundedDeal(deal: InsertFundedDeal): Promise<FundedDeal>;
  updateFundedDeal(id: string, data: Partial<InsertFundedDeal>): Promise<FundedDeal | undefined>;
  deleteFundedDeal(id: string): Promise<boolean>;
  
  // Webhook endpoint operations
  getWebhookEndpoints(): Promise<WebhookEndpoint[]>;
  getWebhookEndpoint(id: string): Promise<WebhookEndpoint | undefined>;
  getActiveWebhookEndpoints(): Promise<WebhookEndpoint[]>;
  createWebhookEndpoint(endpoint: InsertWebhookEndpoint): Promise<WebhookEndpoint>;
  updateWebhookEndpoint(id: string, data: Partial<InsertWebhookEndpoint>): Promise<WebhookEndpoint | undefined>;
  deleteWebhookEndpoint(id: string): Promise<boolean>;
  
  // Webhook event operations (outbox)
  createWebhookEvent(event: InsertWebhookEvent): Promise<WebhookEvent>;
  getPendingWebhookEvents(limit?: number): Promise<WebhookEvent[]>;
  lockWebhookEvent(eventId: string, workerId: string): Promise<WebhookEvent | undefined>;
  markWebhookEventProcessed(eventId: string): Promise<WebhookEvent | undefined>;
  
  // Webhook delivery log operations
  createWebhookDeliveryLog(log: InsertWebhookDeliveryLog): Promise<WebhookDeliveryLog>;
  getWebhookDeliveryLogs(eventId: string): Promise<WebhookDeliveryLog[]>;
  updateWebhookDeliveryLog(id: string, data: Partial<InsertWebhookDeliveryLog>): Promise<WebhookDeliveryLog | undefined>;
  getRecentWebhookDeliveries(limit?: number): Promise<WebhookDeliveryLog[]>;
  
  // Document review operations
  getDocumentReviews(documentId: string): Promise<(DocumentReview & { reviewer: User | null })[]>;
  getDocumentReview(id: string): Promise<DocumentReview | undefined>;
  createDocumentReview(review: InsertDocumentReview): Promise<DocumentReview>;
  getLatestDocumentReview(documentId: string): Promise<DocumentReview | undefined>;
  
  // Comment attachment operations
  getCommentAttachments(commentId: string, type: 'comment' | 'review'): Promise<CommentAttachment[]>;
  createCommentAttachment(attachment: InsertCommentAttachment): Promise<CommentAttachment>;
  deleteCommentAttachment(id: string): Promise<boolean>;
  
  // Notification queue operations
  createNotificationQueueItem(item: InsertNotificationQueueItem): Promise<NotificationQueueItem>;
  getPendingNotifications(beforeTime?: Date): Promise<NotificationQueueItem[]>;
  getPendingNotificationsByBatchKey(batchKey: string): Promise<NotificationQueueItem[]>;
  markNotificationSent(id: string): Promise<NotificationQueueItem | undefined>;
  markNotificationFailed(id: string, error: string): Promise<NotificationQueueItem | undefined>;
  cancelPendingNotifications(batchKey: string): Promise<number>;
  
  // Staff profile operations (for role assignment)
  updateUserStaffRole(userId: string, staffRole: StaffRole): Promise<User | undefined>;
  
  // Test data operations (for seeding/clearing)
  clearTestData(): Promise<void>;
  deleteUserByEmail(email: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createLocalUser(userData: { username: string; password: string; email: string; firstName: string; lastName: string; role: "borrower" | "staff" | "admin" }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        username: userData.username,
        password: userData.password,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
      })
      .returning();
    return user;
  }

  async updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
    await db.update(users).set({ password: hashedPassword }).where(eq(users.id, userId));
  }

  // Lead operations
  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await db
      .insert(leads)
      .values(insertLead)
      .returning();
    return lead;
  }

  async getLeads(): Promise<Lead[]> {
    return await db.select().from(leads).orderBy(desc(leads.createdAt));
  }

  async getLead(id: string): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead;
  }

  async getLeadsByEmail(email: string): Promise<Lead[]> {
    return await db.select().from(leads).where(eq(leads.email, email)).orderBy(desc(leads.createdAt));
  }

  async markLeadConverted(leadId: string): Promise<void> {
    await db.delete(leads).where(eq(leads.id, leadId));
  }

  async convertLeadsToApplications(userId: string, email: string): Promise<LoanApplication[]> {
    const unconvertedLeads = await this.getLeadsByEmail(email);
    const createdApplications: LoanApplication[] = [];
    
    for (const lead of unconvertedLeads) {
      const loanTypeMap: Record<string, string> = {
        "DSCR": "DSCR",
        "Fix & Flip": "Fix & Flip",
        "New Construction": "New Construction",
        "Hard Money": "Fix & Flip",
        "Both": "DSCR",
        "Other": "DSCR",
      };
      
      // Parse address - format may be "Street, City, State, Zip" or just "City, State"
      const addressParts = (lead.propertyLocation || "").split(", ");
      let propertyAddress: string | undefined;
      let propertyCity: string | undefined;
      let propertyState: string | undefined;
      let propertyZip: string | undefined;
      
      if (addressParts.length >= 4) {
        // Full address: Street, City, State, Zip
        propertyAddress = addressParts[0];
        propertyCity = addressParts[1];
        propertyState = addressParts[2];
        propertyZip = addressParts[3];
      } else if (addressParts.length === 2) {
        // Just City, State
        propertyCity = addressParts[0];
        propertyState = addressParts[1];
      } else if (addressParts.length === 3) {
        // Could be "Street, City, State" or "City, State, Zip"
        if (/^\d{5}(-\d{4})?$/.test(addressParts[2])) {
          propertyCity = addressParts[0];
          propertyState = addressParts[1];
          propertyZip = addressParts[2];
        } else {
          propertyAddress = addressParts[0];
          propertyCity = addressParts[1];
          propertyState = addressParts[2];
        }
      }
      
      const loanType = loanTypeMap[lead.loanType] || "DSCR";
      
      const application = await this.createLoanApplication({
        userId,
        loanType,
        propertyAddress: propertyAddress || undefined,
        propertyCity: propertyCity || undefined,
        propertyState: propertyState || undefined,
        propertyZip: propertyZip || undefined,
        purchasePrice: lead.propertyValue ? parseInt(lead.propertyValue.replace(/[^0-9]/g, "")) : undefined,
        status: "submitted",
        guarantor: lead.name,
      });
      
      // Create document checklist based on loan type
      const docTypes = await this.getDocumentTypesByLoanType(loanType);
      for (const docType of docTypes) {
        await this.createDocument({
          loanApplicationId: application.id,
          documentTypeId: docType.id,
          status: docType.isRequired === "if_applicable" ? "if_applicable" : "pending",
        });
      }
      
      createdApplications.push(application);
      await this.markLeadConverted(lead.id);
    }
    
    return createdApplications;
  }

  // Loan application operations
  async createLoanApplication(application: InsertLoanApplication): Promise<LoanApplication> {
    const [loanApp] = await db
      .insert(loanApplications)
      .values(application)
      .returning();
    return loanApp;
  }

  async getLoanApplications(userId: string): Promise<LoanApplication[]> {
    return await db
      .select()
      .from(loanApplications)
      .where(eq(loanApplications.userId, userId))
      .orderBy(desc(loanApplications.createdAt));
  }

  async getLoanApplication(id: string): Promise<LoanApplication | undefined> {
    const [app] = await db.select().from(loanApplications).where(eq(loanApplications.id, id));
    return app;
  }

  async updateLoanApplication(id: string, data: Partial<InsertLoanApplication>): Promise<LoanApplication | undefined> {
    const [updated] = await db
      .update(loanApplications)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(loanApplications.id, id))
      .returning();
    return updated;
  }

  async deleteLoanApplication(id: string): Promise<boolean> {
    // First delete associated notifications
    await db.delete(notifications).where(eq(notifications.relatedApplicationId, id));
    // Then delete associated document comments
    const docs = await db.select({ id: documents.id }).from(documents).where(eq(documents.loanApplicationId, id));
    for (const doc of docs) {
      await db.delete(documentComments).where(eq(documentComments.documentId, doc.id));
    }
    // Then delete associated documents
    await db.delete(documents).where(eq(documents.loanApplicationId, id));
    // Delete associated timeline events
    await db.delete(applicationTimeline).where(eq(applicationTimeline.loanApplicationId, id));
    // Delete associated co-borrowers
    await db.delete(coBorrowers).where(eq(coBorrowers.loanApplicationId, id));
    // Finally delete the application
    const result = await db.delete(loanApplications).where(eq(loanApplications.id, id));
    return true;
  }

  // Document type operations
  async getDocumentTypes(): Promise<DocumentType[]> {
    return await db.select().from(documentTypes).orderBy(documentTypes.sortOrder);
  }

  async getDocumentTypesByLoanType(loanType: string): Promise<DocumentType[]> {
    const allTypes = await this.getDocumentTypes();
    return allTypes.filter(dt => dt.loanTypes.includes(loanType));
  }

  async seedDocumentTypes(): Promise<void> {
    const existing = await db.select().from(documentTypes);
    if (existing.length === 0) {
      await db.insert(documentTypes).values(DEFAULT_DOCUMENT_TYPES);
    }
  }

  // Document operations
  async getDocumentsByApplication(applicationId: string): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.loanApplicationId, applicationId));
  }

  async getDocument(id: string): Promise<Document | undefined> {
    const [doc] = await db.select().from(documents).where(eq(documents.id, id));
    return doc;
  }

  async createDocument(doc: InsertDocument): Promise<Document> {
    const [created] = await db
      .insert(documents)
      .values(doc)
      .returning();
    return created;
  }

  async updateDocument(id: string, data: Partial<InsertDocument>): Promise<Document | undefined> {
    const [updated] = await db
      .update(documents)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    return updated;
  }

  // Serviced loans operations
  async getServicedLoans(userId: string): Promise<ServicedLoan[]> {
    return await db
      .select()
      .from(servicedLoans)
      .where(eq(servicedLoans.userId, userId))
      .orderBy(desc(servicedLoans.closingDate));
  }

  async getServicedLoan(id: string): Promise<ServicedLoan | undefined> {
    const [loan] = await db.select().from(servicedLoans).where(eq(servicedLoans.id, id));
    return loan;
  }

  async createServicedLoan(loan: InsertServicedLoan): Promise<ServicedLoan> {
    const [created] = await db
      .insert(servicedLoans)
      .values(loan)
      .returning();
    return created;
  }

  async updateServicedLoan(id: string, data: Partial<InsertServicedLoan>): Promise<ServicedLoan | undefined> {
    const [updated] = await db
      .update(servicedLoans)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(servicedLoans.id, id))
      .returning();
    return updated;
  }

  async getAllServicedLoans(): Promise<ServicedLoan[]> {
    return await db
      .select()
      .from(servicedLoans)
      .orderBy(desc(servicedLoans.closingDate));
  }

  async getServicedLoanByNumber(loanNumber: string): Promise<ServicedLoan | undefined> {
    const [loan] = await db.select().from(servicedLoans).where(eq(servicedLoans.loanNumber, loanNumber));
    return loan;
  }

  async deleteServicedLoan(id: string): Promise<boolean> {
    const result = await db.delete(servicedLoans).where(eq(servicedLoans.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Loan payment operations
  async getLoanPayments(servicedLoanId: string): Promise<LoanPayment[]> {
    return await db
      .select()
      .from(loanPayments)
      .where(eq(loanPayments.servicedLoanId, servicedLoanId))
      .orderBy(desc(loanPayments.dueDate));
  }

  async getLoanPayment(id: string): Promise<LoanPayment | undefined> {
    const [payment] = await db.select().from(loanPayments).where(eq(loanPayments.id, id));
    return payment;
  }

  async createLoanPayment(payment: InsertLoanPayment): Promise<LoanPayment> {
    const [created] = await db.insert(loanPayments).values(payment).returning();
    return created;
  }

  async updateLoanPayment(id: string, data: Partial<InsertLoanPayment>): Promise<LoanPayment | undefined> {
    const [updated] = await db
      .update(loanPayments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(loanPayments.id, id))
      .returning();
    return updated;
  }

  // Loan draw operations
  async getLoanDraws(servicedLoanId: string): Promise<LoanDraw[]> {
    return await db
      .select()
      .from(loanDraws)
      .where(eq(loanDraws.servicedLoanId, servicedLoanId))
      .orderBy(desc(loanDraws.drawNumber));
  }

  async getLoanDraw(id: string): Promise<LoanDraw | undefined> {
    const [draw] = await db.select().from(loanDraws).where(eq(loanDraws.id, id));
    return draw;
  }

  async createLoanDraw(draw: InsertLoanDraw): Promise<LoanDraw> {
    const [created] = await db.insert(loanDraws).values(draw).returning();
    return created;
  }

  async updateLoanDraw(id: string, data: Partial<InsertLoanDraw>): Promise<LoanDraw | undefined> {
    const [updated] = await db
      .update(loanDraws)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(loanDraws.id, id))
      .returning();
    return updated;
  }

  async deleteLoanDraw(id: string): Promise<boolean> {
    const result = await db.delete(loanDraws).where(eq(loanDraws.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Loan escrow operations
  async getLoanEscrowItems(servicedLoanId: string): Promise<LoanEscrowItem[]> {
    return await db
      .select()
      .from(loanEscrowItems)
      .where(eq(loanEscrowItems.servicedLoanId, servicedLoanId));
  }

  async getLoanEscrowItem(id: string): Promise<LoanEscrowItem | undefined> {
    const [item] = await db.select().from(loanEscrowItems).where(eq(loanEscrowItems.id, id));
    return item;
  }

  async createLoanEscrowItem(item: InsertLoanEscrowItem): Promise<LoanEscrowItem> {
    const [created] = await db.insert(loanEscrowItems).values(item).returning();
    return created;
  }

  async updateLoanEscrowItem(id: string, data: Partial<InsertLoanEscrowItem>): Promise<LoanEscrowItem | undefined> {
    const [updated] = await db
      .update(loanEscrowItems)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(loanEscrowItems.id, id))
      .returning();
    return updated;
  }

  async deleteLoanEscrowItem(id: string): Promise<boolean> {
    const result = await db.delete(loanEscrowItems).where(eq(loanEscrowItems.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Loan documents operations
  async getLoanDocuments(servicedLoanId: string): Promise<LoanDocument[]> {
    return await db
      .select()
      .from(loanDocuments)
      .where(eq(loanDocuments.servicedLoanId, servicedLoanId))
      .orderBy(desc(loanDocuments.createdAt));
  }

  async getLoanDocument(id: string): Promise<LoanDocument | undefined> {
    const [doc] = await db.select().from(loanDocuments).where(eq(loanDocuments.id, id));
    return doc;
  }

  async createLoanDocument(doc: InsertLoanDocument): Promise<LoanDocument> {
    const [created] = await db.insert(loanDocuments).values(doc).returning();
    return created;
  }

  async deleteLoanDocument(id: string): Promise<boolean> {
    const result = await db.delete(loanDocuments).where(eq(loanDocuments.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Loan milestones operations
  async getLoanMilestones(servicedLoanId: string): Promise<LoanMilestone[]> {
    return await db
      .select()
      .from(loanMilestones)
      .where(eq(loanMilestones.servicedLoanId, servicedLoanId))
      .orderBy(loanMilestones.milestoneNumber);
  }

  async getLoanMilestone(id: string): Promise<LoanMilestone | undefined> {
    const [milestone] = await db.select().from(loanMilestones).where(eq(loanMilestones.id, id));
    return milestone;
  }

  async createLoanMilestone(milestone: InsertLoanMilestone): Promise<LoanMilestone> {
    const [created] = await db.insert(loanMilestones).values(milestone).returning();
    return created;
  }

  async updateLoanMilestone(id: string, data: Partial<InsertLoanMilestone>): Promise<LoanMilestone | undefined> {
    const [updated] = await db
      .update(loanMilestones)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(loanMilestones.id, id))
      .returning();
    return updated;
  }

  async deleteLoanMilestone(id: string): Promise<boolean> {
    const result = await db.delete(loanMilestones).where(eq(loanMilestones.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Notification operations
  async getNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const result = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, "false")));
    return result.length;
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [created] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return created;
  }

  async markNotificationRead(id: string): Promise<Notification | undefined> {
    const [updated] = await db
      .update(notifications)
      .set({ isRead: "true" })
      .where(eq(notifications.id, id))
      .returning();
    return updated;
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: "true" })
      .where(eq(notifications.userId, userId));
  }

  async deleteNotification(id: string): Promise<boolean> {
    await db.delete(notifications).where(eq(notifications.id, id));
    return true;
  }

  // Saved scenarios operations
  async getSavedScenarios(userId: string, type?: string): Promise<SavedScenario[]> {
    if (type) {
      return await db
        .select()
        .from(savedScenarios)
        .where(and(eq(savedScenarios.userId, userId), eq(savedScenarios.type, type as any)))
        .orderBy(desc(savedScenarios.updatedAt));
    }
    return await db
      .select()
      .from(savedScenarios)
      .where(eq(savedScenarios.userId, userId))
      .orderBy(desc(savedScenarios.updatedAt));
  }

  async getSavedScenario(id: string): Promise<SavedScenario | undefined> {
    const [scenario] = await db.select().from(savedScenarios).where(eq(savedScenarios.id, id));
    return scenario;
  }

  async createSavedScenario(scenario: InsertSavedScenario): Promise<SavedScenario> {
    const [created] = await db
      .insert(savedScenarios)
      .values(scenario)
      .returning();
    return created;
  }

  async updateSavedScenario(id: string, data: Partial<InsertSavedScenario>): Promise<SavedScenario | undefined> {
    const [updated] = await db
      .update(savedScenarios)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(savedScenarios.id, id))
      .returning();
    return updated;
  }

  async deleteSavedScenario(id: string): Promise<boolean> {
    await db.delete(savedScenarios).where(eq(savedScenarios.id, id));
    return true;
  }

  // User preferences operations
  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    const [prefs] = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId));
    return prefs;
  }

  async upsertUserPreferences(prefs: InsertUserPreferences): Promise<UserPreferences> {
    const [result] = await db
      .insert(userPreferences)
      .values(prefs)
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: {
          ...prefs,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result;
  }

  // Connected entities operations
  async getConnectedEntities(userId: string): Promise<ConnectedEntity[]> {
    return await db
      .select()
      .from(connectedEntities)
      .where(eq(connectedEntities.userId, userId))
      .orderBy(desc(connectedEntities.createdAt));
  }

  async getConnectedEntity(id: string): Promise<ConnectedEntity | undefined> {
    const [entity] = await db.select().from(connectedEntities).where(eq(connectedEntities.id, id));
    return entity;
  }

  async createConnectedEntity(entity: InsertConnectedEntity): Promise<ConnectedEntity> {
    const [created] = await db
      .insert(connectedEntities)
      .values(entity)
      .returning();
    return created;
  }

  async updateConnectedEntity(id: string, data: Partial<InsertConnectedEntity>): Promise<ConnectedEntity | undefined> {
    const [updated] = await db
      .update(connectedEntities)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(connectedEntities.id, id))
      .returning();
    return updated;
  }

  async deleteConnectedEntity(id: string): Promise<boolean> {
    await db.delete(connectedEntities).where(eq(connectedEntities.id, id));
    return true;
  }

  // Document signatures operations
  async getDocumentSignatures(documentId: string): Promise<DocumentSignature[]> {
    return await db
      .select()
      .from(documentSignatures)
      .where(eq(documentSignatures.documentId, documentId));
  }

  async getDocumentSignature(id: string): Promise<DocumentSignature | undefined> {
    const [sig] = await db.select().from(documentSignatures).where(eq(documentSignatures.id, id));
    return sig;
  }

  async createDocumentSignature(signature: InsertDocumentSignature): Promise<DocumentSignature> {
    const [created] = await db
      .insert(documentSignatures)
      .values(signature)
      .returning();
    return created;
  }

  async updateDocumentSignature(id: string, data: Partial<InsertDocumentSignature>): Promise<DocumentSignature | undefined> {
    const [updated] = await db
      .update(documentSignatures)
      .set(data)
      .where(eq(documentSignatures.id, id))
      .returning();
    return updated;
  }

  // Co-borrower operations
  async getCoBorrowers(applicationId: string): Promise<CoBorrower[]> {
    return await db
      .select()
      .from(coBorrowers)
      .where(eq(coBorrowers.loanApplicationId, applicationId))
      .orderBy(desc(coBorrowers.createdAt));
  }

  async getCoBorrowerByToken(token: string): Promise<CoBorrower | undefined> {
    const [cb] = await db.select().from(coBorrowers).where(eq(coBorrowers.inviteToken, token));
    return cb;
  }

  async createCoBorrower(coBorrower: InsertCoBorrower): Promise<CoBorrower> {
    const [created] = await db
      .insert(coBorrowers)
      .values(coBorrower)
      .returning();
    return created;
  }

  async updateCoBorrower(id: string, data: Partial<InsertCoBorrower>): Promise<CoBorrower | undefined> {
    const [updated] = await db
      .update(coBorrowers)
      .set(data)
      .where(eq(coBorrowers.id, id))
      .returning();
    return updated;
  }

  async deleteCoBorrower(id: string): Promise<boolean> {
    await db.delete(coBorrowers).where(eq(coBorrowers.id, id));
    return true;
  }

  // Application timeline operations
  async getApplicationTimeline(applicationId: string): Promise<ApplicationTimelineEvent[]> {
    return await db
      .select()
      .from(applicationTimeline)
      .where(eq(applicationTimeline.loanApplicationId, applicationId))
      .orderBy(desc(applicationTimeline.createdAt));
  }

  async createTimelineEvent(event: InsertApplicationTimelineEvent): Promise<ApplicationTimelineEvent> {
    const [created] = await db
      .insert(applicationTimeline)
      .values(event)
      .returning();
    return created;
  }

  // Market data cache operations
  async getMarketDataSnapshot(stateSlug: string): Promise<MarketDataSnapshot | undefined> {
    const [snapshot] = await db
      .select()
      .from(marketDataSnapshots)
      .where(eq(marketDataSnapshots.stateSlug, stateSlug))
      .orderBy(desc(marketDataSnapshots.fetchedAt))
      .limit(1);
    return snapshot;
  }

  async getLatestMarketData(stateSlug: string): Promise<MarketDataSnapshot | undefined> {
    const now = new Date();
    const [snapshot] = await db
      .select()
      .from(marketDataSnapshots)
      .where(eq(marketDataSnapshots.stateSlug, stateSlug))
      .orderBy(desc(marketDataSnapshots.fetchedAt))
      .limit(1);
    
    if (snapshot && new Date(snapshot.expiresAt) > now) {
      return snapshot;
    }
    return undefined;
  }

  async createMarketDataSnapshot(snapshot: InsertMarketDataSnapshot): Promise<MarketDataSnapshot> {
    const [created] = await db
      .insert(marketDataSnapshots)
      .values(snapshot)
      .returning();
    return created;
  }

  async getAllMarketDataSnapshots(): Promise<MarketDataSnapshot[]> {
    return await db
      .select()
      .from(marketDataSnapshots)
      .orderBy(desc(marketDataSnapshots.fetchedAt));
  }

  // Document comment operations
  async getDocumentComments(documentId: string): Promise<(DocumentComment & { user: User | null })[]> {
    const comments = await db
      .select()
      .from(documentComments)
      .where(eq(documentComments.documentId, documentId))
      .orderBy(desc(documentComments.createdAt));
    
    const commentsWithUsers = await Promise.all(
      comments.map(async (comment) => {
        const [user] = await db.select().from(users).where(eq(users.id, comment.userId));
        return { ...comment, user: user || null };
      })
    );
    
    return commentsWithUsers;
  }

  async getDocumentComment(id: string): Promise<DocumentComment | undefined> {
    const [comment] = await db.select().from(documentComments).where(eq(documentComments.id, id));
    return comment;
  }

  async createDocumentComment(comment: InsertDocumentComment): Promise<DocumentComment> {
    const [created] = await db
      .insert(documentComments)
      .values(comment)
      .returning();
    return created;
  }

  async updateDocumentComment(id: string, data: Partial<InsertDocumentComment>): Promise<DocumentComment | undefined> {
    const [updated] = await db
      .update(documentComments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(documentComments.id, id))
      .returning();
    return updated;
  }

  async deleteDocumentComment(id: string): Promise<boolean> {
    await db.delete(documentComments).where(eq(documentComments.id, id));
    return true;
  }

  // Staff invite operations
  async createStaffInvite(invite: InsertStaffInvite): Promise<StaffInvite> {
    const [created] = await db
      .insert(staffInvites)
      .values(invite)
      .returning();
    return created;
  }

  async getStaffInviteByToken(token: string): Promise<StaffInvite | undefined> {
    const [invite] = await db.select().from(staffInvites).where(eq(staffInvites.token, token));
    return invite;
  }

  async getStaffInvites(): Promise<StaffInvite[]> {
    return await db.select().from(staffInvites).orderBy(desc(staffInvites.createdAt));
  }

  async updateStaffInvite(id: string, data: Partial<InsertStaffInvite>): Promise<StaffInvite | undefined> {
    const [updated] = await db
      .update(staffInvites)
      .set(data)
      .where(eq(staffInvites.id, id))
      .returning();
    return updated;
  }

  async acceptStaffInvite(token: string, userId: string): Promise<StaffInvite | undefined> {
    const invite = await this.getStaffInviteByToken(token);
    if (!invite || invite.status !== "pending") {
      return undefined;
    }
    
    // Check if expired
    if (new Date(invite.expiresAt) < new Date()) {
      await db.update(staffInvites)
        .set({ status: "expired" })
        .where(eq(staffInvites.id, invite.id));
      return undefined;
    }
    
    // Update invite status
    const [updated] = await db
      .update(staffInvites)
      .set({
        status: "accepted",
        acceptedAt: new Date(),
        acceptedByUserId: userId,
      })
      .where(eq(staffInvites.id, invite.id))
      .returning();
    
    // Update user role
    await this.updateUserRole(userId, invite.role);
    
    return updated;
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ role: role as any, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async getAllLoanApplications(): Promise<LoanApplication[]> {
    return await db
      .select()
      .from(loanApplications)
      .orderBy(desc(loanApplications.createdAt));
  }

  // Funded deals operations
  async getFundedDeals(visibleOnly: boolean = false): Promise<FundedDeal[]> {
    if (visibleOnly) {
      return await db
        .select()
        .from(fundedDeals)
        .where(eq(fundedDeals.isVisible, true))
        .orderBy(fundedDeals.displayOrder, desc(fundedDeals.createdAt));
    }
    return await db
      .select()
      .from(fundedDeals)
      .orderBy(fundedDeals.displayOrder, desc(fundedDeals.createdAt));
  }

  async getFundedDeal(id: string): Promise<FundedDeal | undefined> {
    const [deal] = await db.select().from(fundedDeals).where(eq(fundedDeals.id, id));
    return deal;
  }

  async createFundedDeal(deal: InsertFundedDeal): Promise<FundedDeal> {
    const [created] = await db
      .insert(fundedDeals)
      .values(deal)
      .returning();
    return created;
  }

  async updateFundedDeal(id: string, data: Partial<InsertFundedDeal>): Promise<FundedDeal | undefined> {
    const [updated] = await db
      .update(fundedDeals)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(fundedDeals.id, id))
      .returning();
    return updated;
  }

  async deleteFundedDeal(id: string): Promise<boolean> {
    const result = await db.delete(fundedDeals).where(eq(fundedDeals.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Webhook endpoint operations
  async getWebhookEndpoints(): Promise<WebhookEndpoint[]> {
    return await db
      .select()
      .from(webhookEndpoints)
      .orderBy(desc(webhookEndpoints.createdAt));
  }

  async getWebhookEndpoint(id: string): Promise<WebhookEndpoint | undefined> {
    const [endpoint] = await db.select().from(webhookEndpoints).where(eq(webhookEndpoints.id, id));
    return endpoint;
  }

  async getActiveWebhookEndpoints(): Promise<WebhookEndpoint[]> {
    return await db
      .select()
      .from(webhookEndpoints)
      .where(eq(webhookEndpoints.isActive, true));
  }

  async createWebhookEndpoint(endpoint: InsertWebhookEndpoint): Promise<WebhookEndpoint> {
    const [created] = await db
      .insert(webhookEndpoints)
      .values(endpoint)
      .returning();
    return created;
  }

  async updateWebhookEndpoint(id: string, data: Partial<InsertWebhookEndpoint>): Promise<WebhookEndpoint | undefined> {
    const [updated] = await db
      .update(webhookEndpoints)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(webhookEndpoints.id, id))
      .returning();
    return updated;
  }

  async deleteWebhookEndpoint(id: string): Promise<boolean> {
    const result = await db.delete(webhookEndpoints).where(eq(webhookEndpoints.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Webhook event operations (outbox)
  async createWebhookEvent(event: InsertWebhookEvent): Promise<WebhookEvent> {
    const [created] = await db
      .insert(webhookEvents)
      .values(event)
      .returning();
    return created;
  }

  async getPendingWebhookEvents(limit: number = 50): Promise<WebhookEvent[]> {
    return await db
      .select()
      .from(webhookEvents)
      .where(and(
        eq(webhookEvents.processedAt, null as any),
        eq(webhookEvents.lockedAt, null as any)
      ))
      .orderBy(webhookEvents.createdAt)
      .limit(limit);
  }

  async lockWebhookEvent(eventId: string, workerId: string): Promise<WebhookEvent | undefined> {
    const [locked] = await db
      .update(webhookEvents)
      .set({ lockedAt: new Date(), lockedBy: workerId })
      .where(and(
        eq(webhookEvents.id, eventId),
        eq(webhookEvents.lockedAt, null as any)
      ))
      .returning();
    return locked;
  }

  async markWebhookEventProcessed(eventId: string): Promise<WebhookEvent | undefined> {
    const [processed] = await db
      .update(webhookEvents)
      .set({ processedAt: new Date() })
      .where(eq(webhookEvents.id, eventId))
      .returning();
    return processed;
  }

  // Webhook delivery log operations
  async createWebhookDeliveryLog(log: InsertWebhookDeliveryLog): Promise<WebhookDeliveryLog> {
    const [created] = await db
      .insert(webhookDeliveryLogs)
      .values(log)
      .returning();
    return created;
  }

  async getWebhookDeliveryLogs(eventId: string): Promise<WebhookDeliveryLog[]> {
    return await db
      .select()
      .from(webhookDeliveryLogs)
      .where(eq(webhookDeliveryLogs.eventId, eventId))
      .orderBy(desc(webhookDeliveryLogs.createdAt));
  }

  async updateWebhookDeliveryLog(id: string, data: Partial<InsertWebhookDeliveryLog>): Promise<WebhookDeliveryLog | undefined> {
    const [updated] = await db
      .update(webhookDeliveryLogs)
      .set(data)
      .where(eq(webhookDeliveryLogs.id, id))
      .returning();
    return updated;
  }

  async getRecentWebhookDeliveries(limit: number = 50): Promise<WebhookDeliveryLog[]> {
    return await db
      .select()
      .from(webhookDeliveryLogs)
      .orderBy(desc(webhookDeliveryLogs.createdAt))
      .limit(limit);
  }

  // Document review operations
  async getDocumentReviews(documentId: string): Promise<(DocumentReview & { reviewer: User | null })[]> {
    const reviews = await db
      .select()
      .from(documentReviews)
      .where(eq(documentReviews.documentId, documentId))
      .orderBy(desc(documentReviews.createdAt));
    
    const reviewsWithReviewers = await Promise.all(
      reviews.map(async (review) => {
        const [reviewer] = await db.select().from(users).where(eq(users.id, review.reviewerId));
        return { ...review, reviewer: reviewer || null };
      })
    );
    
    return reviewsWithReviewers;
  }

  async getDocumentReview(id: string): Promise<DocumentReview | undefined> {
    const [review] = await db
      .select()
      .from(documentReviews)
      .where(eq(documentReviews.id, id));
    return review;
  }

  async createDocumentReview(review: InsertDocumentReview): Promise<DocumentReview> {
    const [created] = await db
      .insert(documentReviews)
      .values(review)
      .returning();
    return created;
  }

  async getLatestDocumentReview(documentId: string): Promise<DocumentReview | undefined> {
    const [review] = await db
      .select()
      .from(documentReviews)
      .where(eq(documentReviews.documentId, documentId))
      .orderBy(desc(documentReviews.createdAt))
      .limit(1);
    return review;
  }

  // Comment attachment operations
  async getCommentAttachments(commentId: string, type: 'comment' | 'review'): Promise<CommentAttachment[]> {
    if (type === 'comment') {
      return await db
        .select()
        .from(commentAttachments)
        .where(eq(commentAttachments.documentCommentId, commentId))
        .orderBy(desc(commentAttachments.createdAt));
    } else {
      return await db
        .select()
        .from(commentAttachments)
        .where(eq(commentAttachments.documentReviewId, commentId))
        .orderBy(desc(commentAttachments.createdAt));
    }
  }

  async createCommentAttachment(attachment: InsertCommentAttachment): Promise<CommentAttachment> {
    const [created] = await db
      .insert(commentAttachments)
      .values(attachment)
      .returning();
    return created;
  }

  async deleteCommentAttachment(id: string): Promise<boolean> {
    const result = await db.delete(commentAttachments).where(eq(commentAttachments.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Notification queue operations
  async createNotificationQueueItem(item: InsertNotificationQueueItem): Promise<NotificationQueueItem> {
    const [created] = await db
      .insert(notificationQueue)
      .values(item)
      .returning();
    return created;
  }

  async getPendingNotifications(beforeTime?: Date): Promise<NotificationQueueItem[]> {
    const time = beforeTime || new Date();
    return await db
      .select()
      .from(notificationQueue)
      .where(
        and(
          eq(notificationQueue.status, "pending"),
          lte(notificationQueue.sendAfter, time)
        )
      )
      .orderBy(notificationQueue.sendAfter);
  }

  async getPendingNotificationsByBatchKey(batchKey: string): Promise<NotificationQueueItem[]> {
    return await db
      .select()
      .from(notificationQueue)
      .where(
        and(
          eq(notificationQueue.batchKey, batchKey),
          eq(notificationQueue.status, "pending")
        )
      )
      .orderBy(notificationQueue.createdAt);
  }

  async markNotificationSent(id: string): Promise<NotificationQueueItem | undefined> {
    const [updated] = await db
      .update(notificationQueue)
      .set({
        status: "sent",
        sentAt: new Date(),
      })
      .where(eq(notificationQueue.id, id))
      .returning();
    return updated;
  }

  async markNotificationFailed(id: string, error: string): Promise<NotificationQueueItem | undefined> {
    const [updated] = await db
      .update(notificationQueue)
      .set({
        status: "failed",
        errorMessage: error,
      })
      .where(eq(notificationQueue.id, id))
      .returning();
    return updated;
  }

  async cancelPendingNotifications(batchKey: string): Promise<number> {
    const result = await db
      .delete(notificationQueue)
      .where(
        and(
          eq(notificationQueue.batchKey, batchKey),
          eq(notificationQueue.status, "pending")
        )
      );
    return result.rowCount ?? 0;
  }

  // Staff profile operations (for role assignment)
  async updateUserStaffRole(userId: string, staffRole: StaffRole): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({
        staffRole: staffRole,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  // Test data operations (for seeding/clearing)
  async clearTestData(): Promise<void> {
    // Clear in order: dependent tables first, then parent tables
    // 1. Clear notification-related tables
    await db.delete(notificationQueue);
    await db.delete(notifications);
    
    // 2. Clear loan-related child tables
    await db.delete(loanPayments);
    await db.delete(loanDraws);
    await db.delete(loanEscrowItems);
    await db.delete(loanDocuments);
    await db.delete(loanMilestones);
    
    // 3. Clear serviced loans
    await db.delete(servicedLoans);
    
    // 4. Clear application-related child tables
    await db.delete(applicationTimeline);
    await db.delete(coBorrowers);
    await db.delete(documentSignatures);
    await db.delete(documentReviews);
    await db.delete(documentComments);
    await db.delete(commentAttachments);
    await db.delete(documents);
    
    // 5. Clear loan applications
    await db.delete(loanApplications);
    
    // 6. Clear leads
    await db.delete(leads);
    
    // 7. Clear saved scenarios
    await db.delete(savedScenarios);
    
    console.log("Cleared all test data from database");
  }
  
  async deleteUserByEmail(email: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.email, email));
    return (result.rowCount ?? 0) > 0;
  }
}

export const storage = new DatabaseStorage();
