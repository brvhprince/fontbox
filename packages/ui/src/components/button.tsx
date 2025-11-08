import * as React from "react";

import { cn } from "../utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-brand text-brand-foreground shadow-md hover:bg-brand-emphasis",
  secondary: "bg-neutral-100 text-neutral-800 border border-neutral-300 hover:bg-neutral-200",
  ghost: "bg-transparent hover:bg-neutral-100 text-neutral-800"
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          variantClasses[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
