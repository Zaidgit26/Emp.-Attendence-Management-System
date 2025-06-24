import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeaveSchema, updateLeaveStatusSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply for leave
  app.post("/api/apply-leave", async (req, res) => {
    try {
      const leaveData = insertLeaveSchema.parse(req.body);
      const leave = await storage.createLeave(leaveData);
      res.json(leave);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Get all leaves
  app.get("/api/leaves", async (req, res) => {
    try {
      const { status } = req.query;
      let leaves;

      if (status && typeof status === 'string') {
        leaves = await storage.getLeavesByStatus(status);
      } else {
        leaves = await storage.getAllLeaves();
      }

      res.json(leaves);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get leave by ID
  app.get("/api/leaves/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid leave ID" });
      }

      const leave = await storage.getLeaveById(id);
      if (!leave) {
        return res.status(404).json({ message: "Leave not found" });
      }

      res.json(leave);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Approve leave
  app.put("/api/leaves/:id/approve", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid leave ID" });
      }

      const leave = await storage.updateLeaveStatus(id, { status: "Approved" });
      if (!leave) {
        return res.status(404).json({ message: "Leave not found" });
      }

      res.json(leave);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Reject leave
  app.put("/api/leaves/:id/reject", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid leave ID" });
      }

      const leave = await storage.updateLeaveStatus(id, { status: "Rejected" });
      if (!leave) {
        return res.status(404).json({ message: "Leave not found" });
      }

      res.json(leave);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
