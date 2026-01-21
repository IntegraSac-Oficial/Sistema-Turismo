
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { City } from "@/api/entities";
import { Beach } from "@/api/entities";
import { Business } from "@/api/entities";
import { ServiceProvider } from "@/api/entities";
import { Review } from "@/api/entities";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { SiteConfig } from "@/api/entities";
import { CityBanner } from "@/api/entities";
import {
  ChevronRight,
  MapPin,
  User,
  CalendarDays,
  Home,
  Utensils,
  Phone,
  Building2,
  Waves,
  Wrench,
  ShoppingBag,
  Info,
  ArrowLeft,
  Clock,
  Star,
  Edit,
  Plus,
  X,
  Heart,
  Send,
  Bookmark,
  MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReviewSection from "@/components/public/ReviewSection";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";


export default function CityDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [city, setCity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cityBeaches, setCityBeaches] = useState([]);
  const [cityBusinesses, setCityBusinesses] = useState([]);
  const [cityServiceProviders, setCityServiceProviders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [siteConfig, setSiteConfig] = useState(null);
  const [activeTab, setActiveTab] = useState("informacoes");
  const [cityBanners, setCityBanners] = useState([]);
  // Mudar para um objeto para armazenar o estado de cada banner
  const [bannerInteractions, setBannerInteractions] = useState({});
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [newBanner, setNewBanner] = useState({
    title: "",
    image_url: "",
    link_url: "",
    city_id: "",
    width: 300,
    height: 200,
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cityId = params.get("id");

    if (!cityId) {
      navigate(createPageUrl("PublicCities"));
      return;
    }

    const loadCityData = async () => {
      try {
        setLoading(true);

        const configs = await SiteConfig.list();
        if (configs && configs.length > 0) {
          setSiteConfig(configs[0]);
        }

        const cityData = await City.get(cityId);
        setCity(cityData);

        const allBeaches = await Beach.list();
        const beachesInCity = allBeaches.filter(
          (beach) => beach.city_id === cityId
        );
        setCityBeaches(beachesInCity);

        const allBusinesses = await Business.list();
        const businessesInCity = allBusinesses.filter(
          (business) => business.city_id === cityId
        );
        setCityBusinesses(businessesInCity);

        const allProviders = await ServiceProvider.list();
        const providersInCity = allProviders.filter(
          (provider) => provider.city_id === cityId
        );
        setCityServiceProviders(providersInCity);

        const allReviews = await Review.list();
        const cityReviews = allReviews.filter(
          (review) => review.entity_type === "city" && review.entity_id === cityId
        );
        setReviews(cityReviews);
      } catch (error) {
        console.error("Erro ao carregar dados da cidade:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCityData();
  }, [location.search, navigate]);

  useEffect(() => {
    const loadBanners = async () => {
      if (city?.id) {
        try {
          const banners = await CityBanner.filter({ city_id: city.id });
          setCityBanners(banners || []);
          
          // Inicializar o estado de interações para cada banner
          const initialInteractions = {};
          (banners || []).forEach(banner => {
            const daysAgo = Math.floor(Math.random() * 10) + 1; // Gerar uma vez só na inicialização
            initialInteractions[banner.id] = {
              liked: false,
              saved: false,
              likesCount: Math.floor(Math.random() * 100) + 10,
              postedAt: new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000)) // Converter dias em timestamp
            };
          });
          setBannerInteractions(initialInteractions);
        } catch (error) {
          console.error("Erro ao carregar banners:", error);
        }
      }
    };

    loadBanners();
  }, [city]);
  
  // IMPORTANTE: Mantenha essa verificação para outras funcionalidades que ainda precisam disso
  const isAdmin = React.useMemo(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      return user.email === 'contato.jrsn@gmail.com';
    }
    return false;
  }, []);

  // Mantenha as funções existentes mas elas só serão usadas na versão de admin da página
  const handleOpenBannerModal = (banner = null) => {
    setSelectedBanner(banner);
    setNewBanner({
      title: banner?.title || "",
      image_url: banner?.image_url || "",
      link_url: banner?.link_url || "",
      city_id: city?.id || "",
      width: banner?.width || 300,
      height: banner?.height || 200,
    });
    setIsBannerModalOpen(true);
  };

  const handleCloseBannerModal = () => {
    setIsBannerModalOpen(false);
    setSelectedBanner(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBanner((prevBanner) => ({
      ...prevBanner,
      [name]: value,
    }));
  };

  const handleSaveBanner = async () => {
    try {
      if (!newBanner.title || !newBanner.image_url || !newBanner.link_url) {
        alert("Por favor, preencha todos os campos.");
        return;
      }

      if (selectedBanner) {
        await CityBanner.update(selectedBanner.id, newBanner);
        const updatedBanners = cityBanners.map((banner) =>
          banner.id === selectedBanner.id ? { ...banner, ...newBanner } : banner
        );
        setCityBanners(updatedBanners);
      } else {
        const createdBanner = await CityBanner.create({
          ...newBanner,
          city_id: city.id,
        });
        setCityBanners([...cityBanners, createdBanner]);
      }

      handleCloseBannerModal();
    } catch (error) {
      console.error("Erro ao salvar banner:", error);
      alert("Erro ao salvar banner.");
    }
  };

  const handleDeleteBanner = async (bannerId) => {
    if (window.confirm("Tem certeza que deseja excluir este banner?")) {
      try {
        await CityBanner.delete(bannerId);
        const updatedBanners = cityBanners.filter(
          (banner) => banner.id !== bannerId
        );
        setCityBanners(updatedBanners);
      } catch (error) {
        console.error("Erro ao excluir banner:", error);
        alert("Erro ao excluir banner.");
      }
    }
  };

  // Função para extrair URL do iframe ou gerar novo URL baseado em coordenadas
  const getGoogleMapsEmbedUrl = (latitude, longitude, mapIframeUrl) => {
    // Se tiver URL direta do iframe
    if (mapIframeUrl) {
      // Checa se o usuário colou o elemento iframe completo
      if (mapIframeUrl.includes('<iframe')) {
        // Extrai o src de dentro da tag iframe
        const srcMatch = mapIframeUrl.match(/src=['"](.*?)['"]/);
        if (srcMatch && srcMatch[1]) {
          return srcMatch[1];
        }
      }
      
      // Se não for tag completa, assume que é uma URL direta
      return mapIframeUrl;
    }
    
    // Sem URL de iframe, tenta usar latitude/longitude
    if (latitude && longitude) {
      return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBIwzALxUPNbatRBj3Xi1Uhp0fFzwWNBkE&q=${latitude},${longitude}&zoom=13`;
    }
    
    // Sem dados suficientes para mostrar mapa
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <PublicHeader siteConfig={siteConfig} />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando informações...</p>
          </div>
        </div>
        <PublicFooter siteConfig={siteConfig} />
      </div>
    );
  }

  if (!city) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <PublicHeader siteConfig={siteConfig} />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <Info className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Cidade não encontrada
            </h2>
            <p className="text-gray-600 mb-6">
              A cidade que você está procurando não existe ou foi removida.
            </p>
            <Button
              onClick={() => navigate(createPageUrl("PublicCities"))}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Cidades
            </Button>
          </div>
        </div>
        <PublicFooter siteConfig={siteConfig} />
      </div>
    );
  }

  const handleNavigate = (path) => {
    navigate(path);
  };

    // Correção do redirecionamento para página de detalhes da praia
    const viewBeachDetails = (beachId) => {
      navigate(createPageUrl(`PublicBeachDetail?id=${beachId}`));
    };

  // Decide se deve mostrar a seção de banners
  const shouldShowBannerSection = cityBanners && cityBanners.length > 0;

  const handleBannerLike = (bannerId) => {
    setBannerInteractions(prev => {
      const currentBannerState = prev[bannerId] || { liked: false, saved: false, likesCount: 0, postedAt: new Date() };
      const newLikedState = !currentBannerState.liked;
      const newLikesCount = newLikedState ? currentBannerState.likesCount + 1 : currentBannerState.likesCount - 1;
      
      return {
        ...prev,
        [bannerId]: {
          ...currentBannerState,
          liked: newLikedState,
          likesCount: newLikesCount < 0 ? 0 : newLikesCount // Garante que não seja negativo
        }
      };
    });
  };

  const handleBannerSave = (bannerId) => {
    setBannerInteractions(prev => {
      const currentBannerState = prev[bannerId] || { liked: false, saved: false, likesCount: 0, postedAt: new Date() };
      return {
        ...prev,
        [bannerId]: {
          ...currentBannerState,
          saved: !currentBannerState.saved
        }
      };
    });
  };
  
  // Função para simular compartilhamentos
  const handleBannerShare = (banner) => {
    if (navigator.share) {
      navigator.share({
        title: banner.title,
        text: `Confira ${banner.title} em ${city.name}!`,
        url: banner.link_url
      }).catch(error => console.log('Erro ao compartilhar', error));
    } else {
      // Fallback para dispositivos que não suportam Web Share API
      window.open(banner.link_url, '_blank');
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const postedDate = new Date(date);
    const diffTime = Math.abs(now - postedDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} ${diffDays === 1 ? 'dia' : 'dias'} atrás`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicHeader siteConfig={siteConfig} />

      <div className="w-full relative">
        <div
          className="h-72 md:h-96 w-full bg-center bg-cover relative"
          style={{
            backgroundImage: `url(${
              city.image_url ||
              "https://images.unsplash.com/photo-1589083130544-0d6a2926e519?auto=format&fit=crop&w=1200&q=80"
            })`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

          <div className="absolute bottom-0 left-0 w-full p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
              <button
                onClick={() => navigate(createPageUrl("PublicCities"))}
                className="text-white mb-4 flex items-center hover:underline text-sm md:text-base"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para cidades
              </button>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
                {city.name}
              </h1>

              <div className="flex flex-wrap items-center text-white/80 text-xs md:text-sm">
                <MapPin className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                <span>Santa Catarina</span>
                {city.population && (
                  <>
                    <span className="mx-2">•</span>
                    <User className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    <span>{city.population.toLocaleString()} habitantes</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 w-full">
        <Tabs
          defaultValue="informacoes"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6 w-full"
        >
          <div className="w-full overflow-x-auto no-scrollbar pb-2">
            <TabsList className="border-b border-gray-200 w-auto md:w-full justify-start min-w-max">
              <TabsTrigger
                value="informacoes"
                className="text-xs md:text-sm whitespace-nowrap"
              >
                <Info className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                Informações
              </TabsTrigger>
              <TabsTrigger
                value="praias"
                className="text-xs md:text-sm whitespace-nowrap"
              >
                <Waves className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                Praias
                {cityBeaches.length > 0 && (
                  <span className="ml-1 md:ml-2 text-xs">
                    {cityBeaches.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="comercios"
                className="text-xs md:text-sm whitespace-nowrap"
              >
                <ShoppingBag className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                Comércios
                {cityBusinesses.length > 0 && (
                  <span className="ml-1 md:ml-2 text-xs">
                    {cityBusinesses.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="prestadores"
                className="text-xs md:text-sm whitespace-nowrap"
              >
                <Wrench className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                Prestadores
                {cityServiceProviders.length > 0 && (
                  <span className="ml-1 md:ml-2 text-xs">
                    {cityServiceProviders.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="avaliacoes"
                className="text-xs md:text-sm whitespace-nowrap"
              >
                <Star className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                Avaliações
                {reviews.length > 0 && (
                  <span className="ml-1 md:ml-2 text-xs">{reviews.length}</span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="informacoes" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardContent className="p-4 md:p-6">
                    <h2 className="text-xl font-bold mb-4">
                      Sobre {city.name}
                    </h2>
                    <p className="text-gray-700 mb-6 text-sm md:text-base">
                      {city.description ||
                        `${city.name} é uma cidade encantadora localizada em Santa Catarina, Brasil. Conhecida por suas belas praias e paisagens naturais deslumbrantes.`}
                    </p>

                    {city.gastronomy && (
                      <div className="mb-6">
                        <h3 className="text-base md:text-lg font-medium mb-2 flex items-center text-orange-700">
                          <Utensils className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                          Gastronomia
                        </h3>
                        <p className="text-gray-700 text-sm md:text-base">
                          {city.gastronomy}
                        </p>
                      </div>
                    )}

                    {city.accommodation_types && (
                      <div className="mb-6">
                        <h3 className="text-base md:text-lg font-medium mb-2 flex items-center text-blue-700">
                          <Home className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                          Hospedagem
                        </h3>
                        <p className="text-gray-700 text-sm md:text-base">
                          {city.accommodation_types}
                        </p>
                      </div>
                    )}

                    {city.culinary_origin && (
                      <div className="mb-6">
                        <h3 className="text-base md:text-lg font-medium mb-2 flex items-center text-green-700">
                          <Utensils className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                          Origem Culinária
                        </h3>
                        <p className="text-gray-700 text-sm md:text-base">
                          {city.culinary_origin}
                        </p>
                      </div>
                    )}

                    {city.season_start && (
                      <div className="mb-6">
                        <h3 className="text-base md:text-lg font-medium mb-2 flex items-center text-purple-700">
                          <CalendarDays className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                          Temporada
                        </h3>
                        <p className="text-gray-700 text-sm md:text-base">
                          Início da temporada: {city.season_start}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 md:p-6">
                    <h3 className="text-lg md:text-xl font-bold mb-4">
                      Localização
                    </h3>
                    <div className="h-[250px] md:h-[300px] rounded-lg overflow-hidden bg-gray-100">
                      {
                        // Obter URL do mapa
                        (() => {
                          const mapUrl = getGoogleMapsEmbedUrl(
                            city.latitude, 
                            city.longitude, 
                            city.map_iframe_url
                          );
                          
                          if (mapUrl) {
                            return (
                              <iframe
                                src={mapUrl}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title={`Mapa de ${city.name}`}
                              ></iframe>
                            );
                          } else {
                            return (
                              <div className="flex flex-col items-center justify-center h-full text-center">
                                <MapPin className="h-8 w-8 md:h-12 md:w-12 text-gray-400 mx-auto mb-3" />
                                <h4 className="text-base md:text-lg font-medium text-gray-700">
                                  Mapa indisponível
                                </h4>
                                <p className="text-gray-500 mt-2 text-sm md:text-base px-4">
                                  A visualização do mapa está temporariamente indisponível.
                                  <br />
                                  Adicione coordenadas ou URL do mapa para visualizar.
                                </p>
                              </div>
                            );
                          }
                        })()
                      }
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardContent className="p-4 md:p-6">
                    <h3 className="text-lg md:text-xl font-bold mb-4">
                      Informações Úteis
                    </h3>

                    <div className="space-y-4">
                      {cityBeaches.length > 0 && (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Waves className="h-4 w-4 md:h-5 md:w-5 text-blue-600 mr-2" />
                            <span className="text-sm md:text-base">Praias</span>
                          </div>
                          <span className="text-gray-700 text-sm md:text-base">
                            {cityBeaches.length} praias
                          </span>
                        </div>
                      )}

                      {cityBusinesses.length > 0 && (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <ShoppingBag className="h-4 w-4 md:h-5 md:w-5 text-green-600 mr-2" />
                            <span className="text-sm md:text-base">
                              Comércios
                            </span>
                          </div>
                          <span className="text-gray-700 text-sm md:text-base">
                            {cityBusinesses.length} comércios
                          </span>
                        </div>
                      )}

                      {cityServiceProviders.length > 0 && (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Wrench className="h-4 w-4 md:h-5 md:w-5 text-orange-600 mr-2" />
                            <span className="text-sm md:text-base">
                              Prestadores
                            </span>
                          </div>
                          <span className="text-gray-700 text-sm md:text-base">
                            {cityServiceProviders.length} prestadores
                          </span>
                        </div>
                      )}

                      {city.population && (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <User className="h-4 w-4 md:h-5 md:w-5 text-purple-600 mr-2" />
                            <span className="text-sm md:text-base">
                              População
                            </span>
                          </div>
                          <span className="text-gray-700 text-sm md:text-base">
                            {city.population.toLocaleString()} habitantes
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 md:p-6">
                    <h3 className="text-lg md:text-xl font-bold mb-4">
                      Contato Prefeitura
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 md:h-5 md:w-5 text-gray-600 mr-2" />
                        <span className="text-sm md:text-base">
                          Prefeitura de {city.name}
                        </span>
                      </div>

                      {city.city_hall_phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 md:h-5 md:w-5 text-gray-600 mr-2" />
                          <a
                            href={`tel:${city.city_hall_phone}`}
                            className="text-blue-600 hover:underline text-sm md:text-base"
                          >
                            {city.city_hall_phone}
                          </a>
                        </div>
                      )}

                      <Button
                        variant="outline"
                        className="w-full mt-2 text-xs md:text-sm py-2 h-auto"
                        onClick={() =>
                          window.open(
                            `https://www.google.com/search?q=prefeitura+de+${encodeURIComponent(
                              city.name
                            )}+santa+catarina`,
                            "_blank"
                          )
                        }
                      >
                        Visitar Site Oficial
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="praias">
            {cityBeaches.length === 0 ? (
              <div className="text-center py-12 md:py-16">
                <Waves className="h-12 w-12 md:h-16 md:w-16 text-blue-200 mx-auto mb-4" />
                <h3 className="text-lg md:text-xl font-semibold mb-2">
                  Sem praias cadastradas
                </h3>
                <p className="text-gray-600 max-w-md mx-auto text-sm md:text-base">
                  Ainda não há praias cadastradas para {city.name}. Volte mais
                  tarde ou explore outras cidades.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {cityBeaches.map((beach) => (
                  <Card
                    key={beach.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow"
                    onClick={() => viewBeachDetails(beach.id)}
                  >
                    <div className="h-40 md:h-48 overflow-hidden">
                      <img
                        src={
                          beach.image_url ||
                          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
                        }
                        alt={beach.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <CardContent className="p-3 md:p-4">
                      <h3 className="text-base md:text-lg font-bold mb-2">
                        {beach.name}
                      </h3>

                      <div className="flex flex-wrap gap-1 md:gap-2 mb-3">
                        {beach.features &&
                          beach.features.slice(0, 3).map((feature, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                      </div>

                      <p className="text-gray-600 text-xs md:text-sm mb-3 line-clamp-2">
                        {beach.description ||
                          `Uma bela praia localizada em ${city.name}.`}
                      </p>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                          <span className="font-medium text-sm">4.8</span>
                        </div>

                        <Button
                          size="sm"
                          className="text-blue-600 bg-transparent hover:bg-blue-50 text-xs md:text-sm px-2 py-1 h-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`${createPageUrl("PublicBeachDetail")}?id=${beach.id}`);
                          }}
                        >
                          Ver detalhes
                          <ChevronRight className="ml-1 h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="comercios">
            {cityBusinesses.length === 0 ? (
              <div className="text-center py-12 md:py-16">
                <ShoppingBag className="h-12 w-12 md:h-16 md:w-16 text-green-200 mx-auto mb-4" />
                <h3 className="text-lg md:text-xl font-semibold mb-2">
                  Sem comércios cadastrados
                </h3>
                <p className="text-gray-600 max-w-md mx-auto text-sm md:text-base">
                  Ainda não há comércios cadastrados para {city.name}. Volte mais
                  tarde ou explore outras cidades.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {cityBusinesses.map((business) => (
                  <Card
                    key={business.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="h-40 md:h-48 overflow-hidden relative">
                      <img
                        src={
                          business.image_url ||
                          "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=600&q=80"
                        }
                        alt={business.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                      {business.is_club_member && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-orange-500 text-xs">
                            Desconto Clube
                          </Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-center mb-1">
                        <Badge className="bg-green-100 text-green-800 mr-2 text-xs">
                          {business.type === "restaurante"
                            ? "Restaurante"
                            : business.type === "hotel"
                            ? "Hotel"
                            : business.type === "pousada"
                            ? "Pousada"
                            : business.type === "loja"
                            ? "Loja"
                            : "Comércio"}
                        </Badge>
                        {business.is_club_member && business.discount_value && (
                          <Badge className="bg-orange-100 text-orange-800 text-xs">
                            {business.discount_type === "percentual"
                              ? `${business.discount_value}% OFF`
                              : `R$ ${business.discount_value} OFF`}
                          </Badge>
                        )}
                      </div>

                      <h3 className="text-base md:text-lg font-bold mb-2">
                        {business.name}
                      </h3>

                      {business.opening_hours && (
                        <div className="flex items-center text-xs md:text-sm text-gray-500 mb-2">
                          <Clock className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                          <span>{business.opening_hours}</span>
                        </div>
                      )}

                      <p className="text-gray-600 text-xs md:text-sm mb-3 line-clamp-2">
                        {business.description ||
                          `Um comércio localizado em ${city.name}.`}
                      </p>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                          <span className="font-medium text-sm">4.7</span>
                        </div>

                        <Button
                          size="sm"
                          className="text-blue-600 bg-transparent hover:bg-blue-50 text-xs md:text-sm px-2 py-1 h-auto"
                          onClick={() =>
                            navigate(
                              `${createPageUrl("PublicBusinessDetail")}?id=${business.id}`
                            )
                          }
                        >
                          Ver detalhes
                          <ChevronRight className="ml-1 h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="prestadores">
            {cityServiceProviders.length === 0 ? (
              <div className="text-center py-12 md:py-16">
                <Wrench className="h-12 w-12 md:h-16 md:w-16 text-orange-200 mx-auto mb-4" />
                <h3 className="text-lg md:text-xl font-semibold mb-2">
                  Sem prestadores cadastrados
                </h3>
                <p className="text-gray-600 max-w-md mx-auto text-sm md:text-base">
                  Ainda não há prestadores de serviço cadastrados para{" "}
                  {city.name}. Volte mais tarde ou explore outras cidades.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {cityServiceProviders.map((provider) => (
                  <Card
                    key={provider.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-4 md:p-5">
                      <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Wrench className="w-6 h-6 md:w-7 md:h-7 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base md:text-lg">
                            {provider.name}
                          </h3>
                          <Badge className="bg-blue-600 text-white text-xs">
                            {provider.service_type === "pintor"
                              ? "Pintor"
                              : provider.service_type === "diarista"
                              ? "Diarista"
                              : provider.service_type === "eletricista"
                              ? "Eletricista"
                              : provider.service_type === "pedreiro"
                              ? "Pedreiro"
                              : "Prestador"}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center text-gray-500 text-xs md:text-sm mb-3">
                        <MapPin className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                        {city.name}
                        <Badge
                          variant="outline"
                          className="ml-3 border-green-500 text-green-600 text-xs"
                        >
                          {provider.available ? "Disponível" : "Indisponível"}
                        </Badge>
                      </div>

                      <p className="text-gray-700 text-xs md:text-sm mb-3 line-clamp-2">
                        {provider.description ||
                          `Prestador de serviços de ${provider.service_type} em ${city.name}.`}
                      </p>

                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <Button
                          asChild
                          variant="outline"
                          className="border-blue-600 text-blue-600 text-xs md:text-sm px-2 py-1 h-auto"
                        >
                          <a href={`tel:${provider.phone}`}>
                            <Phone className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                            Contato
                          </a>
                        </Button>
                        <Button
                          asChild
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm px-2 py-1 h-auto"
                        >
                          <a
                            href={`${createPageUrl("PublicServiceProviders")}?id=${
                              provider.id
                            }`}
                          >
                            <CalendarDays className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                            Agendar
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="avaliacoes">
            <ReviewSection
              entityType="city"
              entityId={city.id}
              reviews={reviews}
              onReviewAdded={() => {
                // Recarregar avaliações
              }}
            />
          </TabsContent>
        </Tabs>

        {shouldShowBannerSection && (
          <div className="bg-white shadow rounded-lg p-6 mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Parceiros e Serviços Recomendados</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cityBanners?.map((banner) => {
                const interactions = bannerInteractions[banner.id] || {
                  liked: false,
                  saved: false,
                  likesCount: 0,
                  postedAt: new Date()
                };
                
                return (
                  <Card key={banner.id} className="overflow-hidden border border-gray-200 rounded-lg">
                    {/* Cabeçalho do Card (Estilo Instagram) */}
                    <div className="flex items-center p-3 border-b">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback className="bg-blue-500 text-white">
                          {banner.title.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{banner.title}</p>
                        <p className="text-xs text-gray-500">{city?.name || "Cidade"}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="19" cy="12" r="1" />
                          <circle cx="5" cy="12" r="1" />
                        </svg>
                      </Button>
                    </div>
                    
                    {/* Imagem Principal */}
                    <a 
                      href={banner.link_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block relative aspect-square"
                    >
                      <img
                        src={banner.image_url}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                    </a>
                    
                    {/* Barra de interações */}
                    <div className="p-3 border-t border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-4">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={`h-9 w-9 ${interactions.liked ? 'text-red-500' : ''}`} 
                            onClick={() => handleBannerLike(banner.id)}
                          >
                            <Heart className={`h-5 w-5 ${interactions.liked ? 'fill-current' : ''}`} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9"
                            onClick={() => handleBannerShare(banner)}
                          >
                            <Send className="h-5 w-5" />
                          </Button>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={`h-9 w-9 ${interactions.saved ? 'text-black' : ''}`} 
                          onClick={() => handleBannerSave(banner.id)}
                        >
                          <Bookmark className={`h-5 w-5 ${interactions.saved ? 'fill-current' : ''}`} />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Footer do card com likes e descrição */}
                    <div className="p-3">
                      <p className="text-sm font-semibold">{interactions.likesCount} curtidas</p>
                      <p className="text-sm mt-1 line-clamp-2">
                        <span className="font-semibold">{banner.title}</span> 
                        {" "}
                        <span className="text-gray-600">{`Conheça nossos produtos e serviços em ${city?.name || "esta cidade"}!`}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTimeAgo(interactions.postedAt)}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <PublicFooter siteConfig={siteConfig} />
    </div>
  );
}
