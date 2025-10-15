import React from "react";

const Label = ({ className, htmlFor, children, ...props }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-medium text-foreground ${className}`}
      {...props}
    >
      {children}
    </label>
  );
};

export default Label;