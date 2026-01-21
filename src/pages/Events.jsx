import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, parseISO, compareAsc, compareDesc } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  CalendarDays,
  Search,
  Filter,
  ArrowUp,
  ArrowDown,
  MapPin,
  Tag,
  Clock,
  ChevronDown,
  ChevronRight,
  Plus,
  Star
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Event } from "@/api/entities";
import { City } from "@/api/entities";
import { Beach } from "@/api/entities";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import EventCard from "@/components/events/EventCard";
import CategoryFilter from "@/components/events/CategoryFilter";
import EventsCalendar from "@/components/events/EventsCalendar";
import LocationSelector from "@/components/events/LocationSelector";

export default function Events() {
  const navigate = useNavigate();
  
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [timeRange, setTimeRange] = useState("all");
  
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedBeach, setSelectedBeach] = useState(null);
  
  const [calendarView, setCalendarView] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  
  const [cities, setCities] = useState([]);
  const [beaches, setBeaches] = useState([]);
  
  // Categorias de eventos
  const eventCategories = [
    { value: "cultural", label: "Cultural", color: "bg-purple-100 text-purple-800" },
    { value: "esportivo", label: "Esportivo", color: "bg-blue-100 text-blue-800" },
    { value: "gastronômico", label: "Gastronômico", color: "bg-orange-100 text-orange-800" },
    { value: "musical", label: "Musical", color: "bg-pink-100 text-pink-800" },
    { value: "festivo", label: "Festivo", color: "bg-red-100 text-red-800" },
    { value: "religioso", label: "Religioso", color: "bg-teal-100 text-teal-800" },
    { value: "feira", label: "Feira", color: "bg-green-100 text-green-800" },
    { value: "outro", label: "Outro", color: "bg-gray-100 text-gray-800" }
  ];
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Carregar eventos
        let eventsList = await Event.list();
        
        // Se não tiver eventos, usar dados de exemplo
        if (!eventsList || eventsList.length === 0) {
          eventsList = [
            {
              id: "1",
              title: "Festival de Verão",
              description: "O maior festival de música do verão catarinense!",
              start_date: "2024-01-15",
              end_date: "2024-01-17",
              location_name: "Praia Central",
              category: "musical",
              image_url: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
              is_featured: true
            },
            {
              id: "2",
              title: "Campeonato de Surf",
              description: "Competição com os melhores surfistas do Brasil.",
              start_date: "2024-02-10",
              end_date: "2024-02-12",
              location_name: "Praia do Rosa",
              category: "esportivo",
              image_url: "https://images.unsplash.com/photo-1517699418036-fb5d179fef0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80"
            }
          ];
        }
        
        setEvents(eventsList);
        setFilteredEvents(eventsList);
        
        // Carregar cidades
        const citiesList = await City.list();
        setCities(citiesList);
        
        // Carregar praias
        const beachesList = await Beach.list();
        setBeaches(beachesList);
        
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  
  // Aplicar filtros quando mudar
  useEffect(() => {
    if (events.length > 0) {
      let filtered = [...events];
      
      // Filtrar por texto
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(event => 
          (event.title?.toLowerCase().includes(term)) ||
          (event.description?.toLowerCase().includes(term)) ||
          (event.location_name?.toLowerCase().includes(term))
        );
      }
      
      // Filtrar por categorias
      if (selectedCategories.length > 0) {
        filtered = filtered.filter(event => 
          selectedCategories.includes(event.category)
        );
      }
      
      // Filtrar por cidade
      if (selectedCity) {
        filtered = filtered.filter(event => 
          event.location_id === selectedCity ||
          (event.location_type === 'beach' && 
            beaches.some(beach => beach.id === event.location_id && beach.city_id === selectedCity))
        );
      }
      
      // Filtrar por praia
      if (selectedBeach) {
        filtered = filtered.filter(event => 
          event.location_id === selectedBeach
        );
      }
      
      // Filtrar por período
      if (timeRange !== "all") {
        const now = new Date();
        
        filtered = filtered.filter(event => {
          const startDate = parseISO(event.start_date);
          const endDate = event.end_date ? parseISO(event.end_date) : startDate;
          
          if (timeRange === "upcoming") {
            return compareAsc(startDate, now) >= 0;
          } else if (timeRange === "past") {
            return compareAsc(endDate, now) < 0;
          } else if (timeRange === "ongoing") {
            return compareAsc(startDate, now) <= 0 && compareAsc(endDate, now) >= 0;
          }
          
          return true;
        });
      }
      
      // Ordenar
      filtered.sort((a, b) => {
        const dateA = parseISO(a.start_date);
        const dateB = parseISO(b.start_date);
        return sortOrder === "asc" 
          ? compareAsc(dateA, dateB) 
          : compareAsc(dateB, dateA);
      });
      
      setFilteredEvents(filtered);
    }
  }, [events, searchTerm, selectedCategories, selectedCity, selectedBeach, timeRange, sortOrder, beaches]);
  
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
  };
  
  const toggleCategorySelection = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(cat => cat !== category);
      } else {
        return [...prev, category];
      }
    });
  };
  
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategories([]);
    setSelectedCity(null);
    setSelectedBeach(null);
    setTimeRange("all");
    setSortOrder("asc");
  };
  
  const handleEventClick = (eventId) => {
    navigate(`${createPageUrl("EventDetail")}?id=${eventId}`);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Eventos</h1>
            <p className="text-gray-600 mt-1">
              Descubra os melhores eventos em Santa Catarina
            </p>
          </div>
          
          <div className="flex gap-2">
            <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filtros
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filtrar Eventos</SheetTitle>
                  <SheetDescription>Refine sua busca de eventos</SheetDescription>
                </SheetHeader>
                
                <div className="py-4 space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Status do Evento</h3>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="all">Todos os eventos</SelectItem>
                          <SelectItem value="upcoming">Próximos eventos</SelectItem>
                          <SelectItem value="ongoing">Acontecendo agora</SelectItem>
                          <SelectItem value="past">Eventos passados</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Localização</h3>
                    <LocationSelector
                      cities={cities}
                      beaches={beaches}
                      selectedCity={selectedCity}
                      selectedBeach={selectedBeach}
                      onSelectCity={setSelectedCity}
                      onSelectBeach={setSelectedBeach}
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Categorias</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {eventCategories.map(category => (
                        <div 
                          key={category.value}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox 
                            id={`category-${category.value}`}
                            checked={selectedCategories.includes(category.value)}
                            onCheckedChange={() => toggleCategorySelection(category.value)}
                          />
                          <label 
                            htmlFor={`category-${category.value}`}
                            className="text-sm cursor-pointer"
                          >
                            {category.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-between gap-2">
                  <Button variant="outline" onClick={clearFilters}>
                    Limpar filtros
                  </Button>
                  <SheetClose asChild>
                    <Button>Aplicar filtros</Button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
            
            <Tabs value={viewMode} onValueChange={setViewMode} className="hidden md:block">
              <TabsList>
                <TabsTrigger value="grid">Lista</TabsTrigger>
                <TabsTrigger value="calendar">Calendário</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar eventos..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSortOrder}
                className="hidden md:flex items-center gap-2"
              >
                {sortOrder === "asc" ? (
                  <>
                    <ArrowUp className="h-4 w-4" />
                    Data (mais recente)
                  </>
                ) : (
                  <>
                    <ArrowDown className="h-4 w-4" />
                    Data (mais antiga)
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="mt-3 overflow-x-auto">
            <CategoryFilter
              categories={eventCategories}
              selectedCategories={selectedCategories}
              onToggleCategory={toggleCategorySelection}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <>
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-20">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-700 mb-2">Nenhum evento encontrado</h3>
                    <p className="text-gray-500 mb-4 max-w-lg mx-auto">
                      Não encontramos eventos com os filtros selecionados. Tente ajustar seus filtros ou criar um novo evento.
                    </p>
                    <Button 
                      variant="outline"
                      onClick={clearFilters}
                    >
                      Limpar filtros
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map(event => (
                      <EventCard 
                        key={event.id} 
                        event={event} 
                        onClick={() => handleEventClick(event.id)} 
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Card className="p-4">
                <EventsCalendar events={filteredEvents} onEventClick={handleEventClick} />
              </Card>
            )}
          </>
        )}
      </div>
      
      <PublicFooter />
    </div>
  );
}