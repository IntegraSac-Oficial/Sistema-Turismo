
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LocalGuide, User, SavedGuide, City, Beach, UserProfile } from "@/api/entities";
import GuideDetailModal from "@/components/guides/GuideDetailModal";
import { toast } from "@/components/ui/use-toast";
import { createPageUrl } from "@/utils";
import { Utensils, Hotel, Ship, CalendarDays, Palette, ShoppingBag, Users, Moon, Globe } from "lucide-react";

export default function GuideDetailPage() {
  const [guide, setGuide] = useState(null);
  const [author, setAuthor] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [locationName, setLocationName] = useState("");
  const [cities, setCities] = useState([]);
  const [beaches, setBeaches] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const guideId = params.get("id");

    if (!guideId) {
      toast({ title: "Erro", description: "ID do guia não fornecido.", variant: "destructive" });
      navigate(createPageUrl("LocalGuides")); 
      return;
    }

    loadInitialData(guideId);
  }, [location.search, navigate]);

  const loadInitialData = async (guideId) => {
    setIsLoading(true);
    try {
      const [guideData, citiesData, beachesData, storedUser] = await Promise.all([
        LocalGuide.get(guideId),
        City.list(),
        Beach.list(),
        localStorage.getItem('currentUser')
      ]);

      if (!guideData) {
        toast({ title: "Erro", description: "Guia não encontrado.", variant: "destructive" });
        navigate(createPageUrl("LocalGuides"));
        return;
      }
      
      setGuide(guideData);
      setCities(citiesData || []);
      setBeaches(beachesData || []);
      
      if (guideData.location_type === "city") {
        const city = (citiesData || []).find(c => c.id === guideData.location_id);
        setLocationName(city ? city.name : "Cidade não encontrada");
      } else if (guideData.location_type === "beach") {
        const beach = (beachesData || []).find(b => b.id === guideData.location_id);
        setLocationName(beach ? beach.name : "Praia não encontrada");
      } else if (guideData.location_type === "region") {
        setLocationName("Região Específica");
      } else {
        setLocationName(guideData.location_name || "Local não especificado");
      }

      // Tratamento robusto para busca do autor
      if (guideData.user_id) {
        try {
          const authorData = await User.get(guideData.user_id);
          if (authorData) {
            const profiles = await UserProfile.filter({ user_id: authorData.id });
            setAuthor({ ...authorData, profile: profiles.length > 0 ? profiles[0] : null });
          } else {
            // Usuário não encontrado, definir autor padrão
            setAuthor({ full_name: "Autor Desconhecido", profile: null, id: guideData.user_id });
          }
        } catch (userError) {
          // Erro ao buscar usuário (ex: Object Not Found), definir autor padrão
          console.warn(`Autor com ID ${guideData.user_id} não encontrado.`, userError);
          setAuthor({ full_name: "Autor Desconhecido", profile: null, id: guideData.user_id });
        }
      } else {
        // user_id não está presente no guia
        setAuthor({ full_name: "Autor Desconhecido", profile: null, id: null });
      }

      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setCurrentUser(userData);
        const savedGuides = await SavedGuide.filter({ user_id: userData.id, guide_id: guideId });
        setIsSaved(savedGuides.length > 0);
      }
      
      // Incrementar visualizações (verificar se guideData existe antes de acessar views_count)
      if (guideData && guideData.id) { // Adicionada verificação de guideData.id
        await LocalGuide.update(guideId, { views_count: (guideData.views_count || 0) + 1 });
      }

    } catch (error) {
      console.error("Erro ao carregar dados do guia:", error);
      // Verificamos se o erro é de "Object Not Found" para o LocalGuide principal
      if (error.message && error.message.includes("Object not found") && error.message.includes(guideId)) {
         toast({ title: "Guia não encontrado", description: `O guia com ID ${guideId} não existe.`, variant: "destructive" });
      } else {
         toast({ title: "Erro ao carregar guia", description: "Ocorreu um problema ao buscar os detalhes do guia.", variant: "destructive" });
      }
      navigate(createPageUrl("LocalGuides"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGuide = async () => {
    if (!currentUser) {
      toast({ title: "Login necessário", description: "Faça login para salvar este guia.", variant: "warning" });
      navigate(createPageUrl("UserAccount"));
      return;
    }
    if (!guide) return;

    try {
      if (isSaved) {
        const savedEntry = await SavedGuide.filter({ user_id: currentUser.id, guide_id: guide.id });
        if (savedEntry.length > 0) {
          await SavedGuide.delete(savedEntry[0].id);
        }
        setIsSaved(false);
        await LocalGuide.update(guide.id, { saves_count: Math.max(0, (guide.saves_count || 0) - 1) });
        setGuide(prev => ({...prev, saves_count: Math.max(0, (prev.saves_count || 0) - 1)}));
        toast({title: "Guia removido dos salvos!"});
      } else {
        await SavedGuide.create({ user_id: currentUser.id, guide_id: guide.id, saved_at: new Date().toISOString() });
        setIsSaved(true);
        await LocalGuide.update(guide.id, { saves_count: (guide.saves_count || 0) + 1 });
        setGuide(prev => ({...prev, saves_count: (prev.saves_count || 0) + 1}));
        toast({title: "Guia salvo com sucesso!"});
      }
    } catch (error) {
      console.error("Erro ao salvar/remover guia:", error);
      toast({ title: "Erro", description: "Não foi possível atualizar o status de salvo.", variant: "destructive" });
    }
  };

  const handleLikeGuide = async () => {
    if (!currentUser) {
      toast({ title: "Login necessário", description: "Faça login para curtir este guia.", variant: "warning" });
      navigate(createPageUrl("UserAccount"));
      return;
    }
    if (!guide) return;
    
    // Lógica simplificada de curtida (não impede múltiplas curtidas do mesmo usuário nesta versão)
    try {
      const newLikesCount = (guide.likes_count || 0) + 1;
      await LocalGuide.update(guide.id, { likes_count: newLikesCount });
      setGuide(prev => ({...prev, likes_count: newLikesCount}));
      toast({title: "Guia curtido!"});
    } catch (error) {
      console.error("Erro ao curtir guia:", error);
      toast({ title: "Erro", description: "Não foi possível curtir o guia.", variant: "destructive" });
    }
  };
  
  const handleCloseModal = () => {
    navigate(-1); // Volta para a página anterior
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "gastronomia": return <Utensils className="w-3 h-3 mr-1" />;
      case "hospedagem": return <Hotel className="w-3 h-3 mr-1" />;
      case "passeios": return <Ship className="w-3 h-3 mr-1" />;
      case "eventos": return <CalendarDays className="w-3 h-3 mr-1" />;
      case "cultura": return <Palette className="w-3 h-3 mr-1" />;
      case "compras": return <ShoppingBag className="w-3 h-3 mr-1" />;
      case "familia": return <Users className="w-3 h-3 mr-1" />;
      case "noturno": return <Moon className="w-3 h-3 mr-1" />;
      default: return <Globe className="w-3 h-3 mr-1" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "gastronomia": return "text-amber-700 bg-amber-100 border-amber-200";
      case "hospedagem": return "text-blue-700 bg-blue-100 border-blue-200";
      case "passeios": return "text-cyan-700 bg-cyan-100 border-cyan-200";
      case "eventos": return "text-purple-700 bg-purple-100 border-purple-200";
      case "cultura": return "text-pink-700 bg-pink-100 border-pink-200";
      case "compras": return "text-emerald-700 bg-emerald-100 border-emerald-200";
      case "familia": return "text-indigo-700 bg-indigo-100 border-indigo-200";
      case "noturno": return "text-violet-700 bg-violet-100 border-violet-200";
      default: return "text-gray-700 bg-gray-100 border-gray-200";
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
    return labels[category] || category.charAt(0).toUpperCase() + category.slice(1);
  };


  if (isLoading || !guide || !author) { // Mantém a verificação de !author aqui
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
        <p className="ml-4 text-lg text-gray-700">Carregando detalhes do guia...</p>
      </div>
    );
  }

  return (
    <GuideDetailModal
      guide={guide}
      user={author} 
      currentUser={currentUser}
      isSaved={isSaved}
      locationName={locationName}
      onClose={handleCloseModal}
      onSave={handleSaveGuide}
      onLike={handleLikeGuide}
      getCategoryIcon={getCategoryIcon}
      getCategoryColor={getCategoryColor}
      getCategoryLabel={getCategoryLabel}
    />
  );
}
