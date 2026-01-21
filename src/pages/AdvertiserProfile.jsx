import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Building, Edit, BarChart4, MessageSquare, Plus, Loader2, Trash2,
  Eye, EyeOff, Clock, Calendar, DollarSign, Image as ImageIcon,
  CheckCircle, AlertCircle, CheckCircle2, AreaChart, Target,
  PieChart, ChevronRight, Flag, Upload, CreditCard, Share2
} from "lucide-react";
import { format, isAfter, isBefore } from "date-fns";
import { UploadFile } from "@/api/integrations";
import BackButton from "@/components/ui/BackButton";

// Importar entidades
import { User } from "@/api/entities";
import { Advertiser } from "@/api/entities";
import { Advertisement } from "@/api/entities";
import { City } from "@/api/entities";

export default function AdvertiserProfile() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [advertiser, setAdvertiser] = useState(null);
  const [user, setUser] = useState(null);
  const [advertisements, setAdvertisements] = useState([]);
  const [cities, setCities] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [advertisementFormData, setAdvertisementFormData] = useState({
    title: "",
    description: "",
    type: "banner",
    placement: "home",
    image_url: "",
    city_id: "",
    link_url: "",
    start_date: format(new Date(), "yyyy-MM-dd"),
    end_date: format(new Date(new Date().setMonth(new Date().getMonth() + 1)), "yyyy-MM-dd"),
    budget: 0,
  });
  
  const [formData, setFormData] = useState({
    company_name: "",
    trade_name: "",
    cnpj: "",
    description: "",
    address: "",
    city_id: "",
    segment: "outros",
    phone: "",
    email: "",
    website: "",
    social_media: {
      facebook: "",
      instagram: "",
      twitter: "",
      linkedin: ""
    },
    logo_url: "",
    cover_image_url: ""
  });
  
  const [showAdForm, setShowAdForm] = useState(false);
  const [editingAdId, setEditingAdId] = useState(null);
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Carregar dados do usuário atual
        const userData = await User.me();
        setUser(userData);
        
        // Buscar cidades para o seletor
        const citiesData = await City.list();
        setCities(citiesData);
        
        // Verificar se já é um anunciante
        const advertisers = await Advertiser.filter({ user_id: userData.id });
        
        if (advertisers.length > 0) {
          // Usuário já é um anunciante
          const advertiserData = advertisers[0];
          setAdvertiser(advertiserData);
          
          // Carregar anúncios
          const ads = await Advertisement.filter({ advertiser_id: advertiserData.id });
          setAdvertisements(ads);
          
          // Preencher formulário com dados existentes
          setFormData({
            company_name: advertiserData.company_name || "",
            trade_name: advertiserData.trade_name || "",
            cnpj: advertiserData.cnpj || "",
            description: advertiserData.description || "",
            address: advertiserData.address || "",
            city_id: advertiserData.city_id || "",
            segment: advertiserData.segment || "outros",
            phone: advertiserData.phone || "",
            email: advertiserData.email || "",
            website: advertiserData.website || "",
            social_media: advertiserData.social_media || {
              facebook: "",
              instagram: "",
              twitter: "",
              linkedin: ""
            },
            logo_url: advertiserData.logo_url || "",
            cover_image_url: advertiserData.cover_image_url || ""
          });
        } else {
          // Criar perfil básico de anunciante com dados do usuário
          setFormData(prev => ({
            ...prev,
            email: userData.email || ""
          }));
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
      setIsLoading(false);
    };
    
    loadData();
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAdInputChange = (e) => {
    const { name, value } = e.target;
    setAdvertisementFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSocialMediaChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      social_media: {
        ...prev.social_media,
        [platform]: value
      }
    }));
  };
  
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingLogo(true);
    try {
      const { file_url } = await UploadFile({ file });
      setFormData(prev => ({
        ...prev,
        logo_url: file_url
      }));
    } catch (error) {
      console.error("Erro ao fazer upload do logo:", error);
    }
    setUploadingLogo(false);
  };
  
  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingCover(true);
    try {
      const { file_url } = await UploadFile({ file });
      setFormData(prev => ({
        ...prev,
        cover_image_url: file_url
      }));
    } catch (error) {
      console.error("Erro ao fazer upload da imagem de capa:", error);
    }
    setUploadingCover(false);
  };
  
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingImage(true);
    try {
      const { file_url } = await UploadFile({ file });
      setAdvertisementFormData(prev => ({
        ...prev,
        image_url: file_url
      }));
    } catch (error) {
      console.error("Erro ao fazer upload da imagem do anúncio:", error);
    }
    setUploadingImage(false);
  };
  
  const handleSaveProfile = async () => {
    if (!formData.company_name || !formData.cnpj || !formData.city_id || !formData.phone || !formData.email) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    
    try {
      if (advertiser) {
        // Atualizar perfil existente
        await Advertiser.update(advertiser.id, formData);
      } else {
        // Criar novo perfil
        const newAdvertiser = await Advertiser.create({
          ...formData,
          user_id: user.id,
          status: "pending"
        });
        setAdvertiser(newAdvertiser);
      }
      
      setIsEditing(false);
      // Recarregar dados
      const updatedAdvertisers = await Advertiser.filter({ user_id: user.id });
      if (updatedAdvertisers.length > 0) {
        setAdvertiser(updatedAdvertisers[0]);
      }
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      alert("Ocorreu um erro ao salvar seu perfil.");
    }
  };
  
  const handleCreateAd = async () => {
    if (!advertiser) {
      alert("Você precisa completar seu perfil de anunciante primeiro.");
      return;
    }
    
    if (!advertisementFormData.title || !advertisementFormData.image_url || 
        !advertisementFormData.start_date || !advertisementFormData.end_date) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    
    try {
      if (editingAdId) {
        // Atualizar anúncio existente
        await Advertisement.update(editingAdId, {
          ...advertisementFormData,
          advertiser_id: advertiser.id
        });
      } else {
        // Criar novo anúncio
        await Advertisement.create({
          ...advertisementFormData,
          advertiser_id: advertiser.id,
          status: "pending"
        });
      }
      
      // Limpar formulário e recarregar anúncios
      setAdvertisementFormData({
        title: "",
        description: "",
        type: "banner",
        placement: "home",
        image_url: "",
        city_id: "",
        link_url: "",
        start_date: format(new Date(), "yyyy-MM-dd"),
        end_date: format(new Date(new Date().setMonth(new Date().getMonth() + 1)), "yyyy-MM-dd"),
        budget: 0,
      });
      
      setShowAdForm(false);
      setEditingAdId(null);
      
      // Recarregar anúncios
      const ads = await Advertisement.filter({ advertiser_id: advertiser.id });
      setAdvertisements(ads);
    } catch (error) {
      console.error("Erro ao criar anúncio:", error);
      alert("Ocorreu um erro ao criar seu anúncio.");
    }
  };
  
  const handleEditAd = (ad) => {
    setAdvertisementFormData({
      title: ad.title || "",
      description: ad.description || "",
      type: ad.type || "banner",
      placement: ad.placement || "home",
      image_url: ad.image_url || "",
      city_id: ad.city_id || "",
      link_url: ad.link_url || "",
      start_date: ad.start_date ? format(new Date(ad.start_date), "yyyy-MM-dd") : "",
      end_date: ad.end_date ? format(new Date(ad.end_date), "yyyy-MM-dd") : "",
      budget: ad.budget || 0,
    });
    
    setEditingAdId(ad.id);
    setShowAdForm(true);
  };
  
  const handleDeleteAd = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este anúncio?")) {
      try {
        await Advertisement.delete(id);
        
        // Recarregar anúncios
        const ads = await Advertisement.filter({ advertiser_id: advertiser.id });
        setAdvertisements(ads);
      } catch (error) {
        console.error("Erro ao excluir anúncio:", error);
        alert("Ocorreu um erro ao excluir o anúncio.");
      }
    }
  };
  
  const handlePauseResumeAd = async (ad) => {
    try {
      const newStatus = ad.status === "active" ? "paused" : "active";
      await Advertisement.update(ad.id, { status: newStatus });
      
      // Recarregar anúncios
      const ads = await Advertisement.filter({ advertiser_id: advertiser.id });
      setAdvertisements(ads);
    } catch (error) {
      console.error("Erro ao atualizar status do anúncio:", error);
      alert("Ocorreu um erro ao atualizar o status do anúncio.");
    }
  };
  
  const formatPlacement = (placement) => {
    const placements = {
      home: "Página Inicial",
      city: "Página de Cidade",
      beach: "Página de Praia",
      listing: "Listagem",
      community: "Comunidade",
      search: "Resultados de Busca",
      multiple: "Várias Páginas"
    };
    
    return placements[placement] || placement;
  };
  
  const formatAdType = (type) => {
    const types = {
      banner: "Banner",
      destaque: "Destaque",
      card: "Card",
      popup: "Pop-up",
      newsletter: "Newsletter"
    };
    
    return types[type] || type;
  };
  
  const formatSegment = (segment) => {
    const segments = {
      hospedagem: "Hospedagem",
      alimentacao: "Alimentação",
      passeios: "Passeios",
      esportes: "Esportes",
      transporte: "Transporte",
      outros: "Outros"
    };
    
    return segments[segment] || segment;
  };
  
  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: "bg-gray-100 text-gray-800", label: "Rascunho" },
      pending: { color: "bg-blue-100 text-blue-800", label: "Pendente" },
      active: { color: "bg-green-100 text-green-800", label: "Ativo" },
      paused: { color: "bg-amber-100 text-amber-800", label: "Pausado" },
      completed: { color: "bg-purple-100 text-purple-800", label: "Concluído" },
      rejected: { color: "bg-red-100 text-red-800", label: "Rejeitado" }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    
    return (
      <Badge className={`${config.color}`}>
        {config.label}
      </Badge>
    );
  };
  
  const getCityName = (cityId) => {
    const city = cities.find(c => c.id === cityId);
    return city ? city.name : "N/A";
  };
  
  const isAdActive = (ad) => {
    const today = new Date();
    const startDate = new Date(ad.start_date);
    const endDate = new Date(ad.end_date);
    
    return isAfter(today, startDate) && isBefore(today, endDate) && ad.status === "active";
  };
  
  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-blue-600 mb-4" />
          <p className="text-gray-500">Carregando seu perfil de anunciante...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <BackButton />
      
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Perfil de Anunciante</h1>
            <p className="text-gray-500">Gerencie suas informações e anúncios</p>
          </div>
        </div>
        
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile" className="flex items-center gap-1">
              <Building className="w-4 h-4" />
              <span>Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="advertisements" className="flex items-center gap-1">
              <ImageIcon className="w-4 h-4" />
              <span>Meus Anúncios</span>
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center gap-1">
              <BarChart4 className="w-4 h-4" />
              <span>Estatísticas</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span>Mensagens</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle>Informações da Empresa</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    {isEditing ? "Cancelar Edição" : "Editar"}
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Imagem de Capa e Logo */}
                <div className="mb-6 relative">
                  <div className="h-40 rounded-lg bg-gray-100 overflow-hidden">
                    {formData.cover_image_url ? (
                      <img
                        src={formData.cover_image_url}
                        alt="Capa"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  
                  {isEditing && (
                    <div className="absolute top-4 right-4">
                      <input 
                        type="file" 
                        id="cover-upload" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleCoverUpload}
                        disabled={uploadingCover}
                      />
                      <label 
                        htmlFor="cover-upload" 
                        className="bg-gray-800 bg-opacity-70 text-white px-3 py-1.5 rounded-md text-sm cursor-pointer hover:bg-opacity-90 flex items-center gap-1"
                      >
                        {uploadingCover ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        <span>Alterar Capa</span>
                      </label>
                    </div>
                  )}
                  
                  <div className="absolute -bottom-10 left-6">
                    <div className="w-20 h-20 rounded-full border-4 border-white bg-white overflow-hidden">
                      {formData.logo_url ? (
                        <img
                          src={formData.logo_url}
                          alt="Logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                          <Building className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    
                    {isEditing && (
                      <div className="absolute -bottom-1 -right-1">
                        <input 
                          type="file" 
                          id="logo-upload" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleLogoUpload}
                          disabled={uploadingLogo}
                        />
                        <label 
                          htmlFor="logo-upload" 
                          className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer hover:bg-blue-700"
                        >
                          {uploadingLogo ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Plus className="w-3 h-3" />
                          )}
                        </label>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Formulário ou Visualização */}
                <div className="mt-12">
                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Razão Social <span className="text-red-500">*</span>
                          </label>
                          <Input
                            name="company_name"
                            value={formData.company_name}
                            onChange={handleInputChange}
                            placeholder="Razão Social"
                            required
                          />
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nome Fantasia
                          </label>
                          <Input
                            name="trade_name"
                            value={formData.trade_name}
                            onChange={handleInputChange}
                            placeholder="Nome Fantasia"
                          />
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            CNPJ <span className="text-red-500">*</span>
                          </label>
                          <Input
                            name="cnpj"
                            value={formData.cnpj}
                            onChange={handleInputChange}
                            placeholder="XX.XXX.XXX/XXXX-XX"
                            required
                          />
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Endereço
                          </label>
                          <Input
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Endereço completo"
                          />
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cidade <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="city_id"
                            value={formData.city_id}
                            onChange={handleInputChange}
                            className="w-full rounded-md border border-gray-300 p-2 text-sm"
                            required
                          >
                            <option value="">Selecione uma cidade</option>
                            {cities.map(city => (
                              <option key={city.id} value={city.id}>
                                {city.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Segmento
                          </label>
                          <select
                            name="segment"
                            value={formData.segment}
                            onChange={handleInputChange}
                            className="w-full rounded-md border border-gray-300 p-2 text-sm"
                          >
                            <option value="hospedagem">Hospedagem</option>
                            <option value="alimentacao">Alimentação</option>
                            <option value="passeios">Passeios</option>
                            <option value="esportes">Esportes</option>
                            <option value="transporte">Transporte</option>
                            <option value="outros">Outros</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descrição
                          </label>
                          <Textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Descreva brevemente sua empresa"
                            rows={4}
                          />
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Telefone <span className="text-red-500">*</span>
                          </label>
                          <Input
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="(XX) XXXXX-XXXX"
                            required
                          />
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            E-mail Comercial <span className="text-red-500">*</span>
                          </label>
                          <Input
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="email@empresa.com"
                            type="email"
                            required
                          />
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Website
                          </label>
                          <Input
                            name="website"
                            value={formData.website}
                            onChange={handleInputChange}
                            placeholder="https://www.seusite.com.br"
                          />
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Redes Sociais
                          </label>
                          <div className="space-y-2">
                            <Input
                              placeholder="Facebook"
                              value={formData.social_media?.facebook || ""}
                              onChange={(e) => handleSocialMediaChange("facebook", e.target.value)}
                            />
                            <Input
                              placeholder="Instagram"
                              value={formData.social_media?.instagram || ""}
                              onChange={(e) => handleSocialMediaChange("instagram", e.target.value)}
                            />
                            <Input
                              placeholder="Twitter"
                              value={formData.social_media?.twitter || ""}
                              onChange={(e) => handleSocialMediaChange("twitter", e.target.value)}
                            />
                            <Input
                              placeholder="LinkedIn"
                              value={formData.social_media?.linkedin || ""}
                              onChange={(e) => handleSocialMediaChange("linkedin", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        {!advertiser ? (
                          <div className="p-4 bg-blue-50 rounded-lg text-blue-700">
                            <h3 className="font-medium flex items-center gap-2 mb-2">
                              <AlertCircle className="w-5 h-5" />
                              Complete seu perfil
                            </h3>
                            <p className="text-sm">
                              Preencha todas as informações necessárias para começar a criar anúncios.
                            </p>
                            <Button 
                              className="mt-3 bg-blue-600 hover:bg-blue-700"
                              onClick={() => setIsEditing(true)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Completar Perfil
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div>
                              <h3 className="text-lg font-medium mb-1">{formData.company_name}</h3>
                              {formData.trade_name && (
                                <p className="text-gray-600">{formData.trade_name}</p>
                              )}
                              <Badge className="mt-2 bg-blue-100 text-blue-800">
                                {formatSegment(formData.segment)}
                              </Badge>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium text-gray-500 mb-1">CNPJ</h4>
                              <p>{formData.cnpj}</p>
                            </div>
                            
                            {formData.description && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Descrição</h4>
                                <p className="text-gray-700">{formData.description}</p>
                              </div>
                            )}
                            
                            {formData.address && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Endereço</h4>
                                <p className="text-gray-700">{formData.address}</p>
                              </div>
                            )}
                            
                            <div>
                              <h4 className="text-sm font-medium text-gray-500 mb-1">Cidade</h4>
                              <p className="text-gray-700">{getCityName(formData.city_id)}</p>
                            </div>
                          </>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        {advertiser && (
                          <>
                            <div>
                              <h4 className="text-sm font-medium text-gray-500 mb-1">Contato</h4>
                              <div className="space-y-1">
                                <p className="text-gray-700">{formData.phone}</p>
                                <p className="text-gray-700">{formData.email}</p>
                              </div>
                            </div>
                            
                            {formData.website && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Website</h4>
                                <a 
                                  href={formData.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {formData.website}
                                </a>
                              </div>
                            )}
                            
                            {(formData.social_media?.facebook || formData.social_media?.instagram ||
                              formData.social_media?.twitter || formData.social_media?.linkedin) && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Redes Sociais</h4>
                                <div className="flex gap-3">
                                  {formData.social_media?.facebook && (
                                    <a 
                                      href={formData.social_media.facebook} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800"
                                    >
                                      Facebook
                                    </a>
                                  )}
                                  {formData.social_media?.instagram && (
                                    <a 
                                      href={formData.social_media.instagram} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-purple-600 hover:text-purple-800"
                                    >
                                      Instagram
                                    </a>
                                  )}
                                  {formData.social_media?.twitter && (
                                    <a 
                                      href={formData.social_media.twitter} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-400 hover:text-blue-600"
                                    >
                                      Twitter
                                    </a>
                                  )}
                                  {formData.social_media?.linkedin && (
                                    <a 
                                      href={formData.social_media.linkedin} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-700 hover:text-blue-900"
                                    >
                                      LinkedIn
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            <div>
                              <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
                              {advertiser.status === "pending" ? (
                                <Badge className="bg-blue-100 text-blue-800">Aprovação Pendente</Badge>
                              ) : advertiser.status === "active" ? (
                                <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                              ) : advertiser.status === "suspended" ? (
                                <Badge className="bg-red-100 text-red-800">Suspenso</Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-800">Cancelado</Badge>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              
              {isEditing && (
                <CardFooter className="border-t pt-4">
                  <div className="flex justify-end gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditing(false)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={handleSaveProfile}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Salvar Perfil
                    </Button>
                  </div>
                </CardFooter>
              )}
            </Card>
          </TabsContent>
          
          <TabsContent value="advertisements">
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle>Meus Anúncios</CardTitle>
                    {advertiser && advertiser.status === "active" && (
                      <Button
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          setAdvertisementFormData({
                            title: "",
                            description: "",
                            type: "banner",
                            placement: "home",
                            image_url: "",
                            city_id: "",
                            link_url: "",
                            start_date: format(new Date(), "yyyy-MM-dd"),
                            end_date: format(new Date(new Date().setMonth(new Date().getMonth() + 1)), "yyyy-MM-dd"),
                            budget: 0,
                          });
                          setEditingAdId(null);
                          setShowAdForm(true);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Anúncio
                      </Button>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  {!advertiser || advertiser.status !== "active" ? (
                    <div className="p-6 bg-amber-50 rounded-lg">
                      <div className="flex gap-3 items-start">
                        <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-medium text-amber-800 mb-1">Perfil em aprovação</h3>
                          <p className="text-amber-700">
                            {!advertiser ? (
                              "Complete seu perfil para poder criar anúncios."
                            ) : (
                              "Seu perfil está aguardando aprovação. Você poderá criar anúncios assim que for aprovado."
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : showAdForm ? (
                    <div className="border rounded-lg p-4">
                      <h3 className="text-lg font-medium mb-4">
                        {editingAdId ? "Editar Anúncio" : "Novo Anúncio"}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Título <span className="text-red-500">*</span>
                            </label>
                            <Input
                              name="title"
                              value={advertisementFormData.title}
                              onChange={handleAdInputChange}
                              placeholder="Título do anúncio"
                              required
                            />
                          </div>
                          
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Descrição
                            </label>
                            <Textarea
                              name="description"
                              value={advertisementFormData.description}
                              onChange={handleAdInputChange}
                              placeholder="Descreva seu anúncio"
                              rows={3}
                            />
                          </div>
                          
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Tipo de Anúncio <span className="text-red-500">*</span>
                            </label>
                            <select
                              name="type"
                              value={advertisementFormData.type}
                              onChange={handleAdInputChange}
                              className="w-full rounded-md border border-gray-300 p-2 text-sm"
                              required
                            >
                              <option value="banner">Banner</option>
                              <option value="destaque">Destaque</option>
                              <option value="card">Card</option>
                              <option value="popup">Pop-up</option>
                              <option value="newsletter">Newsletter</option>
                            </select>
                          </div>
                          
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Local de Exibição <span className="text-red-500">*</span>
                            </label>
                            <select
                              name="placement"
                              value={advertisementFormData.placement}
                              onChange={handleAdInputChange}
                              className="w-full rounded-md border border-gray-300 p-2 text-sm"
                              required
                            >
                              <option value="home">Página Inicial</option>
                              <option value="city">Página de Cidade</option>
                              <option value="beach">Página de Praia</option>
                              <option value="listing">Listagem</option>
                              <option value="community">Comunidade</option>
                              <option value="search">Resultados de Busca</option>
                              <option value="multiple">Várias Páginas</option>
                            </select>
                          </div>
                          
                          {(advertisementFormData.placement === "city" || advertisementFormData.placement === "beach") && (
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cidade
                              </label>
                              <select
                                name="city_id"
                                value={advertisementFormData.city_id}
                                onChange={handleAdInputChange}
                                className="w-full rounded-md border border-gray-300 p-2 text-sm"
                              >
                                <option value="">Todas as cidades</option>
                                {cities.map(city => (
                                  <option key={city.id} value={city.id}>
                                    {city.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Link de Destino
                            </label>
                            <Input
                              name="link_url"
                              value={advertisementFormData.link_url}
                              onChange={handleAdInputChange}
                              placeholder="https://www.exemplo.com.br"
                            />
                          </div>
                          
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Imagem do Anúncio <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-2">
                              <Input
                                name="image_url"
                                value={advertisementFormData.image_url}
                                onChange={handleAdInputChange}
                                placeholder="URL da imagem"
                                className="flex-1"
                                required
                              />
                              <div>
                                <input 
                                  type="file" 
                                  id="ad-image-upload" 
                                  className="hidden" 
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                  disabled={uploadingImage}
                                />
                                <label htmlFor="ad-image-upload">
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    className="h-10"
                                    disabled={uploadingImage}
                                  >
                                    {uploadingImage ? (
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                      <Upload className="w-4 h-4 mr-2" />
                                    )}
                                    Upload
                                  </Button>
                                </label>
                              </div>
                            </div>
                          </div>
                          
                          {advertisementFormData.image_url && (
                            <div className="mb-4">
                              <div className="border rounded-md p-2 mt-2">
                                <img 
                                  src={advertisementFormData.image_url} 
                                  alt="Preview" 
                                  className="max-h-32 mx-auto object-contain"
                                  onError={(e) => e.target.src = "https://via.placeholder.com/300x150?text=Imagem+do+Anúncio"}
                                />
                              </div>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Data de Início <span className="text-red-500">*</span>
                              </label>
                              <Input
                                name="start_date"
                                value={advertisementFormData.start_date}
                                onChange={handleAdInputChange}
                                type="date"
                                required
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Data de Término <span className="text-red-500">*</span>
                              </label>
                              <Input
                                name="end_date"
                                value={advertisementFormData.end_date}
                                onChange={handleAdInputChange}
                                type="date"
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Orçamento (R$)
                            </label>
                            <Input
                              name="budget"
                              value={advertisementFormData.budget}
                              onChange={handleAdInputChange}
                              type="number"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-3 mt-6">
                        <Button 
                          variant="outline" 
                          onClick={() => setShowAdForm(false)}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={handleCreateAd}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          {editingAdId ? "Atualizar Anúncio" : "Criar Anúncio"}
                        </Button>
                      </div>
                    </div>
                  ) : advertisements.length === 0 ? (
                    <div className="text-center py-8">
                      <ImageIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhum anúncio criado</h3>
                      <p className="text-gray-500 mb-6">
                        Comece a criar anúncios para promover seu negócio
                      </p>
                      <Button
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => setShowAdForm(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Anúncio
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {advertisements.map((ad) => (
                        <div 
                          key={ad.id} 
                          className={`border rounded-lg overflow-hidden ${
                            isAdActive(ad) ? 'border-green-200' : 'border-gray-200'
                          }`}
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="overflow-hidden h-40 md:h-auto">
                              <img
                                src={ad.image_url}
                                alt={ad.title}
                                className="w-full h-full object-cover"
                                onError={(e) => e.target.src = "https://via.placeholder.com/300x150?text=Anúncio"}
                              />
                            </div>
                            
                            <div className="p-4 md:col-span-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium text-lg">{ad.title}</h3>
                                  <div className="flex flex-wrap gap-2 mt-1 mb-2">
                                    {getStatusBadge(ad.status)}
                                    <Badge className="bg-gray-100 text-gray-800 font-normal">
                                      {formatAdType(ad.type)}
                                    </Badge>
                                    <Badge className="bg-gray-100 text-gray-800 font-normal">
                                      {formatPlacement(ad.placement)}
                                    </Badge>
                                  </div>
                                </div>
                                
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handlePauseResumeAd(ad)}
                                    title={ad.status === "active" ? "Pausar" : "Resumir"}
                                  >
                                    {ad.status === "active" ? (
                                      <EyeOff className="w-4 h-4 text-gray-600" />
                                    ) : (
                                      <Eye className="w-4 h-4 text-gray-600" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleEditAd(ad)}
                                    title="Editar"
                                  >
                                    <Edit className="w-4 h-4 text-blue-600" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleDeleteAd(ad.id)}
                                    title="Excluir"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </Button>
                                </div>
                              </div>
                              
                              {ad.description && (
                                <p className="text-gray-600 text-sm my-2">{ad.description}</p>
                              )}
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                                <div>
                                  <div className="flex items-center gap-1 text-sm text-gray-500">
                                    <Calendar className="w-4 h-4" />
                                    <span>Período:</span>
                                  </div>
                                  <p className="text-sm">
                                    {format(new Date(ad.start_date), "dd/MM/yyyy")} - {format(new Date(ad.end_date), "dd/MM/yyyy")}
                                  </p>
                                </div>
                                
                                <div>
                                  <div className="flex items-center gap-1 text-sm text-gray-500">
                                    <DollarSign className="w-4 h-4" />
                                    <span>Orçamento:</span>
                                  </div>
                                  <p className="text-sm">
                                    R$ {ad.budget ? ad.budget.toFixed(2).replace('.', ',') : '0,00'}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                                <div>
                                  <div className="flex items-center gap-1 text-sm text-gray-500">
                                    <AreaChart className="w-4 h-4" />
                                    <span>Visualizações:</span>
                                  </div>
                                  <p className="text-sm">{ad.views_count || 0}</p>
                                </div>
                                
                                <div>
                                  <div className="flex items-center gap-1 text-sm text-gray-500">
                                    <AreaChart className="w-4 h-4" />
                                    <span>Cliques:</span>
                                  </div>
                                  <p className="text-sm">{ad.clicks_count || 0}</p>
                                </div>
                                
                                <div>
                                  <div className="flex items-center gap-1 text-sm text-gray-500">
                                    <Target className="w-4 h-4" />
                                    <span>Taxa de conversão:</span>
                                  </div>
                                  <p className="text-sm">
                                    {ad.views_count > 0 
                                      ? ((ad.clicks_count / ad.views_count) * 100).toFixed(2)
                                      : '0.00'}%
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="statistics">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle>Desempenho dos Anúncios</CardTitle>
                  <Button variant="outline" size="sm">
                    Últimos 30 dias
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                {advertisements.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart4 className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Sem dados disponíveis</h3>
                    <p className="text-gray-500 mb-6">
                      Você precisa criar anúncios para ver estatísticas
                    </p>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => setShowAdForm(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Anúncio
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <AreaChart className="w-5 h-5" />
                          <h3 className="font-medium">Total de Visualizações</h3>
                        </div>
                        <p className="text-3xl font-bold mt-2">
                          {advertisements.reduce((sum, ad) => sum + (ad.views_count || 0), 0)}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <AreaChart className="w-5 h-5" />
                          <h3 className="font-medium">Total de Cliques</h3>
                        </div>
                        <p className="text-3xl font-bold mt-2">
                          {advertisements.reduce((sum, ad) => sum + (ad.clicks_count || 0), 0)}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Target className="w-5 h-5" />
                          <h3 className="font-medium">Taxa de Conversão</h3>
                        </div>
                        <p className="text-3xl font-bold mt-2">
                          {(() => {
                            const totalViews = advertisements.reduce((sum, ad) => sum + (ad.views_count || 0), 0);
                            const totalClicks = advertisements.reduce((sum, ad) => sum + (ad.clicks_count || 0), 0);
                            return totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : '0.00';
                          })()}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-700">Desempenho por Anúncio</h3>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <table className="w-full">
                          <thead>
                            <tr className="text-left text-gray-500 text-sm">
                              <th className="pb-2">Anúncio</th>
                              <th className="pb-2">Tipo</th>
                              <th className="pb-2">Visualizações</th>
                              <th className="pb-2">Cliques</th>
                              <th className="pb-2">Taxa</th>
                              <th className="pb-2 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {advertisements.map(ad => (
                              <tr key={ad.id} className="text-sm">
                                <td className="py-3 font-medium">{ad.title}</td>
                                <td>{formatAdType(ad.type)}</td>
                                <td>{ad.views_count || 0}</td>
                                <td>{ad.clicks_count || 0}</td>
                                <td>
                                  {ad.views_count > 0 
                                    ? ((ad.clicks_count / ad.views_count) * 100).toFixed(2)
                                    : '0.00'}%
                                </td>
                                <td className="text-right">
                                  {getStatusBadge(ad.status)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="h-64 bg-gray-50 border rounded-md p-3 flex items-center justify-center">
                        <div className="text-center text-gray-400">
                          <PieChart className="w-8 h-8 mx-auto mb-2" />
                          <p>Gráficos detalhados serão implementados em breve</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="messages">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Mensagens e Notificações</CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="py-8 text-center">
                  <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhuma mensagem</h3>
                  <p className="text-gray-500 mb-6">
                    Você não tem mensagens ou notificações no momento
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button variant="outline">
                      <Flag className="w-4 h-4 mr-2" />
                      Suporte
                    </Button>
                    <Button variant="outline">
                      <Share2 className="w-4 h-4 mr-2" />
                      Convidar Contatos
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}