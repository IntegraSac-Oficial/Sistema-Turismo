
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Building2,
  Search,
  Filter,
  Plus,
  ArrowLeft,
  Pencil,
  Trash2,
  MapPin,
  Phone,
  Store,
  EyeIcon,
  Globe,
  CreditCard,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  Shield,
  Clock,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Business } from "@/api/entities";
import { City } from "@/api/entities";
import { Beach } from "@/api/entities";
import BusinessForm from "@/components/businesses/BusinessForm";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Product } from "@/api/entities";
import { Label } from "@/components/ui/label";

export default function Businesses() {
  const [businesses, setBusinesses] = useState([]);
  const [cities, setCities] = useState([]);
  const [types, setTypes] = useState([
    "restaurante",
    "hotel",
    "pousada",
    "loja",
    "Barbearia",
    "outros"
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [filtered, setFiltered] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentBusiness, setCurrentBusiness] = useState(null);
  const [formMode, setFormMode] = useState("create");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      const citiesData = await City.list();
      setCities(citiesData || []);
      
      const businessesData = await Business.list();
      setBusinesses(businessesData || []);
      applyFilters(businessesData, searchTerm, typeFilter, cityFilter);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setErrorMessage("Erro ao carregar os dados. Por favor, tente novamente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadBusinesses = async () => {
      try {
        const data = await Business.list();
        setBusinesses(data);
      } catch (error) {
        console.error("Erro ao carregar comércios:", error);
      }
    };
    
    loadBusinesses();
  }, []);
  
  useEffect(() => {
    applyFilters(businesses, searchTerm, typeFilter, cityFilter);
  }, [searchTerm, typeFilter, cityFilter]);
  
  const applyFilters = (data, term, type, city) => {
    if (!data) return;
    
    let result = [...data];
    
    if (term) {
      const lowerTerm = term.toLowerCase();
      result = result.filter(business => 
        (business.name && business.name.toLowerCase().includes(lowerTerm)) ||
        (business.description && business.description.toLowerCase().includes(lowerTerm)) ||
        (business.address && business.address.toLowerCase().includes(lowerTerm))
      );
    }

    if (type && type !== "all") {
      result = result.filter(business => business.type === type);
    }
    
    if (city && city !== "all") {
      result = result.filter(business => business.city_id === city);
    }
    
    setFiltered(result);
  };
  
  const handleCreateNew = () => {
    setCurrentBusiness(null);
    setFormMode("create");
    setShowForm(true);
  };
  
  const handleEdit = (business) => {
    setCurrentBusiness(business);
    setFormMode("edit");
    setShowForm(true);
  };
  
  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowProductForm(true);
  }; 

  const handleDeleteClick = (business) => {
    setBusinessToDelete(business);
    setOpenDeleteDialog(true);
  };
  
  const confirmDelete = async () => {
    if (!businessToDelete) return;
    
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      await Business.delete(businessToDelete.id);
      setSuccessMessage(`${businessToDelete.name} foi removido com sucesso.`);
      
      const updatedList = businesses.filter(b => b.id !== businessToDelete.id);
      setBusinesses(updatedList);
      applyFilters(updatedList, searchTerm, typeFilter, cityFilter);
      
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error("Erro ao excluir comércio:", error);
      setErrorMessage("Erro ao excluir comércio. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
      setOpenDeleteDialog(false);
      setBusinessToDelete(null);
    }
  };
  
  const handleDeleteProduct = async (productId) => {
    if (!productId) return;
    
    try {
      await Product.delete(productId);
      
      if (selectedBusiness) {
        const updatedProducts = selectedBusiness.products.filter(p => p.id !== productId);
        setSelectedBusiness({
          ...selectedBusiness,
          products: updatedProducts
        });
      }
      
      setSuccessMessage("Produto removido com sucesso");
      
      loadData();
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      setErrorMessage("Erro ao excluir produto");
    }
  };

  const handleSave = async (data) => {
    console.log("Dados recebidos em handleSave:", data); // Log para depuração
    setIsLoading(true);
    setErrorMessage(null);

    // Validação dos campos obrigatórios
    if (!data.name || !data.city_id || !data.type) {
      setErrorMessage("Por favor, preencha todos os campos obrigatórios (nome, cidade e tipo).");
      setIsLoading(false);
      return;
    }

    try {
      let savedBusiness;
      if (formMode === "create") {
        savedBusiness = await Business.create(data);
        setSuccessMessage(`${savedBusiness.name} foi cadastrado com sucesso.`);
        setBusinesses((prev) => [...prev, savedBusiness]);
      } else {
        savedBusiness = await Business.update(currentBusiness.id, data);
        setSuccessMessage(`${savedBusiness.name} foi atualizado com sucesso.`);
        setBusinesses((prev) =>
          prev.map((b) => (b.id === savedBusiness.id ? savedBusiness : b))
        );
      }

      applyFilters(businesses, searchTerm, typeFilter, cityFilter);
      setShowForm(false);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error("Erro ao salvar comércio:", error);
      const errorMsg = error.response?.data?.message || "Erro ao salvar comércio. Verifique os dados e tente novamente.";
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getTypeName = (type) => {
    switch (type) {
      case "restaurante": return "Restaurante";
      case "hotel": return "Hotel";
      case "pousada": return "Pousada";
      case "loja": return "Loja";
      case "barbearia": return "barbearia";
      default: return type ? type.charAt(0).toUpperCase() + type.slice(1) : "Outro";
    }
  };
  
  const getCityName = (cityId) => {
    if (!cityId) return "Cidade não informada";
    const city = cities.find(c => c.id === cityId);
    return city ? city.name : "Cidade não encontrada";
  };
  
  const formatPhone = (phone) => {
    if (!phone) return "";
    return phone.replace(/(\d{2})(\d{4,5})(\d{4})/, "($1) $2-$3");
  };
  
  const handleDelete = async (businessId) => {
    if (window.confirm("Tem certeza que deseja excluir este comércio? Esta ação não pode ser desfeita.")) {
      try {
        await Business.delete(businessId);
        loadData();
        setSuccessMessage("O comércio foi excluído com sucesso.");
      } catch (error) {
        console.error("Erro ao excluir comércio:", error);
        setErrorMessage("Não foi possível excluir o comércio. Tente novamente.");
      }
    }
  };

  // Adicionar função para refrescar dados
  const refreshData = () => {
    const businessesData = JSON.parse(localStorage.getItem('businesses') || '[]');
    setBusinesses(businessesData);
    setFiltered(businessesData);
    // toast({
    //   title: "Dados atualizados",
    //   description: `${businessesData.length} comércios carregados.`
    // });
  };
  
    // Adicionar funções para gerenciar assinatura
    const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
    const [selectedBusinessForSubscription, setSelectedBusinessForSubscription] = useState(null);
    const [subscriptionEndDate, setSubscriptionEndDate] = useState("");
    const [subscriptionAction, setSubscriptionAction] = useState("");
  
    const handleActivateSubscription = (business) => {
      setSelectedBusinessForSubscription(business);
      setSubscriptionAction("activate");
      setShowSubscriptionDialog(true);
    };
  
    const handleDeactivateSubscription = (business) => {
      setSelectedBusinessForSubscription(business);
      setSubscriptionAction("deactivate");
      setShowSubscriptionDialog(true);
    };
  
    const handleSetSubscriptionEndDate = (business) => {
      setSelectedBusinessForSubscription(business);
      setSubscriptionAction("set_date");
      
      // Definir data padrão (3 meses a partir de hoje)
      const defaultDate = new Date();
      defaultDate.setMonth(defaultDate.getMonth() + 3);
      setSubscriptionEndDate(defaultDate.toISOString().split('T')[0]);
      
      setShowSubscriptionDialog(true);
    };
  
    const confirmSubscriptionAction = async () => {
      if (!selectedBusinessForSubscription) return;
      
      setIsLoading(true);
      
      try {
        let updateData = {};
        let successMessage = "";
        
        // Verificar que temos os campos necessários
        console.log("Business selecionado:", selectedBusinessForSubscription);
        
        // Mapear corretamente os campos do business
        const businessName = selectedBusinessForSubscription.business_name || selectedBusinessForSubscription.name;
        const businessType = selectedBusinessForSubscription.business_type || selectedBusinessForSubscription.type;
        const businessEmail = selectedBusinessForSubscription.business_email || selectedBusinessForSubscription.email;
        
        if (subscriptionAction === "activate") {
          // Ativar assinatura por 3 meses por padrão
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + 3);
          
          updateData = {
            business_name: businessName,
            business_type: businessType,
            business_email: businessEmail,
            city_id: selectedBusinessForSubscription.city_id,
            
            // Adicionar campos de assinatura
            subscription_status: "active",
            subscription_payment_method: "manual",
            subscription_start_date: new Date().toISOString().split('T')[0],
            subscription_end_date: endDate.toISOString().split('T')[0],
            subscription_notes: "Ativado manualmente pelo administrador"
          };
          
          successMessage = `Assinatura ativada para ${businessName}`;
        } 
        else if (subscriptionAction === "deactivate") {
          updateData = {
            business_name: businessName,
            business_type: businessType,
            business_email: businessEmail,
            city_id: selectedBusinessForSubscription.city_id,
            
            // Atualizar status
            subscription_status: "expired",
            subscription_notes: "Desativado manualmente pelo administrador"
          };
          
          successMessage = `Assinatura desativada para ${businessName}`;
        }
        else if (subscriptionAction === "set_date") {
          if (!subscriptionEndDate) {
            setErrorMessage("Por favor, selecione uma data válida");
            setIsLoading(false);
            return;
          }
          
          updateData = {
            business_name: businessName,
            business_type: businessType,
            business_email: businessEmail,
            city_id: selectedBusinessForSubscription.city_id,
            
            // Atualizar data
            subscription_status: "active",
            subscription_end_date: subscriptionEndDate,
            subscription_notes: "Data de validade alterada manualmente pelo administrador"
          };
          
          successMessage = `Data de validade da assinatura definida para ${businessName}`;
        }
        
        // Preservar outros campos existentes no negócio
        const businessData = {
          ...selectedBusinessForSubscription,
          ...updateData
        };
        
        // Garantir os campos obrigatórios no formato correto
        if (businessData.name && !businessData.business_name) {
          businessData.business_name = businessData.name;
          delete businessData.name; // Remover o campo incorreto
        }
        
        if (businessData.type && !businessData.business_type) {
          businessData.business_type = businessData.type;
          delete businessData.type; // Remover o campo incorreto
        }
        
        if (businessData.email && !businessData.business_email) {
          businessData.business_email = businessData.email;
          delete businessData.email; // Remover o campo incorreto
        }
        
        console.log("Dados a serem enviados:", businessData);
        
        // Atualizar o business
        await Business.update(selectedBusinessForSubscription.id, businessData);
        
        // Recarregar dados
        await loadData();
        
        setShowSubscriptionDialog(false);
        setSuccessMessage(successMessage);
        
        // Limpar mensagem após 5 segundos
        setTimeout(() => setSuccessMessage(null), 5000);
      } catch (error) {
        console.error("Erro detalhado ao gerenciar assinatura:", error);
        setErrorMessage("Erro ao processar a solicitação. Verifique o console para mais detalhes.");
      } finally {
        setIsLoading(false);
      }
    };
  
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="mb-2"
          onClick={() => navigate(createPageUrl("Dashboard"))}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para o Dashboard
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Comércios</h1>
            <p className="text-gray-500">Gerencie os estabelecimentos comerciais parceiros</p>
          </div>
          
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleCreateNew}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Comércio
          </Button>
        </div>
      </div>
      
      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-md flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-md flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {errorMessage}
        </div>
      )}
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Buscar comércios..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {types.map(type => (
              <SelectItem key={type} value={type}>
                {getTypeName(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={cityFilter} onValueChange={setCityFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por cidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as cidades</SelectItem>
            {cities.map(city => (
              <SelectItem key={city.id} value={city.id}>
                {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
            {/* Adicionar botão de atualizar na UI */}
      <Button onClick={refreshData}>Atualizar dados</Button>
      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-lg text-gray-600">Carregando comércios...</span>
        </div>
      ) : (
        <>
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(business => (
                <Card key={business.id} className="overflow-hidden">
                  {business.image_url && (
                    <div className="h-48 overflow-hidden relative">
                      <img 
                        src={business.image_url} 
                        alt={business.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60';
                        }}
                      />
                      <div className="absolute top-0 right-0 p-2 flex gap-2">
                        {business.is_club_member && (
                          <Badge className="bg-amber-500 text-white">
                            Clube de Assinantes
                          </Badge>
                        )}
                        {business.type && (
                          <Badge className="bg-blue-600">
                            {getTypeName(business.type)}
                          </Badge>
                        )}
                        
                        {/* Novo badge para status de assinatura */}
                        {business.subscription_status === "active" && (
                          <Badge className="bg-green-500 text-white">
                            Assinatura Ativa
                          </Badge>
                        )}
                        {business.subscription_status === "pending" && (
                          <Badge className="bg-yellow-500 text-white">
                            Pagamento Pendente
                          </Badge>
                        )}
                        {business.subscription_status === "expired" && (
                          <Badge className="bg-red-500 text-white">
                            Assinatura Expirada
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl font-bold">
                        {business.name}
                      </CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(business)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteClick(business)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      {getCityName(business.city_id)}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {business.description && (
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {business.description}
                      </p>
                    )}
                    
                    <div className="space-y-2 text-sm">
                      {business.address && (
                        <div className="flex items-start">
                          <MapPin className="w-4 h-4 mr-2 text-gray-500 mt-0.5" />
                          <span>{business.address}</span>
                        </div>
                      )}
                      
                      {business.phone && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-500" />
                          <span>{formatPhone(business.phone)}</span>
                        </div>
                      )}
                      
                      {business.website && (
                        <div className="flex items-center">
                          <Globe className="w-4 h-4 mr-2 text-gray-500" />
                          <a 
                            href={business.website.startsWith('http') ? business.website : `https://${business.website}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline truncate max-w-[220px]"
                          >
                            {business.website.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '')}
                          </a>
                        </div>
                      )}
                    </div>
                    
                    {business.is_club_member && business.discount_value > 0 && (
                      <div className="mt-4 p-2 bg-amber-50 border border-amber-200 rounded-md">
                        <div className="flex items-center">
                          <CreditCard className="w-4 h-4 mr-2 text-amber-600" />
                          <span className="text-amber-800 font-medium">
                            {business.discount_value}% de desconto para assinantes
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Adicionar informações sobre assinatura */}
                    {business.subscription_status && business.subscription_status !== "not_subscribed" && (
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <h4 className="text-sm font-medium mb-2">Informações de Assinatura</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center">
                            <Shield className="w-4 h-4 mr-2 text-gray-500" />
                            <span>
                              Status: {" "}
                              {business.subscription_status === "active" && <span className="text-green-600 font-medium">Ativa</span>}
                              {business.subscription_status === "pending" && <span className="text-yellow-600 font-medium">Pendente</span>}
                              {business.subscription_status === "expired" && <span className="text-red-600 font-medium">Expirada</span>}
                              {business.subscription_status === "not_subscribed" && <span className="text-gray-600 font-medium">Não Assinante</span>}
                            </span>
                          </div>
                          
                          {business.subscription_payment_method && (
                            <div className="flex items-center">
                              <CreditCard className="w-4 h-4 mr-2 text-gray-500" />
                              <span>
                                Pagamento: {" "}
                                {business.subscription_payment_method === "card" && "Cartão de Crédito"}
                                {business.subscription_payment_method === "pix" && "PIX"}
                                {business.subscription_payment_method === "manual" && "Manual"}
                              </span>
                            </div>
                          )}
                          
                          {business.subscription_end_date && (
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                              <span>
                                Validade: {new Date(business.subscription_end_date).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  
                    <div className="mt-4 pt-4 border-t flex justify-end">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDelete(business.id)}
                        >
                          Deletar
                        </Button>
                        <Button 
                          variant="outline" 
                          className="text-blue-600 border-blue-200"
                          onClick={() => handleEdit(business)}
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                        
                        {/* Novos botões para gerenciar assinatura */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Shield className="mr-2 h-4 w-4" />
                              Assinatura
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleActivateSubscription(business)}>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                              Ativar Assinatura
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeactivateSubscription(business)}>
                              <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                              Desativar Assinatura
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSetSubscriptionEndDate(business)}>
                              <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                              Definir Validade
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        
                        {business.products && business.products.map(product => (
                          <div key={product.id} className="flex items-center mt-4">
                            <span className="font-medium text-blue-600">
                              R$ {product.price.toFixed(2)}
                            </span>
                            <div className="ml-auto flex space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditProduct(product)}
                                className="h-8 w-8 text-gray-500 hover:text-blue-600"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteProduct(product.id)}
                                className="h-8 w-8 text-gray-500 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center p-12 bg-gray-50 rounded-lg border border-gray-200">
              <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">Nenhum comércio encontrado</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || typeFilter !== "all" || cityFilter !== "all" 
                  ? "Tente ajustar os filtros de busca ou" 
                  : "Comece"} cadastrando seu primeiro comércio.
              </p>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleCreateNew}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Comércio
              </Button>
            </div>
          )}
        </>
      )}
      
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {formMode === "create" ? "Cadastrar Novo Comércio" : `Editar ${currentBusiness?.name || 'Comércio'}`}
            </DialogTitle>
            <DialogDescription>
              Preencha os detalhes do estabelecimento comercial abaixo.
            </DialogDescription>
          </DialogHeader>
          
          <BusinessForm 
            business={currentBusiness}
            onSave={handleSave}
            mode={formMode}
            cities={cities} // Passando as cidades para o formulário
            types={types}   // Passando os tipos para o formulário
          />
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            {/* O botão "Salvar" será gerenciado pelo BusinessForm */}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o comércio <strong>{businessToDelete?.name}</strong>? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
  
      {/* Adicionar o Dialog para gerenciar assinaturas */}
      <Dialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {subscriptionAction === "activate" && "Ativar Assinatura"}
              {subscriptionAction === "deactivate" && "Desativar Assinatura"}
              {subscriptionAction === "set_date" && "Definir Validade da Assinatura"}
            </DialogTitle>
            <DialogDescription>
              {subscriptionAction === "activate" && "Ativar assinatura para este comércio?"}
              {subscriptionAction === "deactivate" && "Desativar assinatura para este comércio?"}
              {subscriptionAction === "set_date" && "Defina a data de validade da assinatura"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {selectedBusinessForSubscription && (
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <p className="font-medium">{selectedBusinessForSubscription.name}</p>
                <p className="text-sm text-gray-500">
                  {getTypeName(selectedBusinessForSubscription.type)} · {getCityName(selectedBusinessForSubscription.city_id)}
                </p>
              </div>
            )}
            
            {subscriptionAction === "set_date" && (
              <div className="space-y-2">
                <Label htmlFor="subscription_end_date">Data de Validade</Label>
                <Input
                  id="subscription_end_date"
                  type="date"
                  value={subscriptionEndDate}
                  onChange={(e) => setSubscriptionEndDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-sm text-gray-500">
                  Defina até quando a assinatura estará válida
                </p>
              </div>
            )}
            
            {subscriptionAction === "activate" && (
              <div className="p-3 bg-green-50 text-green-800 rounded-md text-sm">
                <p className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  A assinatura será ativada por 3 meses a partir de hoje
                </p>
              </div>
            )}
            
            {subscriptionAction === "deactivate" && (
              <div className="p-3 bg-red-50 text-red-800 rounded-md text-sm">
                <p className="flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  O comércio não aparecerá mais nas listagens públicas
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSubscriptionDialog(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmSubscriptionAction}
              disabled={isLoading}
              className={
                subscriptionAction === "activate" ? "bg-green-600 hover:bg-green-700" :
                subscriptionAction === "deactivate" ? "bg-red-600 hover:bg-red-700" :
                "bg-blue-600 hover:bg-blue-700"
              }
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  {subscriptionAction === "activate" && "Ativar Assinatura"}
                  {subscriptionAction === "deactivate" && "Desativar Assinatura"}
                  {subscriptionAction === "set_date" && "Salvar Data"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
