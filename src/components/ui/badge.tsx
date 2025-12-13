import * as React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "due" | "upcoming" | "muted";
}

export function Badge({ className = "", variant = "default", children, ...props }: BadgeProps) {
  const baseStyles = `
    inline-flex items-center
    font-mono text-xs tracking-wider uppercase
    px-2 py-0.5 rounded-sm
    transition-colors duration-200
  `;

  const variants = {
    default: `
      bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]
      border border-[hsl(var(--border))]
    `,
    due: `
      bg-[hsl(var(--accent))] text-white
      border border-[hsl(var(--accent))]
      due-pulse
    `,
    upcoming: `
      bg-[hsl(var(--success-light))] text-[hsl(var(--success))]
      border border-[hsl(var(--success)_/_0.3)]
    `,
    muted: `
      bg-transparent text-[hsl(var(--muted-foreground))]
      border border-[hsl(var(--border))]
    `,
  };

  return (
    <span
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
