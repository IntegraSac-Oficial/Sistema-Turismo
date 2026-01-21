import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BenefitClubConfig } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import BackButton from "@/components/ui/BackButton";
import {
  Loader2, Save, Upload, Trash2, Plus, CheckCircle, Image, Eye, ArrowRight, Settings, Check,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight as ArrowRightIcon, ZoomIn, ZoomOut, RotateCw, RotateCcw
} from "lucide-react";
import BenefitClubBanner from "@/components/public/BenefitClubBanner";

export default function ClubConfiguration() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("configuracao");
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  const [config, setConfig] = useState({
    id: null,
    title: "Clube de Benefícios",
    subtitle: "A partir de R$ 19,90/mês",
    subtitle_description: "Cartão virtual ou físico, você escolhe!",
    benefits: [
      "Descontos exclusivos em estabelecimentos parceiros",
      "Acesso a eventos especiais",
      "Ofertas personalizadas em restaurantes e hotéis",
      "Atendimento prioritário em parceiros"
    ],
    card_image_url: "",
    background_color: "#003087",
    button_color: "#F28C38",
    button_text: "Ver Planos",
    is_active: true,
    card_position_x: 0,
    card_position_y: 0,
    card_scale: 1,
    card_rotation: 0
  });
  
  const [newBenefit, setNewBenefit] = useState("");
  
  useEffect(() => {
    loadConfig();
  }, []);
  
  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const configs = await BenefitClubConfig.list();
      if (configs && configs.length > 0) {
        setConfig(prevConfig => ({
          ...prevConfig,
          ...configs[0],
          id: configs[0].id,
          benefits: configs[0].benefits || prevConfig.benefits,
          card_position_x: configs[0].card_position_x || 0,
          card_position_y: configs[0].card_position_y || 0,
          card_scale: configs[0].card_scale || 1,
          card_rotation: configs[0].card_rotation || 0
        }));
      }
    } catch (error) {
      console.error("Erro ao carregar configuração:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setConfig({ ...config, [name]: value });
  };
  
  const handleNumberInputChange = (e) => {
    const { name, value } = e.target;
    setConfig({ ...config, [name]: parseFloat(value) });
  };
  
  const handleToggleActive = (checked) => {
    setConfig({ ...config, is_active: checked });
  };
  
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const result = await UploadFile({ file });
      if (result && result.file_url) {
        setConfig({ ...config, card_image_url: result.file_url });
      }
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleAddBenefit = () => {
    if (newBenefit.trim()) {
      setConfig({
        ...config,
        benefits: [...(config.benefits || []), newBenefit.trim()]
      });
      setNewBenefit("");
    }
  };
  
  const handleRemoveBenefit = (index) => {
    const updatedBenefits = [...config.benefits];
    updatedBenefits.splice(index, 1);
    setConfig({ ...config, benefits: updatedBenefits });
  };
  
  const handlePositionChange = (axis, value) => {
    const propName = `card_position_${axis}`;
    setConfig({ ...config, [propName]: config[propName] + value });
  };
  
  const handleScaleChange = (value) => {
    // Limitar a escala entre 0.5 e 2
    const newScale = Math.max(0.5, Math.min(2, config.card_scale + value));
    setConfig({ ...config, card_scale: newScale });
  };
  
  const handleRotationChange = (value) => {
    setConfig({ ...config, card_rotation: config.card_rotation + value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      if (config.id) {
        // Atualizar configuração existente
        await BenefitClubConfig.update(config.id, config);
      } else {
        // Criar nova configuração
        const newConfig = await BenefitClubConfig.create(config);
        setConfig({ ...config, id: newConfig.id });
      }
      
      // Mostrar mensagem de sucesso
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Configuração do Banner do Clube</h1>
        
        {showSuccessMessage && (
          <div className="flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-md">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span>Configurações salvas com sucesso!</span>
          </div>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="configuracao">Configuração</TabsTrigger>
          <TabsTrigger value="posicionamento">Posicionamento</TabsTrigger>
          <TabsTrigger value="preview">Visualização</TabsTrigger>
        </TabsList>
        
        <TabsContent value="configuracao">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Gerais</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="is_active">Ativar Banner</Label>
                        <Switch 
                          id="is_active" 
                          checked={config.is_active} 
                          onCheckedChange={handleToggleActive} 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="title">Título</Label>
                        <Input 
                          id="title"
                          name="title"
                          value={config.title}
                          onChange={handleInputChange}
                          placeholder="Título do banner"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="subtitle">Subtítulo</Label>
                        <Input 
                          id="subtitle"
                          name="subtitle"
                          value={config.subtitle}
                          onChange={handleInputChange}
                          placeholder="Subtítulo do banner"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="subtitle_description">Descrição adicional</Label>
                        <Input 
                          id="subtitle_description"
                          name="subtitle_description"
                          value={config.subtitle_description}
                          onChange={handleInputChange}
                          placeholder="Descrição adicional"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="background_color">Cor de fundo</Label>
                        <div className="flex items-center gap-2">
                          <Input 
                            id="background_color"
                            name="background_color"
                            value={config.background_color}
                            onChange={handleInputChange}
                            placeholder="#000000"
                          />
                          <div 
                            className="w-10 h-10 rounded-md border"
                            style={{ backgroundColor: config.background_color }}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="button_color">Cor do botão</Label>
                        <div className="flex items-center gap-2">
                          <Input 
                            id="button_color"
                            name="button_color"
                            value={config.button_color}
                            onChange={handleInputChange}
                            placeholder="#000000"
                          />
                          <div 
                            className="w-10 h-10 rounded-md border"
                            style={{ backgroundColor: config.button_color }}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="button_text">Texto do botão</Label>
                        <Input 
                          id="button_text"
                          name="button_text"
                          value={config.button_text}
                          onChange={handleInputChange}
                          placeholder="Ver Planos"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="card_image_url">Imagem do cartão</Label>
                        <div className="flex flex-col gap-2">
                          <Input 
                            id="card_image_url"
                            name="card_image_url"
                            value={config.card_image_url}
                            onChange={handleInputChange}
                            placeholder="URL da imagem do cartão"
                          />
                          
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <input 
                                type="file"
                                id="image_upload"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="sr-only"
                              />
                              <Label 
                                htmlFor="image_upload"
                                className="cursor-pointer inline-flex items-center bg-gray-100 px-4 py-2 rounded-md hover:bg-gray-200"
                              >
                                {isUploading ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Upload className="h-4 w-4 mr-2" />
                                )}
                                Fazer upload
                              </Label>
                            </div>
                            
                            {config.card_image_url && (
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm"
                                onClick={() => setConfig({ ...config, card_image_url: "" })}
                                className="text-red-500 border-red-200 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remover
                              </Button>
                            )}
                          </div>
                          
                          {config.card_image_url && (
                            <div className="mt-2 border p-2 rounded-md">
                              <img 
                                src={config.card_image_url} 
                                alt="Preview" 
                                className="max-h-40 mx-auto object-contain"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Benefícios</Label>
                          <span className="text-sm text-gray-500">
                            {config.benefits?.length || 0} benefícios
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Input
                            value={newBenefit}
                            onChange={(e) => setNewBenefit(e.target.value)}
                            placeholder="Adicionar novo benefício"
                          />
                          <Button 
                            type="button"
                            onClick={handleAddBenefit}
                            variant="outline"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <ul className="space-y-2 mt-2">
                          {config.benefits?.map((benefit, index) => (
                            <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                              <div className="flex items-center">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                <span>{benefit}</span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveBenefit(index)}
                                className="text-red-500 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700" 
                      disabled={isSaving}
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
                  </form>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Dicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-md text-blue-800">
                    <h3 className="font-medium mb-1">Banner Eficiente</h3>
                    <p className="text-sm">
                      Use cores contrastantes e mensagens claras para atrair mais atenção ao seu banner.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-md text-green-800">
                    <h3 className="font-medium mb-1">Benefícios</h3>
                    <p className="text-sm">
                      Liste os benefícios mais atrativos primeiro. Recomendamos 4-5 itens para não sobrecarregar o banner.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-orange-50 rounded-md text-orange-800">
                    <h3 className="font-medium mb-1">Imagem do Cartão</h3>
                    <p className="text-sm">
                      Use uma imagem PNG com fundo transparente para melhor integração com o fundo do banner.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="posicionamento">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Posicionamento e Tamanho do Cartão</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label>Posição horizontal</Label>
                        <div className="flex items-center gap-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => handlePositionChange('x', -10)}
                          >
                            <ArrowLeft className="h-4 w-4" />
                          </Button>
                          <Input 
                            type="number"
                            name="card_position_x"
                            value={config.card_position_x}
                            onChange={handleNumberInputChange}
                            className="text-center"
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => handlePositionChange('x', 10)}
                          >
                            <ArrowRightIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Posição vertical</Label>
                        <div className="flex items-center gap-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => handlePositionChange('y', -10)}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Input 
                            type="number"
                            name="card_position_y"
                            value={config.card_position_y}
                            onChange={handleNumberInputChange}
                            className="text-center"
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => handlePositionChange('y', 10)}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Tamanho (Escala)</Label>
                        <div className="flex items-center gap-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => handleScaleChange(-0.1)}
                          >
                            <ZoomOut className="h-4 w-4" />
                          </Button>
                          <Input 
                            type="number"
                            name="card_scale"
                            value={config.card_scale.toFixed(1)}
                            onChange={handleNumberInputChange}
                            className="text-center"
                            step="0.1"
                            min="0.5"
                            max="2"
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => handleScaleChange(0.1)}
                          >
                            <ZoomIn className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                          Valores entre 0.5 e 2.0. 1.0 é o tamanho original.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Rotação (graus)</Label>
                        <div className="flex items-center gap-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => handleRotationChange(-5)}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Input 
                            type="number"
                            name="card_rotation"
                            value={config.card_rotation}
                            onChange={handleNumberInputChange}
                            className="text-center"
                            step="5"
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => handleRotationChange(5)}
                          >
                            <RotateCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setConfig({
                              ...config,
                              card_position_x: 0,
                              card_position_y: 0,
                              card_scale: 1,
                              card_rotation: 0
                            });
                          }}
                          className="w-full"
                        >
                          Redefinir posição e tamanho
                        </Button>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700" 
                      disabled={isSaving}
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
                  </form>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Dicas de Posicionamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-md text-blue-800">
                    <h3 className="font-medium mb-1">Ajuste Fino</h3>
                    <p className="text-sm">
                      Para ajustes pequenos, edite os valores diretamente nos campos numéricos.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-amber-50 rounded-md text-amber-800">
                    <h3 className="font-medium mb-1">Rotação</h3>
                    <p className="text-sm">
                      Uma leve rotação de 5 a 15 graus pode dar um aspecto mais dinâmico ao cartão.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-purple-50 rounded-md text-purple-800">
                    <h3 className="font-medium mb-1">Visualização</h3>
                    <p className="text-sm">
                      Confira como o banner ficará na aba "Visualização" antes de salvar suas alterações.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="preview">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Visualização do Banner</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="w-full max-w-4xl mx-auto">
                    <BenefitClubBanner />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4 text-center">
                  Esta é uma prévia do banner. O banner real pode ter algumas diferenças dependendo do tamanho da tela do usuário.
                </p>
              </CardContent>
            </Card>
            
            <div className="flex justify-center">
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700" 
                disabled={isSaving}
                onClick={handleSubmit}
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
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}