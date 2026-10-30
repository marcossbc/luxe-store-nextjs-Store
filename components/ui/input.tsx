"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, icon, iconRight, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const autoId = React.useId();
    const id = props.id ?? autoId;
    const errId = `${id}-error`;
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-foreground">
            {label}
            {props.required && <span className="text-destructive ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <input
            type={inputType}
            className={cn(
              "flex h-11 w-full rounded-xl border border-input bg-background px-4 text-sm ring-offset-background transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              icon && "pl-10",
              (iconRight || isPassword) && "pr-10",
              error && "border-destructive focus-visible:ring-destructive",
              className
            )}
            ref={ref}
            {...props}
            id={id}
            aria-invalid={error ? true : props["aria-invalid"]}
            aria-describedby={error ? errId : props["aria-describedby"]}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
        {error && <p id={errId} role="alert" className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
