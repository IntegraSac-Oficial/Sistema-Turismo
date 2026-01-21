import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  X, Store, Wrench, Check, Upload, Image, Building2, Percent, DollarSign
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadFile } from "@/api/integrations";

export default function RegisterModal({ type, cities, onClose }) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  // Business form state
  const [businessForm, setBusinessForm] = useState({
    name: "",
    type: "restaurante",
    city_id: "",
    description: "",
    address: "",
    phone: "",
    image_url: "",
    is_club_member: false,
    discount_type: "percentual",
    discount_value: ""
  });

  // Provider form state
  const [providerForm, setProviderForm] = useState({
    name: "",
    service_type: "pintor",
    city_id: "",
    phone: "",
    description: "",
    available: true,
    is_club_member: false,
    discount_type: "percentual",
    discount_value: ""
  });

  const handleBusinessInputChange = (e) => {
    const { name, value } = e.target;
    setBusinessForm(prev => ({ ...prev, [name]: value }));
  };

  const handleProviderInputChange = (e) => {
    const { name, value } = e.target;
    setProviderForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setImageUrl(file_url);
      
      if (type === "business") {
        setBusinessForm(prev => ({ ...prev, image_url: file_url }));
      }
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
    }
    setIsUploading(false);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // In a real app, you would save the business or provider here
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
      
      // Show success message
      if (type === "business") {
        alert("Comércio cadastrado com sucesso! Aguarde a aprovação do administrador.");
      } else {
        alert("Serviço cadastrado com sucesso! Aguarde a aprovação do administrador.");
      }
    }, 1500);
  };

  const getFormTitle = () => {
    if (type === "business") {
      return (
        <div className="flex items-center gap-2">
          <Store className="w-5 h-5 text-green-600" />
          <span>Cadastro de Comércio</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-orange-600" />
          <span>Cadastro de Prestador de Serviços</span>
        </div>
      );
    }
  };

  const renderBusinessForm = () => {
    const BUSINESS_TYPES = [
      { value: "restaurante", label: "Restaurante" },
      { value: "hotel", label: "Hotel" },
      { value: "pousada", label: "Pousada" },
      { value: "loja", label: "Loja" },
      { value: "outros", label: "Outros" }
    ];
    
    return (
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="mb-4 grid grid-cols-2">
          <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
          <TabsTrigger 
            value="membership"
            disabled={!businessForm.is_club_member}
          >
            Clube de Assinantes
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Comércio *</Label>
              <Input
                id="name"
                name="name"
                value={businessForm.name}
                onChange={handleBusinessInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select 
                value={businessForm.type} 
                onValueChange={(value) => setBusinessForm(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tipo" />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city_id">Cidade *</Label>
              <Select 
                value={businessForm.city_id} 
                onValueChange={(value) => setBusinessForm(prev => ({ ...prev, city_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma cidade" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map(city => (
                    <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                name="phone"
                value={businessForm.phone}
                onChange={handleBusinessInputChange}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Endereço *</Label>
            <Input
              id="address"
              name="address"
              value={businessForm.address}
              onChange={handleBusinessInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              value={businessForm.description}
              onChange={handleBusinessInputChange}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Image className="w-4 h-4 text-gray-500" />
              Foto do estabelecimento
            </Label>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <Input
                  name="image_url"
                  value={businessForm.image_url}
                  onChange={handleBusinessInputChange}
                  placeholder="URL da imagem"
                />
              </div>
              <div className="relative">
                <input 
                  type="file" 
                  id="image-upload" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
                <label 
                  htmlFor="image-upload" 
                  className="flex justify-center items-center py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md cursor-pointer"
                >
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Upload
                </label>
              </div>
            </div>
            
            {businessForm.image_url && (
              <div className="mt-2 p-2 border rounded-md inline-block max-w-xs">
                <img 
                  src={businessForm.image_url} 
                  alt="Preview" 
                  className="max-h-32 object-contain"
                  onError={(e) => e.target.src = "https://via.placeholder.com/300x200?text=Imagem+não+encontrada"}
                />
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="is_club_member"
              checked={businessForm.is_club_member}
              onCheckedChange={(checked) => setBusinessForm(prev => ({ ...prev, is_club_member: checked }))}
            />
            <Label htmlFor="is_club_member">Participar do Clube de Assinantes</Label>
            <div className="ml-auto text-xs text-orange-500">+10% visibilidade</div>
          </div>
        </TabsContent>
        
        <TabsContent value="membership" className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-md p-4 mb-4">
            <h3 className="font-medium text-orange-800 flex items-center gap-2">
              <Check className="w-4 h-4" />
              Configuração de Descontos para Associados
            </h3>
            <p className="text-sm text-orange-700 mt-1">
              Como membro do Clube Praias Catarinenses, você precisa oferecer benefícios exclusivos aos associados. Seu negócio terá mais visibilidade na plataforma.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Desconto</Label>
              <Select 
                value={businessForm.discount_type} 
                onValueChange={(value) => setBusinessForm(prev => ({ ...prev, discount_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de desconto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentual">Desconto Percentual (%)</SelectItem>
                  <SelectItem value="fixo">Valor Fixo (R$)</SelectItem>
                  <SelectItem value="produto">Desconto em Produto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {businessForm.discount_type === "percentual" && (
              <div className="space-y-2">
                <Label htmlFor="discount_value" className="flex items-center">
                  <Percent className="w-4 h-4 mr-2" /> 
                  Percentual de Desconto
                </Label>
                <div className="relative">
                  <Input
                    id="discount_value"
                    name="discount_value"
                    type="number"
                    min="1"
                    max="100"
                    value={businessForm.discount_value}
                    onChange={handleBusinessInputChange}
                    placeholder="Ex: 10"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500">%</span>
                  </div>
                </div>
              </div>
            )}
            
            {businessForm.discount_type === "fixo" && (
              <div className="space-y-2">
                <Label htmlFor="discount_value" className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" /> 
                  Valor Fixo de Desconto
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-500">R$</span>
                  </div>
                  <Input
                    id="discount_value"
                    name="discount_value"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={businessForm.discount_value}
                    onChange={handleBusinessInputChange}
                    className="pl-10"
                    placeholder="Ex: 25.90"
                  />
                </div>
              </div>
            )}
            
            {businessForm.discount_type === "produto" && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-blue-800 text-sm">
                  Você poderá configurar os produtos com desconto após cadastrar seu comércio.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    );
  };

  const renderProviderForm = () => {
    const SERVICE_TYPES = [
      { value: "pintor", label: "Pintor" },
      { value: "diarista", label: "Diarista" },
      { value: "eletricista", label: "Eletricista" },
      { value: "pedreiro", label: "Pedreiro" },
      { value: "outros", label: "Outros" }
    ];
    
    return (
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="mb-4 grid grid-cols-2">
          <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
          <TabsTrigger 
            value="membership"
            disabled={!providerForm.is_club_member}
          >
            Clube de Assinantes
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                name="name"
                value={providerForm.name}
                onChange={handleProviderInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="service_type">Tipo de Serviço *</Label>
              <Select 
                value={providerForm.service_type} 
                onValueChange={(value) => setProviderForm(prev => ({ ...prev, service_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tipo" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city_id">Cidade de Atuação *</Label>
              <Select 
                value={providerForm.city_id} 
                onValueChange={(value) => setProviderForm(prev => ({ ...prev, city_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma cidade" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map(city => (
                    <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone de Contato *</Label>
              <Input
                id="phone"
                name="phone"
                value={providerForm.phone}
                onChange={handleProviderInputChange}
                placeholder="(00) 00000-0000"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição dos Serviços</Label>
            <Textarea
              id="description"
              name="description"
              value={providerForm.description}
              onChange={handleProviderInputChange}
              placeholder="Descreva os serviços que você oferece..."
              rows={3}
            />
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="available"
              checked={providerForm.available}
              onCheckedChange={(checked) => setProviderForm(prev => ({ ...prev, available: checked }))}
            />
            <Label htmlFor="available">Disponível para novos serviços</Label>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="is_club_member"
              checked={providerForm.is_club_member}
              onCheckedChange={(checked) => setProviderForm(prev => ({ ...prev, is_club_member: checked }))}
            />
            <Label htmlFor="is_club_member">Participar do Clube de Assinantes</Label>
            <div className="ml-auto text-xs text-orange-500">+10% visibilidade</div>
          </div>
        </TabsContent>
        
        <TabsContent value="membership" className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-md p-4 mb-4">
            <h3 className="font-medium text-orange-800 flex items-center gap-2">
              <Check className="w-4 h-4" />
              Configuração de Descontos para Associados
            </h3>
            <p className="text-sm text-orange-700 mt-1">
              Como membro do Clube Praias Catarinenses, você precisa oferecer benefícios exclusivos aos associados. Seu serviço terá mais visibilidade na plataforma.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Desconto</Label>
              <Select 
                value={providerForm.discount_type} 
                onValueChange={(value) => setProviderForm(prev => ({ ...prev, discount_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de desconto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentual">Desconto Percentual (%)</SelectItem>
                  <SelectItem value="fixo">Valor Fixo (R$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {providerForm.discount_type === "percentual" && (
              <div className="space-y-2">
                <Label htmlFor="discount_value" className="flex items-center">
                  <Percent className="w-4 h-4 mr-2" /> 
                  Percentual de Desconto
                </Label>
                <div className="relative">
                  <Input
                    id="discount_value"
                    name="discount_value"
                    type="number"
                    min="1"
                    max="100"
                    value={providerForm.discount_value}
                    onChange={handleProviderInputChange}
                    placeholder="Ex: 10"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500">%</span>
                  </div>
                </div>
              </div>
            )}
            
            {providerForm.discount_type === "fixo" && (
              <div className="space-y-2">
                <Label htmlFor="discount_value" className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" /> 
                  Valor Fixo de Desconto
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-500">R$</span>
                  </div>
                  <Input
                    id="discount_value"
                    name="discount_value"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={providerForm.discount_value}
                    onChange={handleProviderInputChange}
                    className="pl-10"
                    placeholder="Ex: 25.90"
                  />
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="border-b pb-4">
          <div className="flex justify-between items-center">
            <DialogTitle>{getFormTitle()}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          {type === "business" ? renderBusinessForm() : renderProviderForm()}
        </div>
        
        <div className="border-t pt-4 flex justify-between">
          <p className="text-sm text-gray-500 flex items-center">
            <Check className="text-green-500 w-4 h-4 mr-1" />
            Cadastros são avaliados em até 24h
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button 
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Enviando...
                </>
              ) : (
                "Concluir Cadastro"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}