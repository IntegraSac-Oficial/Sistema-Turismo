
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Property } from "@/api/entities";
import { PropertyCategory } from "@/api/entities";
import { City } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Plus,
  Search,
  ArrowLeft,
  Filter,
  MapPin,
  RefreshCw,
  Building,
  Bed,
  Bath,
  DollarSign,
  Ruler,
  Car,
  Eye,
  ArrowUpRight,
  User,
  Edit
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import BackButton from "@/components/ui/BackButton";

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "all",
    city: "all",
    type: "all",
    status: "all"
  });

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [propertiesData, categoriesData, citiesData] = await Promise.all([
        Property.list(),
        PropertyCategory.list(),
        City.list()
      ]);

      setProperties(propertiesData || []);
      setCategories(categoriesData || []);
      setCities(citiesData || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados dos imóveis",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProperty = () => {
    navigate(createPageUrl("PropertyForm"));
  };

  const handleEditProperty = (id) => {
    navigate(createPageUrl(`PropertyForm?id=${id}`));
  };

  const formatPrice = (price) => {
    return price?.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || "Categoria não encontrada";
  };

  const getCityName = (cityId) => {
    const city = cities.find(city => city.id === cityId);
    return city?.name || "Cidade não encontrada";
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = 
      property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filters.category === "all" || property.category_id === filters.category;
    const matchesCity = filters.city === "all" || property.city_id === filters.city;
    const matchesType = filters.type === "all" || property.property_type === filters.type;
    const matchesStatus = filters.status === "all" || property.status === filters.status;

    return matchesSearch && matchesCategory && matchesCity && matchesType && matchesStatus;
  });

  const handleViewOnSite = (id) => {
    navigate(createPageUrl(`PropertyDetail?id=${id}`));
  };

  const handleBackToProfile = () => {
    navigate(createPageUrl("RealtorDashboard"));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <BackButton />
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Home className="w-6 h-6 mr-2 text-blue-600" />
              Gerenciar Imóveis
            </h1>
            <p className="text-gray-600">Cadastre e gerencie anúncios de imóveis</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline"
              onClick={handleBackToProfile}
              className="gap-2"
            >
              <User className="w-4 h-4" />
              Voltar para Perfil
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate(createPageUrl("PublicProperties"))}
              className="gap-2"
            >
              <Eye className="w-4 h-4" />
              Ver no Site
            </Button>
            
            <Button 
              onClick={handleCreateProperty}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Imóvel
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    className="pl-10"
                    placeholder="Buscar imóveis..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <select
                  className="rounded-md border border-input bg-background px-3 py-2"
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="all">Todas Categorias</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <select
                  className="rounded-md border border-input bg-background px-3 py-2"
                  value={filters.city}
                  onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                >
                  <option value="all">Todas Cidades</option>
                  {cities.map(city => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>

                <select
                  className="rounded-md border border-input bg-background px-3 py-2"
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="all">Todos Tipos</option>
                  <option value="sale">Venda</option>
                  <option value="rent">Aluguel</option>
                </select>

                <select
                  className="rounded-md border border-input bg-background px-3 py-2"
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="all">Todos Status</option>
                  <option value="active">Ativo</option>
                  <option value="pending">Pendente</option>
                  <option value="sold">Vendido</option>
                  <option value="rented">Alugado</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map(property => (
            <Card 
              key={property.id}
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-video relative">
                {property.main_image_url ? (
                  <img
                    src={property.main_image_url}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <Home className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                
                <div className="absolute top-2 left-2 flex gap-2">
                  <Badge className={property.property_type === 'rent' ? 'bg-purple-600' : 'bg-blue-600'}>
                    {property.property_type === 'rent' ? 'Aluguel' : 'Venda'}
                  </Badge>
                  <Badge className={
                    property.status === 'active' ? 'bg-green-600' :
                    property.status === 'pending' ? 'bg-yellow-600' :
                    property.status === 'sold' ? 'bg-blue-600' :
                    property.status === 'rented' ? 'bg-purple-600' :
                    'bg-gray-600'
                  }>
                    {
                      property.status === 'active' ? 'Ativo' :
                      property.status === 'pending' ? 'Pendente' :
                      property.status === 'sold' ? 'Vendido' :
                      property.status === 'rented' ? 'Alugado' :
                      'Inativo'
                    }
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{property.title}</h3>
                
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{getCityName(property.city_id)}</span>
                </div>

                <div className="text-lg font-bold text-blue-600 mb-3">
                  {formatPrice(property.price)}
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm text-gray-600 mb-4">
                  {property.bedrooms > 0 && (
                    <div className="flex items-center">
                      <Bed className="w-4 h-4 mr-1" />
                      <span>{property.bedrooms}</span>
                    </div>
                  )}
                  {property.bathrooms > 0 && (
                    <div className="flex items-center">
                      <Bath className="w-4 h-4 mr-1" />
                      <span>{property.bathrooms}</span>
                    </div>
                  )}
                  {property.area > 0 && (
                    <div className="flex items-center">
                      <Ruler className="w-4 h-4 mr-1" />
                      <span>{property.area}m²</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewOnSite(property.id)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver no Site
                  </Button>
                  
                  <Button 
                    size="sm"
                    onClick={() => handleEditProperty(property.id)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Home className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Nenhum imóvel encontrado</h3>
            <p className="text-gray-500 mt-2 mb-4">
              Não há imóveis cadastrados com os filtros selecionados.
            </p>
            <Button onClick={handleCreateProperty}>
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Imóvel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
