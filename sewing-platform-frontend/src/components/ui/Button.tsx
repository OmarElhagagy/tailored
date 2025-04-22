import React from 'react';

export interface ButtonProps {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  onClick,
  className = '',
  disabled = false,
  fullWidth = false
}) => {
  const baseClasses = 'inline-flex justify-center items-center font-medium rounded-lg transition-colors duration-200';
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white',
    outline: 'bg-transparent hover:bg-gray-100 text-blue-600 border border-blue-600 dark:hover:bg-gray-800 dark:text-blue-400 dark:border-blue-400',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  };
  
  const sizeClasses = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-2.5'
  };
  
  const disabledClasses = disabled ? 'opacity-60 cursor-not-allowed' : '';
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${widthClass} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button; 