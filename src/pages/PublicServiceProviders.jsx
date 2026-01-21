
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ServiceProvider } from "@/api/entities";
import { City } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, MapPin, Wrench, Phone, 
  Filter, Hammer, Paintbrush, AlertTriangle, 
  Zap, User, Home, Briefcase
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import BackButton from "@/components/ui/BackButton";

export default function PublicServiceProviders() {
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [cities, setCities] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const providersData = await ServiceProvider.list();
        const citiesData = await City.list();
        
        if (providersData && providersData.length > 0) {
          setProviders(providersData);
        } else {
          setProviders(sampleProviders);
        }
        
        if (citiesData && citiesData.length > 0) {
          setCities(citiesData);
        } else {
          setCities(sampleCities);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setProviders(sampleProviders);
        setCities(sampleCities);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const getCityName = (cityId) => {
    const city = cities.find(c => c.id === cityId);
    return city ? city.name : "Santa Catarina";
  };
  
  const getTypeIcon = (type) => {
    switch (type) {
      case "pintor":
        return Paintbrush;
      case "diarista":
        return Home;
      case "eletricista":
        return Zap;
      case "pedreiro":
        return Hammer;
      default:
        return Briefcase;
    }
  };
  
  const formatType = (type) => {
    const types = {
      "pintor": "Pintor",
      "diarista": "Diarista",
      "eletricista": "Eletricista",
      "pedreiro": "Pedreiro",
      "outros": "Outros serviços"
    };
    
    return types[type] || type;
  };
  
  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || provider.service_type === typeFilter;
    const matchesCity = cityFilter === "all" || provider.city_id === cityFilter;
    const matchesAvailable = !availableOnly || provider.available === true;
    
    return matchesSearch && matchesType && matchesCity && matchesAvailable;
  });

  const viewProviderProfile = (providerId) => {
    navigate(createPageUrl(`PublicServiceProviderDetail?id=${providerId}`));
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 max-w-[1280px]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div>
              <BackButton 
                label="Voltar para Home" 
                to={createPageUrl("Public")} 
              />
              <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{fontFamily: "'Montserrat', sans-serif"}}>
                Prestadores de Serviço
              </h1>
              <p className="text-gray-600">
                Encontre profissionais qualificados para sua casa de praia
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Buscar por nome..."
                  className="pl-10 pr-4 py-2 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[170px]">
                    <div className="flex items-center">
                      <Wrench className="w-4 h-4 mr-2 text-gray-500" />
                      <SelectValue placeholder="Tipo de Serviço" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os serviços</SelectItem>
                    <SelectItem value="pintor">Pintor</SelectItem>
                    <SelectItem value="diarista">Diarista</SelectItem>
                    <SelectItem value="eletricista">Eletricista</SelectItem>
                    <SelectItem value="pedreiro">Pedreiro</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={cityFilter} onValueChange={setCityFilter}>
                  <SelectTrigger className="w-full sm:w-[170px]">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                      <SelectValue placeholder="Cidade" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as cidades</SelectItem>
                    {cities.map(city => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button 
                  variant={availableOnly ? "default" : "outline"}
                  className={`${availableOnly ? "bg-[#007BFF]" : "border-gray-300"}`}
                  onClick={() => setAvailableOnly(!availableOnly)}
                >
                  <span className={availableOnly ? "text-white" : "text-gray-700"}>
                    Somente Disponíveis
                  </span>
                </Button>
                
                <Button className="flex items-center gap-2 bg-[#007BFF] hover:bg-blue-700">
                  <Filter className="w-4 h-4" />
                  <span>Filtrar</span>
                </Button>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="bg-gray-100 rounded-lg overflow-hidden h-64 p-4">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-3 mt-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                  <div className="h-10 bg-gray-200 rounded w-full mt-6"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {filteredProviders.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-16">
                  <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nenhum prestador encontrado</h3>
                  <p className="text-gray-600 max-w-md">
                    Não encontramos prestadores com os filtros selecionados. Tente outros critérios de busca.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProviders.map((provider) => {
                    const TypeIcon = getTypeIcon(provider.service_type);
                    
                    return (
                      <div
                        key={provider.id}
                        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100 p-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                            <TypeIcon className="w-8 h-8" />
                          </div>
                          
                          <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-1">
                              {provider.name}
                            </h2>
                            
                            <div className="flex flex-wrap gap-2 mb-2">
                              <Badge className={`${
                                provider.service_type === 'pintor' ? 'bg-indigo-100 text-indigo-800' :
                                provider.service_type === 'diarista' ? 'bg-purple-100 text-purple-800' :
                                provider.service_type === 'eletricista' ? 'bg-yellow-100 text-yellow-800' :
                                provider.service_type === 'pedreiro' ? 'bg-orange-100 text-orange-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {formatType(provider.service_type)}
                              </Badge>
                              
                              {provider.available ? (
                                <Badge className="bg-green-100 text-green-800">
                                  Disponível
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800">
                                  Indisponível
                                </Badge>
                              )}
                              
                              {provider.is_club_member && (
                                <Badge className="bg-[#FF5722] bg-opacity-10 text-[#FF5722]">
                                  Desconto Clube
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-600 flex items-center mb-1">
                              <MapPin className="h-3.5 w-3.5 mr-1 text-gray-400" />
                              {getCityName(provider.city_id)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {provider.description || 
                             `${formatType(provider.service_type)} profissional com experiência e boas referências.`}
                          </p>
                          
                          <p className="text-sm text-gray-700 font-medium flex items-center mb-4">
                            <Phone className="h-4 w-4 mr-2 text-gray-500" />
                            {provider.phone}
                          </p>
                          
                          <div className="flex gap-2 mt-2">
                            <Button 
                              className="flex-1 bg-[#007BFF] hover:bg-blue-700"
                              onClick={() => viewProviderProfile(provider.id)}
                            >
                              Ver perfil completo
                            </Button>
                            
                            <Button 
                              variant="outline"
                              className="border-gray-300"
                              onClick={() => {}}
                            >
                              <Phone className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      <PublicFooter />
    </div>
  );
}

const sampleCities = [
  { id: "1", name: "Florianópolis" },
  { id: "2", name: "Balneário Camboriú" },
  { id: "3", name: "Bombinhas" },
  { id: "4", name: "Itapema" },
  { id: "5", name: "Garopaba" }
];

const sampleProviders = [
  {
    id: "1",
    name: "João Silva",
    service_type: "pintor",
    city_id: "1",
    phone: "(48) 99123-4567",
    description: "Pintor profissional com mais de 10 anos de experiência, especializado em casas de praia.",
    available: true,
    is_club_member: true,
    discount_type: "percentual",
    discount_value: 15
  },
  {
    id: "2",
    name: "Maria Oliveira",
    service_type: "diarista",
    city_id: "2",
    phone: "(47) 98765-4321",
    description: "Diarista com experiência em limpeza de apartamentos, casas e flats.",
    available: true,
    is_club_member: true,
    discount_type: "percentual",
    discount_value: 10
  },
  {
    id: "3",
    name: "Pedro Santos",
    service_type: "eletricista",
    city_id: "3",
    phone: "(47) 99876-5432",
    description: "Eletricista credenciado, realiza instalações, reparos e manutenções elétricas.",
    available: false,
    is_club_member: false
  },
  {
    id: "4",
    name: "Ana Costa",
    service_type: "diarista",
    city_id: "1",
    phone: "(48) 98765-8765",
    description: "Diarista com referências, atende casas de praia e apartamentos.",
    available: true,
    is_club_member: false
  },
  {
    id: "5",
    name: "Carlos Souza",
    service_type: "pedreiro",
    city_id: "2",
    phone: "(47) 99988-7766",
    description: "Pedreiro e mestre de obras, realiza reformas e construções em geral.",
    available: true,
    is_club_member: true,
    discount_type: "fixo",
    discount_value: 50
  },
  {
    id: "6",
    name: "Mariana Ferreira",
    service_type: "outros",
    city_id: "1",
    phone: "(48) 99555-6666",
    description: "Paisagista especializada em jardins para casas de praia e condomínios.",
    available: true,
    is_club_member: false
  },
  {
    id: "7",
    name: "Roberto Almeida",
    service_type: "eletricista",
    city_id: "4",
    phone: "(47) 98888-7777",
    description: "Eletricista com especialização em automação residencial e instalações em áreas litorâneas.",
    available: true,
    is_club_member: true,
    discount_type: "percentual",
    discount_value: 20
  },
  {
    id: "8",
    name: "Patricia Lima",
    service_type: "diarista",
    city_id: "5",
    phone: "(48) 99444-3333",
    description: "Diarista com mais de 8 anos de experiência, atende casas e apartamentos de temporada.",
    available: false,
    is_club_member: false
  },
  {
    id: "9",
    name: "Fernando Dias",
    service_type: "pintor",
    city_id: "3",
    phone: "(47) 99222-1111",
    description: "Pintor especializado em pinturas residenciais internas e externas, verniz e texturas.",
    available: true,
    is_club_member: true,
    discount_type: "percentual",
    discount_value: 15
  }
];
