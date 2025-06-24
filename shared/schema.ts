import { mysqlTable, varchar, int, date, timestamp } from "drizzle-orm/mysql-core";
import * as yup from "yup";

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

export const insertUserSchema = yup.object({
  username: yup.string().required("Username is required"),
  password: yup.string().required("Password is required"),
});

export const insertLeaveSchema = yup.object({
  employeeName: yup.string().required("Employee name is required"),
  leaveType: yup.string().required("Leave type is required"),
  fromDate: yup.string().required("From date is required"),
  toDate: yup.string().required("To date is required"),
  reason: yup.string().required("Reason is required"),
});

export const updateLeaveStatusSchema = yup.object({
  status: yup.string().oneOf(["Pending", "Approved", "Rejected"]).required(),
});

export type InsertUser = yup.InferType<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Leave = typeof leaves.$inferSelect;
export type InsertLeave = yup.InferType<typeof insertLeaveSchema>;
export type UpdateLeaveStatus = yup.InferType<typeof updateLeaveStatusSchema>;
