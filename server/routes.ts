import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeadSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
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

  const httpServer = createServer(app);

  return httpServer;
}
