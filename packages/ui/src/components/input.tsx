import * as React from "react";

import { cn } from "../utils/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  block?: boolean;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, block = true, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 rounded-md border border-neutral-200 bg-surface px-3 py-2 text-sm text-surface-inverted ring-offset-surface placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          block ? "w-full" : "",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
