import React, { useState, useEffect } from "react";
import { 
  Trophy, Medal, Star, Sparkles, ChevronDown, GalleryThumbnails,
  BarChart4, Filter, BookOpen, Palette, Activity, Maximize2, 
  CheckCircle2, Lock, LayoutList, Zap, BellRing
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import UserLevelProgress from "@/components/gamification/UserLevelProgress";
import PointsHistory from "@/components/gamification/PointsHistory";
import AchievementCard from "@/components/gamification/AchievementCard";
import LeaderboardCard from "@/components/gamification/LeaderboardCard";
import { User } from "@/api/entities";
import { UserPoints } from "@/api/entities";
import { Achievement } from "@/api/entities";
import { UserAchievement } from "@/api/entities";

// Função utilitária para obter o título do nível
const getLevelTitle = (level) => {
  if (level <= 5) return "Iniciante";
  if (level <= 10) return "Explorador";
  if (level <= 15) return "Aventureiro";
  if (level <= 20) return "Mochileiro";
  if (level <= 25) return "Viajante";
  if (level <= 30) return "Especialista";
  if (level <= 40) return "Guia Turístico";
  if (level <= 50) return "Embaixador";
  return "Lenda do Turismo";
};

export default function Gamification() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userPoints, setUserPoints] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [showAchievementDetails, setShowAchievementDetails] = useState(false);
  const [achievementFilter, setAchievementFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      try {
        // Carregar dados do usuário atual
        const userData = await User.me();
        setCurrentUser(userData);
        
        // Carregar pontos do usuário
        const userPointsData = await UserPoints.filter({ user_id: userData.id });
        if (userPointsData && userPointsData.length > 0) {
          setUserPoints(userPointsData[0]);
        }
        
        // Carregar todas as conquistas
        const achievementsData = await Achievement.list();
        setAchievements(achievementsData);
        
        // Carregar conquistas do usuário
        const userAchievementsData = await UserAchievement.filter({ user_id: userData.id });
        setUserAchievements(userAchievementsData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, []);
  
  const handleSelectAchievement = (achievement) => {
    setSelectedAchievement(achievement);
    setShowAchievementDetails(true);
  };
  
  const getUserAchievementsCount = () => {
    return userAchievements.length;
  };
  
  const getAchievementsProgress = () => {
    return Math.round((userAchievements.length / achievements.length) * 100);
  };
  
  // Verificar se o usuário possui uma conquista específica
  const hasAchievement = (achievementId) => {
    return userAchievements.some(ua => ua.achievement_id === achievementId);
  };
  
  // Filtrar conquistas por categoria
  const filteredAchievements = achievements.filter(achievement => {
    if (achievementFilter === "all") return true;
    if (achievementFilter === "earned") {
      return hasAchievement(achievement.id);
    }
    if (achievementFilter === "locked") {
      return !hasAchievement(achievement.id) && !achievement.is_secret;
    }
    return achievement.category === achievementFilter;
  });
  
  // Organizar conquistas: primeiro as conquistadas, depois as não secretas, por fim as secretas
  const organizedAchievements = [...filteredAchievements].sort((a, b) => {
    const aEarned = hasAchievement(a.id);
    const bEarned = hasAchievement(b.id);
    
    if (aEarned && !bEarned) return -1;
    if (!aEarned && bEarned) return 1;
    
    if (!aEarned) {
      if (a.is_secret && !b.is_secret) return 1;
      if (!a.is_secret && b.is_secret) return -1;
    }
    
    return a.title.localeCompare(b.title);
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Seu Progresso Turístico</h1>
        <p className="text-gray-600 mt-2">
          Acompanhe suas conquistas, pontos e posição no ranking dos viajantes pelo litoral catarinense
        </p>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Carregando seu progresso...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2 shadow-md overflow-hidden border-[#007BFF]/20">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      {currentUser?.full_name || "Viajante"}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {userPoints 
                        ? `Nível ${userPoints.level} • ${userPoints.total_points} pontos totais`
                        : "Comece a explorar para ganhar pontos!"}
                    </CardDescription>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <div className="flex items-center mb-1">
                      <Trophy className="w-5 h-5 text-amber-500 mr-1" />
                      <span className="font-bold text-amber-700">{getUserAchievementsCount()}</span>
                      <span className="text-gray-600 text-sm ml-1">/{achievements.length} conquistas</span>
                    </div>
                    <Progress 
                      value={getAchievementsProgress()} 
                      className="w-32 h-2" 
                      indicatorClassName="bg-amber-500"
                    />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-6">
                <UserLevelProgress userPoints={userPoints} />
                  
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Medal className="w-5 h-5 text-amber-500" />
                      Últimas Conquistas
                    </h3>
                    <Button
                      variant="ghost"
                      className="text-[#007BFF]"
                      onClick={() => document.getElementById('achievements-tab').click()}
                    >
                      Ver todas
                    </Button>
                  </div>
                  
                  {userAchievements.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                      <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-800 mb-2">Nenhuma conquista ainda</h3>
                      <p className="text-gray-600">
                        Comece a explorar praias, fazer check-ins, avaliar locais e interagir 
                        com outros viajantes para desbloquear conquistas!
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userAchievements
                        .slice(0, 4)
                        .map(ua => {
                          const achievement = achievements.find(a => a.id === ua.achievement_id);
                          if (!achievement) return null;
                          
                          return (
                            <AchievementCard 
                              key={ua.id}
                              achievement={{
                                ...achievement,
                                date_earned: ua.date_earned
                              }}
                              earned={true}
                              onSelect={handleSelectAchievement}
                            />
                          );
                        })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <LeaderboardCard 
              limit={5} 
              showFilters={false} 
              currentUserId={currentUser?.id} 
            />
          </div>
          
          <Tabs defaultValue="achievements" className="w-full">
            <TabsList className="mb-6 bg-gray-100 p-1 w-full sm:w-auto">
              <TabsTrigger 
                value="achievements" 
                id="achievements-tab"
                className="data-[state=active]:bg-[#007BFF] data-[state=active]:text-white"
              >
                <Medal className="w-4 h-4 mr-2" />
                Conquistas
              </TabsTrigger>
              <TabsTrigger 
                value="points" 
                className="data-[state=active]:bg-[#007BFF] data-[state=active]:text-white"
              >
                <Star className="w-4 h-4 mr-2" />
                Histórico de Pontos
              </TabsTrigger>
              <TabsTrigger 
                value="leaderboard" 
                className="data-[state=active]:bg-[#007BFF] data-[state=active]:text-white"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Ranking Completo
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="achievements">
              <Card className="border-t-0 rounded-t-none">
                <CardHeader className="pb-2">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                      <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        <GalleryThumbnails className="w-5 h-5 text-[#007BFF]" />
                        Suas Conquistas
                      </CardTitle>
                      <CardDescription>
                        Desbloqueie conquistas para aumentar seu nível e destacar-se no ranking
                      </CardDescription>
                    </div>
                    
                    <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2">
                      <Button 
                        variant={achievementFilter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAchievementFilter("all")}
                        className={achievementFilter === "all" ? "bg-[#007BFF]" : ""}
                      >
                        <LayoutList className="w-4 h-4 mr-2" />
                        Todas
                      </Button>
                      <Button 
                        variant={achievementFilter === "earned" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAchievementFilter("earned")}
                        className={achievementFilter === "earned" ? "bg-green-600" : ""}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Conquistadas
                      </Button>
                      <Button 
                        variant={achievementFilter === "locked" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAchievementFilter("locked")}
                        className={achievementFilter === "locked" ? "bg-gray-600" : ""}
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Disponíveis
                      </Button>
                      <Separator orientation="vertical" className="h-8" />
                      <Button 
                        variant={achievementFilter === "explore" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAchievementFilter("explore")}
                        className={achievementFilter === "explore" ? "bg-blue-600" : ""}
                      >
                        <Maximize2 className="w-4 h-4 mr-2" />
                        Exploração
                      </Button>
                      <Button 
                        variant={achievementFilter === "social" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAchievementFilter("social")}
                        className={achievementFilter === "social" ? "bg-purple-600" : ""}
                      >
                        <Activity className="w-4 h-4 mr-2" />
                        Social
                      </Button>
                      <Button 
                        variant={achievementFilter === "special" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAchievementFilter("special")}
                        className={achievementFilter === "special" ? "bg-amber-600" : ""}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Especial
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-6">
                  {organizedAchievements.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Filter className="w-16 h-16 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-800 mb-2">Nenhuma conquista encontrada</h3>
                      <p className="text-gray-600 max-w-md">
                        Tente outro filtro ou continue explorando para desbloquear novas conquistas.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {organizedAchievements.map(achievement => {
                        const isEarned = hasAchievement(achievement.id);
                        const userAchievement = userAchievements.find(
                          ua => ua.achievement_id === achievement.id
                        );
                        
                        return (
                          <AchievementCard 
                            key={achievement.id}
                            achievement={{
                              ...achievement,
                              date_earned: userAchievement?.date_earned
                            }}
                            earned={isEarned}
                            onSelect={handleSelectAchievement}
                          />
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="points">
              <PointsHistory userId={currentUser?.id} />
            </TabsContent>
            
            <TabsContent value="leaderboard">
              <LeaderboardCard 
                limit={20} 
                showFilters={true} 
                currentUserId={currentUser?.id} 
              />
            </TabsContent>
          </Tabs>
          
          <Dialog open={showAchievementDetails} onOpenChange={setShowAchievementDetails}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Medal className="w-5 h-5 text-amber-500" />
                  Detalhes da Conquista
                </DialogTitle>
                <DialogDescription>
                  Informações detalhadas sobre esta conquista e como obtê-la
                </DialogDescription>
              </DialogHeader>
              
              {selectedAchievement && (
                <div className="pt-4">
                  <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                    <div 
                      className="p-6 rounded-full"
                      style={{ 
                        backgroundColor: `${selectedAchievement.icon_color || '#007BFF'}20`, 
                        color: selectedAchievement.icon_color || '#007BFF' 
                      }}
                    >
                      {selectedAchievement.icon ? (
                        <selectedAchievement.icon className="w-12 h-12" />
                      ) : (
                        <Medal className="w-12 h-12" />
                      )}
                    </div>
                    
                    <div className="text-center sm:text-left">
                      <h3 className="text-xl font-bold">{selectedAchievement.title}</h3>
                      
                      <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                        <Badge className="bg-[#007BFF]">
                          {selectedAchievement.points} pontos
                        </Badge>
                        
                        {hasAchievement(selectedAchievement.id) ? (
                          <Badge className="bg-green-500 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Conquistado
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-500 flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Não conquistado
                          </Badge>
                        )}
                        
                        {selectedAchievement.is_rare && (
                          <Badge className="bg-purple-500 flex items-center gap-1">
                            <BellRing className="w-3 h-3" />
                            Raro
                          </Badge>
                        )}
                        
                        <Badge className="bg-blue-100 text-blue-800">
                          Nível {selectedAchievement.level}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 mb-1">DESCRIÇÃO</h4>
                      <p className="text-gray-900">{selectedAchievement.description}</p>
                    </div>
                    
                    {selectedAchievement.required_count && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 mb-1">REQUISITO</h4>
                        <p className="text-gray-900">
                          Complete {selectedAchievement.required_count} {selectedAchievement.category === 'review' 
                            ? 'avaliações' 
                            : selectedAchievement.category === 'check_in' 
                              ? 'check-ins' 
                              : selectedAchievement.category === 'post' 
                                ? 'publicações' 
                                : 'ações'}
                        </p>
                      </div>
                    )}
                    
                    {hasAchievement(selectedAchievement.id) && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 mb-1">DATA DE CONQUISTA</h4>
                        <p className="text-gray-900">
                          {new Date(userAchievements.find(
                            ua => ua.achievement_id === selectedAchievement.id
                          )?.date_earned).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 mb-1">CATEGORIA</h4>
                      <div className="flex items-center">
                        {selectedAchievement.category === 'review' && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Star className="w-3 h-3 mr-1" />
                            Avaliações
                          </Badge>
                        )}
                        {selectedAchievement.category === 'check_in' && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Check-ins
                          </Badge>
                        )}
                        {selectedAchievement.category === 'social' && (
                          <Badge className="bg-purple-100 text-purple-800">
                            <Activity className="w-3 h-3 mr-1" />
                            Social
                          </Badge>
                        )}
                        {selectedAchievement.category === 'explore' && (
                          <Badge className="bg-blue-100 text-blue-800">
                            <Maximize2 className="w-3 h-3 mr-1" />
                            Exploração
                          </Badge>
                        )}
                        {selectedAchievement.category === 'membership' && (
                          <Badge className="bg-amber-100 text-amber-800">
                            <Zap className="w-3 h-3 mr-1" />
                            Assinatura
                          </Badge>
                        )}
                        {selectedAchievement.category === 'post' && (
                          <Badge className="bg-indigo-100 text-indigo-800">
                            <Palette className="w-3 h-3 mr-1" />
                            Publicações
                          </Badge>
                        )}
                        {selectedAchievement.category === 'special' && (
                          <Badge className="bg-red-100 text-red-800">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Especial
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}