# Sewing Platform Frontend

This is the frontend application for the Tailors sewing platform, a web application for tailors and customers to manage orders, inventory, and appointments.

## Architecture Overview

The frontend is built with:

- **Next.js**: React framework with built-in routing and server-side rendering
- **TypeScript**: For type safety and better developer experience
- **Tailwind CSS**: For styling components
- **Zustand**: For state management

## Directory Structure

```
sewing-platform-frontend/
├── app/                  # Next.js app router pages
├── components/           # Legacy components folder (being migrated)
├── public/               # Static assets
├── src/                  # Source code
│   ├── api/              # API client and services
│   │   ├── services/     # API service modules
│   │   └── types.ts      # API type definitions
│   ├── components/       # React components
│   │   ├── auth/         # Authentication components
│   │   ├── common/       # Common/shared components
│   │   ├── inventory/    # Inventory related components
│   │   ├── layout/       # Layout components
│   │   └── ui/           # UI components (buttons, inputs, etc.)
│   ├── hooks/            # Custom React hooks
│   │   └── form/         # Form related hooks
│   ├── store/            # Zustand stores
│   └── utils/            # Utility functions
```

## Key Improvements

### 1. Component Organization

- Reorganized components into a logical structure
- Created a proper UI component library with individual files
- Added common components for error handling and notifications

### 2. State Management

- Implemented Zustand stores for auth and inventory
- Created type-safe stores with action methods
- Added persistence for relevant state

### 3. API Layer

- Built a robust API client with axios
- Added request/response interceptors
- Implemented token refresh mechanisms
- Created typed API services

### 4. Form Handling

- Added a custom form hook with validation
- Created typed validation rules
- Added support for various input types

### 5. Error Handling

- Added an ErrorBoundary component
- Created utility functions for error formatting
- Implemented toast notifications for errors

### 6. Type Safety

- Added comprehensive TypeScript interfaces
- Created shared type definitions
- Ensured type safety across components

## Getting Started

1. **Install dependencies**

```bash
npm install
```

2. **Run the development server**

```bash
npm run dev
```

3. **Build for production**

```bash
npm run build
```

## Development Guidelines

1. **Component Creation**
   - Place new components in the appropriate directory
   - Use TypeScript for all components
   - Export from index files when appropriate

2. **State Management**
   - Use Zustand stores for global state
   - Use React state for component-level state
   - Keep state close to where it's used

3. **API Calls**
   - Use the API services for all backend communication
   - Handle errors consistently with errorHandler utilities
   - Use loading states appropriately

4. **Styling**
   - Use Tailwind CSS for styling
   - Follow the design system (colors, spacing, etc.)
   - Ensure responsive design 