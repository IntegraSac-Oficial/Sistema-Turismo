import React, { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Palette, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/components/ui/utils";

export function ColorPicker({ color, onChange, className }) {
  const [value, setValue] = useState(color || "#000000");
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setValue(color || "#000000");
  }, [color]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    const isHexColor = /^#([A-Fa-f0-9]{3}){1,2}$/.test(newValue);
    setIsValid(isHexColor);
    
    if (isHexColor) {
      onChange(newValue);
    }
  };

  const predefinedColors = [
    "#0066cc", "#1E40AF", "#3B82F6", "#60A5FA", "#93C5FD",
    "#059669", "#10B981", "#34D399", "#6EE7B7", "#A7F3D0",
    "#DC2626", "#F87171", "#F97316", "#FB923C", "#FDBA74",
    "#FBBF24", "#FCD34D", "#FDE68A", "#FEF3C7", "#FFFBEB",
    "#111827", "#374151", "#6B7280", "#D1D5DB", "#F9FAFB"
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "w-full h-10 flex items-center justify-between px-3", 
            !isValid && "border-red-500",
            className
          )}
        >
          <div className="flex items-center gap-2">
            <div 
              className="w-5 h-5 rounded-full border border-gray-300" 
              style={{ backgroundColor: isValid ? value : "#ffffff" }}
            />
            <span>{value}</span>
          </div>
          <Palette className="h-4 w-4 text-gray-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label>Escolha uma cor</Label>
            <div 
              className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center" 
              style={{ backgroundColor: isValid ? value : "#ffffff" }}
            >
              {isValid && <Check className="h-3 w-3 text-white" />}
            </div>
          </div>
          
          <div className="grid grid-cols-5 gap-1">
            {predefinedColors.map((presetColor) => (
              <button
                key={presetColor}
                type="button"
                className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                style={{ backgroundColor: presetColor }}
                onClick={() => {
                  setValue(presetColor);
                  onChange(presetColor);
                  setIsValid(true);
                }}
              >
                {value.toLowerCase() === presetColor.toLowerCase() && (
                  <Check className="h-3 w-3 text-white" />
                )}
              </button>
            ))}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="color-input">Valor hexadecimal</Label>
            <div className="flex gap-2">
              <Input
                id="color-input"
                type="text"
                value={value}
                onChange={handleInputChange}
                className={cn("flex-1", !isValid && "border-red-500 focus:ring-red-500")}
                placeholder="#000000"
              />
              <Input
                type="color"
                value={isValid ? value : "#000000"}
                onChange={(e) => {
                  setValue(e.target.value);
                  onChange(e.target.value);
                  setIsValid(true);
                }}
                className="w-10 h-10 p-0 cursor-pointer"
              />
            </div>
            {!isValid && (
              <p className="text-xs text-red-500">Formato inválido. Use formato hexadecimal (ex: #FF0000)</p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}