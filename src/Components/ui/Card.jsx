import React from "react";

const Card = ({ className, children, ...props }) => {
  return (
    <div
      className={`bg-card rounded-lg border border-border shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;