import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BusinessWallet } from "@/api/entities";
import { Transaction } from "@/api/entities";
import { Business } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Wallet,
  DollarSign,
  Clock,
  ArrowDown,
  ArrowUp,
  Calendar,
  Filter,
  Download,
  ExternalLink,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function BusinessWalletPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState(null);
  const [wallet, setWallet] = useState({
    balance: 0,
    pending_balance: 0,
    total_received: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [timeFilter, setTimeFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadBusinessData();
  }, []);

  const loadBusinessData = async () => {
    try {
      setLoading(true);
      
      // Carregar dados do usuário atual
      const currentUserStr = localStorage.getItem('currentUser');
      if (!currentUserStr) {
        navigate(createPageUrl("UserAccount"));
        return;
      }

      const currentUser = JSON.parse(currentUserStr);
      if (!currentUser.business_id) {
        navigate(createPageUrl("EditBusiness"));
        return;
      }

      // Carregar dados do negócio
      const businessData = await Business.get(currentUser.business_id);
      setBusiness(businessData);

      // Carregar transações
      const transactionsData = await Transaction.filter({ business_id: currentUser.business_id });
      setTransactions(transactionsData.sort((a, b) => 
        new Date(b.payment_date) - new Date(a.payment_date)
      ));

      // Carregar ou criar wallet
      try {
        const wallets = await BusinessWallet.filter({ business_id: currentUser.business_id });
        if (wallets && wallets.length > 0) {
          setWallet(wallets[0]);
        } else {
          // Criar nova wallet se não existir
          const newWallet = await BusinessWallet.create({
            business_id: currentUser.business_id,
            balance: 0,
            pending_balance: 0,
            total_received: 0
          });
          setWallet(newWallet);
        }
      } catch (walletError) {
        console.error("Erro ao carregar wallet:", walletError);
        
        // Criar objeto de wallet temporário calculado a partir das transações
        const completedTransactions = transactionsData.filter(tx => tx.status === 'completed');
        const pendingTransactions = transactionsData.filter(tx => tx.status === 'pending');
        
        const totalCompleted = completedTransactions.reduce((sum, tx) => sum + tx.amount, 0);
        const totalPending = pendingTransactions.reduce((sum, tx) => sum + tx.amount, 0);
        
        setWallet({
          balance: totalCompleted,
          pending_balance: totalPending,
          total_received: totalCompleted + totalPending
        });
      }
      
    } catch (error) {
      console.error("Erro ao carregar dados do negócio:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do negócio",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestWithdrawal = () => {
    toast({
      title: "Solicitação enviada",
      description: "Sua solicitação de saque foi enviada para aprovação",
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed': return "bg-green-100 text-green-800";
      case 'pending': return "bg-yellow-100 text-yellow-800";
      case 'failed': return "bg-red-100 text-red-800";
      case 'refunded': return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return "Concluído";
      case 'pending': return "Pendente";
      case 'failed': return "Falha";
      case 'refunded': return "Reembolsado";
      default: return status;
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'credit_card': return <DollarSign className="h-4 w-4" />;
      case 'pix': return <ExternalLink className="h-4 w-4" />;
      case 'cash': return <Wallet className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'credit_card': return "Cartão";
      case 'pix': return "PIX";
      case 'cash': return "Dinheiro";
      default: return method;
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    // Filtro por tempo
    const txDate = new Date(tx.payment_date);
    const currentDate = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(currentDate.getDate() - 30);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(currentDate.getDate() - 7);
    
    const timeFilterMatch = timeFilter === 'all' || 
      (timeFilter === 'last7' && txDate >= sevenDaysAgo) ||
      (timeFilter === 'last30' && txDate >= thirtyDaysAgo);
      
    // Filtro por método de pagamento
    const paymentFilterMatch = paymentFilter === 'all' || tx.payment_method === paymentFilter;
    
    // Filtro por status
    const statusFilterMatch = statusFilter === 'all' || tx.status === statusFilter;
    
    return timeFilterMatch && paymentFilterMatch && statusFilterMatch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="text-blue-600 mb-2 flex items-center hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar
        </button>
        <h1 className="text-2xl font-bold flex items-center">
          <Wallet className="mr-2" />
          Carteira Digital
        </h1>
        <p className="text-gray-500">{business?.business_name}</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-900 text-lg flex items-center">
              <DollarSign className="w-5 h-5 mr-1 text-blue-700" />
              Saldo Disponível
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-900">
              {formatCurrency(wallet.balance)}
            </p>
            <div className="mt-2">
              <Button 
                onClick={handleRequestWithdrawal} 
                disabled={wallet.balance <= 0}
                className="w-full"
              >
                <ArrowDown className="w-4 h-4 mr-2" />
                Solicitar Saque
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-900 text-lg flex items-center">
              <Clock className="w-5 h-5 mr-1 text-amber-700" />
              Saldo Pendente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-900">
              {formatCurrency(wallet.pending_balance)}
            </p>
            <p className="mt-2 text-sm text-amber-700 flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              Liberação em até 14 dias
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-900 text-lg flex items-center">
              <ArrowUp className="w-5 h-5 mr-1 text-green-700" />
              Total Recebido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-900">
              {formatCurrency(wallet.total_received)}
            </p>
            <p className="mt-2 text-sm text-green-700 flex items-center">
              <DollarSign className="w-4 h-4 mr-1" />
              Desde o início
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="border-b pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-xl">Histórico de Transações</CardTitle>
            
            <div className="flex flex-wrap gap-2 mt-3 md:mt-0">
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-[150px] h-8">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo período</SelectItem>
                  <SelectItem value="last7">Últimos 7 dias</SelectItem>
                  <SelectItem value="last30">Últimos 30 dias</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-[150px] h-8">
                  <SelectValue placeholder="Método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos métodos</SelectItem>
                  <SelectItem value="credit_card">Cartão</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] h-8">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos status</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="failed">Falha</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm" className="h-8">
                <Download className="h-3.5 w-3.5 mr-1" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredTransactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">{tx.order_id?.substring(0, 8) || tx.id?.substring(0, 8)}</TableCell>
                    <TableCell>{formatDate(tx.payment_date)}</TableCell>
                    <TableCell>{tx.customer_name || `Cliente ${tx.customer_id?.substring(0, 4)}`}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="bg-blue-100 p-1 rounded mr-2">
                          {getPaymentMethodIcon(tx.payment_method)}
                        </span>
                        {getPaymentMethodText(tx.payment_method)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(tx.amount)}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeClass(tx.status)}`}>
                        {getStatusText(tx.status)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Wallet className="h-12 w-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-medium">Nenhuma transação encontrada</h3>
              <p className="text-sm text-gray-500 mt-1">
                {transactions.length === 0
                  ? "Você ainda não possui transações"
                  : "Nenhuma transação encontrada com os filtros aplicados"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}