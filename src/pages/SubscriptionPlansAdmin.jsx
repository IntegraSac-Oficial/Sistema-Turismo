
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Crown,
  Plus,
  Trash2,
  Edit,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Download,
  Users,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  Clock,
  Settings,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  CreditCard,
  DollarSign,
  AlertTriangle,
  ArrowLeft,
  Store,
  Wrench,
  ExternalLink,
  User,
  Home,
  Building
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogClose,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { UploadFile } from "@/api/integrations";
import { SubscriptionPlan } from "@/api/entities";
import { User as UserEntity } from "@/api/entities";
import { UserSubscription } from "@/api/entities";
import { Tourist } from "@/api/entities";
import { toast } from "@/components/ui/use-toast"

export default function SubscriptionPlansAdmin() {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tourist");
  const [activeSubTab, setActiveSubTab] = useState("plans");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    period: "mensal",
    features: [],
    discount_percentage: "",
    image_url: "",
    payment_link: "",
    badge_color: "#007BFF",
    is_featured: false,
    is_active: true,
    position: 0,
    plan_type: "tourist",
    stripe_product_id: "", // ID do produto no Stripe
    stripe_price_id: "" // ID do preço no Stripe
  });
  const [newFeature, setNewFeature] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState(null);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchPaymentTerm, setSearchPaymentTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [newPaymentData, setNewPaymentData] = useState({
    user_id: "",
    user_name: "",
    plan_id: "",
    plan_name: "",
    amount: "",
    date: format(new Date(), "yyyy-MM-dd"),
    payment_method: "credit_card",
    description: ""
  });
  const [paymentToProcess, setPaymentToProcess] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [alertAction, setAlertAction] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [stripeConfigDialogOpen, setStripeConfigDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [stripeForm, setStripeForm] = useState({ stripe_price_id: "" });

  const navigate = useNavigate();
  const location = window.location.search;
  const urlParams = new URLSearchParams(location);
  const showPendingPaymentsParam = urlParams.get('pendingPayments');

  const periods = [
    { value: "mensal", label: "Mensal" },
    { value: "trimestral", label: "Trimestral" },
    { value: "semestral", label: "Semestral" },
    { value: "anual", label: "Anual" }
  ];

  const planTypes = [
    { value: "tourist", label: "Turistas", icon: Users },
    { value: "business", label: "Comércios", icon: Download },
    { value: "provider", label: "Prestadores", icon: Download },
    { value: "imobiliaria", label: "Imobiliárias", icon: Home }
  ];

  const paymentMethods = [
    { value: "credit_card", label: "Cartão de Crédito" },
    { value: "pix", label: "PIX" },
    { value: "boleto", label: "Boleto" },
    { value: "paypal", label: "PayPal" }
  ];

  const paymentStatuses = [
    { value: "all", label: "Todos os Status" },
    { value: "active", label: "Ativas" },
    { value: "pending", label: "Pendentes" },
    { value: "expired", label: "Expiradas" },
    { value: "cancelled", label: "Canceladas" }
  ];

  useEffect(() => {
    loadPlans();
  }, [activeTab]);

  const loadPlans = async () => {
    setIsLoading(true);
    try {
      const allPlans = await SubscriptionPlan.list('-created_date');
      // Converter o tipo do plano para o formato correto
      const filteredPlans = allPlans.filter(plan => {
        switch (activeTab) {
          case 'tourist':
            return plan.plan_type === 'tourist';
          case 'business':
            return plan.plan_type === 'business';
          case 'provider':
            return plan.plan_type === 'provider';
          case 'imobiliaria':
            return plan.plan_type === 'imobiliaria';
          case 'all':
            return true;
          default:
            return false;
        }
      });
      
      console.log("Planos filtrados:", filteredPlans); // Debug
      setPlans(filteredPlans);
    } catch (error) {
      console.error("Erro ao carregar planos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os planos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const mockUsers = [
        { id: "user1", full_name: "João Silva", email: "joao.silva@exemplo.com" },
        { id: "user2", full_name: "Maria Oliveira", email: "maria.o@exemplo.com" },
        { id: "user3", full_name: "Carlos Ferreira", email: "carlos.f@exemplo.com" },
        { id: "user4", full_name: "Ana Souza", email: "ana.souza@exemplo.com" },
        { id: "user5", full_name: "Pedro Santos", email: "pedro.s@exemplo.com" }
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    }
  };

  const loadSubscriptions = async () => {
    try {
      const mockSubscriptions = [
        {
          id: "sub1", 
          user_id: "user1", 
          user_name: "João Silva", 
          plan_id: "plan1", 
          plan_name: "Plano Premium", 
          start_date: "2023-01-15", 
          end_date: "2024-01-15", 
          status: "active", 
          payment_status: "completed", 
          payment_method: "credit_card"
        },
        {
          id: "sub2", 
          user_id: "user2", 
          user_name: "Maria Oliveira", 
          plan_id: "plan2", 
          plan_name: "Plano Familiar", 
          start_date: "2023-02-20", 
          end_date: "2024-02-20", 
          status: "active", 
          payment_status: "completed", 
          payment_method: "pix"
        },
        {
          id: "sub3", 
          user_id: "user3", 
          user_name: "Carlos Ferreira", 
          plan_id: "plan1", 
          plan_name: "Plano Premium", 
          start_date: "2023-03-05", 
          end_date: "2023-12-05", 
          status: "expired", 
          payment_status: "completed", 
          payment_method: "boleto"
        }
      ];
      setSubscriptions(mockSubscriptions);
    } catch (error) {
      console.error("Erro ao carregar assinaturas:", error);
    }
  };

  const loadPendingPayments = () => {
    const mockNames = [
      "João Silva", "Maria Oliveira", "Carlos Santos", "Ana Ferreira", "Pedro Costa",
      "Luiza Mendes", "Rafael Lima", "Juliana Carvalho", "Bruno Alves", "Camila Rodrigues",
      "Marcos Ribeiro", "Fernanda Gomes", "Lucas Martins", "Beatriz Sousa", "Thiago Pereira",
      "Larissa Barbosa", "Gabriel Almeida", "Amanda Cardoso", "Gustavo Torres", "Carolina Melo",
      "Diego Correia", "Natália Dias", "Vinícius Moraes", "Patrícia Nunes", "Henrique Campos",
      "Débora Lopes", "Alexandre Pinto", "Cristina Araujo"
    ];

    const mockPlans = ["Plano Turista", "Plano Premium", "Plano Familiar", "Plano Empresarial"];
    const mockValues = [29.90, 49.90, 79.90, 99.90, 149.90];
    const mockMethods = ["credit_card", "pix", "boleto", "paypal"];

    const generateMockPayments = () => {
      return Array.from({ length: 28 }, (_, index) => {
        const randomDate = new Date();
        randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 10));
        
        return {
          id: `pay${index + 1}`,
          user_id: `user${index + 1}`,
          user_name: mockNames[index % mockNames.length],
          plan_id: `plan${(index % 4) + 1}`,
          plan_name: mockPlans[index % mockPlans.length],
          amount: mockValues[index % mockValues.length],
          date: format(randomDate, "yyyy-MM-dd"),
          payment_method: mockMethods[index % mockMethods.length],
          status: "pending",
          description: `Pagamento da mensalidade - ${mockPlans[index % mockPlans.length]}`
        };
      });
    };

    setPendingPayments(generateMockPayments());
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await loadUsers();
      await loadSubscriptions();
      loadPendingPayments();
      setIsLoading(false);
    };

    loadData();
  }, [activeTab]);

  useEffect(() => {
    if (showPendingPaymentsParam === 'true') {
      setActiveSubTab('subscriptions');
      
      setTimeout(() => {
        const pendingPaymentsSection = document.getElementById('pending-payments-section');
        if (pendingPaymentsSection) {
          pendingPaymentsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  }, [showPendingPaymentsParam]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: value 
    });
  };

  const handleCheckboxChange = (name) => {
    setFormData({
      ...formData, 
      [name]: !formData[name] 
    });
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()]
      });
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures.splice(index, 1);
    setFormData({ ...formData, features: updatedFeatures });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      period: "mensal",
      features: [],
      discount_percentage: "",
      image_url: "",
      payment_link: "",
      badge_color: "#007BFF",
      is_featured: false,
      is_active: true,
      position: plans.length,
      plan_type: activeTab,
      stripe_product_id: "",
      stripe_price_id: ""
    });
    setEditMode(false);
    setCurrentPlanId(null);
    setUploadedImage(null);
    setUploadPreview(null);
    setNewFeature("");
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.price || !formData.period) {
        alert("Preencha todos os campos obrigatórios (Nome, Preço e Período).");
        return;
      }

      const planData = {
        ...formData,
        price: parseFloat(formData.price),
        discount_percentage: formData.discount_percentage 
          ? parseFloat(formData.discount_percentage) 
          : 0
      };

      if (uploadedImage) {
        setIsUploading(true);
        try {
          const result = await UploadFile({ file: uploadedImage });
          if (result && result.file_url) {
            planData.image_url = result.file_url;
          }
        } catch (error) {
          console.error("Erro ao fazer upload da imagem:", error);
          alert("Erro ao fazer upload da imagem. Tente novamente.");
        } finally {
          setIsUploading(false);
        }
      }

      if (editMode && currentPlanId) {
        await SubscriptionPlan.update(currentPlanId, planData);
      } else {
        await SubscriptionPlan.create(planData);
      }

      await loadPlans();
      resetForm();
      handleCloseDialog();
    } catch (error) {
      console.error("Erro ao salvar plano:", error);
      alert("Erro ao salvar plano. Tente novamente.");
    }
  };

  const openEditForm = (plan) => {
    const features = Array.isArray(plan.features) ? plan.features : [];
    
    setFormData({
      name: plan.name || "",
      description: plan.description || "",
      price: plan.price?.toString() || "",
      period: plan.period || "mensal",
      features: features,
      discount_percentage: plan.discount_percentage?.toString() || "",
      image_url: plan.image_url || "",
      payment_link: plan.payment_link || "",
      badge_color: plan.badge_color || "#007BFF",
      is_featured: plan.is_featured || false,
      is_active: plan.is_active !== false,
      position: plan.position || 0,
      plan_type: plan.plan_type || activeTab,
      stripe_product_id: plan.stripe_product_id || "",
      stripe_price_id: plan.stripe_price_id || ""
    });
    
    setEditMode(true);
    setCurrentPlanId(plan.id);
    setIsDialogOpen(true);
    
    setUploadedImage(null);
    setUploadPreview(null);
  };

  const handleDeletePlan = (plan) => {
    setPlanToDelete(plan);
  };

  const confirmDeletePlan = async () => {
    if (planToDelete && planToDelete.id) {
      try {
        await SubscriptionPlan.delete(planToDelete.id);
        await loadPlans();
        setPlanToDelete(null);
      } catch (error) {
        console.error("Erro ao excluir plano:", error);
        alert("Erro ao excluir plano. Tente novamente.");
      }
    }
  };

  const movePlanPosition = async (plan, direction) => {
    const currentPosition = plan.position || 0;
    const newPosition = direction === "up" ? currentPosition + 1 : currentPosition - 1;
    
    if (newPosition < 0) return;
    
    try {
      await SubscriptionPlan.update(plan.id, { position: newPosition });
      await loadPlans();
    } catch (error) {
      console.error("Erro ao mover posição do plano:", error);
    }
  };

  const handleOpenPaymentDialog = () => {
    setNewPaymentData({
      user_id: "",
      user_name: "",
      plan_id: "",
      plan_name: "",
      amount: "",
      date: format(new Date(), "yyyy-MM-dd"),
      payment_method: "credit_card",
      description: ""
    });
    setIsPaymentDialogOpen(true);
  };

  const handleClosePaymentDialog = () => {
    setIsPaymentDialogOpen(false);
  };

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    setNewPaymentData({ ...newPaymentData, [name]: value });
  };

  const handleUserSelect = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setNewPaymentData({
        ...newPaymentData,
        user_id: userId,
        user_name: user.full_name
      });
    }
  };

  const handlePlanSelect = (planId) => {
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      setNewPaymentData({
        ...newPaymentData,
        plan_id: planId,
        plan_name: plan.name,
        amount: plan.price.toString()
      });
    }
  };

  const handleSubmitNewPayment = () => {
    if (!newPaymentData.user_id || !newPaymentData.plan_id || !newPaymentData.amount) {
      alert("Preencha todos os campos obrigatórios (Usuário, Plano e Valor).");
      return;
    }

    const newPayment = {
      id: `pay${Date.now()}`,
      ...newPaymentData,
      amount: parseFloat(newPaymentData.amount),
      status: "pending"
    };

    setPendingPayments([newPayment, ...pendingPayments]);
    handleClosePaymentDialog();
  };

  const handleApprovePayment = (payment) => {
    setPaymentToProcess(payment);
    setAlertAction("approve");
    setAlertMessage(`Confirmar aprovação do pagamento de ${payment.user_name}?`);
    setIsAlertDialogOpen(true);
  };

  const handleRejectPayment = (payment) => {
    setPaymentToProcess(payment);
    setAlertAction("reject");
    setAlertMessage(`Confirmar rejeição do pagamento de ${payment.user_name}?`);
    setIsAlertDialogOpen(true);
  };

  const processPayment = async () => {
    setIsProcessingPayment(true);
    
    try {
      if (!paymentToProcess) return;
      
      if (alertAction === "approve") {
        const today = new Date();
        const endDate = new Date();
        
        const plan = plans.find(p => p.id === paymentToProcess.plan_id);
        if (plan) {
          switch (plan.period) {
            case "mensal":
              endDate.setMonth(today.getMonth() + 1);
              break;
            case "trimestral":
              endDate.setMonth(today.getMonth() + 3);
              break;
            case "semestral":
              endDate.setMonth(today.getMonth() + 6);
              break;
            case "anual":
              endDate.setFullYear(today.getFullYear() + 1);
              break;
            default:
              endDate.setMonth(today.getMonth() + 1);
          }
        }

        const newSubscription = {
          id: `sub${Date.now()}`,
          user_id: paymentToProcess.user_id,
          user_name: paymentToProcess.user_name,
          plan_id: paymentToProcess.plan_id,
          plan_name: paymentToProcess.plan_name,
          start_date: format(today, "yyyy-MM-dd"),
          end_date: format(endDate, "yyyy-MM-dd"),
          status: "active",
          payment_status: "completed",
          payment_method: paymentToProcess.payment_method
        };

        setSubscriptions([newSubscription, ...subscriptions]);
      }

      setPendingPayments(pendingPayments.filter(p => p.id !== paymentToProcess.id));
      
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      alert("Erro ao processar pagamento. Tente novamente.");
    } finally {
      setIsProcessingPayment(false);
      setIsAlertDialogOpen(false);
      setPaymentToProcess(null);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = 
      sub.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.plan_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const filteredPayments = pendingPayments.filter(payment => 
    payment.user_name.toLowerCase().includes(searchPaymentTerm.toLowerCase()) ||
    payment.plan_name.toLowerCase().includes(searchPaymentTerm.toLowerCase())
  );

  const handleGoBack = () => {
    navigate(createPageUrl("Dashboard"));
  };

  const configureStripe = async (plan) => {
    setSelectedPlan(plan);
    setStripeForm({ stripe_price_id: plan.stripe_price_id || "" });
    setStripeConfigDialogOpen(true);
  };

  const renderPlanCard = (plan) => {
    return (
      <Card key={plan.id} className="border border-gray-200 hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="mt-2 text-xl">{plan.name}</CardTitle>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
          <p className="text-2xl font-bold text-[#007BFF]">
            R$ {parseFloat(plan.price).toFixed(2)}
          </p>
          
          {!plan.stripe_price_id && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Pagamento online não configurado
              </p>
            </div>
          )}

          {plan.stripe_price_id && !plan.stripe_price_id.startsWith('price_') && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                ID do preço inválido. Use o ID que começa com "price_"
              </p>
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          <div className="flex justify-between items-center w-full">
            <div className="flex space-x-1">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => movePlanPosition(plan, "up")}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => movePlanPosition(plan, "down")}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => configureStripe(plan)}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Configurar Stripe
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => openEditForm(plan)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => handleDeletePlan(plan)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="container p-4 mx-auto max-w-6xl">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleGoBack}
                className="text-gray-500 hover:text-[#007BFF]"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Voltar
              </Button>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold" style={{fontFamily: "'Montserrat', sans-serif"}}>
              Planos e Assinaturas
            </h1>
            <p className="text-gray-500">Gerencie os planos de assinatura e monitorize os assinantes.</p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex items-center"
              onClick={() => navigate(createPageUrl("SubscriptionPlans"))}
            >
              <Download className="w-4 h-4 mr-2" />
              Ver Página Pública
            </Button>
            <Button variant="outline" className="flex items-center" onClick={() => loadPlans()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button className="bg-[#007BFF] hover:bg-blue-700" onClick={handleOpenDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Plano
            </Button>
          </div>
        </div>
      </header>
      
      <div className="flex space-x-2 mb-4">
        <button 
          className={`px-4 py-2 rounded-lg ${activeTab === 'tourist' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          onClick={() => setActiveTab('tourist')}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Turistas
        </button>
        
        <button 
          className={`px-4 py-2 rounded-lg ${activeTab === 'business' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          onClick={() => setActiveTab('business')}
        >
          <Building className="w-4 h-4 inline mr-2" />
          Comércios
        </button>
        
        <button 
          className={`px-4 py-2 rounded-lg ${activeTab === 'provider' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          onClick={() => setActiveTab('provider')}
        >
          <Wrench className="w-4 h-4 inline mr-2" />
          Prestadores
        </button>
        
        <button 
          className={`px-4 py-2 rounded-lg ${activeTab === 'imobiliaria' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          onClick={() => setActiveTab('imobiliaria')}
        >
          <Home className="w-4 h-4 inline mr-2" />
          Imobiliárias
        </button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="w-full md:w-auto bg-gray-100">
          <TabsTrigger value="tourist" className="flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Turistas
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Comércios
          </TabsTrigger>
          <TabsTrigger value="provider" className="flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Prestadores
          </TabsTrigger>
          <TabsTrigger value="imobiliaria" className="flex items-center">
            <Home className="w-4 h-4 mr-2" />
            Imobiliárias
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
            <TabsList className="w-full md:w-auto bg-gray-100">
              <TabsTrigger value="plans" className="flex items-center">
                <Crown className="w-4 h-4 mr-2" />
                Planos
              </TabsTrigger>
              <TabsTrigger value="subscriptions" className="flex items-center">
                <CreditCard className="w-4 h-4 mr-2" />
                Assinaturas
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="plans" className="mt-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <RefreshCw className="w-8 h-8 animate-spin text-[#007BFF]" />
                </div>
              ) : plans.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Crown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600">Nenhum plano encontrado</h3>
                  <p className="text-gray-500 max-w-md mx-auto mt-2">
                    Não há planos cadastrados para o tipo selecionado. Clique em "Novo Plano" para criar.
                  </p>
                  <Button className="mt-4 bg-[#007BFF]" onClick={handleOpenDialog}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Plano
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {plans.map((plan) => renderPlanCard(plan))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="subscriptions" className="mt-6">
              <div className="space-y-6">
                <div id="pending-payments-section" className="bg-[#FFF8E1] border border-[#FFECB3] rounded-lg p-4 mb-6">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
                    <div className="flex items-center mb-3 lg:mb-0">
                      <AlertTriangle className="w-5 h-5 text-[#FF5722] mr-2" />
                      <h2 className="text-lg font-semibold text-[#E65100]">
                        Pagamentos Pendentes ({pendingPayments.length})
                      </h2>
                    </div>
                    <Button 
                      onClick={handleOpenPaymentDialog}
                      className="bg-[#007BFF] hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Pagamento
                    </Button>
                  </div>
                  <p className="text-[#E65100] mt-1 mb-4">
                    Aprove ou rejeite pagamentos pendentes de assinaturas
                  </p>

                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="search"
                        placeholder="Buscar pagamentos pendentes..."
                        className="pl-9 bg-white"
                        value={searchPaymentTerm}
                        onChange={(e) => setSearchPaymentTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
                          <tr>
                            <th className="px-4 py-3">Usuário</th>
                            <th className="px-4 py-3">Plano</th>
                            <th className="px-4 py-3">Valor</th>
                            <th className="px-4 py-3">Data</th>
                            <th className="px-4 py-3">Método</th>
                            <th className="px-4 py-3 text-center">Ação</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingPayments.length > 0 ? (
                            pendingPayments
                              .filter(payment => 
                                payment.user_name.toLowerCase().includes(searchPaymentTerm.toLowerCase()) ||
                                payment.plan_name.toLowerCase().includes(searchPaymentTerm.toLowerCase())
                              )
                              .map((payment, index) => (
                                <tr key={index} className="border-b hover:bg-gray-50">
                                  <td className="px-4 py-3">{payment.user_name}</td>
                                  <td className="px-4 py-3">{payment.plan_name}</td>
                                  <td className="px-4 py-3">R$ {parseFloat(payment.amount).toFixed(2)}</td>
                                  <td className="px-4 py-3">
                                    {format(new Date(payment.date), 'dd/MM/yyyy')}
                                  </td>
                                  <td className="px-4 py-3">
                                    <Badge variant="outline" className="font-normal">
                                      {paymentMethods.find(m => m.value === payment.payment_method)?.label || payment.payment_method}
                                    </Badge>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex justify-center gap-2">
                                      <Button
                                        size="sm"
                                        className="bg-[#4CAF50] hover:bg-green-600"
                                        onClick={() => handleApprovePayment(payment)}
                                      >
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        Aprovar
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-[#FF0000] text-[#FF0000] hover:bg-red-50"
                                        onClick={() => handleRejectPayment(payment)}
                                      >
                                        <XCircle className="w-4 h-4 mr-1" />
                                        Rejeitar
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                          ) : (
                            <tr>
                              <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                                Não há pagamentos pendentes no momento.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle>Assinaturas</CardTitle>
                      <div className="flex items-center gap-2">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filtrar por status" />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentStatuses.map(status => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" onClick={() => loadSubscriptions()}>
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      Visualize e gerencie as assinaturas dos usuários
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="mb-4">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                          className="pl-9 bg-white"
                          placeholder="Buscar assinaturas..."
                          value={searchTerm}
                          onChange={handleSearchChange}
                        />
                      </div>
                    </div>
                    
                    {isLoading ? (
                      <div className="flex items-center justify-center h-40">
                        <RefreshCw className="w-8 h-8 animate-spin text-[#007BFF]" />
                      </div>
                    ) : filteredSubscriptions.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-600">Nenhuma assinatura encontrada</h3>
                        <p className="text-gray-500 max-w-md mx-auto mt-2">
                          Não há assinaturas para o filtro selecionado.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gray-50 text-left">
                                <th className="px-4 py-3 font-medium text-gray-600">Usuário</th>
                                <th className="px-4 py-3 font-medium text-gray-600">Plano</th>
                                <th className="px-4 py-3 font-medium text-gray-600">Início</th>
                                <th className="px-4 py-3 font-medium text-gray-600">Vencimento</th>
                                <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                                <th className="px-4 py-3 font-medium text-gray-600">Pagamento</th>
                                <th className="px-4 py-3 font-medium text-gray-600 text-right">Ações</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {filteredSubscriptions.map((sub) => (
                                <tr key={sub.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-3">{sub.user_name}</td>
                                  <td className="px-4 py-3">{sub.plan_name}</td>
                                  <td className="px-4 py-3">{format(new Date(sub.start_date), "dd/MM/yyyy")}</td>
                                  <td className="px-4 py-3">{format(new Date(sub.end_date), "dd/MM/yyyy")}</td>
                                  <td className="px-4 py-3">
                                    <Badge>{sub.status}</Badge>
                                  </td>
                                  <td className="px-4 py-3">
                                    <Badge>{sub.payment_status}</Badge>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="text-[#007BFF] border-blue-200 hover:bg-blue-50"
                                    >
                                      <Edit className="w-4 h-4 mr-1" />
                                      <span>Detalhes</span>
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Tabs>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editMode ? "Editar Plano" : "Novo Plano"}</DialogTitle>
            <DialogDescription>
              Preencha os detalhes do plano de assinatura abaixo.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Plano</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ex.: Plano Premium"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Preço (R$)</Label>
                <Input
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="29.90"
                  type="number"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descreva os benefícios deste plano..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="period">Período</Label>
                <Select
                  name="period"
                  value={formData.period}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, period: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.map(period => (
                      <SelectItem key={period.value} value={period.value}>{period.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan_type">Tipo de Plano</Label>
                <Select
                  name="plan_type"
                  value={formData.plan_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, plan_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {planTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="w-4 h-4" />
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="features">Benefícios</Label>
              <div className="flex gap-2">
                <Input
                  id="newFeature"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Ex.: Acesso a todas as praias"
                  className="flex-1"
                />
                <Button type="button" onClick={handleAddFeature}>
                  Adicionar
                </Button>
              </div>
              
              <div className="mt-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 py-2 border-b">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="flex-1">{feature}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-red-500"
                      onClick={() => handleRemoveFeature(index)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="discount_percentage">Desconto (%)</Label>
              <Input
                id="discount_percentage"
                name="discount_percentage"
                value={formData.discount_percentage}
                onChange={handleInputChange}
                placeholder="5"
                type="number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="badge_color">Cor do Badge</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="badge_color"
                  name="badge_color"
                  value={formData.badge_color}
                  onChange={handleInputChange}
                  className="w-10 h-10 rounded"
                />
                <Input
                  value={formData.badge_color}
                  onChange={handleInputChange}
                  name="badge_color"
                  placeholder="#007BFF"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image_url">Imagem do Plano</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="flex-1"
                />
                <span className="text-gray-400">ou</span>
                <Input
                  id="image_upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="flex-1"
                />
              </div>
              
              {(uploadPreview || formData.image_url) && (
                <div className="mt-2 relative w-full h-40 bg-gray-100 rounded-md overflow-hidden">
                  <img
                    src={uploadPreview || formData.image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment_link">Link de Pagamento</Label>
              <Input
                id="payment_link"
                name="payment_link"
                value={formData.payment_link}
                onChange={handleInputChange}
                placeholder="https://exemplo.com/pagamento"
              />
              <p className="text-sm text-gray-500">
                Link direto para pagamento (ex: MercadoPago, PagSeguro)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stripe_price_id">ID do Preço Stripe</Label>
              <Input
                id="stripe_price_id"
                name="stripe_price_id"
                value={formData.stripe_price_id}
                onChange={handleInputChange}
                placeholder="price_1234567890"
              />
              <p className="text-sm text-gray-500">
                ID do preço configurado no painel Stripe (começa com "price_")
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={() => handleCheckboxChange("is_featured")}
                />
                <Label htmlFor="is_featured" className="cursor-pointer">
                  Plano em destaque
                </Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={() => handleCheckboxChange("is_active")}
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  Plano ativo
                </Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isUploading}
              className="bg-[#007BFF] hover:bg-blue-700"
            >
              {isUploading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
              {editMode ? "Atualizar Plano" : "Criar Plano"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!planToDelete} onOpenChange={() => setPlanToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o plano "{planToDelete?.name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeletePlan}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Excluir Plano
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar Pagamento Pendente</DialogTitle>
            <DialogDescription>
              Preencha os detalhes do pagamento para adicionar à lista de pendentes.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="user_id">Usuário</Label>
              <Select value={newPaymentData.user_id} onValueChange={handleUserSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o usuário" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="plan_id">Plano</Label>
              <Select value={newPaymentData.plan_id} onValueChange={handlePlanSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o plano" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - R$ {parseFloat(plan.price).toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                name="amount"
                value={newPaymentData.amount}
                onChange={handlePaymentInputChange}
                placeholder="49.90"
                type="number"
                step="0.01"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Data do Pagamento</Label>
              <Input
                id="date"
                name="date"
                value={newPaymentData.date}
                onChange={handlePaymentInputChange}
                type="date"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment_method">Método de Pagamento</Label>
              <Select
                value={newPaymentData.payment_method}
                onValueChange={(value) => setNewPaymentData({ ...newPaymentData, payment_method: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o método" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map(method => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Input
                id="description"
                name="description"
                value={newPaymentData.description}
                onChange={handlePaymentInputChange}
                placeholder="Pagamento da mensalidade - Plano Premium"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleClosePaymentDialog}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmitNewPayment}
              className="bg-[#007BFF] hover:bg-blue-700"
            >
              Adicionar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {alertAction === "approve" ? "Aprovar Pagamento" : "Rejeitar Pagamento"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {alertMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={processPayment}
              className={`${
                alertAction === "approve" 
                  ? "bg-[#4CAF50] hover:bg-green-600" 
                  : "bg-[#FF0000] hover:bg-red-600"
              } text-white`}
            >
              {isProcessingPayment && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
              {alertAction === "approve" ? "Sim, Aprovar" : "Sim, Rejeitar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {stripeConfigDialogOpen && selectedPlan && (
        <Dialog open={stripeConfigDialogOpen} onOpenChange={setStripeConfigDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Configurar Stripe para {selectedPlan.name}</DialogTitle>
              <DialogDescription>
                Configure os IDs do Stripe para habilitar pagamentos online
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                if (!stripeForm.stripe_price_id.startsWith('price_')) {
                  toast({
                    title: "ID inválido",
                    description: "O ID do preço deve começar com 'price_'",
                    variant: "destructive"
                  });
                  return;
                }

                await SubscriptionPlan.update(selectedPlan.id, {
                  stripe_price_id: stripeForm.stripe_price_id
                });
                
                toast({
                  title: "Sucesso",
                  description: "Configuração do Stripe salva com sucesso"
                });
                
                setStripeConfigDialogOpen(false);
                loadPlans();
              } catch (error) {
                console.error("Erro ao salvar:", error);
                toast({
                  title: "Erro",
                  description: "Não foi possível salvar as configurações",
                  variant: "destructive"
                });
              }
            }}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="stripe_price_id">ID do Preço no Stripe</Label>
                  <Input
                    id="stripe_price_id"
                    value={stripeForm.stripe_price_id}
                    onChange={(e) => setStripeForm({ stripe_price_id: e.target.value })}
                    placeholder="price_..."
                  />
                  <p className="text-sm text-gray-500">
                    ID do preço encontrado no painel do Stripe (deve começar com "price_")
                  </p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-md">
                  <h4 className="font-medium text-blue-800 mb-2">Como encontrar o ID do preço:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-blue-700 text-sm">
                    <li>Acesse o painel do Stripe</li>
                    <li>Vá em "Produtos"</li>
                    <li>Encontre o produto correspondente a este plano</li>
                    <li>Na seção "Preços", copie o ID que começa com "price_"</li>
                  </ol>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setStripeConfigDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={!stripeForm.stripe_price_id.startsWith('price_')}
                >
                  Salvar Configuração
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
