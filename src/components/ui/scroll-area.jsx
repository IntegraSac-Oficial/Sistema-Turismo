
import * as React from "react"

import { cn } from "@/components/ui/utils"

const ScrollArea = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative overflow-auto", className)}
    {...props}
  >
    <div className="h-full w-full rounded-[inherit]">
      {children}
    </div>
  </div>
))
ScrollArea.displayName = "ScrollArea"

const ScrollBar = React.forwardRef(({ className, orientation = "vertical", ...props }, ref) => (
  <div
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <div className="relative flex-1 rounded-full bg-gray-300 hover:bg-gray-400" />
  </div>
))
ScrollBar.displayName = "ScrollBar"

export { ScrollArea, ScrollBar }
