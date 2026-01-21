
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Realtor } from "@/api/entities";
import { User } from "@/api/entities";
import { Property } from "@/api/entities";
import { UserSubscription } from "@/api/entities";
import { SubscriptionPlan } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { 
  Building2, 
  Home, 
  Plus, 
  Eye, 
  LayoutDashboard, 
  Settings, 
  CreditCard, 
  LogOut,
  BarChart2,
  Users,
  ListChecks,
  Edit,
  Star as StarIcon,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Tag,
  Filter,
  DollarSign,
  MapPin
} from "lucide-react";
import BecomeInfluencerButton from "@/components/profile/BecomeInfluencerButton";
import { Influencer } from "@/api/entities";
import { Badge } from "@/components/ui/badge";

const mockLeads = [
  { id: 1, name: "Carlos Silva", property: "Apartamento Vista Mar", date: "20/05/2025", status: "Novo" },
  { id: 2, name: "Ana Pereira", property: "Casa com Piscina", date: "18/05/2025", status: "Contatado" },
  { id: 3, name: "Lucas Mendes", property: "Cobertura Centro", date: "15/05/2025", status: "Agendou Visita" },
];

const mockPerformanceData = {
  viewsLast30Days: 1250,
  leadsLast30Days: 45,
  conversionRate: (45/1250 * 100).toFixed(1) + "%",
  viewsHistory: [
    { month: "Jan", views: 800 }, { month: "Fev", views: 950 },
    { month: "Mar", views: 1100 }, { month: "Abr", views: 1250 },
  ]
};

