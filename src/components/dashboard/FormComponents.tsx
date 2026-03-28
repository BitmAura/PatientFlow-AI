import React, { ReactNode } from 'react';
import { cn } from '@/lib/design-tokens';

interface FormWrapperProps {
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  className?: string;
  layout?: 'vertical' | 'horizontal';
}

/**
 * FormWrapper Component
 * Consistent form styling and layout
 */
export const FormWrapper: React.FC<FormWrapperProps> = ({
  children,
  onSubmit,
  className = '',
  layout = 'vertical',
}) => {
  const layoutClass = layout === 'vertical' 
    ? 'flex flex-col' 
    : 'grid grid-cols-1 md:grid-cols-2 gap-6';

  return (
    <form
      onSubmit={onSubmit}
      className={cn('space-y-6', layoutClass, className)}
    >
      {children}
    </form>
  );
};

interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  helperText?: string;
  className?: string;
}

/**
 * FormField Component
 * Wrapper for form inputs with label, validation, and helper text
 */
export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required = false,
  children,
  helperText,
  className = '',
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div>
        {children}
      </div>
      
      {error && (
        <p className="text-xs font-medium text-red-500 mt-1">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {helperText}
        </p>
      )}
    </div>
  );
};

interface TextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

/**
 * TextInput Component
 * Standardized text input with validation styling
 */
export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ error = false, className = '', ...props }, ref) => {
    const borderClass = error
      ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
      : 'border-slate-300 dark:border-slate-600';

    return (
      <input
        ref={ref}
        className={cn(
          'w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white',
          'placeholder-slate-400 dark:placeholder-slate-500',
          'focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent',
          'transition-colors duration-200',
          borderClass,
          className
        )}
        {...props}
      />
    );
  }
);

TextInput.displayName = 'TextInput';

interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string | number; label: string }[];
  error?: boolean;
}

/**
 * Select Component
 * Standardized select dropdown
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, error = false, className = '', ...props }, ref) => {
    const borderClass = error
      ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
      : 'border-slate-300 dark:border-slate-600';

    return (
      <select
        ref={ref}
        className={cn(
          'w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white',
          'focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent',
          'transition-colors duration-200',
          borderClass,
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);

Select.displayName = 'Select';

/**
 * Button Component
 * Standardized button with variants
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClass = 
      size === 'sm' ? 'px-3 py-1.5 text-sm' :
      size === 'md' ? 'px-4 py-2 text-base' :
      'px-6 py-3 text-lg';

    const baseStyles = cn(
      'inline-flex items-center justify-center font-medium rounded-md',
      'transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
      sizeClass
    );

    const variantStyles = {
      primary:
        'bg-medical-500 hover:bg-medical-600 text-white focus:ring-medical-500 disabled:opacity-50',
      secondary:
        'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white focus:ring-slate-500 disabled:opacity-50',
      danger:
        'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500 disabled:opacity-50',
      ghost:
        'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white focus:ring-slate-500 disabled:opacity-50',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(baseStyles, variantStyles[variant], className)}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
