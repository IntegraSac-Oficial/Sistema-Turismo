import React from "react";

// Componente Slider simplificado
export function Slider({ defaultValue, min, max, step, onValueChange }) {
  const handleChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (onValueChange) onValueChange([value]);
  };

  return (
    <div className="relative w-full">
      <input
        type="range"
        min={min || 0}
        max={max || 100}
        step={step || 1}
        defaultValue={defaultValue?.[0] || 0}
        onChange={handleChange}
        className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer"
      />
    </div>
  );
}