
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Building2, Waves, Store, Wrench, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function ReviewSection({ reviews, users, cities, beaches, businesses, providers }) {
  const getEntityDetails = (entityType, entityId) => {
    let name = "Entidade não encontrada";
    let type = entityType;
    let icon = null;
    
    switch (entityType) {
      case "city":
        const city = cities.find(c => c.id === entityId);
        if (city) {
          name = city.name;
          icon = <Building2 className="w-4 h-4 text-blue-600" />;
        }
        break;
      case "beach":
        const beach = beaches.find(b => b.id === entityId);
        if (beach) {
          name = beach.name;
          icon = <Waves className="w-4 h-4 text-cyan-600" />;
        }
        break;
      case "business":
        const business = businesses.find(b => b.id === entityId);
        if (business) {
          name = business.name;
          type = business.type;
          icon = <Store className="w-4 h-4 text-green-600" />;
        }
        break;
      case "serviceprovider":
        const provider = providers.find(p => p.id === entityId);
        if (provider) {
          name = provider.name;
          type = provider.service_type;
          icon = <Wrench className="w-4 h-4 text-orange-600" />;
        }
        break;
    }
    
    return { name, type, icon };
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.full_name : "Usuário";
  };

  const getUserInitial = (userId) => {
    const userName = getUserName(userId);
    return userName.charAt(0).toUpperCase();
  };

  const renderRating = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const getEntityTypeColor = (entityType) => {
    switch (entityType) {
      case "city":
        return "bg-blue-100 text-blue-800";
      case "beach":
        return "bg-cyan-100 text-cyan-800";
      case "business":
        return "bg-green-100 text-green-800";
      case "serviceprovider":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-6 md:py-8">
        <p className="text-gray-500 text-sm md:text-base">Nenhuma avaliação encontrada.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {reviews.map(review => {
        const entityDetails = getEntityDetails(review.entity_type, review.entity_id);
        
        return (
          <Card key={review.id} className="overflow-hidden hover:shadow-lg transition-all">
            <CardContent className="p-3 md:p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 md:h-10 md:w-10 border-2 border-white shadow-sm">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs md:text-sm">
                      {getUserInitial(review.user_id)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm md:text-base">{getUserName(review.user_id)}</div>
                    {renderRating(review.rating)}
                  </div>
                </div>
                
                <div className="flex items-center text-gray-500 text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  <time dateTime={review.created_date}>
                    {format(new Date(review.created_date), "dd/MM/yyyy")}
                  </time>
                </div>
              </div>
              
              <p className="text-gray-600 mb-3 text-xs md:text-sm">{review.comment}</p>
              
              {review.image_urls && review.image_urls.length > 0 && (
                <div className="flex gap-2 mb-3 overflow-x-auto py-1">
                  {review.image_urls.map((url, index) => (
                    <img 
                      key={index}
                      src={url} 
                      alt={`Imagem ${index + 1}`} 
                      className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-md flex-shrink-0"
                    />
                  ))}
                </div>
              )}
              
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getEntityTypeColor(review.entity_type)} flex items-center gap-1`}>
                  {entityDetails.icon}
                  <span>{entityDetails.name}</span>
                </div>
                
                {review.visit_date && (
                  <div className="text-xs text-gray-500 flex items-center">
                    <span>Visitou em {format(new Date(review.visit_date), "MMM/yyyy")}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
