import React, { ReactNode } from 'react';
import ErrorBoundary from '../common/ErrorBoundary';
import ToastProvider from '../common/ToastProvider';

interface AppLayoutProps {
  children: ReactNode;
}

/**
 * Application layout component with error boundary and toast provider
 */
const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
          {/* Content area */}
          <main className="flex-grow">
            {children}
          </main>
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default AppLayout; 