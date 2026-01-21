
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function EventCard({ event, onClick }) {
  const navigate = useNavigate();
  
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    } catch (error) {
      return dateString;
    }
  };
  
  const getEventStatus = () => {
    if (event.status === 'pending') {
      return <Badge className="bg-yellow-100 text-yellow-800">Aguardando Aprovação</Badge>;
    } else if (event.status === 'rejected') {
      return <Badge className="bg-red-100 text-red-800">Rejeitado</Badge>;
    } else {
      return null; // Sem badge para eventos aprovados
    }
  };
  
  const goToEventDetail = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(createPageUrl(`EventDetail?id=${event.id}`));
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={goToEventDetail}>
      <div className="relative h-48 md:h-64">
        <img 
          src={event.image_url || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80"}
          alt={event.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4 text-white">
          <div className="flex gap-2 mb-2">
            <Badge className="bg-white text-[#007BFF] mb-2">{event.category}</Badge>
            {getEventStatus()}
          </div>
          <h3 className="text-xl font-bold">{event.title}</h3>
          <p className="text-sm opacity-90">{event.short_description}</p>
        </div>
      </div>
      
      <CardContent className="pt-4">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-[#007BFF]" />
            <span>{formatDate(event.start_date)}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-[#FF5722]" />
            <span>{event.location_name}</span>
          </div>
          
          <div className="flex justify-between items-center pt-2">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium">
                  {i}
                </div>
              ))}
              <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs">+15</div>
            </div>
            
            <Button variant="ghost" className="text-[#007BFF]">
              Ver Detalhes
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
