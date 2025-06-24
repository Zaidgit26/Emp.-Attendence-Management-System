// Database viewer script for Employee Leave Management System
import dotenv from "dotenv";
import mysql from 'mysql2/promise';

dotenv.config();

async function viewDatabase() {
  try {
    // Connect to MySQL
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'employee_leave_management_system'
    });

    console.log('✅ Connected to MySQL database: employee_leave_management_system\n');

    // Show all tables
    console.log('📋 TABLES IN DATABASE:');
    console.log('='.repeat(50));
    const [tables] = await connection.execute('SHOW TABLES');
    tables.forEach(table => {
      console.log(`- ${Object.values(table)[0]}`);
    });

    console.log('\n👥 USERS TABLE:');
    console.log('='.repeat(50));
    const [users] = await connection.execute('SELECT * FROM users');
    if (users.length === 0) {
      console.log('No users found.');
    } else {
      console.table(users);
    }

    console.log('\n📝 LEAVES TABLE:');
    console.log('='.repeat(50));
    const [leaves] = await connection.execute('SELECT * FROM leaves ORDER BY created_at DESC');
    if (leaves.length === 0) {
      console.log('No leave records found.');
    } else {
      console.table(leaves);
    }

    console.log('\n📊 LEAVE STATISTICS:');
    console.log('='.repeat(50));
    const [stats] = await connection.execute(`
      SELECT 
        status,
        COUNT(*) as count
      FROM leaves 
      GROUP BY status
    `);
    if (stats.length === 0) {
      console.log('No statistics available.');
    } else {
      console.table(stats);
    }

    // Close connection
    await connection.end();
    console.log('\n✅ Database connection closed.');

  } catch (error) {
    console.error('❌ Error connecting to database:', error.message);
    process.exit(1);
  }
}

// Run the viewer
viewDatabase();
