import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, MessageSquare } from "lucide-react";
import { format, formatDistance } from "date-fns";
import { ptBR } from "date-fns/locale";

// Simplified version without map functionality
export default function UserMapActivity({ posts, users, places }) {
  // Simplified component to just show recent check-ins without map integration
  if (!posts || posts.length === 0) {
    return (
      <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
        <CardContent className="p-4 text-center py-8">
          <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">Nenhuma atividade recente</p>
        </CardContent>
      </Card>
    );
  }
  
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistance(date, new Date(), { 
        addSuffix: true,
        locale: ptBR
      });
    } catch (error) {
      return "recentemente";
    }
  };
  
  const getLocationName = (post) => {
    if (!post.location_type || !post.location_id) {
      return post.location_name || "Algum lugar";
    }
    
    const { cities, beaches, businesses, providers } = places;
    
    switch (post.location_type) {
      case "city":
        const city = cities.find(c => c.id === post.location_id);
        return city ? city.name : "Cidade";
      case "beach":
        const beach = beaches.find(b => b.id === post.location_id);
        return beach ? beach.name : "Praia";
      case "business":
        const business = businesses.find(b => b.id === post.location_id);
        return business ? business.name : "Comércio";
      case "serviceprovider":
        const provider = providers.find(p => p.id === post.location_id);
        return provider ? provider.name : "Prestador";
      default:
        return post.location_name || "Algum lugar";
    }
  };

  const getUser = (userId) => {
    return users.find(u => u.id === userId) || { full_name: "Usuário" };
  };
  
  return (
    <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Atividade Recente</h3>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 font-normal">
            <Clock className="w-3 h-3 mr-1" /> Tempo Real
          </Badge>
        </div>
        
        <div className="space-y-4">
          {posts.slice(0, 5).map((post, index) => {
            const user = getUser(post.user_id);
            const locationName = getLocationName(post);
            
            return (
              <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{user.full_name[0]}</AvatarFallback>
                    <AvatarImage src="" />
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-1 text-sm">
                      <span className="font-medium text-gray-900">{user.full_name}</span>
                      <span className="text-gray-500">fez check-in em</span>
                      <span className="text-blue-600 font-medium">{locationName}</span>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{formatDate(post.created_date)}</span>
                      
                      <span className="mx-2">•</span>
                      
                      <MapPin className="w-3 h-3 mr-1" />
                      <span>{locationName}</span>
                    </div>
                    
                    {post.content && (
                      <p className="text-gray-600 text-sm mt-2">{post.content}</p>
                    )}
                    
                    {post.image_urls && post.image_urls.length > 0 && (
                      <div className="mt-2 rounded-md overflow-hidden">
                        <img 
                          src={post.image_urls[0]} 
                          alt="Check-in" 
                          className="w-full h-40 object-cover"
                          onError={(e) => e.target.src = "https://via.placeholder.com/400x200?text=Imagem+não+disponível"}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}