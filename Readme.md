# Employee Leave Management System

## Overview

This is a full-stack Employee Leave Management System built with React, Express, and MySQL. The application allows employees to submit leave requests and provides an admin interface for managing and approving/rejecting leave applications. The system features JWT authentication, server-side pagination, and a modern Material UI interface with comprehensive form validation.

## 🚀 Key Features

- **Secure Authentication**: JWT-based authentication with in-memory token storage
- **Role-Based Access**: Admin and Employee roles with different permissions
- **Server-Side Pagination**: Efficient data loading with pagination controls
- **Form Validation**: Comprehensive validation using Formik + Yup
- **Responsive Design**: Mobile-first design using Material UI v5
- **Real-time Updates**: Optimistic UI updates with React Query

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**:
  - TanStack Query (React Query) for server state management
  - React Context + useReducer for authentication state (no localStorage)
- **UI Components**: Material UI v5 component library
- **Forms**: Formik with Yup validation for all forms
- **Authentication**: In-memory JWT token storage
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for type safety
- **Database**: Raw MySQL queries with mysql2 (no ORM)
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Validation**: Express-validator for comprehensive input validation
- **API Structure**: RESTful API with proper error handling and logging
- **Pagination**: Server-side pagination with query parameters

### Database Architecture
- **Database**: MySQL with raw SQL queries
- **Tables**:
  - `users` - User authentication with email, username, password, and role
  - `leaves` - Leave request storage with user relationships and status tracking
- **Security**: Bcrypt password hashing and parameterized queries
- **Relationships**: Foreign key constraints between users and leaves

## 🚀 Quick Start

### For New Testers/Developers

**📖 [Complete Setup Guide](SETUP.md)** - Detailed instructions for first-time setup

### One-Command Setup
```bash
git clone <repository-url>
cd employee-leave-management-system
cp .env.example .env
# Edit .env with your database credentials
npm run setup
npm run dev
```

### Prerequisites
- Node.js (v16 or higher)
- MySQL Server (v8.0 or higher)
- npm or yarn package manager

### Quick Setup Steps

1. **Clone and Configure**
   ```bash
   git clone <repository-url>
   cd employee-leave-management-system
   cp .env.example .env
   ```

2. **Update Database Credentials**
   Edit `.env` file with your MySQL credentials:
   ```env
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   ```

3. **Install and Seed**
   ```bash
   npm run setup  # Installs dependencies + creates sample users
   ```

4. **Start Application**
   ```bash
   npm run dev
   ```

   Visit: `http://localhost:5000`

### 🔑 Demo Credentials

After running the seed script, you can use these credentials:

**👑 Admin Account:**
- Email: `rajesh.kumar@company.com`
- Password: `admin123`

**👨‍💼 Employee Accounts (All use password: `employee123`):**
- Email: `priya.sharma@company.com`
- Email: `arjun.patel@company.com`
- Email: `kavya.reddy@company.com`
- Email: `vikram.singh@company.com`
- Email: `ananya.gupta@company.com`
- Email: `rohit.verma@company.com`
- Email: `sneha.iyer@company.com`
- Email: `aditya.joshi@company.com`
- Email: `meera.nair@company.com`

### 🚨 Important Notes for New Users

**If you can't login:**
1. Make sure you've run the database seeding: `npm run db:seed`
2. Check your database connection in `.env` file
3. Verify MySQL server is running
4. Try the quick setup: `npm run setup`

## API Endpoints

### Authentication
- `POST /api/login` - User login with email/password
- `POST /api/register` - User registration
- `GET /api/me` - Get current user info (protected)

### Leave Management
- `POST /api/apply-leave` - Submit new leave application (protected)
- `GET /api/leaves` - Get paginated leave records with filtering (protected)
- `GET /api/leaves/:id` - Get specific leave details (protected)
- `PUT /api/leaves/:id/status` - Update leave status (admin only)
- `PUT /api/leaves/:id/approve` - Quick approve leave (admin only)
- `PUT /api/leaves/:id/reject` - Quick reject leave (admin only)

### Query Parameters for Pagination
- `page` - Page number (default: 1)
- `limit` - Records per page (default: 10, max: 100)
- `status` - Filter by status: 'Pending', 'Approved', 'Rejected', or 'all'

## Frontend Components

### Authentication
- **LoginPage**: Secure login with Formik + Yup validation
- **AuthContext**: In-memory authentication state management
- **ProtectedRoute**: Route protection based on authentication status

### Leave Management
- **LeaveForm**: Form component for submitting leave requests
- **LeaveTable**: Paginated data table with filtering and actions
- **AdminPanel**: Administrative interface for managing leave approvals

