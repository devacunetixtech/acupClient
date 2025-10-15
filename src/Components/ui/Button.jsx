import React from "react";

const Button = ({ variant = "default", size = "default", className, children, ...props }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium";
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    ghost: "bg-transparent hover:bg-gray-100 text-foreground",
  };
  const sizes = {
    default: "px-4 py-2 text-sm",
    sm: "px-3 py-1 text-xs",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;