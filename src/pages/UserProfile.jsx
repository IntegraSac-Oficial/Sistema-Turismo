
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Tourist } from "@/api/entities";
import { UserProfile as UserProfileEntity } from "@/api/entities";
import { Review } from "@/api/entities";
import { Post } from "@/api/entities";
import { City } from "@/api/entities";
import { Beach } from "@/api/entities";
import { Business } from "@/api/entities";
import { UserSubscription } from "@/api/entities";
import { SubscriptionPlan } from "@/api/entities";
import { UserConnection } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { 
  User as UserIcon, 
  Mail, 
  MapPin, 
  Calendar, 
  Star, 
  MessageSquare, 
  Pencil, 
  Crown, 
  Users, 
  Instagram, 
  Facebook, 
  Youtube, 
  Globe, 
  PlusCircle, 
  MinusCircle,
  Heart,
  Camera,
  ImageIcon,
  Edit,
  Save,
  X,
  ChevronLeft,
  Upload,
  Info,
  Loader2,
  Image as ImageIconLucide, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  Map, 
  CalendarDays, 
  ShoppingBag, 
  BarChart3,
  CreditCard,
  Trash2,
  PlusCircle as PlusCircleIcon,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BackButton } from "@/components/ui/BackButton";
import PostCard from "@/components/community/PostCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast"
import { QrCode, Award, History } from "lucide-react";
import UserTransactionsHistory from "@/components/tourists/UserTransactionsHistory";
import MembershipCard from "@/components/tourists/MembershipCard";
import BecomeInfluencerButton from "@/components/profile/BecomeInfluencerButton";
import { Influencer } from "@/api/entities";
import { Event } from "@/api/entities";
import EventCard from "@/components/community/EventCard";
import UserEventForm from "@/components/events/UserEventForm";

