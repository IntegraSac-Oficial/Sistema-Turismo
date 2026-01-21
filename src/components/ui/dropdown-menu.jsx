import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/components/ui/utils";

// Componente DropdownMenu
const DropdownMenu = ({ children }) => {
  return <div className="relative inline-block text-left w-full">{children}</div>;
};

// Componente DropdownMenuTrigger
const DropdownMenuTrigger = ({ children, className, ...props }) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  
  const handleToggle = () => {
    setOpen(!open);
  };
  
  // Compartilhar o estado "open" com o DropdownMenuContent
  React.useEffect(() => {
    const menu = triggerRef.current?.nextElementSibling;
    if (menu) {
      if (open) {
        menu.style.display = "block";
      } else {
        menu.style.display = "none";
      }
    }
  }, [open]);
  
  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target) && 
          !triggerRef.current.nextElementSibling?.contains(event.target)) {
        setOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <button
      type="button"
      ref={triggerRef}
      onClick={handleToggle}
      className={cn("text-left", className)}
      {...props}
    >
      {children}
    </button>
  );
};

// Componente DropdownMenuContent
const DropdownMenuContent = ({ children, className, align = "center", ...props }) => {
  return (
    <div 
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-200 bg-white p-1 shadow-md animate-in fade-in-80",
        align === "end" ? "right-0" : align === "start" ? "left-0" : "left-1/2 -translate-x-1/2",
        "mt-2",
        className
      )}
      style={{ display: "none" }}
      {...props}
    >
      {children}
    </div>
  );
};

// Componente DropdownMenuLabel
const DropdownMenuLabel = ({ className, ...props }) => (
  <div
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
);

// Componente DropdownMenuSeparator
const DropdownMenuSeparator = ({ className, ...props }) => (
  <div
    className={cn("h-px my-1 bg-slate-200", className)}
    {...props}
  />
);

// Componente DropdownMenuGroup
const DropdownMenuGroup = ({ className, ...props }) => (
  <div
    className={cn("", className)}
    {...props}
  />
);

// Componente DropdownMenuItem
const DropdownMenuItem = ({ className, ...props }) => (
  <button
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-slate-100 focus:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-left hover:bg-[#007BFF] hover:text-white",
      className
    )}
    {...props}
  />
);

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuItem,
};