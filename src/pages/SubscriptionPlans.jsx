
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom"; 
import { createPageUrl } from "@/utils";
import { SubscriptionPlan } from "@/api/entities";
import { User } from "@/api/entities";
import { Tourist } from "@/api/entities";
import { SiteConfig } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  X,
  CalendarRange,
  DollarSign,
  Crown,
  Users,
  Building,
  Wrench,
  Star,
  ChevronLeft,
  ArrowRight,
  ExternalLink,
  CreditCard,
  CheckCircle2,
  Shield,
  Smartphone,
  Loader2,
  Building2,
  Home
} from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import PixPaymentModal from "@/components/payment/PixPaymentModal";
import StripeModal from "@/components/payment/StripeModal";
import { toast } from "@/components/ui/use-toast";
import { stripeIntegration } from "@/api/functions";
import { createCheckoutSession } from "@/api/functions";

export default function SubscriptionPlans() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("tourist");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [stripeModalOpen, setStripeModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("card"); // "card" ou "pix"
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [siteConfig, setSiteConfig] = useState(null);
  const [referralCode, setReferralCode] = useState(null);

  const tabMapping = {
    comercio: "business",
    prestador: "provider",
    imoveis: "realtor"
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && tabMapping[tabParam]) {
      setActiveTab(tabMapping[tabParam]);
    } else {
      setActiveTab("tourist");
    }
  }, [location.search]);

  const periods = {
    mensal: "Mensal",
    trimestral: "Trimestral",
    semestral: "Semestral",
    anual: "Anual"
  };

  const planTypes = [
    { value: "tourist", label: "Para Turistas", icon: Users },
    { value: "business", label: "Para Comércios", icon: Building2 },
    { value: "provider", label: "Para Prestadores", icon: Wrench },
    { value: "realtor", label: "Para Imobiliárias", icon: Home },
    { value: "all", label: "Todos os Planos", icon: Crown }
  ];

  useEffect(() => {
    const loadPlans = async () => {
      setIsLoading(true);
      try {
        const allPlans = await SubscriptionPlan.list();
        const filteredPlans = allPlans.filter(plan => 
          plan.is_active && 
          (activeTab === "all" ? true : plan.plan_type === activeTab)
        );
        
        const sortedPlans = filteredPlans.sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return a.position - b.position;
        });
        
        setPlans(sortedPlans);
        
        const configs = await SiteConfig.list();
        if (configs && configs.length > 0) {
          setSiteConfig(configs[0]);
        }
      } catch (error) {
        console.error("Erro ao carregar planos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPlans();
    
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (isLoggedIn) {
      const checkUserSession = async () => {
        try {
          const userData = await User.me();
          if (userData) {
            console.log("Usuário logado:", userData.full_name);
            setIsAuthenticated(true);
            setCurrentUser(userData);
          }
        } catch (error) {
          console.error("Erro ao verificar sessão do usuário:", error);
        }
      };
      
      checkUserSession();
    }

    if (searchParams.get("ref")) {
      localStorage.setItem("referralCode", searchParams.get("ref"));
      console.log("Código de referência armazenado:", searchParams.get("ref"));
    }
  }, [activeTab, searchParams]);

  // Verificar se o usuário veio por um link de afiliado (código de referência)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    
    if (ref) {
      // Salvar o código de referência no localStorage (validade de 30 dias)
      localStorage.setItem('referralCode', ref);
      localStorage.setItem('referralExpiry', Date.now() + (30 * 24 * 60 * 60 * 1000)); // 30 dias
      setReferralCode(ref);
      console.log('Código de referência detectado:', ref);
    } else {
      // Verificar se existe um código salvo que ainda é válido
      const savedRef = localStorage.getItem('referralCode');
      const expiryTime = localStorage.getItem('referralExpiry');
      
      if (savedRef && expiryTime && Date.now() < Number(expiryTime)) {
        setReferralCode(savedRef);
        console.log('Usando código de referência salvo:', savedRef);
      }
    }
  }, []);

  const handlePaymentSuccess = () => {
    toast({
      title: "Pagamento Registrado",
      description: "Aguarde a confirmação do seu pagamento PIX.",
      variant: "success"
    });
  };

  const handlePayWithPix = (plan) => {
    try {
      // Log para debug
      console.log("Iniciando pagamento PIX. Verificando configurações...");
      
      // Buscar configurações PIX das configurações do site
      if (siteConfig?.pagamentos?.pix?.key) {
        console.log("Chave PIX encontrada:", {
          key: siteConfig.pagamentos.pix.key,
          type: siteConfig.pagamentos.pix.key_type,
          beneficiario: siteConfig.pagamentos.pix.beneficiario || "Praias Catarinenses"
        });
        
        // Abrir modal PIX com os dados corretos
        setSelectedPlan(plan);
        setPixModalOpen(true);
      } else {
        console.error("Chave PIX não configurada no sistema");
        toast({
          title: "Pagamento PIX indisponível",
          description: "No momento não é possível realizar pagamentos via PIX. Por favor, tente outro método.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao iniciar pagamento PIX:", error);
      toast({
        title: "Erro no pagamento",
        description: "Não foi possível processar seu pagamento PIX. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handlePayWithStripe = async (plan) => {
    try {
      setIsLoading(true);
      
      if (!plan.stripe_price_id) {
        toast({
          title: "Erro",
          description: "Este plano não está configurado para pagamento com cartão",
          variant: "destructive"
        });
        return;
      }

      console.log("Iniciando checkout com Stripe para o plano:", {
        planName: plan.name,
        priceId: plan.stripe_price_id
      });

      const response = await createCheckoutSession({
        priceId: plan.stripe_price_id
      });

      console.log("Resposta completa do checkout:", response);

      // Verificar a resposta de diferentes formas possíveis
      const checkoutUrl = response?.url || response?.data?.url;

      if (!checkoutUrl) {
        console.error("Resposta sem URL:", response);
        throw new Error("URL de checkout não encontrada na resposta");
      }

      console.log("Redirecionando para:", checkoutUrl);
      window.location.href = checkoutUrl;

    } catch (error) {
      console.error("Erro detalhado no checkout:", error);
      toast({
        title: "Erro no pagamento",
        description: error.message || "Não foi possível processar o pagamento. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = async (plan) => {
    try {
      setIsLoading(true);
      
      const storedReferralCode = localStorage.getItem("referralCode");
      
      if (storedReferralCode) {
        console.log("Usando código de referência:", storedReferralCode);
      }
      
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      
      if (!isLoggedIn) {
        setSelectedPlan(plan);
        setShowLoginModal(true);
      } else {
        navigate(createPageUrl(`Checkout?plan_id=${plan.id}`));
      }
    } catch (error) {
      console.error("Erro ao processar checkout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPlans = plans.filter(plan => plan.plan_type === activeTab);

  const renderSkeletons = () => {
    return Array.from({ length: 3 }).map((_, index) => (
      <Card key={index} className="animate-pulse">
        <div className="h-40 bg-gray-200 rounded-t-lg"></div>
        <CardHeader>
          <div className="h-7 w-3/4 bg-gray-200 rounded mb-2"></div>
          <div className="h-5 w-1/2 bg-gray-200 rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </CardFooter>
      </Card>
    ));
  };

  const renderPlanCard = (plan, isPlanInDestaque = false) => {
    const handleSubscription = async (plan) => {
        try {
          setIsLoading(true);
          const storedReferralCode = localStorage.getItem("referralCode");
    
          const checkoutOptions = {
            priceId: plan.stripe_price_id,
            metadata: {
              ...(storedReferralCode ? { referralCode: storedReferralCode } : {})
            }
          };
    
          const response = await createCheckoutSession(checkoutOptions);
    
          const checkoutUrl = response?.url || response?.data?.url;
    
          console.log("URL encontrada:", checkoutUrl);
    
          if (checkoutUrl) {
            window.location.href = checkoutUrl;
          } else {
            throw new Error(`URL não encontrada na resposta: ${JSON.stringify(response)}`);
          }
        } catch (error) {
          console.error("Erro ao iniciar o checkout:", error);
            toast({
              title: "Erro no pagamento",
              description: "Detalhes no console do navegador",
              variant: "destructive"
            });
        } finally {
          setIsLoading(false);
        }
      };

    return (
      <div 
        key={plan.id} 
        className={`bg-white rounded-lg shadow-md overflow-hidden ${isPlanInDestaque ? 'border-2 border-[#FF5722]' : 'border border-gray-200'}`}
      >
        <div className={`p-6 ${isPlanInDestaque ? 'bg-gradient-to-br from-[#FF5722]/10 to-[#FF9800]/5' : 'bg-white'}`}>
          <h3 className="text-2xl font-bold mb-2 text-gray-900">{plan.name}</h3>
          <p className="text-gray-500 mb-4">{plan.description}</p>
          
          <div className="mb-6">
            <span className="text-4xl font-bold text-gray-900">R$ {plan.price.toFixed(2)}</span>
            <span className="text-gray-500">/{periods[plan.period]}</span>
          </div>
          
          <div className="space-y-3 mb-8">
            {plan.features.map((feature, idx) => (
              <div key={idx} className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
          
          <div className="space-y-2 p-6">
            <Button 
              className={`w-full ${isPlanInDestaque ? 'bg-[#FF5722] hover:bg-[#E64A19]' : 'bg-[#007BFF] hover:bg-blue-700'}`}
              onClick={() => handleSubscription(plan)}
            >
              {plan.payment_link ? (
                <>
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Pagar Agora
                </>
              ) : (
                <>
                  Assinar Agora
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
            
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={() => handlePayWithPix(plan)}
                className="flex items-center justify-center py-2 px-4 border border-[#FF5722] text-[#FF5722] rounded-md hover:bg-[#FF5722]/10 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2">
                  <path d="M22 9L12 5 2 9 12 13 22 9z"/>
                  <path d="M2 9v6l10 4 10-4V9"/>
                  <path d="M12 22V13"/>
                  <path d="M7 10.3v3"/>
                  <path d="M17 10.3v3"/>
                </svg>
                PIX
              </button>
              
              {!plan.stripe_price_id ? (
                <Button
                  onClick={() => toast({
                    title: "Pagamento indisponível",
                    description: "O pagamento com cartão está temporariamente indisponível para este plano. Por favor, use outro método de pagamento.",
                    variant: "destructive"
                  })}
                  disabled
                  className="flex items-center justify-center py-2 px-4 border border-gray-300 text-gray-400 rounded-md cursor-not-allowed"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Cartão
                </Button>
              ) : (
                <Button 
                  onClick={() => handlePayWithStripe(plan)}
                  className="flex items-center justify-center py-2 px-4 border border-[#007BFF] text-[#007BFF] rounded-md hover:bg-[#007BFF]/10 transition-colors"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Cartão
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader siteConfig={siteConfig} currentUser={currentUser} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Planos de Assinatura</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Escolha o plano ideal para você e aproveite ao máximo sua experiência em Santa Catarina.
          </p>
        </div>

        <Tabs defaultValue="tourist" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-center gap-2 bg-transparent flex flex-wrap mb-8">
            <TabsTrigger value="tourist" className="data-[state=active]:bg-[#007BFF] data-[state=active]:text-white px-4 py-2 rounded-full transition-colors duration-200">
              <Users className="w-4 h-4 mr-2" />
              Para Turistas
            </TabsTrigger>
            <TabsTrigger value="business" className="data-[state=active]:bg-[#007BFF] data-[state=active]:text-white px-4 py-2 rounded-full transition-colors duration-200">
              <Building2 className="w-4 h-4 mr-2" />
              Para Comércios
            </TabsTrigger>
            <TabsTrigger value="provider" className="data-[state=active]:bg-[#007BFF] data-[state=active]:text-white px-4 py-2 rounded-full transition-colors duration-200">
              <Wrench className="w-4 h-4 mr-2" />
              Para Prestadores
            </TabsTrigger>
            <TabsTrigger value="realtor" className="data-[state=active]:bg-[#007BFF] data-[state=active]:text-white px-4 py-2 rounded-full transition-colors duration-200">
              <Home className="w-4 h-4 mr-2" />
              Para Imobiliárias
            </TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-[#007BFF] data-[state=active]:text-white px-4 py-2 rounded-full transition-colors duration-200">
              <Crown className="w-4 h-4 mr-2" />
              Todos os Planos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tourist">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {renderSkeletons()}
              </div>
            ) : filteredPlans.filter(plan => plan.plan_type === "tourist").length === 0 ? (
              <div className="text-center py-16">
                <Crown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Nenhum plano disponível
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                  No momento, não há planos disponíveis para este tipo de usuário. 
                  Por favor, verifique novamente mais tarde.
                </p>
                <Button 
                  onClick={() => navigate(createPageUrl("Public"))}
                  className="bg-[#007BFF] hover:bg-blue-700"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Voltar para a Página Inicial
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {filteredPlans.filter(plan => plan.plan_type === "tourist").map(plan => renderPlanCard(plan, plan.is_featured))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="business">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {renderSkeletons()}
              </div>
            ) : filteredPlans.filter(plan => plan.plan_type === "business").length === 0 ? (
              <div className="text-center py-16">
                <Crown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Nenhum plano disponível
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                  No momento, não há planos disponíveis para este tipo de usuário. 
                  Por favor, verifique novamente mais tarde.
                </p>
                <Button 
                  onClick={() => navigate(createPageUrl("Public"))}
                  className="bg-[#007BFF] hover:bg-blue-700"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Voltar para a Página Inicial
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {filteredPlans.filter(plan => plan.plan_type === "business").map(plan => renderPlanCard(plan, plan.is_featured))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="provider">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {renderSkeletons()}
              </div>
            ) : filteredPlans.filter(plan => plan.plan_type === "provider").length === 0 ? (
              <div className="text-center py-16">
                <Crown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Nenhum plano disponível
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                  No momento, não há planos disponíveis para este tipo de usuário. 
                  Por favor, verifique novamente mais tarde.
                </p>
                <Button 
                  onClick={() => navigate(createPageUrl("Public"))}
                  className="bg-[#007BFF] hover:bg-blue-700"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Voltar para a Página Inicial
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {filteredPlans.filter(plan => plan.plan_type === "provider").map(plan => renderPlanCard(plan, plan.is_featured))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="realtor">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {renderSkeletons()}
              </div>
            ) : filteredPlans.filter(plan => plan.plan_type === "realtor").length === 0 ? (
              <div className="text-center py-16">
                <Crown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Nenhum plano disponível
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                  No momento, não há planos disponíveis para este tipo de usuário. 
                  Por favor, verifique novamente mais tarde.
                </p>
                <Button 
                  onClick={() => navigate(createPageUrl("Public"))}
                  className="bg-[#007BFF] hover:bg-blue-700"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Voltar para a Página Inicial
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {filteredPlans.filter(plan => plan.plan_type === "realtor").map(plan => renderPlanCard(plan, plan.is_featured))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {renderSkeletons()}
              </div>
            ) : filteredPlans.length === 0 ? (
              <div className="text-center py-16">
                <Crown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Nenhum plano disponível
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                  No momento, não há planos disponíveis para este tipo de usuário. 
                  Por favor, verifique novamente mais tarde.
                </p>
                <Button 
                  onClick={() => navigate(createPageUrl("Public"))}
                  className="bg-[#007BFF] hover:bg-blue-700"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Voltar para a Página Inicial
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {filteredPlans.map(plan => renderPlanCard(plan, plan.is_featured))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Dúvidas sobre nossos planos?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Entre em contato com nossa equipe para obter mais informações sobre os planos de assinatura ou solicitar um plano personalizado para sua empresa.
          </p>
          <Button 
            className="bg-[#007BFF] hover:bg-blue-700"
            onClick={() => navigate(createPageUrl("Public"))}
          >
            Fale Conosco
          </Button>
        </div>
      </div>

      {selectedPlan && (
        <>
          <PixPaymentModal
            isOpen={pixModalOpen}
            onClose={() => setPixModalOpen(false)}
            pixKey={siteConfig?.pagamentos?.pix?.key || ""}
            pixKeyType={siteConfig?.pagamentos?.pix?.key_type || "CPF"}
            amount={selectedPlan.price}
            businessName={siteConfig?.pagamentos?.pix?.beneficiario || "Praias Catarinenses"}
          />
          
          <StripeModal
            isOpen={stripeModalOpen}
            onClose={() => setStripeModalOpen(false)}
            planName={selectedPlan.name}
            planId={selectedPlan.id}
            planPrice={parseFloat(selectedPlan.price)}
            paymentMethod={paymentMethod}
            onSuccess={handlePaymentSuccess}
          />
        </>
      )}

      <PublicFooter siteConfig={siteConfig} />
    </div>
  );
}
