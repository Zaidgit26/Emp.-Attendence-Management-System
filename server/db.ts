import dotenv from "dotenv";
dotenv.config();

import mysql from 'mysql2/promise';

const poolConnection = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "root1",
  password: process.env.DB_PASSWORD || "2002",
  database: process.env.DB_NAME || "employee_leave_management_system",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const db = poolConnection;

// Initialize database tables
export async function initializeDatabase() {
  try {
    // Check if users table exists and get its structure
    const [tables] = await db.execute(`SHOW TABLES LIKE 'users'`);

    if (tables.length === 0) {
      // Create users table if it doesn't exist
      await db.execute(`
        CREATE TABLE users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(100) NOT NULL UNIQUE,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          role ENUM('employee', 'admin') DEFAULT 'employee',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log('Created users table');
    } else {
      // Check if email column exists
      const [columns] = await db.execute(`SHOW COLUMNS FROM users LIKE 'email'`);

      if (columns.length === 0) {
        // Add email column if it doesn't exist
        await db.execute(`ALTER TABLE users ADD COLUMN email VARCHAR(255) NOT NULL UNIQUE AFTER username`);
        console.log('Added email column to users table');
      }

      // Check if role column exists
      const [roleColumns] = await db.execute(`SHOW COLUMNS FROM users LIKE 'role'`);

      if (roleColumns.length === 0) {
        // Add role column if it doesn't exist
        await db.execute(`ALTER TABLE users ADD COLUMN role ENUM('employee', 'admin') DEFAULT 'employee' AFTER password`);
        console.log('Added role column to users table');
      }

      // Check if timestamps exist
      const [createdAtColumns] = await db.execute(`SHOW COLUMNS FROM users LIKE 'created_at'`);

      if (createdAtColumns.length === 0) {
        await db.execute(`ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER role`);
        await db.execute(`ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at`);
        console.log('Added timestamp columns to users table');
      }
    }

    // Check if leaves table exists
    const [leavesTables] = await db.execute(`SHOW TABLES LIKE 'leaves'`);

    if (leavesTables.length === 0) {
      // Create leaves table if it doesn't exist
      await db.execute(`
        CREATE TABLE leaves (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT DEFAULT 1,
          employee_name VARCHAR(100) NOT NULL,
          leave_type VARCHAR(50) NOT NULL,
          from_date DATE NOT NULL,
          to_date DATE NOT NULL,
          reason VARCHAR(500) NOT NULL,
          status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log('Created leaves table');
    } else {
      // Check if user_id column exists in leaves table
      const [userIdColumns] = await db.execute(`SHOW COLUMNS FROM leaves LIKE 'user_id'`);

      if (userIdColumns.length === 0) {
        // Add user_id column if it doesn't exist
        await db.execute(`ALTER TABLE leaves ADD COLUMN user_id INT DEFAULT 1 AFTER id`);
        console.log('Added user_id column to leaves table');
      }
    }

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}