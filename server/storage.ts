import { db } from "./db";
import bcrypt from "bcryptjs";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  role: 'employee' | 'admin';
  created_at: Date;
  updated_at: Date;
}

export interface InsertUser {
  username: string;
  email: string;
  password: string;
  role?: 'employee' | 'admin';
}

export interface Leave {
  id: number;
  user_id: number;
  employee_name: string;
  leave_type: string;
  from_date: string;
  to_date: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  created_at: Date;
  updated_at: Date;
}

export interface InsertLeave {
  user_id: number;
  employee_name: string;
  leave_type: string;
  from_date: string;
  to_date: string;
  reason: string;
}

export interface UpdateLeaveStatus {
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface PaginatedLeaves {
  leaves: Leave[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

export interface IStorage {
  // User management methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  validateUserPassword(email: string, password: string): Promise<User | null>;

  // Leave management methods
  createLeave(leave: InsertLeave): Promise<Leave>;
  getAllLeaves(page?: number, limit?: number, status?: string): Promise<PaginatedLeaves>;
  getLeaveById(id: number): Promise<Leave | undefined>;
  updateLeaveStatus(id: number, status: UpdateLeaveStatus): Promise<Leave | undefined>;
  getLeavesByStatus(status: string): Promise<Leave[]>;
  getUserLeaves(userId: number, page?: number, limit?: number): Promise<PaginatedLeaves>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [rows] = await db.execute<RowDataPacket[]>(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      return rows[0] as User || undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [rows] = await db.execute<RowDataPacket[]>(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      return rows[0] as User || undefined;
    } catch (error) {
      console.error('Error getting user by username:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [rows] = await db.execute<RowDataPacket[]>(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return rows[0] as User || undefined;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      // Hash password before storing
      const hashedPassword = await bcrypt.hash(insertUser.password, 10);

      const [result] = await db.execute<ResultSetHeader>(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        [insertUser.username, insertUser.email, hashedPassword, insertUser.role || 'employee']
      );

      // Fetch the created user
      const [rows] = await db.execute<RowDataPacket[]>(
        'SELECT * FROM users WHERE id = ?',
        [result.insertId]
      );

      return rows[0] as User;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async validateUserPassword(email: string, password: string): Promise<User | null> {
    try {
      const [rows] = await db.execute<RowDataPacket[]>(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      const user = rows[0] as User;
      if (!user) return null;

      const isValidPassword = await bcrypt.compare(password, user.password);
      return isValidPassword ? user : null;
    } catch (error) {
      console.error('Error validating user password:', error);
      throw error;
    }
  }

  async createLeave(insertLeave: InsertLeave): Promise<Leave> {
    try {
      const [result] = await db.execute<ResultSetHeader>(
        'INSERT INTO leaves (user_id, employee_name, leave_type, from_date, to_date, reason, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [insertLeave.user_id, insertLeave.employee_name, insertLeave.leave_type, insertLeave.from_date, insertLeave.to_date, insertLeave.reason, 'Pending']
      );

      // Fetch the created leave
      const [rows] = await db.execute<RowDataPacket[]>(
        'SELECT * FROM leaves WHERE id = ?',
        [result.insertId]
      );

      return rows[0] as Leave;
    } catch (error) {
      console.error('Error creating leave:', error);
      throw error;
    }
  }

  async getAllLeaves(page: number = 1, limit: number = 10, status?: string): Promise<PaginatedLeaves> {
    try {
      // Ensure parameters are integers
      const pageNum = Math.max(1, Math.floor(Number(page)));
      const limitNum = Math.max(1, Math.min(100, Math.floor(Number(limit))));
      const offset = (pageNum - 1) * limitNum;

      // Build queries with optional status filter
      if (status && status !== 'all') {
        // Get total count with status filter
        const [countRows] = await db.execute<RowDataPacket[]>(
          'SELECT COUNT(*) as total FROM leaves WHERE status = ?',
          [status]
        );
        const totalCount = countRows[0].total;

        // Get paginated results with status filter
        const [rows] = await db.execute<RowDataPacket[]>(
          `SELECT * FROM leaves WHERE status = ? ORDER BY created_at DESC LIMIT ${limitNum} OFFSET ${offset}`,
          [status]
        );

        return {
          leaves: rows as Leave[],
          totalCount,
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          limit: limitNum
        };
      } else {
        // Get total count without filter
        const [countRows] = await db.execute<RowDataPacket[]>(
          'SELECT COUNT(*) as total FROM leaves'
        );
        const totalCount = countRows[0].total;

        // Get paginated results without filter
        const [rows] = await db.execute<RowDataPacket[]>(
          `SELECT * FROM leaves ORDER BY created_at DESC LIMIT ${limitNum} OFFSET ${offset}`
        );

        return {
          leaves: rows as Leave[],
          totalCount,
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          limit: limitNum
        };
      }
    } catch (error) {
      console.error('Error getting all leaves:', error);
      throw error;
    }
  }

  async getLeaveById(id: number): Promise<Leave | undefined> {
    try {
      const [rows] = await db.execute<RowDataPacket[]>(
        'SELECT * FROM leaves WHERE id = ?',
        [id]
      );
      return rows[0] as Leave || undefined;
    } catch (error) {
      console.error('Error getting leave by id:', error);
      throw error;
    }
  }

  async updateLeaveStatus(id: number, statusUpdate: UpdateLeaveStatus): Promise<Leave | undefined> {
    try {
      await db.execute(
        'UPDATE leaves SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [statusUpdate.status, id]
      );

      // Fetch the updated leave
      const [rows] = await db.execute<RowDataPacket[]>(
        'SELECT * FROM leaves WHERE id = ?',
        [id]
      );

      return rows[0] as Leave || undefined;
    } catch (error) {
      console.error('Error updating leave status:', error);
      throw error;
    }
  }

  async getLeavesByStatus(status: string): Promise<Leave[]> {
    try {
      const [rows] = await db.execute<RowDataPacket[]>(
        'SELECT * FROM leaves WHERE status = ? ORDER BY created_at DESC',
        [status]
      );
      return rows as Leave[];
    } catch (error) {
      console.error('Error getting leaves by status:', error);
      throw error;
    }
  }

  async getUserLeaves(userId: number, page: number = 1, limit: number = 10): Promise<PaginatedLeaves> {
    try {
      // Ensure parameters are proper integers
      const pageNum = Math.max(1, parseInt(String(page)));
      const limitNum = Math.max(1, Math.min(100, parseInt(String(limit))));
      const offset = (pageNum - 1) * limitNum;

      // Get total count for user
      const [countRows] = await db.execute<RowDataPacket[]>(
        'SELECT COUNT(*) as total FROM leaves WHERE user_id = ?',
        [userId]
      );
      const totalCount = countRows[0].total;

      // Get paginated results for user
      const [rows] = await db.execute<RowDataPacket[]>(
        `SELECT * FROM leaves WHERE user_id = ? ORDER BY created_at DESC LIMIT ${limitNum} OFFSET ${offset}`,
        [userId]
      );

      return {
        leaves: rows as Leave[],
        totalCount,
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        limit: limitNum
      };
    } catch (error) {
      console.error('Error getting user leaves:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
