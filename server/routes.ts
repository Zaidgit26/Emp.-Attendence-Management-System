import type { Express } from "express";
import { createServer, type Server } from "http";
import { body, query, param, validationResult } from "express-validator";
import { storage } from "./storage";
import { authMiddleware, adminMiddleware, generateToken, type AuthRequest } from "./auth";
import {
  loginSchema,
  registerSchema,
  insertLeaveSchema,
  updateLeaveStatusSchema,
  paginationSchema
} from "@shared/schema";
import * as yup from "yup";

// Validation middleware
function validateRequest(req: any, res: any, next: any) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array()
    });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/login", [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    validateRequest
  ], async (req, res) => {
    try {
      const { email, password } = await loginSchema.validate(req.body);
      const user = await storage.validateUserPassword(email, password);

      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = generateToken(user);

      // Return user info without password
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        message: "Login successful",
        token,
        user: userWithoutPassword
      });
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        console.error('Login error:', error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.post("/api/register", [
    body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['employee', 'admin']).withMessage('Role must be employee or admin'),
    validateRequest
  ], async (req, res) => {
    try {
      const userData = await registerSchema.validate(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ message: "User with this email already exists" });
      }

      const user = await storage.createUser(userData);
      const token = generateToken(user);

      // Return user info without password
      const { password: _, ...userWithoutPassword } = user;

      res.status(201).json({
        message: "User created successfully",
        token,
        user: userWithoutPassword
      });
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        console.error('Registration error:', error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Protected routes - require authentication

  // Apply for leave
  app.post("/api/apply-leave", authMiddleware, async (req: AuthRequest, res) => {
    try {
      console.log('Received leave application data:', req.body);

      const leaveData = await insertLeaveSchema.validate({
        ...req.body,
        user_id: req.user!.id
      });

      console.log('Validated leave data:', leaveData);

      const leave = await storage.createLeave(leaveData);
      res.status(201).json(leave);
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        console.log('Validation errors:', error.errors);
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        console.error('Apply leave error:', error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Get all leaves with pagination and filtering
  app.get("/api/leaves", authMiddleware, [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status').optional().isIn(['all', 'Pending', 'Approved', 'Rejected']).withMessage('Invalid status filter'),
    validateRequest
  ], async (req: AuthRequest, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;

      let result;
      if (req.user!.role === 'admin') {
        // Admin can see all leaves
        result = await storage.getAllLeaves(page, limit, status);
      } else {
        // Regular users can only see their own leaves
        result = await storage.getUserLeaves(req.user!.id, page, limit);
      }

      res.json(result);
    } catch (error) {
      console.error('Get leaves error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get leave by ID
  app.get("/api/leaves/:id", authMiddleware, [
    param('id').isInt({ min: 1 }).withMessage('Invalid leave ID'),
    validateRequest
  ], async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const leave = await storage.getLeaveById(id);

      if (!leave) {
        return res.status(404).json({ message: "Leave not found" });
      }

      // Users can only view their own leaves unless they're admin
      if (req.user!.role !== 'admin' && leave.user_id !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(leave);
    } catch (error) {
      console.error('Get leave by ID error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin routes - require admin role

  // Update leave status (approve/reject)
  app.put("/api/leaves/:id/status", authMiddleware, adminMiddleware, [
    param('id').isInt({ min: 1 }).withMessage('Invalid leave ID'),
    body('status').isIn(['Pending', 'Approved', 'Rejected']).withMessage('Invalid status'),
    validateRequest
  ], async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const statusData = await updateLeaveStatusSchema.validate(req.body);

      const leave = await storage.updateLeaveStatus(id, statusData);
      if (!leave) {
        return res.status(404).json({ message: "Leave not found" });
      }

      res.json(leave);
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        console.error('Update leave status error:', error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Quick approve leave
  app.put("/api/leaves/:id/approve", authMiddleware, adminMiddleware, [
    param('id').isInt({ min: 1 }).withMessage('Invalid leave ID'),
    validateRequest
  ], async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const leave = await storage.updateLeaveStatus(id, { status: "Approved" });

      if (!leave) {
        return res.status(404).json({ message: "Leave not found" });
      }

      res.json(leave);
    } catch (error) {
      console.error('Approve leave error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Quick reject leave
  app.put("/api/leaves/:id/reject", authMiddleware, adminMiddleware, [
    param('id').isInt({ min: 1 }).withMessage('Invalid leave ID'),
    validateRequest
  ], async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const leave = await storage.updateLeaveStatus(id, { status: "Rejected" });

      if (!leave) {
        return res.status(404).json({ message: "Leave not found" });
      }

      res.json(leave);
    } catch (error) {
      console.error('Reject leave error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get current user info
  app.get("/api/me", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return user info without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
