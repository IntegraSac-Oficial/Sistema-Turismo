import React from "react";
import { cn } from "@/components/ui/utils";

const Avatar = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
));
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef(({ className, src, alt = "", ...props }, ref) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      onLoad={() => setIsLoaded(true)}
      onError={() => setError(true)}
      className={cn(
        "aspect-square h-full w-full object-cover",
        error ? "hidden" : "",
        className
      )}
      {...props}
    />
  );
});
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-slate-100 text-slate-600 font-medium",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };