import * as React from "react"
import { cn } from "@/components/ui/utils"
import { AlertCircle, Info, CheckCheck } from "lucide-react"

const Alert = React.forwardRef(
  ({ className, variant, ...props }, ref) => {
    const variantClasses = {
      default: "bg-gray-50 text-gray-800 border-gray-200",
      destructive: "bg-red-50 text-red-800 border-red-200",
      warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
      success: "bg-green-50 text-green-800 border-green-200",
      info: "bg-blue-50 text-blue-800 border-blue-200",
    }

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative w-full rounded-lg border p-4",
          variantClasses[variant] || variantClasses.default,
          className
        )}
        {...props}
      />
    )
  }
)
Alert.displayName = "Alert"

// Adicione o ícone baseado na variante
const AlertIcon = ({ variant }) => {
  switch (variant) {
    case "destructive":
      return <AlertCircle className="h-4 w-4 text-red-600" />
    case "warning":
      return <AlertCircle className="h-4 w-4 text-yellow-600" />
    case "success":
      return <CheckCheck className="h-4 w-4 text-green-600" />
    case "info":
    case "default":
    default:
      return <Info className="h-4 w-4 text-blue-600" />
  }
}

const AlertTitle = React.forwardRef(
  ({ className, children, variant, ...props }, ref) => (
    <div className="flex items-center gap-2">
      <AlertIcon variant={variant} />
      <h5
        ref={ref}
        className={cn("mb-1 font-medium leading-none tracking-tight", className)}
        {...props}
      >
        {children}
      </h5>
    </div>
  )
)
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }