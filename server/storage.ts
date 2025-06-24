import { users, leaves, type User, type InsertUser, type Leave, type InsertLeave, type UpdateLeaveStatus } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Leave management methods
  createLeave(leave: InsertLeave): Promise<Leave>;
  getAllLeaves(): Promise<Leave[]>;
  getLeaveById(id: number): Promise<Leave | undefined>;
  updateLeaveStatus(id: number, status: UpdateLeaveStatus): Promise<Leave | undefined>;
  getLeavesByStatus(status: string): Promise<Leave[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db
      .insert(users)
      .values(insertUser);

    // MySQL doesn't support returning, so we need to fetch the inserted user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, result[0].insertId));
    return user;
  }

  async createLeave(insertLeave: InsertLeave): Promise<Leave> {
    const result = await db
      .insert(leaves)
      .values({
        employeeName: insertLeave.employeeName,
        leaveType: insertLeave.leaveType,
        fromDate: new Date(insertLeave.fromDate),
        toDate: new Date(insertLeave.toDate),
        reason: insertLeave.reason,
        status: "Pending",
      });

    // MySQL doesn't support returning, so we need to fetch the inserted leave
    const [leave] = await db
      .select()
      .from(leaves)
      .where(eq(leaves.id, result[0].insertId));
    return leave;
  }

  async getAllLeaves(): Promise<Leave[]> {
    return await db.select().from(leaves).orderBy(desc(leaves.createdAt));
  }

  async getLeaveById(id: number): Promise<Leave | undefined> {
    const [leave] = await db.select().from(leaves).where(eq(leaves.id, id));
    return leave || undefined;
  }

  async updateLeaveStatus(id: number, statusUpdate: UpdateLeaveStatus): Promise<Leave | undefined> {
    await db
      .update(leaves)
      .set({
        status: statusUpdate.status,
        updatedAt: new Date()
      })
      .where(eq(leaves.id, id));

    // MySQL doesn't support returning, so we need to fetch the updated leave
    const [leave] = await db
      .select()
      .from(leaves)
      .where(eq(leaves.id, id));
    return leave || undefined;
  }

  async getLeavesByStatus(status: string): Promise<Leave[]> {
    return await db.select().from(leaves).where(eq(leaves.status, status)).orderBy(desc(leaves.createdAt));
  }
}

export const storage = new DatabaseStorage();
