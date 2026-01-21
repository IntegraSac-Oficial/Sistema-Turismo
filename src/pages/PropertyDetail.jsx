
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Property } from "@/api/entities";
import { City } from "@/api/entities";
import { Realtor } from "@/api/entities";
import { PropertyCategory } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Home,
  MapPin,
  ChevronLeft,
  Images,
  Video,
  Share2,
  Heart,
  Ruler,
  Bed,
  Bath,
  Car,
  DollarSign,
  Building2,
  Phone,
  Mail,
  Star,
  Check,
  DogIcon,
  Waves, 
  Dumbbell,
  UtensilsCrossed,
  Trees,
  Shield,
  PlaySquare, 
  Sofa,
  PanelTop, 
  Warehouse,
  PartyPopper,
  Wind,
  Camera,
  Wifi,
  ChefHat,
  Calendar,
  Briefcase,
  ParkingCircle,
  FlowerIcon,
  CookingPot,
  Edit,
  ChevronRight,
  ChevronLeft as ChevronLeftIcon,
  Maximize2,
  X,
  ArrowUpCircle,
  WashingMachine,
  Thermometer,
  Users,
  ShowerHead,
  SquarePen,
  Tv,
  Microwave,
  Refrigerator,
  Hotel,
  Lightbulb,
  BedDouble
} from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useFavorites } from "@/components/properties/useFavorites";
import { ImageGallery } from "@/components/properties/ImageGallery";
import { trackEvent, setupTimeTracking } from "@/components/analytics/utils";
import { loadEntityData } from "@/components/services/entityService";

// Traduzir as amenidades
const getAmenityLabel = (amenityId) => {
  const translations = {
    pool: "Piscina",
    gym: "Academia",
    barbecue: "Churrasqueira",
    playground: "Playground",
    security: "Segurança 24h",
    elevator: "Elevador",
    furnished: "Mobiliado",
    balcony: "Sacada",
    laundry: "Lavanderia",
    party_room: "Salão de Festas",
    pet_friendly: "Aceita Pets",
    ocean_view: "Vista para o Mar",
    air_conditioning: "Ar Condicionado",
    wifi: "Wi-Fi",
    kitchen: "Cozinha Equipada",
    private_pool: "Piscina Privativa",
    year_round_pool: "Piscina Aquecida",
    workspace: "Espaço de Trabalho",
    parking: "Estacionamento",
    garden: "Jardim",
    gourmet_area: "Área Gourmet",
    concierge: "Portaria",
    security_cameras: "Câmeras de Segurança",
    tv: "TV",
    microwave: "Microondas",
    refrigerator: "Geladeira",
    lighting: "Iluminação Planejada",
    double_bed: "Cama de Casal",
    guest_room: "Quarto de Hóspedes",
    hot_shower: "Chuveiro a Gás",
    office_space: "Escritório"
  };

  return translations[amenityId] || amenityId;
};

// Mapeamento para tradução e ícones das comodidades
const amenityDetails = {
  pool: { label: "Piscina", icon: Waves },
  gym: { label: "Academia", icon: Dumbbell },
  barbecue: { label: "Churrasqueira", icon: UtensilsCrossed },
  playground: { label: "Playground", icon: Trees },
  security: { label: "Segurança 24h", icon: Shield },
  elevator: { label: "Elevador", icon: ArrowUpCircle },
  furnished: { label: "Mobiliado", icon: Sofa },
  balcony: { label: "Sacada", icon: PanelTop },
  laundry: { label: "Lavanderia", icon: WashingMachine }, // Importar WashingMachine
  party_room: { label: "Salão de Festas", icon: PartyPopper },
  pet_friendly: { label: "Aceita Pets", icon: DogIcon },
  ocean_view: { label: "Vista para o Mar", icon: Waves },
  air_conditioning: { label: "Ar Condicionado", icon: Wind },
  wifi: { label: "Wi-Fi", icon: Wifi },
  kitchen: { label: "Cozinha Equipada", icon: ChefHat },
  private_pool: { label: "Piscina Privativa", icon: Waves },
  year_round_pool: { label: "Piscina Aquecida", icon: Thermometer }, // Importar Thermometer
  workspace: { label: "Espaço de Trabalho", icon: Briefcase },
  parking: { label: "Estacionamento", icon: ParkingCircle },
  garden: { label: "Jardim", icon: FlowerIcon },
  gourmet_area: { label: "Área Gourmet", icon: UtensilsCrossed },
  tv: { label: "Televisão", icon: Tv },
  microwave: { label: "Microondas", icon: Microwave },
  refrigerator: { label: "Geladeira", icon: Refrigerator },
  concierge: { label: "Portaria", icon: Hotel },
  lighting: { label: "Iluminação Planejada", icon: Lightbulb },
  double_bed: { label: "Cama de Casal", icon: BedDouble },
  guest_room: { label: "Quarto de Hóspedes", icon: Users }, // Importar Users
  hot_shower: { label: "Chuveiro a Gás", icon: ShowerHead }, // Importar ShowerHead
  office_space: { label: "Escritório", icon: SquarePen } // Importar SquarePen

};

