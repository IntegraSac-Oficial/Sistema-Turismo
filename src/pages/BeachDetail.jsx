import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Beach } from "@/api/entities";
import { City } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { UploadFile } from "@/api/integrations";
import { toast } from "@/components/ui/use-toast";
import { 
  Waves, ChevronLeft, Save, Loader2, Image as ImageIcon, TrashIcon, X, Plus
} from "lucide-react";

export default function BeachDetail() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [cities, setCities] = useState([]);
  const [beach, setBeach] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  
  const [formData, setFormData] = useState({
    name: "",
    city_id: "",
    description: "",
    image_url: "",
    features: [],
    main_activity: "",
    activities: [],
    sea_type: "calmo",
    is_crowded: false,
    infrastructure: "",
    accessibility: "",
    nightlife: "",
    tourist_attractions: [],
    gallery: [],
    latitude: null,
    longitude: null
  });
  
  const urlParams = new URLSearchParams(window.location.search);
  const beachId = urlParams.get('id');
  
  useEffect(() => {
    loadData();
  }, [beachId]);
  
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Carregar cidades
      const citiesData = await City.list();
      setCities(citiesData || []);
      
      // Se for edição, carregar dados da praia
      if (beachId) {
        const beachData = await Beach.get(beachId);
        setBeach(beachData);
        setFormData({
          ...beachData,
          features: beachData.features || [],
          activities: beachData.activities || [],
          tourist_attractions: beachData.tourist_attractions || [],
          gallery: beachData.gallery || []
        });
        
        setImagePreview(beachData.image_url);
        setGalleryPreviews(beachData.gallery || []);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados necessários",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (name, checked) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleArrayInputChange = (name, value) => {
    // Para campos que são arrays de strings separados por vírgula
    const valuesArray = value.split(",").map(item => item.trim()).filter(item => item !== "");
    setFormData(prev => ({ ...prev, [name]: valuesArray }));
  };
  
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };
  
  const handleGalleryImageAdd = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    const newFiles = [...galleryFiles, ...files];
    setGalleryFiles(newFiles);
    
    const newPreviews = [
      ...galleryPreviews, 
      ...files.map(file => URL.createObjectURL(file))
    ];
    setGalleryPreviews(newPreviews);
  };
  
  const handleRemoveGalleryImage = (index) => {
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    
    // Se for uma URL existente (não um objeto File), remova da lista de formData.gallery
    if (typeof galleryPreviews[index] === 'string' && galleryPreviews[index].startsWith('http')) {
      setFormData(prev => ({
        ...prev,
        gallery: prev.gallery.filter(url => url !== galleryPreviews[index])
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      let imageUrl = formData.image_url;
      let galleryUrls = [...(formData.gallery || [])];
      
      // Upload da imagem principal se houver uma nova
      if (imageFile) {
        const result = await UploadFile({ file: imageFile });
        imageUrl = result.file_url;
      }
      
      // Upload das imagens da galeria se houver novas
      if (galleryFiles.length > 0) {
        const existingUrls = galleryUrls.filter(url => typeof url === 'string' && url.startsWith('http'));
        
        const uploadPromises = galleryFiles.map(file => UploadFile({ file }));
        const results = await Promise.all(uploadPromises);
        const newUrls = results.map(result => result.file_url);
        
        galleryUrls = [...existingUrls, ...newUrls];
      }
      
      // Preparar dados para salvar
      const beachData = {
        ...formData,
        image_url: imageUrl,
        gallery: galleryUrls,
        // Converter campos numéricos
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null
      };
      
      // Salvar no banco
      if (beachId) {
        await Beach.update(beachId, beachData);
        toast({
          title: "Praia atualizada",
          description: "Os dados da praia foram atualizados com sucesso!"
        });
      } else {
        await Beach.create(beachData);
        toast({
          title: "Praia cadastrada",
          description: "A praia foi cadastrada com sucesso!"
        });
      }
      
      navigate(createPageUrl("Beaches"));
      
    } catch (error) {
      console.error("Erro ao salvar praia:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar os dados da praia. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => navigate(createPageUrl("Beaches"))}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Voltar para lista de praias
      </Button>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Waves className="mr-2 h-7 w-7 text-blue-500" />
            {beach ? `Editar: ${beach.name}` : "Nova Praia"}
          </h1>
          <p className="text-gray-600 mt-1">
            {beach ? "Atualize as informações desta praia" : "Cadastre uma nova praia no sistema"}
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Primeira coluna - Dados básicos */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Praia *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ex: Praia do Campeche"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="city_id">Cidade *</Label>
                <Select
                  value={formData.city_id}
                  onValueChange={(value) => handleSelectChange("city_id", value)}
                  required
                >
                  <SelectTrigger>
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
                  placeholder="Descreva brevemente a praia..."
                  className="min-h-32"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sea_type">Tipo de Mar</Label>
                  <Select
                    value={formData.sea_type}
                    onValueChange={(value) => handleSelectChange("sea_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="calmo">Mar Calmo</SelectItem>
                      <SelectItem value="ondas_leves">Ondas Leves</SelectItem>
                      <SelectItem value="ondas_medias">Ondas Médias</SelectItem>
                      <SelectItem value="ondas_fortes">Ondas Fortes</SelectItem>
                      <SelectItem value="piscina_natural">Piscina Natural</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="main_activity">Atividade Principal</Label>
                  <Select
                    value={formData.main_activity}
                    onValueChange={(value) => handleSelectChange("main_activity", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a atividade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="surf">Surf</SelectItem>
                      <SelectItem value="caminhada">Caminhada</SelectItem>
                      <SelectItem value="mergulho">Mergulho</SelectItem>
                      <SelectItem value="passeio">Passeio</SelectItem>
                      <SelectItem value="pesca">Pesca</SelectItem>
                      <SelectItem value="vela">Vela</SelectItem>
                      <SelectItem value="relaxamento">Relaxamento</SelectItem>
                      <SelectItem value="esportes">Esportes</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="features">Características (separadas por vírgula)</Label>
                <Input
                  id="features"
                  name="features"
                  value={formData.features ? formData.features.join(", ") : ""}
                  onChange={(e) => handleArrayInputChange("features", e.target.value)}
                  placeholder="Ex: surf, família, natural, relaxante"
                />
              </div>
              
              <div>
                <Label htmlFor="activities">Atividades (separadas por vírgula)</Label>
                <Input
                  id="activities"
                  name="activities"
                  value={formData.activities ? formData.activities.join(", ") : ""}
                  onChange={(e) => handleArrayInputChange("activities", e.target.value)}
                  placeholder="Ex: surf, mergulho, pesca"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_crowded"
                  checked={formData.is_crowded}
                  onCheckedChange={(checked) => handleCheckboxChange("is_crowded", checked)}
                />
                <label
                  htmlFor="is_crowded"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Praia Movimentada
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Segunda coluna - Imagens e Localização */}
          <Card>
            <CardHeader>
              <CardTitle>Imagens e Localização</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Imagem Principal */}
              <div>
                <Label htmlFor="image">Imagem Principal</Label>
                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative mb-4">
                      <img 
                        src={imagePreview} 
                        alt="Imagem principal da praia" 
                        className="rounded-md w-full h-48 object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-8 w-8 p-0"
                        onClick={() => {
                          setImagePreview(null);
                          setImageFile(null);
                          setFormData(prev => ({ ...prev, image_url: "" }));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center mb-4">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">Nenhuma imagem selecionada</p>
                    </div>
                  )}
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Galeria de Imagens */}
              <div>
                <Label htmlFor="gallery">Galeria de Imagens</Label>
                <div className="mt-2">
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {galleryPreviews.map((url, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={url} 
                          alt={`Imagem ${index + 1}`}
                          className="rounded-md h-24 w-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => handleRemoveGalleryImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <div className="border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center h-24">
                      <label 
                        htmlFor="gallery" 
                        className="cursor-pointer flex flex-col items-center justify-center w-full h-full"
                      >
                        <Plus className="h-8 w-8 text-gray-400" />
                        <span className="mt-1 text-sm text-gray-500">Adicionar</span>
                      </label>
                    </div>
                  </div>
                  <Input
                    id="gallery"
                    name="gallery"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryImageAdd}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Localização */}
              <div>
                <Label>Coordenadas Geográficas</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <Label htmlFor="latitude" className="text-xs">Latitude</Label>
                    <Input
                      id="latitude"
                      name="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude || ""}
                      onChange={handleInputChange}
                      placeholder="-27.5969"
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude" className="text-xs">Longitude</Label>
                    <Input
                      id="longitude"
                      name="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude || ""}
                      onChange={handleInputChange}
                      placeholder="-48.5495"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações Adicionais - Ocupa ambas colunas */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Informações Adicionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="infrastructure">Infraestrutura Disponível</Label>
                  <Textarea
                    id="infrastructure"
                    name="infrastructure"
                    value={formData.infrastructure || ""}
                    onChange={handleInputChange}
                    placeholder="Ex: Banheiros, chuveiros, quiosques..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="accessibility">Acessibilidade</Label>
                  <Textarea
                    id="accessibility"
                    name="accessibility"
                    value={formData.accessibility || ""}
                    onChange={handleInputChange}
                    placeholder="Ex: Rampas para cadeirantes, estacionamento próximo..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="nightlife">Vida Noturna</Label>
                  <Textarea
                    id="nightlife"
                    name="nightlife"
                    value={formData.nightlife || ""}
                    onChange={handleInputChange}
                    placeholder="Ex: Bares, restaurantes, eventos noturnos..."
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="tourist_attractions">Atrações Turísticas Próximas (separadas por vírgula)</Label>
                <Textarea
                  id="tourist_attractions"
                  name="tourist_attractions"
                  value={formData.tourist_attractions ? formData.tourist_attractions.join(", ") : ""}
                  onChange={(e) => handleArrayInputChange("tourist_attractions", e.target.value)}
                  placeholder="Ex: Mirante do Morro das Pedras, Lagoa do Peri, Feirinha Artesanal..."
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-end mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(createPageUrl("Beaches"))}
            className="mr-4"
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {beach ? "Atualizar Praia" : "Salvar Praia"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}