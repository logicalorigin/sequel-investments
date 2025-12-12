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
  scopeOfWorkItems,
  applicationScopeItems,
  drawLineItems,
  notifications,
  savedScenarios,
  userPreferences,
  connectedEntities,
  documentSignatures,
  signatureRequests,
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
  whiteLabelSettings,
  emailLogs,
  smsLogs,
  appointments,
  staffAvailability,
  propertyLocations,
  drawPhotos,
  photoVerificationAudits,
  verificationPhotos,
  verificationWorkflows,
  applicationStageHistory,
  loanAssignments,
  revisionRequests,
  applicationMessages,
  staffMessagePreferences,
  messageTemplates,
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
  type ScopeOfWorkItem,
  type InsertScopeOfWorkItem,
  type ApplicationScopeItem,
  type InsertApplicationScopeItem,
  type DrawLineItem,
  type InsertDrawLineItem,
  DEFAULT_SCOPE_OF_WORK_ITEMS,
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
  type SignatureRequest,
  type InsertSignatureRequest,
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
  type WhiteLabelSettings,
  type InsertWhiteLabelSettings,
  type StaffRole,
  type EmailLog,
  type InsertEmailLog,
  type SmsLog,
  type InsertSmsLog,
  type Appointment,
  type InsertAppointment,
  type StaffAvailability,
  type InsertStaffAvailability,
  type AppointmentStatus,
  type SignatureRequestStatus,
  type PropertyLocation,
  type InsertPropertyLocation,
  type DrawPhoto,
  type InsertDrawPhoto,
  type PhotoVerificationAudit,
  type InsertPhotoVerificationAudit,
  type VerificationPhoto,
  type InsertVerificationPhoto,
  type VerificationWorkflow,
  type InsertVerificationWorkflow,
  type ApplicationStageHistory,
  type InsertApplicationStageHistory,
  type LoanAssignment,
  type InsertLoanAssignment,
  type LoanAssignmentRole,
  type RevisionRequest,
  type InsertRevisionRequest,
  type ApplicationMessage,
  type InsertApplicationMessage,
  type StaffMessagePreferences,
  type InsertStaffMessagePreferences,
  type MessageTemplate,
  type InsertMessageTemplate,
  type MessagePriority,
  DEFAULT_DOCUMENT_TYPES,
  DEFAULT_BUSINESS_HOURS,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, lte, gte, sql, or, ne, inArray } from "drizzle-orm";

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
  getAllDraws(): Promise<LoanDraw[]>;
  getPendingDrawsCount(): Promise<number>;
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
  
  // Scope of work operations (for draws)
  getScopeOfWorkItems(servicedLoanId: string): Promise<ScopeOfWorkItem[]>;
  getScopeOfWorkItem(id: string): Promise<ScopeOfWorkItem | undefined>;
  createScopeOfWorkItem(item: InsertScopeOfWorkItem): Promise<ScopeOfWorkItem>;
  updateScopeOfWorkItem(id: string, data: Partial<InsertScopeOfWorkItem>): Promise<ScopeOfWorkItem | undefined>;
  deleteScopeOfWorkItem(id: string): Promise<boolean>;
  initializeScopeOfWork(servicedLoanId: string): Promise<ScopeOfWorkItem[]>;
  
  // Application scope of work operations (for Fix & Flip / New Construction applications)
  getApplicationScopeItems(loanApplicationId: string): Promise<ApplicationScopeItem[]>;
  getApplicationScopeItem(id: string): Promise<ApplicationScopeItem | undefined>;
  createApplicationScopeItem(item: InsertApplicationScopeItem): Promise<ApplicationScopeItem>;
  updateApplicationScopeItem(id: string, data: Partial<InsertApplicationScopeItem>): Promise<ApplicationScopeItem | undefined>;
  deleteApplicationScopeItem(id: string): Promise<boolean>;
  copyApplicationScopeToServicedLoan(applicationId: string, servicedLoanId: string): Promise<ScopeOfWorkItem[]>;
  
  // Draw line items operations
  getDrawLineItems(loanDrawId: string): Promise<DrawLineItem[]>;
  getAllDrawLineItemsByLoan(servicedLoanId: string): Promise<DrawLineItem[]>;
  getDrawLineItem(id: string): Promise<DrawLineItem | undefined>;
  createDrawLineItem(item: InsertDrawLineItem): Promise<DrawLineItem>;
  updateDrawLineItem(id: string, data: Partial<InsertDrawLineItem>): Promise<DrawLineItem | undefined>;
  deleteDrawLineItem(id: string): Promise<boolean>;
  
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
  
  // Signature request operations
  getSignatureRequest(id: string): Promise<SignatureRequest | undefined>;
  getSignatureRequestByToken(token: string): Promise<SignatureRequest | undefined>;
  getSignatureRequestsByApplication(applicationId: string): Promise<SignatureRequest[]>;
  getSignatureRequestsByDocument(documentId: string): Promise<SignatureRequest[]>;
  createSignatureRequest(request: InsertSignatureRequest): Promise<SignatureRequest>;
  updateSignatureRequest(id: string, data: Partial<InsertSignatureRequest>): Promise<SignatureRequest | undefined>;
  deleteSignatureRequest(id: string): Promise<boolean>;
  
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
  
  // White-label settings operations
  getWhiteLabelSettings(): Promise<WhiteLabelSettings | undefined>;
  getActiveWhiteLabelSettings(): Promise<WhiteLabelSettings | undefined>;
  upsertWhiteLabelSettings(settings: InsertWhiteLabelSettings): Promise<WhiteLabelSettings>;
  deleteWhiteLabelSettings(): Promise<boolean>;
  
  // SMS log operations
  createSmsLog(log: InsertSmsLog): Promise<SmsLog>;
  getSmsLogs(options?: {
    recipientPhone?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<SmsLog[]>;
  getSmsLogCount(options?: {
    recipientPhone?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<number>;
  
  // User SMS preferences
  updateUserSmsPreferences(userId: string, data: { phone?: string; smsNotificationsEnabled?: boolean }): Promise<User | undefined>;
  
  // Property location operations (for photo verification)
  getPropertyLocation(servicedLoanId: string): Promise<PropertyLocation | undefined>;
  getPropertyLocationByAddress(address: string, city: string, state: string): Promise<PropertyLocation | undefined>;
  createPropertyLocation(data: InsertPropertyLocation): Promise<PropertyLocation>;
  updatePropertyLocation(id: string, data: Partial<InsertPropertyLocation>): Promise<PropertyLocation | undefined>;
  
  // Draw photo operations
  getDrawPhotos(loanDrawId: string): Promise<DrawPhoto[]>;
  getDrawPhoto(id: string): Promise<DrawPhoto | undefined>;
  createDrawPhoto(data: InsertDrawPhoto): Promise<DrawPhoto>;
  updateDrawPhoto(id: string, data: Partial<InsertDrawPhoto>): Promise<DrawPhoto | undefined>;
  deleteDrawPhoto(id: string): Promise<boolean>;
  getDrawPhotosByScopeItem(scopeOfWorkItemId: string): Promise<DrawPhoto[]>;
  
  // Photo verification audit operations
  getPhotoVerificationAudits(drawPhotoId: string): Promise<PhotoVerificationAudit[]>;
  createPhotoVerificationAudit(data: InsertPhotoVerificationAudit): Promise<PhotoVerificationAudit>;
  
  // Verification photo operations (property & renovation verification)
  getVerificationPhotos(loanApplicationId: string): Promise<VerificationPhoto[]>;
  getVerificationPhotosByWorkflow(workflowId: string): Promise<VerificationPhoto[]>;
  getVerificationPhoto(id: string): Promise<VerificationPhoto | undefined>;
  createVerificationPhoto(data: InsertVerificationPhoto): Promise<VerificationPhoto>;
  updateVerificationPhoto(id: string, data: Partial<InsertVerificationPhoto>): Promise<VerificationPhoto | undefined>;
  deleteVerificationPhoto(id: string): Promise<boolean>;
  
  // Verification workflow operations
  getVerificationWorkflow(id: string): Promise<VerificationWorkflow | undefined>;
  getVerificationWorkflowByApplication(loanApplicationId: string, workflowType: 'property' | 'renovation'): Promise<VerificationWorkflow | undefined>;
  getVerificationWorkflowByDraw(loanDrawId: string): Promise<VerificationWorkflow | undefined>;
  getVerificationWorkflowsByServicedLoan(servicedLoanId: string): Promise<VerificationWorkflow[]>;
  createVerificationWorkflow(data: InsertVerificationWorkflow): Promise<VerificationWorkflow>;
  updateVerificationWorkflow(id: string, data: Partial<InsertVerificationWorkflow>): Promise<VerificationWorkflow | undefined>;
  deleteVerificationWorkflow(id: string): Promise<boolean>;
  
  // Application stage history operations (timeline audit trail)
  getApplicationStageHistory(loanApplicationId: string): Promise<ApplicationStageHistory[]>;
  createStageHistoryEntry(data: InsertApplicationStageHistory): Promise<ApplicationStageHistory>;
  getStageHistoryStats(loanApplicationId: string): Promise<{ totalDurationMinutes: number; stageCount: number }>;
  
  // Loan assignment operations (staff ownership)
  getLoanAssignments(loanApplicationId: string): Promise<LoanAssignment[]>;
  getActiveAssignmentsByUser(userId: string): Promise<LoanAssignment[]>;
  getAssignmentsByRole(role: LoanAssignmentRole): Promise<LoanAssignment[]>;
  getLoanAssignment(id: string): Promise<LoanAssignment | undefined>;
  createLoanAssignment(data: InsertLoanAssignment): Promise<LoanAssignment>;
  updateLoanAssignment(id: string, data: Partial<InsertLoanAssignment>): Promise<LoanAssignment | undefined>;
  deactivateLoanAssignment(id: string): Promise<LoanAssignment | undefined>;
  getPrimaryAssignee(loanApplicationId: string, role: LoanAssignmentRole): Promise<LoanAssignment | undefined>;
  
  // Revision request operations (return to borrower)
  getRevisionRequests(loanApplicationId: string): Promise<RevisionRequest[]>;
  getPendingRevisionRequests(loanApplicationId: string): Promise<RevisionRequest[]>;
  getRevisionRequest(id: string): Promise<RevisionRequest | undefined>;
  createRevisionRequest(data: InsertRevisionRequest): Promise<RevisionRequest>;
  updateRevisionRequest(id: string, data: Partial<InsertRevisionRequest>): Promise<RevisionRequest | undefined>;
  resolveRevisionRequest(id: string, resolvedByUserId: string, resolutionNotes?: string): Promise<RevisionRequest | undefined>;
  
  // Application message operations (admin-borrower communication)
  getApplicationMessages(loanApplicationId: string): Promise<ApplicationMessage[]>;
  getApplicationMessage(id: string): Promise<ApplicationMessage | undefined>;
  createApplicationMessage(data: InsertApplicationMessage): Promise<ApplicationMessage>;
  markMessageRead(id: string): Promise<ApplicationMessage | undefined>;
  markAllMessagesRead(loanApplicationId: string, readerUserId: string): Promise<void>;
  getUnreadMessageCount(loanApplicationId: string, forUserId: string): Promise<number>;
  getAllMessagesForUser(userId: string): Promise<{
    message: ApplicationMessage;
    loan: { id: string; propertyAddress: string | null; loanType: string; status: string };
  }[]>;
  getTotalUnreadCountForUser(userId: string): Promise<number>;
  getMessageThreadsForStaff(): Promise<{
    applicationId: string;
    propertyAddress: string | null;
    loanType: string;
    status: string;
    borrowerName: string;
    borrowerEmail: string | null;
    latestMessage: ApplicationMessage | null;
    unreadCount: number;
    totalMessages: number;
  }[]>;
  getTotalUnreadCountForStaff(): Promise<number>;
  
  // Staff message preferences operations
  getStaffMessagePreferences(staffUserId: string): Promise<StaffMessagePreferences | undefined>;
  upsertStaffMessagePreferences(data: InsertStaffMessagePreferences): Promise<StaffMessagePreferences>;
  updateStaffHeartbeat(staffUserId: string): Promise<void>;
  getOnlineStaff(thresholdMinutes?: number): Promise<User[]>;
  getOfflineStaffForNotification(offlineThresholdMinutes?: number): Promise<{
    user: User;
    preferences: StaffMessagePreferences;
    unreadCount: number;
  }[]>;
  updateStaffLastNotified(staffUserId: string): Promise<void>;
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

  async getAllDraws(): Promise<LoanDraw[]> {
    return await db
      .select()
      .from(loanDraws)
      .orderBy(desc(loanDraws.requestedDate));
  }

  async getPendingDrawsCount(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(loanDraws)
      .where(inArray(loanDraws.status, ["submitted", "inspection_scheduled", "inspection_complete"]));
    return Number(result[0]?.count || 0);
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

  // Scope of work operations
  async getScopeOfWorkItems(servicedLoanId: string): Promise<ScopeOfWorkItem[]> {
    return await db
      .select()
      .from(scopeOfWorkItems)
      .where(eq(scopeOfWorkItems.servicedLoanId, servicedLoanId))
      .orderBy(scopeOfWorkItems.sortOrder);
  }

  async getScopeOfWorkItem(id: string): Promise<ScopeOfWorkItem | undefined> {
    const [item] = await db.select().from(scopeOfWorkItems).where(eq(scopeOfWorkItems.id, id));
    return item;
  }

  async createScopeOfWorkItem(item: InsertScopeOfWorkItem): Promise<ScopeOfWorkItem> {
    const [created] = await db.insert(scopeOfWorkItems).values(item).returning();
    return created;
  }

  async updateScopeOfWorkItem(id: string, data: Partial<InsertScopeOfWorkItem>): Promise<ScopeOfWorkItem | undefined> {
    const [updated] = await db
      .update(scopeOfWorkItems)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(scopeOfWorkItems.id, id))
      .returning();
    return updated;
  }

  async deleteScopeOfWorkItem(id: string): Promise<boolean> {
    const result = await db.delete(scopeOfWorkItems).where(eq(scopeOfWorkItems.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async initializeScopeOfWork(servicedLoanId: string): Promise<ScopeOfWorkItem[]> {
    const existing = await this.getScopeOfWorkItems(servicedLoanId);
    if (existing.length > 0) {
      return existing;
    }
    
    const items: ScopeOfWorkItem[] = [];
    for (const template of DEFAULT_SCOPE_OF_WORK_ITEMS) {
      const created = await this.createScopeOfWorkItem({
        servicedLoanId,
        category: template.category,
        itemName: template.itemName,
        sortOrder: template.sortOrder,
        budgetAmount: 0,
      });
      items.push(created);
    }
    return items;
  }

  // Application scope of work operations (for Fix & Flip / New Construction applications)
  async getApplicationScopeItems(loanApplicationId: string): Promise<ApplicationScopeItem[]> {
    return await db
      .select()
      .from(applicationScopeItems)
      .where(eq(applicationScopeItems.loanApplicationId, loanApplicationId))
      .orderBy(applicationScopeItems.sortOrder);
  }

  async getApplicationScopeItem(id: string): Promise<ApplicationScopeItem | undefined> {
    const [item] = await db.select().from(applicationScopeItems).where(eq(applicationScopeItems.id, id));
    return item;
  }

  async createApplicationScopeItem(item: InsertApplicationScopeItem): Promise<ApplicationScopeItem> {
    const [created] = await db.insert(applicationScopeItems).values(item).returning();
    return created;
  }

  async updateApplicationScopeItem(id: string, data: Partial<InsertApplicationScopeItem>): Promise<ApplicationScopeItem | undefined> {
    const [updated] = await db
      .update(applicationScopeItems)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(applicationScopeItems.id, id))
      .returning();
    return updated;
  }

  async deleteApplicationScopeItem(id: string): Promise<boolean> {
    const result = await db.delete(applicationScopeItems).where(eq(applicationScopeItems.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async copyApplicationScopeToServicedLoan(applicationId: string, servicedLoanId: string): Promise<ScopeOfWorkItem[]> {
    // Get all scope items from the application
    const appScopeItems = await this.getApplicationScopeItems(applicationId);
    
    if (appScopeItems.length === 0) {
      // No application scope items, initialize with defaults
      return await this.initializeScopeOfWork(servicedLoanId);
    }
    
    // Copy each application scope item to the serviced loan
    const createdItems: ScopeOfWorkItem[] = [];
    for (const appItem of appScopeItems) {
      const scopeItem = await this.createScopeOfWorkItem({
        servicedLoanId,
        category: appItem.category,
        itemName: appItem.itemName,
        details: appItem.details,
        sortOrder: appItem.sortOrder,
        budgetAmount: appItem.budgetAmount,
        notes: appItem.notes,
        sourceApplicationScopeItemId: appItem.id,
      });
      createdItems.push(scopeItem);
    }
    
    return createdItems;
  }

  // Draw line items operations
  async getDrawLineItems(loanDrawId: string): Promise<DrawLineItem[]> {
    return await db
      .select()
      .from(drawLineItems)
      .where(eq(drawLineItems.loanDrawId, loanDrawId));
  }

  async getAllDrawLineItemsByLoan(servicedLoanId: string): Promise<DrawLineItem[]> {
    return await db
      .select({
        id: drawLineItems.id,
        loanDrawId: drawLineItems.loanDrawId,
        scopeOfWorkItemId: drawLineItems.scopeOfWorkItemId,
        requestedAmount: drawLineItems.requestedAmount,
        approvedAmount: drawLineItems.approvedAmount,
        fundedAmount: drawLineItems.fundedAmount,
        notes: drawLineItems.notes,
        createdAt: drawLineItems.createdAt,
        updatedAt: drawLineItems.updatedAt,
      })
      .from(drawLineItems)
      .innerJoin(loanDraws, eq(drawLineItems.loanDrawId, loanDraws.id))
      .where(eq(loanDraws.servicedLoanId, servicedLoanId));
  }

  async getDrawLineItem(id: string): Promise<DrawLineItem | undefined> {
    const [item] = await db.select().from(drawLineItems).where(eq(drawLineItems.id, id));
    return item;
  }

  async createDrawLineItem(item: InsertDrawLineItem): Promise<DrawLineItem> {
    const [created] = await db.insert(drawLineItems).values(item).returning();
    return created;
  }

  async updateDrawLineItem(id: string, data: Partial<InsertDrawLineItem>): Promise<DrawLineItem | undefined> {
    const [updated] = await db
      .update(drawLineItems)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(drawLineItems.id, id))
      .returning();
    return updated;
  }

  async deleteDrawLineItem(id: string): Promise<boolean> {
    const result = await db.delete(drawLineItems).where(eq(drawLineItems.id, id));
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

  // Signature request operations
  async getSignatureRequest(id: string): Promise<SignatureRequest | undefined> {
    const [request] = await db.select().from(signatureRequests).where(eq(signatureRequests.id, id));
    return request;
  }

  async getSignatureRequestByToken(token: string): Promise<SignatureRequest | undefined> {
    const [request] = await db.select().from(signatureRequests).where(eq(signatureRequests.accessToken, token));
    return request;
  }

  async getSignatureRequestsByApplication(applicationId: string): Promise<SignatureRequest[]> {
    return await db
      .select()
      .from(signatureRequests)
      .where(eq(signatureRequests.loanApplicationId, applicationId))
      .orderBy(desc(signatureRequests.requestedAt));
  }

  async getSignatureRequestsByDocument(documentId: string): Promise<SignatureRequest[]> {
    return await db
      .select()
      .from(signatureRequests)
      .where(eq(signatureRequests.documentId, documentId))
      .orderBy(desc(signatureRequests.requestedAt));
  }

  async createSignatureRequest(request: InsertSignatureRequest): Promise<SignatureRequest> {
    const [created] = await db
      .insert(signatureRequests)
      .values(request)
      .returning();
    return created;
  }

  async updateSignatureRequest(id: string, data: Partial<InsertSignatureRequest>): Promise<SignatureRequest | undefined> {
    const [updated] = await db
      .update(signatureRequests)
      .set(data)
      .where(eq(signatureRequests.id, id))
      .returning();
    return updated;
  }

  async deleteSignatureRequest(id: string): Promise<boolean> {
    await db.delete(signatureRequests).where(eq(signatureRequests.id, id));
    return true;
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

  // White-label settings operations
  async getWhiteLabelSettings(): Promise<WhiteLabelSettings | undefined> {
    const [settings] = await db.select().from(whiteLabelSettings).limit(1);
    return settings;
  }

  async getActiveWhiteLabelSettings(): Promise<WhiteLabelSettings | undefined> {
    const [settings] = await db
      .select()
      .from(whiteLabelSettings)
      .where(eq(whiteLabelSettings.isActive, true))
      .limit(1);
    return settings;
  }

  async upsertWhiteLabelSettings(settings: InsertWhiteLabelSettings): Promise<WhiteLabelSettings> {
    // First, check if any settings exist
    const existing = await this.getWhiteLabelSettings();
    
    if (existing) {
      // Update existing settings
      const [updated] = await db
        .update(whiteLabelSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(whiteLabelSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new settings
      const [created] = await db
        .insert(whiteLabelSettings)
        .values(settings)
        .returning();
      return created;
    }
  }

  async deleteWhiteLabelSettings(): Promise<boolean> {
    const result = await db.delete(whiteLabelSettings);
    return (result.rowCount ?? 0) > 0;
  }

  // Email log operations
  async createEmailLog(log: InsertEmailLog): Promise<EmailLog> {
    const [created] = await db
      .insert(emailLogs)
      .values(log)
      .returning();
    return created;
  }

  async getEmailLogs(options?: {
    recipientEmail?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<EmailLog[]> {
    let query = db.select().from(emailLogs);
    
    const conditions = [];
    if (options?.recipientEmail) {
      conditions.push(eq(emailLogs.recipientEmail, options.recipientEmail));
    }
    if (options?.startDate) {
      conditions.push(sql`${emailLogs.sentAt} >= ${options.startDate}`);
    }
    if (options?.endDate) {
      conditions.push(sql`${emailLogs.sentAt} <= ${options.endDate}`);
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query
      .orderBy(desc(emailLogs.sentAt))
      .limit(options?.limit || 100)
      .offset(options?.offset || 0);
  }

  async getEmailLogCount(options?: {
    recipientEmail?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<number> {
    const conditions = [];
    if (options?.recipientEmail) {
      conditions.push(eq(emailLogs.recipientEmail, options.recipientEmail));
    }
    if (options?.startDate) {
      conditions.push(sql`${emailLogs.sentAt} >= ${options.startDate}`);
    }
    if (options?.endDate) {
      conditions.push(sql`${emailLogs.sentAt} <= ${options.endDate}`);
    }
    
    let query = db.select({ count: sql<number>`count(*)` }).from(emailLogs);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    const [result] = await query;
    return Number(result?.count || 0);
  }

  async updateUserEmailPreferences(userId: string, enabled: boolean): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({
        emailNotificationsEnabled: enabled,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  // SMS log operations
  async createSmsLog(log: InsertSmsLog): Promise<SmsLog> {
    const [created] = await db
      .insert(smsLogs)
      .values(log)
      .returning();
    return created;
  }

  async getSmsLogs(options?: {
    recipientPhone?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<SmsLog[]> {
    let query = db.select().from(smsLogs);
    
    const conditions = [];
    if (options?.recipientPhone) {
      conditions.push(sql`${smsLogs.recipientPhone} ILIKE ${'%' + options.recipientPhone + '%'}`);
    }
    if (options?.startDate) {
      conditions.push(sql`${smsLogs.sentAt} >= ${options.startDate}`);
    }
    if (options?.endDate) {
      conditions.push(sql`${smsLogs.sentAt} <= ${options.endDate}`);
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query
      .orderBy(desc(smsLogs.sentAt))
      .limit(options?.limit || 100)
      .offset(options?.offset || 0);
  }

  async getSmsLogCount(options?: {
    recipientPhone?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<number> {
    const conditions = [];
    if (options?.recipientPhone) {
      conditions.push(sql`${smsLogs.recipientPhone} ILIKE ${'%' + options.recipientPhone + '%'}`);
    }
    if (options?.startDate) {
      conditions.push(sql`${smsLogs.sentAt} >= ${options.startDate}`);
    }
    if (options?.endDate) {
      conditions.push(sql`${smsLogs.sentAt} <= ${options.endDate}`);
    }
    
    let query = db.select({ count: sql<number>`count(*)` }).from(smsLogs);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    const [result] = await query;
    return Number(result?.count || 0);
  }

  async updateUserSmsPreferences(userId: string, data: { phone?: string; smsNotificationsEnabled?: boolean }): Promise<User | undefined> {
    const updateData: any = { updatedAt: new Date() };
    if (data.phone !== undefined) {
      updateData.phone = data.phone;
    }
    if (data.smsNotificationsEnabled !== undefined) {
      updateData.smsNotificationsEnabled = data.smsNotificationsEnabled;
    }
    
    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  // ============================================
  // APPOINTMENT OPERATIONS
  // ============================================
  async getAppointments(userId: string, role: string): Promise<(Appointment & { borrower?: User; staff?: User })[]> {
    let appointmentList: Appointment[];
    
    if (role === "borrower") {
      appointmentList = await db
        .select()
        .from(appointments)
        .where(eq(appointments.borrowerUserId, userId))
        .orderBy(desc(appointments.scheduledAt));
    } else {
      appointmentList = await db
        .select()
        .from(appointments)
        .orderBy(desc(appointments.scheduledAt));
    }
    
    const appointmentsWithUsers = await Promise.all(
      appointmentList.map(async (apt) => {
        const [borrower] = await db.select().from(users).where(eq(users.id, apt.borrowerUserId));
        const [staff] = await db.select().from(users).where(eq(users.id, apt.staffUserId));
        return { ...apt, borrower: borrower || undefined, staff: staff || undefined };
      })
    );
    
    return appointmentsWithUsers;
  }

  async getAppointment(id: string): Promise<(Appointment & { borrower?: User; staff?: User }) | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    if (!appointment) return undefined;
    
    const [borrower] = await db.select().from(users).where(eq(users.id, appointment.borrowerUserId));
    const [staff] = await db.select().from(users).where(eq(users.id, appointment.staffUserId));
    
    return { ...appointment, borrower: borrower || undefined, staff: staff || undefined };
  }

  async createAppointment(data: InsertAppointment): Promise<Appointment> {
    const [created] = await db
      .insert(appointments)
      .values(data)
      .returning();
    return created;
  }

  async updateAppointment(id: string, data: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const [updated] = await db
      .update(appointments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();
    return updated;
  }

  async cancelAppointment(id: string): Promise<Appointment | undefined> {
    return this.updateAppointment(id, { status: "cancelled" as AppointmentStatus });
  }

  async getStaffAppointments(staffId: string, startDate: Date, endDate: Date): Promise<Appointment[]> {
    return await db
      .select()
      .from(appointments)
      .where(and(
        eq(appointments.staffUserId, staffId),
        gte(appointments.scheduledAt, startDate),
        lte(appointments.scheduledAt, endDate),
        ne(appointments.status, "cancelled")
      ))
      .orderBy(appointments.scheduledAt);
  }

  async getUpcomingAppointments(limit: number = 50): Promise<Appointment[]> {
    const now = new Date();
    return await db
      .select()
      .from(appointments)
      .where(and(
        gte(appointments.scheduledAt, now),
        eq(appointments.status, "scheduled")
      ))
      .orderBy(appointments.scheduledAt)
      .limit(limit);
  }

  async getAppointmentsNeedingReminder(reminderTime: Date): Promise<(Appointment & { borrower?: User; staff?: User })[]> {
    const windowStart = new Date(reminderTime.getTime());
    const windowEnd = new Date(reminderTime.getTime() + 60 * 60 * 1000); // 1 hour window
    
    const appointmentList = await db
      .select()
      .from(appointments)
      .where(and(
        gte(appointments.scheduledAt, windowStart),
        lte(appointments.scheduledAt, windowEnd),
        eq(appointments.status, "scheduled")
      ));
    
    const appointmentsWithUsers = await Promise.all(
      appointmentList.map(async (apt) => {
        const [borrower] = await db.select().from(users).where(eq(users.id, apt.borrowerUserId));
        const [staff] = await db.select().from(users).where(eq(users.id, apt.staffUserId));
        return { ...apt, borrower: borrower || undefined, staff: staff || undefined };
      })
    );
    
    return appointmentsWithUsers;
  }

  // ============================================
  // STAFF AVAILABILITY OPERATIONS
  // ============================================
  async getStaffAvailability(staffId: string): Promise<StaffAvailability[]> {
    return await db
      .select()
      .from(staffAvailability)
      .where(eq(staffAvailability.staffUserId, staffId))
      .orderBy(staffAvailability.dayOfWeek);
  }

  async setStaffAvailability(staffId: string, dayOfWeek: number, data: Partial<InsertStaffAvailability>): Promise<StaffAvailability> {
    const existing = await db
      .select()
      .from(staffAvailability)
      .where(and(
        eq(staffAvailability.staffUserId, staffId),
        eq(staffAvailability.dayOfWeek, dayOfWeek)
      ))
      .limit(1);
    
    if (existing.length > 0) {
      const [updated] = await db
        .update(staffAvailability)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(staffAvailability.id, existing[0].id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(staffAvailability)
        .values({ staffUserId: staffId, dayOfWeek, ...data } as InsertStaffAvailability)
        .returning();
      return created;
    }
  }

  async initializeStaffAvailability(staffId: string): Promise<StaffAvailability[]> {
    const existing = await this.getStaffAvailability(staffId);
    if (existing.length > 0) return existing;
    
    const created: StaffAvailability[] = [];
    for (const hours of DEFAULT_BUSINESS_HOURS) {
      const [availability] = await db
        .insert(staffAvailability)
        .values({
          staffUserId: staffId,
          dayOfWeek: hours.dayOfWeek,
          startTime: hours.startTime,
          endTime: hours.endTime,
          isAvailable: hours.isAvailable,
        })
        .returning();
      created.push(availability);
    }
    return created;
  }

  async getAvailableStaff(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(or(
        eq(users.role, "admin"),
        eq(users.role, "staff")
      ))
      .orderBy(users.firstName);
  }

  async getAvailableSlotsForStaff(staffId: string, date: Date): Promise<{ startTime: string; endTime: string }[]> {
    const dayOfWeek = date.getDay();
    
    const [availability] = await db
      .select()
      .from(staffAvailability)
      .where(and(
        eq(staffAvailability.staffUserId, staffId),
        eq(staffAvailability.dayOfWeek, dayOfWeek),
        eq(staffAvailability.isAvailable, true)
      ))
      .limit(1);
    
    if (!availability) return [];
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const existingAppointments = await db
      .select()
      .from(appointments)
      .where(and(
        eq(appointments.staffUserId, staffId),
        gte(appointments.scheduledAt, startOfDay),
        lte(appointments.scheduledAt, endOfDay),
        ne(appointments.status, "cancelled")
      ));
    
    const slots: { startTime: string; endTime: string }[] = [];
    const slotDuration = 30;
    
    const [startHour, startMin] = availability.startTime.split(':').map(Number);
    const [endHour, endMin] = availability.endTime.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMin = startMin;
    
    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      const slotStart = new Date(date);
      slotStart.setHours(currentHour, currentMin, 0, 0);
      
      const slotEnd = new Date(slotStart.getTime() + slotDuration * 60 * 1000);
      
      if (slotEnd.getHours() > endHour || (slotEnd.getHours() === endHour && slotEnd.getMinutes() > endMin)) {
        break;
      }
      
      const now = new Date();
      if (slotStart <= now) {
        currentMin += slotDuration;
        if (currentMin >= 60) {
          currentHour += Math.floor(currentMin / 60);
          currentMin = currentMin % 60;
        }
        continue;
      }
      
      const isBooked = existingAppointments.some(apt => {
        const aptStart = new Date(apt.scheduledAt);
        const aptEnd = new Date(aptStart.getTime() + apt.durationMinutes * 60 * 1000);
        return (slotStart < aptEnd && slotEnd > aptStart);
      });
      
      if (!isBooked) {
        const startTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
        const endTimeMinutes = currentMin + slotDuration;
        const endTimeHour = currentHour + Math.floor(endTimeMinutes / 60);
        const endTimeMin = endTimeMinutes % 60;
        const endTimeStr = `${String(endTimeHour).padStart(2, '0')}:${String(endTimeMin).padStart(2, '0')}`;
        
        slots.push({ startTime: startTimeStr, endTime: endTimeStr });
      }
      
      currentMin += slotDuration;
      if (currentMin >= 60) {
        currentHour += Math.floor(currentMin / 60);
        currentMin = currentMin % 60;
      }
    }
    
    return slots;
  }

  // ============================================
  // PHOTO VERIFICATION OPERATIONS
  // ============================================

  // Property location operations
  async getPropertyLocation(servicedLoanId: string): Promise<PropertyLocation | undefined> {
    const [location] = await db
      .select()
      .from(propertyLocations)
      .where(eq(propertyLocations.servicedLoanId, servicedLoanId));
    return location;
  }

  async createPropertyLocation(data: InsertPropertyLocation): Promise<PropertyLocation> {
    const [location] = await db
      .insert(propertyLocations)
      .values(data)
      .returning();
    return location;
  }

  async updatePropertyLocation(id: string, data: Partial<InsertPropertyLocation>): Promise<PropertyLocation | undefined> {
    const [updated] = await db
      .update(propertyLocations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(propertyLocations.id, id))
      .returning();
    return updated;
  }

  async getPropertyLocationByAddress(
    address: string,
    city: string,
    state: string
  ): Promise<PropertyLocation | undefined> {
    const [location] = await db
      .select()
      .from(propertyLocations)
      .where(
        and(
          eq(propertyLocations.address, address),
          eq(propertyLocations.city, city),
          eq(propertyLocations.state, state)
        )
      );
    return location;
  }

  // Draw photo operations
  async getDrawPhotos(loanDrawId: string): Promise<DrawPhoto[]> {
    return await db
      .select()
      .from(drawPhotos)
      .where(eq(drawPhotos.loanDrawId, loanDrawId))
      .orderBy(drawPhotos.sortOrder);
  }

  async getDrawPhoto(id: string): Promise<DrawPhoto | undefined> {
    const [photo] = await db
      .select()
      .from(drawPhotos)
      .where(eq(drawPhotos.id, id));
    return photo;
  }

  async createDrawPhoto(data: InsertDrawPhoto): Promise<DrawPhoto> {
    const [photo] = await db
      .insert(drawPhotos)
      .values(data)
      .returning();
    return photo;
  }

  async updateDrawPhoto(id: string, data: Partial<InsertDrawPhoto>): Promise<DrawPhoto | undefined> {
    const [updated] = await db
      .update(drawPhotos)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(drawPhotos.id, id))
      .returning();
    return updated;
  }

  async deleteDrawPhoto(id: string): Promise<boolean> {
    const result = await db
      .delete(drawPhotos)
      .where(eq(drawPhotos.id, id));
    return true;
  }

  async getDrawPhotosByScopeItem(scopeOfWorkItemId: string): Promise<DrawPhoto[]> {
    return await db
      .select()
      .from(drawPhotos)
      .where(eq(drawPhotos.scopeOfWorkItemId, scopeOfWorkItemId))
      .orderBy(drawPhotos.sortOrder);
  }

  // Photo verification audit operations
  async getPhotoVerificationAudits(drawPhotoId: string): Promise<PhotoVerificationAudit[]> {
    return await db
      .select()
      .from(photoVerificationAudits)
      .where(eq(photoVerificationAudits.drawPhotoId, drawPhotoId))
      .orderBy(desc(photoVerificationAudits.createdAt));
  }

  async createPhotoVerificationAudit(data: InsertPhotoVerificationAudit): Promise<PhotoVerificationAudit> {
    const [audit] = await db
      .insert(photoVerificationAudits)
      .values(data)
      .returning();
    return audit;
  }

  // Verification photo operations (property & renovation verification)
  async getVerificationPhotos(loanApplicationId: string): Promise<VerificationPhoto[]> {
    return await db
      .select()
      .from(verificationPhotos)
      .where(eq(verificationPhotos.loanApplicationId, loanApplicationId))
      .orderBy(verificationPhotos.createdAt);
  }

  async getVerificationPhoto(id: string): Promise<VerificationPhoto | undefined> {
    const [photo] = await db
      .select()
      .from(verificationPhotos)
      .where(eq(verificationPhotos.id, id));
    return photo;
  }

  async createVerificationPhoto(data: InsertVerificationPhoto): Promise<VerificationPhoto> {
    const [photo] = await db
      .insert(verificationPhotos)
      .values(data)
      .returning();
    return photo;
  }

  async updateVerificationPhoto(id: string, data: Partial<InsertVerificationPhoto>): Promise<VerificationPhoto | undefined> {
    const [updated] = await db
      .update(verificationPhotos)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(verificationPhotos.id, id))
      .returning();
    return updated;
  }

  async deleteVerificationPhoto(id: string): Promise<boolean> {
    await db
      .delete(verificationPhotos)
      .where(eq(verificationPhotos.id, id));
    return true;
  }
  
  async getVerificationPhotosByWorkflow(workflowId: string): Promise<VerificationPhoto[]> {
    return await db
      .select()
      .from(verificationPhotos)
      .where(eq(verificationPhotos.verificationWorkflowId, workflowId))
      .orderBy(verificationPhotos.createdAt);
  }
  
  // Verification workflow operations
  async getVerificationWorkflow(id: string): Promise<VerificationWorkflow | undefined> {
    const [workflow] = await db
      .select()
      .from(verificationWorkflows)
      .where(eq(verificationWorkflows.id, id));
    return workflow;
  }
  
  async getVerificationWorkflowByApplication(loanApplicationId: string, workflowType: 'property' | 'renovation'): Promise<VerificationWorkflow | undefined> {
    const [workflow] = await db
      .select()
      .from(verificationWorkflows)
      .where(and(
        eq(verificationWorkflows.loanApplicationId, loanApplicationId),
        eq(verificationWorkflows.workflowType, workflowType)
      ));
    return workflow;
  }
  
  async getVerificationWorkflowByDraw(loanDrawId: string): Promise<VerificationWorkflow | undefined> {
    const [workflow] = await db
      .select()
      .from(verificationWorkflows)
      .where(eq(verificationWorkflows.loanDrawId, loanDrawId));
    return workflow;
  }
  
  async getVerificationWorkflowsByServicedLoan(servicedLoanId: string): Promise<VerificationWorkflow[]> {
    return await db
      .select()
      .from(verificationWorkflows)
      .where(eq(verificationWorkflows.servicedLoanId, servicedLoanId))
      .orderBy(desc(verificationWorkflows.createdAt));
  }
  
  async createVerificationWorkflow(data: InsertVerificationWorkflow): Promise<VerificationWorkflow> {
    const [workflow] = await db
      .insert(verificationWorkflows)
      .values(data)
      .returning();
    return workflow;
  }
  
  async updateVerificationWorkflow(id: string, data: Partial<InsertVerificationWorkflow>): Promise<VerificationWorkflow | undefined> {
    const [updated] = await db
      .update(verificationWorkflows)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(verificationWorkflows.id, id))
      .returning();
    return updated;
  }
  
  async deleteVerificationWorkflow(id: string): Promise<boolean> {
    await db
      .delete(verificationWorkflows)
      .where(eq(verificationWorkflows.id, id));
    return true;
  }
  
  // ============================================
  // APPLICATION STAGE HISTORY (Timeline Audit Trail)
  // ============================================
  async getApplicationStageHistory(loanApplicationId: string): Promise<ApplicationStageHistory[]> {
    return await db
      .select()
      .from(applicationStageHistory)
      .where(eq(applicationStageHistory.loanApplicationId, loanApplicationId))
      .orderBy(desc(applicationStageHistory.createdAt));
  }
  
  async createStageHistoryEntry(data: InsertApplicationStageHistory): Promise<ApplicationStageHistory> {
    const [entry] = await db
      .insert(applicationStageHistory)
      .values(data)
      .returning();
    return entry;
  }
  
  async getStageHistoryStats(loanApplicationId: string): Promise<{ totalDurationMinutes: number; stageCount: number }> {
    const history = await db
      .select()
      .from(applicationStageHistory)
      .where(eq(applicationStageHistory.loanApplicationId, loanApplicationId));
    
    const totalDurationMinutes = history.reduce((sum, entry) => sum + (entry.durationMinutes || 0), 0);
    return { totalDurationMinutes, stageCount: history.length };
  }
  
  // ============================================
  // LOAN ASSIGNMENTS (Staff Ownership)
  // ============================================
  async getLoanAssignments(loanApplicationId: string): Promise<LoanAssignment[]> {
    return await db
      .select()
      .from(loanAssignments)
      .where(eq(loanAssignments.loanApplicationId, loanApplicationId))
      .orderBy(loanAssignments.role);
  }
  
  async getActiveAssignmentsByUser(userId: string): Promise<LoanAssignment[]> {
    return await db
      .select()
      .from(loanAssignments)
      .where(and(
        eq(loanAssignments.userId, userId),
        eq(loanAssignments.isActive, true)
      ))
      .orderBy(desc(loanAssignments.assignedAt));
  }
  
  async getAssignmentsByRole(role: LoanAssignmentRole): Promise<LoanAssignment[]> {
    return await db
      .select()
      .from(loanAssignments)
      .where(and(
        eq(loanAssignments.role, role),
        eq(loanAssignments.isActive, true)
      ))
      .orderBy(desc(loanAssignments.assignedAt));
  }
  
  async getLoanAssignment(id: string): Promise<LoanAssignment | undefined> {
    const [assignment] = await db
      .select()
      .from(loanAssignments)
      .where(eq(loanAssignments.id, id));
    return assignment;
  }
  
  async createLoanAssignment(data: InsertLoanAssignment): Promise<LoanAssignment> {
    const [assignment] = await db
      .insert(loanAssignments)
      .values(data)
      .returning();
    return assignment;
  }
  
  async updateLoanAssignment(id: string, data: Partial<InsertLoanAssignment>): Promise<LoanAssignment | undefined> {
    const [updated] = await db
      .update(loanAssignments)
      .set(data)
      .where(eq(loanAssignments.id, id))
      .returning();
    return updated;
  }
  
  async deactivateLoanAssignment(id: string): Promise<LoanAssignment | undefined> {
    const [updated] = await db
      .update(loanAssignments)
      .set({ isActive: false, unassignedAt: new Date() })
      .where(eq(loanAssignments.id, id))
      .returning();
    return updated;
  }
  
  async getPrimaryAssignee(loanApplicationId: string, role: LoanAssignmentRole): Promise<LoanAssignment | undefined> {
    const [assignment] = await db
      .select()
      .from(loanAssignments)
      .where(and(
        eq(loanAssignments.loanApplicationId, loanApplicationId),
        eq(loanAssignments.role, role),
        eq(loanAssignments.isPrimary, true),
        eq(loanAssignments.isActive, true)
      ));
    return assignment;
  }
  
  // Revision request operations
  async getRevisionRequests(loanApplicationId: string): Promise<RevisionRequest[]> {
    return db
      .select()
      .from(revisionRequests)
      .where(eq(revisionRequests.loanApplicationId, loanApplicationId))
      .orderBy(desc(revisionRequests.createdAt));
  }
  
  async getPendingRevisionRequests(loanApplicationId: string): Promise<RevisionRequest[]> {
    return db
      .select()
      .from(revisionRequests)
      .where(and(
        eq(revisionRequests.loanApplicationId, loanApplicationId),
        eq(revisionRequests.status, "pending")
      ))
      .orderBy(desc(revisionRequests.createdAt));
  }
  
  async getRevisionRequest(id: string): Promise<RevisionRequest | undefined> {
    const [request] = await db
      .select()
      .from(revisionRequests)
      .where(eq(revisionRequests.id, id));
    return request;
  }
  
  async createRevisionRequest(data: InsertRevisionRequest): Promise<RevisionRequest> {
    const [request] = await db
      .insert(revisionRequests)
      .values(data)
      .returning();
    return request;
  }
  
  async updateRevisionRequest(id: string, data: Partial<InsertRevisionRequest>): Promise<RevisionRequest | undefined> {
    const [updated] = await db
      .update(revisionRequests)
      .set(data)
      .where(eq(revisionRequests.id, id))
      .returning();
    return updated;
  }
  
  async resolveRevisionRequest(id: string, resolvedByUserId: string, resolutionNotes?: string): Promise<RevisionRequest | undefined> {
    const [updated] = await db
      .update(revisionRequests)
      .set({
        status: "resolved",
        resolvedByUserId,
        resolvedAt: new Date(),
        resolutionNotes,
      })
      .where(eq(revisionRequests.id, id))
      .returning();
    return updated;
  }
  
  // Application message operations
  async getApplicationMessages(loanApplicationId: string): Promise<ApplicationMessage[]> {
    return db
      .select()
      .from(applicationMessages)
      .where(eq(applicationMessages.loanApplicationId, loanApplicationId))
      .orderBy(applicationMessages.createdAt);
  }
  
  async getApplicationMessage(id: string): Promise<ApplicationMessage | undefined> {
    const [message] = await db
      .select()
      .from(applicationMessages)
      .where(eq(applicationMessages.id, id));
    return message;
  }
  
  async createApplicationMessage(data: InsertApplicationMessage): Promise<ApplicationMessage> {
    const [message] = await db
      .insert(applicationMessages)
      .values(data)
      .returning();
    return message;
  }
  
  async markMessageRead(id: string): Promise<ApplicationMessage | undefined> {
    const [updated] = await db
      .update(applicationMessages)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(applicationMessages.id, id))
      .returning();
    return updated;
  }
  
  async markAllMessagesRead(loanApplicationId: string, readerUserId: string): Promise<void> {
    // Mark all messages from OTHER users as read (messages you didn't send)
    await db
      .update(applicationMessages)
      .set({ isRead: true, readAt: new Date() })
      .where(and(
        eq(applicationMessages.loanApplicationId, loanApplicationId),
        ne(applicationMessages.senderUserId, readerUserId),
        eq(applicationMessages.isRead, false)
      ));
  }
  
  async getUnreadMessageCount(loanApplicationId: string, forUserId: string): Promise<number> {
    // Count unread messages that were NOT sent by this user
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(applicationMessages)
      .where(and(
        eq(applicationMessages.loanApplicationId, loanApplicationId),
        ne(applicationMessages.senderUserId, forUserId),
        eq(applicationMessages.isRead, false)
      ));
    return result[0]?.count || 0;
  }
  
  async getAllMessagesForUser(userId: string): Promise<{
    message: ApplicationMessage;
    loan: { id: string; propertyAddress: string | null; loanType: string; status: string };
  }[]> {
    // Get all applications for this user
    const userApplications = await db
      .select()
      .from(loanApplications)
      .where(eq(loanApplications.userId, userId));
    
    if (userApplications.length === 0) {
      return [];
    }
    
    const applicationIds = userApplications.map(app => app.id);
    
    // Get all messages for these applications
    const messages = await db
      .select()
      .from(applicationMessages)
      .where(inArray(applicationMessages.loanApplicationId, applicationIds))
      .orderBy(desc(applicationMessages.createdAt));
    
    // Map messages to their loans
    const appMap = new Map(userApplications.map(app => [app.id, app]));
    
    return messages.map(msg => ({
      message: msg,
      loan: {
        id: appMap.get(msg.loanApplicationId)!.id,
        propertyAddress: appMap.get(msg.loanApplicationId)!.propertyAddress,
        loanType: appMap.get(msg.loanApplicationId)!.loanType,
        status: appMap.get(msg.loanApplicationId)!.status,
      }
    }));
  }
  
  async getTotalUnreadCountForUser(userId: string): Promise<number> {
    // Get all applications for this user
    const userApplications = await db
      .select({ id: loanApplications.id })
      .from(loanApplications)
      .where(eq(loanApplications.userId, userId));
    
    if (userApplications.length === 0) {
      return 0;
    }
    
    const applicationIds = userApplications.map(app => app.id);
    
    // Count all unread messages not sent by this user across all their applications
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(applicationMessages)
      .where(and(
        inArray(applicationMessages.loanApplicationId, applicationIds),
        ne(applicationMessages.senderUserId, userId),
        eq(applicationMessages.isRead, false)
      ));
    
    return result[0]?.count || 0;
  }
  
  async getMessageThreadsForStaff(): Promise<{
    applicationId: string;
    propertyAddress: string | null;
    loanType: string;
    status: string;
    borrowerName: string;
    borrowerEmail: string | null;
    latestMessage: ApplicationMessage | null;
    unreadCount: number;
    totalMessages: number;
  }[]> {
    // Get all applications that have at least one message
    const appsWithMessages = await db
      .selectDistinct({ applicationId: applicationMessages.loanApplicationId })
      .from(applicationMessages);
    
    if (appsWithMessages.length === 0) {
      return [];
    }
    
    const threads = [];
    
    for (const { applicationId } of appsWithMessages) {
      const app = await db
        .select()
        .from(loanApplications)
        .where(eq(loanApplications.id, applicationId))
        .limit(1);
      
      if (!app[0]) continue;
      
      const borrower = await db
        .select()
        .from(users)
        .where(eq(users.id, app[0].userId))
        .limit(1);
      
      // Get latest message
      const latestMessages = await db
        .select()
        .from(applicationMessages)
        .where(eq(applicationMessages.loanApplicationId, applicationId))
        .orderBy(desc(applicationMessages.createdAt))
        .limit(1);
      
      // Count unread messages from borrowers (messages staff hasn't read)
      const unreadResult = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(applicationMessages)
        .where(and(
          eq(applicationMessages.loanApplicationId, applicationId),
          eq(applicationMessages.senderRole, 'borrower'),
          eq(applicationMessages.isRead, false)
        ));
      
      // Count total messages
      const totalResult = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(applicationMessages)
        .where(eq(applicationMessages.loanApplicationId, applicationId));
      
      const user = borrower[0];
      threads.push({
        applicationId,
        propertyAddress: app[0].propertyAddress,
        loanType: app[0].loanType,
        status: app[0].status,
        borrowerName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown' : 'Unknown',
        borrowerEmail: user?.email || null,
        latestMessage: latestMessages[0] || null,
        unreadCount: unreadResult[0]?.count || 0,
        totalMessages: totalResult[0]?.count || 0,
      });
    }
    
    // Sort by latest message date
    threads.sort((a, b) => {
      const dateA = a.latestMessage?.createdAt ? new Date(a.latestMessage.createdAt).getTime() : 0;
      const dateB = b.latestMessage?.createdAt ? new Date(b.latestMessage.createdAt).getTime() : 0;
      return dateB - dateA;
    });
    
    return threads;
  }
  
  async getTotalUnreadCountForStaff(): Promise<number> {
    // Count all unread messages from borrowers
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(applicationMessages)
      .where(and(
        eq(applicationMessages.senderRole, 'borrower'),
        eq(applicationMessages.isRead, false)
      ));
    
    return result[0]?.count || 0;
  }
  
  // Staff message preferences operations
  async getStaffMessagePreferences(staffUserId: string): Promise<StaffMessagePreferences | undefined> {
    const [prefs] = await db
      .select()
      .from(staffMessagePreferences)
      .where(eq(staffMessagePreferences.staffUserId, staffUserId));
    return prefs;
  }
  
  async upsertStaffMessagePreferences(data: InsertStaffMessagePreferences): Promise<StaffMessagePreferences> {
    const [prefs] = await db
      .insert(staffMessagePreferences)
      .values(data)
      .onConflictDoUpdate({
        target: staffMessagePreferences.staffUserId,
        set: {
          ...data,
          updatedAt: new Date(),
        },
      })
      .returning();
    return prefs;
  }
  
  async updateStaffHeartbeat(staffUserId: string): Promise<void> {
    // Upsert the heartbeat - create preferences if they don't exist
    await db
      .insert(staffMessagePreferences)
      .values({
        staffUserId,
        lastHeartbeatAt: new Date(),
      })
      .onConflictDoUpdate({
        target: staffMessagePreferences.staffUserId,
        set: {
          lastHeartbeatAt: new Date(),
          updatedAt: new Date(),
        },
      });
  }
  
  async getOnlineStaff(thresholdMinutes: number = 2): Promise<User[]> {
    const thresholdTime = new Date(Date.now() - thresholdMinutes * 60 * 1000);
    
    // Get all staff users who have a heartbeat within the threshold
    const onlineStaff = await db
      .select({
        user: users,
      })
      .from(users)
      .innerJoin(
        staffMessagePreferences,
        eq(users.id, staffMessagePreferences.staffUserId)
      )
      .where(
        and(
          or(eq(users.role, 'staff'), eq(users.role, 'admin')),
          gte(staffMessagePreferences.lastHeartbeatAt, thresholdTime)
        )
      );
    
    return onlineStaff.map(row => row.user);
  }
  
  async getOfflineStaffForNotification(offlineThresholdMinutes: number = 2): Promise<{
    user: User;
    preferences: StaffMessagePreferences;
    unreadCount: number;
  }[]> {
    const thresholdTime = new Date(Date.now() - offlineThresholdMinutes * 60 * 1000);
    
    // First, get the total unread count - if zero, no need to notify anyone
    const totalUnread = await this.getTotalUnreadCountForStaff();
    if (totalUnread === 0) {
      return [];
    }
    
    // Get staff users who are offline (no recent heartbeat) with email notifications enabled
    const offlineStaff = await db
      .select({
        user: users,
        preferences: staffMessagePreferences,
      })
      .from(users)
      .innerJoin(
        staffMessagePreferences,
        eq(users.id, staffMessagePreferences.staffUserId)
      )
      .where(
        and(
          or(eq(users.role, 'staff'), eq(users.role, 'admin')),
          eq(staffMessagePreferences.emailNotificationsEnabled, true),
          or(
            sql`${staffMessagePreferences.lastHeartbeatAt} IS NULL`,
            lte(staffMessagePreferences.lastHeartbeatAt, thresholdTime)
          )
        )
      );
    
    // Shared inbox model: All staff share the same unread messages.
    // Staff need notification if:
    // 1. They've never been notified AND there are unread messages, OR
    // 2. Their batch interval has passed AND there are still unread messages
    // The batch interval acts as a "reminder" interval - if messages stay unread,
    // staff get periodic reminders every batchIntervalMinutes.
    const result: { user: User; preferences: StaffMessagePreferences; unreadCount: number }[] = [];
    
    for (const row of offlineStaff) {
      const { user, preferences } = row;
      const lastNotified = preferences.lastNotifiedAt;
      const batchInterval = preferences.batchIntervalMinutes || 15;
      
      // If never notified, notify about all unread messages
      if (!lastNotified) {
        result.push({ user, preferences, unreadCount: totalUnread });
        continue;
      }
      
      // Check if batch interval has passed since last notification
      const timeSinceNotified = (Date.now() - new Date(lastNotified).getTime()) / (1000 * 60);
      if (timeSinceNotified >= batchInterval) {
        // Batch interval passed and there are unread messages - send reminder
        result.push({ user, preferences, unreadCount: totalUnread });
      }
    }
    
    return result;
  }
  
  async updateStaffLastNotified(staffUserId: string): Promise<void> {
    await db
      .update(staffMessagePreferences)
      .set({
        lastNotifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(staffMessagePreferences.staffUserId, staffUserId));
  }
  
  // Message property updates (star, archive, priority, read)
  async updateMessageProperties(id: string, updates: {
    isStarred?: boolean;
    isArchived?: boolean;
    isRead?: boolean;
    priority?: MessagePriority;
  }): Promise<ApplicationMessage | undefined> {
    const setData: any = { ...updates };
    if (updates.isRead === true) {
      setData.readAt = new Date();
    }
    const [updated] = await db
      .update(applicationMessages)
      .set(setData)
      .where(eq(applicationMessages.id, id))
      .returning();
    return updated;
  }
  
  async bulkUpdateMessages(ids: string[], updates: {
    isStarred?: boolean;
    isArchived?: boolean;
    isRead?: boolean;
    priority?: MessagePriority;
  }): Promise<number> {
    if (ids.length === 0) return 0;
    const setData: any = { ...updates };
    if (updates.isRead === true) {
      setData.readAt = new Date();
    }
    const result = await db
      .update(applicationMessages)
      .set(setData)
      .where(inArray(applicationMessages.id, ids));
    return ids.length;
  }
  
  // Message templates CRUD
  async getMessageTemplates(userId?: string): Promise<MessageTemplate[]> {
    if (userId) {
      return db
        .select()
        .from(messageTemplates)
        .where(
          or(
            eq(messageTemplates.isGlobal, true),
            eq(messageTemplates.createdByUserId, userId)
          )
        )
        .orderBy(messageTemplates.category, messageTemplates.name);
    }
    return db
      .select()
      .from(messageTemplates)
      .where(eq(messageTemplates.isGlobal, true))
      .orderBy(messageTemplates.category, messageTemplates.name);
  }
  
  async getMessageTemplate(id: string): Promise<MessageTemplate | undefined> {
    const [template] = await db
      .select()
      .from(messageTemplates)
      .where(eq(messageTemplates.id, id));
    return template;
  }
  
  async createMessageTemplate(data: InsertMessageTemplate): Promise<MessageTemplate> {
    const [template] = await db
      .insert(messageTemplates)
      .values(data)
      .returning();
    return template;
  }
  
  async updateMessageTemplate(id: string, data: Partial<InsertMessageTemplate>): Promise<MessageTemplate | undefined> {
    const [updated] = await db
      .update(messageTemplates)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(messageTemplates.id, id))
      .returning();
    return updated;
  }
  
  async deleteMessageTemplate(id: string): Promise<boolean> {
    const result = await db
      .delete(messageTemplates)
      .where(eq(messageTemplates.id, id));
    return true;
  }
  
  async incrementTemplateUsage(id: string): Promise<void> {
    await db
      .update(messageTemplates)
      .set({
        usageCount: sql`${messageTemplates.usageCount} + 1`,
        lastUsedAt: new Date(),
      })
      .where(eq(messageTemplates.id, id));
  }
  
  // Search messages for staff (with filters)
  async searchMessagesForStaff(options: {
    filter?: 'all' | 'unread' | 'starred' | 'archived';
    search?: string;
    applicationId?: string;
  }): Promise<{
    applicationId: string;
    propertyAddress: string | null;
    loanType: string;
    status: string;
    borrowerName: string;
    borrowerEmail: string | null;
    latestMessage: ApplicationMessage | null;
    unreadCount: number;
    totalMessages: number;
    hasStarred: boolean;
    isArchived: boolean;
  }[]> {
    // Get base threads first
    let threads = await this.getMessageThreadsForStaff();
    
    // Apply filters
    if (options.filter === 'unread') {
      threads = threads.filter(t => t.unreadCount > 0);
    } else if (options.filter === 'starred') {
      // Need to check if any message in thread is starred
      const threadsWithStarred = [];
      for (const thread of threads) {
        const starredMessages = await db
          .select()
          .from(applicationMessages)
          .where(and(
            eq(applicationMessages.loanApplicationId, thread.applicationId),
            eq(applicationMessages.isStarred, true)
          ))
          .limit(1);
        if (starredMessages.length > 0) {
          threadsWithStarred.push({ ...thread, hasStarred: true, isArchived: false });
        }
      }
      return threadsWithStarred;
    } else if (options.filter === 'archived') {
      // Get threads where latest message is archived
      const archivedThreads = [];
      for (const thread of threads) {
        if (thread.latestMessage?.isArchived) {
          archivedThreads.push({ ...thread, hasStarred: false, isArchived: true });
        }
      }
      return archivedThreads;
    }
    
    // Apply search
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      threads = threads.filter(t =>
        t.borrowerName.toLowerCase().includes(searchLower) ||
        t.propertyAddress?.toLowerCase().includes(searchLower) ||
        t.latestMessage?.content.toLowerCase().includes(searchLower) ||
        t.latestMessage?.subject?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply applicationId filter
    if (options.applicationId) {
      threads = threads.filter(t => t.applicationId === options.applicationId);
    }
    
    return threads.map(t => ({ ...t, hasStarred: false, isArchived: false }));
  }
}

export const storage = new DatabaseStorage();
