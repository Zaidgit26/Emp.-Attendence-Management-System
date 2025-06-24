# Employee Leave Management System

## Overview

This is a full-stack Employee Leave Management System built with React, Express, and MySQL. The application allows employees to submit leave requests and provides an admin interface for managing and approving/rejecting leave applications. The system features a modern UI built with shadcn/ui components and TailwindCSS, with a robust backend API and MySQL database for data persistence.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: TailwindCSS with custom CSS variables for theming
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for type safety
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: MySQL (localhost connection)
- **Session Management**: Standard session management
- **API Structure**: RESTful API with proper error handling and logging

### Database Architecture
- **Database**: MySQL with Drizzle ORM
- **Tables**: 
  - `users` - User authentication and management
  - `leaves` - Leave request storage with status tracking
- **Schema**: Defined in TypeScript with Drizzle for type safety
- **Migrations**: Managed through Drizzle Kit

## Key Components

### Database Schema
- **Users Table**: Stores user credentials with unique username constraints
- **Leaves Table**: Comprehensive leave management with employee details, dates, reasons, and approval status
- **Validation**: Zod schemas for runtime validation of API inputs

### API Endpoints
- `POST /api/apply-leave` - Submit new leave applications
- `GET /api/leaves` - Retrieve all leave records with optional status filtering
- `GET /api/leaves/:id` - Get specific leave details
- `PUT /api/leaves/:id/status` - Update leave approval status (admin function)

### Frontend Components
- **LeaveForm**: Form component for submitting leave requests
- **LeaveTable**: Data table displaying leave records with filtering
- **AdminPanel**: Administrative interface for managing leave approvals
- **UI Components**: Complete set of reusable UI components from shadcn/ui

## Data Flow

1. **Leave Application Flow**:
   - User fills out leave form with validation
   - Form data is validated using Zod schemas
   - API call submits data to backend
   - Backend validates and stores in MySQL
   - Frontend updates via React Query cache invalidation

2. **Leave Management Flow**:
   - Admin views leave requests in organized table
   - Status updates trigger API calls to backend
   - Database updates leave status with timestamps
   - Real-time UI updates reflect changes

3. **Data Synchronization**:
   - React Query manages server state and caching
   - Optimistic updates provide immediate UI feedback
   - Background refetching ensures data consistency

## External Dependencies

### Database
- **MySQL**: Local MySQL database
- **Connection**: Direct TCP connection to localhost MySQL server

### UI/UX Libraries
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library for consistent iconography
- **date-fns**: Date manipulation and formatting utilities
- **React Hook Form**: Form state management and validation

### Development Tools
- **TypeScript**: Static type checking across the stack
- **Vite**: Fast build tool with HMR support
- **Drizzle Kit**: Database schema management and migrations
- **ESBuild**: Fast JavaScript bundler for production builds

## Deployment Strategy

### Development Environment
- **Local Development**: `npm run dev` starts both frontend and backend
- **Hot Reload**: Vite provides fast HMR for frontend development
- **Database**: Drizzle handles schema synchronization with `npm run db:push`

### Production Deployment
- **Build Process**: 
  - Frontend: Vite builds optimized static assets
  - Backend: ESBuild bundles server code for Node.js
- **Deployment Target**: Replit autoscale deployment
- **Environment**: Production environment variables for database connection
- **Port Configuration**: Express serves on port 5000, mapped to external port 80

### Database Management
- **Schema Evolution**: Drizzle migrations handle database schema changes
- **Connection Management**: MySQL connection with environment-based configuration
- **Environment Variables**: Secure database credentials configuration

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- June 24, 2025. Initial setup