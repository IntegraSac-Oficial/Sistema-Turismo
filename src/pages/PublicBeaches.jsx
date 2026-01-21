
import React, { useState, useEffect } from "react";
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import BackButton from '@/components/ui/BackButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Waves, 
  Search,
  MapPin,
  Info,
  ArrowRight,
  Star,
  Droplets,
  Wind,
  Sun,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Beach } from '@/api/entities';
import { City } from '@/api/entities';
import { SiteConfig } from '@/api/entities';
import { useToast } from "@/components/ui/use-toast"

export default function PublicBeaches() {
  const navigate = useNavigate();
  const [beaches, setBeaches] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedFeature, setSelectedFeature] = useState("all");
  const [siteConfig, setSiteConfig] = useState(null);
  const { toast } = useToast()
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      setLoading(true);
      
      const configs = await SiteConfig.list();
      if (configs && configs.length > 0) {
        setSiteConfig(configs[0]);
      }
      
      await loadCities();
      
      const beachesData = await Beach.list();
      setBeaches(beachesData || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCities = async () => {
    try {
      const citiesData = await City.list();
      
      // Filtrar cidades inválidas e garantir dados mínimos
      const validCities = citiesData.filter(city => city && city.id).map(city => ({
        ...city,
        name: city.name || "Cidade sem nome",
        state: city.state || "Santa Catarina"
      }));
      
      setCities(validCities);
    } catch (error) {
      console.error("Erro ao carregar cidades:", error);
      toast({
        title: "Aviso",
        description: "Algumas informações das cidades podem estar incompletas",
        variant: "warning"
      });
    }
  };
  
  const filteredBeaches = beaches.filter(beach => {
    const matchesSearch = beach.name && beach.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === "all" || beach.city_id === selectedCity;
    const matchesFeature = selectedFeature === "all" || 
      (beach.features && beach.features.includes(selectedFeature));
    return matchesSearch && matchesCity && matchesFeature;
  });
  
  const handleBeachClick = (beachId) => {
    navigate(`${createPageUrl("PublicBeachDetail")}?id=${beachId}`);
  };
  
  const cityOptions = [
    { value: "all", label: "Todas Cidades" },
    ...(cities?.map(city => ({ value: city.id, label: city.name })) || [])
  ];
  
  const features = [
    { value: "all", label: "Todas Características" },
    { value: "surf", label: "Surf" },
    { value: "family", label: "Família" },
    { value: "calm", label: "Mar Calmo" },
    { value: "structure", label: "Infraestrutura" },
    { value: "natural", label: "Natural" }
  ];
  
  const getSeaTypeIcon = (seaType) => {
    switch(seaType) {
      case "calmo":
        return <Droplets className="text-blue-500" />;
      case "ondas_leves":
        return <Wind className="text-blue-400" />;
      case "ondas_medias":
      case "ondas_fortes":
        return <Wind className="text-blue-600" />;
      case "piscina_natural":
        return <Droplets className="text-emerald-500" />;
      default:
        return <Droplets className="text-blue-500" />;
    }
  };
  
  const getSeaTypeLabel = (seaType) => {
    const labels = {
      "calmo": "Mar Calmo",
      "ondas_leves": "Ondas Leves",
      "ondas_medias": "Ondas Médias",
      "ondas_fortes": "Ondas Fortes",
      "piscina_natural": "Piscina Natural"
    };
    return labels[seaType] || "Mar Calmo";
  };
  
  const getCityName = (cityId) => {
    const city = cities.find(c => c.id === cityId);
    return city ? city.name : "Cidade não encontrada";
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader siteConfig={siteConfig} />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 max-w-[1280px]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div>
              <BackButton 
                label="Voltar para Home" 
                to={createPageUrl("Public")} 
              />
              <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{fontFamily: "'Montserrat', sans-serif"}}>
                Praias
              </h1>
              <p className="text-gray-600">
                Descubra as mais belas praias de Santa Catarina
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 w-full md:w-auto">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Buscar praia..."
                    className="pl-10 pr-4 py-2 w-full md:w-[250px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select
                  className="px-4 py-2 border border-gray-300 rounded-md bg-white"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                >
                  {cityOptions.map(city => (
                    <option key={city.value} value={city.value}>
                      {city.label}
                    </option>
                  ))}
                </select>
                <select
                  className="px-4 py-2 border border-gray-300 rounded-md bg-white"
                  value={selectedFeature}
                  onChange={(e) => setSelectedFeature(e.target.value)}
                >
                  {features.map(feature => (
                    <option key={feature.value} value={feature.value}>
                      {feature.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-80 bg-gray-100 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : (
            <>
              {filteredBeaches.length === 0 ? (
                <div className="text-center py-12">
                  <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhuma praia encontrada</h3>
                  <p className="text-gray-600">Tente ajustar seus filtros ou termos de busca.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBeaches.map(beach => (
                    <div 
                      key={beach.id} 
                      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                      onClick={() => handleBeachClick(beach.id)}
                    >
                      <div className="h-48 overflow-hidden relative">
                        <img 
                          src={beach.image_url || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1473&q=80"} 
                          alt={beach.name} 
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {getCityName(beach.city_id)}
                          </Badge>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-4">
                          <h3 className="text-xl font-bold">{beach.name}</h3>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {beach.features && beach.features.map((feature, index) => (
                            <Badge key={index} variant="outline" className="bg-gray-50">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex justify-between mb-3">
                          <div className="flex items-center gap-1">
                            {getSeaTypeIcon(beach.sea_type)}
                            <span className="text-sm text-gray-600">{getSeaTypeLabel(beach.sea_type)}</span>
                          </div>
                          {beach.is_crowded && (
                            <div className="flex items-center">
                              <Users className="h-4 w-4 text-orange-500 mr-1" />
                              <span className="text-sm text-gray-600">Movimentada</span>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-4 text-sm line-clamp-2">{beach.description}</p>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-amber-500 mr-1" fill="#FFC107" />
                            <span className="font-medium">4.5</span>
                          </div>
                          <Button className="text-[#007BFF] bg-blue-50 hover:bg-blue-100 flex items-center gap-1" onClick={() => handleBeachClick(beach.id)}>
                            Ver detalhes
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      <PublicFooter siteConfig={siteConfig} />
    </div>
  );
}
