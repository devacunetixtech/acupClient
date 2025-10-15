import React from "react";

const Textarea = ({ className, ...props }) => {
  return (
    <textarea
      className={`block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
      {...props}
    />
  );
};

export default Textarea;