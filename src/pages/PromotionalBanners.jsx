
import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CalendarIcon, 
  Megaphone, 
  Plus, 
  Trash, 
  Edit, 
  Eye, 
  ImageIcon, 
  Link2, 
  Clock, 
  Upload, 
  Check,
  X,
  Image,
  Filter,
  Layout,
  Palette,
  Copy,
  BarChart4,
  ArrowUpDown,
  ExternalLink,
  Loader2
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { PromotionalBanner } from "@/api/entities";
import BackButton from "@/components/ui/BackButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { UploadFile } from "@/api/integrations";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Toast } from "@/components/ui/toast";
import { ColorPicker } from "@/components/banners/ColorPicker";
import PreviewBanner from "@/components/banners/PreviewBanner";

export default function PromotionalBanners() {
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [openNewBanner, setOpenNewBanner] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [alertDelete, setAlertDelete] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortField, setSortField] = useState("priority");
  const [sortDirection, setSortDirection] = useState("desc");
  const [statsView, setStatsView] = useState(false);
  
  const emptyBanner = {
    title: "",
    description: "",
    image_url: "",
    link_url: "",
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    location: "home_top",
    background_color: "#0f172a",
    text_color: "#ffffff",
    priority: 1,
    active: true,
    layout_type: "standard",
    custom_css: "",
    button_text: "Saiba Mais",
    button_color: "#f59e0b",
    button_text_color: "#ffffff",
    animation_type: "fade"
  };
  
  const [newBanner, setNewBanner] = useState({...emptyBanner});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [previewType, setPreviewType] = useState("desktop");

  const locationOptions = [
    { value: "home_top", label: "Topo da Página Inicial" },
    { value: "home_slider", label: "Slider da Página Inicial" },
    { value: "home_middle", label: "Meio da Página Inicial" },
    { value: "home_bottom", label: "Rodapé da Página Inicial" },
    { value: "sidebar", label: "Barra Lateral" },
    { value: "cities_page", label: "Página de Cidades" },
    { value: "beaches_page", label: "Página de Praias" },
    { value: "businesses_page", label: "Página de Comércios" },
    { value: "community_page", label: "Página de Comunidade" },
    { value: "profile_page", label: "Página de Perfil" },
    { value: "all", label: "Todas as Páginas" }
  ];

  const layoutOptions = [
    { value: "standard", label: "Padrão" },
    { value: "fullwidth", label: "Largura Total" },
    { value: "card", label: "Cartão" },
    { value: "overlay", label: "Sobreposição" },
    { value: "popup", label: "Pop-up" },
    { value: "sidebar", label: "Barra Lateral" },
    { value: "ribbon", label: "Faixa" }
  ];

  const animationOptions = [
    { value: "none", label: "Nenhuma" },
    { value: "fade", label: "Fade" },
    { value: "slide", label: "Slide" },
    { value: "zoom", label: "Zoom" },
    { value: "bounce", label: "Bounce" },
    { value: "pulse", label: "Pulse" }
  ];

  useEffect(() => {
    loadBanners();
  }, [filterLocation, filterStatus, sortField, sortDirection]);

  const loadBanners = async () => {
    setIsLoading(true);
    try {
      let allBanners = await PromotionalBanner.list();
      
      if (filterLocation !== "all") {
        allBanners = allBanners.filter(banner => 
          banner.location === filterLocation || banner.location === "all"
        );
      }
      
      if (filterStatus !== "all") {
        const today = new Date();
        
        if (filterStatus === "active") {
          allBanners = allBanners.filter(banner => 
            banner.active && 
            new Date(banner.start_date) <= today && 
            new Date(banner.end_date) >= today
          );
        } else if (filterStatus === "scheduled") {
          allBanners = allBanners.filter(banner => 
            banner.active && new Date(banner.start_date) > today
          );
        } else if (filterStatus === "expired") {
          allBanners = allBanners.filter(banner => 
            new Date(banner.end_date) < today
          );
        } else if (filterStatus === "inactive") {
          allBanners = allBanners.filter(banner => !banner.active);
        }
      }
      
      allBanners.sort((a, b) => {
        let comparison = 0;
        
        if (sortField === "priority") {
          comparison = (b.priority || 0) - (a.priority || 0);
        } else if (sortField === "title") {
          comparison = a.title.localeCompare(b.title);
        } else if (sortField === "start_date") {
          comparison = new Date(a.start_date) - new Date(b.start_date);
        } else if (sortField === "end_date") {
          comparison = new Date(a.end_date) - new Date(b.end_date);
        } else if (sortField === "created_date") {
          comparison = new Date(a.created_date) - new Date(b.created_date);
        }
        
        return sortDirection === "asc" ? comparison : -comparison;
      });
      
      setBanners(allBanners);
    } catch (error) {
      console.error("Erro ao carregar banners:", error);
      setErrorMessage("Erro ao carregar banners promocionais.");
    }
    setIsLoading(false);
  };

  const handleOpenNewBanner = () => {
    setNewBanner({...emptyBanner});
    setEditMode(false);
    setOpenNewBanner(true);
  };

  const handleEditBanner = (banner) => {
    setNewBanner({...banner});
    setEditMode(true);
    setOpenNewBanner(true);
  };

  const handleDeleteClick = (banner) => {
    setSelectedBanner(banner);
    setAlertDelete(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBanner) return;
    
    try {
      await PromotionalBanner.delete(selectedBanner.id);
      setSuccessMessage("Banner excluído com sucesso!");
      loadBanners();
    } catch (error) {
      console.error("Erro ao excluir banner:", error);
      setErrorMessage("Erro ao excluir banner promocional.");
    }
    
    setAlertDelete(false);
    setSelectedBanner(null);
  };

  const handlePreviewBanner = (banner) => {
    setSelectedBanner(banner);
    setOpenPreview(true);
  };

  const handleDuplicateBanner = (banner) => {
    const duplicated = {...banner};
    delete duplicated.id;
    delete duplicated.created_date;
    duplicated.title = `Cópia de ${duplicated.title}`;
    
    setNewBanner(duplicated);
    setEditMode(false);
    setOpenNewBanner(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBanner(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked, name) => {
    setNewBanner(prev => ({ ...prev, [name]: checked }));
  };

  const handleSelectChange = (value, name) => {
    setNewBanner(prev => ({ ...prev, [name]: value }));
  };

  const handleColorChange = (color, field) => {
    setNewBanner(prev => ({ ...prev, [field]: color }));
  };

  const handleDateChange = (date, field) => {
    if (date) {
      const formattedDate = date.toISOString().split('T')[0];
      setNewBanner(prev => ({ ...prev, [field]: formattedDate }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setNewBanner(prev => ({ ...prev, image_url: file_url }));
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      setErrorMessage("Erro ao fazer upload da imagem. Tente novamente.");
    }
    setIsUploading(false);
  };

  const handleSaveBanner = async () => {
    if (!newBanner.title || !newBanner.location || !newBanner.start_date || !newBanner.end_date) {
      setErrorMessage("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    
    setIsSaving(true);
    try {
      if (editMode) {
        await PromotionalBanner.update(newBanner.id, newBanner);
        setSuccessMessage("Banner atualizado com sucesso!");
      } else {
        await PromotionalBanner.create(newBanner);
        setSuccessMessage("Banner criado com sucesso!");
      }
      
      loadBanners();
      setOpenNewBanner(false);
    } catch (error) {
      console.error("Erro ao salvar banner:", error);
      setErrorMessage("Erro ao salvar banner promocional.");
    }
    setIsSaving(false);
  };

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === "asc" ? "desc" : "asc");
  };

  const handleSort = (field) => {
    if (sortField === field) {
      toggleSortDirection();
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getBannerStatus = (banner) => {
    const today = new Date();
    
    if (!banner.active) {
      return { status: "inactive", label: "Inativo", color: "gray" };
    }
    
    if (new Date(banner.start_date) > today) {
      return { status: "scheduled", label: "Agendado", color: "amber" };
    }
    
    if (new Date(banner.end_date) < today) {
      return { status: "expired", label: "Expirado", color: "red" };
    }
    
    return { status: "active", label: "Ativo", color: "green" };
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-2xl font-bold flex items-center">
              <Megaphone className="mr-2 h-6 w-6" />
              Banners Promocionais
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setStatsView(!statsView)}
              className={statsView ? "bg-blue-100 text-blue-700" : ""}
            >
              <BarChart4 className="w-4 h-4 mr-2" />
              Estatísticas
            </Button>
            
            <Button onClick={handleOpenNewBanner}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Banner
            </Button>
          </div>
        </div>
        
        {successMessage && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
            <div className="flex items-center">
              <Check className="h-5 w-5 mr-2" />
              <span>{successMessage}</span>
            </div>
          </div>
        )}
        
        {errorMessage && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <div className="flex items-center">
              <X className="h-5 w-5 mr-2" />
              <span>{errorMessage}</span>
            </div>
          </div>
        )}
        
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Gerenciar Banners Promocionais</CardTitle>
            <CardDescription>
              Crie e gerencie banners promocionais para exibição em diferentes seções do site.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-4">
              <div>
                <Label htmlFor="filterLocation" className="mb-1 block text-sm">Localização</Label>
                <Select value={filterLocation} onValueChange={setFilterLocation}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por localização" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as localizações</SelectItem>
                    {locationOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="filterStatus" className="mb-1 block text-sm">Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="scheduled">Agendados</SelectItem>
                    <SelectItem value="expired">Expirados</SelectItem>
                    <SelectItem value="inactive">Inativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="ml-auto">
                <Button variant="outline" size="sm" onClick={loadBanners} className="h-9 mt-7">
                  <Filter className="mr-2 h-4 w-4" />
                  Aplicar Filtros
                </Button>
              </div>
            </div>
            
            {statsView ? (
              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  <Card className="bg-blue-50">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <h3 className="text-lg font-medium text-blue-800">Total de Banners</h3>
                        <p className="text-3xl font-bold text-blue-900 mt-2">{banners.length}</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-green-50">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <h3 className="text-lg font-medium text-green-800">Banners Ativos</h3>
                        <p className="text-3xl font-bold text-green-900 mt-2">
                          {banners.filter(b => getBannerStatus(b).status === "active").length}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-amber-50">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <h3 className="text-lg font-medium text-amber-800">Banners Agendados</h3>
                        <p className="text-3xl font-bold text-amber-900 mt-2">
                          {banners.filter(b => getBannerStatus(b).status === "scheduled").length}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-red-50">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <h3 className="text-lg font-medium text-red-800">Banners Expirados</h3>
                        <p className="text-3xl font-bold text-red-900 mt-2">
                          {banners.filter(b => getBannerStatus(b).status === "expired").length}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Banners por Localização</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {locationOptions.map(location => {
                        const count = banners.filter(b => b.location === location.value).length;
                        if (count === 0 && location.value !== "all") return null;
                        
                        return (
                          <div key={location.value} className="flex items-center justify-between">
                            <span>{location.label}</span>
                            <div className="flex items-center">
                              <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden mr-3">
                                <div 
                                  className="h-full bg-blue-600 rounded-full" 
                                  style={{ width: `${(count / banners.length) * 100}%` }}
                                />
                              </div>
                              <span className="font-medium">{count}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Preview</TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("title")}>
                        <div className="flex items-center">
                          Título
                          {sortField === "title" && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("start_date")}>
                        <div className="flex items-center">
                          Data Inicial
                          {sortField === "start_date" && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("end_date")}>
                        <div className="flex items-center">
                          Data Final
                          {sortField === "end_date" && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("priority")}>
                        <div className="flex items-center">
                          Prioridade
                          {sortField === "priority" && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-10">
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                            <p className="text-sm text-gray-500">Carregando banners...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : banners.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-10">
                          <div className="flex flex-col items-center justify-center">
                            <Megaphone className="w-10 h-10 text-gray-300 mb-2" />
                            <p className="text-sm text-gray-500">Nenhum banner encontrado</p>
                            <Button
                              variant="link"
                              onClick={handleOpenNewBanner}
                              className="mt-2"
                            >
                              Criar novo banner
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      banners.map((banner) => {
                        const statusInfo = getBannerStatus(banner);
                        
                        return (
                          <TableRow key={banner.id}>
                            <TableCell>
                              <div className="relative w-10 h-10 bg-gray-100 rounded overflow-hidden">
                                {banner.image_url ? (
                                  <img
                                    src={banner.image_url}
                                    alt={banner.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div
                                    className="w-full h-full flex items-center justify-center"
                                    style={{ backgroundColor: banner.background_color }}
                                  >
                                    <Megaphone
                                      className="w-5 h-5"
                                      style={{ color: banner.text_color }}
                                    />
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium truncate max-w-xs">
                                {banner.title}
                              </div>
                            </TableCell>
                            <TableCell>
                              {locationOptions.find(loc => loc.value === banner.location)?.label || banner.location}
                            </TableCell>
                            <TableCell>
                              {format(new Date(banner.start_date), 'dd/MM/yyyy')}
                            </TableCell>
                            <TableCell>
                              {format(new Date(banner.end_date), 'dd/MM/yyyy')}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`
                                  ${statusInfo.color === 'green' ? 'bg-green-100 text-green-800 border-green-300' : ''}
                                  ${statusInfo.color === 'amber' ? 'bg-amber-100 text-amber-800 border-amber-300' : ''}
                                  ${statusInfo.color === 'red' ? 'bg-red-100 text-red-800 border-red-300' : ''}
                                  ${statusInfo.color === 'gray' ? 'bg-gray-100 text-gray-800 border-gray-300' : ''}
                                `}
                              >
                                {statusInfo.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {banner.priority || 1}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handlePreviewBanner(banner)}
                                title="Visualizar"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditBanner(banner)}
                                title="Editar"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDuplicateBanner(banner)}
                                title="Duplicar"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(banner)}
                                title="Excluir"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Dialog open={openNewBanner} onOpenChange={setOpenNewBanner}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {editMode ? "Editar Banner Promocional" : "Novo Banner Promocional"}
            </DialogTitle>
            <DialogDescription>
              Crie ou edite banners promocionais para exibir em diferentes áreas do site.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[calc(90vh-180px)]">
            <div className="p-1">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="mb-6 w-full justify-start">
                  <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
                  <TabsTrigger value="appearance">Aparência</TabsTrigger>
                  <TabsTrigger value="display">Exibição</TabsTrigger>
                  <TabsTrigger value="preview" className="ml-auto">
                    <Eye className="mr-2 h-4 w-4" />
                    Prévia
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título <span className="text-red-500">*</span></Label>
                      <Input
                        id="title"
                        name="title"
                        value={newBanner.title}
                        onChange={handleInputChange}
                        placeholder="Digite o título do banner"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={newBanner.description}
                        onChange={handleInputChange}
                        placeholder="Digite uma descrição para o banner"
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="image">Imagem do Banner</Label>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={isUploading}
                            className="hidden"
                          />
                          <div className="flex">
                            <Input
                              value={newBanner.image_url || ""}
                              placeholder="URL da imagem"
                              readOnly
                              className="rounded-r-none"
                            />
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => document.getElementById("image").click()}
                              disabled={isUploading}
                              className="rounded-l-none"
                            >
                              {isUploading ? (
                                <>
                                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                                  Enviando...
                                </>
                              ) : (
                                <>
                                  <Upload className="mr-2 h-4 w-4" />
                                  Upload
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {newBanner.image_url ? (
                            <img
                              src={newBanner.image_url}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="link_url">Link URL</Label>
                      <div className="flex">
                        <div className="bg-gray-100 flex items-center px-3 rounded-l-md border border-r-0 border-gray-300">
                          <Link2 className="h-4 w-4 text-gray-500" />
                        </div>
                        <Input
                          id="link_url"
                          name="link_url"
                          value={newBanner.link_url}
                          onChange={handleInputChange}
                          placeholder="https://exemplo.com/pagina"
                          className="rounded-l-none"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="button_text">Texto do Botão</Label>
                      <Input
                        id="button_text"
                        name="button_text"
                        value={newBanner.button_text}
                        onChange={handleInputChange}
                        placeholder="Saiba Mais"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="appearance" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="layout_type">Tipo de Layout</Label>
                        <Select
                          value={newBanner.layout_type}
                          onValueChange={(value) => handleSelectChange(value, "layout_type")}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de layout" />
                          </SelectTrigger>
                          <SelectContent>
                            {layoutOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="animation_type">Tipo de Animação</Label>
                        <Select
                          value={newBanner.animation_type}
                          onValueChange={(value) => handleSelectChange(value, "animation_type")}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de animação" />
                          </SelectTrigger>
                          <SelectContent>
                            {animationOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Cores do Banner</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="background_color" className="text-xs">Cor de Fundo</Label>
                            <div className="flex items-center mt-1 gap-2">
                              <div 
                                className="w-10 h-10 rounded border border-gray-300" 
                                style={{ backgroundColor: newBanner.background_color }}
                              />
                              <Input
                                id="background_color"
                                name="background_color"
                                value={newBanner.background_color}
                                onChange={handleInputChange}
                                className="flex-1"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="text_color" className="text-xs">Cor do Texto</Label>
                            <div className="flex items-center mt-1 gap-2">
                              <div 
                                className="w-10 h-10 rounded border border-gray-300" 
                                style={{ backgroundColor: newBanner.text_color }}
                              />
                              <Input
                                id="text_color"
                                name="text_color"
                                value={newBanner.text_color}
                                onChange={handleInputChange}
                                className="flex-1"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="button_color">Cores do Botão</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="button_color" className="text-xs">Cor do Botão</Label>
                            <div className="flex items-center mt-1 gap-2">
                              <div 
                                className="w-10 h-10 rounded border border-gray-300" 
                                style={{ backgroundColor: newBanner.button_color }}
                              />
                              <Input
                                id="button_color"
                                name="button_color"
                                value={newBanner.button_color}
                                onChange={handleInputChange}
                                className="flex-1"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="button_text_color" className="text-xs">Cor do Texto do Botão</Label>
                            <div className="flex items-center mt-1 gap-2">
                              <div 
                                className="w-10 h-10 rounded border border-gray-300" 
                                style={{ backgroundColor: newBanner.button_text_color }}
                              />
                              <Input
                                id="button_text_color"
                                name="button_text_color"
                                value={newBanner.button_text_color}
                                onChange={handleInputChange}
                                className="flex-1"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="custom_css">CSS Personalizado (Avançado)</Label>
                        <Textarea
                          id="custom_css"
                          name="custom_css"
                          value={newBanner.custom_css}
                          onChange={handleInputChange}
                          placeholder=".banner { box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }"
                          rows={8}
                          className="font-mono text-xs"
                        />
                        <p className="text-xs text-gray-500">
                          Use CSS personalizado para estilizar ainda mais seu banner. Apenas para usuários avançados.
                        </p>
                      </div>
                      
                      <Card className="bg-gray-50">
                        <CardHeader className="py-3">
                          <CardTitle className="text-sm">Dicas de Aparência</CardTitle>
                        </CardHeader>
                        <CardContent className="py-3 text-xs space-y-2">
                          <p><strong>Layout Padrão:</strong> Ideal para banners de topo e rodapé</p>
                          <p><strong>Cartão:</strong> Perfeito para promoções em destaque</p>
                          <p><strong>Largura Total:</strong> Para banners imersivos</p>
                          <p><strong>Pop-up:</strong> Use com moderação para anúncios importantes</p>
                          <p><strong>Barra Lateral:</strong> Ideal para promoções contínuas</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="display" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="location">
                          Localização <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={newBanner.location}
                          onValueChange={(value) => handleSelectChange(value, "location")}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a localização" />
                          </SelectTrigger>
                          <SelectContent>
                            {locationOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="start_date">
                            Data Inicial <span className="text-red-500">*</span>
                          </Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {newBanner.start_date
                                  ? format(new Date(newBanner.start_date), 'dd/MM/yyyy')
                                  : "Selecione a data"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={newBanner.start_date ? new Date(newBanner.start_date) : undefined}
                                onSelect={(date) => handleDateChange(date, "start_date")}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="end_date">
                            Data Final <span className="text-red-500">*</span>
                          </Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {newBanner.end_date
                                  ? format(new Date(newBanner.end_date), 'dd/MM/yyyy')
                                  : "Selecione a data"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={newBanner.end_date ? new Date(newBanner.end_date) : undefined}
                                onSelect={(date) => handleDateChange(date, "end_date")}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="priority">Prioridade</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            id="priority"
                            name="priority"
                            type="number"
                            value={newBanner.priority}
                            onChange={handleInputChange}
                            min="1"
                            max="10"
                          />
                          <div className="flex items-center">
                            <span className="text-xs text-gray-500">
                              Maior número = maior prioridade (1-10)
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="active" className="cursor-pointer">
                            Ativo
                          </Label>
                          <Switch
                            id="active"
                            checked={newBanner.active}
                            onCheckedChange={(checked) => handleSwitchChange(checked, "active")}
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          Banners inativos não serão exibidos, mesmo dentro do período de datas.
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <Card className="bg-amber-50 border-amber-200">
                        <CardHeader className="py-3">
                          <CardTitle className="text-sm flex items-center text-amber-800">
                            <Clock className="h-4 w-4 mr-2 text-amber-600" />
                            Programação Inteligente
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-3 text-amber-700">
                          <div className="space-y-4 text-sm">
                            <p>
                              Seu banner será exibido automaticamente a partir da data inicial e 
                              ficará visível até a data final.
                            </p>
                            
                            <div className="flex items-center justify-between text-xs bg-white p-2 rounded">
                              <div>
                                <div className="font-medium">Status após configuração:</div>
                                {newBanner.active ? (
                                  <>
                                    {new Date(newBanner.start_date) > new Date() ? (
                                      <div className="text-amber-600 font-medium">Agendado para exibição futura</div>
                                    ) : new Date(newBanner.end_date) < new Date() ? (
                                      <div className="text-red-600 font-medium">Expirado</div>
                                    ) : (
                                      <div className="text-green-600 font-medium">Ativo e visível</div>
                                    )}
                                  </> 
                                ) : (
                                  <div className="text-gray-600 font-medium">Inativo (não será exibido)</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gray-50">
                        <CardHeader className="py-3">
                          <CardTitle className="text-sm">Dicas de Exibição</CardTitle>
                        </CardHeader>
                        <CardContent className="py-3 text-xs space-y-2">
                          <p><strong>Home Top:</strong> Alta visibilidade para anúncios importantes</p>
                          <p><strong>Home Slider:</strong> Ótimo para imagens de destaque</p>
                          <p><strong>Pages:</strong> Direcione anúncios para públicos específicos</p>
                          <p><strong>Sidebar:</strong> Visível em todas as páginas</p>
                          <p><strong>All:</strong> Use com moderação para anúncios críticos</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="preview" className="space-y-4">
                  <div className="space-y-6">
                    <div className="flex justify-center gap-4">
                      <Button 
                        variant={previewType === "desktop" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPreviewType("desktop")}
                      >
                        <Layout className="h-4 w-4 mr-2" />
                        Desktop
                      </Button>
                      <Button 
                        variant={previewType === "mobile" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPreviewType("mobile")}
                      >
                        <Layout className="h-4 w-4 mr-2" />
                        Mobile
                      </Button>
                    </div>
                    
                    {previewType === "desktop" ? (
                      <div className="border rounded-lg overflow-hidden bg-gray-50">
                        <div className="p-2 bg-gray-100 border-b flex items-center">
                          <div className="flex space-x-1">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                          </div>
                          <div className="mx-auto text-xs text-gray-500">Preview de Banner (Desktop)</div>
                        </div>
                        <div className="p-4">
                          <PreviewBanner banner={newBanner} type="desktop" />
                        </div>
                      </div>
                    ) : (
                      <div className="border rounded-lg overflow-hidden bg-gray-50 max-w-xs mx-auto">
                        <div className="p-2 bg-gray-100 border-b flex justify-center">
                          <div className="w-16 h-4 rounded-full bg-gray-300"></div>
                        </div>
                        <div className="p-4">
                          <PreviewBanner banner={newBanner} type="mobile" />
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
          
          <DialogFooter>
            <div className="flex justify-between w-full">
              <Button variant="outline" onClick={() => setOpenNewBanner(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveBanner} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    {editMode ? "Atualizar Banner" : "Salvar Banner"}
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={openPreview} onOpenChange={setOpenPreview}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Eye className="mr-2 h-5 w-5" />
              Visualização do Banner
            </DialogTitle>
          </DialogHeader>
          
          {selectedBanner && (
            <div className="space-y-4">
              <div className="border rounded overflow-hidden">
                <PreviewBanner banner={selectedBanner} />
              </div>
              
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Título:</div>
                  <div>{selectedBanner.title}</div>
                  
                  <div className="font-medium">Descrição:</div>
                  <div>{selectedBanner.description || "Nenhuma"}</div>
                  
                  <div className="font-medium">Link:</div>
                  <div className="break-all">
                    {selectedBanner.link_url ? (
                      <a 
                        href={selectedBanner.link_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        {selectedBanner.link_url}
                        <ExternalLink className="h-3 w-3 ml-1 inline" />
                      </a>
                    ) : (
                      "Nenhum"
                    )}
                  </div>
                  
                  <div className="font-medium">Localização:</div>
                  <div>
                    {locationOptions.find(loc => loc.value === selectedBanner.location)?.label || selectedBanner.location}
                  </div>
                  
                  <div className="font-medium">Status:</div>
                  <div>
                    <Badge
                      variant="outline"
                      className={`
                        ${getBannerStatus(selectedBanner).color === 'green' ? 'bg-green-100 text-green-800 border-green-300' : ''}
                        ${getBannerStatus(selectedBanner).color === 'amber' ? 'bg-amber-100 text-amber-800 border-amber-300' : ''}
                        ${getBannerStatus(selectedBanner).color === 'red' ? 'bg-red-100 text-red-800 border-red-300' : ''}
                        ${getBannerStatus(selectedBanner).color === 'gray' ? 'bg-gray-100 text-gray-800 border-gray-300' : ''}
                      `}
                    >
                      {getBannerStatus(selectedBanner).label}
                    </Badge>
                  </div>
                  
                  <div className="font-medium">Período:</div>
                  <div>
                    {format(new Date(selectedBanner.start_date), 'dd/MM/yyyy')} a {format(new Date(selectedBanner.end_date), 'dd/MM/yyyy')}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenPreview(false)}>
              Fechar
            </Button>
            {selectedBanner && (
              <Button onClick={() => {
                setOpenPreview(false);
                handleEditBanner(selectedBanner);
              }}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={alertDelete} onOpenChange={setAlertDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o banner
              {selectedBanner ? ` "${selectedBanner.title}"` : ""}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700 text-white">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
