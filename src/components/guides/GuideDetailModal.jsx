import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  X, MapPin, Bookmark, BookmarkCheck, ThumbsUp, 
  Eye, ShieldCheck, Clock, DollarSign, Calendar,
  Calendar as CalendarIcon, Phone, ExternalLink, Share2,
  User, ChevronRight, ChevronLeft
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function GuideDetailModal({
  guide,
  user,
  currentUser,
  isSaved,
  locationName,
  onClose,
  onSave,
  onLike,
  getCategoryIcon,
  getCategoryColor,
  getCategoryLabel
}) {
  const [activeImageIndex, setActiveImageIndex] = React.useState(0);
  const [activeTab, setActiveTab] = React.useState("dicas");
  
  const allImages = [
    guide.cover_image_url,
    ...guide.tips
      .filter(tip => tip.image_url)
      .map(tip => tip.image_url)
  ].filter(Boolean);
  
  const handleNext = () => {
    setActiveImageIndex((prev) => (prev + 1) % allImages.length);
  };
  
  const handlePrev = () => {
    setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };
  
  // Formatação de dados
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      return "Data indisponível";
    }
  };
  
  const getDifficultyLabel = (level) => {
    const labels = {
      facil: "Fácil",
      medio: "Médio",
      dificil: "Difícil"
    };
    return labels[level] || level;
  };
  
  const getBudgetLabel = (range) => {
    const labels = {
      economico: "Econômico",
      moderado: "Moderado",
      luxo: "Luxo"
    };
    return labels[range] || range;
  };
  
  return (
    <Dialog open={true} onOpenChange={onClose} size="xlarge">
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        <div className="relative">
          {/* Header/Banner */}
          <div className="h-64 relative">
            {allImages.length > 0 ? (
              <>
                <img 
                  src={allImages[activeImageIndex] || `https://source.unsplash.com/random/?travel,${guide.category}`} 
                  alt={guide.title}
                  className="w-full h-full object-cover"
                />
                
                {allImages.length > 1 && (
                  <>
                    <button
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 rounded-full p-2 text-white hover:bg-black/70 transition-colors"
                      onClick={handlePrev}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 rounded-full p-2 text-white hover:bg-black/70 transition-colors"
                      onClick={handleNext}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}
                
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1">
                  {allImages.map((_, index) => (
                    <div 
                      key={index} 
                      className={`h-2 w-2 rounded-full ${
                        index === activeImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                      onClick={() => setActiveImageIndex(index)}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <h1 className="text-white font-bold text-2xl">{guide.title}</h1>
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-4 top-4 text-white hover:bg-black/20" 
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
            
            <div className="absolute left-6 bottom-6 right-6">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`${getCategoryColor(guide.category)}`}>
                  <div className="flex items-center gap-1">
                    {getCategoryIcon(guide.category)}
                    <span>{getCategoryLabel(guide.category)}</span>
                  </div>
                </Badge>
                
                {guide.is_verified && (
                  <Badge className="bg-blue-100 text-blue-800">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Verificado
                  </Badge>
                )}
              </div>
              
              <h1 className="text-white text-2xl font-bold">{guide.title}</h1>
              
              <div className="flex items-center text-white/90 text-sm mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{locationName}</span>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Main Content - 2/3 width */}
              <div className="flex-1">
                <Tabs defaultValue="dicas" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="dicas">Dicas</TabsTrigger>
                    <TabsTrigger value="sobre">Sobre</TabsTrigger>
                    <TabsTrigger value="info">Informações</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="dicas" className="space-y-6">
                    {guide.tips.length > 0 ? (
                      guide.tips.map((tip, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <h3 className="font-bold text-lg mb-2">{tip.title || `Dica ${index + 1}`}</h3>
                          <p className="text-gray-700 mb-3 whitespace-pre-line">{tip.content}</p>
                          
                          {tip.image_url && (
                            <div className="mt-3">
                              <img 
                                src={tip.image_url} 
                                alt={tip.title} 
                                className="rounded-lg w-full max-h-64 object-cover"
                              />
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <p>Nenhuma dica específica disponível neste guia.</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="sobre">
                    <div className="prose max-w-none">
                      <h2 className="text-xl font-bold mb-4">Sobre este guia</h2>
                      <p className="whitespace-pre-line">{guide.description}</p>
                      
                      {guide.tags && guide.tags.length > 0 && (
                        <div className="mt-6">
                          <h3 className="text-lg font-semibold mb-2">Tags</h3>
                          <div className="flex flex-wrap gap-2">
                            {guide.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="bg-gray-100">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="info">
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold mb-4">Informações Úteis</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {guide.difficulty_level && (
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 p-2 rounded-full bg-purple-100">
                              <ChevronRight className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium">Nível de Dificuldade</p>
                              <p className="text-gray-600">{getDifficultyLabel(guide.difficulty_level)}</p>
                            </div>
                          </div>
                        )}
                        
                        {guide.budget_range && (
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 p-2 rounded-full bg-green-100">
                              <DollarSign className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">Faixa de Orçamento</p>
                              <p className="text-gray-600">{getBudgetLabel(guide.budget_range)}</p>
                            </div>
                          </div>
                        )}
                        
                        {guide.best_season && (
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 p-2 rounded-full bg-amber-100">
                              <CalendarIcon className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                              <p className="font-medium">Melhor Época</p>
                              <p className="text-gray-600">{guide.best_season}</p>
                            </div>
                          </div>
                        )}
                        
                        {guide.duration && (
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 p-2 rounded-full bg-blue-100">
                              <Clock className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">Duração Recomendada</p>
                              <p className="text-gray-600">{guide.duration}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {guide.contact_info && (
                        <div className="mt-4 p-4 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Phone className="h-5 w-5 text-gray-500" />
                            <h3 className="font-semibold">Informações de Contato</h3>
                          </div>
                          <p className="text-gray-700">{guide.contact_info}</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              
              {/* Sidebar - 1/3 width */}
              <div className="w-full md:w-64 space-y-6">
                {/* Sobre o autor */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Autor</h3>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user?.profile?.avatar_url} />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {user?.full_name?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user?.full_name || "Usuário"}</p>
                      {user?.profile?.is_local && (
                        <Badge variant="outline" className="mt-1 bg-blue-50 text-blue-700 border-blue-200">
                          Morador Local
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <div className="text-sm text-gray-600">
                    <p>Publicado em {formatDate(guide.created_date)}</p>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Estatísticas</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Visualizações</span>
                      <span className="font-medium">{guide.views_count || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Curtidas</span>
                      <span className="font-medium">{guide.likes_count || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Salvos</span>
                      <span className="font-medium">{guide.saves_count || 0}</span>
                    </div>
                  </div>
                </div>
                
                {/* Ações */}
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="outline" 
                    className={isSaved ? "bg-yellow-50 text-yellow-600 border-yellow-200" : ""}
                    onClick={onSave}
                  >
                    {isSaved ? (
                      <>
                        <BookmarkCheck className="h-5 w-5 mr-2" />
                        Salvo
                      </>
                    ) : (
                      <>
                        <Bookmark className="h-5 w-5 mr-2" />
                        Salvar
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={onLike}
                  >
                    <ThumbsUp className="h-5 w-5 mr-2" />
                    Curtir
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert("Link copiado para a área de transferência!");
                    }}
                  >
                    <Share2 className="h-5 w-5 mr-2" />
                    Compartilhar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}