import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ServiceProvider } from "@/api/entities";
import { City } from "@/api/entities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, MapPin, ArrowLeft, Star, Calendar, Check, X } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

export default function PublicServiceProviderDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [provider, setProvider] = useState(null);
  const [city, setCity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Obter o ID do prestador da URL
  const urlParams = new URLSearchParams(window.location.search);
  const providerId = urlParams.get('id');
  
  useEffect(() => {
    const loadProvider = async () => {
      if (!providerId) {
        setError("ID do prestador não informado");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        // Carregar dados do prestador específico
        const providerData = await ServiceProvider.get(providerId);
        setProvider(providerData);
        
        // Carregar dados da cidade se disponível
        if (providerData.city_id) {
          try {
            const cityData = await City.get(providerData.city_id);
            setCity(cityData);
          } catch (cityError) {
            console.error("Erro ao carregar cidade:", cityError);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar prestador:", error);
        setError("Não foi possível carregar os dados do prestador");
      } finally {
        setLoading(false);
      }
    };
    
    loadProvider();
  }, [providerId]);
  
  const formatServiceType = (type) => {
    const types = {
      "pintor": "Pintor",
      "diarista": "Diarista", 
      "eletricista": "Eletricista",
      "pedreiro": "Pedreiro",
      "outros": "Outros serviços"
    };
    return types[type] || type;
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicHeader />
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }
  
  if (error || !provider) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicHeader />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Prestador não encontrado</h2>
            <p className="text-gray-600 mb-6">{error || "Não foi possível encontrar este prestador de serviço."}</p>
            <Button onClick={() => navigate(createPageUrl("PublicServiceProviders"))}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para prestadores
            </Button>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("PublicServiceProviders"))}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para prestadores
        </Button>
        
        <Card className="overflow-hidden mb-8">
          <CardHeader className="bg-gray-50 border-b">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{provider.name}</h1>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge className="font-medium bg-blue-100 text-blue-800">
                    {formatServiceType(provider.service_type)}
                  </Badge>
                  
                  {provider.available ? (
                    <Badge className="bg-green-100 text-green-700">
                      <Check className="h-3 w-3 mr-1" /> Disponível
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-700">
                      <X className="h-3 w-3 mr-1" /> Indisponível
                    </Badge>
                  )}
                  
                  {provider.is_club_member && (
                    <Badge className="bg-amber-100 text-amber-800">
                      <Star className="h-3 w-3 mr-1" /> Membro do Clube
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-lg font-semibold mb-4">Informações</h2>
                
                <dl className="space-y-4">
                  <div>
                    <dt className="font-medium text-gray-500 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" /> Localização
                    </dt>
                    <dd className="mt-1 ml-6">{city?.name || "Santa Catarina"}</dd>
                  </div>
                  
                  <div>
                    <dt className="font-medium text-gray-500 flex items-center">
                      <Phone className="h-4 w-4 mr-2" /> Contato
                    </dt>
                    <dd className="mt-1 ml-6">{provider.phone}</dd>
                  </div>
                  
                  {provider.available_days && (
                    <div>
                      <dt className="font-medium text-gray-500 flex items-center">
                        <Calendar className="h-4 w-4 mr-2" /> Dias disponíveis
                      </dt>
                      <dd className="mt-1 ml-6">{provider.available_days}</dd>
                    </div>
                  )}
                </dl>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold mb-4">Sobre o serviço</h2>
                <p className="text-gray-700">
                  {provider.description || `${formatServiceType(provider.service_type)} com experiência em Santa Catarina.`}
                </p>
                
                {provider.is_club_member && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <h3 className="font-medium flex items-center text-amber-800">
                      <Star className="h-4 w-4 mr-2" /> Benefício para membros do clube
                    </h3>
                    <p className="mt-2 text-amber-800">
                      {provider.discount_type === "percentual" ? 
                        `${provider.discount_value}% de desconto nos serviços` : 
                        `R$ ${provider.discount_value?.toFixed(2)} de desconto nos serviços`}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-8 flex justify-center">
              <Button 
                className="bg-[#007BFF] hover:bg-blue-700"
                onClick={() => window.location.href = `tel:${provider.phone}`}
              >
                <Phone className="h-4 w-4 mr-2" />
                Entrar em contato
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <PublicFooter />
    </div>
  );
}