import React from "react";

export const Input = ({ className, ...props }) => {
  return (
    <input
      className={`px-2 py-1 border rounded-md focus:outline-none ${className}`}
      {...props}
    />
  );
};
