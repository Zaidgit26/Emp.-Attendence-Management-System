import dotenv from "dotenv";
dotenv.config();

import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "root1",
  password: process.env.DB_PASSWORD || "2002",
  database: process.env.DB_NAME || "employee_leave_management_system",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function seedDatabase() {
  try {
    console.log('Starting database seeding with Indian user names...');

    // Check if admin user already exists
    const [existingAdmin] = await db.execute('SELECT * FROM users WHERE username = ? OR email = ?', ['rajesh_kumar', 'rajesh.kumar@company.com']);

    if (existingAdmin.length === 0) {
      // Create admin user with Indian name
      const adminPassword = await bcrypt.hash('admin123', 10);
      await db.execute(`
        INSERT INTO users (username, email, password, role)
        VALUES (?, ?, ?, ?)
      `, ['rajesh_kumar', 'rajesh.kumar@company.com', adminPassword, 'admin']);
      console.log('✅ Created admin user: rajesh_kumar');
    } else {
      console.log('ℹ️  Admin user already exists: rajesh_kumar');
    }

    // Create 9 employee users with authentic Indian names
    const employeePassword = await bcrypt.hash('employee123', 10);
    
    const employees = [
      ['priya_sharma', 'priya.sharma@company.com', employeePassword, 'employee'],
      ['arjun_patel', 'arjun.patel@company.com', employeePassword, 'employee'],
      ['kavya_reddy', 'kavya.reddy@company.com', employeePassword, 'employee'],
      ['vikram_singh', 'vikram.singh@company.com', employeePassword, 'employee'],
      ['ananya_gupta', 'ananya.gupta@company.com', employeePassword, 'employee'],
      ['rohit_verma', 'rohit.verma@company.com', employeePassword, 'employee'],
      ['sneha_iyer', 'sneha.iyer@company.com', employeePassword, 'employee'],
      ['aditya_joshi', 'aditya.joshi@company.com', employeePassword, 'employee'],
      ['meera_nair', 'meera.nair@company.com', employeePassword, 'employee']
    ];

    console.log('Creating employee users...');
    for (const employee of employees) {
      const [existingEmployee] = await db.execute('SELECT * FROM users WHERE username = ? OR email = ?', [employee[0], employee[1]]);

      if (existingEmployee.length === 0) {
        await db.execute(`
          INSERT INTO users (username, email, password, role)
          VALUES (?, ?, ?, ?)
        `, employee);
        console.log(`✅ Created employee: ${employee[0]}`);
      } else {
        console.log(`ℹ️  Employee already exists: ${employee[0]}`);
      }
    }

    // Get user IDs for creating sample leaves with Indian names
    const [users] = await db.execute('SELECT id, username FROM users WHERE role = "employee"');

    if (users.length > 0) {
      console.log('Creating sample leave requests...');
      
      // Create sample leave requests with Indian employee names
      const leaveTypes = ['Annual', 'Sick', 'Personal', 'Emergency', 'Maternity'];
      const statuses = ['Pending', 'Approved', 'Rejected'];
      
      const sampleLeaves = [
        [users[0]?.id, 'Priya Sharma', 'Annual', '2024-07-15', '2024-07-19', 'Family wedding celebration in hometown', 'Approved'],
        [users[1]?.id, 'Arjun Patel', 'Sick', '2024-06-20', '2024-06-22', 'Fever and cold symptoms, doctor advised rest', 'Approved'],
        [users[2]?.id, 'Kavya Reddy', 'Personal', '2024-08-01', '2024-08-03', 'House shifting and relocation work', 'Pending'],
        [users[3]?.id, 'Vikram Singh', 'Emergency', '2024-06-10', '2024-06-11', 'Family emergency - father hospitalized', 'Rejected'],
        [users[4]?.id, 'Ananya Gupta', 'Annual', '2024-09-15', '2024-09-25', 'Vacation to Goa with family', 'Pending'],
        [users[5]?.id, 'Rohit Verma', 'Sick', '2024-05-15', '2024-05-16', 'Medical checkup and treatment', 'Approved'],
        [users[6]?.id, 'Sneha Iyer', 'Personal', '2024-07-01', '2024-07-05', 'Sister\'s wedding preparations', 'Pending'],
        [users[7]?.id, 'Aditya Joshi', 'Annual', '2024-08-20', '2024-08-30', 'Trip to Kerala backwaters', 'Approved'],
        [users[8]?.id, 'Meera Nair', 'Maternity', '2024-09-01', '2024-12-01', 'Maternity leave for childbirth', 'Pending']
      ];

      for (const leave of sampleLeaves) {
        if (leave[0]) { // Check if user ID exists
          await db.execute(`
            INSERT INTO leaves (user_id, employee_name, leave_type, from_date, to_date, reason, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, leave);
        }
      }
      console.log('✅ Created sample leave requests');
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n👥 Sample Users Created:');
    console.log('📋 Admin User:');
    console.log('   Email: rajesh.kumar@company.com');
    console.log('   Password: admin123');
    console.log('\n👨‍💼 Employee Users (Password: employee123):');
    console.log('   📧 priya.sharma@company.com');
    console.log('   📧 arjun.patel@company.com');
    console.log('   📧 kavya.reddy@company.com');
    console.log('   📧 vikram.singh@company.com');
    console.log('   📧 ananya.gupta@company.com');
    console.log('   📧 rohit.verma@company.com');
    console.log('   📧 sneha.iyer@company.com');
    console.log('   📧 aditya.joshi@company.com');
    console.log('   📧 meera.nair@company.com');
    console.log('\n🚀 You can now run: npm run dev');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await db.end();
  }
}

seedDatabase();
