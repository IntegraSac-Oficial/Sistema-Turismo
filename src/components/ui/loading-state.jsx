import React from "react";
import { Loader2 } from "lucide-react";

export function LoadingState({ 
  text = "Carregando...",
  size = "default", // "small", "default", "large"
  fullscreen = false,
  className = "" 
}) {
  const sizeClasses = {
    small: "h-4 w-4",
    default: "h-8 w-8",
    large: "h-12 w-12"
  };

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
          <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600 mx-auto`} />
          <p className="mt-2 text-gray-600 font-medium">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
      {text && <span className="ml-2 text-gray-600">{text}</span>}
    </div>
  );
}