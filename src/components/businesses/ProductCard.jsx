
import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

const ProductCard = ({ product, onEdit }) => {
  return (
    <div className="relative group">
      <Button 
        variant="ghost" 
        size="icon"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onEdit(product)}
      >
        <Pencil className="h-4 w-4 text-gray-500 hover:text-gray-700" />
      </Button>
      {/* Resto do card do produto */}
    </div>
  );
};

export default ProductCard;
