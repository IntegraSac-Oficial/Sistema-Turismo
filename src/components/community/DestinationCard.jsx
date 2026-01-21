import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Waves, Flag, MapPin, User } from "lucide-react";

export default function DestinationCard({ place, large = false, onClick }) {
  const getTypeIcon = () => {
    switch (place.type) {
      case "city":
        return <Building2 className="h-4 w-4 text-blue-500" />;
      case "beach":
        return <Waves className="h-4 w-4 text-cyan-500" />;
      default:
        return <MapPin className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getBackgroundImage = () => {
    if (place.image_url) return place.image_url;
    
    return place.type === "city"
      ? "https://images.unsplash.com/photo-1581373449483-37449f962b6c?q=80&w=1000&auto=format&fit=crop"
      : "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop";
  };
  
  if (large) {
    return (
      <Card 
        className="overflow-hidden cursor-pointer group hover:shadow-xl transition-all h-full"
        onClick={onClick}
      >
        <div className="relative aspect-[3/2]">
          <img 
            src={getBackgroundImage()} 
            alt={place.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-1 mb-1">
              {getTypeIcon()}
              <Badge variant="outline" className="bg-white/20 text-white border-transparent backdrop-blur-sm">
                {place.type === "city" ? "Cidade" : "Praia"}
              </Badge>
            </div>
            <h3 className="text-xl font-bold text-white">{place.name}</h3>
            
            <div className="flex items-center gap-2 mt-1 text-white/80 text-sm">
              {place.checkIns > 0 && (
                <div className="flex items-center">
                  <Flag className="w-3 h-3 mr-1 text-white/70" />
                  <span>{place.checkIns} check-ins</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }
  
  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:bg-gray-50 transition-all"
      onClick={onClick}
    >
      <CardContent className="p-3 flex items-center gap-3">
        <div className="w-14 h-14 rounded-md overflow-hidden">
          <img 
            src={getBackgroundImage()} 
            alt={place.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            {getTypeIcon()}
            <span className="text-xs text-gray-500">
              {place.type === "city" ? "Cidade" : "Praia"}
            </span>
          </div>
          
          <h3 className="font-medium text-gray-900 truncate">{place.name}</h3>
          
          {place.checkIns > 0 && (
            <div className="flex items-center text-gray-500 text-xs mt-1">
              <Flag className="w-3 h-3 mr-1" />
              <span>{place.checkIns} check-ins</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}