import React from "react";

const LoadingSpinner = ({ size = "sm", text = "" }) => {
  //pick size classes based on prop
  const sizeClasses =
    size === "lg"
      ? "h-8 w-8 border-4"
      : size === "md"
      ? "h-6 w-6 border-[3px]"
      : "h-4 w-4 border-2"; // default to small

  return (
    <div className="flex items-center justify-center gap-2">
      {/* spinning*/}
      <div
        className={`
          animate-spin
          rounded-full
          border-t-transparent
          border-current
          border-solid
          ${sizeClasses}
        `}
      />
      {/* optional text next to spinner */}
      {text && <span className="text-sm text-current">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
