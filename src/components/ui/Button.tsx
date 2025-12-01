import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: 'btn btn-primary',
  secondary: 'btn btn-secondary',
  ghost: 'btn bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-neutral-500',
  danger: 'btn bg-error-600 text-white hover:bg-error-700 focus:ring-error-500'
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  loading,
  iconLeft,
  iconRight,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const isDisabled = disabled || loading;
  return (
    <button
      className={`${variantClasses[variant]} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {iconLeft && <span className="mr-2">{iconLeft}</span>}
      <span className="inline-flex items-center gap-2">
        {children}
        {loading && <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
      </span>
      {iconRight && <span className="ml-2">{iconRight}</span>}
    </button>
  );
};

export default Button;

