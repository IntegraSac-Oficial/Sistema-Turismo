
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Building2, Waves, Store, Users, Wrench, BarChart4, TrendingUp, 
  MessageSquare, CreditCard, DollarSign, Calendar, PieChart,
  ArrowUpCircle, Hammer, Paintbrush, Activity, BellRing,
  Briefcase, Zap, Star, RefreshCw, Bell, Plus, Search, 
  Crown, Settings, HelpCircle, ExternalLink, UserPlus, Globe,
  Menu, X, ChevronDown, Download, ChevronUp, Filter, AlertTriangle,
  CheckCircle2, Clock, ArrowDown, Sparkles, Sun, ArrowRight,
  User as UserIconLucide,
  Image, Mail, Lock, Shield, Home,
  LayoutDashboard
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from "recharts";

import { City } from "@/api/entities";
import { Beach } from "@/api/entities";
import { Business } from "@/api/entities";
import { ServiceProvider } from "@/api/entities";
import { Tourist } from "@/api/entities";
import { Review } from "@/api/entities";
import { UserSubscription } from "@/api/entities";
import { User } from "@/api/entities";
import { SubscriptionPlan } from "@/api/entities";
import { Property } from "@/api/entities";
import { Realtor } from "@/api/entities";
import ProfileImageDialog from "@/components/admin/ProfileImageDialog";
import NameDialog from "@/components/admin/NameDialog";
import EmailDialog from "@/components/admin/EmailDialog";
import PasswordDialog from "@/components/admin/PasswordDialog";
import ExportDataButton from "@/components/admin/ExportDataButton";
import { toast } from "@/components/ui/use-toast";
// Remover AdminNavigation daqui, pois o Dashboard principal terá sua própria navegação.
// import AdminNavigation from '@/components/admin/AdminNavigation'; 

