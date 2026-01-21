
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Post } from "@/api/entities";
import { User } from "@/api/entities";
import { Event } from "@/api/entities";
import { LocalGuide } from "@/api/entities";
import { UserProfile } from "@/api/entities"; // Para buscar avatar e nome
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import PostCard from "@/components/community/PostCard";
import CreatePostModal from "@/components/community/CreatePostModal";
import UserProfileCard from "@/components/community/UserProfileCard";
import EventCard from "@/components/community/EventCard";
import GuideCard from "@/components/guides/GuideCard";
import { toast } from "@/components/ui/use-toast";
import { 
  Rss, 
  Users, 
  Map, // Alterado de MapSigns para Map
  CalendarDays, 
  Search, 
  PlusCircle, 
  Image as ImageIcon, 
  MapPin as MapPinIcon, 
  Type,
  TrendingUp,
  Users2,
  Sparkles,
  Award,
  X // Adicionado X para o botão de remover imagem do quick post
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { UploadFile } from "@/api/integrations";

const CommunityPage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null); // Para avatar no "O que você está pensando?"
  const [posts, setPosts] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [popularGuides, setPopularGuides] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // State para o post rápido
  const [quickPostContent, setQuickPostContent] = useState("");
  const [quickPostImages, setQuickPostImages] = useState([]);
  const [isQuickPostUploading, setIsQuickPostUploading] = useState(false);

  const navigate = useNavigate();

  const loadCurrentUser = useCallback(async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      if (user && user.id) {
        const profiles = await UserProfile.filter({ user_id: user.id });
        if (profiles && profiles.length > 0) {
          setUserProfile(profiles[0]);
        }
      }
    } catch (error) {
      console.warn("Usuário não logado ou erro ao buscar perfil:", error);
      // Opcional: redirecionar para login se necessário, ou permitir visualização anônima limitada
      // navigate(createPageUrl("UserAccount")); 
    }
  }, [navigate]);

  const loadCommunityData = useCallback(async () => {
    setIsLoading(true);
    try {
      // DEBUG: Adicionar log para verificar se esta função está sendo chamada
      console.log("Carregando dados da comunidade...");
      
      const [postsData, eventsData, rawGuidesData, usersSuggestionsData] = await Promise.all([
        Post.filter({ user_id: null }, "-created_date", 20).catch(() => []), // Usar catch para evitar falhas
        Event.filter({ status: "approved" }, "-start_date", 5).catch(() => []),
        LocalGuide.list("-views_count", 5).catch(() => []),
        User.list("-created_date", 5).catch(() => [])
      ]);

      // DEBUG: Adicionar log para verificar os dados recebidos
      console.log("Dados recebidos:", { 
        posts: postsData?.length || 0, 
        events: eventsData?.length || 0, 
        guides: rawGuidesData?.length || 0,
        users: usersSuggestionsData?.length || 0
      });
      
      setPosts(postsData || []);
      setUpcomingEvents(eventsData || []);
      
      // Enriquecer guias populares com dados do usuário
      if (rawGuidesData && rawGuidesData.length > 0) {
        // Para cada guia, preenchemos um objeto user com valores padrão
        // para garantir que sempre teremos algo para exibir
        const guidesWithUsers = rawGuidesData.map(guide => ({
          ...guide,
          user: {
            full_name: "Autor Desconhecido",
            avatar_url: null,
            id: guide.user_id
          }
        }));
        
        // Tenta buscar informações reais dos usuários
        try {
          // Otimização: buscar todos os usuários de uma vez
          const userIds = [...new Set(rawGuidesData
            .map(g => g.user_id)
            .filter(id => id))]; // Filtra IDs nulos/undefined
          
          if (userIds.length > 0) {
            // Versão usando filter (preferível)
            const usersData = await User.list();
            const usersById = usersData.reduce((acc, user) => {
              if (user && user.id) {
                acc[user.id] = user;
              }
              return acc;
            }, {});
            
            // Atualiza os guias com os dados reais dos usuários quando disponíveis
            guidesWithUsers.forEach(guide => {
              if (guide.user_id && usersById[guide.user_id]) {
                guide.user = {
                  ...guide.user,
                  ...usersById[guide.user_id]
                };
              }
            });
          }
        } catch (error) {
          console.error("Erro ao carregar dados de usuários para guias:", error);
          // Não falha completamente, continua com os valores padrão
        }
        
        setPopularGuides(guidesWithUsers);
      } else {
        setPopularGuides([]);
      }
      
      // Simular sugestões de usuários (filtrar o usuário atual se estiver logado)
      if (currentUser) {
        setSuggestedUsers((usersSuggestionsData || [])
          .filter(u => u && u.id && u.id !== currentUser.id));
      } else {
        setSuggestedUsers(usersSuggestionsData || []);
      }

      // Simular trending topics (no futuro, isso viria de uma análise real)
      setTrendingTopics([
        { name: "#PraiasDeSC", count: Math.floor(Math.random() * 50) + 10 },
        { name: "#TurismoSustentável", count: Math.floor(Math.random() * 30) + 5 },
        { name: "#GastronomiaLocal", count: Math.floor(Math.random() * 80) + 20 },
        { name: "#FlorianópolisTOP", count: Math.floor(Math.random() * 70) + 15 },
        { name: "#AventuraSC", count: Math.floor(Math.random() * 40) + 8 },
      ]);

    } catch (error) {
      console.error("Erro ao carregar dados da comunidade:", error);
      toast({
        title: "Erro ao carregar comunidade",
        description: "Não foi possível buscar os dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]); // Adicionado currentUser como dependência

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);
  
  useEffect(() => {
    // Carrega os dados da comunidade assim que o componente montar
    // e também quando o usuário logado mudar (para atualizar sugestões, por exemplo)
    loadCommunityData();
  }, [loadCommunityData, currentUser]);

  const handleCreatePost = async (postData) => {
    if (!currentUser) {
      toast({ title: "Atenção", description: "Você precisa estar logado para criar uma publicação.", variant: "destructive" });
      navigate(createPageUrl("UserAccount"));
      return;
    }
    try {
      const newPost = {
        user_id: currentUser.id,
        content: postData.content,
        image_urls: postData.images || [],
        location_name: postData.locationName || "",
        location_type: postData.locationType || "custom",
        post_type: postData.type || "experience",
        likes_count: 0,
        comments_count: 0
      };
      const createdPost = await Post.create(newPost);
      // Adicionar o post à lista localmente para atualização imediata da UI
      setPosts(prevPosts => [
        { ...createdPost, user: { full_name: currentUser.full_name, avatar_url: userProfile?.avatar_url } }, 
        ...prevPosts
      ]);
      toast({ title: "Sucesso", description: "Publicação criada!" });
      setIsCreatePostModalOpen(false); // Fecha o modal principal
      setQuickPostContent(""); // Limpa o quick post
      setQuickPostImages([]);  // Limpa as imagens do quick post
    } catch (error) {
      console.error("Erro ao criar post:", error);
      toast({ title: "Erro", description: "Não foi possível criar a publicação.", variant: "destructive" });
    }
  };

  const handleQuickPostImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (quickPostImages.length >= 1) { // Limitar a 1 imagem para o quick post
        toast({ title: "Limite de imagem", description: "Você pode adicionar apenas 1 imagem no post rápido.", variant: "warning" });
        return;
    }

    setIsQuickPostUploading(true);
    try {
        const reader = new FileReader();
        reader.onloadend = () => {
            //setQuickPostImages(prev => [...prev, reader.result]); // Preview local
        };
        reader.readAsDataURL(file);

        const { file_url } = await UploadFile({ file });
        setQuickPostImages(prev => [...prev, file_url]); 
    } catch (error) {
        toast({ title: "Erro de Upload", description: "Falha ao enviar imagem.", variant: "destructive" });
        // setQuickPostImages(prev => prev.slice(0, -1)); // Remove preview se falhar
    } finally {
        setIsQuickPostUploading(false);
    }
  };
  
  const removeQuickPostImage = (index) => {
    setQuickPostImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuickSubmit = () => {
    if (!quickPostContent.trim()) {
        toast({title: "Conteúdo vazio", description: "Escreva algo para publicar.", variant: "warning"});
        return;
    }
    handleCreatePost({
        content: quickPostContent,
        images: quickPostImages,
        type: "experience", // Tipo padrão para quick post
    });
  };
  
  const filteredPosts = posts.filter(post => 
    post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.location_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // URL da imagem de capa - pode vir de uma configuração ou ser fixa
  const coverImageUrl = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80"; // Exemplo de imagem de praia

  if (isLoading && !currentUser) { // Adicionado !currentUser para evitar piscar se já tiver user
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 min-h-screen">
      {/* Novo Cabeçalho da Comunidade */}
      <div 
        className="h-64 md:h-80 bg-cover bg-center relative shadow-lg"
        style={{ backgroundImage: `url(${coverImageUrl})` }}
      >
        <div className="absolute inset-0 bg-black/40"></div> {/* Overlay escuro */}
        <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-8 md:pb-12 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Comunidade Praias Catarinenses</h1>
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/10 backdrop-blur-sm p-3 rounded-lg">
            <div className="relative flex-grow w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-200" />
              <Input
                placeholder="Buscar na comunidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-md border-transparent focus:ring-2 focus:ring-blue-300 focus:border-transparent bg-white/20 text-white placeholder-gray-300"
              />
            </div>
            <Button 
              onClick={() => currentUser ? setIsCreatePostModalOpen(true) : navigate(createPageUrl("UserAccount"))}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-md w-full sm:w-auto whitespace-nowrap"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Novo Post
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal da Comunidade */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Coluna Esquerda - Menu e Perfil */}
          <div className="col-span-12 md:col-span-3 space-y-6">
            {currentUser && userProfile && (
              <Card className="shadow-md">
                <CardContent className="p-4 text-center">
                  <Avatar 
                    className="h-20 w-20 mx-auto mb-3 cursor-pointer border-2 border-blue-500"
                    onClick={() => navigate(createPageUrl(`UserProfile/${currentUser.id}`))}
                  >
                    <AvatarFallback className="text-2xl">{currentUser.full_name?.[0] || 'U'}</AvatarFallback>
                    {userProfile.avatar_url && (
                      <AvatarImage src={userProfile.avatar_url} alt={currentUser.full_name} />
                    )}
                  </Avatar>
                  <h3 
                    className="font-semibold text-lg cursor-pointer hover:text-blue-600"
                    onClick={() => navigate(createPageUrl(`UserProfile/${currentUser.id}`))}
                  >
                    {currentUser.full_name}
                  </h3>
                  <Button 
                    variant="link" 
                    className="text-sm text-blue-500 p-0 h-auto"
                    onClick={() => navigate(createPageUrl(`UserProfile/${currentUser.id}`))}
                  >
                    Ver meu perfil
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-md">
              <CardContent className="p-4">
                <nav className="space-y-1">
                  {[
                    { label: "Feed", icon: Rss, href: "#" },
                    { label: "Pessoas", icon: Users, href: "#" }, // Futuramente: createPageUrl("CommunityMembers")
                    { label: "Guias", icon: Map, href: createPageUrl("LocalGuides") },
                    { label: "Eventos", icon: CalendarDays, href: createPageUrl("Events") },
                    { label: "Ranking", icon: Award, href: createPageUrl("Gamification") },
                    { label: "Destaques", icon: Sparkles, href: "#" },
                  ].map(item => (
                    <Button
                      key={item.label}
                      variant="ghost"
                      className="w-full justify-start text-gray-700 hover:bg-slate-200 hover:text-blue-600"
                      onClick={() => item.href !== "#" && navigate(item.href)}
                      disabled={item.href === "#"} // Desabilitar links não implementados
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.label}
                    </Button>
                  ))}
                </nav>
              </CardContent>
            </Card>

            {/* Pessoas para seguir - Manteve-se o mesmo */}
            {suggestedUsers.length > 0 && (
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <Users2 className="mr-2 h-5 w-5 text-blue-500"/>
                    Pessoas para seguir
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {suggestedUsers.slice(0,3).map(user => (
                     <UserProfileCard key={user.id} profile={{ user: user, id: user.id, location: user.city || "SC" }} showFollowButton={true}/>
                  ))}
                   <Button variant="outline" className="w-full" onClick={() => toast({title: "Em breve!", description:"Página de membros da comunidade."})}>Ver mais</Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Coluna Central - Feed e Criação de Post Rápido */}
          <div className="col-span-12 md:col-span-6 space-y-6">
             {/* Card "O que você está pensando?" */}
            {currentUser && (
                <Card className="shadow-md">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <Avatar 
                                className="h-10 w-10 mt-1 cursor-pointer"
                                onClick={() => navigate(createPageUrl(`UserProfile/${currentUser.id}`))}
                            >
                                <AvatarFallback>{currentUser.full_name?.[0] || 'U'}</AvatarFallback>
                                {userProfile?.avatar_url && <AvatarImage src={userProfile.avatar_url} alt={currentUser.full_name}/>}
                            </Avatar>
                            <Textarea
                                placeholder={`No que você está pensando, ${currentUser.full_name ? currentUser.full_name.split(' ')[0] : 'Viajante'}?`}
                                value={quickPostContent}
                                onChange={(e) => setQuickPostContent(e.target.value)}
                                className="flex-grow resize-none border-gray-300 focus:ring-blue-500 focus:border-blue-500 min-h-[60px]"
                                rows={2}
                            />
                        </div>
                        
                        {quickPostImages.length > 0 && (
                            <div className="mt-3 grid grid-cols-3 gap-2">
                                {quickPostImages.map((imgSrc, index) => (
                                    <div key={index} className="relative h-20 rounded overflow-hidden">
                                        <img src={imgSrc} alt="preview" className="w-full h-full object-cover" />
                                        <Button 
                                            variant="destructive" 
                                            size="icon" 
                                            className="absolute top-1 right-1 h-5 w-5 p-0.5"
                                            onClick={() => removeQuickPostImage(index)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <Separator className="my-3" />
                        <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => document.getElementById('quick-post-image-upload').click()} disabled={isQuickPostUploading || quickPostImages.length >=1}>
                                    <ImageIcon className="mr-2 h-4 w-4 text-green-500" /> Foto
                                </Button>
                                <input id="quick-post-image-upload" type="file" accept="image/*" className="hidden" onChange={handleQuickPostImageUpload} />
                                
                                <Button variant="ghost" size="sm" onClick={() => toast({title:"Em breve", description:"Adicionar check-in ou tag de local."})}>
                                    <MapPinIcon className="mr-2 h-4 w-4 text-red-500" /> Local
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setIsCreatePostModalOpen(true)}>
                                    <Type className="mr-2 h-4 w-4 text-blue-500" /> Detalhes
                                </Button>
                            </div>
                            <Button 
                                onClick={handleQuickSubmit} 
                                disabled={!quickPostContent.trim() && quickPostImages.length === 0 || isQuickPostUploading}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {isQuickPostUploading ? "Enviando..." : "Publicar"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
            
            {/* Feed de Posts */}
            {isLoading ? (
              <div className="space-y-6">
                {[1,2,3].map(i => (
                    <Card key={i} className="shadow-md animate-pulse">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-10 w-10 rounded-full bg-gray-300"></div>
                                <div className="space-y-2">
                                    <div className="h-4 w-32 bg-gray-300 rounded"></div>
                                    <div className="h-3 w-24 bg-gray-300 rounded"></div>
                                </div>
                            </div>
                            <div className="h-5 w-full bg-gray-300 rounded mb-2"></div>
                            <div className="h-5 w-3/4 bg-gray-300 rounded mb-3"></div>
                            <div className="h-40 w-full bg-gray-300 rounded-lg"></div>
                        </CardContent>
                    </Card>
                ))}
              </div>
            ) : filteredPosts.length > 0 ? (
              filteredPosts.map(post => <PostCard key={post.id} post={post} />)
            ) : (
              <Card className="shadow-md">
                <CardContent className="p-6 text-center text-gray-500">
                  <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-2">Nenhuma publicação encontrada</h3>
                  <p>
                    {searchTerm 
                      ? "Tente um termo de busca diferente." 
                      : "Seja o primeiro a compartilhar algo na comunidade!"}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Coluna Direita - Eventos, Guias, Tendências */}
          <div className="col-span-12 md:col-span-3 space-y-6">
            {/* Próximos Eventos */}
            {upcomingEvents.length > 0 && (
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <CalendarDays className="mr-2 h-5 w-5 text-red-500"/>
                    Próximos Eventos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upcomingEvents.slice(0,2).map(event => <EventCard key={event.id} event={event} />)}
                  <Button variant="outline" className="w-full" onClick={() => navigate(createPageUrl("Events"))}>Ver todos</Button>
                </CardContent>
              </Card>
            )}

            {/* Guias Populares */}
            {popularGuides.length > 0 && (
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center">
                     <Map className="mr-2 h-5 w-5 text-green-500"/>
                    Guias Populares
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {popularGuides.slice(0,2).map(guide => <GuideCard key={guide.id} guide={guide} />)}
                  <Button variant="outline" className="w-full" onClick={() => navigate(createPageUrl("LocalGuides"))}>Ver todos</Button>
                </CardContent>
              </Card>
            )}
            
            {/* Tendências */}
            {trendingTopics.length > 0 && (
                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center">
                            <TrendingUp className="mr-2 h-5 w-5 text-purple-500" />
                            Tendências
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {trendingTopics.map(topic => (
                                <li key={topic.name} className="text-sm">
                                    <a href="#" className="font-medium text-blue-600 hover:underline">{topic.name}</a>
                                    <p className="text-xs text-gray-500">{topic.count} posts</p>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}
          </div>
        </div>
      </div>

      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        onSubmit={handleCreatePost}
        user={currentUser}
      />
    </div>
  );
};

export default CommunityPage;
