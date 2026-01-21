import React, { useEffect, useState } from "react";
import { Shield, X, Trophy, Sparkles, Medal } from "lucide-react";
import { Achievement } from "@/api/entities";
import { UserAchievement } from "@/api/entities";

const AchievementNotification = ({ userId }) => {
  const [achievements, setAchievements] = useState([]);
  const [visible, setVisible] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const checkForNewAchievements = async () => {
      try {
        // Buscar conquistas que ainda não foram vistas pelo usuário
        const userAchievements = await UserAchievement.filter({
          user_id: userId,
          is_seen: false
        });

        if (userAchievements && userAchievements.length > 0) {
          // Buscar detalhes das conquistas
          const achievementDetails = await Promise.all(
            userAchievements.map(async (ua) => {
              const achievementData = await Achievement.filter({
                id: ua.achievement_id
              });
              
              if (achievementData && achievementData.length > 0) {
                return {
                  ...achievementData[0],
                  user_achievement_id: ua.id,
                  date_earned: ua.date_earned
                };
              }
              return null;
            })
          );

          // Filtrar registros nulos
          const validAchievements = achievementDetails.filter(a => a !== null);
          
          if (validAchievements.length > 0) {
            setAchievements(validAchievements);
            setCurrentAchievement(validAchievements[0]);
            setVisible(true);
            setCurrentIndex(0);
          }
        }
      } catch (error) {
        console.error("Erro ao verificar novas conquistas:", error);
      }
    };

    checkForNewAchievements();
    
    // Verificar a cada 5 minutos
    const interval = setInterval(checkForNewAchievements, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [userId]);

  const handleClose = async () => {
    if (currentAchievement) {
      try {
        // Marcar conquista como vista
        await UserAchievement.update(currentAchievement.user_achievement_id, {
          is_seen: true
        });
        
        // Verificar se há mais conquistas para mostrar
        if (currentIndex < achievements.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setCurrentAchievement(achievements[currentIndex + 1]);
        } else {
          setVisible(false);
          setTimeout(() => {
            setAchievements([]);
            setCurrentAchievement(null);
            setCurrentIndex(0);
          }, 300);
        }
      } catch (error) {
        console.error("Erro ao marcar conquista como vista:", error);
        setVisible(false);
      }
    }
  };

  if (!visible || !currentAchievement) return null;

  return (
    <div className="fixed top-24 right-4 z-50 animate-slide-in-right">
      <div className="p-4 bg-white rounded-lg shadow-xl border-2 border-amber-300 max-w-sm">
        <div className="absolute -top-5 -left-5 rounded-full p-2 bg-amber-500 shadow-md">
          <Trophy className="w-6 h-6 text-white" />
        </div>
        
        <button 
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="mt-2 text-center">
          <h3 className="font-bold text-lg text-amber-700 mb-1 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Nova Conquista!
            <Sparkles className="w-5 h-5 text-amber-500" />
          </h3>
          
          <div className="flex justify-center my-3">
            <div 
              className="p-4 rounded-full" 
              style={{ 
                backgroundColor: `${currentAchievement.icon_color || '#FFB74D'}20`, 
                color: currentAchievement.icon_color || '#FFB74D' 
              }}
            >
              {currentAchievement.icon ? (
                <div className="w-12 h-12">
                  <Medal className="w-12 h-12" />
                </div>
              ) : (
                <Shield className="w-12 h-12" />
              )}
            </div>
          </div>
          
          <h4 className="font-semibold text-gray-800 text-lg">
            {currentAchievement.title}
          </h4>
          
          <p className="text-gray-600 text-sm mt-1 mb-3">
            {currentAchievement.description}
          </p>
          
          <div className="flex items-center justify-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-amber-600">
              +{currentAchievement.points} pontos
            </span>
          </div>
          
          <button
            onClick={handleClose}
            className="mt-3 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors w-full"
          >
            Incrível!
          </button>
        </div>
      </div>
    </div>
  );
};

export default AchievementNotification;