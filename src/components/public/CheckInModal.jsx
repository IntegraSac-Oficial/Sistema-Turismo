import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  X, MapPin, Camera, ImageIcon, Flag, Star, 
  Check, ChevronUp, ChevronDown, Building2, Waves, 
  Store, Wrench, ThumbsUp, Share2, CheckCheck,
  Upload
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Post, UserProfile } from "@/api/entities";
import { UploadFile } from "@/api/integrations";

export default function CheckInModal({ location, user, onClose, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkinContent, setCheckinContent] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [rating, setRating] = useState(5);
  const [showRating, setShowRating] = useState(true);
  const [locationImage, setLocationImage] = useState(location?.image_url || null);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
    
    // Gerar imagem padrão se não houver
    if (!locationImage) {
      generateDefaultImage();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      const profiles = await UserProfile.filter({ user_id: user.id });
      if (profiles.length > 0) {
        setUserProfile(profiles[0]);
      }
    } catch (error) {
      console.error("Erro ao carregar perfil do usuário:", error);
    }
  };

  const generateDefaultImage = () => {
    let imageUrl = "";
    
    switch (location.type) {
      case "city":
        imageUrl = "https://images.unsplash.com/photo-1581373449483-37449f962b6c?auto=format&fit=crop&w=800";
        break;
      case "beach":
        imageUrl = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800";
        break;
      case "business":
        imageUrl = "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800";
        break;
      case "provider":
        imageUrl = "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=800";
        break;
      default:
        imageUrl = "https://images.unsplash.com/photo-1558882224-dda166733046?auto=format&fit=crop&w=800";
    }
    
    setLocationImage(imageUrl);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImageUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const getLocationType = () => {
    switch (location.type) {
      case "city": return "cidade";
      case "beach": return "praia";
      case "business": return "comércio";
      case "provider": return "prestador de serviço";
      default: return "local";
    }
  };

  const getLocationTypeIcon = () => {
    switch (location.type) {
      case "city": return <Building2 className="w-4 h-4" />;
      case "beach": return <Waves className="w-4 h-4" />;
      case "business": return <Store className="w-4 h-4" />;
      case "provider": return <Wrench className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getLocationTypeColor = () => {
    switch (location.type) {
      case "city": return "bg-blue-100 text-blue-800";
      case "beach": return "bg-yellow-100 text-yellow-800";
      case "business": return "bg-green-100 text-green-800";
      case "provider": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getDefaultPost = () => {
    const messages = {
      city: [
        `Estou visitando ${location.name}!`,
        `Conhecendo ${location.name} hoje!`,
        `Descobrindo os encantos de ${location.name}`,
        `Check-in em ${location.name} ✅`
      ],
      beach: [
        `Dia de praia em ${location.name}!`,
        `Sol, mar e areia em ${location.name}`,
        `Curtindo ${location.name} hoje!`,
        `Um paraíso chamado ${location.name}`
      ],
      business: [
        `Visitando ${location.name}`,
        `Conhecendo ${location.name}`,
        `Experiência incrível em ${location.name}`,
        `Check-in em ${location.name} ✅`
      ],
      provider: [
        `Contratando serviços de ${location.name}`,
        `Recomendo os serviços de ${location.name}`,
        `Experiência com ${location.name}`,
        `Trabalhando com ${location.name} hoje`
      ]
    };
    
    const typeMessages = messages[location.type] || messages.city;
    const randomIndex = Math.floor(Math.random() * typeMessages.length);
    return typeMessages[randomIndex];
  };

  const handleSubmit = async () => {
    if (!user) {
      alert("Você precisa estar logado para fazer check-in");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let image_urls = [];
      
      // Upload da imagem se houver
      if (selectedImage) {
        const { file_url } = await UploadFile({ file: selectedImage });
        image_urls = [file_url];
      }
      
      // Criar post
      await Post.create({
        user_id: user.id,
        content: checkinContent || getDefaultPost(),
        image_urls,
        location_type: location.type,
        location_id: location.id,
        location_name: location.name,
        post_type: "experience",
        tags: ["checkin", location.type, location.name.toLowerCase().replace(/\s+/g, '')],
        likes_count: 0,
        comments_count: 0
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Fechar modal
      onClose();
    } catch (error) {
      console.error("Erro ao fazer check-in:", error);
      alert("Ocorreu um erro ao fazer check-in. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-lg">
            <Flag className="w-5 h-5 mr-2 text-red-500" />
            Check-in
          </DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4" 
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        {/* Corpo do Modal */}
        <div className="space-y-4">
          {/* Cabeçalho com informações do local */}
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden">
              <img 
                src={locationImage} 
                alt={location.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div>
              <Badge className={getLocationTypeColor()}>
                <div className="flex items-center">
                  {getLocationTypeIcon()}
                  <span className="ml-1 capitalize">{getLocationType()}</span>
                </div>
              </Badge>
              
              <h3 className="font-semibold mt-1">{location.name}</h3>
              
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <MapPin className="w-3 h-3 mr-1" />
                <span>{format(new Date(), "'Check-in em' dd 'de' MMMM', às 'HH:mm", { locale: ptBR })}</span>
              </div>
            </div>
          </div>
          
          {/* Texto do post */}
          <div>
            <Textarea 
              placeholder={`Conte como está sendo sua experiência em ${location.name}...`}
              className="min-h-[100px]"
              value={checkinContent}
              onChange={(e) => setCheckinContent(e.target.value)}
            />
          </div>
          
          {/* Upload de imagem */}
          <div 
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
              selectedImageUrl ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-blue-300'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            {selectedImageUrl ? (
              <div className="relative">
                <img 
                  src={selectedImageUrl} 
                  alt="Imagem selecionada" 
                  className="max-h-40 mx-auto rounded-md"
                />
                <p className="text-sm text-green-600 mt-2 flex items-center justify-center">
                  <Check className="w-4 h-4 mr-1" />
                  Imagem selecionada
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-1 right-1 bg-white/80 hover:bg-white text-gray-700 p-1 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(null);
                    setSelectedImageUrl(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="py-4">
                <Camera className="h-8 w-8 mx-auto text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Clique para adicionar uma foto</p>
                <p className="text-xs text-gray-400">Compartilhe o momento do seu check-in</p>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImageChange}
            />
          </div>
          
          {/* Rating */}
          {showRating && (
            <div className="bg-gray-50 rounded-lg p-4 border">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Como você avalia este {getLocationType()}?</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={() => setShowRating(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex justify-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="focus:outline-none"
                    onClick={() => setRating(star)}
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= rating 
                          ? 'text-yellow-400 fill-yellow-400' 
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              
              <div className="text-center mt-2">
                <span className="text-sm font-medium">
                  {rating === 1 && "Regular"}
                  {rating === 2 && "Bom"}
                  {rating === 3 && "Muito bom"}
                  {rating === 4 && "Ótimo"}
                  {rating === 5 && "Excelente!"}
                </span>
              </div>
            </div>
          )}
          
          {/* Botões */}
          <div className="pt-2">
            <Button 
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Processando...
                </>
              ) : (
                <>
                  <Flag className="w-4 h-4 mr-2" />
                  Fazer Check-in
                </>
              )}
            </Button>
            
            <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
              <div className="flex items-center">
                <Share2 className="w-3 h-3 mr-1" />
                <span>Compartilhar nas redes sociais</span>
              </div>
              
              {!showRating && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs"
                  onClick={() => setShowRating(true)}
                >
                  <Star className="h-3 w-3 mr-1" />
                  Avaliar
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}