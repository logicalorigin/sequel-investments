import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeadSchema, insertLoanApplicationSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";

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

  const httpServer = createServer(app);

  return httpServer;
}