export default function Dashboard() {
  const [stats, setStats] = useState({
    cities: 0,
    beaches: 0,
    businesses: 0,
    serviceProviders: 0,
    tourists: 0,
    clubMembers: 0,
    reviews: 0,
    subscriptions: 0,
    properties: 0,
    realtors: 0,
    conversionRate: 0,
    totalRevenue: 0,
    serviceProvidersByType: {},
    payments: {
      pending: 0,
      completed: 0,
      failed: 0
    },
    cancellationRate: 0,
    monthlyGrowth: 0
  });
  
  const [timeFilter, setTimeFilter] = useState("month");
  const [dateRangeFilter, setDateRangeFilter] = useState("last30");
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [revenueData, setRevenueData] = useState([]);
  const [membershipData, setMembershipData] = useState([]);
  const [serviceTypeData, setServiceTypeData] = useState([]);
  
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showPendingTasks, setShowPendingTasks] = useState(true);
  const [showProfileConfig, setShowProfileConfig] = useState(false);
  const [showProfileImageDialog, setShowProfileImageDialog] = useState(false);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showFinanceMenu, setShowFinanceMenu] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState("overview"); // Para a navegação principal
  
  const COLORS = ['#007BFF', '#FF5722', '#FFC107', '#4CAF50', '#9C27B0'];

  const navigate = useNavigate();
  
  const generateMockChartData = useCallback(() => {
    let dataPoints = 0;
    
    switch (timeFilter) {
      case "day":
        dataPoints = 24;
        break;
      case "week":
        dataPoints = 7;
        break;
      case "month":
        dataPoints = 30;
        break;
      case "semester":
        dataPoints = 6;
        break;
      case "year":
        dataPoints = 12;
        break;
      default:
        dataPoints = 30;
    }
    
    const revenue = Array.from({ length: dataPoints }, (_, i) => ({
      name: `Ponto ${i + 1}`,
      receita: Math.floor(Math.random() * 5000) + 2000,
      membros: Math.floor(Math.random() * 50) + 10,
    }));
    
    setRevenueData(revenue);
    
    const memberJoins = Array.from({ length: dataPoints }, (_, i) => ({
      name: `Ponto ${i + 1}`,
      novos: Math.floor(Math.random() * 30) + 5,
      cancelamentos: Math.floor(Math.random() * 10),
    }));
    
    setMembershipData(memberJoins);
  }, [timeFilter]);
  
  const loadStats = useCallback(async () => {
    if (!isRefreshing) {
        setIsLoading(true);
    }

    try {
      console.log("Iniciando carregamento de dados do dashboard...");
      
      const citiesData = await City.list().catch(err => {
        console.error("Erro ao carregar cidades:", err);
        return [];
      });
      
      const beachesData = await Beach.list().catch(err => {
        console.error("Erro ao carregar praias:", err);
        return [];
      });
      
      const businessesData = await Business.list().catch(err => {
        console.error("Erro ao carregar comércios:", err);
        return [];
      });
      
      const providersData = await ServiceProvider.list().catch(err => {
        console.error("Erro ao carregar prestadores:", err);
        return [];
      });
      
      const touristsData = await Tourist.list().catch(err => {
        console.error("Erro ao carregar turistas:", err);
        return [];
      });
      
      const reviewsData = await Review.list().catch(err => {
        console.error("Erro ao carregar avaliações:", err);
        return [];
      });
      
      const activeUserSubscriptions = await UserSubscription.filter({ status: 'active' }).catch(err => {
        console.error("Erro ao carregar assinaturas:", err);
        return [];
      });
      
      const allSubscriptionPlans = await SubscriptionPlan.list().catch(err => {
        console.error("Erro ao carregar planos:", err);
        return [];
      });
      
      const propertiesData = await Property.list().catch(err => {
        console.error("Erro ao carregar imóveis:", err);
        return [];
      });
      
      const realtorsData = await Realtor.list().catch(err => {
        console.error("Erro ao carregar corretores:", err);
        return [];
      });
      
      const allUsersData = await User.list().catch(err => {
        console.error("Erro ao carregar usuários:", err);
        return [];
      });

      console.log("Dados carregados:", {
        cities: citiesData.length,
        beaches: beachesData.length,
        businesses: businessesData.length,
        providers: providersData.length,
        tourists: touristsData.length,
        reviews: reviewsData.length,
        subscriptions: activeUserSubscriptions.length,
        properties: propertiesData.length,
        realtors: realtorsData.length,
        users: allUsersData.length
      });

      const clubMembersCount = touristsData.filter(t => t.is_club_member).length;
      
      const totalUsersCount = allUsersData.length;
      const conversionRateValue = totalUsersCount > 0 
        ? (clubMembersCount / totalUsersCount) * 100 
        : 0;
      
      const serviceProvidersByTypeData = {};
      providersData.forEach(provider => {
        if (!serviceProvidersByTypeData[provider.service_type]) {
          serviceProvidersByTypeData[provider.service_type] = 0;
        }
        serviceProvidersByTypeData[provider.service_type]++;
      });

      let currentTotalRevenue = 0;
      activeUserSubscriptions.forEach(sub => {
        const plan = allSubscriptionPlans.find(p => p.id === sub.plan_id);
        if (plan) {
          currentTotalRevenue += plan.price || 0;
        }
      });

      const pendingPayments = activeUserSubscriptions.filter(sub => 
        sub.payment_status === 'pending').length;
        
      const completedPayments = activeUserSubscriptions.filter(sub => 
        sub.payment_status === 'completed').length;
        
      const failedPayments = activeUserSubscriptions.filter(sub => 
        sub.payment_status === 'failed').length;

      setStats({
        cities: citiesData.length,
        beaches: beachesData.length,
        businesses: businessesData.length,
        serviceProviders: providersData.length,
        tourists: touristsData.length,
        clubMembers: clubMembersCount,
        reviews: reviewsData.length,
        subscriptions: activeUserSubscriptions.length,
        properties: propertiesData.length,
        realtors: realtorsData.length,
        conversionRate: conversionRateValue.toFixed(1),
        totalRevenue: currentTotalRevenue.toFixed(2),
        serviceProvidersByType: serviceProvidersByTypeData,
        payments: {
          pending: pendingPayments,
          completed: completedPayments,
          failed: failedPayments
        },
        cancellationRate: 0,
        monthlyGrowth: 0
      });

      const serviceTypes = Object.keys(serviceProvidersByTypeData);
      setServiceTypeData(serviceTypes.map(type => ({
        name: formatServiceType(type),
        value: serviceProvidersByTypeData[type]
      })));

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Erro crítico ao carregar estatísticas:", error);
      toast({
        title: "Erro ao carregar estatísticas",
        description: "Não foi possível buscar os dados mais recentes do dashboard.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  const loadNotifications = useCallback(async () => {
    try {
      const mockSubscriptions = [
        { user_data: { full_name: "Ana Silva" }, plan_data: { name: "Premium" }, created_date: new Date(Date.now() - Math.random() * 1000 * 60 * 60).toISOString(), status: 'active', read: false },
        { user_data: { full_name: "Carlos Pereira" }, plan_data: { name: "Básico" }, created_date: new Date(Date.now() - Math.random() * 1000 * 60 * 120).toISOString(), status: 'pending', read: true },
        { user_data: { full_name: "Juliana Costa" }, plan_data: { name: "Pro" }, created_date: new Date(Date.now() - Math.random() * 1000 * 60 * 180).toISOString(), status: 'active', read: false },
      ];
      
      const newNotifications = mockSubscriptions.map(subscription => ({
        type: "subscription",
        icon: UserPlus,
        title: `${subscription.user_data?.full_name || 'Novo usuário'} aderiu ao plano ${subscription.plan_data?.name || 'Premium'}`,
        time: subscription.created_date,
        status: subscription.status,
        read: subscription.read,
        message: `Status: ${subscription.status}`
      }));

      setNotifications(newNotifications);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
      toast({
        title: "Erro ao carregar notificações",
        description: "Não foi possível buscar as últimas notificações.",
        variant: "destructive",
      });
    }
  }, []);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const userData = await User.me();
        setCurrentUser(userData);
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      }
    };
    
    loadCurrentUser();
    loadNotifications();

    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, [loadNotifications]);
  
  useEffect(() => {
    loadStats();
    generateMockChartData();
    
    const intervalId = setInterval(() => {
      loadStats();
      generateMockChartData();
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [loadStats, generateMockChartData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    console.log("Atualizando estatísticas do dashboard (manual)...");
    await loadStats();
    await loadNotifications();
    //setIsRefreshing(false); // loadStats já faz isso no finally
  };

  const formatServiceType = (type) => {
    const typeNames = {
      'pintor': 'Pintores',
      'diarista': 'Diaristas',
      'eletricista': 'Eletricistas',
      'pedreiro': 'Pedreiros',
      'outros': 'Outros'
    };
    
    return typeNames[type] || type;
  };

  const formatLastUpdated = () => {
    const options = { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit', 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    };
    return lastUpdated.toLocaleString('pt-BR', options);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const menuItems = [
    { name: "Visão Geral", icon: BarChart4, active: true, path: "Dashboard" },
    { name: "Admin", icon: Shield, active: false, path: "AdminDashboard" },
    { name: "Financeiro", icon: DollarSign, active: false, hasFinanceMenu: true },
    { name: "Planos", icon: Crown, active: false, path: "SubscriptionPlansAdmin", hasSubmenu: false },
    { name: "Eventos", icon: Calendar, active: false, path: "EventsAdmin", hasSubmenu: false },
    { name: "Configurações", icon: Settings, active: false, hasSubmenu: true },
    { name: "Config Admin", icon: UserIconLucide, active: false, hasConfigMenu: true },
  ];

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const handlePieChartClick = (data, index) => {
    console.log("Clicou na fatia:", data);
    alert(`Detalhes de ${data.name}: ${data.value} prestadores`);
  };

  const dateRangeOptions = [
    { value: "today", label: "Hoje" },
    { value: "last7", label: "Últimos 7 Dias" },
    { value: "last30", label: "Últimos 30 Dias" },
    { value: "custom", label: "Personalizado" }
  ];

  const pendingTasks = [
    { id: 1, title: "Confirmar 28 pagamentos", status: "urgent", category: "payment" },
    { id: 2, title: "Validar 47 novos usuários", status: "pending", category: "user" },
    { id: 3, title: "Revisar 15 avaliações denunciadas", status: "pending", category: "review" }
  ];

  const handleResolveTask = (taskId) => {
    switch (taskId) {
      case 1:
        navigate(createPageUrl("SubscriptionPlansAdmin") + "?tab=subscriptions&pendingPayments=true");
        break;
      case 2:
        navigate(createPageUrl("NonMembers") + "?filter=pending");
        break;
      case 3:
        navigate(createPageUrl("Reviews") + "?filter=reported");
        break;
      default:
        break;
    }
  };

  // Ajustar dashboardCards para não ter mais paths, pois a navegação será centralizada
  // ou o card inteiro será clicável
  const dashboardCards = [
    { title: "Cidades", value: isLoading ? "..." : stats.cities, icon: Building2, color: "from-[#007BFF] to-[#0069d9]", textColor: "text-white", entityName: "Cities" },
    { title: "Praias", value: isLoading ? "..." : stats.beaches, icon: Waves, color: "from-[#0091EA] to-[#0277BD]", textColor: "text-white", entityName: "Beaches" },
    { title: "Comércios", value: isLoading ? "..." : stats.businesses, icon: Store, color: "from-[#00BCD4] to-[#0097A7]", textColor: "text-white", entityName: "Businesses" },
    { title: "Prestadores", value: isLoading ? "..." : stats.serviceProviders, icon: Wrench, color: "from-[#4DB6AC] to-[#00897B]", textColor: "text-white", entityName: "ServiceProviders" },
    { title: "Imóveis", value: isLoading ? "..." : stats.properties, icon: Home, color: "from-[#8BC34A] to-[#689F38]", textColor: "text-white", entityName: "Properties" },
    { title: "Corretores", value: isLoading ? "..." : stats.realtors, icon: Briefcase, color: "from-[#FF9800] to-[#F57C00]", textColor: "text-white", entityName: "Realtors" }
  ];

  const handleCardClick = (entityName) => {
    if (entityName) {
      navigate(createPageUrl(entityName));
    }
  };

  // ITENS DO NOVO HEADER DE NAVEGAÇÃO PRINCIPAL
  const mainNavigationItems = [
    { name: "Visão Geral", icon: LayoutDashboard, tabKey: "overview", path: "Dashboard" },
    { name: "Estatísticas", icon: BarChart4, tabKey: "statistics", path: "Statistics" },
    { name: "Financeiro", icon: DollarSign, tabKey: "financial", path: "FinancialDashboard" },
    { name: "Assinaturas", icon: Users, tabKey: "subscriptions", path: "SubscriptionPlansAdmin" },
    { name: "Configurações", icon: Settings, tabKey: "settings", path: "SiteConfiguration" },
    { name: "Ajuda", icon: HelpCircle, tabKey: "help", path: "HelpPage" }
  ];

  return (
    <div className="p-2 md:p-6 bg-slate-50 min-h-screen">
      <div className="max-w-full mx-auto">
        {/* HEADER PRINCIPAL */}
        <div className="bg-white shadow-md rounded-lg mb-6">
          <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {/* Navegação Principal */}
            <div className="flex flex-wrap gap-1">
              {mainNavigationItems.map((item) => (
                <Button
                  key={item.tabKey}
                  variant={activeMainTab === item.tabKey ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setActiveMainTab(item.tabKey);
                    if (item.path && item.path !== "Dashboard") {
                      navigate(createPageUrl(item.path));
                    }
                  }}
                  className={`flex items-center gap-2 ${
                    activeMainTab === item.tabKey ? 'bg-[#007BFF] text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Button>
              ))}
            </div>

            {/* Ações e Perfil */}
            <div className="flex items-center gap-3">
              <Button 
                variant="outline"
                onClick={() => navigate("/Public")}
                className="bg-[#FF5722] hover:bg-[#E64A19] text-white"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Acessar o Site
              </Button>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="relative"
                      onClick={toggleNotifications}
                    >
                      <Bell className="h-5 w-5" />
                      {unreadNotificationsCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-[#FF5722] text-white text-xs w-4 h-4 flex items-center justify-center rounded-full animate-pulse">
                          {unreadNotificationsCount}
                        </span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{unreadNotificationsCount} novas notificações</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Avatar e Nome do Usuário */}
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{currentUser?.full_name?.[0] || 'A'}</AvatarFallback>
                  {currentUser?.avatar_url && (
                    <AvatarImage src={currentUser.avatar_url} alt={currentUser?.full_name} />
                  )}
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{currentUser?.full_name || 'Admin'}</p>
                  <p className="text-xs text-gray-500">in SE7E | aceleradora</p>
                </div>
              </div>
            </div>
          </div>

          {/* Barra de Ações do Header */}
          <div className="border-t p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center w-full md:w-auto gap-2">
              <Button variant="default" className="bg-[#FF5722] hover:bg-[#E64A19]">
                <Plus className="w-4 h-4 mr-2" />
                Novo Plano
              </Button>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Últimos 30 Dias" />
                </SelectTrigger>
                <SelectContent>
                  {dateRangeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>

              <span className="text-sm text-gray-500">
                Atualizado: {formatLastUpdated()}
              </span>
            </div>
          </div>
        </div>

        {/* CONTEÚDO DA ABA "VISÃO GERAL" */}
        {activeMainTab === 'overview' && (
          <>
            {/* ... (código das Pendências) ... */}
            {showPendingTasks && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-[#FFC107] mr-2" />
                    <h2 className="text-lg font-semibold text-amber-800" style={{fontFamily: "'Montserrat', sans-serif"}}>Pendências</h2>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowPendingTasks(false)}
                    className="text-amber-700 hover:bg-amber-100"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {pendingTasks.map(task => (
                    <div key={task.id} className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm border-l-4 border-amber-400">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-full ${
                          task.category === 'payment' ? 'bg-[#FF5722]/10' : 
                          task.category === 'user' ? 'bg-blue-100' : 
                          'bg-green-100'
                        }`}>
                          {task.category === 'payment' ? (
                            <DollarSign className="w-4 h-4 text-[#FF5722]" />
                          ) : task.category === 'user' ? (
                            <Users className="w-4 h-4 text-[#007BFF]" />
                          ) : (
                            <MessageSquare className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium">{task.title}</p>
                          <div className="flex items-center text-xs text-gray-500">
                            <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                              task.status === 'urgent' ? 'bg-red-500' : 'bg-amber-500'
                            }`}></span>
                            <span>{task.status === 'urgent' ? 'Urgente' : 'Pendente'}</span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        className="bg-[#FF5722] hover:bg-[#E64A19] text-white" 
                        size="sm"
                        onClick={() => handleResolveTask(task.id)}
                      >
                        Resolver Agora
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cards de Métricas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
              {/* Card Clube de Membros */}
              <Card className="bg-gradient-to-br from-[#E1F5FE] to-[#E3F2FD] shadow-md border border-blue-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[#007BFF] text-lg flex items-center gap-2">
                    <Sun className="w-5 h-5" />
                    Clube de Membros
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* ... keep existing code (conteúdo do card Clube de Membros, SEM o botão "Ver Detalhes") ... */}
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl md:text-3xl font-bold text-[#007BFF]">
                        {isLoading ? <span className="inline-block w-12 h-8 bg-blue-200 animate-pulse rounded"></span> : stats.clubMembers}
                      </p>
                      <p className="text-sm text-blue-600">membros ativos</p>
                    </div>
                    <div className="bg-white border border-blue-100 px-3 py-1 rounded-lg shadow-sm">
                      <p className="text-[#007BFF] font-medium flex items-center">
                        {isLoading ? <span className="inline-block w-12 h-6 bg-blue-200 animate-pulse rounded"></span> : <><ArrowUpCircle className="w-4 h-4 mr-1 text-green-600" />{`${stats.conversionRate}%`}</>}
                      </p>
                      <p className="text-xs text-blue-600">taxa de conversão</p>
                    </div>
                  </div>
                  {/* Botão "Ver Detalhes" removido daqui */}
                </CardContent>
              </Card>

              {/* Card Receita Total */}
              <Card className="bg-gradient-to-br from-[#E0F2F1] to-[#E8F5E9] shadow-md border border-green-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-green-800 text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Receita Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* ... keep existing code (conteúdo do card Receita Total, SEM o botão "Ver Detalhes") ... */}
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl md:text-3xl font-bold text-green-700">
                        {isLoading ? <span className="inline-block w-24 h-8 bg-green-200 animate-pulse rounded"></span> : `R$ ${stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      </p>
                      <p className="text-sm text-green-600">em assinaturas</p>
                    </div>
                    <div className="bg-white border border-green-100 px-3 py-1 rounded-lg shadow-sm">
                      <p className="text-green-800 font-medium flex items-center">
                        {isLoading ? <span className="inline-block w-8 h-6 bg-green-200 animate-pulse rounded"></span> : <><ArrowUpCircle className="w-4 h-4 mr-1 text-green-600" />{`+${stats.monthlyGrowth}%`}</>}
                      </p>
                      <p className="text-xs text-green-600">crescimento/mês</p>
                    </div>
                  </div>
                   {/* Botão "Ver Detalhes" removido daqui */}
                </CardContent>
              </Card>

              {/* Card Taxa de Cancelamento */}
              <Card className="bg-gradient-to-br from-[#FFF8E1] to-[#FFFDE7] shadow-md border border-yellow-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-amber-800 text-lg flex items-center gap-2">
                    <BellRing className="w-5 h-5" />
                    Taxa de Cancelamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* ... keep existing code (conteúdo do card Taxa de Cancelamento, SEM o botão "Ver Detalhes") ... */}
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl md:text-3xl font-bold text-amber-600">
                        {isLoading ? <span className="inline-block w-12 h-8 bg-amber-200 animate-pulse rounded"></span> : `${stats.cancellationRate}%`}
                      </p>
                      <p className="text-sm text-amber-700">dos assinantes</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white border border-amber-100 px-2 py-2 rounded-lg text-center shadow-sm">
                            <p className="text-amber-800 font-bold">{isLoading ? <span className="inline-block w-6 h-6 bg-amber-200 animate-pulse rounded mx-auto"></span> : stats.payments.pending}</p>
                            <p className="text-xs text-amber-600">pendentes</p>
                        </div>
                        <div className="bg-white border border-red-100 px-2 py-2 rounded-lg text-center shadow-sm">
                            <p className="text-red-600 font-bold">{isLoading ? <span className="inline-block w-6 h-6 bg-red-200 animate-pulse rounded mx-auto"></span> : stats.payments.failed}</p>
                            <p className="text-xs text-red-600">falhas</p>
                        </div>
                    </div>
                  </div>
                   {/* Botão "Ver Detalhes" removido daqui */}
                </CardContent>
              </Card>
            </div>
            
            {/* Cards de Entidades */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-6">
              {dashboardCards.map((card, index) => (
                <Card 
                  key={index} 
                  className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group h-full border border-gray-200 shadow-sm"
                  onClick={() => handleCardClick(card.entityName)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${card.color} opacity-90`} />
                  <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 rounded-full bg-white opacity-10" />
                  <div className="relative h-full p-4 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <p className={`text-sm font-medium ${card.textColor}`} style={{fontFamily: "'Montserrat', sans-serif"}}>{card.title}</p>
                      <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm transform transition-transform group-hover:scale-110 shadow-sm">
                        <card.icon className={`w-5 h-5 ${card.textColor}`} />
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className={`text-xl md:text-2xl font-bold ${card.textColor}`} style={{fontFamily: "'Montserrat', sans-serif"}}>
                        {isLoading ? <span className="inline-block w-12 h-8 bg-white/20 animate-pulse rounded"></span> : card.value !== undefined ? card.value : '0'}
                      </p>
                      {/* ... (código de growth se houver) ... */}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Gráficos e Atividade Recente */}
            {/* ... (código dos gráficos e da atividade recente) ... */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card className="border border-blue-100 shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg text-gray-800 flex items-center gap-2" style={{fontFamily: "'Montserrat', sans-serif"}}>
                      <BarChart4 className="w-5 h-5 text-[#007BFF]" />
                      Receita por {timeFilter === 'day' ? 'Hora' : timeFilter === 'week' ? 'Dia' : timeFilter === 'month' ? 'Dia' : timeFilter === 'semester' ? 'Mês' : timeFilter === 'Mês'}
                    </CardTitle>
                    <Button variant="outline" size="sm" className="text-[#007BFF] border-[#007BFF] hover:bg-blue-50 flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      <span>Exportar</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="h-72">
                  {isLoading ? (
                    <div className="w-full h-full bg-gray-100 animate-pulse rounded-md flex items-center justify-center">
                      <BarChart4 className="w-12 h-12 text-gray-300" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={revenueData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip 
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
                                  <p className="font-bold">{`${label}`}</p>
                                  <p className="text-[#007BFF]">{`Receita: R$ ${payload[0].value.toLocaleString()}`}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="receita" 
                          name="Receita (R$)" 
                          stroke="#007BFF" 
                          strokeWidth={2}
                          activeDot={{ r: 8, fill: "#007BFF", stroke: "white", strokeWidth: 2 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
              <Card className="border border-green-100 shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg text-gray-800 flex items-center gap-2" style={{fontFamily: "'Montserrat', sans-serif"}}>
                      <Sparkles className="w-5 h-5 text-[#FF5722]" />
                      Crescimento de Membros
                    </CardTitle>
                    <Button variant="outline" size="sm" className="text-[#007BFF] border-[#007BFF] hover:bg-blue-50 flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      <span>Exportar</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="h-72">
                  {isLoading ? (
                    <div className="w-full h-full bg-gray-100 animate-pulse rounded-md flex items-center justify-center">
                      <BarChart4 className="w-12 h-12 text-gray-300" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={membershipData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip 
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
                                  <p className="font-bold">{`${label}`}</p>
                                  <p className="text-green-600">{`Novos: ${payload[0].value}`}</p>
                                  <p className="text-red-500">{`Cancelamentos: ${payload[1].value}`}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend />
                        <Bar dataKey="novos" name="Novos Membros" fill="#4ade80" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="cancelamentos" name="Cancelamentos" fill="#f87171" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="border border-[#007BFF]/20 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800 flex items-center gap-2" style={{fontFamily: "'Montserrat', sans-serif"}}>
                    <PieChart className="w-5 h-5 text-[#007BFF]" />
                    Prestadores por Tipo
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-72 flex items-center justify-center">
                  {isLoading || serviceTypeData.length === 0 ? (
                    <div className="w-full h-full bg-gray-100 animate-pulse rounded-md flex items-center justify-center">
                      <PieChart className="w-12 h-12 text-gray-300" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={serviceTypeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          onClick={handlePieChartClick}
                          className="cursor-pointer"
                        >
                          {serviceTypeData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]} 
                              stroke="#fff"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
                                  <p className="font-bold text-gray-800">{`${payload[0].name}`}</p>
                                  <p className="text-[#007BFF]">{`${payload[0].value} prestadores`}</p>
                                  <p className="text-gray-500 text-xs mt-1">Clique para mais detalhes</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
              <Card className="lg:col-span-2 border border-[#FF5722]/20 shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg text-gray-800 flex items-center gap-2" style={{fontFamily: "'Montserrat', sans-serif"}}>
                      <Activity className="w-5 h-5 text-[#FF5722]" />
                      Atividade Recente
                    </CardTitle>
                    <div className="flex gap-2 items-center">
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[140px] h-8 text-sm">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="confirmed">Confirmados</SelectItem>
                          <SelectItem value="pending">Pendentes</SelectItem>
                          <SelectItem value="rejected">Recusados</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" className="text-[#007BFF] border-[#007BFF] hover:bg-blue-50 flex items-center gap-1 h-8">
                        <Download className="w-4 h-4" />
                        <span>Exportar</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="payments">
                    <TabsList className="mb-4 bg-gray-100">
                      <TabsTrigger value="payments" className="data-[state=active]:bg-[#007BFF] data-[state=active]:text-white">
                        <DollarSign className="w-4 h-4 mr-1" />
                        Pagamentos
                      </TabsTrigger>
                      <TabsTrigger value="members" className="data-[state=active]:bg-[#007BFF] data-[state=active]:text-white">
                        <Users className="w-4 h-4 mr-1" />
                        Novos Membros
                      </TabsTrigger>
                      <TabsTrigger value="reviews" className="data-[state=active]:bg-[#007BFF] data-[state=active]:text-white">
                        <Star className="w-4 h-4 mr-1" />
                        Avaliações
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="payments" className="space-y-4">
                      {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="flex items-center justify-between border-b pb-2">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-gray-200 animate-pulse w-8 h-8"></div>
                              <div className="space-y-2">
                                <div className="h-4 bg-gray-200 animate-pulse rounded w-32"></div>
                                <div className="h-3 bg-gray-200 animate-pulse rounded w-20"></div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="h-4 bg-gray-200 animate-pulse rounded w-16"></div>
                              <div className="h-3 bg-gray-200 animate-pulse rounded w-24"></div>
                            </div>
                          </div>
                        ))
                      ) : (
                        Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="flex items-center justify-between border-b pb-3">
                            <div className="flex items-center gap-3">
                              <Checkbox id={`payment-${i}`} className="border-gray-300" />
                              <div className={`p-2 rounded-full ${i % 3 === 0 ? 'bg-green-100' : i % 3 === 1 ? 'bg-[#FFC107]/20' : 'bg-red-100'}`}>
                                <DollarSign className={`w-4 h-4 ${i % 3 === 0 ? 'text-green-600' : i % 3 === 1 ? 'text-[#FFC107]' : 'text-red-600'}`} />
                              </div>
                              <div>
                                <p className="font-medium">Pagamento de Plano {i % 3 === 0 ? 'confirmado' : i % 3 === 1 ? 'pendente' : 'recusado'}</p>
                                <p className="text-sm text-gray-500">ID: #2023{i}45</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div>
                                <p className="font-medium">R$ {(Math.random() * 100 + 50).toFixed(2)}</p>
                                <p className="text-sm text-gray-500">há {Math.floor(Math.random() * 5) + 1} horas</p>
                              </div>
                              {i % 3 === 1 && (
                                <Button size="sm" className="bg-[#007BFF] hover:bg-[#0069d9]">
                                  Confirmar
                                </Button>
                              )}
                              {i % 3 === 1 && (
                                <Button size="sm" variant="outline" className="text-[#FF5722] border-[#FF5722] hover:bg-[#FF5722]/10">
                                  Lembrete
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </TabsContent>
                    
                    <TabsContent value="members" className="space-y-4">
                      {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="flex items-center justify-between border-b pb-2">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-gray-200 animate-pulse w-8 h-8"></div>
                              <div className="space-y-2">
                                <div className="h-4 bg-gray-200 animate-pulse rounded w-32"></div>
                                <div className="h-3 bg-gray-200 animate-pulse rounded w-20"></div>
                              </div>
                            </div>
                            <div className="h-3 bg-gray-200 animate-pulse rounded w-24"></div>
                          </div>
                        ))
                      ) : (
                        Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="flex items-center justify-between border-b pb-3">
                            <div className="flex items-center gap-3">
                              <Checkbox id={`member-${i}`} className="border-gray-300" />
                              <div className="bg-blue-100 p-2 rounded-full">
                                <Users className="w-4 h-4 text-[#007BFF]" />
                              </div>
                              <div>
                                <p className="font-medium">Novo membro registrado</p>
                                <p className="text-sm text-gray-500">Usuário {Math.floor(Math.random() * 1000) + 1}</p>
                              </div>
                            </div>
                            <div className="flex gap-2 items-center">
                              <p className="text-sm text-gray-500">há {Math.floor(Math.random() * 12) + 1} horas</p>
                              <Button size="sm" className="bg-[#007BFF] hover:bg-[#0069d9]">
                                Detalhes
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </TabsContent>
                    
                    <TabsContent value="reviews" className="space-y-4">
                      {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="flex items-center justify-between border-b pb-2">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-gray-200 animate-pulse w-8 h-8"></div>
                              <div className="space-y-2">
                                <div className="h-4 bg-gray-200 animate-pulse rounded w-32"></div>
                                <div className="h-3 bg-gray-200 animate-pulse rounded w-20"></div>
                              </div>
                            </div>
                            <div className="h-3 bg-gray-200 animate-pulse rounded w-24"></div>
                          </div>
                        ))
                      ) : (
                        Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="flex items-center justify-between border-b pb-3">
                            <div className="flex items-center gap-3">
                              <Checkbox id={`review-${i}`} className="border-gray-300" />
                              <div className="bg-[#FFC107]/20 p-2 rounded-full">
                                <Star className="w-4 h-4 text-[#FFC107]" />
                              </div>
                              <div>
                                <p className="font-medium">Nova avaliação {Math.floor(Math.random() * 5) + 1} estrelas</p>
                                <p className="text-sm text-gray-500">Praia {i + 1}</p>
                              </div>
                            </div>
                            <div className="flex gap-2 items-center">
                              <p className="text-sm text-gray-500">há {Math.floor(Math.random() * 24) + 1} horas</p>
                              <Button size="sm" variant="outline" className="text-[#007BFF] border-[#007BFF] hover:bg-blue-50">
                                Ver
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Placeholder para outras abas principais */}
        {activeMainTab === 'statistics' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Página de Estatísticas (Conteúdo Futuro)</h2>
            <p>Aqui seriam exibidas estatísticas mais detalhadas.</p>
          </div>
        )}
         {activeMainTab === 'financial' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Página Financeira (Conteúdo Futuro)</h2>
            <p>Aqui seria exibido o dashboard financeiro detalhado.</p>
            <Button onClick={() => navigate(createPageUrl("FinancialDashboard"))}>Ir para Dashboard Financeiro</Button>
          </div>
        )}
        {/* Adicionar placeholders para outras abas conforme necessário */}

      </div>

      {showProfileImageDialog && (
        <ProfileImageDialog 
          open={showProfileImageDialog} 
          onOpenChange={setShowProfileImageDialog} 
        />
      )}
      
      {showNameDialog && (
        <NameDialog 
          open={showNameDialog} 
          onOpenChange={setShowNameDialog} 
        />
      )}
      
      {showEmailDialog && (
        <EmailDialog 
          open={showEmailDialog} 
          onOpenChange={setShowEmailDialog} 
        />
      )}
      
      {showPasswordDialog && (
        <PasswordDialog 
          open={showPasswordDialog} 
          onOpenChange={setShowPasswordDialog} 
        />
      )}
    </div>
  );
}

const formatTimeAgo = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInMinutes = Math.floor((now - past) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutos`;
  } else if (diffInMinutes < 1440) {
    return `${Math.floor(diffInMinutes / 60)} horas`;
  } else {
    return `${Math.floor(diffInMinutes / 1440)} dias`;
  }
};
