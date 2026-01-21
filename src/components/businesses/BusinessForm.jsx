
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { UploadFile } from "@/api/integrations";
import { toast } from "@/components/ui/use-toast";
import { Beach } from "@/api/entities";
import { Upload, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox"; // Adicionar Checkbox

export default function BusinessForm({ business, onSave, mode, cities, types }) {
  const [formData, setFormData] = useState({
    business_name: "",
    business_type: "",
    business_email: "",
    business_phone: "",
    city_id: "",
    beach_id: "",
    description: "",
    address: "",
    website: "",
    opening_hours: "",
    image_url: "",
    logo_url: "", // Adicionado logo_url
    amenities: [], // Adicionado amenities
    is_club_member: false,
    discount_type: "percentual",
    discount_value: 0,
    discount_description: ""
  });
  
  const [beaches, setBeaches] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false); // Para o logo
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (business) {
      setFormData({
        business_name: business.business_name || business.name || "",
        business_type: business.business_type || business.type || "",
        business_email: business.business_email || business.email || "",
        business_phone: business.business_phone || business.phone || "",
        city_id: business.city_id || "",
        beach_id: business.beach_id || "",
        description: business.description || "",
        address: business.address || "",
        website: business.website || "",
        opening_hours: business.opening_hours || "",
        image_url: business.image_url || "",
        logo_url: business.logo_url || "", // Adicionado logo_url
        amenities: business.amenities || [], // Adicionado amenities
        is_club_member: business.is_club_member || false,
        discount_type: business.discount_type || "percentual",
        discount_value: business.discount_value || 0,
        discount_description: business.discount_description || ""
      });
      
      if (business.city_id) {
        loadBeaches(business.city_id);
      }
    }
  }, [business]);

  const loadBeaches = async (cityId) => {
    if (!cityId) {
      setBeaches([]);
      return;
    }
    
    try {
      const beachesData = await Beach.filter({ city_id: cityId });
      setBeaches(beachesData || []);
    } catch (error) {
      console.error("Erro ao carregar praias:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as praias desta cidade.",
        variant: "destructive"
      });
    }
  };

  const handleCityChange = (value) => {
    setFormData(prev => ({ ...prev, city_id: value, beach_id: "" }));
    loadBeaches(value);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = async (e, imageType = "main") => {
    const file = e.target.files[0];
    if (!file) return;
    
    const isLogo = imageType === "logo";
    if (isLogo) setUploadingLogo(true);
    else setUploadingImage(true);
    
    try {
      const { file_url } = await UploadFile({ file });
      
      if (file_url) {
        setFormData(prev => ({ ...prev, [isLogo ? "logo_url" : "image_url"]: file_url }));
        toast({
          title: "Sucesso",
          description: `${isLogo ? "Logomarca" : "Imagem principal"} enviada com sucesso!`
        });
      }
    } catch (error) {
      console.error(`Erro ao fazer upload da ${isLogo ? "logomarca" : "imagem"}:`, error);
      toast({
        title: "Erro",
        description: `Não foi possível fazer o upload da ${isLogo ? "logomarca" : "imagem"}.`,
        variant: "destructive"
      });
    } finally {
      if (isLogo) setUploadingLogo(false);
      else setUploadingImage(false);
    }
  };

  const handleAmenityChange = (amenityValue, checked) => {
    setFormData(prev => {
      const currentAmenities = prev.amenities || [];
      if (checked) {
        return { ...prev, amenities: [...currentAmenities, amenityValue] };
      } else {
        return { ...prev, amenities: currentAmenities.filter(a => a !== amenityValue) };
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.business_name) newErrors.name = "Nome é obrigatório";
    if (!formData.business_type) newErrors.type = "Tipo é obrigatório";
    if (!formData.city_id) newErrors.city_id = "Cidade é obrigatória";
    
    // Validar email
    if (formData.business_email && !/\S+@\S+\.\S+/.test(formData.business_email)) {
      newErrors.email = "Email inválido";
    }
    
    // Validar discount_value se is_club_member for true
    if (formData.is_club_member && (!formData.discount_value || formData.discount_value <= 0)) {
      newErrors.discount_value = "Valor de desconto deve ser maior que zero";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os erros no formulário.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const businessData = {
        ...formData, // Usar todos os campos do formData
        discount_value: formData.is_club_member ? Number(formData.discount_value) : 0,
        discount_type: formData.is_club_member ? formData.discount_type : null,
        discount_description: formData.is_club_member ? formData.discount_description : null,
        beach_id: formData.beach_id || null,
      };
      // Remover chaves antigas se existirem (name, type, email)
      delete businessData.name;
      delete businessData.type;
      delete businessData.email;
      
      await onSave(businessData);
      
      toast({
        title: "Sucesso",
        description: mode === "create" ? "Comércio criado com sucesso!" : "Comércio atualizado com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao salvar comércio:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar os dados.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const amenityOptions = [
    { value: "pet_friendly", label: "Aceita Pets" },
    { value: "wifi", label: "Wi-Fi Grátis" },
    { value: "changing_station", label: "Fraldário" },
    { value: "pub_style", label: "Estilo Pub" },
    { value: "family_friendly", label: "Ambiente Familiar" },
    { value: "live_music", label: "Música ao Vivo" },
    { value: "theme_rock", label: "Temático: Rock" },
    { value: "theme_mpb", label: "Temático: MPB" },
    { value: "theme_sertanejo", label: "Temático: Sertanejo" },
    { value: "theme_gauchesco", label: "Temático: Gaúcho" },
    { value: "music_style_rock", label: "Estilo Musical: Rock" },
    { value: "music_style_mpb", label: "Estilo Musical: MPB" },
    { value: "music_style_sertanejo", label: "Estilo Musical: Sertanejo" },
    { value: "music_style_gauchesco", label: "Estilo Musical: Gaúcho" },
    { value: "accessibility", label: "Acessibilidade" },
    { value: "menu_vegan", label: "Cardápio Vegano" },
    { value: "menu_vegetarian", label: "Cardápio Vegetariano" },
    { value: "menu_steakhouse", label: "Churrascaria" },
    { value: "menu_japanese", label: "Culinária Japonesa" },
    { value: "menu_chinese", label: "Culinária Chinesa" },
    { value: "outdoor_seating", label: "Mesas ao Ar Livre" },
    { value: "playground", label: "Espaço Kids/Playground" },
    { value: "parking", label: "Estacionamento" },
    { value: "air_conditioning", label: "Ar Condicionado" },
    { value: "delivery", label: "Delivery/Entrega" },
    { value: "take_away", label: "Para Levar/Retirar" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Seção de Informações Básicas */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Informações Básicas</h3>
        
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="business_name">Nome do Comércio *</Label>
            <Input
              id="business_name"
              name="business_name"
              value={formData.business_name}
              onChange={handleChange}
              placeholder="Ex: Restaurante Mar e Sol"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="business_type">Tipo de Comércio *</Label>
            <Select
              name="business_type"
              value={formData.business_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, business_type: value }))}
            >
              <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {types && types.map(type => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && <p className="text-red-500 text-xs">{errors.type}</p>}
          </div>
        </div>


        {/* Imagem Principal */}
        <div className="space-y-2">
          <Label>Imagem Principal</Label>
          <div className="flex flex-col space-y-2">
            {formData.image_url ? (
              <div className="relative h-40 rounded-md overflow-hidden mb-2">
                <img
                  src={formData.image_url}
                  alt="Preview Imagem Principal"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=Imagem+n%C3%A3o+dispon%C3%ADvel';
                  }}
                />
              </div>
            ) : (
              <div className="h-40 bg-gray-100 rounded-md flex items-center justify-center mb-2">
                <p className="text-gray-500">Nenhuma imagem principal selecionada</p>
              </div>
            )}
            <input
              type="file"
              id="image_upload_main"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "main")}
              disabled={uploadingImage}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('image_upload_main').click()}
              disabled={uploadingImage}
              className="w-full"
            >
              {uploadingImage ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...</>
              ) : (
                <><Upload className="w-4 h-4 mr-2" /> {formData.image_url ? "Trocar Imagem Principal" : "Enviar Imagem Principal"}</>
              )}
            </Button>
          </div>
        </div>

        {/* Logomarca */}
        <div className="space-y-2">
          <Label>Logomarca</Label>
          <div className="flex flex-col space-y-2">
            {formData.logo_url ? (
              <div className="relative w-32 h-32 rounded-md overflow-hidden mb-2 border">
                <img
                  src={formData.logo_url}
                  alt="Preview Logomarca"
                  className="w-full h-full object-contain p-1"
                   onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/128x128?text=Logo';
                  }}
                />
              </div>
            ) : (
              <div className="w-32 h-32 bg-gray-100 rounded-md flex items-center justify-center mb-2 border">
                <p className="text-gray-500 text-xs text-center">Nenhuma logomarca</p>
              </div>
            )}
            <input
              type="file"
              id="image_upload_logo"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "logo")}
              disabled={uploadingLogo}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('image_upload_logo').click()}
              disabled={uploadingLogo}
              className="w-full md:w-auto"
            >
              {uploadingLogo ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...</>
              ) : (
                <><Upload className="w-4 h-4 mr-2" /> {formData.logo_url ? "Trocar Logomarca" : "Enviar Logomarca"}</>
              )}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="business_email">Email de Contato</Label>
            <Input
              type="email"
              id="business_email"
              name="business_email"
              value={formData.business_email}
              onChange={handleChange}
              placeholder="email@exemplo.com"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="business_phone">Telefone</Label>
            <Input
              id="business_phone"
              name="business_phone"
              value={formData.business_phone}
              onChange={handleChange}
              placeholder="(99) 99999-9999"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city_id">Cidade *</Label>
            <Select
              name="city_id"
              value={formData.city_id}
              onValueChange={handleCityChange}
            >
              <SelectTrigger className={errors.city_id ? "border-red-500" : ""}>
                <SelectValue placeholder="Selecione uma cidade" />
              </SelectTrigger>
              <SelectContent>
                {cities && cities.map(city => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.city_id && <p className="text-red-500 text-xs">{errors.city_id}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="beach_id">Praia (opcional)</Label>
            <Select
              name="beach_id"
              value={formData.beach_id || ""}
              onValueChange={(value) => setFormData(prev => ({ ...prev, beach_id: value }))}
              disabled={!formData.city_id || beaches.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={!formData.city_id ? "Selecione uma cidade primeiro" : beaches.length === 0 ? "Sem praias disponíveis" : "Selecione uma praia"} />
              </SelectTrigger>
              <SelectContent>
                {beaches.map(beach => (
                  <SelectItem key={beach.id} value={beach.id}>
                    {beach.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
       <div className="space-y-4">
        <h3 className="text-lg font-medium">Descrição e Detalhes</h3>
        
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Descreva seu estabelecimento..."
            rows={4}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="address">Endereço</Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Rua, número, bairro, etc."
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="www.seusite.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="opening_hours">Horário de Funcionamento</Label>
            <Input
              id="opening_hours"
              name="opening_hours"
              value={formData.opening_hours}
              onChange={handleChange}
              placeholder="Seg-Sex: 9h às 18h, Sáb: 9h às 13h"
            />
          </div>
        </div>
      </div>

      {/* Seção de Comodidades */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Comodidades e Características</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {amenityOptions.map(amenity => (
            <div key={amenity.value} className="flex items-center space-x-2">
              <Checkbox
                id={`amenity-${amenity.value}`}
                checked={(formData.amenities || []).includes(amenity.value)}
                onCheckedChange={(checked) => handleAmenityChange(amenity.value, checked)}
              />
              <Label htmlFor={`amenity-${amenity.value}`} className="font-normal">
                {amenity.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-4 bg-amber-50 p-4 rounded-md border border-amber-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-amber-800">Clube de Assinantes</h3>
            <p className="text-sm text-amber-700">Ofereça descontos especiais para membros do clube</p>
          </div>
          <Switch
            checked={formData.is_club_member}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_club_member: checked }))}
          />
        </div>
        
        {formData.is_club_member && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount_type">Tipo de Desconto</Label>
                <Select
                  name="discount_type"
                  value={formData.discount_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, discount_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de desconto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentual">Percentual (%)</SelectItem>
                    <SelectItem value="fixo">Valor Fixo (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="discount_value">
                  {formData.discount_type === "percentual" ? "Percentual de Desconto (%)" : "Valor do Desconto (R$)"}
                </Label>
                <Input
                  type="number"
                  id="discount_value"
                  name="discount_value"
                  value={formData.discount_value}
                  onChange={handleChange}
                  placeholder="10"
                  min="0"
                  step={formData.discount_type === "percentual" ? "1" : "0.01"}
                  className={errors.discount_value ? "border-red-500" : ""}
                />
                {errors.discount_value && <p className="text-red-500 text-xs">{errors.discount_value}</p>}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="discount_description">Descrição do Desconto</Label>
              <Textarea
                id="discount_description"
                name="discount_description"
                value={formData.discount_description}
                onChange={handleChange}
                placeholder="Ex: 10% de desconto em todos os produtos exceto bebidas alcoólicas"
                rows={2}
              />
            </div>
          </div>
        )}
      </div>
      
       <div className="flex justify-end gap-3 pt-4">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {mode === "create" ? "Criando..." : "Atualizando..."}
            </>
          ) : (
            <>
              {mode === "create" ? "Criar Comércio" : "Atualizar Comércio"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
