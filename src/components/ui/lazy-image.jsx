import React, { useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export function LazyImage({ 
  src, 
  alt, 
  className = "", 
  fallback = null,
  width,
  height,
  ...props 
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <>
      {isLoading && (
        <Skeleton 
          className={`${className} ${error ? 'hidden' : ''}`}
          style={{ width, height }}
        />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'hidden' : ''}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setError(true);
        }}
        loading="lazy"
        {...props}
      />
      {error && fallback}
    </>
  );
}