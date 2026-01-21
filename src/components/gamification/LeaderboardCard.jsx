import React, { useState, useEffect } from "react";
import { Trophy, Medal, Users, ArrowUp, ArrowDown, RefreshCw, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle }  from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UserPoints } from "@/api/entities";
import { User } from "@/api/entities";

// Função para obter título do nível
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

export default function LeaderboardCard({ limit = 5, showFilters = true, currentUserId }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("all");
  const [showFullList, setShowFullList] = useState(false);
  const [searchText, setSearchText] = useState("");
  
  useEffect(() => {
    loadLeaderboard();
  }, [period]);
  
  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      // Obter todos os usuários com pontuação, ordenados por pontos
      const pointsData = await UserPoints.list("-total_points", 100);
      
      // Para cada entrada de pontos, obter os detalhes do usuário
      const leaderboardWithUsers = await Promise.all(
        pointsData.map(async (points, index) => {
          try {
            const user = await User.filter({ id: points.user_id });
            if (user && user.length > 0) {
              return {
                ...points,
                user: user[0],
                rank: index + 1
              };
            }
            return null;
          } catch (error) {
            console.error("Erro ao obter detalhes do usuário:", error);
            return null;
          }
        })
      );
      
      // Filtrar entradas nulas e ordenar por pontos
      const filteredLeaderboard = leaderboardWithUsers
        .filter(entry => entry !== null)
        .sort((a, b) => b.total_points - a.total_points);
      
      setLeaderboard(filteredLeaderboard);
      
      // Encontrar o rank do usuário atual
      if (currentUserId) {
        const userEntry = filteredLeaderboard.find(entry => entry.user_id === currentUserId);
        if (userEntry) {
          setUserRank(userEntry.rank);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Filtrar leaderboard por pesquisa
  const filteredLeaderboard = searchText 
    ? leaderboard.filter(entry => 
        entry.user.full_name.toLowerCase().includes(searchText.toLowerCase())
      )
    : leaderboard;
  
  // Limitar o número de entradas exibidas se não estiver expandido
  const displayedLeaderboard = showFullList 
    ? filteredLeaderboard 
    : filteredLeaderboard.slice(0, limit);
  
  // Renderizar posição
  const renderRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100">
          <Trophy className="w-4 h-4 text-amber-500" />
        </div>
      );
    } else if (rank === 2) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
          <Medal className="w-4 h-4 text-gray-500" />
        </div>
      );
    } else if (rank === 3) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-50">
          <Medal className="w-4 h-4 text-amber-700" />
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
          <span className="text-sm font-medium text-gray-700">{rank}</span>
        </div>
      );
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Ranking de Exploradores
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={loadLeaderboard}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
        
        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Buscar usuário..."
                className="pl-9"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Geral</SelectItem>
                <SelectItem value="month">Este mês</SelectItem>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="day">Hoje</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : displayedLeaderboard.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Users className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p>Nenhum usuário encontrado.</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {displayedLeaderboard.map((entry) => {
                const isCurrentUser = entry.user_id === currentUserId;
                
                return (
                  <div 
                    key={entry.id}
                    className={`flex items-center justify-between p-3 rounded-md transition-colors
                      ${isCurrentUser 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'bg-white border border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      {renderRankBadge(entry.rank)}
                      <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                        {entry.user.avatar_url ? (
                          <AvatarImage src={entry.user.avatar_url} alt={entry.user.full_name} />
                        ) : (
                          <AvatarFallback className="bg-blue-100 text-blue-800">
                            {entry.user.full_name?.[0] || '?'}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {entry.user.full_name || "Usuário"}
                          </p>
                          {isCurrentUser && (
                            <Badge className="bg-blue-100 text-blue-800 text-xs">Você</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          Nível {entry.level} • {getLevelTitle(entry.level)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Badge className={`flex items-center gap-1 ${entry.rank <= 3 ? 'bg-amber-500' : 'bg-[#007BFF]'}`}>
                        <Trophy className="w-3.5 h-3.5" />
                        <span>{entry.total_points} pts</span>
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {filteredLeaderboard.length > limit && (
              <Button 
                variant="ghost" 
                className="w-full mt-4 text-[#007BFF]"
                onClick={() => setShowFullList(!showFullList)}
              >
                {showFullList ? (
                  <>
                    <ArrowUp className="w-4 h-4 mr-2" />
                    Mostrar menos
                  </>
                ) : (
                  <>
                    <ArrowDown className="w-4 h-4 mr-2" />
                    Ver ranking completo
                  </>
                )}
              </Button>
            )}
            
            {currentUserId && userRank && userRank > limit && !showFullList && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                      <span className="text-sm font-medium text-blue-700">{userRank}</span>
                    </div>
                    <p className="font-medium">Sua posição no ranking</p>
                  </div>
                  <Badge className="bg-blue-500">
                    {leaderboard.find(entry => entry.user_id === currentUserId)?.total_points || 0} pts
                  </Badge>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}