import React, { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

/**
 * Icon component based on toast type
 */
const ToastIcon: React.FC<{ type: ToastType }> = ({ type }) => {
  switch (type) {
    case 'success':
      return (
        <svg className="w-5 h-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    case 'error':
      return (
        <svg className="w-5 h-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      );
    case 'warning':
      return (
        <svg className="w-5 h-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    case 'info':
    default:
      return (
        <svg className="w-5 h-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      );
  }
};

/**
 * Toast component for displaying notifications
 */
const Toast: React.FC<ToastProps> = ({ id, type, message, duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Get background color based on toast type
  const getBgColor = () => {
    switch (type) {
      case 'success': return 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800';
      case 'error': return 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800';
      case 'warning': return 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800';
      case 'info': default: return 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800';
    }
  };

  // Start progress timer when component mounts
  useEffect(() => {
    const totalSteps = 100;
    const intervalTime = duration / totalSteps;
    
    // Create interval to update progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          clearInterval(interval);
          // Animate out when progress is complete
          setIsVisible(false);
          return 0;
        }
        return prev - 1;
      });
    }, intervalTime);
    
    setIntervalId(interval);
    
    // Cleanup interval on unmount
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [duration]);

  // Handle close button click
  const handleClose = () => {
    // Clear interval
    if (intervalId) clearInterval(intervalId);
    
    // Animate out
    setIsVisible(false);
    // Wait for animation to complete before removing
    setTimeout(() => onClose(id), 300);
  };

  // Handle animation end (when toast is hidden)
  const handleAnimationEnd = () => {
    if (!isVisible) {
      onClose(id);
    }
  };

  // Get progress bar color based on toast type
  const getProgressColor = () => {
    switch (type) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      case 'info': default: return 'bg-blue-500';
    }
  };

  return (
    <div 
      className={`relative overflow-hidden flex items-start p-4 mb-4 border rounded-lg shadow-md w-full max-w-md transition-all duration-300 ${getBgColor()} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
      onAnimationEnd={handleAnimationEnd}
    >
      {/* Toast content */}
      <div className="flex-shrink-0 mr-3">
        <ToastIcon type={type} />
      </div>
      <div className="flex-1 pr-6">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{message}</p>
      </div>
      
      {/* Close button */}
      <button 
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
        onClick={handleClose}
      >
        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 h-1 w-full bg-gray-200 dark:bg-gray-700">
        <div 
          className={`h-full ${getProgressColor()}`} 
          style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}
        />
      </div>
    </div>
  );
};

export default Toast; 