### UI Components
- **Material UI v5**: Consistent, responsive design system
- **Responsive Layout**: Mobile-first approach with breakpoint handling

## 🔄 Data Flow

### Authentication Flow
1. User submits login credentials via Formik form
2. Frontend validates input using Yup schemas
3. API call to `/api/login` with email/password
4. Backend validates credentials and generates JWT token
5. Token stored in memory (React Context) and added to API headers
6. Protected routes accessible with valid token

### Leave Application Flow
1. Employee fills out leave form with comprehensive validation
2. Form data validated using Formik + Yup schemas
3. Authenticated API call submits data to backend
4. Backend validates input using express-validator
5. Raw MySQL query stores leave request with user relationship
6. Frontend updates via React Query cache invalidation
7. Real-time UI feedback with optimistic updates

### Leave Management Flow (Admin)
1. Admin views paginated leave requests in organized table
2. Server-side pagination with query parameters (page, limit, status)
3. Status updates trigger authenticated API calls
4. Backend validates admin permissions and updates database
5. Raw MySQL queries update leave status with timestamps
6. Real-time UI updates reflect changes across the application

### Data Synchronization
- React Query manages server state and intelligent caching
- Optimistic updates provide immediate UI feedback
- Background refetching ensures data consistency
- In-memory authentication state prevents localStorage security issues

## 📦 Dependencies

### Core Technologies
- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MySQL with mysql2 driver (raw queries)
- **Authentication**: JWT with bcryptjs for password hashing

### Frontend Libraries
- **UI Framework**: Material UI v5 with responsive design
- **Forms**: Formik + Yup for validation and form handling
- **State Management**: TanStack Query + React Context
- **Routing**: Wouter for lightweight client-side routing
- **Date Handling**: date-fns for date manipulation and formatting
- **Icons**: Material UI Icons for consistent iconography

### Backend Libraries
- **Validation**: express-validator for comprehensive input validation
- **Security**: bcryptjs for password hashing, JWT for authentication
- **Database**: mysql2 for MySQL connection and raw queries
- **Development**: tsx for TypeScript execution, cross-env for environment variables

### Development Tools
- **Build Tool**: Vite with fast HMR support
- **Type Checking**: TypeScript across the entire stack
- **Bundling**: ESBuild for optimized production builds

## 🚀 Production Deployment

### Build Process
```bash
npm run build
```
This creates:
- **Frontend**: Optimized static assets in `dist/public`
- **Backend**: Bundled server code in `dist/index.js`

### Production Environment
- **Environment Variables**: Configure production database and JWT secrets
- **Database**: Ensure MySQL server is running and accessible
- **Port**: Application serves on port 5000 by default
- **Security**: Use strong JWT secrets and secure database credentials

### Database Management
- **Connection Pooling**: Optimized MySQL connection pool configuration
- **Schema Management**: Tables created automatically on server start
- **Data Seeding**: Use `npm run db:seed` for initial data setup
- **Security**: Parameterized queries prevent SQL injection

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds for secure password storage
- **Input Validation**: Comprehensive validation on both frontend and backend
- **SQL Injection Prevention**: Parameterized queries with mysql2
- **Role-Based Access**: Admin and employee role separation
- **In-Memory Token Storage**: Prevents XSS attacks via localStorage
- **CORS Protection**: Configured for secure cross-origin requests

## 🧪 Testing

### Manual Testing
1. Start the development server: `npm run dev`
2. Seed the database: `npm run db:seed`
3. Test authentication with provided demo credentials
4. Test leave application flow as employee
5. Test leave management as admin
6. Verify pagination and filtering functionality

### Recommended Test Cases
- [ ] User registration and login
- [ ] Leave application submission with validation
- [ ] Admin leave approval/rejection
- [ ] Pagination with different page sizes
- [ ] Status filtering functionality
- [ ] Responsive design on mobile devices
- [ ] Authentication token expiration handling

## 📝 ElizaLIMS Compliance

This implementation fully meets the ElizaLIMS technical specifications:

✅ **Frontend Requirements**
- Secure login with Formik + Yup validation
- In-memory token storage (no localStorage)
- Server-side pagination with query parameters
- Material UI v5 responsive design
- Formik + Yup for all forms

✅ **Backend Requirements**
- JWT-based authentication with middleware
- Raw MySQL queries (no ORM)
- Express-validator input validation
- Server-side pagination endpoints
- Comprehensive error handling

✅ **Security & Best Practices**
- Production-ready code structure
- Async/await syntax throughout
- Modular route organization
- Proper error handling and logging