export default function UserProfile() {
  const [currentUser, setCurrentUser] = useState(null);
  const [touristData, setTouristData] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    bio: "",
    location: "",
    avatar_url: "",
    cover_url: "",
    interests: [],
    is_local: false,
    social_links: {
      instagram: "",
      facebook: "",
      twitter: "",
      youtube: ""
    },
    travel_style: []
  });
  const [newInterest, setNewInterest] = useState("");
  const [newTravelStyle, setNewTravelStyle] = useState("");
  const [userPosts, setUserPosts] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [reviewEntities, setReviewEntities] = useState({});
  const [userStats, setUserStats] = useState({
    posts: 0,
    reviews: 0,
    following: 0,
    followers: 0,
    events: 0 // Adicionar eventos aqui
  });
  const [userSubscription, setUserSubscription] = useState(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [followingStatus, setFollowingStatus] = useState({
    loading: false,
    error: null
  });
  
  const profileImageInputRef = useRef(null);
  const coverImageInputRef = useRef(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [coverImagePreview, setCoverImagePreview] = useState("");
  const [isUploading, setIsUploading] = useState({ profile: false, cover: false });
  const [uploadError, setUploadError] = useState({ profile: null, cover: null });
  const [activeTab, setActiveTab] = useState("posts");
  const [isInfluencer, setIsInfluencer] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [userEvents, setUserEvents] = useState([]);
  const [showCardModal, setShowCardModal] = useState(false);
  
  const navigate = useNavigate();
  const { profileUserId: routeProfileUserId } = useParams(); // Renomeado para evitar conflito com estado profileUserId

  const travelStyles = [
    { value: "aventura", label: "Aventura" },
    { value: "relaxamento", label: "Relaxamento" },
    { value: "cultural", label: "Cultural" },
    { value: "gastronomico", label: "Gastronômico" },
    { value: "ecologico", label: "Ecológico" },
    { value: "festa", label: "Festa" },
    { value: "familia", label: "Família" },
    { value: "romantico", label: "Romântico" },
    { value: "esportivo", label: "Esportivo" },
    { value: "low_cost", label: "Econômico" }
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      navigate(createPageUrl("UserAccount"));
      return;
    }
    try {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
    } catch (error) {
      console.error("Erro ao processar usuário armazenado:", error);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('isLoggedIn');
      navigate(createPageUrl("UserAccount"));
    }
  }, [navigate]);

  // Usar routeProfileUserId para carregar o perfil, ou o ID do currentUser se não houver ID na rota
  const profileToLoadId = routeProfileUserId || currentUser?.id;

  // Função separada para carregar eventos do usuário
  const loadUserEvents = async (userId) => {
    console.log("Carregando eventos para o usuário:", userId);
    try {
      // Modificar o filtro para incluir todos os eventos do usuário, independente do status
      const eventsData = await Event.filter({ 
        created_by: userId 
      }, "-created_date");
      console.log("Eventos carregados:", eventsData);
      setUserEvents(eventsData || []);
      return eventsData || [];
    } catch (error) {
      console.error("Erro ao carregar eventos do usuário:", error);
      return [];
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      if (!profileToLoadId) return;

      setIsLoading(true);
      setProfileError(null);
      
      try {
        // Verificar se este é o perfil do próprio usuário logado
        const viewingOwnProfile = !routeProfileUserId || (currentUser && currentUser.id === routeProfileUserId);
        setIsOwnProfile(viewingOwnProfile);

        let targetUserId = profileToLoadId;

        // Carregar dados do UserProfile
        let profileEntityDataArray = await UserProfileEntity.filter({ user_id: targetUserId });
        let loadedUserProfile = profileEntityDataArray.length > 0 ? profileEntityDataArray[0] : null;

        // Se for o perfil do usuário logado e não existir, criar
        if (viewingOwnProfile && !loadedUserProfile && currentUser) {
          try {
            loadedUserProfile = await UserProfileEntity.create({
              user_id: currentUser.id,
              bio: "",
              location: "",
              interests: [],
              is_local: false,
              social_links: { instagram: "", facebook: "", twitter: "", youtube: "" },
              travel_style: [],
              following_count: 0,
              followers_count: 0,
              posts_count: 0,
              reviews_count: 0,
              privacy_settings: { show_email: false, show_location: true, show_social_links: true }
            });
          } catch (createError) {
            console.error("Erro ao criar perfil:", createError);
            setProfileError("Não foi possível criar seu perfil. Por favor, tente novamente.");
            setIsLoading(false);
            return;
          }
        }
        
        if (!loadedUserProfile) {
            setProfileError("Perfil não encontrado.");
            setIsLoading(false);
            return;
        }
        setUserProfile(loadedUserProfile);
        
        // Preencher campos de edição
        setEditedProfile({
          bio: loadedUserProfile.bio || "",
          location: loadedUserProfile.location || "",
          avatar_url: loadedUserProfile.avatar_url || "",
          cover_url: loadedUserProfile.cover_url || "",
          interests: loadedUserProfile.interests || [],
          is_local: loadedUserProfile.is_local || false,
          social_links: loadedUserProfile.social_links || { instagram: "", facebook: "", twitter: "", youtube: "" },
          travel_style: loadedUserProfile.travel_style || []
        });
        setProfileImagePreview(loadedUserProfile.avatar_url || "");
        setCoverImagePreview(loadedUserProfile.cover_url || "");

        // Carregar dados de Turista (se aplicável e for o perfil próprio)
        if (viewingOwnProfile && currentUser?.role === 'tourist') {
          try {
            let touristInfo = null;
            if (currentUser.tourist_id) {
                 touristInfo = await Tourist.get(currentUser.tourist_id);
            } else {
                const tourists = await Tourist.list(); 
                touristInfo = tourists.find(t => t.user_id === currentUser.id || t.email === currentUser.email);
            }
            if (touristInfo) {
              setTouristData(touristInfo);
              if (!loadedUserProfile.user_code && touristInfo.user_code) {
                  setUserProfile(prev => ({...prev, user_code: touristInfo.user_code}));
              }
            }
          } catch (err) {
            console.error("Erro ao buscar dados de turista:", err);
          }
        }
        
        // Primeiro carregamos os posts e reviews
        const [postsData, reviewsData] = await Promise.all([
          Post.filter({ user_id: targetUserId }, "-created_date").catch(() => []),
          Review.filter({ user_id: targetUserId }, "-created_date").catch(() => []),
        ]);
        
        setUserPosts(postsData || []);
        setUserReviews(reviewsData || []);
        
        // Agora carregamos eventos separadamente para garantir que esta chamada funcione
        // Debug: Vamos imprimir em console detalhes do usuário cujos eventos estamos buscando
        console.log("Buscando eventos para usuário:", {
          targetUserId,
          userId: targetUserId,
          created_by: targetUserId,
          profile: loadedUserProfile
        });
        
        // Carregar eventos usando a função separada
        const eventsData = await loadUserEvents(targetUserId);
        
        console.log("Eventos carregados do usuário:", eventsData);
        
        // Atualizar estatísticas
        setUserStats(prevStats => ({
          ...prevStats,
          posts: postsData?.length || 0,
          reviews: reviewsData?.length || 0,
          events: eventsData?.length || 0,
          followers: loadedUserProfile.followers_count || 0,
          following: loadedUserProfile.following_count || 0,
        }));
        
        // ... (restante da lógica de carregar reviewEntities e subscriptionData, se necessário) ...
        if (reviewsData && reviewsData.length > 0) {
            const entityMap = {};
            for (const review of reviewsData) {
              if (!entityMap[review.entity_id]) {
                try {
                  let entityDetails = null;
                  if (review.entity_type === "city") entityDetails = await City.get(review.entity_id);
                  else if (review.entity_type === "beach") entityDetails = await Beach.get(review.entity_id);
                  else if (review.entity_type === "business") entityDetails = await Business.get(review.entity_id);
                  
                  if(entityDetails) entityMap[review.entity_id] = { type: review.entity_type, name: entityDetails.name, data: entityDetails };

                } catch (err) {
                  console.error(`Erro ao carregar entidade ${review.entity_type} com ID ${review.entity_id}:`, err);
                }
              }
            }
            setReviewEntities(entityMap);
          }

        if (viewingOwnProfile && currentUser) {
            const subscriptionData = await UserSubscription.filter({ user_id: currentUser.id });
            if (subscriptionData && subscriptionData.length > 0) {
                const activeSubscriptions = subscriptionData.filter(sub => 
                sub.status === "active" && new Date(sub.end_date) >= new Date()
                ).sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
                
                if (activeSubscriptions.length > 0) {
                setUserSubscription(activeSubscriptions[0]);
                const plansData = await SubscriptionPlan.list();
                const userPlan = plansData.find(p => p.id === activeSubscriptions[0].plan_id);
                if (userPlan) setSubscriptionPlan(userPlan);
                }
            }
        }

      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        setProfileError("Não foi possível carregar os dados do perfil. Por favor, tente novamente.");
      } finally {
        setIsLoading(false);
      }
    };
    
    const checkInfluencerStatus = async () => {
      if (profileToLoadId) { // Usar profileToLoadId
        try {
          const influencers = await Influencer.filter({ user_id: profileToLoadId });
          setIsInfluencer(influencers && influencers.length > 0);
        } catch (err) {
          console.error("Erro ao verificar status de influenciador:", err);
          setIsInfluencer(false);
        }
      }
    };
    
    if (profileToLoadId) { // Certificar que temos um ID para carregar
      loadUserData();
      checkInfluencerStatus();
    }
  }, [profileToLoadId, currentUser]);

  // Adicionar um useEffect separado para recarregar eventos quando o formulário de evento for fechado
  useEffect(() => {
    if (!showEventForm && currentUser && profileToLoadId) {
      // Quando o modal de evento for fechado, recarregar os eventos
      loadUserEvents(profileToLoadId);
    }
  }, [showEventForm, profileToLoadId, currentUser]);

  const handlePasswordChange = async (newPassword) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser) return;
  
        toast({
          title: "Senha alterada com sucesso",
          description: "Sua nova senha foi salva."
        });
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      toast({
        title: "Erro ao alterar senha",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setUploadError({ ...uploadError, profile: 'Por favor, selecione um arquivo de imagem válido.' });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { 
      setUploadError({ ...uploadError, profile: 'A imagem deve ter no máximo 5MB.' });
      return;
    }
    
    setUploadError({ ...uploadError, profile: null });
    
    const reader = new FileReader();
    reader.onload = () => {
      setProfileImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    setIsUploading({ ...isUploading, profile: true });
    try {
      const { file_url } = await UploadFile({ file });
      setEditedProfile({
        ...editedProfile,
        avatar_url: file_url
      });
      console.log("Foto de perfil enviada com sucesso:", file_url);
    } catch (error) {
      console.error("Erro ao fazer upload da imagem de perfil:", error);
      setUploadError({ ...uploadError, profile: 'Erro ao enviar a imagem. Tente novamente.' });
    } finally {
      setIsUploading({ ...isUploading, profile: false });
    }
  };

  const handleCoverImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setUploadError({ ...uploadError, cover: 'Por favor, selecione um arquivo de imagem válido.' });
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB
      setUploadError({ ...uploadError, cover: 'A imagem deve ter no máximo 10MB.' });
      return;
    }
    
    setUploadError({ ...uploadError, cover: null });
    
    const reader = new FileReader();
    reader.onload = () => {
      setCoverImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    setIsUploading({ ...isUploading, cover: true });
    try {
      const { file_url } = await UploadFile({ file });
      setEditedProfile({
        ...editedProfile,
        cover_url: file_url
      });
      console.log("Foto de capa enviada com sucesso:", file_url);
    } catch (error) {
      console.error("Erro ao fazer upload da imagem de capa:", error);
      setUploadError({ ...uploadError, cover: 'Erro ao enviar a imagem. Tente novamente.' });
    } finally {
      setIsUploading({ ...isUploading, cover: false });
    }
  };

  const handleAddCustomTravelStyle = () => {
    if (newTravelStyle.trim() && !editedProfile.travel_style.includes(newTravelStyle.trim())) {
      setEditedProfile({
        ...editedProfile,
        travel_style: [...editedProfile.travel_style, newTravelStyle.trim()]
      });
      setNewTravelStyle("");
    }
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !editedProfile.interests.includes(newInterest.trim())) {
      setEditedProfile({
        ...editedProfile,
        interests: [...editedProfile.interests, newInterest.trim()]
      });
      setNewInterest("");
    }
  };

  const handleRemoveInterest = (interest) => {
    setEditedProfile({
      ...editedProfile,
      interests: editedProfile.interests.filter(i => i !== interest)
    });
  };

  const handleToggleTravelStyle = (style) => {
    if (editedProfile.travel_style.includes(style)) {
      setEditedProfile({
        ...editedProfile,
        travel_style: editedProfile.travel_style.filter(s => s !== style)
      });
    } else {
      setEditedProfile({
        ...editedProfile,
        travel_style: [...editedProfile.travel_style, style]
      });
    }
  };

  const handleSaveProfile = async () => {
    try {
      console.log("Salvando perfil:", editedProfile);
      
      if (userProfile) {
        const updatedProfile = await UserProfileEntity.update(userProfile.id, {
          ...userProfile,
          bio: editedProfile.bio,
          location: editedProfile.location,
          avatar_url: editedProfile.avatar_url,
          cover_url: editedProfile.cover_url,
          interests: editedProfile.interests,
          is_local: editedProfile.is_local,
          social_links: editedProfile.social_links,
          travel_style: editedProfile.travel_style
        });
        
        setUserProfile(updatedProfile);
        setIsEditing(false);
        
        setProfileImagePreview(editedProfile.avatar_url);
        setCoverImagePreview(editedProfile.cover_url);
        
        alert("Perfil atualizado com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      alert("Ocorreu um erro ao atualizar o perfil. Tente novamente.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).format(date);
  };
  
  const handleEditEvent = (eventId) => {
    const eventToEdit = userEvents.find(event => event.id === eventId);
    if (eventToEdit) {
      setEventToEdit(eventToEdit);
      setShowEventForm(true);
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível encontrar o evento para edição.",
        variant: "destructive"
      });
    }
  };

  const handleEventSuccess = async (newEvent) => {
    console.log("Evento salvo com sucesso:", newEvent);
    
    // Recarregar eventos imediatamente após uma operação bem-sucedida
    try {
      if (profileToLoadId) {
        console.log("Recarregando eventos após operação");
        await loadUserEvents(profileToLoadId);
      }
    } catch (error) {
      console.error("Erro ao recarregar eventos:", error);
    }
    
    setEventToEdit(null);
    
    toast({
      title: "Sucesso",
      description: eventToEdit 
        ? "Evento atualizado com sucesso!" 
        : "Evento criado com sucesso! Aguarde a aprovação do administrador.",
    });
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm("Tem certeza que deseja excluir este evento?")) {
      try {
        await Event.delete(eventId);
        toast({ title: "Evento Excluído", description: "Seu evento foi excluído com sucesso." });
        setUserEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
        // Atualizar contagem de eventos no perfil
        if (userProfile) {
            UserProfileEntity.update(userProfile.id, { events_count: (userProfile.events_count || 0) - 1 });
            setUserProfile(prev => ({...prev, events_count: (prev.events_count || 0) -1}));
        }
        setUserStats(prev => ({...prev, events: prev.events -1 }));

      } catch (error) {
        console.error("Erro ao excluir evento:", error);
        toast({ title: "Erro ao Excluir", description: "Não foi possível excluir o evento.", variant: "destructive" });
      }
    }
  };

  const renderEventCard = (event) => (
    <Card key={event.id} className="mb-4 overflow-hidden">
      <EventCard event={event} />
      {isOwnProfile && ( // Mostrar botões apenas se for o perfil do usuário logado
        <CardFooter className="flex justify-end gap-2 p-4 bg-slate-50">
          <Button variant="outline" size="sm" onClick={() => handleEditEvent(event.id)}>
            <Edit className="w-4 h-4 mr-2" /> Editar
          </Button>
          <Button variant="destructive" size="sm" onClick={() => handleDeleteEvent(event.id)}>
            <Trash2 className="w-4 h-4 mr-2" /> Excluir
          </Button>
        </CardFooter>
      )}
    </Card>
  );
  
  const PALETTE = {
    blue: {
      light: "bg-blue-50",
      medium: "bg-blue-600",
      dark: "bg-blue-800",
      textLight: "text-blue-600",
      textDark: "text-blue-800",
    },
    orange: {
      light: "bg-orange-50",
      medium: "bg-orange-500",
      dark: "bg-orange-600",
      text: "text-orange-500",
    },
    yellow: {
      light: "bg-yellow-50",
      medium: "bg-yellow-400",
      dark: "bg-yellow-500",
      text: "text-yellow-500",
    },
    white: "bg-white",
    gray: {
      light: "bg-gray-100",
      medium: "text-gray-500",
      dark: "text-gray-700",
      border: "border-gray-200",
    }
  };

  return (
    <div className={`min-h-screen ${PALETTE.gray.light} py-8 px-4`}>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="mb-2">
          <BackButton className={`${PALETTE.blue.textLight} hover:bg-blue-100`} />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <Loader2 className={`h-12 w-12 ${PALETTE.blue.textLight} animate-spin`} />
          </div>
        ) : profileError ? (
          <Card className={`${PALETTE.orange.light} border-orange-300`}>
            <CardHeader>
              <CardTitle className={`text-orange-700`}>Erro ao Carregar Perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-orange-600 mb-4">{profileError}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* --- SEÇÃO CAPA E AVATAR --- */}
            <div className="relative shadow-lg rounded-xl">
              <div className={`h-48 md:h-64 w-full ${PALETTE.blue.medium} rounded-t-xl overflow-hidden group`}>
                {coverImagePreview || userProfile?.cover_url ? (
                  <img
                    src={isEditing ? coverImagePreview || userProfile?.cover_url : userProfile?.cover_url}
                    alt="Capa do perfil"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIconLucide className="h-16 w-16 text-blue-300 opacity-50" />
                  </div>
                )}
                {isEditing && (
                  <div className="absolute top-4 right-4">
                    <Button
                      variant="secondary"
                      className="bg-white/80 hover:bg-white backdrop-blur-sm text-gray-700"
                      onClick={() => coverImageInputRef.current?.click()}
                      disabled={isUploading.cover}
                    >
                      {isUploading.cover ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                      <span className="ml-2 hidden sm:inline">{coverImagePreview || userProfile?.cover_url ? "Trocar Capa" : "Adicionar Capa"}</span>
                    </Button>
                    <input type="file" ref={coverImageInputRef} onChange={handleCoverImageChange} accept="image/*" className="hidden" />
                  </div>
                )}
                 {uploadError.cover && <div className="absolute bottom-2 right-2 bg-red-100 p-2 rounded-md text-xs text-red-600 border border-red-300">{uploadError.cover}</div>}
              </div>

              <div className={`p-6 ${PALETTE.white} rounded-b-xl`}>
                <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-20 sm:-mt-24 relative">
                  <div className="relative mb-4 sm:mb-0 z-10"> {/* Adicionar z-10 para garantir que o avatar fique acima da capa */}
                     <Avatar className={`w-32 h-32 md:w-36 md:h-36 border-4 border-white rounded-full shadow-lg bg-gray-200`}>
                      {isEditing ? (
                        profileImagePreview ? (
                          <img src={profileImagePreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : userProfile?.avatar_url ? (
                          <AvatarImage src={userProfile.avatar_url} alt={currentUser?.full_name} />
                        ) : (
                          <AvatarFallback className={`text-4xl ${PALETTE.blue.light} ${PALETTE.blue.textDark}`}>
                            {currentUser?.full_name?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        )
                      ) : userProfile?.avatar_url ? (
                        <AvatarImage src={userProfile.avatar_url} alt={currentUser?.full_name} />
                      ) : (
                         <AvatarFallback className={`text-4xl ${PALETTE.blue.light} ${PALETTE.blue.textDark}`}>
                           {currentUser?.full_name?.[0]?.toUpperCase() || 'U'}
                         </AvatarFallback>
                      )}
                    </Avatar>
                    {isEditing && (
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute bottom-2 right-2 rounded-full p-2 shadow-md bg-white/80 hover:bg-white z-20" /* z-20 para estar acima do avatar */
                        onClick={() => profileImageInputRef.current?.click()}
                      >
                        {isUploading.profile ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                      </Button>
                    )}
                     <input type="file" ref={profileImageInputRef} onChange={handleProfileImageChange} accept="image/*" className="hidden" />
                     {uploadError.profile && <div className="absolute -bottom-10 -right-12 bg-red-100 p-1 rounded-md text-xs text-red-600 border border-red-300 w-32 text-center z-10">{uploadError.profile}</div>}
                  </div>

                  <div className="sm:ml-6 text-center sm:text-left flex-grow">
                    <h1 className="text-3xl font-bold text-gray-800">{userProfile?.full_name || currentUser?.full_name}</h1>
                    <p className={`${PALETTE.gray.medium} flex items-center justify-center sm:justify-start`}>
                      <Mail className="h-4 w-4 mr-2 opacity-70" />{userProfile?.email || currentUser?.email}
                    </p>
                    {subscriptionPlan && isOwnProfile && ( // Mostrar plano apenas no perfil próprio
                      <Badge className={`mt-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md`}>
                        <Crown className="h-4 w-4 mr-1.5" />
                        {subscriptionPlan.name}
                      </Badge>
                    )}
                  </div>
                  
                  {isOwnProfile && (
                    <div className="mt-4 sm:mt-0">
                      <Button
                        variant={isEditing ? "default" : "outline"}
                        onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                        className={`${isEditing ? `${PALETTE.orange.medium} hover:${PALETTE.orange.dark} text-white` : `${PALETTE.blue.textLight} border-blue-300 hover:bg-blue-50`}`}
                      >
                        {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                        {isEditing ? "Salvar Alterações" : "Editar Perfil"}
                      </Button>
                       {isEditing && (
                         <Button 
                           variant="ghost" 
                           onClick={() => {
                             setIsEditing(false);
                             setEditedProfile({
                               bio: userProfile?.bio || "",
                               location: userProfile?.location || "",
                               avatar_url: userProfile?.avatar_url || "",
                               cover_url: userProfile?.cover_url || "",
                               interests: userProfile?.interests || [],
                               is_local: userProfile?.is_local || false,
                               social_links: userProfile?.social_links || {
                                 instagram: "",
                                 facebook: "",
                                 twitter: "",
                                 youtube: ""
                               },
                               travel_style: userProfile?.travel_style || []
                             });
                             setProfileImagePreview(userProfile?.avatar_url || "");
                             setCoverImagePreview(userProfile?.cover_url || "");
                             setUploadError({ profile: null, cover: null });
                           }} 
                           className="ml-2 text-gray-600 hover:text-red-500"
                         >
                           <X className="h-4 w-4 mr-1 sm:mr-2" />
                           <span className="hidden sm:inline">Cancelar</span>
                         </Button>
                       )}
                    </div>
                  )}
                </div>

                {/* Botões Influenciador e Cartão de Membro - ALINHADOS HORIZONTALMENTE */}
                {isOwnProfile && (
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3">
                    {!isInfluencer && (
                      <BecomeInfluencerButton 
                        entity={touristData || currentUser} 
                        entityType={touristData ? "tourist" : "user"}
                        entityId={touristData?.id || currentUser?.id}
                        className="w-full sm:w-auto"
                      />
                    )}
                    {currentUser?.role === 'tourist' && touristData && (
                      <Button 
                        onClick={() => setShowCardModal(true)}
                        className={`${PALETTE.orange.medium} hover:${PALETTE.orange.dark} text-white flex items-center gap-2 shadow-md w-full sm:w-auto`}
                      >
                        <CreditCard className="h-5 w-5" />
                        <span className="inline">Meu Cartão de Membro</span>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* --- SEÇÃO BENEFÍCIOS E QR CODE (SOMENTE TURISTA e no perfil próprio) --- */}
            {isOwnProfile && currentUser?.role === 'tourist' && touristData && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className={`col-span-1 md:col-span-1 ${PALETTE.yellow.light} border-yellow-300 shadow-lg`}>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-yellow-700">Cashback</CardTitle>
                    <CreditCard className="h-6 w-6 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-yellow-800">
                      R$ {(touristData.cashback_balance || 0).toFixed(2)}
                    </div>
                    <p className="text-xs text-yellow-700 opacity-80">Saldo disponível</p>
                  </CardContent>
                </Card>

                <Card className={`col-span-1 md:col-span-1 ${PALETTE.orange.light} border-orange-300 shadow-lg`}>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-orange-700">Pontos</CardTitle>
                    <Award className="h-6 w-6 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-orange-800">
                      {touristData.points_balance || 0}
                    </div>
                     <p className="text-xs text-orange-700 opacity-80">Pontos acumulados</p>
                  </CardContent>
                </Card>
                
                <Card className={`col-span-1 md:col-span-1 ${PALETTE.blue.light} border-blue-300 shadow-lg flex flex-col justify-center items-center text-center p-6`}>
                  <QrCode className={`h-10 w-10 ${PALETTE.blue.textDark} mb-3`} />
                  <h3 className={`text-lg font-semibold ${PALETTE.blue.textDark} mb-1`}>Meu Código</h3>
                  {touristData.user_code ? (
                    <>
                      <p className={`text-2xl font-mono tracking-wider p-2 rounded-md ${PALETTE.blue.medium} text-white`}>
                        {touristData.user_code}
                      </p>
                       <p className="text-xs text-blue-700 opacity-80 mt-2">Apresente este código nos comércios</p>
                    </>
                  ) : (
                    <p className={`${PALETTE.gray.medium}`}>Código não disponível</p>
                  )}
                </Card>
              </div>
            )}


            {/* --- NAVEGAÇÃO PRINCIPAL E CONTEÚDO --- */}
            <div className="flex flex-col lg:flex-row gap-8">
              {/* COLUNA LATERAL (SOBRE, INTERESSES, ETC) */}
              <div className="w-full lg:w-1/3 space-y-6 order-2 lg:order-1">
                <Card className={`${PALETTE.white} shadow-lg rounded-xl`}>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center ${PALETTE.blue.textDark}">
                      <UserIcon className={`h-5 w-5 mr-3 ${PALETTE.blue.textLight}`} /> Sobre Mim
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-gray-600">
                    {isEditing ? (
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Conte um pouco sobre você..."
                          value={editedProfile.bio || ""}
                          onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
                          className="min-h-[100px]"
                        />
                        <Input
                          placeholder="Sua cidade/estado"
                          value={editedProfile.location || ""}
                          onChange={(e) => setEditedProfile({...editedProfile, location: e.target.value})}
                        />
                         <div className="flex items-center gap-2">
                           <input type="checkbox" id="is_local" checked={editedProfile.is_local} onChange={(e) => setEditedProfile({...editedProfile, is_local: e.target.checked})} className="rounded border-gray-300" />
                           <label htmlFor="is_local" className="text-sm">Sou morador local</label>
                         </div>
                      </div>
                    ) : (
                      <>
                        <p>{userProfile?.bio || (isOwnProfile ? "Adicione uma biografia para que outros te conheçam!" : "Este viajante ainda não compartilhou sua bio.")}</p>
                        {userProfile?.location && (
                          <div className="flex items-center">
                            <MapPin className={`h-4 w-4 mr-2 ${PALETTE.orange.text} opacity-80`} />
                            <span>{userProfile.location}</span>
                            {userProfile.is_local && <Badge variant="outline" className={`ml-2 border-orange-300 text-orange-600 bg-orange-50 text-xs`}>Morador Local</Badge>}
                          </div>
                        )}
                        <div className="flex items-center">
                          <CalendarDays className={`h-4 w-4 mr-2 ${PALETTE.blue.textLight} opacity-80`} />
                          <span>Membro desde {formatDate(currentUser?.created_date)}</span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card className={`${PALETTE.white} shadow-lg rounded-xl`}>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center ${PALETTE.blue.textDark}">
                      <Heart className={`h-5 w-5 mr-3 ${PALETTE.orange.text}`} /> Interesses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                       <div className="space-y-3">
                         <div className="flex items-center">
                           <Input placeholder="Novo interesse (ex: Surf)" value={newInterest} onChange={(e) => setNewInterest(e.target.value)} className="text-sm mr-2"/>
                           <Button size="sm" variant="outline" onClick={handleAddInterest} className={PALETTE.blue.textLight}><PlusCircle className="h-4 w-4"/></Button>
                         </div>
                         <div className="flex flex-wrap gap-2">
                          {editedProfile.interests?.map((interest, index) => (
                            <Badge key={index} variant="secondary" className="pl-2 pr-1 flex items-center gap-1 bg-orange-100 text-orange-700">
                              {interest}
                              <Button variant="ghost" size="icon" className="h-5 w-5 p-0 ml-1 text-orange-500 hover:text-red-500" onClick={() => handleRemoveInterest(interest)}><X className="h-3 w-3"/></Button>
                            </Badge>
                          ))}
                        </div>
                       </div>
                    ) : (
                      userProfile?.interests && userProfile.interests.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {userProfile.interests.map((interest, index) => (
                            <Badge key={index} className={`font-medium ${PALETTE.orange.light} text-orange-700 border border-orange-200`}>{interest}</Badge>
                          ))}
                        </div>
                      ) : (
                        <p className={`${PALETTE.gray.medium} italic`}>{isOwnProfile ? "Quais são seus hobbies e paixões? Adicione aqui!" : "Interesses não informados."}</p>
                      )
                    )}
                  </CardContent>
                </Card>
                
                <Card className={`${PALETTE.white} shadow-lg rounded-xl`}>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center ${PALETTE.blue.textDark}">
                      <ImageIconLucide className={`h-5 w-5 mr-3 ${PALETTE.orange.text}`} /> Estilo de Viagem
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {travelStyles.map((style) => (
                            <div key={style.value} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`style-${style.value}`}
                                checked={editedProfile.travel_style?.includes(style.value)}
                                onChange={() => handleToggleTravelStyle(style.value)}
                                className="mr-2 rounded border-gray-300"
                              />
                              <label htmlFor={`style-${style.value}`}>{style.label}</label>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex items-center">
                          <Input
                              placeholder="Novo estilo"
                              value={newTravelStyle}
                              onChange={(e) => setNewTravelStyle(e.target.value)}
                              className="text-sm w-32 mr-2"
                          />
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={handleAddCustomTravelStyle}
                          >
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {editedProfile.travel_style && editedProfile.travel_style.some(style => 
                          !travelStyles.map(s => s.value).includes(style)
                        ) && (
                          <div className="mt-4">
                            <p className="text-sm font-medium mb-2">Estilos personalizados:</p>
                            <div className="flex flex-wrap gap-2">
                              {editedProfile.travel_style
                                .filter(style => !travelStyles.map(s => s.value).includes(style))
                                .map((style, index) => (
                                  <Badge key={index} variant="outline" className="pl-2 flex items-center gap-1">
                                    {style}
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-5 w-5 p-0 ml-1 text-gray-500 hover:text-red-500"
                                      onClick={() => setEditedProfile({
                                        ...editedProfile,
                                        travel_style: editedProfile.travel_style.filter(s => s !== style)
                                      })}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </Badge>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {userProfile?.travel_style && userProfile.travel_style.length > 0 ? (
                          userProfile.travel_style.map((style, index) => {
                            const styleData = travelStyles.find(s => s.value === style);
                            return (
                              <Badge key={index} variant="secondary">
                                {styleData ? styleData.label : style}
                              </Badge>
                            );
                          })
                        ) : (
                          <p className={`${PALETTE.gray.medium} italic`}>
                            {isOwnProfile ? "Adicione seus estilos de viagem editando seu perfil." : "Usuário não definiu estilos de viagem."}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className={`${PALETTE.white} shadow-lg rounded-xl`}>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center ${PALETTE.blue.textDark}">
                      <Globe className={`h-5 w-5 mr-3 ${PALETTE.orange.text}`} /> Redes Sociais
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Instagram className="h-5 w-5 text-pink-600 mr-2" />
                          <Input
                            placeholder="Seu perfil no Instagram"
                            value={editedProfile.social_links?.instagram || ""}
                            onChange={(e) => setEditedProfile({
                              ...editedProfile, 
                              social_links: {
                                ...editedProfile.social_links,
                                instagram: e.target.value
                              }
                            })}
                          />
                        </div>
                        
                        <div className="flex items-center">
                          <Facebook className="h-5 w-5 text-blue-600 mr-2" />
                          <Input
                            placeholder="Seu perfil no Facebook"
                            value={editedProfile.social_links?.facebook || ""}
                            onChange={(e) => setEditedProfile({
                              ...editedProfile, 
                              social_links: {
                                ...editedProfile.social_links,
                                facebook: e.target.value
                              }
                            })}
                          />
                        </div>
                        
                        <div className="flex items-center">
                          <Youtube className="h-5 w-5 text-red-600 mr-2" />
                          <Input
                            placeholder="Seu canal no YouTube"
                            value={editedProfile.social_links?.youtube || ""}
                            onChange={(e) => setEditedProfile({
                              ...editedProfile, 
                              social_links: {
                                ...editedProfile.social_links,
                                youtube: e.target.value
                              }
                            })}
                          />
                        </div>
                        
                        <div className="flex items-center">
                          <Globe className="h-5 w-5 text-blue-500 mr-2" />
                          <Input
                            placeholder="Seu site pessoal"
                            value={editedProfile.social_links?.website || ""}
                            onChange={(e) => setEditedProfile({
                              ...editedProfile, 
                              social_links: {
                                ...editedProfile.social_links,
                                website: e.target.value
                              }
                            })}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {userProfile?.social_links?.instagram && (
                          <a 
                            href={`https://instagram.com/${userProfile.social_links.instagram}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center text-gray-700 hover:text-pink-600"
                          >
                            <Instagram className="h-5 w-5 text-pink-600 mr-2" />
                            <span>@{userProfile.social_links.instagram}</span>
                          </a>
                        )}
                        
                        {userProfile?.social_links?.facebook && (
                          <a 
                            href={`https://facebook.com/${userProfile.social_links.facebook}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center text-gray-700 hover:text-blue-600"
                          >
                            <Facebook className="h-5 w-5 text-blue-600 mr-2" />
                            <span>{userProfile.social_links.facebook}</span>
                          </a>
                        )}
                        
                        {userProfile?.social_links?.youtube && (
                          <a 
                            href={`https://youtube.com/${userProfile.social_links.youtube}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center text-gray-700 hover:text-red-600"
                          >
                            <Youtube className="h-5 w-5 text-red-600 mr-2" />
                            <span>{userProfile.social_links.youtube}</span>
                          </a>
                        )}
                        
                        {userProfile?.social_links?.website && (
                          <a 
                            href={userProfile.social_links.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center text-gray-700 hover:text-blue-500"
                          >
                            <Globe className="h-5 w-5 text-blue-500 mr-2" />
                            <span>Site Pessoal</span>
                          </a>
                        )}
                        
                        {(!userProfile?.social_links || 
                          (!userProfile.social_links.instagram && 
                           !userProfile.social_links.facebook && 
                           !userProfile.social_links.youtube && 
                           !userProfile.social_links.website)) && (
                          <p className={`${PALETTE.gray.medium} italic`}>
                            {isOwnProfile ? "Adicione suas redes sociais editando seu perfil." : "Usuário não adicionou redes sociais."}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
              </div>

              {/* COLUNA PRINCIPAL (ABAS DE CONTEÚDO) */}
              <div className="w-full lg:w-2/3 space-y-6 order-1 lg:order-2">
                 {isEditing && isOwnProfile && (
                   <Alert className={`mb-6 ${PALETTE.blue.light} border-blue-300 text-blue-700`}>
                     <Info className="h-5 w-5" />
                     <AlertTitle className="font-semibold">Modo de Edição Ativado</AlertTitle>
                     <AlertDescription>
                       Faça as alterações desejadas e clique em "Salvar Alterações" no topo do perfil.
                     </AlertDescription>
                   </Alert>
                 )}

                {/* MANTENDO O ESTILO ORIGINAL DAS ABAS */}
                <Tabs defaultValue="posts" value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className={`grid w-full grid-cols-2 sm:grid-cols-4 mb-6 rounded-lg p-1 ${PALETTE.gray.light} shadow-inner`}> {/* Adaptado para mobile: 2 colunas em mobile, 4 em desktop */}
                    <TabsTrigger 
                       value="posts" 
                       className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ease-in-out
                                  data-[state=active]:${PALETTE.blue.medium} data-[state=active]:text-white data-[state=active]:shadow-md
                                  text-gray-600 hover:bg-blue-100 hover:text-blue-700`}
                     >
                       <MessageSquare className="h-4 w-4 mr-2 hidden sm:inline-block" /> Publicações
                     </TabsTrigger>
                     <TabsTrigger 
                       value="reviews" 
                       className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ease-in-out
                                  data-[state=active]:${PALETTE.blue.medium} data-[state=active]:text-white data-[state=active]:shadow-md
                                  text-gray-600 hover:bg-blue-100 hover:text-blue-700`}
                     >
                       <Star className="h-4 w-4 mr-2 hidden sm:inline-block" /> Avaliações
                     </TabsTrigger>
                     {isOwnProfile && currentUser?.role === 'tourist' && ( 
                        <TabsTrigger 
                            value="transactions" 
                            className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ease-in-out
                                        data-[state=active]:${PALETTE.blue.medium} data-[state=active]:text-white data-[state=active]:shadow-md
                                        text-gray-600 hover:bg-blue-100 hover:text-blue-700`}
                        >
                            <ShoppingBag className="h-4 w-4 mr-2 hidden sm:inline-block" /> Histórico
                        </TabsTrigger>
                     )}
                     <TabsTrigger 
                       value="events" 
                       className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ease-in-out
                                  data-[state=active]:${PALETTE.blue.medium} data-[state=active]:text-white data-[state=active]:shadow-md
                                  text-gray-600 hover:bg-blue-100 hover:text-blue-700`}
                     >
                       <CalendarIcon className="h-4 w-4 mr-2 hidden sm:inline-block" /> Meus Eventos
                     </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="posts" className={`${PALETTE.white} p-6 rounded-xl shadow-lg`}>
                    {userPosts.length === 0 ? (
                       <div className="text-center py-12">
                         <MessageSquare className={`h-16 w-16 ${PALETTE.gray.medium} opacity-50 mx-auto mb-4`} />
                         <h3 className="text-xl font-semibold text-gray-700">Compartilhe suas Aventuras!</h3>
                         <p className={`${PALETTE.gray.medium} mb-6`}>
                           {isOwnProfile ? "Você ainda não tem publicações. Que tal criar sua primeira?" : "Este viajante ainda não compartilhou suas experiências."}
                         </p>
                         {isOwnProfile && <Button onClick={() => navigate(createPageUrl("Community"))} className={`${PALETTE.orange.medium} hover:${PALETTE.orange.dark} text-white`}>Nova Publicação</Button>}
                       </div>
                    ) : (
                      <div className="space-y-6">
                        {userPosts.map(post => <PostCard key={post.id} post={post} />)}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="reviews" className={`${PALETTE.white} p-6 rounded-xl shadow-lg`}>
                     {userReviews.length === 0 ? (
                       <div className="text-center py-12">
                         <Star className={`h-16 w-16 ${PALETTE.gray.medium} opacity-50 mx-auto mb-4`} />
                         <h3 className="text-xl font-semibold text-gray-700">Suas Opiniões Valem Ouro!</h3>
                         <p className={`${PALETTE.gray.medium} mb-6`}>
                           {isOwnProfile ? "Deixe sua marca! Avalie os lugares que visitou." : "Nenhuma avaliação por aqui ainda."}
                         </p>
                         {isOwnProfile && <Button onClick={() => navigate(createPageUrl("PublicBeaches"))} className={`${PALETTE.orange.medium} hover:${PALETTE.orange.dark} text-white`}>Explorar e Avaliar</Button>}
                       </div>
                    ) : (
                      <div className="space-y-4">
                        {userReviews.map(review => {
                          const entity = reviewEntities[review.entity_id];
                          return (
                            <Card key={review.id} className={`overflow-hidden border ${PALETTE.gray.border} hover:shadow-md transition-shadow`}>
                              <div className="flex flex-col sm:flex-row">
                                <div className="w-full sm:w-1/4 h-32 bg-gray-200 flex items-center justify-center">
                                  {review.image_urls && review.image_urls.length > 0 ? (
                                    <img 
                                      src={review.image_urls[0]} 
                                      alt="Imagem da avaliação" 
                                      className="w-full h-full object-cover"
                                    />
                                  ) : entity?.data?.image_url ? (
                                    <img 
                                      src={entity.data.image_url} 
                                      alt={entity.name} 
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <ImageIcon className="h-10 w-10 text-gray-400" />
                                  )}
                                </div>
                                
                                <div className="p-4 flex-1">
                                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                    <div>
                                      <Badge variant="outline" className="mb-2">
                                        {review.entity_type === "city" ? "Cidade" :
                                         review.entity_type === "beach" ? "Praia" :
                                         review.entity_type === "business" ? "Comércio" : 
                                         "Serviço"}
                                      </Badge>
                                      <h3 className="text-lg font-semibold">
                                        {entity?.name || `${review.entity_type} #${review.entity_id}`}
                                      </h3>
                                    </div>
                                    
                                    <div className="flex items-center mt-2 sm:mt-0">
                                      {Array.from({ length: 5 }).map((_, index) => (
                                        <Star 
                                          key={index} 
                                          className={`h-5 w-5 ${index < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                                        />
                                      ))}
                                    </div>
                                  </div>
                                  
                                  {review.comment && (
                                    <p className="mt-2 text-gray-700">{review.comment}</p>
                                  )}
                                  
                                  {review.visit_date && (
                                    <p className="text-sm text-gray-500 mt-2">
                                      Visitado em {formatDate(review.visit_date)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>

                  {isOwnProfile && currentUser?.role === 'tourist' && (
                    <TabsContent value="transactions" className={`${PALETTE.white} p-6 rounded-xl shadow-lg`}>
                      {currentUser.role === 'tourist' && touristData ? (
                        <UserTransactionsHistory touristId={touristData.id} />
                      ) : (
                         <div className="text-center py-12">
                           <ShoppingBag className={`h-16 w-16 ${PALETTE.gray.medium} opacity-50 mx-auto mb-4`} />
                           <h3 className="text-xl font-semibold text-gray-700">Sem Histórico</h3>
                           <p className={`${PALETTE.gray.medium}`}>O histórico de transações de fidelidade está disponível apenas para turistas.</p>
                         </div>
                      )}
                    </TabsContent>
                  )}

                  <TabsContent value="events" className={`${PALETTE.white} p-6 rounded-xl shadow-lg`}>
                    {userEvents.length === 0 ? (
                      <div className="text-center py-12">
                        <CalendarIcon className={`h-16 w-16 ${PALETTE.gray.medium} opacity-50 mx-auto mb-4`} />
                        <h3 className="text-xl font-semibold text-gray-700">Nenhum evento criado</h3>
                        <p className={`${PALETTE.gray.medium} mb-6`}>Você ainda não criou nenhum evento.</p>
                        <Button 
                          onClick={() => {
                            setEventToEdit(null);
                            setShowEventForm(true);
                          }} 
                          className={`${PALETTE.orange.medium} hover:${PALETTE.orange.dark} text-white`}
                        >
                          <PlusCircleIcon className="mr-2 h-4 w-4" />
                          Criar Novo Evento
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-lg font-semibold">Seus Eventos</h3>
                          <Button 
                            onClick={() => {
                              setEventToEdit(null);
                              setShowEventForm(true);
                            }} 
                            className={`${PALETTE.orange.medium} hover:${PALETTE.orange.dark} text-white`}
                          >
                            <PlusCircleIcon className="mr-2 h-4 w-4" />
                            Criar Novo Evento
                          </Button>
                        </div>
                        {userEvents.map(event => (
                          <Card key={event.id} className="mb-4 overflow-hidden">
                            <EventCard event={event} />
                            {isOwnProfile && (
                              <CardFooter className="flex justify-end gap-2 p-4 bg-slate-50">
                                <Button variant="outline" size="sm" onClick={() => handleEditEvent(event.id)}>
                                  <Edit className="w-4 h-4 mr-2" /> Editar
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => handleDeleteEvent(event.id)}>
                                  <Trash2 className="w-4 h-4 mr-2" /> Excluir
                                </Button>
                              </CardFooter>
                            )}
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal para o Cartão de Membro */}
      {currentUser?.role === 'tourist' && (
        <Dialog open={showCardModal} onOpenChange={setShowCardModal}>
          <DialogContent className="max-w-md p-0 bg-transparent border-none shadow-none">
            {/* Não precisa de DialogHeader ou Title aqui, o cartão é o conteúdo principal */}
            <MembershipCard
              user={currentUser}
              tourist={touristData}
              subscription={userSubscription}
              plan={subscriptionPlan}
              cardFrontDesignUrl={currentUser?.membership_card_front_design_url}
              cardBackBackgroundUrl={currentUser?.membership_card_bg_url}
              cardLogoUrl={currentUser?.membership_logo_url}
              preview={false} // Não é um preview, é o cartão real do usuário
            />
            <div className="absolute top-2 right-2">
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="rounded-full bg-black/30 hover:bg-black/50 text-white">
                  <X className="h-5 w-5" />
                </Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal para Criação/Edição de Eventos */}
      <UserEventForm 
        open={showEventForm}
        onOpenChange={setShowEventForm}
        eventToEdit={eventToEdit}
        onSuccess={handleEventSuccess}
      />
    </div>
  );
}
