import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.ProgressHTMLAttributes<HTMLProgressElement> {}

export const Progress = React.forwardRef<
  HTMLProgressElement,
  ProgressProps
>(({ className, value, ...props }, ref) => {
  return (
    <progress
      ref={ref}
      value={value}
      className={cn(
        "w-full h-2 overflow-hidden rounded-full bg-gray-200 text-transparent",
        className
      )}
      {...props}
    />
  );
});

Progress.displayName = "Progress";
