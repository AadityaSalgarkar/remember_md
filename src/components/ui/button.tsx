import * as React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "secondary", size = "md", children, ...props }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-mono text-sm tracking-wide uppercase
      rounded-sm
      transition-all duration-200 ease-out
      disabled:opacity-40 disabled:cursor-not-allowed
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
    `;

    const variants = {
      primary: `
        bg-[hsl(var(--accent))] text-white
        hover:bg-[hsl(12_76%_55%)] active:bg-[hsl(12_76%_50%)]
        focus-visible:ring-[hsl(var(--accent))]
        shadow-sm hover:shadow
      `,
      secondary: `
        bg-transparent text-[hsl(var(--foreground))]
        border border-[hsl(var(--border))]
        hover:bg-[hsl(var(--muted))] hover:border-[hsl(var(--ink-faint))]
        active:bg-[hsl(var(--cream-dark))]
        focus-visible:ring-[hsl(var(--ink-faint))]
      `,
      ghost: `
        bg-transparent text-[hsl(var(--muted-foreground))]
        hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]
        active:bg-[hsl(var(--cream-dark))]
        focus-visible:ring-[hsl(var(--ink-faint))]
      `,
      danger: `
        bg-transparent text-[hsl(var(--accent))]
        border border-[hsl(var(--accent-muted))]
        hover:bg-[hsl(var(--accent))] hover:text-white hover:border-[hsl(var(--accent))]
        active:bg-[hsl(12_76%_50%)]
        focus-visible:ring-[hsl(var(--accent))]
      `,
    };

    const sizes = {
      sm: "h-7 px-2.5 text-xs",
      md: "h-9 px-4",
      lg: "h-11 px-6 text-base",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
