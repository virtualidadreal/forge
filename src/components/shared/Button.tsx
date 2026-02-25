import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring',
  secondary:
    'bg-secondary text-secondary-foreground border border-border hover:bg-muted active:scale-[0.98]',
  ghost:
    'text-muted-foreground hover:bg-secondary hover:text-foreground',
  destructive:
    'bg-destructive text-destructive-foreground hover:opacity-90 active:scale-[0.98]',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-sm gap-2',
};

const radiusClasses: Record<ButtonVariant, string> = {
  primary: 'rounded-lg',
  secondary: 'rounded-lg',
  ghost: 'rounded-md',
  destructive: 'rounded-lg',
};

const durationClasses: Record<ButtonVariant, string> = {
  primary: 'duration-[150ms]',
  secondary: 'duration-[150ms]',
  ghost: 'duration-[100ms]',
  destructive: 'duration-[150ms]',
};

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      children,
      className = '',
      disabled,
      ...rest
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center font-sans font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${radiusClasses[variant]} ${durationClasses[variant]} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        disabled={disabled || loading}
        {...rest}
      >
        {loading ? <Spinner /> : icon ? icon : null}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
