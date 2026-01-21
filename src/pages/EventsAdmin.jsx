
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  RefreshCw,
  SlidersHorizontal,
  Check,
  X,
  Clock,
  Upload,
  MapPin,
  Tag,
  AlertTriangle,
  ArrowLeft
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import BackButton from "@/components/ui/BackButton";
import { Event } from "@/api/entities";
import { City } from "@/api/entities";
import { Beach } from "@/api/entities";
import { Business } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { useToast } from "@/components/ui/use-toast";

export default function EventsAdmin() {
  const [events, setEvents] = useState([]);
  const [cities, setCities] = useState([]);
  const [beaches, setBeaches] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [currentTab, setCurrentTab] = useState("upcoming");
  const [formData, setFormData] = useState(defaultFormData());
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [newTag, setNewTag] = useState("");
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Constantes para options
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

  const locationTypes = [
    { value: "city", label: "Cidade" },
    { value: "beach", label: "Praia" },
    { value: "business", label: "Comércio" },
    { value: "other", label: "Outro local" }
  ];

  function defaultFormData() {
    return {
      title: "",
      description: "",
      short_description: "",
      start_date: "",
      end_date: "",
      start_time: "",
      end_time: "",
      location_type: "city",
      location_id: "",
      location_name: "",
      address: "",
      image_url: "",
      gallery: [],
      category: "cultural",
      tags: [],
      website: "",
      ticket_url: "",
      organizer: "",
      contact_email: "",
      contact_phone: "",
      is_featured: false,
      price_info: "",
      latitude: null,
      longitude: null
    };
  }

  // Carregar dados iniciais
  useEffect(() => {
    loadEvents();
  }, [currentTab]);

  // Função para carregar eventos
  const loadEvents = async () => {
    setLoading(true);
    setIsLoading(true);
    try {
      const allEvents = await Event.list();
      
      // Filtrar por tab atual (próximos, passados, etc)
      let filteredEvents = allEvents;
      
      if (currentTab === "upcoming") {
        const today = new Date();
        filteredEvents = allEvents.filter(event => {
          const endDate = new Date(event.end_date || event.start_date);
          return endDate >= today;
        });
      } else if (currentTab === "past") {
        const today = new Date();
        filteredEvents = allEvents.filter(event => {
          const endDate = new Date(event.end_date || event.start_date);
          return endDate < today;
        });
      } else if (currentTab === "featured") {
        filteredEvents = allEvents.filter(event => event.is_featured);
      }
      
      // Aplicar pesquisa se houver termo de busca
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredEvents = filteredEvents.filter(
          event => event.title.toLowerCase().includes(term) || 
                  (event.description && event.description.toLowerCase().includes(term)) ||
                  (event.location_name && event.location_name.toLowerCase().includes(term))
        );
      }
      
      // Ordenar por data (mais próximos primeiro)
      filteredEvents.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
      
      setEvents(filteredEvents);
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os eventos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  // Carregar cidades, praias e comércios para seleção de local
  const loadLocations = async () => {
    try {
      const citiesData = await City.list();
      setCities(citiesData);
      
      const beachesData = await Beach.list();
      setBeaches(beachesData);
      
      const businessesData = await Business.list();
      setBusinesses(businessesData);
    } catch (error) {
      console.error("Erro ao carregar locais:", error);
    }
  };

  // Gerenciamento do formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateSelect = (date, field) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: date ? format(date, 'yyyy-MM-dd') : "" 
    }));
  };

  const handleCheckboxChange = (name) => {
    setFormData(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleLocationTypeChange = (type) => {
    setFormData(prev => ({ 
      ...prev, 
      location_type: type,
      location_id: "",
      location_name: type === "other" ? prev.location_name : ""
    }));
  };

  const handleLocationSelect = (id) => {
    let locationName = "";
    
    if (formData.location_type === "city") {
      const city = cities.find(c => c.id === id);
      locationName = city ? city.name : "";
    } else if (formData.location_type === "beach") {
      const beach = beaches.find(b => b.id === id);
      locationName = beach ? beach.name : "";
    } else if (formData.location_type === "business") {
      const business = businesses.find(b => b.id === id);
      locationName = business ? business.name : "";
    }
    
    setFormData(prev => ({ 
      ...prev, 
      location_id: id,
      location_name: locationName
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  // Funções de upload de imagens
  const handleMainImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validar tipo e tamanho
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      alert('Apenas imagens JPG e PNG são permitidas.');
      return;
    }
    
    if (file.size > maxSize) {
      alert('O tamanho máximo da imagem é 5MB.');
      return;
    }
    
    setUploadedImage(file);
    
    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    // Validar arquivos
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB por imagem
    const maxImages = 5; // Máximo de 5 imagens na galeria
    
    // Verificar quantidade
    if (galleryImages.length + files.length > maxImages) {
      alert(`Você pode adicionar no máximo ${maxImages} imagens na galeria.`);
      return;
    }
    
    // Filtrar arquivos válidos
    const validFiles = files.filter(file => {
      if (!validTypes.includes(file.type)) {
        alert(`Arquivo ${file.name}: apenas imagens JPG e PNG são permitidas.`);
        return false;
      }
      
      if (file.size > maxSize) {
        alert(`Arquivo ${file.name}: o tamanho máximo é 5MB.`);
        return false;
      }
      
      return true;
    });
    
    // Adicionar novos arquivos à lista
    setGalleryImages(prev => [...prev, ...validFiles]);
    
    // Criar previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setGalleryPreviews(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveGalleryImage = (index) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Salvar evento
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      // Preparar objeto com dados do formulário
      const eventData = { ...formData };
      
      // Upload da imagem principal se houver
      if (uploadedImage) {
        setIsUploading(true);
        try {
          const result = await UploadFile({ file: uploadedImage });
          if (result && result.file_url) {
            eventData.image_url = result.file_url;
          }
        } catch (error) {
          console.error("Erro ao fazer upload da imagem principal:", error);
          alert("Erro ao fazer upload da imagem principal. Tente novamente.");
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }
      
      // Upload das imagens da galeria se houver
      if (galleryImages.length > 0) {
        setUploadingGallery(true);
        const galleryUrls = [...(eventData.gallery || [])];
        
        try {
          for (const image of galleryImages) {
            const result = await UploadFile({ file: image });
            if (result && result.file_url) {
              galleryUrls.push(result.file_url);
            }
          }
          eventData.gallery = galleryUrls;
        } catch (error) {
          console.error("Erro ao fazer upload das imagens da galeria:", error);
          alert("Erro ao fazer upload das imagens da galeria. Tente novamente.");
          setUploadingGallery(false);
          return;
        }
        setUploadingGallery(false);
      }
      
      // Criar ou atualizar o evento
      if (editMode) {
        await Event.update(formData.id, eventData);
      } else {
        await Event.create(eventData);
      }
      
      // Resetar formulário e recarregar dados
      resetForm();
      setIsDialogOpen(false);
      loadEvents();
      
    } catch (error) {
      console.error("Erro ao salvar evento:", error);
      alert("Ocorreu um erro ao salvar o evento. Tente novamente.");
    }
  };

  const validateForm = () => {
    // Validar campos obrigatórios
    if (!formData.title || !formData.start_date || !formData.location_type) {
      alert("Preencha todos os campos obrigatórios (Título, Data de Início e Tipo de Local).");
      return false;
    }
    
    // Validar coerência de datas
    if (formData.end_date && new Date(formData.end_date) < new Date(formData.start_date)) {
      alert("A data de término deve ser igual ou posterior à data de início.");
      return false;
    }
    
    // Validar seleção de local
    if (formData.location_type !== "other" && !formData.location_id) {
      alert("Selecione um local para o evento.");
      return false;
    }
    
    if (formData.location_type === "other" && !formData.location_name) {
      alert("Informe o nome do local do evento.");
      return false;
    }
    
    return true;
  };

  // Abrir formulário para edição
  const openEditForm = (event) => {
    // Garantir que tags seja um array
    const tags = Array.isArray(event.tags) ? event.tags : [];
    // Garantir que gallery seja um array
    const gallery = Array.isArray(event.gallery) ? event.gallery : [];
    
    setFormData({
      ...event,
      tags,
      gallery
    });
    
    setEditMode(true);
    setIsDialogOpen(true);
    setUploadedImage(null);
    setUploadPreview(null);
    setGalleryImages([]);
    setGalleryPreviews([]);
  };

  // Resetar formulário
  const resetForm = () => {
    setFormData(defaultFormData());
    setEditMode(false);
    setUploadedImage(null);
    setUploadPreview(null);
    setGalleryImages([]);
    setGalleryPreviews([]);
    setNewTag("");
  };

  // Confirmar e excluir evento
  const confirmDelete = (event) => {
    setEventToDelete(event);
    setIsDeleteDialogOpen(true);
  };

  const deleteEvent = async () => {
    if (!eventToDelete) return;
    
    try {
      await Event.delete(eventToDelete.id);
      loadEvents();
    } catch (error) {
      console.error("Erro ao excluir evento:", error);
      alert("Ocorreu um erro ao excluir o evento. Tente novamente.");
    } finally {
      setIsDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  };

  // Formatar data para exibição
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return format(parseISO(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  // Função para visualizar o evento no site
  const viewEventOnSite = (eventId) => {
    navigate(createPageUrl(`EventDetail?id=${eventId}`));
  };

  const handleApprove = async (eventId) => {
    try {
      await Event.update(eventId, { status: 'approved' });
      toast({
        title: "Sucesso",
        description: "Evento aprovado com sucesso!"
      });
      loadEvents(); // Recarregar eventos
    } catch (error) {
      console.error("Erro ao aprovar evento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível aprovar o evento",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (eventId) => {
    try {
      await Event.update(eventId, { status: 'rejected' });
      toast({
        title: "Sucesso",
        description: "Evento rejeitado"
      });
      loadEvents(); // Recarregar eventos
    } catch (error) {
      console.error("Erro ao rejeitar evento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar o evento",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-4 mb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <BackButton />
          <h1 className="text-2xl font-bold mt-2 flex items-center">
            <Calendar className="mr-2 h-6 w-6 text-blue-600" />
            Gerenciamento de Eventos
          </h1>
          <p className="text-gray-600">Cadastre e gerencie os eventos exibidos no site.</p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar eventos..."
              className="pl-10 pr-4"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={loadEvents}
            className="flex-shrink-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0"
                onClick={() => {
                  resetForm();
                  setEditMode(false);
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Novo Evento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editMode ? "Editar Evento" : "Novo Evento"}
                </DialogTitle>
                <DialogDescription>
                  {editMode 
                    ? "Edite as informações do evento cadastrado."
                    : "Preencha as informações para cadastrar um novo evento."}
                </DialogDescription>
              </DialogHeader>
              
              <form className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="col-span-2">
                    <Label htmlFor="title" className="font-medium">
                      Título do Evento <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Ex.: Festival de Verão"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="start_date" className="font-medium">
                      Data de Início <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex items-center mt-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left"
                          >
                            {formData.start_date ? (
                              formatDate(formData.start_date)
                            ) : (
                              <span className="text-gray-400">Selecione a data...</span>
                            )}
                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={formData.start_date ? new Date(formData.start_date) : undefined}
                            onSelect={(date) => handleDateSelect(date, "start_date")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="end_date" className="font-medium">
                      Data de Término
                    </Label>
                    <div className="flex items-center mt-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left"
                          >
                            {formData.end_date ? (
                              formatDate(formData.end_date)
                            ) : (
                              <span className="text-gray-400">Selecione a data...</span>
                            )}
                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={formData.end_date ? new Date(formData.end_date) : undefined}
                            onSelect={(date) => handleDateSelect(date, "end_date")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="start_time" className="font-medium">
                      Horário de Início
                    </Label>
                    <Input
                      id="start_time"
                      name="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="end_time" className="font-medium">
                      Horário de Término
                    </Label>
                    <Input
                      id="end_time"
                      name="end_time"
                      type="time"
                      value={formData.end_time}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category" className="font-medium">
                      Categoria <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventCategories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="is_featured" className="font-medium flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        id="is_featured"
                        checked={formData.is_featured}
                        onCheckedChange={() => handleCheckboxChange("is_featured")}
                      />
                      <span>Evento em destaque</span>
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Eventos em destaque aparecerão na página inicial e no topo das listagens.
                    </p>
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor="short_description" className="font-medium">
                      Descrição Curta
                    </Label>
                    <Input
                      id="short_description"
                      name="short_description"
                      value={formData.short_description}
                      onChange={handleInputChange}
                      placeholder="Breve descrição para listagens (max. 150 caracteres)"
                      maxLength={150}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor="description" className="font-medium">
                      Descrição Completa
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Descreva detalhadamente o evento..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="location_type" className="font-medium">
                      Tipo de Local <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.location_type}
                      onValueChange={handleLocationTypeChange}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecione o tipo de local" />
                      </SelectTrigger>
                      <SelectContent>
                        {locationTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {formData.location_type !== "other" ? (
                    <div>
                      <Label htmlFor="location_id" className="font-medium">
                        Local <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.location_id}
                        onValueChange={handleLocationSelect}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder={`Selecione ${formData.location_type === "city" ? "a cidade" : formData.location_type === "beach" ? "a praia" : "o comércio"}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.location_type === "city" && cities.map((city) => (
                            <SelectItem key={city.id} value={city.id}>
                              {city.name}
                            </SelectItem>
                          ))}
                          {formData.location_type === "beach" && beaches.map((beach) => (
                            <SelectItem key={beach.id} value={beach.id}>
                              {beach.name}
                            </SelectItem>
                          ))}
                          {formData.location_type === "business" && businesses.map((business) => (
                            <SelectItem key={business.id} value={business.id}>
                              {business.name}
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
                        name="location_name"
                        value={formData.location_name}
                        onChange={handleInputChange}
                        placeholder="Ex.: Centro de Eventos"
                        className="mt-1"
                      />
                    </div>
                  )}
                  
                  <div className="col-span-2">
                    <Label htmlFor="address" className="font-medium">
                      Endereço Completo
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Ex.: Av. Beira Mar Norte, 1000, Centro"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="organizer" className="font-medium">
                      Organizador
                    </Label>
                    <Input
                      id="organizer"
                      name="organizer"
                      value={formData.organizer}
                      onChange={handleInputChange}
                      placeholder="Ex.: Prefeitura Municipal"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="price_info" className="font-medium">
                      Informações de Preço
                    </Label>
                    <Input
                      id="price_info"
                      name="price_info"
                      value={formData.price_info}
                      onChange={handleInputChange}
                      placeholder="Ex.: Gratuito / R$ 20,00"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="contact_email" className="font-medium">
                      Email de Contato
                    </Label>
                    <Input
                      id="contact_email"
                      name="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={handleInputChange}
                      placeholder="Ex.: contato@evento.com"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="contact_phone" className="font-medium">
                      Telefone de Contato
                    </Label>
                    <Input
                      id="contact_phone"
                      name="contact_phone"
                      value={formData.contact_phone}
                      onChange={handleInputChange}
                      placeholder="Ex.: (48) 99999-9999"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="website" className="font-medium">
                      Site Oficial
                    </Label>
                    <Input
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="Ex.: https://www.evento.com.br"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="ticket_url" className="font-medium">
                      Link para Compra de Ingressos
                    </Label>
                    <Input
                      id="ticket_url"
                      name="ticket_url"
                      value={formData.ticket_url}
                      onChange={handleInputChange}
                      placeholder="Ex.: https://www.ingressos.com.br/evento"
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label className="font-medium">Tags</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 text-gray-500 hover:text-red-500"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex mt-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Adicionar tag..."
                        className="rounded-r-none"
                      />
                      <Button
                        type="button"
                        onClick={handleAddTag}
                        className="rounded-l-none bg-blue-600 hover:bg-blue-700"
                      >
                        Adicionar
                      </Button>
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <Label className="font-medium">Imagem Principal</Label>
                    <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4">
                      {(uploadPreview || formData.image_url) ? (
                        <div className="relative">
                          <img 
                            src={uploadPreview || formData.image_url} 
                            alt="Preview" 
                            className="w-full h-48 object-cover rounded-md"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              setUploadedImage(null);
                              setUploadPreview(null);
                              if (!uploadPreview) {
                                setFormData(prev => ({ ...prev, image_url: "" }));
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <label htmlFor="image_upload" className="flex flex-col items-center justify-center h-48 cursor-pointer">
                          <Upload className="h-8 w-8 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-500">Clique para fazer upload</p>
                          <p className="text-xs text-gray-400">JPG, PNG (máx. 5MB)</p>
                          <input
                            id="image_upload"
                            type="file"
                            accept="image/jpeg,image/png,image/jpg"
                            onChange={handleMainImageUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <Label className="font-medium">Galeria de Imagens</Label>
                    <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        {/* Exibir imagens existentes */}
                        {formData.gallery && formData.gallery.length > 0 && formData.gallery.map((imageUrl, index) => (
                          <div key={`existing-${index}`} className="relative">
                            <img 
                              src={imageUrl} 
                              alt={`Galeria ${index + 1}`} 
                              className="w-full h-32 object-cover rounded-md"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => {
                                const updatedGallery = [...formData.gallery];
                                updatedGallery.splice(index, 1);
                                setFormData(prev => ({ ...prev, gallery: updatedGallery }));
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        
                        {/* Exibir previews de novas imagens */}
                        {galleryPreviews.map((preview, index) => (
                          <div key={`preview-${index}`} className="relative">
                            <img 
                              src={preview} 
                              alt={`Preview ${index + 1}`} 
                              className="w-full h-32 object-cover rounded-md"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => handleRemoveGalleryImage(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        
                        {/* Botão de upload se não atingiu o limite */}
                        {(formData.gallery?.length || 0) + galleryImages.length < 5 && (
                          <label htmlFor="gallery_upload" className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-md cursor-pointer">
                            <Upload className="h-6 w-6 text-gray-400" />
                            <p className="mt-1 text-xs text-gray-500">Adicionar foto</p>
                            <input
                              id="gallery_upload"
                              type="file"
                              accept="image/jpeg,image/png,image/jpg"
                              multiple
                              onChange={handleGalleryImageUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 text-center">
                        Você pode adicionar até 5 imagens para a galeria do evento.
                      </p>
                    </div>
                  </div>
                </div>
              </form>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(false);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isUploading || uploadingGallery}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isUploading || uploadingGallery ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      {isUploading ? "Enviando imagem..." : "Enviando galeria..."}
                    </>
                  ) : (
                    <>
                      {editMode ? "Atualizar Evento" : "Criar Evento"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Tabs defaultValue="upcoming" value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <div className="border-b mb-4">
          <TabsList className="bg-transparent mb-0">
            <TabsTrigger 
              value="upcoming" 
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none"
            >
              Próximos Eventos
            </TabsTrigger>
            <TabsTrigger 
              value="past" 
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none"
            >
              Eventos Passados
            </TabsTrigger>
            <TabsTrigger 
              value="featured" 
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none"
            >
              Em Destaque
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="upcoming" className="mt-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center">
                <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-500">Carregando eventos...</p>
              </div>
            </div>
          ) : events.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhum evento encontrado</h3>
              <p className="text-gray-500 mb-6">Não há eventos próximos cadastrados.</p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      resetForm();
                      setEditMode(false);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Novo Evento
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event}
                  isAdmin={true}
                  onEdit={() => openEditForm(event)}
                  onDelete={() => confirmDelete(event)}
                  onView={() => viewEventOnSite(event.id)}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="mt-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center">
                <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-500">Carregando eventos passados...</p>
              </div>
            </div>
          ) : events.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhum evento passado</h3>
              <p className="text-gray-500">Não há eventos passados no sistema.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event}
                  isAdmin={true}
                  onEdit={() => openEditForm(event)}
                  onDelete={() => confirmDelete(event)}
                  onView={() => viewEventOnSite(event.id)}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  formatDate={formatDate}
                  isPast
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="featured" className="mt-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center">
                <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-500">Carregando eventos em destaque...</p>
              </div>
            </div>
          ) : events.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhum evento em destaque</h3>
              <p className="text-gray-500">Não há eventos marcados como destaque.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event}
                  isAdmin={true}
                  onEdit={() => openEditForm(event)}
                  onDelete={() => confirmDelete(event)}
                  onView={() => viewEventOnSite(event.id)}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o evento "{eventToDelete?.title}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={deleteEvent} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Componente de card de evento (extraído para melhorar legibilidade)
function EventCard({ event, onEdit, onDelete, onView, formatDate, isPast = false, isAdmin = false, onApprove, onReject }) {
  const getCategoryBadge = (category) => {
    const categories = {
      cultural: { bg: "bg-purple-100", text: "text-purple-800", label: "Cultural" },
      esportivo: { bg: "bg-green-100", text: "text-green-800", label: "Esportivo" },
      gastronômico: { bg: "bg-amber-100", text: "text-amber-800", label: "Gastronômico" },
      musical: { bg: "bg-blue-100", text: "text-blue-800", label: "Musical" },
      festivo: { bg: "bg-pink-100", text: "text-pink-800", label: "Festivo" },
      religioso: { bg: "bg-indigo-100", text: "text-indigo-800", label: "Religioso" },
      feira: { bg: "bg-orange-100", text: "text-orange-800", label: "Feira" },
      outro: { bg: "bg-gray-100", text: "text-gray-800", label: "Outro" }
    };
    
    const categoryInfo = categories[category] || categories.outro;
    
    return (
      <Badge variant="outline" className={`${categoryInfo.bg} ${categoryInfo.text} border-none`}>
        {categoryInfo.label}
      </Badge>
    );
  };

  return (
    <Card className={`overflow-hidden transition-all ${isPast ? 'opacity-70 hover:opacity-100' : ''}`}>
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {event.image_url ? (
          <img 
            src={event.image_url} 
            alt={event.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <Calendar className="w-16 h-16 text-gray-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        )}
        {event.is_featured && (
          <Badge className="absolute top-2 right-2 bg-amber-500">Destaque</Badge>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-bold">{event.title}</CardTitle>
        </div>
        <div className="flex flex-wrap gap-2 mt-1">
          {getCategoryBadge(event.category)}
          {isPast && (
            <Badge variant="outline" className="bg-gray-200 text-gray-700 border-none">
              Evento passado
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <div className="space-y-3">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>
              {formatDate(event.start_date)}
              {event.end_date && event.end_date !== event.start_date && (
                <> até {formatDate(event.end_date)}</>
              )}
            </span>
          </div>
          
          {(event.start_time || event.end_time) && (
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>
                {event.start_time && `${event.start_time}`}
                {event.end_time && event.start_time && ` até ${event.end_time}`}
                {event.end_time && !event.start_time && `${event.end_time}`}
              </span>
            </div>
          )}
          
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="line-clamp-1">{event.location_name}</span>
          </div>
          
          {event.tags && event.tags.length > 0 && (
            <div className="flex items-start gap-1">
              <Tag className="w-4 h-4 mr-1 flex-shrink-0 text-gray-600 mt-1" />
              <div className="flex flex-wrap gap-1">
                {event.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-gray-100">
                    {tag}
                  </Badge>
                ))}
                {event.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs bg-gray-100">
                    +{event.tags.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4 flex justify-between items-center">
        <Button
          size="sm"
          variant="outline"
          onClick={onView}
          className="text-blue-600 border-blue-200 hover:bg-blue-50"
        >
          <Eye className="w-4 h-4 mr-1" />
          Visualizar
        </Button>
        
        <div className="flex gap-2 items-center">
           {isAdmin && event.status === 'pending' && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onApprove(event.id)}
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                Aprovar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReject(event.id)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Rejeitar
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={onEdit}
            className="text-amber-600 border-amber-200 hover:bg-amber-50"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onDelete}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
