import React from "react";
import { Trophy, TrendingUp, Zap, Crown, Award, Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Função para determinar o título do nível
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

// Função para determinar a cor do nível
const getLevelColor = (level) => {
  if (level <= 5) return { bg: 'bg-blue-500', text: 'text-blue-600' };
  if (level <= 15) return { bg: 'bg-green-500', text: 'text-green-600' };
  if (level <= 30) return { bg: 'bg-purple-500', text: 'text-purple-600' };
  if (level <= 50) return { bg: 'bg-amber-500', text: 'text-amber-600' };
  return { bg: 'bg-red-500', text: 'text-red-600' };
};

// Função para determinar o ícone do nível
const getLevelIcon = (level) => {
  if (level <= 5) return <Star className="w-5 h-5" />;
  if (level <= 15) return <Zap className="w-5 h-5" />;
  if (level <= 30) return <Award className="w-5 h-5" />;
  if (level <= 50) return <Crown className="w-5 h-5" />;
  return <Trophy className="w-5 h-5" />;
};

export default function UserLevelProgress({ userPoints }) {
  if (!userPoints) return null;
  
  const { 
    level, 
    total_points, 
    points_to_next_level,
    current_streak = 0,
    longest_streak = 0 
  } = userPoints;
  
  // Calcular o próximo nível
  const nextLevel = level + 1;
  
  // Calcular a pontuação necessária para o nível atual
  const currentLevelPoints = level * 100; // Simplificado, pode ser uma função mais complexa
  
  // Calcular a pontuação acumulada desde o último nível
  const pointsSinceLastLevel = total_points - currentLevelPoints;
  
  // Calcular a porcentagem de progresso para o próximo nível
  const progressPercent = Math.min(100, Math.round((pointsSinceLastLevel / points_to_next_level) * 100));
  
  // Obter título e cores do nível
  const levelTitle = getLevelTitle(level);
  const { bg: levelBgColor, text: levelTextColor } = getLevelColor(level);
  const levelIcon = getLevelIcon(level);

  return (
    <Card className="shadow-md overflow-hidden relative">
      <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-br from-blue-200 to-indigo-100 rounded-bl-full opacity-20 -z-10" />
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#007BFF]" />
            <span>Seu Progresso</span>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500" />
            <span>{total_points} pontos totais</span>
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${levelBgColor} bg-opacity-20 ${levelTextColor}`}>
              {levelIcon}
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-xl font-bold">{levelTitle}</h3>
                <span className="text-sm text-gray-500">Nível {level}</span>
              </div>
              <p className="text-sm text-gray-600">
                {points_to_next_level - pointsSinceLastLevel} pontos para o nível {nextLevel}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge className="bg-blue-100 text-blue-800 gap-1 flex items-center px-3 py-1">
              <Zap className="w-3 h-3" />
              <span>Sequência: {current_streak} dias</span>
            </Badge>
            
            <Badge className="bg-amber-100 text-amber-800 gap-1 flex items-center px-3 py-1">
              <Trophy className="w-3 h-3" />
              <span>Recorde: {longest_streak} dias</span>
            </Badge>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Progresso para o próximo nível</span>
            <span className="text-xs font-medium">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2 bg-gray-100" 
            indicatorClassName={levelBgColor} />
          
          <div className="flex justify-between pt-1">
            <span className="text-xs text-gray-500">Nível {level}</span>
            <span className="text-xs text-gray-500">Nível {nextLevel}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}