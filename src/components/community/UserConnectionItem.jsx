import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, UserCheck, MapPin } from "lucide-react";

export default function UserConnectionItem({ 
  user, 
  profile,
  currentUser,
  isFollowing = false,
  onClick,
  onFollow
}) {
  if (!user) return null;
  
  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
      <div className="flex items-center gap-3" onClick={onClick}>
        <Avatar className="h-10 w-10">
          <AvatarImage src={profile?.avatar_url} />
          <AvatarFallback className="bg-blue-100 text-blue-600">
            {user.full_name[0]}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{user.full_name}</h3>
            {profile?.is_local && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-100">
                Local
              </Badge>
            )}
          </div>
          
          {profile?.location && (
            <div className="flex items-center text-gray-500 text-sm">
              <MapPin className="w-3 h-3 mr-1" />
              <span>{profile.location}</span>
            </div>
          )}
        </div>
      </div>
      
      {user.id !== currentUser?.id && (
        <Button 
          variant={isFollowing ? "outline" : "default"}
          size="sm"
          className={isFollowing ? "gap-1" : "gap-1 bg-blue-600 hover:bg-blue-700"}
          onClick={(e) => {
            e.stopPropagation();
            onFollow && onFollow(user.id);
          }}
        >
          {isFollowing ? (
            <>
              <UserCheck className="w-4 h-4" />
              Seguindo
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              Seguir
            </>
          )}
        </Button>
      )}
    </div>
  );
}