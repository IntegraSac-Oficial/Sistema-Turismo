import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Tourist } from "@/api/entities";
import { UserSubscription } from "@/api/entities";
import { SubscriptionPlan } from "@/api/entities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { BackButton } from "@/components/ui/BackButton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Check,
  X,
  ChevronDown,
  Search,
  RefreshCcw,
  Filter,
  UserPlus,
  Crown,
  AlertCircle,
  CreditCard,
  Briefcase,
  ArrowLeft
} from "lucide-react";

export default function NonMembers() {
  const [users, setUsers] = useState([]);
  const [tourists, setTourists] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [userMergedData, setUserMergedData] = useState([]);
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  // Carregar todos os dados necessários
  const loadData = async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    try {
      // Carregar todos os usuários, incluindo os mais recentes
      const allUsers = await User.list();
      const nonAdminUsers = allUsers.filter(user => user.role !== 'admin');
      setUsers(nonAdminUsers);
      
      // Verificar se há dados de turistas para cada usuário, caso contrário, inicializar
      for (const user of nonAdminUsers) {
        try {
          // Verificar se já existe registro de turista para este usuário
          const existingTourist = await Tourist.filter({ user_id: user.id });
          
          // Se não existe, criar um registro com valores padrão
          if (!existingTourist || existingTourist.length === 0) {
            console.log(`Criando registro de turista para o usuário ${user.email}`);
            await Tourist.create({
              user_id: user.id,
              is_club_member: false,
              phone: ""
            });
          }
        } catch (err) {
          console.error(`Erro ao verificar/criar turista para usuário ${user.email}:`, err);
        }
      }

      // Recarregar todos os turistas após possível criação
      const touristData = await Tourist.list();
      setTourists(touristData);
      
      // Carregar assinaturas
      const subscriptionData = await UserSubscription.list();
      setSubscriptions(subscriptionData);
      
      // Carregar planos disponíveis
      const plansData = await SubscriptionPlan.list();
      setPlans(plansData);
      
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setError("Falha ao carregar dados. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadData();
  }, []);

  // Mesclar dados para criar uma visualização completa
  useEffect(() => {
    if (users.length) {
      const merged = users.map(user => {
        // Procurar se o usuário tem um registro de turista
        const tourist = tourists.find(t => t.user_id === user.id);
        
        // Procurar se o usuário tem uma assinatura
        const subscription = subscriptions.find(s => s.user_id === user.id);
        
        // Se tiver assinatura, pegar detalhes do plano
        let planDetails = null;
        if (subscription) {
          planDetails = plans.find(p => p.id === subscription.plan_id);
        }
        
        // Determinar o status do usuário
        let status;
        if (tourist && tourist.is_club_member) {
          status = "member";
        } else if (subscription && subscription.status === "pending") {
          status = "pending";
        } else {
          status = "non_member";
        }
        
        return {
          ...user,
          tourist: tourist || null,
          subscription: subscription || null,
          plan: planDetails,
          status
        };
      });
      
      setUserMergedData(merged);
      
      // Contar usuários pendentes de aprovação
      const pendingCount = merged.filter(user => user.status === "pending").length;
      setPendingApprovalCount(pendingCount);
    }
  }, [users, tourists, subscriptions, plans]);

  // Filtrar e pesquisar usuários
  const filteredUsers = userMergedData.filter(user => {
    const matchesSearch = searchTerm === "" || 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Abrir diálogo de aprovação
  const openApprovalDialog = (user) => {
    setSelectedUser(user);
    setSelectedPlan("");
    setShowApprovalDialog(true);
  };

  // Aprovar assinatura
  const approveSubscription = async () => {
    if (!selectedUser || !selectedPlan) return;
    
    setIsLoading(true);
    try {
      // Primeiro, atualize o status da assinatura existente ou crie uma nova
      let subscriptionId;
      const today = new Date();
      
      // Calcular data de término com base no plano
      const selectedPlanDetails = plans.find(p => p.id === selectedPlan);
      let endDate = new Date(today);
      
      if (selectedPlanDetails) {
        switch (selectedPlanDetails.period) {
          case "mensal":
            endDate.setMonth(endDate.getMonth() + 1);
            break;
          case "trimestral":
            endDate.setMonth(endDate.getMonth() + 3);
            break;
          case "semestral":
            endDate.setMonth(endDate.getMonth() + 6);
            break;
          case "anual":
            endDate.setFullYear(endDate.getFullYear() + 1);
            break;
          default:
            endDate.setMonth(endDate.getMonth() + 1);
        }
      }
      
      // Formatando as datas
      const formattedStartDate = today.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      if (selectedUser.subscription) {
        // Atualizar assinatura existente
        await UserSubscription.update(selectedUser.subscription.id, {
          plan_id: selectedPlan,
          status: "active",
          payment_status: "completed",
          start_date: formattedStartDate,
          end_date: formattedEndDate
        });
        subscriptionId = selectedUser.subscription.id;
      } else {
        // Criar nova assinatura
        const newSubscription = await UserSubscription.create({
          user_id: selectedUser.id,
          plan_id: selectedPlan,
          status: "active",
          payment_status: "completed",
          start_date: formattedStartDate,
          end_date: formattedEndDate,
          payment_method: "admin_approval",
          auto_renew: true
        });
        subscriptionId = newSubscription.id;
      }
      
      // Atualizar status do turista ou criar um registro de turista
      if (selectedUser.tourist) {
        await Tourist.update(selectedUser.tourist.id, {
          is_club_member: true,
          subscription_date: formattedStartDate
        });
      } else {
        await Tourist.create({
          user_id: selectedUser.id,
          is_club_member: true,
          subscription_date: formattedStartDate
        });
      }
      
      // Recarregar dados
      await loadData(true);
      
      setShowApprovalDialog(false);
      alert(`Assinatura aprovada com sucesso para ${selectedUser.full_name}`);
      
    } catch (error) {
      console.error("Erro ao aprovar assinatura:", error);
      alert("Ocorreu um erro ao aprovar a assinatura. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Rejeitar solicitação
  const rejectSubscription = async () => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    try {
      if (selectedUser.subscription) {
        await UserSubscription.update(selectedUser.subscription.id, {
          status: "cancelled",
          payment_status: "refunded",
          cancellation_reason: "Rejeitado pelo administrador"
        });
      }
      
      // Recarregar dados
      await loadData(true);
      
      setShowApprovalDialog(false);
      alert(`Assinatura rejeitada para ${selectedUser.full_name}`);
      
    } catch (error) {
      console.error("Erro ao rejeitar assinatura:", error);
      alert("Ocorreu um erro ao rejeitar a assinatura. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container p-4 md:p-6 max-w-7xl mx-auto">
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => navigate(createPageUrl("Dashboard"))}
        className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para Dashboard
      </Button>
    
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Gerenciamento de Usuários</h1>
          <p className="text-gray-500">
            Gerencie usuários, aprove assinaturas e monitore membros do clube.
          </p>
        </div>
        
        {pendingApprovalCount > 0 && (
          <Badge className="bg-amber-500 mt-2 md:mt-0 text-white py-1 px-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {pendingApprovalCount} solicitações pendentes
          </Badge>
        )}
      </div>
      
      <Tabs defaultValue={statusFilter} onValueChange={setStatusFilter} className="mb-6">
        <TabsList className="w-full md:w-auto grid grid-cols-4 mb-4">
          <TabsTrigger value="all" className="text-sm">
            Todos os Usuários
          </TabsTrigger>
          <TabsTrigger value="member" className="text-sm">
            <Crown className="h-4 w-4 mr-1" />
            Membros
          </TabsTrigger>
          <TabsTrigger value="non_member" className="text-sm">
            <UserIcon className="h-4 w-4 mr-1" />
            Não Membros
          </TabsTrigger>
          <TabsTrigger value="pending" className="text-sm">
            <AlertCircle className="h-4 w-4 mr-1" />
            Pendentes
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar por nome ou email..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="text-[#007BFF] border-[#007BFF] hover:bg-[#007BFF]/10"
            onClick={() => navigate(createPageUrl("Cadastro"))}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
          <Button 
            variant="outline"
            onClick={() => loadData(true)}
            className="text-gray-600"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#007BFF]"></div>
        </div>
      ) : error ? (
        <Card className="bg-red-50 border border-red-200">
          <CardContent className="pt-6 flex flex-col items-center justify-center text-center h-40">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-red-700 mb-2">Erro ao carregar dados</h3>
            <p className="text-red-600 max-w-md mx-auto mb-4">{error}</p>
            <Button onClick={() => loadData(true)}>Tentar Novamente</Button>
          </CardContent>
        </Card>
      ) : filteredUsers.length === 0 ? (
        <Card className="bg-gray-50 border border-gray-200">
          <CardContent className="pt-6 flex flex-col items-center justify-center text-center h-64">
            <UserIcon className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhum usuário encontrado</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Não foram encontrados usuários com os filtros atuais. Tente mudar os critérios de busca ou adicione novos usuários.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border border-gray-200 shadow-sm mb-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">#</TableHead>
                  <TableHead className="w-[250px]">Usuário</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{indexOfFirstItem + index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{user.full_name?.[0] || '?'}</AvatarFallback>
                          {user.avatar_url && <AvatarImage src={user.avatar_url} />}
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.full_name}</p>
                          <p className="text-xs text-gray-500">Desde {new Date(user.created_date).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="flex items-center text-sm">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          {user.email}
                        </span>
                        {user.tourist?.phone && (
                          <span className="flex items-center text-sm">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            {user.tourist.phone}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.status === "member" ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <Crown className="h-3 w-3 mr-1" />
                          Membro
                        </Badge>
                      ) : user.status === "pending" ? (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Pendente
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                          <UserIcon className="h-3 w-3 mr-1" />
                          Não Membro
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.plan ? (
                        <div className="flex items-center">
                          <span className="text-sm font-medium">{user.plan.name}</span>
                          <Badge className="ml-2 text-xs" variant="outline">
                            R$ {user.plan.price}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.status === "pending" ? (
                          <Button 
                            size="sm" 
                            className="bg-[#007BFF] hover:bg-[#0069d9]"
                            onClick={() => openApprovalDialog(user)}
                          >
                            Aprovar
                          </Button>
                        ) : user.status === "non_member" ? (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-[#007BFF] border-[#007BFF] hover:bg-[#007BFF]/10"
                            onClick={() => openApprovalDialog(user)}
                          >
                            Adicionar Plano
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-gray-600"
                            onClick={() => {
                              // Navegar para detalhes do usuário
                              // Ou abrir modal com detalhes
                            }}
                          >
                            Ver Detalhes
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          
          {totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
      
      {/* Diálogo de Aprovação/Adição de Plano */}
      {showApprovalDialog && (
        <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedUser?.status === "pending" 
                  ? "Aprovar Solicitação de Plano" 
                  : "Adicionar Plano ao Usuário"}
              </DialogTitle>
              <DialogDescription>
                {selectedUser?.status === "pending"
                  ? "Confirme os detalhes e aprove a solicitação de assinatura."
                  : "Selecione um plano para adicionar ao usuário."}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                <Avatar>
                  <AvatarFallback>{selectedUser?.full_name?.[0] || '?'}</AvatarFallback>
                  {selectedUser?.avatar_url && <AvatarImage src={selectedUser.avatar_url} />}
                </Avatar>
                <div>
                  <p className="font-medium">{selectedUser?.full_name}</p>
                  <p className="text-sm text-gray-500">{selectedUser?.email}</p>
                </div>
              </div>
              
              <div>
                <Label htmlFor="plan">Selecione o Plano</Label>
                <Select 
                  value={selectedPlan} 
                  onValueChange={setSelectedPlan}
                >
                  <SelectTrigger id="plan">
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map(plan => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - R$ {plan.price} ({plan.period})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowApprovalDialog(false)}
                className="sm:w-auto w-full"
              >
                Cancelar
              </Button>
              {selectedUser?.status === "pending" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={rejectSubscription}
                  className="sm:w-auto w-full text-red-600 border-red-600 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Rejeitar
                </Button>
              )}
              <Button
                type="button"
                onClick={approveSubscription}
                disabled={!selectedPlan}
                className="sm:w-auto w-full bg-[#007BFF] hover:bg-[#0069d9]"
              >
                <Check className="h-4 w-4 mr-2" />
                {selectedUser?.status === "pending" ? "Aprovar" : "Adicionar Plano"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}