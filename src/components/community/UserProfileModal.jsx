
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  X, Upload, Image, User as UserIcon, MapPin, Globe, Instagram, 
  Facebook, Twitter, Camera, CameraOff, UserPlus, UserCheck, Pencil,
  CalendarDays, Flag, Heart, Settings, Eye, EyeOff, Languages,
  CheckCircle, Compass, Sun, Moon, Utensils, Sailboat, Users as UsersIcon,
  Mountain, Music, DollarSign, Bookmark, Youtube, Flower2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { City, Beach } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function UserProfileModal({ 
  user, 
  profile, 
  onClose, 
  onSubmit,
  viewOnly = false
}) {
  const [formData, setFormData] = useState({
    bio: profile?.bio || "",
    location: profile?.location || "",
    avatar_url: profile?.avatar_url || "",
    cover_url: profile?.cover_url || "",
    interests: profile?.interests || [],
    is_local: profile?.is_local || false,
    social_links: profile?.social_links || {
      instagram: "",
      facebook: "",
      twitter: "",
      tiktok: "",
      youtube: ""
    },
    favorite_beaches: profile?.favorite_beaches || [],
    favorite_cities: profile?.favorite_cities || [],
    display_favorites: profile?.display_favorites !== false, // default to true
    travel_style: profile?.travel_style || [],
    preferred_languages: profile?.preferred_languages || [],
    privacy_settings: profile?.privacy_settings || {
      show_email: false,
      show_location: true,
      show_social_links: true
    }
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadType, setUploadType] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [cities, setCities] = useState([]);
  const [beaches, setBeaches] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedBeach, setSelectedBeach] = useState("");
  
  // Interests options
  const interestOptions = [
    "praias", "trilhas", "gastronomia", "cultura", "história", 
    "aventura", "natureza", "família", "relaxamento", "fotografia",
    "mergulho", "surf", "pesca", "esportes", "eventos", "festas"
  ];
  
  // Travel styles with icons
  const travelStyles = [
    { value: "aventura", label: "Aventura", icon: <Mountain className="w-4 h-4" /> },
    { value: "relaxamento", label: "Relaxamento", icon: <Sun className="w-4 h-4" /> },
    { value: "cultural", label: "Cultural", icon: <Compass className="w-4 h-4" /> },
    { value: "gastronomico", label: "Gastronômico", icon: <Utensils className="w-4 h-4" /> },
    { value: "ecologico", label: "Ecológico", icon: <Flower2 className="w-4 h-4" /> },
    { value: "festa", label: "Vida Noturna", icon: <Moon className="w-4 h-4" /> },
    { value: "familia", label: "Família", icon: <UsersIcon className="w-4 h-4" /> },
    { value: "romantico", label: "Romântico", icon: <Heart className="w-4 h-4" /> },
    { value: "esportivo", label: "Esportivo", icon: <Sailboat className="w-4 h-4" /> },
    { value: "low_cost", label: "Econômico", icon: <DollarSign className="w-4 h-4" /> }
  ];
  
  // Languages options
  const languageOptions = [
    { value: "pt", label: "Português" },
    { value: "en", label: "Inglês" },
    { value: "es", label: "Espanhol" },
    { value: "fr", label: "Francês" },
    { value: "de", label: "Alemão" },
    { value: "it", label: "Italiano" }
  ];

  useEffect(() => {
    // Update form data if profile changes
    if (profile) {
      setFormData({
        bio: profile.bio || "",
        location: profile.location || "",
        avatar_url: profile.avatar_url || "",
        cover_url: profile.cover_url || "",
        interests: profile.interests || [],
        is_local: profile.is_local || false,
        social_links: profile.social_links || {
          instagram: "",
          facebook: "",
          twitter: "",
          tiktok: "",
          youtube: ""
        },
        favorite_beaches: profile.favorite_beaches || [],
        favorite_cities: profile.favorite_cities || [],
        display_favorites: profile.display_favorites !== false,
        travel_style: profile.travel_style || [],
        preferred_languages: profile.preferred_languages || [],
        privacy_settings: profile.privacy_settings || {
          show_email: false,
          show_location: true,
          show_social_links: true
        }
      });
    }
    
    // Load cities and beaches
    loadCitiesAndBeaches();
  }, [profile]);

  const loadCitiesAndBeaches = async () => {
    try {
      const [citiesData, beachesData] = await Promise.all([
        City.list(),
        Beach.list()
      ]);
      
      setCities(citiesData);
      setBeaches(beachesData);
    } catch (error) {
      console.error("Erro ao carregar cidades e praias:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSocialLinkChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [name]: value
      }
    }));
  };

  const handleToggleInterest = (interest) => {
    if (formData.interests.includes(interest)) {
      setFormData(prev => ({
        ...prev,
        interests: prev.interests.filter(i => i !== interest)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, interest]
      }));
    }
  };
  
  const handleToggleTravelStyle = (style) => {
    if (formData.travel_style.includes(style)) {
      setFormData(prev => ({
        ...prev,
        travel_style: prev.travel_style.filter(s => s !== style)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        travel_style: [...prev.travel_style, style]
      }));
    }
  };
  
  const handleToggleLanguage = (language) => {
    if (formData.preferred_languages.includes(language)) {
      setFormData(prev => ({
        ...prev,
        preferred_languages: prev.preferred_languages.filter(l => l !== language)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        preferred_languages: [...prev.preferred_languages, language]
      }));
    }
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    setUploadType(type);
    
    try {
      const { file_url } = await UploadFile({ file });
      
      if (type === "avatar") {
        setFormData(prev => ({ ...prev, avatar_url: file_url }));
      } else if (type === "cover") {
        setFormData(prev => ({ ...prev, cover_url: file_url }));
      }
    } catch (error) {
      console.error("Erro ao fazer upload de imagem:", error);
    }
    
    setIsUploading(false);
    setUploadType("");
  };
  
  const handleAddFavoriteCity = () => {
    if (!selectedCity || formData.favorite_cities.includes(selectedCity)) return;
    
    setFormData(prev => ({
      ...prev,
      favorite_cities: [...prev.favorite_cities, selectedCity]
    }));
    
    setSelectedCity("");
  };
  
  const handleRemoveFavoriteCity = (cityId) => {
    setFormData(prev => ({
      ...prev,
      favorite_cities: prev.favorite_cities.filter(id => id !== cityId)
    }));
  };
  
  const handleAddFavoriteBeach = () => {
    if (!selectedBeach || formData.favorite_beaches.includes(selectedBeach)) return;
    
    setFormData(prev => ({
      ...prev,
      favorite_beaches: [...prev.favorite_beaches, selectedBeach]
    }));
    
    setSelectedBeach("");
  };
  
  const handleRemoveFavoriteBeach = (beachId) => {
    setFormData(prev => ({
      ...prev,
      favorite_beaches: prev.favorite_beaches.filter(id => id !== beachId)
    }));
  };
  
  const handlePrivacyChange = (setting, value) => {
    setFormData(prev => ({
      ...prev,
      privacy_settings: {
        ...prev.privacy_settings,
        [setting]: value
      }
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const getCityName = (cityId) => {
    const city = cities.find(c => c.id === cityId);
    return city ? city.name : "Cidade não encontrada";
  };
  
  const getBeachName = (beachId) => {
    const beach = beaches.find(b => b.id === beachId);
    return beach ? beach.name : "Praia não encontrada";
  };

  const title = viewOnly ? user.full_name : "Editar Perfil";

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
        <DialogHeader className="pb-2 border-b">
          <div className="flex justify-between items-center">
            <DialogTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-blue-600" />
              {title}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        {/* Profile Cover & Avatar */}
        <div className="h-40 bg-gradient-to-r from-blue-500 to-indigo-600 relative rounded-md overflow-hidden">
          {formData.cover_url ? (
            <img 
              src={formData.cover_url} 
              alt="Capa do perfil" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white text-opacity-50">
              <CameraOff className="w-8 h-8" />
            </div>
          )}
          
          {!viewOnly && (
            <div className="absolute bottom-2 right-2">
              <label className="cursor-pointer">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handleImageUpload(e, "cover")}
                  disabled={isUploading}
                />
                <div className="bg-black/50 text-white p-2 rounded-full backdrop-blur-sm">
                  {isUploading && uploadType === "cover" ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <Camera className="h-5 w-5" />
                  )}
                </div>
              </label>
            </div>
          )}
          
          <div className="absolute -bottom-10 left-4">
            <div className="relative">
              <Avatar className="h-20 w-20 border-4 border-white shadow-md">
                <AvatarImage src={formData.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl">
                  {user.full_name?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {!viewOnly && (
                <label className="cursor-pointer absolute -bottom-2 -right-2">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handleImageUpload(e, "avatar")}
                    disabled={isUploading}
                  />
                  <div className="bg-blue-600 text-white p-2 rounded-full shadow-sm">
                    {isUploading && uploadType === "avatar" ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <Pencil className="h-4 w-4" />
                    )}
                  </div>
                </label>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-12">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">{user.full_name}</h2>
              <div className="flex items-center text-gray-500 text-sm mt-1">
                <Globe className="w-4 h-4 mr-1" />
                <span>{formData.location || "Localização não informada"}</span>
              </div>
            </div>
            
            {viewOnly && user.id !== profile?.user_id && (
              <Button className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="mr-2 h-4 w-4" />
                Seguir
              </Button>
            )}
          </div>
          
          <div className="flex gap-4 mt-4 border-b">
            <div className="text-center p-2">
              <div className="font-semibold text-gray-900">{profile?.following_count || 0}</div>
              <div className="text-sm text-gray-500">Seguindo</div>
            </div>
            <div className="text-center p-2">
              <div className="font-semibold text-gray-900">{profile?.followers_count || 0}</div>
              <div className="text-sm text-gray-500">Seguidores</div>
            </div>
            <div className="text-center p-2">
              <div className="font-semibold text-gray-900">{profile?.posts_count || 0}</div>
              <div className="text-sm text-gray-500">Publicações</div>
            </div>
            <div className="text-center p-2">
              <div className="font-semibold text-gray-900">{profile?.reviews_count || 0}</div>
              <div className="text-sm text-gray-500">Avaliações</div>
            </div>
          </div>
        </div>
        
        {viewOnly ? (
          // View mode
          <div className="space-y-6 mt-4">
            {formData.bio && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Sobre</h3>
                <p className="whitespace-pre-line">{formData.bio}</p>
              </div>
            )}
            
            {formData.travel_style?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Estilo de Viagem</h3>
                <div className="flex flex-wrap gap-2">
                  {formData.travel_style.map(style => {
                    const styleData = travelStyles.find(s => s.value === style);
                    return (
                      <Badge key={style} className="bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                        {styleData?.icon}
                        {styleData?.label || style}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
            
            {formData.interests?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Interesses</h3>
                <div className="flex flex-wrap gap-2">
                  {formData.interests.map(interest => (
                    <Badge key={interest} className="bg-blue-50 text-blue-700 border border-blue-200">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {formData.display_favorites && (
              <>
                {formData.favorite_cities?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Cidades Favoritas</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {formData.favorite_cities.map(cityId => (
                        <div key={cityId} className="flex items-center gap-2 p-2 rounded-md bg-gray-50">
                          <MapPin className="w-4 h-4 text-blue-500" />
                          <span>{getCityName(cityId)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {formData.favorite_beaches?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Praias Favoritas</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {formData.favorite_beaches.map(beachId => (
                        <div key={beachId} className="flex items-center gap-2 p-2 rounded-md bg-gray-50">
                          <Sailboat className="w-4 h-4 text-cyan-500" />
                          <span>{getBeachName(beachId)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            
            {formData.preferred_languages?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Idiomas</h3>
                <div className="flex flex-wrap gap-2">
                  {formData.preferred_languages.map(lang => {
                    const langData = languageOptions.find(l => l.value === lang);
                    return (
                      <Badge key={lang} className="bg-green-50 text-green-700 border border-green-200">
                        {langData?.label || lang}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
            
            {formData.is_local && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center gap-2">
                  <Flag className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-700">Morador Local</span>
                </div>
                <p className="text-sm text-blue-600 mt-1">
                  Este usuário é um morador local e pode fornecer dicas exclusivas sobre a região.
                </p>
              </div>
            )}
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Membro desde</h3>
              <div className="flex items-center text-gray-700">
                <CalendarDays className="w-4 h-4 mr-2 text-gray-400" />
                {user.created_date ? (
                  <span>{format(new Date(user.created_date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                ) : (
                  <span>Data não disponível</span>
                )}
              </div>
            </div>
            
            {/* Social links */}
            {(formData.privacy_settings?.show_social_links !== false) && 
             (formData.social_links?.instagram || 
              formData.social_links?.facebook || 
              formData.social_links?.twitter ||
              formData.social_links?.tiktok ||
              formData.social_links?.youtube) && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Redes Sociais</h3>
                <div className="flex gap-3">
                  {formData.social_links?.instagram && (
                    <a 
                      href={`https://instagram.com/${formData.social_links.instagram}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-pink-600 hover:text-pink-700"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {formData.social_links?.facebook && (
                    <a 
                      href={`https://facebook.com/${formData.social_links.facebook}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                  {formData.social_links?.twitter && (
                    <a 
                      href={`https://twitter.com/${formData.social_links.twitter}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-500"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                  {formData.social_links?.tiktok && (
                    <a 
                      href={`https://tiktok.com/@${formData.social_links.tiktok}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-black hover:text-gray-700"
                    >
                      <span className="flex items-center justify-center w-5 h-5 font-bold">TT</span>
                    </a>
                  )}
                  {formData.social_links?.youtube && (
                    <a 
                      href={`https://youtube.com/${formData.social_links.youtube}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Youtube className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Edit mode
          <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList>
              <TabsTrigger value="profile">Perfil Básico</TabsTrigger>
              <TabsTrigger value="social">Redes Sociais</TabsTrigger>
              <TabsTrigger value="interests">Interesses</TabsTrigger>
              <TabsTrigger value="favorites">Lugares Favoritos</TabsTrigger>
              <TabsTrigger value="privacy">Privacidade</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bio">Biografia</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Conte um pouco sobre você..."
                  rows={4}
                />
                <p className="text-xs text-gray-500">
                  Fale sobre você, suas paixões e o que você gosta de fazer quando viaja.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Localização</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Sua cidade atual"
                />
              </div>
              
              <div className="space-y-4">
                <Label>Idiomas que você fala</Label>
                <div className="flex flex-wrap gap-2">
                  {languageOptions.map(lang => (
                    <Badge 
                      key={lang.value}
                      variant={formData.preferred_languages.includes(lang.value) ? "default" : "outline"}
                      className={`cursor-pointer ${
                        formData.preferred_languages.includes(lang.value)
                          ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
                          : "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200"
                      }`}
                      onClick={() => handleToggleLanguage(lang.value)}
                    >
                      {formData.preferred_languages.includes(lang.value) && (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      )}
                      {lang.label}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 pt-4">
                <Switch
                  id="is_local"
                  checked={formData.is_local}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_local: checked }))}
                />
                <Label htmlFor="is_local" className="flex items-center gap-2">
                  <Flag className="w-4 h-4 text-blue-600" />
                  Sou morador local
                </Label>
                <div className="ml-auto text-xs text-blue-500">+Visibilidade nas buscas</div>
              </div>
            </TabsContent>
            
            <TabsContent value="social" className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-md mb-4">
                <p className="text-sm text-blue-700">
                  Conecte suas redes sociais para compartilhar seu conteúdo sobre turismo e viagens em Santa Catarina.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Instagram className="w-4 h-4 mr-2 text-pink-600" />
                  Instagram
                </Label>
                <div className="flex">
                  <div className="bg-gray-100 text-gray-500 px-3 py-2 border border-r-0 rounded-l-md">
                    instagram.com/
                  </div>
                  <Input
                    name="instagram"
                    value={formData.social_links?.instagram || ""}
                    onChange={handleSocialLinkChange}
                    placeholder="seu_usuario"
                    className="rounded-l-none"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Facebook className="w-4 h-4 mr-2 text-blue-600" />
                  Facebook
                </Label>
                <div className="flex">
                  <div className="bg-gray-100 text-gray-500 px-3 py-2 border border-r-0 rounded-l-md">
                    facebook.com/
                  </div>
                  <Input
                    name="facebook"
                    value={formData.social_links?.facebook || ""}
                    onChange={handleSocialLinkChange}
                    placeholder="seu_perfil"
                    className="rounded-l-none"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Twitter className="w-4 h-4 mr-2 text-blue-400" />
                  Twitter
                </Label>
                <div className="flex">
                  <div className="bg-gray-100 text-gray-500 px-3 py-2 border border-r-0 rounded-l-md">
                    twitter.com/
                  </div>
                  <Input
                    name="twitter"
                    value={formData.social_links?.twitter || ""}
                    onChange={handleSocialLinkChange}
                    placeholder="seu_usuario"
                    className="rounded-l-none"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center">
                  <span className="font-bold text-sm mr-2">TikTok</span>
                  TikTok
                </Label>
                <div className="flex">
                  <div className="bg-gray-100 text-gray-500 px-3 py-2 border border-r-0 rounded-l-md">
                    tiktok.com/@
                  </div>
                  <Input
                    name="tiktok"
                    value={formData.social_links?.tiktok || ""}
                    onChange={handleSocialLinkChange}
                    placeholder="seu_usuario"
                    className="rounded-l-none"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Youtube className="w-4 h-4 mr-2 text-red-600" />
                  YouTube
                </Label>
                <div className="flex">
                  <div className="bg-gray-100 text-gray-500 px-3 py-2 border border-r-0 rounded-l-md">
                    youtube.com/
                  </div>
                  <Input
                    name="youtube"
                    value={formData.social_links?.youtube || ""}
                    onChange={handleSocialLinkChange}
                    placeholder="seu_canal"
                    className="rounded-l-none"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="interests" className="space-y-4">
              <div className="space-y-4">
                <Label>Estilo de Viagem</Label>
                <p className="text-sm text-gray-500">Selecione os estilos de viagem que mais combinam com você:</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {travelStyles.map(style => (
                    <div
                      key={style.value}
                      className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer border-2 transition-colors ${
                        formData.travel_style.includes(style.value)
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleToggleTravelStyle(style.value)}
                    >
                      <div className={`p-2 rounded-full ${
                        formData.travel_style.includes(style.value)
                          ? "bg-indigo-100 text-indigo-600"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {style.icon}
                      </div>
                      <span className="font-medium">{style.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <Label>Interesses</Label>
                <p className="text-sm text-gray-500">
                  Selecione seus interesses para que possamos recomendar conteúdos relevantes:
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {interestOptions.map(interest => (
                    <Badge 
                      key={interest}
                      className={`cursor-pointer ${
                        formData.interests.includes(interest)
                          ? "bg-blue-100 text-blue-800 border-blue-300"
                          : "bg-gray-100 text-gray-800 border-gray-200"
                      }`}
                      onClick={() => handleToggleInterest(interest)}
                    >
                      {formData.interests.includes(interest) && "✓ "}
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="favorites" className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <Switch
                  id="display_favorites"
                  checked={formData.display_favorites}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, display_favorites: checked }))}
                />
                <Label htmlFor="display_favorites" className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-600" />
                  Mostrar meus lugares favoritos no perfil público
                </Label>
              </div>
              
              <div className="space-y-4">
                <Label>Cidades Favoritas</Label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecione uma cidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Cidades em Santa Catarina</SelectLabel>
                        {cities.map(city => (
                          <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    type="button"
                    onClick={handleAddFavoriteCity}
                    disabled={!selectedCity || formData.favorite_cities.includes(selectedCity)}
                    className="w-40"
                  >
                    Adicionar
                  </Button>
                </div>
                
                {formData.favorite_cities.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <Label className="text-sm">Cidades adicionadas:</Label>
                    <div className="mt-2 space-y-2">
                      {formData.favorite_cities.map(cityId => (
                        <div key={cityId} className="flex justify-between items-center p-2 bg-white rounded border">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-500" />
                            <span>{getCityName(cityId)}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFavoriteCity(cityId)}
                            className="text-red-500 h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <Label>Praias Favoritas</Label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select value={selectedBeach} onValueChange={setSelectedBeach}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecione uma praia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Praias em Santa Catarina</SelectLabel>
                        {beaches.map(beach => (
                          <SelectItem key={beach.id} value={beach.id}>{beach.name}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    type="button"
                    onClick={handleAddFavoriteBeach}
                    disabled={!selectedBeach || formData.favorite_beaches.includes(selectedBeach)}
                    className="w-40"
                  >
                    Adicionar
                  </Button>
                </div>
                
                {formData.favorite_beaches.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <Label className="text-sm">Praias adicionadas:</Label>
                    <div className="mt-2 space-y-2">
                      {formData.favorite_beaches.map(beachId => (
                        <div key={beachId} className="flex justify-between items-center p-2 bg-white rounded border">
                          <div className="flex items-center gap-2">
                            <Sailboat className="w-4 h-4 text-cyan-500" />
                            <span>{getBeachName(beachId)}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFavoriteBeach(beachId)}
                            className="text-red-500 h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="privacy" className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-md mb-4">
                <h3 className="font-medium text-blue-800 flex items-center gap-2 mb-2">
                  <Settings className="w-4 h-4" />
                  Configurações de Privacidade
                </h3>
                <p className="text-sm text-blue-700">
                  Controle quais informações são compartilhadas no seu perfil público.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div className="flex flex-col">
                    <span className="font-medium flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                      Mostrar localização
                    </span>
                    <span className="text-sm text-gray-500">
                      Sua cidade atual será visível para outros usuários
                    </span>
                  </div>
                  <Switch
                    checked={formData.privacy_settings?.show_location !== false}
                    onCheckedChange={(checked) => handlePrivacyChange('show_location', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between py-2">
                  <div className="flex flex-col">
                    <span className="font-medium flex items-center">
                      <Settings className="w-4 h-4 mr-2 text-gray-500" />
                      Mostrar redes sociais
                    </span>
                    <span className="text-sm text-gray-500">
                      Links para suas redes sociais serão visíveis no seu perfil
                    </span>
                  </div>
                  <Switch
                    checked={formData.privacy_settings?.show_social_links !== false}
                    onCheckedChange={(checked) => handlePrivacyChange('show_social_links', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between py-2">
                  <div className="flex flex-col">
                    <span className="font-medium flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-500" />
                      Mostrar email
                    </span>
                    <span className="text-sm text-gray-500">
                      Seu email ficará visível para outros usuários
                    </span>
                  </div>
                  <Switch
                    checked={formData.privacy_settings?.show_email === true}
                    onCheckedChange={(checked) => handlePrivacyChange('show_email', checked)}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
        
        {!viewOnly && (
          <div className="flex justify-end mt-6 pt-4 border-t">
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit} 
                className="bg-blue-600 hover:bg-blue-700"
              >
                Salvar Alterações
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
