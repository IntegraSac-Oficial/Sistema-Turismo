
import React, { useState, useEffect } from "react";
import { ServiceProvider, City } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wrench, Plus, Edit, Trash2, Phone, Star, User } from "lucide-react"; // Adicionar User para currentUser
import { Badge } from "@/components/ui/badge";
import ServiceProviderForm from "../components/service-providers/ServiceProviderForm";
import BackButton from "@/components/ui/BackButton";
import { createPageUrl } from "@/utils"; // Já deve existir
import { useNavigate } from "react-router-dom"; // Já deve existir

export default function ServiceProviders() {
  const [providers, setProviders] = useState([]);
  const [cities, setCities] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isInfluencer, setIsInfluencer] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setCurrentUser(userData);
      // Verificar se o prestador logado também é influenciador
      if (userData.role === 'service_provider' && userData.influencer_id) {
        setIsInfluencer(true);
      }
    }
    loadProviders();
    loadCities();
  }, []);

  const loadProviders = async () => {
    setIsLoading(true);
    const data = await ServiceProvider.list();
    setProviders(data);
    setIsLoading(false);
  };

  const loadCities = async () => {
    const data = await City.list();
    setCities(data);
  };

  const handleCreateProvider = async (providerData) => {
    setIsLoading(true);
    if (selectedProvider) {
      await ServiceProvider.update(selectedProvider.id, providerData);
    } else {
      await ServiceProvider.create(providerData);
    }
    setShowForm(false);
    setSelectedProvider(null);
    await loadProviders();
    setIsLoading(false);
  };

  const handleEditProvider = (provider) => {
    setSelectedProvider(provider);
    setShowForm(true);
  };

  const handleDeleteProvider = async (id) => {
    if (confirm("Tem certeza que deseja excluir este prestador de serviço?")) {
      setIsLoading(true);
      await ServiceProvider.delete(id);
      await loadProviders();
      setIsLoading(false);
    }
  };

  const getCityName = (cityId) => {
    const city = cities.find(c => c.id === cityId);
    return city ? city.name : "Cidade não encontrada";
  };

  const getServiceTypeLabel = (type) => {
    const types = {
      pintor: "Pintor",
      diarista: "Diarista",
      eletricista: "Eletricista",
      pedreiro: "Pedreiro",
      outros: "Outros"
    };
    return types[type] || type;
  };

  const navigateToInfluencerProfile = async () => {
    if (currentUser && (currentUser.role === 'service_provider' || currentUser.role === 'admin') && currentUser.influencer_id) {
      const influencerContext = {
        ...currentUser,
        role: 'influencer',
      };
      localStorage.setItem('currentUser', JSON.stringify(influencerContext));
      sessionStorage.setItem('currentUser', JSON.stringify(influencerContext));
      
      navigate(createPageUrl("InfluencerProfile"));
      window.location.reload();
    } else {
        // Para o caso de admin navegando para um perfil específico ou outro cenário
         navigate(createPageUrl("InfluencerProfile"));
    }
  };


  return (
    <div className="p-6">
      <BackButton />
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Prestadores de Serviços</h1>
          <div className="flex gap-2">
            {/* Botão para Perfil Influenciador se o prestador for um */}
            {isInfluencer && currentUser?.role === 'service_provider' && (
              <Button 
                variant="outline"
                onClick={navigateToInfluencerProfile}
                className="border-amber-500 text-amber-600 hover:bg-amber-50"
              >
                <Star className="w-4 h-4 mr-2" />
                Meu Perfil Influenciador
              </Button>
            )}
            <Button 
              onClick={() => {
                setSelectedProvider(null);
                setShowForm(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Novo Prestador
            </Button>
          </div>
        </div>

         {showForm ? (
          <ServiceProviderForm 
            provider={selectedProvider} 
            cities={cities} 
            onSubmit={handleCreateProvider} 
            onCancel={() => {
              setShowForm(false);
              setSelectedProvider(null);
            }}
            isLoading={isLoading}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-6 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
                    <div className="h-16 bg-gray-200 rounded" />
                  </CardContent>
                </Card>
              ))
            ) : providers.length === 0 ? (
              <div className="col-span-3 text-center py-12">
                <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500">Nenhum prestador cadastrado</h3>
                <p className="text-gray-400 mb-4">Clique no botão acima para adicionar um prestador</p>
              </div>
            ) : (
              providers.map(provider => (
                <Card key={provider.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-semibold">{provider.name}</h3>
                          <Badge 
                            variant="outline" 
                            className={provider.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                          >
                            {provider.available ? "Disponível" : "Indisponível"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-orange-500">{getServiceTypeLabel(provider.service_type)}</Badge>
                          <span className="text-gray-500 text-sm">{getCityName(provider.city_id)}</span>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditProvider(provider)}
                          className="h-8 w-8 text-gray-500 hover:text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteProvider(provider.id)}
                          className="h-8 w-8 text-gray-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mt-3 line-clamp-3">{provider.description}</p>
                    
                    {provider.phone && (
                      <div className="flex items-center mt-2 text-gray-500">
                        <Phone className="h-4 w-4 mr-1" />
                        <span>{provider.phone}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
