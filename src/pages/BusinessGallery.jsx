
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Business } from "@/api/entities";
import { BusinessSubscription } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import {
  ArrowLeft,
  Upload,
  Loader2,
  Image,
  Trash2,
  Info,
  Lock,
  Plus,
  MoveUp,
  MoveDown,
} from "lucide-react";

export default function BusinessGallery() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [maxImages, setMaxImages] = useState(5); // Default para plano básico

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Verificar autenticação
        const currentUserStr = localStorage.getItem('currentUser');
        if (!currentUserStr) {
          navigate(createPageUrl("UserAccount"));
          return;
        }
        
        const currentUser = JSON.parse(currentUserStr);
        
        // Verificar se tem negócio associado
        if (!currentUser.business_id) {
          toast({
            title: "Erro",
            description: "Não há negócio associado à sua conta",
            variant: "destructive",
          });
          navigate(createPageUrl("BusinessProfile"));
          return;
        }

        // Carregar dados do negócio
        const businessData = await Business.get(currentUser.business_id);
        if (!businessData) {
          toast({
            title: "Erro",
            description: "Não foi possível carregar os dados do seu negócio",
            variant: "destructive",
          });
          navigate(createPageUrl("BusinessProfile"));
          return;
        }
        
        setBusiness(businessData);
        
        // Inicializar a galeria com os dados existentes
        if (businessData.gallery && Array.isArray(businessData.gallery)) {
          setGallery(businessData.gallery);
        }
        
        // Buscar assinatura para verificar limites
        try {
          const subscriptions = await BusinessSubscription.filter({
            business_id: currentUser.business_id,
          });
          
          if (subscriptions && subscriptions.length > 0) {
            // Ordenar para pegar a assinatura mais recente
            const latestSubscription = subscriptions.sort(
              (a, b) => new Date(b.start_date) - new Date(a.start_date)
            )[0];
            
            setSubscription(latestSubscription);
            
            // Definir o limite de imagens com base no plano
            if (latestSubscription.plan_type === "featured") {
              setMaxImages(30);
            } else if (latestSubscription.plan_type === "premium") {
              setMaxImages(15);
            } else {
              setMaxImages(5); // Plano básico
            }
          }
        } catch (error) {
          console.error("Erro ao buscar assinatura:", error);
          // Manter o limite padrão (5)
        }
        
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao carregar os dados. Por favor, tente novamente.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Verificar se já atingiu o limite de imagens
    if (gallery.length >= maxImages) {
      toast({
        title: "Limite atingido",
        description: `Seu plano permite apenas ${maxImages} imagens. Remova alguma imagem ou faça upgrade do seu plano.`,
        variant: "destructive",
      });
      return;
    }
    
    try {
      setUploading(true);
      const { file_url } = await UploadFile({ file });
      
      if (file_url) {
        const updatedGallery = [...gallery, file_url];
        
        // Importante: Atualizar apenas o array gallery, não mexer na image_url principal
        await Business.update(business.id, {
          gallery: updatedGallery,
        });
        
        setGallery(updatedGallery);
        
        toast({
          title: "Sucesso",
          description: "Imagem adicionada à galeria com sucesso!"
        });
      }
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      toast({
        title: "Erro",
        description: "Não foi possível fazer o upload da imagem. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (index) => {
    try {
      const updatedGallery = gallery.filter((_, i) => i !== index);
      
      // Atualizar a galeria no banco de dados
      await Business.update(business.id, {
        gallery: updatedGallery,
      });
      
      // Atualizar estado local
      setGallery(updatedGallery);
      
      toast({
        title: "Sucesso",
        description: "Imagem removida com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao remover imagem:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a imagem. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  const moveImage = async (index, direction) => {
    try {
      // Criar cópia da galeria
      const newGallery = [...gallery];
      
      // Trocar posições
      if (direction === "up" && index > 0) {
        [newGallery[index], newGallery[index - 1]] = [newGallery[index - 1], newGallery[index]];
      } else if (direction === "down" && index < gallery.length - 1) {
        [newGallery[index], newGallery[index + 1]] = [newGallery[index + 1], newGallery[index]];
      } else {
        return; // Nada a fazer se estiver nos limites
      }
      
      // Atualizar a galeria no banco de dados
      await Business.update(business.id, {
        gallery: newGallery,
      });
      
      // Atualizar estado local
      setGallery(newGallery);
    } catch (error) {
      console.error("Erro ao reordenar imagens:", error);
      toast({
        title: "Erro",
        description: "Não foi possível reordenar as imagens. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(createPageUrl("BusinessProfile"))}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para o Perfil
        </button>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Galeria de Imagens</h1>
              <p className="text-gray-600">
                Gerencie as imagens do seu estabelecimento
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center bg-blue-50 rounded-md p-2 text-blue-800">
              <Info className="w-4 h-4 mr-2" />
              <span>
                {gallery.length} / {maxImages} imagens{" "}
                {subscription ? `(Plano ${subscription.plan_type})` : "(Plano básico)"}
              </span>
            </div>
          </div>

          {/* Upload de Imagens */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold mb-2">Adicionar novas imagens</h2>
                  <p className="text-gray-600 text-sm">
                    Adicione imagens de alta qualidade para mostrar o melhor do seu negócio.
                    Recomendamos imagens com resolução mínima de 1200x800 pixels.
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  {gallery.length >= maxImages ? (
                    <div className="flex items-center text-orange-600 bg-orange-50 px-3 py-2 rounded">
                      <Lock className="w-4 h-4 mr-2" />
                      <span>Limite atingido</span>
                    </div>
                  ) : (
                    <>
                      <input
                        type="file"
                        id="gallery-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading || gallery.length >= maxImages}
                      />
                      <Button
                        onClick={() => document.getElementById("gallery-upload").click()}
                        disabled={uploading || gallery.length >= maxImages}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Adicionar Imagem
                          </>
                        )}
                      </Button>
                    </>
                  )}
                  
                  {gallery.length >= maxImages && (
                    <Button 
                      variant="outline"
                      onClick={() => navigate(createPageUrl("BusinessPlans"))}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Upgrade de Plano
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Imagens */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Imagens atuais</h2>
            
            {gallery.length === 0 ? (
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-10 text-center">
                <Image className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">
                  Nenhuma imagem adicionada ainda. Adicione imagens para mostrar seu estabelecimento aos clientes.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {gallery.map((imageUrl, index) => (
                  <div
                    key={index}
                    className="relative bg-white border border-gray-200 rounded-lg overflow-hidden group"
                  >
                    <img
                      src={imageUrl}
                      alt={`Imagem ${index + 1}`}
                      className="w-full h-48 object-cover"
                    />
                    
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="bg-white/90 text-red-600 hover:bg-white hover:text-red-700"
                          onClick={() => removeImage(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          size="icon"
                          variant="outline"
                          className="bg-white/90 text-blue-600 hover:bg-white hover:text-blue-700"
                          onClick={() => moveImage(index, "up")}
                          disabled={index === 0}
                        >
                          <MoveUp className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          size="icon"
                          variant="outline"
                          className="bg-white/90 text-blue-600 hover:bg-white hover:text-blue-700"
                          onClick={() => moveImage(index, "down")}
                          disabled={index === gallery.length - 1}
                        >
                          <MoveDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="absolute top-2 left-2 bg-black/50 text-white text-xs font-medium px-2 py-1 rounded">
                      {`Imagem ${index + 1}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-8 border-t pt-6 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              A primeira imagem será exibida como destaque na galeria
            </p>
            <Button onClick={() => navigate(createPageUrl("BusinessProfile"))}>
              Voltar ao Perfil
            </Button>
          </div>
        </div>
        
        {/* Dicas de Imagem */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-3">Dicas para Fotos de Qualidade</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 mr-2"></span>
                Use iluminação natural e evite fotos escuras ou com flash direto
              </li>
              <li className="flex items-start">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 mr-2"></span>
                Mostre o ambiente real, destacando os diferenciais do seu negócio
              </li>
              <li className="flex items-start">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 mr-2"></span>
                Para restaurantes, inclua fotos dos pratos principais e do ambiente
              </li>
              <li className="flex items-start">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 mr-2"></span>
                Para lojas, mostre os produtos mais vendidos e a fachada
              </li>
              <li className="flex items-start">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 mr-2"></span>
                Para hospedagem, destaque os quartos, áreas comuns e diferenciais
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
