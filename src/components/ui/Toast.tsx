import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Award } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Toast types for different notification styles
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'achievement';

/**
 * Individual toast message interface
 */
interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Toast context interface
 */
interface ToastContextType {
  showToast: (message: string, type?: ToastType, options?: Partial<Pick<Toast, 'duration' | 'action'>>) => void;
  removeToast: (id: string) => void;
}

/**
 * Toast context
 */
const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Hook to use toast notifications
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

/**
 * Individual Toast component with CSS animations
 */
const ToastComponent: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ 
  toast, 
  onRemove 
}) => {
  const { id, message, type, action } = toast;

  // Auto-remove toast after duration
  useEffect(() => {
    const duration = toast.duration || 4000;
    const timer = setTimeout(() => {
      onRemove(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, toast.duration, onRemove]);

  // Get icon and styling based on type
  const getToastConfig = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          className: 'bg-success-50 border-success-200 text-success-800 dark:bg-success-900/20 dark:border-success-800 dark:text-success-200',
          iconClassName: 'text-success-500 dark:text-success-400'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          className: 'bg-error-50 border-error-200 text-error-800 dark:bg-error-900/20 dark:border-error-800 dark:text-error-200',
          iconClassName: 'text-error-500 dark:text-error-400'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          className: 'bg-warning-50 border-warning-200 text-warning-800 dark:bg-warning-900/20 dark:border-warning-800 dark:text-warning-200',
          iconClassName: 'text-warning-500 dark:text-warning-400'
        };
      case 'info':
        return {
          icon: <Info className="w-5 h-5" />,
          className: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
          iconClassName: 'text-blue-500 dark:text-blue-400'
        };
      case 'achievement':
        return {
          icon: <Award className="w-6 h-6" />,
          className: 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white border-none shadow-xl animate-bounce-subtle',
          iconClassName: 'text-white'
        };
      default:
        return {
          icon: <Info className="w-5 h-5" />,
          className: 'bg-slate-50 border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200',
          iconClassName: 'text-slate-500 dark:text-slate-400'
        };
    }
  };

  const config = getToastConfig(type);

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm max-w-md w-full',
        'animate-slide-up opacity-0 animate-fade-in',
        config.className
      )}
      style={{ 
        animation: 'slideUp 0.3s ease-out forwards, fadeIn 0.3s ease-out forwards'
      }}
    >
      {/* Icon */}
      <div className={cn('flex-shrink-0 mt-0.5', config.iconClassName)}>
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-relaxed">
          {message}
        </p>
        
        {/* Action button */}
        {action && (
          <button
            onClick={action.onClick}
            className="mt-2 text-xs font-semibold underline hover:no-underline transition-all"
          >
            {action.label}
          </button>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={() => onRemove(id)}
        className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4 opacity-60 hover:opacity-100 transition-opacity" />
      </button>

      {/* Progress bar */}
      <div
        className={cn(
          "absolute bottom-0 left-0 h-1 rounded-b-xl animate-progress",
          type === 'achievement' ? 'bg-white opacity-50' : 'bg-current opacity-20'
        )}
        style={{ 
          animation: `progress ${(toast.duration || 4000) / 1000}s linear forwards`
        }}
      />
    </div>
  );
};

/**
 * Toast container component
 */
const ToastContainer: React.FC<{ toasts: Toast[]; onRemove: (id: string) => void }> = ({ 
  toasts, 
  onRemove 
}) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastComponent toast={toast} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
};

/**
 * Toast Provider component
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  /**
   * Show a new toast notification
   */
  const showToast = useCallback((
    message: string, 
    type: ToastType = 'info', 
    options?: Partial<Pick<Toast, 'duration' | 'action'>>
  ) => {
    const id = crypto.randomUUID();
    const newToast: Toast = {
      id,
      message,
      type,
      duration: options?.duration || 4000,
      action: options?.action,
    };

    setToasts(prev => [...prev, newToast]);
  }, []);

  /**
   * Remove a toast notification
   */
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const contextValue: ToastContextType = {
    showToast,
    removeToast,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export default ToastProvider;