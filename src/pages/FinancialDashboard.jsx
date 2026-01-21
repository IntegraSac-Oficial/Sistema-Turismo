import React, { useState, useEffect, useRef } from "react";
import { 
  DollarSign, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  AlertTriangle, 
  Clock, 
  RefreshCw,
  CheckCircle,
  XCircle,
  FileText,
  Calendar,
  CreditCard,
  User,
  Mail,
  Tag,
  ArrowRight,
  BarChart4,
  ExternalLink,
  Edit,
  Trash2,
  X,
  ChevronLeft,
  Wallet,
  TrendingUp,
  AlertOctagon,
  Clock3
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

// Componente para gráfico de barras simples
const BarChart = ({ data, height = 200, barColor = "#007BFF" }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const maxValue = Math.max(...data.map(item => item.value));
    const barWidth = (canvas.width / data.length) - 10;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Desenhar barras
    data.forEach((item, index) => {
      const barHeight = (item.value / maxValue) * (height - 40);
      const x = index * (barWidth + 10) + 5;
      const y = height - barHeight - 20;
      
      // Desenhar barra
      ctx.fillStyle = barColor;
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // Desenhar valor
      ctx.fillStyle = '#333';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`R$${item.value.toFixed(2)}`, x + barWidth/2, y - 5);
      
      // Desenhar label
      ctx.fillText(item.label, x + barWidth/2, height - 5);
    });
    
  }, [data, height, barColor]);
  
  return (
    <canvas 
      ref={canvasRef} 
      width={data.length * 80} 
      height={height}
      className="max-w-full"
    />
  );
};

