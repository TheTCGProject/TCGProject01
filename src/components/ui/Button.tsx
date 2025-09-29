import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

/**
 * Button component props interface
 * Extends native button attributes with modern styling options
 */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'link' | 'destructive';
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Loading state - shows spinner and disables interaction */
  isLoading?: boolean;
  /** Icon to display on the left side */
  leftIcon?: React.ReactNode;
  /** Icon to display on the right side */
  rightIcon?: React.ReactNode;
  /** Component to render as (for polymorphic behavior) */
  as?: React.ElementType;
  /** Navigation target (when used with Link components) */
  to?: string;
}

/**
 * Modern Button component with refined styling and micro-interactions
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false, 
    disabled, 
    leftIcon, 
    rightIcon, 
    children, 
    as: Component = 'button',
    ...props 
  }, ref) => {
    
    // Base styles with modern design principles
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden group";
    
    // Modern variant styling with subtle gradients and refined colors
    const variants = {
      primary: "bg-gradient-to-r from-secondary-600 to-secondary-700 text-white shadow-md hover:shadow-lg hover:from-secondary-700 hover:to-secondary-800 focus-visible:ring-secondary-500 active:scale-[0.98]",
      secondary: "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md focus-visible:ring-gray-500 active:scale-[0.98]",
      accent: "bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-md hover:shadow-lg hover:from-accent-600 hover:to-accent-700 focus-visible:ring-accent-500 active:scale-[0.98]",
      outline: "border border-gray-300 dark:border-gray-600 bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 focus-visible:ring-gray-500 active:scale-[0.98]",
      ghost: "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:ring-gray-500 active:scale-[0.98]",
      link: "bg-transparent underline-offset-4 hover:underline text-secondary-600 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300 focus-visible:ring-secondary-500",
      destructive: "bg-gradient-to-r from-error-600 to-error-700 text-white shadow-md hover:shadow-lg hover:from-error-700 hover:to-error-800 focus-visible:ring-error-500 active:scale-[0.98]",
    };
    
    // Modern size variants with better proportions
    const sizes = {
      xs: "h-7 px-2.5 text-xs gap-1.5",
      sm: "h-8 px-3 text-sm gap-2",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-11 px-6 text-base gap-2.5",
      xl: "h-12 px-8 text-base gap-3",
    };
    
    return (
      <Component
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          isLoading && "opacity-70 pointer-events-none",
          className
        )}
        disabled={isLoading || disabled}
        ref={ref}
        {...props}
      >
        {/* Subtle shine effect for primary buttons */}
        {(variant === 'primary' || variant === 'accent' || variant === 'destructive') && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        )}
        
        {/* Loading spinner takes precedence over left icon */}
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : leftIcon ? (
          <span className="flex-shrink-0">{leftIcon}</span>
        ) : null}
        
        {children && <span className="truncate">{children}</span>}
        
        {/* Right icon only shows when not loading */}
        {rightIcon && !isLoading && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </Component>
    );
  }
);

Button.displayName = "Button";

export default Button;