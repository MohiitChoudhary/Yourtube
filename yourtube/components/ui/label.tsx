import * as React from "react";

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={`text-sm font-medium text-gray-700 ${className ?? ""}`}
      {...props}
    />
  );
});

Label.displayName = "Label";
