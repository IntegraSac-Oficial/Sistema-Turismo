import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Beach } from "@/api/entities";
import { City } from "@/api/entities";
import { Business } from "@/api/entities";
import { SiteConfig } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Waves, 
  Store, 
  Search, 
  ArrowLeft, 
  Filter,
  Star,
  Sun,
  Umbrella,
  Map,
  UserCheck,
  Car,
  Coffee,
  Wifi,
  ShowerHead,
  Accessibility,
  Bike,
  Phone,
  Clock,
  Percent
} from "lucide-react";

export default function BeachesByCity() {
  const navigate = useNavigate();
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const cityId = urlParams.get("cityId");

  const [city, setCity] = useState(null);
  const [beaches, setBeaches] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBeaches, setFilteredBeaches] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [activeTab, setActiveTab] = useState("beaches");
  const [siteConfig, setSiteConfig] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (!cityId) {
      navigate(createPageUrl("PublicCities"));
      return;
    }
    
    loadData();
  }, [cityId]);

  useEffect(() => {
    if (beaches.length > 0) {
      filterBeaches();
    }
    
    if (businesses.length > 0) {
      filterBusinesses();
    }
  }, [searchTerm, beaches, businesses]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Carregar configurações do site
      const configs = await SiteConfig.list();
      if (configs && configs.length > 0) {
        setSiteConfig(configs[0]);
      }
      
      // Carregar usuário atual se estiver logado
      try {
        const userData = await User.me();
        setCurrentUser(userData);
      } catch (error) {
        console.log("Usuário não está logado");
      }
      
      // Carregar dados da cidade
      const cityData = await City.get(cityId);
      if (cityData) {
        setCity(cityData);
        document.title = `${cityData.name} - Praias e Comércios`;
      } else {
        throw new Error("Cidade não encontrada");
      }
      
      // Carregar praias da cidade
      const beachesData = await Beach.filter({ city_id: cityId });
      setBeaches(beachesData || []);
      setFilteredBeaches(beachesData || []);
      
      // Carregar comércios da cidade
      const businessesData = await Business.filter({ city_id: cityId });
      setBusinesses(businessesData || []);
      setFilteredBusinesses(businessesData || []);
      
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      alert("Erro ao carregar dados da cidade ou praias");
      navigate(createPageUrl("PublicCities"));
    } finally {
      setIsLoading(false);
    }
  };

  const filterBeaches = () => {
    if (!searchTerm.trim()) {
      setFilteredBeaches(beaches);
      return;
    }
    
    const filtered = beaches.filter(beach => 
      beach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (beach.description && beach.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    setFilteredBeaches(filtered);
  };

  const filterBusinesses = () => {
    if (!searchTerm.trim()) {
      setFilteredBusinesses(businesses);
      return;
    }
    
    const filtered = businesses.filter(business => 
      business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (business.description && business.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    setFilteredBusinesses(filtered);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <PublicHeader siteConfig={siteConfig} currentUser={currentUser} />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
        <PublicFooter siteConfig={siteConfig} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicHeader siteConfig={siteConfig} currentUser={currentUser} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Cabeçalho da página */}
        <div className="mb-8">
          <button 
            onClick={() => navigate(createPageUrl("PublicCities"))}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span>Voltar para cidades</span>
          </button>
          
          <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white p-6 rounded-xl shadow-md">
            <h1 className="text-3xl font-bold mb-2">{city?.name}</h1>
            <div className="flex items-center">
              <MapPin className="w-5 h-5 mr-1" />
              <span>{city?.state || 'Santa Catarina'}</span>
            </div>
            <p className="mt-2">{city?.description || 'Explore as praias e comércios desta bela cidade.'}</p>
          </div>
        </div>
        
        {/* Barra de pesquisa */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar praias ou comércios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 py-2"
          />
        </div>
        
        {/* Seleção de seção (praias/comércios) */}
        <div className="mb-6">
          <div className="flex space-x-4 border-b border-gray-200">
            <button
              className={`py-2 px-4 font-medium ${activeTab === 'beaches' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('beaches')}
            >
              <div className="flex items-center">
                <Waves className="w-5 h-5 mr-2" />
                <span>Praias ({filteredBeaches.length})</span>
              </div>
            </button>
            
            <button
              className={`py-2 px-4 font-medium ${activeTab === 'businesses' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('businesses')}
            >
              <div className="flex items-center">
                <Store className="w-5 h-5 mr-2" />
                <span>Comércios ({filteredBusinesses.length})</span>
              </div>
            </button>
          </div>
        </div>
        
        {/* Seção de Praias */}
        {activeTab === 'beaches' && (
          <div>
            {filteredBeaches.length === 0 ? (
              <div className="text-center py-10">
                <Waves className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">Nenhuma praia encontrada</h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? `Não encontramos resultados para "${searchTerm}"`
                    : 'Esta cidade ainda não possui praias cadastradas.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBeaches.map(beach => (
                  <Card key={beach.id} className="overflow-hidden hover:shadow-lg transition-shadow border border-gray-200">
                    <div className="relative h-48 bg-gradient-to-r from-blue-300 to-blue-100">
                      {beach.image_url ? (
                        <img 
                          src={beach.image_url} 
                          alt={beach.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Waves className="w-16 h-16 text-blue-500" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                      <div className="absolute bottom-0 left-0 p-4 text-white">
                        <h3 className="text-xl font-bold">{beach.name}</h3>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="text-sm">{city?.name}</span>
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="mb-4">
                        <p className="text-gray-600 line-clamp-2">
                          {beach.description || 'Conheça esta praia incrível.'}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {beach.sea_type && (
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                            <Waves className="w-3.5 h-3.5 mr-1" />
                            {beach.sea_type.replace(/_/g, ' ')}
                          </Badge>
                        )}
                        
                        {beach.main_activity && (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                            <Sun className="w-3.5 h-3.5 mr-1" />
                            {beach.main_activity}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {beach.infrastructure && (
                          <div className="flex items-center text-gray-600">
                            <Umbrella className="w-4 h-4 mr-1 text-blue-500" />
                            <span>Infraestrutura</span>
                          </div>
                        )}
                        
                        {beach.accessibility && (
                          <div className="flex items-center text-gray-600">
                            <Accessibility className="w-4 h-4 mr-1 text-green-500" />
                            <span>Acessibilidade</span>
                          </div>
                        )}
                      </div>
                      
                      <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                        Ver Detalhes
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Seção de Comércios */}
        {activeTab === 'businesses' && (
          <div>
            {filteredBusinesses.length === 0 ? (
              <div className="text-center py-10">
                <Store className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">Nenhum comércio encontrado</h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? `Não encontramos resultados para "${searchTerm}"`
                    : 'Esta cidade ainda não possui comércios cadastrados.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBusinesses.map(business => (
                  <Card key={business.id} className="overflow-hidden hover:shadow-lg transition-shadow border border-gray-200">
                    <div className="relative h-44 bg-gradient-to-r from-yellow-100 to-orange-100">
                      {business.image_url ? (
                        <img 
                          src={business.image_url} 
                          alt={business.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Store className="w-16 h-16 text-orange-500" />
                        </div>
                      )}
                      {business.is_club_member && (
                        <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                          Membro do Clube
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                      <div className="absolute bottom-0 left-0 p-4 text-white">
                        <h3 className="text-xl font-bold">{business.name}</h3>
                        <div className="flex items-center">
                          <Badge className="bg-white/20 backdrop-blur-sm text-white border-none">
                            {business.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="mb-4">
                        <p className="text-gray-600 line-clamp-2">
                          {business.description || 'Conheça este estabelecimento.'}
                        </p>
                        
                        {business.address && (
                          <div className="flex items-start mt-2 text-sm text-gray-500">
                            <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                            <span>{business.address}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {business.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-4 h-4 mr-2 text-blue-500" />
                            <span>{business.phone}</span>
                          </div>
                        )}
                        
                        {business.opening_hours && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2 text-blue-500" />
                            <span>{business.opening_hours}</span>
                          </div>
                        )}
                        
                        {business.is_club_member && business.discount_value && (
                          <div className="flex items-center text-sm text-green-600 font-medium">
                            <Percent className="w-4 h-4 mr-2 text-green-500" />
                            <span>
                              {business.discount_type === 'percentual' 
                                ? `${business.discount_value}% de desconto para membros` 
                                : `R$ ${business.discount_value} de desconto para membros`}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <Button className="w-full mt-4 bg-orange-500 hover:bg-orange-600">
                        Ver Detalhes
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      
      <PublicFooter siteConfig={siteConfig} />
    </div>
  );
}