
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities"; 
import { Tourist } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch"; // Importado para opção do QR Code
import { UploadFile } from "@/api/integrations";
import { Loader2, Upload, Save, Waves, Check, Image, RefreshCw, QrCode } from "lucide-react";
import BackButton from "@/components/ui/BackButton";
import MembershipCard from "../components/tourists/MembershipCard";
import { format } from "date-fns";

export default function CardSettings() {
  const [user, setUser] = useState(null);
  const [touristData, setTouristData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("cartao");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const [uploadingFrontDesign, setUploadingFrontDesign] = useState(false);
  
  const [settings, setSettings] = useState({
    membership_card_bg_url: "",
    membership_logo_url: "",
    membership_card_front_design_url: "",
    show_qr_code_on_front: true // Nova configuração para posição do QR Code
  });

  const [previewTourist] = useState({
    id: "preview",
    user_code: "DEMO123",
    subscription_date: format(new Date(), "yyyy-MM-dd")
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);
      
      setSettings({
        membership_card_bg_url: userData.membership_card_bg_url || "",
        membership_logo_url: userData.membership_logo_url || "",
        membership_card_front_design_url: userData.membership_card_front_design_url || "",
        show_qr_code_on_front: userData.show_qr_code_on_front !== false // Default para true se não estiver definido
      });
      
      if (userData.role === 'tourist' || userData.tourist_id) {
        try {
          let touristInfo = null;
          if (userData.tourist_id) {
            touristInfo = await Tourist.get(userData.tourist_id);
          } else {
            const tourists = await Tourist.filter({ user_id: userData.id });
            touristInfo = tourists?.[0] || null;
          }
          
          if (touristInfo) {
            setTouristData(touristInfo);
          }
        } catch (err) {
          console.error("Erro ao buscar dados do turista:", err);
        }
      }
      
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
    }
    setIsLoading(false);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingLogo(true);
    try {
      const { file_url } = await UploadFile({ file });
      setSettings(prev => ({ ...prev, membership_logo_url: file_url }));
    } catch (error) {
      console.error("Erro ao fazer upload da logo:", error);
    }
    setUploadingLogo(false);
  };

  const handleBackgroundUpload = async (e) => { // Este é para o fundo do VERSO
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingBackground(true);
    try {
      const { file_url } = await UploadFile({ file });
      setSettings(prev => ({ ...prev, membership_card_bg_url: file_url }));
    } catch (error) {
      console.error("Erro ao fazer upload do background:", error);
    }
    setUploadingBackground(false);
  };

  const handleFrontDesignUpload = async (e) => { // Novo handler
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingFrontDesign(true);
    try {
      const { file_url } = await UploadFile({ file });
      setSettings(prev => ({ ...prev, membership_card_front_design_url: file_url }));
    } catch (error) {
      console.error("Erro ao fazer upload do design da frente:", error);
    }
    setUploadingFrontDesign(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  // Handler para o switch de QR Code
  const handleQrCodeToggle = (checked) => {
    setSettings(prev => ({ ...prev, show_qr_code_on_front: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await User.updateMyUserData(settings); 
      await loadUserData();
      
      const successMessage = document.getElementById("success-message");
      successMessage.classList.remove("opacity-0");
      setTimeout(() => {
        successMessage.classList.add("opacity-0");
      }, 3000);
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
    }
    
    setIsSaving(false);
  };

  const resetToDefaults = () => {
    setSettings({
      membership_card_bg_url: "",
      membership_logo_url: "",
      membership_card_front_design_url: "",
      show_qr_code_on_front: true
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
          <p className="text-gray-500">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <BackButton />
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Configurações do Cartão</h1>
          <div className="transition-opacity duration-300 opacity-0" id="success-message">
            <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-md">
              <Check className="w-5 h-5" />
              <span>Configurações salvas com sucesso!</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Personalização do Cartão de Membro</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="cartao" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-6">
                    <TabsTrigger value="cartao">Visualização do Cartão</TabsTrigger>
                    <TabsTrigger value="config">Configurações</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="cartao" className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                      <h3 className="text-blue-800 font-medium flex items-center">
                        <Waves className="w-5 h-5 mr-2" />
                        Seu Cartão do Clube Praias Catarinenses
                      </h3>
                      <p className="text-blue-700 text-sm mt-1">
                        Este cartão é válido em todas as praias de Santa Catarina e dá acesso aos descontos exclusivos para membros do clube.
                      </p>
                    </div>
                  
                    <div className="max-w-md mx-auto">
                      <MembershipCard 
                        tourist={touristData || previewTourist}
                        user={user}
                        cardFrontDesignUrl={settings.membership_card_front_design_url}
                        cardBackBackgroundUrl={settings.membership_card_bg_url}
                        cardLogoUrl={settings.membership_logo_url}
                        showQrCodeOnFront={settings.show_qr_code_on_front}
                        preview={true}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="config">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-4">
                        {/* Opção para posição do QR Code */}
                        <div className="space-y-2 pt-4 border-t">
                          <Label className="flex items-center font-semibold text-gray-700">
                            <QrCode className="w-5 h-5 mr-2 text-indigo-600" />
                            Posicionamento do QR Code
                          </Label>
                          <div className="flex items-center space-x-2">
                            <Switch 
                              id="qr-code-position"
                              checked={settings.show_qr_code_on_front}
                              onCheckedChange={handleQrCodeToggle}
                            />
                            <Label htmlFor="qr-code-position" className="text-sm font-medium text-gray-700">
                              {settings.show_qr_code_on_front ? "QR Code na frente do cartão" : "QR Code no verso do cartão"}
                            </Label>
                          </div>
                          <p className="text-sm text-gray-500">
                            {settings.show_qr_code_on_front 
                              ? "O QR Code será exibido na frente do cartão no canto superior direito, permitindo leitura rápida." 
                              : "O QR Code será exibido no verso do cartão, deixando o design da frente mais limpo."}
                          </p>
                        </div>

                        {/* Configuração da logo */}
                        <div className="space-y-2 pt-4 border-t">
                          <Label className="flex items-center font-semibold text-gray-700">
                            <Image className="w-5 h-5 mr-2 text-indigo-600" />
                            Logo do Cartão (para verso ou padrão)
                          </Label>
                           <p className="text-sm text-gray-500">Esta logo aparecerá no verso do cartão, ou na frente se nenhum design personalizado for definido.</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                            <div className="col-span-2">
                              <Input
                                name="membership_logo_url"
                                value={settings.membership_logo_url}
                                onChange={handleInputChange}
                                placeholder="URL da imagem da logo"
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
                                  disabled={uploadingLogo}
                                />
                                <label 
                                  htmlFor="logo-upload" 
                                  className="w-full flex justify-center items-center py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md cursor-pointer"
                                >
                                  {uploadingLogo ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                  ) : (
                                    <Upload className="w-4 h-4 mr-2" />
                                  )}
                                  Upload Logo
                                </label>
                              </div>
                            </div>
                          </div>
                          
                          {settings.membership_logo_url && (
                            <div className="mt-2 p-4 bg-gray-50 rounded-md">
                             <p className="text-xs text-gray-600 mb-2">Prévia da Logo:</p>
                              <div className="aspect-[3/1] relative overflow-hidden rounded-md border bg-white flex items-center justify-center">
                                <img 
                                  src={settings.membership_logo_url} 
                                  alt="Logo Preview" 
                                  className="max-w-full max-h-full object-contain"
                                  onError={(e) => e.target.src = "https://via.placeholder.com/300x100?text=Logo+Inválida"}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Configuração do fundo da frente (Imagem padrão azul) */}
                        <div className="space-y-2 pt-4 border-t">
                          <Label className="flex items-center font-semibold text-gray-700">
                            <Image className="w-5 h-5 mr-2 text-indigo-600" />
                            Design da Frente do Cartão (Imagem Completa)
                          </Label>
                          <p className="text-sm text-gray-500">Use uma imagem que já contenha o design completo da frente do seu cartão (ex: 850x540 pixels). Os dados dinâmicos (nome, número) serão sobrepostos se o componente do cartão os renderizar.</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                            <div className="col-span-2">
                              <Input
                                name="membership_card_front_design_url"
                                value={settings.membership_card_front_design_url}
                                onChange={handleInputChange}
                                placeholder="URL da imagem de design da frente"
                              />
                            </div>
                            <div>
                              <div className="relative">
                                <input 
                                  type="file" 
                                  id="front-design-upload" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={handleFrontDesignUpload}
                                  disabled={uploadingFrontDesign}
                                />
                                <label 
                                  htmlFor="front-design-upload" 
                                  className="w-full flex justify-center items-center py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md cursor-pointer"
                                >
                                  {uploadingFrontDesign ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                  ) : (
                                    <Upload className="w-4 h-4 mr-2" />
                                  )}
                                  Upload Design
                                </label>
                              </div>
                            </div>
                          </div>
                          
                          {settings.membership_card_front_design_url && (
                            <div className="mt-2 p-4 bg-gray-50 rounded-md">
                              <p className="text-xs text-gray-600 mb-2">Prévia do Design da Frente:</p>
                              <div className="aspect-[1.586] relative overflow-hidden rounded-md border"> {/* Proporção de cartão ~85.6x54 */}
                                <img 
                                  src={settings.membership_card_front_design_url} 
                                  alt="Design da Frente Preview" 
                                  className="w-full h-full object-cover"
                                  onError={(e) => e.target.src = "https://via.placeholder.com/850x540?text=Design+da+Frente+Inválido"}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Configuração do verso (sem conteúdo, apenas decorativo) */}
                        <div className="space-y-2 pt-4 border-t">
                          <Label className="flex items-center font-semibold text-gray-700">
                            <Image className="w-5 h-5 mr-2 text-indigo-600" />
                            Background do Verso do Cartão
                          </Label>
                          <p className="text-sm text-gray-500">Imagem de fundo para o verso do cartão (onde fica o QR Code).</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                            <div className="col-span-2">
                              <Input
                                name="membership_card_bg_url"
                                value={settings.membership_card_bg_url}
                                onChange={handleInputChange}
                                placeholder="URL da imagem de fundo do verso"
                              />
                            </div>
                            
                            <div>
                              <div className="relative">
                                <input 
                                  type="file" 
                                  id="bg-upload" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={handleBackgroundUpload}
                                  disabled={uploadingBackground}
                                />
                                <label 
                                  htmlFor="bg-upload" 
                                  className="w-full flex justify-center items-center py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md cursor-pointer"
                                >
                                  {uploadingBackground ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                  ) : (
                                    <Upload className="w-4 h-4 mr-2" />
                                  )}
                                  Upload Fundo
                                </label>
                              </div>
                            </div>
                          </div>
                          
                          {settings.membership_card_bg_url && (
                            <div className="mt-2 p-4 bg-gray-50 rounded-md">
                              <p className="text-xs text-gray-600 mb-2">Prévia do Fundo do Verso:</p>
                              <div className="aspect-video relative overflow-hidden rounded-md border">
                                <img 
                                  src={settings.membership_card_bg_url} 
                                  alt="Background Verso Preview" 
                                  className="w-full h-full object-cover"
                                  onError={(e) => e.target.src = "https://via.placeholder.com/600x400?text=Fundo+Inválido"}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between pt-6 border-t mt-6">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={resetToDefaults}
                          className="flex items-center"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Restaurar Padrões
                        </Button>
                        
                        <div className="flex gap-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setActiveTab("cartao")}
                          >
                            Visualizar Cartão
                          </Button>
                          
                          <Button 
                            type="submit" 
                            disabled={isSaving || uploadingLogo || uploadingBackground || uploadingFrontDesign}
                            className="flex items-center bg-green-600 hover:bg-green-700 text-white"
                          >
                            {isSaving ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <Save className="w-4 h-4 mr-2" />
                            )}
                            Salvar Configurações
                          </Button>
                        </div>
                      </div>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-orange-50 rounded-md border border-orange-200">
                  <h3 className="text-orange-800 font-semibold">Dicas para as Imagens</h3>
                  <ul className="mt-2 space-y-2 text-sm text-orange-700">
                    <li>• <span className="font-medium">Design da Frente:</span> Idealmente 850x540 pixels. Deve conter o design gráfico completo da frente.</li>
                    <li>• <span className="font-medium">Logo:</span> PNG com fundo transparente. Usada no verso ou na frente padrão.</li>
                    <li>• <span className="font-medium">Fundo do Verso:</span> Imagem para o verso, onde fica o QR Code.</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
                  <h3 className="text-blue-800 font-semibold">Validade do Cartão</h3>
                  <p className="mt-2 text-sm text-blue-700">
                    Seu cartão do Clube Praias Catarinenses é válido em todas as praias de Santa Catarina e pode ser apresentado em qualquer estabelecimento parceiro para obter descontos exclusivos.
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-md border border-green-200">
                  <h3 className="text-green-800 font-semibold">Formas de Uso</h3>
                  <p className="mt-2 text-sm text-green-700">
                    Apresente o seu cartão digital pelo celular ou faça um print da tela para usar offline quando necessário.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
