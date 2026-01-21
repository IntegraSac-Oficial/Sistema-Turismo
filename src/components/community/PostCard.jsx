import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  MapPin, 
  MoreHorizontal 
} from "lucide-react";

export default function PostCard({ post }) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const navigate = useNavigate();

  const handleLike = () => {
    if (liked) {
      setLikesCount(likesCount - 1);
    } else {
      setLikesCount(likesCount + 1);
    }
    setLiked(!liked);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    if (diffDays > 0) {
      return diffDays === 1 ? "1 dia atrás" : `${diffDays} dias atrás`;
    } else if (diffHours > 0) {
      return diffHours === 1 ? "1 hora atrás" : `${diffHours} horas atrás`;
    } else if (diffMinutes > 0) {
      return diffMinutes === 1 ? "1 minuto atrás" : `${diffMinutes} minutos atrás`;
    } else {
      return "Agora mesmo";
    }
  };

  const handleUserClick = () => {
    // Navegue para o perfil do usuário usando o ID do usuário
    navigate(createPageUrl(`UserProfile/${post.user_id}`));
  };

  const getPostTypeBadge = () => {
    const types = {
      experience: { label: "Experiência", color: "bg-blue-100 text-blue-800" },
      tip: { label: "Dica", color: "bg-green-100 text-green-800" },
      question: { label: "Pergunta", color: "bg-amber-100 text-amber-800" },
      event: { label: "Evento", color: "bg-purple-100 text-purple-800" }
    };
    
    const postType = types[post.post_type] || types.experience;
    
    return (
      <Badge className={`${postType.color}`}>
        {postType.label}
      </Badge>
    );
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <Avatar 
              className="h-10 w-10 cursor-pointer" 
              onClick={handleUserClick}
            >
              <AvatarFallback>{post.user?.full_name?.[0] || 'U'}</AvatarFallback>
              <AvatarImage src={post.user?.avatar_url} alt={post.user?.full_name} />
            </Avatar>
            <div>
              <p 
                className="font-medium cursor-pointer hover:text-blue-600" 
                onClick={handleUserClick}
              >
                {post.user?.full_name || "Usuário"}
              </p>
              <div className="flex items-center text-xs text-gray-500">
                <span>{formatDate(post.created_date)}</span>
                {post.location_name && (
                  <>
                    <span className="mx-1">•</span>
                    <MapPin className="h-3 w-3 mr-0.5" />
                    <span>{post.location_name}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getPostTypeBadge()}
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-5 w-5 text-gray-500" />
            </Button>
          </div>
        </div>
        
        <div className="mb-3">
          <p className="text-gray-800 whitespace-pre-line">{post.content}</p>
        </div>
        
        {post.image_urls && post.image_urls.length > 0 && (
          <div className="mb-3 rounded-lg overflow-hidden">
            <img 
              src={post.image_urls[0]} 
              alt="Post" 
              className="w-full h-auto max-h-96 object-cover"
            />
          </div>
        )}
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{likesCount > 0 ? `${likesCount} curtidas` : ''}</span>
          <span>{post.comments_count > 0 ? `${post.comments_count} comentários` : ''}</span>
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-2 border-t flex justify-around">
        <Button 
          variant="ghost" 
          size="sm" 
          className={`flex items-center gap-1 ${liked ? 'text-red-500' : 'text-gray-500'}`}
          onClick={handleLike}
        >
          <Heart className={`h-5 w-5 ${liked ? 'fill-red-500' : ''}`} />
          <span>Curtir</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-1 text-gray-500"
        >
          <MessageSquare className="h-5 w-5" />
          <span>Comentar</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-1 text-gray-500"
        >
          <Share2 className="h-5 w-5" />
          <span>Compartilhar</span>
        </Button>
      </CardFooter>
    </Card>
  );
}