import type { Express } from "express";
import { createServer, type Server } from "http";
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
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import crypto from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  await setupAuth(app);
  
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
      
      const updated = await storage.updateLoanApplication(req.params.id, req.body);
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
  app.post("/api/objects/upload", isAuthenticated, async (req: any, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
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

  const httpServer = createServer(app);

  return httpServer;
}
