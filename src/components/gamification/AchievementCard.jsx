import React from "react";
import { Shield, CheckCircle2, Medal, Star, Award, Sparkles, Users, Compass, Crown, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/utils";

// Função auxiliar para obter o ícone correto baseado na categoria e configuração
const getAchievementIcon = (achievement) => {
  const { icon, category } = achievement;
  
  // Fallback para ícones padrão por categoria se não houver ícone específico
  if (!icon) {
    switch (category) {
      case "review":
        return <Star className="w-6 h-6" />;
      case "check_in":
        return <CheckCircle2 className="w-6 h-6" />;
      case "social":
        return <Users className="w-6 h-6" />;
      case "explore":
        return <Compass className="w-6 h-6" />;
      case "membership":
        return <Crown className="w-6 h-6" />;
      case "post":
        return <MessageSquare className="w-6 h-6" />;
      case "special":
        return <Award className="w-6 h-6" />;
      default:
        return <Shield className="w-6 h-6" />;
    }
  }
  
  // Usar o ícone da conquista, se especificado
  const IconComponent = icon;
  return <IconComponent className="w-6 h-6" />;
};

// Função para determinar a cor baseada no nível
const getLevelColor = (level) => {
  switch (level) {
    case 1:
      return "bg-gray-100 text-gray-800";
    case 2:
      return "bg-blue-100 text-blue-800";
    case 3:
      return "bg-green-100 text-green-800";
    case 4:
      return "bg-purple-100 text-purple-800";
    case 5:
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function AchievementCard({ achievement, earned = false, onSelect }) {
  const {
    title,
    description,
    icon_color = "#007BFF",
    points,
    level = 1,
    category,
    is_secret,
    is_rare,
    date_earned
  } = achievement;

  const levelClass = getLevelColor(level);
  
  // Se for uma conquista secreta não desbloqueada, mostrar versão bloqueada
  if (is_secret && !earned) {
    return (
      <Card 
        className={cn(
          "relative overflow-hidden border-dashed cursor-pointer transition-all hover:scale-[1.02]",
          "bg-gray-50 border-gray-300"
        )}
        onClick={() => onSelect && onSelect(achievement)}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <Shield className="w-20 h-20 text-gray-400" />
        </div>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded-md bg-gray-200 text-gray-600">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-600">Conquista Secreta</h3>
          </div>
          <Badge className="bg-gray-200 text-gray-700 hover:bg-gray-300">
            {points} pontos
          </Badge>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Conquiste para revelar esta realização misteriosa...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "relative overflow-hidden cursor-pointer transition-all hover:scale-[1.02]",
        earned ? "border-green-300" : "border-gray-200",
        earned ? "shadow-md" : ""
      )}
      onClick={() => onSelect && onSelect(achievement)}
    >
      {earned && (
        <div className="absolute top-0 right-0">
          <Badge className="rounded-none rounded-bl-md bg-green-500 text-white">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Conquistado
          </Badge>
        </div>
      )}
      
      {is_rare && (
        <div className="absolute top-0 left-0">
          <Badge className="rounded-none rounded-br-md bg-purple-500 text-white">
            <Sparkles className="w-3 h-3 mr-1" />
            Raro
          </Badge>
        </div>
      )}
      
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center space-x-2">
          <div 
            className="p-2 rounded-md" 
            style={{ backgroundColor: `${icon_color}20`, color: icon_color }}
          >
            {getAchievementIcon(achievement)}
          </div>
          <div>
            <h3 className="font-semibold">{title}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className={levelClass}>Nível {level}</Badge>
              <Badge variant="outline" className="text-gray-500 border-gray-300">
                {category === "review" && "Avaliações"}
                {category === "check_in" && "Check-ins"}
                {category === "social" && "Social"}
                {category === "explore" && "Exploração"}
                {category === "membership" && "Assinatura"}
                {category === "post" && "Publicações"}
                {category === "special" && "Especial"}
              </Badge>
            </div>
          </div>
        </div>
        <Badge className="bg-[#007BFF] hover:bg-blue-700">
          {points} pontos
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{description}</p>
        {earned && date_earned && (
          <p className="text-xs text-gray-500 mt-2">
            Conquistado em: {new Date(date_earned).toLocaleDateString('pt-BR')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}