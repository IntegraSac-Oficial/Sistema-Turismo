import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, CreditCard, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function BusinessCard({ business }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(createPageUrl("PublicBusinessDetail") + `?id=${business.id}`);
  };

  const handleDetails = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(createPageUrl("PublicBusinessDetail") + `?id=${business.id}`);
  };

  const handleViewCatalog = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Direcionar diretamente para a aba de produtos na página de detalhes
    navigate(createPageUrl("PublicBusinessDetail") + `?id=${business.id}&showCatalog=true`);
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={handleCardClick}>
      <div className="aspect-video relative bg-gray-100">
        {business.image_url ? (
          <img 
            src={business.image_url} 
            alt={business.business_name || business.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <div className="text-3xl font-bold text-gray-400">
              {(business.business_name || business.name || "").charAt(0)}
            </div>
          </div>
        )}
        
        {business.is_club_member && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
            <CreditCard className="h-3 w-3 mr-1" />
            Desconto Clube
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-1">{business.business_name || business.name}</h3>
        
        {business.type && (
          <Badge variant="outline" className="mb-2">
            {business.type.replace('_', ' ')}
          </Badge>
        )}
        
        {business.address && (
          <div className="text-gray-600 text-sm flex items-start mt-2">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" />
            <span>{business.address}</span>
          </div>
        )}
        
        {business.opening_hours && (
          <div className="text-gray-600 text-sm flex items-start mt-2">
            <Clock className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" />
            <span>{business.opening_hours}</span>
          </div>
        )}
        
        <div className="flex gap-2 mt-4">
          <Button 
            className="flex-1"
            variant="outline"
            onClick={handleDetails}
          >
            Ver detalhes
          </Button>
          <Button 
            className="flex-1"
            onClick={handleViewCatalog}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Ver Catálogo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}