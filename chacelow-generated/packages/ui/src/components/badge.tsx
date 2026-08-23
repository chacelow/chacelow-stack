import { cn } from "@chacelow-generated/ui/lib/utils";
import type * as React from "react";

function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & {
  variant?: "default" | "secondary" | "outline" | "destructive";
}) {
  const variants = {
    default: "bg-primary text-primary-foreground",
    destructive: "bg-destructive/15 text-destructive",
    outline: "border border-border text-foreground",
    secondary: "bg-secondary text-secondary-foreground",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 font-medium text-xs",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
