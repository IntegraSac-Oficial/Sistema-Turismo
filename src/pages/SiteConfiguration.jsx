
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { SiteConfig } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadFile } from "@/api/integrations";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ColorPicker from "@/components/banners/ColorPicker";
import PreviewBanner from "@/components/banners/PreviewBanner";
import { 
  Save, 
  Loader2, 
  Upload, 
  Image, 
  LogIn, 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Youtube, 
  Mail, 
  Phone, 
  CopyCheck, 
  AlertTriangle, 
  RefreshCw,
  RotateCw,
  Check,
  ChevronLeft,
  Settings,
  ExternalLink
} from "lucide-react";
import BackButton from "@/components/ui/BackButton";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils"; 

export default function SiteConfiguration() {
  const navigate = useNavigate();
  const [config, setConfig] = useState({
    geral: {
      site_name: "Praias Catarinenses",
      contact_email: "",
      contact_phone: "",
      footer_copyright: ""
    },
    aparencia: {
      logo_url: "",
      logo_width: 200,
      logo_height: 60,
      primary_color: "#007BFF",
      secondary_color: "#FF5722",
      banner_text: "",
      banner_background: "",
      banner_text_color: "",
      banner_enabled: false
    },
    pagamentos: {
      gateway: "pix_direto",
      mercadopago: {
        public_key: "",
        access_token: "",
        client_id: "",
        client_secret: ""
      },
      pix: {
        key: "",
        key_type: "CPF",
        beneficiario: "",
        empresa: "",
        banco_logo_url: "",
        pix_code: "",
        cidade: ""
      }
    },
    redes_sociais: {
      facebook: "",
      instagram: "",
      twitter: "",
      linkedin: "",
      youtube: ""
    },
    banner_header: {
      titulo: "Descubra o Paraíso Catarinense",
      subtitulo: "O guia completo das melhores praias, hotéis, restaurantes e serviços de Santa Catarina",
      tipo_fundo: "cor",
      cor_fundo: "#007BFF",
      imagem_fundo: "",
      botao_primario: {
        texto: "Criar Conta Gratuita",
        cor_fundo: "#ffffff",
        cor_texto: "#007BFF",
        cor_hover: "#e5e7eb",
        link: "/Cadastro"
      },
      botao_secundario: {
        texto: "Ver o melhor Plano",
        cor_fundo: "transparent",
        cor_borda: "#ffffff",
        cor_texto: "#ffffff",
        cor_hover: "rgba(255,255,255,0.1)",
        link: "/SubscriptionPlans"
      }
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savingSuccess, setSavingSuccess] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBannerImage, setUploadingBannerImage] = useState(false);
  const [uploadingPixLogo, setUploadingPixLogo] = useState(false);
  const [activeTab, setActiveTab] = useState("geral");

  const isLightColor = (hexColor) => {
    hexColor = hexColor.replace('#', '');
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      if (userData.role !== 'admin') {
        window.location.href = '/Public';
        return;
      }
      
      const configData = await SiteConfig.list();
      
      if (configData && configData.length > 0) {
        let savedConfig = { ...config };
        
        Object.keys(savedConfig).forEach(section => {
          if (configData[0][section]) {
            if (typeof savedConfig[section] === 'object' && !Array.isArray(savedConfig[section])) {
              savedConfig[section] = {
                ...savedConfig[section],
                ...configData[0][section]
              };
              
              if (section === 'banner_header') {
                if (configData[0][section].botao_primario) {
                  savedConfig[section].botao_primario = {
                    ...savedConfig[section].botao_primario,
                    ...configData[0][section].botao_primario
                  };
                }
                if (configData[0][section].botao_secundario) {
                  savedConfig[section].botao_secundario = {
                    ...savedConfig[section].botao_secundario,
                    ...configData[0][section].botao_secundario
                  };
                }
              }
              
              if (section === 'pagamentos') {
                if (configData[0][section].mercadopago) {
                  savedConfig[section].mercadopago = {
                    ...savedConfig[section].mercadopago,
                    ...configData[0][section].mercadopago
                  };
                }
                if (configData[0][section].pix) {
                  savedConfig[section].pix = {
                    ...savedConfig[section].pix,
                    ...configData[0][section].pix
                  };
                }
              }
            } else {
              savedConfig[section] = configData[0][section];
            }
          }
        });
        
        setConfig(savedConfig);
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedInputChange = (section, nestedSection, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [nestedSection]: {
          ...prev[section][nestedSection],
          [field]: value
        }
      }
    }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingLogo(true);
    try {
      const { file_url } = await UploadFile({ file });
      handleInputChange('aparencia', 'logo_url', file_url);
    } catch (error) {
      console.error("Erro ao fazer upload do logo:", error);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleBannerImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingBannerImage(true);
    try {
      const { file_url } = await UploadFile({ file });
      handleInputChange('banner_header', 'imagem_fundo', file_url);
    } catch (error) {
      console.error("Erro ao fazer upload da imagem de fundo:", error);
    } finally {
      setUploadingBannerImage(false);
    }
  };

  const handlePixLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingPixLogo(true);
    try {
      const { file_url } = await UploadFile({ file });
      handleNestedInputChange('pagamentos', 'pix', 'banco_logo_url', file_url);
    } catch (error) {
      console.error("Erro ao fazer upload do logo do banco:", error);
    } finally {
      setUploadingPixLogo(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSavingSuccess(false);
    
    try {
      const configList = await SiteConfig.list();
      
      if (configList && configList.length > 0) {
        await SiteConfig.update(configList[0].id, config);
      } else {
        await SiteConfig.create(config);
      }
      
      setSavingSuccess(true);
      setTimeout(() => setSavingSuccess(false), 3000);
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <BackButton />
        </div>
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Configurações do Site</h1>
          <Button 
            className="bg-blue-600 hover:bg-blue-700" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Salvar Configurações
          </Button>
        </div>

        <Tabs defaultValue="geral">
          <TabsList className="mb-4 grid grid-cols-5 w-full">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="aparencia">Aparência</TabsTrigger>
            <TabsTrigger value="banner-header">Banner do Header</TabsTrigger>
            <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
            <TabsTrigger value="redes-sociais">Redes Sociais</TabsTrigger>
          </TabsList>

          <TabsContent value="geral">
            <Card>
              <CardHeader>
                <CardTitle>Informações Gerais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="site_name">Nome do Site</Label>
                  <Input
                    id="site_name"
                    value={config.geral.site_name || ""}
                    onChange={(e) => handleInputChange('geral', 'site_name', e.target.value)}
                    placeholder="Nome do site"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Email de Contato</Label>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                    <Input
                      id="contact_email"
                      value={config.geral.contact_email || ""}
                      onChange={(e) => handleInputChange('geral', 'contact_email', e.target.value)}
                      placeholder="contato@seusite.com.br"
                      type="email"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Telefone de Contato</Label>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    <Input
                      id="contact_phone"
                      value={config.geral.contact_phone || ""}
                      onChange={(e) => handleInputChange('geral', 'contact_phone', e.target.value)}
                      placeholder="(XX) XXXXX-XXXX"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="footer_copyright">Copyright do Rodapé</Label>
                  <div className="flex items-center">
                    <CopyCheck className="h-4 w-4 mr-2 text-gray-500" />
                    <Input
                      id="footer_copyright"
                      value={config.geral.footer_copyright || ""}
                      onChange={(e) => handleInputChange('geral', 'footer_copyright', e.target.value)}
                      placeholder="© 2024 Seu Site. Todos os direitos reservados."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="aparencia">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Aparência</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Logo do Site</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <Input
                        value={config.aparencia.logo_url || ""}
                        onChange={(e) => handleInputChange('aparencia', 'logo_url', e.target.value)}
                        placeholder="URL da logo (opcional)"
                      />
                    </div>
                    <div>
                      <div className="relative">
                        <input 
                          type="file" 
                          id="logo-upload" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleLogoUpload}
                        />
                        <label 
                          htmlFor="logo-upload" 
                          className="flex items-center justify-center p-2 border border-gray-300 rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100 w-full"
                        >
                          {uploadingLogo ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4 mr-2" />
                          )}
                          Upload Logo
                        </label>
                      </div>
                    </div>
                    
                    {config.aparencia.logo_url && (
                      <div className="col-span-3 p-4 bg-gray-50 border border-gray-200 rounded-md">
                        <div className="flex items-center justify-center">
                          <img 
                            src={config.aparencia.logo_url} 
                            alt="Logo Preview" 
                            className="max-h-20 object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="logo_width">Largura da Logo (px)</Label>
                    <Input
                      id="logo_width"
                      type="number"
                      value={config.aparencia.logo_width || 200}
                      onChange={(e) => handleInputChange('aparencia', 'logo_width', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="logo_height">Altura da Logo (px)</Label>
                    <Input
                      id="logo_height"
                      type="number"
                      value={config.aparencia.logo_height || 60}
                      onChange={(e) => handleInputChange('aparencia', 'logo_height', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cor Primária</Label>
                    <ColorPicker
                      value={config.aparencia.primary_color || "#007BFF"}
                      onChange={(color) => handleInputChange('aparencia', 'primary_color', color)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Cor Secundária</Label>
                    <ColorPicker
                      value={config.aparencia.secondary_color || "#FF5722"}
                      onChange={(color) => handleInputChange('aparencia', 'secondary_color', color)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="banner_enabled"
                      checked={config.aparencia.banner_enabled}
                      onCheckedChange={(checked) => handleInputChange('aparencia', 'banner_enabled', checked)}
                    />
                    <Label htmlFor="banner_enabled">Exibir banner de anúncio</Label>
                  </div>
                  
                  {config.aparencia.banner_enabled && (
                    <div className="grid grid-cols-1 gap-4 mt-4 p-4 bg-gray-50 rounded-md">
                      <div className="space-y-2">
                        <Label htmlFor="banner_text">Texto do Banner</Label>
                        <Input
                          id="banner_text"
                          value={config.aparencia.banner_text || ""}
                          onChange={(e) => handleInputChange('aparencia', 'banner_text', e.target.value)}
                          placeholder="Texto a ser exibido no banner"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Cor de Fundo do Banner</Label>
                          <ColorPicker
                            value={config.aparencia.banner_background || "#007BFF"}
                            onChange={(color) => handleInputChange('aparencia', 'banner_background', color)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Cor do Texto do Banner</Label>
                          <ColorPicker
                            value={config.aparencia.banner_text_color || "#FFFFFF"}
                            onChange={(color) => handleInputChange('aparencia', 'banner_text_color', color)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="banner-header">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações do Banner do Header</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="banner_title">Título do Banner</Label>
                      <Input
                        id="banner_title"
                        value={config.banner_header.titulo || ""}
                        onChange={(e) => handleInputChange('banner_header', 'titulo', e.target.value)}
                        placeholder="Descubra o Paraíso Catarinense"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="banner_subtitle">Subtítulo do Banner</Label>
                      <Input
                        id="banner_subtitle"
                        value={config.banner_header.subtitulo || ""}
                        onChange={(e) => handleInputChange('banner_header', 'subtitulo', e.target.value)}
                        placeholder="O guia completo das melhores praias, hotéis, restaurantes e serviços de Santa Catarina"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="banner_background_type">Tipo de Fundo</Label>
                      <Select 
                        value={config.banner_header.tipo_fundo} 
                        onValueChange={(value) => handleInputChange('banner_header', 'tipo_fundo', value)}
                      >
                        <SelectTrigger id="banner_background_type">
                          <SelectValue placeholder="Selecione o tipo de fundo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cor">Cor Sólida</SelectItem>
                          <SelectItem value="imagem">Imagem de Fundo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {config.banner_header.tipo_fundo === 'cor' && (
                      <div className="space-y-2">
                        <Label>Cor de Fundo</Label>
                        <ColorPicker
                          value={config.banner_header.cor_fundo || "#007BFF"}
                          onChange={(color) => handleInputChange('banner_header', 'cor_fundo', color)}
                        />
                      </div>
                    )}
                    
                    {config.banner_header.tipo_fundo === 'imagem' && (
                      <div className="space-y-2">
                        <Label>Imagem de Fundo</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="col-span-2">
                            <Input
                              value={config.banner_header.imagem_fundo || ""}
                              onChange={(e) => handleInputChange('banner_header', 'imagem_fundo', e.target.value)}
                              placeholder="URL da imagem de fundo"
                            />
                          </div>
                          <div>
                            <div className="relative">
                              <input 
                                type="file" 
                                id="banner-image-upload" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={handleBannerImageUpload}
                              />
                              <label 
                                htmlFor="banner-image-upload" 
                                className="flex items-center justify-center p-2 border border-gray-300 rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100 w-full"
                              >
                                {uploadingBannerImage ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Upload className="h-4 w-4 mr-2" />
                                )}
                                Upload Imagem
                              </label>
                            </div>
                          </div>
                          
                          {config.banner_header.imagem_fundo && (
                            <div className="col-span-3 p-2 bg-gray-50 border border-gray-200 rounded-md">
                              <div className="aspect-[3/1] overflow-hidden rounded-md">
                                <img 
                                  src={config.banner_header.imagem_fundo} 
                                  alt="Banner Preview" 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Recomendação: imagens 1920x300 pixels.</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                      <div>
                        <h3 className="font-medium text-base mb-4">Botão "Criar Conta Gratuita"</h3>
                        
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="primary_button_text">Texto do Botão</Label>
                            <Input
                              id="primary_button_text"
                              value={config.banner_header.botao_primario.texto || ""}
                              onChange={(e) => handleNestedInputChange('banner_header', 'botao_primario', 'texto', e.target.value)}
                              placeholder="Criar Conta Gratuita"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="primary_button_link">Link do Botão</Label>
                            <Input
                              id="primary_button_link"
                              value={config.banner_header.botao_primario.link || ""}
                              onChange={(e) => handleNestedInputChange('banner_header', 'botao_primario', 'link', e.target.value)}
                              placeholder="/Cadastro"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Cor de Fundo</Label>
                              <ColorPicker
                                value={config.banner_header.botao_primario.cor_fundo || "#ffffff"}
                                onChange={(color) => handleNestedInputChange('banner_header', 'botao_primario', 'cor_fundo', color)}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Cor do Texto</Label>
                              <ColorPicker
                                value={config.banner_header.botao_primario.cor_texto || "#007BFF"}
                                onChange={(color) => handleNestedInputChange('banner_header', 'botao_primario', 'cor_texto', color)}
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Cor de Hover</Label>
                            <ColorPicker
                              value={config.banner_header.botao_primario.cor_hover || "#e5e7eb"}
                              onChange={(color) => handleNestedInputChange('banner_header', 'botao_primario', 'cor_hover', color)}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-base mb-4">Botão "Ver o melhor Plano"</h3>
                        
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="secondary_button_text">Texto do Botão</Label>
                            <Input
                              id="secondary_button_text"
                              value={config.banner_header.botao_secundario.texto || ""}
                              onChange={(e) => handleNestedInputChange('banner_header', 'botao_secundario', 'texto', e.target.value)}
                              placeholder="Ver o melhor Plano"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="secondary_button_link">Link do Botão</Label>
                            <Input
                              id="secondary_button_link"
                              value={config.banner_header.botao_secundario.link || ""}
                              onChange={(e) => handleNestedInputChange('banner_header', 'botao_secundario', 'link', e.target.value)}
                              placeholder="/SubscriptionPlans"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Cor de Fundo</Label>
                              <ColorPicker
                                value={config.banner_header.botao_secundario.cor_fundo || "transparent"}
                                onChange={(color) => handleNestedInputChange('banner_header', 'botao_secundario', 'cor_fundo', color)}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Cor da Borda</Label>
                              <ColorPicker
                                value={config.banner_header.botao_secundario.cor_borda || "#ffffff"}
                                onChange={(color) => handleNestedInputChange('banner_header', 'botao_secundario', 'cor_borda', color)}
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Cor do Texto</Label>
                              <ColorPicker
                                value={config.banner_header.botao_secundario.cor_texto || "#ffffff"}
                                onChange={(color) => handleNestedInputChange('banner_header', 'botao_secundario', 'cor_texto', color)}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Cor de Hover</Label>
                              <ColorPicker
                                value={config.banner_header.botao_secundario.cor_hover || "rgba(255,255,255,0.1)"}
                                onChange={(color) => handleNestedInputChange('banner_header', 'botao_secundario', 'cor_hover', color)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Visualização do Banner</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PreviewBanner bannerConfig={config.banner_header} />
                    
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                      <h4 className="flex items-center text-yellow-800 font-medium mb-2">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Dicas
                      </h4>
                      <ul className="text-sm text-yellow-700 space-y-2">
                        <li>• Esta visualização é apenas uma simulação</li>
                        <li>• Caso escolha uma imagem de fundo, certifique-se que tenha uma boa resolução</li>
                        <li>• As cores dos botões podem ser personalizadas para combinar com o fundo</li>
                        <li>• Salve as configurações para ver o resultado no site</li>
                      </ul>
                    </div>
                    
                    <Button 
                      onClick={handleSave}
                      disabled={isSaving}
                      variant="outline"
                      className="w-full mt-4"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Salvar Configurações
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="pagamentos">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="payment_gateway">Gateway de Pagamento</Label>
                  <Select 
                    value={config.pagamentos.gateway} 
                    onValueChange={(value) => handleInputChange('pagamentos', 'gateway', value)}
                  >
                    <SelectTrigger id="payment_gateway">
                      <SelectValue placeholder="Selecione o gateway de pagamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mercadopago">MercadoPago</SelectItem>
                      <SelectItem value="pix_direto">PIX Direto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {config.pagamentos.gateway === 'mercadopago' && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-md">
                    <h3 className="font-medium text-lg mb-2">Configuração MercadoPago</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="mp_public_key">Chave Pública</Label>
                      <Input
                        id="mp_public_key"
                        value={config.pagamentos.mercadopago.public_key || ""}
                        onChange={(e) => handleNestedInputChange('pagamentos', 'mercadopago', 'public_key', e.target.value)}
                        placeholder="PUBLIC_KEY"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="mp_access_token">Access Token</Label>
                      <Input
                        id="mp_access_token"
                        type="password"
                        value={config.pagamentos.mercadopago.access_token || ""}
                        onChange={(e) => handleNestedInputChange('pagamentos', 'mercadopago', 'access_token', e.target.value)}
                        placeholder="ACCESS_TOKEN"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="mp_client_id">Client ID</Label>
                        <Input
                          id="mp_client_id"
                          value={config.pagamentos.mercadopago.client_id || ""}
                          onChange={(e) => handleNestedInputChange('pagamentos', 'mercadopago', 'client_id', e.target.value)}
                          placeholder="CLIENT_ID"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="mp_client_secret">Client Secret</Label>
                        <Input
                          id="mp_client_secret"
                          type="password"
                          value={config.pagamentos.mercadopago.client_secret || ""}
                          onChange={(e) => handleNestedInputChange('pagamentos', 'mercadopago', 'client_secret', e.target.value)}
                          placeholder="CLIENT_SECRET"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {config.pagamentos.gateway === 'pix_direto' && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-md">
                    <h3 className="font-medium text-lg mb-2">Configuração PIX</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="pix_key">Chave PIX</Label>
                        <Input
                          id="pix_key"
                          value={config.pagamentos.pix.key || ""}
                          onChange={(e) => handleNestedInputChange('pagamentos', 'pix', 'key', e.target.value)}
                          placeholder="Sua chave PIX"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="pix_key_type">Tipo de Chave</Label>
                        <Select 
                          value={config.pagamentos.pix.key_type} 
                          onValueChange={(value) => handleNestedInputChange('pagamentos', 'pix', 'key_type', value)}
                        >
                          <SelectTrigger id="pix_key_type">
                            <SelectValue placeholder="Tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CPF">CPF</SelectItem>
                            <SelectItem value="CNPJ">CNPJ</SelectItem>
                            <SelectItem value="EMAIL">Email</SelectItem>
                            <SelectItem value="TELEFONE">Telefone</SelectItem>
                            <SelectItem value="CHAVE_ALEATORIA">Chave Aleatória</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pix_beneficiario">Nome do Beneficiário</Label>
                        <Input
                          id="pix_beneficiario"
                          value={config.pagamentos.pix.beneficiario || ""}
                          onChange={(e) => handleNestedInputChange('pagamentos', 'pix', 'beneficiario', e.target.value)}
                          placeholder="Nome completo"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="pix_empresa">Nome da Empresa</Label>
                        <Input
                          id="pix_empresa"
                          value={config.pagamentos.pix.empresa || ""}
                          onChange={(e) => handleNestedInputChange('pagamentos', 'pix', 'empresa', e.target.value)}
                          placeholder="Nome da empresa (opcional)"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pix_cidade">Cidade</Label>
                        <Input
                          id="pix_cidade"
                          value={config.pagamentos.pix.cidade || ""}
                          onChange={(e) => handleNestedInputChange('pagamentos', 'pix', 'cidade', e.target.value)}
                          placeholder="Cidade"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="pix_code">Código PIX (opcional)</Label>
                        <Input
                          id="pix_code"
                          value={config.pagamentos.pix.pix_code || ""}
                          onChange={(e) => handleNestedInputChange('pagamentos', 'pix', 'pix_code', e.target.value)}
                          placeholder="Código PIX completo (opcional)"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Logo do Banco</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="col-span-2">
                          <Input
                            value={config.pagamentos.pix.banco_logo_url || ""}
                            onChange={(e) => handleNestedInputChange('pagamentos', 'pix', 'banco_logo_url', e.target.value)}
                            placeholder="URL do logo do banco (opcional)"
                          />
                        </div>
                        <div>
                          <div className="relative">
                            <input 
                              type="file" 
                              id="pix-logo-upload" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={handlePixLogoUpload}
                            />
                            <label 
                              htmlFor="pix-logo-upload" 
                              className="flex items-center justify-center p-2 border border-gray-300 rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100 w-full"
                            >
                              {uploadingPixLogo ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Upload className="h-4 w-4 mr-2" />
                              )}
                              Upload Logo
                            </label>
                          </div>
                        </div>
                        
                        {config.pagamentos.pix.banco_logo_url && (
                          <div className="col-span-3 p-2 bg-gray-50 border border-gray-200 rounded-md">
                            <div className="flex items-center justify-center">
                              <img 
                                src={config.pagamentos.pix.banco_logo_url} 
                                alt="Logo Banco" 
                                className="max-h-16 object-contain"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="redes-sociais">
            <Card>
              <CardHeader>
                <CardTitle>Redes Sociais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="facebook_url" className="flex items-center">
                    <Facebook className="h-4 w-4 mr-2 text-[#1877F2]" />
                    Facebook
                  </Label>
                  <Input
                    id="facebook_url"
                    value={config.redes_sociais.facebook || ""}
                    onChange={(e) => handleInputChange('redes_sociais', 'facebook', e.target.value)}
                    placeholder="https://facebook.com/seusite"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="instagram_url" className="flex items-center">
                    <Instagram className="h-4 w-4 mr-2 text-[#E4405F]" />
                    Instagram
                  </Label>
                  <Input
                    id="instagram_url"
                    value={config.redes_sociais.instagram || ""}
                    onChange={(e) => handleInputChange('redes_sociais', 'instagram', e.target.value)}
                    placeholder="https://instagram.com/seusite"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="twitter_url" className="flex items-center">
                    <Twitter className="h-4 w-4 mr-2 text-[#1DA1F2]" />
                    Twitter/X
                  </Label>
                  <Input
                    id="twitter_url"
                    value={config.redes_sociais.twitter || ""}
                    onChange={(e) => handleInputChange('redes_sociais', 'twitter', e.target.value)}
                    placeholder="https://twitter.com/seusite"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="linkedin_url" className="flex items-center">
                    <Linkedin className="h-4 w-4 mr-2 text-[#0A66C2]" />
                    LinkedIn
                  </Label>
                  <Input
                    id="linkedin_url"
                    value={config.redes_sociais.linkedin || ""}
                    onChange={(e) => handleInputChange('redes_sociais', 'linkedin', e.target.value)}
                    placeholder="https://linkedin.com/company/seusite"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="youtube_url" className="flex items-center">
                    <Youtube className="h-4 w-4 mr-2 text-[#FF0000]" />
                    YouTube
                  </Label>
                  <Input
                    id="youtube_url"
                    value={config.redes_sociais.youtube || ""}
                    onChange={(e) => handleInputChange('redes_sociais', 'youtube', e.target.value)}
                    placeholder="https://youtube.com/c/seusite"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-10 border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">Banner do Clube de Benefícios</h2>
          <div className="grid gap-4">
            <p className="text-sm text-gray-500">
              Configure o banner do clube de benefícios que será exibido na página inicial e outras páginas do site.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate(createPageUrl("ClubConfiguration"))}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Configurar Banner do Clube de Benefícios
                </Button>
              </div>
              <div className="flex items-center">
                <Link 
                  to={createPageUrl("Public")} 
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Ver página inicial com o banner
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
