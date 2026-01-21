import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Beach } from "@/api/entities";
import { City } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Waves, 
  Search, 
  Plus, 
  Edit, 
  Trash, 
  MapPin, 
  Loader2, 
  ChevronLeft,
  Star,
  Building2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

export default function Beaches() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [beaches, setBeaches] = useState([]);
  const [cities, setCities] = useState([]);
  const [filteredBeaches, setFilteredBeaches] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verifique se há um usuário no localStorage
        const storedUser = localStorage.getItem('currentUser');
        if (!storedUser) {
          navigate(createPageUrl("UserAccount"));
          return;
        }

        const user = JSON.parse(storedUser);
        
        // Verifique se é um administrador (usando o email como identificador)
        if (user.email === 'contato.jrsn@gmail.com') {
          setIsAdmin(true);
          loadData();
        } else {
          toast({
            title: "Acesso negado",
            description: "Você não tem permissão para acessar esta página",
            variant: "destructive"
          });
          navigate(createPageUrl("Public"));
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        navigate(createPageUrl("Public"));
      }
    };

    checkAuth();
  }, [navigate]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [beachesData, citiesData] = await Promise.all([
        Beach.list(),
        City.list()
      ]);
      
      setBeaches(beachesData);
      setFilteredBeaches(beachesData);
      setCities(citiesData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Ocorreu um erro ao carregar as praias e cidades",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      filterBeaches();
    }
  }, [searchQuery, beaches]);

  const filterBeaches = () => {
    if (!searchQuery) {
      setFilteredBeaches(beaches);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = beaches.filter(beach => 
      beach.name.toLowerCase().includes(query) || 
      (beach.description && beach.description.toLowerCase().includes(query)) ||
      getCityNameById(beach.city_id).toLowerCase().includes(query)
    );
    
    setFilteredBeaches(filtered);
  };

  const handleDeleteBeach = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Tem certeza que deseja excluir esta praia?")) {
      return;
    }
    
    try {
      await Beach.delete(id);
      toast({
        title: "Praia excluída",
        description: "A praia foi excluída com sucesso!"
      });
      await loadData();
    } catch (error) {
      console.error("Erro ao excluir praia:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a praia. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleEditBeach = (beach, e) => {
    e.stopPropagation();
    navigate(createPageUrl(`BeachDetail?id=${beach.id}`));
  };

  const getCityNameById = (cityId) => {
    const city = cities.find(c => c.id === cityId);
    return city ? city.name : "N/A";
  };

  const handleViewDetails = (beach) => {
    navigate(createPageUrl(`BeachDetail?id=${beach.id}`));
  };

  const handleNewBeach = () => {
    navigate(createPageUrl("BeachDetail")); // Navegar para a página de cadastro/detalhe de praia
  };

  const getBeachRating = () => {
    // Simulação de rating - pode ser substituída por lógica real
    return (Math.random() * 2 + 3).toFixed(1);
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => navigate(createPageUrl("AdminDashboard"))}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Voltar para Dashboard
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Waves className="mr-2 h-8 w-8 text-blue-500" />
            Praias
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie as praias do litoral catarinense
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar praia..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={handleNewBeach}
            className="md:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Praia
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-lg">Carregando praias...</span>
        </div>
      ) : filteredBeaches.length === 0 ? (
        <div className="text-center py-16">
          <Waves className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Nenhuma praia encontrada</h3>
          <p className="text-gray-600">Não foram encontradas praias com o termo buscado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBeaches.map((beach) => (
            <Card 
              key={beach.id} 
              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleViewDetails(beach)}
            >
              <div className="relative">
                <img
                  src={beach.image_url || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"}
                  alt={beach.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 font-medium rounded-full flex items-center px-2 py-1 text-sm">
                  <Star className="w-4 h-4 mr-1 fill-yellow-900" />
                  {getBeachRating()}
                </div>
                <div className="absolute bottom-0 left-0 p-4 bg-gradient-to-t from-black/70 to-transparent w-full">
                  <h4 className="text-xl font-semibold text-white">{beach.name}</h4>
                  <p className="text-white/80 text-sm flex items-center">
                    <Building2 className="w-4 h-4 mr-1" /> {getCityNameById(beach.city_id)}
                  </p>
                </div>
              </div>
              
              <CardContent className="p-4">
                <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                  {beach.description || `Praia localizada em ${getCityNameById(beach.city_id)}.`}
                </p>
                
                <div className="mb-4">
                  {beach.main_activity && (
                    <Badge className="mr-2 bg-blue-100 text-blue-800 hover:bg-blue-200">
                      {beach.main_activity.replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  )}
                  {beach.sea_type && (
                    <Badge variant="outline">
                      {beach.sea_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  )}
                </div>
                
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleEditBeach(beach, e)}
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleDeleteBeach(beach.id, e)}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}