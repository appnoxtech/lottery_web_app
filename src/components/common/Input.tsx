import React, { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  isPassword?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, icon, isPassword = false, className = "", ...props },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">{icon}</span>
            </div>
          )}
          <input
            ref={ref}
            type={isPassword && !showPassword ? "password" : "text"}
            className={`
              w-full px-3 py-3 border rounded-lg shadow-sm 
              focus:outline-none focus:ring-2 focus:ring-[#EDB726] focus:border-[#EDB726]
              bg-[#1D1F27] text-white placeholder-gray-400
              ${icon ? "pl-10" : ""}
              ${isPassword ? "pr-10" : ""}
              ${
                error
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-600"
              }
              ${className}
            `}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <Eye className="h-5 w-5 text-gray-400" />
              ) : (
                <EyeOff className="h-5 w-5 text-gray-400" />
              )}
            </button>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
