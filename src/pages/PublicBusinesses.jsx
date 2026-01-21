
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Business } from "@/api/entities";
import { City } from "@/api/entities";
import { 
  Search, 
  MapPin, 
  Filter, 
  Star, 
  ChevronDown, 
  Building2,
  Store,
  Phone,
  ArrowRight,
  Percent,
  Clock,
  CreditCard,
  Smartphone,
  ShoppingCart
} from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SiteConfig } from "@/api/entities";
import { User } from "@/api/entities";

export default function PublicBusinesses() {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: "all",
    type: "all",
    hasDiscount: false,
    search: ""
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [siteConfig, setSiteConfig] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Carregar configurações do site
        const configs = await SiteConfig.list();
        if (configs && configs.length > 0) {
          setSiteConfig(configs[0]);
        }
        
        // Verificar usuário logado
        try {
          const userData = await User.me();
          setCurrentUser(userData);
        } catch (error) {
          console.log("Usuário não está logado");
        }
        
        // Carregar cidades
        const citiesData = await City.list();
        setCities(citiesData || []);
        
        // Carregar comércios
        const businessesData = await Business.list();
        
        //Filtrar apenas os negócios com assinatura ativa
        const activeBusinesses = businessesData.filter(business => 
          business.subscription_status === "active" &&
          new Date(business.subscription_end_date) > new Date()
        );

        setBusinesses(activeBusinesses || []);
        setFilteredBusinesses(activeBusinesses || []);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Aplicar filtros quando eles mudarem
  useEffect(() => {
    let results = [...businesses];
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      results = results.filter(business => 
        business.business_name?.toLowerCase().includes(searchLower) ||
        business.description?.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.city && filters.city !== "all") {
      results = results.filter(business => business.city_id === filters.city);
    }
    
    if (filters.type && filters.type !== "all") {
      results = results.filter(business => business.business_type === filters.type);
    }
    
    if (filters.hasDiscount) {
      results = results.filter(business => business.is_club_member === true);
    }
    
    setFilteredBusinesses(results);
  }, [filters, businesses]);

  const handleFilter = (key, value) => {
    setFilters({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    setFilters({
      city: "all",
      type: "all",
      hasDiscount: false,
      search: ""
    });
  };

  const getCityName = (cityId) => {
    const city = cities.find(c => c.id === cityId);
    return city ? city.name : "Cidade não informada";
  };

  // Formatação de texto
  const getBusinessTypeText = (type) => {
    const types = {
      "restaurante": "Restaurante",
      "hotel": "Hotel",
      "pousada": "Pousada",
      "loja": "Loja",
      "bar": "Bar",
      "cafe": "Café",
      "outros": "Outros"
    };
    
    return types[type] || "Comércio";
  };

  const viewBusinessDetails = (businessId) => {
    navigate(createPageUrl(`PublicBusinessDetail?id=${businessId}`));
  };

  const viewBusinessCatalog = (e, businessId) => {
    e.stopPropagation();
    navigate(createPageUrl("PublicBusinessDetail") + `?id=${businessId}&showCatalog=true`);
  };

  if (loading) {
    return (
      <>
        <PublicHeader siteConfig={siteConfig} currentUser={currentUser} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <PublicFooter siteConfig={siteConfig} />
      </>
    );
  }

  return (
    <>
      <PublicHeader siteConfig={siteConfig} currentUser={currentUser} />
      
      <div className="bg-gray-50 py-10 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Hero section */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">
              Comércios Parceiros
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Encontre restaurantes, hotéis, pousadas e serviços de qualidade em Santa Catarina
            </p>
          </div>
          
          {/* Search & Filter */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-8 flex flex-col md:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar comércios..."
                className="pl-10"
                value={filters.search}
                onChange={(e) => handleFilter('search', e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Select 
                value={filters.city} 
                onValueChange={(value) => handleFilter('city', value)}
              >
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Cidade" />
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
              
              <Select 
                value={filters.type} 
                onValueChange={(value) => handleFilter('type', value)}
              >
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="restaurante">Restaurantes</SelectItem>
                  <SelectItem value="hotel">Hotéis</SelectItem>
                  <SelectItem value="pousada">Pousadas</SelectItem>
                  <SelectItem value="loja">Lojas</SelectItem>
                  <SelectItem value="bar">Bares</SelectItem>
                  <SelectItem value="cafe">Cafés</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    Mais Filtros
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filtros</SheetTitle>
                    <SheetDescription>
                      Refine sua busca por comércios
                    </SheetDescription>
                  </SheetHeader>
                  <div className="py-6 space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Clube de Descontos</h3>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="hasDiscount"
                          checked={filters.hasDiscount}
                          onChange={(e) => handleFilter('hasDiscount', e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="hasDiscount" className="text-sm text-gray-600">
                          Mostrar apenas comércios com desconto
                        </label>
                      </div>
                    </div>
                    
                    <div className="pt-4 flex justify-between">
                      <Button 
                        variant="outline" 
                        onClick={clearFilters}
                      >
                        Limpar Filtros
                      </Button>
                      <SheetTrigger asChild>
                        <Button>Aplicar</Button>
                      </SheetTrigger>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          
          {/* Results */}
          {filteredBusinesses.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <Store className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Nenhum comércio encontrado</h2>
              <p className="text-gray-600 mb-4">
                Não encontramos comércios com os filtros aplicados.
              </p>
              <Button onClick={clearFilters}>Limpar Filtros</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBusinesses.map(business => (
                <Card key={business.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
                  <div className="relative h-48">
                    {business.image_url ? (
                      <img 
                        src={business.image_url} 
                        alt={business.business_name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center">
                        <Store className="w-16 h-16 text-white" />
                      </div>
                    )}
                    
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-blue-500 text-white">
                        {getBusinessTypeText(business.business_type)}
                      </Badge>
                    </div>
                    
                    {business.is_club_member && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-orange-500 text-white flex items-center gap-1">
                          <Percent className="w-3 h-3" />
                          Desconto Clube
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                        {business.business_name || business.name}
                      </h3>
                      {business.rating && (
                        <div className="flex items-center bg-yellow-100 text-yellow-800 rounded-full px-2 py-0.5 text-sm">
                          <Star className="w-3.5 h-3.5 mr-0.5 fill-yellow-500 text-yellow-500" />
                          <span className="font-medium">{parseFloat(business.rating).toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center text-gray-500 text-sm mb-2">
                      <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{getCityName(business.city_id)}</span>
                    </div>
                    
                    {business.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {business.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {business.opening_hours && (
                        <div className="flex items-center text-gray-500 text-xs px-2 py-1 bg-gray-100 rounded-full">
                          <Clock className="w-3 h-3 mr-1" />
                          {business.opening_hours}
                        </div>
                      )}
                      
                      {business.payment_settings?.payment_methods?.credit_card && (
                        <div className="flex items-center text-gray-500 text-xs px-2 py-1 bg-gray-100 rounded-full">
                          <CreditCard className="w-3 h-3 mr-1" />
                          Cartão
                        </div>
                      )}
                      
                      {business.payment_settings?.payment_methods?.pix && (
                        <div className="flex items-center text-gray-500 text-xs px-2 py-1 bg-gray-100 rounded-full">
                          <Smartphone className="w-3 h-3 mr-1" />
                          Pix
                        </div>
                      )}
                      
                      {business.is_club_member && business.discount_value && (
                        <div className="flex items-center text-green-600 text-xs px-2 py-1 bg-green-50 rounded-full">
                          <Percent className="w-3 h-3 mr-1" />
                          {business.discount_type === "percentual"
                            ? `${business.discount_value}% off`
                            : `R$${business.discount_value.toFixed(2)} off`}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        onClick={(e) => {
                          e.stopPropagation();
                          viewBusinessDetails(business.id);
                        }}
                      >
                        Ver detalhes
                      </Button>
                      <Button 
                        onClick={(e) => viewBusinessCatalog(e, business.id)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Ver Catálogo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <PublicFooter siteConfig={siteConfig} />
    </>
  );
}
