
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Button } from "@/components/ui/button";
import { City } from "@/api/entities";
import { Beach } from "@/api/entities";
import { Property } from "@/api/entities";
import PropertyCard from "@/components/properties/PropertyCard";
import { Realtor } from "@/api/entities";
import { PropertyCategory } from "@/api/entities";
import { SiteConfig } from "@/api/entities";
import { User } from "@/api/entities";
import { 
  MapPin, Building2, Eye, ChevronRight, Star, Calendar, 
  Users, Waves, Store, Wrench, CreditCard, Phone, Clock, ArrowRight,
  Home
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import { format } from "date-fns"; // Not strictly needed if not formatting dates here
// import { ptBR } from "date-fns/locale"; // Not strictly needed
import BenefitClubBanner from "@/components/public/BenefitClubBanner";
import InfluencerPromoCard from "@/components/influencers/InfluencerPromoCard";

const RatingBadge = ({ rating }) => (
  <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 font-medium rounded-full flex items-center px-2 py-1 text-sm">
    <Star className="w-4 h-4 mr-1 fill-yellow-900" />
    {rating?.toFixed(1) || "N/A"}
  </div>
);

export default function Public() {
  const [isLoading, setIsLoading] = useState(true);
  const [siteConfig, setSiteConfig] = useState(null);
  const [featuredCities, setFeaturedCities] = useState([]);
  const [featuredBeaches, setFeaturedBeaches] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  // const [businesses, setBusinesses] = useState([]); // Not actively used for featured display on home
  // const [events, setEvents] = useState([]); // Not actively used for featured display on home
  // const [serviceProviders, setServiceProviders] = useState([]); // Not actively used for featured display on home
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [realtors, setRealtors] = useState([]);
  const [propertyCategories, setPropertyCategories] = useState([]);


  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);

      const configs = await SiteConfig.list();
      if (configs && configs.length > 0) {
        setSiteConfig(configs[0]);
      }

      try {
        const userData = await User.me();
        setCurrentUser(userData);
      } catch (error) {
        // console.log("Usuário não está logado");
      }

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
      setFeaturedCities(uniqueCities);


      const beachesData = await Beach.list();
      const uniqueBeaches = [];
      const beachNames = new Set();
      if (beachesData && beachesData.length > 0) {
        beachesData.forEach(beach => {
          if (beach.name && !beachNames.has(beach.name.toLowerCase())) {
            beachNames.add(beach.name.toLowerCase());
            uniqueBeaches.push(beach);
          }
        });
      }
      setFeaturedBeaches(uniqueBeaches);

      try {
        const [propertiesData, realtorsData, categoriesData] = await Promise.all([
          Property.filter({ status: "active" }), // Removido o filtro is_featured para mostrar todos os imóveis ativos
          Realtor.list(),
          PropertyCategory.list()
        ]);
        
        setFeaturedProperties(propertiesData?.slice(0, 3) || []); // Mantém apenas os 3 primeiros
        setRealtors(realtorsData || []);
        setPropertyCategories(categoriesData || []);

      } catch (error) {
        console.error("Erro ao carregar imóveis, corretores ou categorias:", error);
        setFeaturedProperties([]);
        setRealtors([]);
        setPropertyCategories([]);
      }

    } catch (error) {
      console.error("Erro ao carregar dados iniciais:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const bannerConfig = siteConfig?.banner_header || {
    titulo: "Descubra o Paraíso Catarinense",
    subtitulo: "O guia completo das melhores praias, hotéis, restaurantes e serviços de Santa Catarina",
    tipo_fundo: "cor",
    cor_fundo: "#007BFF",
    botao_primario: {
      texto: "Criar Conta Gratuita",
      cor_fundo: "#ffffff",
      cor_texto: "#007BFF",
      cor_hover: "#e5e7eb",
      link: "/TouristSignup" // Atualizado de "/InfluencerSignup" para "/TouristSignup"
    },
    botao_secundario: {
      texto: "Ver o melhor Plano",
      cor_fundo: "transparent",
      cor_borda: "#ffffff",
      cor_texto: "#ffffff",
      cor_hover: "rgba(255,255,255,0.1)",
      link: "/SubscriptionPlans"
    }
  };

  const isLightColor = (hexColor) => {
    if (!hexColor || hexColor === 'transparent') return false;
    hexColor = hexColor.replace('#', '');
    if (!/^[0-9A-F]{6}$/i.test(hexColor)) return false;
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  };

  function adjustColorBrightness(hex, percent) {
    hex = hex.replace(/^#/, '');
    let r = parseInt(hex.slice(0, 2), 16);
    let g = parseInt(hex.slice(2, 4), 16);
    let b = parseInt(hex.slice(4, 6), 16);
    r = Math.max(0, Math.min(255, r + percent));
    g = Math.max(0, Math.min(255, g + percent));
    b = Math.max(0, Math.min(255, b + percent));
    const newHex = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    return `#${newHex}`;
  }

  const bgStyle = bannerConfig.tipo_fundo === 'imagem' && bannerConfig.imagem_fundo
    ? { backgroundImage: `url(${bannerConfig.imagem_fundo})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: `linear-gradient(to bottom right, ${bannerConfig.cor_fundo || "#007BFF"}, ${bannerConfig.cor_fundo ? adjustColorBrightness(bannerConfig.cor_fundo, -20) : "#0056b3"})` };

  const textColor = bannerConfig.tipo_fundo === 'cor' && isLightColor(bannerConfig.cor_fundo) 
    ? 'text-gray-900' 
    : 'text-white';

  const primaryButtonStyle = {
    backgroundColor: bannerConfig.botao_primario?.cor_fundo || '#ffffff',
    color: bannerConfig.botao_primario?.cor_texto || '#007BFF',
  };

  const secondaryButtonStyle = {
    backgroundColor: bannerConfig.botao_secundario?.cor_fundo || 'transparent',
    color: bannerConfig.botao_secundario?.cor_texto || '#ffffff',
    borderColor: bannerConfig.botao_secundario?.cor_borda || '#ffffff',
    borderWidth: '1px',
    borderStyle: 'solid'
  };

  const getRealtorById = (realtorId) => {
    return realtors.find(r => r.id === realtorId);
  };

  const getPropertyCategoryNameById = (categoryId) => {
    const category = propertyCategories.find(c => c.id === categoryId);
    return category?.name;
  };
  
  const getCityNameById = (cityId) => {
    const city = featuredCities.find(c => c.id === cityId); 
    return city?.name;
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader siteConfig={siteConfig} currentUser={currentUser} />
      
      <section className="relative text-white py-16 md:py-24" style={bgStyle}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 ${textColor}`}>
              {bannerConfig.titulo || "Descubra o Paraíso Catarinense"}
            </h1>
            <p className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto ${textColor}`}>
              {bannerConfig.subtitulo || "O guia completo das melhores praias, hotéis, restaurantes e serviços de Santa Catarina"}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center sm:items-center">
              {/* IMPORTANTE: Modificar o link aqui, removendo o uso de createPageUrl que pode estar causando problemas */}
              <Button 
                asChild
                className="hover:bg-opacity-90 text-lg px-8 py-6 w-full sm:w-auto"
                style={primaryButtonStyle}
              >
                <Link to="/TouristSignup">
                  {bannerConfig.botao_primario?.texto || "Criar Conta Gratuita"}
                </Link>
              </Button>
              
              <Button 
                asChild
                variant="outline"
                className="hover:bg-opacity-20 text-lg px-8 py-6 w-full sm:w-auto"
                style={secondaryButtonStyle}
              >
                <Link to={createPageUrl("SubscriptionPlans")}>
                  {bannerConfig.botao_secundario?.texto || "Ver o melhor Plano"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Principais Destinos
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Descubra os melhores lugares para aproveitar em Santa Catarina
            </p>
          </div>

          {/* Cidades em Destaque */}
          <div className="mb-16">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-900 flex items-center">
                <Building2 className="w-6 h-6 mr-2 text-[#007BFF]" />
                Cidades em Destaque
              </h3>
              <Button 
                asChild
                variant="ghost" 
                className="text-[#007BFF] hover:text-blue-700"
              >
                <Link to={createPageUrl("PublicCities")}>
                  Ver todas as cidades
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCities.slice(0, 3).map((city) => (
                <div key={city.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="relative">
                    <img
                      src={city.image_url || "https://images.unsplash.com/photo-1589083130544-0d6a2926e519?auto=format&fit=crop&w=600&q=80"}
                      alt={city.name}
                      className="w-full h-48 object-cover"
                    />
                    <RatingBadge rating={city.average_rating || 3.8} />
                    <div className="absolute bottom-0 left-0 p-4 bg-gradient-to-t from-black/70 to-transparent w-full">
                      <h4 className="text-xl font-semibold text-white">{city.name}</h4>
                      <p className="text-white/80 text-sm flex items-center">
                        <MapPin className="w-4 h-4 mr-1" /> Santa Catarina
                      </p>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                      {city.description || "Descubra as belezas e atrações desta cidade catarinense."}
                    </p>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center text-gray-600">
                        <Waves className="w-4 h-4 mr-2 text-blue-500" />
                        {city.beaches_count || 0} praias cadastradas
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Store className="w-4 h-4 mr-2 text-blue-500" />
                        {city.businesses_count || 0} comércios
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Wrench className="w-4 h-4 mr-2 text-blue-500" />
                        {city.providers_count || 0} prestadores de serviço
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-2 text-blue-500" />
                        {city.population?.toLocaleString() || "N/A"} habitantes
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <Button asChild className="w-full bg-[#ff5e00] hover:bg-[#ff8c12] text-white">
                        <Link to={createPageUrl(`CityDetail?id=${city.id}`)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalhes
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full border-[#007BFF] text-[#007BFF]">
                        <Link to={createPageUrl("SubscriptionPlans")}>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Peça seu Cartão
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Praias Imperdíveis */}
          <div className="mb-16">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-900 flex items-center">
                <Waves className="w-6 h-6 mr-2 text-[#007BFF]" />
                Praias Imperdíveis
              </h3>
              <Button 
                asChild
                variant="ghost" 
                className="text-[#007BFF] hover:text-blue-700"
              >
                <Link to={createPageUrl("PublicBeaches")}>
                  Ver todas as praias
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredBeaches.slice(0, 3).map((beach) => (
                <div key={beach.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="relative">
                    <img
                      src={beach.image_url || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"}
                      alt={beach.name}
                      className="w-full h-48 object-cover"
                    />
                    <RatingBadge rating={beach.average_rating || 4.2} />
                    <div className="absolute bottom-0 left-0 p-4 bg-gradient-to-t from-black/70 to-transparent w-full">
                      <h4 className="text-xl font-semibold text-white">{beach.name}</h4>
                      <p className="text-white/80 text-sm flex items-center">
                        <MapPin className="w-4 h-4 mr-1" /> {getCityNameById(beach.city_id) || "Santa Catarina"}
                      </p>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                      {beach.description || `Conheça essa incrível praia em ${getCityNameById(beach.city_id) || "Santa Catarina"}.`}
                    </p>
                    <div className="mb-4">
                      {beach.main_activity && (
                        <Badge className="mr-2 bg-blue-100 text-blue-800 hover:bg-blue-200">
                          {beach.main_activity}
                        </Badge>
                      )}
                      {beach.sea_type && (
                        <Badge variant="outline">
                          {beach.sea_type.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <Button asChild className="w-full bg-[#FF5722] hover:bg-[#E64A19] text-white">
                        <Link to={createPageUrl(`PublicBeachDetail?id=${beach.id}`)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalhes
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full border-[#007BFF] text-[#007BFF]">
                        <Link to={createPageUrl("SubscriptionPlans")}>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Peça seu Cartão
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <BenefitClubBanner />

          {/* Imóveis em Destaque */}
          <div className="mb-16">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-900 flex items-center">
                <Home className="w-6 h-6 mr-2 text-[#007BFF]" />
                Imóveis em Destaque
              </h3>
              <Button 
                asChild
                variant="ghost" 
                className="text-[#007BFF] hover:text-blue-700"
              >
                <Link to={createPageUrl("PublicProperties")}>
                  Ver todos os imóveis
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            {isLoading && featuredProperties.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1,2,3].map(i => (
                  <Card key={i} className="overflow-hidden h-full flex flex-col">
                    <div className="relative h-48 bg-gray-200 animate-pulse"></div>
                    <CardContent className="p-4 flex-grow animate-pulse">
                      <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-3 w-1/2"></div>
                      <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : featuredProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredProperties.map(property => {
                  const realtor = getRealtorById(property.realtor_id);
                  const categoryName = getPropertyCategoryNameById(property.category_id);
                  const cityName = getCityNameById(property.city_id);
                  return (
                    <PropertyCard 
                      key={property.id} 
                      property={property} 
                      realtor={realtor}
                      categoryName={categoryName}
                      cityName={cityName}
                    />
                  )
                })}
              </div>
            ) : (
              <div className="bg-white p-8 text-center rounded-lg border border-gray-200">
                <Home className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum imóvel em destaque</h3>
                <p className="text-gray-500 mb-4">Em breve novos anúncios de imóveis serão exibidos aqui.</p>
                <Button asChild>
                  <Link to={createPageUrl("RealtorSignup")}>
                    Anunciar meu imóvel
                  </Link>
                </Button>
              </div>
            )}
          </div>

          <InfluencerPromoCard />

          {/* Seção de Eventos */}
          <div className="mb-16">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-900 flex items-center">
                <Calendar className="w-6 h-6 mr-2 text-[#007BFF]" />
                Próximos Eventos
              </h3>
              <Button 
                asChild
                variant="ghost" 
                className="text-[#007BFF] hover:text-blue-700"
              >
                <Link to={createPageUrl("Events")}>
                  Ver todos os eventos
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
                <div className="relative w-56 min-w-[140px] h-auto">
                  <img
                    src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=600&q=80"
                    alt="Festival Cultural de Bombinhas"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-0 left-0 bg-blue-600 text-white font-bold p-2 flex flex-col items-center">
                    <span className="text-xl">9</span>
                    <span className="text-xs">abr</span>
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h4 className="font-bold text-lg text-gray-900 mb-1">Festival Cultural de Bombinhas</h4>
                  <div className="flex items-center text-gray-500 text-sm mb-1">
                    <Calendar className="w-4 h-4 mr-1" />09/04/2025
                    <Clock className="w-4 h-4 ml-3 mr-1" />10:00
                  </div>
                  <div className="flex items-center text-gray-500 text-sm mb-3">
                    <MapPin className="w-4 h-4 mr-1" />Bombinhas
                  </div>
                  <p className="text-gray-700 text-sm mb-auto flex-grow">
                    O Festival Cultural de Bombinhas é uma celebração das tradições, arte e cultura açoriana presente em Santa...
                  </p>
                  <Link to={createPageUrl("Events")} className="text-blue-600 flex items-center mt-2">
                    Ver detalhes<ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
              <div className="flex bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
                <div className="relative w-56 min-w-[140px] h-auto">
                  <img
                    src="https://images.unsplash.com/photo-1467810563316-b5476525c0f9?auto=format&fit=crop&w=600&q=80"
                    alt="Réveillon em Balneário Camboriú"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-0 left-0 bg-blue-600 text-white font-bold p-2 flex flex-col items-center">
                    <span className="text-xl">30</span>
                    <span className="text-xs">dez</span>
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h4 className="font-bold text-lg text-gray-900 mb-1">Réveillon em Balneário Camboriú</h4>
                  <div className="flex items-center text-gray-500 text-sm mb-1">
                    <Calendar className="w-4 h-4 mr-1" />30/12/2025
                    <Clock className="w-4 h-4 ml-3 mr-1" />20:00
                  </div>
                  <div className="flex items-center text-gray-500 text-sm mb-3">
                    <MapPin className="w-4 h-4 mr-1" />Praia Central
                  </div>
                  <p className="text-gray-700 text-sm mb-auto flex-grow">
                    Venha celebrar a virada do ano em um dos melhores Réveillons do Brasil! A festa na Praia Central de...
                  </p>
                  <Link to={createPageUrl("Events")} className="text-blue-600 flex items-center mt-2">
                    Ver detalhes<ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Seção de Prestadores */}
          <div className="mb-16">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-900 flex items-center">
                <Wrench className="w-6 h-6 mr-2 text-[#007BFF]" />
                Prestadores de Serviço
              </h3>
              <Link to={createPageUrl("PublicServiceProviders")} className="text-[#007BFF] hover:text-blue-700 flex items-center">
                Ver todos<ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Wrench className="w-8 h-8 text-[#007BFF]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900">João Silva</h4>
                    <Badge className="bg-[#007BFF] text-white">Eletricista</Badge>
                  </div>
                </div>
                <div className="flex items-center text-gray-500 text-sm mb-3">
                  <MapPin className="w-4 h-4 mr-1" />Florianópolis
                  <Badge variant="outline" className="ml-3 border-green-500 text-green-600">Disponível</Badge>
                </div>
                <p className="text-gray-700 text-sm mb-4">
                  Eletricista profissional com mais de 10 anos de experiência em instalações residenciais e comerciais.
                </p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button asChild variant="outline" className="border-[#007BFF] text-[#007BFF]">
                    <Link to={createPageUrl("PublicServiceProviders")}><Phone className="w-4 h-4 mr-2" />Contato</Link>
                  </Button>
                  <Button asChild className="bg-[#007BFF] hover:bg-blue-700 text-white">
                    <Link to={createPageUrl("PublicServiceProviders")}><Calendar className="w-4 h-4 mr-2" />Agendar</Link>
                  </Button>
                </div>
              </div>
              <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Wrench className="w-8 h-8 text-[#007BFF]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900">Maria Oliveira</h4>
                    <Badge className="bg-[#007BFF] text-white">Diarista</Badge>
                  </div>
                </div>
                <div className="flex items-center text-gray-500 text-sm mb-3">
                  <MapPin className="w-4 h-4 mr-1" />Balneário Camboriú
                  <Badge variant="outline" className="ml-3 border-green-500 text-green-600">Disponível</Badge>
                </div>
                <p className="text-gray-700 text-sm mb-4">
                  Diarista com referências e experiência em limpeza de imóveis, apartamentos e casas de temporada.
                </p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button asChild variant="outline" className="border-[#007BFF] text-[#007BFF]">
                    <Link to={createPageUrl("PublicServiceProviders")}><Phone className="w-4 h-4 mr-2" />Contato</Link>
                  </Button>
                  <Button asChild className="bg-[#007BFF] hover:bg-blue-700 text-white">
                    <Link to={createPageUrl("PublicServiceProviders")}><Calendar className="w-4 h-4 mr-2" />Agendar</Link>
                  </Button>
                </div>
              </div>
              <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Wrench className="w-8 h-8 text-[#007BFF]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900">Carlos Santos</h4>
                    <Badge className="bg-[#007BFF] text-white">Pintor</Badge>
                  </div>
                </div>
                <div className="flex items-center text-gray-500 text-sm mb-3">
                  <MapPin className="w-4 h-4 mr-1" />Bombinhas
                  <Badge variant="outline" className="ml-3 border-green-500 text-green-600">Disponível</Badge>
                </div>
                <p className="text-gray-700 text-sm mb-4">
                  Pintor especializado em ambientes internos e externos, com acabamento profissional.
                </p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button asChild variant="outline" className="border-[#007BFF] text-[#007BFF]">
                    <Link to={createPageUrl("PublicServiceProviders")}><Phone className="w-4 h-4 mr-2" />Contato</Link>
                  </Button>
                  <Button asChild className="bg-[#007BFF] hover:bg-blue-700 text-white">
                    <Link to={createPageUrl("PublicServiceProviders")}><Calendar className="w-4 h-4 mr-2" />Agendar</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Seção de Comércios */}
          <div className="mb-16">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-900 flex items-center">
                <Store className="w-6 h-6 mr-2 text-[#007BFF]" />
                Comércios Parceiros
              </h3>
              <Link to={createPageUrl("PublicBusinesses")} className="text-[#007BFF] hover:text-blue-700 flex items-center">
                Ver todos<ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white overflow-hidden rounded-lg shadow-sm border border-gray-200">
                <div className="relative">
                  <img src="https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=600&q=80" alt="Loja de Artesanato Mares do Sul" className="w-full h-48 object-cover" />
                  <div className="absolute top-3 left-3"><div className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded">Loja</div></div>
                  <div className="absolute top-3 right-3"><div className="bg-orange-500 text-white text-xs font-medium px-2 py-1 rounded">Desconto Clube</div></div>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-lg text-gray-900">Loja de Artesanato Mares do Sul</h4>
                  <div className="flex items-center text-gray-500 text-sm mb-2"><MapPin className="w-4 h-4 mr-1" />Balneário Camboriú</div>
                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">Loja especializada em artesanato local, com produtos feitos por artesãos de Santa Catarina. Oferece souvenirs...</p>
                  <Link to={createPageUrl("PublicBusinesses")} className="text-blue-600 flex items-center">
                    Ver detalhes<ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
              <div className="bg-white overflow-hidden rounded-lg shadow-sm border border-gray-200">
                <div className="relative">
                  <img src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=600&q=80" alt="Restaurante Maré Alta" className="w-full h-48 object-cover" />
                  <div className="absolute top-3 left-3"><div className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded">Restaurante</div></div>
                  <div className="absolute top-3 right-3"><div className="bg-orange-500 text-white text-xs font-medium px-2 py-1 rounded">Desconto Clube</div></div>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-lg text-gray-900">Restaurante Maré Alta</h4>
                  <div className="flex items-center text-gray-500 text-sm mb-2"><MapPin className="w-4 h-4 mr-1" />Balneário Camboriú</div>
                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">Especializada em frutos do mar frescos, o Restaurante Maré Alta oferece uma experiência gastronômica com...</p>
                  <Link to={createPageUrl("PublicBusinesses")} className="text-blue-600 flex items-center">
                    Ver detalhes<ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
              <div className="bg-white overflow-hidden rounded-lg shadow-sm border border-gray-200">
                <div className="relative">
                  <img src="https://images.unsplash.com/photo-1615460549969-36fa19521a4f?auto=format&fit=crop&w=600&q=80" alt="Pousada Brisa do Mar" className="w-full h-48 object-cover" />
                  <div className="absolute top-3 left-3"><div className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded">Pousada</div></div>
                  <div className="absolute top-3 right-3"><div className="bg-orange-500 text-white text-xs font-medium px-2 py-1 rounded">Desconto Clube</div></div>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-lg text-gray-900">Pousada Brisa do Mar</h4>
                  <div className="flex items-center text-gray-500 text-sm mb-2"><MapPin className="w-4 h-4 mr-1" />Bombinhas</div>
                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">Pousada charmosa localizada a poucos metros da Praia de Bombas. Oferece quartos confortáveis com café da...</p>
                  <Link to={createPageUrl("PublicBusinesses")} className="text-blue-600 flex items-center">
                    Ver detalhes<ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter siteConfig={siteConfig} />
    </div>
  );
}
