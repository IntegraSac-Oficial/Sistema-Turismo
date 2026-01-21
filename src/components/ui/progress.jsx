import * as React from "react"
import { cn } from "@/components/ui/utils"

const Progress = React.forwardRef(
  ({ className, value, indicatorClassName, max = 100, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        className={cn(
          "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
          className
        )}
        {...props}
      >
        <div
          className={cn("h-full w-full flex-1 bg-primary transition-all", indicatorClassName)}
          style={{ transform: `translateX(-${100 - ((value / max) * 100)}%)` }}
        />
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }