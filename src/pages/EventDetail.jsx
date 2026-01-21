
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  MapPin,
  Clock,
  Tag,
  Link as LinkIcon,
  User,
  Mail,
  Phone,
  DollarSign,
  ArrowLeft,
  Share2,
  Heart,
  MessageSquare,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Ticket,
  Waves,
  Building2
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import BackButton from "@/components/ui/BackButton";
import { Event } from "@/api/entities";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Beach } from "@/api/entities";
import { City } from "@/api/entities";
import { Business } from "@/api/entities";

export default function EventDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [error, setError] = useState(null);
  const [relatedLocations, setRelatedLocations] = useState(null);

  // Extrair o ID do evento da URL
  const getEventId = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("id");
  };

  const eventId = getEventId();

  // Carregar dados do evento
  useEffect(() => {
    const fetchEventDetails = async () => {
      setIsLoading(true);
      try {
        if (!eventId) {
          throw new Error("ID do evento não encontrado");
        }

        // Obter dados do evento pelo ID
        const eventData = await Event.get(eventId);
        
        if (!eventData) {
          throw new Error("Evento não encontrado");
        }
        
        setEvent(eventData);
        
        // Novo: Carregar dados relacionados com base no tipo de localização
        if (eventData.location_type === "city" && eventData.location_id) {
          // Se o evento é em uma cidade, carregar algumas praias dessa cidade
          try {
            const cityBeaches = await Beach.filter({ city_id: eventData.location_id });
            // Limitar a algumas praias apenas para não sobrecarregar a interface
            const limitedBeaches = cityBeaches.slice(0, 3);
            setRelatedLocations({
              type: "beaches",
              data: limitedBeaches,
              title: "Praias desta Cidade"
            });
          } catch (err) {
            console.error("Erro ao carregar praias relacionadas:", err);
          }
        } else if (eventData.location_type === "beach" && eventData.location_id) {
          // Se o evento é em uma praia, carregar detalhes da cidade
          try {
            const beach = await Beach.get(eventData.location_id);
            if (beach && beach.city_id) {
              const city = await City.get(beach.city_id);
              setRelatedLocations({
                type: "city",
                data: city,
                title: "Cidade desta Praia"
              });
            }
          } catch (err) {
            console.error("Erro ao carregar cidade relacionada:", err);
          }
        } else if (eventData.location_type === "business" && eventData.location_id) {
          // Se o evento é em um estabelecimento, buscar detalhes do local
          try {
            const business = await Business.get(eventData.location_id);
            if (business) {
              let locationInfo = {};
              
              // Buscar cidade do estabelecimento
              if (business.city_id) {
                const city = await City.get(business.city_id);
                if (city) {
                  locationInfo.city = city;
                }
              }
              
              // Buscar praia do estabelecimento (se aplicável)
              if (business.beach_id) {
                const beach = await Beach.get(business.beach_id);
                if (beach) {
                  locationInfo.beach = beach;
                }
              }
              
              setRelatedLocations({
                type: "business_location",
                data: locationInfo,
                title: "Localização do Estabelecimento"
              });
            }
          } catch (err) {
            console.error("Erro ao carregar informações do estabelecimento:", err);
          }
        }
        
        // Carregar eventos relacionados (mesma categoria ou localização)
        const allEvents = await Event.list();
        const filtered = allEvents.filter(e => 
          e.id !== eventId && 
          (e.category === eventData.category || e.location_id === eventData.location_id)
        ).slice(0, 3);
        
        setRelatedEvents(filtered);
      } catch (err) {
        console.error("Erro ao carregar evento:", err);
        setError(err.message || "Erro ao carregar detalhes do evento");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  // Mapeamento de categorias para cores
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

  const formatEventDate = (dateStr) => {
    if (!dateStr) return "";
    return format(parseISO(dateStr), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  // Componente de carregamento
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicHeader />
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="w-12 h-12 border-4 border-[#007BFF] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg text-gray-600">Carregando evento...</p>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  // Componente de erro
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicHeader />
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <Alert variant="destructive" className="mb-6">
            <AlertTitle className="text-lg font-semibold">Erro ao carregar evento</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            onClick={() => navigate(createPageUrl("Events"))}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Eventos
          </Button>
        </div>
        <PublicFooter />
      </div>
    );
  }

  // Função para renderizar informações de localização relacionadas
  const renderRelatedLocations = () => {
    if (!relatedLocations) return null;
    
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">{relatedLocations.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {relatedLocations.type === "beaches" && (
            <div className="space-y-3">
              {relatedLocations.data.map(beach => (
                <div key={beach.id} className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-md flex items-center justify-center">
                    <Waves className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">{beach.name}</h3>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-sm text-blue-600"
                      onClick={() => navigate(createPageUrl(`PublicBeachDetail?id=${beach.id}`))}
                    >
                      Ver detalhes
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {relatedLocations.type === "city" && relatedLocations.data && (
            <div className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg">
              <div className="w-12 h-12 bg-indigo-100 rounded-md flex items-center justify-center">
                <Building2 className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                <h3 className="font-medium">{relatedLocations.data.name}</h3>
                <p className="text-sm text-gray-600">
                  {relatedLocations.data.state}
                </p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-sm text-blue-600"
                  onClick={() => navigate(createPageUrl(`CityDetail?id=${relatedLocations.data.id}`))}
                >
                  Ver detalhes
                </Button>
              </div>
            </div>
          )}
          
          {relatedLocations.type === "business_location" && (
            <div className="space-y-3">
              {relatedLocations.data.city && (
                <div className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg">
                  <div className="w-12 h-12 bg-indigo-100 rounded-md flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">{relatedLocations.data.city.name}</h3>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-sm text-blue-600"
                      onClick={() => navigate(createPageUrl(`CityDetail?id=${relatedLocations.data.city.id}`))}
                    >
                      Ver cidade
                    </Button>
                  </div>
                </div>
              )}
              
              {relatedLocations.data.beach && (
                <div className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-md flex items-center justify-center">
                    <Waves className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">{relatedLocations.data.beach.name}</h3>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-sm text-blue-600"
                      onClick={() => navigate(createPageUrl(`PublicBeachDetail?id=${relatedLocations.data.beach.id}`))}
                    >
                      Ver praia
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Componente principal - detalhes do evento
  if (!event) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <a href={createPageUrl("Public")} className="text-blue-600 hover:text-blue-800">Home</a>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <a href={createPageUrl("Events")} className="text-blue-600 hover:text-blue-800">Eventos</a>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-gray-700">{event.title}</span>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Conteúdo principal */}
          <div className="w-full md:w-2/3">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Imagem do evento */}
              <div className="relative w-full h-64 md:h-96 bg-gray-200">
                {event.image_url ? (
                  <img 
                    src={event.image_url} 
                    alt={event.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-50">
                    <Calendar className="w-16 h-16 text-blue-300" />
                  </div>
                )}
                
                {event.is_featured && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-[#FF5722] hover:bg-[#E64A19] px-3 py-1 text-white">
                      Destaque
                    </Badge>
                  </div>
                )}
              </div>
              
              {/* Conteúdo do evento */}
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  {event.category && (
                    <Badge className={categoryColors[event.category] || "bg-gray-100 text-gray-800"}>
                      {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                    </Badge>
                  )}
                  
                  {event.tags && event.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="bg-gray-50">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
                
                <div className="flex flex-col gap-3 mb-6">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-5 h-5 text-[#007BFF]" />
                    <span>
                      {formatEventDate(event.start_date)}
                      {event.end_date && event.end_date !== event.start_date && (
                        <> até {formatEventDate(event.end_date)}</>
                      )}
                    </span>
                  </div>
                  
                  {(event.start_time || event.end_time) && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-5 h-5 text-[#007BFF]" />
                      <span>
                        {event.start_time && `A partir das ${event.start_time}`}
                        {event.end_time && event.start_time && ` até ${event.end_time}`}
                        {event.end_time && !event.start_time && `Até ${event.end_time}`}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-5 h-5 text-[#007BFF]" />
                    <span>{event.location_name}</span>
                  </div>
                  
                  {event.address && (
                    <div className="flex items-start gap-2 text-gray-600 ml-7">
                      <span>{event.address}</span>
                    </div>
                  )}
                  
                  {event.organizer && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="w-5 h-5 text-[#007BFF]" />
                      <span>Organizado por: {event.organizer}</span>
                    </div>
                  )}
                  
                  {event.price_info && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="w-5 h-5 text-[#007BFF]" />
                      <span>{event.price_info}</span>
                    </div>
                  )}
                </div>
                
                {event.description && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-3">Sobre o evento</h2>
                    <div className="text-gray-700 whitespace-pre-line">{event.description}</div>
                  </div>
                )}
                
                {/* Ações do evento */}
                <div className="flex flex-wrap gap-3 mt-6">
                  {event.ticket_url && (
                    <Button 
                      className="bg-[#007BFF] hover:bg-[#0069d9] text-white"
                      onClick={() => window.open(event.ticket_url, '_blank')}
                    >
                      <Ticket className="w-4 h-4 mr-2" />
                      Comprar Ingressos
                    </Button>
                  )}
                  
                  {event.website && (
                    <Button 
                      variant="outline"
                      className="border-[#007BFF] text-[#007BFF] hover:bg-blue-50"
                      onClick={() => window.open(event.website, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Site Oficial
                    </Button>
                  )}
                  
                  <Button variant="ghost" className="text-gray-600 hover:bg-gray-100">
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Galeria de imagens */}
            {event.gallery && event.gallery.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Galeria</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {event.gallery.map((img, index) => (
                    <div key={index} className="h-40 rounded-lg overflow-hidden bg-gray-200">
                      <img 
                        src={img} 
                        alt={`${event.title} - imagem ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="w-full md:w-1/3 mt-6 md:mt-0">
            {/* Informações de contato */}
            {(event.contact_email || event.contact_phone) && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Informações de Contato</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {event.contact_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <a 
                        href={`mailto:${event.contact_email}`} 
                        className="text-[#007BFF] hover:underline"
                      >
                        {event.contact_email}
                      </a>
                    </div>
                  )}
                  
                  {event.contact_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <a 
                        href={`tel:${event.contact_phone}`} 
                        className="text-[#007BFF] hover:underline"
                      >
                        {event.contact_phone}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* NEW: Localização Relacionada (Praias/Cidade) */}
            {renderRelatedLocations()}
            
            {/* Eventos relacionados */}
            {relatedEvents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Eventos Relacionados</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {relatedEvents.map((relEvent) => (
                      <div 
                        key={relEvent.id} 
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`${createPageUrl("EventDetail")}?id=${relEvent.id}`)}
                      >
                        <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-200 flex-shrink-0">
                          {relEvent.image_url ? (
                            <img 
                              src={relEvent.image_url} 
                              alt={relEvent.title} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-blue-50">
                              <Calendar className="w-6 h-6 text-blue-300" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium line-clamp-2">{relEvent.title}</h3>
                          <p className="text-sm text-gray-500">
                            {formatEventDate(relEvent.start_date)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      <PublicFooter />
    </div>
  );
}
