import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Award, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function UserProfileCard({ profile, showFollowButton = false }) {
  const navigate = useNavigate();

  // Verificar se profile existe e extrair user ou usar defaults
  const user = profile?.user || {};
  const userName = user?.full_name || user?.username || "Usuário";
  const userInitial = userName[0] || "U";
  const avatarUrl = user?.avatar_url || "";
  const location = profile?.location || user?.location || "";
  const level = profile?.level || "";
  const isLocal = profile?.is_local || false;

  const handleProfileClick = (e) => {
    e.preventDefault();
    if (profile?.id) {
      navigate(createPageUrl(`UserProfile/${profile.id}`));
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 cursor-pointer" onClick={handleProfileClick}>
            <AvatarFallback>{userInitial}</AvatarFallback>
            {avatarUrl && <AvatarImage src={avatarUrl} alt={userName} />}
          </Avatar>
          
          <div className="flex-1 overflow-hidden">
            <h3 
              className="font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600"
              onClick={handleProfileClick}
            >
              {userName}
            </h3>
            
            {location && (
              <div className="flex items-center text-sm text-gray-500 mt-0.5">
                <span className="flex items-center truncate">
                  <MapPin className="h-3 w-3 mr-1" />
                  {location}
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-2 mt-1">
              {level && (
                <Badge className="bg-blue-100 text-blue-700 text-xs">
                  Nível {level}
                </Badge>
              )}
              
              {isLocal && (
                <Badge className="bg-green-100 text-green-700 text-xs">
                  Local
                </Badge>
              )}
            </div>
          </div>
          
          {showFollowButton ? (
            <Button 
              size="sm" 
              variant="outline"
              className="min-w-16 text-[#007BFF] border-[#007BFF] hover:bg-blue-50"
            >
              Seguir
            </Button>
          ) : (
            <Button 
              size="sm" 
              variant="ghost"
              className="p-0 w-8 h-8"
              onClick={handleProfileClick}
            >
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}