export default function RealtorDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [realtorProfile, setRealtorProfile] = useState(null);
  const [properties, setProperties] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [isInfluencer, setIsInfluencer] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('overview');

  const [leads, setLeads] = useState(mockLeads);
  const [performanceData, setPerformanceData] = useState(mockPerformanceData);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
        if (parsedUser.role === 'realtor' && parsedUser.influencer_id) {
        }
    }
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    let localUserData = null;
    try {
      console.log("RealtorDashboard: Iniciando carregamento de dados");
      
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        localUserData = JSON.parse(storedUser);
        console.log("RealtorDashboard: Usuário do localStorage:", localUserData);
      } else {
        console.log("RealtorDashboard: Nenhum usuário no localStorage");
        navigate(createPageUrl("UserAccount"));
        return;
      }

      if (!localUserData || !localUserData.email) {
        console.log("RealtorDashboard: Dados do usuário inválidos");
        navigate(createPageUrl("UserAccount"));
        return;
      }
      
      let realtorData = null;
      
      if (localUserData.realtor_id) {
        try {
          console.log("RealtorDashboard: Tentando carregar imobiliária pelo ID:", localUserData.realtor_id);
          realtorData = await Realtor.get(localUserData.realtor_id);
          console.log("RealtorDashboard: Imobiliária carregada por ID:", realtorData);
        } catch (error) {
          console.error("RealtorDashboard: Erro ao carregar imobiliária por ID:", error);
        }
      }
      
      if (!realtorData) {
        try {
          console.log("RealtorDashboard: Tentando buscar imobiliárias pelo email:", localUserData.email);
          const realtors = await Realtor.list();
          
          const matchedRealtor = realtors.find(r => 
            r.email && r.email.trim().toLowerCase() === localUserData.email.trim().toLowerCase() &&
            (!localUserData.realtor_id || r.id === localUserData.realtor_id)
          );
          
          if (matchedRealtor) {
            realtorData = matchedRealtor;
            console.log("RealtorDashboard: Imobiliária encontrada por email:", realtorData);
          } else {
            console.log("RealtorDashboard: Nenhuma imobiliária encontrada para o email:", localUserData.email, "com realtor_id:", localUserData.realtor_id);
             if (localUserData.realtor_id) {
                const realtorsById = await Realtor.filter({ id: localUserData.realtor_id });
                if (realtorsById && realtorsById.length > 0) {
                    realtorData = realtorsById[0];
                    console.log("RealtorDashboard: Imobiliária encontrada por filtro de ID:", realtorData);
                }
             }
          }
        } catch (error) {
          console.error("RealtorDashboard: Erro ao buscar imobiliárias por email:", error);
        }
      }
      
      if (!realtorData) {
        console.error("RealtorDashboard: Imobiliária não encontrada para o usuário:", localUserData);
        toast({
          title: "Perfil de Imobiliária Não Encontrado",
          description: "Não encontramos um perfil de imobiliária associado a esta conta. Verifique seus dados ou entre em contato.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      setRealtorProfile(realtorData);
      
      if (!localUserData.realtor_id || localUserData.realtor_id !== realtorData.id) {
        localUserData.realtor_id = realtorData.id;
        localStorage.setItem('currentUser', JSON.stringify(localUserData));
        console.log("RealtorDashboard: currentUser atualizado no localStorage com realtor_id:", localUserData);
      }
      
      const propertiesData = await Property.filter({ realtor_id: realtorData.id });
      setProperties(propertiesData || []);
      
      if (realtorData.subscription_plan_id) {
        console.log("RealtorDashboard: Carregando detalhes do plano:", realtorData.subscription_plan_id);
        try {
          const plan = await SubscriptionPlan.get(realtorData.subscription_plan_id);
          
          if (plan) {
            console.log("RealtorDashboard: Plano encontrado:", plan);
            const planStatus = realtorData.status === 'approved' || realtorData.subscription_status === 'active' ? 'active' : realtorData.subscription_status;
            
            setSubscription({
              plan_id: plan.id,
              plan_name: plan.name,
              status: planStatus,
              max_listings: plan.max_listings || realtorData.max_active_listings || 15,
              featured_listings: plan.featured_listings || realtorData.featured_listings_available || 0
            });
          } else {
             if (realtorData.status === 'approved' || realtorData.subscription_status === 'active') {
                setSubscription({
                  plan_id: realtorData.subscription_plan_id,
                  plan_name: "Plano Imobiliário (Detalhes Indisponíveis)",
                  status: "active",
                  max_listings: realtorData.max_active_listings || 15,
                  featured_listings: realtorData.featured_listings_available || 0
                });
            }
          }
        } catch (e) {
          console.error("RealtorDashboard: Erro ao carregar plano:", e);
          if (realtorData.status === 'approved' || realtorData.subscription_status === 'active') {
            setSubscription({
              plan_id: realtorData.subscription_plan_id,
              plan_name: "Plano Imobiliário Premium",
              status: "active",
              max_listings: realtorData.max_active_listings || 15,
              featured_listings: realtorData.featured_listings_available || 0
            });
          }
        }
      } else if (realtorData.status === 'approved' || realtorData.subscription_status === 'active') {
        console.log("RealtorDashboard: Criando plano default para imobiliária aprovada/ativa sem plano ID");
        setSubscription({
          plan_id: "default_approved",
          plan_name: "Plano Imobiliário Ativo",
          status: "active",
          max_listings: realtorData.max_active_listings || 15,
          featured_listings: 0
        });
      } else {
        console.log("RealtorDashboard: Imobiliária sem plano ativo. Status:", realtorData.status, "Subscription Status:", realtorData.subscription_status);
      }

    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
      toast({
        title: "Erro ao carregar dashboard",
        description: "Não foi possível carregar os dados do perfil. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    const checkInfluencerStatus = async () => {
      if (realtorProfile?.id && currentUser?.id) {
        try {
          const influencers = await Influencer.filter({
            user_id: currentUser.id,
            // entity_type: 'realtor'
          });
          setIsInfluencer(influencers && influencers.length > 0);
          if (influencers && influencers.length > 0 && !currentUser.influencer_id) {
            const updatedUser = {...currentUser, influencer_id: influencers[0].id};
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            setCurrentUser(updatedUser);
          }
        } catch (error) {
          console.error("Erro ao verificar status de influenciador:", error);
        }
      }
    };

    if (realtorProfile && currentUser) {
        checkInfluencerStatus();
    }
  }, [realtorProfile, currentUser]);


  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    User.logout().then(() => {
        navigate(createPageUrl("Public"));
    }).catch(() => {
        navigate(createPageUrl("Public"));
    });
  };

  const handleCreateProperty = () => {
    navigate(createPageUrl("PropertyForm"));
  };

  const getStatusMessage = () => {
    if (!realtorProfile) {
        if (currentUser?.role === 'influencer' && !currentUser.realtor_id) {
             return (
                <Card className="bg-yellow-50 border-yellow-200 mb-6 shadow">
                    <CardHeader className="pb-2">
                    <CardTitle className="text-yellow-800 text-lg">Acesso ao Painel de Influenciador</CardTitle>
                    </CardHeader>
                    <CardContent className="text-yellow-700 text-sm space-y-2">
                    <p>Você está logado como influenciador. Para gerenciar sua imobiliária, primeiro acesse seu painel de influenciador e depois troque para o perfil da imobiliária, se aplicável.</p>
                    <Button onClick={() => navigate(createPageUrl("InfluencerProfile"))} className="bg-yellow-500 hover:bg-yellow-600 text-white">
                        Ir para Painel de Influenciador
                    </Button>
                    </CardContent>
                </Card>
            );
        }
        return null;
    }
    
    const currentAnnouncements = properties.length;
    const maxAnnouncements = subscription?.max_listings || realtorProfile.max_active_listings || 15;
    const canAddMore = currentAnnouncements < maxAnnouncements;
    
    if (realtorProfile.status === 'pending') {
      return (
        <Card className="bg-yellow-50 border-yellow-200 mb-6 shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-yellow-800 text-lg flex items-center"><AlertTriangle className="mr-2"/> Cadastro em Análise</CardTitle>
          </CardHeader>
          <CardContent className="text-yellow-700 text-sm space-y-1">
            <p>Seu perfil de imobiliária está sendo analisado. Você será notificado assim que for aprovado.</p>
            <p>Enquanto isso, explore as funcionalidades do painel.</p>
          </CardContent>
        </Card>
      );
    }
    
    if (realtorProfile.status === 'rejected') {
       return (
        <Card className="bg-red-50 border-red-200 mb-6 shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-800 text-lg flex items-center"><XCircle className="mr-2"/> Cadastro Rejeitado</CardTitle>
          </CardHeader>
          <CardContent className="text-red-700 text-sm space-y-1">
            <p>Houve um problema com seu cadastro. Por favor, verifique seu email ou entre em contato para mais detalhes.</p>
          </CardContent>
        </Card>
      );
    }

    if (!subscription || subscription.status !== 'active') {
      return (
        <Card className="bg-orange-50 border-orange-200 mb-6 shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-orange-800 text-lg flex items-center"><CreditCard className="mr-2"/> Plano Necessário</CardTitle>
          </CardHeader>
          <CardContent className="text-orange-700 text-sm space-y-2">
            <p>Para anunciar seus imóveis e ter acesso completo às ferramentas, você precisa de um plano ativo.</p>
            <Button onClick={() => navigate(createPageUrl("SubscriptionPlans?tab=realtor"))} className="bg-orange-500 hover:bg-orange-600 text-white">
              Ver Planos
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <Card className="bg-blue-50 border-blue-200 mb-6 shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-blue-800 text-lg">Bem-vindo, {realtorProfile.company_name}!</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700 text-sm space-y-1">
          <p>Você tem <strong>{currentAnnouncements}</strong> de <strong>{maxAnnouncements}</strong> imóveis cadastrados.</p>
          {!canAddMore && <p className="text-red-600 font-semibold">Você atingiu o limite de anúncios do seu plano.</p>}
          <p>Você tem <strong>{subscription.featured_listings || 0}</strong> anúncios em destaque disponíveis.</p>
        </CardContent>
      </Card>
    );
  };

  const navigateToInfluencerProfile = async () => {
    if (currentUser && currentUser.role === 'realtor' && currentUser.influencer_id) {
      const influencerContext = {
        ...currentUser,
        role: 'influencer',
      };
      localStorage.setItem('currentUser', JSON.stringify(influencerContext));
      sessionStorage.setItem('currentUser', JSON.stringify(influencerContext));
      
      navigate(createPageUrl("InfluencerProfile"));
      window.location.reload();
    } else if (currentUser && currentUser.role === 'influencer' && currentUser.influencer_id) {
        navigate(createPageUrl("InfluencerProfile"));
    } else {
      toast({title: "Ação Inválida", description: "Perfil de influenciador não associado ou você não está no contexto correto.", variant: "destructive"});
    }
  };

  const handleFeatureProperty = async (propertyId, currentFeaturedStatus) => {
    toast({ title: "Funcionalidade em breve", description: `Destaque para o imóvel ${propertyId} será implementado.`});
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Carregando seu dashboard</h2>
          <p className="text-gray-500 mt-2">Aguarde enquanto preparamos suas informações...</p>
        </div>
      </div>
    );
  }

  if (!realtorProfile && !(currentUser?.role === 'influencer' && !currentUser.realtor_id)) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
            <Building2 className="w-16 h-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Perfil de Imobiliária Não Encontrado</h2>
            <p className="text-gray-500 mb-6">Não foi possível carregar as informações da sua imobiliária. Isso pode acontecer se seu cadastro ainda não foi processado ou se houve um erro.</p>
            <div className="space-x-4">
                <Button onClick={() => navigate(createPageUrl("UserAccount"))}>Minha Conta</Button>
                <Button variant="outline" onClick={loadData}>Tentar Novamente</Button>
            </div>
        </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="bg-white border-b shadow-sm rounded-t-lg">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                {realtorProfile?.logo_url ? (
                  <img src={realtorProfile.logo_url} alt="Logo" className="h-10 w-10 rounded-full object-cover mr-3"/>
                ) : (
                  <Building2 className="h-10 w-10 text-blue-600 mr-3" />
                )}
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                    {realtorProfile?.company_name || "Dashboard Imobiliário"}
                  </h1>
                  <p className="text-xs text-gray-500">
                    {realtorProfile?.creci ? `CRECI: ${realtorProfile.creci}` : (currentUser?.email || '')}
                  </p>
                </div>
              </div>
              
              <nav className="flex items-center space-x-2 md:space-x-4">
                <Button variant="ghost" size="sm" className="text-gray-600 hidden md:inline-flex" onClick={() => navigate(createPageUrl("Public"))}>
                  Site Principal
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Sair</span>
                </Button>
              </nav>
            </div>
          </div>
        </header>

        {getStatusMessage()}
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <div className="space-y-4 sticky top-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Menu Principal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 pt-0">
                  {[
                    { label: "Visão Geral", icon: LayoutDashboard, tab: "overview" },
                    { label: "Meus Imóveis", icon: ListChecks, tab: "listings" },
                    { label: "Clientes Interessados", icon: Users, tab: "leads" },
                    { label: "Desempenho", icon: BarChart2, tab: "performance" },
                    { label: "Meu Plano", icon: CreditCard, tab: "plan" },
                  ].map(item => (
                    <Button 
                      key={item.tab}
                      variant={activeSubTab === item.tab ? "secondary" : "ghost"} 
                      className="w-full justify-start" 
                      onClick={() => setActiveSubTab(item.tab)}
                    >
                      <item.icon className={`h-4 w-4 mr-2 ${activeSubTab === item.tab ? 'text-blue-600' : 'text-gray-500'}`} />
                      {item.label}
                    </Button>
                  ))}
                </CardContent>
              </Card>
              
              {isInfluencer && realtorProfile && (
                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center text-amber-700">
                      <StarIcon className="mr-2 h-4 w-4" />
                      Sou Influenciador
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-gray-600 mb-2">
                      Acesse seu painel de influenciador para ver ganhos e links.
                    </p>
                    <Button 
                      onClick={navigateToInfluencerProfile}
                      className="w-full text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                      size="sm"
                    >
                      Acessar Painel Influenciador
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              {!isInfluencer && realtorProfile && (
                  <Card className="border-dashed border-gray-300">
                      <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center text-gray-700">
                              <StarIcon className="mr-2 h-4 w-4 text-gray-400" />
                              Seja um Influenciador
                          </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                          <p className="text-xs text-gray-600 mb-2">
                              Indique corretores e ganhe comissões.
                          </p>
                          <BecomeInfluencerButton 
                            entity={currentUser}
                            entityType="user"
                            entityId={currentUser?.id}
                            className="w-full text-xs"
                          />
                      </CardContent>
                  </Card>
              )}

            </div>
          </div>
          
          <div className="md:col-span-3 space-y-6">
            {activeSubTab === 'overview' && (
              <Card>
                <CardHeader>
                  <CardTitle>Visão Geral da Imobiliária</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <InfoPill title="Total de Imóveis" value={properties.length} icon={Home} />
                    <InfoPill title="Imóveis Ativos" value={properties.filter(p => p.status === "active").length} icon={CheckCircle2} color="text-green-600"/>
                    <InfoPill title="Visualizações Totais" value={properties.reduce((sum, p) => sum + (p.views_count || 0), 0)} icon={Eye} />
                  </div>
                  <Button 
                    onClick={handleCreateProperty}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                    disabled={!subscription || subscription.status !== 'active' || properties.length >= (subscription?.max_listings || 0) }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Novo Imóvel
                  </Button>
                  {(!subscription || subscription.status !== 'active' || properties.length >= (subscription?.max_listings || 0)) && (
                    <p className="text-xs text-red-500 mt-1">
                        {properties.length >= (subscription?.max_listings || 0) ? "Limite de anúncios atingido." : "Você precisa de um plano ativo para adicionar imóveis."}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {activeSubTab === 'listings' && (
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <CardTitle>Meus Imóveis ({properties.length})</CardTitle>
                    <Button 
                      onClick={handleCreateProperty}
                      className="bg-blue-600 hover:bg-blue-700"
                      size="sm"
                      disabled={!subscription || subscription.status !== 'active' || properties.length >= (subscription?.max_listings || 0) }
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Imóvel
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {properties.length === 0 ? (
                    <div className="text-center py-12">
                      <Home className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900">Nenhum imóvel cadastrado</h3>
                      <p className="text-gray-500 mt-1 mb-4">Comece a cadastrar seus imóveis agora mesmo.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {properties.map(prop => (
                        <Card key={prop.id} className="overflow-hidden">
                          <div className="flex flex-col sm:flex-row">
                            <img 
                              src={prop.main_image_url || 'https://placehold.co/600x400/EAEAEA/gray?text=Imóvel'} 
                              alt={prop.title} 
                              className="w-full sm:w-48 h-32 sm:h-auto object-cover"
                            />
                            <div className="p-4 flex-grow">
                              <div className="flex justify-between items-start">
                                <h4 className="font-semibold text-lg mb-1">{prop.title}</h4>
                                <Badge 
                                  variant={prop.status === 'active' ? 'default' : prop.status === 'pending' ? 'outline' : 'destructive'}
                                  className={`capitalize ${prop.status === 'active' ? 'bg-green-100 text-green-700' : prop.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}
                                >
                                  {prop.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-500 flex items-center mb-1">
                                <MapPin className="w-3 h-3 mr-1"/> {prop.address}, {prop.neighborhood}
                              </p>
                              <p className="text-sm text-blue-600 font-medium mb-2">
                                <DollarSign className="w-3 h-3 mr-1 inline"/>
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(prop.price || 0)}
                              </p>
                              <div className="flex flex-wrap gap-2 mt-auto">
                                <Button size="sm" variant="outline" onClick={() => navigate(createPageUrl(`PropertyDetail?id=${prop.id}`))}>
                                  <Eye className="h-3 w-3 mr-1" /> Ver
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => navigate(createPageUrl(`PropertyForm?id=${prop.id}`))}>
                                  <Edit className="h-3 w-3 mr-1" /> Editar
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant={prop.is_featured ? "default" : "outline"}
                                  onClick={() => handleFeatureProperty(prop.id, prop.is_featured)}
                                  className={prop.is_featured ? "bg-amber-500 hover:bg-amber-600" : ""}
                                >
                                  <StarIcon className={`h-3 w-3 mr-1 ${prop.is_featured ? "text-white fill-white" : ""}`} /> 
                                  {prop.is_featured ? "Destaque" : "Destacar"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeSubTab === 'leads' && (
              <Card>
                <CardHeader>
                  <CardTitle>Clientes Interessados</CardTitle>
                </CardHeader>
                <CardContent>
                  {leads.length === 0 ? (
                    <p>Nenhum cliente interessado no momento.</p>
                  ) : (
                    <div className="space-y-3">
                      {leads.map(lead => (
                        <div key={lead.id} className="flex justify-between items-center p-3 border rounded-md">
                          <div>
                            <p className="font-medium">{lead.name}</p>
                            <p className="text-sm text-gray-600">Interesse em: {lead.property}</p>
                            <p className="text-xs text-gray-400">Data: {lead.date}</p>
                          </div>
                          <Badge>{lead.status}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeSubTab === 'performance' && (
              <Card>
                <CardHeader>
                  <CardTitle>Relatório de Desempenho</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <InfoPill title="Visualizações (30d)" value={performanceData.viewsLast30Days} icon={Eye} />
                    <InfoPill title="Leads Gerados (30d)" value={performanceData.leadsLast30Days} icon={Users} />
                    <InfoPill title="Taxa de Conversão" value={performanceData.conversionRate} icon={TrendingUp} />
                  </div>
                  <p className="text-center text-gray-500">(Gráfico de desempenho em breve)</p>
                </CardContent>
              </Card>
            )}
            
            {activeSubTab === 'plan' && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Meu Plano de Assinatura</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    {subscription?.status === "active" ? (
                      <>
                        <p className="text-sm text-gray-700 mb-1">
                          Plano atual: <span className="font-semibold">{subscription.plan_name}</span>
                        </p>
                        <p className="text-sm text-gray-500">
                          Limite de anúncios: {subscription.max_listings}
                        </p>
                         <p className="text-sm text-gray-500">
                          Anúncios em destaque: {subscription.featured_listings}
                        </p>
                        {subscription.end_date && <p className="text-xs text-gray-400">Válido até: {new Date(subscription.end_date).toLocaleDateString()}</p>}
                      </>
                    ) : (
                      <p className="text-sm text-gray-500 mb-2">
                        Você não possui um plano ativo ou seu plano expirou.
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => navigate(createPageUrl("SubscriptionPlans?tab=realtor"))}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      {subscription?.status === "active" ? "Gerenciar Plano" : "Ver Planos"}
                    </Button>
                  </CardFooter>
                </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const InfoPill = ({ title, value, icon: Icon, color = "text-blue-600" }) => (
  <div className="bg-gray-100 p-4 rounded-lg text-center border">
    <Icon className={`w-6 h-6 ${color} mx-auto mb-2`} />
    <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </div>
);
