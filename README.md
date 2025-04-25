# Tailors Platform

Tailors Platform is a comprehensive web application that connects tailors with customers, allowing for seamless ordering, management, and communication.

## Project Structure

The project consists of three main components:

1. **Tailors-Client** - React frontend application
2. **sewing-platform-backend** - Node.js/Express backend
3. **app/admin** - Next.js admin dashboard

## Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)
- MongoDB (v4.4 or higher)

## Getting Started

### Option 1: Using a Single Command (Recommended)

1. Install project dependencies:
   ```bash
   npm install
   ```

2. Start all components (backend, frontend, and admin dashboard) with a single command:
   ```bash
   npm start
   ```

3. Open your browser and visit:
   - Frontend: http://localhost:3000
   - Admin Dashboard: http://localhost:3001
   - Backend API: http://localhost:5000

### Option 2: Using the Provided Scripts

#### Windows

1. Run the `run-local.bat` file by double-clicking it or executing it in command prompt.
   This will:
   - Set up environment variables
   - Install dependencies for all components
   - Start the backend server, client application, and admin dashboard

#### macOS/Linux

1. First, make the script executable:
   ```bash
   chmod +x run-local.sh
   ```

2. Run the script:
   ```bash
   ./run-local.sh
   ```

### Option 3: Manual Setup

#### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd sewing-platform-backend
   ```

2. Create a `.env` file with the following content:
   ```
   MONGODB_URI=mongodb://localhost:27017/tailors-platform
   PORT=5000
   JWT_SECRET=local-development-secret-key
   FRONTEND_URL=http://localhost:3000
   ```

3. Install dependencies and start the server:
   ```bash
   npm install
   npm run dev
   ```

#### Frontend Client Setup

1. Navigate to the client directory:
   ```bash
   cd Tailors-Client
   ```

2. Install dependencies and start the development server:
   ```bash
   npm install
   npm run dev
   ```

#### Admin Dashboard Setup

1. Navigate to the admin app directory:
   ```bash
   cd app
   ```

2. Install dependencies and start the development server:
   ```bash
   npm install
   npm run dev
   ```

## Accessing the Application

Once all components are running, you can access:

- Frontend Client: http://localhost:3000
- Backend API: http://localhost:5000
- Admin Dashboard: http://localhost:3001 (or the URL shown in the Next.js terminal)

## User Roles

The application supports three main user roles:

1. **Buyer** - Can browse products, place orders, and manage their measurements
2. **Seller** - Can manage inventory, handle orders, and view analytics
3. **Admin** - Has full access to the entire platform, including user management and verification

## Features

- User authentication and authorization
- Product browsing and ordering
- Inventory management for sellers
- Order tracking and management
- Admin dashboard for platform oversight
- Analytics and reporting

## Development Notes

- Frontend is built with React, React Router, and Tailwind CSS
- Backend is built with Express.js and MongoDB
- Admin dashboard is built with Next.js
- All components use TypeScript for better type safety

## License

[ISC License](LICENSE) 