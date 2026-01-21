
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { SiteConfig } from "@/api/entities";
import { Business } from "@/api/entities";
import { Realtor } from "@/api/entities";
import { Tourist } from "@/api/entities";
import { Influencer } from "@/api/entities"; // Adicionando import para Influencer
import { ServiceProvider } from "@/api/entities"; // Adicionar
import { 
  User, 
  Mail, 
  Key, 
  Store, 
  Shield, 
  LogIn,
  AlertTriangle,
  Loader2,
  Building2,
  Wrench
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { 
  Alert,
  AlertTitle,
  AlertDescription
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

// Admin user hardcoded
const ADMIN_USER = {
  id: 'admin-1',
  email: 'contato.jrsn@gmail.com',
  password: '123456',
  full_name: 'Praias Catarinenses',
  role: 'admin',
  is_approved: true,
  is_active: true
};

export default function UserAccount() {
  const [siteConfig, setSiteConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ 
    email: '', 
    password: '' 
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Carregar configurações do site
        const configs = await SiteConfig.list();
        if (configs && configs.length > 0) {
          setSiteConfig(configs[0]);
        }
        
        // Verificar se há usuário logado
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };

    loadData();
  }, []);

  const handleLogout = () => {
    // Limpar ambos storages
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('isLoggedIn');
    
    setCurrentUser(null);
    window.location.href = '/Public';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFormErrors({}); // Limpar erros anteriores
    
    try {
      console.log("Tentando login com:", loginForm.email);
      const email = loginForm.email.trim().toLowerCase();
      
      // Primeiro verificar se é uma conta de administrador
      if (email === 'contato.jrsn@gmail.com' && loginForm.password === '123456') {
        const adminUser = {
          id: 'admin-1',
          email: 'contato.jrsn@gmail.com',
          role: 'admin',
          full_name: 'Administrador',
          is_approved: true,
          is_active: true
        };
        
        localStorage.setItem('currentUser', JSON.stringify(adminUser));
        localStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('currentUser', JSON.stringify(adminUser));
        sessionStorage.setItem('isLoggedIn', 'true');
        
        navigate(createPageUrl("Dashboard"));
        return;
      }

      // Tentar login como Turista
      console.log("Verificando turista com email:", email);
      try {
        const tourists = await Tourist.list();
        console.log(`Número de turistas carregados: ${tourists ? tourists.length : 0}`);
        
        const foundTourist = tourists.find(
          (t) => t.email && t.email.trim().toLowerCase() === email
        );

        if (foundTourist) {
          console.log("Turista encontrado:", foundTourist);
          
          const touristData = {
            id: foundTourist.id,
            email: foundTourist.email,
            full_name: foundTourist.name || "Turista",
            role: 'tourist',
            tourist_id: foundTourist.id,
            user_code: foundTourist.user_code,
            points_balance: foundTourist.points_balance,
            cashback_balance: foundTourist.cashback_balance,
          };

          localStorage.setItem('currentUser', JSON.stringify(touristData));
          localStorage.setItem('isLoggedIn', 'true');
          sessionStorage.setItem('currentUser', JSON.stringify(touristData));
          sessionStorage.setItem('isLoggedIn', 'true');
          
          toast({
            title: "Login realizado com sucesso",
            description: `Bem-vindo, ${touristData.full_name}!`
          });

          navigate(createPageUrl("UserProfile"));
          return;
        }
      } catch (error) {
        console.error("Erro ao verificar turistas:", error);
      }

      // Tentar login como Imobiliária (Realtor)
      console.log("Verificando imobiliária com email:", email);
      try {
        const realtors = await Realtor.list();
        console.log(`Número de imobiliárias carregadas: ${realtors ? realtors.length : 0}`);

        const foundRealtor = realtors.find(r => 
          r.email && r.email.trim().toLowerCase() === email
        );
        
        if (foundRealtor) {
          console.log("Imobiliária encontrada:", foundRealtor);
          const realtorData = {
            id: foundRealtor.id,
            email: foundRealtor.email,
            full_name: foundRealtor.company_name,
            role: 'realtor',
            realtor_id: foundRealtor.id,
            status: foundRealtor.status
          };

          localStorage.setItem('currentUser', JSON.stringify(realtorData));
          localStorage.setItem('isLoggedIn', 'true');
          sessionStorage.setItem('currentUser', JSON.stringify(realtorData));
          sessionStorage.setItem('isLoggedIn', 'true');
          
          toast({
            title: "Login realizado com sucesso",
            description: `Bem-vindo, ${realtorData.full_name}!`
          });

          navigate(createPageUrl("RealtorDashboard"));
          return;
        }
      } catch (error) {
        console.error("Erro ao verificar imobiliárias:", error);
      }

      // Tentar login como Comércio (Business)
      console.log("Verificando negócio com email:", email);
      try {
        const businesses = await Business.list();
        console.log(`Número de comércios carregados: ${businesses ? businesses.length : 0}`);

        const foundBusiness = businesses.find(b => 
          b.business_email && b.business_email.trim().toLowerCase() === email
        );

        if (foundBusiness) {
          console.log("Negócio encontrado:", foundBusiness);
          const businessData = {
            id: foundBusiness.id,
            email: foundBusiness.business_email,
            full_name: foundBusiness.business_name,
            role: 'business',
            business_id: foundBusiness.id,
            status: foundBusiness.status
          };

          localStorage.setItem('currentUser', JSON.stringify(businessData));
          localStorage.setItem('isLoggedIn', 'true');
          sessionStorage.setItem('currentUser', JSON.stringify(businessData));
          sessionStorage.setItem('isLoggedIn', 'true');
          
          toast({
            title: "Login realizado com sucesso",
            description: `Bem-vindo, ${businessData.full_name}!`
          });

          navigate(createPageUrl("BusinessProfile"));
          return;
        }
      } catch (error) {
        console.error("Erro ao verificar comércios:", error);
      }

      // NOVO: Tentar login como Influenciador
      console.log("Verificando influenciador com email:", email);
      try {
        const influencers = await Influencer.list();
        console.log(`Número de influenciadores carregados: ${influencers ? influencers.length : 0}`);

        const foundInfluencer = influencers.find(infl => 
          infl.email && infl.email.trim().toLowerCase() === email
        );

        if (foundInfluencer) {
          console.log("Influenciador encontrado:", foundInfluencer);
          const influencerData = {
            id: foundInfluencer.id,
            email: foundInfluencer.email,
            full_name: foundInfluencer.name,
            role: 'influencer',
            influencer_id: foundInfluencer.id,
            user_id: foundInfluencer.user_id,
            is_active: foundInfluencer.is_active
          };

          localStorage.setItem('currentUser', JSON.stringify(influencerData));
          localStorage.setItem('isLoggedIn', 'true');
          sessionStorage.setItem('currentUser', JSON.stringify(influencerData));
          sessionStorage.setItem('isLoggedIn', 'true');
          
          toast({
            title: "Login realizado com sucesso",
            description: `Bem-vindo, ${influencerData.full_name}!`
          });

          navigate(createPageUrl("InfluencerProfile"));
          return;
        }
      } catch (error) {
        console.error("Erro ao verificar influenciadores:", error);
      }

      console.log("Nenhum usuário encontrado com este e-mail após verificar todas as entidades.");
      throw new Error("Email não encontrado ou senha inválida. Por favor, verifique suas credenciais.");

    } catch (error) {
      console.error("Erro no login:", error);
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive"
      });
      setFormErrors({ general: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToProfile = () => {
    try {
      if (currentUser) {
        // Manter o role atual se não for uma troca explícita para comércio
        if (currentUser.role === 'admin') {
          navigate('/Dashboard');
        } else if (currentUser.role === 'business') {
          navigate('/BusinessProfile');
        } else if (currentUser.role === 'realtor') {
          navigate('/RealtorDashboard');
        } else if (currentUser.role === 'tourist') {
          navigate('/UserProfile');
        } else if (currentUser.role === 'influencer') {
          navigate('/InfluencerProfile');
        } else if (currentUser.role === 'service_provider') {
          navigate('/ServiceProviders');
        } else {
          navigate('/UserProfile'); // Fallback
        }
      }
    } catch (error) {
      console.error("Erro ao navegar:", error);
    }
  };

  const navigateToBusinessProfileFromInfluencer = async () => {
    if (currentUser && currentUser.role === 'influencer' && currentUser.business_id) {
      try {
        // 1. Obter os dados completos do comércio
        const businessData = await Business.get(currentUser.business_id);
        if (!businessData) {
          toast({ title: "Erro", description: "Não foi possível encontrar os dados do seu comércio.", variant: "destructive" });
          return;
        }

        // 2. Criar um objeto de usuário "simulando" o login como comércio
        const businessUserContext = {
          ...currentUser, // Mantém ID, email, etc. do usuário original
          role: 'business', // MUDA O ROLE
          full_name: businessData.business_name || currentUser.full_name, // Usa o nome do comércio
          // Mantém influencer_id para saber que ele também é influenciador
        };
        
        // 3. Atualizar o localStorage com este contexto de comércio
        localStorage.setItem('currentUser', JSON.stringify(businessUserContext));
        localStorage.setItem('isLoggedIn', 'true'); // Garante que está logado
        sessionStorage.setItem('currentUser', JSON.stringify(businessUserContext)); // Também no sessionStorage
        sessionStorage.setItem('isLoggedIn', 'true');


        // 4. Navegar para o perfil do comércio
        navigate(createPageUrl("BusinessProfile"));
        window.location.reload(); // Forçar recarregamento para o Layout pegar o novo role

      } catch (error) {
        console.error("Erro ao trocar para perfil de comércio:", error);
        toast({ title: "Erro", description: "Não foi possível acessar o perfil do seu comércio.", variant: "destructive" });
      }
    }
  };

  const navigateToRealtorDashboardFromInfluencer = async () => {
    if (currentUser && currentUser.role === 'influencer' && currentUser.realtor_id) {
      try {
        const realtorData = await Realtor.get(currentUser.realtor_id);
        if (!realtorData) {
          toast({ title: "Erro", description: "Não foi possível encontrar os dados da sua imobiliária.", variant: "destructive" });
          return;
        }

        const realtorUserContext = {
          ...currentUser,
          role: 'realtor', // MUDA O ROLE
          full_name: realtorData.company_name || currentUser.full_name,
        };
        
        localStorage.setItem('currentUser', JSON.stringify(realtorUserContext));
        localStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('currentUser', JSON.stringify(realtorUserContext));
        sessionStorage.setItem('isLoggedIn', 'true');

        navigate(createPageUrl("RealtorDashboard"));
        window.location.reload(); // Forçar recarregamento

      } catch (error) {
        console.error("Erro ao trocar para perfil de imobiliária:", error);
        toast({ title: "Erro", description: "Não foi possível acessar o painel da sua imobiliária.", variant: "destructive" });
      }
    }
  };

  const navigateToServiceProviderDashboardFromInfluencer = async () => {
    if (currentUser && currentUser.role === 'influencer') {
      try {
        // Verificar se existe um ServiceProvider associado a este user_id
        const serviceProviders = await ServiceProvider.filter({ user_id: currentUser.id }); // Assumindo que ServiceProvider tem user_id
        
        if (!serviceProviders || serviceProviders.length === 0) {
          // Se não houver um ServiceProvider pelo user_id direto,
          // e se o influenciador tiver um service_provider_id específico no seu registro (hipotético)
          // if (currentUser.service_provider_id) {
          //   const sp = await ServiceProvider.get(currentUser.service_provider_id);
          //   if(sp) serviceProviders.push(sp);
          // }
          // Se ainda não encontrou, não faz nada ou mostra erro.
          // Por agora, vamos assumir que o ServiceProvider está ligado pelo user_id do Influencer.
          toast({ title: "Aviso", description: "Nenhum perfil de prestador de serviço associado a esta conta de influenciador.", variant: "default" });
          return;
        }
        
        const serviceProviderData = serviceProviders[0]; // Pega o primeiro, caso haja múltiplos (idealmente não deveria)

        const serviceProviderUserContext = {
          ...currentUser,
          role: 'service_provider', // MUDA O ROLE para um hipotético 'service_provider'
          full_name: serviceProviderData.name || currentUser.full_name,
          // Adicionar service_provider_id ao contexto para uso futuro
          service_provider_id: serviceProviderData.id 
        };
        
        localStorage.setItem('currentUser', JSON.stringify(serviceProviderUserContext));
        localStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('currentUser', JSON.stringify(serviceProviderUserContext));
        sessionStorage.setItem('isLoggedIn', 'true');

        // Navegar para a página de gerenciamento de serviços (ou dashboard do prestador)
        // Usando ServiceProviders por enquanto, mas idealmente seria uma página como "ServiceProviderDashboard"
        navigate(createPageUrl("ServiceProviders")); 
        window.location.reload();

      } catch (error) {
        console.error("Erro ao trocar para perfil de prestador de serviço:", error);
        toast({ title: "Erro", description: "Não foi possível acessar o painel de prestador de serviço.", variant: "destructive" });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader siteConfig={siteConfig} currentUser={currentUser} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{currentUser ? "Minha Conta" : "Acesso"}</CardTitle>
              <CardDescription>
                {currentUser ? `Bem-vindo, ${currentUser.full_name}!` : "Faça login para acessar sua conta"}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {currentUser ? (
                <div className="space-y-6">
                  <div className="flex flex-col items-center justify-center py-4">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <User className="h-12 w-12 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-medium">{currentUser.full_name}</h3>
                    <p className="text-gray-500">{currentUser.email}</p>
                    <Badge className="mt-2">
                      {currentUser.role === 'admin' ? 'Administrador' : 
                       currentUser.role === 'business' ? 'Comerciante' : 
                       currentUser.role === 'realtor' ? 'Corretor' : 
                       currentUser.role === 'tourist' ? 'Turista' : 
                       currentUser.role === 'service_provider' ? 'Prestador de Serviço' :
                       'Influenciador'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={navigateToProfile}
                    >
                      <User className="mr-2 h-4 w-4" />
                      {currentUser.role === 'admin' ? 'Acessar Dashboard Admin' : 
                       currentUser.role === 'business' ? 'Meu Comércio' : 
                       currentUser.role === 'realtor' ? 'Dashboard do Corretor' : 
                       currentUser.role === 'tourist' ? 'Meu Perfil de Turista' : 
                       currentUser.role === 'service_provider' ? 'Painel de Serviços' : // Adicionado
                       'Meu Perfil de Influenciador'}
                    </Button>
                    
                    {currentUser.role === 'influencer' && currentUser.business_id && (
                      <Button 
                        variant="outline" 
                        className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                        onClick={navigateToBusinessProfileFromInfluencer}
                      >
                        <Store className="mr-2 h-4 w-4" />
                        Acessar Painel do Comércio
                      </Button>
                    )}

                    {currentUser.role === 'influencer' && currentUser.realtor_id && (
                      <Button 
                        variant="outline" 
                        className="w-full border-green-600 text-green-600 hover:bg-green-50"
                        onClick={navigateToRealtorDashboardFromInfluencer}
                      >
                        <Building2 className="mr-2 h-4 w-4" />
                        Acessar Painel Imobiliário
                      </Button>
                    )}

                    {/* Botão para acessar Painel de Prestador de Serviço se for influenciador */}
                    {currentUser.role === 'influencer' && ( // Mostra sempre se for influenciador, a função interna verifica se é prestador
                      <Button 
                        variant="outline" 
                        className="w-full border-purple-600 text-purple-600 hover:bg-purple-50"
                        onClick={navigateToServiceProviderDashboardFromInfluencer}
                      >
                        <Wrench className="mr-2 h-4 w-4" />
                        Acessar Painel de Serviços
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleLogout}
                    >
                      Sair da Conta
                    </Button>
                  </div>
                </div>
              ) : (
                
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      placeholder="seu@email.com"
                      value={loginForm.email}
                      onChange={handleInputChange}
                      className={formErrors.email ? "border-red-500" : ""}
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-xs">{formErrors.email}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="password">Senha</Label>
                    </div>
                    <Input 
                      id="password" 
                      name="password" 
                      type="password" 
                      placeholder="Sua senha"
                      value={loginForm.password}
                      onChange={handleInputChange}
                      className={formErrors.password ? "border-red-500" : ""}
                    />
                    {formErrors.password && (
                      <p className="text-red-500 text-xs">{formErrors.password}</p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      <>
                        <LogIn className="mr-2 h-4 w-4" />
                        Entrar
                      </>
                    )}
                  </Button>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Não tem uma conta?{" "}
                      <Link to={createPageUrl("Cadastro")} className="text-blue-600 hover:underline">
                        Cadastre-se
                      </Link>
                    </p>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <PublicFooter siteConfig={siteConfig} />
    </div>
  );
}