export default function PropertyDetail() {
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [city, setCity] = useState(null);
  const [realtor, setRealtor] = useState(null);
  const [category, setCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [realtors, setRealtors] = useState([]);
  
  // Estado para a galeria
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showControls, setShowControls] = useState(false);

  // Adicionar o hook de favoritos
  const { isFavorite, toggleFavorite } = useFavorites();
  
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setIsLoading(true);
        // Obter ID da URL
        const urlParams = new URLSearchParams(window.location.search);
        const propertyId = urlParams.get("id");

        if (!propertyId) {
          navigate(createPageUrl("PublicProperties"));
          return;
        }

        // Carregar entidades usando o sistema de cache
        const [cities, categories, realtors] = await Promise.all([
          loadEntityData(City, 'City'),
          loadEntityData(PropertyCategory, 'PropertyCategory'),
          loadEntityData(Realtor, 'Realtor')
        ]);

        if (mounted) {
          setCities(cities || []);
          setCategories(categories || []);
          setRealtors(realtors || []);
        }

        // Carregar detalhes do imóvel por ID
        const propertyData = await Property.get(propertyId);
        
        if (!mounted) return;
        
        if (!propertyData) {
          toast({
            title: "Imóvel não encontrado",
            description: "O imóvel solicitado não está disponível",
            variant: "destructive",
          });
          navigate(createPageUrl("PublicProperties"));
          return;
        }

        setProperty(propertyData);
        
        // Definir cidade
        if (propertyData.city_id) {
          const cityData = cities?.find(c => c.id === propertyData.city_id);
          setCity(cityData);
        }
        
        // Definir categoria
        if (propertyData.category_id) {
          const categoryData = categories?.find(c => c.id === propertyData.category_id);
          setCategory(categoryData);
        }
        
        // Definir imobiliária
        if (propertyData.realtor_id) {
          const realtorData = realtors?.find(r => r.id === propertyData.realtor_id);
          setRealtor(realtorData);
        }
        
      } catch (error) {
        console.error("Erro ao carregar detalhes do imóvel:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os detalhes do imóvel",
          variant: "destructive",
        });
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  useEffect(() => {
    // Rastrear visualização detalhada do imóvel
    if (property) {
      trackEvent('property_view', {
        property_id: property.id,
        property_title: property.title,
        property_type: property.property_type,
        property_price: property.price,
        realtor_id: property.realtor_id
      });
      
      // Configurar rastreador de tempo na página
      const stopTimeTracking = setupTimeTracking(`PropertyDetail?id=${property.id}`);
      
      // Limpar ao desmontar
      return () => stopTimeTracking();
    }
  }, [property]);
  
  const formatPrice = (price) => {
    if (!price) return "Preço sob consulta";
    // Formata valor com separador de milhares e 2 casas decimais
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  
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
  
  const getAmenitiesIcon = (amenity) => {
    const icons = {
      pool: <Waves className="w-5 h-5" />,
      gym: <Dumbbell className="w-5 h-5" />,
      barbecue: <UtensilsCrossed className="w-5 h-5" />,
      playground: <Trees className="w-5 h-5" />,
      security: <Shield className="w-5 h-5" />,
      elevator: <ArrowUpCircle className="w-5 h-5" />,
      furnished: <Sofa className="w-5 h-5" />,
      balcony: <PanelTop className="w-5 h-5" />,
      laundry: <Warehouse className="w-5 h-5" />,
      party_room: <PartyPopper className="w-5 h-5" />,
      pet_friendly: <DogIcon className="w-5 h-5" />,
      ocean_view: <Waves className="w-5 h-5" />,
      air_conditioning: <Wind className="w-5 h-5" />,
      security_cameras: <Camera className="w-5 h-5" />,
      wifi: <Wifi className="w-5 h-5" />,
      kitchen: <ChefHat className="w-5 h-5" />,
      private_pool: <Waves className="w-5 h-5" />,
      year_round_pool: <Calendar className="w-5 h-5" />,
      workspace: <Briefcase className="w-5 h-5" />,
      parking: <ParkingCircle className="w-5 h-5" />,
      garden: <FlowerIcon className="w-5 h-5" />,
      gourmet_area: <CookingPot className="w-5 h-5" />,
    };
    
    return icons[amenity] || <Check className="w-5 h-5" />;
  };
  
  const isOwner = () => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser || !realtor) return false;
    
    try {
      const userData = JSON.parse(currentUser);
      return userData.email === realtor.email || userData.email === 'contato.jrsn@gmail.com';
    } catch (e) {
      return false;
    }
  };
  
  const openGallery = (index = 0) => {
    setCurrentImageIndex(index);
    setGalleryOpen(true);
  };
  
  const nextImage = (e) => {
    e.stopPropagation();
    if (!property?.images?.length) return;
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };
  
  const prevImage = (e) => {
    e.stopPropagation();
    if (!property?.images?.length) return;
    setCurrentImageIndex((prev) => (prev === 0 ? property.images.length - 1 : prev - 1));
  };
  
  const getGalleryImage = () => {
    if (!property?.images?.length) return property?.main_image_url || "";
    return property.images[currentImageIndex];
  };

    // Função para obter o ícone e nome traduzido da comodidade
    const getAmenityDisplay = (amenityId) => {
      return amenityDetails[amenityId] || { label: amenityId, icon: Check }; // Fallback
    };
    
    // Função para lidar com favoritos
  const handleToggleFavorite = () => {
    if (property) {
      toggleFavorite(property.id);
    }
  };

    // Tradução das comodidades
    const amenityTranslations = {
      "ocean_view": "Vista para o mar",
      "kitchen": "Cozinha",
      "balcony": "Varanda",
      "security_cameras": "Câmeras de segurança",
      "private_pool": "Piscina privativa",
      "workspace": "Espaço para trabalho",
      "air_conditioning": "Ar condicionado",
      "year_round_pool": "Piscina aberta o ano todo",
      "parking": "Estacionamento",
      "wifi": "Wi-Fi",
      "office_space": "Escritório",
      "hot_shower": "Chuveiro quente",
      "concierge": "Portaria",
      "double_bed": "Cama de casal",
      "lighting": "Iluminação especial",
      "tv": "TV",
      "microwave": "Microondas",
      "garden": "Jardim",
      "furnished": "Mobiliado",
      "party_room": "Salão de festas",
      "pet_friendly": "Aceita animais",
      "gym": "Academia",
      "pool": "Piscina",
      "security": "Segurança",
      "playground": "Playground"
    };

    const amenityIcons = {
      pool: <Waves className="w-5 h-5" />,
      gym: <Dumbbell className="w-5 h-5" />,
      barbecue: <UtensilsCrossed className="w-5 h-5" />,
      playground: <Trees className="w-5 h-5" />,
      security: <Shield className="w-5 h-5" />,
      elevator: <ArrowUpCircle className="w-5 h-5" />,
      furnished: <Sofa className="w-5 h-5" />,
      balcony: <PanelTop className="w-5 h-5" />,
      laundry: <Warehouse className="w-5 h-5" />,
      party_room: <PartyPopper className="w-5 h-5" />,
      pet_friendly: <DogIcon className="w-5 h-5" />,
      ocean_view: <Waves className="w-5 h-5" />,
      air_conditioning: <Wind className="w-5 h-5" />,
      security_cameras: <Camera className="w-5 h-5" />,
      wifi: <Wifi className="w-5 h-5" />,
      kitchen: <ChefHat className="w-5 h-5" />,
      private_pool: <Waves className="w-5 h-5" />,
      year_round_pool: <Calendar className="w-5 h-5" />,
      workspace: <Briefcase className="w-5 h-5" />,
      parking: <ParkingCircle className="w-5 h-5" />,
      garden: <FlowerIcon className="w-5 h-5" />,
      gourmet_area: <CookingPot className="w-5 h-5" />,
    };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <PublicHeader />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <PublicFooter />
      </div>
    );
  }

    const handleContactClick = () => {
    // Rastrear conversão quando o usuário clica para contatar
    trackEvent('contact_click', {
      property_id: property?.id,
      property_title: property?.title,
      realtor_id: property?.realtor_id
    });
    
    // Redirecionar ou abrir modal de contato aqui
    // Por exemplo, redirecionar para a página de contato do corretor:
    // window.location.href = `mailto:${realtor?.email}`;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <PublicHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button 
          onClick={() => navigate(-1)} 
          className="mb-4 inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="mr-1 h-5 w-5" />
          Voltar
        </button>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <ImageGallery
            mainImageUrl={property?.main_image_url}
            images={property?.images || []}
            propertyTitle={property?.title}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Preço e detalhes principais */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div>
                    <span className="text-gray-600 block">Valor</span>
                    <h2 className="text-3xl font-bold text-blue-600">
                      {formatPrice(property?.price)}
                    </h2>
                    {property?.property_type === 'rent' && (
                      <span className="text-gray-500 text-sm">Por mês</span>
                    )}
                  </div>
                  
                  <div className="mt-4 md:mt-0 flex flex-col">
                    {(property?.condo_fee > 0) && (
                      <span className="text-gray-600">
                        Condomínio: <strong>{formatPrice(property?.condo_fee)}</strong>
                      </span>
                    )}
                    {(property?.iptu > 0) && (
                      <span className="text-gray-600">
                        IPTU: <strong>{formatPrice(property?.iptu)}</strong>
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t">
                  {property?.area > 0 && (
                    <div className="flex flex-col items-center text-center">
                      <Ruler className="h-6 w-6 text-blue-600 mb-2" />
                      <span className="text-2xl font-bold">{property.area}m²</span>
                      <span className="text-gray-500 text-sm">Área Total</span>
                    </div>
                  )}
                  
                  {property?.bedrooms > 0 && (
                    <div className="flex flex-col items-center text-center">
                      <Bed className="h-6 w-6 text-blue-600 mb-2" />
                      <span className="text-2xl font-bold">{property.bedrooms}</span>
                      <span className="text-gray-500 text-sm">
                        {property.bedrooms > 1 ? 'Quartos' : 'Quarto'}
                      </span>
                    </div>
                  )}
                  
                  {property?.bathrooms > 0 && (
                    <div className="flex flex-col items-center text-center">
                      <Bath className="h-6 w-6 text-blue-600 mb-2" />
                      <span className="text-2xl font-bold">{property.bathrooms}</span>
                      <span className="text-gray-500 text-sm">
                        {property.bathrooms > 1 ? 'Banheiros' : 'Banheiro'}
                      </span>
                    </div>
                  )}
                  
                  {property?.parking_spots > 0 && (
                    <div className="flex flex-col items-center text-center">
                      <Car className="h-6 w-6 text-blue-600 mb-2" />
                      <span className="text-2xl font-bold">{property.parking_spots}</span>
                      <span className="text-gray-500 text-sm">
                        {property.parking_spots > 1 ? 'Vagas' : 'Vaga'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Tabs para conteúdo */}
              <Tabs 
                defaultValue="info" 
                className="w-full bg-white rounded-lg shadow-md"
                value={activeTab}
                onValueChange={setActiveTab}
              >
                <TabsList className="grid grid-cols-3 rounded-t-lg">
                  <TabsTrigger value="info">Informações</TabsTrigger>
                  <TabsTrigger value="details">Detalhes</TabsTrigger>
                  <TabsTrigger value="location">Localização</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Sobre este imóvel</h3>
                  <p className="text-gray-700 whitespace-pre-line">
                    {property?.description || "Nenhuma descrição disponível."}
                  </p>
                </TabsContent>

                <TabsContent value="details">
                  <Card>
                    <CardContent className="p-6 space-y-8">
                      {/* Características Principais */}
                      <div>
                        <h3 className="text-xl font-semibold mb-4 text-gray-800">Características Principais</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          {property?.area > 0 && (
                            <div className="flex flex-col items-center text-center">
                              <Ruler className="h-6 w-6 text-blue-600 mb-2" />
                              <span className="text-2xl font-bold">{property.area}m²</span>
                              <span className="text-gray-500 text-sm">Área Total</span>
                            </div>
                          )}
                          
                          {property?.bedrooms > 0 && (
                            <div className="flex flex-col items-center text-center">
                              <Bed className="h-6 w-6 text-blue-600 mb-2" />
                              <span className="text-2xl font-bold">{property.bedrooms}</span>
                              <span className="text-gray-500 text-sm">
                                {property.bedrooms > 1 ? 'Quartos' : 'Quarto'}
                              </span>
                            </div>
                          )}
                          
                          {property?.bathrooms > 0 && (
                            <div className="flex flex-col items-center text-center">
                              <Bath className="h-6 w-6 text-blue-600 mb-2" />
                              <span className="text-2xl font-bold">{property.bathrooms}</span>
                              <span className="text-gray-500 text-sm">
                                {property.bathrooms > 1 ? 'Banheiros' : 'Banheiro'}
                              </span>
                            </div>
                          )}
                          
                          {property?.parking_spots > 0 && (
                            <div className="flex flex-col items-center text-center">
                              <Car className="h-6 w-6 text-blue-600 mb-2" />
                              <span className="text-2xl font-bold">{property.parking_spots}</span>
                              <span className="text-gray-500 text-sm">
                                {property.parking_spots > 1 ? 'Vagas' : 'Vaga'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Características Adicionais */}
                        <div className="grid grid-cols-2 gap-4 mt-6">
                          {property?.suites > 0 && (
                            <div className="flex items-center text-gray-700">
                              <Bed className="w-5 h-5 mr-2 text-blue-500" />
                              <span>{property.suites} Suíte{property.suites > 1 ? 's' : ''}</span>
                            </div>
                          )}
                          {property?.floor && (
                            <div className="flex items-center text-gray-700">
                              <Building2 className="w-5 h-5 mr-2 text-blue-500" />
                              <span>Andar: {property.floor}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Comodidades */}
                      {property?.amenities && property.amenities.length > 0 && (
                        <div>
                          <h3 className="text-xl font-semibold mb-4 text-gray-800">Comodidades</h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {property.amenities.map((amenityId) => {
                              const amenityDisplay = getAmenityDisplay(amenityId);
                              const IconComponent = amenityDisplay.icon;
                              return (
                                <div key={amenityId} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                  <IconComponent className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0" />
                                  <span className="text-gray-700">{amenityDisplay.label}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Outras Características */}
                      {property?.features && property.features.length > 0 && (
                        <div>
                          <h3 className="text-xl font-semibold mb-4 text-gray-800">Outras Características</h3>
                          <div className="grid grid-cols-2 gap-3">
                            {property.features.map((feature, index) => (
                              <div key={index} className="flex items-center text-gray-700">
                                <Check className="w-5 h-5 mr-2 text-green-500" />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="location" className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Localização</h3>
                  
                  <div className="mb-4">
                    <p className="flex items-center text-gray-700 mb-2">
                      <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                      {property?.address || ''}{property?.neighborhood ? `, ${property.neighborhood}` : ''}{city?.name ? `, ${city.name}` : ''}
                    </p>
                  </div>
                  
                  {property?.map_url ? (
                    <div className="aspect-[16/9] w-full rounded-lg overflow-hidden">
                      <iframe 
                        src={property.map_url}
                        className="w-full h-full border-0"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Mapa de Localização"
                      ></iframe>
                    </div>
                  ) : (
                    <div className="aspect-[16/9] w-full bg-gray-200 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Mapa não disponível</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Contato e info da imobiliária */}
            <div className="lg:col-span-1">
              <Card className="shadow-md mb-6">
                <CardContent className="p-6">
                  <div className="flex items-center mb-6">
                    {realtor?.logo_url ? (
                      <img 
                        src={realtor.logo_url} 
                        alt={realtor.company_name}
                        className="w-16 h-16 rounded-full object-cover mr-4"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                        <Building2 className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-lg">{realtor?.company_name}</h3>
                      {realtor?.creci && <p className="text-gray-600">CRECI: {realtor.creci}</p>}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Phone className="mr-2 h-4 w-4" />
                      Ver Telefone
                    </Button>
                    
                    <Button variant="outline" className="w-full">
                      <Mail className="mr-2 h-4 w-4" />
                      Enviar Mensagem
                    </Button>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold mb-2">Informações</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>Código: {property?.id?.substring(0, 8)}</p>
                      <p>Tipo: {category?.name || "Não informado"}</p>
                      {property?.property_type === "sale" && <p>Finalidade: Venda</p>}
                      {property?.property_type === "rent" && <p>Finalidade: Aluguel</p>}
                      {property?.property_type === "temporary" && <p>Finalidade: Temporada</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 rounded-lg shadow-md">
                <h3 className="font-bold text-xl mb-4">Interessou pelo imóvel?</h3>
                <p className="mb-6">Entre em contato com o anunciante para mais informações e agendar uma visita.</p>
                <Button className="w-full bg-white text-blue-600 hover:bg-gray-100" onClick={handleContactClick}>
                  Contatar Anunciante
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <PublicFooter />
    </div>
  );
}
