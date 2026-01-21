
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { PricingRule } from "@/api/entities";
import { Business } from "@/api/entities";
import { Product } from "@/api/entities";
import { User } from "@/api/entities";
import { 
  Tag, 
  CalendarDays, 
  Clock, 
  PlusCircle, 
  Calendar, 
  Percent, 
  DollarSign, 
  Package, 
  Gift, 
  BarChart3, 
  ArrowLeft,
  Trash2,
  Edit,
  Plus,
  CheckSquare,
  XSquare,
  Search,
  Filter,
  RefreshCw,
  Store,
  Loader2
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function DynamicPricing() {
  const [pricingRules, setPricingRules] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterActive, setFilterActive] = useState("all");
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [showPricingRuleForm, setShowPricingRuleForm] = useState(false);
  const [selectedPricingRule, setSelectedPricingRule] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "percentual",
    value: "",
    business_id: "",
    product_id: "",
    start_date: format(new Date(), "yyyy-MM-dd"),
    end_date: format(new Date(new Date().setMonth(new Date().getMonth() + 1)), "yyyy-MM-dd"),
    day_of_week: [],
    is_active: true,
    min_purchase: "",
    buy_quantity: "",
    get_quantity: "",
    package_items: [],
    conditions: "",
    promotion_code: "",
    priority: 1
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productSearchTerm, setProductSearchTerm] = useState([]);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      
      const businessData = await Business.list();
      setBusinesses(businessData);
      
      const productData = await Product.list();
      setProducts(productData);
      
      const pricingRuleData = await PricingRule.list();
      setPricingRules(pricingRuleData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBusinessChange = (businessId) => {
    setFormData({...formData, business_id: businessId, product_id: ""});
    setSelectedBusiness(businessId);
    
    const businessProducts = products.filter(p => p.business_id === businessId);
    setFilteredProducts(businessProducts);
  };
  
  const handleCreatePricingRule = () => {
    setSelectedPricingRule(null);
    setFormData({
      name: "",
      type: "percentual",
      value: "",
      business_id: "",
      product_id: "",
      start_date: format(new Date(), "yyyy-MM-dd"),
      end_date: format(new Date(new Date().setMonth(new Date().getMonth() + 1)), "yyyy-MM-dd"),
      day_of_week: [],
      is_active: true,
      min_purchase: "",
      buy_quantity: "",
      get_quantity: "",
      package_items: [],
      conditions: "",
      promotion_code: "",
      priority: 1
    });
    setSelectedBusiness(null);
    setSelectedProducts([]);
    setFilteredProducts([]);
    setShowPricingRuleForm(true);
  };
  
  const handleEditPricingRule = (rule) => {
    setSelectedPricingRule(rule);
    
    const formattedRule = {
      ...rule,
      day_of_week: rule.day_of_week || [],
      package_items: rule.package_items || [],
      value: rule.value?.toString() || "",
      min_purchase: rule.min_purchase?.toString() || "",
      buy_quantity: rule.buy_quantity?.toString() || "",
      get_quantity: rule.get_quantity?.toString() || "",
      priority: rule.priority?.toString() || "1"
    };
    
    setFormData(formattedRule);
    setSelectedBusiness(rule.business_id);
    
    const businessProducts = products.filter(p => p.business_id === rule.business_id);
    setFilteredProducts(businessProducts);
    
    if (rule.package_items && rule.package_items.length > 0) {
      setSelectedProducts(rule.package_items);
    }
    
    setShowPricingRuleForm(true);
  };
  
  const handleDeleteRule = (rule) => {
    setRuleToDelete(rule);
    setShowDeleteConfirm(true);
  };
  
  const confirmDelete = async () => {
    if (!ruleToDelete) return;
    
    try {
      await PricingRule.delete(ruleToDelete.id);
      setPricingRules(prevRules => prevRules.filter(r => r.id !== ruleToDelete.id));
      setShowDeleteConfirm(false);
      setRuleToDelete(null);
    } catch (error) {
      console.error("Erro ao excluir regra:", error);
    }
  };
  
  const handleDayOfWeekChange = (day) => {
    setFormData(prev => {
      const currentDays = [...(prev.day_of_week || [])];
      if (currentDays.includes(day)) {
        return {...prev, day_of_week: currentDays.filter(d => d !== day)};
      } else {
        return {...prev, day_of_week: [...currentDays, day]};
      }
    });
  };
  
  const handleAddPackageItem = (productId) => {
    if (!productId) return;
    
    setFormData(prev => {
      const items = [...(prev.package_items || [])];
      if (!items.includes(productId)) {
        return {...prev, package_items: [...items, productId]};
      }
      return prev;
    });
    
    setSelectedProducts(prev => {
      if (!prev.includes(productId)) {
        return [...prev, productId];
      }
      return prev;
    });
  };
  
  const handleRemovePackageItem = (productId) => {
    setFormData(prev => {
      const items = [...(prev.package_items || [])];
      return {...prev, package_items: items.filter(id => id !== productId)};
    });
    
    setSelectedProducts(prev => prev.filter(id => id !== productId));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      if (!formData.business_id) {
        throw new Error("Selecione um comércio");
      }
      
      if (formData.type === "pacote" && (!formData.package_items || formData.package_items.length < 2)) {
        throw new Error("Adicione pelo menos 2 produtos ao pacote");
      }
      
      if (formData.type === "compre_ganhe" && (!formData.buy_quantity || !formData.get_quantity)) {
        throw new Error("Informe as quantidades para comprar e ganhar");
      }
      
      const ruleData = {
        ...formData,
        value: formData.value ? parseFloat(formData.value) : null,
        min_purchase: formData.min_purchase ? parseFloat(formData.min_purchase) : null,
        buy_quantity: formData.buy_quantity ? parseInt(formData.buy_quantity) : null,
        get_quantity: formData.get_quantity ? parseInt(formData.get_quantity) : null,
        priority: formData.priority ? parseInt(formData.priority) : 1
      };
      
      let result;
      if (selectedPricingRule?.id) {
        result = await PricingRule.update(selectedPricingRule.id, ruleData);
        setPricingRules(prev => prev.map(r => r.id === selectedPricingRule.id ? result : r));
      } else {
        result = await PricingRule.create(ruleData);
        setPricingRules(prev => [...prev, result]);
      }
      
      setShowPricingRuleForm(false);
    } catch (error) {
      console.error("Erro ao salvar regra de preço:", error);
      setFormError(error.message || "Erro ao salvar regra de preço");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const filteredRules = pricingRules.filter(rule => {
    const searchMatch = 
      rule.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      businesses.find(b => b.id === rule.business_id)?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.promotion_code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const typeMatch = filterType === "all" || rule.type === filterType;
    
    const activeMatch = 
      filterActive === "all" || 
      (filterActive === "active" && rule.is_active) || 
      (filterActive === "inactive" && !rule.is_active);
    
    return searchMatch && typeMatch && activeMatch;
  });
  
  const tabRules = {
    todas: filteredRules,
    ativas: filteredRules.filter(r => r.is_active && new Date(r.end_date) >= new Date()),
    futuras: filteredRules.filter(r => new Date(r.start_date) > new Date()),
    expiradas: filteredRules.filter(r => new Date(r.end_date) < new Date())
  };
  
  const getBusinessName = (id) => {
    const business = businesses.find(b => b.id === id);
    return business?.name || "Comércio não encontrado";
  };
  
  const getProductName = (id) => {
    const product = products.find(p => p.id === id);
    return product?.name || "Produto não encontrado";
  };
  
  const getRuleTypeIcon = (type) => {
    switch (type) {
      case "percentual": return <Percent className="w-4 h-4" />;
      case "valor_fixo": return <DollarSign className="w-4 h-4" />;
      case "compre_ganhe": return <Gift className="w-4 h-4" />;
      case "pacote": return <Package className="w-4 h-4" />;
      case "sazonal": return <CalendarDays className="w-4 h-4" />;
      default: return <Tag className="w-4 h-4" />;
    }
  };
  
  const getRuleTypeColor = (type) => {
    switch (type) {
      case "percentual": return "bg-blue-100 text-blue-800";
      case "valor_fixo": return "bg-green-100 text-green-800";
      case "compre_ganhe": return "bg-purple-100 text-purple-800";
      case "pacote": return "bg-amber-100 text-amber-800";
      case "sazonal": return "bg-teal-100 text-teal-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  const getRuleTypeName = (type) => {
    switch (type) {
      case "percentual": return "Desconto %";
      case "valor_fixo": return "Desconto Fixo";
      case "compre_ganhe": return "Compre e Ganhe";
      case "pacote": return "Pacote";
      case "sazonal": return "Sazonal";
      default: return type;
    }
  };
  
  const renderFormFieldsByType = () => {
    switch (formData.type) {
      case "percentual":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">Percentual de Desconto (%)</Label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <Input
                    id="value"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="15"
                    value={formData.value || ""}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="min_purchase">Valor Mínimo de Compra (opcional)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                  <Input
                    id="min_purchase"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="50.00"
                    value={formData.min_purchase || ""}
                    onChange={(e) => setFormData({...formData, min_purchase: e.target.value})}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>
        );
        
      case "valor_fixo":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">Valor do Desconto (R$)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                  <Input
                    id="value"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="25.00"
                    value={formData.value || ""}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="min_purchase">Valor Mínimo de Compra (opcional)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                  <Input
                    id="min_purchase"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="100.00"
                    value={formData.min_purchase || ""}
                    onChange={(e) => setFormData({...formData, min_purchase: e.target.value})}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>
        );
        
      case "compre_ganhe":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="buy_quantity">Compre (Quantidade)</Label>
                <Input
                  id="buy_quantity"
                  type="number"
                  min="1"
                  placeholder="2"
                  value={formData.buy_quantity || ""}
                  onChange={(e) => setFormData({...formData, buy_quantity: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="get_quantity">Ganhe (Quantidade)</Label>
                <Input
                  id="get_quantity"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={formData.get_quantity || ""}
                  onChange={(e) => setFormData({...formData, get_quantity: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="product_id">Produto</Label>
              <Select
                value={formData.product_id}
                onValueChange={(value) => setFormData({...formData, product_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o produto" />
                </SelectTrigger>
                <SelectContent>
                  {filteredProducts.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 italic">
                A promoção se aplica ao mesmo produto selecionado
              </p>
            </div>
          </div>
        );
        
      case "pacote":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="value">Preço do Pacote (R$)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                <Input
                  id="value"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="79.90"
                  value={formData.value || ""}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Produtos Incluídos no Pacote</Label>
              <div className="flex gap-2">
                <Select
                  onValueChange={handleAddPackageItem}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Adicionar produto ao pacote" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredProducts
                      .filter(p => !selectedProducts.includes(p.id))
                      .map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - R$ {product.price?.toFixed(2)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedProducts.length > 0 ? (
                <div className="mt-3 border rounded-md divide-y overflow-hidden">
                  {selectedProducts.map(productId => {
                    const product = products.find(p => p.id === productId);
                    return (
                      <div key={productId} className="flex justify-between items-center p-2 bg-gray-50">
                        <div>
                          <p className="font-medium">{product?.name}</p>
                          <p className="text-sm text-gray-500">Preço normal: R$ {product?.price?.toFixed(2)}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePackageItem(productId)}
                          className="text-red-500 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                  
                  <div className="p-3 bg-blue-50">
                    <div className="flex justify-between text-sm">
                      <span>Valor total individual:</span>
                      <span className="font-medium">
                        R$ {selectedProducts.reduce((total, id) => {
                          const product = products.find(p => p.id === id);
                          return total + (product?.price || 0);
                        }, 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span>Valor do pacote:</span>
                      <span className="font-medium">
                        R$ {formData.value || '0.00'}
                      </span>
                    </div>
                    {formData.value && (
                      <div className="flex justify-between font-medium mt-1">
                        <span>Economia:</span>
                        <span className="text-green-600">
                          R$ {(selectedProducts.reduce((total, id) => {
                            const product = products.find(p => p.id === id);
                            return total + (product?.price || 0);
                          }, 0) - parseFloat(formData.value || 0)).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border rounded-md p-3 text-center text-gray-500">
                  Nenhum produto adicionado ao pacote
                </div>
              )}
            </div>
          </div>
        );
        
      case "sazonal":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">Percentual de Ajuste (%)</Label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <Input
                    id="value"
                    type="number"
                    placeholder="20"
                    value={formData.value || ""}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    className="pl-10"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use valores positivos para aumento e negativos para redução
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="product_id">Produto (opcional)</Label>
                <Select
                  value={formData.product_id}
                  onValueChange={(value) => setFormData({...formData, product_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o produto ou deixe em branco para todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Todos os produtos</SelectItem>
                    {filteredProducts.map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="container p-4 mx-auto">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(createPageUrl("Businesses"))}
                className="text-gray-500 hover:text-[#007BFF]"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Voltar
              </Button>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Preços Dinâmicos e Promoções</h1>
            <p className="text-gray-500">Gerencie promoções, descontos e preços sazonais para seus produtos.</p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={loadData}
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </Button>
            <Button 
              className="bg-[#007BFF] hover:bg-blue-700 text-white flex items-center gap-2"
              onClick={handleCreatePricingRule}
            >
              <PlusCircle className="w-4 h-4" />
              Nova Promoção
            </Button>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Buscar promoções..."
              className="pl-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="percentual">Desconto %</SelectItem>
                <SelectItem value="valor_fixo">Desconto Fixo</SelectItem>
                <SelectItem value="compre_ganhe">Compre e Ganhe</SelectItem>
                <SelectItem value="pacote">Pacote</SelectItem>
                <SelectItem value="sazonal">Sazonal</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterActive} onValueChange={setFilterActive}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>
      
      <Tabs defaultValue="todas" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="ativas">
            Ativas 
            <Badge className="ml-2 bg-green-100 text-green-800">{tabRules.ativas.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="futuras">
            Futuras 
            <Badge className="ml-2 bg-blue-100 text-blue-800">{tabRules.futuras.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="expiradas">
            Expiradas 
            <Badge className="ml-2 bg-gray-100 text-gray-800">{tabRules.expiradas.length}</Badge>
          </TabsTrigger>
        </TabsList>
        
        {Object.entries(tabRules).map(([key, rules]) => (
          <TabsContent key={key} value={key} className="space-y-6">
            {isLoading ? (
              <div className="text-center p-12">
                <RefreshCw className="h-8 w-8 mx-auto animate-spin text-gray-400 mb-4" />
                <p className="text-gray-600">Carregando promoções...</p>
              </div>
            ) : rules.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rules.map(rule => (
                  <Card key={rule.id} className={`overflow-hidden ${!rule.is_active ? "opacity-60" : ""}`}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge className={`mb-1 ${getRuleTypeColor(rule.type)}`}>
                            <div className="flex items-center gap-1">
                              {getRuleTypeIcon(rule.type)}
                              {getRuleTypeName(rule.type)}
                            </div>
                          </Badge>
                          <CardTitle className="text-lg">{rule.name}</CardTitle>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPricingRule(rule)}
                            className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRule(rule)}
                            className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center text-sm gap-1">
                          <Store className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">{getBusinessName(rule.business_id)}</span>
                        </div>
                        
                        {rule.product_id && (
                          <div className="flex items-center text-sm gap-1">
                            <Package className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600">{getProductName(rule.product_id)}</span>
                          </div>
                        )}
                        
                        {rule.package_items && rule.package_items.length > 0 && (
                          <div className="text-sm">
                            <div className="flex items-center gap-1 mb-1">
                              <Package className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-600">Pacote com {rule.package_items.length} itens</span>
                            </div>
                            <div className="pl-5">
                              {rule.package_items.slice(0, 2).map(itemId => (
                                <div key={itemId} className="text-xs text-gray-500">• {getProductName(itemId)}</div>
                              ))}
                              {rule.package_items.length > 2 && (
                                <div className="text-xs text-gray-500">• e mais {rule.package_items.length - 2} item(ns)...</div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div className="text-sm">
                            <div className="text-gray-500">Valor:</div>
                            <div className="font-medium">
                              {rule.type === "percentual" && `${rule.value}% off`}
                              {rule.type === "valor_fixo" && `R$ ${rule.value?.toFixed(2)} off`}
                              {rule.type === "compre_ganhe" && `Compre ${rule.buy_quantity} e Ganhe ${rule.get_quantity}`}
                              {rule.type === "pacote" && `R$ ${rule.value?.toFixed(2)}`}
                              {rule.type === "sazonal" && `${rule.value > 0 ? '+' : ''}${rule.value}%`}
                            </div>
                          </div>
                          
                          <div className="text-sm">
                            <div className="text-gray-500">Período:</div>
                            <div className="font-medium text-xs flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {format(new Date(rule.start_date), "dd/MM/yy")} 
                              <span className="mx-1">-</span>
                              {format(new Date(rule.end_date), "dd/MM/yy")}
                            </div>
                          </div>
                          
                          {rule.min_purchase && (
                            <div className="text-sm col-span-2">
                              <div className="text-gray-500">Compra mínima:</div>
                              <div className="font-medium">R$ {rule.min_purchase?.toFixed(2)}</div>
                            </div>
                          )}
                          
                          {rule.promotion_code && (
                            <div className="text-sm col-span-2">
                              <div className="text-gray-500">Código:</div>
                              <div className="font-medium">{rule.promotion_code}</div>
                            </div>
                          )}
                        </div>
                        
                        {rule.day_of_week && rule.day_of_week.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {rule.day_of_week.map(day => (
                              <Badge key={day} variant="outline" className="text-xs">
                                {day.charAt(0).toUpperCase() + day.slice(1)}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        <div className="border-t pt-3 mt-3 flex justify-between items-center">
                          <Badge
                            className={rule.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                          >
                            {rule.is_active ? "Ativa" : "Inativa"}
                          </Badge>
                          
                          {new Date(rule.end_date) < new Date() && (
                            <Badge className="bg-red-100 text-red-800">
                              Expirada
                            </Badge>
                          )}
                          
                          {new Date(rule.start_date) > new Date() && (
                            <Badge className="bg-blue-100 text-blue-800">
                              Futura
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-12 bg-gray-50 rounded-lg border border-gray-200">
                <Tag className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-1">Nenhuma promoção encontrada</h3>
                <p className="text-gray-500 mb-6">Crie sua primeira regra de preço dinâmico</p>
                <Button 
                  onClick={handleCreatePricingRule}
                  className="bg-[#007BFF] hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Promoção
                </Button>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
      
      <Dialog open={showPricingRuleForm} onOpenChange={setShowPricingRuleForm}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedPricingRule ? "Editar Promoção" : "Nova Promoção"}
            </DialogTitle>
            <DialogDescription>
              Crie e configure regras de preços dinâmicos para seus produtos.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
                {formError}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Promoção *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Promoção de Verão, Black Friday"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Promoção *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({...formData, type: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentual">
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        <span>Desconto Percentual</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="valor_fixo">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>Desconto de Valor Fixo</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="compre_ganhe">
                      <div className="flex items-center gap-2">
                        <Gift className="h-4 w-4" />
                        <span>Compre e Ganhe</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="pacote">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <span>Pacote de Produtos</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="sazonal">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        <span>Preço Sazonal</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business_id">Comércio *</Label>
                <Select
                  value={formData.business_id}
                  onValueChange={handleBusinessChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o comércio" />
                  </SelectTrigger>
                  <SelectContent>
                    {businesses.map(business => (
                      <SelectItem key={business.id} value={business.id}>
                        {business.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {formData.type !== "pacote" && formData.type !== "compre_ganhe" && (
                <div className="space-y-2">
                  <Label htmlFor="product_id">Produto (opcional)</Label>
                  <Select
                    value={formData.product_id}
                    onValueChange={(value) => setFormData({...formData, product_id: value})}
                    disabled={!formData.business_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o produto ou deixe em branco para todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>Todos os produtos</SelectItem>
                      {filteredProducts.map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Deixe em branco para aplicar a todos os produtos do comércio
                  </p>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Data de Início *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {formData.start_date
                        ? format(new Date(formData.start_date), "dd/MM/yyyy")
                        : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={formData.start_date ? new Date(formData.start_date) : undefined}
                      onSelect={(date) => setFormData({
                        ...formData, 
                        start_date: date ? format(date, "yyyy-MM-dd") : ""
                      })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end_date">Data de Término *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {formData.end_date
                        ? format(new Date(formData.end_date), "dd/MM/yyyy")
                        : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={formData.end_date ? new Date(formData.end_date) : undefined}
                      onSelect={(date) => setFormData({
                        ...formData, 
                        end_date: date ? format(date, "yyyy-MM-dd") : ""
                      })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            {renderFormFieldsByType()}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="promotion_code">Código Promocional (opcional)</Label>
                <Input
                  id="promotion_code"
                  placeholder="Ex: VERAO2024"
                  value={formData.promotion_code || ""}
                  onChange={(e) => setFormData({...formData, promotion_code: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Input
                  id="priority"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={formData.priority || "1"}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                />
                <p className="text-xs text-gray-500">
                  Maior número = maior prioridade quando houver regras conflitantes
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label>Dias da Semana (opcional)</Label>
              <div className="flex flex-wrap gap-2">
                {["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"].map((day) => (
                  <div 
                    key={day}
                    className={`
                      cursor-pointer px-3 py-1.5 rounded-md text-sm font-medium
                      ${formData.day_of_week?.includes(day) 
                        ? "bg-blue-100 text-blue-800 border border-blue-200" 
                        : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"}
                    `}
                    onClick={() => handleDayOfWeekChange(day)}
                  >
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Deixe em branco para aplicar a todos os dias da semana
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="conditions">Condições Adicionais (opcional)</Label>
              <Textarea
                id="conditions"
                placeholder="Informe condições especiais para esta promoção"
                value={formData.conditions || ""}
                onChange={(e) => setFormData({...formData, conditions: e.target.value})}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({
                  ...formData, 
                  is_active: checked === true
                })}
              />
              <Label
                htmlFor="is_active"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Promoção ativa
              </Label>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowPricingRuleForm(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-[#007BFF] hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    {selectedPricingRule ? "Atualizar" : "Criar"} Promoção
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Promoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta promoção? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
