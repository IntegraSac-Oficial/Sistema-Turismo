import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  MessageSquare,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Flag,
  Search,
  Filter,
  RefreshCw,
  ArrowLeft,
  Star,
  Calendar,
  User,
  Clock,
  MapPin,
  Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Importações de entidades
import { Review } from "@/api/entities";
import { City } from "@/api/entities";
import { Beach } from "@/api/entities";
import { Business } from "@/api/entities";
import { ServiceProvider } from "@/api/entities";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [actionReason, setActionReason] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [cities, setCities] = useState([]);
  const [beaches, setBeaches] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [serviceProviders, setServiceProviders] = useState([]);
  
  const navigate = useNavigate();
  const location = window.location.search;
  const urlParams = new URLSearchParams(location);
  const filterParam = urlParams.get('filter');

  useEffect(() => {
    if (filterParam === 'reported') {
      setStatusFilter('reported');
    }
    loadData();
  }, [filterParam]);
  
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Simular dados de avaliações
      const reviewsData = Array.from({ length: 100 }, (_, i) => {
        const entityTypes = ["city", "beach", "business", "serviceprovider"];
        const entityType = entityTypes[Math.floor(Math.random() * entityTypes.length)];
        const ratings = [1, 2, 3, 4, 5];
        const rating = ratings[Math.floor(Math.random() * ratings.length)];
        const statuses = ["approved", "pending", "reported", "rejected"];
        const status = i < 15 && filterParam === 'reported' ? 'reported' : statuses[Math.floor(Math.random() * statuses.length)];
        
        const visitDate = new Date();
        visitDate.setDate(visitDate.getDate() - Math.floor(Math.random() * 90));
        
        return {
          id: `review-${i + 1}`,
          user_id: `user-${Math.floor(Math.random() * 50) + 1}`,
          user_name: `Usuário ${Math.floor(Math.random() * 50) + 1}`,
          entity_type: entityType,
          entity_id: `${entityType}-${Math.floor(Math.random() * 20) + 1}`,
          entity_name: `${entityType === 'city' ? 'Cidade' : entityType === 'beach' ? 'Praia' : entityType === 'business' ? 'Comércio' : 'Prestador'} ${Math.floor(Math.random() * 20) + 1}`,
          rating,
          comment: `Esta é uma avaliação de exemplo ${i + 1}. ${rating >= 4 ? 'Muito bom!' : rating >= 3 ? 'Razoável.' : 'Precisa melhorar.'}`,
          image_urls: [],
          visit_date: visitDate,
          status,
          reported_reason: status === 'reported' ? 'Conteúdo inapropriado ou ofensivo' : null,
          created_date: new Date(Date.now() - Math.floor(Math.random() * 90) * 86400000)
        };
      });
      
      setReviews(reviewsData);
      filterReviews(reviewsData, searchTerm, statusFilter, typeFilter, ratingFilter);
      
      // Simulação de carregamento de entidades
      setCities([]);
      setBeaches([]);
      setBusinesses([]);
      setServiceProviders([]);
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const filterReviews = (reviewsData, search, status, type, rating) => {
    let filtered = reviewsData;
    
    if (search) {
      filtered = filtered.filter(
        review => 
          review.user_name.toLowerCase().includes(search.toLowerCase()) ||
          review.entity_name.toLowerCase().includes(search.toLowerCase()) ||
          review.comment.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (status !== "all") {
      filtered = filtered.filter(review => review.status === status);
    }
    
    if (type !== "all") {
      filtered = filtered.filter(review => review.entity_type === type);
    }
    
    if (rating !== "all") {
      filtered = filtered.filter(review => review.rating === parseInt(rating));
    }
    
    setFilteredReviews(filtered);
  };
  
  useEffect(() => {
    filterReviews(reviews, searchTerm, statusFilter, typeFilter, ratingFilter);
  }, [searchTerm, statusFilter, typeFilter, ratingFilter, reviews]);
  
  const handleOpenViewDialog = (review) => {
    setSelectedReview(review);
    setIsViewDialogOpen(true);
  };
  
  const handleOpenActionDialog = (review, action) => {
    setSelectedReview(review);
    setActionType(action);
    setIsActionDialogOpen(true);
  };
  
  const handleAction = async () => {
    if (!selectedReview || !actionType) return;
    
    const newStatus = actionType === 'approve' ? 'approved' : 'rejected';
    
    // Simulando a atualização
    const updatedReviews = reviews.map(review => 
      review.id === selectedReview.id 
        ? { 
            ...review, 
            status: newStatus,
            rejection_reason: actionType === 'reject' ? actionReason : undefined
          } 
        : review
    );
    
    setReviews(updatedReviews);
    setIsActionDialogOpen(false);
    setSelectedReview(null);
    setActionType(null);
    setActionReason("");
  };
  
  const handleDeleteReview = (review) => {
    setReviewToDelete(review);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!reviewToDelete) return;
    
    // Simulando a exclusão
    const updatedReviews = reviews.filter(review => review.id !== reviewToDelete.id);
    
    setReviews(updatedReviews);
    setIsDeleteDialogOpen(false);
    setReviewToDelete(null);
  };
  
  const formatDate = (date) => {
    if (!date) return '';
    return date instanceof Date 
      ? date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : '';
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800";
      case "pending": return "bg-amber-100 text-amber-800";
      case "reported": return "bg-red-100 text-red-800";
      case "rejected": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  const getStatusLabel = (status) => {
    switch (status) {
      case "approved": return "Aprovada";
      case "pending": return "Pendente";
      case "reported": return "Denunciada";
      case "rejected": return "Rejeitada";
      default: return status;
    }
  };

  const getEntityTypeLabel = (type) => {
    switch (type) {
      case "city": return "Cidade";
      case "beach": return "Praia";
      case "business": return "Comércio";
      case "serviceprovider": return "Prestador";
      default: return type;
    }
  };
  
  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-[#FFC107] fill-[#FFC107]' : 'text-gray-300'}`} 
      />
    ));
  };
  
  const handleExport = () => {
    console.log("Exportando dados");
    // Implementar lógica de exportação
  };
  
  const entityTypeOptions = [
    { value: "all", label: "Todos os Tipos" },
    { value: "city", label: "Cidades" },
    { value: "beach", label: "Praias" },
    { value: "business", label: "Comércios" },
    { value: "serviceprovider", label: "Prestadores" }
  ];
  
  const statusOptions = [
    { value: "all", label: "Todos os Status" },
    { value: "approved", label: "Aprovadas" },
    { value: "pending", label: "Pendentes" },
    { value: "reported", label: "Denunciadas" },
    { value: "rejected", label: "Rejeitadas" }
  ];
  
  const ratingOptions = [
    { value: "all", label: "Todas Notas" },
    { value: "5", label: "5 Estrelas" },
    { value: "4", label: "4 Estrelas" },
    { value: "3", label: "3 Estrelas" },
    { value: "2", label: "2 Estrelas" },
    { value: "1", label: "1 Estrela" }
  ];

  return (
    <div className="container p-4 mx-auto max-w-6xl">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(createPageUrl("Dashboard"))}
                className="text-gray-500 hover:text-[#007BFF]"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Voltar
              </Button>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold" style={{fontFamily: "'Montserrat', sans-serif"}}>
              Avaliações
            </h1>
            <p className="text-gray-500">Gerencie as avaliações de usuários em cidades, praias, comércios e prestadores.</p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center" onClick={loadData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button variant="outline" className="flex items-center" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative w-full md:col-span-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Buscar avaliações..."
              className="pl-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              {entityTypeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por nota" />
            </SelectTrigger>
            <SelectContent>
              {ratingOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-2 text-sm text-gray-500 md:col-span-2">
            <Clock className="w-4 h-4" />
            <span>Atualizado: {formatDate(lastUpdated)} {lastUpdated.toLocaleTimeString('pt-BR')}</span>
          </div>
        </div>
      </header>
      
      <Card>
        <CardHeader className="pb-0">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Lista de Avaliações</CardTitle>
            <div className="bg-[#007BFF]/10 px-3 py-1 rounded-full text-sm font-medium text-[#007BFF] flex items-center">
              <Filter className="w-4 h-4 mr-1" />
              {filteredReviews.length} avaliações encontradas
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin text-gray-400 mb-4" />
              <p className="text-gray-600">Carregando avaliações...</p>
            </div>
          ) : filteredReviews.length > 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3">Usuário</th>
                      <th className="px-4 py-3">Local Avaliado</th>
                      <th className="px-4 py-3">Avaliação</th>
                      <th className="px-4 py-3 hidden md:table-cell">Data</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReviews.map((review) => (
                      <tr key={review.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-[#007BFF] text-white text-xs">{review.user_name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{review.user_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium truncate max-w-[150px]">{review.entity_name}</div>
                            <Badge variant="outline" className="font-normal text-xs">
                              {getEntityTypeLabel(review.entity_type)}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <div className="flex">
                              {renderStars(review.rating)}
                            </div>
                            <div className="text-xs text-gray-500 truncate max-w-[150px]">
                              {review.comment}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {formatDate(review.created_date)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`font-normal ${getStatusColor(review.status)}`}>
                            {getStatusLabel(review.status)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2"
                              onClick={() => handleOpenViewDialog(review)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            
                            {review.status === 'pending' || review.status === 'reported' ? (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-[#4CAF50] hover:bg-green-600 h-8 px-2"
                                  onClick={() => handleOpenActionDialog(review, 'approve')}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-[#FF0000] hover:bg-red-600 h-8 px-2"
                                  onClick={() => handleOpenActionDialog(review, 'reject')}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-500 border-red-500 hover:bg-red-50 h-8 px-2"
                                onClick={() => handleDeleteReview(review)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">Nenhuma avaliação encontrada.</p>
              <p className="text-gray-500 text-sm mt-1">Tente ajustar os filtros de busca.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Dialog para visualizar detalhes da avaliação */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Avaliação</DialogTitle>
            <DialogDescription>
              Visualize os detalhes completos da avaliação.
            </DialogDescription>
          </DialogHeader>
          
          {selectedReview && (
            <div className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-[#007BFF] text-white">{selectedReview.user_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-lg">{selectedReview.user_name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(selectedReview.created_date)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Local Avaliado</h3>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <div className="font-medium">{selectedReview.entity_name}</div>
                        <Badge className="mt-1">
                          {getEntityTypeLabel(selectedReview.entity_type)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Nota</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {renderStars(selectedReview.rating)}
                      </div>
                      <span className="font-medium">{selectedReview.rating}/5</span>
                    </div>
                  </div>
                  
                  {selectedReview.visit_date && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Data da Visita</h3>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <span>{formatDate(selectedReview.visit_date)}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(selectedReview.status)}>
                        {getStatusLabel(selectedReview.status)}
                      </Badge>
                      
                      {selectedReview.status === 'reported' && (
                        <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50">
                          <Flag className="w-3 h-3 mr-1" />
                          Denunciada
                        </Badge>
                      )}
                    </div>
                    
                    {selectedReview.status === 'reported' && selectedReview.reported_reason && (
                      <div className="mt-2 text-sm text-red-500 bg-red-50 border border-red-100 rounded-md p-2">
                        <span className="font-medium">Motivo da denúncia:</span> {selectedReview.reported_reason}
                      </div>
                    )}
                    
                    {selectedReview.status === 'rejected' && selectedReview.rejection_reason && (
                      <div className="mt-2 text-sm text-gray-500 bg-gray-50 border border-gray-100 rounded-md p-2">
                        <span className="font-medium">Motivo da rejeição:</span> {selectedReview.rejection_reason}
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Comentário</h3>
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                      <p className="text-gray-700">{selectedReview.comment}</p>
                    </div>
                  </div>
                  
                  {selectedReview.image_urls && selectedReview.image_urls.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Imagens</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedReview.image_urls.map((url, index) => (
                          <div key={index} className="border border-gray-200 rounded-md overflow-hidden">
                            <img src={url} alt={`Imagem da avaliação ${index + 1}`} className="w-full h-32 object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {(selectedReview.status === 'pending' || selectedReview.status === 'reported') && (
                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    variant="outline"
                    className="border-[#FF0000] text-[#FF0000] hover:bg-red-50"
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      handleOpenActionDialog(selectedReview, 'reject');
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rejeitar
                  </Button>
                  <Button
                    className="bg-[#4CAF50] hover:bg-green-600"
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      handleOpenActionDialog(selectedReview, 'approve');
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aprovar
                  </Button>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsViewDialogOpen(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog para aprovar/rejeitar avaliação */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Aprovar Avaliação' : 'Rejeitar Avaliação'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? 'Confirme a aprovação desta avaliação. Ela será exibida publicamente.'
                : 'Informe o motivo da rejeição desta avaliação. Ela não será exibida publicamente.'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedReview && (
            <div className="py-4">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-[#007BFF] text-white">{selectedReview.user_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{selectedReview.user_name}</div>
                  <div className="text-xs flex gap-1 items-center">
                    <div className="flex">
                      {renderStars(selectedReview.rating)}
                    </div>
                    <span>para {selectedReview.entity_name}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-4">
                <p className="text-gray-700 text-sm">{selectedReview.comment}</p>
              </div>
              
              {actionType === 'reject' && (
                <div className="space-y-2">
                  <Label htmlFor="rejection-reason">Motivo da Rejeição</Label>
                  <Textarea
                    id="rejection-reason"
                    placeholder="Informe o motivo da rejeição desta avaliação..."
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              className={actionType === 'approve' ? 'bg-[#4CAF50] hover:bg-green-600' : 'bg-[#FF0000] hover:bg-red-600'}
              onClick={handleAction}
              disabled={actionType === 'reject' && !actionReason.trim()}
            >
              {actionType === 'approve' ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirmar Aprovação
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Confirmar Rejeição
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* AlertDialog para confirmar exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Avaliação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir permanentemente esta avaliação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-[#FF0000] hover:bg-red-600"
              onClick={confirmDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}