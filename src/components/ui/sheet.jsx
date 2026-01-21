import * as React from "react"
import { cn } from "@/components/ui/utils"
import { X } from "lucide-react"

// Em vez de usar o Radix UI, vamos criar uma versão simplificada do componente Sheet

const Sheet = React.forwardRef(({ open, onOpenChange, children, ...props }, ref) => {
  return React.createElement('div', { ref, ...props }, children)
})
Sheet.displayName = "Sheet"

const SheetTrigger = React.forwardRef(({ onClick, children, ...props }, ref) => {
  return React.createElement('button', { 
    ref, 
    onClick: (e) => {
      if (onClick) onClick(e)
    }, 
    ...props 
  }, children)
})
SheetTrigger.displayName = "SheetTrigger"

const SheetClose = React.forwardRef(({ onClick, children, ...props }, ref) => {
  return React.createElement('button', { 
    ref, 
    onClick: (e) => {
      if (onClick) onClick(e)
    }, 
    ...props 
  }, children)
})
SheetClose.displayName = "SheetClose"

const SheetContent = React.forwardRef(({ side = "right", className, children, onClose, ...props }, ref) => {
  const [isVisible, setIsVisible] = React.useState(true)
  
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsVisible(false)
        if (onClose) onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])
  
  if (!isVisible) return null
  
  return (
    <React.Fragment>
      <div 
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        onClick={() => {
          setIsVisible(false)
          if (onClose) onClose()
        }}
      />
      <div
        ref={ref}
        className={cn(
          "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out",
          side === "right" ? "inset-y-0 right-0 h-full w-3/4 sm:max-w-sm" : "",
          side === "left" ? "inset-y-0 left-0 h-full w-3/4 sm:max-w-sm" : "",
          side === "top" ? "inset-x-0 top-0" : "",
          side === "bottom" ? "inset-x-0 bottom-0" : "",
          className
        )}
        {...props}
      >
        {children}
        <button
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          onClick={() => {
            setIsVisible(false)
            if (onClose) onClose()
          }}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </React.Fragment>
  )
})
SheetContent.displayName = "SheetContent"

const SheetHeader = ({ className, ...props }) => (
  <div
    className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
    {...props}
  />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({ className, ...props }) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
))
SheetTitle.displayName = "SheetTitle"

const SheetDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
SheetDescription.displayName = "SheetDescription"

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}