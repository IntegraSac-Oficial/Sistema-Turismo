
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Property } from "@/api/entities";
import { PropertyCategory } from "@/api/entities";
import { City } from "@/api/entities";
import { Realtor } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Home,
  Save,
  ArrowLeft,
  Upload,
  X,
  MapPin,
  Search,
  Loader2
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import BackButton from "@/components/ui/BackButton";
import ImageUploader from "@/components/properties/ImageUploader";

export default function PropertyForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const propertyId = urlParams.get("id");
  
  const initialFormData = {
    title: "",
    description: "",
    category_id: "",
    price: "",
    property_type: "sale",
    city_id: "",
    address: "",
    neighborhood: "",
    postal_code: "",
    state: "SC", // Definir Santa Catarina como padrão
    area: "",
    bedrooms: "",
    bathrooms: "",
    suites: "",
    parking_spots: "",
    amenities: [],
    features: [],
    main_image_url: "",
    images: [],
    realtor_id: "",
    status: "active",
    condo_fee: "",
    iptu: "",
    is_featured: false,
    accepts_pets: false,
    latitude: "",
    longitude: ""
  };

  const [formData, setFormData] = useState({...initialFormData});
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [realtors, setRealtors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCoordinates, setIsLoadingCoordinates] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Carregar dados iniciais
        const [categoriesData, citiesData, realtorsData] = await Promise.all([
          PropertyCategory.list(),
          City.list(),
          Realtor.list()
        ]);

        setCategories(categoriesData || []);
        setCities(citiesData || []);
        setRealtors(realtorsData || []);

        // Se for edição, carregar dados do imóvel
        if (propertyId) {
          const propertyData = await Property.get(propertyId);
          setFormData({
            ...initialFormData, // Usar initialFormData para garantir todos os campos
            ...propertyData,
            price: propertyData.price?.toString() || "",
            area: propertyData.area?.toString() || "",
            bedrooms: propertyData.bedrooms?.toString() || "",
            bathrooms: propertyData.bathrooms?.toString() || "",
            suites: propertyData.suites?.toString() || "",
            parking_spots: propertyData.parking_spots?.toString() || "",
            condo_fee: propertyData.condo_fee?.toString() || "",
            iptu: propertyData.iptu?.toString() || "",
            amenities: propertyData.amenities || [],
            images: propertyData.images || [],
            features: propertyData.features || [],
            // Garantir que latitude e longitude sejam strings para o input
            latitude: propertyData.latitude?.toString() || "",
            longitude: propertyData.longitude?.toString() || "",
            state: propertyData.state || "SC", // Garantir que o estado seja carregado ou padrão
            postal_code: propertyData.postal_code || "", // Carregar CEP
          });
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados necessários.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [propertyId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const toggleAmenity = (amenity) => {
    setFormData(prev => {
      const amenities = prev.amenities || [];
      if (amenities.includes(amenity)) {
        return {
          ...prev,
          amenities: amenities.filter(a => a !== amenity)
        };
      } else {
        return {
          ...prev,
          amenities: [...amenities, amenity]
        };
      }
    });
  };
  
  const handleFeatureChange = (e) => {
    const value = e.target.value;
    if (!value) return;
    
    setFormData(prev => ({
      ...prev,
      features: [...(prev.features || []), value]
    }));
    
    e.target.value = "";
  };
  
  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = (urls) => {
    if (urls.length > 0) {
      // Se ainda não tiver imagem principal, definir a primeira como principal
      if (!formData.main_image_url) {
        setFormData({
          ...formData,
          main_image_url: urls[0],
          images: [...(formData.images || []), ...urls.slice(1)]
        });
      } else {
        setFormData({
          ...formData,
          images: [...(formData.images || []), ...urls]
        });
      }
    }
  };

  const setMainImage = (url) => {
    const updatedImages = [...(formData.images || [])];
    if (formData.main_image_url) {
      updatedImages.push(formData.main_image_url);
    }
    updatedImages.splice(updatedImages.indexOf(url), 1);

    setFormData({
      ...formData,
      main_image_url: url,
      images: updatedImages
    });
  };

  const removeImage = (url) => {
    if (url === formData.main_image_url) {
      const updatedImages = [...(formData.images || [])];
      setFormData({
        ...formData,
        main_image_url: updatedImages.length > 0 ? updatedImages[0] : "",
        images: updatedImages.length > 0 ? updatedImages.slice(1) : []
      });
    } else {
      setFormData({
        ...formData,
        images: (formData.images || []).filter(img => img !== url)
      });
    }
  };

  // Função para obter coordenadas a partir do endereço
  const geocodeAddress = async () => {
    // Verificar se temos dados suficientes para buscar
    if (!formData.address || !formData.city_id) {
      toast({
        title: "Informações insuficientes",
        description: "Preencha pelo menos o endereço e a cidade para buscar coordenadas.",
        variant: "warning"
      });
      return;
    }
    
    setIsLoadingCoordinates(true);
    
    try {
      // Construir o endereço completo
      const cityObj = cities.find(c => c.id === formData.city_id);
      const cityName = cityObj ? cityObj.name : '';
      
      let fullAddress = `${formData.address}`;
      if (formData.neighborhood) fullAddress += `, ${formData.neighborhood}`;
      fullAddress += `, ${cityName}, ${formData.state || 'SC'}, Brasil`;
      if (formData.postal_code) fullAddress += `, ${formData.postal_code}`;
      
      const query = encodeURIComponent(fullAddress);
      
      // Usar o Nominatim OpenStreetMap para geocodificação
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
      
      if (!response.ok) {
        throw new Error("Erro na API de geocodificação");
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        
        setFormData(prev => ({
          ...prev,
          latitude: parseFloat(lat),
          longitude: parseFloat(lon)
        }));
        
        toast({
          title: "Coordenadas encontradas",
          description: "Latitude e longitude foram preenchidas automaticamente.",
          variant: "default"
        });
      } else {
        toast({
          title: "Endereço não encontrado",
          description: "Não foi possível obter coordenadas para o endereço informado. Tente ser mais específico ou informe manualmente.",
          variant: "warning"
        });
      }
    } catch (error) {
      console.error("Erro ao geocodificar endereço:", error);
      toast({
        title: "Erro ao buscar coordenadas",
        description: error.message || "Ocorreu um erro ao buscar as coordenadas. Tente novamente ou preencha manualmente.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingCoordinates(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Se não tiver coordenadas, tentar obter automaticamente
      let updatedFormData = { ...formData };

      if ((!updatedFormData.latitude || !updatedFormData.longitude) && updatedFormData.address && updatedFormData.city_id) {
        const cityObj = cities.find(c => c.id === updatedFormData.city_id);
        const cityName = cityObj ? cityObj.name : '';
        
        let fullAddress = `${updatedFormData.address}`;
        if (updatedFormData.neighborhood) fullAddress += `, ${updatedFormData.neighborhood}`;
        fullAddress += `, ${cityName}, ${updatedFormData.state || 'SC'}, Brasil`;
        if (updatedFormData.postal_code) fullAddress += `, ${updatedFormData.postal_code}`;
        
        const query = encodeURIComponent(fullAddress);
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            const { lat, lon } = data[0];
            updatedFormData.latitude = parseFloat(lat);
            updatedFormData.longitude = parseFloat(lon);
            toast({
              title: "Coordenadas encontradas",
              description: "Latitude e longitude foram preenchidas e serão salvas.",
              variant: "default"
            });
          }
        }
      }
      
      // Formatar dados para envio
      const dataToSave = {
        ...updatedFormData,
        price: parseFloat(updatedFormData.price) || 0,
        area: parseFloat(updatedFormData.area) || 0,
        bedrooms: parseInt(updatedFormData.bedrooms) || 0,
        bathrooms: parseInt(updatedFormData.bathrooms) || 0,
        suites: parseInt(updatedFormData.suites) || 0,
        parking_spots: parseInt(updatedFormData.parking_spots) || 0,
        condo_fee: parseFloat(updatedFormData.condo_fee) || 0,
        iptu: parseFloat(updatedFormData.iptu) || 0,
        // Converter latitude e longitude para número antes de salvar
        latitude: updatedFormData.latitude ? parseFloat(String(updatedFormData.latitude).replace(",", ".")) : null,
        longitude: updatedFormData.longitude ? parseFloat(String(updatedFormData.longitude).replace(",", ".")) : null,
      };
      
      // Remover campos vazios que não devem ser enviados, exceto os numéricos que podem ser 0
      Object.keys(dataToSave).forEach(key => {
        if (dataToSave[key] === "" && !['price', 'area', 'bedrooms', 'bathrooms', 'suites', 'parking_spots', 'condo_fee', 'iptu'].includes(key)) {
            // Deixar latitude e longitude nulos se vazios, em vez de deletar
            if (key !== 'latitude' && key !== 'longitude') {
                 delete dataToSave[key];
            }
        }
      });
      
      // Salvar ou atualizar o imóvel
      if (propertyId) {
        await Property.update(propertyId, dataToSave);
        toast({
          title: "Imóvel atualizado",
          description: "O imóvel foi atualizado com sucesso.",
          variant: "default"
        });
      } else {
        await Property.create(dataToSave);
        toast({
          title: "Imóvel cadastrado",
          description: "O imóvel foi cadastrado com sucesso.",
          variant: "default"
        });
      }
      
      navigate(createPageUrl("Properties"));
    } catch (error) {
      console.error("Erro ao salvar imóvel:", error);
      let description = "Ocorreu um erro ao salvar o imóvel. Verifique os dados e tente novamente.";
      if (error.response && error.response.data && error.response.data.detail) {
        description = error.response.data.detail;
      } else if (error.message) {
        description = error.message;
      }
      toast({
        title: "Erro ao salvar",
        description: description,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  const amenitiesList = [
    { id: "pool", label: "Piscina" },
    { id: "gym", label: "Academia" },
    { id: "barbecue", label: "Churrasqueira" },
    { id: "playground", label: "Playground" },
    { id: "security", label: "Segurança" },
    { id: "elevator", label: "Elevador" },
    { id: "furnished", label: "Mobiliado" },
    { id: "balcony", label: "Sacada" },
    { id: "laundry", label: "Lavanderia" },
    { id: "party_room", label: "Salão de Festas" },
    { id: "pet_friendly", label: "Aceita Pets" },
    { id: "ocean_view", label: "Vista para o Mar" },
    { id: "air_conditioning", label: "Ar Condicionado" },
    { id: "security_cameras", label: "Câmeras de Segurança" },
    { id: "wifi", label: "Wi-Fi" },
    { id: "kitchen", label: "Cozinha Equipada" },
    { id: "private_pool", label: "Piscina Privativa" },
    { id: "year_round_pool", label: "Piscina Aquecida" },
    { id: "workspace", label: "Espaço para Trabalho" },
    { id: "parking", label: "Estacionamento" },
    { id: "garden", label: "Jardim" },
    { id: "gourmet_area", label: "Área Gourmet" }
  ];
  
  // Mapeamento de estados brasileiros
  const states = [
    {value: "AC", label: "Acre"},
    {value: "AL", label: "Alagoas"},
    {value: "AP", label: "Amapá"},
    {value: "AM", label: "Amazonas"},
    {value: "BA", label: "Bahia"},
    {value: "CE", label: "Ceará"},
    {value: "DF", label: "Distrito Federal"},
    {value: "ES", label: "Espírito Santo"},
    {value: "GO", label: "Goiás"},
    {value: "MA", label: "Maranhão"},
    {value: "MT", label: "Mato Grosso"},
    {value: "MS", label: "Mato Grosso do Sul"},
    {value: "MG", label: "Minas Gerais"},
    {value: "PA", label: "Pará"},
    {value: "PB", label: "Paraíba"},
    {value: "PR", label: "Paraná"},
    {value: "PE", label: "Pernambuco"},
    {value: "PI", label: "Piauí"},
    {value: "RJ", label: "Rio de Janeiro"},
    {value: "RN", label: "Rio Grande do Norte"},
    {value: "RS", label: "Rio Grande do Sul"},
    {value: "RO", label: "Rondônia"},
    {value: "RR", label: "Roraima"},
    {value: "SC", label: "Santa Catarina"},
    {value: "SP", label: "São Paulo"},
    {value: "SE", label: "Sergipe"},
    {value: "TO", label: "Tocantins"}
  ];

  return (
    <div className="p-6">
      <BackButton />
      <div className="max-w-6xl mx-auto">
        <Card className="shadow-md border-0">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-2xl flex items-center text-blue-800">
              <Home className="mr-2 h-6 w-6" />
              {propertyId ? "Editar Imóvel" : "Novo Imóvel"}
            </CardTitle>
            <CardDescription>
              Preencha os dados do imóvel para criar ou atualizar o anúncio
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit}>
              <h2 className="text-xl font-semibold mb-4">Informações Básicas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Título*</label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="ex: Casa com 3 quartos em Jurerê Internacional"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Categoria*</label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => handleSelectChange("category_id", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo de Negócio*</label>
                  <Select
                    value={formData.property_type}
                    onValueChange={(value) => handleSelectChange("property_type", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">Venda</SelectItem>
                      <SelectItem value="rent">Aluguel</SelectItem>
                      <SelectItem value="temporary">Temporada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Preço*</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      R$
                    </span>
                    <Input
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0,00"
                      className="pl-10"
                      type="number"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="sold">Vendido</SelectItem>
                      <SelectItem value="rented">Alugado</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Descrição*</label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Descrição detalhada do imóvel..."
                    rows={5}
                    required
                  />
                </div>
              </div>

              <h2 className="text-xl font-semibold mb-4">Localização</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Cidade*</label>
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
                  <label className="block text-sm font-medium mb-1">Estado</label>
                  <Select
                    value={formData.state}
                    onValueChange={(value) => handleSelectChange("state", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state.value} value={state.value}>
                          {state.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bairro</label>
                  <Input
                    name="neighborhood"
                    value={formData.neighborhood}
                    onChange={handleChange}
                    placeholder="ex: Centro"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">CEP</label>
                  <Input
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleChange}
                    placeholder="ex: 88000-000"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Endereço</label>
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="ex: Rua exemplo, 123"
                  />
                </div>
              </div>

              <h2 className="text-xl font-semibold mb-4">Latitude e Longitude</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Latitude</label>
                  <Input
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="ex: -27.59"
                    type="text"
                    step="0.0000001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Longitude</label>
                  <Input
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="ex: -48.54"
                    type="text"
                    step="0.0000001"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    type="button" 
                    onClick={geocodeAddress}
                    className="bg-blue-600 hover:bg-blue-700 mb-1 w-full"
                    disabled={isLoadingCoordinates}
                  >
                    {isLoadingCoordinates ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Buscando...
                      </>
                    ) : (
                      <>
                        <MapPin className="mr-2 h-4 w-4" />
                        Buscar Coordenadas
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <h2 className="text-xl font-semibold mb-4">Características</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Área (m²)</label>
                  <Input
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    placeholder="0"
                    type="number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quartos</label>
                  <Input
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    placeholder="0"
                    type="number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Banheiros</label>
                  <Input
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    placeholder="0"
                    type="number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Vagas de Garagem</label>
                  <Input
                    name="parking_spots"
                    value={formData.parking_spots}
                    onChange={handleChange}
                    placeholder="0"
                    type="number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Suítes</label>
                  <Input
                    name="suites"
                    value={formData.suites}
                    onChange={handleChange}
                    placeholder="0"
                    type="number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Valor do Condomínio</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      R$
                    </span>
                    <Input
                      name="condo_fee"
                      value={formData.condo_fee}
                      onChange={handleChange}
                      placeholder="0,00"
                      className="pl-10"
                      type="number"
                      step="0.01"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">IPTU Anual</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      R$
                    </span>
                    <Input
                      name="iptu"
                      value={formData.iptu}
                      onChange={handleChange}
                      placeholder="0,00"
                      className="pl-10"
                      type="number"
                      step="0.01"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Checkbox
                    id="accepts_pets"
                    name="accepts_pets"
                    checked={formData.accepts_pets}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, accepts_pets: checked })
                    }
                  />
                  <label
                    htmlFor="accepts_pets"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Aceita Pets
                  </label>
                </div>
                
                <div className="flex items-center space-x-2 pt-8">
                  <Checkbox
                    id="is_featured"
                    name="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, is_featured: checked })
                    }
                  />
                  <label
                    htmlFor="is_featured"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Destaque
                  </label>
                </div>
              </div>

              <h2 className="text-xl font-semibold mb-4">Comodidades</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
                {amenitiesList.map((amenity) => (
                  <div key={amenity.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`amenity-${amenity.id}`}
                      checked={(formData.amenities || []).includes(amenity.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          toggleAmenity(amenity.id);
                        } else {
                          toggleAmenity(amenity.id);
                        }
                      }}
                    />
                    <label
                      htmlFor={`amenity-${amenity.id}`}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {amenity.label}
                    </label>
                  </div>
                ))}
              </div>
              
              <h2 className="text-xl font-semibold mb-4">Características Adicionais</h2>
              <div className="mb-6">
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Adicione características extras (ex: Próximo à praia)"
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleFeatureChange(e);
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    onClick={(e) => handleFeatureChange({target: e.target.previousSibling})}
                  >
                    Adicionar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {(formData.features || []).map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-blue-50 px-3 py-1 rounded-full text-blue-800 text-sm"
                    >
                      {feature}
                      <X
                        className="ml-1 h-4 w-4 cursor-pointer hover:text-red-600"
                        onClick={() => removeFeature(index)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <h2 className="text-xl font-semibold mb-4">Informações do Anúncio</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Imobiliária/Corretor*</label>
                  <Select
                    value={formData.realtor_id}
                    onValueChange={(value) => handleSelectChange("realtor_id", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a imobiliária" />
                    </SelectTrigger>
                    <SelectContent>
                      {realtors.map((realtor) => (
                        <SelectItem key={realtor.id} value={realtor.id}>
                          {realtor.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <h2 className="text-xl font-semibold mb-4">Imagens</h2>
              <div className="mb-6">
                <ImageUploader onUpload={handleImageUpload} />
                
                {formData.main_image_url && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">Imagem Principal</label>
                    <div className="relative inline-block">
                      <img
                        src={formData.main_image_url}
                        alt="Imagem principal"
                        className="w-40 h-40 object-cover rounded-md border-2 border-blue-500"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={() => removeImage(formData.main_image_url)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {(formData.images || []).length > 0 && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">Imagens Adicionais</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Imagem ${index + 1}`}
                            className="w-full h-32 object-cover rounded-md"
                          />
                          <div className="absolute top-2 right-2 flex gap-1">
                            <Button
                              type="button"
                              variant="secondary"
                              size="icon"
                              className="h-6 w-6 bg-white/80 hover:bg-white"
                              onClick={() => setMainImage(image)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                              </svg>
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => removeImage(image)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(createPageUrl("Properties"))}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {propertyId ? "Atualizar" : "Cadastrar"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
