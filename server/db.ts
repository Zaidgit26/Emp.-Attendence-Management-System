import dotenv from "dotenv";
dotenv.config();

import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";

const poolConnection = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "employee_leave_management_system",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});



export const db = drizzle(poolConnection, { schema, mode: 'default' });