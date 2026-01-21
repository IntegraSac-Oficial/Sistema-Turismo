import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

function BackButton({ onClick, className = "" }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <Button
      variant="ghost"
      className={`hover:bg-gray-100 mb-4 ${className}`}
      onClick={handleBack}
    >
      <ChevronLeft className="mr-2 h-4 w-4" />
      Voltar
    </Button>
  );
}

export default BackButton;
export { BackButton };