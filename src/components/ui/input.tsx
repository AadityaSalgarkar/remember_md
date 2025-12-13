import * as React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`
          w-full h-10 px-3 py-2
          bg-[hsl(var(--background))]
          border border-[hsl(var(--border))]
          rounded-sm
          font-mono text-sm
          text-[hsl(var(--foreground))]
          placeholder:text-[hsl(var(--ink-faint))]
          transition-all duration-200
          hover:border-[hsl(var(--ink-faint))]
          focus:outline-none focus:border-[hsl(var(--accent))]
          focus:ring-2 focus:ring-[hsl(var(--accent)_/_0.15)]
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
