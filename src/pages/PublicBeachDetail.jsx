import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { Beach } from "@/api/entities";
import { City } from "@/api/entities";
import { SiteConfig } from "@/api/entities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Waves, MapPin, Star, Droplets, Wind, Sun, 
  Users, Check, Info, MapPinned, LifeBuoy, 
  Accessibility, Moon, ArrowRightCircle, ChevronLeft,
  Building2, Clock, CalendarRange
} from "lucide-react";
import WeatherCard from '@/components/weather/WeatherCard';

export default function PublicBeachDetail() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [beach, setBeach] = useState(null);
  const [city, setCity] = useState(null);
  const [siteConfig, setSiteConfig] = useState(null);
  
  const urlParams = new URLSearchParams(window.location.search);
  const beachId = urlParams.get('id');
  
  useEffect(() => {
    loadData();
  }, [beachId]);
  
  const loadData = async () => {
    try {
      setLoading(true);
      
      const configs = await SiteConfig.list();
      if (configs && configs.length > 0) {
        setSiteConfig(configs[0]);
      }
      
      if (!beachId) {
        navigate(createPageUrl("PublicBeaches"));
        return;
      }
      
      const beachData = await Beach.get(beachId);
      setBeach(beachData);
      
      if (beachData?.city_id) {
        const cityData = await City.get(beachData.city_id);
        setCity(cityData);
      }
    } catch (error) {
      console.error("Erro ao carregar dados da praia:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !beach) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <Waves className="h-10 w-10 text-blue-400" />
          <p className="mt-4 text-gray-500">Carregando informações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader siteConfig={siteConfig} />
      
      {/* Hero Section com Imagem de Fundo */}
      <div className="relative h-[400px] md:h-[500px]">
        <img 
          src={beach.image_url || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1473&q=80"} 
          alt={beach.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
          <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-8">
            <button 
              onClick={() => navigate(createPageUrl("PublicBeaches"))}
              className="text-white opacity-75 hover:opacity-100 flex items-center mb-4"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Voltar para praias
            </button>
            
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {beach.name}
                </h1>
                <div className="flex items-center text-white/90">
                  <MapPin className="h-5 w-5 mr-1" />
                  <span>{city?.name || 'Santa Catarina'}</span>
                </div>
              </div>
              
              <div className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-1" />
                <span className="text-white font-medium">4.8</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Características Principais */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Principais Características</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {beach.sea_type && (
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <Droplets className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-blue-700">Mar {beach.sea_type.replace(/_/g, ' ')}</span>
                  </div>
                )}
                
                {beach.main_activity && (
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <Sun className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-green-700">{beach.main_activity}</span>
                  </div>
                )}
                
                <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                  <Users className="h-5 w-5 text-purple-500 mr-2" />
                  <span className="text-purple-700">
                    {beach.is_crowded ? 'Movimentada' : 'Tranquila'}
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs de Informações */}
            <Tabs defaultValue="info" className="bg-white rounded-xl shadow-sm p-6">
              <TabsList className="grid grid-cols-3 gap-4 mb-6">
                <TabsTrigger value="info">Informações</TabsTrigger>
                <TabsTrigger value="structure">Estrutura</TabsTrigger>
                <TabsTrigger value="activities">Atividades</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Sobre a Praia</h3>
                  <p className="text-gray-600">
                    {beach.description || `${beach.name} é uma praia localizada em ${city?.name || 'Santa Catarina'}.`}
                  </p>
                </div>
                
                {beach.tourist_attractions && beach.tourist_attractions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Pontos Turísticos Próximos</h3>
                    <div className="space-y-2">
                      {beach.tourist_attractions.map((attraction, index) => (
                        <div key={index} className="flex items-start">
                          <MapPinned className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                          <span className="text-gray-600">{attraction}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="structure" className="space-y-4">
                {beach.infrastructure && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                      <LifeBuoy className="h-5 w-5 text-blue-500 mr-2" />
                      Infraestrutura
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {beach.infrastructure.split(',').map((item, index) => (
                        <div key={index} className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-gray-600">{item.trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {beach.accessibility && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                      <Accessibility className="h-5 w-5 text-blue-500 mr-2" />
                      Acessibilidade
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {beach.accessibility.split(',').map((item, index) => (
                        <div key={index} className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-gray-600">{item.trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="activities" className="space-y-4">
                {beach.activities && beach.activities.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Atividades Disponíveis</h3>
                    <div className="flex flex-wrap gap-2">
                      {beach.activities.map((activity, index) => (
                        <Badge key={index} className="bg-blue-100 text-blue-800">
                          {activity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {beach.nightlife && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                      <Moon className="h-5 w-5 text-blue-500 mr-2" />
                      Vida Noturna
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {beach.nightlife.split(',').map((item, index) => (
                        <div key={index} className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-gray-600">{item.trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Coluna Lateral */}
          <div className="space-y-6">
            {/* Widget do Tempo */}
            <WeatherCard 
              latitude={beach.latitude} 
              longitude={beach.longitude} 
              cityName={city?.name}
            />

            {/* Localização */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <MapPin className="h-5 w-5 text-blue-500 mr-2" />
                Localização
              </h2>

              <div className="aspect-video bg-gray-100 mb-4 rounded-lg overflow-hidden">
                {beach.latitude && beach.longitude ? (
                  <iframe
                    title={`Mapa de ${beach.name}`}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${beach.longitude - 0.01}%2C${beach.latitude - 0.01}%2C${beach.longitude + 0.01}%2C${beach.latitude + 0.01}&layer=mapnik&marker=${beach.latitude}%2C${beach.longitude}`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <MapPin className="h-6 w-6 mr-2" />
                    Localização não disponível
                  </div>
                )}
              </div>

              {beach.latitude && beach.longitude && (
                <a 
                  href={`https://www.openstreetmap.org/?mlat=${beach.latitude}&mlon=${beach.longitude}#map=15/${beach.latitude}/${beach.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm flex items-center"
                >
                  Ver mapa completo
                  <ArrowRightCircle className="h-4 w-4 ml-1" />
                </a>
              )}
            </div>

            {/* Link para cidade */}
            {city && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Building2 className="h-5 w-5 text-blue-500 mr-2" />
                  Sobre {city.name}
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {city.description || `Conheça mais sobre ${city.name} e descubra todas as atrações que a cidade oferece.`}
                </p>
                <Button 
                  onClick={() => navigate(createPageUrl(`PublicCityDetail?id=${city.id}`))}
                  className="w-full"
                >
                  Explorar {city.name}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <PublicFooter siteConfig={siteConfig} />
    </div>
  );
}