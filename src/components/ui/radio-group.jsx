import * as React from "react"
import { cn } from "@/components/ui/utils"

// Versão simplificada do RadioGroup sem dependência do Radix UI
export const RadioGroup = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div 
      ref={ref}
      className={cn("grid gap-2", className)} 
      role="radiogroup"
      {...props} 
    />
  )
})
RadioGroup.displayName = "RadioGroup"

export const RadioGroupItem = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="radio"
        ref={ref}
        className={cn(
          "h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
      {children}
    </div>
  )
})
RadioGroupItem.displayName = "RadioGroupItem"