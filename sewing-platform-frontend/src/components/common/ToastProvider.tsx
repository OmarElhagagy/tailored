import React, { createContext, useContext, useState, ReactNode } from 'react';
import Toast, { ToastType } from './Toast';

// Interface for toast item
interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

// Interface for toast context
interface ToastContextValue {
  /**
   * Add a new toast notification
   * @param type Toast type (success, error, info, warning)
   * @param message Toast message
   * @param duration Duration in milliseconds
   */
  showToast: (type: ToastType, message: string, duration?: number) => void;
  
  /**
   * Show a success toast
   * @param message Toast message
   * @param duration Duration in milliseconds
   */
  showSuccess: (message: string, duration?: number) => void;
  
  /**
   * Show an error toast
   * @param message Toast message
   * @param duration Duration in milliseconds
   */
  showError: (message: string, duration?: number) => void;
  
  /**
   * Show an info toast
   * @param message Toast message
   * @param duration Duration in milliseconds
   */
  showInfo: (message: string, duration?: number) => void;
  
  /**
   * Show a warning toast
   * @param message Toast message
   * @param duration Duration in milliseconds
   */
  showWarning: (message: string, duration?: number) => void;
  
  /**
   * Clear all toasts
   */
  clearToasts: () => void;
}

// Create context
const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// Toast provider props
interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
}

/**
 * Toast provider component for showing notifications
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({ 
  children, 
  maxToasts = 5 
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  /**
   * Show a toast notification
   */
  const showToast = (type: ToastType, message: string, duration = 5000) => {
    // Generate unique ID for this toast
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Add toast to list
    setToasts(prev => {
      // If we have reached maxToasts, remove the oldest one
      const newToasts = [...prev, { id, type, message, duration }];
      return newToasts.slice(Math.max(0, newToasts.length - maxToasts));
    });
  };

  /**
   * Show a success toast
   */
  const showSuccess = (message: string, duration?: number) => {
    showToast('success', message, duration);
  };

  /**
   * Show an error toast
   */
  const showError = (message: string, duration?: number) => {
    showToast('error', message, duration);
  };

  /**
   * Show an info toast
   */
  const showInfo = (message: string, duration?: number) => {
    showToast('info', message, duration);
  };

  /**
   * Show a warning toast
   */
  const showWarning = (message: string, duration?: number) => {
    showToast('warning', message, duration);
  };

  /**
   * Remove a toast by ID
   */
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  /**
   * Clear all toasts
   */
  const clearToasts = () => {
    setToasts([]);
  };

  // Create context value
  const contextValue: ToastContextValue = {
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    clearToasts
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-50 w-full max-w-md space-y-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              id={toast.id}
              type={toast.type}
              message={toast.message}
              duration={toast.duration}
              onClose={removeToast}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

/**
 * Hook for using toast notifications
 */
export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
};

export default ToastProvider; 