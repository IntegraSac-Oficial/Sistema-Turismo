
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Property } from "@/api/entities";
import { PropertyCategory } from "@/api/entities";
import { City } from "@/api/entities";
import { Realtor } from "@/api/entities";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Search,
  MapPin,
  Filter,
  ChevronDown,
  Check,
  RefreshCw,
  Bed,
  Bath,
  Car,
  Square,
  Building2,
  DollarSign,
  SlidersHorizontal,
  ArrowUpDown,
  Tag,
  Heart,
  EyeIcon,
  XCircle,
  ArrowRight,
  PanelsTopLeft,
  CircleDollarSign,
  Trash2,
  MapPinned,
  ThumbsUp,
  Calendar,
  Ruler,
  Sparkles,
  ArrowUpCircle,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  Warehouse,
  Building, 
  Store,
  Landmark,
  Hotel,
  LayoutList,
  LayoutGrid,
  Map as MapIcon
} from "lucide-react";
import { PropertyMap } from "@/components/properties/PropertyMap";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFavorites } from "@/components/properties/useFavorites";
import { useToast } from "@/components/ui/use-toast";
import { toast } from "@/components/ui/use-toast";
import { trackSearch, trackEvent } from "@/components/analytics/utils";
import { loadEntityData } from "@/components/services/entityService";
import PropertyMapPopup from '@/components/properties/PropertyMapPopup';

