import { 
  users, 
  leads, 
  loanApplications, 
  documents, 
  documentTypes,
  servicedLoans,
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
}

export const storage = new DatabaseStorage();
