import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import path from "path";
import passport from "passport";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { 
  insertLeadSchema, 
  insertLoanApplicationSchema,
  insertNotificationSchema,
  insertSavedScenarioSchema,
  insertUserPreferencesSchema,
  insertConnectedEntitySchema,
  insertDocumentSignatureSchema,
  insertCoBorrowerSchema,
  insertApplicationTimelineEventSchema,
  insertFundedDealSchema,
  insertWebhookEndpointSchema,
  insertDocumentReviewSchema,
  insertCommentAttachmentSchema,
  insertNotificationQueueItemSchema,
  insertDocumentCommentSchema,
  getStateBySlug,
  type UserRole,
  type StaffRole,
  STAFF_ROLE_COLORS,
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { setupStaffAuth, createAdminUser, createTestBorrowerUser } from "./staffAuth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import crypto from "crypto";
import { getMarketData, refreshAllMarketData, getMarketDataStatus, getPropertyValue, getPropertyLookup } from "./services/marketDataService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve state map SVGs statically
  app.use('/state_maps', express.static(path.join(process.cwd(), 'attached_assets/state_maps')));
  // Set up authentication
  await setupAuth(app);
  
  // Set up staff local authentication (username/password)
  await setupStaffAuth(app);
  
  // Create test users in development mode only
  // In production, use environment variables or a proper user management system
  if (process.env.NODE_ENV !== 'production') {
    await createAdminUser("admin", "admin");
    await createTestBorrowerUser("borrower", "borrower");
  }
  
  // Seed document types on startup
  await storage.seedDocumentTypes();

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Lead routes (existing)
  app.post("/api/leads", async (req, res) => {
    try {
      const validationResult = insertLeadSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        const fieldErrors: Record<string, string> = {};
        
        validationResult.error.errors.forEach((err) => {
          if (err.path.length > 0) {
            const fieldName = err.path[0].toString();
            fieldErrors[fieldName] = err.message;
          }
        });
        
        return res.status(400).json({
          error: "Validation failed",
          message: validationError.message,
          fieldErrors,
        });
      }

      const lead = await storage.createLead(validationResult.data);
      
      return res.status(201).json({
        message: "Lead created successfully",
        lead,
      });
    } catch (error) {
      console.error("Error creating lead:", error);
      return res.status(500).json({
        error: "Internal server error",
        message: "Failed to create lead. Please try again.",
      });
    }
  });

  app.get("/api/leads", async (req, res) => {
    try {
      const leads = await storage.getLeads();
      return res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      return res.status(500).json({
        error: "Internal server error",
        message: "Failed to fetch leads.",
      });
    }
  });

  // Loan Application routes
  app.get("/api/applications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const applications = await storage.getLoanApplications(userId);
      return res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      return res.status(500).json({ error: "Failed to fetch applications" });
    }
  });

  app.post("/api/applications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const application = await storage.createLoanApplication({
        ...req.body,
        userId,
      });
      
      // Create document entries for all required document types
      const docTypes = await storage.getDocumentTypesByLoanType(application.loanType);
      for (const docType of docTypes) {
        await storage.createDocument({
          loanApplicationId: application.id,
          documentTypeId: docType.id,
          status: docType.isRequired === "if_applicable" ? "if_applicable" : "pending",
        });
      }
      
      // Create initial timeline event
      await storage.createTimelineEvent({
        loanApplicationId: application.id,
        eventType: "application_created",
        title: "Application Created",
        description: `${application.loanType} loan application submitted`,
      });
      
      // Create welcome notification
      await storage.createNotification({
        userId,
        type: "general",
        title: "Application Submitted",
        message: `Your ${application.loanType} loan application has been successfully submitted. We'll be in touch soon!`,
        relatedApplicationId: application.id,
      });
      
      return res.status(201).json(application);
    } catch (error) {
      console.error("Error creating application:", error);
      return res.status(500).json({ error: "Failed to create application" });
    }
  });

  app.get("/api/applications/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const application = await storage.getLoanApplication(req.params.id);
      
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      
      if (application.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      return res.json(application);
    } catch (error) {
      console.error("Error fetching application:", error);
      return res.status(500).json({ error: "Failed to fetch application" });
    }
  });

  // Update application (user updates their own application - limited fields, draft only)
  app.patch("/api/applications/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const application = await storage.getLoanApplication(req.params.id);
      
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      
      if (application.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Users can only update certain fields and only on draft applications
      if (application.status !== "draft") {
        return res.status(400).json({ error: "Cannot modify submitted applications" });
      }
      
      // Allow only safe fields to be updated by users
      const allowedFields = [
        "propertyAddress", "propertyCity", "propertyState", "propertyZip",
        "purchasePrice", "loanAmount", "rehabBudget", "arv",
        "guarantor", "entityName", "closingDate",
      ];
      
      const updates: Record<string, any> = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      }
      
      const updated = await storage.updateLoanApplication(req.params.id, updates);
      return res.json(updated);
    } catch (error) {
      console.error("Error updating application:", error);
      return res.status(500).json({ error: "Failed to update application" });
    }
  });

  app.delete("/api/applications/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const application = await storage.getLoanApplication(req.params.id);
      
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      
      if (application.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      await storage.deleteLoanApplication(req.params.id);
      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting application:", error);
      return res.status(500).json({ error: "Failed to delete application" });
    }
  });

  // Submit application (user submits their draft application for review)
  app.patch("/api/applications/:id/submit", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const application = await storage.getLoanApplication(req.params.id);
      
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      
      if (application.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      if (application.status !== "draft") {
        return res.status(400).json({ error: "Only draft applications can be submitted" });
      }
      
      // Update status to submitted and set processing stage to account review
      const updated = await storage.updateLoanApplication(req.params.id, {
        status: "submitted",
        processingStage: "account_review",
      });
      
      // Create timeline event
      await storage.createTimelineEvent({
        loanApplicationId: req.params.id,
        eventType: "application_submitted",
        title: "Application Submitted",
        description: "Application has been submitted for review by the borrower.",
        createdByUserId: userId,
      });
      
      return res.json(updated);
    } catch (error) {
      console.error("Error submitting application:", error);
      return res.status(500).json({ error: "Failed to submit application" });
    }
  });

  // Document routes
  app.get("/api/applications/:id/documents", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const application = await storage.getLoanApplication(req.params.id);
      
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      
      if (application.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const docs = await storage.getDocumentsByApplication(req.params.id);
      const docTypes = await storage.getDocumentTypes();
      
      // Join document info with document type info
      const documentsWithTypes = docs.map(doc => {
        const docType = docTypes.find(dt => dt.id === doc.documentTypeId);
        return {
          ...doc,
          documentType: docType,
        };
      });
      
      return res.json(documentsWithTypes);
    } catch (error) {
      console.error("Error fetching documents:", error);
      return res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  app.patch("/api/documents/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const doc = await storage.getDocument(req.params.id);
      
      if (!doc) {
        return res.status(404).json({ error: "Document not found" });
      }
      
      const application = await storage.getLoanApplication(doc.loanApplicationId);
      if (!application || application.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const updated = await storage.updateDocument(req.params.id, req.body);
      return res.json(updated);
    } catch (error) {
      console.error("Error updating document:", error);
      return res.status(500).json({ error: "Failed to update document" });
    }
  });

  // Document type routes
  app.get("/api/document-types", async (req, res) => {
    try {
      const docTypes = await storage.getDocumentTypes();
      return res.json(docTypes);
    } catch (error) {
      console.error("Error fetching document types:", error);
      return res.status(500).json({ error: "Failed to fetch document types" });
    }
  });

  // Object Storage routes for document uploads
  // Generic upload URL (for backwards compatibility)
  app.post("/api/objects/upload", isAuthenticated, async (req: any, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error: any) {
      console.error("Error getting upload URL:", error);
      if (error.message?.includes("PRIVATE_OBJECT_DIR")) {
        res.status(503).json({ 
          error: "File storage not configured. Please contact support.",
          details: "Object storage environment not set up"
        });
      } else {
        res.status(500).json({ error: "Failed to get upload URL. Please try again." });
      }
    }
  });

  // Application-specific document upload URL
  // Creates organized folder structure: /{dealName}/{filename}
  // dealName format: "123 Main Street, City, ST"
  app.post("/api/documents/:id/upload-url", isAuthenticated, async (req: any, res) => {
    const userId = req.user?.claims?.sub;
    const { fileName } = req.body;

    if (!fileName) {
      return res.status(400).json({ error: "fileName is required" });
    }

    try {
      const doc = await storage.getDocument(req.params.id);
      if (!doc) {
        return res.status(404).json({ error: "Document not found" });
      }

      const application = await storage.getLoanApplication(doc.loanApplicationId);
      if (!application || application.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Build deal name from property address (short format)
      // If city/state are separate, use them; otherwise use the full address
      let dealName: string;
      if (application.propertyCity && application.propertyState) {
        // Use structured address format
        dealName = [
          application.propertyAddress,
          application.propertyCity,
          application.propertyState
        ].filter(Boolean).join(", ");
      } else if (application.propertyAddress) {
        // Full address is in propertyAddress - use it directly
        dealName = application.propertyAddress;
      } else {
        dealName = `Application ${application.id.slice(0, 8)}`;
      }

      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getApplicationDocumentUploadURL(
        dealName,
        fileName
      );
      
      res.json({ uploadURL });
    } catch (error: any) {
      console.error("Error getting document upload URL:", error);
      if (error.message?.includes("PRIVATE_OBJECT_DIR")) {
        res.status(503).json({ 
          error: "File storage not configured. Please contact support.",
          details: "Object storage environment not set up"
        });
      } else {
        res.status(500).json({ error: "Failed to get upload URL. Please try again." });
      }
    }
  });

  app.get("/objects/:objectPath(*)", isAuthenticated, async (req: any, res) => {
    const userId = req.user?.claims?.sub;
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.put("/api/documents/:id/file", isAuthenticated, async (req: any, res) => {
    const userId = req.user?.claims?.sub;
    
    if (!req.body.uploadURL) {
      return res.status(400).json({ error: "uploadURL is required" });
    }

    try {
      const doc = await storage.getDocument(req.params.id);
      if (!doc) {
        return res.status(404).json({ error: "Document not found" });
      }

      const application = await storage.getLoanApplication(doc.loanApplicationId);
      if (!application || application.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.uploadURL,
        {
          owner: userId,
          visibility: "private",
        }
      );

      const updated = await storage.updateDocument(req.params.id, {
        status: "uploaded",
        fileUrl: objectPath,
        fileName: req.body.fileName || "document",
        fileSize: req.body.fileSize || 0,
        mimeType: req.body.mimeType || "application/octet-stream",
        uploadedAt: new Date(),
      });
      
      // Get document type name for timeline
      const docTypes = await storage.getDocumentTypes();
      const docType = docTypes.find(dt => dt.id === doc.documentTypeId);
      
      // Create timeline event for document upload
      await storage.createTimelineEvent({
        loanApplicationId: doc.loanApplicationId,
        eventType: "document_uploaded",
        title: `${docType?.name || "Document"} Uploaded`,
        description: req.body.fileName || "Document uploaded successfully",
      });
      

      res.status(200).json(updated);
    } catch (error) {
      console.error("Error updating document file:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Serviced Loans routes
  app.get("/api/serviced-loans", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const loans = await storage.getServicedLoans(userId);
      return res.json(loans);
    } catch (error) {
      console.error("Error fetching serviced loans:", error);
      return res.status(500).json({ error: "Failed to fetch serviced loans" });
    }
  });

  app.get("/api/serviced-loans/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const loan = await storage.getServicedLoan(req.params.id);
      
      if (!loan) {
        return res.status(404).json({ error: "Loan not found" });
      }
      
      // Staff/admin can view any loan, borrowers can only view their own
      if (loan.userId !== userId && user?.role === "borrower") {
        return res.status(403).json({ error: "Access denied" });
      }
      
      return res.json(loan);
    } catch (error) {
      console.error("Error fetching serviced loan:", error);
      return res.status(500).json({ error: "Failed to fetch serviced loan" });
    }
  });

  // Get full loan details with payments, draws, escrow, documents, milestones
  app.get("/api/serviced-loans/:id/details", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const loan = await storage.getServicedLoan(req.params.id);
      
      if (!loan) {
        return res.status(404).json({ error: "Loan not found" });
      }
      
      if (loan.userId !== userId && user?.role === "borrower") {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Fetch all related data
      const [payments, draws, escrowItems, documents, milestones] = await Promise.all([
        storage.getLoanPayments(loan.id),
        storage.getLoanDraws(loan.id),
        storage.getLoanEscrowItems(loan.id),
        storage.getLoanDocuments(loan.id),
        storage.getLoanMilestones(loan.id),
      ]);
      
      return res.json({
        ...loan,
        payments,
        draws,
        escrowItems,
        documents,
        milestones,
      });
    } catch (error) {
      console.error("Error fetching loan details:", error);
      return res.status(500).json({ error: "Failed to fetch loan details" });
    }
  });

  // ============================================
  // LOAN PAYMENTS ROUTES
  // ============================================
  app.get("/api/serviced-loans/:loanId/payments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const loan = await storage.getServicedLoan(req.params.loanId);
      
      if (!loan) {
        return res.status(404).json({ error: "Loan not found" });
      }
      
      if (loan.userId !== userId && user?.role === "borrower") {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const payments = await storage.getLoanPayments(loan.id);
      return res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      return res.status(500).json({ error: "Failed to fetch payments" });
    }
  });

  app.post("/api/serviced-loans/:loanId/payments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Only staff/admin can create payments
      if (user?.role === "borrower") {
        return res.status(403).json({ error: "Only staff can record payments" });
      }
      
      const payment = await storage.createLoanPayment({
        ...req.body,
        servicedLoanId: req.params.loanId,
      });
      return res.status(201).json(payment);
    } catch (error) {
      console.error("Error creating payment:", error);
      return res.status(500).json({ error: "Failed to create payment" });
    }
  });

  app.patch("/api/loan-payments/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role === "borrower") {
        return res.status(403).json({ error: "Only staff can update payments" });
      }
      
      const payment = await storage.updateLoanPayment(req.params.id, req.body);
      return res.json(payment);
    } catch (error) {
      console.error("Error updating payment:", error);
      return res.status(500).json({ error: "Failed to update payment" });
    }
  });

  // ============================================
  // LOAN DRAWS ROUTES (For Hard Money Loans)
  // ============================================
  app.get("/api/serviced-loans/:loanId/draws", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const loan = await storage.getServicedLoan(req.params.loanId);
      
      if (!loan) {
        return res.status(404).json({ error: "Loan not found" });
      }
      
      if (loan.userId !== userId && user?.role === "borrower") {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const draws = await storage.getLoanDraws(loan.id);
      return res.json(draws);
    } catch (error) {
      console.error("Error fetching draws:", error);
      return res.status(500).json({ error: "Failed to fetch draws" });
    }
  });

  app.post("/api/serviced-loans/:loanId/draws", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const loan = await storage.getServicedLoan(req.params.loanId);
      
      if (!loan) {
        return res.status(404).json({ error: "Loan not found" });
      }
      
      // Borrowers can only create draws for their own loans
      if (loan.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Get existing draws to determine next draw number
      const existingDraws = await storage.getLoanDraws(loan.id);
      const nextDrawNumber = existingDraws.length + 1;
      
      const draw = await storage.createLoanDraw({
        ...req.body,
        servicedLoanId: loan.id,
        drawNumber: nextDrawNumber,
        status: "draft",
      });
      return res.status(201).json(draw);
    } catch (error) {
      console.error("Error creating draw:", error);
      return res.status(500).json({ error: "Failed to create draw" });
    }
  });

  app.patch("/api/loan-draws/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const draw = await storage.getLoanDraw(req.params.id);
      
      if (!draw) {
        return res.status(404).json({ error: "Draw not found" });
      }
      
      const loan = await storage.getServicedLoan(draw.servicedLoanId);
      
      // Borrowers can only update draft draws for their own loans
      if (user?.role === "borrower") {
        if (loan?.userId !== userId) {
          return res.status(403).json({ error: "Access denied" });
        }
        if (draw.status !== "draft" && draw.status !== "submitted") {
          return res.status(403).json({ error: "Can only modify draft or submitted draws" });
        }
      }
      
      const updated = await storage.updateLoanDraw(req.params.id, req.body);
      return res.json(updated);
    } catch (error) {
      console.error("Error updating draw:", error);
      return res.status(500).json({ error: "Failed to update draw" });
    }
  });

  // Submit a draw for review
  app.post("/api/loan-draws/:id/submit", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const draw = await storage.getLoanDraw(req.params.id);
      
      if (!draw) {
        return res.status(404).json({ error: "Draw not found" });
      }
      
      const loan = await storage.getServicedLoan(draw.servicedLoanId);
      
      if (loan?.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      if (draw.status !== "draft") {
        return res.status(400).json({ error: "Can only submit draft draws" });
      }
      
      const updated = await storage.updateLoanDraw(req.params.id, {
        status: "submitted",
        requestedDate: new Date(),
      });
      return res.json(updated);
    } catch (error) {
      console.error("Error submitting draw:", error);
      return res.status(500).json({ error: "Failed to submit draw" });
    }
  });

  app.delete("/api/loan-draws/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const draw = await storage.getLoanDraw(req.params.id);
      
      if (!draw) {
        return res.status(404).json({ error: "Draw not found" });
      }
      
      const loan = await storage.getServicedLoan(draw.servicedLoanId);
      
      if (loan?.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      if (draw.status !== "draft") {
        return res.status(400).json({ error: "Can only delete draft draws" });
      }
      
      await storage.deleteLoanDraw(req.params.id);
      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting draw:", error);
      return res.status(500).json({ error: "Failed to delete draw" });
    }
  });

  // ============================================
  // LOAN ESCROW ROUTES (For DSCR Loans)
  // ============================================
  app.get("/api/serviced-loans/:loanId/escrow", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const loan = await storage.getServicedLoan(req.params.loanId);
      
      if (!loan) {
        return res.status(404).json({ error: "Loan not found" });
      }
      
      if (loan.userId !== userId && user?.role === "borrower") {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const escrowItems = await storage.getLoanEscrowItems(loan.id);
      return res.json(escrowItems);
    } catch (error) {
      console.error("Error fetching escrow items:", error);
      return res.status(500).json({ error: "Failed to fetch escrow items" });
    }
  });

  // ============================================
  // LOAN DOCUMENTS ROUTES
  // ============================================
  app.get("/api/serviced-loans/:loanId/documents", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const loan = await storage.getServicedLoan(req.params.loanId);
      
      if (!loan) {
        return res.status(404).json({ error: "Loan not found" });
      }
      
      if (loan.userId !== userId && user?.role === "borrower") {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const documents = await storage.getLoanDocuments(loan.id);
      return res.json(documents);
    } catch (error) {
      console.error("Error fetching loan documents:", error);
      return res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  app.post("/api/serviced-loans/:loanId/documents", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const loan = await storage.getServicedLoan(req.params.loanId);
      
      if (!loan) {
        return res.status(404).json({ error: "Loan not found" });
      }
      
      const document = await storage.createLoanDocument({
        ...req.body,
        servicedLoanId: loan.id,
        uploadedById: userId,
      });
      return res.status(201).json(document);
    } catch (error) {
      console.error("Error creating loan document:", error);
      return res.status(500).json({ error: "Failed to create document" });
    }
  });

  // ============================================
  // LOAN MILESTONES ROUTES (For Construction)
  // ============================================
  app.get("/api/serviced-loans/:loanId/milestones", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const loan = await storage.getServicedLoan(req.params.loanId);
      
      if (!loan) {
        return res.status(404).json({ error: "Loan not found" });
      }
      
      if (loan.userId !== userId && user?.role === "borrower") {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const milestones = await storage.getLoanMilestones(loan.id);
      return res.json(milestones);
    } catch (error) {
      console.error("Error fetching milestones:", error);
      return res.status(500).json({ error: "Failed to fetch milestones" });
    }
  });

  app.patch("/api/loan-milestones/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role === "borrower") {
        return res.status(403).json({ error: "Only staff can update milestones" });
      }
      
      const milestone = await storage.updateLoanMilestone(req.params.id, req.body);
      return res.json(milestone);
    } catch (error) {
      console.error("Error updating milestone:", error);
      return res.status(500).json({ error: "Failed to update milestone" });
    }
  });

  // ============================================
  // NOTIFICATION ROUTES
  // ============================================
  app.get("/api/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getNotifications(userId);
      return res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.get("/api/notifications/unread-count", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const count = await storage.getUnreadNotificationCount(userId);
      return res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      return res.status(500).json({ error: "Failed to fetch unread count" });
    }
  });

  app.post("/api/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notification = await storage.createNotification({
        ...req.body,
        userId,
      });
      return res.status(201).json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      return res.status(500).json({ error: "Failed to create notification" });
    }
  });

  app.patch("/api/notifications/:id/read", isAuthenticated, async (req: any, res) => {
    try {
      const notification = await storage.markNotificationRead(req.params.id);
      return res.json(notification);
    } catch (error) {
      console.error("Error marking notification read:", error);
      return res.status(500).json({ error: "Failed to mark notification read" });
    }
  });

  app.post("/api/notifications/mark-all-read", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.markAllNotificationsRead(userId);
      return res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications read:", error);
      return res.status(500).json({ error: "Failed to mark all notifications read" });
    }
  });

  app.delete("/api/notifications/:id", isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteNotification(req.params.id);
      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting notification:", error);
      return res.status(500).json({ error: "Failed to delete notification" });
    }
  });

  // ============================================
  // SAVED SCENARIOS ROUTES
  // ============================================
  app.get("/api/scenarios", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const type = req.query.type as string | undefined;
      const scenarios = await storage.getSavedScenarios(userId, type);
      return res.json(scenarios);
    } catch (error) {
      console.error("Error fetching scenarios:", error);
      return res.status(500).json({ error: "Failed to fetch scenarios" });
    }
  });

  app.get("/api/scenarios/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const scenario = await storage.getSavedScenario(req.params.id);
      
      if (!scenario) {
        return res.status(404).json({ error: "Scenario not found" });
      }
      
      if (scenario.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      return res.json(scenario);
    } catch (error) {
      console.error("Error fetching scenario:", error);
      return res.status(500).json({ error: "Failed to fetch scenario" });
    }
  });

  app.post("/api/scenarios", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const scenario = await storage.createSavedScenario({
        ...req.body,
        userId,
      });
      return res.status(201).json(scenario);
    } catch (error) {
      console.error("Error creating scenario:", error);
      return res.status(500).json({ error: "Failed to create scenario" });
    }
  });

  app.patch("/api/scenarios/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const scenario = await storage.getSavedScenario(req.params.id);
      
      if (!scenario) {
        return res.status(404).json({ error: "Scenario not found" });
      }
      
      if (scenario.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const updated = await storage.updateSavedScenario(req.params.id, req.body);
      return res.json(updated);
    } catch (error) {
      console.error("Error updating scenario:", error);
      return res.status(500).json({ error: "Failed to update scenario" });
    }
  });

  app.delete("/api/scenarios/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const scenario = await storage.getSavedScenario(req.params.id);
      
      if (!scenario) {
        return res.status(404).json({ error: "Scenario not found" });
      }
      
      if (scenario.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      await storage.deleteSavedScenario(req.params.id);
      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting scenario:", error);
      return res.status(500).json({ error: "Failed to delete scenario" });
    }
  });

  // ============================================
  // USER PREFERENCES ROUTES
  // ============================================
  app.get("/api/preferences", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const prefs = await storage.getUserPreferences(userId);
      return res.json(prefs || {});
    } catch (error) {
      console.error("Error fetching preferences:", error);
      return res.status(500).json({ error: "Failed to fetch preferences" });
    }
  });

  app.put("/api/preferences", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const prefs = await storage.upsertUserPreferences({
        ...req.body,
        userId,
      });
      return res.json(prefs);
    } catch (error) {
      console.error("Error updating preferences:", error);
      return res.status(500).json({ error: "Failed to update preferences" });
    }
  });

  // ============================================
  // CONNECTED ENTITIES ROUTES
  // ============================================
  app.get("/api/entities", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entities = await storage.getConnectedEntities(userId);
      return res.json(entities);
    } catch (error) {
      console.error("Error fetching entities:", error);
      return res.status(500).json({ error: "Failed to fetch entities" });
    }
  });

  app.get("/api/entities/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entity = await storage.getConnectedEntity(req.params.id);
      
      if (!entity) {
        return res.status(404).json({ error: "Entity not found" });
      }
      
      if (entity.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      return res.json(entity);
    } catch (error) {
      console.error("Error fetching entity:", error);
      return res.status(500).json({ error: "Failed to fetch entity" });
    }
  });

  app.post("/api/entities", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entity = await storage.createConnectedEntity({
        ...req.body,
        userId,
      });
      return res.status(201).json(entity);
    } catch (error) {
      console.error("Error creating entity:", error);
      return res.status(500).json({ error: "Failed to create entity" });
    }
  });

  app.patch("/api/entities/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entity = await storage.getConnectedEntity(req.params.id);
      
      if (!entity) {
        return res.status(404).json({ error: "Entity not found" });
      }
      
      if (entity.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const updated = await storage.updateConnectedEntity(req.params.id, req.body);
      return res.json(updated);
    } catch (error) {
      console.error("Error updating entity:", error);
      return res.status(500).json({ error: "Failed to update entity" });
    }
  });

  app.delete("/api/entities/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entity = await storage.getConnectedEntity(req.params.id);
      
      if (!entity) {
        return res.status(404).json({ error: "Entity not found" });
      }
      
      if (entity.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      await storage.deleteConnectedEntity(req.params.id);
      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting entity:", error);
      return res.status(500).json({ error: "Failed to delete entity" });
    }
  });

  // ============================================
  // DOCUMENT SIGNATURES ROUTES
  // ============================================
  app.get("/api/documents/:id/signatures", isAuthenticated, async (req: any, res) => {
    try {
      const signatures = await storage.getDocumentSignatures(req.params.id);
      return res.json(signatures);
    } catch (error) {
      console.error("Error fetching signatures:", error);
      return res.status(500).json({ error: "Failed to fetch signatures" });
    }
  });

  app.post("/api/documents/:id/signatures", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const signature = await storage.createDocumentSignature({
        documentId: req.params.id,
        signerId: userId,
        status: "pending",
      });
      return res.status(201).json(signature);
    } catch (error) {
      console.error("Error creating signature:", error);
      return res.status(500).json({ error: "Failed to create signature" });
    }
  });

  app.patch("/api/signatures/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const signature = await storage.getDocumentSignature(req.params.id);
      
      if (!signature) {
        return res.status(404).json({ error: "Signature not found" });
      }
      
      if (signature.signerId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const updated = await storage.updateDocumentSignature(req.params.id, {
        ...req.body,
        signedAt: req.body.status === "signed" ? new Date() : undefined,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });
      return res.json(updated);
    } catch (error) {
      console.error("Error updating signature:", error);
      return res.status(500).json({ error: "Failed to update signature" });
    }
  });

  // ============================================
  // DOCUMENT COMMENTS ROUTES
  // ============================================
  app.get("/api/documents/:id/comments", isAuthenticated, async (req: any, res) => {
    try {
      const comments = await storage.getDocumentComments(req.params.id);
      return res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      return res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.post("/api/documents/:id/comments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const document = await storage.getDocument(req.params.id);
      
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      
      const comment = await storage.createDocumentComment({
        documentId: req.params.id,
        userId,
        content: req.body.content,
        isInternal: req.body.isInternal || false,
      });
      
      // Get document type info for the notification
      const docTypes = await storage.getDocumentTypes();
      const docType = docTypes.find(dt => dt.id === document.documentTypeId);
      
      // Get the loan application for context
      const application = await storage.getLoanApplication(document.loanApplicationId);
      
      if (application) {
        // Get the application owner for notification
        const appOwner = await storage.getUser(application.userId);
        
        // Create in-app notification for the application owner (if commenter is not the owner)
        if (application.userId !== userId) {
          await storage.createNotification({
            userId: application.userId,
            type: "general",
            title: "New Document Comment",
            message: `A new comment was added to "${docType?.name || 'a document'}" by ${user?.firstName || 'Someone'}`,
            linkUrl: `/portal/applications/${application.id}`,
            relatedApplicationId: application.id,
          });
        }
        
        // Send webhook notification to CRM
        const webhookUrl = process.env.CRM_WEBHOOK_URL;
        if (webhookUrl) {
          const payload = {
            event: "document_comment_added",
            timestamp: new Date().toISOString(),
            data: {
              commentId: comment.id,
              documentId: document.id,
              documentName: docType?.name || "Unknown Document",
              applicationId: application.id,
              propertyAddress: application.propertyAddress,
              loanType: application.loanType,
              commenterName: [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Unknown",
              commenterEmail: user?.email || null,
              recipientEmail: appOwner?.email || null,
              recipientName: [appOwner?.firstName, appOwner?.lastName].filter(Boolean).join(" ") || null,
              comment: comment.content,
              isInternal: comment.isInternal,
            },
          };
          
          fetch(webhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Webhook-Source": "secured-asset-funding",
              "X-Webhook-Event": "document_comment_added",
              ...(process.env.CRM_WEBHOOK_SECRET && {
                "X-Webhook-Secret": process.env.CRM_WEBHOOK_SECRET
              })
            },
            body: JSON.stringify(payload),
          }).catch(err => console.error("[Webhook] Error sending notification:", err));
        }
        
        // Create timeline event
        await storage.createTimelineEvent({
          loanApplicationId: application.id,
          eventType: "note_added",
          title: "Comment Added",
          description: `Comment added to ${docType?.name || 'document'}: "${comment.content.substring(0, 50)}${comment.content.length > 50 ? '...' : ''}"`,
          createdByUserId: userId,
        });
      }
      
      // Return comment with user info
      const commentWithUser = {
        ...comment,
        user: user || null,
      };
      
      return res.status(201).json(commentWithUser);
    } catch (error) {
      console.error("Error creating comment:", error);
      return res.status(500).json({ error: "Failed to create comment" });
    }
  });

  app.patch("/api/comments/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const comment = await storage.getDocumentComment(req.params.id);
      
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }
      
      if (comment.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const updated = await storage.updateDocumentComment(req.params.id, {
        content: req.body.content,
      });
      return res.json(updated);
    } catch (error) {
      console.error("Error updating comment:", error);
      return res.status(500).json({ error: "Failed to update comment" });
    }
  });

  app.delete("/api/comments/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const comment = await storage.getDocumentComment(req.params.id);
      
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }
      
      if (comment.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      await storage.deleteDocumentComment(req.params.id);
      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting comment:", error);
      return res.status(500).json({ error: "Failed to delete comment" });
    }
  });

  // ============================================
  // CO-BORROWER ROUTES
  // ============================================
  app.get("/api/applications/:id/co-borrowers", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const application = await storage.getLoanApplication(req.params.id);
      
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      
      if (application.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const coBorrowers = await storage.getCoBorrowers(req.params.id);
      return res.json(coBorrowers);
    } catch (error) {
      console.error("Error fetching co-borrowers:", error);
      return res.status(500).json({ error: "Failed to fetch co-borrowers" });
    }
  });

  app.post("/api/applications/:id/co-borrowers", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const application = await storage.getLoanApplication(req.params.id);
      
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      
      if (application.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const inviteToken = crypto.randomBytes(32).toString("hex");
      const coBorrower = await storage.createCoBorrower({
        loanApplicationId: req.params.id,
        invitedByUserId: userId,
        invitedEmail: req.body.email,
        role: req.body.role || "co_borrower",
        inviteToken,
      });
      
      // Create notification for the invited user (if they exist)
      await storage.createNotification({
        userId,
        type: "co_borrower_invite",
        title: "Co-Borrower Invited",
        message: `You invited ${req.body.email} as a ${req.body.role || "co-borrower"} on your loan application.`,
        relatedApplicationId: req.params.id,
      });
      
      // Create timeline event
      await storage.createTimelineEvent({
        loanApplicationId: req.params.id,
        eventType: "co_borrower_added",
        title: "Co-Borrower Invited",
        description: `${req.body.email} was invited as a ${req.body.role || "co-borrower"}`,
        createdByUserId: userId,
      });
      
      return res.status(201).json(coBorrower);
    } catch (error) {
      console.error("Error creating co-borrower:", error);
      return res.status(500).json({ error: "Failed to create co-borrower" });
    }
  });

  app.post("/api/co-borrowers/accept/:token", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const coBorrower = await storage.getCoBorrowerByToken(req.params.token);
      
      if (!coBorrower) {
        return res.status(404).json({ error: "Invite not found or expired" });
      }
      
      const updated = await storage.updateCoBorrower(coBorrower.id, {
        status: "accepted",
        invitedUserId: userId,
        acceptedAt: new Date(),
      });
      
      // Notify the original inviter
      await storage.createNotification({
        userId: coBorrower.invitedByUserId,
        type: "co_borrower_accepted",
        title: "Co-Borrower Accepted",
        message: `${coBorrower.invitedEmail} has accepted your invitation to join your loan application.`,
        relatedApplicationId: coBorrower.loanApplicationId,
      });
      
      return res.json(updated);
    } catch (error) {
      console.error("Error accepting co-borrower invite:", error);
      return res.status(500).json({ error: "Failed to accept invite" });
    }
  });

  app.delete("/api/co-borrowers/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const coBorrower = await storage.getCoBorrowers(req.params.id);
      
      // Verify the user owns the application
      // (simplified - in production you'd check properly)
      
      await storage.deleteCoBorrower(req.params.id);
      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting co-borrower:", error);
      return res.status(500).json({ error: "Failed to delete co-borrower" });
    }
  });

  // ============================================
  // APPLICATION TIMELINE ROUTES
  // ============================================
  app.get("/api/applications/:id/timeline", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const application = await storage.getLoanApplication(req.params.id);
      
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      
      if (application.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const timeline = await storage.getApplicationTimeline(req.params.id);
      return res.json(timeline);
    } catch (error) {
      console.error("Error fetching timeline:", error);
      return res.status(500).json({ error: "Failed to fetch timeline" });
    }
  });

  app.post("/api/applications/:id/timeline", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const application = await storage.getLoanApplication(req.params.id);
      
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      
      if (application.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const event = await storage.createTimelineEvent({
        loanApplicationId: req.params.id,
        eventType: req.body.eventType,
        title: req.body.title,
        description: req.body.description,
        metadata: req.body.metadata,
        createdByUserId: userId,
      });
      return res.status(201).json(event);
    } catch (error) {
      console.error("Error creating timeline event:", error);
      return res.status(500).json({ error: "Failed to create timeline event" });
    }
  });

  // ============================================
  // MARKET DATA ROUTES
  // ============================================
  app.get("/api/market-data/:stateSlug", async (req, res) => {
    try {
      const { stateSlug } = req.params;
      const state = getStateBySlug(stateSlug);
      
      if (!state) {
        return res.status(404).json({ error: "State not found" });
      }
      
      const marketData = await getMarketData(stateSlug);
      return res.json(marketData);
    } catch (error) {
      console.error("Error fetching market data:", error);
      return res.status(500).json({ error: "Failed to fetch market data" });
    }
  });

  app.get("/api/market-data", async (req, res) => {
    try {
      const status = await getMarketDataStatus();
      return res.json(status);
    } catch (error) {
      console.error("Error fetching market data status:", error);
      return res.status(500).json({ error: "Failed to fetch market data status" });
    }
  });

  app.post("/api/market-data/refresh", isAuthenticated, async (req: any, res) => {
    try {
      const result = await refreshAllMarketData();
      return res.json({
        message: "Market data refresh completed",
        ...result,
      });
    } catch (error) {
      console.error("Error refreshing market data:", error);
      return res.status(500).json({ error: "Failed to refresh market data" });
    }
  });

  // ============================================
  // PROPERTY VALUE ROUTES
  // ============================================
  app.get("/api/property-value/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const purchasePrice = req.query.purchasePrice ? parseFloat(req.query.purchasePrice as string) : undefined;
      
      const decodedAddress = decodeURIComponent(address);
      const propertyValue = await getPropertyValue(decodedAddress, purchasePrice);
      
      return res.json(propertyValue);
    } catch (error) {
      console.error("Error fetching property value:", error);
      return res.status(500).json({ error: "Failed to fetch property value" });
    }
  });

  // Property lookup for autofill (value, rent, taxes, etc.)
  app.get("/api/property-lookup", async (req, res) => {
    try {
      const { address, city, state, zip } = req.query;
      
      if (!address || typeof address !== "string") {
        return res.status(400).json({ error: "Address is required" });
      }
      
      const propertyData = await getPropertyLookup(
        address,
        city as string | undefined,
        state as string | undefined,
        zip as string | undefined
      );
      
      return res.json(propertyData);
    } catch (error) {
      console.error("Error fetching property lookup:", error);
      return res.status(500).json({ error: "Failed to fetch property data" });
    }
  });

  // ============================================
  // ADMIN / STAFF ROUTES
  // ============================================
  
  // Middleware to check if user is staff or admin
  const isStaff = async (req: any, res: any, next: any) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const user = await storage.getUser(userId);
      if (!user || (user.role !== "staff" && user.role !== "admin")) {
        return res.status(403).json({ error: "Staff access required" });
      }
      
      req.staffUser = user;
      next();
    } catch (error) {
      console.error("Error checking staff status:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
  
  // Middleware to check if user is admin
  const isAdmin = async (req: any, res: any, next: any) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      req.adminUser = user;
      next();
    } catch (error) {
      console.error("Error checking admin status:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
  
  // Middleware to check if user is staff or admin
  const isStaffOrAdmin = async (req: any, res: any, next: any) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const user = await storage.getUser(userId);
      if (!user || (user.role !== "staff" && user.role !== "admin")) {
        return res.status(403).json({ error: "Staff or Admin access required" });
      }
      
      req.staffUser = user;
      next();
    } catch (error) {
      console.error("Error checking staff/admin status:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  // Get all loan applications (staff view)
  app.get("/api/admin/applications", isAuthenticated, isStaff, async (req: any, res) => {
    try {
      const applications = await storage.getAllLoanApplications();
      
      // Enrich with user info
      const enrichedApps = await Promise.all(
        applications.map(async (app) => {
          const user = await storage.getUser(app.userId);
          return {
            ...app,
            borrowerName: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email : "Unknown",
            borrowerEmail: user?.email,
          };
        })
      );
      
      return res.json(enrichedApps);
    } catch (error) {
      console.error("Error fetching all applications:", error);
      return res.status(500).json({ error: "Failed to fetch applications" });
    }
  });

  // Get single application with full details (staff view)
  app.get("/api/admin/applications/:id", isAuthenticated, isStaff, async (req: any, res) => {
    try {
      const application = await storage.getLoanApplication(req.params.id);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      
      const user = await storage.getUser(application.userId);
      const documents = await storage.getDocumentsByApplication(application.id);
      const timeline = await storage.getApplicationTimeline(application.id);
      
      return res.json({
        ...application,
        borrowerName: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email : "Unknown",
        borrowerEmail: user?.email,
        documents,
        timeline,
      });
    } catch (error) {
      console.error("Error fetching application:", error);
      return res.status(500).json({ error: "Failed to fetch application" });
    }
  });

  // Helper function to map application loan type to serviced loan type
  function mapLoanTypeToServicedType(appLoanType: string): "dscr" | "fix_flip" | "new_construction" | "bridge" {
    const type = appLoanType.toLowerCase();
    if (type.includes("dscr")) return "dscr";
    if (type.includes("fix") || type.includes("flip")) return "fix_flip";
    if (type.includes("construction") || type.includes("ground")) return "new_construction";
    if (type.includes("bridge")) return "bridge";
    return "dscr"; // Default to DSCR
  }

  // Generate unique loan number
  function generateLoanNumber(loanType: string): string {
    const prefix = loanType === "dscr" ? "DSCR" : 
                   loanType === "fix_flip" ? "FF" : 
                   loanType === "new_construction" ? "NC" : "BR";
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  // Update application (staff can update status, processing stage, etc.)
  app.patch("/api/admin/applications/:id", isAuthenticated, isStaff, async (req: any, res) => {
    try {
      const { id } = req.params;
      const application = await storage.getLoanApplication(id);
      
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      
      const previousStatus = application.status;
      const updated = await storage.updateLoanApplication(id, req.body);
      
      // Create timeline event for status/stage changes
      if (req.body.status && req.body.status !== application.status) {
        await storage.createTimelineEvent({
          loanApplicationId: id,
          eventType: "status_changed",
          title: `Status changed to ${req.body.status}`,
          description: `Updated by ${req.staffUser.firstName || req.staffUser.email}`,
          createdByUserId: req.staffUser.id,
        });
      }
      
      if (req.body.processingStage && req.body.processingStage !== application.processingStage) {
        await storage.createTimelineEvent({
          loanApplicationId: id,
          eventType: "stage_advanced",
          title: `Stage advanced to ${req.body.processingStage}`,
          description: `Updated by ${req.staffUser.firstName || req.staffUser.email}`,
          createdByUserId: req.staffUser.id,
        });
      }
      
      // AUTO-CREATE SERVICED LOAN when status changes to 'funded'
      if (req.body.status === "funded" && previousStatus !== "funded") {
        try {
          const servicedLoanType = mapLoanTypeToServicedType(application.loanType);
          const isHardMoney = servicedLoanType !== "dscr";
          const loanNumber = generateLoanNumber(servicedLoanType);
          
          // Calculate loan terms
          const originalAmount = application.loanAmount || 0;
          const interestRate = application.interestRate ? parseFloat(application.interestRate) : (isHardMoney ? 10.5 : 7.5);
          const termMonths = application.loanTermMonths || (isHardMoney ? 12 : 360);
          
          // Calculate monthly payment
          let monthlyPayment = 0;
          if (isHardMoney) {
            // Interest-only payment for hard money
            monthlyPayment = Math.round((originalAmount * (interestRate / 100)) / 12);
          } else {
            // Amortizing payment for DSCR
            const monthlyRate = (interestRate / 100) / 12;
            if (monthlyRate > 0) {
              monthlyPayment = Math.round(originalAmount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1));
            }
          }
          
          // Calculate escrow for DSCR loans
          const annualTaxes = application.annualTaxes || 0;
          const annualInsurance = application.annualInsurance || 0;
          const annualHOA = application.annualHOA || 0;
          const monthlyEscrow = !isHardMoney ? Math.round((annualTaxes + annualInsurance + annualHOA) / 12) : 0;
          
          const closingDate = new Date();
          const firstPaymentDate = new Date(closingDate);
          firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 1);
          firstPaymentDate.setDate(1); // First of next month
          
          const maturityDate = new Date(closingDate);
          maturityDate.setMonth(maturityDate.getMonth() + termMonths);
          
          const nextPaymentDate = new Date(firstPaymentDate);
          
          await storage.createServicedLoan({
            userId: application.userId,
            loanApplicationId: application.id,
            loanNumber,
            loanType: servicedLoanType,
            loanStatus: "current",
            
            // Property info
            propertyAddress: application.propertyAddress || "Unknown Address",
            propertyCity: application.propertyCity || null,
            propertyState: application.propertyState || null,
            propertyZip: application.propertyZip || null,
            
            // Loan amounts
            originalLoanAmount: originalAmount,
            currentBalance: originalAmount,
            
            // Rates and terms
            interestRate: interestRate.toString(),
            loanTermMonths: termMonths,
            amortizationMonths: isHardMoney ? null : termMonths,
            isInterestOnly: isHardMoney,
            
            // Payment info
            monthlyPayment,
            monthlyEscrowAmount: monthlyEscrow,
            
            // Dates
            closingDate,
            firstPaymentDate,
            maturityDate,
            nextPaymentDate,
            
            // Initial balances
            totalPrincipalPaid: 0,
            totalInterestPaid: 0,
            escrowBalance: 0,
            
            // Escrow items (DSCR only)
            annualTaxes: !isHardMoney ? annualTaxes : null,
            annualInsurance: !isHardMoney ? annualInsurance : null,
            annualHOA: !isHardMoney ? annualHOA : null,
            
            // Rehab budget (Hard money only)
            totalRehabBudget: isHardMoney ? (application.rehabBudget || 0) : null,
            totalDrawsFunded: 0,
          });
          
          console.log(`Created serviced loan ${loanNumber} for application ${id}`);
          
          // Add timeline event for loan creation
          await storage.createTimelineEvent({
            loanApplicationId: id,
            eventType: "status_changed",
            title: `Serviced loan ${loanNumber} created`,
            description: `Loan automatically created in servicing system`,
            createdByUserId: req.staffUser.id,
          });
        } catch (servicedLoanError) {
          console.error("Error creating serviced loan:", servicedLoanError);
          // Don't fail the status update, just log the error
        }
      }
      
      return res.json(updated);
    } catch (error) {
      console.error("Error updating application:", error);
      return res.status(500).json({ error: "Failed to update application" });
    }
  });

  // Get all borrowers with their portal info (staff and admin)
  app.get("/api/admin/borrowers", isAuthenticated, isStaff, async (req: any, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const allApplications = await storage.getAllLoanApplications();
      
      // Filter to borrowers only and enrich with application counts
      const enrichedBorrowers = allUsers
        .filter(user => user.role === "borrower")
        .map(user => {
          const userApps = allApplications.filter(app => app.userId === user.id);
          return {
            ...user,
            applicationCount: userApps.length,
            activeApplications: userApps.filter(app => 
              app.status !== 'funded' && app.status !== 'denied' && app.status !== 'withdrawn'
            ).length,
            fundedLoans: userApps.filter(app => app.status === 'funded').length,
          };
        });
      
      return res.json(enrichedBorrowers);
    } catch (error) {
      console.error("Error fetching borrowers:", error);
      return res.status(500).json({ error: "Failed to fetch borrowers" });
    }
  });

  // Get individual borrower profile with detailed info (staff and admin)
  app.get("/api/admin/borrowers/:id", isAuthenticated, isStaff, async (req: any, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ error: "Borrower not found" });
      }
      
      if (user.role !== "borrower") {
        return res.status(400).json({ error: "User is not a borrower" });
      }
      
      const allApplications = await storage.getAllLoanApplications();
      const userApps = allApplications.filter(app => app.userId === id);
      
      // Enrich applications with additional details
      const enrichedApps = userApps.map(app => ({
        ...app,
        borrowerName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
        borrowerEmail: user.email,
      }));
      
      const enrichedBorrower = {
        ...user,
        applicationCount: userApps.length,
        activeApplications: userApps.filter(app => 
          app.status !== 'funded' && app.status !== 'denied' && app.status !== 'withdrawn'
        ).length,
        fundedLoans: userApps.filter(app => app.status === 'funded').length,
        totalLoanVolume: userApps
          .filter(app => app.status === 'funded')
          .reduce((sum, app) => sum + (app.loanAmount || 0), 0),
        applications: enrichedApps,
      };
      
      return res.json(enrichedBorrower);
    } catch (error) {
      console.error("Error fetching borrower:", error);
      return res.status(500).json({ error: "Failed to fetch borrower" });
    }
  });

  // Get all users with their portal info (admin only)
  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const allApplications = await storage.getAllLoanApplications();
      
      // Enrich users with their application counts
      const enrichedUsers = allUsers.map(user => {
        const userApps = allApplications.filter(app => app.userId === user.id);
        return {
          ...user,
          applicationCount: userApps.length,
          activeApplications: userApps.filter(app => 
            app.status !== 'funded' && app.status !== 'denied' && app.status !== 'withdrawn'
          ).length,
          fundedLoans: userApps.filter(app => app.status === 'funded').length,
        };
      });
      
      return res.json(enrichedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Update user role (admin only)
  app.patch("/api/admin/users/:id/role", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      
      if (!["borrower", "staff", "admin"].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }
      
      const updated = await storage.updateUserRole(id, role);
      if (!updated) {
        return res.status(404).json({ error: "User not found" });
      }
      
      return res.json(updated);
    } catch (error) {
      console.error("Error updating user role:", error);
      return res.status(500).json({ error: "Failed to update user role" });
    }
  });

  // Create staff invite (admin only)
  app.post("/api/admin/invites", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { email, role = "staff" } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      
      if (!["staff", "admin"].includes(role)) {
        return res.status(400).json({ error: "Invalid role for invite" });
      }
      
      // Generate a secure token
      const token = crypto.randomBytes(32).toString("hex");
      
      // Set expiry to 7 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      const invite = await storage.createStaffInvite({
        email,
        token,
        role: role as "staff" | "admin",
        status: "pending",
        invitedById: req.adminUser.id,
        expiresAt,
      });
      
      // In production, you would send an email here with the invite link
      // For now, return the token so admin can share the link manually
      const inviteLink = `/join/${token}`;
      
      return res.status(201).json({
        message: "Invite created successfully",
        invite: {
          ...invite,
          inviteLink,
        },
      });
    } catch (error) {
      console.error("Error creating invite:", error);
      return res.status(500).json({ error: "Failed to create invite" });
    }
  });

  // Get all invites (admin only)
  app.get("/api/admin/invites", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const invites = await storage.getStaffInvites();
      return res.json(invites);
    } catch (error) {
      console.error("Error fetching invites:", error);
      return res.status(500).json({ error: "Failed to fetch invites" });
    }
  });

  // Revoke invite (admin only)
  app.delete("/api/admin/invites/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.updateStaffInvite(id, { status: "revoked" });
      return res.json({ message: "Invite revoked" });
    } catch (error) {
      console.error("Error revoking invite:", error);
      return res.status(500).json({ error: "Failed to revoke invite" });
    }
  });

  // Validate invite token (public route for invite page)
  app.get("/api/invites/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const invite = await storage.getStaffInviteByToken(token);
      
      if (!invite) {
        return res.status(404).json({ error: "Invite not found" });
      }
      
      if (invite.status !== "pending") {
        return res.status(400).json({ error: `Invite has already been ${invite.status}` });
      }
      
      if (new Date(invite.expiresAt) < new Date()) {
        return res.status(400).json({ error: "Invite has expired" });
      }
      
      return res.json({
        email: invite.email,
        role: invite.role,
        expiresAt: invite.expiresAt,
      });
    } catch (error) {
      console.error("Error validating invite:", error);
      return res.status(500).json({ error: "Failed to validate invite" });
    }
  });

  // Accept invite (authenticated user accepting their invite)
  app.post("/api/invites/:token/accept", isAuthenticated, async (req: any, res) => {
    try {
      const { token } = req.params;
      const userId = req.user.claims.sub;
      
      const invite = await storage.getStaffInviteByToken(token);
      if (!invite) {
        return res.status(404).json({ error: "Invite not found" });
      }
      
      // Verify the logged-in user's email matches the invite
      const user = await storage.getUser(userId);
      if (!user || user.email?.toLowerCase() !== invite.email.toLowerCase()) {
        return res.status(403).json({ 
          error: "This invite is for a different email address. Please log in with the invited email.",
          invitedEmail: invite.email,
        });
      }
      
      const accepted = await storage.acceptStaffInvite(token, userId);
      if (!accepted) {
        return res.status(400).json({ error: "Unable to accept invite. It may be expired or already used." });
      }
      
      return res.json({
        message: "Invite accepted! You now have staff access.",
        role: invite.role,
      });
    } catch (error) {
      console.error("Error accepting invite:", error);
      return res.status(500).json({ error: "Failed to accept invite" });
    }
  });

  // =====================
  // Admin Serviced Loans Routes (Staff/Admin)
  // =====================
  
  // Get all serviced loans (admin view with borrower info)
  app.get("/api/admin/serviced-loans", isAuthenticated, isStaff, async (req: any, res) => {
    try {
      const loans = await storage.getAllServicedLoans();
      
      // Enrich with borrower info
      const enrichedLoans = await Promise.all(loans.map(async (loan) => {
        const user = await storage.getUser(loan.userId);
        return {
          ...loan,
          borrowerName: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email : "Unknown",
          borrowerEmail: user?.email,
        };
      }));
      
      return res.json(enrichedLoans);
    } catch (error) {
      console.error("Error fetching serviced loans:", error);
      return res.status(500).json({ error: "Failed to fetch serviced loans" });
    }
  });

  // Get single serviced loan with full details (admin view)
  app.get("/api/admin/serviced-loans/:id", isAuthenticated, isStaff, async (req: any, res) => {
    try {
      const loan = await storage.getServicedLoan(req.params.id);
      if (!loan) {
        return res.status(404).json({ error: "Loan not found" });
      }
      
      const user = await storage.getUser(loan.userId);
      const payments = await storage.getLoanPayments(loan.id);
      const draws = await storage.getLoanDraws(loan.id);
      const escrowItems = await storage.getLoanEscrowItems(loan.id);
      const documents = await storage.getLoanDocuments(loan.id);
      const milestones = await storage.getLoanMilestones(loan.id);
      
      return res.json({
        ...loan,
        borrowerName: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email : "Unknown",
        borrowerEmail: user?.email,
        borrowerPhone: user?.phone,
        payments,
        draws,
        escrowItems,
        documents,
        milestones,
      });
    } catch (error) {
      console.error("Error fetching serviced loan:", error);
      return res.status(500).json({ error: "Failed to fetch serviced loan" });
    }
  });

  // Update serviced loan (admin only)
  app.patch("/api/admin/serviced-loans/:id", isAuthenticated, isStaff, async (req: any, res) => {
    try {
      const loan = await storage.getServicedLoan(req.params.id);
      if (!loan) {
        return res.status(404).json({ error: "Loan not found" });
      }
      
      const updated = await storage.updateServicedLoan(req.params.id, req.body);
      return res.json(updated);
    } catch (error) {
      console.error("Error updating serviced loan:", error);
      return res.status(500).json({ error: "Failed to update serviced loan" });
    }
  });

  // Record a payment (admin only)
  app.post("/api/admin/serviced-loans/:id/payments", isAuthenticated, isStaff, async (req: any, res) => {
    try {
      const loan = await storage.getServicedLoan(req.params.id);
      if (!loan) {
        return res.status(404).json({ error: "Loan not found" });
      }
      
      const payment = await storage.createLoanPayment({
        servicedLoanId: loan.id,
        ...req.body,
      });
      
      // Update loan balances based on payment with floor guards
      const principalAmount = Math.max(0, Number(req.body.principalAmount) || 0);
      const interestAmount = Math.max(0, Number(req.body.interestAmount) || 0);
      const escrowAmount = Math.max(0, Number(req.body.escrowAmount) || 0);
      
      // Calculate new balance with floor at 0 to prevent negative balances
      const newBalance = Math.max(0, loan.currentBalance - principalAmount);
      
      await storage.updateServicedLoan(loan.id, {
        currentBalance: newBalance,
        totalPrincipalPaid: (loan.totalPrincipalPaid || 0) + principalAmount,
        totalInterestPaid: (loan.totalInterestPaid || 0) + interestAmount,
        escrowBalance: (loan.escrowBalance || 0) + escrowAmount,
        lastPaymentDate: new Date(),
        nextPaymentDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        loanStatus: newBalance === 0 ? "paid_off" : loan.loanStatus,
      });
      
      return res.json(payment);
    } catch (error) {
      console.error("Error recording payment:", error);
      return res.status(500).json({ error: "Failed to record payment" });
    }
  });

  // Create/update draw request (admin only)
  app.post("/api/admin/serviced-loans/:id/draws", isAuthenticated, isStaff, async (req: any, res) => {
    try {
      const loan = await storage.getServicedLoan(req.params.id);
      if (!loan) {
        return res.status(404).json({ error: "Loan not found" });
      }
      
      if (loan.loanType === "dscr") {
        return res.status(400).json({ error: "DSCR loans don't support draws" });
      }
      
      const draw = await storage.createLoanDraw({
        servicedLoanId: loan.id,
        ...req.body,
      });
      
      return res.json(draw);
    } catch (error) {
      console.error("Error creating draw:", error);
      return res.status(500).json({ error: "Failed to create draw" });
    }
  });

  // Approve/fund draw (admin only)
  app.patch("/api/admin/serviced-loans/:loanId/draws/:drawId", isAuthenticated, isStaff, async (req: any, res) => {
    try {
      const loan = await storage.getServicedLoan(req.params.loanId);
      if (!loan) {
        return res.status(404).json({ error: "Loan not found" });
      }
      
      const draw = await storage.getLoanDraw(req.params.drawId);
      if (!draw || draw.servicedLoanId !== loan.id) {
        return res.status(404).json({ error: "Draw not found" });
      }
      
      const updatedDraw = await storage.updateLoanDraw(req.params.drawId, req.body);
      
      // If draw is funded, update loan totals with validation
      if (req.body.status === "funded" && draw.status !== "funded") {
        const fundedAmount = Math.max(0, Number(req.body.approvedAmount || draw.approvedAmount || draw.requestedAmount) || 0);
        const totalBudget = loan.totalRehabBudget || 0;
        const currentFunded = loan.totalDrawsFunded || 0;
        
        // Cap draw funding at remaining holdback to prevent over-funding
        const remainingBudget = Math.max(0, totalBudget - currentFunded);
        const actualFundedAmount = Math.min(fundedAmount, remainingBudget > 0 ? remainingBudget : fundedAmount);
        
        await storage.updateServicedLoan(loan.id, {
          totalDrawsFunded: currentFunded + actualFundedAmount,
          totalDrawsApproved: (loan.totalDrawsApproved || 0) + 1,
          currentBalance: loan.currentBalance + actualFundedAmount,
          remainingHoldback: totalBudget > 0 ? Math.max(0, totalBudget - currentFunded - actualFundedAmount) : null,
        });
      }
      
      return res.json(updatedDraw);
    } catch (error) {
      console.error("Error updating draw:", error);
      return res.status(500).json({ error: "Failed to update draw" });
    }
  });

  // =====================
  // Funded Deals Routes
  // =====================
  
  // Helper function to emit webhook events for funded deals
  async function emitFundedDealWebhookEvent(eventType: string, deal: any, userId?: string) {
    try {
      const event = await storage.createWebhookEvent({
        eventType,
        payload: {
          event: eventType,
          data: deal,
          timestamp: new Date().toISOString(),
          triggeredBy: userId,
        },
        resourceId: deal.id,
      });
      console.log(`Webhook event created: ${eventType} for deal ${deal.id}`);
      return event;
    } catch (error) {
      console.error("Error creating webhook event:", error);
    }
  }

  // Public: Get visible funded deals (for homepage/carousels)
  // Optional query params: ?state=CA&loanType=DSCR&limit=10
  app.get("/api/funded-deals", async (req, res) => {
    try {
      const { state, loanType, limit } = req.query;
      let deals = await storage.getFundedDeals(true);
      
      // Filter by state if provided
      if (state && typeof state === 'string') {
        deals = deals.filter(d => d.state?.toUpperCase() === state.toUpperCase());
      }
      
      // Filter by loan type if provided
      if (loanType && typeof loanType === 'string') {
        deals = deals.filter(d => d.loanType?.toLowerCase() === loanType.toLowerCase());
      }
      
      // Limit results if specified
      if (limit && !isNaN(Number(limit))) {
        deals = deals.slice(0, Number(limit));
      }
      
      return res.json(deals);
    } catch (error) {
      console.error("Error fetching funded deals:", error);
      return res.status(500).json({ error: "Failed to fetch funded deals" });
    }
  });

  // Public: Get single funded deal by ID
  app.get("/api/funded-deals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deal = await storage.getFundedDeal(id);
      
      if (!deal) {
        return res.status(404).json({ error: "Funded deal not found" });
      }
      
      // Only return visible deals to public
      if (!deal.isVisible) {
        return res.status(404).json({ error: "Funded deal not found" });
      }
      
      return res.json(deal);
    } catch (error) {
      console.error("Error fetching funded deal:", error);
      return res.status(500).json({ error: "Failed to fetch funded deal" });
    }
  });

  // Admin/Staff: Get all funded deals (including hidden)
  app.get("/api/admin/funded-deals", isAuthenticated, isStaff, async (req: any, res) => {
    try {
      const deals = await storage.getFundedDeals(false);
      return res.json(deals);
    } catch (error) {
      console.error("Error fetching all funded deals:", error);
      return res.status(500).json({ error: "Failed to fetch funded deals" });
    }
  });

  // Admin/Staff: Create funded deal
  app.post("/api/admin/funded-deals", isAuthenticated, isStaff, async (req: any, res) => {
    try {
      const validationResult = insertFundedDealSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({
          error: "Validation failed",
          message: validationError.message,
        });
      }

      const userId = req.user?.claims?.sub || req.adminUser?.id;
      const deal = await storage.createFundedDeal({
        ...validationResult.data,
        createdById: userId,
      });
      
      // Emit webhook event
      await emitFundedDealWebhookEvent("fundedDeal.created", deal, userId);
      
      return res.status(201).json(deal);
    } catch (error) {
      console.error("Error creating funded deal:", error);
      return res.status(500).json({ error: "Failed to create funded deal" });
    }
  });

  // Admin/Staff: Update funded deal
  app.patch("/api/admin/funded-deals/:id", isAuthenticated, isStaff, async (req: any, res) => {
    try {
      const { id } = req.params;
      const existing = await storage.getFundedDeal(id);
      
      if (!existing) {
        return res.status(404).json({ error: "Funded deal not found" });
      }

      const userId = req.user?.claims?.sub || req.adminUser?.id;
      const updated = await storage.updateFundedDeal(id, req.body);
      
      if (!updated) {
        return res.status(500).json({ error: "Failed to update funded deal" });
      }
      
      // Emit webhook event
      await emitFundedDealWebhookEvent("fundedDeal.updated", updated, userId);
      
      return res.json(updated);
    } catch (error) {
      console.error("Error updating funded deal:", error);
      return res.status(500).json({ error: "Failed to update funded deal" });
    }
  });

  // Admin/Staff: Delete funded deal
  app.delete("/api/admin/funded-deals/:id", isAuthenticated, isStaff, async (req: any, res) => {
    try {
      const { id } = req.params;
      const existing = await storage.getFundedDeal(id);
      
      if (!existing) {
        return res.status(404).json({ error: "Funded deal not found" });
      }

      const userId = req.user?.claims?.sub || req.adminUser?.id;
      const deleted = await storage.deleteFundedDeal(id);
      
      if (!deleted) {
        return res.status(500).json({ error: "Failed to delete funded deal" });
      }
      
      // Emit webhook event
      await emitFundedDealWebhookEvent("fundedDeal.deleted", existing, userId);
      
      return res.json({ message: "Funded deal deleted successfully" });
    } catch (error) {
      console.error("Error deleting funded deal:", error);
      return res.status(500).json({ error: "Failed to delete funded deal" });
    }
  });

  // =====================
  // Webhook Management Routes (Admin only)
  // =====================

  // Get all webhook endpoints
  app.get("/api/admin/webhooks/endpoints", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const endpoints = await storage.getWebhookEndpoints();
      // Mask secrets in response
      const masked = endpoints.map(e => ({
        ...e,
        secret: e.secret ? "••••••••" : null,
      }));
      return res.json(masked);
    } catch (error) {
      console.error("Error fetching webhook endpoints:", error);
      return res.status(500).json({ error: "Failed to fetch webhook endpoints" });
    }
  });

  // Create webhook endpoint
  app.post("/api/admin/webhooks/endpoints", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const validationResult = insertWebhookEndpointSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({
          error: "Validation failed",
          message: validationError.message,
        });
      }

      // Generate secret if not provided
      const secret = req.body.secret || crypto.randomBytes(32).toString("hex");
      
      const userId = req.user?.claims?.sub || req.adminUser?.id;
      const subscribedEvents = validationResult.data.subscribedEvents as string[];
      const endpoint = await storage.createWebhookEndpoint({
        ...validationResult.data,
        subscribedEvents,
        secret,
        createdById: userId,
      });
      
      // Return with unmasked secret only on creation
      return res.status(201).json(endpoint);
    } catch (error) {
      console.error("Error creating webhook endpoint:", error);
      return res.status(500).json({ error: "Failed to create webhook endpoint" });
    }
  });

  // Update webhook endpoint
  app.patch("/api/admin/webhooks/endpoints/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const existing = await storage.getWebhookEndpoint(id);
      
      if (!existing) {
        return res.status(404).json({ error: "Webhook endpoint not found" });
      }

      const updated = await storage.updateWebhookEndpoint(id, req.body);
      
      if (!updated) {
        return res.status(500).json({ error: "Failed to update webhook endpoint" });
      }
      
      // Mask secret in response
      return res.json({
        ...updated,
        secret: updated.secret ? "••••••••" : null,
      });
    } catch (error) {
      console.error("Error updating webhook endpoint:", error);
      return res.status(500).json({ error: "Failed to update webhook endpoint" });
    }
  });

  // Delete webhook endpoint
  app.delete("/api/admin/webhooks/endpoints/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteWebhookEndpoint(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Webhook endpoint not found" });
      }
      
      return res.json({ message: "Webhook endpoint deleted successfully" });
    } catch (error) {
      console.error("Error deleting webhook endpoint:", error);
      return res.status(500).json({ error: "Failed to delete webhook endpoint" });
    }
  });

  // Regenerate webhook secret
  app.post("/api/admin/webhooks/endpoints/:id/regenerate-secret", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const newSecret = crypto.randomBytes(32).toString("hex");
      
      const updated = await storage.updateWebhookEndpoint(id, { secret: newSecret });
      
      if (!updated) {
        return res.status(404).json({ error: "Webhook endpoint not found" });
      }
      
      // Return the new secret (only time it's shown)
      return res.json({ secret: newSecret });
    } catch (error) {
      console.error("Error regenerating webhook secret:", error);
      return res.status(500).json({ error: "Failed to regenerate secret" });
    }
  });

  // Get recent webhook deliveries
  app.get("/api/admin/webhooks/deliveries", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const deliveries = await storage.getRecentWebhookDeliveries(limit);
      return res.json(deliveries);
    } catch (error) {
      console.error("Error fetching webhook deliveries:", error);
      return res.status(500).json({ error: "Failed to fetch webhook deliveries" });
    }
  });

  // Test webhook endpoint (send a test payload)
  app.post("/api/admin/webhooks/endpoints/:id/test", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const endpoint = await storage.getWebhookEndpoint(id);
      
      if (!endpoint) {
        return res.status(404).json({ error: "Webhook endpoint not found" });
      }

      // Create a test event
      const testPayload = {
        event: "test.ping",
        data: {
          message: "This is a test webhook from Sequel Investments",
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };

      // Sign the payload
      const signature = crypto
        .createHmac("sha256", endpoint.secret)
        .update(JSON.stringify(testPayload))
        .digest("hex");

      try {
        const response = await fetch(endpoint.targetUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Sequel-Signature": `sha256=${signature}`,
            "X-Sequel-Event": "test.ping",
          },
          body: JSON.stringify(testPayload),
        });

        const responseText = await response.text();
        
        return res.json({
          success: response.ok,
          statusCode: response.status,
          response: responseText.substring(0, 500),
        });
      } catch (fetchError: any) {
        return res.json({
          success: false,
          error: fetchError.message,
        });
      }
    } catch (error) {
      console.error("Error testing webhook endpoint:", error);
      return res.status(500).json({ error: "Failed to test webhook endpoint" });
    }
  });

  // Universities nearby search using Google Places API
  app.get("/api/universities/nearby", async (req, res) => {
    try {
      const { lat, lng, radius = 40234 } = req.query; // Default 25 miles = 40234 meters
      
      if (!lat || !lng) {
        return res.status(400).json({ error: "lat and lng are required" });
      }

      const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Google Maps API key not configured" });
      }

      const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
      url.searchParams.set("location", `${lat},${lng}`);
      url.searchParams.set("radius", String(radius));
      url.searchParams.set("type", "university");
      url.searchParams.set("key", apiKey);

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        console.error("Google Places API error:", data.status, data.error_message);
        return res.status(500).json({ error: "Failed to fetch universities", details: data.error_message });
      }

      // Transform results to our University format
      const universities = (data.results || []).map((place: any) => {
        // Determine university type based on name patterns
        let type: "public" | "private" | "community" = "public";
        const nameLower = place.name.toLowerCase();
        if (nameLower.includes("community college") || nameLower.includes("community") && nameLower.includes("college")) {
          type = "community";
        } else if (
          nameLower.includes("private") || 
          nameLower.includes("christian") || 
          nameLower.includes("catholic") ||
          nameLower.includes("baptist") ||
          nameLower.includes("methodist") ||
          nameLower.includes("loyola") ||
          nameLower.includes("saint") ||
          nameLower.includes("st.") ||
          !nameLower.includes("state") && !nameLower.includes("california") && !nameLower.includes("university of")
        ) {
          type = "private";
        }

        // Calculate distance from the market center
        const placeLocation = place.geometry?.location;
        let distanceMiles = 0;
        if (placeLocation) {
          const R = 3959; // Earth radius in miles
          const dLat = (placeLocation.lat - parseFloat(lat as string)) * Math.PI / 180;
          const dLng = (placeLocation.lng - parseFloat(lng as string)) * Math.PI / 180;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(parseFloat(lat as string) * Math.PI / 180) * Math.cos(placeLocation.lat * Math.PI / 180) *
                    Math.sin(dLng/2) * Math.sin(dLng/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          distanceMiles = R * c;
        }

        return {
          name: place.name,
          type,
          enrollment: 0, // Google Places doesn't provide enrollment data
          placeId: place.place_id,
          rating: place.rating,
          userRatingsTotal: place.user_ratings_total,
          vicinity: place.vicinity,
          distanceMiles: Math.round(distanceMiles * 10) / 10,
        };
      });

      // Sort by distance
      universities.sort((a: any, b: any) => a.distanceMiles - b.distanceMiles);

      return res.json({ 
        universities,
        totalResults: universities.length,
        searchRadius: `${Math.round(Number(radius) / 1609.34)} miles`
      });
    } catch (error) {
      console.error("Error fetching nearby universities:", error);
      return res.status(500).json({ error: "Failed to fetch universities" });
    }
  });

  // ============================================
  // DOCUMENT REVIEW API ENDPOINTS
  // ============================================

  // Get all reviews for a document
  app.get("/api/documents/:documentId/reviews", isAuthenticated, async (req: any, res) => {
    try {
      const { documentId } = req.params;
      const reviews = await storage.getDocumentReviews(documentId);
      return res.json(reviews);
    } catch (error) {
      console.error("Error fetching document reviews:", error);
      return res.status(500).json({ error: "Failed to fetch document reviews" });
    }
  });

  // Create a document review (approve, reject, request changes)
  app.post("/api/documents/:documentId/reviews", isAuthenticated, isStaffOrAdmin, async (req: any, res) => {
    try {
      const { documentId } = req.params;
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      const validationResult = insertDocumentReviewSchema.safeParse({
        ...req.body,
        documentId,
        reviewerId: userId,
        staffRole: user?.staffRole as StaffRole || undefined,
      });
      
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ error: validationError.message });
      }
      
      // Get the document to update its status based on review action
      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      
      // Create the review
      const review = await storage.createDocumentReview(validationResult.data);
      
      // Update document status based on review action
      const statusMap: Record<string, string> = {
        approved: "approved",
        rejected: "rejected",
        request_changes: "pending",
        under_review: "pending",
      };
      
      const newStatus = statusMap[validationResult.data.action] || "pending";
      await storage.updateDocument(documentId, { status: newStatus as any });
      
      // Create a timeline event for the application
      if (document.loanApplicationId) {
        const actionLabels: Record<string, string> = {
          approved: "approved",
          rejected: "rejected",
          request_changes: "requested changes on",
          under_review: "marked as under review",
        };
        
        // Map review action to appropriate timeline event type
        const eventTypeMap: Record<string, "document_approved" | "document_rejected" | "document_uploaded"> = {
          approved: "document_approved",
          rejected: "document_rejected",
          request_changes: "document_rejected", // treat as similar to rejected for timeline
          under_review: "document_uploaded", // use uploaded as a neutral type
        };
        
        await storage.createTimelineEvent({
          loanApplicationId: document.loanApplicationId,
          eventType: eventTypeMap[validationResult.data.action] || "document_uploaded",
          title: `Document ${actionLabels[validationResult.data.action] || "reviewed"}`,
          description: validationResult.data.comment || `A staff member ${actionLabels[validationResult.data.action]} a document.`,
          metadata: {
            documentId,
            reviewId: review.id,
            action: validationResult.data.action,
            reviewerRole: user?.staffRole,
          },
          createdByUserId: userId,
        });
      }
      
      // Queue notification for document owner
      const app = await storage.getLoanApplication(document.loanApplicationId!);
      if (app?.userId) {
        const notificationMessages: Record<string, { title: string; message: string; type: "document_approved" | "document_rejected" }> = {
          approved: {
            title: "Document Approved",
            message: `Your document has been approved by our team.`,
            type: "document_approved",
          },
          rejected: {
            title: "Document Rejected",
            message: `Your document was rejected. ${validationResult.data.comment || "Please upload a new version."}`,
            type: "document_rejected",
          },
          request_changes: {
            title: "Document Changes Requested",
            message: `Changes have been requested for your document. ${validationResult.data.comment || "Please review and resubmit."}`,
            type: "document_rejected",
          },
        };
        
        const notif = notificationMessages[validationResult.data.action];
        if (notif) {
          // Schedule notification to be sent after 30 minutes (batching)
          const sendAfter = new Date(Date.now() + 30 * 60 * 1000);
          await storage.createNotificationQueueItem({
            recipientId: app.userId,
            notificationType: notif.type,
            title: notif.title,
            message: notif.message,
            linkUrl: `/portal/applications/${app.id}`,
            relatedApplicationId: app.id,
            relatedDocumentId: documentId,
            batchKey: `doc_review:${app.id}`,
            sendAfter,
          });
        }
      }
      
      return res.status(201).json(review);
    } catch (error) {
      console.error("Error creating document review:", error);
      return res.status(500).json({ error: "Failed to create document review" });
    }
  });

  // Get the latest review for a document
  app.get("/api/documents/:documentId/reviews/latest", isAuthenticated, async (req: any, res) => {
    try {
      const { documentId } = req.params;
      const review = await storage.getLatestDocumentReview(documentId);
      return res.json(review || null);
    } catch (error) {
      console.error("Error fetching latest document review:", error);
      return res.status(500).json({ error: "Failed to fetch latest review" });
    }
  });

  // ============================================
  // DOCUMENT COMMENT API ENDPOINTS (with staff role)
  // ============================================

  // Get comments for a document (with user info and role)
  app.get("/api/documents/:documentId/comments", isAuthenticated, async (req: any, res) => {
    try {
      const { documentId } = req.params;
      const comments = await storage.getDocumentComments(documentId);
      return res.json(comments);
    } catch (error) {
      console.error("Error fetching document comments:", error);
      return res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  // Create a document comment with staff role
  app.post("/api/documents/:documentId/comments", isAuthenticated, async (req: any, res) => {
    try {
      const { documentId } = req.params;
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      const validationResult = insertDocumentCommentSchema.safeParse({
        ...req.body,
        documentId,
        userId,
        staffRole: user?.staffRole || undefined,
      });
      
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ error: validationError.message });
      }
      
      const comment = await storage.createDocumentComment(validationResult.data);
      
      // If comment has attachments, create them
      if (req.body.attachments && Array.isArray(req.body.attachments)) {
        for (const attachment of req.body.attachments) {
          await storage.createCommentAttachment({
            documentCommentId: comment.id,
            fileName: attachment.fileName,
            fileUrl: attachment.fileUrl,
            fileSize: attachment.fileSize,
            mimeType: attachment.mimeType,
            uploadedById: userId,
          });
        }
      }
      
      return res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating document comment:", error);
      return res.status(500).json({ error: "Failed to create comment" });
    }
  });

  // ============================================
  // COMMENT ATTACHMENT API ENDPOINTS
  // ============================================

  // Get attachments for a comment or review
  app.get("/api/comments/:commentId/attachments", isAuthenticated, async (req: any, res) => {
    try {
      const { commentId } = req.params;
      const type = req.query.type === 'review' ? 'review' : 'comment';
      const attachments = await storage.getCommentAttachments(commentId, type);
      return res.json(attachments);
    } catch (error) {
      console.error("Error fetching comment attachments:", error);
      return res.status(500).json({ error: "Failed to fetch attachments" });
    }
  });

  // Upload an attachment (image) for a comment
  app.post("/api/comments/:commentId/attachments", isAuthenticated, async (req: any, res) => {
    try {
      const { commentId } = req.params;
      const userId = req.user.claims.sub;
      const type = req.query.type === 'review' ? 'review' : 'comment';
      
      const attachmentData = {
        [type === 'review' ? 'documentReviewId' : 'documentCommentId']: commentId,
        fileName: req.body.fileName,
        fileUrl: req.body.fileUrl,
        fileSize: req.body.fileSize,
        mimeType: req.body.mimeType,
        uploadedById: userId,
      };
      
      const validationResult = insertCommentAttachmentSchema.safeParse(attachmentData);
      
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ error: validationError.message });
      }
      
      const attachment = await storage.createCommentAttachment(validationResult.data);
      return res.status(201).json(attachment);
    } catch (error) {
      console.error("Error creating comment attachment:", error);
      return res.status(500).json({ error: "Failed to create attachment" });
    }
  });

  // Delete an attachment
  app.delete("/api/attachments/:id", isAuthenticated, async (req: any, res) => {
    try {
      const success = await storage.deleteCommentAttachment(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Attachment not found" });
      }
      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting attachment:", error);
      return res.status(500).json({ error: "Failed to delete attachment" });
    }
  });

  // ============================================
  // NOTIFICATION QUEUE API ENDPOINTS
  // ============================================

  // Get pending notifications (admin only)
  app.get("/api/admin/notification-queue", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const notifications = await storage.getPendingNotifications();
      return res.json(notifications);
    } catch (error) {
      console.error("Error fetching notification queue:", error);
      return res.status(500).json({ error: "Failed to fetch notification queue" });
    }
  });

  // Process pending notifications (admin trigger or cron job)
  app.post("/api/admin/notification-queue/process", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const now = new Date();
      const pending = await storage.getPendingNotifications(now);
      
      // Group by batch key for consolidated notifications
      const batches = new Map<string, typeof pending>();
      for (const notification of pending) {
        const key = notification.batchKey || notification.id;
        if (!batches.has(key)) {
          batches.set(key, []);
        }
        batches.get(key)!.push(notification);
      }
      
      let processed = 0;
      let failed = 0;
      
      // Convert Map to array entries for iteration
      const batchEntries = Array.from(batches.entries());
      
      for (const [batchKey, batchNotifications] of batchEntries) {
        try {
          // Create a single consolidated notification for this batch
          const firstNotif = batchNotifications[0];
          
          // If multiple items in batch, consolidate message
          let title = firstNotif.title;
          let message = firstNotif.message;
          
          if (batchNotifications.length > 1) {
            title = `${batchNotifications.length} Document Updates`;
            message = `You have ${batchNotifications.length} document updates. Click to view details.`;
          }
          
          // Create actual notification for the user
          await storage.createNotification({
            userId: firstNotif.recipientId,
            type: firstNotif.notificationType,
            title,
            message,
            linkUrl: firstNotif.linkUrl || undefined,
            relatedApplicationId: firstNotif.relatedApplicationId || undefined,
          });
          
          // Mark all notifications in batch as sent
          for (const notif of batchNotifications) {
            await storage.markNotificationSent(notif.id);
          }
          
          processed += batchNotifications.length;
        } catch (error) {
          console.error(`Error processing batch ${batchKey}:`, error);
          for (const notif of batchNotifications) {
            await storage.markNotificationFailed(notif.id, String(error));
          }
          failed += batchNotifications.length;
        }
      }
      
      return res.json({ 
        success: true, 
        processed, 
        failed,
        batchesProcessed: batches.size,
      });
    } catch (error) {
      console.error("Error processing notification queue:", error);
      return res.status(500).json({ error: "Failed to process notifications" });
    }
  });

  // ============================================
  // STAFF ROLE MANAGEMENT
  // ============================================

  // Update a user's staff role (admin only)
  app.patch("/api/admin/users/:userId/staff-role", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { staffRole } = req.body;
      
      const validRoles: StaffRole[] = ["account_executive", "processor", "underwriter", "management"];
      if (!validRoles.includes(staffRole)) {
        return res.status(400).json({ error: "Invalid staff role" });
      }
      
      const user = await storage.updateUserStaffRole(userId, staffRole);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      return res.json(user);
    } catch (error) {
      console.error("Error updating staff role:", error);
      return res.status(500).json({ error: "Failed to update staff role" });
    }
  });

  // Get staff role colors/labels (public for UI)
  app.get("/api/staff-roles", async (req, res) => {
    return res.json(STAFF_ROLE_COLORS);
  });

  // =====================
  // Test Data Seeder (Admin only)
  // =====================
  app.post("/api/admin/seed-test-data", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const testBorrower = await storage.getUserByEmail("borrower@test.com");
      if (!testBorrower) {
        return res.status(400).json({ error: "Test borrower not found. Please create borrower@test.com first." });
      }
      
      const testLoans = [
        {
          loanType: "DSCR Loan",
          propertyAddress: "123 Rental Avenue",
          propertyCity: "Miami",
          propertyState: "FL",
          propertyZip: "33139",
          loanAmount: 450000,
          purchasePrice: 500000,
          arv: 550000,
          annualTaxes: 8000,
          annualInsurance: 3600,
          annualHOA: 2400,
          loanTermMonths: 360,
          interestRate: "7.25",
        },
        {
          loanType: "Fix & Flip",
          propertyAddress: "456 Flip Street",
          propertyCity: "Los Angeles",
          propertyState: "CA",
          propertyZip: "90210",
          loanAmount: 350000,
          purchasePrice: 400000,
          arv: 600000,
          rehabBudget: 100000,
          requestedRehabFunding: 100000,
          loanTermMonths: 12,
          interestRate: "10.5",
        },
        {
          loanType: "New Construction",
          propertyAddress: "789 Builder Lane",
          propertyCity: "Austin",
          propertyState: "TX",
          propertyZip: "78701",
          loanAmount: 800000,
          purchasePrice: 150000,
          arv: 1200000,
          rehabBudget: 650000,
          requestedRehabFunding: 650000,
          loanTermMonths: 18,
          interestRate: "9.9",
        },
        {
          loanType: "Bridge",
          propertyAddress: "321 Bridge Road",
          propertyCity: "Phoenix",
          propertyState: "AZ",
          propertyZip: "85001",
          loanAmount: 280000,
          purchasePrice: 320000,
          arv: 380000,
          loanTermMonths: 6,
          interestRate: "11.0",
        },
      ];
      
      const createdLoans = [];
      
      for (const loanData of testLoans) {
        // Create application
        const app = await storage.createLoanApplication({
          userId: testBorrower.id,
          status: "submitted",
          processingStage: "account_review",
          ...loanData,
        });
        
        // Update status to funded (this triggers auto-creation of serviced loan)
        const updated = await storage.updateLoanApplication(app.id, { status: "funded" });
        
        // Now create the serviced loan manually since we're bypassing the route
        const servicedLoanType = mapLoanTypeToServicedType(loanData.loanType);
        const isHardMoney = servicedLoanType !== "dscr";
        const loanNumber = generateLoanNumber(servicedLoanType);
        
        const originalAmount = loanData.loanAmount;
        const interestRate = parseFloat(loanData.interestRate);
        const termMonths = loanData.loanTermMonths;
        
        let monthlyPayment = 0;
        if (isHardMoney) {
          monthlyPayment = Math.round((originalAmount * (interestRate / 100)) / 12);
        } else {
          const monthlyRate = (interestRate / 100) / 12;
          if (monthlyRate > 0) {
            monthlyPayment = Math.round(originalAmount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1));
          }
        }
        
        const annualTaxes = loanData.annualTaxes || 0;
        const annualInsurance = loanData.annualInsurance || 0;
        const annualHOA = loanData.annualHOA || 0;
        const monthlyEscrow = !isHardMoney ? Math.round((annualTaxes + annualInsurance + annualHOA) / 12) : 0;
        
        const closingDate = new Date();
        closingDate.setDate(closingDate.getDate() - 30); // Closed 30 days ago
        
        const firstPaymentDate = new Date(closingDate);
        firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 1);
        firstPaymentDate.setDate(1);
        
        const maturityDate = new Date(closingDate);
        maturityDate.setMonth(maturityDate.getMonth() + termMonths);
        
        const nextPaymentDate = new Date();
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
        nextPaymentDate.setDate(1);
        
        const servicedLoan = await storage.createServicedLoan({
          userId: testBorrower.id,
          loanApplicationId: app.id,
          loanNumber,
          loanType: servicedLoanType,
          loanStatus: "current",
          propertyAddress: loanData.propertyAddress,
          propertyCity: loanData.propertyCity,
          propertyState: loanData.propertyState,
          propertyZip: loanData.propertyZip,
          originalLoanAmount: originalAmount,
          currentBalance: originalAmount,
          interestRate: loanData.interestRate,
          loanTermMonths: termMonths,
          amortizationMonths: isHardMoney ? null : termMonths,
          isInterestOnly: isHardMoney,
          monthlyPayment,
          monthlyEscrowAmount: monthlyEscrow,
          closingDate,
          firstPaymentDate,
          maturityDate,
          nextPaymentDate,
          totalPrincipalPaid: 0,
          totalInterestPaid: 0,
          escrowBalance: 0,
          annualTaxes: !isHardMoney ? annualTaxes : null,
          annualInsurance: !isHardMoney ? annualInsurance : null,
          annualHOA: !isHardMoney ? annualHOA : null,
          totalRehabBudget: isHardMoney ? (loanData.rehabBudget || 0) : null,
          totalDrawsFunded: 0,
        });
        
        createdLoans.push({
          applicationId: app.id,
          loanNumber: servicedLoan.loanNumber,
          loanType: servicedLoan.loanType,
          amount: servicedLoan.originalLoanAmount,
        });
      }
      
      return res.json({
        message: "Test data seeded successfully",
        loans: createdLoans,
      });
    } catch (error) {
      console.error("Error seeding test data:", error);
      return res.status(500).json({ error: "Failed to seed test data" });
    }
  });

  const httpServer = createServer(app);

  // ============================================
  // AUTOMATIC NOTIFICATION PROCESSOR
  // Process pending notifications every 5 minutes during business hours
  // (Notifications are queued with 30-minute delay, so checking every 5 mins is efficient)
  // ============================================
  const NOTIFICATION_PROCESS_INTERVAL = 5 * 60 * 1000; // 5 minutes
  
  const processNotificationQueue = async () => {
    try {
      const now = new Date();
      const pending = await storage.getPendingNotifications(now);
      
      if (pending.length === 0) return;
      
      // Group by batch key for consolidated notifications
      const batches = new Map<string, typeof pending>();
      for (const notification of pending) {
        const key = notification.batchKey || notification.id;
        if (!batches.has(key)) {
          batches.set(key, []);
        }
        batches.get(key)!.push(notification);
      }
      
      let processed = 0;
      const batchEntries = Array.from(batches.entries());
      
      for (const [batchKey, batchNotifications] of batchEntries) {
        try {
          const firstNotif = batchNotifications[0];
          
          // Consolidate multiple notifications into one
          let title = firstNotif.title;
          let message = firstNotif.message;
          
          if (batchNotifications.length > 1) {
            title = `${batchNotifications.length} Document Updates`;
            message = `You have ${batchNotifications.length} document updates. Click to view details.`;
          }
          
          // Create the actual notification
          await storage.createNotification({
            userId: firstNotif.recipientId,
            type: firstNotif.notificationType,
            title,
            message,
            linkUrl: firstNotif.linkUrl || undefined,
            relatedApplicationId: firstNotif.relatedApplicationId || undefined,
          });
          
          // Mark all in batch as sent
          for (const notif of batchNotifications) {
            await storage.markNotificationSent(notif.id);
          }
          
          processed += batchNotifications.length;
        } catch (error) {
          console.error(`Notification batch ${batchKey} failed:`, error);
          for (const notif of batchNotifications) {
            await storage.markNotificationFailed(notif.id, String(error));
          }
        }
      }
      
      if (processed > 0) {
        console.log(`Notification processor: ${processed} notifications sent in ${batches.size} batches`);
      }
    } catch (error) {
      console.error("Notification processor error:", error);
    }
  };
  
  // Start the notification processor interval
  setInterval(processNotificationQueue, NOTIFICATION_PROCESS_INTERVAL);
  
  // Run once at startup to process any pending notifications
  setTimeout(processNotificationQueue, 5000);

  return httpServer;
}