export default function PublicProperties() {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [realtors, setRealtors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [bedroomsFilter, setBedroomsFilter] = useState("all");
  const [bathroomsFilter, setBathroomsFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // grid, list ou map
  const [activeFilters, setActiveFilters] = useState([]); // Para mostrar filtros ativos
  const [filterCount, setFilterCount] = useState(0); // Contador de filtros ativos
  const [propertyCategories, setPropertyCategories] = useState([]);
  const [compareList, setCompareList] = useState([]); // Lista de IDs dos imóveis para comparação
  const [hasSearched, setHasSearched] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const categoriesRef = useRef(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  
  // Para abas na seção principal
  const [selectedTab, setSelectedTab] = useState("todos");

  // Substituir a lógica de favoritos anterior com o hook
  const { favoriteIds, toggleFavorite, isFavorite } = useFavorites();
  const navigate = useNavigate(); // Use navigate
  
  useEffect(() => {
    loadData();
    loadPropertyCategories();
  }, []);
  
  useEffect(() => {
    
    // Rastreia buscas de imóveis
    if (hasSearched) {
      trackSearch(searchQuery || 'filtros', filteredProperties.length, 'properties');
    }
    
    // Rastreia mudanças de visualização
    if (viewMode && !isLoading) {
      trackEvent('view_mode_change', { 
        view_mode: viewMode,
        properties_count: filteredProperties.length
      });
    }
  }, [filteredProperties, hasSearched, searchQuery, viewMode, isLoading]);
  
  useEffect(() => {
    filterProperties();
  }, [
    properties, 
    searchTerm, 
    selectedCity, 
    selectedCategory, 
    selectedType, 
    priceRange, 
    bedroomsFilter, 
    bathroomsFilter,
    sortBy,
    selectedTab,
    favoriteIds
  ]);

  const loadPropertyCategories = async () => {
    try {
      const categories = await loadEntityData(
        PropertyCategory, 
        'PropertyCategory', 
        cat => cat.is_active, 
        false
      );
      setPropertyCategories(categories || []);
    } catch (error) {
      console.error("Erro ao carregar categorias de imóveis:", error);
    }
  };
  
  // Função para obter ícone da categoria
  const getCategoryIcon = (iconName) => {
    const icons = {
      'Home': <Home className="w-5 h-5" />,
      'Building': <Building className="w-5 h-5" />,
      'Building2': <Building2 className="w-5 h-5" />,
      'Warehouse': <Warehouse className="w-5 h-5" />,
      'Store': <Store className="w-5 h-5" />,
      'Landmark': <Landmark className="w-5 h-5" />,
      'Hotel': <Hotel className="w-5 h-5" />
    };
    
    return icons[iconName] || <Home className="w-5 h-5" />;
  };

  // Função para navegar no carrossel
  const scrollCategories = (direction) => {
    if (categoriesRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      categoriesRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  
  // Atualizar a função de filtragem para também lidar com a aba de favoritos
  

  

  

  // Atualizar contador de filtros
  useEffect(() => {
    let count = 0;
    if (selectedCity !== "all") count++;
    if (selectedCategory !== "all") count++;
    if (selectedType !== "all") count++;
    if (priceRange.min) count++;
    if (priceRange.max) count++;
    if (bedroomsFilter !== "all") count++;
    if (bathroomsFilter !== "all") count++;
    
    setFilterCount(count);
    
    // Atualizar filtros ativos para exibição
    const newActiveFilters = [];
    
    if (selectedCity !== "all") {
      const cityName = getCityName(selectedCity);
      newActiveFilters.push({
        id: 'city',
        label: `Cidade: ${cityName}`,
        clear: () => setSelectedCity("all")
      });
    }
    
    if (selectedCategory !== "all") {
      const categoryName = getCategoryName(selectedCategory);
      newActiveFilters.push({
        id: 'category',
        label: `Categoria: ${categoryName}`,
        clear: () => setSelectedCategory("all")
      });
    }
    
    if (selectedType !== "all") {
      const typeLabels = { sale: "Venda", rent: "Aluguel", temporary: "Temporada" };
      newActiveFilters.push({
        id: 'type',
        label: `Tipo: ${typeLabels[selectedType]}`,
        clear: () => setSelectedType("all")
      });
    }
    
    if (priceRange.min) {
      newActiveFilters.push({
        id: 'price_min',
        label: `Preço mín: R$ ${Number(priceRange.min).toLocaleString('pt-BR')}`,
        clear: () => setPriceRange(prev => ({ ...prev, min: "" }))
      });
    }
    
    if (priceRange.max) {
      newActiveFilters.push({
        id: 'price_max',
        label: `Preço máx: R$ ${Number(priceRange.max).toLocaleString('pt-BR')}`,
        clear: () => setPriceRange(prev => ({ ...prev, max: "" }))
      });
    }
    
    if (bedroomsFilter !== "all") {
      newActiveFilters.push({
        id: 'bedrooms',
        label: `Quartos: ${bedroomsFilter === "4+" ? "4 ou mais" : bedroomsFilter}`,
        clear: () => setBedroomsFilter("all")
      });
    }
    
    if (bathroomsFilter !== "all") {
      newActiveFilters.push({
        id: 'bathrooms',
        label: `Banheiros: ${bathroomsFilter === "3+" ? "3 ou mais" : bathroomsFilter}`,
        clear: () => setBathroomsFilter("all")
      });
    }
    
    setActiveFilters(newActiveFilters);
  }, [selectedCity, selectedCategory, selectedType, priceRange, bedroomsFilter, bathroomsFilter, categories, cities]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [propertiesData, categoriesData, citiesData, realtorsData] = await Promise.allSettled([
        loadEntityData(Property, 'Property', p => p.status === 'active' && p.main_image_url),
        loadEntityData(PropertyCategory, 'PropertyCategory'),
        loadEntityData(City, 'City'),
        loadEntityData(Realtor, 'Realtor')
      ]);

      // Usar os dados que foram carregados com sucesso
      if (propertiesData.status === 'fulfilled') {
        setProperties(propertiesData.value || []);
        setFilteredProperties(propertiesData.value || []);
      }
      if (categoriesData.status === 'fulfilled') {
        setCategories(categoriesData.value || []);
      }
      if (citiesData.status === 'fulfilled') {
        setCities(citiesData.value || []);
      }
      if (realtorsData.status === 'fulfilled') {
        setRealtors(realtorsData.value || []);
      }

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro ao carregar alguns dados",
        description: "Os dados serão atualizados automaticamente em alguns instantes",
        variant: "warning"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterProperties = () => {
    let results = [...properties];
    
    // Filtrar por aba
    if (selectedTab === "venda") {
      results = results.filter(property => property.property_type === "sale");
    } else if (selectedTab === "aluguel") {
      results = results.filter(property => property.property_type === "rent");
    } else if (selectedTab === "temporada") {
      results = results.filter(property => property.property_type === "temporary");
    } else if (selectedTab === "favoritos") {
      results = results.filter(property => favoriteIds.includes(property.id));
    }
    
    // Text search
    if (searchTerm) {
      results = results.filter(property => 
        property.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        property.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.neighborhood?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // City filter
    if (selectedCity !== "all") {
      results = results.filter(property => property.city_id === selectedCity);
    }
    
    // Category filter (este 'selectedCategory' vem do Accordion/Select principal de filtros)
    // Se uma categoria específica foi selecionada pelos botões de categoria, ela já estará em selectedCategory.
    if (selectedCategory !== "all") {
      results = results.filter(property => property.category_id === selectedCategory);
    }
    
    // Property type filter
    if (selectedType !== "all") {
      results = results.filter(property => property.property_type === selectedType);
    }
    
    // Price range filter
    if (priceRange.min) {
      results = results.filter(property => 
        property.price >= parseFloat(priceRange.min)
      );
    }
    
    if (priceRange.max) {
      results = results.filter(property => 
        property.price <= parseFloat(priceRange.max)
      );
    }
    
    // Bedrooms filter
    if (bedroomsFilter !== "all") {
      if (bedroomsFilter === "4+") {
        results = results.filter(property => property.bedrooms >= 4);
      } else {
        results = results.filter(property => 
          property.bedrooms === parseInt(bedroomsFilter)
        );
      }
    }
    
    // Bathrooms filter
    if (bathroomsFilter !== "all") {
      if (bathroomsFilter === "3+") {
        results = results.filter(property => property.bathrooms >= 3);
      } else {
        results = results.filter(property => 
          property.bathrooms === parseInt(bathroomsFilter)
        );
      }
    }
    
    // Sorting
    switch(sortBy) {
      case "price_asc":
        results.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        results.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        results.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        break;
      case "oldest":
        results.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
        break;
      case "area_desc":
        results.sort((a, b) => (b.area || 0) - (a.area || 0));
        break;
      case "bedrooms_desc":
        results.sort((a, b) => (b.bedrooms || 0) - (a.bedrooms || 0));
        break;
      default:
        break;
    }
    
    setFilteredProperties(results);
    setHasSearched(true);
    setSearchQuery(searchTerm);
  };
  
  // Função para quando um botão de categoria de imóvel é clicado
  const handlePropertyCategoryFilterClick = (categoryId) => {
    if (selectedCategory === categoryId) { // Se já está selecionado, deseleciona (mostra todos)
        setSelectedCategory("all");
    } else {
        setSelectedCategory(categoryId);
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || "";
  };

  const getCityName = (cityId) => {
    const city = cities.find(city => city.id === cityId);
    return city?.name || "";
  };

  const getRealtorName = (realtorId) => {
    const realtor = realtors.find(r => r.id === realtorId);
    return realtor?.company_name || "Imobiliária não informada";
  };
  
  const getRealtor = (realtorId) => {
    return realtors.find(r => r.id === realtorId);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCity("all");
    setSelectedCategory("all");
    setSelectedType("all");
    setPriceRange({ min: "", max: "" });
    setBedroomsFilter("all");
    setBathroomsFilter("all");
    setSortBy("newest");
    setHasSearched(false);
    setSearchQuery("");
  };

  const formatPrice = (price) => {
    if (!price) return "Preço sob consulta";
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  // Adicionar handler para clicar no marcador do mapa
  const handleMarkerClick = (property) => {
    setSelectedProperty(property);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicHeader />
        <div className="flex items-center justify-center min-h-[50vh]">
          <RefreshCw className="h-12 w-12 animate-spin text-blue-600" />
        </div>
        <PublicFooter />
      </div>
    );
  }
  
  // Property type badges
  const propertyTypeLabels = {
    sale: "Venda",
    rent: "Aluguel",
    temporary: "Temporada"
  };
  
  const propertyTypeColors = {
    sale: "bg-blue-600",
    rent: "bg-purple-600",
    temporary: "bg-teal-600"
  };

  // Adicionar função para busca por região no mapa
  const handleRegionSearch = (bounds) => {
    // Filtrar propriedades dentro da região selecionada
    const propertiesInRegion = properties.filter(property => {
      if (!property.latitude || !property.longitude) return false;
      
      return (
        property.latitude <= bounds.north &&
        property.latitude >= bounds.south &&
        property.longitude <= bounds.east &&
        property.longitude >= bounds.west
      );
    });
    
    if (propertiesInRegion.length > 0) {
      setFilteredProperties(propertiesInRegion);
      toast({
        title: `${propertiesInRegion.length} imóveis encontrados`,
        description: "Mostrando imóveis na região selecionada",
        variant: "default"
      });
    } else {
      toast({
        title: "Nenhum imóvel encontrado",
        description: "Não há imóveis cadastrados na região selecionada",
        variant: "destructive"
      });
    }
  };

  // Função para adicionar ou remover imóvel da lista de comparação
  const toggleCompare = (propertyId) => {
    if (compareList.includes(propertyId)) {
      setCompareList(compareList.filter(id => id !== propertyId));
      toast({
        title: "Imóvel removido da comparação",
        variant: "default"
      });
    } else {
      if (compareList.length < 4) { // Limite de 4 imóveis para comparação
        setCompareList([...compareList, propertyId]);
        toast({
          title: "Imóvel adicionado para comparação",
          variant: "default"
        });
      } else {
        toast({
          title: "Limite de comparação atingido",
          description: "Você pode comparar até 4 imóveis por vez.",
          variant: "warning"
        });
      }
    }
  };

  const handleToggleFavorite = (propertyId) => {
    toggleFavorite(propertyId);
    
    // Rastrear evento de favoritar/desfavoritar
    trackEvent(
      isFavorite(propertyId) ? 'property_unfavorite' : 'property_favorite',
      { property_id: propertyId }
    );
  };
  
  // Função para renderizar a listagem de propriedades com base no modo de visualização
  function PropertyListings({ properties, viewMode, toggleFavorite, isFavorite, cities, categories, realtors, onRegionSearch, compareList, onToggleCompare, selectedTab, resetFilters, setSelectedTab }) {
    if (properties.length === 0 && selectedTab !== 'favoritos') { // Modificado para não mostrar se for aba de favoritos vazia
      return (
        <div className="flex flex-col items-center justify-center p-12">
          <Home className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Nenhum imóvel encontrado</h2>
          <p className="text-gray-600 text-center max-w-md mb-6">
            Não encontramos imóveis com os critérios selecionados. Tente ajustar seus filtros para ver mais resultados.
          </p>
          <Button onClick={resetFilters}> {/* Mudado para resetFilters */}
            <RefreshCw className="w-4 h-4 mr-2" />
            Limpar Filtros
          </Button>
        </div>
      );
    }
    
    if (selectedTab === 'favoritos' && properties.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <Heart className="w-16 h-16 text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Nenhum favorito adicionado</h2>
                <p className="text-gray-600 text-center max-w-md mb-6">
                    Você ainda não adicionou nenhum imóvel aos seus favoritos. Explore os imóveis e clique no coração para favoritá-los.
                </p>
                 <Button onClick={() => setSelectedTab("todos")}>
                    <Search className="w-4 h-4 mr-2" />
                    Explorar Imóveis
                </Button>
            </div>
        );
    }


    // Verificar se as propriedades têm coordenadas
    const validMappableProperties = properties.filter(p => p.latitude && p.longitude);
    
    // Renderizar mapa se o modo de visualização for map
    if (viewMode === 'map') {
      if (validMappableProperties.length === 0) {
        return (
          <div className="bg-white p-8 rounded-lg shadow-md text-center min-h-[400px] flex flex-col justify-center items-center">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Não foi possível mostrar o mapa</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Os imóveis filtrados não possuem coordenadas de localização cadastradas.
              Tente outros filtros ou visualize como lista.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => setViewMode('grid')}>
                <LayoutGrid className="w-4 h-4 mr-2" />
                Ver como grade
              </Button>
              <Button variant="outline" onClick={() => setViewMode('list')}>
                <LayoutList className="w-4 h-4 mr-2" />
                Ver como lista
              </Button>
            </div>
          </div>
        );
      }
      
      return (
        <PropertyMap 
          properties={validMappableProperties} // Passar apenas imóveis com coordenadas
          cities={cities}
          categories={categories}
          realtors={realtors}
          onRegionSearch={onRegionSearch}
          mapHeight="700px"
          onMarkerClick={handleMarkerClick}
        />
      );
    }

    // Para os outros modos de visualização...
    return viewMode === 'grid' ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 p-4">
        {properties.map(property => (
          <PropertyCard 
            key={property.id}
            property={property}
            category={getCategoryName(property.category_id)}
            city={getCityName(property.city_id)}
            realtor={getRealtor(property.realtor_id)}
            isFavorite={isFavorite(property.id)}
            onToggleFavorite={() => handleToggleFavorite(property.id)}
            isInCompareList={compareList.includes(property.id)}
            onToggleCompare={() => onToggleCompare(property.id)}
          />
        ))}
      </div>
    ) : (
      <div className="divide-y">
        {properties.map(property => (
          <PropertyListItem 
            key={property.id}
            property={property}
            category={getCategoryName(property.category_id)}
            city={getCityName(property.city_id)}
            realtor={getRealtor(property.realtor_id)}
            isFavorite={isFavorite(property.id)}
            onToggleFavorite={() => handleToggleFavorite(property.id)}
            isInCompareList={compareList.includes(property.id)}
            onToggleCompare={() => onToggleCompare(property.id)}
          />
        ))}
      </div>
    );
  }
  
  // Função PropertyCard - corrigida para ter controle de comparação
  function PropertyCard({ property, category, city, realtor, isFavorite, onToggleFavorite, isInCompareList, onToggleCompare }) {
    return (
      <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 ease-in-out hover:shadow-xl border-0 shadow-md group">
        <Link 
          to={createPageUrl(`PropertyDetail?id=${property.id}`)} 
          className="block relative overflow-hidden aspect-[4/3]"
        >
          {property.main_image_url ? (
            <img 
              src={property.main_image_url} 
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="bg-gray-200 w-full h-full flex items-center justify-center">
              <Home className="h-12 w-12 text-gray-400" />
            </div>
          )}
          
          {/* Property type badge */}
          <div className="absolute top-3 left-3">
            <Badge
              className={
                property.property_type === "rent"
                  ? "bg-purple-600"
                  : property.property_type === "sale"
                  ? "bg-blue-600"
                  : "bg-teal-600"
              }
            >
              {property.property_type === "rent"
                ? "Aluguel"
                : property.property_type === "sale"
                ? "Venda"
                : "Temporada"}
            </Badge>
          </div>
          
          {/* Favorite button */}
          <Button
            variant="outline"
            size="icon"
            className={`absolute top-3 right-3 bg-white/80 hover:bg-white border-gray-300 
                       ${isFavorite ? 'text-red-500' : 'text-gray-600'}`}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(); }}
          >
            <Heart className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
          </Button>
          
          {/* Compare button */}
          <Button
            variant="outline"
            size="icon"
            className={`absolute top-3 right-14 bg-white/80 hover:bg-white border-gray-300 
                       ${isInCompareList ? 'text-blue-600 border-blue-600' : 'text-gray-600'}`}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleCompare(); }}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>

          {/* Image count */}
          {property.images && property.images.length > 0 && (
            <Badge variant="outline" className="absolute bottom-3 left-3 bg-black/60 text-white border-0 flex items-center gap-1">
              <ImageIcon size={14} /> {property.images.length + 1}
            </Badge>
          )}
        </Link>
        
        <CardContent className="p-4 flex flex-col flex-grow">
          {/* Category */}
          {category && <p className="text-xs text-blue-600 font-medium mb-1 uppercase tracking-wider">{category}</p>}
          
          {/* Title */}
          <Link to={createPageUrl(`PropertyDetail?id=${property.id}`)}>
            <h3 className="font-semibold text-gray-800 mb-1 hover:text-blue-600">
              {property.title}
            </h3>
          </Link>

          {/* Location */}
          <div className="flex items-center text-gray-500 text-sm mb-2">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="truncate">
              {property.neighborhood ? `${property.neighborhood}, ` : ''}
              {city || 'Localização não informada'}
            </span>
          </div>

          {/* Features */}
          <div className="grid grid-cols-4 gap-x-2 gap-y-1 text-sm text-gray-600 mb-auto">
            {property.area > 0 && (
              <div className="flex items-center" title="Área">
                <Square className="w-4 h-4 mr-1 text-gray-400 flex-shrink-0" />
                <span>{property.area}m²</span>
              </div>
            )}
            
            {property.bedrooms > 0 && (
              <div className="flex items-center" title="Quartos">
                <Bed className="w-4 h-4 mr-1 text-gray-400 flex-shrink-0" />
                <span>{property.bedrooms}</span>
              </div>
            )}
            
            {property.bathrooms > 0 && (
              <div className="flex items-center" title="Banheiros">
                <Bath className="w-4 h-4 mr-1 text-gray-400 flex-shrink-0" />
                <span>{property.bathrooms}</span>
              </div>
            )}
            
            {property.parking_spots > 0 && (
              <div className="flex items-center" title="Vagas">
                <Car className="w-4 h-4 mr-1 text-gray-400 flex-shrink-0" />
                <span>{property.parking_spots}</span>
              </div>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            {/* Price */}
            <div className="flex justify-between items-center">
              <div className="font-bold text-xl text-blue-700">
                {formatPrice(property.price)}
                {property.property_type === 'rent' && (
                  <span className="text-xs font-normal text-gray-500 ml-1">/mês</span>
                )}
              </div>
              
              {/* Realtor logo (if available) */}
              {realtor?.logo_url && (
                <div className="h-8 w-8 rounded-full overflow-hidden border border-gray-200">
                  <img 
                    src={realtor.logo_url}
                    alt={realtor.company_name || "Imobiliária"}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Property List Item Component (horizontal card) - Adicionando botão de comparação
  function PropertyListItem({ property, category, city, realtor, isFavorite, onToggleFavorite, isInCompareList, onToggleCompare }) {
    if (!property) return null;

    return (
      <div className="flex flex-col md:flex-row bg-white p-4 gap-4 hover:bg-gray-50 transition-colors">
        <Link 
          to={createPageUrl(`PropertyDetail?id=${property.id}`)} 
          className="block relative h-64 md:h-auto md:w-72 flex-shrink-0 overflow-hidden rounded-lg"
        >
          {property.main_image_url ? (
            <img
              src={property.main_image_url}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <Home className="w-16 h-16 text-gray-400" />
            </div>
          )}
          
          <div className="absolute top-3 left-3">
            <Badge className={`${propertyTypeColors[property.property_type] || 'bg-gray-600'} text-white shadow px-3 py-1.5 text-sm font-bold`}>
              {propertyTypeLabels[property.property_type] || property.property_type}
            </Badge>
          </div>
          
          {/* Count of images */}
          {(property.images?.length > 0 || property.main_image_url) && (
            <div className="absolute top-3 right-3 bg-gray-900 bg-opacity-75 text-white rounded-lg px-3 py-1.5 text-sm font-medium flex items-center">
              <ImageIcon className="w-4 h-4 mr-1.5" />
              {(property.images?.length || 0) + (property.main_image_url ? 1 : 0)} foto{((property.images?.length || 0) + (property.main_image_url ? 1 : 0)) !== 1 ? 's' : ''}
            </div>
          )}
        </Link>

        <div className="flex-grow flex flex-col">
          <div className="flex-1">
            {category && <p className="text-xs text-blue-600 font-medium mb-1 uppercase tracking-wider">{category}</p>}
            
            <div className="flex justify-between items-start">
              <Link to={createPageUrl(`PropertyDetail?id=${property.id}`)} className="hover:no-underline">
                <h3 className="font-semibold text-xl text-gray-800 mb-1 hover:text-blue-700">
                  {property.title}
                </h3>
              </Link>
              
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`h-8 w-8 ${isInCompareList ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-500'}`}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleCompare(); }}
                      >
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isInCompareList ? 'Remover da Comparação' : 'Adicionar para Comparação'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-8 w-8 ${isFavorite ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'}`}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(); }}
                >
                  <Heart className="h-5 w-5" fill={isFavorite ? "currentColor" : "none"} />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center text-gray-500 text-sm mb-4">
              <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
              <span className="truncate">{property.neighborhood ? `${property.neighborhood}, ` : ''}{city || property.address}</span>
            </div>
            
            {property.description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{property.description}</p>
            )}
            
            <div className="flex flex-wrap gap-4 mb-4">
              {property.area > 0 && (
                <div className="flex items-center" title="Área">
                  <Square className="w-4 h-4 mr-1.5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600">{property.area}m²</span>
                </div>
              )}
              {property.bedrooms > 0 && (
                <div className="flex items-center" title="Quartos">
                  <Bed className="w-4 h-4 mr-1.5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600">{property.bedrooms} quarto{property.bedrooms !== 1 ? 's' : ''}</span>
                </div>
              )}
              {property.bathrooms > 0 && (
                <div className="flex items-center" title="Banheiros">
                  <Bath className="w-4 h-4 mr-1.5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600">{property.bathrooms} banheiro{property.bathrooms !== 1 ? 's' : ''}</span>
                </div>
              )}
              {property.parking_spots > 0 && (
                <div className="flex items-center" title="Vagas">
                  <Car className="w-4 h-4 mr-1.5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600">{property.parking_spots} vaga{property.parking_spots !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-end justify-between pt-3 border-t">
            <div>
              <div className="text-2xl font-bold text-blue-700 flex items-center">
                {formatPrice(property.price)}
                {property.property_type === 'rent' && <span className="text-sm font-normal text-gray-500 ml-1">/mês</span>}
              </div>
              
              {realtor && (
                <div className='flex items-center mt-1'>
                    {realtor.logo_url ? (
                        <img src={realtor.logo_url} alt={realtor.company_name} className="w-5 h-5 rounded-full mr-1 object-cover"/>
                    ) : (
                        <Building2 className="w-4 h-4 mr-1 text-gray-500"/>
                    )}
                    <span className="text-xs text-gray-500">{realtor.company_name}</span>
                </div>
              )}
            </div>
            
            <Button 
              variant="default" 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
              asChild
            >
              <Link to={createPageUrl(`PropertyDetail?id=${property.id}`)}>
                Ver detalhes
                <ArrowRight className="ml-1.5 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Component LayoutGrid
  function LayoutGrid(props) {
    return (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        {...props}
      >
        <rect width="7" height="7" x="3" y="3" rx="1"></rect>
        <rect width="7" height="7" x="14" y="3" rx="1"></rect>
        <rect width="7" height="7" x="14" y="14" rx="1"></rect>
        <rect width="7" height="7" x="3" y="14" rx="1"></rect>
      </svg>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <PublicHeader />
      
      <section className="bg-blue-600 text-white py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navegação simples */}
          <div className="mb-4 text-sm">
            <Link to={createPageUrl("Public")} className="text-white opacity-75 hover:opacity-100">
              Home
            </Link>
            {" > "}
            <span className="text-white">Imóveis</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Encontre o imóvel dos seus sonhos</h1>
          <p className="text-lg opacity-90 max-w-3xl">
            Explore nossa seleção de imóveis em Santa Catarina para compra, venda ou aluguel
          </p>
          
          {/* Barra de pesquisa melhorada */}
          <div className="bg-white rounded-xl shadow-lg mt-8 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  className="pl-10 h-12 text-gray-700 rounded-lg border-gray-200"
                  placeholder="Busque por localização, título, etc..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="h-12 rounded-lg border-gray-200">
                  <SelectValue placeholder="Todas as cidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as cidades</SelectItem>
                  {cities.map(city => (
                    <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex gap-2">
                <Select value={selectedType} onValueChange={setSelectedType} className="flex-1">
                  <SelectTrigger className="h-12 rounded-lg border-gray-200">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="sale">Venda</SelectItem>
                    <SelectItem value="rent">Aluguel</SelectItem>
                    <SelectItem value="temporary">Temporada</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button className="h-12 w-12 p-0 bg-blue-700 hover:bg-blue-800" onClick={resetFilters} title="Limpar filtros">
                  <RefreshCw className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Categorias em carrossel com ícones */}
          {propertyCategories.length > 0 && (
            <div className="mb-6 relative">
              <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                <Tag className="w-5 h-5 mr-2 text-blue-600"/>
                Tipos de Imóvel
              </h2>
              
              <div className="relative">
                <button 
                  onClick={() => scrollCategories('left')}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 rounded-full shadow-md p-1.5 hover:bg-gray-100"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                
                <div 
                  ref={categoriesRef}
                  className="flex overflow-x-auto no-scrollbar gap-3 py-2 px-1 relative scroll-smooth"
                >
                  {propertyCategories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(selectedCategory === category.id ? "all" : category.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap flex-shrink-0 transition-all ${
                        selectedCategory === category.id 
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white border border-gray-200 hover:border-blue-300 text-gray-700'
                      }`}
                    >
                      {getCategoryIcon(category.icon)}
                      <span>{category.name}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap flex-shrink-0 transition-all ${
                      selectedCategory === "all" 
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white border border-gray-200 hover:border-blue-300 text-gray-700'
                    }`}
                  >
                    <Home className="w-5 h-5" />
                    <span>Todos os Tipos</span>
                  </button>
                </div>
                
                <button 
                  onClick={() => scrollCategories('right')}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 rounded-full shadow-md p-1.5 hover:bg-gray-100"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Mobile Filters - Modern and collapsible */}
            <div className="lg:hidden mb-4">
              <div className="flex gap-2">
                <Button 
                  variant={filterCount > 0 ? "default" : "outline"} 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                  {filterCount > 0 && (
                    <Badge className="ml-2 bg-white text-blue-700">{filterCount}</Badge>
                  )}
                </Button>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <ArrowUpDown className="w-4 h-4 mr-2" />
                      {sortBy === "newest" ? "Mais recentes" : 
                       sortBy === "oldest" ? "Mais antigos" : 
                       sortBy === "price_asc" ? "Menor preço" :
                       sortBy === "price_desc" ? "Maior preço" :
                       sortBy === "area_desc" ? "Maior área" :
                       sortBy === "bedrooms_desc" ? "Mais quartos" : "Ordenar"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56">
                    <div className="space-y-1">
                      <div 
                        className={`flex items-center p-2 rounded cursor-pointer hover:bg-gray-100 ${sortBy === "newest" ? "bg-blue-50 text-blue-600" : ""}`}
                        onClick={() => setSortBy("newest")}
                      >
                        <Check className={`mr-2 h-4 w-4 ${sortBy === "newest" ? "opacity-100" : "opacity-0"}`} />
                        <span>Mais recentes</span>
                      </div>
                      <div 
                        className={`flex items-center p-2 rounded cursor-pointer hover:bg-gray-100 ${sortBy === "oldest" ? "bg-blue-50 text-blue-600" : ""}`}
                        onClick={() => setSortBy("oldest")}
                      >
                        <Check className={`mr-2 h-4 w-4 ${sortBy === "oldest" ? "opacity-100" : "opacity-0"}`} />
                        <span>Mais antigos</span>
                      </div>
                      <div 
                        className={`flex items-center p-2 rounded cursor-pointer hover:bg-gray-100 ${sortBy === "price_asc" ? "bg-blue-50 text-blue-600" : ""}`}
                        onClick={() => setSortBy("price_asc")}
                      >
                        <Check className={`mr-2 h-4 w-4 ${sortBy === "price_asc" ? "opacity-100" : "opacity-0"}`} />
                        <span>Menor preço</span>
                      </div>
                      <div 
                        className={`flex items-center p-2 rounded cursor-pointer hover:bg-gray-100 ${sortBy === "price_desc" ? "bg-blue-50 text-blue-600" : ""}`}
                        onClick={() => setSortBy("price_desc")}
                      >
                        <Check className={`mr-2 h-4 w-4 ${sortBy === "price_desc" ? "opacity-100" : "opacity-0"}`} />
                        <span>Maior preço</span>
                      </div>
                      <div 
                        className={`flex items-center p-2 rounded cursor-pointer hover:bg-gray-100 ${sortBy === "area_desc" ? "bg-blue-50 text-blue-600" : ""}`}
                        onClick={() => setSortBy("area_desc")}
                      >
                        <Check className={`mr-2 h-4 w-4 ${sortBy === "area_desc" ? "opacity-100" : "opacity-0"}`} />
                        <span>Maior área</span>
                      </div>
                      <div 
                        className={`flex items-center p-2 rounded cursor-pointer hover:bg-gray-100 ${sortBy === "bedrooms_desc" ? "bg-blue-50 text-blue-600" : ""}`}
                        onClick={() => setSortBy("bedrooms_desc")}
                      >
                        <Check className={`mr-2 h-4 w-4 ${sortBy === "bedrooms_desc" ? "opacity-100" : "opacity-0"}`} />
                        <span>Mais quartos</span>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-none px-2"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  title={viewMode === 'grid' ? 'Visualizar em lista' : 'Visualizar em grid'}
                >
                  {viewMode === 'grid' ? (
                    <PanelsTopLeft className="w-4 h-4" />
                  ) : (
                    <LayoutList className="w-4 h-4" />
                  )}
                </Button>
              </div>
              
              {/* Mobile filter tags */}
              {activeFilters.length > 0 && (
                <div className="flex overflow-x-auto gap-2 py-3 no-scrollbar">
                  {activeFilters.map(filter => (
                    <Badge 
                      key={filter.id} 
                      className="pl-2 pr-1 py-1 bg-blue-50 text-blue-700 whitespace-nowrap flex items-center"
                    >
                      <span>{filter.label}</span>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-4 w-4 p-0 ml-1"
                        onClick={filter.clear}
                      >
                        <XCircle className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                  
                  {activeFilters.length > 1 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={resetFilters} 
                      className="text-blue-600 whitespace-nowrap px-2 h-6"
                    >
                      Limpar todos
                    </Button>
                  )}
                </div>
              )}
              
              {showMobileFilters && (
                <Card className="mt-4 overflow-hidden border-0 shadow-md">
                  <CardContent className="p-0">
                    <div className="p-4 bg-blue-600 text-white">
                      <h3 className="text-lg font-semibold flex items-center">
                        <Filter className="w-5 h-5 mr-2" />
                        Filtros
                      </h3>
                    </div>
                    
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Categoria</label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger>
                            <SelectValue placeholder="Todas categorias" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas categorias</SelectItem>
                            {categories.map(category => (
                              <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-1 block">Cidade</label>
                        <Select value={selectedCity} onValueChange={setSelectedCity}>
                          <SelectTrigger>
                            <SelectValue placeholder="Todas as cidades" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas as cidades</SelectItem>
                            {cities.map(city => (
                              <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-1 block">Tipo de Negócio</label>
                        <Select value={selectedType} onValueChange={setSelectedType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Todos tipos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos tipos</SelectItem>
                            <SelectItem value="sale">Venda</SelectItem>
                            <SelectItem value="rent">Aluguel</SelectItem>
                            <SelectItem value="temporary">Temporada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Preço mínimo</label>
                          <Input
                            placeholder="R$ Min"
                            value={priceRange.min}
                            onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                            type="number"
                            className="border-gray-300"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Preço máximo</label>
                          <Input
                            placeholder="R$ Máx"
                            value={priceRange.max}
                            onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                            type="number"
                            className="border-gray-300"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-1 block">Quartos</label>
                        <div className="flex flex-wrap gap-2">
                          <Badge 
                            onClick={() => setBedroomsFilter("all")}
                            className={`cursor-pointer ${bedroomsFilter === "all" ? "bg-blue-600" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                          >
                            Todos
                          </Badge>
                          <Badge 
                            onClick={() => setBedroomsFilter("1")}
                            className={`cursor-pointer ${bedroomsFilter === "1" ? "bg-blue-600" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                          >
                            1
                          </Badge>
                          <Badge 
                            onClick={() => setBedroomsFilter("2")}
                            className={`cursor-pointer ${bedroomsFilter === "2" ? "bg-blue-600" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                          >
                            2
                          </Badge>
                          <Badge 
                            onClick={() => setBedroomsFilter("3")}
                            className={`cursor-pointer ${bedroomsFilter === "3" ? "bg-blue-600" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                          >
                            3
                          </Badge>
                          <Badge 
                            onClick={() => setBedroomsFilter("4+")}
                            className={`cursor-pointer ${bedroomsFilter === "4+" ? "bg-blue-600" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                          >
                            4+
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-1 block">Banheiros</label>
                        <div className="flex flex-wrap gap-2">
                          <Badge 
                            onClick={() => setBathroomsFilter("all")}
                            className={`cursor-pointer ${bathroomsFilter === "all" ? "bg-blue-600" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                          >
                            Todos
                          </Badge>
                          <Badge 
                            onClick={() => setBathroomsFilter("1")}
                            className={`cursor-pointer ${bathroomsFilter === "1" ? "bg-blue-600" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                          >
                            1
                          </Badge>
                          <Badge 
                            onClick={() => setBathroomsFilter("2")}
                            className={`cursor-pointer ${bathroomsFilter === "2" ? "bg-blue-600" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                          >
                            2
                          </Badge>
                          <Badge 
                            onClick={() => setBathroomsFilter("3+")}
                            className={`cursor-pointer ${bathroomsFilter === "3+" ? "bg-blue-600" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                          >
                            3+
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex justify-between pt-2 border-t">
                        <Button variant="outline" size="sm" onClick={resetFilters}>
                          Limpar filtros
                        </Button>
                        <Button size="sm" onClick={() => setShowMobileFilters(false)}>
                          Aplicar Filtros
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Desktop Filters */}
            <div className="hidden lg:block lg:w-72 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-md sticky top-4 overflow-hidden">
                <div className="px-5 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg flex items-center">
                      <Filter className="mr-2 h-5 w-5" />
                      Filtros
                    </h3>
                    {filterCount > 0 && (
                      <Badge className="bg-white text-blue-700">
                        {filterCount} filtro{filterCount !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="p-5">
                  {filterCount > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-500">Filtros ativos</p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs text-blue-600 h-auto p-0"
                          onClick={resetFilters}
                        >
                          Limpar todos
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {activeFilters.map(filter => (
                          <Badge 
                            key={filter.id} 
                            className="pl-2 pr-1 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center"
                          >
                            <span>{filter.label}</span>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-4 w-4 p-0 ml-1 hover:bg-blue-200 rounded-full"
                              onClick={filter.clear}
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                
                  <Accordion type="single" collapsible defaultValue="category" className="border-none">
                    <AccordionItem value="category" className="border-b">
                      <AccordionTrigger className="py-3">
                        <span className="flex items-center text-blue-700">
                          <Tag className="h-4 w-4 mr-2" />
                          Categoria
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-3">
                        <div className="space-y-1">
                          <div 
                            className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-100 ${selectedCategory === "all" ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"}`}
                            onClick={() => setSelectedCategory("all")}
                          >
                            <Check className={`mr-2 h-4 w-4 ${selectedCategory === "all" ? "opacity-100 text-blue-600" : "opacity-0"}`} />
                            <span>Todas categorias</span>
                          </div>
                          {categories.map(category => (
                            <div 
                              key={category.id}
                              className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-100 ${selectedCategory === category.id ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"}`}
                              onClick={() => setSelectedCategory(category.id)}
                            >
                              <Check className={`mr-2 h-4 w-4 ${selectedCategory === category.id ? "opacity-100 text-blue-600" : "opacity-0"}`} />
                              <span>{category.name}</span>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="price" className="border-b">
                      <AccordionTrigger className="py-3">
                        <span className="flex items-center text-blue-700">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Preço
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-3">
                        <div className="space-y-3 pt-1">
                          <label className="text-sm text-gray-600 block">Valor mínimo</label>
                          <Input
                            placeholder="R$ Min"
                            value={priceRange.min}
                            onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                            type="number"
                            className="border-gray-300 focus:ring-blue-500"
                          />
                          
                          <label className="text-sm text-gray-600 block mt-2">Valor máximo</label>
                          <Input
                            placeholder="R$ Máx"
                            value={priceRange.max}
                            onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                            type="number"
                            className="border-gray-300 focus:ring-blue-500"
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="features" className="border-b">
                      <AccordionTrigger className="py-3">
                        <span className="flex items-center text-blue-700">
                          <Bed className="h-4 w-4 mr-2" />
                          Características
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-3">
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm text-gray-600 block mb-2">Quartos</label>
                            <div className="flex flex-wrap gap-2">
                              <Badge 
                                onClick={() => setBedroomsFilter("all")}
                                className={`cursor-pointer ${bedroomsFilter === "all" ? "bg-blue-600" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                              >
                                Todos
                              </Badge>
                              <Badge 
                                onClick={() => setBedroomsFilter("1")}
                                className={`cursor-pointer ${bedroomsFilter === "1" ? "bg-blue-600" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                              >
                                1
                              </Badge>
                              <Badge 
                                onClick={() => setBedroomsFilter("2")}
                                className={`cursor-pointer ${bedroomsFilter === "2" ? "bg-blue-600" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                              >
                                2
                              </Badge>
                              <Badge 
                                onClick={() => setBedroomsFilter("3")}
                                className={`cursor-pointer ${bedroomsFilter === "3" ? "bg-blue-600" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                              >
                                3
                              </Badge>
                              <Badge 
                                onClick={() => setBedroomsFilter("4+")}
                                className={`cursor-pointer ${bedroomsFilter === "4+" ? "bg-blue-600" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                              >
                                4+
                              </Badge>
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-sm text-gray-600 block mb-2">Banheiros</label>
                            <div className="flex flex-wrap gap-2">
                              <Badge 
                                onClick={() => setBathroomsFilter("all")}
                                className={`cursor-pointer ${bathroomsFilter === "all" ? "bg-blue-600" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                              >
                                Todos
                              </Badge>
                              <Badge 
                                onClick={() => setBathroomsFilter("1")}
                                className={`cursor-pointer ${bathroomsFilter === "1" ? "bg-blue-600" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                              >
                                1
                              </Badge>
                              <Badge 
                                onClick={() => setBathroomsFilter("2")}
                                className={`cursor-pointer ${bathroomsFilter === "2" ? "bg-blue-600" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                              >
                                2
                              </Badge>
                              <Badge 
                                onClick={() => setBathroomsFilter("3+")}
                                className={`cursor-pointer ${bathroomsFilter === "3+" ? "bg-blue-600" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                              >
                                3+
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            </div>
            

            {/* Property Listings with Tabs */}
            <div className="flex-1">
              <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
                <Tabs defaultValue="todos" value={selectedTab} onValueChange={setSelectedTab}>
                  <div className="border-b">
                    <div className="px-4">
                      <TabsList className="bg-transparent h-14">
                        <TabsTrigger 
                          value="todos" 
                          className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-14 text-gray-700 data-[state=active]:text-blue-700"
                        >
                          <Home className="h-4 w-4 mr-1.5" />
                          Todos
                        </TabsTrigger>
                        <TabsTrigger 
                          value="venda" 
                          className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-14 text-gray-700 data-[state=active]:text-blue-700"
                        >
                          <Tag className="h-4 w-4 mr-1.5" />
                          Venda
                        </TabsTrigger>
                        <TabsTrigger 
                          value="aluguel" 
                          className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-14 text-gray-700 data-[state=active]:text-blue-700"
                        >
                          <Calendar className="h-4 w-4 mr-1.5" />
                          Aluguel
                        </TabsTrigger>
                        <TabsTrigger 
                          value="temporada" 
                          className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-14 text-gray-700 data-[state=active]:text-blue-700"
                        >
                          <Sparkles className="h-4 w-4 mr-1.5" />
                          Temporada
                        </TabsTrigger>
                        <TabsTrigger 
                          value="favoritos" 
                          className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-14 text-gray-700 data-[state=active]:text-blue-700"
                        >
                          <Heart className="h-4 w-4 mr-1.5" />
                          Favoritos
                          {favoriteIds.length > 0 && (
                            <Badge className="ml-1.5 bg-blue-600">{favoriteIds.length}</Badge>
                          )}
                        </TabsTrigger>
                      </TabsList>
                    </div>
                  </div>
                  
                  <div className="p-4 flex justify-between items-center border-b">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      {filteredProperties.length} imóvei{filteredProperties.length === 1 ? 'l' : 's'} encontrado{filteredProperties.length === 1 ? '' : 's'}
                      {selectedTab === "venda" && <span className="ml-2 text-blue-700">(Venda)</span>}
                      {selectedTab === "aluguel" && <span className="ml-2 text-purple-700">(Aluguel)</span>}
                      {selectedTab === "temporada" && <span className="ml-2 text-teal-700">(Temporada)</span>}
                      {selectedTab === "favoritos" && <span className="ml-2 text-red-600">(Favoritos)</span>}
                    </h2>
                    
                    <div className="hidden lg:flex items-center gap-3">
                       <span className="text-sm text-gray-500">Visualizar:</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant={viewMode === 'grid' ? "default" : "outline"} 
                              size="icon"
                              className="h-9 w-9"
                              onClick={() => setViewMode('grid')}
                            >
                              <LayoutGrid className="h-4 w-4" /> {/* Ícone de grade padrão */}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Visualização em grade</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant={viewMode === 'list' ? "default" : "outline"}
                              size="icon"
                              className="h-9 w-9"
                              onClick={() => setViewMode('list')}
                            >
                              <LayoutList className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Visualização em lista</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant={viewMode === 'map' ? "default" : "outline"}
                              size="icon"
                              className="h-9 w-9"
                              onClick={() => setViewMode('map')}
                            >
                              <MapIcon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Visualização no mapa</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <div className="h-6 w-px bg-gray-300 mx-1"></div>
                      
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[180px] h-9 border-gray-300">
                          <SelectValue placeholder="Ordenar por" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Mais recentes</SelectItem>
                          <SelectItem value="oldest">Mais antigos</SelectItem>
                          <SelectItem value="price_asc">Menor preço</SelectItem>
                          <SelectItem value="price_desc">Maior preço</SelectItem>
                          <SelectItem value="area_desc">Maior área</SelectItem>
                          <SelectItem value="bedrooms_desc">Mais quartos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Content for All Tabs */}
                  <TabsContent value="todos" className="m-0">
                    <PropertyListings 
                      properties={filteredProperties} 
                      viewMode={viewMode} 
                      toggleFavorite={handleToggleFavorite}
                      isFavorite={isFavorite}
                      cities={cities}
                      categories={categories}
                      realtors={realtors}
                      onRegionSearch={handleRegionSearch}
                      compareList={compareList}
                      onToggleCompare={toggleCompare}
                      selectedTab={selectedTab}
                      resetFilters={resetFilters}
                      setSelectedTab={setSelectedTab}
                    />
                  </TabsContent>
                  <TabsContent value="venda" className="m-0">
                    <PropertyListings 
                      properties={filteredProperties} 
                      viewMode={viewMode} 
                      toggleFavorite={handleToggleFavorite}
                      isFavorite={isFavorite}
                      cities={cities}
                      categories={categories}
                      realtors={realtors}
                      onRegionSearch={handleRegionSearch}
                      compareList={compareList}
                      onToggleCompare={toggleCompare}
                      selectedTab={selectedTab}
                      resetFilters={resetFilters}
                      setSelectedTab={setSelectedTab}
                    />
                  </TabsContent>
                  <TabsContent value="aluguel" className="m-0">
                    <PropertyListings 
                      properties={filteredProperties} 
                      viewMode={viewMode} 
                      toggleFavorite={handleToggleFavorite}
                      isFavorite={isFavorite}
                      cities={cities}
                      categories={categories}
                      realtors={realtors}
                      onRegionSearch={handleRegionSearch}
                      compareList={compareList}
                      onToggleCompare={toggleCompare}
                      selectedTab={selectedTab}
                      resetFilters={resetFilters}
                      setSelectedTab={setSelectedTab}
                    />
                  </TabsContent>
                  <TabsContent value="temporada" className="m-0">
                    <PropertyListings 
                      properties={filteredProperties} 
                      viewMode={viewMode} 
                      toggleFavorite={handleToggleFavorite}
                      isFavorite={isFavorite}
                      cities={cities}
                      categories={categories}
                      realtors={realtors}
                      onRegionSearch={handleRegionSearch}
                      compareList={compareList}
                      onToggleCompare={toggleCompare}
                      selectedTab={selectedTab}
                      resetFilters={resetFilters}
                      setSelectedTab={setSelectedTab}
                    />
                  </TabsContent>
                  <TabsContent value="favoritos" className="m-0">
                    <PropertyListings 
                      properties={filteredProperties} 
                      viewMode={viewMode} 
                      toggleFavorite={handleToggleFavorite}
                      isFavorite={isFavorite}
                      cities={cities}
                      categories={categories}
                      realtors={realtors}
                      onRegionSearch={handleRegionSearch}
                      compareList={compareList}
                      onToggleCompare={toggleCompare}
                      selectedTab={selectedTab}
                      resetFilters={resetFilters}
                      setSelectedTab={setSelectedTab}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <PublicFooter />

      {/* Barra de Comparação Flutuante */}
      {compareList.length > 0 && (
        <div className="sticky bottom-0 left-0 right-0 bg-white shadow-lg p-3 z-30 border-t">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Comparar ({compareList.length}/4):</span>
              {compareList.map(id => {
                const prop = properties.find(p => p.id === id);
                return (
                  <Badge key={id} variant="secondary" className="flex items-center gap-1">
                    {prop?.title.substring(0,15) || 'Imóvel'}...
                    <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => toggleCompare(id)}>
                      <XCircle className="h-3 w-3" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCompareList([])}>Limpar</Button>
              <Button 
                size="sm" 
                onClick={() => navigate(createPageUrl(`CompareProperties?ids=${compareList.join(',')}`))}
                disabled={compareList.length < 2}
              >
                Comparar Selecionados
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Novo Popup */}
      {selectedProperty && (
        <PropertyMapPopup
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          position="right"
        />
      )}
    </div>
  );
  
 
}
