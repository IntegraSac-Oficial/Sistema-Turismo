import React, { useState } from 'react';
import { format, parseISO, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

export default function EventsCalendar({ events, onEventClick }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Extrair todas as datas que contêm eventos
  const eventDates = events.reduce((dates, event) => {
    const startDate = new Date(event.start_date);
    
    // Se o evento tiver data de término, incluir todas as datas entre início e fim
    if (event.end_date) {
      const endDate = new Date(event.end_date);
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
    } else {
      dates.push(startDate);
    }
    
    return dates;
  }, []);
  
  // Encontrar eventos para a data selecionada
  const eventsForSelectedDate = selectedDate 
    ? events.filter(event => {
        const startDate = parseISO(event.start_date);
        const endDate = event.end_date ? parseISO(event.end_date) : startDate;
        
        const selectedDateObj = new Date(selectedDate);
        return (
          isSameDay(selectedDateObj, startDate) || 
          (endDate >= selectedDateObj && startDate <= selectedDateObj)
        );
      }) 
    : [];
  
  // Mapear categorias para cores
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
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Calendário de Eventos</h3>
          <p className="text-sm text-gray-500">Selecione uma data para ver os eventos</p>
        </div>
        
        <CalendarComponent
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md border"
        />
      </div>
      
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">
            {selectedDate ? (
              <>Eventos em {format(new Date(selectedDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</>
            ) : (
              'Selecione uma data no calendário'
            )}
          </h3>
          {eventsForSelectedDate.length > 0 && (
            <p className="text-sm text-gray-500">{eventsForSelectedDate.length} evento(s) encontrado(s)</p>
          )}
        </div>
        
        {selectedDate ? (
          eventsForSelectedDate.length > 0 ? (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {eventsForSelectedDate.map(event => (
                <Card 
                  key={event.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onEventClick(event.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{event.title}</h4>
                      <Badge className={categoryColors[event.category] || 'bg-gray-100 text-gray-800'}>
                        {event.category ? event.category.charAt(0).toUpperCase() + event.category.slice(1) : 'Outro'}
                      </Badge>
                    </div>
                    
                    <div className="mt-2 text-sm text-gray-500 space-y-1">
                      {event.start_time && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {event.start_time}{event.end_time ? ` - ${event.end_time}` : ''}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location_name}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <h4 className="text-lg font-medium text-gray-700">Nenhum evento</h4>
              <p className="text-sm text-gray-500">Não há eventos programados para esta data.</p>
            </div>
          )
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <h4 className="text-lg font-medium text-gray-700">Selecione uma data</h4>
            <p className="text-sm text-gray-500">Selecione uma data no calendário para ver os eventos.</p>
          </div>
        )}
      </div>
    </div>
  );
}