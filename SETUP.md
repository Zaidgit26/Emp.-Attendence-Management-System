# 🚀 Employee Leave Management System - Setup Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MySQL Server** (v8.0 or higher) - [Download here](https://dev.mysql.com/downloads/)
- **Git** - [Download here](https://git-scm.com/)

## 🔧 Quick Setup (Recommended)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd employee-leave-management-system
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your database credentials
# Update the following values:
# DB_USER=your_mysql_username
# DB_PASSWORD=your_mysql_password
```

### 3. One-Command Setup
```bash
npm run setup
```
This command will:
- Install all dependencies
- Create database tables automatically
- Seed the database with sample users
- Display login credentials

### 4. Start the Application
```bash
npm run dev
```

Visit: `http://localhost:5000`

## 🔑 Login Credentials

After running the setup, use these credentials:

### 👑 Admin Account
- **Email**: `rajesh.kumar@company.com`
- **Password**: `admin123`

### 👨‍💼 Employee Accounts (Password: `employee123`)
- `priya.sharma@company.com`
- `arjun.patel@company.com`
- `kavya.reddy@company.com`
- `vikram.singh@company.com`
- `ananya.gupta@company.com`
- `rohit.verma@company.com`
- `sneha.iyer@company.com`
- `aditya.joshi@company.com`
- `meera.nair@company.com`

## 🛠️ Manual Setup (Alternative)

If you prefer step-by-step setup:

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE employee_leave_management_system;
exit;
```

### 3. Configure Environment
Edit `.env` file with your database credentials.

### 4. Start Server (Creates Tables)
```bash
npm run dev
```

### 5. Seed Database (In New Terminal)
```bash
npm run db:seed
```

## 🔍 Troubleshooting

### ❌ "Can't Login" Issues

**Problem**: No users in database
**Solution**: 
```bash
npm run db:seed
```

**Problem**: Database connection error
**Solution**: 
1. Check MySQL server is running
2. Verify credentials in `.env` file
3. Ensure database exists

### ❌ "Database Not Found" Error

**Solution**: Create the database manually
```bash
mysql -u root -p
CREATE DATABASE employee_leave_management_system;
exit;
```

### ❌ "Port Already in Use" Error

**Solution**: Change port in `.env` file
```env
PORT=3000
```

## 📊 Database Management

### View Database Contents
```bash
npm run db:view
```

### Reset Database
```bash
# Delete all data and reseed
mysql -u root -p
DROP DATABASE employee_leave_management_system;
CREATE DATABASE employee_leave_management_system;
exit;

npm run db:seed
```

## 🎯 Testing the Application

### 1. Login as Admin
- Use admin credentials to access admin panel
- Approve/reject leave requests
- View statistics

### 2. Login as Employee
- Submit leave applications
- View your leave history
- Edit pending requests

### 3. Test Features
- ✅ Form validation
- ✅ Server-side pagination
- ✅ Real-time updates
- ✅ Responsive design
- ✅ Role-based access

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run setup        # Quick setup (install + seed)
npm run db:seed      # Seed database with sample data
npm run db:view      # View database contents
npm run check        # TypeScript type checking
```

## 🔒 Security Notes

- Change `JWT_SECRET` in production
- Use strong database passwords
- Don't commit `.env` file to version control
- Tokens expire in 24 hours by default

## 📞 Support

If you encounter any issues:
1. Check this setup guide
2. Verify all prerequisites are installed
3. Ensure database is running and accessible
4. Try the troubleshooting steps above

## 🎉 Success!

If everything is working correctly, you should see:
- Login page at `http://localhost:5000`
- Ability to login with provided credentials
- Functional admin panel and employee dashboard
- Sample leave data in the system

Happy testing! 🚀
