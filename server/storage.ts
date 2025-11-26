import { 
  users, 
  leads, 
  loanApplications, 
  documents, 
  documentTypes,
  servicedLoans,
  notifications,
  savedScenarios,
  userPreferences,
  connectedEntities,
  documentSignatures,
  coBorrowers,
  applicationTimeline,
  marketDataSnapshots,
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
  DEFAULT_DOCUMENT_TYPES,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Lead operations
  createLead(lead: InsertLead): Promise<Lead>;
  getLeads(): Promise<Lead[]>;
  getLead(id: string): Promise<Lead | undefined>;
  
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
  getServicedLoan(id: string): Promise<ServicedLoan | undefined>;
  createServicedLoan(loan: InsertServicedLoan): Promise<ServicedLoan>;
  updateServicedLoan(id: string, data: Partial<InsertServicedLoan>): Promise<ServicedLoan | undefined>;
  
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
    // First delete associated documents
    await db.delete(documents).where(eq(documents.loanApplicationId, id));
    // Then delete the application
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
}

export const storage = new DatabaseStorage();