export default function FinancialDashboard() {
  const navigate = useNavigate();
  
  // Estados
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [confirmCancelId, setConfirmCancelId] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para análise de receita
  const [timeRange, setTimeRange] = useState("month");
  const [planFilter, setPlanFilter] = useState("all");
  
  useEffect(() => {
    loadSubscriptions();
  }, []);
  
  const loadSubscriptions = () => {
    setIsLoading(true);
    
    // Tenta obter dados do localStorage
    const savedSubscriptions = localStorage.getItem("userSubscriptions");
    
    if (savedSubscriptions) {
      try {
        setSubscriptions(JSON.parse(savedSubscriptions));
      } catch (error) {
        console.error("Erro ao processar dados de assinaturas:", error);
        // Se houver erro, cria dados de exemplo
        createSampleData();
      }
    } else {
      // Se não houver dados, cria dados de exemplo
      createSampleData();
    }
    
    setIsLoading(false);
  };
  
  const createSampleData = () => {
    const sampleData = [
      {
        id: "sub_001",
        client_name: "João Silva",
        email: "joao@exemplo.com",
        plan_name: "Plano Turista",
        plan_id: "turista",
        amount: 29.90,
        period: "Mensal",
        payment_method: "Cartão de Crédito",
        payment_date: "2025-03-10",
        expiry_date: "2025-04-10",
        transaction_id: "TX98765",
        status: "Aprovado",
        card_info: {
          last_digits: "4242",
          brand: "Visa"
        }
      },
      {
        id: "sub_002",
        client_name: "Maria Santos",
        email: "maria@exemplo.com",
        plan_name: "Plano Empresarial",
        plan_id: "empresarial",
        amount: 499.90,
        period: "Anual",
        payment_method: "Boleto",
        payment_date: "2025-03-05",
        expiry_date: "2026-03-05",
        transaction_id: "TX87654",
        status: "Aprovado",
        boleto_info: {
          barcode: "34191.79001 01043.510047 91020.150008 9 91190000017832"
        }
      },
      {
        id: "sub_003",
        client_name: "Carlos Oliveira",
        email: "carlos@exemplo.com",
        plan_name: "Plano Prestador",
        plan_id: "prestador",
        amount: 39.90,
        period: "Mensal",
        payment_method: "PIX",
        payment_date: "2025-03-12",
        expiry_date: "2025-04-12",
        transaction_id: "TX76543",
        status: "Pendente",
        pix_info: {
          key: "pix@turismsc.com.br"
        }
      },
      {
        id: "sub_004",
        client_name: "Ana Carolina",
        email: "ana@exemplo.com",
        plan_name: "Plano Teste",
        plan_id: "teste",
        amount: 1.00,
        period: "Mensal",
        payment_method: "Cartão de Crédito",
        payment_date: "2025-03-01",
        expiry_date: "2025-04-01",
        transaction_id: "TX65432",
        status: "Rejeitado",
        card_info: {
          last_digits: "0123",
          brand: "Mastercard"
        },
        rejection_reason: "Saldo insuficiente"
      },
      {
        id: "sub_005",
        client_name: "Pedro Souza",
        email: "pedro@exemplo.com",
        plan_name: "Plano Turista",
        plan_id: "turista",
        amount: 299.90,
        period: "Anual",
        payment_method: "PIX",
        payment_date: "2025-02-20",
        expiry_date: "2026-02-20",
        transaction_id: "TX54321",
        status: "Cancelado",
        cancellation_date: "2025-03-05",
        cancellation_reason: "Solicitado pelo cliente"
      }
    ];
    
    setSubscriptions(sampleData);
    localStorage.setItem("userSubscriptions", JSON.stringify(sampleData));
  };
  
  const updateSubscription = (id, data) => {
    const updatedSubscriptions = subscriptions.map(sub => 
      sub.id === id ? { ...sub, ...data } : sub
    );
    
    setSubscriptions(updatedSubscriptions);
    localStorage.setItem("userSubscriptions", JSON.stringify(updatedSubscriptions));
    
    return updatedSubscriptions;
  };
  
  const handleBackToDashboard = () => {
    navigate(createPageUrl("Dashboard"));
  };

  // Simular atualização
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdated(new Date());
    }, 800);
  };
  
  // Formatar data
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };
  
  // Formatar última atualização
  const formatLastUpdated = () => {
    return lastUpdated.toLocaleString('pt-BR');
  };
  
  // Formatar valor monetário
  const formatMoney = (value) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };
  
  // Filtrar assinaturas por status e pesquisa
  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesStatus = selectedStatus === "all" || sub.status === selectedStatus;
    const matchesSearch = 
      sub.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.plan_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.transaction_id.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesStatus && matchesSearch;
  });
  
  // Função para cancelar assinatura
  const handleCancelSubscription = (id) => {
    updateSubscription(id, {
      status: "Cancelado",
      cancellation_date: new Date().toISOString().split('T')[0],
      cancellation_reason: "Cancelado manualmente pelo administrador"
    });
    setConfirmCancelId(null);
  };
  
  // Funções para análise de receita
  const getRevenueData = () => {
    const totalApproved = subscriptions
      .filter(sub => sub.status === "Aprovado")
      .reduce((sum, sub) => sum + sub.amount, 0);
      
    const totalPending = subscriptions
      .filter(sub => sub.status === "Pendente")
      .reduce((sum, sub) => sum + sub.amount, 0);
      
    const totalRejected = subscriptions
      .filter(sub => sub.status === "Rejeitado")
      .reduce((sum, sub) => sum + sub.amount, 0);
      
    return {
      totalApproved,
      totalPending,
      totalRejected
    };
  };
  
  const getChartData = () => {
    // Filtrar por período
    let filteredData = [...subscriptions];
    const now = new Date();
    
    if (timeRange === "week") {
      const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
      filteredData = filteredData.filter(sub => new Date(sub.payment_date) >= oneWeekAgo);
    } else if (timeRange === "month") {
      const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
      filteredData = filteredData.filter(sub => new Date(sub.payment_date) >= oneMonthAgo);
    } else if (timeRange === "year") {
      const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
      filteredData = filteredData.filter(sub => new Date(sub.payment_date) >= oneYearAgo);
    }
    
    // Filtrar por plano
    if (planFilter !== "all") {
      filteredData = filteredData.filter(sub => sub.plan_id === planFilter);
    }
    
    // Filtrar por status aprovado
    filteredData = filteredData.filter(sub => sub.status === "Aprovado");
    
    // Agrupar por mês
    const monthlyData = {};
    
    filteredData.forEach(sub => {
      const date = new Date(sub.payment_date);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = 0;
      }
      
      monthlyData[monthYear] += sub.amount;
    });
    
    // Converter para array para o gráfico
    const chartData = Object.keys(monthlyData).map(key => ({
      label: key,
      value: monthlyData[key]
    }));
    
    return chartData.sort((a, b) => {
      const [aMonth, aYear] = a.label.split('/');
      const [bMonth, bYear] = b.label.split('/');
      
      if (aYear !== bYear) return aYear - bYear;
      return aMonth - bMonth;
    });
  };
  
  // Obter dados para a tabela de receita detalhada
  const getDetailedRevenueData = () => {
    // Filtrar por período
    let filteredData = [...subscriptions];
    const now = new Date();
    
    if (timeRange === "week") {
      const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
      filteredData = filteredData.filter(sub => new Date(sub.payment_date) >= oneWeekAgo);
    } else if (timeRange === "month") {
      const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
      filteredData = filteredData.filter(sub => new Date(sub.payment_date) >= oneMonthAgo);
    } else if (timeRange === "year") {
      const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
      filteredData = filteredData.filter(sub => new Date(sub.payment_date) >= oneYearAgo);
    }
    
    // Filtrar por plano
    if (planFilter !== "all") {
      filteredData = filteredData.filter(sub => sub.plan_id === planFilter);
    }
    
    // Filtrar por status aprovado
    filteredData = filteredData.filter(sub => sub.status === "Aprovado");
    
    // Agrupar por plano e período
    const groupedData = {};
    
    filteredData.forEach(sub => {
      const date = new Date(sub.payment_date);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      const key = `${monthYear}-${sub.plan_id}`;
      
      if (!groupedData[key]) {
        groupedData[key] = {
          period: monthYear,
          plan: sub.plan_name,
          plan_id: sub.plan_id,
          count: 0,
          total: 0
        };
      }
      
      groupedData[key].count += 1;
      groupedData[key].total += sub.amount;
    });
    
    return Object.values(groupedData).sort((a, b) => {
      const [aMonth, aYear] = a.period.split('/');
      const [bMonth, bYear] = b.period.split('/');
      
      if (aYear !== bYear) return bYear - aYear;
      return bMonth - aMonth;
    });
  };
  
  // Exportar relatório
  const exportReport = () => {
    const data = getDetailedRevenueData();
    const headers = ["Período", "Plano", "Quantidade", "Valor Total"];
    
    // Criar conteúdo CSV
    let csvContent = headers.join(',') + '\n';
    
    data.forEach(row => {
      const values = [
        row.period,
        row.plan,
        row.count,
        row.total.toFixed(2)
      ];
      csvContent += values.join(',') + '\n';
    });
    
    // Criar arquivo para download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Criar link e clicar
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio-receita-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const revenueData = getRevenueData();
  const chartData = getChartData();
  const detailedData = getDetailedRevenueData();
  
  return (
    <div className="p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex items-center gap-1"
            onClick={handleBackToDashboard}
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar para Dashboard
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{fontFamily: "'Montserrat', sans-serif"}}>Financeiro</h1>
              <p className="text-gray-500">Gestão de assinaturas e pagamentos</p>
            </div>
            
            <div className="flex items-center mt-4 md:mt-0">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 mr-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Atualizar</span>
              </Button>
              
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Atualizado: {formatLastUpdated()}</span>
              </div>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="subscriptions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="subscriptions" className="data-[state=active]:bg-[#007BFF] data-[state=active]:text-white">
              <CreditCard className="w-4 h-4 mr-2" />
              Assinaturas
            </TabsTrigger>
            <TabsTrigger value="revenue" className="data-[state=active]:bg-[#007BFF] data-[state=active]:text-white">
              <BarChart4 className="w-4 h-4 mr-2" />
              Análise de Receita
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="subscriptions" className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Buscar por nome, email, plano..."
                    className="pl-9 pr-4"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="w-4 h-4 mr-2 text-gray-500" />
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="Aprovado">Aprovado</SelectItem>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Rejeitado">Rejeitado</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>Exportar</span>
                </Button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Cliente</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10">
                          <div className="flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007BFF] mb-2"></div>
                            <span>Carregando assinaturas...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredSubscriptions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10">
                          <div className="flex flex-col items-center justify-center text-gray-500">
                            <FileText className="h-10 w-10 mb-2" />
                            <span>Nenhuma assinatura encontrada</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSubscriptions.map((subscription) => (
                        <TableRow key={subscription.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{subscription.client_name}</p>
                              <p className="text-sm text-gray-500">{subscription.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{subscription.plan_name}</p>
                              <p className="text-xs text-gray-500">{subscription.period}</p>
                            </div>
                          </TableCell>
                          <TableCell>{formatMoney(subscription.amount)}</TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{subscription.payment_method}</p>
                              <p className="text-xs text-gray-500">
                                {formatDate(subscription.payment_date)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`${
                                subscription.status === "Aprovado" ? "bg-green-100 text-green-800" :
                                subscription.status === "Pendente" ? "bg-yellow-100 text-yellow-800" :
                                subscription.status === "Rejeitado" ? "bg-red-100 text-red-800" :
                                "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {subscription.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => setSelectedSubscription(subscription)}
                              >
                                <span className="sr-only">Detalhes</span>
                                <Eye className="h-4 w-4" />
                              </Button>
                              
                              {subscription.status !== "Cancelado" && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => setConfirmCancelId(subscription.id)}
                                >
                                  <span className="sr-only">Cancelar</span>
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="revenue" className="space-y-4">
            {/* Análise de Receita */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-green-800 flex items-center">
                    <Wallet className="mr-2 h-5 w-5 text-green-600" />
                    Total Recebido
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <p className="text-2xl font-bold text-[#4CAF50]">
                      {formatMoney(revenueData.totalApproved)}
                    </p>
                    <div className="p-2 bg-white rounded-full">
                      <CheckCircle className="h-5 w-5 text-[#4CAF50]" />
                    </div>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Pagamentos aprovados
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-yellow-800 flex items-center">
                    <Clock3 className="mr-2 h-5 w-5 text-yellow-600" />
                    Total Pendente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <p className="text-2xl font-bold text-[#FFC107]">
                      {formatMoney(revenueData.totalPending)}
                    </p>
                    <div className="p-2 bg-white rounded-full">
                      <AlertTriangle className="h-5 w-5 text-[#FFC107]" />
                    </div>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    Aguardando aprovação
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-red-800 flex items-center">
                    <AlertOctagon className="mr-2 h-5 w-5 text-red-600" />
                    Total Rejeitado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <p className="text-2xl font-bold text-[#FF0000]">
                      {formatMoney(revenueData.totalRejected)}
                    </p>
                    <div className="p-2 bg-white rounded-full">
                      <XCircle className="h-5 w-5 text-[#FF0000]" />
                    </div>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    Pagamentos rejeitados
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Filtros e Gráfico */}
            <Card>
              <CardHeader className="pb-0">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <CardTitle className="text-lg flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-[#007BFF]" />
                    Receita por Período
                  </CardTitle>
                  
                  <div className="flex flex-wrap gap-2">
                    <Select value={timeRange} onValueChange={setTimeRange}>
                      <SelectTrigger className="w-[150px]">
                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                        <SelectValue placeholder="Período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="week">Últimos 7 dias</SelectItem>
                        <SelectItem value="month">Último mês</SelectItem>
                        <SelectItem value="year">Último ano</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={planFilter} onValueChange={setPlanFilter}>
                      <SelectTrigger className="w-[150px]">
                        <Filter className="w-4 h-4 mr-2 text-gray-500" />
                        <SelectValue placeholder="Plano" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os planos</SelectItem>
                        <SelectItem value="turista">Plano Turista</SelectItem>
                        <SelectItem value="empresarial">Plano Empresarial</SelectItem>
                        <SelectItem value="prestador">Plano Prestador</SelectItem>
                        <SelectItem value="teste">Plano Teste</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2"
                      onClick={exportReport}
                    >
                      <Download className="w-4 h-4" />
                      <span>Exportar Relatório</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mt-4 overflow-x-auto">
                  {chartData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                      <BarChart4 className="h-10 w-10 mb-2" />
                      <span>Nenhum dado de receita disponível no período selecionado</span>
                    </div>
                  ) : (
                    <div className="pb-4">
                      <div className="w-full overflow-x-auto">
                        <div className="min-w-[300px]" style={{ height: '250px' }}>
                          <BarChart data={chartData} height={250} barColor="#007BFF" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Tabela Detalhada */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-[#007BFF]" />
                  Detalhamento de Receita
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Período</TableHead>
                        <TableHead>Plano</TableHead>
                        <TableHead className="text-center">Quantidade</TableHead>
                        <TableHead className="text-right">Valor Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detailedData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-10">
                            <div className="flex flex-col items-center justify-center text-gray-500">
                              <FileText className="h-10 w-10 mb-2" />
                              <span>Nenhum dado de receita disponível no período selecionado</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        detailedData.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{item.period}</TableCell>
                            <TableCell>{item.plan}</TableCell>
                            <TableCell className="text-center">{item.count}</TableCell>
                            <TableCell className="text-right font-medium">{formatMoney(item.total)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Modal de detalhes de assinatura */}
      {selectedSubscription && (
        <Dialog open={!!selectedSubscription} onOpenChange={() => setSelectedSubscription(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Detalhes da Assinatura</DialogTitle>
              <DialogDescription>
                Informações completas sobre a assinatura
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div className="border-b pb-2">
                <h3 className="font-medium text-gray-500 mb-1 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Cliente
                </h3>
                <p className="text-lg font-semibold">{selectedSubscription.client_name}</p>
                <p className="text-gray-600 text-sm">{selectedSubscription.email}</p>
              </div>
              
              <div className="border-b pb-2">
                <h3 className="font-medium text-gray-500 mb-1 flex items-center">
                  <Tag className="w-4 h-4 mr-2" />
                  Plano
                </h3>
                <p className="text-lg font-semibold">{selectedSubscription.plan_name}</p>
                <p className="text-gray-600 text-sm">{selectedSubscription.period}</p>
              </div>
              
              <div className="border-b pb-2">
                <h3 className="font-medium text-gray-500 mb-1 flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Pagamento
                </h3>
                <p className="text-lg font-semibold">{formatMoney(selectedSubscription.amount)}</p>
                <p className="text-gray-600 text-sm">Via {selectedSubscription.payment_method}</p>
                
                <div className="mt-2">
                  {selectedSubscription.payment_method === "Cartão de Crédito" && selectedSubscription.card_info && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                      {selectedSubscription.card_info.brand} **** {selectedSubscription.card_info.last_digits}
                    </Badge>
                  )}
                  
                  {selectedSubscription.payment_method === "Boleto" && selectedSubscription.boleto_info && (
                    <p className="text-xs text-gray-500 mt-1">
                      Código: {selectedSubscription.boleto_info.barcode.substring(0, 20)}...
                    </p>
                  )}
                </div>
              </div>
              
              <div className="border-b pb-2">
                <h3 className="font-medium text-gray-500 mb-1 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Datas
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-500">Pagamento</p>
                    <p className="font-semibold">{formatDate(selectedSubscription.payment_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Vencimento</p>
                    <p className="font-semibold">{formatDate(selectedSubscription.expiry_date)}</p>
                  </div>
                </div>
              </div>
              
              <div className="border-b pb-2">
                <h3 className="font-medium text-gray-500 mb-1 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Transação
                </h3>
                <p className="font-semibold">{selectedSubscription.transaction_id}</p>
                <div className="mt-1">
                  <Badge
                    className={`${
                      selectedSubscription.status === "Aprovado" ? "bg-green-100 text-green-800" :
                      selectedSubscription.status === "Pendente" ? "bg-yellow-100 text-yellow-800" :
                      selectedSubscription.status === "Rejeitado" ? "bg-red-100 text-red-800" :
                      "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {selectedSubscription.status}
                  </Badge>
                </div>
                
                {selectedSubscription.status === "Rejeitado" && selectedSubscription.rejection_reason && (
                  <p className="text-xs text-red-600 mt-2">
                    Motivo: {selectedSubscription.rejection_reason}
                  </p>
                )}
                
                {selectedSubscription.status === "Cancelado" && (
                  <div className="text-xs text-gray-600 mt-2">
                    <p>Cancelado em: {formatDate(selectedSubscription.cancellation_date)}</p>
                    {selectedSubscription.cancellation_reason && (
                      <p>Motivo: {selectedSubscription.cancellation_reason}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setSelectedSubscription(null)}
                className="w-full sm:w-auto"
              >
                Fechar
              </Button>
              
              {selectedSubscription.status !== "Cancelado" && (
                <Button 
                  variant="destructive"
                  onClick={() => {
                    setConfirmCancelId(selectedSubscription.id);
                    setSelectedSubscription(null);
                  }}
                  className="w-full sm:w-auto bg-[#FF0000] hover:bg-red-700"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancelar Assinatura
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Modal de confirmação de cancelamento */}
      {confirmCancelId && (
        <Dialog open={!!confirmCancelId} onOpenChange={() => setConfirmCancelId(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirmar Cancelamento</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja cancelar esta assinatura? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="flex items-center p-4 bg-red-50 rounded-md border border-red-200">
                <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
                <div>
                  <p className="font-medium text-red-800">Atenção!</p>
                  <p className="text-sm text-red-700">
                    O cancelamento interromperá o acesso do cliente aos recursos premium imediatamente.
                  </p>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setConfirmCancelId(null)}
                className="w-full sm:w-auto"
              >
                Voltar
              </Button>
              
              <Button 
                variant="destructive"
                onClick={() => handleCancelSubscription(confirmCancelId)}
                className="w-full sm:w-auto bg-[#FF0000] hover:bg-red-700"
              >
                Confirmar Cancelamento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}