
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { City } from '@/api/entities';
import { Beach } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Search, 
  Plus, 
  Filter, 
  Edit, 
  Waves, 
  MapPin,
  ChevronLeft,
  ChevronRight,
  Users,
  Store,
  Wrench,
  DollarSign,
  Star
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Business } from '@/api/entities';
import { ServiceProvider } from '@/api/entities';

export default function Cities() {
  const [cities, setCities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [beachesCount, setBeachesCount] = useState({});
  const [businessesCount, setBusinessesCount] = useState({});
  const [serviceProvidersCount, setServiceProvidersCount] = useState({});
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 9;
  
  const navigate = useNavigate();

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    try {
      setIsLoading(true);
      
      const citiesData = await City.list();
      const uniqueCities = [];
      const cityNames = new Set();
      
      if (citiesData && citiesData.length > 0) {
        citiesData.forEach(city => {
          if (city.name && !cityNames.has(city.name.toLowerCase())) {
            cityNames.add(city.name.toLowerCase());
            uniqueCities.push(city);
          }
        });
      }
      
      setCities(uniqueCities);
      setTotalItems(uniqueCities.length);
      
      const beachesData = await Beach.list();
      const beachesByCityId = {};
      
      beachesData.forEach(beach => {
        if (beach.city_id) {
          beachesByCityId[beach.city_id] = (beachesByCityId[beach.city_id] || 0) + 1;
        }
      });
      
      setBeachesCount(beachesByCityId);
      
      const businessesData = await Business.list();
      const businessesByCityId = {};
      
      businessesData.forEach(business => {
        if (business.city_id) {
          businessesByCityId[business.city_id] = (businessesByCityId[business.city_id] || 0) + 1;
        }
      });
      
      setBusinessesCount(businessesByCityId);
      
      const providersData = await ServiceProvider.list();
      const providersByCityId = {};
      
      providersData.forEach(provider => {
        if (provider.city_id) {
          providersByCityId[provider.city_id] = (providersByCityId[provider.city_id] || 0) + 1;
        }
      });
      
      setServiceProvidersCount(providersByCityId);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const getFilteredCities = () => {
    if (!searchTerm.trim()) return cities;
    
    return cities.filter(city => 
      city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (city.description && city.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const filteredCities = getFilteredCities();
  const totalPages = Math.ceil(filteredCities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleCities = filteredCities.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const getCityRating = (cityId) => {
    const baseValue = parseInt(cityId?.substring(0, 8), 16) || 0;
    return (3.5 + (baseValue % 20) / 10).toFixed(1);
  };

  return (
    <div className="container mx-auto p-4">
      <Button
        variant="ghost"
        onClick={() => navigate(createPageUrl("AdminDashboard"))}
        className="mb-4 text-gray-600 hover:text-gray-800 flex items-center"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Voltar para Dashboard
      </Button>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2 flex items-center">
            <Building2 className="mr-2 h-6 w-6" />
            Cidades
          </h1>
          <p className="text-gray-600">Gerencie as cidades do litoral catarinense</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar cidade..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          
          <Button 
            onClick={() => navigate(createPageUrl('CityForm'))}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Cidade
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden h-[420px] animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <CardContent className="p-4">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
                
                <div className="space-y-2 mt-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center">
                      <div className="w-4 h-4 bg-gray-200 rounded-full mr-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-9 bg-gray-200 rounded w-28"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCities.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">Nenhuma cidade encontrada</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm ? `Não encontramos resultados para "${searchTerm}"` : 'Não há cidades cadastradas no sistema.'}
          </p>
          <Button
            onClick={() => navigate(createPageUrl('CityForm'))}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Cidade
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleCities.map((city) => {
              const numBeaches = city.beaches_count || beachesCount[city.id] || 0;
              const numBusinesses = businessesCount[city.id] || 0;
              const numProviders = serviceProvidersCount[city.id] || 0;
              const rating = getCityRating(city.id);
              
              return (
                <Card key={city.id} className="overflow-hidden hover:shadow-lg transition-shadow border border-gray-200">
                  <div className="relative h-48">
                    <img
                      src={city.image_url || "https://images.unsplash.com/photo-1565876427310-7466ecafdf96?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"}
                      alt={city.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">{city.name}</h3>
                          <div className="flex items-center text-white/90 text-sm">
                            <MapPin className="w-3.5 h-3.5 mr-1" />
                            <span>{city.state || 'Santa Catarina'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 bg-yellow-400/90 text-gray-900 px-2 py-1 rounded text-sm font-medium">
                          <Star className="w-3.5 h-3.5" />
                          {rating}
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {city.description || 'Capital do estado, conhecida por suas belas praias, cultura açoriana e qualidade de vida.'}
                    </p>
                    
                    <div className="grid grid-cols-1 gap-2 mb-4">
                      <div className="flex items-center text-gray-700">
                        <Waves className="w-4 h-4 mr-2 text-blue-600" />
                        <span>{numBeaches} {numBeaches === 1 ? 'praia' : 'praias'}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-700">
                        <Store className="w-4 h-4 mr-2 text-blue-600" />
                        <span>{numBusinesses} {numBusinesses === 1 ? 'comércio' : 'comércios'}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-700">
                        <Wrench className="w-4 h-4 mr-2 text-blue-600" />
                        <span>{numProviders} {numProviders === 1 ? 'prestador' : 'prestadores'} de serviço</span>
                      </div>
                      
                      {city.population && (
                        <div className="flex items-center text-gray-700">
                          <Users className="w-4 h-4 mr-2 text-blue-600" />
                          <span>{Number(city.population).toLocaleString()} habitantes</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(createPageUrl(`CityForm?id=${city.id}`))}
                        className="border-blue-600 text-blue-600 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      
                      <Button
                        size="sm"
                        onClick={() => navigate(createPageUrl(`CityDetail?id=${city.id}`))}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Ver detalhes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(page)}
                      className={currentPage === page ? "bg-blue-600 text-white" : ""}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
