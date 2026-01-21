
import React from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, MapPin, Tag, Clock, Check, X } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const categoryColors = {
  'cultural': 'bg-purple-100 text-purple-800',
  'esportivo': 'bg-blue-100 text-blue-800',
  'gastronômico': 'bg-orange-100 text-orange-800',
  'musical': 'bg-pink-100 text-pink-800',
  'festivo': 'bg-red-100 text-red-800',
  'religioso': 'bg-teal-100 text-teal-800',
  'feira': 'bg-green-100 text-green-800',
  'outro': 'bg-gray-100 text-gray-800'
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return format(parseISO(dateStr), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
};

export default function EventCard({ event, isAdmin, onApprove, onReject, onClick }) {
  const getEventStatus = () => {
    if (event.status === 'pending') {
      return <Badge className="bg-yellow-100 text-yellow-800">Aguardando Aprovação</Badge>;
    } else if (event.status === 'rejected') {
      return <Badge className="bg-red-100 text-red-800">Rejeitado</Badge>;
    }
    return null;
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="relative h-48 bg-gray-200">
        {event.image_url ? (
          <img 
            src={event.image_url} 
            alt={event.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Calendar className="w-12 h-12 text-gray-400" />
          </div>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center gap-2">
            <Badge className="bg-white/80 text-gray-800">
              <Calendar className="w-3 h-3 mr-1" />
              {formatDate(event.start_date)}
            </Badge>
            
            {event.is_featured && (
              <Badge className="bg-amber-500 text-white">
                Destaque
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="mb-2">
          {event.category && (
            <Badge className={categoryColors[event.category] || categoryColors.outro}>
              {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
            </Badge>
          )}
          {getEventStatus()}
        </div>
        
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{event.title}</h3>
        
        <div className="flex items-center text-gray-500 mb-2">
          <MapPin className="w-4 h-4 mr-1 shrink-0" />
          <span className="text-sm truncate">{event.location_name}</span>
        </div>
        
        {event.description && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-2">
            {event.description}
          </p>
        )}
      </CardContent>
      
      {isAdmin && event.status === 'pending' && (
        <CardFooter className="p-4 bg-gray-50 flex justify-end gap-2">
          <Button
            onClick={() => onApprove(event.id)}
            variant="outline"
            className="bg-green-50 text-green-600 hover:bg-green-100"
          >
            <Check className="w-4 h-4 mr-2" />
            Aprovar
          </Button>
          <Button
            onClick={() => onReject(event.id)}
            variant="outline"
            className="bg-red-50 text-red-600 hover:bg-red-100"
          >
            <X className="w-4 h-4 mr-2" />
            Rejeitar
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
