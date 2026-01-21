
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Business } from "@/api/entities";
import { BusinessCredential } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, Phone, MapPin, Mail, Store, Edit, Image, ExternalLink, Clock, Globe,
  ShoppingBag, Percent, BarChart, DollarSign, Wallet, CreditCard, Save, CheckCircle, Home,
  Eye, Package, TrendingUp, Users, QrCode, LayoutDashboard, Gift, ListChecks, Star
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { User } from "@/api/entities";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Calendar, AlertCircle, ReceiptText } from "lucide-react";
import { Product } from "@/api/entities";
import { Transaction } from "@/api/entities";
import BecomeInfluencerButton from "@/components/profile/BecomeInfluencerButton";
import { Influencer } from "@/api/entities";

export default function BusinessProfile() {
  const navigate = useNavigate();
  const [siteConfig, setSiteConfig] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [paymentSettings, setPaymentSettings] = useState({
    payment_methods: {
      credit_card: false,
      pix: false,
      cash: true
    },
    bank_info: {
      bank_name: "",
      account_type: "",
      account_number: "",
      agency: "",
      pix_key: "",
      pix_key_type: "CPF"
    }
  });
  const [isSaving, setIsSaving] = useState(false);
  const [businessStats, setBusinessStats] = useState({
    productsCount: 0,
    viewsCount: 0,
    newClientsCount: 0,
    conversionRate: 0,
    recentTransactions: []
  });
  const [isInfluencer, setIsInfluencer] = useState(false);

  // Defina o array de itens da navegação aqui
  const sidebarNavItems = [
    { title: "Visão Geral", href: createPageUrl("BusinessProfile"), icon: LayoutDashboard },
    { title: "Editar Cadastro", href: createPageUrl("EditBusiness"), icon: Edit },
    { title: "Galeria de Fotos", href: createPageUrl("BusinessGallery"), icon: Image },
    { title: "Produtos/Serviços", href: createPageUrl("BusinessProducts"), icon: Package },
    { title: "Planos e Assinatura", href: createPageUrl("BusinessPlans"), icon: CreditCard },
    { title: "PDV - Fidelidade", href: createPageUrl("BusinessPointOfSale"), icon: Gift },
    { title: "Regras de Fidelidade", href: createPageUrl("BusinessLoyaltyRules"), icon: ListChecks }, // Novo item
    { title: "Meu QR de Check-in", href: createPageUrl("BusinessCheckinQR"), icon: QrCode },
  ];

  useEffect(() => {
    const checkPendingSync = async () => {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (currentUser?.pendingSync) {
        const pendingData = localStorage.getItem('pendingBusiness');
        
        if (pendingData) {
          try {
            // Tentar sincronizar dados pendentes
            const businessData = JSON.parse(pendingData);
            const newBusiness = await Business.create(businessData);
            
            // Atualizar dados do usuário
            const updatedUser = {
              ...currentUser,
              id: newBusiness.id,
              business_id: newBusiness.id,
              is_temp: false,
              pendingSync: false
            };
            
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            localStorage.removeItem('pendingBusiness');
            
            // Recarregar página para atualizar dados
            window.location.reload();
          } catch (error) {
            console.error("Erro ao sincronizar dados:", error);
            // Mostrar banner de aviso
            toast({
              title: "Sincronização pendente",
              description: "Alguns recursos podem estar limitados até a sincronização ser concluída.",
              duration: 5000
            });
          }
        }
      }
    };
    
    checkPendingSync();
  }, []);

  useEffect(() => {
    loadData();
  }, [navigate]);
  
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Verificar autenticação
      const storedUser = localStorage.getItem('currentUser');
      if (!storedUser) {
        navigate(createPageUrl("UserAccount"));
        return;
      }
      
      const userData = JSON.parse(storedUser);
      setCurrentUser(userData);
      
      // Carregar dados do negócio
      if (userData.business_id) {
        const businessData = await Business.get(userData.business_id);
        setBusiness(businessData);
        
        // Inicializar formulário com dados existentes
        setFormData({
          business_name: businessData.business_name || "",
          business_email: businessData.business_email || "",
          business_phone: businessData.business_phone || "",
          business_type: businessData.business_type || "",
          description: businessData.description || "",
          address: businessData.address || "",
          website: businessData.website || "",
          opening_hours: businessData.opening_hours || ""
        });
        
      } else {
        navigate(createPageUrl("UserAccount"));
      }
      
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do seu negócio.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      setLoading(true);

      // 1. Obter usuário atual do localStorage
      const currentUserStr = localStorage.getItem('currentUser');
      if (!currentUserStr) {
        navigate(createPageUrl("UserAccount"));
        return;
      }

      const currentUser = JSON.parse(currentUserStr);

      // 2. Buscar negócio diretamente usando o ID do negócio no usuário atual
      if (currentUser.business_id) {
        try {
          const businessData = await Business.get(currentUser.business_id);
          if (businessData) {
            setBusiness(businessData);
            return;
          }
        } catch (error) {
          console.error("Erro ao buscar negócio:", error);
        }
      }

      // 3. Se não encontrar, buscar por credenciais
      try {
        const credentials = await BusinessCredential.filter({
          email: currentUser.email
        });

        if (credentials && credentials.length > 0) {
          const businessData = await Business.get(credentials[0].business_id);
          if (businessData) {
            setBusiness(businessData);
            // Atualizar usuário no localStorage
            const updatedUser = { ...currentUser, business_id: businessData.id };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            return;
          }
        }
      } catch (error) {
          console.error("Erro ao buscar credenciais:", error);
      }

      // 4. Se não encontrar negócio, redirecionar para EditBusiness
      navigate(createPageUrl("EditBusiness"));

    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      toast({
        title: "Erro",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    navigate(createPageUrl("EditBusiness"));
  };

  const goToGallery = () => {
    navigate(createPageUrl("BusinessGallery"));
  };

  const goToProducts = () => {
    if (!business?.id) {
      toast({
        title: "Erro",
        description: "ID do comércio não encontrado",
        variant: "destructive"
      });
      return;
    }
    navigate(createPageUrl("BusinessProducts") + `?id=${business.id}`);
  };

  const goToPayments = () => {
    navigate(createPageUrl("BusinessPayments"));
  };

  const goToWallet = () => {
    navigate(createPageUrl("BusinessWallet"));
  };

  const goToSubscriptionPlans = () => {
    navigate(createPageUrl("BusinessPlans"));
  };

  useEffect(() => {
    const loadBusinessData = async () => {
        if (currentUser?.business_id) {
          try {
            const businessData = await Business.get(currentUser.business_id);
            setBusiness(businessData);
    
            // Initialize payment settings from business data
            if (businessData?.payment_settings) {
              setPaymentSettings(businessData.payment_settings);
            } else {
                 // Garante que paymentSettings tenha uma estrutura inicial válida se não vier do backend
                 setPaymentSettings({
                    payment_methods: { credit_card: false, pix: false, cash: true },
                    bank_info: { bank_name: "", account_type: "", account_number: "", agency: "", pix_key: "", pix_key_type: "CPF" }
                });
            }
          } catch (error) {
            console.error("Erro ao carregar dados do negócio:", error);
            toast({
              title: "Erro",
              description: "Não foi possível carregar os dados do seu negócio.",
              variant: "destructive"
            });
          }
        }
      };

    if (currentUser) {
      loadBusinessData();
    }
  }, [currentUser]);
  
  useEffect(() => {
    // Adicionar verificação se o negócio já é influenciador
    const checkInfluencerStatus = async () => {
      if (business?.id) {
        try {
          const influencers = await Influencer.filter({
            user_id: business.id
          });
          setIsInfluencer(influencers && influencers.length > 0);
        } catch (error) {
          console.error("Erro ao verificar status de influenciador:", error);
        }
      }
    };
    
    if (business) {
      checkInfluencerStatus();
    }
  }, [business]);
  
  // Adicionar função para verificar e corrigir as configurações de pagamento
  useEffect(() => {
    const fixPaymentSettings = async () => {
      if (business && (!business.payment_settings || !business.payment_settings.bank_info)) {
        try {
          // Criar estrutura padrão de configurações de pagamento se não existir
          const defaultPaymentSettings = {
            payment_methods: {
              credit_card: false,
              pix: false,
              cash: true
            },
            bank_info: {
              bank_name: "",
              account_type: "",
              account_number: "",
              agency: "",
              pix_key: "",
              pix_key_type: "CPF"
            }
          };
          
          console.log("Corrigindo configurações de pagamento...");
          await Business.update(business.id, {
            ...business,
            payment_settings: defaultPaymentSettings
          });
          
          // Recarregar dados
          // A função loadBusinessData será chamada implicitamente pelo useEffect que depende de 'currentUser'
          // Para garantir, podemos chamar explicitamente se necessário, mas o useEffect abaixo já faz isso.
        } catch (error) {
          console.error("Erro ao corrigir configurações de pagamento:", error);
        }
      }
    };
    
    if (business) {
      fixPaymentSettings();
    }
  }, [business]); // Dependência apenas de 'business' para esta correção.

  // Função unificada para lidar com mudanças nas configurações de pagamento
  const handlePaymentSettingsChange = (type, field, value) => {
    setPaymentSettings(prev => {
      const newSettings = { ...prev };
      if (type === 'methods') {
        newSettings.payment_methods = {
          ...newSettings.payment_methods,
          [field]: value,
        };
      } else if (type === 'bank') {
        newSettings.bank_info = {
          ...newSettings.bank_info,
          [field]: value,
        };
      }
      return newSettings;
    });
  };
  
  // Função unificada para submeter as configurações de pagamento
  const handlePaymentSettingsSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true); // Alterado de setLoading para isSaving
    
    try {
      const updatedBusiness = await Business.update(business.id, {
        ...business,
        payment_settings: paymentSettings, // Usa o estado unificado paymentSettings
      });
      
      setBusiness(updatedBusiness); // Atualiza o estado do negócio com os dados retornados
      // Atualiza também o paymentSettings local, embora o business já deva conter isso.
      if (updatedBusiness.payment_settings) {
        setPaymentSettings(updatedBusiness.payment_settings);
      }

      toast({
        title: "Configurações salvas",
        description: "As configurações de pagamento foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações de pagamento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false); // Alterado de setLoading para isSaving
    }
  };

  // A função renderPaymentSettings foi renomeada para renderPaymentsTab
  // e as funções handlePaymentMethodChange e handleBankInfoChange foram removidas
  // pois agora usamos handlePaymentSettingsChange.
  // A função handleSavePaymentSettings foi renomeada para handlePaymentSettingsSubmit.

  // Renderização da aba de pagamentos (antiga renderPaymentSettings)
  const renderPaymentsTab = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Métodos de Pagamento</CardTitle>
            <CardDescription>
              Selecione quais formas de pagamento você deseja oferecer aos clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePaymentSettingsSubmit}>
              <div className="grid gap-6">
                <div className="space-y-4">
                  <Label className="text-base">Métodos aceitos</Label>
                  
                  <div className="grid gap-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        id="credit-card" 
                        checked={paymentSettings.payment_methods?.credit_card || false} 
                        onCheckedChange={(value) => handlePaymentSettingsChange('methods', 'credit_card', value)}
                      />
                      <Label htmlFor="credit-card" className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-gray-500" />
                        Cartão de Crédito
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        id="pix" 
                        checked={paymentSettings.payment_methods?.pix || false} 
                        onCheckedChange={(value) => handlePaymentSettingsChange('methods', 'pix', value)}
                      />
                      <Label htmlFor="pix" className="flex items-center gap-2">
                        <svg viewBox="0 0 24 24" className="h-4 w-4 text-gray-500"> {/* Ícone PIX SVG */}
                          <path fill="currentColor" d="M7.03 8.94l-2.4 2.4 2.4 2.4c.41.41.41 1.07 0 1.48-.41.41-1.07.41-1.48 0l-3.15-3.15c-.41-.41-.41-1.08 0-1.49l3.15-3.15c.41-.41 1.07-.41 1.48 0 .41.42.41 1.08 0 1.49M9.95 0l2.4 2.4-2.4 2.4c-.41.41-.41 1.07 0 1.48.41.41 1.07.41 1.48 0l3.15-3.15c.41-.41.41-1.08 0-1.49l-3.15-3.15c-.41-.41-1.07-.41-1.48 0-.41.42-.41 1.08 0 1.49M13 9h-2v3H9v2h2v3h2v-3h2v-2h-2V9z" />
                        </svg>
                        PIX
                      </Label>
                    </div>
                     <div className="flex items-center space-x-3"> {/* Adicionando opção Dinheiro */}
                      <Checkbox 
                        id="cash" 
                        checked={paymentSettings.payment_methods?.cash || false} 
                        onCheckedChange={(value) => handlePaymentSettingsChange('methods', 'cash', value)}
                      />
                      <Label htmlFor="cash" className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        Dinheiro
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Se PIX estiver selecionado, mostrar campos de chave PIX */}
                {paymentSettings.payment_methods?.pix && (
                  <div>
                    <Label className="text-base mb-2 block">Informações PIX</Label>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="pix_key_type">Tipo de Chave PIX</Label>
                          <Select 
                            value={paymentSettings.bank_info?.pix_key_type || 'CPF'}
                            onValueChange={(value) => handlePaymentSettingsChange('bank', 'pix_key_type', value)}
                          >
                            <SelectTrigger id="pix_key_type">
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CPF">CPF</SelectItem>
                              <SelectItem value="CNPJ">CNPJ</SelectItem>
                              <SelectItem value="EMAIL">E-mail</SelectItem>
                              <SelectItem value="TELEFONE">Telefone</SelectItem>
                              <SelectItem value="ALEATORIA">Chave Aleatória</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="pix_key_input">Chave PIX</Label>
                          <Input
                            id="pix_key_input"
                            value={paymentSettings.bank_info?.pix_key || ''}
                            onChange={(e) => handlePaymentSettingsChange('bank', 'pix_key', e.target.value)}
                            placeholder="Insira sua chave PIX"
                          />
                        </div>
                      </div>
                       {/* Adicionando campo Nome do Banco opcional para PIX */}
                      <div className="space-y-2">
                        <Label htmlFor="bank_name_pix">Nome do Banco (Opcional)</Label>
                        <Input
                          id="bank_name_pix"
                          value={paymentSettings.bank_info?.bank_name || ""}
                          onChange={(e) => handlePaymentSettingsChange("bank", "bank_name", e.target.value)}
                          placeholder="Nome do banco associado ao PIX"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end mt-6">
                  <Button 
                    type="submit"
                    disabled={isSaving} // Alterado de loading para isSaving
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSaving ? ( // Alterado de loading para isSaving
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Configurações
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Dados para os cards de gerenciamento
  const managementActions = [
    { 
      title: "Produtos", 
      description: "Cadastre e gerencie seus produtos ou serviços.", 
      icon: ShoppingBag, 
      color: "text-blue-600", 
      bgColor: "bg-blue-50",
      hoverColor: "hover:bg-blue-100",
      action: goToProducts 
    },
    { 
      title: "Galeria de Fotos", 
      description: "Mostre o melhor do seu estabelecimento.", 
      icon: Image, 
      color: "text-purple-600", 
      bgColor: "bg-purple-50",
      hoverColor: "hover:bg-purple-100",
      action: goToGallery 
    },
    { 
      title: "Pagamentos", 
      description: "Configure métodos e informações de pagamento.", 
      icon: CreditCard, // Alterado para CreditCard para mais especificidade
      color: "text-green-600", 
      bgColor: "bg-green-50",
      hoverColor: "hover:bg-green-100",
      action: goToPayments // Mantido, mas o conteúdo será na aba
    },
    { 
      title: "Carteira Digital", 
      description: "Acompanhe seu saldo e transações.", 
      icon: Wallet, 
      color: "text-amber-600", 
      bgColor: "bg-amber-50",
      hoverColor: "hover:bg-amber-100",
      action: goToWallet 
    },
    { 
      title: "Planos e Assinatura", 
      description: "Gerencie sua assinatura e veja benefícios.", 
      icon: Percent, 
      color: "text-red-600", 
      bgColor: "bg-red-50",
      hoverColor: "hover:bg-red-100",
      action: goToSubscriptionPlans 
    },
    { 
      title: "Relatórios", 
      description: "Acesse estatísticas e dados do seu negócio.", 
      icon: BarChart, 
      color: "text-indigo-600", 
      bgColor: "bg-indigo-50",
      hoverColor: "hover:bg-indigo-100",
      action: () => navigate(createPageUrl("BusinessAnalytics")) // Exemplo, criar página se necessário
    },
  ];

  useEffect(() => {
    const loadBusinessStats = async () => {
      if (business?.id) {
        try {
          // 1. Carregar produtos do negócio
          const products = await Product.filter({ business_id: business.id }).catch(() => []);
          
          // 2. Carregar transações recentes (último mês)
          const today = new Date();
          const lastMonth = new Date(today.setMonth(today.getMonth() - 1));
          
          // Tentar buscar transações, com fallback para array vazio se a entidade não estiver pronta
          const transactions = await Transaction.filter({ business_id: business.id }).catch(() => []);
          
          // Filtrar transações do último mês
          const recentTransactions = transactions.filter(t => {
            if (!t.payment_date) return false;
            const txDate = new Date(t.payment_date);
            return txDate >= lastMonth;
          });
          
          // 3. Calcular estatísticas
          
          // a. Contar produtos ativos
          const activeProducts = products.filter(p => p.is_available !== false);
          
          // b. Extrair clientes únicos das transações recentes
          const uniqueClientIds = [...new Set(recentTransactions.map(t => t.customer_id))];
          
          // c. Calculando a taxa de conversão (porcentagem de visitantes que fazem uma compra)
          // Aqui usamos um valor simulado para o total de visitantes se não temos o dado real
          const totalVisitors = business?.views_count || 100; // Fallback para evitar divisão por zero
          const conversionRate = totalVisitors > 0 
            ? ((uniqueClientIds.length / totalVisitors) * 100).toFixed(1) 
            : 0;
            
          // 4. Atualizar o estado com as estatísticas calculadas
          setBusinessStats({
            productsCount: activeProducts.length,
            viewsCount: business?.views_count || 0,
            newClientsCount: uniqueClientIds.length,
            conversionRate: conversionRate,
            recentTransactions: recentTransactions
          });
          
          // 5. Se o negócio não tiver o campo products_count, atualizá-lo
          if (business && (business.products_count === undefined || business.products_count !== activeProducts.length)) {
            try {
              await Business.update(business.id, {
                ...business,
                products_count: activeProducts.length
              });
            } catch (error) {
              console.error("Erro ao atualizar contagem de produtos no negócio:", error);
            }
          }
        } catch (error) {
          console.error("Erro ao carregar estatísticas do negócio:", error);
        }
      }
    };
    
    loadBusinessStats();
    // Recarregar estatísticas a cada 5 minutos se a página permanecer aberta
    const interval = setInterval(loadBusinessStats, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [business?.id]);

  // Atualizar os KPIs com os dados reais e explicativos
  const kpiData = [
    { 
      title: "Produtos Ativos", 
      value: businessStats.productsCount, 
      icon: Package, 
      color: "text-sky-600",
      tooltip: "Número total de produtos ativos disponíveis para venda"
    },
    { 
      title: "Visualizações do Perfil", 
      value: businessStats.viewsCount, 
      icon: Eye, 
      color: "text-teal-600",
      tooltip: "Total de visualizações que seu perfil recebeu"
    },
    { 
      title: "Novos Clientes (Mês)", 
      value: businessStats.newClientsCount, 
      icon: Users, 
      color: "text-pink-600",
      tooltip: "Clientes únicos que fizeram compras no último mês"
    },
    { 
      title: "Taxa de Conversão", 
      value: businessStats.conversionRate + '%', 
      icon: TrendingUp, 
      color: "text-lime-600",
      tooltip: "Porcentagem de visitantes que se tornam clientes"
    }
  ];


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Link 
          to={createPageUrl("Public")}
          className="text-gray-600 mb-4 flex items-center hover:text-blue-600 transition-colors text-sm"
        >
          <Home className="h-4 w-4 mr-1" />
          Voltar para Home
        </Link>
        
        {/* BANNER E INFORMAÇÕES BÁSICAS */}
        <Card className="overflow-hidden shadow-sm">
          <div className={`h-32 md:h-40 relative ${business?.image_url ? '' : 'bg-blue-600'}`}>
            {business?.image_url && (
              <img
                src={business.image_url}
                alt={business.business_name}
                className="w-full h-full object-cover"
              />
            )}
             <div className="absolute inset-0 bg-black/30"></div> {/* Overlay suave */}
          </div>

          <div className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-start">
              <div className="flex-shrink-0 -mt-10 md:-mt-12 mb-4 sm:mb-0 sm:mr-4">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-lg border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                  {business?.logo_url ? ( // Verifica se existe business.logo_url
                     <img src={business.logo_url} alt={`${business.business_name} logo`} className="w-full h-full object-contain p-1" /> // object-contain para não cortar a logo, p-1 para um respiro
                  ) : (
                    <Store className="w-10 h-10 md:w-12 md:h-12 text-blue-600" /> // Fallback para o ícone de loja
                  )}
                </div>
              </div>

              <div className="pt-1 flex-grow">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  {business?.business_name || "Nome do Comércio"}
                </h1>
                <div className="flex items-center mt-1 flex-wrap gap-2">
                  <Badge className="bg-blue-100 text-blue-800 text-xs md:text-sm">
                    {business?.business_type || "Tipo de Comércio"}
                  </Badge>
                  <Badge variant="outline" className={`text-xs md:text-sm ${
                    business?.status === "approved" ? "border-green-500 text-green-700 bg-green-50" :
                    business?.status === "rejected" ? "border-red-500 text-red-700 bg-red-50" :
                    "border-yellow-500 text-yellow-700 bg-yellow-50" // Cor para pendente
                  }`}>
                    {business?.status === "approved" ? "Aprovado" : business?.status === "rejected" ? "Rejeitado" : "Pendente"}
                  </Badge>
                </div>
                
                {/* Add Become Influencer button */}
                {!isInfluencer && (
                  <div className="mt-3">
                    <BecomeInfluencerButton 
                      entity={business} 
                      entityType="business"
                      entityId={business?.id}
                    />
                  </div>
                )}
              </div>
              
              <div className="mt-4 sm:mt-0">
                <Button
                  onClick={handleEditProfile}
                  variant="outline"
                  className="bg-white hover:bg-gray-100"
                  size="sm"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Perfil
                </Button>
              </div>
            </div>
          </div>
        </Card>

        
      {/* VISÃO GERAL RÁPIDA / KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {kpiData.map((kpi, index) => (
          <Card 
            key={index} 
            className="shadow-sm hover:shadow-md transition-shadow duration-200"
            title={kpi.tooltip} // Adicionar tooltip para explicar o KPI
          >
            <CardContent className="p-4 flex items-center space-x-3">
              <div className={`p-2 rounded-full bg-opacity-20 ${kpi.color.replace('text-', 'bg-')}`}>
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{kpi.title}</p>
                <p className="text-xl font-semibold text-gray-800">{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
        
        {/* STATUS DA ASSINATURA */}
        {business && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Shield className="mr-2 h-5 w-5 text-indigo-600" />
                Status da Assinatura
              </CardTitle>
            </CardHeader>
            <CardContent>
              {business.subscription_status === "active" && (
                <div className="p-3 bg-green-50 rounded-md border border-green-200">
                  <div className="flex items-center mb-1">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <h3 className="font-medium text-green-800">Assinatura Ativa</h3>
                  </div>
                  <p className="text-green-700 text-sm">
                    Seu negócio está ativo e visível.
                    {business.subscription_end_date && (
                      <span className="block mt-1 text-xs">
                        Validade: {new Date(business.subscription_end_date).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </p>
                </div>
              )}
              {business.subscription_status === "pending" && (
                <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200">
                  <div className="flex items-center mb-1">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                    <h3 className="font-medium text-yellow-800">Pagamento Pendente</h3>
                  </div>
                  <p className="text-yellow-700 text-sm mb-2">
                    Aguardando confirmação do pagamento para ativar seu negócio.
                  </p>
                </div>
              )}

              {(business.subscription_status === "expired" || !business.subscription_status || business.subscription_status === "not_subscribed") && (
                <div className="p-3 bg-gray-100 rounded-md border">
                  <div className="flex items-center mb-1">
                    <AlertCircle className="h-5 w-5 text-gray-600 mr-2" />
                    <h3 className="font-medium text-gray-800">Sem Assinatura Ativa</h3>
                  </div>
                  <p className="text-gray-700 text-sm mb-3">
                    Seu negócio não está visível publicamente. Assine um plano para aparecer nas listagens.
                  </p>
                  <Button 
                    onClick={() => navigate(createPageUrl("BusinessPlans"))}
                    className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
                    size="sm"
                  >
                    <ReceiptText className="h-4 w-4 mr-2" />
                    Ver Planos Disponíveis
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* CARDS DE AÇÃO */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-3 md:mb-4">Gerenciar seu Negócio</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
             {/* Card para PDV / Registrar Atividade */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-6 w-6 text-blue-600"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Registrar Atividade (PDV)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Credite pontos ou cashback para seus clientes turistas.
                </p>
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                  <Link to={createPageUrl("BusinessPointOfSale")}>Acessar PDV</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Novo Card para Perfil de Influenciador */}
            {isInfluencer && (
              <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-amber-50 to-orange-50">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <Star className="mr-2 h-6 w-6 text-amber-600" />
                    Perfil Influenciador
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Acesse seu perfil de influenciador, links de afiliado e relatórios de comissões.
                  </p>
                  <Button asChild className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                    <Link to={createPageUrl("InfluencerProfile")}>Acessar Perfil</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Card para Regras de Fidelidade */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <ListChecks className="mr-2 h-6 w-6 text-purple-600" />
                  Regras de Fidelidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Configure cashback, pontos e outras regras de benefícios.
                </p>
                <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                  <Link to={createPageUrl("BusinessLoyaltyRules")}>Gerenciar Regras</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Card para QR Code de Check-in */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                   <QrCode className="mr-2 h-6 w-6 text-green-600" />
                  QR Code para Check-in
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Exiba este QR Code para que seus clientes façam check-in e ganhem benefícios.
                </p>
                <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                  <Link to={createPageUrl("BusinessCheckinQR")}>Ver Meu QR Code</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Gerar cards a partir do array managementActions */}
            {managementActions.map((item) => (
              <Card 
                key={item.title} 
                className={`shadow-sm cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-[1.02] hover:shadow-md ${item.hoverColor}`}
                onClick={item.action}
              >
                <CardContent className="p-4 md:p-5 flex flex-col items-center text-center">
                  <div className={`p-3 rounded-full mb-3 ${item.bgColor}`}>
                    <item.icon className={`w-7 h-7 md:w-8 md:h-8 ${item.color}`} />
                  </div>
                  <h3 className="text-md md:text-lg font-semibold text-gray-800 mb-1">{item.title}</h3>
                  <p className="text-xs md:text-sm text-gray-500">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* ABAS DE CONTEÚDO DETALHADO */}
        <Card className="shadow-sm">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <CardHeader className="border-b">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2">
                    <TabsTrigger value="info" className="py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Informações</TabsTrigger>
                    <TabsTrigger value="products" className="py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Produtos</TabsTrigger>
                    <TabsTrigger value="payments" className="py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Pagamentos</TabsTrigger>
                    <TabsTrigger value="gallery" className="py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Galeria</TabsTrigger>
                </TabsList>
            </CardHeader>
            
            <TabsContent value="info" className="p-4 md:p-6">
              <Card>
                <CardHeader><CardTitle>Detalhes do Contato e Localização</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center"><Phone className="w-4 h-4 text-gray-500 mr-2" /><span>{business?.business_phone || "N/A"}</span></div>
                  <div className="flex items-center"><Mail className="w-4 h-4 text-gray-500 mr-2" /><span>{business?.business_email || "N/A"}</span></div>
                  <div className="flex items-center"><MapPin className="w-4 h-4 text-gray-500 mr-2" /><span>{business?.address || "N/A"}</span></div>
                  <div className="flex items-center"><Globe className="w-4 h-4 text-gray-500 mr-2" />
                    <span>{business?.website ? <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{business.website} <ExternalLink className="inline w-3 h-3 ml-1" /></a> : "N/A"}</span>
                  </div>
                  <div className="flex items-center"><Clock className="w-4 h-4 text-gray-500 mr-2" /><span>{business?.opening_hours || "N/A"}</span></div>
                </CardContent>
              </Card>
              <Card className="mt-4">
                 <CardHeader><CardTitle>Sobre o Negócio</CardTitle></CardHeader>
                 <CardContent>
                    <p className="text-gray-700 whitespace-pre-line">{business?.description || "Nenhuma descrição fornecida."}</p>
                 </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="products" className="p-4 md:p-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Seus Produtos/Serviços</CardTitle>
                  <Button size="sm" onClick={goToProducts} className="bg-blue-600 hover:bg-blue-700">
                    <Package className="w-4 h-4 mr-2" />
                    Gerenciar Produtos
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Visualize e gerencie todos os seus produtos ou serviços cadastrados.</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="payments" className="p-4 md:p-6">
              {renderPaymentsTab()}
            </TabsContent>
            
            <TabsContent value="gallery" className="p-4 md:p-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Sua Galeria de Fotos</CardTitle>
                   <Button size="sm" onClick={goToGallery} className="bg-purple-600 hover:bg-purple-700">
                     <Image className="w-4 h-4 mr-2" />
                     Gerenciar Galeria
                   </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Adicione e organize as fotos que representam seu negócio.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </Card>

      </div>
    </div>
  );
}
