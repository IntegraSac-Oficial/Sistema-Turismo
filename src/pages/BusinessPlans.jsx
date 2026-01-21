
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { SubscriptionPlan } from "@/api/entities";
import { Business } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UploadFile } from "@/api/integrations";
import { createCheckoutSession } from "@/api/functions";
import { toast } from "@/components/ui/use-toast";
import {
  Check,
  Shield,
  CreditCard,
  ArrowLeft,
  Star,
  ChevronLeft,
  ExternalLink,
  Loader2,
  Clock,
  Building,
  Store,
  Globe,
  CheckCircle,
  Image,
  Search,
  Users
} from "lucide-react";
import PixPaymentModal from "@/components/payment/PixPaymentModal";

export default function BusinessPlans() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [business, setBusiness] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Carregar planos para negócios
        const plansData = await SubscriptionPlan.list();
        const businessPlans = plansData.filter(plan => 
          plan.is_active && plan.plan_type === "business"
        );
        setPlans(businessPlans);
        
        // Carregar usuário atual
        const userData = await User.me();
        setCurrentUser(userData);
        
        // Carregar negócio do usuário
        const businessData = await Business.filter({
          business_email: userData.email
        });
        
        if (businessData && businessData.length > 0) {
          setBusiness(businessData[0]);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast({
          title: "Erro",
          description: "Falha ao carregar planos. Tente novamente mais tarde.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  const handlePayWithPix = (plan) => {
    setSelectedPlan(plan);
    setPixModalOpen(true);
  };
  
  const handlePayWithCard = async (plan) => {
    try {
      setIsPaymentLoading(true);
      
      if (!plan.stripe_price_id) {
        toast({
          title: "Erro",
          description: "Este plano não está configurado para pagamento com cartão",
          variant: "destructive"
        });
        return;
      }
      
      const response = await createCheckoutSession({
        priceId: plan.stripe_price_id,
        planName: plan.name,
        businessId: business?.id
      });
      
      if (response?.url) {
        // Atualizar status do business para pending
        if (business) {
          await Business.update(business.id, {
            subscription_status: "pending",
            subscription_plan_id: plan.id,
            subscription_payment_method: "card",
            subscription_start_date: new Date().toISOString().split('T')[0]
          });
        }
        
        window.location.href = response.url;
      } else {
        throw new Error("URL de checkout não encontrada");
      }
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      toast({
        title: "Erro no pagamento",
        description: error.message || "Não foi possível processar seu pagamento",
        variant: "destructive"
      });
    } finally {
      setIsPaymentLoading(false);
    }
  };
  
  const handlePixConfirm = async () => {
    if (!selectedPlan || !business) return;
    
    try {
      // Garantir que os campos obrigatórios estejam no formato correto
      const businessData = {
        ...business
      };
      
      // Corrigir campos se necessário
      if (businessData.name && !businessData.business_name) {
        businessData.business_name = businessData.name;
        delete businessData.name;
      }
      
      if (businessData.type && !businessData.business_type) {
        businessData.business_type = businessData.type;
        delete businessData.type;
      }
      
      if (businessData.email && !businessData.business_email) {
        businessData.business_email = businessData.email;
        delete businessData.email;
      }
      
      // Adicionar campos de assinatura
      businessData.subscription_status = "pending";
      businessData.subscription_plan_id = selectedPlan.id;
      businessData.subscription_payment_method = "pix";
      businessData.subscription_start_date = new Date().toISOString().split('T')[0];
      businessData.subscription_notes = "Aguardando confirmação de pagamento PIX";
      
      console.log("Enviando dados:", businessData);
      
      // Atualizar business
      await Business.update(business.id, businessData);
      
      setPixModalOpen(false);
      
      toast({
        title: "Pagamento Iniciado",
        description: "Aguarde a confirmação do pagamento PIX. Você receberá uma notificação quando seu plano for ativado.",
      });
      
      // Redirecionar para perfil após alguns segundos
      setTimeout(() => {
        navigate(createPageUrl("BusinessProfile"));
      }, 3000);
    } catch (error) {
      console.error("Erro ao registrar pagamento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar seu pagamento. Por favor, tente novamente.",
        variant: "destructive"
      });
    }
  };
  
  const renderFeatureItem = (text) => (
    <div className="flex items-start mb-2">
      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
      <span className="text-gray-700">{text}</span>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("BusinessProfile"))}
          className="mb-6"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Voltar ao perfil
        </Button>
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Planos para seu Negócio</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Escolha o plano ideal para aumentar a visibilidade do seu negócio e atrair mais clientes
          </p>
        </div>
        
        {business?.subscription_status === "active" && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center mb-2">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <h2 className="font-semibold text-green-800">Você já possui uma assinatura ativa</h2>
            </div>
            <p className="text-green-700 mb-2">
              Seu negócio está visível para todos os usuários até {business.subscription_end_date && new Date(business.subscription_end_date).toLocaleDateString('pt-BR')}
            </p>
            <p className="text-sm text-green-600">
              Você pode assinar um novo plano para estender sua assinatura ou fazer upgrade.
            </p>
          </div>
        )}
        
        {business?.subscription_status === "pending" && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center mb-2">
              <Clock className="h-5 w-5 text-yellow-600 mr-2" />
              <h2 className="font-semibold text-yellow-800">Pagamento em processamento</h2>
            </div>
            <p className="text-yellow-700">
              Seu pagamento está sendo processado. Assim que confirmado, seu negócio será listado publicamente.
            </p>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            <span className="ml-3 text-lg text-gray-600">Carregando planos...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map(plan => (
              <Card key={plan.id} className={`overflow-hidden ${plan.is_featured ? 'border-2 border-indigo-500 shadow-md' : ''}`}>
                {plan.is_featured && (
                  <div className="bg-indigo-500 text-white text-center py-1 text-sm font-medium">
                    Mais Popular
                  </div>
                )}
                
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">R$ {parseFloat(plan.price).toFixed(2)}</span>
                    <span className="text-gray-500 ml-1">/{plan.period}</span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {renderFeatureItem("Listagem no catálogo público")}
                      {renderFeatureItem("Perfil detalhado de negócio")}
                      {renderFeatureItem(`${plan.features?.includes("premium_gallery") ? "Galeria com até 10 fotos" : "Galeria com até 5 fotos"}`)}
                      
                      {plan.features?.includes("featured_listing") && 
                        renderFeatureItem("Destaque nas listagens")}
                      
                      {plan.features?.includes("city_highlight") && 
                        renderFeatureItem("Destaque na página da cidade")}
                      
                      {plan.features?.includes("products_listing") && 
                        renderFeatureItem("Listagem de produtos ilimitada")}
                      
                      {plan.features?.includes("analytics") && 
                        renderFeatureItem("Acesso a estatísticas e análises")}
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col gap-3 pt-2">
                  <Button 
                    className={`w-full ${plan.is_featured ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                    onClick={() => handlePayWithCard(plan)}
                    disabled={isPaymentLoading}
                  >
                    {isPaymentLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CreditCard className="mr-2 h-4 w-4" />
                    )}
                    Pagar com Cartão
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => handlePayWithPix(plan)}
                    disabled={isPaymentLoading}
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 4L9 7H5V11L2 14L5 17V21H9L12 24L15 21H19V17L22 14L19 11V7H15L12 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Pagar com PIX
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        
        <div className="mt-16 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4">Vantagens de Assinar um Plano</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Globe className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Maior Visibilidade</h3>
              <p className="text-gray-600">
                Seu negócio aparecerá nas buscas e listagens públicas, aumentando sua exposição para turistas e moradores.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Store className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Perfil Completo</h3>
              <p className="text-gray-600">
                Apresente seu negócio com imagens, descrições detalhadas, horários e informações de contato.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="font-semibold mb-2">Novos Clientes</h3>
              <p className="text-gray-600">
                Alcance novos clientes interessados em serviços e produtos na região de praias catarinenses.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal para Pagamento PIX */}
      {selectedPlan && (
        <PixPaymentModal
          isOpen={pixModalOpen}
          onClose={() => setPixModalOpen(false)}
          pixKey="contato.jrsn@gmail.com"
          pixKeyType="EMAIL"
          amount={selectedPlan.price}
          businessName="Praias Catarinenses"
          onConfirm={handlePixConfirm}
        />
      )}
    </div>
  );
}
