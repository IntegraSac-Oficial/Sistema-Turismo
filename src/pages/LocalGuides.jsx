
import React, { useState, useEffect } from "react";
import { User, LocalGuide, SavedGuide, City, Beach, UserProfile } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "@/components/ui/use-toast";

import {
  Compass, Map, Search, Filter, MapPin, Plus, BookMarked, User as UserIcon,
  Heart, EyeOff, Eye, Calendar, DollarSign, Clock, Star, ChevronRight, 
  Bookmark, BookmarkCheck, ThumbsUp, MessageCircle, Building2, Waves, 
  ShieldCheck, Utensils, Hotel, Ship, CalendarDays, Palette, ShoppingBag,
  Users, Moon, Globe, Menu, ChevronDown, ArrowUpRight
} from "lucide-react";

import CreateGuideModal from "../components/guides/CreateGuideModal";
import GuideCard from "../components/guides/GuideCard";
import GuideDetailModal from "../components/guides/GuideDetailModal";

export default function LocalGuides() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [guides, setGuides] = useState([]);
  const [filteredGuides, setFilteredGuides] = useState([]);
  const [cities, setCities] = useState([]);
  const [beaches, setBeaches] = useState([]);
  const [users, setUsers] = useState([]);
  const [savedGuides, setSavedGuides] = useState([]);
  const [activeTab, setActiveTab] = useState("discover");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateGuideOpen, setIsCreateGuideOpen] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [isGuideDetailOpen, setIsGuideDetailOpen] = useState(false);

  // Filtros
  const [locationFilter, setLocationFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState(false);

  useEffect(() => {
    loadCurrentUser(); // Carrega o usuário logado
    // loadData é chamado após loadCurrentUser ter chance de definir currentUser
  }, []);

  useEffect(() => {
    // Só carrega os dados principais se o currentUser já foi (ou tentou ser) carregado
    // Isso ajuda a ter o currentUser disponível para filtros iniciais se necessário
    loadData(); 
  }, [currentUser]); // Re-executa loadData se currentUser mudar (ex: login/logout)


  const loadCurrentUser = async () => {
    try {
      // Verificar se há um usuário no localStorage
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setCurrentUser(userData);
        
        if (userData) {
          const profiles = await UserProfile.filter({ user_id: userData.id });
          if (profiles.length > 0) {
            setUserProfile(profiles[0]);
          }
          
          // Carregar guias salvos pelo usuário
          const saved = await SavedGuide.filter({ user_id: userData.id });
          setSavedGuides(saved);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

const loadData = async () => {
  setIsLoading(true);
  try {
    console.log("Carregando dados de guias locais...");
    
    // Tenta buscar dados básicos
    const [rawGuidesData, citiesData, beachesData] = await Promise.all([
      LocalGuide.list("-created_date").catch(err => {
        console.error("Erro ao buscar guias:", err);
        return [];
      }),
      City.list().catch(err => {
        console.error("Erro ao buscar cidades:", err);
        return [];
      }),
      Beach.list().catch(err => {
        console.error("Erro ao buscar praias:", err);
        return [];
      })
    ]);
    
    console.log(`Dados recebidos: ${rawGuidesData?.length || 0} guias, ${citiesData?.length || 0} cidades, ${beachesData?.length || 0} praias`);
    
    let populatedGuides = [];
    
    if (rawGuidesData && rawGuidesData.length > 0) {
      // Primeiro criamos guias com objetos user mínimos (valores padrão)
      populatedGuides = rawGuidesData.map(guide => ({
        ...guide,
        user: {
          full_name: "Autor Desconhecido",
          avatar_url: null,
          id: guide.user_id 
        }
      }));
      
      // Depois tentamos enriquecer esses dados com informações reais dos usuários
      try {
        // Extrai IDs únicos de usuários (filtrando valores nulos)
        const userIds = [...new Set(rawGuidesData
          .map(g => g.user_id)
          .filter(id => id))];
        
        if (userIds.length > 0) {
          console.log(`Buscando dados de ${userIds.length} usuários...`);
          
          // Busca todos os usuários e cria um mapa por ID
          const usersData = await User.list();
          const usersById = {};
          
          if (usersData && usersData.length) {
            usersData.forEach(user => {
              if (user && user.id) {
                usersById[user.id] = user;
              }
            });
            
            // Atualiza os guias com os dados reais dos usuários
            populatedGuides.forEach(guide => {
              if (guide.user_id && usersById[guide.user_id]) {
                guide.user = {
                  ...guide.user,
                  ...usersById[guide.user_id]
                };
              }
            });
          }
        }
      } catch (userError) {
        console.error("Erro ao carregar dados de usuários para guias:", userError);
        // Se falhar ao buscar usuários, continuamos com os valores padrão
      }
    }
    
    console.log(`Guias populados com usuários: ${populatedGuides.length}`);
    
    // Definir estados com os dados carregados
    setGuides(populatedGuides || []);
    setCities(citiesData || []);
    setBeaches(beachesData || []);
    
    // Aplicar filtros iniciais
    setFilteredGuides(populatedGuides || []);
    
  } catch (error) {
    console.error("Erro ao carregar dados dos guias:", error);
    toast({
      title: "Erro ao Carregar Guias",
      description: "Não foi possível buscar os dados dos guias locais.",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};
  
  // A função loadAllUsers não é mais necessária aqui se populamos o user diretamente em loadData.
  // A função getUserById pode ser removida se GuideDetailModal receber selectedGuide.user
  // e se nenhuma outra parte do código a utiliza. Por segurança, vamos mantê-la por enquanto,
  // mas ela pode não ser mais chamada se o selectedGuide já tiver o 'user' populado.
  const getUserById = (userId) => {
    // Esta função pode precisar ser atualizada se 'users' state não for mais populado por loadAllUsers
    // No entanto, se 'guide.user' já está populado, esta função pode não ser necessária.
    const guideWithUser = guides.find(g => g.user_id === userId);
    return guideWithUser ? guideWithUser.user : (users.find(u => u.id === userId) || { full_name: "Autor Desconhecido" });
  };
  
  const applyFilters = () => {
    let filtered = [...guides];
    
    // Filtro de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(guide => 
        guide.title.toLowerCase().includes(term) ||
        guide.description.toLowerCase().includes(term) ||
        (guide.tags && guide.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }
    
    // Filtro de localização
    if (locationFilter !== "all") {
      if (locationFilter.startsWith("city_")) {
        const cityId = locationFilter.replace("city_", "");
        filtered = filtered.filter(guide => 
          guide.location_type === "city" && guide.location_id === cityId
        );
      } else if (locationFilter.startsWith("beach_")) {
        const beachId = locationFilter.replace("beach_", "");
        filtered = filtered.filter(guide => 
          guide.location_type === "beach" && guide.location_id === beachId
        );
      } else if (locationFilter === "cities") {
        filtered = filtered.filter(guide => guide.location_type === "city");
      } else if (locationFilter === "beaches") {
        filtered = filtered.filter(guide => guide.location_type === "beach");
      } else if (locationFilter === "regions") {
        filtered = filtered.filter(guide => guide.location_type === "region");
      }
    }
    
    // Filtro de categoria
    if (categoryFilter !== "all") {
      filtered = filtered.filter(guide => guide.category === categoryFilter);
    }
    
    // Filtro de verificação
    if (verifiedFilter) {
      filtered = filtered.filter(guide => guide.is_verified);
    }
    
    setFilteredGuides(filtered);
  };

  const handleGuideSubmit = async (guideData) => {
    try {
      await LocalGuide.create({
        user_id: currentUser.id,
        ...guideData,
        is_verified: false,
        likes_count: 0,
        saves_count: 0,
        views_count: 0
      });
      
      // Recarregar guias
      const newGuides = await LocalGuide.list("-created_date");
      setGuides(newGuides);
      setFilteredGuides(newGuides);
      setIsCreateGuideOpen(false);
    } catch (error) {
      console.error("Erro ao criar guia:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar o guia local.",
        variant: "destructive"
      });
    }
  };

  const handleSaveGuide = async (guideId) => {
    if (!currentUser) {
      toast({
        title: "Login necessário", 
        description: "Faça login para salvar este guia.", 
        variant: "warning"
      });
      navigate(createPageUrl("UserAccount"));
      return;
    }
    
    try {
      // Verificar se já está salvo
      const existing = savedGuides.find(sg => sg.guide_id === guideId);
      
      if (existing) {
        // Remover dos salvos
        await SavedGuide.delete(existing.id);
        const updated = savedGuides.filter(sg => sg.id !== existing.id);
        setSavedGuides(updated);
      } else {
        // Adicionar aos salvos
        const savedGuide = await SavedGuide.create({
          user_id: currentUser.id,
          guide_id: guideId,
          saved_at: new Date().toISOString()
        });
        setSavedGuides([...savedGuides, savedGuide]);
      }
      
      // Atualizar contagem de salvos no guia
      const guide = guides.find(g => g.id === guideId);
      if (guide) {
        const newCount = existing ? guide.saves_count - 1 : guide.saves_count + 1;
        await LocalGuide.update(guideId, { saves_count: Math.max(0, newCount) });
        
        // Atualizar guias localmente
        const updatedGuides = guides.map(g => {
          if (g.id === guideId) {
            return { ...g, saves_count: Math.max(0, newCount) };
          }
          return g;
        });
        
        setGuides(updatedGuides);
        setFilteredGuides(applyFilters);
      }
    } catch (error) {
      console.error("Erro ao salvar/remover guia:", error);
    }
  };

  const handleLikeGuide = async (guideId) => {
    if (!currentUser) {
      toast({
        title: "Login necessário", 
        description: "Faça login para curtir este guia.", 
        variant: "warning"
      });
      navigate(createPageUrl("UserAccount"));
      return;
    }
    
    try {
      // Simplificado: apenas incrementa a contagem de curtidas
      // Em um sistema real, você rastrearia quais usuários curtiram
      const guide = guides.find(g => g.id === guideId);
      if (guide) {
        const newCount = guide.likes_count + 1;
        await LocalGuide.update(guideId, { likes_count: newCount });
        
        // Atualizar guias localmente
        const updatedGuides = guides.map(g => {
          if (g.id === guideId) {
            return { ...g, likes_count: newCount };
          }
          return g;
        });
        
        setGuides(updatedGuides);
        setFilteredGuides(applyFilters);
      }
    } catch (error) {
      console.error("Erro ao curtir guia:", error);
    }
  };

  const incrementViews = async (guideId) => {
    try {
      const guide = guides.find(g => g.id === guideId);
      if (guide) {
        const newCount = guide.views_count + 1;
        await LocalGuide.update(guideId, { views_count: newCount });
        
        // Atualizar guias localmente
        const updatedGuides = guides.map(g => {
          if (g.id === guideId) {
            return { ...g, views_count: newCount };
          }
          return g;
        });
        
        setGuides(updatedGuides);
      }
    } catch (error) {
      console.error("Erro ao incrementar visualizações:", error);
    }
  };

  // No handleViewGuide, selectedGuide já terá o objeto .user populado
  const handleViewGuide = (guide) => {
    setSelectedGuide(guide); // `guide` já deve ter a propriedade `user`
    setIsGuideDetailOpen(true);
    incrementViews(guide.id);
  };

  const getLocationName = (guide) => {
    if (guide.location_type === "city") {
      const city = cities.find(c => c.id === guide.location_id);
      return city ? city.name : "Cidade não encontrada";
    } else if (guide.location_type === "beach") {
      const beach = beaches.find(b => b.id === guide.location_id);
      return beach ? beach.name : "Praia não encontrada";
    } else if (guide.location_type === "region") {
      return "Região";
    }
    return "Local não especificado";
  };

  const isGuideSaved = (guideId) => {
    return savedGuides.some(sg => sg.guide_id === guideId);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "gastronomia": return <Utensils className="w-5 h-5" />;
      case "hospedagem": return <Hotel className="w-5 h-5" />;
      case "passeios": return <Ship className="w-5 h-5" />;
      case "eventos": return <CalendarDays className="w-5 h-5" />;
      case "cultura": return <Palette className="w-5 h-5" />;
      case "compras": return <ShoppingBag className="w-5 h-5" />;
      case "familia": return <Users className="w-5 h-5" />;
      case "noturno": return <Moon className="w-5 h-5" />;
      default: return <Globe className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "gastronomia": return "text-amber-600 bg-amber-100";
      case "hospedagem": return "text-blue-600 bg-blue-100";
      case "passeios": return "text-cyan-600 bg-cyan-100";
      case "eventos": return "text-purple-600 bg-purple-100";
      case "cultura": return "text-pink-600 bg-pink-100";
      case "compras": return "text-emerald-600 bg-emerald-100";
      case "familia": return "text-indigo-600 bg-indigo-100";
      case "noturno": return "text-violet-600 bg-violet-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      gastronomia: "Gastronomia",
      hospedagem: "Hospedagem",
      passeios: "Passeios",
      eventos: "Eventos",
      cultura: "Cultura",
      compras: "Compras",
      familia: "Família",
      noturno: "Vida Noturna",
      geral: "Geral"
    };
    return labels[category] || category;
  };

  const getMySavedGuides = () => {
    if (!savedGuides.length) return [];
    
    return guides.filter(guide => 
      savedGuides.some(sg => sg.guide_id === guide.id)
    );
  };

  const getMyGuides = () => {
    if (!currentUser) return [];
    return guides.filter(guide => guide.user_id === currentUser.id);
  };

  const handleLogin = () => {
    // Redireciona para nossa própria página de login em vez de chamar User.login()
    navigate(createPageUrl("UserAccount"));
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full p-6 text-center">
          <div className="mb-6">
            <Map className="w-12 h-12 mx-auto text-blue-500" />
            <h1 className="text-2xl font-bold mt-4">Guias Locais TurismoSC</h1>
            <p className="text-gray-600 mt-2">
              Faça login para descobrir dicas autênticas dos moradores locais e compartilhar suas próprias recomendações sobre Santa Catarina.
            </p>
          </div>
          <Button 
            onClick={handleLogin} // Usando nossa função customizada em vez de User.login()
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Entrar
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Cabeçalho */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Guias Locais</h1>
          <p className="text-gray-600">
            Descubra recomendações autênticas de moradores locais para aproveitar o melhor de Santa Catarina
          </p>
        </div>
        
        {/* Barra de ações */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input 
              placeholder="Buscar guias por título, descrição ou tags..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            onClick={() => setIsCreateGuideOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Criar Guia Local
          </Button>
        </div>
        
        {/* Restante do código permanece o mesmo */}
        {/* ... */}
      </div>
      
      {/* Modal para criar guia */}
      {isCreateGuideOpen && (
        <CreateGuideModal
          user={currentUser}
          onClose={() => setIsCreateGuideOpen(false)}
          onSubmit={handleGuideSubmit}
          cities={cities}
          beaches={beaches}
        />
      )}
      
      {/* Modal para visualizar detalhes do guia */}
      {isGuideDetailOpen && selectedGuide && (
        <GuideDetailModal
          guide={selectedGuide}
          user={selectedGuide.user} // Passa o objeto user diretamente
          currentUser={currentUser}
          isSaved={isGuideSaved(selectedGuide.id)}
          locationName={getLocationName(selectedGuide)}
          onClose={() => setIsGuideDetailOpen(false)}
          onSave={() => handleSaveGuide(selectedGuide.id)}
          onLike={() => handleLikeGuide(selectedGuide.id)}
          getCategoryIcon={getCategoryIcon}
          getCategoryColor={getCategoryColor}
          getCategoryLabel={getCategoryLabel}
        />
      )}
    </div>
  );
}
