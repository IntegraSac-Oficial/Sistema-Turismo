
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { UploadFile } from "@/api/integrations";
import { 
  Loader2, 
  Upload, 
  X, 
  ImageIcon 
} from "lucide-react";

export default function BeachForm({ beach, cities, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    city_id: "",
    description: "",
    image_url: "",
    main_activity: "",
    sea_type: "",
    infrastructure: "",
    accessibility: "",
    activities: [],
    features: [],
    latitude: "",
    longitude: "",
    gallery: []
  });
  
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (beach) {
      setFormData({
        name: beach.name || "",
        city_id: beach.city_id || "",
        description: beach.description || "",
        image_url: beach.image_url || "",
        main_activity: beach.main_activity || "",
        sea_type: beach.sea_type || "",
        infrastructure: beach.infrastructure || "",
        accessibility: beach.accessibility || "",
        activities: beach.activities || [],
        features: beach.features || [],
        latitude: beach.latitude || "",
        longitude: beach.longitude || "",
        gallery: beach.gallery || []
      });
    }
  }, [beach]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayInput = (field, value) => {
    const arrayValues = value.split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    setFormData(prev => ({ ...prev, [field]: arrayValues }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setUploadingImage(true);
      
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast({
          title: "Arquivo muito grande",
          description: "O tamanho máximo permitido é 5MB",
          variant: "destructive"
        });
        return;
      }
      
      const imageUrl = URL.createObjectURL(file);
      
      setTimeout(() => {
        setFormData(prev => ({ ...prev, image_url: imageUrl }));
        setUploadingImage(false);
        
        toast({
          title: "Imagem carregada com sucesso",
          description: "A imagem foi carregada temporariamente. Em produção, isso usaria o armazenamento real."
        });
      }, 1500);
      
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      toast({
        title: "Erro ao enviar imagem",
        description: "Não foi possível fazer o upload. Tente novamente ou use uma URL externa.",
        variant: "destructive"
      });
      setUploadingImage(false);
    }
  };

  const handleExternalImageUrl = (url) => {
    setFormData(prev => ({ ...prev, image_url: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.city_id) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome da praia e cidade são campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const processedData = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };
      
      await onSubmit(processedData);
    } catch (error) {
      console.error("Erro ao salvar praia:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar a praia. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const seaTypes = [
    { value: "calmo", label: "Calmo" },
    { value: "ondas_leves", label: "Ondas Leves" },
    { value: "ondas_medias", label: "Ondas Médias" },
    { value: "ondas_fortes", label: "Ondas Fortes" },
    { value: "piscina_natural", label: "Piscina Natural" }
  ];

  const mainActivities = [
    { value: "caminhada", label: "Caminhada" },
    { value: "mergulho", label: "Mergulho" },
    { value: "passeio", label: "Passeio" },
    { value: "surf", label: "Surf" },
    { value: "pesca", label: "Pesca" },
    { value: "vela", label: "Vela" },
    { value: "relaxamento", label: "Relaxamento" },
    { value: "esportes", label: "Esportes" },
    { value: "outros", label: "Outros" }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da Praia*</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="city_id">Cidade*</Label>
            <Select
              value={formData.city_id}
              onValueChange={(value) => handleSelectChange("city_id", value)}
              required
            >
              <SelectTrigger id="city_id">
                <SelectValue placeholder="Selecione a cidade" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
            />
          </div>
          
          <div>
            <Label htmlFor="image">Imagem Principal</Label>
            <div className="mt-1">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                  <Label
                    htmlFor="image"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer"
                  >
                    {uploadingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Selecionar imagem
                  </Label>
                </div>
              </div>
              
              <div className="mt-2">
                <Label htmlFor="image_url">Ou informe uma URL da imagem</Label>
                <Input
                  id="image_url"
                  name="image_url"
                  placeholder="https://exemplo.com/imagem.jpg"
                  value={formData.image_url}
                  onChange={handleInputChange}
                />
              </div>
              
              {formData.image_url && (
                <div className="mt-2 p-2 border rounded-md inline-block">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="max-h-28 max-w-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/400x200/EAEAEA/CCCCCC?text=Imagem+Indisponível";
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="main_activity">Atividade Principal</Label>
            <Select
              value={formData.main_activity}
              onValueChange={(value) => handleSelectChange("main_activity", value)}
            >
              <SelectTrigger id="main_activity">
                <SelectValue placeholder="Selecione a atividade principal" />
              </SelectTrigger>
              <SelectContent>
                {mainActivities.map((activity) => (
                  <SelectItem key={activity.value} value={activity.value}>
                    {activity.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="sea_type">Tipo de Mar</Label>
            <Select
              value={formData.sea_type}
              onValueChange={(value) => handleSelectChange("sea_type", value)}
            >
              <SelectTrigger id="sea_type">
                <SelectValue placeholder="Selecione o tipo de mar" />
              </SelectTrigger>
              <SelectContent>
                {seaTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="activities">Atividades Disponíveis</Label>
            <Textarea
              id="activities"
              placeholder="Mergulho, surf, pesca, caminhada..."
              value={formData.activities.join(', ')}
              onChange={(e) => handleArrayInput("activities", e.target.value)}
            />
            <p className="text-sm text-gray-500 mt-1">
              Separe as atividades por vírgula
            </p>
          </div>
          
          <div>
            <Label htmlFor="features">Características</Label>
            <Textarea
              id="features"
              placeholder="Areia branca, águas transparentes, estrutura para família..."
              value={formData.features.join(', ')}
              onChange={(e) => handleArrayInput("features", e.target.value)}
            />
            <p className="text-sm text-gray-500 mt-1">
              Separe as características por vírgula
            </p>
          </div>
          
          <div>
            <Label htmlFor="infrastructure">Infraestrutura</Label>
            <Textarea
              id="infrastructure"
              name="infrastructure"
              value={formData.infrastructure}
              onChange={handleInputChange}
              placeholder="Banheiros, duchas, restaurantes, quiosques..."
            />
          </div>
          
          <div>
            <Label htmlFor="accessibility">Acessibilidade</Label>
            <Textarea
              id="accessibility"
              name="accessibility"
              value={formData.accessibility}
              onChange={handleInputChange}
              placeholder="Rampa de acesso, estacionamento..."
            />
          </div>
        </div>
      </div>
      
      <div className="border rounded-md p-4">
        <h3 className="text-lg font-medium mb-4">Localização</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              name="latitude"
              type="text"
              value={formData.latitude}
              onChange={handleInputChange}
              placeholder="-27.5986"
            />
          </div>
          <div>
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              name="longitude"
              type="text"
              value={formData.longitude}
              onChange={handleInputChange}
              placeholder="-48.5187"
            />
          </div>
        </div>
        {(formData.latitude && formData.longitude) && (
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              As coordenadas informadas serão utilizadas para mostrar a localização no mapa.
            </p>
          </div>
        )}
      </div>
      
      <div className="flex justify-end space-x-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : beach ? (
            "Atualizar Praia"
          ) : (
            "Cadastrar Praia"
          )}
        </Button>
      </div>
    </form>
  );
}
