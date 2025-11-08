import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as React from "react";

import { cn } from "../utils/cn";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = ({ ...props }: TooltipPrimitive.TooltipProps) => (
  <TooltipPrimitive.Root delayDuration={100} {...props} />
);
Tooltip.displayName = TooltipPrimitive.Root.displayName;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border border-neutral-200 bg-surface px-3 py-1.5 text-xs text-surface-inverted shadow-md",
      "data-[state=delayed-open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent };
