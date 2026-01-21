import React from "react";
import { cn } from "@/components/ui/utils";
import { Check } from "lucide-react";

const Checkbox = React.forwardRef(({ 
  className,
  checked,
  onCheckedChange,
  disabled,
  ...props 
}, ref) => {
  const [isChecked, setIsChecked] = React.useState(checked || false);
  
  React.useEffect(() => {
    setIsChecked(checked || false);
  }, [checked]);
  
  const handleClick = () => {
    if (disabled) return;
    
    const newChecked = !isChecked;
    setIsChecked(newChecked);
    
    if (onCheckedChange) {
      onCheckedChange(newChecked);
    }
  };
  
  return (
    <button
      type="button"
      ref={ref}
      role="checkbox"
      aria-checked={isChecked}
      data-state={isChecked ? "checked" : "unchecked"}
      disabled={disabled}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-gray-300 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#007BFF] data-[state=checked]:border-[#007BFF]",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {isChecked && (
        <span className="flex items-center justify-center text-white">
          <Check className="h-3 w-3" />
        </span>
      )}
    </button>
  );
});

Checkbox.displayName = "Checkbox";

export { Checkbox };