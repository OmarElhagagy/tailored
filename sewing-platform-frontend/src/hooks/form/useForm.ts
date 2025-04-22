import { useState, ChangeEvent, FormEvent } from 'react';

export type ValidationRules<T> = {
  [K in keyof T]?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    isEmail?: boolean;
    isNumber?: boolean;
    min?: number;
    max?: number;
    custom?: (value: T[K]) => boolean;
    message?: string;
  };
};

export type FormErrors<T> = {
  [K in keyof T]?: string;
};

/**
 * Custom hook for form handling with validation
 */
export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validationRules?: ValidationRules<T>,
  onSubmit?: (values: T) => void | Promise<void>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);

  // Handle field change
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle different input types
    const processedValue = type === 'number' ? parseFloat(value) : value;
    
    setValues(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate field if validation rules exist
    if (validationRules && validationRules[name as keyof T]) {
      const fieldError = validateField(name as keyof T, processedValue);
      setErrors(prev => ({
        ...prev,
        [name]: fieldError
      }));
    }
  };
  
  // Handle checkbox change
  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    setValues(prev => ({
      ...prev,
      [name]: checked
    }));
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };
  
  // Reset form
  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({} as Record<keyof T, boolean>);
    setIsSubmitting(false);
  };
  
  // Validate single field
  const validateField = (fieldName: keyof T, value: any): string | undefined => {
    if (!validationRules || !validationRules[fieldName]) return undefined;
    
    const rules = validationRules[fieldName]!;
    
    // Required validation
    if (rules.required && (value === undefined || value === null || value === '')) {
      return rules.message || `${String(fieldName)} is required`;
    }
    
    // Skip other validations if field is empty and not required
    if (value === undefined || value === null || value === '') return undefined;
    
    // String validations
    if (typeof value === 'string') {
      // Min length
      if (rules.minLength && value.length < rules.minLength) {
        return rules.message || `Minimum length is ${rules.minLength} characters`;
      }
      
      // Max length
      if (rules.maxLength && value.length > rules.maxLength) {
        return rules.message || `Maximum length is ${rules.maxLength} characters`;
      }
      
      // Pattern
      if (rules.pattern && !rules.pattern.test(value)) {
        return rules.message || `Invalid format`;
      }
      
      // Email
      if (rules.isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return rules.message || `Invalid email address`;
      }
    }
    
    // Number validations
    if (rules.isNumber && isNaN(Number(value))) {
      return rules.message || `Must be a number`;
    }
    
    if (typeof value === 'number' || !isNaN(Number(value))) {
      const numValue = typeof value === 'number' ? value : Number(value);
      
      // Min value
      if (rules.min !== undefined && numValue < rules.min) {
        return rules.message || `Minimum value is ${rules.min}`;
      }
      
      // Max value
      if (rules.max !== undefined && numValue > rules.max) {
        return rules.message || `Maximum value is ${rules.max}`;
      }
    }
    
    // Custom validation
    if (rules.custom && !rules.custom(value)) {
      return rules.message || `Invalid value`;
    }
    
    return undefined;
  };
  
  // Validate all fields
  const validateForm = (): boolean => {
    if (!validationRules) return true;
    
    const newErrors: FormErrors<T> = {};
    let isValid = true;
    
    // Validate each field
    for (const fieldName in validationRules) {
      if (Object.prototype.hasOwnProperty.call(validationRules, fieldName)) {
        const error = validateField(fieldName as keyof T, values[fieldName as keyof T]);
        if (error) {
          newErrors[fieldName as keyof T] = error;
          isValid = false;
        }
      }
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Touch all fields
    const allTouched = Object.keys(initialValues).reduce((acc, key) => {
      acc[key as keyof T] = true;
      return acc;
    }, {} as Record<keyof T, boolean>);
    
    setTouched(allTouched);
    
    // Validate form
    const isValid = validateForm();
    
    if (isValid && onSubmit) {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }
    
    setIsSubmitting(false);
  };
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleCheckboxChange,
    handleSubmit,
    resetForm,
    setValues,
    validateForm,
    setErrors
  };
} 