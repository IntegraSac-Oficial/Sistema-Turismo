
import React, { useState, useEffect, useCallback } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Event } from "@/api/entities";
import { City } from "@/api/entities";
import { Beach } from "@/api/entities";
import { Business } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { toast } from "@/components/ui/use-toast";
import { Calendar as CalendarIcon, MapPin, Clock, Image, Loader2, Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function UserEventForm({ open, onOpenChange, eventToEdit, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [beaches, setBeaches] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [selectedLocationType, setSelectedLocationType] = useState("city");
  const [locationOptions, setLocationOptions] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    short_description: "",
    start_date: null,
    end_date: null,
    start_time: "",
    end_time: "",
    location_type: "city",
    location_id: "",
    location_name: "",
    image_url: "",
    category: "",
    is_featured: false,
    website: "",
    address: "",
    contact_email: "",
    contact_phone: "",
    organizer: "",
    tags: [],
    status: "pending" // Adicionar status default "pending"
  });
  
  const navigate = useNavigate();
  
  const eventCategories = [
    { value: "cultural", label: "Cultural" },
    { value: "esportivo", label: "Esportivo" },
    { value: "gastronômico", label: "Gastronômico" },
    { value: "musical", label: "Musical" },
    { value: "festivo", label: "Festivo" },
    { value: "religioso", label: "Religioso" },
    { value: "feira", label: "Feira" },
    { value: "outro", label: "Outro" }
  ];

  useEffect(() => {
    if (open) {
      resetForm();
      loadFormData();
    }
  }, [open]);

  // Função para resetar o formulário para estado inicial
  const resetForm = () => {
    if (!eventToEdit) {
      setFormData({
        title: "",
        description: "",
        short_description: "",
        start_date: null,
        end_date: null,
        start_time: "",
        end_time: "",
        location_type: "city",
        location_id: "",
        location_name: "",
        image_url: "",
        category: "",
        is_featured: false,
        website: "",
        address: "",
        contact_email: "",
        contact_phone: "",
        organizer: "",
        tags: [],
        status: "pending" // Manter status "pending" para novos eventos
      });
      setSelectedLocationType("city");
    }
  };

  useEffect(() => {
    if (eventToEdit) {
      console.log("Editando evento:", eventToEdit);
      setFormData({
        ...eventToEdit,
        start_date: eventToEdit.start_date ? new Date(eventToEdit.start_date) : null,
        end_date: eventToEdit.end_date ? new Date(eventToEdit.end_date) : null,
        status: eventToEdit.status || "pending" // Preservar o status existente
      });
      setSelectedLocationType(eventToEdit.location_type || "city");
    }
  }, [eventToEdit]);

  useEffect(() => {
    if (selectedLocationType && cities.length > 0) {
      updateLocationOptions(selectedLocationType);
    }
  }, [selectedLocationType, cities, beaches, businesses]);

  const loadFormData = async () => {
    setIsLoading(true);
    try {
      // Carregar dados necessários para o formulário
      const [citiesData, beachesData, businessesData] = await Promise.all([
        City.list(),
        Beach.list(),
        Business.list()
      ]);

      setCities(citiesData || []);
      setBeaches(beachesData || []);
      setBusinesses(businessesData || []);
      
      // Definir opções iniciais de localização com base no tipo selecionado
      updateLocationOptions(selectedLocationType);
      
    } catch (error) {
      console.error("Erro ao carregar dados para o formulário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados necessários. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateLocationOptions = (locationType) => {
    switch (locationType) {
      case "city":
        setLocationOptions(cities.map(city => ({ id: city.id, name: city.name })));
        break;
      case "beach":
        setLocationOptions(beaches.map(beach => ({ id: beach.id, name: beach.name })));
        break;
      case "business":
        setLocationOptions(businesses.map(business => ({ id: business.id, name: business.business_name })));
        break;
      default:
        setLocationOptions([]);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationTypeChange = (type) => {
    setSelectedLocationType(type);
    setFormData(prev => ({
      ...prev,
      location_type: type,
      location_id: "",
      location_name: type === "other" ? prev.location_name : ""
    }));
    updateLocationOptions(type);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setFormData(prev => ({ ...prev, image_url: file_url }));
      toast({
        title: "Sucesso",
        description: "Imagem carregada com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      toast({
        title: "Erro",
        description: "Não foi possível fazer o upload da imagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.start_date || !formData.category) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      
      if (!currentUser || !currentUser.id) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para criar eventos.",
          variant: "destructive"
        });
        return;
      }
      
      const eventData = {
        ...formData,
        start_date: formData.start_date ? format(formData.start_date, 'yyyy-MM-dd') : null,
        end_date: formData.end_date ? format(formData.end_date, 'yyyy-MM-dd') : null,
        created_by: currentUser.id, // Garantir que created_by seja o ID do usuário atual
        status: 'pending' // Sempre definir como pending ao criar/editar
      };
      
      console.log("Dados do evento a serem salvos:", eventData);
      
      // Para location_name quando é um local selecionado a partir de uma lista
      if (formData.location_type !== 'other' && formData.location_id) {
        const selectedLocation = locationOptions.find(loc => loc.id === formData.location_id);
        eventData.location_name = selectedLocation ? selectedLocation.name : formData.location_name;
      }
      
      let result;
      if (eventToEdit?.id) {
        // Atualizar evento existente
        result = await Event.update(eventToEdit.id, eventData);
        toast({
          title: "Sucesso",
          description: "Evento atualizado com sucesso! Aguarde a aprovação do administrador.",
        });
      } else {
        // Criar novo evento
        result = await Event.create(eventData);
        toast({
          title: "Sucesso",
          description: "Evento criado com sucesso! Aguarde a aprovação do administrador.",
        });
      }
      
      console.log("Evento salvo:", result);
      
      // Fechar o formulário e notificar o componente pai sobre o sucesso
      onOpenChange(false);
      if (onSuccess) onSuccess(result);
      
    } catch (error) {
      console.error("Erro ao salvar evento:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar o evento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {eventToEdit ? "Editar Evento" : "Criar Novo Evento"}
          </DialogTitle>
          <DialogDescription>
            Preencha as informações para {eventToEdit ? "atualizar seu" : "criar um novo"} evento. 
            Os eventos criados passarão por aprovação antes de serem publicados.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Título */}
            <div className="col-span-1 md:col-span-2">
              <Label htmlFor="title" className="font-medium">
                Título do Evento <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="title"
                placeholder="Ex: Festival de Verão"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                required
                className="mt-1"
              />
            </div>
            
            {/* Data de Início */}
            <div>
              <Label className="font-medium">
                Data de Início <span className="text-red-500">*</span>
              </Label>
              <div className="mt-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.start_date ? (
                        format(formData.start_date, 'dd/MM/yyyy', { locale: ptBR })
                      ) : (
                        <span className="text-muted-foreground">Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.start_date}
                      onSelect={(date) => handleInputChange("start_date", date)}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} // Desabilita datas passadas
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            {/* Data de Término */}
            <div>
              <Label className="font-medium">
                Data de Término
              </Label>
              <div className="mt-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.end_date ? (
                        format(formData.end_date, 'dd/MM/yyyy', { locale: ptBR })
                      ) : (
                        <span className="text-muted-foreground">Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.end_date}
                      onSelect={(date) => handleInputChange("end_date", date)}
                      disabled={(date) => date < (formData.start_date || new Date(new Date().setHours(0, 0, 0, 0)))}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            {/* Horário Início */}
            <div>
              <Label htmlFor="start_time" className="font-medium">
                Horário de Início
              </Label>
              <div className="flex items-center mt-1">
                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                <Input 
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => handleInputChange("start_time", e.target.value)}
                />
              </div>
            </div>
            
            {/* Horário Término */}
            <div>
              <Label htmlFor="end_time" className="font-medium">
                Horário de Término
              </Label>
              <div className="flex items-center mt-1">
                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                <Input 
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => handleInputChange("end_time", e.target.value)}
                />
              </div>
            </div>
            
            {/* Categoria */}
            <div>
              <Label className="font-medium">
                Categoria <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => handleInputChange("category", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {eventCategories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Tipo de Local */}
            <div>
              <Label className="font-medium">
                Tipo de Local <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={selectedLocationType} 
                onValueChange={handleLocationTypeChange}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="city">Cidade</SelectItem>
                  <SelectItem value="beach">Praia</SelectItem>
                  <SelectItem value="business">Estabelecimento</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Local (depende do tipo selecionado) */}
            {selectedLocationType !== "other" ? (
              <div>
                <Label className="font-medium">
                  {selectedLocationType === "city" ? "Cidade" : 
                   selectedLocationType === "beach" ? "Praia" : "Estabelecimento"}
                  <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={formData.location_id} 
                  onValueChange={(value) => handleInputChange("location_id", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={`Selecione ${selectedLocationType === "city" ? "uma cidade" : 
                                             selectedLocationType === "beach" ? "uma praia" : "um estabelecimento"}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {locationOptions.map(location => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <Label htmlFor="location_name" className="font-medium">
                  Nome do Local <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="location_name"
                  placeholder="Digite o nome do local"
                  value={formData.location_name}
                  onChange={(e) => handleInputChange("location_name", e.target.value)}
                  className="mt-1"
                />
              </div>
            )}
            
            {/* Endereço */}
            <div className="col-span-1 md:col-span-2">
              <Label htmlFor="address" className="font-medium">
                Endereço
              </Label>
              <div className="flex items-center mt-1">
                <MapPin className="w-4 h-4 mr-2 text-gray-400 absolute ml-3" />
                <Input 
                  id="address"
                  placeholder="Endereço completo"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Descrição Curta */}
            <div className="col-span-1 md:col-span-2">
              <Label htmlFor="short_description" className="font-medium">
                Descrição Curta
              </Label>
              <Input 
                id="short_description"
                placeholder="Breve descrição para listagens (max. 150 caracteres)"
                value={formData.short_description}
                onChange={(e) => handleInputChange("short_description", e.target.value)}
                className="mt-1"
                maxLength={150}
              />
            </div>
            
            {/* Descrição Completa */}
            <div className="col-span-1 md:col-span-2">
              <Label htmlFor="description" className="font-medium">
                Descrição Completa
              </Label>
              <Textarea 
                id="description"
                placeholder="Descreva detalhadamente o evento"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="mt-1"
                rows={5}
              />
            </div>
            
            {/* Imagem */}
            <div className="col-span-1 md:col-span-2">
              <Label className="font-medium">
                Imagem do Evento
              </Label>
              <div className="mt-1 space-y-2">
                {/* Preview da imagem se existir */}
                {formData.image_url && (
                  <div className="relative w-full h-48 rounded-md overflow-hidden">
                    <img 
                      src={formData.image_url} 
                      alt="Preview do evento" 
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => handleInputChange("image_url", "")}
                    >
                      Remover
                    </Button>
                  </div>
                )}
                
                {/* Input de upload */}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="image_upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="sr-only"
                  />
                  <Label
                    htmlFor="image_upload"
                    className="cursor-pointer flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <Image className="h-5 w-5" />
                        <span>Escolher Imagem</span>
                      </>
                    )}
                  </Label>
                  {!formData.image_url && (
                    <span className="text-xs text-gray-500">
                      Recomendado: 1200 x 800 pixels, máximo 5MB
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Informações de Contato - Uma coluna cada */}
            <div>
              <Label htmlFor="contact_email" className="font-medium">
                Email de Contato
              </Label>
              <Input 
                id="contact_email"
                type="email"
                placeholder="contato@exemplo.com"
                value={formData.contact_email}
                onChange={(e) => handleInputChange("contact_email", e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="contact_phone" className="font-medium">
                Telefone de Contato
              </Label>
              <Input 
                id="contact_phone"
                placeholder="(00) 00000-0000"
                value={formData.contact_phone}
                onChange={(e) => handleInputChange("contact_phone", e.target.value)}
                className="mt-1"
              />
            </div>
            
            {/* Website */}
            <div>
              <Label htmlFor="website" className="font-medium">
                Website do Evento
              </Label>
              <Input 
                id="website"
                placeholder="https://www.exemplo.com"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                className="mt-1"
              />
            </div>
            
            {/* Organizador */}
            <div>
              <Label htmlFor="organizer" className="font-medium">
                Organizador do Evento
              </Label>
              <Input 
                id="organizer"
                placeholder="Nome do organizador"
                value={formData.organizer}
                onChange={(e) => handleInputChange("organizer", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_featured"
              checked={formData.is_featured}
              onCheckedChange={(checked) => handleInputChange("is_featured", checked)}
              disabled={true} // Usuários comuns não podem marcar eventos como destaque
            />
            <label
              htmlFor="is_featured"
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-500"
            >
              Evento em destaque (somente administradores)
            </label>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : eventToEdit ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Atualizar Evento
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Criar Evento
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
