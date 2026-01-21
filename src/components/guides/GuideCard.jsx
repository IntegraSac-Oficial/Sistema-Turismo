import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Heart, BookOpen, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function GuideCard({ guide }) {
  const navigate = useNavigate();
  
  // Verificação explícita para garantir que guide existe
  if (!guide) {
    return null; // Não renderiza se o guide for indefinido
  }

  // Tratamento seguro para dados do usuário com valores padrão
  const user = guide.user || {};
  const userFullName = user.full_name || "Autor Desconhecido";
  const userInitial = userFullName ? userFullName[0].toUpperCase() : "A";
  const userAvatarUrl = user.avatar_url || null;

  const getCategoryColor = (category) => {
    if (!category) return "bg-gray-100 text-gray-800";
    
    const colors = {
      "gastronomia": "bg-orange-100 text-orange-800",
      "hospedagem": "bg-blue-100 text-blue-800",
      "passeios": "bg-green-100 text-green-800",
      "eventos": "bg-purple-100 text-purple-800",
      "cultura": "bg-pink-100 text-pink-800",
      "compras": "bg-yellow-100 text-yellow-800",
      "familia": "bg-teal-100 text-teal-800",
      "noturno": "bg-indigo-100 text-indigo-800",
      "geral": "bg-gray-100 text-gray-800"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };
  
  const getCategoryLabel = (category) => {
    if (!category) return "Categoria";
    
    const labels = {
      "gastronomia": "Gastronomia",
      "hospedagem": "Hospedagem",
      "passeios": "Passeios",
      "eventos": "Eventos",
      "cultura": "Cultura",
      "compras": "Compras",
      "familia": "Família",
      "noturno": "Vida Noturna",
      "geral": "Geral"
    };
    return labels[category] || category;
  };

  const handleCardClick = () => {
    if (!guide || !guide.id) return; // Evita navegação se não houver ID
    
    // Navega para a página de detalhes do guia.
    navigate(createPageUrl(`GuideDetail?id=${guide.id}`));
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={handleCardClick}>
      <div className="relative h-40">
        <img 
          src={guide.cover_image_url || "https://images.unsplash.com/photo-1529655683826-1ae92104975f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Y2l0eSUyMGNvbW11bml0eXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60"} 
          alt={guide.title || "Guia Local"} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute top-2 right-2">
          <Badge className={getCategoryColor(guide.category)}>
            {getCategoryLabel(guide.category)}
          </Badge>
        </div>
        <div className="absolute bottom-0 left-0 p-3 text-white">
          <h3 className="text-lg font-bold">{guide.title || "Sem título"}</h3>
        </div>
      </div>
      
      <CardContent className="p-4">
        <p className="text-sm text-gray-600 line-clamp-2">{guide.description || "Sem descrição disponível"}</p>
        
        <div className="flex items-center mt-3">
          <Avatar className="h-6 w-6 mr-2">
            <AvatarFallback>{userInitial}</AvatarFallback>
            {userAvatarUrl && (
              <AvatarImage src={userAvatarUrl} alt={userFullName} />
            )}
          </Avatar>
          <span className="text-sm">{userFullName}</span>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-500">
          <Heart className="h-4 w-4 mr-1 fill-red-500 text-red-500" />
          <span>{guide.likes_count || 0}</span>
        </div>
        
        <Button className="text-[#007BFF]" variant="ghost">
          Ler Guia
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}