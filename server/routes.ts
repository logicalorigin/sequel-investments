import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import path from "path";
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
  getStateBySlug,
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { setupStaffAuth, createAdminUser } from "./staffAuth";
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
  
  // Create default admin user in development mode only
  // In production, use environment variables or a proper user management system
  if (process.env.NODE_ENV !== 'production') {
    await createAdminUser("admin", "admin123");
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
      const loan = await storage.getServicedLoan(req.params.id);
      
      if (!loan) {
        return res.status(404).json({ error: "Loan not found" });
      }
      
      if (loan.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      return res.json(loan);
    } catch (error) {
      console.error("Error fetching serviced loan:", error);
      return res.status(500).json({ error: "Failed to fetch serviced loan" });
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

  // Update application (staff can update status, processing stage, etc.)
  app.patch("/api/admin/applications/:id", isAuthenticated, isStaff, async (req: any, res) => {
    try {
      const { id } = req.params;
      const application = await storage.getLoanApplication(id);
      
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      
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
          message: "This is a test webhook from Secured Asset Funding",
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
            "X-SAF-Signature": `sha256=${signature}`,
            "X-SAF-Event": "test.ping",
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

  const httpServer = createServer(app);

  return httpServer;
}
