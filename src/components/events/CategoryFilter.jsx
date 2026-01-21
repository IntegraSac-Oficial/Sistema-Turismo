import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CategoryFilter({ categories, selectedCategories, onSelectCategory }) {
  const categoryMapping = {
    "cultural": { label: "Cultural", color: "bg-purple-100 text-purple-800" },
    "esportivo": { label: "Esportivo", color: "bg-blue-100 text-blue-800" },
    "gastronômico": { label: "Gastronômico", color: "bg-orange-100 text-orange-800" },
    "musical": { label: "Musical", color: "bg-pink-100 text-pink-800" },
    "festivo": { label: "Festivo", color: "bg-red-100 text-red-800" },
    "religioso": { label: "Religioso", color: "bg-teal-100 text-teal-800" },
    "feira": { label: "Feira", color: "bg-green-100 text-green-800" },
    "outro": { label: "Outro", color: "bg-gray-100 text-gray-800" }
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {Object.entries(categoryMapping).map(([key, { label, color }]) => (
        <Badge
          key={key}
          className={`rounded-full px-3 py-1 cursor-pointer ${
            selectedCategories.includes(key)
              ? color
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          onClick={() => onSelectCategory(key)}
        >
          {label}
        </Badge>
      ))}
    </div>
  );
}