import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { 
  LayoutDashboard, 
  Map, 
  Building2, 
  Store, 
  Waves, 
  Users, 
  Star, 
  Calendar, 
  Settings, 
  CreditCard, 
  MessageSquare, 
  Crown, 
  BarChart3, 
  Wrench,
  ChevronRight,
  LogIn,
  Shield,
  Loader2,
  ImageIcon,
  Home,
  List
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        // Verificar se tem usuário no localStorage (solução temporária)
        const storedUser = localStorage.getItem('currentUser');
        
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          
          // Verificar se é o email de admin
          if (userData.email === 'contato.jrsn@gmail.com') {
            setUser(userData);
            setError(null);
          } else {
            setError("Você não tem permissão para acessar o painel administrativo.");
            setTimeout(() => {
              navigate(createPageUrl("Public"));
            }, 3000);
          }
        } else {
          // Tentar o método padrão com User.me()
          try {
            const userData = await User.me();
            
            if (userData && userData.role === 'admin') {
              setUser(userData);
              setError(null);
            } else {
              setError("Você não tem permissão para acessar o painel administrativo.");
              setTimeout(() => {
                navigate(createPageUrl("Public"));
              }, 3000);
            }
          } catch (err) {
            setError("Por favor, faça login para acessar o painel administrativo.");
          }
        }
      } catch (err) {
        console.error("Erro ao verificar autenticação:", err);
        setError("Por favor, faça login para acessar o painel administrativo.");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogin = async () => {
    try {
      // Redirecionamento para página de login
      navigate(createPageUrl("UserAccount"));
    } catch (err) {
      console.error("Erro ao iniciar login:", err);
    }
  };

  const handleCardClick = (path) => {
    switch(path) {
      case "Beaches":
        navigate(createPageUrl("Beaches")); // Página de administração de Praias
        break;
      case "Cities": 
        navigate(createPageUrl("Cities")); // Página de administração de Cidades
        break;
      case "Properties":
        navigate(createPageUrl("Properties")); // Página de administração de Imóveis
        break;
      case "Businesses":
        navigate(createPageUrl("Businesses"));
        break;
      case "ServiceProviders":
        navigate(createPageUrl("ServiceProviders"));
        break;
      case "Tourists":
        navigate(createPageUrl("Tourists"));
        break;
      case "Reviews":
        navigate(createPageUrl("Reviews"));
        break;
      case "EventsAdmin":
        navigate(createPageUrl("EventsAdmin"));
        break;
      case "SubscriptionPlansAdmin":
        navigate(createPageUrl("SubscriptionPlansAdmin"));
        break;
      case "Community":
        navigate(createPageUrl("Community"));
        break;
      case "FinancialDashboard":
        navigate(createPageUrl("FinancialDashboard"));
        break;
      case "CardSettings":
        navigate(createPageUrl("CardSettings"));
        break;
      case "SiteConfiguration":
        navigate(createPageUrl("SiteConfiguration"));
        break;
      case "InfluencerDashboard":
        navigate(createPageUrl("InfluencerDashboard"));
        break;
      case "InfluencerCardConfig":
        navigate(createPageUrl("InfluencerCardConfig"));
        break;
      case "CityBannerSettings":
        navigate(createPageUrl("CityBannerSettings"));
        break;
      case "Realtors":
        navigate(createPageUrl("Realtors"));
        break;
      case "PropertyCategoriesAdmin":
        navigate(createPageUrl("PropertyCategoriesAdmin"));
        break;
      default:
        navigate(createPageUrl(path));
    }
  };

  const menuItems = [
    {
      title: "Visão Geral",
      icon: <LayoutDashboard className="w-5 h-5 text-indigo-600" />,
      description: "Painel com métricas e estatísticas",
      path: "Dashboard"
    },
    {
      title: "Cidades",
      icon: <Building2 className="w-5 h-5 text-emerald-600" />,
      description: "Gerenciar cidades turísticas",
      path: "Cities"
    },
    {
      title: "Praias",
      icon: <Waves className="w-5 h-5 text-blue-600" />,
      description: "Cadastrar e editar praias",
      path: "Beaches" // Deve corresponder ao case em handleCardClick
    },
    {
      title: "Imóveis",
      icon: <Home className="w-5 h-5 text-orange-600" />,
      description: "Gerenciar anúncios de imóveis",
      path: "Properties"
    },
    {
      title: "Categorias de Imóveis",
      icon: <List className="w-5 h-5 text-teal-600" />, 
      description: "Gerenciar tipos de imóveis (casa, apto, etc.)",
      path: "PropertyCategoriesAdmin" 
    },
    {
      title: "Imobiliárias",
      icon: <Building2 className="w-5 h-5 text-purple-600" />,
      description: "Gerenciar imobiliárias cadastradas",
      path: "Realtors"
    },
    {
      title: "Comércios",
      icon: <Store className="w-5 h-5 text-amber-600" />,
      description: "Lojas, restaurantes e hotéis",
      path: "Businesses"
    },
    {
      title: "Prestadores",
      icon: <Wrench className="w-5 h-5 text-gray-600" />,
      description: "Prestadores de serviços",
      path: "ServiceProviders" 
    },
    {
      title: "Turistas",
      icon: <Users className="w-5 h-5 text-purple-600" />,
      description: "Gerenciar usuários e turistas",
      path: "Tourists"
    },
    {
      title: "Avaliações",
      icon: <Star className="w-5 h-5 text-yellow-600" />,
      description: "Moderar avaliações de visitantes",
      path: "Reviews"
    },
    {
      title: "Eventos",
      icon: <Calendar className="w-5 h-5 text-red-600" />,
      description: "Gerenciar eventos turísticos",
      path: "EventsAdmin"
    },
    {
      title: "Clube de Assinantes",
      icon: <Crown className="w-5 h-5 text-yellow-500" />,
      description: "Planos de assinatura e descontos",
      path: "SubscriptionPlansAdmin"
    },
    {
      title: "Comunidade",
      icon: <MessageSquare className="w-5 h-5 text-blue-500" />,
      description: "Gerenciar posts e interações",
      path: "Community"
    },
    {
      title: "Relatórios",
      icon: <BarChart3 className="w-5 h-5 text-blue-700" />,
      description: "Estatísticas e relatórios financeiros",
      path: "FinancialDashboard"
    },
    {
      title: "Cartão de Membro",
      icon: <CreditCard className="w-5 h-5 text-indigo-500" />,
      description: "Personalizar cartões de membros",
      path: "CardSettings"
    },
    {
      title: "Configurações",
      icon: <Settings className="w-5 h-5 text-gray-600" />,
      description: "Configurações gerais do site",
      path: "SiteConfiguration"
    },
    {
      title: "Influenciadores",
      icon: <Users className="w-5 h-5 text-purple-600" />,
      description: "Gerenciar programa de afiliados",
      path: "InfluencerDashboard"
    },
    {
      title: "Propaganda de Influenciadores",
      icon: <Users className="w-5 h-5 text-purple-600" />,
      description: "Configurar card promocional",
      path: "InfluencerCardConfig"
    },
    {
      title: "Banners de Cidades",
      icon: <ImageIcon className="w-5 h-5 text-indigo-600" />,
      description: "Gerenciar banners promocionais",
      path: "CityBannerSettings"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Carregando painel administrativo</h2>
          <p className="text-gray-500 mt-2">Verificando suas credenciais...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl text-center">Acesso Restrito</CardTitle>
            <CardDescription className="text-center">
              <Shield className="w-16 h-16 text-red-500 mx-auto my-4" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-700 mb-6">{error}</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={handleLogin} className="bg-blue-600 hover:bg-blue-700">
              <LogIn className="w-4 h-4 mr-2" />
              Fazer Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Painel Administrativo</h1>
          <p className="text-gray-600 mt-2">
            Bem-vindo ao painel de administração do TurismoSC
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <Card 
              key={index} 
              className="hover:shadow-md transition-shadow cursor-pointer border border-gray-200 hover:border-blue-200"
              onClick={() => handleCardClick(item.path)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="p-3 rounded-lg bg-gray-100">{item.icon}</div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold text-lg text-gray-800">{item.title}</h3>
                <p className="text-gray-500 text-sm mt-1">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => navigate(createPageUrl("Public"))}
            className="text-gray-600"
          >
            Voltar para o site
          </Button>
        </div>
      </div>
    </div>
  );
}