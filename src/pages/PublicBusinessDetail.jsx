
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Business } from "@/api/entities";
import { City } from "@/api/entities";
import { Beach } from "@/api/entities";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Product } from "@/api/entities";
import { Review } from "@/api/entities";
import { SiteConfig } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  MapPin, 
  Phone, 
  Globe, 
  Clock, 
  Percent, 
  ChevronLeft, 
  Star, 
  Camera, 
  ShoppingBag,
  Menu,
  Share,
  Heart,
  Calendar,
  CheckCircle,
  CreditCard,
  Package2,
  ShoppingCart,
  Mail,
  Instagram,
  Facebook,
  ExternalLink,
  Dog, Wifi, Baby, Beer, Users as UsersIcon, Mic2, Guitar, Music2, Flame, Accessibility,
  Vegan, Leaf, Beef, Fish, UtensilsCrossed, Sun as SunIcon, Puzzle, Car, AirVent, Bike,
  ShoppingBag as BagIcon // Evitar conflito de nome com o componente ShoppingBag
} from "lucide-react";
import LocationMap from "@/components/public/LocationMap";
import ReviewSection from "@/components/public/ReviewSection";

export default function PublicBusinessDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [business, setBusiness] = useState(null);
  const [city, setCity] = useState(null);
  const [beach, setBeach] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [siteConfig, setSiteConfig] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [cityLoadError, setCityLoadError] = useState(false);
  const [beachLoadError, setBeachLoadError] = useState(false);
  const [activeTab, setActiveTab] = useState("info");

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const businessId = queryParams.get('id');
    const showCatalog = queryParams.get('showCatalog') === 'true';
    
    if (showCatalog) {
      setActiveTab('products');
    }
    
    if (!businessId) {
      navigate(createPageUrl("PublicBusinesses"));
      return;
    }
    
    loadBusinessData(businessId);
  }, [location.search, navigate]);

  const isValidObjectId = (id) => {
    if (!id || typeof id !== 'string') return false;
    const hexRegex = /^[0-9a-fA-F]{24}$/;
    const invalidChars = /[$[\]{}()*+?.\\^|]/;
    return hexRegex.test(id) && !invalidChars.test(id);
  };

  const loadBusinessData = async (businessId) => {
    try {
      setIsLoading(true);
      setCityLoadError(false);
      setBeachLoadError(false);

      try {
        const configs = await SiteConfig.list();
        if (configs && configs.length > 0) {
          setSiteConfig(configs[0]);
        }
      } catch (configError) {
        console.error("Erro ao carregar configurações do site:", configError);
      }
      
      try {
        const userData = await User.me();
        setCurrentUser(userData);
      } catch (error) {
        console.log("Usuário não está logado");
      }
      
      try {
        const businessData = await Business.get(businessId);
        if (!businessData) {
          setBusiness(null);
          return;
        }
        
        setBusiness(businessData);
        
        if (businessData.city_id && isValidObjectId(businessData.city_id)) {
          try {
            const cityData = await City.get(businessData.city_id);
            if (cityData) {
              setCity(cityData);
            } else {
              setCityLoadError(true);
            }
          } catch (cityError) {
            console.error("Erro ao carregar cidade:", cityError);
            setCityLoadError(true);
          }
        } else {
          setCityLoadError(true);
        }
        
        if (businessData.beach_id && isValidObjectId(businessData.beach_id)) {
          try {
            const beachData = await Beach.get(businessData.beach_id);
            if (beachData) {
              setBeach(beachData);
            } else {
              setBeachLoadError(true);
            }
          } catch (beachError) {
            console.error("Erro ao carregar praia:", beachError);
            setBeachLoadError(true);
          }
        } else {
          setBeachLoadError(true);
        }
        
        try {
          const productsData = await Product.filter({ business_id: businessId });
          setProducts(Array.isArray(productsData) ? productsData : []);
        } catch (productsError) {
          console.error("Erro ao carregar produtos:", productsError);
          setProducts([]);
        }
        
        try {
          const reviewsData = await Review.filter({ 
            entity_type: "business",
            entity_id: businessId
          });
          setReviews(Array.isArray(reviewsData) ? reviewsData : []);
        } catch (reviewsError) {
          console.error("Erro ao carregar avaliações:", reviewsError);
          setReviews([]);
        }
      } catch (businessError) {
        console.error("Erro ao carregar dados do negócio:", businessError);
        setBusiness(null);
      }
      
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  const formatFullAddress = () => {
    let address = business?.address || "";
    if (city?.name) {
      address += address ? `, ${city.name}` : city.name;
    }
    address += " - SC";
    return address;
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };
  

  const viewProductDetails = (productId) => {
    navigate(createPageUrl("ProductCheckout") + `?id=${business.id}&product_id=${productId}`);
  };

  const handleViewCatalog = () => {
    setActiveTab('products');
  };

  const amenityIcons = {
    pet_friendly: { icon: Dog, label: "Aceita Pets" },
    wifi: { icon: Wifi, label: "Wi-Fi Grátis" },
    changing_station: { icon: Baby, label: "Fraldário" },
    pub_style: { icon: Beer, label: "Estilo Pub" },
    family_friendly: { icon: UsersIcon, label: "Ambiente Familiar" },
    live_music: { icon: Mic2, label: "Música ao Vivo" },
    theme_rock: { icon: Guitar, label: "Temático: Rock" },
    theme_mpb: { icon: Music2, label: "Temático: MPB" },
    theme_sertanejo: { icon: Music2, label: "Temático: Sertanejo" },
    theme_gauchesco: { icon: Flame, label: "Temático: Gaúcho" },
    music_style_rock: { icon: Guitar, label: "Música: Rock" },
    music_style_mpb: { icon: Music2, label: "Música: MPB" },
    music_style_sertanejo: { icon: Music2, label: "Música: Sertanejo" },
    music_style_gauchesco: { icon: Flame, label: "Música: Gaúcha" },
    accessibility: { icon: Accessibility, label: "Acessibilidade" },
    menu_vegan: { icon: Vegan, label: "Cardápio Vegano" },
    menu_vegetarian: { icon: Leaf, label: "Cardápio Vegetariano" },
    menu_steakhouse: { icon: Beef, label: "Churrascaria" },
    menu_japanese: { icon: Fish, label: "Culinária Japonesa" },
    menu_chinese: { icon: UtensilsCrossed, label: "Culinária Chinesa" },
    outdoor_seating: { icon: SunIcon, label: "Mesas ao Ar Livre" },
    playground: { icon: Puzzle, label: "Espaço Kids" },
    parking: { icon: Car, label: "Estacionamento" },
    air_conditioning: { icon: AirVent, label: "Ar Condicionado" },
    delivery: { icon: Bike, label: "Delivery" },
    take_away: { icon: BagIcon, label: "Para Levar" },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicHeader siteConfig={siteConfig} currentUser={currentUser} />
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Comércio não encontrado</h2>
          <p className="text-gray-600 mb-8">O comércio que você está procurando não foi encontrado ou pode ter sido removido.</p>
          <Button onClick={() => navigate(createPageUrl("PublicBusinesses"))}>
            Ver todos os comércios
          </Button>
        </div>
        <PublicFooter siteConfig={siteConfig} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader siteConfig={siteConfig} currentUser={currentUser} />
      
      <div className="container mx-auto p-6">
        <Button 
          variant="ghost" 
          onClick={handleGoBack} 
          className="mb-4 text-gray-600 hover:text-gray-800 flex items-center"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Voltar
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
              <div className="relative aspect-[16/9] bg-gray-200">
                {business.gallery && business.gallery.length > 0 ? (
                  <>
                    <div className="w-full h-full overflow-hidden">
                      <img
                        src={business.gallery[activeImageIndex] || business.image_url || "https://images.unsplash.com/photo-1581509234602-ca417d908723?auto=format&fit=crop&w=1200&q=80"}
                        alt={business.name}
                        className="w-full h-full object-cover transition-transform duration-500"
                      />
                    </div>
                    
                    {business.gallery.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                        {business.gallery.map((_, index) => (
                          <button
                            key={index}
                            className={`w-2 h-2 rounded-full ${
                              index === activeImageIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                            onClick={() => setActiveImageIndex(index)}
                          />
                        ))}
                      </div>
                    )}
                    
                    {business.gallery.length > 1 && (
                      <>
                        <button
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-1 rounded-full hover:bg-black/50"
                          onClick={() => setActiveImageIndex(prev => (prev === 0 ? business.gallery.length - 1 : prev - 1))}
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-1 rounded-full hover:bg-black/50"
                          onClick={() => setActiveImageIndex(prev => (prev === business.gallery.length - 1 ? 0 : prev + 1))}
                        >
                          <ChevronLeft className="h-6 w-6 transform rotate-180" />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <img
                    src={business.image_url || "https://images.unsplash.com/photo-1581509234602-ca417d908723?auto=format&fit=crop&w=1200&q=80"}
                    alt={business.name}
                    className="w-full h-full object-cover"
                  />
                )}
                
                {business.is_club_member && (
                  <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                    <Percent className="h-4 w-4 mr-1" />
                    Desconto Clube
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">{business.name}</h1>
                    <div className="flex items-center text-gray-600 mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{formatFullAddress()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-full"
                      onClick={toggleFavorite}
                    >
                      <Heart className={`h-5 w-5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-full"
                    >
                      <Share className="h-5 w-5 text-gray-400" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {business.type && (
                    <Badge className="bg-blue-100 text-blue-800">
                      {business.type.replace('_', ' ')}
                    </Badge>
                  )}
                  
                  {business.discount_type && business.discount_value && (
                    <Badge className="bg-orange-100 text-orange-800">
                      {business.discount_type === 'percentual' 
                        ? `${business.discount_value}% de desconto` 
                        : `R$ ${business.discount_value} de desconto`}
                    </Badge>
                  )}
                  
                  {beach && !beachLoadError && (
                    <Badge variant="outline">
                      Próximo à {beach.name}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-1" />
                    <span className="font-semibold">{averageRating.toFixed(1)}</span>
                    <span className="text-gray-500 ml-1">({reviews.length} avaliações)</span>
                  </div>
                </div>
                
                <p className="text-gray-700 mt-4 mb-6 leading-relaxed">
                  {business.description || "Sem descrição disponível para este comércio."}
                </p>
                
                {business?.amenities && business.amenities.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Comodidades e Características</h2>
                    <div className="flex flex-wrap gap-3">
                      {business.amenities.map(amenityKey => {
                        const amenityDetail = amenityIcons[amenityKey];
                        if (!amenityDetail) return null;
                        const IconComponent = amenityDetail.icon;
                        return (
                          <Badge 
                            key={amenityKey} 
                            variant="outline" 
                            className="py-2 px-3 text-sm bg-slate-50 border-slate-200 text-slate-700"
                          >
                            <IconComponent className="w-4 h-4 mr-2" />
                            {amenityDetail.label}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                <div className="mt-4 flex gap-3">
                  {business.website && (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => window.open(business.website, '_blank')}
                    >
                      Website
                    </Button>
                  )}
                </div>
                
                <div className="space-y-4 mt-6">
                  {business.phone && (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Telefone</p>
                        <a href={`tel:${business.phone}`} className="text-gray-800 hover:text-blue-600">
                          {business.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {business.website && (
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Website</p>
                        <a 
                          href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-800 hover:text-blue-600"
                        >
                          {business.website}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {business.opening_hours && (
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Horário de Funcionamento</p>
                        <p className="text-gray-800">{business.opening_hours}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="mt-6">
              <TabsList className="w-full grid grid-cols-3 sm:grid-cols-4">
                <TabsTrigger value="info">Informações</TabsTrigger>
                <TabsTrigger value="products">Produtos</TabsTrigger>
                <TabsTrigger value="reviews">Avaliações</TabsTrigger>
                <TabsTrigger value="location" className="hidden sm:flex">Localização</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="prose max-w-none">
                      <p>{business.description || "Sem informações adicionais disponíveis."}</p>
                      
                      {business.is_club_member && (
                        <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                          <h3 className="text-lg font-semibold text-orange-800 flex items-center">
                            <Percent className="h-5 w-5 mr-2" />
                            Vantagens para Membros do Clube
                          </h3>
                          <p className="text-orange-700 mt-2">
                            {(business.club_settings?.discount_description) || 
                             (business.club_settings?.discount_type === 'percentual' 
                              ? `${business.club_settings?.discount_value || business.discount_value}% de desconto` 
                              : `R$ ${parseFloat(business.club_settings?.discount_value || business.discount_value || 0).toFixed(2)} de desconto`)}
                          </p>
                          <div className="mt-3">
                            <Button 
                              className="bg-orange-500 hover:bg-orange-600 text-white"
                              onClick={() => navigate(createPageUrl("MembershipCard"))}
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              Obter Cartão de Membro
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="products" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Produtos e Serviços</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {products.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {products.map((product) => (
                          <Card key={product.id} className="overflow-hidden">
                            <div className="aspect-video relative">
                              {product.image_url ? (
                                <img 
                                  src={product.image_url} 
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                  <ShoppingBag className="h-12 w-12 text-gray-300" />
                                </div>
                              )}
                              {product.is_featured && (
                                <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-800 text-xs font-medium px-2 py-1 rounded">
                                  <Star className="h-3 w-3 inline mr-1" />
                                  Destaque
                                </div>
                              )}
                            </div>
                            <CardContent className="p-4">
                              <h3 className="font-medium mb-1">{product.name}</h3>
                              <p className="text-blue-600 font-bold mb-2">
                                R$ {product.price.toFixed(2)}
                              </p>
                              <Button 
                                className="w-full"
                                onClick={() => viewProductDetails(product.id)}
                              >
                                Comprar
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-10">
                        <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium">Nenhum produto disponível</h3>
                        <p className="mt-1 text-gray-500">Este estabelecimento ainda não cadastrou produtos.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <ReviewSection 
                      entityType="business"
                      entityId={business.id}
                      reviews={reviews}
                      onReviewAdded={(newReview) => setReviews(prev => [...prev, newReview])}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="location" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                      Localização
                    </h3>
                    
                    <div className="mb-4">
                      <p className="text-gray-700">{formatFullAddress()}</p>
                    </div>
                    
                    <div className="h-[300px] bg-gray-100 rounded-lg overflow-hidden">
                      {(business.latitude && business.longitude) ? (
                        <LocationMap 
                          latitude={business.latitude} 
                          longitude={business.longitude} 
                          name={business.name}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          Localização exata não disponível
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Informações de Contato</h3>
                
                {business.phone && (
                  <Button 
                    className="w-full mb-3 bg-blue-600 hover:bg-blue-700"
                    asChild
                  >
                    <a href={`tel:${business.phone}`}>
                      <Phone className="h-4 w-4 mr-2" />
                      Ligar
                    </a>
                  </Button>
                )}
                
                {business.website && (
                  <Button 
                    variant="outline" 
                    className="w-full mb-3"
                    asChild
                  >
                    <a 
                      href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Visitar Website
                    </a>
                  </Button>
                )}
                
                {business.opening_hours && (
                  <div className="text-sm text-gray-600 flex items-start mt-4">
                    <Clock className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-700">Horário:</p>
                      <p>{business.opening_hours}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {business.is_club_member && (
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center">
                    <Percent className="h-5 w-5 mr-2" />
                    Membro do Clube
                  </h3>
                  
                  <div className="mb-4">
                    <p className="text-orange-700">
                      Este estabelecimento oferece descontos especiais para membros do Clube Praias Catarinenses!
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3 mb-4 flex items-center">
                    <div className="bg-orange-500 text-white rounded-full w-12 h-12 flex items-center justify-center mr-3">
                      <Percent className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Desconto para membros</p>
                      <p className="font-bold text-lg">
                        {business.discount_type === 'percentual' 
                          ? `${business.discount_value}%` 
                          : `R$ ${parseFloat(business.discount_value || 0).toFixed(2)}`}
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={() => navigate(createPageUrl("MembershipCard"))}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Obter Cartão
                  </Button>
                </CardContent>
              </Card>
            )}
            
            {city && !cityLoadError && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Sobre {city.name}</h3>
                  
                  {city.image_url && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                      <img
                        src={city.image_url}
                        alt={city.name}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {city.description || `${city.name} é uma cidade localizada no litoral de Santa Catarina.`}
                  </p>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate(`${createPageUrl("PublicCities")}?id=${city.id}`)}
                  >
                    Ver mais sobre {city.name}
                  </Button>
                </CardContent>
              </Card>
            )}
            
            {beach && !beachLoadError && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Próximo à Praia: {beach.name}</h3>
                  
                  {beach.image_url && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                      <img
                        src={beach.image_url}
                        alt={beach.name}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}
                  
                  {beach.main_activity && (
                    <Badge className="mb-3 bg-blue-100 text-blue-800">
                      Ideal para {beach.main_activity}
                    </Badge>
                  )}
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {beach.description || `${beach.name} é uma praia localizada em ${city?.name || 'Santa Catarina'}.`}
                  </p>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate(`${createPageUrl("PublicBeaches")}?id=${beach.id}`)}
                  >
                    Ver mais sobre {beach.name}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      <PublicFooter siteConfig={siteConfig} />
    </div>
  );
}
