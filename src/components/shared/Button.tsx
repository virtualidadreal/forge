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
  primary: 'bg-foreground text-background border border-foreground hover:bg-transparent hover:text-foreground',
  secondary:
    'bg-transparent text-foreground border border-foreground/30 hover:bg-foreground hover:text-background',
  ghost: 'text-muted-foreground hover:bg-secondary hover:text-foreground border-transparent',
  destructive:
    'bg-destructive text-destructive-foreground border border-destructive hover:opacity-90',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-6 py-2 text-[10px] gap-1.5',
  md: 'px-8 py-3 text-xs gap-2',
  lg: 'px-10 py-4 text-sm gap-3',
};

const baseClasses =
  'inline-flex items-center justify-center font-medium tracking-[0.2em] uppercase transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 rounded-full';

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
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
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
