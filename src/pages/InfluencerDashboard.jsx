
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Influencer } from "@/api/entities";
import { InfluencerCommission } from "@/api/entities";
import InfluencerReferralLink from "@/components/influencers/InfluencerReferralLink";
import InfluencerStats from "@/components/influencers/InfluencerStats";
import CommissionHistoryTable from "@/components/influencers/CommissionHistoryTable";
import PayoutRequestForm from "@/components/influencers/PayoutRequestForm";
import PayoutHistoryTable from "@/components/influencers/PayoutHistoryTable";
import BackButton from "@/components/ui/BackButton";
import {
  Users,
  User as UserIcon,
  ArrowLeft,
  CopyCheck,
  RefreshCw,
  DollarSign,
  UserPlus,
  Star,
  Award,
  Edit,
  Trash2,
  Check,
  X,
  AlertCircle,
  Info,
  Instagram,
  Link as LinkIcon,
  ChevronRight,
  Mail,
  Phone,
  Clock,
  Users as UsersIcon,
  Building2,
  Wrench,
  Heart,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function InfluencerDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [influencer, setInfluencer] = useState(null);
  const [influencers, setInfluencers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedInfluencerId, setSelectedInfluencerId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Verificar se há um usuário logado via localStorage
        const storedUser = localStorage.getItem('currentUser');
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        
        if (!storedUser || !isLoggedIn) {
          console.log("Usuário não está logado");
          navigate(createPageUrl("UserAccount"));
          return;
        }

        const userData = JSON.parse(storedUser);
        setCurrentUser(userData);
        
        // Verificar se o usuário é admin
        const isUserAdmin = userData.email === 'contato.jrsn@gmail.com' || userData.role === 'admin';
        setIsAdmin(isUserAdmin);
        
        if (isUserAdmin) {
          // Se for admin, carregar todos os influenciadores
          console.log("Admin detectado, carregando todos os influenciadores");
          const allInfluencers = await Influencer.list();
          console.log("Influenciadores carregados:", allInfluencers);
          setInfluencers(allInfluencers || []);
          
          if (allInfluencers && allInfluencers.length > 0) {
            // Se houver influenciadores, selecione o primeiro
            setSelectedInfluencerId(allInfluencers[0].id);
            setInfluencer(allInfluencers[0]);
          }
        } else {
          // Se não for admin, buscar dados do influenciador atual
          console.log("Buscando dados do influenciador para user_id:", userData.id);
          const userInfluencers = await Influencer.filter({ user_id: userData.id });
          
          if (!userInfluencers || userInfluencers.length === 0) {
            console.log("Nenhum perfil de influenciador encontrado para este usuário");
            setError("Perfil de influenciador não encontrado");
            return;
          }

          const influencerProfile = userInfluencers[0];
          console.log("Perfil de influenciador encontrado:", influencerProfile);
          setInfluencer(influencerProfile);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setError("Erro ao carregar dados do influenciador");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [navigate]);

  // Função para selecionar um influenciador específico (para admins)
  const handleSelectInfluencer = (id) => {
    if (!isAdmin) return;
    
    const selected = influencers.find(inf => inf.id === id);
    if (selected) {
      setSelectedInfluencerId(id);
      setInfluencer(selected);
    }
  };

  // Função para ativar/desativar um influenciador
  const handleToggleInfluencerStatus = async (id, currentStatus) => {
    if (!isAdmin) return;
    
    try {
      await Influencer.update(id, { is_active: !currentStatus });
      
      // Atualizar a lista de influenciadores
      const updatedInfluencers = influencers.map(inf => {
        if (inf.id === id) {
          return { ...inf, is_active: !currentStatus };
        }
        return inf;
      });
      
      setInfluencers(updatedInfluencers);
      
      // Atualizar o influenciador selecionado se for o mesmo
      if (selectedInfluencerId === id) {
        setInfluencer({ ...influencer, is_active: !currentStatus });
      }
      
      toast({
        title: "Status atualizado",
        description: `Influenciador ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`,
        variant: "success"
      });
      
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do influenciador",
        variant: "destructive"
      });
    }
  };

  // Renderização do painel de administração de influenciadores
  const renderAdminPanel = () => {
    if (!isAdmin) return null;
    
    return (
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              Painel de Administração de Influenciadores
            </CardTitle>
            <CardDescription>
              Gerencie todos os influenciadores cadastrados na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h3 className="text-lg font-medium">Lista de Influenciadores</h3>
                <Button 
                  onClick={() => navigate(createPageUrl("InfluencerSignup"))}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Novo Influenciador
                </Button>
              </div>
              
              <div className="border rounded-md">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="p-3 font-medium">Nome</th>
                        <th className="p-3 font-medium">E-mail</th>
                        <th className="p-3 font-medium">Canal</th>
                        <th className="p-3 font-medium">Cidade</th>
                        <th className="p-3 font-medium">Status</th>
                        <th className="p-3 font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {influencers.length > 0 ? (
                        influencers.map((inf) => (
                          <tr 
                            key={inf.id} 
                            className={`hover:bg-gray-50 cursor-pointer ${selectedInfluencerId === inf.id ? 'bg-blue-50' : ''}`}
                            onClick={() => handleSelectInfluencer(inf.id)}
                          >
                            <td className="p-3 font-medium">{inf.name}</td>
                            <td className="p-3">{inf.email}</td>
                            <td className="p-3">
                              {inf.social_channel?.type && (
                                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                                  {inf.social_channel.type}
                                </Badge>
                              )}
                            </td>
                            <td className="p-3">{inf.city}</td>
                            <td className="p-3">
                              <Badge className={inf.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                {inf.is_active ? 'Ativo' : 'Inativo'}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(createPageUrl(`InfluencerEdit?id=${inf.id}`));
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleInfluencerStatus(inf.id, inf.is_active);
                                  }}
                                >
                                  {inf.is_active ? 
                                    <X className="h-4 w-4 text-red-600" /> : 
                                    <Check className="h-4 w-4 text-green-600" />
                                  }
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="p-4 text-center text-gray-500">
                            Nenhum influenciador cadastrado
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderStats = () => {
    if (!influencer) return null;

    return (
      <div className="space-y-6">
        {/* Cabeçalho do Perfil */}
        <div className="md:hidden flex flex-col items-start space-y-2">
          <h1 className="text-2xl font-bold">{influencer.name}</h1>
          <p className="text-gray-500 flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            Perfil de Influenciador
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            {format(new Date(), "dd/MM/yyyy HH:mm")}
          </div>
        </div>

        {/* Card de Saldo - Versão Mobile */}
        <div className="md:hidden bg-blue-600 text-white rounded-lg p-6 text-center">
          <div className="space-y-4">
            <div>
              <h2 className="text-blue-100 mb-1">Saldo Disponível</h2>
              <p className="text-3xl font-bold">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(influencer.balance || 0)}
              </p>
            </div>
            <div>
              <h2 className="text-blue-100 mb-1">Total de Comissões</h2>
              <p className="text-3xl font-bold">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(influencer.total_earned || 0)}
              </p>
              <p className="text-sm text-blue-200 mt-1">
                R$ 0,00 em processamento
              </p>
            </div>
          </div>
        </div>

        {/* Grid de Métricas - Versão Mobile */}
        <div className="md:hidden grid grid-cols-2 gap-4">
          {[
            { icon: UsersIcon, label: "Indicações", value: "0" },
            { icon: Building2, label: "Comércios", value: "0" },
            { icon: Wrench, label: "Prestadores", value: "0" },
            { icon: Heart, label: "Turistas", value: "0" }
          ].map((metric, index) => (
            <div key={index} className="bg-white rounded-lg p-4 text-center shadow-sm">
              <metric.icon className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              <p className="text-sm text-gray-500">{metric.label}</p>
            </div>
          ))}
        </div>

        {/* Botões de Ação - Mobile */}
        <div className="md:hidden grid grid-cols-3 gap-2">
          <Button variant="outline" className="w-full flex flex-col items-center py-4 h-auto">
            <DollarSign className="h-5 w-5 mb-1" />
            <span className="text-sm">Comissões</span>
          </Button>
          <Button variant="outline" className="w-full flex flex-col items-center py-4 h-auto">
            <CreditCard className="h-5 w-5 mb-1" />
            <span className="text-sm">Saques</span>
          </Button>
          <Button variant="default" className="w-full flex flex-col items-center py-4 h-auto bg-gray-900">
            <LinkIcon className="h-5 w-5 mb-1" />
            <span className="text-sm">Link</span>
          </Button>
        </div>

        {/* Desktop Version - Original Layout */}
        <div className="hidden md:block">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{influencer.name}</CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-1 mt-1">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{influencer.email}</span>
                      {influencer.phone && (
                        <>
                          <span className="mx-2">•</span>
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{influencer.phone}</span>
                        </>
                      )}
                    </div>
                  </CardDescription>
                </div>
                
                <Badge className={influencer.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {influencer.is_active ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full flex overflow-x-auto mb-4">
                  <TabsTrigger value="overview" className="flex-1">
                    <Info className="h-4 w-4 mr-2" />
                    Visão Geral
                  </TabsTrigger>
                  <TabsTrigger value="link" className="flex-1">
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Link de Referência
                  </TabsTrigger>
                  <TabsTrigger value="commissions" className="flex-1">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Comissões
                  </TabsTrigger>
                  <TabsTrigger value="payouts" className="flex-1">
                    <CopyCheck className="h-4 w-4 mr-2" />
                    Saques
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfluencerStats stats={{
                        balance: influencer.balance || 0,
                        totalCommissions: influencer.total_earned || 0,
                        pendingCommissions: 0, // Isso poderia ser calculado se necessário
                        totalReferrals: 0, // Este valor poderia ser calculado se necessário
                        planTypes: {
                          commercial: 0,
                          providers: 0,
                          club: 0,
                          properties: 0
                        }
                      }} />
                      
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">Informações Adicionais</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <dl className="space-y-4">
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Cidade</dt>
                              <dd className="mt-1 text-sm">{influencer.city}</dd>
                            </div>
                            
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Canal Principal</dt>
                              <dd className="mt-1 text-sm flex items-center gap-2">
                                {influencer.social_channel?.type === 'instagram' && <Instagram className="h-4 w-4 text-pink-500" />}
                                {influencer.social_channel?.username ? influencer.social_channel.username : 'Não informado'}
                              </dd>
                            </div>
                            
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Código de Referência</dt>
                              <dd className="mt-1 text-sm font-mono bg-gray-100 p-1 rounded">{influencer.code}</dd>
                            </div>
                            
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Método de Pagamento</dt>
                              <dd className="mt-1 text-sm">
                                PIX {influencer.pix_key_type}: {influencer.pix_key || '(não informado)'}
                              </dd>
                            </div>
                          </dl>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="link">
                  <InfluencerReferralLink code={influencer.code} />
                </TabsContent>
                
                <TabsContent value="commissions">
                  <CommissionHistoryTable influencerId={influencer.id} />
                </TabsContent>
                
                <TabsContent value="payouts">
                  <div className="space-y-6">
                    {isAdmin ? (
                      <PayoutHistoryTable influencerId={influencer.id} allowApproval={true} />
                    ) : (
                      <>
                        <PayoutRequestForm influencer={influencer} />
                        <PayoutHistoryTable influencerId={influencer.id} />
                      </>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            
            <CardFooter className="border-t pt-4 flex justify-between">
              <Button 
                variant="outline"
                onClick={() => navigate(createPageUrl("Public"))}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para o Início
              </Button>
              
              {isAdmin && (
                <Button 
                  onClick={() => navigate(createPageUrl(`InfluencerEdit?id=${influencer.id}`))}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Influenciador
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Link de Afiliado Section - Mobile */}
        <div className="md:hidden">
          <h2 className="text-xl font-bold mb-4">Seu Link de Afiliado</h2>
          <InfluencerReferralLink code={influencer.code} />
        </div>
      </div>
    );
  };

  // Renderização para usuário sem perfil de influenciador
  const renderNoInfluencerMessage = () => {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-red-600 mb-2">Ops! Algo deu errado</h2>
          <p className="text-gray-700 mb-6">Perfil de influenciador não encontrado</p>
          
          {!isAdmin && (
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600 mb-3"
              onClick={() => navigate(createPageUrl("InfluencerSignup"))}
            >
              Cadastre-se como Influenciador
            </Button>
          )}
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate(createPageUrl("Public"))}
          >
            Voltar para o Início
          </Button>
        </div>
      </div>
    );
  };

  // Renderização de loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 mx-auto animate-spin text-blue-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Carregando...</h2>
          <p className="text-gray-500 mt-2">Estamos buscando os dados do influenciador</p>
        </div>
      </div>
    );
  }

  // Renderização principal
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="md:hidden mb-6">
          <BackButton />
        </div>
        {/* Desktop Header */}
        <header className="mb-6 hidden md:flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Star className="h-8 w-8 text-yellow-500" />
              {isAdmin ? "Gerenciamento de Influenciadores" : "Painel do Influenciador"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isAdmin 
                ? "Gerencie influenciadores e acompanhe suas estatísticas" 
                : "Acompanhe suas estatísticas, comissões e link de referência"}
            </p>
          </div>
          <BackButton className="mb-0"/>
        </header>

        {isAdmin && renderAdminPanel()}
        {influencer ? renderStats() : renderNoInfluencerMessage()}
      </div>
    </div>
  );
}
