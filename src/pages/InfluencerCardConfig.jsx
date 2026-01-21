
import React, { useState, useEffect } from "react";
import { InfluencerCardSettings } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save, Undo, Info, Eye } from "lucide-react";
import { User } from "@/api/entities";
import BackButton from "@/components/ui/BackButton";

export default function InfluencerCardConfig() {
  const [settings, setSettings] = useState({
    title: "Seja um Influenciador das Praias Catarinenses!",
    description: "Ganhe comissões divulgando as melhores praias de Santa Catarina. Cadastre-se agora!",
    button_text: "Quero ser um Influenciador",
    background_color: "#0077b6",
    text_color: "#ffffff",
    button_color: "#f28c38",
    button_text_color: "#ffffff",
    is_active: true,
    background_image: ""
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);
  const [previewSettings, setPreviewSettings] = useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Corrigir verificação de autenticação para também usar localStorage
        let userData = null;
        
        // Primeiro tentar obter do localStorage
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          userData = JSON.parse(storedUser);
        }
        
        // Se não encontrou no localStorage, tenta API
        if (!userData) {
          try {
            userData = await User.me();
          } catch (err) {
            console.error("Erro ao obter usuário via API:", err);
          }
        }
        
        if (!userData) {
          setError("Você precisa estar logado como administrador para acessar esta página.");
          return;
        }
        
        setUser(userData);
        
        // Verificar se é admin
        if (userData.role !== 'admin' && userData.email !== 'contato.jrsn@gmail.com') {
          setError("Você não tem permissão para acessar esta página.");
          return;
        }
        
        // Carregar configurações do card
        const cardSettings = await InfluencerCardSettings.list();
        if (cardSettings && cardSettings.length > 0) {
          setSettings(cardSettings[0]);
          setPreviewSettings(cardSettings[0]);
        }
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
        setError("Erro ao carregar configurações. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSwitchChange = (checked) => {
    setSettings(prev => ({ ...prev, is_active: checked }));
  };
  
  const handlePreview = () => {
    setPreviewSettings({...settings});
  };
  
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError("");
      setSuccess(false);
      
      if (!settings.title) {
        setError("O título do card é obrigatório.");
        return;
      }
      
      let settingsId = settings.id;
      let existingSettings = await InfluencerCardSettings.list();
      
      if (existingSettings && existingSettings.length > 0) {
        // Atualizar configurações existentes
        await InfluencerCardSettings.update(existingSettings[0].id, settings);
      } else {
        // Criar novas configurações
        await InfluencerCardSettings.create(settings);
      }
      
      setSuccess(true);
      setPreviewSettings({...settings});
      
      // Esconder a mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      setError("Erro ao salvar configurações. Tente novamente mais tarde.");
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }
  
  if (error && !settings.id) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  const previewCardStyle = {
    backgroundImage: previewSettings.background_image ? `url(${previewSettings.background_image})` : 'none',
    backgroundColor: previewSettings.background_image ? 'rgba(0,0,0,0.5)' : (previewSettings.background_color || '#0077b6'),
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundBlendMode: previewSettings.background_image ? 'overlay' : 'normal',
    color: previewSettings.text_color || '#ffffff',
    padding: '2rem',
    borderRadius: '0.5rem',
  };
  
  const previewButtonStyle = {
    backgroundColor: previewSettings.button_color || '#f28c38',
    color: previewSettings.button_text_color || '#ffffff',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.375rem',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
  };
  
  return (
    <div className="p-6">
      <BackButton />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Configuração do Card de Influenciadores</h1>
      </div>
      
      <Tabs defaultValue="config">
        <TabsList className="mb-6">
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="preview">Visualização</TabsTrigger>
        </TabsList>
        
        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Card</CardTitle>
              <CardDescription>
                Configure o card promocional para influenciadores que será exibido na página inicial
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert className="mb-4 bg-green-50 border-green-200">
                  <AlertDescription className="text-green-700">
                    Configurações salvas com sucesso!
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-active"
                    checked={settings.is_active}
                    onCheckedChange={handleSwitchChange}
                  />
                  <Label htmlFor="is-active">Card Ativo</Label>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                  onClick={handlePreview}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Pré-visualizar
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título do Card *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={settings.title}
                    onChange={handleChange}
                    placeholder="Título do card promocional"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={settings.description}
                    onChange={handleChange}
                    placeholder="Descrição do card promocional"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="button_text">Texto do Botão</Label>
                  <Input
                    id="button_text"
                    name="button_text"
                    value={settings.button_text}
                    onChange={handleChange}
                    placeholder="Ex: Quero ser um Influenciador"
                  />
                </div>
                
                <div>
                  <Label htmlFor="background_image">URL da Imagem de Fundo</Label>
                  <Input
                    id="background_image"
                    name="background_image"
                    value={settings.background_image}
                    onChange={handleChange}
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    URL da imagem de fundo (opcional). Se não informada, será usado a cor de fundo.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="background_color">Cor de Fundo</Label>
                  <div className="flex gap-2">
                    <Input
                      id="background_color"
                      name="background_color"
                      value={settings.background_color}
                      onChange={handleChange}
                      placeholder="#0077b6"
                    />
                    <div 
                      className="w-10 h-10 rounded-md border" 
                      style={{ backgroundColor: settings.background_color }}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="text_color">Cor do Texto</Label>
                  <div className="flex gap-2">
                    <Input
                      id="text_color"
                      name="text_color"
                      value={settings.text_color}
                      onChange={handleChange}
                      placeholder="#ffffff"
                    />
                    <div 
                      className="w-10 h-10 rounded-md border" 
                      style={{ backgroundColor: settings.text_color }}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="button_color">Cor do Botão</Label>
                  <div className="flex gap-2">
                    <Input
                      id="button_color"
                      name="button_color"
                      value={settings.button_color}
                      onChange={handleChange}
                      placeholder="#f28c38"
                    />
                    <div 
                      className="w-10 h-10 rounded-md border" 
                      style={{ backgroundColor: settings.button_color }}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="button_text_color">Cor do Texto do Botão</Label>
                  <div className="flex gap-2">
                    <Input
                      id="button_text_color"
                      name="button_text_color"
                      value={settings.button_text_color}
                      onChange={handleChange}
                      placeholder="#ffffff"
                    />
                    <div 
                      className="w-10 h-10 rounded-md border" 
                      style={{ backgroundColor: settings.button_text_color }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setSettings(previewSettings)}>
                <Undo className="mr-2 h-4 w-4" />
                Restaurar
              </Button>
              <Button 
                disabled={isSaving} 
                onClick={handleSave}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Configurações
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Pré-visualização do Card</CardTitle>
              <CardDescription>
                Veja como o card ficará na página inicial
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="border rounded-lg p-4 mb-6">
                <div style={previewCardStyle} className="mb-6">
                  <div className="text-center py-8">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: previewSettings.text_color }}>
                      {previewSettings.title || "Título do Card"}
                    </h2>
                    <p className="text-lg mb-6" style={{ color: previewSettings.text_color }}>
                      {previewSettings.description || "Descrição do card promocional para influenciadores."}
                    </p>
                    <button style={previewButtonStyle}>
                      {previewSettings.button_text || "Botão de Ação"}
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-blue-50 rounded-md">
                  <Info className="h-5 w-5 text-blue-500 mr-2" />
                  <p className="text-sm text-blue-700">
                    Esta é apenas uma pré-visualização. Clique em "Salvar Configurações" na aba 
                    Configuração para aplicar as mudanças na página inicial.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
