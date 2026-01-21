
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Influencer } from '@/api/entities';
import { InfluencerCommission } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import BackButton from '@/components/ui/BackButton';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { 
  Users, 
  DollarSign, 
  CreditCard, 
  Clock, 
  Loader2, 
  User as UserIcon, 
  BarChart,
  AlertCircle,
  Crown
} from 'lucide-react';

import InfluencerStats from '@/components/influencers/InfluencerStats';
import CommissionHistoryTable from '@/components/influencers/CommissionHistoryTable';
import PayoutRequestForm from '@/components/influencers/PayoutRequestForm';
import PayoutHistoryTable from '@/components/influencers/PayoutHistoryTable';
import InfluencerReferralLink from '@/components/influencers/InfluencerReferralLink';
import MembershipSection from '@/components/influencers/MembershipSection';

export default function InfluencerProfile() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [influencer, setInfluencer] = useState(null);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    totalCommissions: 0,
    pendingCommissions: 0,
    balance: 0,
    planTypes: {
      commercial: 0,
      providers: 0,
      club: 0,
      properties: 0
    }
  });
  const [commissions, setCommissions] = useState([]);
  const [activeTab, setActiveTab] = useState("commissions");
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const storedUser = localStorage.getItem('currentUser');
        if (!storedUser) {
          throw new Error("Usuário não está logado");
        }

        const userData = JSON.parse(storedUser);
        console.log("Tentando carregar perfil para:", userData);
        setCurrentUser(userData);

        let influencerData = null;

        // 1. Tentar buscar por email primeiro (mais confiável)
        if (userData.email) {
          const influencersByEmail = await Influencer.filter({ 
            email: userData.email 
          });
          console.log("Busca por email:", influencersByEmail);
          if (influencersByEmail && influencersByEmail.length > 0) {
            influencerData = influencersByEmail[0];
          }
        }

        // 2. Se não encontrou por email, tentar por user_id
        if (!influencerData && userData.id) {
          const influencersByUserId = await Influencer.filter({ 
            user_id: userData.id 
          });
          console.log("Busca por user_id:", influencersByUserId);
          if (influencersByUserId && influencersByUserId.length > 0) {
            influencerData = influencersByUserId[0];
          }
        }

        // 3. Se ainda não encontrou, tentar por business_id se for um comércio
        if (!influencerData && userData.business_id) {
          const influencersByBusinessId = await Influencer.filter({
            user_id: userData.business_id,
            entity_type: 'business'
          });
          console.log("Busca por business_id:", influencersByBusinessId);
          if (influencersByBusinessId && influencersByBusinessId.length > 0) {
            influencerData = influencersByBusinessId[0];
          }
        }

        // Se encontrou o influenciador, atualizar dados no localStorage
        if (influencerData) {
          console.log("Influenciador encontrado:", influencerData);
          setInfluencer(influencerData);

          // Atualizar localStorage com dados corretos do influenciador
          const updatedUserData = {
            ...userData,
            role: 'influencer',
            influencer_id: influencerData.id
          };
          localStorage.setItem('currentUser', JSON.stringify(updatedUserData));

          // Carregar comissões
          try {
            const commissionsData = await InfluencerCommission.filter({
              influencer_id: influencerData.id
            });
            setCommissions(commissionsData || []);
            calculateStats(influencerData, commissionsData);
          } catch (error) {
            console.error("Erro ao carregar comissões:", error);
            setCommissions([]);
            calculateStats(influencerData, []);
          }
        } else {
          throw new Error("Perfil de influenciador não encontrado");
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setError(error.message || "Erro ao carregar o perfil de influenciador");
        
        // Se não encontrou o perfil, oferecer opção de cadastro
        if (error.message.includes("não encontrado")) {
          setError("Parece que você ainda não tem um perfil de influenciador. Você pode se cadastrar como influenciador através do botão abaixo.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);
  
  const loadInfluencerData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (!storedUser) {
        throw new Error("Usuário não está logado");
      }
      
      const userData = JSON.parse(storedUser);
      setCurrentUser(userData);
      
      const urlParams = new URLSearchParams(window.location.search);
      const influencerIdFromUrl = urlParams.get('id');
      let influencerData;

      // Prioriza ID da URL, depois ID do usuário logado
      const targetInfluencerId = influencerIdFromUrl || userData.influencer_id;

      if (targetInfluencerId) {
        try {
          influencerData = await Influencer.get(targetInfluencerId);
        } catch (error) {
          console.error("InfluencerProfile (reload) - Erro ao buscar influenciador pelo ID:", error);
          const influencersById = await Influencer.filter({ id: targetInfluencerId });
          if (influencersById && influencersById.length > 0) {
            influencerData = influencersById[0];
          }
        }
      } else if (userData.email) { // Fallback para email se não houver ID
        const influencersByEmail = await Influencer.filter({ email: userData.email });
        if (influencersByEmail && influencersByEmail.length > 0) {
          influencerData = influencersByEmail[0];
          // Atualiza localStorage com o ID do influenciador se encontrado por email
          if (userData.influencer_id !== influencerData.id) {
             userData.influencer_id = influencerData.id;
             userData.role = 'influencer'; // Garante o papel correto
             localStorage.setItem('currentUser', JSON.stringify(userData));
          }
        }
      }
      
      if (!influencerData) {
        throw new Error('Influenciador não encontrado');
      }
      
      setInfluencer(influencerData);
      
      let commissionsData = [];
      try {
        commissionsData = await InfluencerCommission.filter({ influencer_id: influencerData.id });
        setCommissions(commissionsData || []);
      } catch (error) {
        console.error("InfluencerProfile (reload) - Erro ao carregar comissões:", error);
        commissionsData = [];
        setCommissions([]);
      }
      
      calculateStats(influencerData, commissionsData);
    } catch (error) {
      console.error('InfluencerProfile (reload) - Erro ao carregar dados:', error);
      setError(error.message || 'Erro ao carregar os dados do influenciador');
    } finally {
      setIsLoading(false);
    }
  };
  
  const calculateStats = (influencer, commissions = []) => {
    const planTypes = {
      commercial: 0,
      providers: 0,
      club: 0,
      properties: 0
    };
    
    let totalCommissionAmount = 0;
    let pendingCommissionAmount = 0;
    
    if (commissions && Array.isArray(commissions)) {
      commissions.forEach(comm => {
        if (comm.plan_type && planTypes[comm.plan_type] !== undefined) {
          planTypes[comm.plan_type]++;
        }
        
        totalCommissionAmount += comm.commission_amount || 0;
        
        if (comm.status === 'pending') {
          pendingCommissionAmount += comm.commission_amount || 0;
        }
      });
    }
    
    const totalReferrals = Object.values(planTypes).reduce((sum, count) => sum + count, 0);
    
    setStats({
      totalReferrals,
      totalCommissions: totalCommissionAmount,
      pendingCommissions: pendingCommissionAmount,
      balance: influencer?.balance || 0,
      planTypes
    });
  };

  const handleDataRefresh = async () => {
    await loadInfluencerData();
  };

  // Página de carregamento
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Carregando...</h3>
          <p className="mt-1 text-sm text-gray-500">Aguarde enquanto carregamos seus dados.</p>
        </div>
      </div>
    );
  }

  // Página de erro
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Erro ao Carregar Perfil</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            {currentUser && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Parece que você ainda não tem um perfil de influenciador.
                </p>
                <Button 
                  onClick={() => navigate(createPageUrl("UserAccount"))}
                  className="bg-blue-600 hover:bg-blue-700 mr-2"
                >
                  Voltar para Minha Conta
                </Button>
                <Button
                  onClick={() => navigate(createPageUrl("InfluencerSignup"))}
                  variant="outline"
                >
                  Cadastrar como Influenciador
                </Button>
              </div>
            )}
            {!currentUser && (
              <Button 
                onClick={() => navigate(createPageUrl("UserAccount"))}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Fazer Login
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  if (!influencer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Perfil Não Encontrado</h3>
            <p className="text-gray-600 mb-6">Não foi possível encontrar um perfil de influenciador associado à sua conta.</p>
            <Button 
              onClick={() => navigate(createPageUrl('UserAccount'))}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Voltar para Minha Conta
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const renderMobileTabs = () => {
    return (
      <div className="md:hidden">
        <div className="mb-4 overflow-x-auto">
          <div className="grid grid-cols-3 gap-1">
            <Button 
              variant={activeTab === "commissions" ? "default" : "outline"}
              className={`flex items-center justify-center px-2 ${activeTab === "commissions" ? "bg-blue-600" : ""}`}
              onClick={() => handleTabChange("commissions")}
            >
              <DollarSign className="w-4 h-4 mr-1" />
              <span className="text-xs">Comissões</span>
            </Button>
            <Button 
              variant={activeTab === "payouts" ? "default" : "outline"}
              className={`flex items-center justify-center px-2 ${activeTab === "payouts" ? "bg-blue-600" : ""}`}
              onClick={() => handleTabChange("payouts")}
            >
              <CreditCard className="w-4 h-4 mr-1" />
              <span className="text-xs">Saques</span>
            </Button>
            <Button 
              variant={activeTab === "referrals" ? "default" : "outline"}
              className={`flex items-center justify-center px-2 ${activeTab === "referrals" ? "bg-blue-600" : ""}`}
              onClick={() => handleTabChange("referrals")}
            >
              <Users className="w-4 h-4 mr-1" />
              <span className="text-xs">Link</span>
            </Button>
          </div>
        </div>

        {activeTab === "commissions" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <BarChart className="w-5 h-5 mr-2 text-gray-500" />
                Histórico de Comissões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CommissionHistoryTable commissions={commissions} />
            </CardContent>
          </Card>
        )}

        {activeTab === "payouts" && (
          <div className="space-y-6">
            <PayoutRequestForm 
              influencerId={influencer?.id} 
              balance={influencer?.balance || 0}
              onRequestSent={handleDataRefresh}
            />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <CreditCard className="w-5 h-5 mr-2 text-gray-500" />
                  Histórico de Saques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PayoutHistoryTable payouts={influencer?.payout_requests || []} />
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "referrals" && (
          <div className="space-y-6">
            <InfluencerReferralLink code={influencer?.code || ""} />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Users className="w-5 h-5 mr-2 text-gray-500" />
                  Como Funciona
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h3 className="font-medium text-blue-800 mb-2">Compartilhe seu Link</h3>
                  <p className="text-blue-700 text-sm">
                    Compartilhe seu link de referência com amigos, seguidores e clientes potenciais.
                    Quando eles se cadastrarem usando seu link, serão automaticamente vinculados ao seu perfil.
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <h3 className="font-medium text-green-800 mb-2">Ganhe Comissões</h3>
                  <p className="text-green-700 text-sm">
                    Você ganhará comissões por cada plano que suas indicações contratarem.
                    As comissões são calculadas automaticamente com base nas taxas configuradas para cada tipo de plano.
                  </p>
                </div>
                
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <h3 className="font-medium text-amber-800 mb-2">Receba seus Saques</h3>
                  <p className="text-amber-700 text-sm">
                    Quando quiser receber suas comissões, basta solicitar um saque.
                    O pagamento será processado em até 48 horas úteis via PIX para a chave cadastrada.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  };

  const renderDesktopTabs = () => {

    return (
      <div className="hidden md:block">
        <Tabs defaultValue="commissions">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="commissions">
              <DollarSign className="w-4 h-4 mr-2" />
              Comissões
            </TabsTrigger>
            <TabsTrigger value="payouts">
              <CreditCard className="w-4 h-4 mr-2" />
              Saques
            </TabsTrigger>
            <TabsTrigger value="referrals">
              <Users className="w-4 h-4 mr-2" />
              Link
            </TabsTrigger>
             <TabsTrigger value="membership">
              <Crown className="w-4 h-4 mr-2" />
              Benefícios
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="commissions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <BarChart className="w-5 h-5 mr-2 text-gray-500" />
                  Histórico de Comissões
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CommissionHistoryTable commissions={commissions} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payouts" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <PayoutRequestForm 
                  influencerId={influencer?.id} 
                  balance={influencer?.balance || 0}
                  onRequestSent={handleDataRefresh}
                />
              </div>
              
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <CreditCard className="w-5 h-5 mr-2 text-gray-500" />
                      Histórico de Saques
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PayoutHistoryTable payouts={influencer?.payout_requests || []} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="referrals" className="mt-6">
            <div className="grid grid-cols-1 gap-6">
              <InfluencerReferralLink code={influencer?.code || ""} />
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Users className="w-5 h-5 mr-2 text-gray-500" />
                    Como Funciona
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h3 className="font-medium text-blue-800 mb-2">Compartilhe seu Link</h3>
                    <p className="text-blue-700 text-sm">
                      Compartilhe seu link de referência com amigos, seguidores e clientes potenciais.
                      Quando eles se cadastrarem usando seu link, serão automaticamente vinculados ao seu perfil.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <h3 className="font-medium text-green-800 mb-2">Ganhe Comissões</h3>
                    <p className="text-green-700 text-sm">
                      Você ganhará comissões por cada plano que suas indicações contratarem.
                      As comissões são calculadas automaticamente com base nas taxas configuradas para cada tipo de plano.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                    <h3 className="font-medium text-amber-800 mb-2">Receba seus Saques</h3>
                    <p className="text-amber-700 text-sm">
                      Quando quiser receber suas comissões, basta solicitar um saque.
                      O pagamento será processado em até 48 horas úteis via PIX para a chave cadastrada.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

           <TabsContent value="membership" className="mt-6">
             <MembershipSection influencer={influencer} />
           </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <BackButton />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {influencer?.name || "Carregando..."}
            </h1>
            <p className="text-gray-500 flex items-center">
              <UserIcon className="w-4 h-4 mr-1" />
              Perfil de Influenciador
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="text-gray-600 hover:text-gray-900 text-sm"
              onClick={handleDataRefresh}
            >
              <Clock className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Última atualização:</span> {
                influencer?.updated_date ? 
                format(new Date(influencer.updated_date), 'dd/MM/yyyy HH:mm') : 
                'Desconhecida'
              }
            </Button>
          </div>
        </div>
        
        <InfluencerStats stats={stats} />
        
        <div className="mt-8">
          {renderMobileTabs()}
          {renderDesktopTabs()}
        </div>
      </div>
    </div>
  );
}
