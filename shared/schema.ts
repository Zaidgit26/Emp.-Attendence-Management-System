import { mysqlTable, varchar, int, date, timestamp } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
});

export const leaves = mysqlTable("leaves", {
  id: int("id").primaryKey().autoincrement(),
  employeeName: varchar("employee_name", { length: 100 }).notNull(),
  leaveType: varchar("leave_type", { length: 50 }).notNull(),
  fromDate: date("from_date").notNull(),
  toDate: date("to_date").notNull(),
  reason: varchar("reason", { length: 500 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("Pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertLeaveSchema = createInsertSchema(leaves).pick({
  employeeName: true,
  leaveType: true,
  fromDate: true,
  toDate: true,
  reason: true,
}).extend({
  fromDate: z.string().min(1, "From date is required"),
  toDate: z.string().min(1, "To date is required"),
});

export const updateLeaveStatusSchema = z.object({
  status: z.enum(["Pending", "Approved", "Rejected"]),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Leave = typeof leaves.$inferSelect;
export type InsertLeave = z.infer<typeof insertLeaveSchema>;
export type UpdateLeaveStatus = z.infer<typeof updateLeaveStatusSchema>;
