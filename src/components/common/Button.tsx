import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed btn-hover';
  
  const variantClasses = {
    primary: 'bg-[#EDB726] text-[#1D1F27] hover:bg-[#d4a422] focus:ring-[#EDB726] font-semibold',
    secondary: 'bg-[#2A2D36] text-white hover:bg-[#3A3D46] focus:ring-[#EDB726] border border-gray-600',
    outline: 'border border-gray-600 bg-transparent text-gray-300 hover:bg-[#2A2D36] hover:text-white focus:ring-[#EDB726]'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
      )}
      {children}
    </button>
  );
};

export default Button;
